
import admin from 'firebase-admin';

// Define a key for the global object to store the initialized app
const GLOBAL_KEY = '_firebase_admin_app_';

// A type for the global object to avoid TypeScript errors
interface GlobalWithFirebase {
  [GLOBAL_KEY]?: admin.app.App;
}

function initializeAdminApp() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    // For local development, it will connect to the emulator if it's running.
    // Ensure FIREBASE_AUTH_EMULATOR_HOST is set in your .env.local file.
    console.log("Initializing Firebase Admin SDK for local development/emulator.");
    return admin.initializeApp();
  }
}

// Check if we're in a development environment and if the app is already initialized
if (process.env.NODE_ENV === 'development') {
  const globalWithFirebase = global as GlobalWithFirebase;
  if (!globalWithFirebase[GLOBAL_KEY]) {
    globalWithFirebase[GLOBAL_KEY] = initializeAdminApp();
  }
  // Use the cached app
  admin.apps.length === 0 ? globalWithFirebase[GLOBAL_KEY] : admin.app();
} else {
  // In production, just initialize it if it's not already
  if (!admin.apps.length) {
    initializeAdminApp();
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();

    