import { useState, useEffect } from "react";
import Button from "./Button";
import Image from "./Image";
import { ChevronLeft, ChevronRight } from "lucide-react";
/**
 * HeroCarousel component
 *
 * Reusable full-screen carousel with responsive background images,
 * centered content (title, subtitle, CTAs), and optional autoplay.
 * Compatible with Tailwind CSS + Ideal Photography theme.
 *
 * @component
 * @param {Object[]} props.slides - Array of slide objects
 * @param {string} props.slides[].title - Slide title
 * @param {string} props.slides[].subtitle - Slide subtitle
 * @param {Object[]} props.slides[].ctas - Call-to-action buttons
 * @param {Object} props.slides[].images - Image sources for different breakpoints
 * @param {string} props.slides[].images.base - Base image source
 * @param {string} [props.slides[].images.mobile] - Mobile image source
 * @param {string} [props.slides[].images.tablet] - Tablet image source
 * @param {string} [props.slides[].images.desktop] - Desktop image source
 * @param {number} [props.slides[].blur=20] - Custom blur value for this slide (0-100)
 * @param {boolean} [props.autoPlay=false] - Enable autoplay
 * @param {number} [props.interval=8000] - Autoplay interval in milliseconds
 * @param {string} [props.className] - Additional CSS classes
 *
 * @example
 * ```jsx
 * <HeroCarousel
 *   slides={slides}
 *   autoPlay={true}
 *   interval={7000}
 *   className="custom-hero"
 * />
 * ```
 */
const HeroCarousel = ({ slides = [], autoPlay = false, interval = 8000, className = "" }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(new Set());

  /** Change slide index with wrap-around logic */
  const changeSlide = (direction) => {
    const nextIndex = (currentSlide + direction + slides.length) % slides.length;
    setCurrentSlide(nextIndex);
  };

  /** Handle image load */
  const handleImageLoad = (slideIndex) => {
    setImagesLoaded((prev) => new Set(prev).add(slideIndex));
  };

  /** Optional autoplay logic */
  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => changeSlide(1), interval);
    return () => clearInterval(timer);
  }, [currentSlide, autoPlay, interval]);

  return (
    <section className={`relative h-[100dvh] w-full overflow-hidden ${className}`}>
      {slides.map((slide, index) => {
        const isCurrentSlide = index === currentSlide;
        const isLoaded = imagesLoaded.has(index);
        const blurValue = slide.blur || 20; // Default blur of 20

        return (
          <div
            key={slide.id || index}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              isCurrentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}>
            {/* Background Image */}
            <Image
              src={
                slide.images?.base ||
                slide.images?.desktop ||
                slide.images?.tablet ||
                slide.images?.mobile
              }
              alt={slide.title || `Slide ${index + 1}`}
              className={`w-full h-full object-cover transition-opacity duration-500 ${
                isLoaded ? "opacity-100" : "opacity-0"
              }`}
              asPicture={true}
              sources={{
                mobile: slide.images?.mobile,
                tablet: slide.images?.tablet,
                desktop: slide.images?.desktop,
              }}
              loading={index === 0 ? "eager" : "lazy"}
              onLoad={() => handleImageLoad(index)}
            />

            {/* Content Overlay */}
            <div
              className='absolute inset-0 flex flex-col items-center justify-center px-6 text-center'
              style={{
                backgroundColor: `rgba(0, 0, 0, 0.5)`,
                backdropFilter: `blur(${blurValue}px)`,
                WebkitBackdropFilter: `blur(${blurValue}px)`,
              }}>
              <h1 className='text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4 text-white'>
                {slide.title}
              </h1>
              <p className='text-lg md:text-xl max-w-2xl mb-8 leading-relaxed text-gray-100'>
                {slide.subtitle}
              </p>
              <div className='flex flex-wrap justify-center gap-4'>
                {slide.ctas?.map((cta, i) => (
                  <Button
                    key={i}
                    href={cta.href}
                    variant={cta.variant}
                    size='lg'
                    animated={cta.variant === "primary"}
                    leftIcon={cta.leftIcon}>
                    {cta.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        );
      })}

      {/* Manual Controls */}
      <div className='absolute bottom-24 left-1/2 transform -translate-x-1/2 z-20 flex gap-6'>
        <button
          onClick={() => changeSlide(-1)}
          className='text-2xl px-4 py-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all duration-200 text-white'
          aria-label='Previous slide'>
          <ChevronLeft size={20} className='text-white' />
        </button>
        <button
          onClick={() => changeSlide(1)}
          className='text-2xl px-4 py-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-all duration-200 text-white'
          aria-label='Next slide'>
          <ChevronRight size={20} className='text-white' />
        </button>
      </div>

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className='absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20 flex gap-2'>
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide ? "bg-ideas-accent" : "bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default HeroCarousel;
