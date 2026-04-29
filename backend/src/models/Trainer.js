import mongoose from 'mongoose';

const trainerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  specializations: {
    type: [String],
    default: []
  },
  certifications: {
    type: [String],
    default: []
  },
  bio: String,
  experience: {
    type: Number,
    min: 0,
    default: 0
  },
  monthlyRate: {
    type: Number,
    min: 0,
    default: 0
  },
  availability: {
    monday: [{
      start: String,
      end: String
    }],
    tuesday: [{
      start: String,
      end: String
    }],
    wednesday: [{
      start: String,
      end: String
    }],
    thursday: [{
      start: String,
      end: String
    }],
    friday: [{
      start: String,
      end: String
    }],
    saturday: [{
      start: String,
      end: String
    }],
    sunday: [{
      start: String,
      end: String
    }]
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  totalClassesTaken: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  profileImage: {
  url: String,
  public_id: String,
},
});

const Trainer = mongoose.model('Trainer', trainerSchema);

export default Trainer;
