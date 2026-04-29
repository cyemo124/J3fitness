import User from "../models/User.js";
import Class from "../models/Class.js";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import Analytics from "../models/Analytics.js";
import { AppError } from "../middleware/errorHandler.js";

export const getDashboard = async (req, res, next) => {
  try {
    const totalMembers = await User.countDocuments({ role: "user" });
    const activeMembers = await User.countDocuments({
      role: "user",
      "membership.status": "active",
    });

    const totalClasses = await Class.countDocuments({ isActive: true });
    const totalBookings = await Booking.countDocuments();
    const totalRevenue = await Payment.aggregate([
      { $match: { status: "successful" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const recentBookings = await Booking.find()
      .populate("userId", "firstName lastName")
      .populate("classId", "name")
      .limit(5)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        totalMembers,
        activeMembers,
        inactiveMembers: totalMembers - activeMembers,
        totalClasses,
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Promote a member to admin
export const makeAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Optional: prevent promoting yourself (extra safety)
    if (req.user._id.toString() === id) {
      return res.status(400).json({ message: "Cannot promote yourself" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role: "admin" },
      { new: true },
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User promoted to admin", user });
  } catch (err) {
    next(err);
  }
};

export const getAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const analytics = await Analytics.findOne(filter).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: analytics });
  } catch (error) {
    next(error);
  }
};

export const getAllMembers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const filter = { role: "user" };

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    const users = await User.find(filter)
      .select("-password")
      .populate("membership.planId")
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: users,
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

export const updateGymSettings = async (req, res, next) => {
  try {
    // Implementation for storing gym settings
    res.status(200).json({
      success: true,
      message: "Settings updated",
    });
  } catch (error) {
    next(error);
  }
};

export const getSystemLogs = async (req, res, next) => {
  try {
    // Implementation for system logging
    res.status(200).json({
      success: true,
      data: [],
    });
  } catch (error) {
    next(error);
  }
};

export const getRevenueReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = { status: "successful" };
    if (startDate || endDate) {
      filter.paidAt = {};
      if (startDate) filter.paidAt.$gte = new Date(startDate);
      if (endDate) filter.paidAt.$lte = new Date(endDate);
    }

    const revenue = await Payment.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalRevenue = await Payment.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        byType: revenue,
        total: totalRevenue[0]?.total || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMemberGrowthReport = async (req, res, next) => {
  try {
    const memberGrowth = await User.aggregate([
      {
        $match: { role: "user" },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.status(200).json({ success: true, data: memberGrowth });
  } catch (error) {
    next(error);
  }
};

export const getClassPopularityReport = async (req, res, next) => {
  try {
    const popularity = await Booking.aggregate([
      { $match: { status: { $in: ["confirmed", "completed"] } } },
      {
        $group: {
          _id: "$classId",
          bookings: { $sum: 1 },
        },
      },
      { $sort: { bookings: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "classes",
          localField: "_id",
          foreignField: "_id",
          as: "classDetails",
        },
      },
    ]);

    res.status(200).json({ success: true, data: popularity });
  } catch (error) {
    next(error);
  }
};
