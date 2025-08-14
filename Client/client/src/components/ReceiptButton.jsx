import React, { useState } from "react";
import { Download, FileText, Loader } from "lucide-react";
import { motion } from "framer-motion";

/**
 * ReceiptButton Component
 *
 * Handles downloading receipts for completed orders and bookings
 */
const ReceiptButton = ({ historyItem, onDownload }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  const hasReceipt = historyItem.receipt?.generated || historyItem.originalData?.receipt?.generated;

  const receiptUrl = historyItem.receipt?.url || historyItem.originalData?.receipt?.url;

  const handleDownload = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    setDownloadError(null);

    try {
      if (receiptUrl) {
        // Direct download if URL exists
        const link = document.createElement("a");
        link.href = receiptUrl;
        link.download = `receipt-${historyItem.ref}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Generate receipt through API
        if (onDownload) {
          await onDownload(historyItem);
        } else {
          throw new Error("Receipt generation not available");
        }
      }
    } catch (error) {
      console.error("Download failed:", error);
      setDownloadError(error.message || "Download failed");
    } finally {
      setIsDownloading(false);
    }
  };

  // Don't show button if order/booking doesn't qualify for receipt
  const canDownloadReceipt =
    ["completed", "delivered", "in_progress", "payment_confirmed"].includes(historyItem.status) &&
    historyItem.total > 0;

  if (!canDownloadReceipt) {
    return null;
  }

  return (
    <div className='relative'>
      <motion.button
        onClick={handleDownload}
        disabled={isDownloading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
          ${
            hasReceipt
              ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200"
              : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
          }
          ${isDownloading ? "opacity-50 cursor-not-allowed" : "hover:shadow-sm"}
        `}>
        {isDownloading ? (
          <Loader className='w-4 h-4 animate-spin' />
        ) : hasReceipt ? (
          <Download className='w-4 h-4' />
        ) : (
          <FileText className='w-4 h-4' />
        )}

        <span>
          {isDownloading ? "Downloading..." : hasReceipt ? "Download Receipt" : "Generate Receipt"}
        </span>
      </motion.button>

      {downloadError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className='absolute top-full left-0 mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs whitespace-nowrap z-10'>
          {downloadError}
        </motion.div>
      )}
    </div>
  );
};

export default ReceiptButton;
