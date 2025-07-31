import { gql } from 'graphql-tag';

export default gql`
  # Notification Types
  type Notification {
    _id: ID!
    uuid: String!
    title: String!
    message: String!
    summary: String
    type: NotificationType!
    category: NotificationCategory!
    priority: NotificationPriority!
    channels: NotificationChannels!
    recipients: NotificationRecipients!
    content: NotificationContent!
    scheduling: NotificationScheduling!
    status: NotificationStatus!
    deliveryStatus: NotificationDeliveryStatus!
    analytics: NotificationAnalytics!
    settings: NotificationSettings!
    relatedEntity: RelatedEntity
    createdBy: User!
    approvedBy: User
    approvedAt: String
    tags: [String!]!
    metadata: JSON
    isScheduled: Boolean!
    isOverdue: Boolean!
    recipientCount: Int!
    createdAt: String!
    updatedAt: String!
  }

  type NotificationChannels {
    inApp: Boolean!
    email: Boolean!
    sms: Boolean!
    push: Boolean!
  }

  type NotificationRecipients {
    users: [User!]!
    roles: [UserRole!]!
    broadcast: Boolean!
    filters: RecipientFilters!
  }

  type RecipientFilters {
    verifiedOnly: Boolean!
    activeOnly: Boolean!
    newUsers: Boolean!
    hasBookings: Boolean!
  }

  type NotificationContent {
    html: String
    emailSubject: String
    emailTemplate: String
    actionButtons: [ActionButton!]!
    attachments: [Attachment!]!
    icon: String
    image: String
    avatar: String
  }

  type ActionButton {
    text: String!
    action: String!
    style: ButtonStyle!
  }

  type Attachment {
    type: String!
    url: String!
    name: String!
  }

  type NotificationScheduling {
    sendAt: String!
    timezone: String!
    isRecurring: Boolean!
    recurrence: RecurrenceType
    recurrenceEnd: String
    nextSendDate: String
  }

  type NotificationDeliveryStatus {
    inApp: DeliveryChannelStatus!
    email: EmailDeliveryStatus!
    sms: DeliveryChannelStatus!
    push: PushDeliveryStatus!
  }

  type DeliveryChannelStatus {
    status: DeliveryStatus!
    deliveredAt: String
    error: String
  }

  type EmailDeliveryStatus {
    status: DeliveryStatus!
    deliveredAt: String
    error: String
    opened: Boolean!
    openedAt: String
  }

  type PushDeliveryStatus {
    status: DeliveryStatus!
    deliveredAt: String
    error: String
    clicked: Boolean!
    clickedAt: String
  }

  type NotificationAnalytics {
    totalRecipients: Int!
    delivered: Int!
    opened: Int!
    clicked: Int!
    failed: Int!
    deliveryRate: Float!
    openRate: Float!
    clickRate: Float!
  }

  type NotificationSettings {
    autoDismiss: Boolean!
    dismissAfter: Int!
    persistent: Boolean!
    sound: String!
    badge: Int
    group: String
    tag: String
  }

  type RelatedEntity {
    type: String!
    ref: String!
  }

  # Enums
  enum NotificationType {
    system
    booking
    payment
    reminder
    promotion
    announcement
    verification
    security
  }

  enum NotificationCategory {
    info
    success
    warning
    error
    urgent
  }

  enum NotificationPriority {
    low
    normal
    high
    urgent
  }

  enum NotificationStatus {
    draft
    scheduled
    sending
    sent
    failed
    cancelled
  }

  enum ButtonStyle {
    primary
    secondary
    danger
  }

  enum DeliveryStatus {
    pending
    delivered
    failed
  }

  # Input Types
  input CreateNotificationInput {
    title: String!
    message: String!
    summary: String
    type: NotificationType!
    category: NotificationCategory = info
    priority: NotificationPriority = normal
    channels: NotificationChannelsInput!
    recipients: NotificationRecipientsInput!
    content: NotificationContentInput
    scheduling: NotificationSchedulingInput
    settings: NotificationSettingsInput
    relatedEntity: RelatedEntityInput
    tags: [String!]
    metadata: JSON
  }

  input NotificationChannelsInput {
    inApp: Boolean = true
    email: Boolean = false
    sms: Boolean = false
    push: Boolean = false
  }

  input NotificationRecipientsInput {
    users: [ID!]
    roles: [UserRole!]
    broadcast: Boolean = false
    filters: RecipientFiltersInput
  }

  input RecipientFiltersInput {
    verifiedOnly: Boolean = false
    activeOnly: Boolean = true
    newUsers: Boolean = false
    hasBookings: Boolean = false
  }

  input NotificationContentInput {
    html: String
    emailSubject: String
    emailTemplate: String
    actionButtons: [ActionButtonInput!]
    attachments: [AttachmentInput!]
    icon: String
    image: String
    avatar: String
  }

  input ActionButtonInput {
    text: String!
    action: String!
    style: ButtonStyle = primary
  }

  input AttachmentInput {
    type: String!
    url: String!
    name: String!
  }

  input NotificationSchedulingInput {
    sendAt: String = null
    timezone: String = "Africa/Lagos"
    isRecurring: Boolean = false
    recurrence: RecurrenceType
    recurrenceEnd: String
  }

  input NotificationSettingsInput {
    autoDismiss: Boolean = false
    dismissAfter: Int = 5000
    persistent: Boolean = false
    sound: String = "default"
    badge: Int
    group: String
    tag: String
  }

  input RelatedEntityInput {
    type: String!
    ref: String!
  }

  input NotificationFilterInput {
    type: NotificationType
    category: NotificationCategory
    status: NotificationStatus
    priority: NotificationPriority
    createdBy: ID
    search: String
    tags: [String!]
  }

  # Response Types
  type NotificationsResponse {
    notifications: [Notification!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  type NotificationStats {
    totalNotifications: Int!
    sentNotifications: Int!
    failedNotifications: Int!
    pendingNotifications: Int!
    averageDeliveryRate: Float!
    averageOpenRate: Float!
    notificationsByType: [NotificationTypeCount!]!
    notificationsByStatus: [NotificationStatusCount!]!
  }

  type NotificationTypeCount {
    type: NotificationType!
    count: Int!
  }

  type NotificationStatusCount {
    status: NotificationStatus!
    count: Int!
  }

  # Queries
  type Query {
    # User queries
    myNotifications(
      limit: Int = 20
      unreadOnly: Boolean = false
    ): [Notification!]!
    
    # Admin queries
    notifications(
      filter: NotificationFilterInput
      page: Int = 1
      limit: Int = 20
      sortBy: String = "createdAt"
      sortOrder: String = "desc"
    ): NotificationsResponse!
    
    notification(id: ID!): Notification
    pendingNotifications: [Notification!]!
    
    # Analytics
    notificationStats: NotificationStats!
  }

  # Mutations
  type Mutation {
    # Notification management
    createNotification(input: CreateNotificationInput!): Notification!
    updateNotification(id: ID!, input: CreateNotificationInput!): Notification!
    deleteNotification(id: ID!): Boolean!
    duplicateNotification(id: ID!): Notification!
    
    # Notification control
    sendNotification(id: ID!): Notification!
    cancelNotification(id: ID!): Notification!
    
    # User interactions
    markNotificationAsRead(id: ID!): Boolean!
    markAllNotificationsAsRead: Boolean!
    
    # Analytics tracking
    recordNotificationOpen(id: ID!, channel: String = "email"): Boolean!
    recordNotificationClick(id: ID!, channel: String = "push"): Boolean!
  }

  # Subscriptions
  type Subscription {
    notificationReceived(userId: ID!): Notification!
    notificationStatusChanged(notificationId: ID!): Notification!
  }
`; 