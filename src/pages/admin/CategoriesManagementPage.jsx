import { useState, useEffect } from 'react';
import { CATEGORIES, getAllBooks } from '../../services/libraryService';
import AdminLayout from '../../components/layouts/AdminLayout';
import { Card, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Tags, BookOpen, Sparkles, Lightbulb, Loader2 } from 'lucide-react';

function CategoriesManagementPage() {
  const [categoriesWithCount, setCategoriesWithCount] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategoriesData();
  }, []);

  const loadCategoriesData = async () => {
    try {
      const books = await getAllBooks();

      const categoriesData = CATEGORIES.map(category => {
        const count = books.filter(book => book.category === category.id).length;
        return {
          ...category,
          count
        };
      });

      setCategoriesWithCount(categoriesData);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalBooks = categoriesWithCount.reduce((sum, cat) => sum + cat.count, 0);

  return (
    <AdminLayout>
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-1">
            Gestion des catégories
          </h2>
          <p className="text-gray-500">
            {CATEGORIES.length} catégories disponibles &bull; {totalBooks} livres au total
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-violet-100">
                <Tags className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Catégories</div>
                <div className="text-2xl font-bold text-primary">{CATEGORIES.length}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100">
                <BookOpen className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Total livres</div>
                <div className="text-2xl font-bold text-secondary">{totalBooks}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100">
                <Sparkles className="h-6 w-6 text-success" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Catégories actives</div>
                <div className="text-2xl font-bold text-success">
                  {categoriesWithCount.filter(cat => cat.count > 0).length}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoriesWithCount.map((category) => (
              <Card
                key={category.id}
                className="border-l-4"
                style={{ borderLeftColor: category.color }}
              >
                <CardContent>
                  <div className="flex justify-between items-start mb-3">
                    <div
                      className="flex items-center justify-center w-12 h-12 rounded-xl"
                      style={{ backgroundColor: `${category.color}15` }}
                    >
                      <span className="text-3xl">{category.icon}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold" style={{ color: category.color }}>
                        {category.count}
                      </div>
                      <span className="text-xs text-gray-400">
                        livre{category.count > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-gray-700 mb-2">
                    {category.name}
                  </h3>

                  <Badge
                    variant="custom"
                    size="sm"
                    className="text-white"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.id}
                  </Badge>

                  {category.count > 0 && (
                    <div className="mt-3">
                      <div className="h-1.5 rounded-full bg-gray-100">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${(category.count / totalBooks) * 100}%`,
                            backgroundColor: category.color
                          }}
                        />
                      </div>
                      <span className="text-xs text-gray-400 mt-1 block">
                        {((category.count / totalBooks) * 100).toFixed(1)}% du catalogue
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info Card */}
        <Card className="mt-6 bg-emerald-50 border-none">
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 shrink-0">
                <Lightbulb className="h-5 w-5 text-success" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-emerald-700 mb-1">
                  À propos des catégories
                </h3>
                <p className="text-sm text-gray-500">
                  Les catégories sont prédéfinies pour organiser votre bibliothèque.
                  Chaque livre doit être assigné à une catégorie lors de sa publication.
                  Les catégories vides ne sont pas affichées sur le site utilisateur.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

export default CategoriesManagementPage;
