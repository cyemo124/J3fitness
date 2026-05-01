// src/pages/PrivacyPolicyPage.jsx
import { motion } from "framer-motion";
import PageWrapper from "../components/PageWrapper";

const sections = [
  {
    title: "1. Information We Collect",
    content: `We collect information you provide directly to us, including:
• Personal identifiers (name, email, phone number)
• Payment and billing information
• Health and fitness goals (optional)
• Class bookings and attendance records
• Device and usage information via cookies`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use your data to:
• Process memberships and class bookings
• Personalize your workout recommendations
• Send schedule updates and promotional offers
• Improve our services and facilities
• Ensure gym safety and security`,
  },
  {
    title: "3. Data Sharing & Third Parties",
    content: `We do not sell your personal information. We only share data with:
• Payment processors (secure transaction handling)
• Email service providers (booking confirmations)
• Legal authorities when required by law
All third parties are contractually bound to protect your data.`,
  },
  {
    title: "4. Your Rights & Choices",
    content: `You have the right to:
• Access and update your personal information
• Request deletion of your account and data
• Opt out of marketing communications
• Export your workout history
To exercise these rights, contact us at privacy@j3gym.com.`,
  },
  {
    title: "5. Security Measures",
    content: `We implement industry-standard security:
• SSL/TLS encryption for all data transmission
• Password hashing with bcrypt
• Regular security audits and penetration testing
• Restricted access to member databases
Despite these measures, no online system is 100% secure.`,
  },
  {
    title: "6. Data Retention",
    content: `We retain your information for:
• Active accounts: duration of membership + 2 years
• Cancelled accounts: 1 year for legal compliance
• Payment records: 7 years (tax requirements)
After these periods, data is securely deleted or anonymized.`,
  },
  {
    title: "7. Children's Privacy",
    content: `J³ Gym does not knowingly collect data from children under 16. If you are under 16, parental consent is required for membership. If we discover unauthorized underage data, we will delete it immediately.`,
  },
  {
    title: "8. Policy Updates",
    content: `We may update this policy periodically. Significant changes will be notified via email and posted on this page with a revised "Last Updated" date. Continued use of our services constitutes acceptance of changes.`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <PageWrapper>
      <div className="min-h-screen bg-light py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <motion.div
            className="mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-dark mb-4">
              Privacy Policy
            </h1>
            <p className="text-gray-600">
              Last Updated:{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </motion.div>

          {/* Introduction */}
          <motion.div
            className="card mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <p className="text-gray-700 leading-relaxed">
              J³ Gym ("we," "our," or "us") is committed to protecting your
              privacy. This policy explains how we collect, use, and safeguard
              your personal information when you use our website, mobile
              application, and gym facilities located at Rock Base Mall, Dawaki,
              Abuja.
            </p>
          </motion.div>

          {/* Sections */}
          <div className="space-y-6">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                className="card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * (index + 2) }}
              >
                <h2 className="text-xl font-bold text-dark mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                    {index + 1}
                  </span>
                  {section.title}
                </h2>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line pl-10">
                  {section.content}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact Footer */}
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            <p className="text-gray-600 mb-2">
              Questions about this policy? Contact us at{" "}
              <a
                href="mailto:privacy@j3gym.com"
                className="text-red-600 hover:underline"
              >
                privacy@j3gym.com
              </a>
            </p>
            <p className="text-sm text-gray-500">
              J³ Gym • Rock Base Mall, News Engineering, Dawaki, Abuja • +234
              800 123 4567
            </p>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
