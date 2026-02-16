import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserReadingProgress, getReadingStats } from '../services/readingProgressService';
import { getAllBooks } from '../services/bookService';
import { ArrowLeft, BookOpen, BookMarked, CheckCircle2, BarChart3, Loader2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import Button from '../components/ui/Button';

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
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-dark transition-colors"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-5 h-5" />
            Retour à l&apos;accueil
          </button>
          <span className="text-primary font-semibold text-lg inline-flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Mes Livres
          </span>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-5">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-1">
                  {stats.totalBooks}
                </h3>
                <p className="text-gray-500 text-sm">Total de livres</p>
              </div>
            </Card>
            <Card className="p-5">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mb-3">
                  <BookMarked className="w-6 h-6 text-warning" />
                </div>
                <h3 className="text-2xl font-bold text-warning mb-1">
                  {stats.inProgressBooks}
                </h3>
                <p className="text-gray-500 text-sm">En cours</p>
              </div>
            </Card>
            <Card className="p-5">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
                <h3 className="text-2xl font-bold text-success mb-1">
                  {stats.completedBooks}
                </h3>
                <p className="text-gray-500 text-sm">Terminés</p>
              </div>
            </Card>
            <Card className="p-5">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-1">
                  {stats.averageProgress}%
                </h3>
                <p className="text-gray-500 text-sm">Progression moyenne</p>
              </div>
            </Card>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              filter === 'all'
                ? 'bg-primary text-white'
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => setFilter('all')}
          >
            Tous ({userBooks.length})
          </button>
          <button
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              filter === 'reading'
                ? 'bg-warning text-white'
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => setFilter('reading')}
          >
            En cours ({stats?.inProgressBooks || 0})
          </button>
          <button
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              filter === 'completed'
                ? 'bg-success text-white'
                : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => setFilter('completed')}
          >
            Terminés ({stats?.completedBooks || 0})
          </button>
        </div>

        {/* Books List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <BookOpen className="w-20 h-20 text-gray-300 mb-4" />
            <h5 className="text-gray-500 mb-4 text-lg">
              {filter === 'all' && 'Aucun livre dans votre bibliothèque'}
              {filter === 'reading' && 'Aucun livre en cours de lecture'}
              {filter === 'completed' && 'Aucun livre terminé'}
            </h5>
            <Button
              className="rounded-full"
              onClick={() => navigate('/catalog')}
            >
              Explorer le catalogue
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="overflow-hidden">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h5 className="text-gray-800 font-semibold text-base leading-tight">
                      {book.title}
                    </h5>
                    {book.progress.progress === 100 && (
                      <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0 ml-2" />
                    )}
                  </div>

                  <p className="text-gray-500 text-sm mb-3">
                    <span className="font-semibold">Auteur:</span> {book.author}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-500 text-sm">Progression</span>
                      <span className="text-primary font-bold text-sm">
                        {book.progress.progress}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          book.progress.progress === 100 ? 'bg-success' : 'bg-primary'
                        }`}
                        style={{ width: `${book.progress.progress}%` }}
                      />
                    </div>
                    <span className="text-gray-500 text-xs mt-1 block">
                      Page {book.progress.currentPage} sur {book.progress.totalPages}
                    </span>
                  </div>

                  <p className="text-gray-500 text-sm mb-4">
                    <span className="font-semibold">Dernière lecture:</span> {formatDate(book.progress.lastReadAt)}
                  </p>

                  <Button
                    fullWidth
                    className="rounded-full"
                    onClick={() => handleReadBook(book)}
                  >
                    {book.progress.progress === 100 ? 'Relire' : 'Continuer la lecture'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBooksPage;
