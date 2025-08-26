import { gql } from 'graphql-tag';

export const emailTemplateTypeDefs = gql`
  # Email Template Types
  type EmailTemplate {
    _id: ID!
    name: String!
    slug: String!
    description: String
    subject: String!
    htmlContent: String!
    textContent: String
    category: EmailTemplateCategory!
    type: EmailTemplateType!
    variables: [TemplateVariable!]!
    isActive: Boolean!
    isDefault: Boolean!
    priority: Int!
    design: TemplateDesign!
    triggers: [TemplateTrigger!]!
    delivery: TemplateDelivery!
    stats: TemplateStats!
    version: Int!
    previousVersions: [TemplateVersion!]!
    createdBy: Admin!
    lastModifiedBy: Admin
    tags: [String!]!
    testRecipients: [String!]!
    lastTested: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
    
    # Virtual fields
    deliveryRate: Float
    openRate: Float
    clickRate: Float
    bounceRate: Float
  }

  type TemplateVariable {
    name: String!
    description: String
    type: TemplateVariableType!
    required: Boolean!
    defaultValue: String
  }

  type TemplateDesign {
    theme: TemplateTheme!
    primaryColor: String!
    backgroundColor: String!
    fontFamily: String!
    layout: TemplateLayout!
  }

  type TemplateTrigger {
    event: TriggerEvent!
    conditions: [TriggerCondition!]!
    delay: TriggerDelay
  }

  type TriggerCondition {
    field: String!
    operator: ConditionOperator!
    value: String!
  }

  type TriggerDelay {
    value: Int!
    unit: DelayUnit!
  }

  type TemplateDelivery {
    fromName: String!
    fromEmail: String!
    replyTo: String
    bcc: [String!]!
    attachments: [EmailAttachment!]!
  }

  type EmailAttachment {
    name: String!
    url: String!
    type: String!
  }

  type TemplateStats {
    sent: Int!
    delivered: Int!
    opened: Int!
    clicked: Int!
    bounced: Int!
    unsubscribed: Int!
    lastSent: DateTime
  }

  type TemplateVersion {
    version: Int!
    content: TemplateVersionContent!
    modifiedAt: DateTime!
    modifiedBy: Admin
    changelog: String
  }

  type TemplateVersionContent {
    subject: String!
    htmlContent: String!
    textContent: String
  }

  type EmailTemplateResponse {
    templates: [EmailTemplate!]!
    pagination: PaginationInfo!
  }

  type CompiledTemplate {
    subject: String!
    htmlContent: String!
    textContent: String!
    from: String!
    replyTo: String
    bcc: [String!]!
    attachments: [EmailAttachment!]!
  }

  # Email Campaign Types
  type EmailCampaign {
    _id: ID!
    name: String!
    description: String
    template: EmailTemplate!
    customContent: CampaignCustomContent
    type: CampaignType!
    category: CampaignCategory!
    priority: CampaignPriority!
    recipients: CampaignRecipients!
    scheduling: CampaignScheduling!
    status: CampaignStatus!
    sendOptions: CampaignSendOptions!
    abTest: CampaignABTest!
    stats: CampaignStats!
    deliveryLog: [CampaignDeliveryLog!]!
    createdBy: Admin!
    approvedBy: Admin
    approvedAt: DateTime
    requiresApproval: Boolean!
    approvalStatus: ApprovalStatus!
    rejectionReason: String
    tags: [String!]!
    notes: String
    createdAt: DateTime!
    updatedAt: DateTime!
    
    # Virtual fields
    openRate: Float
    clickRate: Float
    deliveryRate: Float
    bounceRate: Float
    unsubscribeRate: Float
    conversionRate: Float
    duration: Float
  }

  type CampaignCustomContent {
    subject: String
    htmlContent: String
    textContent: String
  }

  type CampaignRecipients {
    emails: [String!]!
    filters: CampaignFilters!
    exclude: CampaignExclude!
  }

  type CampaignFilters {
    userType: UserFilterType
    registrationDate: DateRange
    lastBookingDate: DateRange
    totalBookings: NumberRange
    totalSpent: NumberRange
    location: [String!]!
    tags: [String!]!
    customQuery: String
  }

  type CampaignExclude {
    emails: [String!]!
    unsubscribed: Boolean!
    bounced: Boolean!
    inactive: Boolean!
  }

  type DateRange {
    from: DateTime
    to: DateTime
  }

  type NumberRange {
    min: Float
    max: Float
  }

  type CampaignScheduling {
    type: SchedulingType!
    scheduledAt: DateTime
    timezone: String!
    recurring: CampaignRecurring
  }

  type CampaignRecurring {
    frequency: RecurringFrequency!
    interval: Int!
    daysOfWeek: [Int!]!
    dayOfMonth: Int
    endDate: DateTime
    maxOccurrences: Int
  }

  type CampaignSendOptions {
    batchSize: Int!
    delayBetweenBatches: Int!
    maxRetries: Int!
    personalization: Boolean!
  }

  type CampaignABTest {
    enabled: Boolean!
    variants: [ABTestVariant!]!
    testDuration: Int
    winnerMetric: ABTestMetric
  }

  type ABTestVariant {
    name: String!
    percentage: Float!
    subject: String
    htmlContent: String
    textContent: String
  }

  type CampaignStats {
    totalRecipients: Int!
    sentCount: Int!
    deliveredCount: Int!
    bouncedCount: Int!
    failedCount: Int!
    openedCount: Int!
    clickedCount: Int!
    unsubscribedCount: Int!
    revenue: Float!
    conversions: Int!
    startedAt: DateTime
    completedAt: DateTime
    lastSentAt: DateTime
  }

  type CampaignDeliveryLog {
    email: String!
    status: DeliveryStatus!
    timestamp: DateTime!
    messageId: String
    errorMessage: String
    variant: String
  }

  type EmailCampaignResponse {
    campaigns: [EmailCampaign!]!
    pagination: PaginationInfo!
  }

  type CampaignAnalytics {
    totalCampaigns: Int!
    totalSent: Int!
    totalDelivered: Int!
    totalOpened: Int!
    totalClicked: Int!
    totalRevenue: Float!
    avgOpenRate: Float!
    avgClickRate: Float!
  }

  # Enums
  enum EmailTemplateCategory {
    welcome
    verification
    booking
    payment
    reminder
    notification
    marketing
    announcement
    system
    custom
  }

  enum EmailTemplateType {
    transactional
    promotional
    system
  }

  enum TemplateVariableType {
    string
    number
    boolean
    date
    url
    email
  }

  enum TemplateTheme {
    default
    minimal
    modern
    corporate
    creative
  }

  enum TemplateLayout {
    single_column
    two_column
    sidebar
  }

  enum TriggerEvent {
    user_registered
    user_verified
    booking_created
    booking_confirmed
    payment_received
    payment_failed
    reminder_due
    verification_approved
    verification_rejected
    account_locked
    password_reset
  }

  enum ConditionOperator {
    equals
    not_equals
    contains
    not_contains
    greater_than
    less_than
  }

  enum DelayUnit {
    minutes
    hours
    days
  }

  enum CampaignType {
    blast
    drip
    triggered
    test
  }

  enum CampaignCategory {
    marketing
    announcement
    newsletter
    promotion
    update
    other
  }

  enum CampaignPriority {
    low
    normal
    high
    urgent
  }

  enum CampaignStatus {
    draft
    scheduled
    sending
    sent
    paused
    cancelled
    failed
  }

  enum UserFilterType {
    all
    clients
    verified
    unverified
    active
    inactive
    custom
  }

  enum SchedulingType {
    immediate
    scheduled
    recurring
  }

  enum RecurringFrequency {
    daily
    weekly
    monthly
    quarterly
    yearly
  }

  enum ABTestMetric {
    open_rate
    click_rate
    conversion_rate
  }

  enum DeliveryStatus {
    queued
    sent
    delivered
    bounced
    failed
    opened
    clicked
    unsubscribed
  }

  enum ApprovalStatus {
    pending
    approved
    rejected
  }

  # Input Types
  input EmailTemplateInput {
    name: String!
    description: String
    subject: String!
    htmlContent: String!
    textContent: String
    category: EmailTemplateCategory!
    type: EmailTemplateType
    variables: [TemplateVariableInput!]
    isActive: Boolean
    isDefault: Boolean
    priority: Int
    design: TemplateDesignInput
    triggers: [TemplateTriggerInput!]
    delivery: TemplateDeliveryInput
    tags: [String!]
    testRecipients: [String!]
  }

  input EmailTemplateUpdateInput {
    name: String
    description: String
    subject: String
    htmlContent: String
    textContent: String
    category: EmailTemplateCategory
    type: EmailTemplateType
    variables: [TemplateVariableInput!]
    isActive: Boolean
    isDefault: Boolean
    priority: Int
    design: TemplateDesignInput
    triggers: [TemplateTriggerInput!]
    delivery: TemplateDeliveryInput
    tags: [String!]
    testRecipients: [String!]
  }

  input TemplateVariableInput {
    name: String!
    description: String
    type: TemplateVariableType!
    required: Boolean
    defaultValue: String
  }

  input TemplateDesignInput {
    theme: TemplateTheme
    primaryColor: String
    backgroundColor: String
    fontFamily: String
    layout: TemplateLayout
  }

  input TemplateTriggerInput {
    event: TriggerEvent!
    conditions: [TriggerConditionInput!]
    delay: TriggerDelayInput
  }

  input TriggerConditionInput {
    field: String!
    operator: ConditionOperator!
    value: String!
  }

  input TriggerDelayInput {
    value: Int!
    unit: DelayUnit!
  }

  input TemplateDeliveryInput {
    fromName: String
    fromEmail: String
    replyTo: String
    bcc: [String!]
    attachments: [EmailAttachmentInput!]
  }

  input EmailAttachmentInput {
    name: String!
    url: String!
    type: String!
  }

  input EmailCampaignInput {
    name: String!
    description: String
    template: ID!
    customContent: CampaignCustomContentInput
    type: CampaignType
    category: CampaignCategory
    priority: CampaignPriority
    recipients: CampaignRecipientsInput!
    scheduling: CampaignSchedulingInput
    sendOptions: CampaignSendOptionsInput
    abTest: CampaignABTestInput
    requiresApproval: Boolean
    tags: [String!]
    notes: String
  }

  input CampaignCustomContentInput {
    subject: String
    htmlContent: String
    textContent: String
  }

  input CampaignRecipientsInput {
    emails: [String!]
    filters: CampaignFiltersInput
    exclude: CampaignExcludeInput
  }

  input CampaignFiltersInput {
    userType: UserFilterType
    registrationDate: DateRangeInput
    lastBookingDate: DateRangeInput
    totalBookings: NumberRangeInput
    totalSpent: NumberRangeInput
    location: [String!]
    tags: [String!]
    customQuery: String
  }

  input CampaignExcludeInput {
    emails: [String!]
    unsubscribed: Boolean
    bounced: Boolean
    inactive: Boolean
  }

  input DateRangeInput {
    from: DateTime
    to: DateTime
  }

  input NumberRangeInput {
    min: Float
    max: Float
  }

  input CampaignSchedulingInput {
    type: SchedulingType!
    scheduledAt: DateTime
    timezone: String
    recurring: CampaignRecurringInput
  }

  input CampaignRecurringInput {
    frequency: RecurringFrequency!
    interval: Int
    daysOfWeek: [Int!]
    dayOfMonth: Int
    endDate: DateTime
    maxOccurrences: Int
  }

  input CampaignSendOptionsInput {
    batchSize: Int
    delayBetweenBatches: Int
    maxRetries: Int
    personalization: Boolean
  }

  input CampaignABTestInput {
    enabled: Boolean!
    variants: [ABTestVariantInput!]
    testDuration: Int
    winnerMetric: ABTestMetric
  }

  input ABTestVariantInput {
    name: String!
    percentage: Float!
    subject: String
    htmlContent: String
    textContent: String
  }

  input EmailTemplateFilterInput {
    category: EmailTemplateCategory
    type: EmailTemplateType
    isActive: Boolean
    isDefault: Boolean
    search: String
    tags: [String!]
  }

  input EmailCampaignFilterInput {
    type: CampaignType
    category: CampaignCategory
    status: CampaignStatus
    approvalStatus: ApprovalStatus
    search: String
    tags: [String!]
    dateFrom: DateTime
    dateTo: DateTime
  }

  # Queries
  extend type Query {
    # Email Templates
    getEmailTemplates(
      filter: EmailTemplateFilterInput
      sort: SortInput
      page: Int = 1
      limit: Int = 20
    ): EmailTemplateResponse!

    getEmailTemplate(id: ID!): EmailTemplate
    getEmailTemplateBySlug(slug: String!): EmailTemplate
    
    getEmailTemplatesByCategory(
      category: EmailTemplateCategory!
    ): [EmailTemplate!]!
    
    compileEmailTemplate(
      id: ID!
      variables: JSON!
    ): CompiledTemplate!
    
    previewEmailTemplate(
      id: ID!
      variables: JSON!
    ): CompiledTemplate!

    # Email Campaigns
    getEmailCampaigns(
      filter: EmailCampaignFilterInput
      sort: SortInput
      page: Int = 1
      limit: Int = 20
    ): EmailCampaignResponse!

    getEmailCampaign(id: ID!): EmailCampaign
    getActiveCampaigns: [EmailCampaign!]!
    getScheduledCampaigns: [EmailCampaign!]!
    
    getCampaignAnalytics(
      dateFrom: DateTime
      dateTo: DateTime
    ): CampaignAnalytics!
    
    previewCampaignRecipients(
      recipients: CampaignRecipientsInput!
    ): [String!]!
  }

  # Mutations
  extend type Mutation {
    # Email Templates
    createEmailTemplate(input: EmailTemplateInput!): EmailTemplate!
    updateEmailTemplate(id: ID!, input: EmailTemplateUpdateInput!): EmailTemplate!
    deleteEmailTemplate(id: ID!): Boolean!
    
    duplicateEmailTemplate(id: ID!, name: String!): EmailTemplate!
    setDefaultTemplate(id: ID!, category: EmailTemplateCategory!): EmailTemplate!
    
    testEmailTemplate(
      id: ID!
      recipients: [String!]!
      variables: JSON!
    ): Boolean!
    
    revertTemplateVersion(
      id: ID!
      version: Int!
    ): EmailTemplate!

    # Email Campaigns
    createEmailCampaign(input: EmailCampaignInput!): EmailCampaign!
    updateEmailCampaign(id: ID!, input: EmailCampaignInput!): EmailCampaign!
    deleteEmailCampaign(id: ID!): Boolean!
    
    duplicateEmailCampaign(id: ID!, name: String!): EmailCampaign!
    
    # Campaign Actions
    startCampaign(id: ID!): EmailCampaign!
    pauseCampaign(id: ID!): EmailCampaign!
    resumeCampaign(id: ID!): EmailCampaign!
    cancelCampaign(id: ID!): EmailCampaign!
    
    # Campaign Approval
    approveEmailCampaign(id: ID!, notes: String): EmailCampaign!
    rejectEmailCampaign(id: ID!, reason: String!): EmailCampaign!
    
    # Test Campaign
    testCampaign(
      id: ID!
      recipients: [String!]!
    ): Boolean!
    
    # Send one-off email
    sendQuickEmail(
      template: ID!
      recipients: [String!]!
      variables: JSON!
      customSubject: String
    ): Boolean!
  }
`;

export default emailTemplateTypeDefs;
