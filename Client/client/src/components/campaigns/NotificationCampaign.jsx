import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  XMarkIcon,
  BellIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useCampaignContext } from "../../contexts/CampaignContext";

const NotificationCampaign = ({ campaign, placement, options = {} }) => {
  const { trackClick, trackConversion } = useCampaignContext();

  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  const notificationRef = useRef(null);
  const timeoutRef = useRef(null);

  const {
    position = "top",
    style = "info",
    showIcon = true,
    showCloseButton = true,
    autoClose = false,
    autoCloseDelay = 8000,
    sticky = false,
    animation = "slide-down",
    responsive = true,
    maxWidth = "full",
  } = options;

  // Get campaign data
  const images = campaign.images || [];
  const ctas = campaign.ctas || [];
  const customCss = campaign.settings?.customCss;
  const customJs = campaign.settings?.customJs;

  // Hide notification
  const hideNotification = useCallback(() => {
    if (!isVisible) return;

    setIsClosing(true);

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

  // Auto-close functionality
  useEffect(() => {
    if (autoClose && !sticky && isVisible && !isClosing) {
      timeoutRef.current = setTimeout(() => {
        hideNotification();
      }, autoCloseDelay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [autoClose, autoCloseDelay, sticky, isVisible, isClosing, hideNotification]);

  // Get notification classes based on position and style
  const getNotificationClasses = () => {
    const baseClasses =
      "notification-campaign fixed left-0 right-0 z-50 transform transition-all duration-300";

    // Position classes
    const positionClasses = {
      top: "top-0",
      bottom: "bottom-0",
      "top-left": "top-4 left-4 right-auto",
      "top-right": "top-4 right-4 left-auto",
      "bottom-left": "bottom-4 left-4 right-auto",
      "bottom-right": "bottom-4 right-4 left-auto",
    };

    // Style classes
    const styleClasses = {
      info: "bg-blue-600 text-white",
      success: "bg-green-600 text-white",
      warning: "bg-yellow-600 text-white",
      error: "bg-red-600 text-white",
      dark: "bg-gray-900 text-white",
      light: "bg-white text-gray-900 border border-gray-200",
    };

    // Animation classes
    const animationClasses = {
      "slide-down": isClosing ? "-translate-y-full" : "translate-y-0",
      "slide-up": isClosing ? "translate-y-full" : "translate-y-0",
      fade: isClosing ? "opacity-0" : "opacity-100",
      scale: isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100",
    };

    // Max width classes
    const maxWidthClasses = {
      full: "w-full",
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
    };

    return `${baseClasses} ${positionClasses[position]} ${styleClasses[style]} ${animationClasses[animation]} ${maxWidthClasses[maxWidth]}`;
  };

  // Get icon based on style
  const getIcon = () => {
    if (!showIcon) return null;

    const iconClasses = "w-5 h-5 flex-shrink-0";

    switch (style) {
      case "success":
        return <CheckCircleIcon className={iconClasses} />;
      case "warning":
        return <ExclamationTriangleIcon className={iconClasses} />;
      case "error":
        return <ExclamationTriangleIcon className={iconClasses} />;
      case "info":
      default:
        return <InformationCircleIcon className={iconClasses} />;
    }
  };

  // Render notification content
  const renderNotificationContent = () => {
    const hasImage = images.length > 0;
    const hasText = campaign.title || campaign.description;
    const hasCTAs = ctas.length > 0;

    return (
      <div className='flex items-center p-4'>
        {/* Icon */}
        {getIcon()}

        {/* Image */}
        {hasImage && (
          <div className='ml-3 flex-shrink-0'>
            <img
              src={images[0].url}
              alt={images[0].alt || campaign.title}
              className='w-8 h-8 object-cover rounded'
            />
          </div>
        )}

        {/* Content */}
        <div className='ml-3 flex-1 min-w-0'>
          {campaign.title && <h3 className='text-sm font-medium truncate'>{campaign.title}</h3>}

          {campaign.description && (
            <p className='text-sm opacity-90 mt-1 line-clamp-2'>{campaign.description}</p>
          )}
        </div>

        {/* CTAs */}
        {hasCTAs && (
          <div className='ml-4 flex gap-2 flex-shrink-0'>
            {ctas
              .filter((cta) => cta.isActive)
              .map((cta, index) => (
                <button
                  key={cta.id || index}
                  onClick={() => handleCTAClick(cta)}
                  className={`
                    px-3 py-1.5 text-xs font-medium rounded transition-all duration-200
                    ${
                      style === "light"
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-white bg-opacity-20 hover:bg-opacity-30 text-white"
                    }
                    hover:scale-105 transform
                  `}>
                  {cta.text}
                </button>
              ))}
          </div>
        )}

        {/* Close Button */}
        {showCloseButton && (
          <button
            onClick={hideNotification}
            className='ml-3 flex-shrink-0 p-1 rounded-full transition-all duration-200 hover:bg-white hover:bg-opacity-20'
            aria-label='Close notification'>
            <XMarkIcon className='w-4 h-4' />
          </button>
        )}
      </div>
    );
  };

  // Don't render if no content
  if (!campaign.title && !campaign.description && images.length === 0) {
    return null;
  }

  if (!isVisible) return null;

  return (
    <div
      ref={notificationRef}
      className={getNotificationClasses()}
      style={customCss ? { ...JSON.parse(customCss) } : {}}
      role='alert'
      aria-live='polite'
      data-campaign-id={campaign.id}
      data-placement={placement}
      data-notification-style={style}
      data-notification-position={position}>
      {/* Notification Content */}
      {renderNotificationContent()}

      {/* Custom JavaScript */}
      {customJs && <script dangerouslySetInnerHTML={{ __html: customJs }} />}

      {/* Accessibility */}
      <div className='sr-only'>
        <div>Notification: {campaign.title || "Campaign notification"}</div>
        {campaign.description && <div>Description: {campaign.description}</div>}
        <div>Style: {style}</div>
        <div>Position: {position}</div>
      </div>
    </div>
  );
};

export default NotificationCampaign;
