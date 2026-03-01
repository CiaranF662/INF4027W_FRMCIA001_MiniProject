import FirestoreService from './baseService';

class CategoryService extends FirestoreService {

    constructor() {
        super('categories');
    }

    async getByName(name) {
        const snapshot = await this.collection.where('name', '==', name).limit(1).get();
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    }

    async createCategory(data) {
        const existing = await this.getByName(data.name);
        if (existing) {
            throw new Error(`A category named "${data.name}" already exists.`);
        }
        return this.create(data);
    }

    async getAllSorted() {
        const categories = await this.getAll();
        return categories.sort((a, b) => a.name.localeCompare(b.name));
    }
}

export default new CategoryService();
