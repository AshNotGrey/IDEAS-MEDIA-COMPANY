import React, { useState } from "react";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { Camera, Wrench, Sparkles, ShoppingBag, Calendar, Package } from "lucide-react";
import HistoryFilters from "../components/HistoryFilters";
import HistoryList from "../components/HistoryList";
import { useHistory } from "../hooks/useHistory";
import { formatCurrency } from "../utils/format";
import { MOCK_HISTORY_ITEMS, calculateMockStats } from "../constants";

/**
 * History page component.
 * Displays user's comprehensive history of rentals, bookings, and orders.
 *
 * @component
 * @returns {JSX.Element} The rendered History page.
 */
const History = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [groupBy, setGroupBy] = useState(null);

  const {
    historyItems: realHistoryItems,
    allHistoryItems: realAllHistoryItems,
    stats: realStats,
    loading,
    error,
    filters,
    updateFilters,
    handleDownloadReceipt,
    handleRebook,
    handleReorder,
    handleLeaveReview,
  } = useHistory();

  // Use mock data when real data is not available or for development
  const useMockData = !realAllHistoryItems || realAllHistoryItems.length === 0;

  // Apply basic filtering to mock data (simplified version of historyMapper filtering)
  const applyMockFilters = (items, currentFilters) => {
    let filtered = [...items];

    // Filter by search
    if (currentFilters.search && currentFilters.search.trim()) {
      const searchTerm = currentFilters.search.toLowerCase().trim();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm) ||
          item.ref.toLowerCase().includes(searchTerm) ||
          item.items.some((subItem) => subItem.name.toLowerCase().includes(searchTerm))
      );
    }

    // Filter by type (handled by tab filtering)
    // Filter by status
    if (currentFilters.status && currentFilters.status !== "all") {
      filtered = filtered.filter((item) => {
        switch (currentFilters.status) {
          case "completed":
            return ["completed", "delivered", "returned"].includes(item.status);
          case "upcoming":
            return [
              "confirmed",
              "pending",
              "processing",
              "ready_for_pickup",
              "in_progress",
            ].includes(item.status);
          case "cancelled":
            return ["cancelled"].includes(item.status);
          case "refunded":
            return ["refunded"].includes(item.status);
          default:
            return item.status === currentFilters.status;
        }
      });
    }

    // Apply sorting
    if (currentFilters.sortBy) {
      filtered = [...filtered].sort((a, b) => {
        switch (currentFilters.sortBy) {
          case "oldest":
            return new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt);
          case "amount_high":
            return (b.total || 0) - (a.total || 0);
          case "amount_low":
            return (a.total || 0) - (b.total || 0);
          case "newest":
          default:
            return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt);
        }
      });
    }

    return filtered;
  };

  const allHistoryItems = useMockData ? MOCK_HISTORY_ITEMS : realAllHistoryItems;
  const historyItems = useMockData
    ? applyMockFilters(MOCK_HISTORY_ITEMS, filters)
    : realHistoryItems;
  const stats = useMockData ? calculateMockStats(MOCK_HISTORY_ITEMS) : realStats;

  // Get items for current tab
  const getTabItems = () => {
    if (activeTab === "all") return historyItems;
    return historyItems.filter((item) => item.type === activeTab);
  };

  const tabItems = getTabItems();

  // Tab configuration with icons and colors matching QuickActions
  const tabs = [
    {
      id: "all",
      label: "All",
      icon: Package,
      count: historyItems.length,
      color: "text-gray-600",
      borderColor: "border-gray-400",
    },
    {
      id: "rental",
      label: "Rentals",
      icon: Wrench,
      count: stats?.byType?.rental || 0,
      color: "text-ideas-accent",
      borderColor: "border-ideas-accent",
    },
    {
      id: "photoshoot",
      label: "Photoshoots",
      icon: Camera,
      count: stats?.byType?.photoshoot || 0,
      color: "text-blue-500",
      borderColor: "border-blue-500",
    },
    {
      id: "makeover",
      label: "Makeovers",
      icon: Sparkles,
      count: stats?.byType?.makeover || 0,
      color: "text-pink-500",
      borderColor: "border-pink-500",
    },
    {
      id: "shop",
      label: "Shop",
      icon: ShoppingBag,
      count: stats?.byType?.shop || 0,
      color: "text-green-500",
      borderColor: "border-green-500",
    },
  ];

  // Get empty state config for current tab
  const getEmptyStateConfig = () => {
    const configs = {
      all: {
        title: "No history found",
        message: "You haven't made any bookings or orders yet. Start exploring our services!",
        actionText: "Explore Services",
        actionPath: "/",
        icon: <Calendar className='w-12 h-12 text-subtle' />,
      },
      rental: {
        title: "No rentals yet",
        message: "You haven't rented any equipment yet. Check out our photography and video gear!",
        actionText: "Browse Equipment",
        actionPath: "/equipment",
        icon: <Wrench className='w-12 h-12 text-ideas-accent' />,
      },
      photoshoot: {
        title: "No photoshoots yet",
        message: "You haven't booked any photoshoot sessions yet. Let's capture some memories!",
        actionText: "Book Photoshoot",
        actionPath: "/photoshoot",
        icon: <Camera className='w-12 h-12 text-blue-500' />,
      },
      makeover: {
        title: "No makeovers yet",
        message: "You haven't booked any makeover sessions yet. Transform your look today!",
        actionText: "Book Makeover",
        actionPath: "/makeover",
        icon: <Sparkles className='w-12 h-12 text-pink-500' />,
      },
      shop: {
        title: "No orders yet",
        message: "You haven't placed any shop orders yet. Discover items in our Mini-Mart!",
        actionText: "Shop Now",
        actionPath: "/mini-mart",
        icon: <ShoppingBag className='w-12 h-12 text-green-500' />,
      },
    };
    return configs[activeTab] || configs.all;
  };

  return (
    <section className='max-w-7xl mx-auto px-gutter py-section'>
      {/* Page Header */}
      <header className='mb-8'>
        <motion.h1
          className='section-title mb-2'
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.3 }}>
          Past Rentals & Bookings
        </motion.h1>
        <motion.p
          className='text-subtle max-w-2xl'
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
          viewport={{ once: true, amount: 0.3 }}>
          View and manage your past equipment rentals, photoshoot sessions, makeovers, and shop
          orders. Download receipts or book again with ease.
          {/* change to use server side data */}
        </motion.p>
      </header>

      {/* Quick Stats */}
      {stats && allHistoryItems.length > 0 && (
        <motion.div
          className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.3 }}>
          <div className='card text-center'>
            <div className='text-2xl font-bold text-primary'>{stats.total}</div>
            <div className='text-sm text-subtle'>Total Items</div>
          </div>
          <div className='card text-center'>
            <div className='text-2xl font-bold text-green-600'>
              {formatCurrency(stats.totalSpent)}
            </div>
            <div className='text-sm text-subtle'>Total Spent</div>
          </div>
          <div className='card text-center'>
            <div className='text-2xl font-bold text-blue-600'>{stats.byStatus.completed}</div>
            <div className='text-sm text-subtle'>Completed</div>
          </div>
          <div className='card text-center'>
            <div className='text-2xl font-bold text-orange-600'>{stats.byStatus.upcoming}</div>
            <div className='text-sm text-subtle'>Upcoming</div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <motion.div
        className='mb-6'
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.3 }}>
        <div className='flex flex-wrap gap-2'>
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg border-1 transition-all font-medium
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                  ${
                    isActive
                      ? `${tab.borderColor} ${tab.color} bg-white shadow-sm focus:ring-${tab.color.split("-")[1]} focus:ring-opacity-50`
                      : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50 focus:ring-gray-300 focus:ring-opacity-50"
                  }
                `}>
                <IconComponent className='w-4 h-4' />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`
                    px-2 py-0.5 rounded-full text-xs font-medium
                    ${
                      isActive ? "bg-current text-white bg-opacity-20" : "bg-gray-200 text-gray-600"
                    }
                  `}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        className='mb-6'
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.3 }}>
        <HistoryFilters filters={filters} onFiltersChange={updateFilters} stats={stats} />
      </motion.div>

      {/* View Options */}
      {tabItems.length > 0 && (
        <motion.div
          className='flex justify-between items-center mb-4'
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.3 }}>
          <div className='text-sm text-subtle'>
            {tabItems.length} {tabItems.length === 1 ? "item" : "items"}
            {activeTab !== "all" && ` in ${tabs.find((t) => t.id === activeTab)?.label}`}
          </div>

          <div className='flex items-center gap-2'>
            <label className='text-sm font-medium'>Group by:</label>
            <select
              value={groupBy || ""}
              onChange={(e) => setGroupBy(e.target.value || null)}
              className='input text-sm py-1'>
              <option value=''>None</option>
              <option value='month'>Month</option>
              <option value='week'>Week</option>
              <option value='day'>Day</option>
            </select>
          </div>
        </motion.div>
      )}

      {/* History List */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        viewport={{ once: true, amount: 0.3 }}>
        <HistoryList
          historyItems={tabItems}
          loading={loading}
          error={error?.message}
          groupBy={groupBy}
          onDownloadReceipt={handleDownloadReceipt}
          onRebook={handleRebook}
          onReorder={handleReorder}
          onLeaveReview={handleLeaveReview}
          emptyStateConfig={getEmptyStateConfig()}
        />
      </motion.div>
    </section>
  );
};

export default History;
