// src/services/userService.js                                                                                                                                               

import FirestoreService from './baseService';
import { adminDb } from '@/lib/firebaseAdmin';

/**                                                                                                                                                                        
 * UserService — handles all database operations for the 'users' collection.                                                                                                 
 *                                                                                                                                                                         
 * Extends FirestoreService, so it inherits:
 *   getAll(), getById(), update(), delete()
 *
 * NOTE: create() from the parent is NOT used here.
 * Every other collection lets Firestore auto-generate document IDs.
 * Users are different — their document ID must match their Firebase Auth UID
 * so we can look them up by UID after login. We use createUser() instead.
 *
 * Additional methods added here:
 *   createUser(uid, data)              — create user doc with their Auth UID as the ID
 *   updateProfile(uid, data)           — update name, location, size preferences
 *   addToWishlist(uid, productId)      — add a product ID to their wishlist array
 *   removeFromWishlist(uid, productId) — remove a product ID from their wishlist array
 *   getAllUsers()                       — admin: list all registered customers
 */
class UserService extends FirestoreService {

    constructor() {
        // Tell the parent class to point at the 'users' Firestore collection
        super('users');
    }

    /**
     * CREATE USER — called once when a customer signs up for the first time.
     *
     * This is different from all other create() methods in the project.
     * Instead of letting Firestore generate a random document ID, we
     * manually set the document ID to match the user's Firebase Auth UID.
     *
     * WHY? When a user logs in, Firebase Auth gives us their UID.
     * We can then do users.doc(uid).get() to instantly fetch their profile.
     * If the ID was random, we would have no way to connect the Auth user
     * to their Firestore document.
     *
     * @param {string} uid  - the Firebase Auth UID (e.g. "abc123xyz")
     * @param {Object} data - the user's sign-up details
     * @param {string} data.name     - their display name
     * @param {string} data.email    - their email address
     * @param {string} data.location - their city e.g. "Cape Town"
     * @returns {Object} the newly created user document
     */
    async createUser(uid, data) {
        const userData = {
            email: data.email,
            name: data.name,
            role: 'customer',       // all new sign-ups are customers by default
            location: data.location || '',
            sizeProfile: {          // denim size preferences, empty until they fill in profile
                top: '',
                bottom: '',
                shoe: ''
            },
            wishlist: [],           // empty wishlist to start
            createdAt: new Date()
        };

        // .doc(uid) targets the specific document with that ID
        // .set() writes the data to it (creates it if it doesn't exist)
        await this.collection.doc(uid).set(userData);

        return {
            id: uid,
            ...userData
        };
    }

    /**
     * UPDATE PROFILE — lets a customer edit their account details.
     * Used on the "Edit Profile" page in the customer dashboard.
     *
     * Only updates the fields that are passed in — other fields are untouched.
     * For example, passing { location: "Johannesburg" } will only change
     * the location field, leaving name, wishlist, role etc. as they were.
     *
     * @param {string} uid  - the user's Firebase Auth UID
     * @param {Object} data - the fields to update
     * @returns {Object} the updated user document
     */
    async updateProfile(uid, data) {
        // Only allow safe profile fields to be updated — role cannot be changed here
        const allowedFields = ['name', 'location', 'sizeProfile'];

        const updateData = {};
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                updateData[field] = data[field];
            }
        }

        updateData.updatedAt = new Date();

        await this.collection.doc(uid).update(updateData);

        return this.getById(uid);
    }

    /**
     * ADD TO WISHLIST — adds a product ID to the user's wishlist array.
     * Called when a customer clicks the heart icon on a product.
     *
     * Uses Firestore's arrayUnion() — this atomically adds the productId
     * to the wishlist array only if it isn't already there.
     * This prevents the same product appearing twice in the wishlist.
     *
     * @param {string} uid       - the user's Firebase Auth UID
     * @param {string} productId - the Firestore ID of the product to save
     */
    async addToWishlist(uid, productId) {
        await this.collection.doc(uid).update({
            // arrayUnion adds the item only if it doesn't already exist in the array
            wishlist: adminDb.FieldValue.arrayUnion(productId)
        });
    }

    /**
     * REMOVE FROM WISHLIST — removes a product ID from the user's wishlist array.
     * Called when a customer clicks the heart icon on an already-saved product.
     *
     * Uses Firestore's arrayRemove() — this atomically removes the productId
     * from the wishlist array wherever it appears.
     *
     * @param {string} uid       - the user's Firebase Auth UID
     * @param {string} productId - the Firestore ID of the product to remove
     */
    async removeFromWishlist(uid, productId) {
        await this.collection.doc(uid).update({
            // arrayRemove finds and removes the item from the array
            wishlist: adminDb.FieldValue.arrayRemove(productId)
        });
    }

    /**
     * GET ALL USERS — returns every registered user on the platform.
     * Used by the admin users table.
     * Sorted by sign-up date, newest first.
     *
     * @returns {Array} all user documents, newest first
     */
    async getAllUsers() {
        const snapshot = await this.collection
            .orderBy('createdAt', 'desc')
            .get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }
}

// Export a single shared instance
export default new UserService();