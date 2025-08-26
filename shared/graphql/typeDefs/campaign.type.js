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
    # Advanced scheduling fields
    isQueued: Boolean!
    queuePosition: Int
    autoActivate: Boolean!
    autoDeactivate: Boolean!
    activationDelay: Int # minutes
    deactivationDelay: Int # minutes
    maxOccurrences: Int
    currentOccurrences: Int
    lastOccurrence: String
    nextOccurrence: String
    isActive: Boolean!
    isScheduled: Boolean!
    priority: SchedulePriority!
    conflictResolution: ConflictResolution!
    allowOverlap: Boolean!
    # Recurrence details
    recurrenceDetails: RecurrenceDetails
  }

  type RecurrenceDetails {
    frequency: Int! # Every X days/weeks/months/years
    daysOfWeek: [Int!] # 0-6 (Sunday-Saturday)
    dayOfMonth: Int # 1-31
    weekOfMonth: Int # 1-5 (first, second, third, fourth, last)
    monthOfYear: Int # 1-12
    endAfterOccurrences: Int
    endOnDate: String
  }

  type CampaignTargeting {
    # User Role Targeting
    userRoles: [UserRole!]!
    userRoleGroups: [String!]! # Custom role groups like "premium", "enterprise"
    excludeUserRoles: [UserRole!]! # Roles to explicitly exclude
    
    # User Behavior & Status Targeting
    newUsers: Boolean!
    returningUsers: Boolean!
    verifiedUsers: Boolean!
    userActivityLevel: UserActivityLevel! # active, inactive, dormant
    userEngagementScore: EngagementScore! # low, medium, high, premium
    userLifetimeValue: LifetimeValueRange! # low, medium, high, premium
    
    # User Account Targeting
    accountAge: AccountAgeRange! # new, young, established, veteran
    subscriptionStatus: [SubscriptionStatus!]! # free, basic, premium, enterprise
    accountVerificationStatus: [VerificationStatus!]! # unverified, email_verified, phone_verified, fully_verified
    
    # Geographic Targeting
    countries: [String!]!
    cities: [String!]!
    regions: [String!]! # States, provinces, etc.
    postalCodes: [String!]!
    radius: Int # miles/km from specific location
    locationPrecision: LocationPrecision! # exact, city, region, country
    
    # Device & Technical Targeting
    deviceType: [DeviceType!]! # mobile, tablet, desktop
    browser: [String!]! # chrome, firefox, safari, edge
    operatingSystem: [String!]! # windows, mac, ios, android
    screenResolution: [String!]! # 1920x1080, 1366x768, etc.
    
    # Behavioral Targeting
    userInterests: [String!]! # Interest tags from user profile
    purchaseHistory: [String!]! # Product categories purchased
    browsingBehavior: [BrowsingBehavior!]! # frequent_visitor, cart_abandoner, etc.
    lastActivity: LastActivity! # recent, moderate, inactive
    
    # A/B Testing & Personalization
    abTestGroup: String # A/B test group assignment
    personalizationRules: [PersonalizationRule!]! # Dynamic content rules
    
    # Frequency & Timing
    maxFrequency: Int # max impressions per user
    minTimeBetweenViews: Int # minutes between views
    timeOfDay: [TimeOfDay!]! # morning, afternoon, evening, night
    dayOfWeek: [DayOfWeek!]! # monday, tuesday, etc.
    
    # Advanced User Targeting
    userSegments: [String!]! # Custom user segments
    customAttributes: [CustomAttribute!]! # Dynamic user attributes
    excludeExistingCustomers: Boolean! # Exclude current customers
    excludeSubscribers: Boolean! # Exclude newsletter subscribers
    retargeting: Boolean! # Retargeting campaigns
  }

  # Enhanced targeting enums and types
  enum UserRole {
    guest
    user
    premium_user
    admin
    moderator
    content_creator
    business_owner
    enterprise_user
  }

  enum UserActivityLevel {
    active
    moderate
    inactive
    dormant
  }

  enum EngagementScore {
    low
    medium
    high
    premium
  }

  enum LifetimeValueRange {
    low
    medium
    high
    premium
  }

  enum AccountAgeRange {
    new
    young
    established
    veteran
  }

  enum SubscriptionStatus {
    free
    basic
    premium
    enterprise
  }

  enum VerificationStatus {
    unverified
    email_verified
    phone_verified
    fully_verified
  }

  enum LocationPrecision {
    exact
    city
    region
    country
  }

  enum DeviceType {
    mobile
    tablet
    desktop
  }

  enum BrowsingBehavior {
    frequent_visitor
    cart_abandoner
    window_shopper
    power_user
    casual_browser
  }

  enum LastActivity {
    recent
    moderate
    inactive
  }

  enum TimeOfDay {
    morning
    afternoon
    evening
    night
  }

  enum DayOfWeek {
    monday
    tuesday
    wednesday
    thursday
    friday
    saturday
    sunday
  }

  type PersonalizationRule {
    condition: String! # User attribute condition
    action: String! # Content modification action
    value: String # Dynamic value
  }

  type CustomAttribute {
    key: String! # Attribute name
    value: String! # Attribute value
    operator: ComparisonOperator! # Comparison operator
  }

  enum ComparisonOperator {
    equals
    not_equals
    contains
    not_contains
    greater_than
    less_than
    greater_than_or_equal
    less_than_or_equal
    in
    not_in
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

  enum SchedulePriority {
    low
    normal
    high
    urgent
  }

  enum ConflictResolution {
    skip
    replace
    queue
    overlap
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
    # Advanced scheduling fields
    isQueued: Boolean = false
    queuePosition: Int
    autoActivate: Boolean = false
    autoDeactivate: Boolean = false
    activationDelay: Int = 0
    deactivationDelay: Int = 0
    maxOccurrences: Int
    currentOccurrences: Int
    lastOccurrence: String
    nextOccurrence: String
    isActive: Boolean = false
    isScheduled: Boolean = false
    priority: SchedulePriority = normal
    conflictResolution: ConflictResolution = queue
    allowOverlap: Boolean = false
    # Recurrence details
    recurrenceDetails: RecurrenceDetailsInput
  }

  input RecurrenceDetailsInput {
    frequency: Int = 1
    daysOfWeek: [Int!] = []
    dayOfMonth: Int
    weekOfMonth: Int
    monthOfYear: Int
    endAfterOccurrences: Int
    endOnDate: String
  }

  input CampaignTargetingInput {
    # User Role Targeting
    userRoles: [UserRole!] = []
    userRoleGroups: [String!] = []
    excludeUserRoles: [UserRole!] = []
    
    # User Behavior & Status Targeting
    newUsers: Boolean = false
    returningUsers: Boolean = false
    verifiedUsers: Boolean = false
    userActivityLevel: UserActivityLevel
    userEngagementScore: EngagementScore
    userLifetimeValue: LifetimeValueRange
    
    # User Account Targeting
    accountAge: AccountAgeRange
    subscriptionStatus: [SubscriptionStatus!] = []
    accountVerificationStatus: [VerificationStatus!] = []
    
    # Geographic Targeting
    countries: [String!] = []
    cities: [String!] = []
    regions: [String!] = []
    postalCodes: [String!] = []
    radius: Int
    locationPrecision: LocationPrecision
    
    # Device & Technical Targeting
    deviceType: [DeviceType!] = []
    browser: [String!] = []
    operatingSystem: [String!] = []
    screenResolution: [String!] = []
    
    # Behavioral Targeting
    userInterests: [String!] = []
    purchaseHistory: [String!] = []
    browsingBehavior: [BrowsingBehavior!] = []
    lastActivity: LastActivity
    
    # A/B Testing & Personalization
    abTestGroup: String
    personalizationRules: [PersonalizationRuleInput!] = []
    
    # Frequency & Timing
    maxFrequency: Int
    minTimeBetweenViews: Int
    timeOfDay: [TimeOfDay!] = []
    dayOfWeek: [DayOfWeek!] = []
    
    # Advanced User Targeting
    userSegments: [String!] = []
    customAttributes: [CustomAttributeInput!] = []
    excludeExistingCustomers: Boolean = false
    excludeSubscribers: Boolean = false
    retargeting: Boolean = false
  }

  input PersonalizationRuleInput {
    condition: String!
    action: String!
    value: String
  }

  input CustomAttributeInput {
    key: String!
    value: String!
    operator: ComparisonOperator!
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

  # Campaign Queries
  type Query {
    campaigns(
      status: CampaignStatus
      placement: CampaignPlacement
      type: CampaignType
      limit: Int
      offset: Int
    ): [Campaign!]!
    
    campaign(id: ID!): Campaign
    activeCampaigns(placement: String, type: String): [Campaign!]!
    scheduledCampaigns: [Campaign!]!
    campaignsByPlacement(placement: CampaignPlacement!): [Campaign!]!
    campaignsByType(type: CampaignType!): [Campaign!]!
    
    # Advanced scheduling queries
    queuedCampaigns: [Campaign!]!
    scheduledCampaignsByDate(startDate: String!, endDate: String!): [Campaign!]!
    campaignsWithConflicts: [Campaign!]!
    recurringCampaigns: [Campaign!]!
    campaignsByPriority(priority: SchedulePriority!): [Campaign!]!
    upcomingCampaigns(days: Int = 7): [Campaign!]!
    expiredCampaigns: [Campaign!]!
    
    # Queue management
    queuePosition(campaignId: ID!): Int
    queueLength: Int!
    nextInQueue: Campaign
  }

  # Campaign Mutations
  type Mutation {
    createCampaign(input: CreateCampaignInput!): Campaign!
    updateCampaign(id: ID!, input: UpdateCampaignInput!): Campaign!
    deleteCampaign(id: ID!): Boolean!
    activateCampaign(id: ID!): Campaign!
    deactivateCampaign(id: ID!): Campaign!
    approveCampaign(id: ID!): Campaign!
    duplicateCampaign(id: ID!): Campaign!
    
    # Advanced scheduling mutations
    scheduleCampaign(id: ID!, schedule: CampaignScheduleInput!): Campaign!
    unscheduleCampaign(id: ID!): Campaign!
    queueCampaign(id: ID!, priority: SchedulePriority = normal): Campaign!
    dequeueCampaign(id: ID!): Campaign!
    moveInQueue(id: ID!, newPosition: Int!): Campaign!
    autoActivateCampaign(id: ID!): Campaign!
    autoDeactivateCampaign(id: ID!): Campaign!
    updateRecurrence(id: ID!, recurrenceDetails: RecurrenceDetailsInput!): Campaign!
    resolveScheduleConflict(id: ID!, resolution: ConflictResolution!): Campaign!
    
    # Bulk operations
    bulkActivateCampaigns(ids: [ID!]!): [Campaign!]!
    bulkDeactivateCampaigns(ids: [ID!]!): [Campaign!]!
    bulkDeleteCampaigns(ids: [ID!]!): Boolean!
    bulkScheduleCampaigns(ids: [ID!]!, schedule: CampaignScheduleInput!): [Campaign!]!
  }
`;

export default campaignTypeDefs; 