import React from "react";
import { motion } from "framer-motion";
/**
 * Notifications page component.
 * Renders a notifications list.
 *
 * @component
 * @returns {JSX.Element} The rendered Notifications page.
 */
const Notifications = () => (
  <div className='max-w-2xl mx-auto px-gutter py-section'>
    <motion.h1
      className='section-title mb-8'
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.3 }}>
      Notifications
    </motion.h1>

    {/* TODO: Add notifications list and connect to server. */}
    <motion.div
      className='card text-center'
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.2 }}>
      <p className='text-subtle'>Notifications coming soon.</p>
    </motion.div>
  </div>
);

export default Notifications;
