# IDEAS MEDIA COMPANY - Deployment Requirements

**Last Updated:** December 2024  
**Status:** Production Ready

---

## 🚀 **DEPLOYMENT OVERVIEW**

The IDEAS MEDIA COMPANY platform consists of:
- **Client PWA** (Customer-facing application)
- **Admin PWA** (Administrative dashboard)
- **Shared Backend** (GraphQL API server)
- **MongoDB Database** (Data storage)

---

## 📋 **MANUAL SETUP REQUIREMENTS**

### **1. Environment Variables**

#### **Shared Backend (.env)**
```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ideas-media-company
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ideas-media-company

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-key-minimum-32-characters
JWT_EXPIRES_IN=3d
JWT_REFRESH_EXPIRES_IN=30d

# Application URLs
CLIENT_URL=https://your-client-domain.com
ADMIN_URL=https://your-admin-domain.com
API_URL=https://your-api-domain.com

# Email Service Configuration (Choose one)
# Option 1: Gmail
EMAIL_SERVICE=gmail
EMAIL_USER=your-business-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# Option 2: SendGrid
# EMAIL_SERVICE=sendgrid
# SENDGRID_API_KEY=SG.your-sendgrid-api-key

# Option 3: Custom SMTP
# EMAIL_HOST=smtp.your-provider.com
# EMAIL_PORT=587
# EMAIL_USER=your-smtp-username
# EMAIL_PASS=your-smtp-password

# File Upload (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Payment Processing (Paystack)
PAYSTACK_SECRET_KEY=sk_test_your-test-key  # Use sk_live_ for production
PAYSTACK_PUBLIC_KEY=pk_test_your-test-key  # Use pk_live_ for production
PAYSTACK_WEBHOOK_SECRET=your-webhook-secret

# Push Notifications (Web Push)
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:your-business-email@domain.com

# Redis (Optional - for background jobs)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Security
CORS_ORIGINS=https://your-client-domain.com,https://your-admin-domain.com
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=15

# Application Settings
NODE_ENV=production
PORT=4000
LOG_LEVEL=info
```

#### **Client PWA (.env)**
```bash
VITE_API_URL=https://your-api-domain.com/graphql
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your-test-key
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key
VITE_CLIENT_URL=https://your-client-domain.com
```

#### **Admin PWA (.env)**
```bash
VITE_API_URL=https://your-api-domain.com/graphql
VITE_ADMIN_URL=https://your-admin-domain.com
```

---

### **2. Database Setup**

#### **MongoDB Database**
```bash
# Local MongoDB
mongod --dbpath /path/to/your/data/directory

# OR use MongoDB Atlas (recommended)
# 1. Create account at https://cloud.mongodb.com
# 2. Create new cluster
# 3. Get connection string
# 4. Add to MONGODB_URI environment variable
```

#### **Initial Admin User Creation**
```javascript
// Run this script once to create your first admin user
// Create file: scripts/create-admin.js

import { models } from '../shared/mongoDB/index.js';
import bcrypt from 'bcryptjs';

const createInitialAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await models.Admin.findOne({ role: 'super_admin' });
    if (existingAdmin) {
      console.log('Super admin already exists');
      return;
    }

    // Create super admin
    const hashedPassword = await bcrypt.hash('your-secure-password', 12);
    
    const admin = await models.Admin.create({
      username: 'superadmin',
      email: 'admin@your-domain.com',
      password: hashedPassword,
      role: 'super_admin',
      isActive: true,
      permissions: {
        users: { read: true, write: true, delete: true },
        bookings: { read: true, write: true, delete: true },
        services: { read: true, write: true, delete: true },
        galleries: { read: true, write: true, delete: true },
        reviews: { read: true, write: true, delete: true },
        analytics: { read: true, write: true, delete: true },
        settings: { read: true, write: true, delete: true },
        campaigns: { read: true, write: true, delete: true }
      }
    });

    console.log('Super admin created successfully:', admin.username);
  } catch (error) {
    console.error('Error creating admin:', error);
  }
};

createInitialAdmin();
```

