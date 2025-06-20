// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// IMPORTANT: Replace with your actual Firebase project configuration
// You can find this in the Firebase Console: Project settings > General > Your apps > SDK setup and configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID"
};

// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const db: Firestore = getFirestore(app);

export { app, db };

// Note for the user:
// 1. Create a Firebase project at https://console.firebase.google.com/
// 2. Get your Firebase config object from your project settings.
// 3. It's recommended to store your Firebase config in environment variables:
//    - Create a .env.local file in the root of your project.
//    - Add your Firebase config values like:
//      NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
//      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
//      NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
//      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
//      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
//      NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
// 4. Ensure you have enabled Firestore in your Firebase project (Native mode).
// 5. Set up Firestore security rules to control access to your data.
//    Example basic rules (restrict write access, allow read for testing):
//    rules_version = '2';
//    service cloud.firestore {
//      match /databases/{database}/documents {
//        match /{document=**} {
//          allow read: if true; // Adjust for production
//          allow write: if false; // Adjust for specific paths/authentication
//        }
//        match /applications/{applicationId} {
//           allow read: if true; // Or based on auth
//           allow create: if true; // Allow application submission
//           allow update: if request.auth != null; // Allow updates by admins (example)
//        }
//        match /inquiries/{inquiryId} {
//            allow create: if true; // Allow inquiry submission
//        }
//      }
//    }
