import User from "../models/User.js";
import { AppError } from "../middleware/errorHandler.js";

// @desc    Create dummy membership
// @route   POST /api/v1/users/dummy-membership
// @access  Private
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

// @desc    Cancel dummy membership
// @route   DELETE /api/v1/users/dummy-membership
// @access  Private
export const cancelDummyMembership = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          "dummyMembership.status": "cancelled",
          "membership.status": "inactive",
        },
      },
      { new: true },
    );

    res.status(200).json({
      success: true,
      message: "Membership cancelled",
      data: user.resolvedMembership,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change dummy membership plan
// @route   PUT /api/v1/users/dummy-membership
// @access  Private
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
