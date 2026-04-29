import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  metrics: {
    totalMembers: Number,
    activeMembers: Number,
    inactiveMembers: Number,
    newSignups: Number,
    memberChurn: Number,
    totalRevenue: Number,
    averageOrderValue: Number
  },
  classMetrics: {
    totalClasses: Number,
    totalBookings: Number,
    totalAttendance: Number,
    averageAttendanceRate: Number,
    topClasses: [{
      classId: mongoose.Schema.Types.ObjectId,
      className: String,
      attendance: Number
    }]
  },
  trainerMetrics: {
    topTrainers: [{
      trainerId: mongoose.Schema.Types.ObjectId,
      trainerName: String,
      classCount: Number,
      avgRating: Number
    }]
  },
  paymentMetrics: {
    totalTransactions: Number,
    successfulTransactions: Number,
    failedTransactions: Number,
    successRate: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Analytics = mongoose.model('Analytics', analyticsSchema);

export default Analytics;
