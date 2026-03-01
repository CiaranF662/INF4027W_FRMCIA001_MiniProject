import admin from "firebase-admin";

// Vercel stores the private key as a single string — this restores the real newlines
function formatPrivateKey(key) {
    return key.replace(/\\n/g, "\n");
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export const adminStorage = admin.storage();
export default admin;