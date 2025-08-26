import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlayIcon,
  PauseIcon,
} from "@heroicons/react/24/outline";
import { useCampaignContext } from "../../contexts/CampaignContext";

const HeroCarousel = ({ campaign, placement, options = {} }) => {
  const { trackClick, trackConversion } = useCampaignContext();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const carouselRef = useRef(null);
  const intervalRef = useRef(null);
  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);

  const {
    autoPlay = true,
    autoPlaySpeed = 5000,
    showNavigation = true,
    showIndicators = true,
    showPauseButton = true,
    pauseOnHover = true,
    touchEnabled = true,
  } = options;

  // Get campaign images and CTAs
  const images = campaign.images || [];
  const ctas = campaign.ctas || [];

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && images.length > 1 && !isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % images.length);
      }, autoPlaySpeed);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoPlay, autoPlaySpeed, images.length, isPaused]);

  // Pause on hover
  const handleMouseEnter = useCallback(() => {
    if (pauseOnHover) {
      setIsPaused(true);
    }
  }, [pauseOnHover]);

  const handleMouseLeave = useCallback(() => {
    if (pauseOnHover) {
      setIsPaused(false);
    }
  }, [pauseOnHover]);

  // Navigation functions
  const goToSlide = useCallback((index) => {
    setCurrentSlide(index);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Play/Pause functionality
  const togglePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
    setIsPaused(!isPlaying);
  }, [isPlaying]);

  // Touch/swipe functionality
  const handleTouchStart = useCallback(
    (e) => {
      if (!touchEnabled) return;
      touchStartRef.current = e.touches[0].clientX;
    },
    [touchEnabled]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (!touchEnabled) return;
      touchEndRef.current = e.touches[0].clientX;
    },
    [touchEnabled]
  );

  const handleTouchEnd = useCallback(() => {
    if (!touchEnabled || !touchStartRef.current || !touchEndRef.current) return;

    const touchDiff = touchStartRef.current - touchEndRef.current;
    const minSwipeDistance = 50;

    if (Math.abs(touchDiff) > minSwipeDistance) {
      if (touchDiff > 0) {
        nextSlide(); // Swipe left
      } else {
        prevSlide(); // Swipe right
      }
    }

    touchStartRef.current = null;
    touchEndRef.current = null;
  }, [touchEnabled, nextSlide, prevSlide]);

  // Handle CTA click
  const handleCTAClick = useCallback(
    (cta) => {
      if (!cta.isActive) return;

      // Track click
      trackClick(campaign.id, cta.id, placement);

      // Handle CTA action
      if (cta.type === "link" && cta.url) {
        window.open(cta.url, cta.target || "_blank");
      } else if (cta.type === "form") {
        // Handle form submission
        console.log("Form CTA clicked:", cta);
      } else if (cta.type === "phone") {
        // Handle phone call
        window.location.href = `tel:${cta.url}`;
      }

      // Track conversion if applicable
      if (cta.trackConversion) {
        trackConversion(campaign.id, cta.conversionValue || 0, placement);
      }
    },
    [campaign.id, placement, trackClick, trackConversion]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "ArrowLeft":
          prevSlide();
          break;
        case "ArrowRight":
          nextSlide();
          break;
        case " ":
          e.preventDefault();
          togglePlayPause();
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [prevSlide, nextSlide, togglePlayPause]);

  // Don't render if no images
  if (images.length === 0) {
    return null;
  }

  return (
    <div
      ref={carouselRef}
      className='hero-carousel relative w-full overflow-hidden'
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role='region'
      aria-label={`${campaign.title} carousel`}>
      {/* Carousel Container */}
      <div className='relative w-full h-full'>
        {images.map((image, index) => (
          <div
            key={image.id || index}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={index !== currentSlide}>
            {/* Background Image */}
            <div
              className='w-full h-full bg-cover bg-center bg-no-repeat'
              style={{
                backgroundImage: `url(${image.url})`,
                minHeight: "400px",
              }}
            />

            {/* Image Overlay */}
            <div className='absolute inset-0 bg-black bg-opacity-30' />

            {/* Content Overlay */}
            <div className='absolute inset-0 flex items-center justify-center'>
              <div className='text-center text-white px-6 max-w-4xl'>
                {/* Campaign Title */}
                {campaign.title && (
                  <h2 className='text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg'>
                    {campaign.title}
                  </h2>
                )}

                {/* Campaign Description */}
                {campaign.description && (
                  <p className='text-lg md:text-xl mb-8 drop-shadow-lg'>{campaign.description}</p>
                )}

                {/* CTA Buttons */}
                {ctas.length > 0 && (
                  <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                    {ctas
                      .filter((cta) => cta.isActive)
                      .map((cta, ctaIndex) => (
                        <button
                          key={cta.id || ctaIndex}
                          onClick={() => handleCTAClick(cta)}
                          className={`
                            px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200
                            ${
                              cta.type === "primary"
                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                : "bg-white hover:bg-gray-100 text-gray-900"
                            }
                            hover:scale-105 transform
                          `}>
                          {cta.text}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showNavigation && images.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className='absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-200 hover:scale-110'
            aria-label='Previous slide'>
            <ChevronLeftIcon className='h-6 w-6' />
          </button>

          <button
            onClick={nextSlide}
            className='absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-200 hover:scale-110'
            aria-label='Next slide'>
            <ChevronRightIcon className='h-6 w-6' />
          </button>
        </>
      )}

      {/* Play/Pause Button */}
      {showPauseButton && images.length > 1 && (
        <button
          onClick={togglePlayPause}
          className='absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all duration-200'
          aria-label={isPlaying ? "Pause carousel" : "Play carousel"}>
          {isPlaying ? <PauseIcon className='h-5 w-5' /> : <PlayIcon className='h-5 w-5' />}
        </button>
      )}

      {/* Slide Indicators */}
      {showIndicators && images.length > 1 && (
        <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2'>
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide
                  ? "bg-white scale-125"
                  : "bg-white bg-opacity-50 hover:bg-opacity-75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentSlide}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {autoPlay && images.length > 1 && (
        <div className='absolute bottom-0 left-0 w-full h-1 bg-black bg-opacity-30'>
          <div
            className='h-full bg-white transition-all duration-100 ease-linear'
            style={{
              width: `${((currentSlide + 1) / images.length) * 100}%`,
            }}
          />
        </div>
      )}

      {/* Accessibility */}
      <div className='sr-only'>
        <div>Carousel with {images.length} slides</div>
        <div>
          Current slide: {currentSlide + 1} of {images.length}
        </div>
        {campaign.title && <div>Campaign: {campaign.title}</div>}
        {campaign.description && <div>Description: {campaign.description}</div>}
      </div>
    </div>
  );
};

export default HeroCarousel;
