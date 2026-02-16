import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBookById } from '../services/libraryService';
import { useCategories } from '../hooks/useCategories';
import { formatDate, formatSize } from '../utils/formatters';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import CategoryBadge from '../components/shared/CategoryBadge';
import { ROUTES } from '../utils/constants';
import { ArrowLeft, BookOpen, Calendar, HardDrive, Eye, Check, Lock } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

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
      navigate(ROUTES.LOGIN, {
        state: { from: { pathname: ROUTES.READER, search: `?id=${bookId}` } }
      });
      return;
    }

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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!book) return null;

  const category = getCategoryById(book.category);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors mr-3"
                onClick={() => navigate(ROUTES.CATALOG)}
                aria-label="Retour au catalogue"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Link to={ROUTES.HOME} className="flex items-center gap-2 no-underline">
                <BookOpen className="h-6 w-6 text-primary" />
                <span className="font-bold text-primary text-lg">BiblioHub</span>
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
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column - Book Cover */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="bg-gray-100 rounded-xl h-96 flex items-center justify-center mb-6">
                  <BookOpen className="h-24 w-24 text-primary/30" />
                </div>

                {user ? (
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleReadBook}
                  >
                    <BookOpen className="h-5 w-5" />
                    Lire maintenant
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleReadBook}
                  >
                    <Lock className="h-5 w-5" />
                    Se connecter pour lire
                  </Button>
                )}

                {!user && (
                  <p className="text-gray-400 text-sm mt-3">
                    Vous devez être connecté pour lire ce livre
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column - Book Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                {/* Category Badge */}
                <div className="mb-3">
                  <CategoryBadge categoryId={book.category} />
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  {book.name}
                </h1>

                {/* Meta Information */}
                <div className="grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Date d&apos;ajout</div>
                      <div className="font-medium text-gray-700">{formatDate(book.addedDate)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary/10">
                      <HardDrive className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">Taille du fichier</div>
                      <div className="font-medium text-gray-700">{formatSize(book.size)}</div>
                    </div>
                  </div>
                  {book.lastRead && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-warning/10">
                        <Eye className="h-5 w-5 text-warning" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Dernière lecture</div>
                        <div className="font-medium text-gray-700">{formatDate(book.lastRead)}</div>
                      </div>
                    </div>
                  )}
                </div>

                <hr className="border-gray-100 my-6" />

                {/* Description */}
                <div className="mb-6">
                  <h5 className="text-lg font-semibold text-gray-900 mb-3">Description</h5>
                  <p className="text-gray-500 leading-relaxed">
                    Ce livre fait partie de la catégorie <strong>{category?.name}</strong>.
                    {category?.description && ` ${category.description}`}
                  </p>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <h5 className="text-lg font-semibold text-gray-900 mb-3">Fonctionnalités</h5>
                  <ul className="space-y-3">
                    {[
                      'Lecture en ligne sans téléchargement',
                      'Sauvegarde automatique de la progression',
                      'Zoom et navigation faciles',
                      'Accessible sur tous vos appareils',
                    ].map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <Check className="h-5 w-5 text-success flex-shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {!user && (
                  <div className="bg-primary/5 rounded-xl p-6">
                    <div className="flex items-start gap-3 mb-3">
                      <BookOpen className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                      <h6 className="text-primary font-semibold">
                        Profitez de notre bibliothèque complète
                      </h6>
                    </div>
                    <p className="text-gray-600 mb-4 ml-9">
                      Créez un compte gratuitement pour accéder à tous nos livres.
                    </p>
                    <div className="ml-9">
                      <Link to={ROUTES.REGISTER}>
                        <Button variant="primary" size="sm">
                          S&apos;inscrire gratuitement
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDetailsPage;
