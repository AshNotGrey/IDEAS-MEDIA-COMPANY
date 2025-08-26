import { useState, useEffect, useCallback, useRef } from 'react';
import { useApolloClient } from '@apollo/client';
import { gql } from '@apollo/client';
import { useCampaignContext } from '../contexts/CampaignContext';

// Campaign Queries
const GET_CAMPAIGN_BY_ID = gql`
  query GetCampaign($id: ID!) {
    campaign(id: $id) {
      id
      title
      description
      content
      images {
        id
        url
        alt
        caption
        order
      }
      ctas {
        id
        text
        url
        type
        isActive
        order
      }
      schedule {
        startDate
        endDate
        timeZone
        recurrenceType
        interval
        maxOccurrences
        weekDays
        isActive
        isScheduled
        allowOverlap
        priority
      }
      targeting {
        ageRanges
        gender
        incomeRange
        locations {
          country
          state
          city
          zipCode
          radius
        }
        interests
        deviceType
        behavioralRules {
          rule
          value
          operator
        }
        excludeExistingCustomers
        excludeSubscribers
        retargeting
        maxFrequency
      }
      settings {
        campaignType
        campaignPlacement
        campaignStatus
        displayOrder
        maxDisplays
        isResponsive
        isAccessible
        requiresConsent
        isGdprCompliant
        isCcpCompliant
        customCss
        customJs
      }
      analytics {
        impressions
        clicks
        ctr
        conversions
        revenue
        lastUpdated
      }
    }
  }
`;

const GET_CAMPAIGNS_BY_PLACEMENT = gql`
  query GetCampaignsByPlacement($placement: String!, $limit: Int) {
    campaignsByPlacement(placement: $placement, limit: $limit) {
      id
      title
      description
      content
      images {
        id
        url
        alt
        caption
        order
      }
      ctas {
        id
        text
        url
        type
        isActive
        order
      }
      schedule {
        startDate
        endDate
        timeZone
        isActive
        isScheduled
        priority
      }
      targeting {
        ageRanges
        gender
        incomeRange
        locations {
          country
          state
          city
          zipCode
          radius
        }
        interests
        deviceType
        behavioralRules {
          rule
          value
          operator
        }
        excludeExistingCustomers
        excludeSubscribers
        retargeting
        maxFrequency
      }
      settings {
        campaignType
        campaignPlacement
        campaignStatus
        displayOrder
        maxDisplays
        isResponsive
        isAccessible
        requiresConsent
        isGdprCompliant
        isCcpCompliant
        customCss
        customJs
      }
      analytics {
        impressions
        clicks
        ctr
        conversions
        revenue
        lastUpdated
      }
    }
  }
`;

