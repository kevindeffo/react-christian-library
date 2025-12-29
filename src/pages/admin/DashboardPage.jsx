import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBooks } from '../../services/bookService';
import categories from '../../config/categories.json';
import AdminLayout from '../../components/layouts/AdminLayout';

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
      <div className="p-4">
        {/* Header */}
        <div className="mb-4">
          <h2 className="mb-2" style={{ color: '#5f6368', fontWeight: '600' }}>
            Tableau de bord
          </h2>
          <p className="text-muted">
            Vue d'ensemble de votre bibliothèque chrétienne
          </p>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: '#8b5cf6' }} role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="row g-4 mb-4">
              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center">
                      <div
                        className="me-3 d-flex align-items-center justify-content-center"
                        style={{
                          width: '50px',
                          height: '50px',
                          backgroundColor: '#ede9fe',
                          borderRadius: '12px'
                        }}
                      >
                        <span style={{ fontSize: '1.5rem' }}>📚</span>
                      </div>
                      <div>
                        <div className="text-muted small">Total livres</div>
                        <div className="h3 mb-0" style={{ color: '#8b5cf6' }}>
                          {stats.totalBooks}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center">
                      <div
                        className="me-3 d-flex align-items-center justify-content-center"
                        style={{
                          width: '50px',
                          height: '50px',
                          backgroundColor: '#dbeafe',
                          borderRadius: '12px'
                        }}
                      >
                        <span style={{ fontSize: '1.5rem' }}>🏷️</span>
                      </div>
                      <div>
                        <div className="text-muted small">Catégories</div>
                        <div className="h3 mb-0" style={{ color: '#3b82f6' }}>
                          {categories.length}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center">
                      <div
                        className="me-3 d-flex align-items-center justify-content-center"
                        style={{
                          width: '50px',
                          height: '50px',
                          backgroundColor: '#fef3c7',
                          borderRadius: '12px'
                        }}
                      >
                        <span style={{ fontSize: '1.5rem' }}>💾</span>
                      </div>
                      <div>
                        <div className="text-muted small">Espace utilisé</div>
                        <div className="h3 mb-0" style={{ color: '#f59e0b' }}>
                          {formatSize(stats.totalSize)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-3">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center">
                      <div
                        className="me-3 d-flex align-items-center justify-content-center"
                        style={{
                          width: '50px',
                          height: '50px',
                          backgroundColor: '#d1fae5',
                          borderRadius: '12px'
                        }}
                      >
                        <span style={{ fontSize: '1.5rem' }}>📖</span>
                      </div>
                      <div>
                        <div className="text-muted small">Taille moyenne</div>
                        <div className="h3 mb-0" style={{ color: '#10b981' }}>
                          {stats.totalBooks > 0 ? formatSize(stats.totalSize / stats.totalBooks) : '0 MB'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="row g-4">
              {/* Recent Books */}
              <div className="col-lg-7">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0" style={{ color: '#5f6368' }}>Livres récents</h5>
                      <button
                        className="btn btn-sm"
                        onClick={() => navigate('/admin/books')}
                        style={{
                          backgroundColor: '#f3f4f6',
                          color: '#5f6368',
                          borderRadius: '10px',
                          border: 'none'
                        }}
                      >
                        Voir tout
                      </button>
                    </div>

                    {stats.recentBooks.length === 0 ? (
                      <div className="text-center py-4">
                        <div style={{ fontSize: '3rem', opacity: 0.5 }} className="mb-2">📚</div>
                        <p className="text-muted">Aucun livre ajouté</p>
                        <button
                          className="btn btn-sm px-3"
                          onClick={() => navigate('/admin/add-book')}
                          style={{
                            backgroundColor: '#8b5cf6',
                            color: 'white',
                            borderRadius: '10px',
                            border: 'none'
                          }}
                        >
                          Ajouter un livre
                        </button>
                      </div>
                    ) : (
                      <div className="list-group list-group-flush">
                        {stats.recentBooks.map((book) => (
                          <div key={book.id} className="list-group-item border-0 px-0 py-3">
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
                                <span style={{ fontSize: '1.3rem' }}>📖</span>
                              </div>
                              <div className="flex-grow-1">
                                <div className="fw-semibold" style={{ color: '#5f6368' }}>
                                  {book.name}
                                </div>
                                <small className="text-muted">
                                  Ajouté le {formatDate(book.addedDate)}
                                </small>
                              </div>
                              <span
                                className="badge"
                                style={{
                                  backgroundColor: categories.find(cat => cat.id === book.category)?.color || '#64748b',
                                  color: 'white',
                                  padding: '6px 12px',
                                  borderRadius: '10px'
                                }}
                              >
                                {formatSize(book.size)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Popular Categories */}
              <div className="col-lg-5">
                <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0" style={{ color: '#5f6368' }}>Top catégories</h5>
                      <button
                        className="btn btn-sm"
                        onClick={() => navigate('/admin/categories')}
                        style={{
                          backgroundColor: '#f3f4f6',
                          color: '#5f6368',
                          borderRadius: '10px',
                          border: 'none'
                        }}
                      >
                        Voir tout
                      </button>
                    </div>

                    {stats.popularCategories.length === 0 ? (
                      <div className="text-center py-4">
                        <div style={{ fontSize: '3rem', opacity: 0.5 }} className="mb-2">🏷️</div>
                        <p className="text-muted">Aucune catégorie utilisée</p>
                      </div>
                    ) : (
                      <div className="list-group list-group-flush">
                        {stats.popularCategories.map(({ category, count }) => (
                          <div key={category.id} className="list-group-item border-0 px-0 py-3">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <div className="d-flex align-items-center">
                                <span style={{ fontSize: '1.5rem', marginRight: '12px' }}>
                                  {category.icon}
                                </span>
                                <div>
                                  <div className="fw-semibold" style={{ color: '#5f6368' }}>
                                    {category.name}
                                  </div>
                                  <small className="text-muted">{count} livre{count > 1 ? 's' : ''}</small>
                                </div>
                              </div>
                              <span
                                className="badge rounded-pill"
                                style={{
                                  backgroundColor: category.color,
                                  color: 'white',
                                  padding: '6px 12px'
                                }}
                              >
                                {((count / stats.totalBooks) * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div className="progress" style={{ height: '4px', borderRadius: '10px' }}>
                              <div
                                className="progress-bar"
                                role="progressbar"
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
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="row g-4 mt-2">
              <div className="col-12">
                <div className="card border-0 shadow-sm" style={{ borderRadius: '15px', backgroundColor: '#ede9fe' }}>
                  <div className="card-body p-4">
                    <h5 className="mb-3" style={{ color: '#8b5cf6' }}>Actions rapides</h5>
                    <div className="d-flex flex-wrap gap-2">
                      <button
                        className="btn px-4"
                        onClick={() => navigate('/admin/add-book')}
                        style={{
                          backgroundColor: '#8b5cf6',
                          color: 'white',
                          borderRadius: '20px',
                          border: 'none'
                        }}
                      >
                        ➕ Ajouter un livre
                      </button>
                      <button
                        className="btn px-4"
                        onClick={() => navigate('/admin/books')}
                        style={{
                          backgroundColor: 'white',
                          color: '#8b5cf6',
                          borderRadius: '20px',
                          border: 'none'
                        }}
                      >
                        📚 Gérer les livres
                      </button>
                      <button
                        className="btn px-4"
                        onClick={() => navigate('/catalog')}
                        style={{
                          backgroundColor: 'white',
                          color: '#8b5cf6',
                          borderRadius: '20px',
                          border: 'none'
                        }}
                      >
                        👁️ Voir le catalogue
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

export default DashboardPage;
