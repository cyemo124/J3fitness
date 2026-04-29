// backend/src/utils/seedMemberships.js
import mongoose from "mongoose";
import Membership from "../models/MembershipPlan.js";
import dotenv from "dotenv";
dotenv.config();

const seedMemberships = async () => {
  const plans = [
    {
      name: "Basic",
      description: "Perfect for beginners starting their fitness journey",
      durationMonths: 1,
      price: 29999,
      features: [
        "Unlimited gym access",
        "4 classes per month",
        "Basic equipment access",
        "Locker room access",
      ],
      classesPerMonth: 4,
      accessLevel: "basic",
      benefits: {
        guestPasses: 0,
        priorityBooking: false,
        personalTrainingIncluded: 0,
        unlimitedClasses: false,
      },
      displayOrder: 1,
      isActive: true,
    },
    {
      name: "Premium",
      description: "Most popular plan for serious fitness enthusiasts",
      durationMonths: 1,
      price: 49999,
      features: [
        "Unlimited gym access",
        "Unlimited classes",
        "Priority booking",
        "1 PT session per month",
        "1 guest pass per month",
        "Nutrition consultation",
      ],
      classesPerMonth: 999,
      accessLevel: "premium",
      benefits: {
        guestPasses: 1,
        priorityBooking: true,
        personalTrainingIncluded: 1,
        unlimitedClasses: true,
      },
      displayOrder: 2,
      isActive: true,
    },
    {
      name: "VIP",
      description: "Ultimate fitness experience with premium perks",
      durationMonths: 1,
      price: 79999,
      features: [
        "24/7 gym access",
        "Unlimited classes",
        "4 PT sessions per month",
        "4 guest passes per month",
        "Priority booking",
        "Personal nutrition plan",
        "Recovery suite access",
        "Free merchandise",
      ],
      classesPerMonth: 999,
      accessLevel: "vip",
      benefits: {
        guestPasses: 4,
        priorityBooking: true,
        personalTrainingIncluded: 4,
        unlimitedClasses: true,
      },
      displayOrder: 3,
      isActive: true,
    },
  ];

  await Membership.deleteMany({});
  await Membership.insertMany(plans);
  console.log("✅ Membership plans seeded");
};

// 🔑 ADD THIS: Connect to MongoDB, run the seeder, then close the connection
const runSeeder = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI is not defined in .env file");
    }

    await mongoose.connect(uri);
    console.log("🔌 Connected to MongoDB");

    await seedMemberships();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔒 Connection closed");
    process.exit(0);
  }
};

runSeeder();
