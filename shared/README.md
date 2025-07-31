# ideal-photography-shared

A comprehensive shared package for photography business applications with GraphQL and Mongoose integration. Perfect for building photography booking systems, gallery management, client portals, and admin panels.

## 🚀 Features

- **Complete Photography Business Models**: User, Product, Service, Booking, Gallery, and Review entities
- **GraphQL Integration**: Ready-to-use Apollo Server v4 typeDefs and resolvers
- **MongoDB Integration**: Mongoose models with optimized indexes and relationships
- **Authentication System**: JWT-based auth with role management (client/admin)
- **Booking Management**: Complete booking workflow with status tracking
- **Gallery System**: Public/private galleries with access codes and analytics
- **Review System**: Multi-category ratings with moderation workflow
- **Validation Utilities**: Comprehensive validation functions for forms and data
- **Admin Operations**: Full admin management capabilities

## 📦 Installation

```bash
npm install @ideal-photography/shared
```

## 🏗️ Quick Start

### 1. Set up your server with Apollo Server v4

```js
const express = require('express');
const { createApolloServer, applyApolloMiddleware } = require('@ideal-photography/shared/graphql');
const { mongoose } = require('@ideal-photography/shared/mongoDB');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ideal-photography', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

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

### 2. Alternative setup with manual configuration

```js
const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { typeDefs, resolvers } = require('@ideal-photography/shared/graphql');
const { mongoose } = require('@ideal-photography/shared/mongoDB');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/ideal-photography');

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

### 3. Use models directly

```js
const { models } = require('@ideal-photography/shared/mongoDB');

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

### 4. Use validation utilities

```js
const { 
  isEmail, 
  isValidPrice, 
  isValidRating,
  isValidBookingStatus 
} = require('@ideal-photography/shared/validations/common');

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

### Gallery Model
- **Purpose**: Photo galleries and client portfolios
- **Features**: Public/private galleries, access codes, download controls, view tracking
- **Settings**: Download permissions, watermarks, right-click protection

### Review Model
- **Purpose**: Customer feedback and testimonials
- **Features**: Multi-category ratings, admin responses, helpful votes, approval workflow
- **Categories**: communication, quality, professionalism, value, timeliness

## 🔧 GraphQL Operations

### Available Queries
- **Authentication**: login, register, forgot password, verify email
- **Products**: get products, featured products, search products
- **Services**: get services, featured services, services by category
- **Bookings**: user bookings, availability check, booking details
- **Galleries**: public galleries, featured galleries, client galleries
- **Reviews**: public reviews, featured reviews, average rating

### Available Mutations
- **Authentication**: register, login, logout, change password, update profile
- **Bookings**: create, update, cancel booking
- **Reviews**: create, update, mark helpful
- **Admin**: user management, booking management, content moderation

## 📊 Database Indexes

The models include optimized indexes for common queries:

- **Product**: Text search on name, description, tags
- **Service**: Text search on name, description, tags
- **Booking**: Compound indexes on client+date, date+status, product
- **Gallery**: Indexes on category+isPublic, client, isFeatured+isPublic
- **Review**: Indexes on client, booking, rating+isApproved

## 📝 Changelog

### v1.2.7 (Latest)
- **Fixed**: ES module import/export issues in GraphQL type definitions
- **Fixed**: Missing `ProductType` enum in order type definitions
- **Fixed**: CommonJS to ES module conversion for all type definition files
- **Fixed**: Mongoose connection reference issues in server shutdown
- **Improved**: GraphQL schema validation and error handling
- **Added**: Proper ES module support for all shared components

### v1.2.6
- Initial release with complete photography business models
- GraphQL integration with Apollo Server v4
- MongoDB integration with Mongoose
- Authentication and authorization system
- Booking, gallery, and review management

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

## 🔒 Security Features

- **JWT Authentication** with automatic token refresh
- **Role-based permissions** (client vs admin)
- **Input validation** with comprehensive validation functions
- **Password hashing** with bcrypt
- **CORS protection** for cross-origin requests

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

### After (v4)
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

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

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