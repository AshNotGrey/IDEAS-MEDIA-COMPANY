import React from "react";
import PropTypes from "prop-types";
import { Calendar, Clock, Star, Eye, Camera } from "lucide-react";
import Button from "./Button";

/**
 * PhotoshootCard Component
 *
 * A vertical card component specifically designed for photoshoot services.
 * Features reviews, discounts, booking functionality, and detailed view modal.
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
 * @param {Function} props.onViewDetails - View details handler
 * @param {boolean} props.loading - Loading state
 * @returns {JSX.Element} Rendered photoshoot card
 */
const PhotoshootCard = ({ service, onSelect, onViewDetails, loading = false }) => {
  if (loading) {
    return (
      <div className='card card-hover w-full'>
        <div className='relative w-full aspect-[4/3] skeleton rounded-lg' />
        <div className='mt-3 sm:mt-5 flex flex-col gap-2 sm:gap-3'>
          <div className='w-3/4 h-4 sm:h-5 skeleton rounded' />
          <div className='w-1/2 h-3 sm:h-4 skeleton rounded' />
          <div className='w-full h-3 sm:h-4 skeleton rounded' />
          <div className='w-full h-3 sm:h-4 skeleton rounded' />
          <div className='w-2/3 h-5 sm:h-6 skeleton rounded' />
          <div className='flex gap-2 mt-2'>
            <div className='w-4/5 h-8 sm:h-9 skeleton rounded-full' />
            <div className='w-1/5 h-8 sm:h-9 skeleton rounded-full' />
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
    <div className='card card-hover w-full group'>
      {/* Image Section */}
      <div className='relative w-full aspect-[4/3] rounded-lg overflow-hidden'>
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

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <span className='absolute top-2 sm:top-3 left-2 sm:left-3 bg-green-600 text-white text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full z-10'>
            {discountPercent}% OFF
          </span>
        )}

        {/* Category Badge */}
        <div className='absolute top-2 sm:top-3 right-2 sm:right-3 z-10'>
          <span className='px-2 py-1 rounded-full text-xs font-medium bg-ideas-accent/90 text-white capitalize'>
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className='mt-3 sm:mt-5 flex flex-col gap-2 sm:gap-3 min-h-[140px] sm:min-h-[160px]'>
        {/* Title + Duration */}
        <div className='flex justify-between items-start'>
          <h3 className='text-sm sm:text-lg font-heading font-semibold leading-tight flex-1 pr-2'>
            {title}
          </h3>
          {duration && (
            <span
              className='text-xs text-ideas-accent flex items-center gap-1 group-hover:scale-105 transition-transform duration-300 flex-shrink-0'
              title='Session Duration'>
              <Clock className='w-3 h-3 sm:w-4 sm:h-4' />
              {duration}
            </span>
          )}
        </div>

        {/* Rating */}
        {rating && (
          <div className='flex items-center gap-2'>
            <div className='flex text-yellow-500 text-xs sm:text-sm'>
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 sm:w-4 sm:h-4 ${i < rating ? "fill-current" : "fill-none"}`}
                />
              ))}
            </div>
            {reviewCount && <span className='text-subtle text-xs'>({reviewCount} reviews)</span>}
          </div>
        )}

        {/* Description */}
        {description && (
          <p className='text-subtle text-xs sm:text-sm leading-snug line-clamp-2'>{description}</p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className='flex flex-wrap gap-1'>
            {tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className='px-2 py-1 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 capitalize'>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Price Section */}
        <div className='text-sm sm:text-base leading-snug'>
          <span className='font-bold text-base sm:text-lg'>{formattedPrice}</span>
          {originalPrice && originalPrice > price && (
            <>
              <span className='line-through text-subtle text-xs sm:text-sm ml-2'>
                {new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                  minimumFractionDigits: 0,
                }).format(originalPrice)}
              </span>
              <span className='text-xs text-green-700 dark:text-green-400 ml-1'>
                (You save{" "}
                {new Intl.NumberFormat("en-NG", {
                  style: "currency",
                  currency: "NGN",
                  minimumFractionDigits: 0,
                }).format(originalPrice - price)}
                )
              </span>
            </>
          )}
          <div className='text-xs text-subtle'>per session</div>
        </div>

        {/* Buttons */}
        <div className='flex gap-2 mt-auto'>
          <Button
            variant='secondary'
            animated={true}
            className='w-4/5 text-xs sm:text-sm'
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(service);
            }}
            size='lg'
            leftIcon={<Eye className='w-4 h-4' />}>
            View Details
          </Button>
          <Button
            variant='primary'
            className='w-1/5 p-0 flex items-center justify-center'
            onClick={(e) => {
              e.stopPropagation();
              onSelect(service);
            }}
            animated={true}
            size='lg'
            title='Book Session'>
            <Camera className='w-4 h-4 sm:w-5 sm:h-5' />
          </Button>
        </div>
      </div>
    </div>
  );
};

PhotoshootCard.propTypes = {
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
  onViewDetails: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

export default PhotoshootCard;
