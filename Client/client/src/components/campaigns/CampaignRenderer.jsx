import React, { useEffect, useRef, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { useCampaignContext } from "../../contexts/CampaignContext";
import HeroCarousel from "./HeroCarousel";
import BannerCampaign from "./BannerCampaign";
import PopupCampaign from "./PopupCampaign";
import NotificationCampaign from "./NotificationCampaign";
import ThemeOverride from "./ThemeOverride";

const CampaignRenderer = ({ placement, type = null, className = "", options = {} }) => {
  const {
    activeCampaigns: campaigns,
    loading,
    error,
    fetchActiveCampaigns,
    trackImpression,
    setCampaignVisibility,
    shouldDisplayCampaign,
  } = useCampaignContext();

  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: false,
    rootMargin: "50px",
  });

  const impressionTrackedRef = useRef(new Set());
  const visibilityTimeoutRef = useRef(null);

  // Fetch campaigns when component mounts
  useEffect(() => {
    fetchActiveCampaigns(placement, type);
  }, [placement, type, fetchActiveCampaigns]);

  // Filter campaigns for this placement and type
  const filteredCampaigns = React.useMemo(() => {
    if (!campaigns || campaigns.length === 0) return [];

    let filtered = campaigns.filter((campaign) => campaign.placement === placement);

    // Filter by type if specified
    if (type) {
      filtered = filtered.filter((campaign) => campaign.type === type);
    }

    // Apply display logic
    filtered = filtered.filter((campaign) => shouldDisplayCampaign(campaign));

    // Sort by display order and priority
    filtered.sort((a, b) => {
      const orderDiff = (a.priority || 0) - (b.priority || 0);
      if (orderDiff !== 0) return orderDiff;

      const priorityA = getPriorityValue(a.schedule?.priority);
      const priorityB = getPriorityValue(b.schedule?.priority);
      return priorityB - priorityA;
    });

    return filtered;
  }, [campaigns, placement, type, shouldDisplayCampaign]);

  // Track impression when campaign comes into view
  useEffect(() => {
    if (inView && filteredCampaigns.length > 0) {
      filteredCampaigns.forEach((campaign) => {
        if (!impressionTrackedRef.current.has(campaign.id)) {
          trackImpression(campaign.id, placement);
          impressionTrackedRef.current.add(campaign.id);
        }
      });
    }
  }, [inView, filteredCampaigns, placement, trackImpression]);

  // Set campaign visibility when component mounts
  useEffect(() => {
    filteredCampaigns.forEach((campaign) => {
      setCampaignVisibility(campaign.id, true);
    });

    return () => {
      // Cleanup visibility when component unmounts
      filteredCampaigns.forEach((campaign) => {
        setCampaignVisibility(campaign.id, false);
      });
    };
  }, [filteredCampaigns, setCampaignVisibility]);

  // Handle campaign visibility changes
  useEffect(() => {
    if (visibilityTimeoutRef.current) {
      clearTimeout(visibilityTimeoutRef.current);
    }

    visibilityTimeoutRef.current = setTimeout(() => {
      filteredCampaigns.forEach((campaign) => {
        if (inView) {
          setCampaignVisibility(campaign.id, true);
        } else {
          setCampaignVisibility(campaign.id, false);
        }
      });
    }, 100);

    return () => {
      if (visibilityTimeoutRef.current) {
        clearTimeout(visibilityTimeoutRef.current);
      }
    };
  }, [inView, filteredCampaigns, setCampaignVisibility]);

  // Helper function to get priority value for sorting
  const getPriorityValue = useCallback((priority) => {
    const priorityMap = {
      urgent: 4,
      high: 3,
      normal: 2,
      low: 1,
    };
    return priorityMap[priority] || 0;
  }, []);

  // Render campaign based on type
  const renderCampaign = useCallback(
    (campaign) => {
      const campaignType = campaign.type;

      switch (campaignType) {
        case "hero_carousel":
          return (
            <HeroCarousel
              key={campaign._id}
              campaign={campaign}
              placement={placement}
              options={options}
            />
          );

        case "banner":
          return (
            <BannerCampaign
              key={campaign._id}
              campaign={campaign}
              placement={placement}
              options={options}
            />
          );

        case "popup":
          return (
            <PopupCampaign
              key={campaign._id}
              campaign={campaign}
              placement={placement}
              options={options}
            />
          );

        case "notification":
          return (
            <NotificationCampaign
              key={campaign._id}
              campaign={campaign}
              placement={placement}
              options={options}
            />
          );

        case "theme_override":
          return (
            <ThemeOverride
              key={campaign._id}
              campaign={campaign}
              placement={placement}
              options={options}
            />
          );

        default:
          console.warn(`Unknown campaign type: ${campaignType}`);
          return null;
      }
    },
    [placement, options]
  );

  // Render loading state
  if (loading) {
    return (
      <div className={`campaign-renderer-loading ${className}`}>
        <div className='animate-pulse'>
          <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
          <div className='h-4 bg-gray-200 rounded w-1/2'></div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={`campaign-renderer-error ${className}`}>
        <div className='text-red-600 text-sm'>Error loading campaigns: {error}</div>
      </div>
    );
  }

  // Render no campaigns state
  if (filteredCampaigns.length === 0) {
    return null; // Don't render anything if no campaigns
  }

  // Render campaigns
  return (
    <div
      ref={ref}
      className={`campaign-renderer ${className}`}
      data-placement={placement}
      data-campaign-count={filteredCampaigns.length}>
      {filteredCampaigns.map(renderCampaign)}
    </div>
  );
};

export default CampaignRenderer;
