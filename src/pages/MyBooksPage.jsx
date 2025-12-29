import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserReadingProgress, getReadingStats } from '../services/readingProgressService';
import { getAllBooks } from '../services/bookService';

function MyBooksPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userBooks, setUserBooks] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all'); // all, reading, completed
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadUserBooks();
  }, [user, navigate]);

  const loadUserBooks = async () => {
    setLoading(true);
    try {
      // Get user's reading progress
      const progress = getUserReadingProgress(user.id);
      const readingStats = getReadingStats(user.id);

      // Get all books
      const allBooks = await getAllBooks();

      // Match progress with books
      const booksWithProgress = progress.map(p => {
        const book = allBooks.find(b => b.id === p.bookId);
        return {
          ...book,
          progress: p
        };
      }).filter(b => b.id); // Remove books that don't exist anymore

      setUserBooks(booksWithProgress);
      setStats(readingStats);
    } catch (error) {
      console.error('Error loading user books:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredBooks = () => {
    switch (filter) {
      case 'reading':
        return userBooks.filter(b => b.progress.progress > 0 && b.progress.progress < 100);
      case 'completed':
        return userBooks.filter(b => b.progress.progress === 100);
      default:
        return userBooks;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const handleReadBook = (book) => {
    navigate('/reader', {
      state: {
        file: book.file,
        fileName: book.title,
        bookId: book.id
      }
    });
  };

  const filteredBooks = getFilteredBooks();

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Navigation */}
      <nav className="navbar navbar-light bg-white shadow-sm">
        <div className="container">
          <button
            className="btn btn-link text-decoration-none"
            onClick={() => navigate('/')}
            style={{ color: '#667eea', fontWeight: '600' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="me-2">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Retour à l'accueil
          </button>
          <span className="navbar-brand mb-0 h5" style={{ color: '#667eea' }}>
            📚 Mes Livres
          </span>
        </div>
      </nav>

      <div className="container py-5">
        {/* Statistics Cards */}
        {stats && (
          <div className="row g-4 mb-5">
            <div className="col-md-3">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                <div className="card-body text-center">
                  <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📚</div>
                  <h3 className="mb-1" style={{ color: '#667eea', fontWeight: '700' }}>
                    {stats.totalBooks}
                  </h3>
                  <p className="text-muted mb-0 small">Total de livres</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                <div className="card-body text-center">
                  <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📖</div>
                  <h3 className="mb-1" style={{ color: '#f59e0b', fontWeight: '700' }}>
                    {stats.inProgressBooks}
                  </h3>
                  <p className="text-muted mb-0 small">En cours</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                <div className="card-body text-center">
                  <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>✅</div>
                  <h3 className="mb-1" style={{ color: '#10b981', fontWeight: '700' }}>
                    {stats.completedBooks}
                  </h3>
                  <p className="text-muted mb-0 small">Terminés</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                <div className="card-body text-center">
                  <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>📊</div>
                  <h3 className="mb-1" style={{ color: '#8b5cf6', fontWeight: '700' }}>
                    {stats.averageProgress}%
                  </h3>
                  <p className="text-muted mb-0 small">Progression moyenne</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="d-flex gap-2 mb-4">
          <button
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFilter('all')}
            style={{
              borderRadius: '20px',
              backgroundColor: filter === 'all' ? '#667eea' : 'transparent',
              borderColor: filter === 'all' ? '#667eea' : '#d1d5db',
              color: filter === 'all' ? 'white' : '#5f6368'
            }}
          >
            Tous ({userBooks.length})
          </button>
          <button
            className={`btn ${filter === 'reading' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFilter('reading')}
            style={{
              borderRadius: '20px',
              backgroundColor: filter === 'reading' ? '#f59e0b' : 'transparent',
              borderColor: filter === 'reading' ? '#f59e0b' : '#d1d5db',
              color: filter === 'reading' ? 'white' : '#5f6368'
            }}
          >
            En cours ({stats?.inProgressBooks || 0})
          </button>
          <button
            className={`btn ${filter === 'completed' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFilter('completed')}
            style={{
              borderRadius: '20px',
              backgroundColor: filter === 'completed' ? '#10b981' : 'transparent',
              borderColor: filter === 'completed' ? '#10b981' : '#d1d5db',
              color: filter === 'completed' ? 'white' : '#5f6368'
            }}
          >
            Terminés ({stats?.completedBooks || 0})
          </button>
        </div>

        {/* Books List */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: '#667eea' }} role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-5">
            <div style={{ fontSize: '5rem', marginBottom: '20px' }}>📚</div>
            <h5 className="text-muted mb-3">
              {filter === 'all' && 'Aucun livre dans votre bibliothèque'}
              {filter === 'reading' && 'Aucun livre en cours de lecture'}
              {filter === 'completed' && 'Aucun livre terminé'}
            </h5>
            <button
              className="btn px-4 py-2"
              onClick={() => navigate('/catalog')}
              style={{
                backgroundColor: '#667eea',
                color: 'white',
                borderRadius: '25px',
                border: 'none',
                fontWeight: '600'
              }}
            >
              Explorer le catalogue
            </button>
          </div>
        ) : (
          <div className="row g-4">
            {filteredBooks.map((book) => (
              <div key={book.id} className="col-md-6 col-lg-4">
                <div
                  className="card border-0 shadow-sm h-100"
                  style={{ borderRadius: '15px', overflow: 'hidden' }}
                >
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="card-title mb-0" style={{ color: '#2d3748', fontWeight: '600' }}>
                        {book.title}
                      </h5>
                      {book.progress.progress === 100 && (
                        <span style={{ fontSize: '1.5rem' }}>✅</span>
                      )}
                    </div>

                    <p className="text-muted small mb-2">
                      <strong>Auteur:</strong> {book.author}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <small className="text-muted">Progression</small>
                        <small className="fw-bold" style={{ color: '#667eea' }}>
                          {book.progress.progress}%
                        </small>
                      </div>
                      <div
                        className="progress"
                        style={{ height: '8px', borderRadius: '10px', backgroundColor: '#e5e7eb' }}
                      >
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{
                            width: `${book.progress.progress}%`,
                            backgroundColor: book.progress.progress === 100 ? '#10b981' : '#667eea',
                            borderRadius: '10px'
                          }}
                          aria-valuenow={book.progress.progress}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                      <small className="text-muted">
                        Page {book.progress.currentPage} sur {book.progress.totalPages}
                      </small>
                    </div>

                    <p className="text-muted small mb-3">
                      <strong>Dernière lecture:</strong> {formatDate(book.progress.lastReadAt)}
                    </p>

                    <button
                      className="btn w-100"
                      onClick={() => handleReadBook(book)}
                      style={{
                        backgroundColor: '#667eea',
                        color: 'white',
                        borderRadius: '20px',
                        border: 'none',
                        fontWeight: '600',
                        padding: '10px'
                      }}
                    >
                      {book.progress.progress === 100 ? 'Relire' : 'Continuer la lecture'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBooksPage;
