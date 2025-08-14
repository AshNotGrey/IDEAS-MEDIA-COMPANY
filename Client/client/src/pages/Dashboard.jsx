import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import UpcomingBookingsWidget from "../components/dashboard/UpcomingBookingsWidget";
import RecentOrdersWidget from "../components/dashboard/RecentOrdersWidget";
import NotificationsWidget from "../components/dashboard/NotificationsWidget";
import CartWidget from "../components/dashboard/CartWidget";
import WishlistWidget from "../components/dashboard/WishlistWidget";
import QuickActions from "../components/dashboard/QuickActions";
import ProfileCompletionWidget from "../components/dashboard/ProfileCompletionWidget";
import { Check, AlertCircle } from "lucide-react";

const AccountDashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className='max-w-6xl mx-auto px-4 py-12'>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-8'></div>
          <div className='grid grid-cols-12 gap-6'>
            <div className='col-span-12 md:col-span-7 space-y-6'>
              {[...Array(3)].map((_, i) => (
                <div key={i} className='h-64 bg-gray-200 dark:bg-gray-700 rounded-lg'></div>
              ))}
            </div>
            <div className='col-span-12 md:col-span-5 space-y-6'>
              {[...Array(3)].map((_, i) => (
                <div key={i} className='h-48 bg-gray-200 dark:bg-gray-700 rounded-lg'></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const userName = user?.name || user?.email?.split("@")[0] || "there";

  return (
    <div className='max-w-6xl mx-auto px-4 py-12'>
      {/* Header */}
      <motion.div
        className='mb-8'
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.3 }}>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
              {getGreeting()}, {userName}!
            </h1>
            <p className='text-gray-600 dark:text-gray-400 mt-1'>Welcome back to your dashboard</p>
          </div>
          <div className='flex items-center gap-2'>
            {user?.emailVerified ? (
              <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'>
                <Check className='w-4 h-4 mr-1' /> Verified
              </span>
            ) : (
              <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'>
                <AlertCircle className='w-4 h-4 mr-1' /> Unverified
              </span>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          viewport={{ once: true, amount: 0.3 }}>
          <QuickActions />
        </motion.div>
      </motion.div>

      {/* Main Grid */}
      <motion.div
        className='grid grid-cols-12 gap-6'
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
        viewport={{ once: true, amount: 0.3 }}>
        {/* Left Column - Time-sensitive widgets */}
        <div className='col-span-12 md:col-span-7 space-y-6'>
          <UpcomingBookingsWidget />
          <RecentOrdersWidget />
          <ProfileCompletionWidget />
        </div>

        {/* Right Column - Utility/engagement widgets */}
        <div className='col-span-12 md:col-span-5 space-y-6'>
          <NotificationsWidget />
          <CartWidget />
          <WishlistWidget />
        </div>
      </motion.div>
    </div>
  );
};

export default AccountDashboard;
