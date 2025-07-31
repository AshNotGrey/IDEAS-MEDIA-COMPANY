import { gql } from 'graphql-tag';

const campaignTypeDefs = gql`
  # Campaign Types
  type Campaign {
    _id: ID!
    uuid: String!
    name: String!
    title: String!
    subtitle: String
    description: String
    type: CampaignType!
    placement: CampaignPlacement!
    priority: Int!
    content: CampaignContent!
    ctas: [CTA!]!
    schedule: CampaignSchedule!
    status: CampaignStatus!
    isActive: Boolean!
    autoActivate: Boolean!
    autoDeactivate: Boolean!
    targeting: CampaignTargeting!
    themeOverride: ThemeOverride!
    analytics: CampaignAnalytics!
    settings: CampaignSettings!
    createdBy: User!
    lastEditedBy: User
    approvedBy: User
    approvedAt: String
    tags: [String!]!
    notes: String
    version: Int!
    isScheduled: Boolean!
    isExpired: Boolean!
    isCurrentlyActive: Boolean!
    daysRemaining: Int
    ctr: Float!
    createdAt: String!
    updatedAt: String!
  }

  type CampaignContent {
    images: CampaignImages!
    headline: String
    subheadline: String
    bodyText: String
    textColor: String!
    backgroundColor: String
    overlayOpacity: Float!
    blur: Float!
    customStyles: String
  }

  type CampaignImages {
    desktop: String
    mobile: String
    tablet: String
    thumbnail: String
  }

  type CTA {
    label: String!
    href: String!
    variant: CTAVariant!
    target: CTATarget!
    icon: String
    position: CTAPosition!
  }

  type CampaignSchedule {
    startDate: String!
    endDate: String
    timezone: String!
    isRecurring: Boolean!
    recurrence: RecurrenceType
    recurrenceEnd: String
  }

  type CampaignTargeting {
    userRoles: [UserRole!]!
    newUsers: Boolean!
    returningUsers: Boolean!
    verifiedUsers: Boolean!
    countries: [String!]!
    cities: [String!]!
  }

  type ThemeOverride {
    enabled: Boolean!
    colorScheme: ColorScheme
    logo: String
    favicon: String
  }

  type ColorScheme {
    primary: String
    secondary: String
    accent: String
    background: String
    text: String
  }

  type CampaignAnalytics {
    impressions: Int!
    clicks: Int!
    conversions: Int!
    ctr: Float!
    conversionRate: Float!
    ctaClicks: [CTAClick!]!
  }

  type CTAClick {
    label: String!
    clicks: Int!
  }

  type CampaignSettings {
    showOnMobile: Boolean!
    showOnTablet: Boolean!
    showOnDesktop: Boolean!
    autoPlay: Boolean!
    interval: Int!
    showDots: Boolean!
    showArrows: Boolean!
    dismissible: Boolean!
    sticky: Boolean!
    animation: AnimationType!
    animationDuration: Int!
  }

  # Enums
  enum CampaignType {
    hero_carousel
    banner
    popup
    notification
    theme_override
  }

  enum CampaignPlacement {
    home_hero
    top_banner
    sidebar
    footer
    popup_modal
    notification_bar
  }

  enum CampaignStatus {
    draft
    scheduled
    active
    paused
    completed
    cancelled
  }

  enum CTAVariant {
    primary
    secondary
    outline
    ghost
    whatsapp
  }

  enum CTATarget {
    _self
    _blank
  }

  enum CTAPosition {
    left
    center
    right
  }

  enum RecurrenceType {
    daily
    weekly
    monthly
    yearly
  }

  enum AnimationType {
    fade
    slide
    zoom
    none
  }

  # Input Types
  input CreateCampaignInput {
    name: String!
    title: String!
    subtitle: String
    description: String
    type: CampaignType!
    placement: CampaignPlacement!
    priority: Int = 0
    content: CampaignContentInput!
    ctas: [CTAInput!]!
    schedule: CampaignScheduleInput!
    targeting: CampaignTargetingInput
    themeOverride: ThemeOverrideInput
    settings: CampaignSettingsInput
    tags: [String!]
    notes: String
  }

  input UpdateCampaignInput {
    name: String
    title: String
    subtitle: String
    description: String
    type: CampaignType
    placement: CampaignPlacement
    priority: Int
    content: CampaignContentInput
    ctas: [CTAInput!]
    schedule: CampaignScheduleInput
    targeting: CampaignTargetingInput
    themeOverride: ThemeOverrideInput
    settings: CampaignSettingsInput
    tags: [String!]
    notes: String
  }

  input CampaignContentInput {
    images: CampaignImagesInput
    headline: String
    subheadline: String
    bodyText: String
    textColor: String = "#FFFFFF"
    backgroundColor: String
    overlayOpacity: Float = 0.3
    blur: Float = 0.1
    customStyles: String
  }

  input CampaignImagesInput {
    desktop: String
    mobile: String
    tablet: String
    thumbnail: String
  }

  input CTAInput {
    label: String!
    href: String!
    variant: CTAVariant = primary
    target: CTATarget = _self
    icon: String
    position: CTAPosition = center
  }

  input CampaignScheduleInput {
    startDate: String!
    endDate: String
    timezone: String = "UTC"
    isRecurring: Boolean = false
    recurrence: RecurrenceType
    recurrenceEnd: String
  }

  input CampaignTargetingInput {
    userRoles: [UserRole!] = []
    newUsers: Boolean = false
    returningUsers: Boolean = false
    verifiedUsers: Boolean = false
    countries: [String!] = []
    cities: [String!] = []
  }

  input ThemeOverrideInput {
    enabled: Boolean = false
    colorScheme: ColorSchemeInput
    logo: String
    favicon: String
  }

  input ColorSchemeInput {
    primary: String
    secondary: String
    accent: String
    background: String
    text: String
  }

  input CampaignSettingsInput {
    showOnMobile: Boolean = true
    showOnTablet: Boolean = true
    showOnDesktop: Boolean = true
    autoPlay: Boolean = true
    interval: Int = 5000
    showDots: Boolean = true
    showArrows: Boolean = true
    dismissible: Boolean = false
    sticky: Boolean = false
    animation: AnimationType = fade
    animationDuration: Int = 300
  }

  input CampaignFilter {
    type: CampaignType
    placement: CampaignPlacement
    status: CampaignStatus
    isActive: Boolean
    isScheduled: Boolean
    isExpired: Boolean
    createdBy: ID
    tags: [String!]
  }

  # Query and Mutation Types
  type Query {
    campaigns(filter: CampaignFilter): [Campaign!]!
    campaign(id: ID!): Campaign
    activeCampaigns: [Campaign!]!
    scheduledCampaigns: [Campaign!]!
    campaignsByPlacement(placement: CampaignPlacement!): [Campaign!]!
    campaignsByType(type: CampaignType!): [Campaign!]!
  }

  type Mutation {
    createCampaign(input: CreateCampaignInput!): Campaign!
    updateCampaign(id: ID!, input: UpdateCampaignInput!): Campaign!
    deleteCampaign(id: ID!): Campaign!
    activateCampaign(id: ID!): Campaign!
    deactivateCampaign(id: ID!): Campaign!
    approveCampaign(id: ID!): Campaign!
    duplicateCampaign(id: ID!): Campaign!
    scheduleCampaign(id: ID!, schedule: CampaignScheduleInput!): Campaign!
    unscheduleCampaign(id: ID!): Campaign!
  }
`;

export default campaignTypeDefs; 