import Class from "../models/Class.js";
import Booking from "../models/Booking.js";
import { AppError } from "../middleware/errorHandler.js";

export const getAllClasses = async (req, res, next) => {
  try {
    const { category, level, page = 1, limit = 10 } = req.query;
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (level) filter.level = level;

    const skip = (page - 1) * limit;
    const classes = await Class.find(filter)
      .populate({
        path: "trainerId",
        populate: {
          path: "userId",
          select: "firstName lastName email profileImage",
        },
      })
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ "schedule.dayOfWeek": 1 });

    const total = await Class.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: classes,
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

export const getClassById = async (req, res, next) => {
  try {
    const classDoc = await Class.findById(req.params.id).populate({
      path: "trainerId",
      populate: {
        path: "userId",
        select: "firstName lastName email profileImage",
      },
    });

    if (!classDoc) throw new AppError("Class not found", 404);
    res.status(200).json({ success: true, data: classDoc });
  } catch (error) {
    next(error);
  }
};

export const searchClasses = async (req, res, next) => {
  try {
    const { q, category, level } = req.query;
    const filter = { isActive: true };

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    if (category) filter.category = category;
    if (level) filter.level = level;

    const classes = await Class.find(filter).populate("trainerId").limit(20);
    res.status(200).json({ success: true, data: classes });
  } catch (error) {
    next(error);
  }
};

export const createClass = async (req, res, next) => {
  try {
    const classDoc = await Class.create(req.body);
    await classDoc.populate("trainerId");
    res.status(201).json({ success: true, data: classDoc });
  } catch (error) {
    next(error);
  }
};

export const updateClass = async (req, res, next) => {
  try {
    const classDoc = await Class.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("trainerId");

    if (!classDoc) throw new AppError("Class not found", 404);
    res.status(200).json({ success: true, data: classDoc });
  } catch (error) {
    next(error);
  }
};

export const deleteClass = async (req, res, next) => {
  try {
    const classDoc = await Class.findByIdAndDelete(req.params.id);

    if (!classDoc) throw new AppError("Class not found", 404);

    // Clean up related bookings
    const deletedBookings = await Booking.deleteMany({
      classId: req.params.id,
    });

    res.status(200).json({
      success: true,
      message: "Class and related bookings deleted permanently",
      data: {
        deletedClassId: classDoc._id,
        deletedBookingsCount: deletedBookings.deletedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailability = async (req, res, next) => {
  try {
    const classDoc = await Class.findById(req.params.id);
    if (!classDoc) throw new AppError("Class not found", 404);

    const availability = {
      totalCapacity: classDoc.capacity,
      currentEnrollment: classDoc.currentEnrollment,
      availableSlots: classDoc.capacity - classDoc.currentEnrollment,
      isFull: classDoc.currentEnrollment >= classDoc.capacity,
    };

    res.status(200).json({ success: true, data: availability });
  } catch (error) {
    next(error);
  }
};

export const getClassRoster = async (req, res, next) => {
  try {
    const classDoc = await Class.findById(req.params.id).populate(
      "enrolledMembers",
      "firstName lastName email",
    );

    if (!classDoc) throw new AppError("Class not found", 404);
    res.status(200).json({ success: true, data: classDoc.enrolledMembers });
  } catch (error) {
    next(error);
  }
};
