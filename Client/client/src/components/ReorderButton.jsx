import React, { useState } from "react";
import { ShoppingCart, Loader, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

/**
 * ReorderButton Component
 *
 * Handles reordering items from shop orders
 */
const ReorderButton = ({ historyItem, onReorder }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState(null);
  const navigate = useNavigate();

  const canReorder =
    historyItem.type === "shop" && historyItem.items && historyItem.items.length > 0;

  const handleReorder = async () => {
    if (isAdding) return;

    setIsAdding(true);
    setAddError(null);

    try {
      if (onReorder) {
        await onReorder(historyItem);
      } else {
        // Default: navigate to mini-mart with items to add
        const itemIds = historyItem.items
          .map(
            (item) =>
              historyItem.originalData?.items?.find((oi) => oi.productInfo?.name === item.name)
                ?.product
          )
          .filter(Boolean);

        if (itemIds.length > 0) {
          navigate(`/mini-mart?reorder=${itemIds.join(",")}`);
        } else {
          navigate("/mini-mart");
        }
      }
    } catch (error) {
      console.error("Reorder failed:", error);
      setAddError(error.message || "Failed to add items to cart");
    } finally {
      setIsAdding(false);
    }
  };

  if (!canReorder) {
    return null;
  }

  return (
    <div className='relative'>
      <motion.button
        onClick={handleReorder}
        disabled={isAdding}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
          ${
            isAdding
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 hover:shadow-sm"
          }
        `}>
        {isAdding ? <Loader className='w-4 h-4 animate-spin' /> : <Plus className='w-4 h-4' />}

        <span>{isAdding ? "Adding to Cart..." : "Reorder Items"}</span>

        {historyItem.items.length > 1 && (
          <span className='bg-green-200 text-green-800 text-xs px-1.5 py-0.5 rounded-full'>
            {historyItem.items.length}
          </span>
        )}
      </motion.button>

      {addError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className='absolute top-full left-0 mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs whitespace-nowrap z-10'>
          {addError}
        </motion.div>
      )}
    </div>
  );
};

export default ReorderButton;
