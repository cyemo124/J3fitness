import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide class name'],
    trim: true
  },
  description: String,
  category: {
    type: String,
    enum: ['Yoga', 'Cardio', 'Strength', 'Pilates', 'CrossFit', 'Dance', 'Boxing', 'Swimming', 'Other'],
    default: 'Other'
  },
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer',
    required: true
  },
  schedule: {
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      default: 60
    }
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide class capacity'],
    min: 1
  },
  currentEnrollment: {
    type: Number,
    default: 0,
    min: 0
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  price: {
    type: Number,
    min: 0,
    default: 0
  },
  image: {
    type: String,
    default: '/default-class.png'
  },
  location: {
    type: String,
    default: 'Main Gym'
  },
  maxBookingsPerUser: {
    type: Number,
    default: 1
  },
  cancellationDeadlineHours: {
    type: Number,
    default: 24
  },
  isActive: {
    type: Boolean,
    default: true
  },
  enrolledMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for frequent queries
classSchema.index({ trainerId: 1, isActive: 1 });
classSchema.index({ category: 1 });
classSchema.index({ 'schedule.dayOfWeek': 1 });

const Class = mongoose.model('Class', classSchema);

export default Class;
