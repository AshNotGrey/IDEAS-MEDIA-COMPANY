import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Loader, AlertCircle, Calendar } from "lucide-react";
import HistoryItemCard from "./HistoryItemCard";
import { groupHistoryByDate } from "../utils/historyMapper";
import { formatGroupDate } from "../utils/format";

/**
 * HistoryList Component
 *
 * Renders the unified list of history items with grouping and virtualization
 */
const HistoryList = ({
  historyItems = [],
  loading = false,
  error = null,
  groupBy = null, // 'month', 'week', 'day', or null for no grouping
  onDownloadReceipt,
  onRebook,
  onReorder,
  onLeaveReview,
  onLoadMore,
  hasMore = false,
  emptyStateConfig = {},
}) => {
  const [visibleItems, setVisibleItems] = useState(20);
  const [loadingMore, setLoadingMore] = useState(false);

  // Handle infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        if (hasMore && !loadingMore && onLoadMore) {
          setLoadingMore(true);
          onLoadMore().finally(() => setLoadingMore(false));
        } else if (!hasMore && visibleItems < historyItems.length) {
          setVisibleItems((prev) => Math.min(prev + 20, historyItems.length));
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loadingMore, onLoadMore, visibleItems, historyItems.length]);

  // Loading state
  if (loading && historyItems.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12 space-y-4'>
        <Loader className='w-8 h-8 animate-spin text-ideas-accent' />
        <p className='text-subtle'>Loading your history...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='card border-red-200 bg-red-50'>
        <div className='flex items-center gap-3'>
          <AlertCircle className='w-6 h-6 text-red-500' />
          <div>
            <h3 className='font-medium text-red-800'>Failed to load history</h3>
            <p className='text-red-600 text-sm'>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (historyItems.length === 0) {
    const defaultEmptyConfig = {
      title: "No history found",
      message: "You haven't made any bookings or orders yet.",
      actionText: "Explore Services",
      actionPath: "/",
      icon: <Calendar className='w-12 h-12 text-subtle' />,
    };

    const emptyConfig = { ...defaultEmptyConfig, ...emptyStateConfig };

    return (
      <div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='text-center py-12 space-y-6'>
        <div className='flex justify-center'>{emptyConfig.icon}</div>
        <div>
          <h3 className='text-xl font-semibold text-primary mb-2'>{emptyConfig.title}</h3>
          <p className='text-subtle max-w-md mx-auto'>{emptyConfig.message}</p>
        </div>
        {emptyConfig.actionText && emptyConfig.actionPath && (
          <button
            onClick={() => (window.location.href = emptyConfig.actionPath)}
            className='btn-primary px-6 py-2'>
            {emptyConfig.actionText}
          </button>
        )}
      </div>
    );
  }

  // Render grouped or flat list
  const renderGroupedList = () => {
    if (!groupBy) {
      return renderFlatList();
    }

    const grouped = groupHistoryByDate(historyItems.slice(0, visibleItems), groupBy);
    const sortedGroups = Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a));

    return (
      <div className='space-y-8'>
        {sortedGroups.map(([groupKey, items]) => (
          <div
            key={groupKey}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='space-y-4'>
            <div className='flex items-center gap-3'>
              <h3 className='text-lg font-semibold text-primary'>
                {formatGroupHeader(groupKey, groupBy)}
              </h3>
              <div className='flex-1 h-px bg-gray-200'></div>
              <span className='text-sm text-subtle bg-gray-100 px-2 py-1 rounded-full'>
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </div>
            <div className='space-y-4'>
              {items.map((item, index) => (
                <div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}>
                  <HistoryItemCard
                    historyItem={item}
                    onDownloadReceipt={onDownloadReceipt}
                    onRebook={onRebook}
                    onReorder={onReorder}
                    onLeaveReview={onLeaveReview}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderFlatList = () => {
    return (
      <div className='space-y-4'>
        <AnimatePresence>
          {historyItems.slice(0, visibleItems).map((item, index) => (
            <div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.02 }}>
              <HistoryItemCard
                historyItem={item}
                onDownloadReceipt={onDownloadReceipt}
                onRebook={onRebook}
                onReorder={onReorder}
                onLeaveReview={onLeaveReview}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  const formatGroupHeader = (groupKey, groupBy) => {
    return formatGroupDate(groupKey, groupBy);
  };

  return (
    <div className='space-y-6'>
      {/* Results summary */}
      <div className='flex items-center justify-between text-sm text-subtle'>
        <span>
          Showing {Math.min(visibleItems, historyItems.length)} of {historyItems.length} items
        </span>
        {groupBy && (
          <span className='flex items-center gap-1'>
            <Calendar className='w-4 h-4' />
            Grouped by {groupBy}
          </span>
        )}
      </div>

      {/* List content */}
      {renderGroupedList()}

      {/* Load more / infinite scroll indicator */}
      {(visibleItems < historyItems.length || hasMore) && (
        <div className='flex justify-center py-8'>
          {loadingMore ? (
            <div className='flex items-center gap-2'>
              <Loader className='w-5 h-5 animate-spin text-ideas-accent' />
              <span className='text-subtle'>Loading more...</span>
            </div>
          ) : visibleItems < historyItems.length ? (
            <button
              onClick={() => setVisibleItems((prev) => Math.min(prev + 20, historyItems.length))}
              className='btn-secondary px-6 py-2'>
              Load More ({historyItems.length - visibleItems} remaining)
            </button>
          ) : hasMore ? (
            <div className='text-center text-subtle'>
              <p>Scroll down to load more items</p>
            </div>
          ) : (
            <div className='text-center text-subtle'>
              <p>You've reached the end of your history</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HistoryList;
