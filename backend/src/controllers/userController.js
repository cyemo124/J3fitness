import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import { AppError } from "../middleware/errorHandler.js";
import Workout from "../models/Workout.js";
import Routine from "../models/Routine.js";
import Session from "../models/Sessions.js";

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate("membership.planId");
    if (!user) throw new AppError("User not found", 404);

    const userObj = user.toObject();
    userObj.membership = user.resolvedMembership;

    res.status(200).json({ success: true, data: userObj });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, dateOfBirth, gender, address } =
      req.body;

    const updateData = {
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender,
      address,
    };

    if (req.body.weightHistory) {
      updateData.weightHistory = req.body.weightHistory.map((w) =>
        typeof w === "number" ? { weight: w } : w,
      );
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    });

    const userObj = user.toObject();
    userObj.membership = user.resolvedMembership;

    res.status(200).json({ success: true, data: userObj });
  } catch (error) {
    next(error);
  }
};

export const addWeightEntry = async (req, res, next) => {
  try {
    const { weight } = req.body;
    const user = await User.findById(req.user.id);
    user.weightHistory.push({ weight: Number(weight) });
    await user.save();
    res.status(200).json({ success: true, data: user.weightHistory });
  } catch (error) {
    next(error);
  }
};

export const getWeightHistory = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("weightHistory");
    res.status(200).json({ success: true, data: user.weightHistory });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, passwordConfirm } = req.body;
    const user = await User.findById(req.user.id).select("+password");

    const isValid = await user.comparePassword(currentPassword);
    if (!isValid) throw new AppError("Current password is incorrect", 401);

    if (newPassword !== passwordConfirm)
      throw new AppError("Passwords do not match", 400);

    user.password = newPassword;
    await user.save();

    await Session.updateMany(
      { user: user._id, isValid: true },
      { isValid: false },
    );

    res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};

export const getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate("classId")
      .sort({ classDate: -1 });
    res.status(200).json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
};

export const getMembershipInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate("membership.planId");
    res.status(200).json({
      success: true,
      data: user.resolvedMembership,
    });
  } catch (error) {
    next(error);
  }
};

export const renewMembership = async (req, res, next) => {
  try {
    const { planId } = req.body;
    res.status(200).json({ success: true, message: "Membership renewed" });
  } catch (error) {
    next(error);
  }
};

export const getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await Payment.find({
      userId: req.user.id,
      status: "successful",
    }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).populate("membership.planId");
    const membership = user.resolvedMembership || {
      status: "inactive",
      expiryDate: null,
    };

    const recentBookings = await Booking.find({ userId })
      .populate("classId", "name schedule")
      .sort({ classDate: -1 })
      .limit(3);

    const routine = await Routine.findOne({ user: userId });
    const todayName = new Date().toLocaleString("en-US", { weekday: "long" });
    const todayPlan = routine?.days?.find((d) => d.name === todayName);
    const todayWorkout = todayPlan
      ? {
          name: todayPlan.name,
          exercises: todayPlan.exercises || [],
        }
      : null;

    const workouts = await Workout.find({ user: userId })
      .sort({ date: -1 })
      .limit(30);

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);

      const hasWorkout = workouts.some((w) => {
        const wDate = new Date(w.date);
        wDate.setHours(0, 0, 0, 0);
        return wDate.getTime() === checkDate.getTime();
      });

      if (hasWorkout) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    let missedWorkout = false;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayName = yesterday.toLocaleString("en-US", {
      weekday: "long",
    });
    const yesterdayPlan = routine?.days?.find((d) => d.name === yesterdayName);

    if (yesterdayPlan && yesterdayPlan.exercises?.length > 0) {
      const yesterdayWorkout = workouts.some((w) => {
        const wDate = new Date(w.date);
        wDate.setHours(0, 0, 0, 0);
        return wDate.getTime() === yesterday.getTime();
      });
      missedWorkout = !yesterdayWorkout;
    }

    const recentActivity = workouts.slice(0, 5).map((w) => {
      const exerciseNames =
        w.exercises?.map((e) => e.name).join(", ") || "Workout";
      return `Completed ${exerciseNames}`;
    });

    if (recentActivity.length === 0 && todayWorkout) {
      recentActivity.push(`Scheduled: ${todayWorkout.name}`);
    }

    res.status(200).json({
      success: true,
      data: {
        membership,
        streak,
        missedWorkout,
        todayWorkout,
        recentActivity,
        recentBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── DUMMY MEMBERSHIP CONTROLLERS ───

export const createDummyMembership = async (req, res, next) => {
  try {
    const { planId, planName, accessLevel, price, durationMonths } = req.body;

    const expiresAt = new Date(
      Date.now() + durationMonths * 30 * 24 * 60 * 60 * 1000,
    );

    const transactionRef = `DUMMY_${Date.now()}`;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        dummyMembership: {
          planId,
          planName,
          accessLevel,
          price,
          durationMonths,
          subscribedAt: new Date(),
          expiresAt,
          paymentMethod: "dummy_test_card_4242",
          transactionRef,
          status: "active",
        },
      },
      { new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      data: user.dummyMembership,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelDummyMembership = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { "dummyMembership.status": "cancelled" } },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: "Dummy membership cancelled",
    });
  } catch (error) {
    next(error);
  }
};

export const changeDummyMembership = async (req, res, next) => {
  try {
    const { planId, planName, accessLevel, price, durationMonths } = req.body;

    const expiresAt = new Date(
      Date.now() + durationMonths * 30 * 24 * 60 * 60 * 1000,
    );

    const user = await User.findById(req.user.id);

    user.dummyMembership = {
      planId,
      planName,
      accessLevel,
      price,
      durationMonths,
      subscribedAt: new Date(),
      expiresAt,
      paymentMethod: "dummy_test_card_4242",
      transactionRef: `DUMMY_CHANGE_${Date.now()}`,
      status: "active",
    };

    await user.save();

    res.status(200).json({
      success: true,
      data: user.dummyMembership,
    });
  } catch (error) {
    next(error);
  }
};
