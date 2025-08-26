import { useQuery, useMutation, useApolloClient } from '@apollo/client';
import { gql } from '@apollo/client';

// GraphQL Fragments
const CAMPAIGN_FRAGMENT = gql`
  fragment CampaignFields on Campaign {
    _id
    name
    type
    placement
    priority
    status
    content {
      title
      subtitle
      description
      ctaText
      ctaUrl
      images {
        desktop
        mobile
        tablet
      }
    }
    schedule {
      startDate
      endDate
      isRecurring
      recurrence {
        frequency
        interval
        daysOfWeek
        dayOfMonth
      }
    }
    targeting {
      userRoles
      userTypes
      countries
      cities
      devices
      browsers
    }
    settings {
      isActive
      isScheduled
      isExpired
      maxImpressions
      maxClicks
      displayFrequency
      displayDelay
    }
    analytics {
      impressions
      clicks
      conversions
      ctr
      conversionRate
    }
    tags
    createdBy
    createdAt
    updatedAt
  }
`;

// GraphQL Queries
const GET_CAMPAIGNS = gql`
  query GetCampaigns($filter: CampaignFilterInput, $options: CampaignOptionsInput) {
    campaigns(filter: $filter, options: $options) {
      ...CampaignFields
    }
  }
  ${CAMPAIGN_FRAGMENT}
`;

const GET_CAMPAIGN_BY_ID = gql`
  query GetCampaignById($id: ID!) {
    campaign(id: $id) {
      ...CampaignFields
    }
  }
  ${CAMPAIGN_FRAGMENT}
`;

const GET_ACTIVE_CAMPAIGNS = gql`
  query GetActiveCampaigns($limit: Int) {
    activeCampaigns(limit: $limit) {
      ...CampaignFields
    }
  }
  ${CAMPAIGN_FRAGMENT}
`;

const GET_SCHEDULED_CAMPAIGNS = gql`
  query GetScheduledCampaigns($limit: Int) {
    scheduledCampaigns(limit: $limit) {
      ...CampaignFields
    }
  }
  ${CAMPAIGN_FRAGMENT}
`;

// GraphQL Mutations
const CREATE_CAMPAIGN = gql`
  mutation CreateCampaign($input: CampaignInput!) {
    createCampaign(input: $input) {
      ...CampaignFields
    }
  }
  ${CAMPAIGN_FRAGMENT}
`;

const UPDATE_CAMPAIGN = gql`
  mutation UpdateCampaign($id: ID!, $input: CampaignUpdateInput!) {
    updateCampaign(id: $id, input: $input) {
      ...CampaignFields
    }
  }
  ${CAMPAIGN_FRAGMENT}
`;

const DELETE_CAMPAIGN = gql`
  mutation DeleteCampaign($id: ID!) {
    deleteCampaign(id: $id) {
      ...CampaignFields
    }
  }
  ${CAMPAIGN_FRAGMENT}
`;

const ACTIVATE_CAMPAIGN = gql`
  mutation ActivateCampaign($id: ID!) {
    activateCampaign(id: $id) {
      ...CampaignFields
    }
  }
  ${CAMPAIGN_FRAGMENT}
`;

const DEACTIVATE_CAMPAIGN = gql`
  mutation DeactivateCampaign($id: ID!) {
    deactivateCampaign(id: $id) {
      ...CampaignFields
    }
  }
  ${CAMPAIGN_FRAGMENT}
`;

const APPROVE_CAMPAIGN = gql`
  mutation ApproveCampaign($id: ID!) {
    approveCampaign(id: $id) {
      ...CampaignFields
    }
  }
  ${CAMPAIGN_FRAGMENT}
`;

const DUPLICATE_CAMPAIGN = gql`
  mutation DuplicateCampaign($id: ID!) {
    duplicateCampaign(id: $id) {
      ...CampaignFields
    }
  }
  ${CAMPAIGN_FRAGMENT}
`;

const SCHEDULE_CAMPAIGN = gql`
  mutation ScheduleCampaign($id: ID!, $input: ScheduleInput!) {
    scheduleCampaign(id: $id, input: $input) {
      ...CampaignFields
    }
  }
  ${CAMPAIGN_FRAGMENT}
`;

const UNSCHEDULE_CAMPAIGN = gql`
  mutation UnscheduleCampaign($id: ID!) {
    unscheduleCampaign(id: $id) {
      ...CampaignFields
    }
  }
  ${CAMPAIGN_FRAGMENT}
`;