// Custom hook for campaign management
export const useCampaigns = (options = {}) => {
    const {
        placement = null,
        type = null,
        autoFetch = true,
        pollingInterval = 30000, // 30 seconds
        enableTargeting = true,
        enableScheduling = true
    } = options;

    const client = useApolloClient();
    const {
        userTargetingData,
        updateUserTargetingData,
        trackImpression,
        trackClick,
        trackConversion,
        setCampaignVisibility,
        shouldDisplayCampaign
    } = useCampaignContext();

    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastFetched, setLastFetched] = useState(null);

    const pollingRef = useRef(null);
    const abortControllerRef = useRef(null);

    // Fetch campaigns by placement
    const fetchCampaignsByPlacement = useCallback(async (targetPlacement, targetType = null) => {
        if (!targetPlacement) return;

        try {
            setLoading(true);
            setError(null);

            // Cancel any ongoing request
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            abortControllerRef.current = new AbortController();

            const { data } = await client.query({
                query: GET_CAMPAIGNS_BY_PLACEMENT,
                variables: {
                    placement: targetPlacement,
                    limit: 50
                },
                fetchPolicy: 'network-only',
                context: {
                    fetchOptions: {
                        signal: abortControllerRef.current.signal
                    }
                }
            });

            if (data?.campaignsByPlacement) {
                let filteredCampaigns = data.campaignsByPlacement;

                // Filter by type if specified
                if (targetType) {
                    filteredCampaigns = filteredCampaigns.filter(
                        campaign => campaign.settings.campaignType === targetType
                    );
                }

                // Apply targeting filters if enabled
                if (enableTargeting) {
                    filteredCampaigns = filterCampaignsByTargeting(filteredCampaigns, userTargetingData);
                }

                // Apply scheduling filters if enabled
                if (enableScheduling) {
                    filteredCampaigns = filterCampaignsByScheduling(filteredCampaigns);
                }

                // Sort by display order and priority
                filteredCampaigns.sort((a, b) => {
                    const orderDiff = (a.settings.displayOrder || 0) - (b.settings.displayOrder || 0);
                    if (orderDiff !== 0) return orderDiff;

                    const priorityA = getPriorityValue(a.schedule.priority);
                    const priorityB = getPriorityValue(b.schedule.priority);
                    return priorityB - priorityA;
                });

                setCampaigns(filteredCampaigns);
                setLastFetched(new Date());
            }
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Error fetching campaigns:', error);
                setError(error.message);
            }
        } finally {
            setLoading(false);
        }
    }, [client, enableTargeting, enableScheduling, userTargetingData]);

    // Fetch a single campaign by ID
    const fetchCampaignById = useCallback(async (campaignId) => {
        if (!campaignId) return null;

        try {
            setLoading(true);
            setError(null);

            const { data } = await client.query({
                query: GET_CAMPAIGN_BY_ID,
                variables: { id: campaignId },
                fetchPolicy: 'network-only'
            });

            if (data?.campaign) {
                return data.campaign;
            }
            return null;
        } catch (error) {
            console.error('Error fetching campaign:', error);
            setError(error.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [client]);

    // Filter campaigns based on user targeting criteria
    const filterCampaignsByTargeting = useCallback((campaigns, userData) => {
        if (!userData || !enableTargeting) return campaigns;

        return campaigns.filter(campaign => {
            const targeting = campaign.targeting;

            // Age targeting
            if (targeting.ageRanges && targeting.ageRanges.length > 0) {
                if (!userData.age || !isAgeInRange(userData.age, targeting.ageRanges)) {
                    return false;
                }
            }

            // Gender targeting
            if (targeting.gender && targeting.gender.length > 0) {
                if (!userData.gender || !targeting.gender.includes(userData.gender)) {
                    return false;
                }
            }

            // Location targeting
            if (targeting.locations && targeting.locations.length > 0) {
                if (!userData.location || !isLocationInRange(userData.location, targeting.locations)) {
                    return false;
                }
            }

            // Device type targeting
            if (targeting.deviceType && targeting.deviceType.length > 0) {
                if (!userData.deviceType || !targeting.deviceType.includes(userData.deviceType)) {
                    return false;
                }
            }

            // Interest targeting
            if (targeting.interests && targeting.interests.length > 0) {
                if (!userData.interests || !hasMatchingInterests(userData.interests, targeting.interests)) {
                    return false;
                }
            }

            // Income range targeting
            if (targeting.incomeRange && targeting.incomeRange.length > 0) {
                if (!userData.incomeRange || !targeting.incomeRange.includes(userData.incomeRange)) {
                    return false;
                }
            }

            // Behavioral targeting
            if (targeting.behavioralRules && targeting.behavioralRules.length > 0) {
                if (!evaluateBehavioralRules(targeting.behavioralRules, userData)) {
                    return false;
                }
            }

            return true;
        });
    }, [enableTargeting]);

    // Filter campaigns based on scheduling
    const filterCampaignsByScheduling = useCallback((campaigns) => {
        if (!enableScheduling) return campaigns;

        const now = new Date();

        return campaigns.filter(campaign => {
            const schedule = campaign.schedule;

            // Check if campaign is active
            if (!schedule.isActive) return false;

            // Check if campaign is scheduled
            if (schedule.isScheduled) {
                const startDate = new Date(schedule.startDate);
                const endDate = schedule.endDate ? new Date(schedule.endDate) : null;

                if (now < startDate || (endDate && now > endDate)) {
                    return false;
                }
            }

            return true;
        });
    }, [enableScheduling]);

    // Helper function to check if age is in range
    const isAgeInRange = (userAge, ageRanges) => {
        return ageRanges.some(range => {
            const [min, max] = range.split('-').map(Number);
            return userAge >= min && userAge <= max;
        });
    };

    // Helper function to check if location is in range
    const isLocationInRange = (userLocation, targetLocations) => {
        return targetLocations.some(target => {
            if (target.country && userLocation.country !== target.country) return false;
            if (target.state && userLocation.state !== target.state) return false;
            if (target.city && userLocation.city !== target.city) return false;
            return true;
        });
    };

    // Helper function to check if user has matching interests
    const hasMatchingInterests = (userInterests, targetInterests) => {
        return userInterests.some(interest => targetInterests.includes(interest));
    };

    // Helper function to evaluate behavioral rules
    const evaluateBehavioralRules = (rules, userData) => {
        return rules.every(rule => {
            switch (rule.rule) {
                case 'isReturningUser':
                    return rule.value === userData.isReturningUser;
                case 'userRole':
                    return rule.operator === 'equals' ? userData.userRole === rule.value : true;
                case 'hasPurchased':
                    // Implement purchase history logic
                    return true;
                default:
                    return true;
            }
        });
    };

    // Helper function to get priority value for sorting
    const getPriorityValue = (priority) => {
        const priorityMap = {
            'urgent': 4,
            'high': 3,
            'normal': 2,
            'low': 1
        };
        return priorityMap[priority] || 0;
    };

    // Start polling for campaign updates
    const startPolling = useCallback(() => {
        if (pollingInterval <= 0) return;

        stopPolling();

        pollingRef.current = setInterval(() => {
            if (placement) {
                fetchCampaignsByPlacement(placement, type);
            }
        }, pollingInterval);
    }, [pollingInterval, placement, type, fetchCampaignsByPlacement]);

    // Stop polling
    const stopPolling = useCallback(() => {
        if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
        }
    }, []);

    // Refresh campaigns manually
    const refreshCampaigns = useCallback(() => {
        if (placement) {
            fetchCampaignsByPlacement(placement, type);
        }
    }, [placement, type, fetchCampaignsByPlacement]);

    // Get campaigns for a specific placement
    const getCampaignsForPlacement = useCallback((targetPlacement) => {
        return campaigns.filter(campaign =>
            campaign.settings.campaignPlacement === targetPlacement
        );
    }, [campaigns]);

    // Get campaigns for a specific type
    const getCampaignsForType = useCallback((targetType) => {
        return campaigns.filter(campaign =>
            campaign.settings.campaignType === targetType
        );
    }, [campaigns]);

    // Check if a campaign should be displayed
    const canDisplayCampaign = useCallback((campaign) => {
        if (!shouldDisplayCampaign) return true;
        return shouldDisplayCampaign(campaign);
    }, [shouldDisplayCampaign]);

    // Get next scheduled campaign
    const getNextScheduledCampaign = useCallback((targetPlacement) => {
        const now = new Date();
        const scheduledCampaigns = campaigns.filter(campaign => {
            if (campaign.settings.campaignPlacement !== targetPlacement) return false;
            if (!campaign.schedule.isScheduled) return false;

            const startDate = new Date(campaign.schedule.startDate);
            return startDate > now;
        });

        if (scheduledCampaigns.length === 0) return null;

        return scheduledCampaigns.sort((a, b) => {
            const startDateA = new Date(a.schedule.startDate);
            const startDateB = new Date(b.schedule.startDate);
            return startDateA - startDateB;
        })[0];
    }, [campaigns]);

    // Get active campaigns count
    const getActiveCampaignsCount = useCallback((targetPlacement) => {
        return campaigns.filter(campaign =>
            campaign.settings.campaignPlacement === targetPlacement &&
            campaign.schedule.isActive
        ).length;
    }, [campaigns]);

    // Auto-fetch campaigns when component mounts or dependencies change
    useEffect(() => {
        if (autoFetch && placement) {
            fetchCampaignsByPlacement(placement, type);
        }
    }, [autoFetch, placement, type, fetchCampaignsByPlacement]);

    // Start/stop polling based on placement and polling interval
    useEffect(() => {
        if (placement && pollingInterval > 0) {
            startPolling();
        } else {
            stopPolling();
        }

        return () => {
            stopPolling();
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [placement, pollingInterval, startPolling, stopPolling]);

    // Update user targeting data when it changes
    useEffect(() => {
        if (placement && userTargetingData) {
            // Re-filter campaigns when targeting data changes
            fetchCampaignsByPlacement(placement, type);
        }
    }, [userTargetingData, placement, type, fetchCampaignsByPlacement]);

    return {
        // State
        campaigns,
        loading,
        error,
        lastFetched,

        // Actions
        fetchCampaignsByPlacement,
        fetchCampaignById,
        refreshCampaigns,
        startPolling,
        stopPolling,

        // Utility functions
        getCampaignsForPlacement,
        getCampaignsForType,
        canDisplayCampaign,
        getNextScheduledCampaign,
        getActiveCampaignsCount,

        // Targeting and scheduling
        filterCampaignsByTargeting,
        filterCampaignsByScheduling,

        // Analytics tracking
        trackImpression,
        trackClick,
        trackConversion,

        // Campaign visibility
        setCampaignVisibility
    };
};

export default useCampaigns;
