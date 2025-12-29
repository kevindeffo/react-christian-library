import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCategories } from '../hooks/useCategories';
import { ROUTES } from '../utils/constants';

function LandingPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { categories } = useCategories();

  const handleLogout = () => {
    logout();
    window.location.reload(); // Refresh to update UI
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
        <div className="container py-2">
          <a
            className="navbar-brand d-flex align-items-center"
            href="/"
            style={{ cursor: 'pointer' }}
          >
            <span style={{ fontSize: '1.8rem', marginRight: '10px' }}>📖</span>
            <span style={{ fontWeight: '700', color: '#667eea', fontSize: '1.4rem' }}>
              Bibliothèque Chrétienne
            </span>
          </a>

          <button
            className="navbar-toggler border-0"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-lg-center gap-1">
              <li className="nav-item">
                <a
                  className="nav-link px-3 py-2"
                  href="#catalogue"
                  style={{
                    fontWeight: '500',
                    color: '#5f6368',
                    transition: 'color 0.2s'
                  }}
                >
                  Catalogue
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link px-3 py-2"
                  href="#categories"
                  style={{
                    fontWeight: '500',
                    color: '#5f6368',
                    transition: 'color 0.2s'
                  }}
                >
                  Catégories
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link px-3 py-2"
                  href="#about"
                  style={{
                    fontWeight: '500',
                    color: '#5f6368',
                    transition: 'color 0.2s'
                  }}
                >
                  À propos
                </a>
              </li>

              {user ? (
                <>
                  {user.role === 'admin' && (
                    <li className="nav-item ms-lg-2">
                      <button
                        className="btn px-4 py-2"
                        onClick={() => navigate(ROUTES.ADMIN)}
                        style={{
                          backgroundColor: '#667eea',
                          color: 'white',
                          borderRadius: '25px',
                          border: 'none',
                          fontWeight: '600',
                          fontSize: '0.95rem',
                          transition: 'all 0.2s'
                        }}
                      >
                        Admin
                      </button>
                    </li>
                  )}
                  <li className="nav-item dropdown ms-lg-3 mt-2 mt-lg-0">
                    <button
                      className="btn d-flex align-items-center gap-2 p-0 border-0 bg-transparent dropdown-toggle"
                      id="userDropdown"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                      style={{
                        cursor: 'pointer'
                      }}
                    >
                      <div
                        className="d-flex align-items-center justify-content-center"
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: '#667eea',
                          color: 'white',
                          fontWeight: '600',
                          fontSize: '1.1rem',
                          transition: 'all 0.2s'
                        }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                    </button>
                    <ul
                      className="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2"
                      aria-labelledby="userDropdown"
                      style={{
                        borderRadius: '12px',
                        minWidth: '200px'
                      }}
                    >
                      <li className="px-3 py-2" style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <div className="text-muted small">Connecté en tant que</div>
                        <div className="fw-bold" style={{ color: '#667eea' }}>{user.name}</div>
                      </li>
                      <li>
                        <button
                          className="dropdown-item d-flex align-items-center gap-2 py-2"
                          onClick={() => navigate('/my-books')}
                          style={{
                            transition: 'background-color 0.2s'
                          }}
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20M4 19.5C4 20.163 4.26339 20.7989 4.73223 21.2678C5.20107 21.7366 5.83696 22 6.5 22H20V2H6.5C5.83696 2 5.20107 2.26339 4.73223 2.73223C4.26339 3.20107 4 3.83696 4 4.5V19.5Z"
                              stroke="#5f6368"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Mes livres
                        </button>
                      </li>
                      <li>
                        <button
                          className="dropdown-item d-flex align-items-center gap-2 py-2"
                          onClick={() => navigate('/profile')}
                          style={{
                            transition: 'background-color 0.2s'
                          }}
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z"
                              stroke="#5f6368"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Mon profil
                        </button>
                      </li>
                      <li>
                        <hr className="dropdown-divider my-1" />
                      </li>
                      <li>
                        <button
                          className="dropdown-item d-flex align-items-center gap-2 py-2 text-danger"
                          onClick={handleLogout}
                          style={{
                            transition: 'background-color 0.2s'
                          }}
                        >
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12M21 12L16 7M21 12H9"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Déconnexion
                        </button>
                      </li>
                    </ul>
                  </li>
                </>
              ) : (
                <li className="nav-item ms-lg-3 mt-2 mt-lg-0">
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-outline-secondary px-4 py-2"
                      onClick={() => navigate(ROUTES.LOGIN)}
                      style={{
                        borderRadius: '25px',
                        borderColor: '#d1d5db',
                        color: '#5f6368',
                        fontWeight: '500',
                        fontSize: '0.95rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      Connexion
                    </button>
                    <button
                      className="btn px-4 py-2"
                      onClick={() => navigate(ROUTES.REGISTER)}
                      style={{
                        backgroundColor: '#667eea',
                        color: 'white',
                        borderRadius: '25px',
                        border: 'none',
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      S'inscrire
                    </button>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="container">
          <div className="row align-items-center py-5">
            <div className="col-lg-6 text-white">
              <h1 className="display-3 fw-bold mb-4">
                Nourrissez votre foi avec notre collection de livres chrétiens
              </h1>
              <p className="lead mb-4">
                Découvrez des milliers de livres chrétiens pour enrichir votre vie spirituelle,
                approfondir votre foi et grandir dans votre marche avec Dieu.
              </p>
              <div className="d-flex gap-3">
                <button
                  className="btn btn-lg px-5"
                  onClick={() => navigate('/catalog')}
                  style={{
                    backgroundColor: 'white',
                    color: '#667eea',
                    borderRadius: '30px',
                    border: 'none',
                    fontWeight: '600'
                  }}
                >
                  Explorer le catalogue
                </button>
              </div>
            </div>
            <div className="col-lg-6 text-center mt-5 mt-lg-0">
              <div style={{ fontSize: '15rem', opacity: 0.9 }}>📚</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-5 bg-white">
        <div className="container py-5">
          <div className="row g-4">
            <div className="col-md-4 text-center">
              <div className="mb-3" style={{ fontSize: '3rem' }}>✨</div>
              <h4 style={{ color: '#667eea' }}>Collection Variée</h4>
              <p className="text-muted">
                Des livres pour tous les âges et tous les niveaux de foi
              </p>
            </div>
            <div className="col-md-4 text-center">
              <div className="mb-3" style={{ fontSize: '3rem' }}>📱</div>
              <h4 style={{ color: '#667eea' }}>Lecture Facile</h4>
              <p className="text-muted">
                Lisez sur n'importe quel appareil, à tout moment
              </p>
            </div>
            <div className="col-md-4 text-center">
              <div className="mb-3" style={{ fontSize: '3rem' }}>🔒</div>
              <h4 style={{ color: '#667eea' }}>Contenu de Qualité</h4>
              <p className="text-muted">
                Des livres soigneusement sélectionnés et vérifiés
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="py-5" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3" style={{ color: '#667eea' }}>
              Nos Catégories
            </h2>
            <p className="lead text-muted">
              Explorez notre collection organisée par thèmes
            </p>
          </div>

          <div className="row g-4">
            {categories.map((category) => (
              <div key={category.id} className="col-6 col-md-4 col-lg-3">
                <div
                  className="card border-0 shadow-sm h-100 text-center"
                  style={{
                    borderRadius: '15px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onClick={() => navigate(`/catalog?category=${category.id}`)}
                >
                  <div className="card-body p-4">
                    <div style={{ fontSize: '3rem' }} className="mb-3">
                      {category.icon}
                    </div>
                    <h6
                      className="card-title mb-0"
                      style={{
                        color: category.color,
                        fontWeight: '600',
                        fontSize: '0.9rem'
                      }}
                    >
                      {category.name}
                    </h6>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-5 bg-white">
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <h2 className="display-5 fw-bold mb-4" style={{ color: '#667eea' }}>
                Notre Mission
              </h2>
              <p className="lead text-muted mb-4">
                Rendre la littérature chrétienne accessible à tous, partout dans le monde.
              </p>
              <p className="text-muted">
                Notre bibliothèque chrétienne a été créée avec la vision de permettre à chacun
                d'accéder facilement à des ressources spirituelles de qualité. Que vous soyez
                nouveau dans la foi ou chrétien de longue date, vous trouverez des livres qui
                nourriront votre âme et renforceront votre marche avec Dieu.
              </p>
            </div>
            <div className="col-lg-6 text-center mt-5 mt-lg-0">
              <div style={{ fontSize: '12rem' }}>✝️</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="container py-5 text-center text-white">
          <h2 className="display-5 fw-bold mb-4">
            Prêt à commencer votre voyage spirituel ?
          </h2>
          <p className="lead mb-4">
            Explorez notre catalogue et trouvez le livre qui transformera votre vie
          </p>
          <button
            className="btn btn-lg px-5"
            onClick={() => navigate('/catalog')}
            style={{
              backgroundColor: 'white',
              color: '#667eea',
              borderRadius: '30px',
              border: 'none',
              fontWeight: '600'
            }}
          >
            Voir le catalogue
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-4">
        <div className="container text-center">
          <p className="mb-2">
            <span style={{ fontSize: '1.5rem', marginRight: '8px' }}>📖</span>
            <strong>Bibliothèque Chrétienne</strong>
          </p>
          <p className="mb-0 text-muted small">
            © 2024 Bibliothèque Chrétienne. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