const BULK_UPDATE_CAMPAIGNS = gql`
  mutation BulkUpdateCampaigns($campaignIds: [ID!]!, $updateData: CampaignUpdateInput!) {
    bulkUpdateCampaigns(campaignIds: $campaignIds, updateData: $updateData) {
      updated
      failed
      errors
    }
  }
`;

const BULK_DELETE_CAMPAIGNS = gql`
  mutation BulkDeleteCampaigns($campaignIds: [ID!]!) {
    bulkDeleteCampaigns(campaignIds: $campaignIds) {
      deleted
      failed
      errors
    }
  }
`;

// Custom Hook for Campaign Management
export const useCampaigns = (filter = {}, options = {}) => {
    const client = useApolloClient();

    // Query for campaigns
    const {
        data: campaignsData,
        loading,
        error,
        refetch
    } = useQuery(GET_CAMPAIGNS, {
        variables: { filter, options },
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'all'
    });

    // Mutations
    const [createCampaignMutation] = useMutation(CREATE_CAMPAIGN);
    const [updateCampaignMutation] = useMutation(UPDATE_CAMPAIGN);
    const [deleteCampaignMutation] = useMutation(DELETE_CAMPAIGN);
    const [activateCampaignMutation] = useMutation(ACTIVATE_CAMPAIGN);
    const [deactivateCampaignMutation] = useMutation(DEACTIVATE_CAMPAIGN);
    const [approveCampaignMutation] = useMutation(APPROVE_CAMPAIGN);
    const [duplicateCampaignMutation] = useMutation(DUPLICATE_CAMPAIGN);
    const [scheduleCampaignMutation] = useMutation(SCHEDULE_CAMPAIGN);
    const [unscheduleCampaignMutation] = useMutation(UNSCHEDULE_CAMPAIGN);
    const [bulkUpdateCampaignsMutation] = useMutation(BULK_UPDATE_CAMPAIGNS);
    const [bulkDeleteCampaignsMutation] = useMutation(BULK_DELETE_CAMPAIGNS);

    // Extract campaigns from query result
    const campaigns = campaignsData?.campaigns || [];

    // Helper function to update cache after mutations
    const updateCache = (newCampaign, operation = 'add') => {
        const cache = client.cache;
        const cacheId = cache.identify(newCampaign);

        if (operation === 'add') {
            cache.modify({
                fields: {
                    campaigns(existingCampaigns = []) {
                        const newCampaignRef = cache.writeFragment({
                            data: newCampaign,
                            fragment: CAMPAIGN_FRAGMENT
                        });
                        return [...existingCampaigns, newCampaignRef];
                    }
                }
            });
        } else if (operation === 'update') {
            cache.writeFragment({
                id: cacheId,
                fragment: CAMPAIGN_FRAGMENT,
                data: newCampaign
            });
        } else if (operation === 'delete') {
            cache.evict({ id: cacheId });
            cache.gc();
        }
    };

    // Campaign operations
    const createCampaign = async (input) => {
        try {
            const { data } = await createCampaignMutation({
                variables: { input },
                update: (cache, { data: result }) => {
                    if (result?.createCampaign) {
                        updateCache(result.createCampaign, 'add');
                    }
                }
            });
            return data?.createCampaign;
        } catch (error) {
            console.error('Error creating campaign:', error);
            throw error;
        }
    };

    const updateCampaign = async (id, input) => {
        try {
            const { data } = await updateCampaignMutation({
                variables: { id, input },
                update: (cache, { data: result }) => {
                    if (result?.updateCampaign) {
                        updateCache(result.updateCampaign, 'update');
                    }
                }
            });
            return data?.updateCampaign;
        } catch (error) {
            console.error('Error updating campaign:', error);
            throw error;
        }
    };

    const deleteCampaign = async (id) => {
        try {
            const { data } = await deleteCampaignMutation({
                variables: { id },
                update: (cache, { data: result }) => {
                    if (result?.deleteCampaign) {
                        updateCache(result.deleteCampaign, 'delete');
                    }
                }
            });
            return data?.deleteCampaign;
        } catch (error) {
            console.error('Error deleting campaign:', error);
            throw error;
        }
    };

    const activateCampaign = async (id) => {
        try {
            const { data } = await activateCampaignMutation({
                variables: { id },
                update: (cache, { data: result }) => {
                    if (result?.activateCampaign) {
                        updateCache(result.activateCampaign, 'update');
                    }
                }
            });
            return data?.activateCampaign;
        } catch (error) {
            console.error('Error activating campaign:', error);
            throw error;
        }
    };

    const deactivateCampaign = async (id) => {
        try {
            const { data } = await deactivateCampaignMutation({
                variables: { id },
                update: (cache, { data: result }) => {
                    if (result?.deactivateCampaign) {
                        updateCache(result.deactivateCampaign, 'update');
                    }
                }
            });
            return data?.deactivateCampaign;
        } catch (error) {
            console.error('Error deactivating campaign:', error);
            throw error;
        }
    };

    const approveCampaign = async (id) => {
        try {
            const { data } = await approveCampaignMutation({
                variables: { id },
                update: (cache, { data: result }) => {
                    if (result?.approveCampaign) {
                        updateCache(result.approveCampaign, 'update');
                    }
                }
            });
            return data?.approveCampaign;
        } catch (error) {
            console.error('Error approving campaign:', error);
            throw error;
        }
    };

    const duplicateCampaign = async (id) => {
        try {
            const { data } = await duplicateCampaignMutation({
                variables: { id },
                update: (cache, { data: result }) => {
                    if (result?.duplicateCampaign) {
                        updateCache(result.duplicateCampaign, 'add');
                    }
                }
            });
            return data?.duplicateCampaign;
        } catch (error) {
            console.error('Error duplicating campaign:', error);
            throw error;
        }
    };

    const scheduleCampaign = async (id, input) => {
        try {
            const { data } = await scheduleCampaignMutation({
                variables: { id, input },
                update: (cache, { data: result }) => {
                    if (result?.scheduleCampaign) {
                        updateCache(result.scheduleCampaign, 'update');
                    }
                }
            });
            return data?.scheduleCampaign;
        } catch (error) {
            console.error('Error scheduling campaign:', error);
            throw error;
        }
    };

    const unscheduleCampaign = async (id) => {
        try {
            const { data } = await unscheduleCampaignMutation({
                variables: { id },
                update: (cache, { data: result }) => {
                    if (result?.unscheduleCampaign) {
                        updateCache(result.unscheduleCampaign, 'update');
                    }
                }
            });
            return data?.unscheduleCampaign;
        } catch (error) {
            console.error('Error unscheduling campaign:', error);
            throw error;
        }
    };

    const bulkUpdateCampaigns = async (campaignIds, updateData) => {
        try {
            const { data } = await bulkUpdateCampaignsMutation({
                variables: { campaignIds, updateData }
            });
            // Refetch to get updated data
            await refetch();
            return data?.bulkUpdateCampaigns;
        } catch (error) {
            console.error('Error bulk updating campaigns:', error);
            throw error;
        }
    };

    const bulkDeleteCampaigns = async (campaignIds) => {
        try {
            const { data } = await bulkDeleteCampaignsMutation({
                variables: { campaignIds }
            });
            // Refetch to get updated data
            await refetch();
            return data?.bulkDeleteCampaigns;
        } catch (error) {
            console.error('Error bulk deleting campaigns:', error);
            throw error;
        }
    };

    return {
        // Data
        campaigns,
        loading,
        error,

        // Operations
        createCampaign,
        updateCampaign,
        deleteCampaign,
        activateCampaign,
        deactivateCampaign,
        approveCampaign,
        duplicateCampaign,
        scheduleCampaign,
        unscheduleCampaign,
        bulkUpdateCampaigns,
        bulkDeleteCampaigns,

        // Utilities
        refetch
    };
};

// Individual hooks for specific use cases
export const useCampaignById = (id) => {
    const { data, loading, error } = useQuery(GET_CAMPAIGN_BY_ID, {
        variables: { id },
        skip: !id,
        fetchPolicy: 'cache-and-network'
    });

    return {
        campaign: data?.campaign,
        loading,
        error
    };
};

export const useActiveCampaigns = (limit = 50) => {
    const { data, loading, error } = useQuery(GET_ACTIVE_CAMPAIGNS, {
        variables: { limit },
        fetchPolicy: 'cache-and-network'
    });

    return {
        activeCampaigns: data?.activeCampaigns || [],
        loading,
        error
    };
};

export const useScheduledCampaigns = (limit = 50) => {
    const { data, loading, error } = useQuery(GET_SCHEDULED_CAMPAIGNS, {
        variables: { limit },
        fetchPolicy: 'cache-and-network'
    });

    return {
        scheduledCampaigns: data?.scheduledCampaigns || [],
        loading,
        error
    };
};
