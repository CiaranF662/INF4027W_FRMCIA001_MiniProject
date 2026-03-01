// src/services/baseService.js
import { adminDb } from '@/lib/firebaseAdmin';

// Generic Firestore CRUD — extended by all service classes.
class FirestoreService {

  constructor(collectionName) {
    this.collection = adminDb.collection(collectionName);
    this.collectionName = collectionName;
  }

  async getAll() {
    const snapshot = await this.collection.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getById(id) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  // Stamps createdAt and updatedAt on every new document
  async create(data) {
    const now = new Date();
    const docRef = await this.collection.add({ ...data, createdAt: now, updatedAt: now });
    return { id: docRef.id, ...data, createdAt: now, updatedAt: now };
  }

  async update(id, data) {
    const now = new Date();
    await this.collection.doc(id).update({ ...data, updatedAt: now });
    return this.getById(id);
  }

  async delete(id) {
    await this.collection.doc(id).delete();
    return true;
  }
}

export default FirestoreService;
