import Trainer from "../models/Trainer.js";
import User from "../models/User.js";
import Class from "../models/Class.js";
import { AppError } from "../middleware/errorHandler.js";
import TrainerApplication from "../models/TrainerApplication.js";
import bcryptjs from "bcryptjs";
import cloudinary from "../config/cloudinary.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

// Helper to generate face-focused Cloudinary URL
// Uses "fill" crop to show face at top + body below, not tight face crop
const getFaceFocusedUrl = (publicId, width = 400, height = 500) => {
  return cloudinary.url(publicId, {
    width,
    height,
    crop: "fill", // "fill" keeps face at top, fills rest with body
    gravity: "face", // Centers on face but shows more context
    quality: "auto",
    fetch_format: "auto",
  });
};

export const getAllTrainers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const trainers = await Trainer.find({ isActive: true })
      .populate("userId", "firstName lastName profileImage email")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Trainer.countDocuments({ isActive: true });

    res.status(200).json({
      success: true,
      data: trainers,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTrainerById = async (req, res, next) => {
  try {
    const trainer = await Trainer.findById(req.params.id).populate(
      "userId",
      "firstName lastName profileImage email phone",
    );

    if (!trainer) throw new AppError("Trainer not found", 404);

    res.status(200).json({ success: true, data: trainer });
  } catch (error) {
    next(error);
  }
};

export const getTrainerClasses = async (req, res, next) => {
  try {
    const classes = await Class.find({
      trainerId: req.params.id,
      isActive: true,
    }).sort({ "schedule.dayOfWeek": 1 });

    res.status(200).json({ success: true, data: classes });
  } catch (error) {
    next(error);
  }
};

export const getTrainerReviews = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: [] });
  } catch (error) {
    next(error);
  }
};

export const applyTrainer = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      experience,
      specialization,
      bio,
    } = req.body;

    const existingApp = await TrainerApplication.findOne({ email });
    if (existingApp) {
      return next(new AppError("You already applied", 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError("Email already registered", 400));
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    await TrainerApplication.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      experience,
      specialization,
      bio,
    });

    res.status(201).json({
      success: true,
      message: "Application submitted. Await approval.",
    });
  } catch (error) {
    next(error);
  }
};

export const approveTrainerApplication = async (req, res, next) => {
  try {
    const application = await TrainerApplication.findById(req.params.id);

    if (!application) {
      return next(new AppError("Application not found", 404));
    }

    if (application.status !== "pending") {
      return next(new AppError("Already reviewed", 400));
    }

    const user = await User.create({
      firstName: application.firstName,
      lastName: application.lastName,
      email: application.email,
      password: application.password,
      role: "trainer",
    });

    const trainer = await Trainer.create({
      userId: user._id,
      bio: application.bio,
      experience: application.experience,
      specializations: [application.specialization],
    });

    application.status = "approved";
    application.reviewedBy = req.user.id;
    application.reviewedAt = new Date();
    await application.save();

    res.status(200).json({
      success: true,
      message: "Trainer approved",
      data: trainer,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectTrainerApplication = async (req, res, next) => {
  try {
    const application = await TrainerApplication.findById(req.params.id);

    if (!application) {
      return next(new AppError("Application not found", 404));
    }

    application.status = "rejected";
    application.reviewedBy = req.user.id;
    application.reviewedAt = new Date();

    await application.save();

    res.status(200).json({
      success: true,
      message: "Application rejected",
    });
  } catch (error) {
    next(error);
  }
};

export const getTrainerApplications = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const applications = await TrainerApplication.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("reviewedBy", "firstName lastName");

    const total = await TrainerApplication.countDocuments(query);

    res.status(200).json({
      success: true,
      data: applications,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createTrainer = async (req, res) => {
  try {
    const trainerData = req.body;

    if (
      trainerData.specializations &&
      typeof trainerData.specializations === "string"
    ) {
      trainerData.specializations = JSON.parse(trainerData.specializations);
    }
    if (
      trainerData.certifications &&
      typeof trainerData.certifications === "string"
    ) {
      trainerData.certifications = JSON.parse(trainerData.certifications);
    }
    if (trainerData.experience && typeof trainerData.experience === "string") {
      trainerData.experience = parseInt(trainerData.experience);
    }
    if (
      trainerData.monthlyRate &&
      typeof trainerData.monthlyRate === "string"
    ) {
      trainerData.monthlyRate = parseInt(trainerData.monthlyRate);
    }

    // Handle image upload with face-focused URL
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);

      // Card thumbnail: face at top, body visible below (400x500)
      const faceUrl = getFaceFocusedUrl(result.public_id, 400, 500);

      // Detail page: larger version (500x600)
      const faceUrlLarge = getFaceFocusedUrl(result.public_id, 500, 600);

      trainerData.profileImage = {
        url: result.secure_url, // Original full image
        faceUrl: faceUrl, // 400x500 face+body (for cards)
        faceUrlLarge: faceUrlLarge, // 500x600 face+body (for detail)
        public_id: result.public_id,
      };
    }

    const trainer = await Trainer.create(trainerData);
    await trainer.populate("userId", "firstName lastName email phone");

    res.status(201).json({
      success: true,
      data: trainer,
    });
  } catch (error) {
    console.error("Create trainer error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create trainer",
    });
  }
};

export const updateTrainer = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const trainer = await Trainer.findById(id);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    if (
      updates.specializations &&
      typeof updates.specializations === "string"
    ) {
      updates.specializations = JSON.parse(updates.specializations);
    }
    if (updates.certifications && typeof updates.certifications === "string") {
      updates.certifications = JSON.parse(updates.certifications);
    }
    if (updates.isActive && typeof updates.isActive === "string") {
      updates.isActive = updates.isActive === "true";
    }
    if (updates.experience && typeof updates.experience === "string") {
      updates.experience = parseInt(updates.experience);
    }
    if (updates.monthlyRate && typeof updates.monthlyRate === "string") {
      updates.monthlyRate = parseInt(updates.monthlyRate);
    }

    // If there's a new image uploaded
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);

      // Generate face-focused URLs with fill crop
      const faceUrl = getFaceFocusedUrl(result.public_id, 400, 500);
      const faceUrlLarge = getFaceFocusedUrl(result.public_id, 500, 600);

      updates.profileImage = {
        url: result.secure_url,
        faceUrl: faceUrl,
        faceUrlLarge: faceUrlLarge,
        public_id: result.public_id,
      };

      // Delete old image from Cloudinary
      if (trainer.profileImage?.public_id) {
        await cloudinary.uploader.destroy(trainer.profileImage.public_id);
      }
    }

    const updatedTrainer = await Trainer.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).populate("userId", "firstName lastName email phone profileImage");

    res.status(200).json({
      success: true,
      data: updatedTrainer,
    });
  } catch (error) {
    console.error("Update trainer error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update trainer",
    });
  }
};

export const deleteTrainer = async (req, res) => {
  try {
    const { id } = req.params;

    const trainer = await Trainer.findById(id);
    if (!trainer) {
      return res.status(404).json({ message: "Trainer not found" });
    }

    if (trainer.profileImage?.public_id) {
      await cloudinary.uploader.destroy(trainer.profileImage.public_id);
      console.log(
        "🗑️ Deleted image from Cloudinary:",
        trainer.profileImage.public_id,
      );
    }

    await Trainer.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Trainer deleted successfully",
    });
  } catch (error) {
    console.error("Delete trainer error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete trainer",
    });
  }
};
