import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBooks } from '../services/bookService';
import categories from '../config/categories.json';

function CatalogPage() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredBooks(books);
    } else {
      setFilteredBooks(books.filter(book => book.category === selectedCategory));
    }
  }, [selectedCategory, books]);

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

  const handleOpenBook = (book) => {
    // Navigate to book details page instead of reader directly
    navigate(`/book?id=${book.id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Jamais lu';
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
    <div className="min-vh-100" style={{ backgroundColor: '#f5f7fa' }}>
      {/* Navbar */}
      <nav className="navbar navbar-light bg-white shadow-sm">
        <div className="container-fluid px-4">
          <div className="d-flex align-items-center">
            <button
              className="btn btn-link text-decoration-none me-3"
              onClick={() => navigate('/')}
              style={{ color: '#5f6368' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <span className="navbar-brand mb-0 h4" style={{ color: '#5f6368' }}>Ma Bibliothèque</span>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container py-5">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: '#9fa8da' }} role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-5">
            <svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-4">
              <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" stroke="#9fa8da" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 7H17M7 12H17M7 17H13" stroke="#9fa8da" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h5 className="mb-3" style={{ color: '#5f6368' }}>Votre bibliothèque est vide</h5>
            <p className="text-muted mb-4">Ajoutez des livres depuis la page d'accueil</p>
            <button
              className="btn btn-lg px-5 py-3"
              onClick={() => navigate('/')}
              style={{
                backgroundColor: '#9fa8da',
                color: 'white',
                borderRadius: '50px',
                border: 'none'
              }}
            >
              Ajouter un livre
            </button>
          </div>
        ) : (
          <>
            {/* Filtre de catégories */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 style={{ color: '#5f6368' }}>{filteredBooks.length} livre{filteredBooks.length > 1 ? 's' : ''}</h5>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button
                  className={`btn btn-sm ${selectedCategory === 'all' ? '' : 'btn-outline-secondary'}`}
                  onClick={() => setSelectedCategory('all')}
                  style={{
                    backgroundColor: selectedCategory === 'all' ? '#9fa8da' : 'white',
                    color: selectedCategory === 'all' ? 'white' : '#5f6368',
                    borderRadius: '20px',
                    border: selectedCategory === 'all' ? 'none' : '1px solid #e0e0e0',
                    padding: '8px 16px'
                  }}
                >
                  Tous ({books.length})
                </button>
                {categories.map(cat => {
                  const count = books.filter(b => b.category === cat.id).length;
                  return count > 0 ? (
                    <button
                      key={cat.id}
                      className={`btn btn-sm ${selectedCategory === cat.id ? '' : 'btn-outline-secondary'}`}
                      onClick={() => setSelectedCategory(cat.id)}
                      style={{
                        backgroundColor: selectedCategory === cat.id ? cat.color : 'white',
                        color: selectedCategory === cat.id ? 'white' : '#5f6368',
                        borderRadius: '20px',
                        border: selectedCategory === cat.id ? 'none' : '1px solid #e0e0e0',
                        padding: '8px 16px'
                      }}
                    >
                      {cat.name} ({count})
                    </button>
                  ) : null;
                })}
              </div>
            </div>

            <div className="row g-4">
              {filteredBooks.map((book) => (
                <div key={book.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                  <div
                    className="card border-0 shadow-sm h-100"
                    style={{
                      borderRadius: '15px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => handleOpenBook(book)}
                  >
                    <div className="card-body p-4">
                      <div className="mb-3">
                        <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-3">
                          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="#9fa8da" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="#9fa8da" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>

                      {/* Badge de catégorie */}
                      <div className="mb-2">
                        <span
                          className="badge"
                          style={{
                            backgroundColor: getCategoryInfo(book.category).color,
                            color: 'white',
                            fontSize: '0.7rem',
                            padding: '4px 10px',
                            borderRadius: '12px'
                          }}
                        >
                          {getCategoryInfo(book.category).name}
                        </span>
                      </div>

                      <h6 className="card-title mb-2" style={{
                        color: '#5f6368',
                        fontSize: '0.95rem',
                        fontWeight: '500',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {book.name}
                      </h6>

                      <div className="mt-3">
                        <p className="text-muted small mb-1">
                          <strong>Taille:</strong> {formatSize(book.size)}
                        </p>
                        <p className="text-muted small mb-1">
                          <strong>Ajouté:</strong> {formatDate(book.addedDate)}
                        </p>
                        {book.lastRead && (
                          <p className="text-muted small mb-0">
                            <strong>Dernière lecture:</strong> {formatDate(book.lastRead)}
                          </p>
                        )}
                        {book.currentPage && book.currentPage > 1 && (
                          <p className="text-muted small mb-0">
                            <strong>Page:</strong> {book.currentPage}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CatalogPage;
