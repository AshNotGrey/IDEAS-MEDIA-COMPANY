import React from "react";
import { motion } from "framer-motion";

const AccountDashboard = () => (
  <div className='max-w-3xl mx-auto px-4 py-12'>
    <motion.h1
      className='text-3xl font-bold mb-8 text-mailchimp-ink dark:text-mailchimp-dark-ink'
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.3 }}>
      Account Dashboard
    </motion.h1>
    {/* TODO: Add account info, verification status, and widget links. Connect to server. */}
    <motion.div
      className='bg-mailchimp-bgMuted dark:bg-mailchimp-dark-bgMuted rounded-lg p-8 text-center'
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      viewport={{ once: true, amount: 0.2 }}>
      <p className='text-lg'>Account info and widgets coming soon.</p>
    </motion.div>
  </div>
);

export default AccountDashboard;
