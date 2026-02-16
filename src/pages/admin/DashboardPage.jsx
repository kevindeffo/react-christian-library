import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBooks } from '../../services/bookService';
import categories from '../../config/categories.json';
import AdminLayout from '../../components/layouts/AdminLayout';
import { Card, CardContent } from '../../components/ui/Card';
import { BookOpen, Tags, HardDrive, FileText, PlusCircle, Eye, Loader2 } from 'lucide-react';

function DashboardPage() {
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalSize: 0,
    recentBooks: [],
    popularCategories: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const allBooks = await getAllBooks();
      setBooks(allBooks);

      // Calculer les statistiques
      const totalSize = allBooks.reduce((sum, book) => sum + book.size, 0);
      const recentBooks = allBooks
        .sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate))
        .slice(0, 5);

      // Compter les livres par catégorie
      const categoryCounts = {};
      allBooks.forEach(book => {
        categoryCounts[book.category] = (categoryCounts[book.category] || 0) + 1;
      });

      const popularCategories = Object.entries(categoryCounts)
        .map(([categoryId, count]) => ({
          category: categories.find(cat => cat.id === categoryId) || categories.find(cat => cat.id === 'other'),
          count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setStats({
        totalBooks: allBooks.length,
        totalSize,
        recentBooks,
        popularCategories
      });
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifié';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-1">
            Tableau de bord
          </h2>
          <p className="text-gray-500">
            Vue d&apos;ensemble de votre bibliothèque
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Total livres */}
              <Card>
                <CardContent className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-violet-100">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Total livres</div>
                    <div className="text-2xl font-bold text-primary">
                      {stats.totalBooks}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Catégories */}
              <Card>
                <CardContent className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100">
                    <Tags className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Catégories</div>
                    <div className="text-2xl font-bold text-secondary">
                      {categories.length}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Espace utilisé */}
              <Card>
                <CardContent className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-100">
                    <HardDrive className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Espace utilisé</div>
                    <div className="text-2xl font-bold text-warning">
                      {formatSize(stats.totalSize)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Taille moyenne */}
              <Card>
                <CardContent className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100">
                    <FileText className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Taille moyenne</div>
                    <div className="text-2xl font-bold text-success">
                      {stats.totalBooks > 0 ? formatSize(stats.totalSize / stats.totalBooks) : '0 MB'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Two columns */}
            <div className="grid lg:grid-cols-7 gap-6">
              {/* Recent Books */}
              <div className="lg:col-span-4">
                <Card>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-700">Livres récents</h3>
                      <button
                        className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                        onClick={() => navigate('/admin/books')}
                      >
                        Voir tout
                      </button>
                    </div>

                    {stats.recentBooks.length === 0 ? (
                      <div className="text-center py-8">
                        <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 mb-3">Aucun livre ajouté</p>
                        <button
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm hover:bg-primary/90 transition-colors"
                          onClick={() => navigate('/admin/add-book')}
                        >
                          <PlusCircle className="h-4 w-4" />
                          Ajouter un livre
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {stats.recentBooks.map((book) => (
                          <div key={book.id} className="flex items-center gap-3 py-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100">
                              <BookOpen className="h-5 w-5 text-gray-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-700 truncate">
                                {book.name}
                              </div>
                              <div className="text-xs text-gray-400">
                                Ajouté le {formatDate(book.addedDate)}
                              </div>
                            </div>
                            <span
                              className="text-xs font-medium px-2.5 py-1 rounded-lg text-white shrink-0"
                              style={{
                                backgroundColor: categories.find(cat => cat.id === book.category)?.color || '#64748b'
                              }}
                            >
                              {formatSize(book.size)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Top Categories */}
              <div className="lg:col-span-3">
                <Card>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-700">Top catégories</h3>
                      <button
                        className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                        onClick={() => navigate('/admin/categories')}
                      >
                        Voir tout
                      </button>
                    </div>

                    {stats.popularCategories.length === 0 ? (
                      <div className="text-center py-8">
                        <Tags className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">Aucune catégorie utilisée</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {stats.popularCategories.map(({ category, count }) => (
                          <div key={category.id} className="py-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{category.icon}</span>
                                <div>
                                  <div className="font-semibold text-gray-700">
                                    {category.name}
                                  </div>
                                  <span className="text-xs text-gray-400">
                                    {count} livre{count > 1 ? 's' : ''}
                                  </span>
                                </div>
                              </div>
                              <span
                                className="text-xs font-medium px-2.5 py-1 rounded-full text-white"
                                style={{ backgroundColor: category.color }}
                              >
                                {((count / stats.totalBooks) * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="h-1 rounded-full bg-gray-100">
                              <div
                                className="h-1 rounded-full transition-all"
                                style={{
                                  width: `${(count / stats.totalBooks) * 100}%`,
                                  backgroundColor: category.color
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Quick Actions */}
            <Card className="mt-6 bg-primary/5 border-none">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Actions rapides</h3>
                <div className="flex flex-wrap gap-3">
                  <button
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                    onClick={() => navigate('/admin/add-book')}
                  >
                    <PlusCircle className="h-4 w-4" />
                    Ajouter un livre
                  </button>
                  <button
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-primary text-sm font-medium hover:bg-gray-50 transition-colors"
                    onClick={() => navigate('/admin/books')}
                  >
                    <BookOpen className="h-4 w-4" />
                    Gérer les livres
                  </button>
                  <button
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-primary text-sm font-medium hover:bg-gray-50 transition-colors"
                    onClick={() => navigate('/catalog')}
                  >
                    <Eye className="h-4 w-4" />
                    Voir le catalogue
                  </button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

export default DashboardPage;
