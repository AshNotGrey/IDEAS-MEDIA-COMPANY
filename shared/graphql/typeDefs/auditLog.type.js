import { gql } from 'graphql-tag';

export default gql`
  type AuditLog {
    _id: ID!
    uuid: String!
    action: String!
    actor: Actor!
    target: Target!
    details: LogDetails!
    result: LogResult!
    category: LogCategory!
    severity: LogSeverity!
    riskLevel: RiskLevel!
    compliance: Compliance!
    session: SessionInfo
    tags: [String!]!
    flags: LogFlags!
    isRecent: Boolean!
    daysUntilExpiry: Int!
    isHighRisk: Boolean!
    createdAt: String!
    expiresAt: String!
  }

  type Actor {
    user: User
    userInfo: UserInfo
    isSystem: Boolean!
    systemProcess: String
  }

  type UserInfo {
    name: String
    email: String
    role: String
  }

  type Target {
    resourceType: String!
    resourceId: String
    resourceName: String
    previousState: JSON
    newState: JSON
  }

  type LogDetails {
    description: String
    reason: String
    request: RequestInfo
    metadata: JSON
    relatedEntities: [RelatedEntity!]!
  }

  type RequestInfo {
    method: String
    url: String
    userAgent: String
    ip: String
    headers: JSON
  }

  type RelatedEntity {
    type: String!
    id: String!
    name: String
  }

  type LogResult {
    status: ResultStatus!
    message: String
    errorCode: String
    errorDetails: String
    duration: Int
    resourcesAffected: Int
  }

  type Compliance {
    gdpr: Boolean!
    dataProcessing: Boolean!
    financialTransaction: Boolean!
  }

  type SessionInfo {
    sessionId: String
    sessionStart: String
    userAgent: String
    device: String
    browser: String
    os: String
    location: LocationInfo
  }

  type LocationInfo {
    country: String
    city: String
    ip: String
  }

  type LogFlags {
    sensitive: Boolean!
    exported: Boolean!
    reviewed: Boolean!
    anomaly: Boolean!
  }

  enum LogCategory {
    security
    user_management
    content_management
    system
    business
    technical
  }

  enum LogSeverity {
    low
    medium
    high
    critical
  }

  enum RiskLevel {
    low
    medium
    high
    critical
  }

  enum ResultStatus {
    success
    failure
    partial
  }

  input AuditLogFilterInput {
    action: String
    actor: ID
    category: LogCategory
    severity: LogSeverity
    riskLevel: RiskLevel
    status: ResultStatus
    resourceType: String
    resourceId: String
    dateFrom: String
    dateTo: String
    search: String
    tags: [String!]
    anomalyOnly: Boolean
    highRiskOnly: Boolean
  }

  type AuditLogsResponse {
    logs: [AuditLog!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  type AuditLogStats {
    totalLogs: Int!
    recentLogs: Int!
    securityEvents: Int!
    failedActions: Int!
    highRiskEvents: Int!
    anomalies: Int!
    logsByCategory: [LogCategoryCount!]!
    logsBySeverity: [LogSeverityCount!]!
  }

  type LogCategoryCount {
    category: LogCategory!
    count: Int!
  }

  type LogSeverityCount {
    severity: LogSeverity!
    count: Int!
  }

  type Query {
    auditLogs(
      filter: AuditLogFilterInput
      page: Int = 1
      limit: Int = 50
      sortBy: String = "createdAt"
      sortOrder: String = "desc"
    ): AuditLogsResponse!
    
    auditLog(id: ID!): AuditLog
    userActivity(userId: ID!, limit: Int = 50): [AuditLog!]!
    securityEvents(timeframe: Int = 24): [AuditLog!]!
    failedActions(timeframe: Int = 24): [AuditLog!]!
    resourceHistory(resourceType: String!, resourceId: String!): [AuditLog!]!
    anomalies: [AuditLog!]!
    
    auditLogStats: AuditLogStats!
  }

  type Mutation {
    markLogAsReviewed(id: ID!): AuditLog!
    flagLogAsAnomaly(id: ID!): AuditLog!
    addLogTag(id: ID!, tag: String!): AuditLog!
    exportLogs(filter: AuditLogFilterInput): String! # Returns download URL
  }
`; 