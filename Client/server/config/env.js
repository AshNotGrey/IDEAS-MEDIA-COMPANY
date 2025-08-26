import path from 'path'
import { fileURLToPath } from 'url'
import { config as loadEnv } from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Determine environment first, then load the right file
const NODE_ENV = process.env.NODE_ENV || 'development'
loadEnv({ path: path.join(__dirname, `../.env.${NODE_ENV}.local`) })

// Helpers
const toInt = (value, fallback) => {
    const n = Number.parseInt(String(value ?? '').trim(), 10)
    return Number.isFinite(n) ? n : fallback
}

const required = (value, name) => {
    if (value === undefined || value === null || String(value).length === 0) {
        throw new Error(`Missing required environment variable: ${name}`)
    }
    return value
}

// Base app info
const PACKAGE_VERSION = process.env.npm_package_version || '1.0.0'
const isProduction = NODE_ENV === 'production'
const isDevelopment = NODE_ENV === 'development'

// App config
const PORT = toInt(process.env.PORT, 4000)
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000'
const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:3001'

// Database
const MONGODB_URI = required(process.env.MONGODB_URI, 'MONGODB_URI')

// Auth & Security
const JWT_SECRET = required(process.env.JWT_SECRET, 'JWT_SECRET')
const JWT_REFRESH_SECRET = required(process.env.JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET')
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '3d'
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d'
const BCRYPT_ROUNDS = toInt(process.env.BCRYPT_ROUNDS, 12)

// Rate limiting
const RATE_LIMIT_MAX_REQUESTS = toInt(process.env.RATE_LIMIT_MAX_REQUESTS, 100)
// The env uses milliseconds naming but server library expects seconds. Accept ms and convert when provided.
const RATE_LIMIT_WINDOW_MS = toInt(process.env.RATE_LIMIT_WINDOW_MS, 900000) // 15 minutes
const RATE_LIMIT_WINDOW_SECONDS = Math.max(1, Math.ceil(RATE_LIMIT_WINDOW_MS / 1000))

// External services
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY || ''
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || ''
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY || ''
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || ''
// Web Push
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || ''
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || ''
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:businessemail'

// Cloudinary
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || ''
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || ''
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || ''
const CLOUDINARY_URL = process.env.CLOUDINARY_URL || ''

// SMTP
const SMTP_HOST = process.env.SMTP_HOST || ''
const SMTP_PORT = toInt(process.env.SMTP_PORT, 587)
const SMTP_USER = process.env.SMTP_USER || ''
const SMTP_PASS = process.env.SMTP_PASS || ''

// File uploads
const MAX_FILE_SIZE = toInt(process.env.MAX_FILE_SIZE, 10 * 1024 * 1024) // 10MB
const ALLOWED_FILE_TYPES = (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif,pdf,doc,docx')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

// Server URL (for Swagger, etc.)
const CLIENT_SERVER_URL = process.env.CLIENT_SERVER_URL || `http://localhost:${PORT}`

export {
    // Environment
    NODE_ENV,
    isProduction,
    isDevelopment,
    PACKAGE_VERSION,
    // App
    PORT,
    CLIENT_URL,
    ADMIN_URL,
    // Database
    MONGODB_URI,
    // Auth
    JWT_SECRET,
    JWT_REFRESH_SECRET,
    JWT_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN,
    BCRYPT_ROUNDS,
    // Rate limiting
    RATE_LIMIT_MAX_REQUESTS,
    RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_WINDOW_SECONDS,
    // External Services
    PAYSTACK_PUBLIC_KEY,
    PAYSTACK_SECRET_KEY,
    EMAILJS_PRIVATE_KEY,
    EMAILJS_SERVICE_ID,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY,
    VAPID_SUBJECT,
    // Cloudinary
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    CLOUDINARY_URL,
    // SMTP
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    // Uploads
    MAX_FILE_SIZE,
    ALLOWED_FILE_TYPES,
    // URLs
    CLIENT_SERVER_URL,
}

// This file centralizes environment configuration.