#### **Database Indexes**
The application will automatically create necessary indexes on first run, but you can manually create them:

```javascript
// MongoDB shell commands
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ phone: 1 }, { sparse: true })
db.users.createIndex({ isActive: 1 })
db.users.createIndex({ isEmailVerified: 1 })
db.users.createIndex({ createdAt: -1 })

db.admins.createIndex({ username: 1 }, { unique: true })
db.admins.createIndex({ email: 1 }, { unique: true })
db.admins.createIndex({ role: 1 })

db.bookings.createIndex({ userId: 1 })
db.bookings.createIndex({ status: 1 })
db.bookings.createIndex({ scheduledDate: 1 })
db.bookings.createIndex({ createdAt: -1 })

db.notifications.createIndex({ 'recipients.users': 1 })
db.notifications.createIndex({ 'recipients.roles': 1 })
db.notifications.createIndex({ status: 1 })
db.notifications.createIndex({ createdAt: -1 })
```

---

### **3. Third-Party Service Setup**

#### **Email Service Setup**

**Option A: Gmail (Recommended for small scale)**
1. Enable 2-Factor Authentication on your Gmail account
2. Generate App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in EMAIL_PASS

**Option B: SendGrid (Recommended for production)**
1. Create SendGrid account
2. Verify your domain
3. Create API key with mail send permissions
4. Add API key to SENDGRID_API_KEY

#### **Cloudinary Setup (File Uploads)**
1. Create account at https://cloudinary.com
2. Get credentials from Dashboard:
   - Cloud Name
   - API Key  
   - API Secret
3. Add to environment variables

#### **Paystack Setup (Payments)**
1. Create account at https://paystack.com
2. Get API keys from Settings → API Keys & Webhooks:
   - Test Secret Key (sk_test_...)
   - Test Public Key (pk_test_...)
   - Live keys for production
3. Set up webhook endpoint: `https://your-api-domain.com/webhooks/paystack`
4. Add webhook secret to environment variables

#### **Push Notifications Setup**
```bash
# Generate VAPID keys
npm install -g web-push
web-push generate-vapid-keys

# Add keys to environment variables
VAPID_PUBLIC_KEY=generated-public-key
VAPID_PRIVATE_KEY=generated-private-key
VAPID_SUBJECT=mailto:your-business-email@domain.com
```

---

## 🌐 **HOSTING & DEPLOYMENT**

### **Recommended Hosting Providers**

