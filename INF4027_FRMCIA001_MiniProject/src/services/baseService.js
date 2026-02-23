// src/services/baseService.js

// Import the Admin SDK Firestore instance.                                                                                                                                
// This runs server-side only — never in the browser.                                                                                                                        
import { adminDb } from '@/lib/firebaseAdmin';

/**
 * FirestoreService — Base Class
 *
 * This is the parent class that all other service classes extend.
 * It provides generic, reusable Firestore operations (CRUD) so that
 * child classes don't have to rewrite the same database logic.
 *
 * OOP concepts demonstrated:
 *   - Encapsulation: database logic is hidden inside class methods
 *   - Inheritance: child classes extend this to get CRUD for free
 *   - Abstraction: the rest of the app calls clean method names
 *     like getById() instead of raw Firestore query code
 */
class FirestoreService {

  /**
   * Constructor — called when a child class does: super('products')
   * @param {string} collectionName - the Firestore collection this service manages
   */
  constructor(collectionName) {
    // Store a direct reference to the Firestore collection.
    // e.g. if collectionName is 'products', this.collection points
    // to the 'products' collection in Firestore.
    this.collection = adminDb.collection(collectionName);
    this.collectionName = collectionName;
  }
  /**
   * GET ALL — fetch every document in the collection
   * @returns {Array} array of all documents, each with their Firestore ID included
   */
  async getAll() {
    const snapshot = await this.collection.get();

    // snapshot.docs is an array of document snapshots.
    // We map each one to a plain JS object with the id attached.
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  /**
   * GET BY ID — fetch a single document by its Firestore document ID
   * @param {string} id - the Firestore document ID
   * @returns {Object|null} the document data with id, or null if not found
   */
  async getById(id) {
    const doc = await this.collection.doc(id).get();

    // doc.exists is false if no document has that ID
    if (!doc.exists) return null;

    return {
      id: doc.id,
      ...doc.data()
    };
  }

  /**
   * CREATE — add a new document to the collection
   * Automatically adds createdAt and updatedAt timestamps.
   * @param {Object} data - the fields to store in the new document
   * @returns {Object} the newly created document including its generated ID
   */
  async create(data) {
    const now = new Date();

    const docRef = await this.collection.add({
      ...data,
      createdAt: now,
      updatedAt: now
    });

    // Return the full document so the API route can send it back to the client
    return {
      id: docRef.id,
      ...data,
      createdAt: now,
      updatedAt: now
    };
  }

  /**
   * UPDATE — modify specific fields on an existing document
   * Uses Firestore's update() which only changes the fields provided —
   * it does NOT overwrite the entire document.
   * @param {string} id - the Firestore document ID to update
   * @param {Object} data - only the fields that need to change
   * @returns {Object} the updated document
   */
  async update(id, data) {
    const now = new Date();

    await this.collection.doc(id).update({
      ...data,
      updatedAt: now
    });

    // Fetch and return the updated document
    return this.getById(id);
  }

  /**
   * DELETE — permanently remove a document from the collection
   * @param {string} id - the Firestore document ID to delete
   * @returns {boolean} true if successful
   */
  async delete(id) {
    await this.collection.doc(id).delete();
    return true;
  }
}

export default FirestoreService;