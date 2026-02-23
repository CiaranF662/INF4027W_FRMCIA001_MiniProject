import { adminAuth, adminDb } from './firebaseAdmin';

/**
 * Backend auth controls what the database allows.
 * 
 * 
 * Verifies the Firebase ID token from the request's Authorization header.
 * This is a project-specific helper designed for the ReVibe SA API pattern.
 * * @param {Request} request - The incoming Next.js Request object
 * @returns {Object|null} - The decoded user object + custom role, or null if unauthorized
 */
export async function verifyAuth(request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }

        const token = authHeader.split('Bearer ')[1];

        // 1. Verify the token with Firebase Admin SDK
        const decodedToken = await adminAuth.verifyIdToken(token);

        // 2. Fetch the user's role from the Firestore 'users' collection
        // This supports the "Role-Based Access Control" requirement of the project
        const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
        const userData = userDoc.exists ? userDoc.data() : {};

        // Return the combined auth and profile data
        return {
            uid: decodedToken.uid,
            email: decodedToken.email,
            role: userData.role || 'customer', // Default to customer if no role is set
            ...userData
        };
    } catch (error) {
        console.error('Auth Verification Error:', error);
        return null;
    }
}

/**
 * Specialized helper to verify if the authenticated user is an Admin.
 * Used for Phase 4: Admin Dashboard security.
 */
export async function verifyAdmin(request) {
    const user = await verifyAuth(request);
    if (user && user.role === 'admin') {
        return user;
    }
    return null;
}