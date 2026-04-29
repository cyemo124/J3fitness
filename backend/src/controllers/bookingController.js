import Booking from "../models/Booking.js";
import Class from "../models/Class.js";
import { AppError } from "../middleware/errorHandler.js";

const generateBookingRef = () =>
  `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const createBooking = async (req, res, next) => {
  try {
    const { classId, classDate } = req.body;

    // 1. Atomic capacity check + increment (prevents race condition overselling)
    const updatedClass = await Class.findOneAndUpdate(
      {
        _id: classId,
        $expr: { $lt: ["$currentEnrollment", "$capacity"] },
      },
      {
        $inc: { currentEnrollment: 1 },
        $addToSet: { enrolledMembers: req.user.id },
      },
      { new: true },
    );

    if (!updatedClass) {
      // Check if class exists at all, or was just full
      const classExists = await Class.findById(classId);
      if (!classExists) throw new AppError("Class not found", 404);
      throw new AppError("Class is full", 400);
    }

    // 2. Check for duplicate (after atomic lock to be safe)
    const existingBooking = await Booking.findOne({
      userId: req.user.id,
      classId,
      status: { $nin: ["cancelled", "refunded"] },
    });

    if (existingBooking) {
      // Roll back the enrollment increment since we rejected
      await Class.findByIdAndUpdate(classId, {
        $inc: { currentEnrollment: -1 },
        $pull: { enrolledMembers: req.user.id },
      });
      throw new AppError("Already booked for this class", 409);
    }

    // 3. Create booking
    const booking = await Booking.create({
      userId: req.user.id,
      classId,
      classDate,
      bookingRef: generateBookingRef(),
      status: "confirmed",
      paymentStatus: "paid", // For dummy payment; change to "pending" with real Paystack
      amountPaid: updatedClass.price,
    });

    await booking.populate("classId");

    res.status(201).json({
      success: true,
      message: "Booking successful",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { userId: req.user.id };
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate("classId")
      .sort({ classDate: -1 });

    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("classId");
    if (!booking) throw new AppError("Booking not found", 404);

    if (
      booking.userId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      throw new AppError("Access denied", 403);
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

export const updateBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) throw new AppError("Booking not found", 404);

    if (
      booking.userId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      throw new AppError("Access denied", 403);
    }

    Object.assign(booking, req.body);
    await booking.save();

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) throw new AppError("Booking not found", 404);

    if (
      booking.userId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      throw new AppError("Access denied", 403);
    }

    if (!["confirmed", "upcoming"].includes(booking.status)) {
      throw new AppError("Cannot cancel this booking", 400);
    }

    booking.status = "cancelled";
    booking.cancelledAt = new Date();
    await booking.save();

    // Atomic rollback
    await Class.findByIdAndUpdate(booking.classId, {
      $inc: { currentEnrollment: -1 },
      $pull: { enrolledMembers: booking.userId },
    });

    res.status(200).json({ success: true, message: "Booking cancelled" });
  } catch (error) {
    next(error);
  }
};

export const checkInToClass = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) throw new AppError("Booking not found", 404);

    if (booking.status !== "confirmed") {
      throw new AppError("Cannot check in — booking is not active", 400);
    }

    booking.checkedInAt = new Date();
    booking.attendanceMarked = true;
    booking.status = "completed";
    await booking.save();

    res.status(200).json({ success: true, message: "Checked in successfully" });
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const bookings = await Booking.find(filter)
      .populate("userId", "firstName lastName email")
      .populate("classId", "name")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Booking.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: bookings,
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
