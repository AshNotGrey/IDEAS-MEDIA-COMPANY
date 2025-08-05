import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, Package } from "lucide-react";
import Button from "./Button";
import DateTimePicker from "./DateTimePicker";
import RentalDateTimePicker from "./RentalDateTimePicker";
import formatPrice from "../utils/format";

/**
 * BookingEditModal Component
 *
 * Modal for editing booking details of cart items (services and rentals).
 * Allows users to modify dates, times, and other booking parameters.
 *
 * @component
 * @param {Object} props - Props object
 * @param {Object|null} props.item - Item to edit (null when closed)
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Close modal handler
 * @param {Function} props.onSave - Save changes handler
 * @returns {JSX.Element}
 */
const BookingEditModal = ({ item, isOpen, onClose, onSave }) => {
  const [editedDetails, setEditedDetails] = useState({});
  const [loading, setSaving] = useState(false);

  // Service date/time states (for DateTimePicker)
  const [serviceDate, setServiceDate] = useState(new Date());
  const [serviceTime, setServiceTime] = useState("10:00");

  // Rental date/time states (for RentalDateTimePicker)
  const [rentalStartDate, setRentalStartDate] = useState(new Date());
  const [rentalEndDate, setRentalEndDate] = useState(new Date());
  const [pickupTime, setPickupTime] = useState("10:00");
  const [returnTime, setReturnTime] = useState("17:00");

  // Initialize edited details when item changes
  useEffect(() => {
    if (item) {
      if (item.type === "service" && item.serviceDetails) {
        const serviceDate = new Date(item.serviceDetails.date);
        setServiceDate(serviceDate);
        setServiceTime(item.serviceDetails.time);

        setEditedDetails({
          type: "service",
          date: item.serviceDetails.date,
          time: item.serviceDetails.time,
          duration: item.serviceDetails.duration,
          specialRequests: item.serviceDetails.specialRequests || [],
        });
      } else if (item.type === "rental" && item.rentalDetails) {
        const startDate = new Date(item.rentalDetails.startDate);
        const endDate = new Date(item.rentalDetails.endDate);
        setRentalStartDate(startDate);
        setRentalEndDate(endDate);
        setPickupTime(item.rentalDetails.pickupTime);
        setReturnTime(item.rentalDetails.returnTime);

        setEditedDetails({
          type: "rental",
          startDate: item.rentalDetails.startDate,
          endDate: item.rentalDetails.endDate,
          pickupTime: item.rentalDetails.pickupTime,
          returnTime: item.rentalDetails.returnTime,
          duration: item.rentalDetails.duration,
          specialRequests: item.rentalDetails.specialRequests || [],
        });
      }
    }
  }, [item]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update editedDetails with current picker values
      const updatedDetails = { ...editedDetails };

      if (editedDetails.type === "service") {
        updatedDetails.date = serviceDate.toISOString().split("T")[0];
        updatedDetails.time = serviceTime;
      } else if (editedDetails.type === "rental") {
        updatedDetails.startDate = rentalStartDate.toISOString().split("T")[0];
        updatedDetails.endDate = rentalEndDate.toISOString().split("T")[0];
        updatedDetails.pickupTime = pickupTime;
        updatedDetails.returnTime = returnTime;
      }

      await onSave(item.id, updatedDetails);
      onClose();
    } catch (error) {
      console.error("Failed to save booking changes:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleSpecialRequestChange = (request) => {
    setEditedDetails((prev) => ({
      ...prev,
      specialRequests: prev.specialRequests?.includes(request)
        ? prev.specialRequests.filter((r) => r !== request)
        : [...(prev.specialRequests || []), request],
    }));
  };

  if (!isOpen || !item) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white dark:bg-ideas-darkInput rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700'>
          <h2 className='text-xl font-semibold'>Edit Booking Details</h2>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors'>
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6 space-y-6'>
          {/* Item Info */}
          <div className='flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
            <img src={item.image} alt={item.title} className='w-16 h-16 object-cover rounded-lg' />
            <div>
              <h3 className='font-semibold'>{item.title}</h3>
              <p className='text-sm text-subtle'>{formatPrice(item.price)}</p>
            </div>
          </div>

          {/* Service Edit Form */}
          {editedDetails.type === "service" && (
            <div className='bg-gray-50 dark:bg-gray-800 p-6 rounded-lg'>
              <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                <Calendar className='w-5 h-5 text-ideas-accent' />
                Service Date & Time
              </h3>
              <DateTimePicker
                date={serviceDate}
                setDate={setServiceDate}
                time={serviceTime}
                setTime={setServiceTime}
                className='max-w-md'
              />
            </div>
          )}

          {/* Rental Edit Form */}
          {editedDetails.type === "rental" && (
            <div className='bg-gray-50 dark:bg-gray-800 p-6 rounded-lg'>
              <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                <Package className='w-5 h-5 text-ideas-accent' />
                Rental Period & Times
              </h3>
              <RentalDateTimePicker
                startDate={rentalStartDate}
                setStartDate={setRentalStartDate}
                endDate={rentalEndDate}
                setEndDate={setRentalEndDate}
                pickupTime={pickupTime}
                setPickupTime={setPickupTime}
                returnTime={returnTime}
                setReturnTime={setReturnTime}
              />
            </div>
          )}

          {/* Special Requests */}
          <div className='bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg'>
            <h3 className='text-lg font-semibold mb-4 flex items-center gap-2'>
              <Clock className='w-5 h-5 text-ideas-accent' />
              Special Requests
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              {[
                "Extra equipment setup time",
                "Rush processing",
                "Additional copies",
                "Extended session time",
              ].map((request) => (
                <label
                  key={request}
                  className='flex items-center gap-3 p-3 bg-white dark:bg-ideas-darkInput rounded-lg border border-gray-200 dark:border-gray-700 hover:border-ideas-accent/30 transition-colors cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={editedDetails.specialRequests?.includes(request) || false}
                    onChange={() => handleSpecialRequestChange(request)}
                    className='w-4 h-4 text-ideas-accent border-gray-300 rounded focus:ring-ideas-accent focus:ring-2'
                  />
                  <span className='text-sm font-medium'>{request}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700'>
          <Button variant='secondary' onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant='primary' onClick={handleSave} loading={loading} disabled={loading}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingEditModal;
