import { gql } from '@apollo/client';

// Campaign Fragments
export const CAMPAIGN_FRAGMENT = gql`
  fragment CampaignFragment on Campaign {
    id
    title
    description
    content
    createdAt
    updatedAt
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
      campaignId
      externalId
      tags
      displayOrder
      maxDisplays
      isResponsive
      isAccessible
      isAbtesting
      requiresConsent
      isGdprCompliant
      isCcpCompliant
      privacyPolicy
      customCss
      customJs
      notes
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
`;

export const CAMPAIGN_SUMMARY_FRAGMENT = gql`
  fragment CampaignSummaryFragment on Campaign {
    id
    title
    description
    createdAt
    updatedAt
    images {
      id
      url
      alt
    }
    schedule {
      startDate
      endDate
      isActive
      priority
    }
    settings {
      campaignType
      campaignPlacement
      campaignStatus
      tags
      displayOrder
    }
    analytics {
      impressions
      clicks
      ctr
      conversions
    }
  }
`;

// Campaign Queries
export const GET_CAMPAIGNS = gql`
  query GetCampaigns(
    $page: Int
    $limit: Int
    $search: String
    $status: String
    $type: String
    $placement: String
    $startDate: String
    $endDate: String
    $sortBy: String
    $sortOrder: String
  ) {
    campaigns(
      page: $page
      limit: $limit
      search: $search
      status: $status
      type: $type
      placement: $placement
      startDate: $startDate
      endDate: $endDate
      sortBy: $sortBy
      sortOrder: $sortOrder
    ) {
      campaigns {
        ...CampaignSummaryFragment
      }
      totalCount
      totalPages
      currentPage
      hasNextPage
      hasPreviousPage
    }
  }
  ${CAMPAIGN_SUMMARY_FRAGMENT}
`;

export const GET_CAMPAIGN = gql`
  query GetCampaign($id: ID!) {
    campaign(id: $id) {
      ...CampaignFragment
    }
  }
  ${CAMPAIGN_FRAGMENT}
`;

export const GET_ACTIVE_CAMPAIGNS = gql`
  query GetActiveCampaigns($placement: String, $type: String) {
    activeCampaigns(placement: $placement, type: $type) {
      ...CampaignSummaryFragment
    }
  }
  ${CAMPAIGN_SUMMARY_FRAGMENT}
`;

export const GET_SCHEDULED_CAMPAIGNS = gql`
  query GetScheduledCampaigns($startDate: String, $endDate: String) {
    scheduledCampaigns(startDate: $startDate, endDate: $endDate) {
      ...CampaignSummaryFragment
    }
  }
  ${CAMPAIGN_SUMMARY_FRAGMENT}
`;

export const GET_CAMPAIGNS_BY_PLACEMENT = gql`
  query GetCampaignsByPlacement($placement: String!, $limit: Int) {
    campaignsByPlacement(placement: $placement, limit: $limit) {
      ...CampaignSummaryFragment
    }
  }
  ${CAMPAIGN_SUMMARY_FRAGMENT}
`;

export const GET_CAMPAIGNS_BY_TYPE = gql`
  query GetCampaignsByType($type: String!, $limit: Int) {
    campaignsByType(type: $type, limit: $limit) {
      ...CampaignSummaryFragment
    }
  }
  ${CAMPAIGN_SUMMARY_FRAGMENT}
`;

// Campaign Mutations
export const CREATE_CAMPAIGN = gql`
  mutation CreateCampaign($input: CreateCampaignInput!) {
    createCampaign(input: $input) {
      ...CampaignFragment
    }
  }
  ${CAMPAIGN_FRAGMENT}
`;

export const UPDATE_CAMPAIGN = gql`
  mutation UpdateCampaign($id: ID!, $input: UpdateCampaignInput!) {
    updateCampaign(id: $id, input: $input) {
      ...CampaignFragment
    }
  }
  ${CAMPAIGN_FRAGMENT}
`;

