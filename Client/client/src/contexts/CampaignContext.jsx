import React, { createContext, useContext, useReducer, useCallback } from "react";
import { useApolloClient } from "@apollo/client";
import { gql } from "@apollo/client";

// Campaign Context
const CampaignContext = createContext();

// Campaign State Types
const CAMPAIGN_ACTIONS = {
  SET_ACTIVE_CAMPAIGNS: "SET_ACTIVE_CAMPAIGNS",
  SET_CAMPAIGN_LOADING: "SET_CAMPAIGN_LOADING",
  SET_CAMPAIGN_ERROR: "SET_CAMPAIGN_ERROR",
  UPDATE_CAMPAIGN_ANALYTICS: "UPDATE_CAMPAIGN_ANALYTICS",
  SET_USER_TARGETING_DATA: "SET_USER_TARGETING_DATA",
  SET_CAMPAIGN_VISIBILITY: "SET_CAMPAIGN_VISIBILITY",
  TRACK_CAMPAIGN_IMPRESSION: "TRACK_CAMPAIGN_IMPRESSION",
  TRACK_CAMPAIGN_CLICK: "TRACK_CAMPAIGN_CLICK",
  TRACK_CAMPAIGN_CONVERSION: "TRACK_CAMPAIGN_CONVERSION",
  CLEAR_CAMPAIGN_DATA: "CLEAR_CAMPAIGN_DATA",
};

// Campaign State Reducer
const campaignReducer = (state, action) => {
  switch (action.type) {
    case CAMPAIGN_ACTIONS.SET_ACTIVE_CAMPAIGNS:
      return {
        ...state,
        activeCampaigns: action.payload,
        loading: false,
        error: null,
      };

    case CAMPAIGN_ACTIONS.SET_CAMPAIGN_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case CAMPAIGN_ACTIONS.SET_CAMPAIGN_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case CAMPAIGN_ACTIONS.UPDATE_CAMPAIGN_ANALYTICS:
      return {
        ...state,
        campaignAnalytics: {
          ...state.campaignAnalytics,
          [action.payload.campaignId]: {
            ...state.campaignAnalytics[action.payload.campaignId],
            ...action.payload.data,
          },
        },
      };

    case CAMPAIGN_ACTIONS.SET_USER_TARGETING_DATA:
      return {
        ...state,
        userTargetingData: {
          ...state.userTargetingData,
          ...action.payload,
        },
      };

    case CAMPAIGN_ACTIONS.SET_CAMPAIGN_VISIBILITY:
      return {
        ...state,
        campaignVisibility: {
          ...state.campaignVisibility,
          [action.payload.campaignId]: action.payload.isVisible,
        },
      };

    case CAMPAIGN_ACTIONS.TRACK_CAMPAIGN_IMPRESSION:
      return {
        ...state,
        campaignAnalytics: {
          ...state.campaignAnalytics,
          [action.payload.campaignId]: {
            ...state.campaignAnalytics[action.payload.campaignId],
            impressions: (state.campaignAnalytics[action.payload.campaignId]?.impressions || 0) + 1,
            lastImpression: new Date().toISOString(),
          },
        },
      };

    case CAMPAIGN_ACTIONS.TRACK_CAMPAIGN_CLICK:
      return {
        ...state,
        campaignAnalytics: {
          ...state.campaignAnalytics,
          [action.payload.campaignId]: {
            ...state.campaignAnalytics[action.payload.campaignId],
            clicks: (state.campaignAnalytics[action.payload.campaignId]?.clicks || 0) + 1,
            lastClick: new Date().toISOString(),
          },
        },
      };

    case CAMPAIGN_ACTIONS.TRACK_CAMPAIGN_CONVERSION:
      return {
        ...state,
        campaignAnalytics: {
          ...state.campaignAnalytics,
          [action.payload.campaignId]: {
            ...state.campaignAnalytics[action.payload.campaignId],
            conversions: (state.campaignAnalytics[action.payload.campaignId]?.conversions || 0) + 1,
            lastConversion: new Date().toISOString(),
            conversionValue:
              (state.campaignAnalytics[action.payload.campaignId]?.conversionValue || 0) +
              (action.payload.value || 0),
          },
        },
      };

    case CAMPAIGN_ACTIONS.CLEAR_CAMPAIGN_DATA:
      return {
        ...state,
        activeCampaigns: [],
        campaignAnalytics: {},
        campaignVisibility: {},
        loading: false,
        error: null,
      };

    default:
      return state;
  }
};

