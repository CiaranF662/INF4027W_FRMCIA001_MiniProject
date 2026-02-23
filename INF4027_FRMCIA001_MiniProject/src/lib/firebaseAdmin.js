import admin from "firebase-admin";

/**
 * Controls what the database allows
 * 
 * This is the backend authentication — it runs on the server and verifies that requests 
 * are genuinely from logged-in users by checking their token.
 * 
 * Formats the private key to handle newline characters correctly,
 * which is a common issue when deploying to platforms like Vercel.
 */
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