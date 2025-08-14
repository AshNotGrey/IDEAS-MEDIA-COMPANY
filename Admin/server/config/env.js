import path from 'path'
import { fileURLToPath } from 'url'
import { config as loadEnv } from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const NODE_ENV = process.env.NODE_ENV || 'development'
loadEnv({ path: path.join(__dirname, `../.env.${NODE_ENV}.local`) })

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

const PACKAGE_VERSION = process.env.npm_package_version || '1.0.0'
const isProduction = NODE_ENV === 'production'
const isDevelopment = NODE_ENV === 'development'

const PORT = toInt(process.env.PORT, 4001)
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3002'
const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:3003'

const MONGODB_URI = required(process.env.MONGODB_URI, 'MONGODB_URI')

const JWT_SECRET = required(process.env.JWT_SECRET, 'JWT_SECRET')
const JWT_REFRESH_SECRET = required(process.env.JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET')
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30m'
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'
const BCRYPT_ROUNDS = toInt(process.env.BCRYPT_ROUNDS, 12)

const RATE_LIMIT_MAX_REQUESTS = toInt(process.env.RATE_LIMIT_MAX_REQUESTS, 100)
const RATE_LIMIT_WINDOW_MS = toInt(process.env.RATE_LIMIT_WINDOW_MS, 900000)
const RATE_LIMIT_WINDOW_SECONDS = Math.max(1, Math.ceil(RATE_LIMIT_WINDOW_MS / 1000))

const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY || ''
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || ''
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY || ''
// Web Push
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || ''
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || ''
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@idealphotography.com'

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || ''
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || ''
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || ''
const CLOUDINARY_URL = process.env.CLOUDINARY_URL || ''

const SMTP_HOST = process.env.SMTP_HOST || ''
const SMTP_PORT = toInt(process.env.SMTP_PORT, 587)
const SMTP_USER = process.env.SMTP_USER || ''
const SMTP_PASS = process.env.SMTP_PASS || ''

const MAX_FILE_SIZE = toInt(process.env.MAX_FILE_SIZE, 10 * 1024 * 1024)
const ALLOWED_FILE_TYPES = (process.env.ALLOWED_FILE_TYPES || 'jpg,jpeg,png,gif,pdf,doc,docx')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
const DEFAULT_ADMIN_USER = process.env.DEFAULT_ADMIN_USER
const DEFAULT_ADMIN_PASS = process.env.DEFAULT_ADMIN_PASS
const ADMIN_SERVER_URL = process.env.ADMIN_SERVER_URL || `http://localhost:${PORT}`

export {
    NODE_ENV,
    isProduction,
    isDevelopment,
    PACKAGE_VERSION,
    PORT,
    CLIENT_URL,
    ADMIN_URL,
    MONGODB_URI,
    JWT_SECRET,
    JWT_REFRESH_SECRET,
    JWT_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN,
    BCRYPT_ROUNDS,
    RATE_LIMIT_MAX_REQUESTS,
    RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_WINDOW_SECONDS,
    PAYSTACK_PUBLIC_KEY,
    PAYSTACK_SECRET_KEY,
    EMAILJS_PRIVATE_KEY,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY,
    VAPID_SUBJECT,
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    CLOUDINARY_URL,
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    MAX_FILE_SIZE,
    ALLOWED_FILE_TYPES,
    ADMIN_SERVER_URL,
    DEFAULT_ADMIN_USER,
    DEFAULT_ADMIN_PASS
}

// Centralized admin env configuration