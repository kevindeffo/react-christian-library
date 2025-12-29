import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBookById } from '../services/libraryService';
import { useCategories } from '../hooks/useCategories';
import { formatDate, formatSize } from '../utils/formatters';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import CategoryBadge from '../components/shared/CategoryBadge';
import { colors } from '../config/theme';
import { ROUTES } from '../utils/constants';

function BookDetailsPage() {
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const bookId = searchParams.get('id');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getCategoryById } = useCategories();

  useEffect(() => {
    loadBook();
  }, [bookId]);

  const loadBook = async () => {
    if (!bookId) {
      navigate(ROUTES.CATALOG);
      return;
    }

    try {
      setLoading(true);
      const bookData = await getBookById(parseInt(bookId));
      if (bookData) {
        setBook(bookData);
      } else {
        navigate(ROUTES.CATALOG);
      }
    } catch (error) {
      console.error('Error loading book:', error);
      navigate(ROUTES.CATALOG);
    } finally {
      setLoading(false);
    }
  };

  const handleReadBook = () => {
    if (!user) {
      // Redirect to login with return URL
      navigate(ROUTES.LOGIN, {
        state: { from: { pathname: ROUTES.READER, search: `?id=${bookId}` } }
      });
      return;
    }

    // Navigate to reader
    navigate(ROUTES.READER, {
      state: {
        file: book.file,
        fileName: book.name,
        bookId: book.id,
        currentPage: book.currentPage || 1
      }
    });
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border" style={{ color: colors.primary }} role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!book) return null;

  const category = getCategoryById(book.category);

  return (
    <div className="min-vh-100" style={{ backgroundColor: colors.background }}>
      {/* Navbar */}
      <nav className="navbar navbar-light bg-white shadow-sm">
        <div className="container-fluid px-4">
          <div className="d-flex align-items-center">
            <button
              className="btn btn-link text-decoration-none me-3"
              onClick={() => navigate(ROUTES.CATALOG)}
              style={{ color: colors.text }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <Link to={ROUTES.HOME} className="navbar-brand mb-0 h4 text-decoration-none" style={{ color: colors.text }}>
              <span style={{ fontSize: '1.5rem', marginRight: '8px' }}>📖</span>
              Bibliothèque Chrétienne
            </Link>
          </div>
          {!user && (
            <div>
              <Link to={ROUTES.LOGIN}>
                <Button variant="outline" size="sm">
                  Connexion
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Content */}
      <div className="container py-5">
        <div className="row">
          {/* Book Cover/Icon */}
          <div className="col-lg-4 mb-4">
            <Card padding="xl" className="text-center">
              <div
                style={{
                  width: '100%',
                  height: '400px',
                  backgroundColor: colors.backgroundDark,
                  borderRadius: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px'
                }}
              >
                <svg width="150" height="150" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke={colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              {user ? (
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleReadBook}
                  icon="📖"
                >
                  Lire maintenant
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleReadBook}
                  icon="🔒"
                >
                  Se connecter pour lire
                </Button>
              )}

              {!user && (
                <p className="text-muted small mt-3 mb-0">
                  Vous devez être connecté pour lire ce livre
                </p>
              )}
            </Card>
          </div>

          {/* Book Details */}
          <div className="col-lg-8">
            <Card padding="xl">
              {/* Category Badge */}
              <div className="mb-3">
                <CategoryBadge categoryId={book.category} />
              </div>

              {/* Title */}
              <h1 className="mb-3" style={{ color: colors.text }}>
                {book.name}
              </h1>

              {/* Meta Information */}
              <div className="mb-4">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>📅</span>
                      <div>
                        <div className="text-muted small">Date d'ajout</div>
                        <div style={{ fontWeight: '500' }}>{formatDate(book.addedDate)}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>💾</span>
                      <div>
                        <div className="text-muted small">Taille du fichier</div>
                        <div style={{ fontWeight: '500' }}>{formatSize(book.size)}</div>
                      </div>
                    </div>
                  </div>
                  {book.lastRead && (
                    <div className="col-md-6">
                      <div className="d-flex align-items-center">
                        <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>👁️</span>
                        <div>
                          <div className="text-muted small">Dernière lecture</div>
                          <div style={{ fontWeight: '500' }}>{formatDate(book.lastRead)}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <hr />

              {/* Description */}
              <div className="mb-4">
                <h5 className="mb-3" style={{ color: colors.text }}>Description</h5>
                <p className="text-muted">
                  Ce livre fait partie de la catégorie <strong>{category?.name}</strong>.
                  {category?.description && ` ${category.description}`}
                </p>
              </div>

              {/* Features */}
              <div className="mb-4">
                <h5 className="mb-3" style={{ color: colors.text }}>Fonctionnalités</h5>
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <span style={{ color: colors.success, marginRight: '8px' }}>✓</span>
                    Lecture en ligne sans téléchargement
                  </li>
                  <li className="mb-2">
                    <span style={{ color: colors.success, marginRight: '8px' }}>✓</span>
                    Sauvegarde automatique de la progression
                  </li>
                  <li className="mb-2">
                    <span style={{ color: colors.success, marginRight: '8px' }}>✓</span>
                    Zoom et navigation faciles
                  </li>
                  <li className="mb-2">
                    <span style={{ color: colors.success, marginRight: '8px' }}>✓</span>
                    Accessible sur tous vos appareils
                  </li>
                </ul>
              </div>

              {!user && (
                <div className="alert" style={{ backgroundColor: colors.backgroundDark, border: 'none', borderRadius: '15px' }}>
                  <h6 style={{ color: colors.primary }}>📚 Profitez de notre bibliothèque complète</h6>
                  <p className="mb-2">Créez un compte gratuitement pour accéder à tous nos livres chrétiens.</p>
                  <Link to={ROUTES.REGISTER}>
                    <Button variant="primary" size="sm">
                      S'inscrire gratuitement
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetailsPage;
