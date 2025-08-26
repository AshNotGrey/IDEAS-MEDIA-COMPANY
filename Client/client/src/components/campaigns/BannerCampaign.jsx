import React, { useCallback } from "react";
import { useCampaignContext } from "../../contexts/CampaignContext";

const BannerCampaign = ({ campaign, placement, options = {} }) => {
  const { trackClick, trackConversion } = useCampaignContext();

  const {
    bannerStyle = "standard",
    showCloseButton = false,
    closeButtonPosition = "top-right",
    autoClose = false,
    autoCloseDelay = 5000,
    responsive = true,
    animation = "fade-in",
  } = options;

  // Get campaign data
  const images = campaign.images || [];
  const ctas = campaign.ctas || [];
  const customCss = campaign.settings?.customCss;
  const customJs = campaign.settings?.customJs;

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

  // Handle close button click
  const handleClose = useCallback(() => {
    // Hide the banner (this would typically be handled by parent component)
    console.log("Banner close clicked");
  }, []);

  // Get banner classes based on style
  const getBannerClasses = () => {
    const baseClasses = "banner-campaign relative overflow-hidden";

    switch (bannerStyle) {
      case "hero":
        return `${baseClasses} min-h-[400px]`;
      case "large":
        return `${baseClasses} min-h-[300px]`;
      case "medium":
        return `${baseClasses} min-h-[200px]`;
      case "small":
        return `${baseClasses} min-h-[100px]`;
      case "sidebar":
        return `${baseClasses} min-h-[400px] max-w-[300px]`;
      case "footer":
        return `${baseClasses} min-h-[150px]`;
      default:
        return `${baseClasses} min-h-[200px]`;
    }
  };

  // Get animation classes
  const getAnimationClasses = () => {
    switch (animation) {
      case "slide-in":
        return "animate-slide-in";
      case "bounce-in":
        return "animate-bounce-in";
      case "zoom-in":
        return "animate-zoom-in";
      case "fade-in":
      default:
        return "animate-fade-in";
    }
  };

  // Render banner content based on style
  const renderBannerContent = () => {
    const hasImage = images.length > 0;
    const hasText = campaign.title || campaign.description;
    const hasCTAs = ctas.length > 0;

    switch (bannerStyle) {
      case "hero":
        return (
          <div className='relative w-full h-full'>
            {/* Background Image */}
            {hasImage && (
              <div
                className='absolute inset-0 bg-cover bg-center bg-no-repeat'
                style={{ backgroundImage: `url(${images[0].url})` }}
              />
            )}

            {/* Overlay */}
            <div className='absolute inset-0 bg-black bg-opacity-40' />

            {/* Content */}
            <div className='relative z-10 flex items-center justify-center h-full px-6'>
              <div className='text-center text-white max-w-4xl'>
                {campaign.title && (
                  <h2 className='text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg'>
                    {campaign.title}
                  </h2>
                )}

                {campaign.description && (
                  <p className='text-lg md:text-xl mb-6 drop-shadow-lg'>{campaign.description}</p>
                )}

                {hasCTAs && (
                  <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                    {ctas
                      .filter((cta) => cta.isActive)
                      .map((cta, index) => (
                        <button
                          key={cta.id || index}
                          onClick={() => handleCTAClick(cta)}
                          className='px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 hover:scale-105 transform'>
                          {cta.text}
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "sidebar":
        return (
          <div className='p-4 h-full'>
            {hasImage && (
              <div className='mb-4'>
                <img
                  src={images[0].url}
                  alt={images[0].alt || campaign.title}
                  className='w-full h-32 object-cover rounded-lg'
                />
              </div>
            )}

            {campaign.title && (
              <h3 className='text-lg font-semibold mb-2 text-gray-900'>{campaign.title}</h3>
            )}

            {campaign.description && (
              <p className='text-sm text-gray-600 mb-4'>{campaign.description}</p>
            )}

            {hasCTAs && (
              <div className='space-y-2'>
                {ctas
                  .filter((cta) => cta.isActive)
                  .map((cta, index) => (
                    <button
                      key={cta.id || index}
                      onClick={() => handleCTAClick(cta)}
                      className='w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors duration-200'>
                      {cta.text}
                    </button>
                  ))}
              </div>
            )}
          </div>
        );

      case "footer":
        return (
          <div className='p-4 flex items-center justify-between'>
            <div className='flex-1'>
              {campaign.title && (
                <h3 className='text-lg font-semibold text-gray-900 mb-1'>{campaign.title}</h3>
              )}

              {campaign.description && (
                <p className='text-sm text-gray-600'>{campaign.description}</p>
              )}
            </div>

            {hasCTAs && (
              <div className='flex gap-2 ml-4'>
                {ctas
                  .filter((cta) => cta.isActive)
                  .map((cta, index) => (
                    <button
                      key={cta.id || index}
                      onClick={() => handleCTAClick(cta)}
                      className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors duration-200'>
                      {cta.text}
                    </button>
                  ))}
              </div>
            )}
          </div>
        );

      default: // standard
        return (
          <div className='p-4 flex items-center'>
            {hasImage && (
              <div className='mr-4 flex-shrink-0'>
                <img
                  src={images[0].url}
                  alt={images[0].alt || campaign.title}
                  className='w-16 h-16 object-cover rounded-lg'
                />
              </div>
            )}

            <div className='flex-1'>
              {campaign.title && (
                <h3 className='text-lg font-semibold text-gray-900 mb-1'>{campaign.title}</h3>
              )}

              {campaign.description && (
                <p className='text-sm text-gray-600'>{campaign.description}</p>
              )}
            </div>

            {hasCTAs && (
              <div className='ml-4 flex gap-2'>
                {ctas
                  .filter((cta) => cta.isActive)
                  .map((cta, index) => (
                    <button
                      key={cta.id || index}
                      onClick={() => handleCTAClick(cta)}
                      className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors duration-200'>
                      {cta.text}
                    </button>
                  ))}
              </div>
            )}
          </div>
        );
    }
  };

  // Render close button
  const renderCloseButton = () => {
    if (!showCloseButton) return null;

    const positionClasses = {
      "top-left": "top-2 left-2",
      "top-right": "top-2 right-2",
      "bottom-left": "bottom-2 left-2",
      "bottom-right": "bottom-2 right-2",
    };

    return (
      <button
        onClick={handleClose}
        className={`absolute ${positionClasses[closeButtonPosition]} z-20 p-2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full transition-all duration-200 hover:scale-110`}
        aria-label='Close banner'>
        <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M6 18L18 6M6 6l12 12'
          />
        </svg>
      </button>
    );
  };

  // Don't render if no content
  if (!campaign.title && !campaign.description && images.length === 0) {
    return null;
  }

  return (
    <div
      className={`${getBannerClasses()} ${getAnimationClasses()}`}
      style={customCss ? { ...JSON.parse(customCss) } : {}}
      data-campaign-id={campaign.id}
      data-placement={placement}
      data-banner-style={bannerStyle}
      role='banner'
      aria-label={campaign.title || "Campaign banner"}>
      {/* Close Button */}
      {renderCloseButton()}

      {/* Banner Content */}
      {renderBannerContent()}

      {/* Custom JavaScript */}
      {customJs && <script dangerouslySetInnerHTML={{ __html: customJs }} />}
    </div>
  );
};

export default BannerCampaign;
