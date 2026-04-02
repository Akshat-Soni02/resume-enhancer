import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'resumeai-d3bd5.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'resumeai-d3bd5',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'resumeai-d3bd5.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

/** Web API key + authDomain + projectId are required for Auth; appId optional for sign-in-only. */
function isConfigured() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId);
}

/** Documented alongside Firebase; OAuth uses Firebase’s Google provider config from Console. */
export const googleOAuthWebClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

let app = null;
let auth = null;
let googleProvider = null;

export function getFirebaseAuth() {
  if (!isConfigured()) return null;
  if (!app) {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
  }
  return auth;
}

export function getGoogleProvider() {
  if (!isConfigured()) return null;
  getFirebaseAuth();
  return googleProvider;
}

export function firebaseClientConfigured() {
  return isConfigured();
}
