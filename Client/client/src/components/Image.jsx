import React from "react";
import PropTypes from "prop-types";

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
  ...rest
}) => {
  // Common image props
  const imageProps = {
    src,
    alt,
    loading,
    className: `w-full h-auto ${className}`.trim(),
    onLoad,
    onError,
    ...rest,
  };

  // Add srcSet and sizes if provided
  if (srcSet) {
    imageProps.srcSet = srcSet;
  }
  if (sizes) {
    imageProps.sizes = sizes;
  }

  // Render as picture element for art direction
  if (asPicture && Object.keys(sources).length > 0) {
    return (
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
    );
  }

  // Render as regular img element
  return <img {...imageProps} />;
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
};

export default Image;
