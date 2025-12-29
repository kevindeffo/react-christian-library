import { useState, useEffect } from 'react';
import { CATEGORIES, getAllBooks } from '../../services/libraryService';
import AdminLayout from '../../components/layouts/AdminLayout';

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
      <div className="p-4">
        {/* Header */}
        <div className="mb-4">
          <h2 className="mb-2" style={{ color: '#5f6368', fontWeight: '600' }}>
            Gestion des catégories
          </h2>
          <p className="text-muted">
            {CATEGORIES.length} catégories disponibles • {totalBooks} livres au total
          </p>
        </div>

        {/* Stats Cards */}
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
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
                    <span style={{ fontSize: '1.5rem' }}>🏷️</span>
                  </div>
                  <div>
                    <div className="text-muted small">Catégories</div>
                    <div className="h3 mb-0" style={{ color: '#8b5cf6' }}>{CATEGORIES.length}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
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
                    <span style={{ fontSize: '1.5rem' }}>📚</span>
                  </div>
                  <div>
                    <div className="text-muted small">Total livres</div>
                    <div className="h3 mb-0" style={{ color: '#3b82f6' }}>{totalBooks}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
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
                    <span style={{ fontSize: '1.5rem' }}>✨</span>
                  </div>
                  <div>
                    <div className="text-muted small">Catégories actives</div>
                    <div className="h3 mb-0" style={{ color: '#10b981' }}>
                      {categoriesWithCount.filter(cat => cat.count > 0).length}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border" style={{ color: '#8b5cf6' }} role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {categoriesWithCount.map((category) => (
              <div key={category.id} className="col-md-6 col-lg-4">
                <div
                  className="card border-0 shadow-sm h-100"
                  style={{
                    borderRadius: '15px',
                    borderLeft: `4px solid ${category.color}`
                  }}
                >
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div
                        className="d-flex align-items-center justify-content-center"
                        style={{
                          width: '50px',
                          height: '50px',
                          backgroundColor: `${category.color}15`,
                          borderRadius: '12px'
                        }}
                      >
                        <span style={{ fontSize: '1.8rem' }}>{category.icon}</span>
                      </div>
                      <div className="text-end">
                        <div className="h4 mb-0" style={{ color: category.color }}>
                          {category.count}
                        </div>
                        <small className="text-muted">livre{category.count > 1 ? 's' : ''}</small>
                      </div>
                    </div>

                    <h5 className="mb-2" style={{ color: '#5f6368' }}>
                      {category.name}
                    </h5>

                    <div
                      className="badge"
                      style={{
                        backgroundColor: category.color,
                        color: 'white',
                        fontSize: '0.7rem',
                        padding: '4px 10px',
                        borderRadius: '12px'
                      }}
                    >
                      {category.id}
                    </div>

                    {category.count > 0 && (
                      <div className="mt-3">
                        <div className="progress" style={{ height: '6px', borderRadius: '10px' }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{
                              width: `${(category.count / totalBooks) * 100}%`,
                              backgroundColor: category.color
                            }}
                            aria-valuenow={category.count}
                            aria-valuemin="0"
                            aria-valuemax={totalBooks}
                          />
                        </div>
                        <small className="text-muted">
                          {((category.count / totalBooks) * 100).toFixed(1)}% du catalogue
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Card */}
        <div className="card border-0 shadow-sm mt-4" style={{ borderRadius: '15px', backgroundColor: '#f0fdf4' }}>
          <div className="card-body p-4">
            <div className="d-flex align-items-start">
              <span style={{ fontSize: '2rem', marginRight: '16px' }}>💡</span>
              <div>
                <h6 className="mb-2" style={{ color: '#059669' }}>À propos des catégories</h6>
                <p className="text-muted mb-0">
                  Les catégories sont prédéfinies pour organiser votre bibliothèque chrétienne.
                  Chaque livre doit être assigné à une catégorie lors de sa publication.
                  Les catégories vides ne sont pas affichées sur le site utilisateur.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default CategoriesManagementPage;
