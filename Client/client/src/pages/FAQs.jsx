import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqItems = [
  {
    question: "What services do you offer?",
    answer:
      "We offer photography equipment rentals, booking for photoshoots, makeovers, event coverage, and a mini-mart for photography-related products.",
  },
  {
    question: "How do I book a session?",
    answer:
      "Simply navigate to the relevant booking section, choose your preferred service, date, and time, and complete the checkout process.",
  },
  {
    question: "Can I cancel or reschedule a booking?",
    answer:
      "Yes, cancellations and reschedules are possible through your account dashboard, subject to our policy on notice periods.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We accept Paystack, debit/credit cards, and in some cases, direct bank transfers for corporate bookings.",
  },
  {
    question: "Do you offer same-day rentals or bookings?",
    answer:
      "Same-day services are subject to availability. Please check the booking calendar for up-to-date information.",
  },
];

const FAQItem = ({ question, answer, isOpen, onClick }) => (
  <div className='card card-hover transition-all duration-300'>
    <button
      onClick={onClick}
      className='flex justify-between items-center w-full text-left text-lg font-medium text-black dark:text-white'>
      <span>{question}</span>
      <ChevronDown
        className={`h-5 w-5 transform transition-transform duration-300 ${
          isOpen ? "rotate-180 text-ideas-accent" : "rotate-0"
        }`}
      />
    </button>

    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key='content'
          initial='collapsed'
          animate='open'
          exit='collapsed'
          variants={{
            open: { height: "auto", opacity: 1 },
            collapsed: { height: 0, opacity: 0 },
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className='overflow-hidden'>
          <div className='pt-4 text-subtle'>{answer}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className='max-w-4xl mx-auto px-4 py-section'>
      <h1 className='section-title mb-10 text-center'>Frequently Asked Questions</h1>

      <div className='space-y-4'>
        {faqItems.map((item, index) => (
          <FAQItem
            key={index}
            {...item}
            isOpen={openIndex === index}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          />
        ))}
      </div>
    </section>
  );
};

export default FAQs;
