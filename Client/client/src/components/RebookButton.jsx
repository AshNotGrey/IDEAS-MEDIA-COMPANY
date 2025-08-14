import React from "react";
import { Calendar, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

/**
 * RebookButton Component
 *
 * Handles rebooking services (photoshoots, makeovers)
 */
const RebookButton = ({ historyItem, onRebook }) => {
  const navigate = useNavigate();

  const canRebook =
    ["rental", "photoshoot", "makeover"].includes(historyItem.type) &&
    ["completed", "delivered", "cancelled"].includes(historyItem.status);

  const handleRebook = () => {
    if (onRebook) {
      onRebook(historyItem);
      return;
    }

    // Default navigation logic
    const originalData = historyItem.originalData;

    if (historyItem.type === "rental") {
      // Navigate to equipment rentals with pre-filled data
      const productId = originalData?.product?._id || originalData?.items?.[0]?.product?._id;
      if (productId) {
        navigate(`/equipment?rebook=${productId}`);
      } else {
        navigate("/equipment");
      }
    } else if (historyItem.type === "photoshoot") {
      // Navigate to photoshoot bookings
      const serviceId = originalData?.product?._id;
      if (serviceId) {
        navigate(`/photoshoot?rebook=${serviceId}`);
      } else {
        navigate("/photoshoot");
      }
    } else if (historyItem.type === "makeover") {
      // Navigate to makeover bookings
      const serviceId = originalData?.product?._id;
      if (serviceId) {
        navigate(`/makeover?rebook=${serviceId}`);
      } else {
        navigate("/makeover");
      }
    }
  };

  if (!canRebook) {
    return null;
  }

  const getButtonText = () => {
    switch (historyItem.type) {
      case "rental":
        return "Rent Again";
      case "photoshoot":
        return "Book Again";
      case "makeover":
        return "Book Again";
      default:
        return "Book Again";
    }
  };

  const getIcon = () => {
    return historyItem.type === "rental" ? (
      <RefreshCw className='w-4 h-4' />
    ) : (
      <Calendar className='w-4 h-4' />
    );
  };

  return (
    <motion.button
      onClick={handleRebook}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className='flex items-center gap-2 px-3 py-2 bg-ideas-accent text-white rounded-lg text-sm font-medium hover:bg-ideas-accentHover transition-all hover:shadow-sm'>
      {getIcon()}
      <span>{getButtonText()}</span>
    </motion.button>
  );
};

export default RebookButton;
