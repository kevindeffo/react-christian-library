import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBooks, deleteBook } from '../../services/bookService';
import categories from '../../config/categories.json';
import AdminLayout from '../../components/layouts/AdminLayout';

function BooksManagementPage() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    let result = books;

    // Filtre par catégorie
    if (selectedCategory !== 'all') {
      result = result.filter(book => book.category === selectedCategory);
    }

    // Filtre par recherche
    if (searchQuery.trim()) {
      result = result.filter(book =>
        book.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredBooks(result);
  }, [selectedCategory, searchQuery, books]);

  const loadBooks = async () => {
    try {
      const allBooks = await getAllBooks();
      setBooks(allBooks);
      setFilteredBooks(allBooks);
    } catch (error) {
      console.error('Erreur lors du chargement des livres:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryInfo = (categoryId) => {
    return categories.find(cat => cat.id === categoryId) || categories.find(cat => cat.id === 'other');
  };

  const handleDeleteBook = async (bookId, bookName) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${bookName}" ?`)) {
      try {
        await deleteBook(bookId);
        await loadBooks();
        alert('Livre supprimé avec succès');
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression du livre');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifié';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <AdminLayout>
      <div className="p-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="mb-2" style={{ color: '#5f6368', fontWeight: '600' }}>
              Gestion des livres
            </h2>
            <p className="text-muted mb-0">
              {filteredBooks.length} livre{filteredBooks.length > 1 ? 's' : ''} au total
            </p>
          </div>
          <button
            className="btn btn-lg px-4"
            onClick={() => navigate('/admin/add-book')}
            style={{
              backgroundColor: '#8b5cf6',
              color: 'white',
              borderRadius: '25px',
              border: 'none'
            }}
          >
            <span className="me-2">➕</span>
            Ajouter un livre
          </button>
        </div>

        {/* Filters */}
        <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '15px' }}>
          <div className="card-body p-4">
            <div className="row g-3">
              {/* Search */}
              <div className="col-md-6">
                <label className="form-label fw-semibold small text-muted">Rechercher</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rechercher un livre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ borderRadius: '10px' }}
                />
              </div>

              {/* Category Filter */}
              <div className="col-md-6">
                <label className="form-label fw-semibold small text-muted">Catégorie</label>
                <select
                  className="form-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ borderRadius: '10px' }}
                >
                  <option value="all">Toutes les catégories ({books.length})</option>
                  {categories.map(cat => {
                    const count = books.filter(b => b.category === cat.id).length;
                    return (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Books List */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: '#8b5cf6' }} role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
            <div className="card-body p-5 text-center">
              <div style={{ fontSize: '4rem', opacity: 0.5 }} className="mb-3">📚</div>
              <h5 className="text-muted">
                {searchQuery || selectedCategory !== 'all'
                  ? 'Aucun livre trouvé avec ces critères'
                  : 'Aucun livre dans la bibliothèque'}
              </h5>
              {!searchQuery && selectedCategory === 'all' && (
                <button
                  className="btn btn-lg mt-3 px-4"
                  onClick={() => navigate('/admin/add-book')}
                  style={{
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    borderRadius: '25px',
                    border: 'none'
                  }}
                >
                  Ajouter votre premier livre
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead style={{ backgroundColor: '#f8f9fa' }}>
                  <tr>
                    <th className="border-0 py-3 px-4" style={{ borderRadius: '15px 0 0 0' }}>Livre</th>
                    <th className="border-0 py-3">Catégorie</th>
                    <th className="border-0 py-3">Taille</th>
                    <th className="border-0 py-3">Date d'ajout</th>
                    <th className="border-0 py-3 text-end px-4" style={{ borderRadius: '0 15px 0 0' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.map((book) => (
                    <tr key={book.id}>
                      <td className="px-4 py-3">
                        <div className="d-flex align-items-center">
                          <div
                            className="me-3 d-flex align-items-center justify-content-center"
                            style={{
                              width: '40px',
                              height: '40px',
                              backgroundColor: '#f3f4f6',
                              borderRadius: '8px'
                            }}
                          >
                            <span style={{ fontSize: '1.5rem' }}>📖</span>
                          </div>
                          <div>
                            <div className="fw-semibold" style={{ color: '#5f6368' }}>
                              {book.name}
                            </div>
                            {book.lastRead && (
                              <small className="text-muted">
                                Dernière lecture: {formatDate(book.lastRead)}
                              </small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span
                          className="badge"
                          style={{
                            backgroundColor: getCategoryInfo(book.category).color,
                            color: 'white',
                            fontSize: '0.75rem',
                            padding: '6px 12px',
                            borderRadius: '12px'
                          }}
                        >
                          {getCategoryInfo(book.category).icon} {getCategoryInfo(book.category).name}
                        </span>
                      </td>
                      <td className="py-3 text-muted">
                        {formatSize(book.size)}
                      </td>
                      <td className="py-3 text-muted">
                        {formatDate(book.addedDate)}
                      </td>
                      <td className="py-3 text-end px-4">
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteBook(book.id, book.name)}
                          style={{ borderRadius: '10px' }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className="ms-2">Supprimer</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default BooksManagementPage;
