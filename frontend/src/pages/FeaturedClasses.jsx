import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { classAPI } from "../services/api";
import { motion } from "framer-motion";
import ImageWithFallBack from "../components/ImageWithFallBack";

const CATEGORIES = [
  "Yoga",
  "Cardio",
  "Strength",
  "Pilates",
  "CrossFit",
  "Dance",
  "Boxing",
  "Swimming",
];

// Create motion Link component
const MotionLink = motion(Link);

export default function FeaturedClasses() {
  const [featuredClasses, setFeaturedClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedClasses();
  }, []);

  const fetchFeaturedClasses = async () => {
    try {
      setLoading(true);
      const response = await classAPI.getAll(1, 50);
      const allClasses = response.data || [];

      const featured = [];
      CATEGORIES.forEach((category) => {
        const categoryClass = allClasses.find((c) => c.category === category);
        if (categoryClass) {
          featured.push(categoryClass);
        }
      });

      setFeaturedClasses(featured);
    } catch (error) {
      console.error("Error fetching featured classes:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (featuredClasses.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4">
      {/* Section Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-red-600 text-sm font-semibold tracking-[0.2em] uppercase mb-3">
          What We Offer
        </p>
        <h2 className="text-3xl md:text-4xl font-extrabold text-dark mb-4">
          Featured Classes
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto">
          Explore our diverse range of fitness classes designed for every level
        </p>
      </motion.div>

      {/* Featured Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 max-w-6xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          visible: {
            transition: { staggerChildren: 0.1 },
          },
        }}
      >
        {featuredClasses.map((cls) => (
          <motion.div
            key={cls._id}
            className="group cursor-pointer max-w-sm mx-auto w-full"
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            }}
            whileHover={{ y: -8 }}
            onClick={() => navigate(`/classes/${cls._id}`)}
          >
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="relative h-48 overflow-hidden">
                <ImageWithFallBack
                  src={cls.image}
                  alt={cls.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {cls.category}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="bg-white/90 text-gray-800 text-xs font-bold px-3 py-1 rounded-full">
                    {cls.level}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold text-dark mb-2 group-hover:text-red-600 transition-colors">
                  {cls.name}
                </h3>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {cls.description ||
                    `Join our ${cls.category} class and transform your fitness journey.`}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    👤 {cls.trainerId?.userId?.firstName || "Expert Trainer"}
                  </span>
                  <span className="font-bold text-red-600">
                    ₦{(cls.price || 0).toLocaleString()}
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <span>📅 {cls.schedule?.dayOfWeek}</span>
                  <span>⏰ {cls.schedule?.startTime}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* View All Button - Fixed with MotionLink */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <MotionLink
          to="/classes"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          View All Classes
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </MotionLink>
      </motion.div>
    </div>
  );
}
