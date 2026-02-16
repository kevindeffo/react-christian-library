import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBooks } from '../services/bookService';
import categories from '../config/categories.json';
import { ArrowLeft, BookOpen, Loader2 } from 'lucide-react';
import BookCard from '../components/shared/BookCard';
import { cn } from '../lib/utils';

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
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors mr-3"
              onClick={() => navigate('/')}
              aria-label="Retour"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="text-lg font-semibold text-gray-700">Ma Bibliothèque</span>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : books.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <BookOpen className="h-20 w-20 text-gray-300 mb-6" />
            <h5 className="text-lg font-medium text-gray-600 mb-2">Votre bibliothèque est vide</h5>
            <p className="text-gray-400 mb-6">Ajoutez des livres depuis la page d&apos;accueil</p>
            <button
              className="bg-primary text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-primary-dark transition-colors"
              onClick={() => navigate('/')}
            >
              Ajouter un livre
            </button>
          </div>
        ) : (
          <>
            {/* Book count header */}
            <div className="flex justify-between items-center mb-4">
              <h5 className="text-gray-600 font-medium">
                {filteredBooks.length} livre{filteredBooks.length > 1 ? 's' : ''}
              </h5>
            </div>

            {/* Category filter pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                  selectedCategory === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                )}
                onClick={() => setSelectedCategory('all')}
              >
                Tous ({books.length})
              </button>
              {categories.map(cat => {
                const count = books.filter(b => b.category === cat.id).length;
                return count > 0 ? (
                  <button
                    key={cat.id}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                      selectedCategory === cat.id
                        ? 'text-white'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    )}
                    style={selectedCategory === cat.id ? { backgroundColor: cat.color } : undefined}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.name} ({count})
                  </button>
                ) : null;
              })}
            </div>

            {/* Book grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onOpen={handleOpenBook}
                  showActions={false}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CatalogPage;
