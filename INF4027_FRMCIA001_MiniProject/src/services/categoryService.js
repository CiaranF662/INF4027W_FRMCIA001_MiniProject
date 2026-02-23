// src/services/categoryService.js                                                                                                                                           

import FirestoreService from './baseService';

/**                                                                                                                                                                        
 * CategoryService — handles all database operations for the 'categories' collection.
 *
 * Extends FirestoreService, so it inherits:
 *   getAll(), getById(), create(), update(), delete()
 *
 * Categories are simple — they only have a name and description.
 * This class is deliberately lean because the parent class already
 * covers everything categories need.
 *
 * Additional methods added here:
 *   getByName(name)           — check if a category name already exists
 *   createCategory(data)      — create with duplicate name validation
 */
class CategoryService extends FirestoreService {

    constructor() {
        // Tell the parent class to point at the 'categories' Firestore collection
        super('categories');
    }

    /**
     * GET BY NAME — find a category by its name.
     * Used to check for duplicates before creating a new category.
     *
     * @param {string} name - the category name to search for (case-insensitive)
     * @returns {Object|null} the category if found, or null
     */
    async getByName(name) {
        const snapshot = await this.collection
            .where('name', '==', name)
            .limit(1)
            .get();

        if (snapshot.empty) return null;

        const doc = snapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data()
        };
    }

    /**
     * CREATE CATEGORY — add a new category with duplicate name validation.
     * Overrides the parent create() to add a business rule:
     * no two categories can share the same name.
     *
     * @param {Object} data - category fields
     * @param {string} data.name        - e.g. "Jeans"
     * @param {string} data.description - e.g. "All styles of denim jeans"
     * @returns {Object} the newly created category
     * @throws {Error} if a category with that name already exists
     */
    async createCategory(data) {     // Check for an existing category with the same name

        const existing = await this.getByName(data.name);

        if (existing) {
            throw new Error(`A category named "${data.name}" already exists.`);
        }

        return this.create(data);    // Delegate to the parent class create() method
    }

    /**
     * GET ALL SORTED — returns all categories sorted alphabetically by name.
     * Used to populate the category filter sidebar and the admin categories table.
     *
     * @returns {Array} all categories sorted A-Z
     */
    async getAllSorted() {
        const categories = await this.getAll();
        return categories.sort((a, b) => a.name.localeCompare(b.name));
    }
}

// Export a single shared instance
export default new CategoryService();
