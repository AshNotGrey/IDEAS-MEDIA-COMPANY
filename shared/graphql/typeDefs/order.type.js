import { gql } from 'graphql-tag';

export default gql`
  # Order Types
  type Order {
    _id: ID!
    uuid: String!
    orderNumber: String!
    customer: User!
    customerInfo: CustomerInfo!
    referrerInfo: ReferrerInfo!
    orderType: OrderType!
    items: [OrderItem!]!
    pricing: OrderPricing!
    status: OrderStatus!
    workflow: OrderWorkflow!
    payment: PaymentInfo!
    fulfillment: FulfillmentInfo!
    communications: [Communication!]!
    analytics: OrderAnalytics
    assignedTo: User
    tags: [String!]!
    internalNotes: [InternalNote!]!
    receipt: ReceiptInfo!
    cancellation: CancellationInfo
    returns: ReturnsInfo
    totalItems: Int!
    isOverdue: Boolean!
    canBeCancelled: Boolean!
    needsVerification: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type CustomerInfo {
    name: String!
    email: String!
    phone: String!
    verificationStatus: CustomerVerificationStatus!
  }

  type CustomerVerificationStatus {
    nin: VerificationStatusEnum!
    driversLicense: VerificationStatusEnum!
  }

  type OrderItem {
    _id: ID!
    product: Product!
    productInfo: ProductSnapshot!
    quantity: Int!
    unitPrice: Float!
    discount: ItemDiscount
    subtotal: Float!
    rentalPeriod: RentalPeriod
    serviceDetails: ServiceDetails
    status: OrderItemStatus!
  }

  type ProductSnapshot {
    name: String!
    sku: String!
    type: ProductType!
    category: String!
    images: ProductImages
  }

  type ProductImages {
    thumbnail: String
  }

  type ItemDiscount {
    type: DiscountType!
    value: Float!
    reason: String
  }

  type RentalPeriod {
    startDate: String!
    endDate: String!
    duration: Int!
    pickupTime: String
    returnTime: String
  }

  type ServiceDetails {
    date: String!
    time: String!
    duration: Int!
    location: ServiceLocation!
    specialRequests: [String!]!
  }

  type ServiceLocation {
    type: LocationType!
    address: String
    coordinates: Coordinates
  }

  type Coordinates {
    lat: Float!
    lng: Float!
  }

  type OrderPricing {
    subtotal: Float!
    discountTotal: Float!
    taxTotal: Float!
    shippingTotal: Float!
    securityDeposit: Float!
    total: Float!
    currency: String!
  }

  type OrderWorkflow {
    placedAt: String
    confirmedAt: String
    preparedAt: String
    deliveredAt: String
    completedAt: String
    cancelledAt: String
  }

  type PaymentInfo {
    method: PaymentMethod
    status: PaymentStatus!
    paystack: PaystackInfo
    amounts: PaymentAmounts!
    transactionHistory: [Transaction!]!
  }

  type PaystackInfo {
    reference: String
    accessCode: String
    authorizationUrl: String
    transactionId: String
    paidAt: String
  }

  type PaymentAmounts {
    paid: Float!
    refunded: Float!
    pending: Float!
  }

  type Transaction {
    type: TransactionType!
    amount: Float!
    reference: String!
    date: String!
    notes: String
  }

  type FulfillmentInfo {
    method: FulfillmentMethod!
    location: String!
    address: Address
    scheduledDate: String
    scheduledTime: String
    actualDate: String
    actualTime: String
    instructions: String
    notes: String
  }

  type Communication {
    type: CommunicationType!
    content: String!
    sentAt: String!
    sentBy: User
  }

  type OrderAnalytics {
    source: String
    campaign: String
    device: String
    browser: String
    timeToCheckout: Int
    timeToPayment: Int
    timeToFulfillment: Int
  }

  type InternalNote {
    _id: ID!
    note: String!
    addedBy: User!
    addedAt: String!
  }

  type ReceiptInfo {
    generated: Boolean!
    generatedAt: String
    url: String
    emailSent: Boolean!
    emailSentAt: String
  }

  type CancellationInfo {
    reason: String!
    cancelledBy: User!
    cancelledAt: String!
    refundAmount: Float
    refundStatus: RefundStatus
  }

  type ReturnsInfo {
    expectedReturnDate: String!
    actualReturnDate: String
    condition: ReturnCondition
    damageNotes: String
    extraCharges: [ExtraCharge!]!
    depositReturned: Boolean!
    depositReturnedAt: String
  }

  type ExtraCharge {
    reason: String!
    amount: Float!
  }

  # Enums
  enum ProductType {
    equipment_rental
    mini_mart_sale
    service_package
  }

  enum OrderType {
    rental
    purchase
    booking
    mixed
  }

  enum OrderStatus {
    cart
    checkout
    payment_pending
    payment_failed
    payment_confirmed
    processing
    ready_for_pickup
    in_progress
    completed
    cancelled
    refunded
  }

  enum OrderItemStatus {
    pending
    confirmed
    preparing
    ready
    delivered
    returned
    cancelled
  }

  enum DiscountType {
    percentage
    fixed
  }

  enum LocationType {
    studio
    outdoor
    client_location
  }

  enum PaymentMethod {
    paystack
    bank_transfer
    cash
    partial
  }

  enum PaymentStatus {
    pending
    processing
    completed
    failed
    refunded
    partially_refunded
  }

  enum TransactionType {
    payment
    refund
    chargeback
  }

  enum FulfillmentMethod {
    pickup
    delivery
  }

  enum CommunicationType {
    email
    sms
    call
    whatsapp
  }

  enum RefundStatus {
    pending
    processed
    failed
  }

  enum ReturnCondition {
    excellent
    good
    fair
    damaged
  }

  # Input Types
  input AddToCartInput {
    productId: ID!
    quantity: Int! = 1
    rentalPeriod: RentalPeriodInput
    serviceDetails: ServiceDetailsInput
  }

  input RentalPeriodInput {
    startDate: String!
    endDate: String!
    pickupTime: String
    returnTime: String
    referee: RefereeInfoInput
  }
  
  input RefereeInfoInput {
    name: String!
    email: String!
    phone: String!
  }

  input ServiceDetailsInput {
    date: String!
    time: String!
    duration: Int!
    location: ServiceLocationInput!
    specialRequests: [String!]
  }

  input ServiceLocationInput {
    type: LocationType!
    address: String
    coordinates: CoordinatesInput
  }

  input CoordinatesInput {
    lat: Float!
    lng: Float!
  }

  input UpdateCartItemInput {
    productId: ID!
    quantity: Int!
  }

  input CheckoutInput {
    referrerInfo: ReferrerInfoInput!
    fulfillment: FulfillmentInput
    notes: String
  }

  input FulfillmentInput {
    method: FulfillmentMethod!
    scheduledDate: String
    scheduledTime: String
    instructions: String
  }

  input PaymentInput {
    method: PaymentMethod!
    reference: String
  }

  input OrderFilterInput {
    status: OrderStatus
    orderType: OrderType
    customer: ID
    assignedTo: ID
    dateFrom: String
    dateTo: String
    search: String
  }

  input AddInternalNoteInput {
    orderId: ID!
    note: String!
  }

  input ProcessReturnInput {
    orderId: ID!
    condition: ReturnCondition!
    damageNotes: String
    extraCharges: [ExtraChargeInput!]
  }

  input ExtraChargeInput {
    reason: String!
    amount: Float!
  }

  # Response Types
  type OrdersResponse {
    orders: [Order!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  type CartResponse {
    order: Order
    message: String!
  }

  type PaymentResponse {
    success: Boolean!
    order: Order
    paymentUrl: String
    reference: String
    message: String!
  }

  type OrderStats {
    totalOrders: Int!
    activeOrders: Int!
    completedOrders: Int!
    totalRevenue: Float!
    ordersByStatus: [StatusCount!]!
    ordersByType: [TypeCount!]!
    overdueRentals: Int!
  }

  type StatusCount {
    status: OrderStatus!
    count: Int!
  }

  type TypeCount {
    type: OrderType!
    count: Int!
  }

  # Queries
  type Query {
    # Customer queries
    myCart: Order
    myOrders(
      page: Int = 1
      limit: Int = 20
      status: OrderStatus
    ): OrdersResponse!
    myOrder(id: ID!): Order
    
    # Admin queries
    orders(
      filter: OrderFilterInput
      page: Int = 1
      limit: Int = 20
      sortBy: String = "createdAt"
      sortOrder: String = "desc"
    ): OrdersResponse!
    
    order(id: ID!): Order
    orderByNumber(orderNumber: String!): Order
    
    # Analytics queries
    orderStats: OrderStats!
    overdueRentals: [Order!]!
    recentOrders(limit: Int = 10): [Order!]!
    
    # Revenue queries
    dailyRevenue(days: Int = 30): [RevenueData!]!
    monthlyRevenue(months: Int = 12): [RevenueData!]!
  }

  type RevenueData {
    date: String!
    revenue: Float!
    orderCount: Int!
  }

  # Mutations
  type Mutation {
    # Cart management
    addToCart(input: AddToCartInput!): CartResponse!
    updateCartItem(input: UpdateCartItemInput!): CartResponse!
    removeFromCart(productId: ID!): CartResponse!
    clearCart: CartResponse!
    
    # Checkout process
    proceedToCheckout(input: CheckoutInput!): Order!
    initiatePayment(orderId: ID!, input: PaymentInput!): PaymentResponse!
    confirmPayment(orderId: ID!, reference: String!): Order!
    
    # Order management (Admin)
    updateOrderStatus(id: ID!, status: OrderStatus!): Order!
    assignOrder(id: ID!, assigneeId: ID!): Order!
    addInternalNote(input: AddInternalNoteInput!): Order!
    
    # Fulfillment
    markOrderReady(id: ID!): Order!
    markOrderDelivered(id: ID!): Order!
    markOrderCompleted(id: ID!): Order!
    
    # Cancellation and refunds
    cancelOrder(id: ID!, reason: String!): Order!
    processRefund(id: ID!, amount: Float!, reason: String!): Order!
    
    # Returns (for rentals)
    processReturn(input: ProcessReturnInput!): Order!
    releaseDeposit(orderId: ID!): Order!
    
    # Receipt generation
    generateReceipt(orderId: ID!): Order!
    emailReceipt(orderId: ID!): Boolean!
  }

  # Subscriptions
  type Subscription {
    orderUpdated(customerId: ID): Order!
    newOrder: Order!
    orderStatusChanged(orderId: ID!): Order!
  }
`; 