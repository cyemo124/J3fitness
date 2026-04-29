// backend/src/controllers/membershipController.js
import MembershipPlan from "../models/MembershipPlan.js";
import { AppError } from "../middleware/errorHandler.js";

export const getAllMemberships = async (req, res, next) => {
  try {
    const memberships = await MembershipPlan.find({ isActive: true }).sort({
      displayOrder: 1,
      price: 1,
    });

    res.status(200).json({
      success: true,
      data: memberships,
    });
  } catch (error) {
    next(error);
  }
};

export const getMembershipById = async (req, res, next) => {
  try {
    const membership = await MembershipPlan.findById(req.params.id);
    if (!membership) throw new AppError("Membership not found", 404);

    res.status(200).json({
      success: true,
      data: membership,
    });
  } catch (error) {
    next(error);
  }
};

// Admin only
export const createMembership = async (req, res, next) => {
  try {
    const membership = await MembershipPlan.create(req.body);

    res.status(201).json({
      success: true,
      data: membership,
      message: "Membership plan created",
    });
  } catch (error) {
    next(error);
  }
};

export const updateMembership = async (req, res, next) => {
  try {
    const membership = await MembershipPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );

    if (!membership) throw new AppError("Membership not found", 404);

    res.status(200).json({
      success: true,
      data: membership,
      message: "Membership plan updated",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMembership = async (req, res, next) => {
  try {
    const membership = await MembershipPlan.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true },
    );

    if (!membership) throw new AppError("Membership not found", 404);

    res.status(200).json({
      success: true,
      message: "Membership plan deleted",
    });
  } catch (error) {
    next(error);
  }
};
