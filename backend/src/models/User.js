import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide your first name'],
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: [true, 'Please provide your last name'],
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    default: null
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false // Don't return password by default
  },
  profileImage: {
    type: String,
    default: 'https://via.placeholder.com/200'
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['Male', 'Female', null],
    default: null
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  membership: {
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MembershipPlan',
      default: null
    },
    startDate: Date,
    expiryDate: Date,
    status: {
      type: String,
      enum: ['active', 'inactive', 'expired'],
      default: 'inactive'
    }
  },
  role: {
    type: String,
    enum: ['user', 'trainer', 'admin', 'super_admin'],
    default: 'user'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
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
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

// Method to get public user data
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.passwordResetToken;
  delete userObject.passwordResetExpires;
  delete userObject.emailVerificationToken;
  return userObject;
};

const User = mongoose.model('User', userSchema);

export default User;