export const DELETE_CAMPAIGN = gql`
  mutation DeleteCampaign($id: ID!) {
    deleteCampaign(id: $id) {
      success
      message
      deletedCampaign {
        id
        title
      }
    }
  }
`;

export const ACTIVATE_CAMPAIGN = gql`
  mutation ActivateCampaign($id: ID!) {
    activateCampaign(id: $id) {
      ...CampaignFragment
    }
  }
  ${CAMPAIGN_FRAGMENT}
`;

export const DEACTIVATE_CAMPAIGN = gql`
  mutation DeactivateCampaign($id: ID!) {
    deactivateCampaign(id: $id) {
      ...CampaignFragment
    }
  }
  ${CAMPAIGN_FRAGMENT}
`;

export const APPROVE_CAMPAIGN = gql`
  mutation ApproveCampaign($id: ID!) {
    approveCampaign(id: $id) {
      ...CampaignFragment
    }
  }
  ${CAMPAIGN_FRAGMENT}
`;

export const DUPLICATE_CAMPAIGN = gql`
  mutation DuplicateCampaign($id: ID!, $input: DuplicateCampaignInput) {
    duplicateCampaign(id: $id, input: $input) {
      ...CampaignFragment
    }
  }
  ${CAMPAIGN_FRAGMENT}
`;

export const SCHEDULE_CAMPAIGN = gql`
  mutation ScheduleCampaign($id: ID!, $input: ScheduleCampaignInput!) {
    scheduleCampaign(id: $id, input: $input) {
      ...CampaignFragment
    }
  }
  ${CAMPAIGN_FRAGMENT}
`;

export const UNSCHEDULE_CAMPAIGN = gql`
  mutation UnscheduleCampaign($id: ID!) {
    unscheduleCampaign(id: $id) {
      ...CampaignFragment
    }
  }
  ${CAMPAIGN_FRAGMENT}
`;

// Bulk Operations
export const BULK_ACTIVATE_CAMPAIGNS = gql`
  mutation BulkActivateCampaigns($ids: [ID!]!) {
    bulkActivateCampaigns(ids: $ids) {
      success
      message
      activatedCount
      failedCount
      results {
        id
        success
        message
      }
    }
  }
`;

export const BULK_DEACTIVATE_CAMPAIGNS = gql`
  mutation BulkDeactivateCampaigns($ids: [ID!]!) {
    bulkDeactivateCampaigns(ids: $ids) {
      success
      message
      deactivatedCount
      failedCount
      results {
        id
        success
        message
      }
    }
  }
`;

export const BULK_DELETE_CAMPAIGNS = gql`
  mutation BulkDeleteCampaigns($ids: [ID!]!) {
    bulkDeleteCampaigns(ids: $ids) {
      success
      message
      deletedCount
      failedCount
      results {
        id
        success
        message
      }
    }
  }
`;

export const BULK_APPROVE_CAMPAIGNS = gql`
  mutation BulkApproveCampaigns($ids: [ID!]!) {
    bulkApproveCampaigns(ids: $ids) {
      success
      message
      approvedCount
      failedCount
      results {
        id
        success
        message
      }
    }
  }
`;

// Analytics Queries
export const GET_CAMPAIGN_ANALYTICS = gql`
  query GetCampaignAnalytics(
    $id: ID!
    $startDate: String
    $endDate: String
    $groupBy: String
  ) {
    campaignAnalytics(
      id: $id
      startDate: $startDate
      endDate: $endDate
      groupBy: $groupBy
    ) {
      campaignId
      period
      impressions
      clicks
      ctr
      conversions
      revenue
      cost
      roi
      breakdown {
        date
        impressions
        clicks
        ctr
        conversions
        revenue
      }
    }
  }
`;

export const GET_CAMPAIGNS_ANALYTICS_SUMMARY = gql`
  query GetCampaignsAnalyticsSummary(
    $startDate: String
    $endDate: String
    $status: String
    $type: String
  ) {
    campaignsAnalyticsSummary(
      startDate: $startDate
      endDate: $endDate
      status: $status
      type: $type
    ) {
      totalCampaigns
      activeCampaigns
      totalImpressions
      totalClicks
      averageCtr
      totalConversions
      totalRevenue
      totalCost
      averageRoi
      topPerformers {
        id
        title
        impressions
        clicks
        ctr
        conversions
        revenue
      }
    }
  }
`;

