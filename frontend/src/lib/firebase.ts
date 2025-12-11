import { initializeApp } from 'firebase/app'
import { getAuth, GithubAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { firebaseConfig } from '@/config/firebase'

// Initialize Firebase (vpshare - for authentication)
export const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication
export const auth = getAuth(app)

// Initialize Firestore (vpshare - local state only, backend uses resume-maker)
export const db = getFirestore(app)

// Initialize GitHub Auth Provider
export const githubProvider = new GithubAuthProvider()
// Request additional GitHub scopes for repository access
githubProvider.addScope('repo')
githubProvider.addScope('user')
githubProvider.addScope('public_repo')
githubProvider.addScope('public_repo')
