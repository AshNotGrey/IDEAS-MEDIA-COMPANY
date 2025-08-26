import React, { useEffect, useRef, useCallback } from "react";
import { useCampaignContext } from "../../contexts/CampaignContext";

const ThemeOverride = ({ campaign, placement, options = {} }) => {
  const { trackClick, trackConversion } = useCampaignContext();

  const themeRef = useRef(null);
  const styleRef = useRef(null);
  const scriptRef = useRef(null);

  const {
    applyToBody = true,
    applyToHead = false,
    priority = "normal",
    scope = "global",
    responsive = true,
    animation = "fade-in",
  } = options;

  // Get campaign data
  const customCss = campaign.settings?.customCss;
  const customJs = campaign.settings?.customJs;
  const ctas = campaign.ctas || [];

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

  // Apply CSS custom properties
  const applyCSSVariables = useCallback(() => {
    if (!customCss) return;

    try {
      const cssData = typeof customCss === "string" ? JSON.parse(customCss) : customCss;

      if (cssData.cssVariables) {
        const root = document.documentElement;
        Object.entries(cssData.cssVariables).forEach(([key, value]) => {
          root.style.setProperty(`--${key}`, value);
        });
      }
    } catch (error) {
      console.error("Error applying CSS variables:", error);
    }
  }, [customCss]);

  // Apply custom styles
  const applyCustomStyles = useCallback(() => {
    if (!customCss) return;

    try {
      const cssData = typeof customCss === "string" ? JSON.parse(customCss) : customCss;

      if (cssData.styles) {
        // Create style element
        const styleElement = document.createElement("style");
        styleElement.id = `campaign-theme-${campaign.id}`;
        styleElement.setAttribute("data-campaign-id", campaign.id);
        styleElement.setAttribute("data-placement", placement);

        // Add CSS content
        let cssContent = "";

        if (cssData.styles.global) {
          cssContent += cssData.styles.global;
        }

        if (cssData.styles.responsive && responsive) {
          cssContent += cssData.styles.responsive;
        }

        if (cssData.styles.animations && animation !== "none") {
          cssContent += cssData.styles.animations;
        }

        styleElement.textContent = cssContent;

        // Insert into DOM
        if (applyToHead) {
          document.head.appendChild(styleElement);
        } else {
          document.body.appendChild(styleElement);
        }

        styleRef.current = styleElement;
      }
    } catch (error) {
      console.error("Error applying custom styles:", error);
    }
  }, [customCss, campaign.id, placement, responsive, animation, applyToHead]);

  // Apply custom JavaScript
  const applyCustomJavaScript = useCallback(() => {
    if (!customJs) return;

    try {
      const jsData = typeof customJs === "string" ? JSON.parse(customJs) : customJs;

      if (jsData.script) {
        // Create script element
        const scriptElement = document.createElement("script");
        scriptElement.id = `campaign-script-${campaign.id}`;
        scriptElement.setAttribute("data-campaign-id", campaign.id);
        scriptElement.setAttribute("data-placement", placement);
        scriptElement.setAttribute("type", "text/javascript");

        // Add JavaScript content
        scriptElement.textContent = jsData.script;

        // Insert into DOM
        if (applyToHead) {
          document.head.appendChild(scriptElement);
        } else {
          document.body.appendChild(scriptElement);
        }

        scriptRef.current = scriptElement;
      }
    } catch (error) {
      console.error("Error applying custom JavaScript:", error);
    }
  }, [customJs, campaign.id, placement, applyToHead]);

  // Apply theme overrides
  useEffect(() => {
    // Apply CSS variables first
    applyCSSVariables();

    // Apply custom styles
    applyCustomStyles();

    // Apply custom JavaScript
    applyCustomJavaScript();

    // Cleanup function
    return () => {
      // Remove custom styles
      if (styleRef.current && styleRef.current.parentNode) {
        styleRef.current.parentNode.removeChild(styleRef.current);
      }

      // Remove custom script
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
      }

      // Reset CSS variables if needed
      if (customCss) {
        try {
          const cssData = typeof customCss === "string" ? JSON.parse(customCss) : customCss;
          if (cssData.cssVariables) {
            const root = document.documentElement;
            Object.keys(cssData.cssVariables).forEach((key) => {
              root.style.removeProperty(`--${key}`);
            });
          }
        } catch (error) {
          console.error("Error cleaning up CSS variables:", error);
        }
      }
    };
  }, [customCss, customJs, applyCSSVariables, applyCustomStyles, applyCustomJavaScript]);

  // Get theme classes based on options
  const getThemeClasses = () => {
    const baseClasses = "theme-override";

    // Priority classes
    const priorityClasses = {
      low: "z-10",
      normal: "z-20",
      high: "z-30",
      critical: "z-40",
    };

    // Scope classes
    const scopeClasses = {
      global: "w-full",
      container: "max-w-7xl mx-auto",
      section: "w-full",
      component: "w-auto",
    };

    // Animation classes
    const animationClasses = {
      "fade-in": "animate-fade-in",
      "slide-in": "animate-slide-in",
      "scale-in": "animate-scale-in",
      none: "",
    };

    return `${baseClasses} ${priorityClasses[priority]} ${scopeClasses[scope]} ${animationClasses[animation]}`;
  };

  // Render theme override content
  const renderThemeContent = () => {
    const hasContent = campaign.title || campaign.description || ctas.length > 0;

    if (!hasContent) return null;

    return (
      <div className='p-4'>
        {/* Title */}
        {campaign.title && (
          <h2 className='text-xl font-semibold text-gray-900 mb-2'>{campaign.title}</h2>
        )}

        {/* Description */}
        {campaign.description && <p className='text-gray-600 mb-4'>{campaign.description}</p>}

        {/* CTAs */}
        {ctas.length > 0 && (
          <div className='flex flex-wrap gap-3'>
            {ctas
              .filter((cta) => cta.isActive)
              .map((cta, index) => (
                <button
                  key={cta.id || index}
                  onClick={() => handleCTAClick(cta)}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-all duration-200
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

  // Don't render if no custom CSS or JS
  if (!customCss && !customJs && !campaign.title && !campaign.description && ctas.length === 0) {
    return null;
  }

  return (
    <div
      ref={themeRef}
      className={getThemeClasses()}
      data-campaign-id={campaign.id}
      data-placement={placement}
      data-theme-priority={priority}
      data-theme-scope={scope}
      role='complementary'
      aria-label={campaign.title || "Theme override"}>
      {/* Theme Content */}
      {renderThemeContent()}

      {/* Hidden elements for CSS targeting */}
      <div
        className='campaign-theme-root'
        data-campaign-id={campaign.id}
        data-placement={placement}
        style={{ display: "none" }}
      />

      {/* Accessibility */}
      <div className='sr-only'>
        <div>Theme override: {campaign.title || "Campaign theme"}</div>
        {campaign.description && <div>Description: {campaign.description}</div>}
        <div>Priority: {priority}</div>
        <div>Scope: {scope}</div>
        {customCss && <div>Custom CSS applied</div>}
        {customJs && <div>Custom JavaScript applied</div>}
      </div>
    </div>
  );
};

export default ThemeOverride;
