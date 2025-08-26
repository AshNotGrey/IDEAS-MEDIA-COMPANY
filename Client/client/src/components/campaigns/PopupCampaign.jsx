import React, { useState, useEffect, useRef, useCallback } from "react";
import { XIcon } from "lucide-react";
import { useCampaignContext } from "../../contexts/CampaignContext";

const PopupCampaign = ({ campaign, placement, options = {} }) => {
  const { trackClick, trackConversion } = useCampaignContext();

  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const popupRef = useRef(null);
  const triggerRef = useRef(null);
  const timeoutRef = useRef(null);

  const {
    triggerType = "time-delay",
    triggerDelay = 3000,
    triggerScroll = 50,
    triggerClick = false,
    triggerElement = null,
    showCloseButton = true,
    closeButtonPosition = "top-right",
    autoClose = false,
    autoCloseDelay = 10000,
    backdropClose = true,
    escapeClose = true,
    animation = "fade-scale",
    position = "center",
    size = "medium",
    responsive = true,
  } = options;

  // Get campaign data
  const images = campaign.images || [];
  const ctas = campaign.ctas || [];
  const customCss = campaign.settings?.customCss;
  const customJs = campaign.settings?.customJs;

  // Show popup
  const showPopup = useCallback(() => {
    if (isVisible) return;

    setIsVisible(true);
    setIsClosing(false);

    // Focus management
    if (popupRef.current) {
      popupRef.current.focus();
    }

    // Prevent body scroll
    document.body.style.overflow = "hidden";
  }, [isVisible]);

  // Hide popup
  const hidePopup = useCallback(() => {
    if (!isVisible) return;

    setIsClosing(true);

    // Allow body scroll
    document.body.style.overflow = "";

    // Wait for animation to complete
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 300);
  }, [isVisible]);

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

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e) => {
      if (backdropClose && e.target === e.currentTarget) {
        hidePopup();
      }
    },
    [backdropClose, hidePopup]
  );

  // Handle escape key
  const handleKeyDown = useCallback(
    (e) => {
      if (escapeClose && e.key === "Escape") {
        hidePopup();
      }
    },
    [escapeClose, hidePopup]
  );

  // Auto-close functionality
  useEffect(() => {
    if (autoClose && isVisible && !isClosing) {
      timeoutRef.current = setTimeout(() => {
        hidePopup();
      }, autoCloseDelay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [autoClose, autoCloseDelay, isVisible, isClosing, hidePopup]);

  // Trigger conditions
  useEffect(() => {
    let triggerTimeout;
    let scrollHandler;
    let clickHandler;

    switch (triggerType) {
      case "time-delay":
        triggerTimeout = setTimeout(() => {
          showPopup();
        }, triggerDelay);
        break;

      case "scroll":
        scrollHandler = () => {
          const scrollPercent =
            (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
          if (scrollPercent >= triggerScroll) {
            showPopup();
            window.removeEventListener("scroll", scrollHandler);
          }
        };
        window.addEventListener("scroll", scrollHandler);
        break;

      case "click":
        if (triggerElement) {
          const element = document.querySelector(triggerElement);
          if (element) {
            clickHandler = () => showPopup();
            element.addEventListener("click", clickHandler);
          }
        }
        break;

      case "exit-intent":
        const handleMouseLeave = (e) => {
          if (e.clientY <= 0) {
            showPopup();
            document.removeEventListener("mouseleave", handleMouseLeave);
          }
        };
        document.addEventListener("mouseleave", handleMouseLeave);
        break;

      default:
        break;
    }

    return () => {
      if (triggerTimeout) clearTimeout(triggerTimeout);
      if (scrollHandler) window.removeEventListener("scroll", scrollHandler);
      if (clickHandler && triggerElement) {
        const element = document.querySelector(triggerElement);
        if (element) element.removeEventListener("click", clickHandler);
      }
    };
  }, [triggerType, triggerDelay, triggerScroll, triggerElement, showPopup]);

  // Get popup classes based on size and position
  const getPopupClasses = () => {
    const baseClasses =
      "popup-campaign bg-white rounded-lg shadow-2xl transform transition-all duration-300";

    // Size classes
    const sizeClasses = {
      small: "max-w-sm",
      medium: "max-w-md",
      large: "max-w-lg",
      xlarge: "max-w-xl",
      full: "max-w-full mx-4",
    };

    // Position classes
    const positionClasses = {
      center: "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
      top: "top-4 left-1/2 transform -translate-x-1/2",
      bottom: "bottom-4 left-1/2 transform -translate-x-1/2",
      left: "top-1/2 left-4 transform -translate-y-1/2",
      right: "top-1/2 right-4 transform -translate-y-1/2",
    };

    // Animation classes
    const animationClasses = {
      "fade-scale": isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100",
      "slide-up": isClosing ? "translate-y-4 opacity-0" : "translate-y-0 opacity-100",
      "slide-down": isClosing ? "-translate-y-4 opacity-0" : "translate-y-0 opacity-100",
      "slide-left": isClosing ? "translate-x-4 opacity-0" : "translate-x-0 opacity-100",
      "slide-right": isClosing ? "-translate-x-4 opacity-0" : "translate-x-0 opacity-100",
    };

    return `${baseClasses} ${sizeClasses[size]} ${positionClasses[position]} ${animationClasses[animation]}`;
  };

  // Render popup content
  const renderPopupContent = () => {
    const hasImage = images.length > 0;
    const hasText = campaign.title || campaign.description;
    const hasCTAs = ctas.length > 0;

    return (
      <div className='p-6'>
        {/* Image */}
        {hasImage && (
          <div className='mb-4'>
            <img
              src={images[0].url}
              alt={images[0].alt || campaign.title}
              className='w-full h-48 object-cover rounded-lg'
            />
          </div>
        )}

        {/* Title */}
        {campaign.title && (
          <h2 className='text-2xl font-bold text-gray-900 mb-3'>{campaign.title}</h2>
        )}

        {/* Description */}
        {campaign.description && (
          <p className='text-gray-600 mb-6 leading-relaxed'>{campaign.description}</p>
        )}

        {/* CTAs */}
        {hasCTAs && (
          <div className='flex flex-col sm:flex-row gap-3'>
            {ctas
              .filter((cta) => cta.isActive)
              .map((cta, index) => (
                <button
                  key={cta.id || index}
                  onClick={() => handleCTAClick(cta)}
                  className={`
                    flex-1 px-6 py-3 rounded-lg font-semibold transition-all duration-200
                    ${
                      cta.type === "primary"
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-900"
                    }
                    hover:scale-105 transform
                  `}>
                  {cta.text}
                </button>
              ))}
          </div>
        )}
      </div>
    );
  };

  // Render close button
  const renderCloseButton = () => {
    if (!showCloseButton) return null;

    const positionClasses = {
      "top-left": "top-4 left-4",
      "top-right": "top-4 right-4",
      "bottom-left": "bottom-4 left-4",
      "bottom-right": "bottom-4 right-4",
    };

    return (
      <button
        onClick={hidePopup}
        className={`absolute ${positionClasses[closeButtonPosition]} z-30 p-2 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-full transition-all duration-200 hover:scale-110`}
        aria-label='Close popup'>
        <XIcon className='w-5 h-5' />
      </button>
    );
  };

  // Don't render if no content
  if (!campaign.title && !campaign.description && images.length === 0) {
    return null;
  }

  if (!isVisible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300'
        onClick={handleBackdropClick}
        aria-hidden='true'
      />

      {/* Popup */}
      <div
        ref={popupRef}
        className={`fixed z-50 ${getPopupClasses()}`}
        style={customCss ? { ...JSON.parse(customCss) } : {}}
        tabIndex={-1}
        role='dialog'
        aria-modal='true'
        aria-labelledby={campaign.title ? "popup-title" : undefined}
        aria-describedby={campaign.description ? "popup-description" : undefined}
        onKeyDown={handleKeyDown}
        data-campaign-id={campaign.id}
        data-placement={placement}
        data-popup-size={size}
        data-popup-position={position}>
        {/* Close Button */}
        {renderCloseButton()}

        {/* Popup Content */}
        {renderPopupContent()}

        {/* Custom JavaScript */}
        {customJs && <script dangerouslySetInnerHTML={{ __html: customJs }} />}
      </div>

      {/* Accessibility */}
      <div className='sr-only'>
        <div>Popup campaign: {campaign.title || "Campaign popup"}</div>
        {campaign.description && <div>Description: {campaign.description}</div>}
        <div>Press Escape to close</div>
      </div>
    </>
  );
};

export default PopupCampaign;