#### **Frontend PWAs (Client & Admin)**
**Vercel (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy Client PWA
cd Client/client
vercel --prod

# Deploy Admin PWA  
cd Admin/client
vercel --prod
```

**Alternative: Netlify**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy Client PWA
cd Client/client
npm run build
netlify deploy --prod --dir=dist

# Deploy Admin PWA
cd Admin/client  
npm run build
netlify deploy --prod --dir=dist
```

#### **Backend API**
**Railway (Recommended)**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy backend
cd shared
railway login
railway init
railway up
```

**Alternative: Heroku**
```bash
# Install Heroku CLI
# Create Procfile in shared directory:
echo "web: node server.js" > Procfile

# Deploy
heroku create your-api-name
heroku config:set NODE_ENV=production
# Add all environment variables
heroku config:set MONGODB_URI=your-mongodb-uri
# ... add all other env vars
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

#### **Database**
**MongoDB Atlas (Recommended)**
1. Create cluster at https://cloud.mongodb.com
2. Configure network access (allow your backend IP)
3. Create database user
4. Get connection string
5. Add to MONGODB_URI

---

### **Domain Configuration**

#### **DNS Setup**
```bash
# Example DNS records
# Client PWA
ideas-media-company.com → Vercel/Netlify

# Admin PWA  
admin.ideas-media-company.com → Vercel/Netlify

# API Backend
api.ideas-media-company.com → Railway/Heroku
```

#### **SSL Certificates**
- Vercel/Netlify: Automatic SSL
- Railway/Heroku: Automatic SSL
- Custom domains: Use Let's Encrypt or Cloudflare

---

## 🔧 **DEPLOYMENT STEPS**

### **1. Backend Deployment**
```bash
# 1. Set up environment variables on hosting platform
# 2. Deploy shared backend
cd shared
npm install --production
npm run build  # if applicable
npm start

# 3. Verify API endpoint
curl https://your-api-domain.com/health
```

### **2. Database Setup**
```bash
# 1. Set up MongoDB Atlas or local MongoDB
# 2. Run initial admin creation script
node scripts/create-admin.js

# 3. Verify database connection
# Check backend logs for successful MongoDB connection
```

### **3. Frontend Deployments**
```bash
# 1. Deploy Client PWA
cd Client/client
npm install
npm run build
# Deploy to Vercel/Netlify

# 2. Deploy Admin PWA
cd Admin/client
npm install  
npm run build
# Deploy to Vercel/Netlify

# 3. Verify deployments
# Check both PWAs load correctly
# Test authentication and basic functionality
```

### **4. Third-Party Integrations**
```bash
# 1. Test email sending
# Register new user → should receive welcome email

# 2. Test file uploads  
# Upload image in admin → should save to Cloudinary

# 3. Test payments
# Make test booking → should process via Paystack

# 4. Test notifications
# Admin actions → should trigger notifications
```

---

## ✅ **POST-DEPLOYMENT CHECKLIST**

### **Functional Testing**
- [ ] Client PWA loads and functions correctly
- [ ] Admin PWA loads and authentication works
- [ ] User registration and email verification
- [ ] ID verification and admin approval workflow
- [ ] Booking creation and payment processing
- [ ] Email notifications are sent
- [ ] Push notifications work
- [ ] File uploads to Cloudinary work
- [ ] Admin can manage users and bookings

### **Performance Testing**
- [ ] Page load times < 3 seconds
- [ ] Mobile responsiveness
- [ ] PWA features (offline, installable)
- [ ] Service worker caching
- [ ] API response times < 500ms

### **Security Testing**
- [ ] HTTPS enabled on all domains
- [ ] JWT authentication working
- [ ] Rate limiting active
- [ ] CORS configured correctly
- [ ] Environment variables secure (not exposed)

### **Monitoring Setup**
- [ ] Error logging (consider Sentry)
- [ ] Performance monitoring
- [ ] Database monitoring
- [ ] Uptime monitoring (consider UptimeRobot)

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues**

#### **CORS Errors**
```javascript
// Ensure CORS_ORIGINS includes your frontend domains
CORS_ORIGINS=https://your-client-domain.com,https://your-admin-domain.com
```

#### **Email Not Sending**
```javascript
// Check email service configuration
// For Gmail: ensure app password is used, not regular password
// For SendGrid: verify domain and API key permissions
```

#### **Database Connection Issues**
```javascript
// Check MongoDB URI format
// For Atlas: ensure IP whitelist includes your backend server
// For local: ensure MongoDB service is running
```

#### **Payment Issues**
```javascript
// Verify Paystack keys are correct
// Ensure webhook URL is accessible
// Check webhook secret matches
```

### **Monitoring Commands**
```bash
# Check backend health
curl https://your-api-domain.com/health

# Check database connection
# Look for "Connected to MongoDB" in backend logs

# Check environment variables
# Ensure all required variables are set on hosting platform
```

---

## 📞 **SUPPORT CONTACTS**

### **Service Providers**
- **MongoDB Atlas:** https://cloud.mongodb.com/support
- **Vercel:** https://vercel.com/support  
- **Railway:** https://railway.app/help
- **Paystack:** https://paystack.com/support
- **Cloudinary:** https://cloudinary.com/support
- **SendGrid:** https://sendgrid.com/support

### **Documentation Links**
- **MongoDB:** https://docs.mongodb.com
- **GraphQL:** https://graphql.org/learn
- **React PWA:** https://create-react-app.dev/docs/making-a-progressive-web-app
- **Paystack API:** https://paystack.com/docs
- **Web Push:** https://web.dev/push-notifications

---

**🎉 Your IDEAS MEDIA COMPANY platform is ready for production deployment!**
