
// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAnalytics, logEvent as fbLogEvent, isSupported, type Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;
let analytics: Analytics | null = null;

if (typeof window !== 'undefined') { // Ensure client-side
  if (!getApps().length) {
    if (
      firebaseConfig.apiKey &&
      firebaseConfig.projectId &&
      firebaseConfig.appId
    ) {
      app = initializeApp(firebaseConfig);
    } else {
      console.warn(
        'Firebase config is missing. Analytics will not be initialized. Make sure all NEXT_PUBLIC_FIREBASE_ environment variables are set.'
      );
    }
  } else {
    app = getApp();
  }

  if (app) {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
        console.log('Firebase Analytics initialized');
      } else {
        console.log('Firebase Analytics is not supported in this environment.');
      }
    }).catch(error => {
        console.error('Error checking Firebase Analytics support:', error);
    });
  }
}


export const logEvent = (eventName: string, eventParams?: { [key: string]: any }) => {
  if (analytics) {
    fbLogEvent(analytics, eventName, eventParams);
  } else {
    // console.log(`Firebase Analytics not available. Event not logged: ${eventName}`, eventParams);
    // This console log can be noisy if analytics is legitimately not supported or config is missing.
    // It's often better to fail silently or have a more robust logging strategy for missing analytics.
  }
};

// Export app if needed for other Firebase services like Auth, Firestore, etc.
export { app, analytics };
