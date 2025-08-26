import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useInView } from "react-intersection-observer";

/**
 * Reusable Image component with responsive handling and theme compliance
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.src - Primary image source
 * @param {string} [props.srcSet] - Responsive image sources
 * @param {string} [props.sizes] - Image sizes for responsive loading
 * @param {string} props.alt - Alt text for accessibility
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.loading='lazy'] - Loading strategy
 * @param {boolean} [props.asPicture=false] - Render as picture element for art direction
 * @param {Object} [props.sources] - Picture element sources for different breakpoints
 * @param {Function} [props.onLoad] - Image load handler
 * @param {Function} [props.onError] - Image error handler
 * @param {Object} [props.rest] - Additional props passed to img/picture element
 *
 * @example
 * ```jsx
 * // Simple image
 * <Image
 *   src="/images/hero.jpg"
 *   alt="Hero image"
 *   className="w-full h-auto"
 * />
 *
 * // Responsive image with srcSet
 * <Image
 *   src="/images/hero.jpg"
 *   srcSet="/images/hero-mobile.jpg 600w, /images/hero.jpg 1920w"
 *   sizes="(max-width: 767px) 100vw, 1920px"
 *   alt="Responsive hero image"
 *   className="w-full h-auto object-cover"
 * />
 *
 * // Picture element for art direction
 * <Image
 *   src="/images/hero.jpg"
 *   alt="Hero with art direction"
 *   asPicture={true}
 *   sources={{
 *     mobile: "/images/hero-mobile.jpg",
 *     tablet: "/images/hero-tablet.jpg",
 *     desktop: "/images/hero-desktop.jpg"
 *   }}
 *   className="w-full h-full object-cover"
 * />
 * ```
 */
const Image = ({
  src,
  srcSet,
  sizes,
  alt,
  className = "",
  loading = "lazy",
  asPicture = false,
  sources = {},
  onLoad,
  onError,
  placeholder,
  blurDataURL,
  priority = false,
  ...rest
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(priority ? src : placeholder || blurDataURL || "");

  // Use intersection observer for lazy loading (unless priority is true)
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
    skip: priority, // Skip intersection observer for priority images
  });

  // Load image when in view or priority is true
  useEffect(() => {
    if (inView || priority) {
      setImageSrc(src);
    }
  }, [inView, priority, src]);

  const handleLoad = (e) => {
    setImageLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e) => {
    setImageError(true);
    onError?.(e);
  };

  // Common image props
  const imageProps = {
    src: imageSrc,
    alt,
    loading: priority ? "eager" : loading,
    className: `w-full h-auto transition-opacity duration-300 ${
      imageLoaded ? "opacity-100" : "opacity-0"
    } ${className}`.trim(),
    onLoad: handleLoad,
    onError: handleError,
    ...rest,
  };

  // Add srcSet and sizes if provided
  if (srcSet) {
    imageProps.srcSet = srcSet;
  }
  if (sizes) {
    imageProps.sizes = sizes;
  }

  // Error state
  if (imageError) {
    return (
      <div
        ref={ref}
        className={`bg-gray-200 dark:bg-gray-800 flex items-center justify-center ${className}`}
        {...rest}>
        <div className='text-gray-400 dark:text-gray-600 text-center p-4'>
          <svg className='w-8 h-8 mx-auto mb-2' fill='currentColor' viewBox='0 0 20 20'>
            <path
              fillRule='evenodd'
              d='M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z'
              clipRule='evenodd'
            />
          </svg>
          <p className='text-xs'>Failed to load image</p>
        </div>
      </div>
    );
  }

  // Show placeholder while loading
  const showPlaceholder = !imageLoaded && (placeholder || blurDataURL);

  // Render as picture element for art direction
  if (asPicture && Object.keys(sources).length > 0) {
    return (
      <div ref={ref} className='relative'>
        {showPlaceholder && (
          <img
            src={placeholder || blurDataURL}
            alt={alt}
            className={`absolute inset-0 w-full h-auto filter blur-sm ${className}`}
          />
        )}
        <picture className={className}>
          {/* Desktop source */}
          {sources.desktop && <source srcSet={sources.desktop} media='(min-width: 1280px)' />}
          {/* Tablet source */}
          {sources.tablet && <source srcSet={sources.tablet} media='(min-width: 768px)' />}
          {/* Mobile source */}
          {sources.mobile && <source srcSet={sources.mobile} media='(max-width: 767px)' />}
          {/* Fallback image */}
          <img {...imageProps} />
        </picture>
      </div>
    );
  }

  // Render as regular img element
  return (
    <div ref={ref} className='relative'>
      {showPlaceholder && (
        <img
          src={placeholder || blurDataURL}
          alt={alt}
          className={`absolute inset-0 w-full h-auto filter blur-sm ${className}`}
        />
      )}
      <img {...imageProps} />
    </div>
  );
};

// PropTypes for runtime validation
Image.propTypes = {
  src: PropTypes.string.isRequired,
  srcSet: PropTypes.string,
  sizes: PropTypes.string,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  loading: PropTypes.oneOf(["lazy", "eager"]),
  asPicture: PropTypes.bool,
  sources: PropTypes.shape({
    mobile: PropTypes.string,
    tablet: PropTypes.string,
    desktop: PropTypes.string,
  }),
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  placeholder: PropTypes.string,
  blurDataURL: PropTypes.string,
  priority: PropTypes.bool,
};

export default Image;
