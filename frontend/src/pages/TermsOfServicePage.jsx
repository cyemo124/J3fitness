// src/pages/TermsOfServicePage.jsx
import { motion } from "framer-motion";
import PageWrapper from "../components/PageWrapper";

const sections = [
  {
    title: "1. Membership Eligibility",
    content: `To use J³ Gym services, you must:
• Be at least 16 years old (or 13 with parental consent)
• Provide accurate, complete registration information
• Maintain the security of your account credentials
• Not have been previously banned for policy violations
We reserve the right to refuse service to anyone for any reason.`,
  },
  {
    title: "2. Membership Plans & Billing",
    content: `• Membership fees are charged according to your selected plan
• Payments are non-refundable except where required by law
• Failed payments may result in immediate access suspension
• Price changes require 30 days notice via email
• Cancellation must be submitted 7 days before next billing cycle`,
  },
  {
    title: "3. Class Bookings & Cancellations",
    content: `• Classes can be booked up to 14 days in advance
• Cancellations must be made at least 12 hours before class start
• Late cancellations or no-shows may result in a fee
• We reserve the right to cancel classes with 2 hours notice
• Waitlisted members will be notified if spots open up`,
  },
  {
    title: "4. Gym Rules & Conduct",
    content: `All members must:
• Wipe down equipment after use
• Return weights to proper racks
• Wear appropriate athletic footwear and clothing
• Respect personal space and trainer instructions
• Not photograph or record other members without consent
Violations may result in warnings, suspension, or termination.`,
  },
  {
    title: "5. Liability & Assumption of Risk",
    content: `• Fitness activities carry inherent risk of injury
• You assume all risks related to exercise and equipment use
• Consult a physician before beginning any program
• J³ Gym is not liable for lost or stolen personal items
• Report injuries to staff immediately for documentation`,
  },
  {
    title: "6. Intellectual Property",
    content: `All content on this website (logos, workout videos, training materials) is owned by J³ Gym and protected by copyright. You may not:
• Reproduce or distribute our content commercially
• Use our branding without written permission
• Record or redistribute class content
• Create derivative works from our training programs`,
  },
  {
    title: "7. Termination",
    content: `J³ Gym may suspend or terminate your account for:
• Violation of these terms or gym rules
• Fraudulent payment activity
• Harassment of staff or members
• Damage to equipment or facilities
• Illegal activity on premises
You may terminate your membership via account settings or written notice.`,
  },
  {
    title: "8. Governing Law",
    content: `These terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved through binding arbitration in Abuja, FCT. Both parties agree to attempt good-faith mediation before arbitration.`,
  },
];

export default function TermsOfServicePage() {
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
              Terms of Service
            </h1>
            <p className="text-gray-600">
              Effective Date:{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </motion.div>

          {/* Agreement Banner */}
          <motion.div
            className="bg-red-600 text-white p-4 rounded-lg mb-8 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p className="font-medium">
              By using J³ Gym services, you agree to these terms. Please read
              them carefully.
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
              Questions about these terms? Contact us at{" "}
              <a
                href="mailto:legal@j3gym.com"
                className="text-red-600 hover:underline"
              >
                legal@j3gym.com
              </a>
            </p>
            <p className="text-sm text-gray-500">
              J³ Gym • Rock Base Mall, News Engineering, Dawaki, Abuja
            </p>
          </motion.div>
        </div>
      </div>
    </PageWrapper>
  );
}
