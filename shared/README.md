# ideal-photography-shared

A comprehensive shared package for photography business applications with GraphQL (Apollo Server v5) and Mongoose integration. It powers bookings, rentals, mini‑mart sales, client galleries, notifications, campaigns, settings, and admin workflows.

## 🚀 Features

- **Domain Models**: `User`, `Product`, `Service`, `Booking`, `Order` (cart/checkout/payments), `Gallery`, `Review`, `Notification`, `Campaign`, `Settings`, `AuditLog`
- **GraphQL Integration**: Apollo Server v5 helpers (`createApolloServer`, `applyApolloMiddleware`) with merged `typeDefs`/`resolvers`
- **MongoDB Integration**: Mongoose models with indexes, virtuals, and rich methods
- **Auth Context Helpers**: `requireAuth`, `requireAdmin`, role/permission checks (pluggable JWT verification placeholder)
- **Orders & Cart**: Add/update/remove items, checkout, payment initiation/confirmation (Paystack placeholder), admin order ops
- **Notifications**: Multi‑channel schema (in‑app/email/SMS/push) with analytics fields
- **Campaigns**: Hero/banner/popup configs with targeting, schedule, and analytics
- **Settings**: Strongly‑typed settings with validation and history tracking
- **Audit Logs**: Structured action logging with expiry, severity, compliance flags
- **Validation Utilities**: Common validators (when imported via `@ideal-photography/shared/validations/common.js`)

## 📦 Installation

```bash
npm install @ideal-photography/shared
```

## 🏗️ Quick Start

### 1) Set up your server with Apollo Server v5

```js
import express from 'express';
import { createApolloServer, applyApolloMiddleware, connectDB } from '@ideal-photography/shared';

const app = express();

// Connect to MongoDB
await connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/ideal-photography');

// Create Apollo Server instance
const server = createApolloServer({
  context: ({ req }) => ({
    // Add authentication context here
    user: req.user,
  }),
});

// Apply Apollo middleware to Express app
await applyApolloMiddleware(app, server, {
  context: ({ req }) => ({
    user: req.user,
  }),
});

app.listen(4000, () => {
  console.log(`🚀 Server ready at http://localhost:4000/graphql`);
});
```

### 2) Alternative setup with manual configuration

```js
import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { typeDefs, resolvers, connectDB } from '@ideal-photography/shared';

const app = express();

// Connect to MongoDB
await connectDB(process.env.MONGODB_URI || 'mongodb://localhost:27017/ideal-photography');

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    user: req.user,
  }),
});

// Start server and apply middleware
await server.start();
app.use('/graphql', expressMiddleware(server, {
  context: async ({ req }) => ({
    user: req.user,
  }),
}));

app.listen(4000, () => {
  console.log(`🚀 Server ready at http://localhost:4000/graphql`);
});
```

### 3) Use models directly

```js
import { models } from '@ideal-photography/shared';

// Create a user
const user = await models.User.create({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'securepassword123',
  role: 'client'
});

// Create a booking
const booking = await models.Booking.create({
  client: user._id,
  product: productId,
  date: new Date('2024-01-15'),
  time: '14:00',
  duration: 2,
  totalAmount: 150,
  location: {
    type: 'studio',
    address: '123 Studio St'
  }
});
```

### 4) Use validation utilities

```js
import {
  isEmail,
  isValidPrice,
  isValidRating,
  isValidBookingStatus
} from '@ideal-photography/shared/validations/common.js';

// Validate user input
if (!isEmail(email)) {
  throw new Error('Invalid email format');
}