// Initial State
const initialState = {
  activeCampaigns: [],
  campaignAnalytics: {},
  campaignVisibility: {},
  userTargetingData: {
    age: null,
    gender: null,
    location: null,
    deviceType: null,
    interests: [],
    isReturningUser: false,
    userRole: null,
    incomeRange: null,
  },
  loading: false,
  error: null,
};

// Campaign Context Provider
export const CampaignProvider = ({ children }) => {
  const [state, dispatch] = useReducer(campaignReducer, initialState);
  const client = useApolloClient();

  // Fetch active campaigns for a specific placement and type
  const fetchActiveCampaigns = useCallback(
    async (placement, type = null) => {
      try {
        dispatch({ type: CAMPAIGN_ACTIONS.SET_CAMPAIGN_LOADING, payload: true });

        const query = gql`
          query GetActiveCampaigns($placement: String, $type: String) {
            activeCampaigns(placement: $placement, type: $type) {
              _id
              title
              subtitle
              description
              type
              placement
              priority
              content {
                images {
                  desktop
                  mobile
                  tablet
                  thumbnail
                }
                headline
                subheadline
                bodyText
                textColor
                backgroundColor
                overlayOpacity
                blur
                customStyles
              }
              ctas {
                label
                href
                variant
                target
                icon
                position
              }
              schedule {
                startDate
                endDate
                timezone
                isRecurring
                recurrence
                recurrenceEnd
              }
              targeting {
                userRoles
                newUsers
                returningUsers
                verifiedUsers
                countries
                cities
              }
              settings {
                showOnMobile
                showOnTablet
                showOnDesktop
                autoPlay
                interval
                showDots
                showArrows
                dismissible
                sticky
                animation
                animationDuration
              }
              analytics {
                impressions
                clicks
                conversions
                ctr
                conversionRate
                ctaClicks {
                  label
                  clicks
                }
              }
            }
          }
        `;

        const { data } = await client.query({
          query,
          variables: { placement, type },
          fetchPolicy: "network-only",
        });

        if (data?.activeCampaigns) {
          // Filter campaigns based on user targeting
          const filteredCampaigns = filterCampaignsByTargeting(
            data.activeCampaigns,
            state.userTargetingData
          );

          dispatch({
            type: CAMPAIGN_ACTIONS.SET_ACTIVE_CAMPAIGNS,
            payload: filteredCampaigns,
          });
        }
      } catch (error) {
        console.error("Error fetching active campaigns:", error);
        dispatch({
          type: CAMPAIGN_ACTIONS.SET_CAMPAIGN_ERROR,
          payload: error.message,
        });
      }
    },
    [client, state.userTargetingData]
  );

  // Filter campaigns based on user targeting criteria
  const filterCampaignsByTargeting = useCallback((campaigns, userData) => {
    return campaigns.filter((campaign) => {
      const targeting = campaign.targeting;

      // User role targeting
      if (targeting.userRoles && targeting.userRoles.length > 0) {
        if (!userData.userRole || !targeting.userRoles.includes(userData.userRole)) {
          return false;
        }
      }

      // New vs returning user targeting
      if (targeting.newUsers !== undefined && targeting.returningUsers !== undefined) {
        if (userData.isReturningUser && !targeting.returningUsers) {
          return false;
        }
        if (!userData.isReturningUser && !targeting.newUsers) {
          return false;
        }
      }

      // Country targeting
      if (targeting.countries && targeting.countries.length > 0) {
        if (
          !userData.location?.country ||
          !targeting.countries.includes(userData.location.country)
        ) {
          return false;
        }
      }

      // City targeting
      if (targeting.cities && targeting.cities.length > 0) {
        if (!userData.location?.city || !targeting.cities.includes(userData.location.city)) {
          return false;
        }
      }

      return true;
    });
  }, []);

  // Update user targeting data
  const updateUserTargetingData = useCallback((data) => {
    dispatch({
      type: CAMPAIGN_ACTIONS.SET_USER_TARGETING_DATA,
      payload: data,
    });
  }, []);

  // Track campaign impression
  const trackImpression = useCallback((campaignId, placement) => {
    dispatch({
      type: CAMPAIGN_ACTIONS.TRACK_CAMPAIGN_IMPRESSION,
      payload: { campaignId, placement },
    });

    // Send analytics to server
    sendAnalyticsToServer("impression", campaignId, placement);
  }, []);

  // Track campaign click
  const trackClick = useCallback((campaignId, ctaId, placement) => {
    dispatch({
      type: CAMPAIGN_ACTIONS.TRACK_CAMPAIGN_CLICK,
      payload: { campaignId, ctaId, placement },
    });

    // Send analytics to server
    sendAnalyticsToServer("click", campaignId, placement, { ctaId });
  }, []);

  // Track campaign conversion
  const trackConversion = useCallback((campaignId, value, placement) => {
    dispatch({
      type: CAMPAIGN_ACTIONS.TRACK_CAMPAIGN_CONVERSION,
      payload: { campaignId, value, placement },
    });

    // Send analytics to server
    sendAnalyticsToServer("conversion", campaignId, placement, { value });
  }, []);

  // Send analytics data to server
  const sendAnalyticsToServer = useCallback(
    async (eventType, campaignId, placement, additionalData = {}) => {
      try {
        const mutation = gql`
          mutation TrackCampaignEvent($input: TrackCampaignEventInput!) {
            trackCampaignEvent(input: $input) {
              success
              message
            }
          }
        `;

        await client.mutate({
          mutation,
          variables: {
            input: {
              campaignId,
              eventType,
              placement,
              timestamp: new Date().toISOString(),
              userAgent: navigator.userAgent,
              ...additionalData,
            },
          },
        });
      } catch (error) {
        console.error("Error sending analytics to server:", error);
      }
    },
    [client]
  );

  // Set campaign visibility
  const setCampaignVisibility = useCallback((campaignId, isVisible) => {
    dispatch({
      type: CAMPAIGN_ACTIONS.SET_CAMPAIGN_VISIBILITY,
      payload: { campaignId, isVisible },
    });
  }, []);

  // Clear campaign data
  const clearCampaignData = useCallback(() => {
    dispatch({ type: CAMPAIGN_ACTIONS.CLEAR_CAMPAIGN_DATA });
  }, []);

  // Get campaign by placement
  const getCampaignByPlacement = useCallback(
    (placement) => {
      return state.activeCampaigns
        .filter((campaign) => campaign.settings.campaignPlacement === placement)
        .sort((a, b) => (a.settings.displayOrder || 0) - (b.settings.displayOrder || 0));
    },
    [state.activeCampaigns]
  );

  // Get campaign by type
  const getCampaignByType = useCallback(
    (type) => {
      return state.activeCampaigns.filter((campaign) => campaign.settings.campaignType === type);
    },
    [state.activeCampaigns]
  );

  // Check if campaign should be displayed
  const shouldDisplayCampaign = useCallback(
    (campaign) => {
      // Check if campaign is visible
      if (!state.campaignVisibility[campaign.id]) {
        return false;
      }

      // Check frequency capping
      const currentImpressions = state.campaignAnalytics[campaign.id]?.impressions || 0;
      if (
        campaign.targeting.maxFrequency &&
        currentImpressions >= campaign.targeting.maxFrequency
      ) {
        return false;
      }

      // Check scheduling
      if (campaign.schedule.isScheduled) {
        const now = new Date();
        const startDate = new Date(campaign.schedule.startDate);
        const endDate = campaign.schedule.endDate ? new Date(campaign.schedule.endDate) : null;

        if (now < startDate || (endDate && now > endDate)) {
          return false;
        }
      }

      return true;
    },
    [state.campaignVisibility, state.campaignAnalytics]
  );

  // Context value
  const contextValue = {
    // State
    ...state,

    // Actions
    fetchActiveCampaigns,
    updateUserTargetingData,
    trackImpression,
    trackClick,
    trackConversion,
    setCampaignVisibility,
    clearCampaignData,

    // Utility functions
    getCampaignByPlacement,
    getCampaignByType,
    shouldDisplayCampaign,
  };

  return <CampaignContext.Provider value={contextValue}>{children}</CampaignContext.Provider>;
};

// Custom hook to use campaign context
export const useCampaignContext = () => {
  const context = useContext(CampaignContext);
  if (!context) {
    throw new Error("useCampaignContext must be used within a CampaignProvider");
  }
  return context;
};

export default CampaignContext;
