import React from "react";
import PropTypes from "prop-types";
import { X, Clock, Star, Calendar, Tag, Users, Camera } from "lucide-react";
import Button from "./Button";

/**
 * ServiceDetailsModal Component
 *
 * Modal for displaying detailed information about a makeover service.
 * Shows comprehensive service details including images, descriptions, features, and pricing.
 *
 * @component
 * @param {Object} props - Props object
 * @param {Object|null} props.service - Service to display (null when closed)
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Close modal handler
 * @param {Function} props.onBook - Book service handler
 * @returns {JSX.Element}
 */
const ServiceDetailsModal = ({ service, isOpen, onClose, onBook }) => {
  if (!isOpen || !service) return null;

  const {
    title,
    description,
    price,
    originalPrice,
    discountPercent,
    category,
    duration,
    tags = [],
    imageUrl,
    rating,
    reviewCount,
    features = [],
    includes = [],
    requirements = [],
    portfolio = [],
  } = service;

  // Format price to Nigerian Naira
  const formattedPrice = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price);

  const formattedOriginalPrice = originalPrice
    ? new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 0,
      }).format(originalPrice)
    : null;

  const handleBookNow = () => {
    onBook(service);
    onClose();
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white dark:bg-ideas-darkInput rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700'>
          <div className='flex items-center gap-3'>
            <h2 className='text-2xl font-heading font-semibold'>{title}</h2>
            <span className='px-3 py-1 rounded-full text-sm font-medium bg-ideas-accent/10 text-ideas-accent capitalize'>
              {category}
            </span>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors'>
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            {/* Left Column - Images and Gallery */}
            <div className='space-y-4'>
              {/* Main Image */}
              <div className='aspect-video rounded-lg overflow-hidden relative'>
                {imageUrl ? (
                  <img src={imageUrl} alt={title} className='w-full h-full object-cover' />
                ) : (
                  <img
                    src='/images/idealPhotography-Asset product-placeholder.png'
                    alt='Service placeholder'
                    className='w-full h-full object-cover'
                  />
                )}

                {/* Discount Badge */}
                {discountPercent > 0 && (
                  <div className='absolute top-4 right-4 z-10'>
                    <span className='px-3 py-1 rounded-full text-sm font-bold bg-green-600 text-white'>
                      {discountPercent}% OFF
                    </span>
                  </div>
                )}
              </div>

              {/* Portfolio Gallery */}
              {portfolio && portfolio.length > 0 && (
                <div>
                  <h3 className='text-lg font-semibold mb-3 flex items-center gap-2'>
                    <Camera className='w-5 h-5 text-ideas-accent' />
                    Portfolio
                  </h3>
                  <div className='grid grid-cols-3 gap-2'>
                    {portfolio.slice(0, 6).map((image, index) => (
                      <div key={index} className='aspect-square rounded-lg overflow-hidden'>
                        <img
                          src={image}
                          alt={`Portfolio ${index + 1}`}
                          className='w-full h-full object-cover hover:scale-105 transition-transform duration-300'
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Details */}
            <div className='space-y-6'>
              {/* Rating and Reviews */}
              {rating && (
                <div className='flex items-center gap-4'>
                  <div className='flex items-center gap-2'>
                    <div className='flex text-yellow-500'>
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < rating ? "fill-current" : "fill-none"}`}
                        />
                      ))}
                    </div>
                    <span className='font-semibold'>{rating}</span>
                  </div>
                  {reviewCount && <span className='text-subtle'>({reviewCount} reviews)</span>}
                </div>
              )}

              {/* Price */}
              <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-lg'>
                <div className='flex items-center gap-3 mb-2'>
                  <span className='text-2xl font-bold tracking-tight'>{formattedPrice}</span>
                  {formattedOriginalPrice && (
                    <span className='line-through text-subtle text-lg'>
                      {formattedOriginalPrice}
                    </span>
                  )}
                </div>
                <span className='text-sm text-subtle'>per session</span>
              </div>

              {/* Meta Information */}
              <div className='flex flex-wrap gap-2'>
                {duration && (
                  <span className='flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium bg-gray-200 dark:bg-gray-700'>
                    <Clock className='w-4 h-4' />
                    {duration}
                  </span>
                )}
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className='flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium bg-gray-200 dark:bg-gray-700 capitalize'>
                    <Tag className='w-4 h-4' />
                    {tag}
                  </span>
                ))}
              </div>

              {/* Description */}
              {description && (
                <div>
                  <h3 className='text-lg font-semibold mb-3'>Description</h3>
                  <p className='text-subtle leading-relaxed'>{description}</p>
                </div>
              )}

              {/* What's Included */}
              {includes && includes.length > 0 && (
                <div>
                  <h3 className='text-lg font-semibold mb-3'>What's Included</h3>
                  <ul className='space-y-2'>
                    {includes.map((item, index) => (
                      <li key={index} className='flex items-center gap-2 text-subtle'>
                        <div className='w-2 h-2 bg-green-500 rounded-full flex-shrink-0' />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Features */}
              {features && features.length > 0 && (
                <div>
                  <h3 className='text-lg font-semibold mb-3'>Key Features</h3>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                    {features.map((feature, index) => (
                      <div
                        key={index}
                        className='flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
                        <Users className='w-4 h-4 text-blue-600' />
                        <span className='text-sm font-medium'>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements */}
              {requirements && requirements.length > 0 && (
                <div>
                  <h3 className='text-lg font-semibold mb-3'>Requirements</h3>
                  <ul className='space-y-2'>
                    {requirements.map((requirement, index) => (
                      <li key={index} className='flex items-center gap-2 text-subtle'>
                        <div className='w-2 h-2 bg-orange-500 rounded-full flex-shrink-0' />
                        {requirement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between gap-4 p-6 border-t border-gray-200 dark:border-gray-700'>
          <div className='flex items-center gap-2 text-subtle'>
            <Calendar className='w-4 h-4' />
            <span className='text-sm'>Available for booking</span>
          </div>
          <div className='flex items-center gap-3'>
            <Button variant='secondary' onClick={onClose}>
              Close
            </Button>
            <Button
              variant='primary'
              size='lg'
              leftIcon={<Calendar className='w-5 h-5' />}
              onClick={handleBookNow}
              animated={true}>
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

ServiceDetailsModal.propTypes = {
  service: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    price: PropTypes.number,
    originalPrice: PropTypes.number,
    discountPercent: PropTypes.number,
    category: PropTypes.string,
    duration: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    imageUrl: PropTypes.string,
    rating: PropTypes.number,
    reviewCount: PropTypes.number,
    features: PropTypes.arrayOf(PropTypes.string),
    includes: PropTypes.arrayOf(PropTypes.string),
    requirements: PropTypes.arrayOf(PropTypes.string),
    portfolio: PropTypes.arrayOf(PropTypes.string),
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onBook: PropTypes.func.isRequired,
};

export default ServiceDetailsModal;
