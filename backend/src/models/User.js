import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please provide your first name"],
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: [true, "Please provide your last name"],
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, "Please provide your email"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    phone: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6,
      select: false,
    },
    profileImage: {
      type: String,
      default: "https://via.placeholder.com/200",
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ["Male", "Female", null],
      default: null,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    // Real membership (for when real payments are live)
    membership: {
      planId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MembershipPlan",
        default: null,
      },
      planName: String,
      accessLevel: {
        type: String,
        enum: ["basic", "premium", "vip"],
      },
      price: Number,
      durationMonths: Number,
      startDate: Date,
      expiryDate: Date,
      paymentMethod: String,
      transactionRef: String,
      status: {
        type: String,
        enum: ["active", "inactive", "expired", "cancelled"],
        default: "inactive",
      },
    },
    // ─── NEW: Dummy membership for testing ───
    dummyMembership: {
      planId: String,
      planName: String,
      accessLevel: {
        type: String,
        enum: ["basic", "premium", "vip"],
      },
      price: Number,
      durationMonths: Number,
      subscribedAt: { type: Date, default: Date.now },
      expiresAt: Date,
      paymentMethod: { type: String, default: "dummy_test_card_4242" },
      transactionRef: String,
      status: {
        type: String,
        enum: ["active", "inactive", "expired", "cancelled"],
        default: "inactive",
      },
    },
    role: {
      type: String,
      enum: ["user", "trainer", "admin", "super_admin"],
      default: "user",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    weightHistory: [
      {
        weight: { type: Number, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ─── VIRTUAL: resolvedMembership merges real + dummy ───
userSchema.virtual("resolvedMembership").get(function () {
  // Real membership takes priority if active
  if (this.membership?.status === "active") {
    return { ...this.membership, isDummy: false };
  }
  // Fallback to dummy if active and not expired
  if (this.dummyMembership?.status === "active") {
    if (new Date(this.dummyMembership.expiresAt) > new Date()) {
      return { ...this.dummyMembership, isDummy: true };
    }
  }
  return null;
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    this.updatedAt = Date.now();
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

// Method to get public user data — includes resolvedMembership
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  delete userObject.emailVerificationToken;
  // Include resolvedMembership as top-level membership
  userObject.membership = this.resolvedMembership;
  return userObject;
};

const User = mongoose.model("User", userSchema);

export default User;
