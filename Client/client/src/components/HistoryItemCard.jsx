import React, { useState } from "react";
import {
  Camera,
  Wrench,
  Sparkles,
  ShoppingBag,
  ChevronDown,
  MapPin,
  Clock,
  Star,
  Calendar,
  Package,
  Truck,
  CreditCard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReceiptButton from "./ReceiptButton";
import RebookButton from "./RebookButton";
import ReorderButton from "./ReorderButton";
import { formatCurrency, formatDate, formatDateTime } from "../utils/format";

/**
 * HistoryItemCard Component
 *
 * Displays a unified history item with expandable details and type-specific actions
 */
const HistoryItemCard = ({
  historyItem,
  onDownloadReceipt,
  onRebook,
  onReorder,
  onLeaveReview,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTypeIcon = (type) => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case "rental":
        return <Wrench className={`${iconClass} text-ideas-accent`} />;
      case "makeover":
        return <Sparkles className={`${iconClass} text-pink-500`} />;
      case "photoshoot":
        return <Camera className={`${iconClass} text-blue-500`} />;
      case "shop":
        return <ShoppingBag className={`${iconClass} text-green-500`} />;
      default:
        return <Package className={`${iconClass} text-gray-500`} />;
    }
  };

  const getTypeBorderColor = (type) => {
    switch (type) {
      case "rental":
        return "border-ideas-accent";
      case "makeover":
        return "border-pink-500";
      case "photoshoot":
        return "border-blue-500";
      case "shop":
        return "border-green-500";
      default:
        return "border-gray-300";
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { bg: "bg-green-100", text: "text-green-800", label: "Completed" },
      delivered: { bg: "bg-green-100", text: "text-green-800", label: "Delivered" },
      confirmed: { bg: "bg-blue-100", text: "text-blue-800", label: "Confirmed" },
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending" },
      processing: { bg: "bg-blue-100", text: "text-blue-800", label: "Processing" },
      ready_for_pickup: { bg: "bg-purple-100", text: "text-purple-800", label: "Ready" },
      in_progress: { bg: "bg-blue-100", text: "text-blue-800", label: "In Progress" },
      cancelled: { bg: "bg-red-100", text: "text-red-800", label: "Cancelled" },
      refunded: { bg: "bg-orange-100", text: "text-orange-800", label: "Refunded" },
      payment_pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Payment Pending" },
    };

    const config = statusConfig[status] || {
      bg: "bg-gray-100",
      text: "text-gray-800",
      label: status,
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getPrimaryAction = () => {
    switch (historyItem.type) {
      case "rental":
        return <RebookButton historyItem={historyItem} onRebook={onRebook} />;
      case "photoshoot":
      case "makeover":
        return <RebookButton historyItem={historyItem} onRebook={onRebook} />;
      case "shop":
        return <ReorderButton historyItem={historyItem} onReorder={onReorder} />;
      default:
        return null;
    }
  };

  const getSecondaryActions = () => {
    const actions = [];

    // Receipt button for completed orders/bookings
    if (["completed", "delivered", "in_progress"].includes(historyItem.status)) {
      actions.push(
        <ReceiptButton key='receipt' historyItem={historyItem} onDownload={onDownloadReceipt} />
      );
    }

    // Review button for completed services
    if (
      ["photoshoot", "makeover"].includes(historyItem.type) &&
      historyItem.status === "completed" &&
      onLeaveReview
    ) {
      actions.push(
        <button
          key='review'
          onClick={() => onLeaveReview(historyItem)}
          className='flex items-center gap-2 px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-100 border border-yellow-200 transition-all hover:shadow-sm'>
          <Star className='w-4 h-4' />
          Leave Review
        </button>
      );
    }

    return actions;
  };

  return (
    <motion.div
      layout
      className='bg-white dark:bg-ideas-darkInput border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-card dark:shadow-cardDark border-l-4 border-l-transparent hover:border-l-ideas-accent transition-all duration-200 hover:shadow-lg dark:hover:shadow-xl'>
      {/* Main Card Content */}
      <div className='flex items-center gap-4'>
        {/* Type Icon */}
        <div
          className={`p-3 border-2 ${getTypeBorderColor(historyItem.type)} rounded-xl bg-white dark:bg-ideas-darkInput shadow-sm`}>
          {getTypeIcon(historyItem.type)}
        </div>

        {/* Main Info */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-start justify-between'>
            <div className='flex-1 min-w-0'>
              <h3 className='font-bold text-xl text-ideas-black dark:text-ideas-white truncate mb-2'>
                {historyItem.title}
              </h3>
              <div className='flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mb-2'>
                <span className='font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs'>
                  {historyItem.ref}
                </span>
                <span className='text-gray-400'>•</span>
                <span className='flex items-center gap-1'>
                  <Calendar className='w-3 h-3' />
                  {formatDateTime(historyItem.date, historyItem.time)}
                </span>
                {historyItem.location && (
                  <>
                    <span className='text-gray-400'>•</span>
                    <span className='flex items-center gap-1'>
                      <MapPin className='w-3 h-3' />
                      {historyItem.location}
                    </span>
                  </>
                )}
              </div>
              <div className='flex items-center gap-3'>
                {getStatusBadge(historyItem.status)}
                {historyItem.duration && (
                  <span className='flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded'>
                    <Clock className='w-3 h-3' />
                    {historyItem.duration}h
                  </span>
                )}
              </div>
            </div>

            {/* Amount and Primary Action */}
            <div className='flex items-center gap-4 ml-4'>
              <div className='text-right'>
                <div className='font-bold text-2xl text-ideas-accent'>
                  {formatCurrency(historyItem.total, historyItem.currency)}
                </div>
                {historyItem.items.length > 1 && (
                  <div className='text-sm text-gray-500 dark:text-gray-400'>
                    {historyItem.items.length} items
                  </div>
                )}
              </div>
              {getPrimaryAction()}
            </div>
          </div>
        </div>

        {/* Expand Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className='p-3 hover:bg-ideas-accent/10 hover:text-ideas-accent rounded-xl transition-all duration-200 group'>
          <ChevronDown
            className={`w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-ideas-accent transition-all duration-200 ${isExpanded ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className='border-t border-gray-200 dark:border-gray-700 mt-6 pt-6 space-y-6'>
            {/* Items List */}
            <div>
              <h4 className='font-semibold text-base text-ideas-black dark:text-ideas-white mb-3 flex items-center gap-2'>
                <Package className='w-4 h-4 text-ideas-accent' />
                Items
              </h4>
              <div className='space-y-3'>
                {historyItem.items.map((item, index) => (
                  <div
                    key={index}
                    className='flex items-center gap-4 p-4 bg-ideas-lightInput dark:bg-ideas-darkInput rounded-xl border border-gray-200 dark:border-gray-700 hover:border-ideas-accent/30 transition-all duration-200 hover:shadow-card dark:hover:shadow-cardDark'>
                    {item.thumb && (
                      <div className='relative'>
                        <img
                          src={item.thumb}
                          alt={item.name}
                          className='w-12 h-12 object-cover rounded-lg border-2 border-white dark:border-gray-800 shadow-sm'
                        />
                        <div className='absolute -top-1 -right-1 w-5 h-5 bg-ideas-accent rounded-full flex items-center justify-center text-white text-xs font-bold'>
                          {item.quantity}
                        </div>
                      </div>
                    )}
                    <div className='flex-1 min-w-0'>
                      <div className='font-semibold text-ideas-black dark:text-ideas-white text-base mb-1'>
                        {item.name}
                      </div>
                      <div className='text-sm text-gray-600 dark:text-gray-400 space-y-1'>
                        <div className='flex items-center gap-2 flex-wrap'>
                          <span className='inline-flex items-center gap-1 px-2 py-1 bg-ideas-accent/10 text-ideas-accent rounded-md text-xs font-medium'>
                            Qty: {item.quantity}
                          </span>
                          {item.unitPrice && (
                            <span className='inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-md text-xs font-medium'>
                              {formatCurrency(item.unitPrice)} each
                            </span>
                          )}
                        </div>
                        {item.rentalPeriod && (
                          <div className='inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium'>
                            <Calendar className='w-3 h-3' />
                            {formatDate(item.rentalPeriod.startDate)} -{" "}
                            {formatDate(item.rentalPeriod.endDate)}
                          </div>
                        )}
                        {item.serviceDetails && (
                          <div className='inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md text-xs font-medium'>
                            <Clock className='w-3 h-3' />
                            {formatDateTime(item.serviceDetails.date, item.serviceDetails.time)}
                          </div>
                        )}
                      </div>
                    </div>
                    {item.subtotal && (
                      <div className='text-right'>
                        <div className='font-bold text-lg text-ideas-accent'>
                          {formatCurrency(item.subtotal)}
                        </div>
                        <div className='text-xs text-gray-500 dark:text-gray-400'>Subtotal</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Details based on type */}
            {historyItem.specialRequests && historyItem.specialRequests.length > 0 && (
              <div>
                <h4 className='font-semibold text-base text-ideas-black dark:text-ideas-white mb-3 flex items-center gap-2'>
                  <Sparkles className='w-4 h-4 text-ideas-accent' />
                  Special Requests
                </h4>
                <div className='bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4'>
                  <ul className='space-y-2'>
                    {historyItem.specialRequests.map((request, index) => (
                      <li
                        key={index}
                        className='flex items-start gap-2 text-sm text-amber-800 dark:text-amber-200'>
                        <span className='w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0'></span>
                        {request}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {historyItem.notes && (
              <div>
                <h4 className='font-semibold text-base text-ideas-black dark:text-ideas-white mb-3 flex items-center gap-2'>
                  <Eye className='w-4 h-4 text-ideas-accent' />
                  Notes
                </h4>
                <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4'>
                  <p className='text-sm text-blue-800 dark:text-blue-200 leading-relaxed'>
                    {historyItem.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Payment Info */}
            {historyItem.payment && (
              <div>
                <h4 className='font-semibold text-base text-ideas-black dark:text-ideas-white mb-3 flex items-center gap-2'>
                  <CreditCard className='w-4 h-4 text-ideas-accent' />
                  Payment Information
                </h4>
                <div className='bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                    <div className='space-y-1'>
                      <div className='text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wide'>
                        Method
                      </div>
                      <div className='font-semibold text-green-900 dark:text-green-100 capitalize'>
                        {historyItem.payment.method}
                      </div>
                    </div>
                    <div className='space-y-1'>
                      <div className='text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wide'>
                        Status
                      </div>
                      <div className='font-semibold text-green-900 dark:text-green-100 capitalize'>
                        {historyItem.payment.status}
                      </div>
                    </div>
                    {historyItem.payment.paystack?.reference && (
                      <div className='space-y-1'>
                        <div className='text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wide'>
                          Reference
                        </div>
                        <div className='font-mono text-xs bg-white dark:bg-green-800 px-2 py-1 rounded border border-green-200 dark:border-green-700 text-green-900 dark:text-green-100'>
                          {historyItem.payment.paystack.reference}
                        </div>
                      </div>
                    )}
                    {historyItem.payment.paystack?.paidAt && (
                      <div className='space-y-1'>
                        <div className='text-xs font-medium text-green-700 dark:text-green-300 uppercase tracking-wide'>
                          Paid Date
                        </div>
                        <div className='font-semibold text-green-900 dark:text-green-100'>
                          {formatDate(historyItem.payment.paystack.paidAt)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Fulfillment Info for orders */}
            {historyItem.fulfillment && (
              <div>
                <h4 className='font-medium mb-2'>Fulfillment</h4>
                <div className='flex items-center gap-4 text-sm'>
                  <span className='flex items-center gap-1'>
                    <Truck className='w-4 h-4' />
                    {historyItem.fulfillment.method} at {historyItem.fulfillment.location}
                  </span>
                  {historyItem.fulfillment.scheduledDate && (
                    <span className='flex items-center gap-1'>
                      <Calendar className='w-4 h-4' />
                      {formatDateTime(
                        historyItem.fulfillment.scheduledDate,
                        historyItem.fulfillment.scheduledTime
                      )}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Secondary Actions */}
            <div className='flex flex-wrap gap-2'>{getSecondaryActions()}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default HistoryItemCard;
