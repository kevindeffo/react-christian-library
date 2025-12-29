// Service pour gérer la bibliothèque de livres avec IndexedDB
// TODO: Migrer vers une API REST quand le backend sera prêt

import categoriesData from '../config/categories.json';
import { DB_CONFIG } from '../utils/constants';

const { NAME: DB_NAME, VERSION: DB_VERSION, STORE_NAME } = DB_CONFIG;

// Export categories from JSON config
// In the future, this will be fetched from API
export const CATEGORIES = categoriesData;

// Initialiser la base de données
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Supprimer l'ancien store s'il existe (pour la mise à jour)
      if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME);
      }

      // Créer le nouveau store avec le champ category
      const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      objectStore.createIndex('name', 'name', { unique: false });
      objectStore.createIndex('addedDate', 'addedDate', { unique: false });
      objectStore.createIndex('category', 'category', { unique: false });
    };
  });
};

// Ajouter un livre à la bibliothèque
export const addBookToLibrary = async (file, category = 'other') => {
  try {
    const db = await initDB();

    // Convertir le fichier en ArrayBuffer pour le stocker
    const arrayBuffer = await file.arrayBuffer();

    const book = {
      name: file.name,
      type: file.type,
      size: file.size,
      data: arrayBuffer,
      category: category,
      addedDate: new Date().toISOString(),
      lastRead: null,
      currentPage: 1
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.add(book);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du livre:', error);
    throw error;
  }
};

// Récupérer tous les livres
export const getAllBooks = async () => {
  try {
    const db = await initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.getAll();

      request.onsuccess = () => {
        const books = request.result.map(book => ({
          ...book,
          // Convertir ArrayBuffer en Blob pour l'utilisation
          file: new Blob([book.data], { type: book.type })
        }));
        resolve(books);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des livres:', error);
    throw error;
  }
};

// Récupérer un livre par ID
export const getBookById = async (id) => {
  try {
    const db = await initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.get(id);

      request.onsuccess = () => {
        if (request.result) {
          const book = {
            ...request.result,
            file: new Blob([request.result.data], { type: request.result.type })
          };
          resolve(book);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du livre:', error);
    throw error;
  }
};

// Supprimer un livre
export const deleteBook = async (id) => {
  try {
    const db = await initDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du livre:', error);
    throw error;
  }
};

// Mettre à jour la dernière lecture et la page courante
export const updateBookProgress = async (id, currentPage) => {
  try {
    const db = await initDB();
    const book = await getBookById(id);

    if (!book) return;

    book.lastRead = new Date().toISOString();
    book.currentPage = currentPage;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.put(book);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du progrès:', error);
    throw error;
  }
};

// Récupérer les livres par catégorie
export const getBooksByCategory = async (categoryId) => {
  try {
    const allBooks = await getAllBooks();
    return allBooks.filter(book => book.category === categoryId);
  } catch (error) {
    console.error('Erreur lors de la récupération des livres par catégorie:', error);
    throw error;
  }
};

// Obtenir le nombre de livres par catégorie
export const getBooksCountByCategory = async () => {
  try {
    const allBooks = await getAllBooks();
    const counts = {};

    CATEGORIES.forEach(cat => {
      counts[cat.id] = allBooks.filter(book => book.category === cat.id).length;
    });

    return counts;
  } catch (error) {
    console.error('Erreur lors du comptage des livres:', error);
    throw error;
  }
};
