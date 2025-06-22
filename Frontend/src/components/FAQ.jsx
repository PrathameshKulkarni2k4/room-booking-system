import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaPlus, FaMinus } from "react-icons/fa";

const faqData = [
  {
    question: "How do I book a room?",
    answer: "To book a room, go to our listings page, choose a room, and follow the booking instructions. You’ll be guided through steps to contact the room owner and confirm availability.",
  },
  {
    question: "Is there any booking fee?",
    answer: "Room Finder does not charge any booking fee. However, individual room owners may have their own terms, which will be displayed clearly before you confirm.",
  },
  {
    question: "Can I contact the room owner directly?",
    answer: "Yes, each room listing includes contact information for the room owner. You can call, email, or use the in-app chat to communicate directly.",
  },
  {
    question: "How do I report an issue with a room listing?",
    answer: "If you find a suspicious or misleading listing, use the 'Report' button on the room details page. Our support team will review it within 24 hours.",
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 px-4 bg-gray-100">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Frequently Asked Questions</h2>
      <div className="max-w-2xl mx-auto space-y-4">
        {faqData.map((faq, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-lg">
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleFAQ(index)}
            >
              <h3 className="text-lg font-semibold text-gray-800">{faq.question}</h3>
              {openIndex === index ? (
                <FaMinus className="text-[#7472E0]" />
              ) : (
                <FaPlus className="text-[#7472E0]" />
              )}
            </div>
            {openIndex === index && (
              <motion.p
                className="mt-4 text-gray-600"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                {faq.answer}
              </motion.p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
