import React, { useState } from "react";
import { X, Calendar, Clock, Save, RotateCcw, Calendar as CalendarIcon, Timer } from "lucide-react";
import Button from "./Button";
import DateTimePicker from "./DateTimePicker";
import formatPrice from "../utils/format";

/**
 * BulkEditModal Component
 *
 * Modal for bulk editing multiple booking items at once.
 * Allows users to apply changes to selected bookings efficiently.
 *
 * @component
 * @param {Object} props - Props object
 * @param {Array} props.items - Array of items to edit
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Close modal handler
 * @param {Function} props.onSave - Save changes handler
 * @returns {JSX.Element}
 */
const BulkEditModal = ({ items = [], isOpen, onClose, onSave }) => {
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [bulkChanges, setBulkChanges] = useState({
    date: "",
    time: "",
    addDays: 0, // For shifting dates
    specialRequests: [],
  });
  const [loading, setLoading] = useState(false);

  // Custom picker states
  const [bulkDate, setBulkDate] = useState(new Date());
  const [bulkTime, setBulkTime] = useState("10:00");
  const [useDatePicker, setUseDatePicker] = useState(false);

  const handleSelectAll = () => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map((item) => item.id)));
    }
  };

  const handleSelectItem = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      const updatedItems = items.map((item) => {
        if (!selectedItems.has(item.id)) return item;

        const updatedItem = { ...item };

        if (item.type === "service" && item.serviceDetails) {
          updatedItem.serviceDetails = { ...item.serviceDetails };

          if (bulkChanges.date) {
            updatedItem.serviceDetails.date = bulkChanges.date;
          }

          if (bulkChanges.addDays !== 0) {
            const currentDate = new Date(item.serviceDetails.date);
            currentDate.setDate(currentDate.getDate() + bulkChanges.addDays);
            updatedItem.serviceDetails.date = currentDate.toISOString().split("T")[0];
          }

          if (bulkChanges.time) {
            updatedItem.serviceDetails.time = bulkChanges.time;
          }
        }

        if (item.type === "rental" && item.rentalDetails) {
          updatedItem.rentalDetails = { ...item.rentalDetails };

          if (bulkChanges.date) {
            // For rentals, update start date and adjust end date to maintain duration
            const originalDuration = item.rentalDetails.duration;
            const newStartDate = new Date(bulkChanges.date);
            const newEndDate = new Date(newStartDate);
            newEndDate.setDate(newStartDate.getDate() + originalDuration);

            updatedItem.rentalDetails.startDate = bulkChanges.date;
            updatedItem.rentalDetails.endDate = newEndDate.toISOString().split("T")[0];
          }

          if (bulkChanges.addDays !== 0) {
            const currentStart = new Date(item.rentalDetails.startDate);
            const currentEnd = new Date(item.rentalDetails.endDate);

            currentStart.setDate(currentStart.getDate() + bulkChanges.addDays);
            currentEnd.setDate(currentEnd.getDate() + bulkChanges.addDays);

            updatedItem.rentalDetails.startDate = currentStart.toISOString().split("T")[0];
            updatedItem.rentalDetails.endDate = currentEnd.toISOString().split("T")[0];
          }

          if (bulkChanges.time) {
            updatedItem.rentalDetails.pickupTime = bulkChanges.time;
          }
        }

        return updatedItem;
      });

      const modifiedItems = updatedItems.filter((item) => selectedItems.has(item.id));
      await onSave(modifiedItems);
      onClose();
    } catch (error) {
      console.error("Failed to save bulk changes:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetChanges = () => {
    setBulkChanges({
      date: "",
      time: "",
      addDays: 0,
      specialRequests: [],
    });
    setSelectedItems(new Set());
  };

  if (!isOpen) return null;

  const selectedCount = selectedItems.size;
  const serviceItems = items.filter((item) => item.type === "service");
  const rentalItems = items.filter((item) => item.type === "rental");

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white dark:bg-ideas-darkInput rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700'>
          <div>
            <h2 className='text-xl font-semibold'>Bulk Edit Bookings</h2>
            <p className='text-sm text-subtle mt-1'>
              Edit multiple bookings at once • {selectedCount} of {items.length} selected
            </p>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors'>
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* Left: Item Selection */}
            <div>
              <div className='flex items-center justify-between mb-4'>
                <h3 className='text-lg font-semibold'>Select Items</h3>
                <Button variant='secondary' size='sm' onClick={handleSelectAll}>
                  {selectedItems.size === items.length ? "Deselect All" : "Select All"}
                </Button>
              </div>

              <div className='space-y-3 max-h-80 overflow-y-auto'>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedItems.has(item.id)
                        ? "border-ideas-accent bg-ideas-accent bg-opacity-10"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleSelectItem(item.id)}>
                    <div className='flex items-center gap-3'>
                      <input
                        type='checkbox'
                        checked={selectedItems.has(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className='rounded border-gray-300'
                      />
                      <img
                        src={item.image}
                        alt={item.title}
                        className='w-12 h-12 object-cover rounded'
                      />
                      <div className='flex-1 min-w-0'>
                        <h4 className='font-medium truncate'>{item.title}</h4>
                        <p className='text-sm text-subtle'>{formatPrice(item.price)}</p>
                        <div className='flex items-center gap-2 text-xs text-subtle mt-1'>
                          <span
                            className={`px-2 py-1 rounded ${
                              item.type === "service"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-green-100 text-green-700"
                            }`}>
                            {item.type === "service" ? "Service" : "Rental"}
                          </span>
                          {item.type === "service" && item.serviceDetails && (
                            <span>
                              {item.serviceDetails.date} • {item.serviceDetails.time}
                            </span>
                          )}
                          {item.type === "rental" && item.rentalDetails && (
                            <span>
                              {item.rentalDetails.startDate} - {item.rentalDetails.endDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Bulk Changes */}
            <div>
              <h3 className='text-lg font-semibold mb-4'>Apply Changes</h3>

              <div className='space-y-6'>
                {/* Date Changes */}
                <div className='bg-gray-50 dark:bg-gray-800 p-6 rounded-lg'>
                  <h4 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                    <CalendarIcon className='w-5 h-5 text-ideas-accent' />
                    Date Modifications
                  </h4>

                  {/* Date Setting Options */}
                  <div className='space-y-4'>
                    <div className='flex gap-4'>
                      <Button
                        variant={useDatePicker ? "primary" : "secondary"}
                        size='sm'
                        onClick={() => {
                          setUseDatePicker(true);
                          setBulkChanges((prev) => ({
                            ...prev,
                            date: bulkDate.toISOString().split("T")[0],
                            addDays: 0,
                          }));
                        }}
                        className='flex-1'>
                        Set Specific Date
                      </Button>
                      <Button
                        variant={!useDatePicker ? "primary" : "secondary"}
                        size='sm'
                        onClick={() => {
                          setUseDatePicker(false);
                          setBulkChanges((prev) => ({ ...prev, date: "" }));
                        }}
                        className='flex-1'>
                        Shift Dates
                      </Button>
                    </div>

                    {useDatePicker ? (
                      <div className='max-w-md'>
                        <DateTimePicker
                          date={bulkDate}
                          setDate={(date) => {
                            setBulkDate(date);
                            setBulkChanges((prev) => ({
                              ...prev,
                              date: date.toISOString().split("T")[0],
                            }));
                          }}
                          time={bulkTime}
                          setTime={(time) => {
                            setBulkTime(time);
                            setBulkChanges((prev) => ({ ...prev, time }));
                          }}
                        />
                      </div>
                    ) : (
                      <div className='bg-white dark:bg-ideas-darkInput p-4 rounded-lg border border-gray-200 dark:border-gray-700'>
                        <label className='block text-sm font-medium mb-2'>
                          Shift all dates by:
                        </label>
                        <div className='flex items-center gap-3'>
                          <div className='flex items-center gap-2'>
                            <Button
                              variant='secondary'
                              size='sm'
                              onClick={() =>
                                setBulkChanges((prev) => ({ ...prev, addDays: prev.addDays - 1 }))
                              }
                              className='w-8 h-8 p-0'>
                              -
                            </Button>
                            <input
                              type='number'
                              value={bulkChanges.addDays}
                              onChange={(e) =>
                                setBulkChanges((prev) => ({
                                  ...prev,
                                  addDays: parseInt(e.target.value) || 0,
                                }))
                              }
                              className='w-16 p-2 text-center border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-ideas-darkInput'
                              placeholder='0'
                            />
                            <Button
                              variant='secondary'
                              size='sm'
                              onClick={() =>
                                setBulkChanges((prev) => ({ ...prev, addDays: prev.addDays + 1 }))
                              }
                              className='w-8 h-8 p-0'>
                              +
                            </Button>
                          </div>
                          <span className='text-sm font-medium'>days</span>
                          {bulkChanges.addDays !== 0 && (
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                bulkChanges.addDays > 0
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                              }`}>
                              {bulkChanges.addDays > 0
                                ? `+${bulkChanges.addDays}`
                                : bulkChanges.addDays}{" "}
                              days
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Time Changes */}
                {!useDatePicker && (
                  <div className='bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg'>
                    <h4 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                      <Timer className='w-5 h-5 text-ideas-accent' />
                      Time Modifications
                    </h4>

                    <div className='space-y-3'>
                      <p className='text-sm text-subtle'>
                        Set time for all selected items (service time / rental pickup time)
                      </p>

                      <div className='flex flex-wrap items-center gap-2'>
                        <Button
                          variant={bulkChanges.time === "" ? "primary" : "secondary"}
                          size='sm'
                          onClick={() => setBulkChanges((prev) => ({ ...prev, time: "" }))}
                          className='text-xs'>
                          Keep Existing
                        </Button>
                        {[
                          "09:00",
                          "10:00",
                          "11:00",
                          "12:00",
                          "13:00",
                          "14:00",
                          "15:00",
                          "16:00",
                          "17:00",
                          "18:00",
                        ].map((time) => (
                          <Button
                            key={time}
                            variant={bulkChanges.time === time ? "primary" : "text"}
                            size='sm'
                            onClick={() => setBulkChanges((prev) => ({ ...prev, time }))}
                            className='text-xs min-w-[60px]'>
                            {time}
                          </Button>
                        ))}
                      </div>

                      {bulkChanges.time && (
                        <div className='flex items-center gap-2 text-sm'>
                          <Clock className='w-4 h-4 text-ideas-accent' />
                          <span>
                            Selected time: <strong>{bulkChanges.time}</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Summary */}
                {selectedCount > 0 && (
                  <div className='p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
                    <h4 className='font-medium text-blue-900 dark:text-blue-100 mb-2'>
                      Changes will be applied to:
                    </h4>
                    <ul className='text-sm text-blue-700 dark:text-blue-200 space-y-1'>
                      <li>• {selectedCount} selected items</li>
                      {serviceItems.filter((item) => selectedItems.has(item.id)).length > 0 && (
                        <li>
                          • {serviceItems.filter((item) => selectedItems.has(item.id)).length}{" "}
                          services
                        </li>
                      )}
                      {rentalItems.filter((item) => selectedItems.has(item.id)).length > 0 && (
                        <li>
                          • {rentalItems.filter((item) => selectedItems.has(item.id)).length}{" "}
                          rentals
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700'>
          <Button
            variant='secondary'
            onClick={resetChanges}
            leftIcon={<RotateCcw className='w-4 h-4' />}>
            Reset
          </Button>

          <div className='flex items-center gap-3'>
            <Button variant='secondary' onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant='primary'
              onClick={handleSave}
              loading={loading}
              disabled={loading || selectedCount === 0}
              leftIcon={<Save className='w-4 h-4' />}>
              Apply Changes ({selectedCount})
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkEditModal;
