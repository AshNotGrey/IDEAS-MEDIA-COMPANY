import React from "react";
import PropTypes from "prop-types";
import { Calendar, Clock, Star } from "lucide-react";
import Button from "./Button";

/**
 * MakeoverCard Component
 *
 * A horizontal version of the ProductCard specifically designed for makeover services.
 * Features reviews, discounts, and booking functionality.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.service - The service object to display
 * @param {string} props.service.id - Unique identifier
 * @param {string} props.service.title - Service title
 * @param {string} props.service.description - Service description
 * @param {string} props.service.imageUrl - Primary image URL
 * @param {number} props.service.price - Service price
 * @param {number} [props.service.originalPrice] - Original price before discount
 * @param {number} [props.service.discountPercent] - Discount percentage
 * @param {string} props.service.category - Service category
 * @param {string} [props.service.duration] - Service duration
 * @param {string[]} [props.service.tags] - Service tags
 * @param {number} [props.service.rating] - Service rating (0-5)
 * @param {number} [props.service.reviewCount] - Number of reviews
 * @param {Function} props.onSelect - Selection handler
 * @param {boolean} props.loading - Loading state
 * @returns {JSX.Element} Rendered makeover card
 */
const MakeoverCard = ({ service, onSelect, loading }) => {
  if (loading) {
    return (
      <div className='card card-hover w-full'>
        <div className='flex flex-col sm:flex-row gap-4 p-4'>
          <div className='w-full sm:w-1/3 aspect-video skeleton rounded-lg' />
          <div className='flex-1 flex flex-col gap-3'>
            <div className='w-3/4 h-5 skeleton rounded' />
            <div className='w-1/2 h-4 skeleton rounded' />
            <div className='w-full h-4 skeleton rounded' />
            <div className='w-2/3 h-6 skeleton rounded' />
            <div className='flex gap-2 mt-2'>
              <div className='w-4/5 h-9 skeleton rounded-full' />
              <div className='w-1/5 h-9 skeleton rounded-full' />
            </div>
          </div>
        </div>
      </div>
    );
  }

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
  } = service;

  // 🇳🇬 Format to Nigerian Naira without decimals
  const formattedPrice = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price);

  return (
    <div
      onClick={() => onSelect(service)}
      className='card card-hover flex flex-col sm:flex-row gap-4 p-4 cursor-pointer transition-all duration-300'>
      {/* Image Section */}
      <div className='w-full sm:w-1/3 aspect-video rounded-lg overflow-hidden relative'>
        {imageUrl ? (
          <img src={imageUrl} alt={title} className='w-full h-full object-cover' loading='lazy' />
        ) : (
          <img
            src='/images/idealPhotography-Asset product-placeholder.png'
            alt='Service placeholder'
            className='w-full h-full object-cover'
            loading='lazy'
          />
        )}

        {/* Category Badge */}
        <div className='absolute top-2 left-2 z-10'>
          <span className='px-2 py-1 rounded-full text-xs font-medium bg-ideas-accent/90 text-white capitalize'>
            {category}
          </span>
        </div>

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <div className='absolute top-2 right-2 z-10'>
            <span className='px-2 py-1 rounded-full text-xs font-bold bg-green-600 text-white'>
              {discountPercent}% OFF
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className='flex-1 flex flex-col justify-between min-h-[140px]'>
        {/* Top Content */}
        <div className='flex-1'>
          <h3 className='text-lg sm:text-xl font-heading font-semibold mb-2 leading-tight'>
            {title}
          </h3>

          {description && (
            <p className='text-subtle text-sm leading-snug line-clamp-2 mb-3'>{description}</p>
          )}

          {/* Rating */}
          {rating && (
            <div className='flex items-center gap-2 mb-3'>
              <div className='flex text-yellow-500 text-xs'>
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${i < rating ? "fill-current" : "fill-none"}`}
                  />
                ))}
              </div>
              {reviewCount && <span className='text-subtle text-xs'>({reviewCount} reviews)</span>}
            </div>
          )}

          {/* Meta Information */}
          <div className='flex flex-wrap gap-2 mb-3'>
            {duration && (
              <span className='flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 capitalize'>
                <Clock className='w-3 h-3' />
                {duration}
              </span>
            )}
            {tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className='px-2 py-1 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 capitalize'>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className='flex items-center justify-between'>
          <div className='flex flex-col'>
            <div className='flex items-center gap-2'>
              <span className='text-lg font-bold tracking-tight'>{formattedPrice}</span>
              {originalPrice && originalPrice > price && (
                <span className='line-through text-subtle text-sm'>
                  {new Intl.NumberFormat("en-NG", {
                    style: "currency",
                    currency: "NGN",
                    minimumFractionDigits: 0,
                  }).format(originalPrice)}
                </span>
              )}
            </div>
            <span className='text-xs text-subtle'>per session</span>
          </div>

          {/* Action Button */}
          <Button
            variant='primary'
            size='sm'
            leftIcon={<Calendar className='w-4 h-4' />}
            animated={true}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(service);
            }}>
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
};

MakeoverCard.propTypes = {
  service: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    price: PropTypes.number.isRequired,
    originalPrice: PropTypes.number,
    discountPercent: PropTypes.number,
    category: PropTypes.string.isRequired,
    duration: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    imageUrl: PropTypes.string,
    rating: PropTypes.number,
    reviewCount: PropTypes.number,
  }).isRequired,
  onSelect: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

MakeoverCard.defaultProps = {
  loading: false,
};

export default MakeoverCard;