if (!isValidPrice(price)) {
  throw new Error('Invalid price value');
}
```

## 📚 Models Overview

### User Model
- **Purpose**: Handle client and admin authentication
- **Features**: Password hashing, role-based access, email validation
- **Relations**: One-to-many with Bookings, Reviews, Galleries

### Product Model
- **Purpose**: Photography packages, equipment, and services catalog
- **Features**: Category filtering, price ranges, search indexing
- **Categories**: photography, videography, equipment, package, editing

### Service Model
- **Purpose**: Detailed service offerings with pricing structures
- **Features**: Flexible pricing (fixed, hourly, per_photo, package), add-ons, deliverables
- **Categories**: portrait, wedding, event, commercial, fashion, landscape, product

### Booking Model
- **Purpose**: Manage photography session bookings
- **Features**: Location tracking, payment status, contact info, special requests
- **Status Flow**: pending → confirmed → in_progress → completed/cancelled

### Order Model
- **Purpose**: Unified cart/checkout/order workflow for rentals, purchases, and bookings
- **Features**: Item snapshotting, pricing breakdown, payment info (Paystack placeholder), fulfillment, analytics, internal notes
- **Status Flow**: cart → checkout → payment_pending/confirmed → processing → ready_for_pickup/in_progress → completed/cancelled

### Gallery Model
- **Purpose**: Photo galleries and client portfolios
- **Features**: Public/private galleries, access codes, download controls, view tracking
- **Settings**: Download permissions, watermarks, right-click protection

### Review Model
- **Purpose**: Customer feedback and testimonials
- **Features**: Multi-category ratings, admin responses, helpful votes, approval workflow
- **Categories**: communication, quality, professionalism, value, timeliness

### Notification Model
- **Purpose**: Multi‑channel messaging with tracking (in‑app/email/SMS/push)
- **Features**: Targeting by users/roles/broadcast, delivery analytics, scheduling and recurrence

### Campaign Model
- **Purpose**: Configurable promos (hero carousel, banners, popups) with targeting and schedule
- **Features**: CTA analytics, priority, theme overrides

### Settings Model
- **Purpose**: Centralized configuration with validation, history, UI hints, access levels

### AuditLog Model
- **Purpose**: High‑fidelity action logging with severity, risk, compliance flags and TTL expiry

## 🔧 GraphQL Operations

### Available Queries (high level)
- **Auth**: `me`, `users`, `user`, `userByEmail`, stats/queues
- **Products/Services**: listings, featured, by category
- **Bookings**: bookings, booking by id
- **Orders**: `myCart`, `myOrders`, `orders`, `order`, `orderStats`, revenue series, overdue rentals
- **Galleries**: public/featured/client galleries, by access code
- **Reviews**: public/featured/client, averages
- **Notifications**: user/admin listings, stats
- **Campaigns**: active/scheduled, by placement/type
- **Settings**: listings, by category, public
- **Audit Logs**: listings, stats, resource history

### Available Mutations (selected)
- **Auth**: register, login, password/email flows, profile updates, admin user ops
- **Orders (Cart/Checkout)**: addToCart, updateCartItem, removeFromCart, clearCart, proceedToCheckout, initiatePayment, confirmPayment
- **Order Admin**: updateOrderStatus, assignOrder, addInternalNote, receipts, returns
- **Content**: create/update/delete for Product/Service/Booking/Gallery/Review
- **Notifications/Campaigns/Settings**: full CRUD and control actions
- **Audit**: tagging/flags, export (placeholder)

## 📊 Database Indexes

The models include optimized indexes for common queries:

- **Product**: Text on name/description/tags; price/rental indexes; analytics
- **Service**: Text on name/description/tags
- **Booking**: client+date, date+status, product
- **Order**: customer/status, orderNumber, orderType, payment.status, createdAt, fulfillment.scheduledDate
- **Gallery**: category+isPublished, featured
- **Review**: product/service, rating, createdAt
- **Notification**: type/category/status, recipients, scheduling, analytics
- **Campaign**: type/placement, status/active, schedule, priority
- **AuditLog**: action/actor/target/severity/status, text index, TTL via `expiresAt`
- **Settings**: keys/categories as defined in model

## 📝 Changelog

### v1.2.8 (Latest)
- **Docs**: Updated README with Orders/Notifications/Campaigns/Settings/AuditLog coverage
- **Docs**: Switched examples to ESM imports and simplified package entry points
- **Docs**: Corrected license section to match repository license

### v1.2.7
- Fixed ES module import/export issues in GraphQL type definitions
- Fixed missing enums in order type definitions
- Improved schema validation and error handling
- Added ES module support for all shared components

## 🛠️ Example Usage

### Create a complete booking system

```js
const { models } = require('@ideal-photography/shared/mongoDB');

// Create a photography service
const service = await models.Service.create({
  name: 'Portrait Session',
  description: 'Professional portrait photography session',
  category: 'portrait',
  basePrice: 150,
  priceStructure: {
    type: 'fixed',
    packageDetails: '2-hour session with 20 edited photos'
  },
  duration: { min: 1, max: 3 },
  includes: ['Professional editing', 'Online gallery', 'Print rights'],
  deliverables: {
    photos: { digital: 20, prints: 5 },
    editedPhotos: 20,
    deliveryTime: '7-10 days',
    format: ['jpeg', 'raw']
  }
});

// Create a booking
const booking = await models.Booking.create({
  client: userId,
  product: service._id,
  date: new Date('2024-01-20'),
  time: '15:00',
  duration: 2,
  totalAmount: 150,
  location: {
    type: 'studio',
    address: '123 Photography Studio'
  },
  contactInfo: {
    phone: '+1234567890',
    email: 'client@example.com'
  }
});
```

### Set up admin operations

```js
// Get dashboard statistics
const stats = await models.Booking.aggregate([
  { $match: { status: { $in: ['confirmed', 'completed'] } } },
  { $group: { 
    _id: null, 
    totalBookings: { $sum: 1 },
    totalRevenue: { $sum: '$totalAmount' }
  }}
]);

// Get pending reviews for moderation
const pendingReviews = await models.Review.find({ isApproved: false })
  .populate('client')
  .populate('booking')
  .sort({ createdAt: -1 });
```

## 🔒 Security Notes

- **JWT Authentication** integration point provided; actual JWT verification is left to host app
- **Role-based permissions** helpers for resolvers
- **Password hashing** and account safety fields on `User`
- **Input validation** utilities available in `validations/common.js`
- **CORS/Helmet** should be configured in the host app

## 📈 Performance Optimizations

- **Query batching** for efficient network usage
- **Fragment reuse** for consistent data fetching
- **Cache normalization** for optimal memory usage
- **Database indexing** for fast queries
- **Population strategies** for related data

## 🔄 Migration from Apollo Server v3

If you're upgrading from Apollo Server v3, here are the key changes:

### Before (v3)
```js
const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('@ideal-photography/shared/graphql');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ user: req.user }),
});

server.applyMiddleware({ app });
```

### After (v5)
```js
const { createApolloServer, applyApolloMiddleware } = require('@ideal-photography/shared/graphql');

const server = createApolloServer({
  context: ({ req }) => ({ user: req.user }),
});

await applyApolloMiddleware(app, server);
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This package is provided under a proprietary license. See the [LICENSE](LICENSE) file for terms.

## 🆘 Support

- 📧 Email: support@idealphotography.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/ideal-photography-shared/issues)
- 📖 Documentation: [GitHub Wiki](https://github.com/your-username/ideal-photography-shared/wiki)

## 🔗 Related Packages

- `@apollo/client` - GraphQL client for React applications
- `@apollo/server` - GraphQL server for Node.js
- `mongoose` - MongoDB object modeling for Node.js

---

**Built with ❤️ for the photography community** 