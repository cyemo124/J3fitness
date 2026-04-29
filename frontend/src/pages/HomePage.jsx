import { Link } from "react-router-dom";
import anime from "animejs";
import { useEffect, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import ClassesPage from "./ClassesPage";
import FeaturedClasses from "./FeaturedClasses";
import PageWrapper from "../components/PageWrapper";
import { motion, useScroll, useTransform } from "framer-motion";

export default function HomePage() {
  const { user } = useAuth();
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 60]); // subtle bg parallax

  useEffect(() => {
    anime
      .timeline()
      .add({
        targets: ".plateL1, .plateL2",
        translateX: 105,
        duration: 900,
        easing: "easeOutExpo",
      })
      .add(
        {
          targets: ".plateR1, .plateR2",
          translateX: -105,
          duration: 900,
          easing: "easeOutExpo",
        },
        "-=900",
      )
      .add({
        targets: ".handle",
        scaleX: [0, 1],
        transformOrigin: "center",
        duration: 600,
        easing: "easeOutBack",
      })
      .add({
        targets: "#dumbbell",
        translateY: [-20, -70],
        rotate: [-5, 5],
        duration: 800,
        easing: "easeOutQuad",
      })
      .add({
        targets: "#dumbbell",
        translateY: 0,
        rotate: [-5, -5],
        duration: 700,
        easing: "easeOutElastic",
      });
  }, []);

  return (
    <PageWrapper>
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center overflow-hidden bg-black"
      >
        {/* Background layer — subtle upward drift + noise grain texture */}
        <motion.div className="absolute inset-0 bg-black" style={{ y: bgY }}>
          {/* Red radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(185,28,28,0.35),transparent)]" />
          {/* Grain overlay via SVG filter */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none">
            <filter id="grain">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.65"
                numOctaves="3"
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#grain)" />
          </svg>
          {/* Subtle grid lines */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </motion.div>

        {/* Content layer */}
        <motion.div
          className="relative z-10 w-full text-white text-center px-4 py-24"
          style={{ y: contentY, opacity: contentOpacity }}
        >
          {/* Eyebrow label */}
          <motion.span
            className="inline-block text-red-500 text-sm font-semibold tracking-[0.25em] uppercase mb-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Welcome to J³ Fitness
          </motion.span>

          <motion.h1
            className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 tracking-tight"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Transform Your Body,
            <br />
            <span className="text-red-600">Transform Your Life</span>
          </motion.h1>

          {/* Dumbbell */}
          <motion.div
            className="flex justify-center my-14"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <svg id="dumbbell" width="380" height="140" viewBox="0 0 380 140">
              <rect
                className="handle"
                x="60"
                y="75"
                width="260"
                height="10"
                rx="4"
                fill="white"
              />
              <rect
                className="plateL1"
                x="-20"
                y="45"
                width="25"
                height="75"
                rx="10"
                fill="#b91c1c"
              />
              <rect
                className="plateL2"
                x="3"
                y="45"
                width="25"
                height="75"
                rx="10"
                fill="#dc2626"
              />
              <rect
                className="plateR2"
                x="352"
                y="45"
                width="25"
                height="75"
                rx="10"
                fill="#dc2626"
              />
              <rect
                className="plateR1"
                x="328"
                y="45"
                width="25"
                height="75"
                rx="10"
                fill="#b91c1c"
              />
            </svg>
          </motion.div>

          <motion.p
            className="text-lg md:text-xl text-white/70 max-w-xl mx-auto mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Join our community of fitness enthusiasts and achieve your goals
            with expert guidance and world-class facilities.
          </motion.p>

          {!user && (
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.div
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/register"
                  className="inline-block bg-red-700 hover:bg-red-600 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-red-900/40 transition-colors"
                >
                  Get Started Today
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/classes"
                  className="inline-block border border-white/20 hover:border-white/50 text-white/80 hover:text-white font-semibold px-8 py-3.5 rounded-xl transition-colors backdrop-blur-sm"
                >
                  Browse Classes
                </Link>
              </motion.div>
            </motion.div>
          )}

          {/* Scroll hint */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 text-xs tracking-widest uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <motion.div
              className="w-px h-10 bg-gradient-to-b from-transparent to-white/30"
              animate={{ scaleY: [0.4, 1, 0.4] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            Scroll
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────── */}
      <motion.section
        className="bg-red-700 text-white py-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center px-4">
          {[
            { value: "200+", label: "Active Members" },
            { value: "10+", label: "Weekly Classes" },
            { value: "6+", label: "Expert Trainers" },
            { value: "3yr", label: "In the Community" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-3xl font-extrabold">{stat.value}</div>
              <div className="text-white/70 text-sm mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── FEATURED CLASSES ───────────────────────────────── */}
      <motion.section
        className="py-20 bg-light"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <FeaturedClasses />
      </motion.section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <motion.section
        className="container mx-auto py-20 px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
      >
        <motion.p
          className="text-red-600 text-sm font-semibold tracking-[0.2em] uppercase text-center mb-3"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          Why Us
        </motion.p>
        <motion.h2
          className="text-3xl md:text-5xl font-extrabold text-center mb-14 tracking-tight"
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          Why Choose J³ Fitness?
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: "🏋️",
              title: "Expert Trainers",
              desc: "Certified trainers ready to guide your fitness journey with personalized programs.",
            },
            {
              icon: "🧘",
              title: "Diverse Classes",
              desc: "From yoga to CrossFit, we have something for every level and goal.",
            },
            {
              icon: "⚡",
              title: "Modern Equipment",
              desc: "State-of-the-art gym equipment and facilities to power your progress.",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="group relative rounded-2xl border border-black/10 bg-white p-8 shadow-sm overflow-hidden"
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.25 }}
            >
              {/* Red accent top bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-t-2xl" />
              <div className="text-4xl mb-5">{item.icon}</div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-black/60 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <motion.section
        className="relative overflow-hidden bg-light text-dark py-24 mt-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="relative container mx-auto text-center px-4">
          <motion.h2
            className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-dark"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {user ? "Keep Pushing Your" : "Ready to Start Your"}
            <br />
            <span className="text-red-600">Fitness Journey?</span>
          </motion.h2>

          <motion.p
            className="text-gray-600 mb-10 max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
          >
            {user
              ? "You're doing great! Check your progress or book your next class."
              : "No contracts. No excuses. Just results."}
          </motion.p>

          <motion.div
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
          >
            {user ? (
              <Link
                to="/dashboard"
                className="inline-block bg-red-700 hover:bg-red-600 text-white font-semibold px-10 py-4 rounded-xl shadow-lg shadow-red-900/20 transition-colors text-lg"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/register"
                className="inline-block bg-red-700 hover:bg-red-600 text-white font-semibold px-10 py-4 rounded-xl shadow-lg shadow-red-900/20 transition-colors text-lg"
              >
                Register Now — It's Free
              </Link>
            )}
          </motion.div>
        </div>
      </motion.section>
    </PageWrapper>
  );
}