// Real-time Updates Subscription
export const CAMPAIGN_UPDATES_SUBSCRIPTION = gql`
  subscription OnCampaignUpdate {
    campaignUpdated {
      ...CampaignFragment
    }
  }
  ${CAMPAIGN_FRAGMENT}
`;

export const CAMPAIGN_STATUS_CHANGED_SUBSCRIPTION = gql`
  subscription OnCampaignStatusChanged {
    campaignStatusChanged {
      id
      settings {
        campaignStatus
      }
      updatedAt
    }
  }
`;

// Cache Management Functions
export const updateCampaignCache = (cache, newCampaign, queryName = 'GetCampaigns') => {
    // Update campaigns list cache
    try {
        const existingData = cache.readQuery({
            query: GET_CAMPAIGNS,
            variables: { page: 1, limit: 10 }
        });

        if (existingData) {
            const updatedCampaigns = existingData.campaigns.campaigns.map(campaign =>
                campaign.id === newCampaign.id ? newCampaign : campaign
            );

            cache.writeQuery({
                query: GET_CAMPAIGNS,
                variables: { page: 1, limit: 10 },
                data: {
                    campaigns: {
                        ...existingData.campaigns,
                        campaigns: updatedCampaigns
                    }
                }
            });
        }
    } catch (error) {
        // Cache might not exist yet, ignore
    }

    // Update individual campaign cache
    try {
        cache.writeQuery({
            query: GET_CAMPAIGN,
            variables: { id: newCampaign.id },
            data: { campaign: newCampaign }
        });
    } catch (error) {
        // Individual campaign cache might not exist yet, ignore
    }
};

export const removeCampaignFromCache = (cache, campaignId, queryName = 'GetCampaigns') => {
    // Remove from campaigns list cache
    try {
        const existingData = cache.readQuery({
            query: GET_CAMPAIGNS,
            variables: { page: 1, limit: 10 }
        });

        if (existingData) {
            const filteredCampaigns = existingData.campaigns.campaigns.filter(
                campaign => campaign.id !== campaignId
            );

            cache.writeQuery({
                query: GET_CAMPAIGNS,
                variables: { page: 1, limit: 10 },
                data: {
                    campaigns: {
                        ...existingData.campaigns,
                        campaigns: filteredCampaigns,
                        totalCount: existingData.campaigns.totalCount - 1
                    }
                }
            });
        }
    } catch (error) {
        // Cache might not exist yet, ignore
    }

    // Remove individual campaign cache
    try {
        cache.evict({ id: cache.identify({ __typename: 'Campaign', id: campaignId }) });
    } catch (error) {
        // Individual campaign cache might not exist yet, ignore
    }
};

export const addCampaignToCache = (cache, newCampaign, queryName = 'GetCampaigns') => {
    // Add to campaigns list cache
    try {
        const existingData = cache.readQuery({
            query: GET_CAMPAIGNS,
            variables: { page: 1, limit: 10 }
        });

        if (existingData) {
            const updatedCampaigns = [newCampaign, ...existingData.campaigns.campaigns];

            cache.writeQuery({
                query: GET_CAMPAIGNS,
                variables: { page: 1, limit: 10 },
                data: {
                    campaigns: {
                        ...existingData.campaigns,
                        campaigns: updatedCampaigns,
                        totalCount: existingData.campaigns.totalCount + 1
                    }
                }
            });
        }
    } catch (error) {
        // Cache might not exist yet, ignore
    }

    // Add individual campaign cache
    try {
        cache.writeQuery({
            query: GET_CAMPAIGN,
            variables: { id: newCampaign.id },
            data: { campaign: newCampaign }
        });
    } catch (error) {
        // Individual campaign cache might not exist yet, ignore
    }
};
