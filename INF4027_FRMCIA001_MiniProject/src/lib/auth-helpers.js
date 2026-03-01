import { adminAuth, adminDb } from './firebaseAdmin';

// Verifies the Bearer token and returns the decoded user with their Firestore role.
// Returns null if the token is missing or invalid.
export async function verifyAuth(request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await adminAuth.verifyIdToken(token);

        const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
        const userData = userDoc.exists ? userDoc.data() : {};

        return {
            uid: decodedToken.uid,
            email: decodedToken.email,
            role: userData.role || 'customer',
            ...userData
        };
    } catch (error) {
        console.error('Auth verification error:', error);
        return null;
    }
}

// Returns the user only if they have the admin role
export async function verifyAdmin(request) {
    const user = await verifyAuth(request);
    if (user && user.role === 'admin') return user;
    return null;
}
