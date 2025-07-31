import { gql } from 'graphql-tag';

export default gql`
  type Settings {
    _id: ID!
    uuid: String!
    key: String!
    name: String!
    description: String
    category: SettingsCategory!
    value: JSON
    type: SettingsType!
    defaultValue: JSON
    validation: SettingsValidation
    ui: SettingsUI!
    isSecret: Boolean!
    accessLevel: AccessLevel!
    isActive: Boolean!
    isSystem: Boolean!
    requiresRestart: Boolean!
    environment: Environment!
    history: [SettingsHistory!]!
    lastModifiedBy: User
    tags: [String!]!
    notes: String
    isModified: Boolean!
    hasHistory: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type SettingsValidation {
    required: Boolean!
    min: Float
    max: Float
    minLength: Int
    maxLength: Int
    pattern: String
    enum: [String!]
    customValidator: String
  }

  type SettingsUI {
    inputType: InputType!
    placeholder: String
    helpText: String
    options: [SettingsOption!]!
    group: String
    order: Int!
    hidden: Boolean!
    readonly: Boolean!
  }

  type SettingsOption {
    value: String!
    label: String!
  }

  type SettingsHistory {
    previousValue: JSON
    newValue: JSON
    changedBy: User
    changedAt: String!
    reason: String
    ipAddress: String
  }

  enum SettingsCategory {
    general
    branding
    integrations
    notifications
    security
    payments
    email
    sms
    whatsapp
    theme
    analytics
    business
    inventory
    booking
    maintenance
  }

  enum SettingsType {
    string
    number
    boolean
    object
    array
    json
    password
    url
    email
  }

  enum AccessLevel {
    public
    admin
    super_admin
    system
  }

  enum Environment {
    all
    development
    staging
    production
  }

  enum InputType {
    text
    password
    email
    url
    number
    boolean
    select
    textarea
    json
    file
  }

  input UpdateSettingsInput {
    key: String!
    value: JSON!
    reason: String
  }

  input SettingsFilterInput {
    category: SettingsCategory
    accessLevel: AccessLevel
    environment: Environment
    isActive: Boolean
    isSecret: Boolean
    search: String
  }

  type SettingsResponse {
    settings: [Settings!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  type Query {
    settings(
      filter: SettingsFilterInput
      page: Int = 1
      limit: Int = 50
    ): SettingsResponse!
    
    setting(key: String!): Settings
    settingsByCategory(category: SettingsCategory!): [Settings!]!
    publicSettings: [Settings!]!
  }

  type Mutation {
    updateSetting(input: UpdateSettingsInput!): Settings!
    resetSetting(key: String!, reason: String = "Reset to default"): Settings!
    bulkUpdateSettings(inputs: [UpdateSettingsInput!]!): [Settings!]!
  }
`; 