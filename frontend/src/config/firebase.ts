// Firebase configuration using CodeTapasya Auth
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// API configuration
export const API_URL = import.meta.env.VITE_API_URL || ''

// Environment
export const IS_DEV = import.meta.env.VITE_ENVIRONMENT === 'development'
export const IS_PROD = import.meta.env.VITE_ENVIRONMENT === 'production'

// Resume Maker Storage bucket (for client-side operations if needed)
export const RESUME_STORAGE_BUCKET = import.meta.env.VITE_RESUME_FIREBASE_STORAGE_BUCKET
