/**
 * Book Service
 * Manages books with Supabase Database + Storage
 */

import { supabase } from '../lib/supabase';

/**
 * Map snake_case DB row to camelCase
 */
const mapBook = (row) => ({
  id: row.id,
  name: row.name,
  author: row.author,
  description: row.description,
  category: row.category,
  pdfUrl: row.pdf_url,
  coverUrl: row.cover_url,
  size: row.pdf_size,
  totalPages: row.total_pages,
  price: parseFloat(row.price) || 0,
  addedDate: row.created_at,
  createdBy: row.created_by,
});

/**
 * Get all books
 * @returns {Promise<Array>} List of books
 */
export const getAllBooks = async () => {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erreur lors du chargement des livres:', error);
    throw error;
  }

  return (data || []).map(mapBook);
};

/**
 * Get book by ID
 * @param {string} bookId - Book UUID
 * @returns {Promise<object|null>} Book object or null
 */
export const getBookById = async (bookId) => {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', bookId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error('Erreur lors du chargement du livre:', error);
    throw error;
  }

  return mapBook(data);
};

/**
 * Get books by category
 * @param {string} categoryId - Category ID
 * @returns {Promise<Array>} Filtered books
 */
export const getBooksByCategory = async (categoryId) => {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('category', categoryId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []).map(mapBook);
};

/**
 * Search books using full-text search with ILIKE fallback
 * @param {string} query - Search query
 * @returns {Promise<Array>} Filtered books
 */
export const searchBooks = async (query) => {
  if (!query || !query.trim()) return getAllBooks();

  // Try full-text search first
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .textSearch('search_vector', query, { type: 'websearch', config: 'french' })
    .order('created_at', { ascending: false });

  if (error || !data || data.length === 0) {
    // Fallback to ILIKE search
    const pattern = `%${query}%`;
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('books')
      .select('*')
      .or(`name.ilike.${pattern},author.ilike.${pattern},description.ilike.${pattern}`)
      .order('created_at', { ascending: false });

    if (fallbackError) throw fallbackError;
    return (fallbackData || []).map(mapBook);
  }

  return data.map(mapBook);
};

/**
 * Add new book with PDF upload (Admin only)
 * @param {object} bookData - Book data
 * @param {File} pdfFile - PDF file to upload
 * @returns {Promise<object>} Created book
 */
export const addBook = async (bookData, pdfFile) => {
  let pdfUrl = '';

  // Upload PDF to Supabase Storage if provided
  if (pdfFile) {
    const fileExt = pdfFile.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `pdfs/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('book-pdfs')
      .upload(filePath, pdfFile, {
        contentType: pdfFile.type,
      });

    if (uploadError) {
      console.error('Erreur upload PDF:', uploadError);
      throw new Error('Erreur lors de l\'upload du fichier PDF');
    }

    pdfUrl = filePath;
  }

  const { data, error } = await supabase
    .from('books')
    .insert({
      name: bookData.name,
      author: bookData.author,
      description: bookData.description || '',
      category: bookData.category,
      pdf_url: pdfUrl,
      cover_url: bookData.coverUrl || '',
      pdf_size: pdfFile?.size || bookData.size || 0,
      total_pages: bookData.totalPages || 0,
      price: bookData.price || 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Erreur lors de l\'ajout du livre:', error);
    throw error;
  }

  return mapBook(data);
};

/**
 * Update book (Admin only)
 * @param {string} bookId - Book UUID
 * @param {object} updates - Book updates
 * @param {File} [newPdfFile] - New PDF file if replacing
 * @returns {Promise<object>} Updated book
 */
export const updateBook = async (bookId, updates, newPdfFile) => {
  const updateData = {};

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.author !== undefined) updateData.author = updates.author;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.price !== undefined) updateData.price = updates.price;
  if (updates.totalPages !== undefined) updateData.total_pages = updates.totalPages;
  if (updates.coverUrl !== undefined) updateData.cover_url = updates.coverUrl;

  // Handle PDF file replacement
  if (newPdfFile) {
    // Delete old PDF if exists
    const oldBook = await getBookById(bookId);
    if (oldBook?.pdfUrl) {
      await supabase.storage.from('book-pdfs').remove([oldBook.pdfUrl]);
    }

    const fileExt = newPdfFile.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `pdfs/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('book-pdfs')
      .upload(filePath, newPdfFile, { contentType: newPdfFile.type });

    if (uploadError) throw new Error('Erreur lors de l\'upload du fichier PDF');

    updateData.pdf_url = filePath;
    updateData.pdf_size = newPdfFile.size;
  }

  const { data, error } = await supabase
    .from('books')
    .update(updateData)
    .eq('id', bookId)
    .select()
    .single();

  if (error) {
    console.error('Erreur lors de la mise à jour:', error);
    throw error;
  }

  return mapBook(data);
};

/**
 * Delete book (Admin only)
 * @param {string} bookId - Book UUID
 * @returns {Promise<void>}
 */
export const deleteBook = async (bookId) => {
  // Get book to find PDF path
  const book = await getBookById(bookId);

  // Delete PDF from storage if exists
  if (book?.pdfUrl) {
    await supabase.storage.from('book-pdfs').remove([book.pdfUrl]);
  }

  const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', bookId);

  if (error) {
    console.error('Erreur lors de la suppression:', error);
    throw error;
  }
};

/**
 * Get book statistics
 * @returns {Promise<object>} Book statistics
 */
export const getBookStats = async () => {
  const books = await getAllBooks();

  const totalBooks = books.length;
  const totalSize = books.reduce((sum, book) => sum + (book.size || 0), 0);
  const categoryCounts = {};

  books.forEach(book => {
    categoryCounts[book.category] = (categoryCounts[book.category] || 0) + 1;
  });

  return {
    totalBooks,
    totalSize,
    categoryCounts,
    averageSize: totalBooks > 0 ? Math.round(totalSize / totalBooks) : 0,
  };
};

/**
 * Get a signed URL for reading a PDF
 * @param {string} pdfPath - Storage path of the PDF
 * @returns {Promise<string>} Signed URL
 */
export const getPdfUrl = async (pdfPath) => {
  if (!pdfPath) return null;

  const { data, error } = await supabase.storage
    .from('book-pdfs')
    .createSignedUrl(pdfPath, 3600); // 1 hour expiry

  if (error) {
    console.error('Erreur lors de la génération de l\'URL:', error);
    throw error;
  }

  return data.signedUrl;
};

export default {
  getAllBooks,
  getBookById,
  getBooksByCategory,
  searchBooks,
  addBook,
  updateBook,
  deleteBook,
  getBookStats,
  getPdfUrl,
};
