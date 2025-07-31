import { useEffect, useState } from "react";
import { Store, ShoppingCart } from "lucide-react";
import formatPrice from "../utils/format";
import WishlistButton from "./WishlistButton";
import Button from "./Button";

/**
 * ProductCard Component
 *
 * A fully theme-compliant product card with hover transitions, skeleton loading,
 * responsive layout, and CTA buttons for cart and detail view.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.title - Product title
 * @param {string} props.description - Product description
 * @param {string} props.image - Default product image URL
 * @param {string} props.hoverImage - Alternate image shown on hover or autoplay
 * @param {number} props.discountPercent - Discount percent (e.g., 20)
 * @param {number} props.price - Final sale price
 * @param {number} props.originalPrice - Original price before discount
 * @param {number} props.stock - Available stock quantity
 * @param {number} props.rating - Product rating (0–5)
 * @param {number} props.reviewCount - Total number of reviews
 * @param {string} props.discountValidUntil - Discount expiration text
 * @param {boolean} props.loading - If true, displays skeleton loader
 * @param {Function} props.onViewDetails - View product details handler
 * @param {Function} props.onAddToCart - Add to cart handler
 * @returns {JSX.Element} Rendered product card
 */
const ProductCard = ({
  title = "Product name",
  description = "Product description goes here",
  image = "/images/idealPhotography-Asset product-placeholder.png",
  hoverImage = "/images/idealPhotography-Asset product-placeholder.png",
  discountPercent = 17,
  price = 2499.99,
  originalPrice = 2999.99,
  stock = 12,
  rating = 4,
  reviewCount = 134,
  discountValidUntil = "July 30",
  loading = false,
  onViewDetails,
  onAddToCart,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev === 0 ? 1 : 0));
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  const stars = Array.from({ length: 5 }, (_, i) => (i < rating ? "★" : "☆"));

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

  return (
    <div
      className='card card-hover w-full group'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      {/* Image with Transition */}
      <div className='relative w-full aspect-[4/3] rounded-lg overflow-hidden'>
        <img
          src={image}
          alt={title}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${
            isHovered || currentImage === 1 ? "opacity-0 scale-105" : "opacity-100"
          }`}
        />
        <img
          src={hoverImage}
          alt={title + " alt"}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${
            isHovered || currentImage === 1 ? "opacity-100" : "opacity-0"
          }`}
        />
        {discountPercent > 0 && (
          <span className='absolute top-2 left-2 sm:top-3 sm:left-3 bg-green-600 text-white text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full z-10'>
            {discountPercent}% OFF
          </span>
        )}
        {/* Wishlist Button */}
        <div className='absolute top-2 right-2 sm:top-3 sm:right-3 z-10'>
          <WishlistButton
            item={{
              id: title.toLowerCase().replace(/\s+/g, "-"),
              title,
              price,
              originalPrice,
              image,
            }}
            size='sm'
          />
        </div>
      </div>

      {/* Content */}
      <div className='mt-3 sm:mt-5 flex flex-col gap-2 sm:gap-3 min-h-[120px] sm:min-h-[140px]'>
        {/* Title + Stock */}
        <div className='flex justify-between items-start'>
          <h3 className='text-sm sm:text-lg font-heading font-semibold leading-tight flex-1 pr-2'>
            {title}
          </h3>
          <span
            className='text-xs text-green-700 dark:text-green-400 flex items-center gap-1 group-hover:scale-105 transition-transform duration-300 flex-shrink-0'
            title='Stock Available'>
            <Store className='w-3 h-3 sm:w-4 sm:h-4' />({stock})
          </span>
        </div>

        {/* Rating */}
        <div className='flex items-center gap-2'>
          <div className='flex text-yellow-500 text-xs sm:text-sm'>
            {stars.map((s, i) => (
              <span key={i}>{s}</span>
            ))}
          </div>
          <span className='text-subtle text-xs'>({reviewCount} reviews)</span>
        </div>

        {/* Description */}
        <p className='text-subtle text-xs sm:text-sm leading-snug line-clamp-2'>{description}</p>

        {/* Price Section */}
        <div className='text-sm sm:text-base leading-snug'>
          <span className='font-bold text-base sm:text-lg'>{formatPrice(price)}</span>
          {originalPrice > price && (
            <>
              <span className='line-through text-subtle text-xs sm:text-sm ml-2'>
                {formatPrice(originalPrice)}
              </span>
              <span className='text-xs text-green-700 dark:text-green-400 ml-1'>
                (You save {formatPrice(originalPrice - price)})
              </span>
            </>
          )}
        </div>

        {/* Buttons */}
        <div className='flex gap-2 mt-auto'>
          <Button
            variant='secondary'
            animated={true}
            className='w-4/5 text-xs sm:text-sm'
            onClick={onViewDetails}
            size='lg'>
            View Details
          </Button>
          <Button
            variant='primary'
            className='w-1/5 p-0 flex items-center justify-center'
            onClick={onAddToCart}
            disabled={stock === 0}
            animated={true}
            size='lg'
            title={stock === 0 ? "Out of stock" : undefined}>
            <ShoppingCart className='w-4 h-4 sm:w-5 sm:h-5' />
          </Button>
        </div>

        {/* Footer Note */}
        <p className='text-subtle text-[0.7rem] sm:text-[0.75rem] mt-2 leading-tight'>
          * Discount valid until {discountValidUntil}. See{" "}
          <a href='#' className='text-ideas-accent hover:text-ideas-accentHover'>
            terms
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
