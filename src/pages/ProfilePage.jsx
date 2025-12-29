import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getReadingStats } from '../services/readingProgressService';

function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadStats();
  }, [user, navigate]);

  const loadStats = () => {
    const readingStats = getReadingStats(user.id);
    setStats(readingStats);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Jamais';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) return null;

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
            Mon Profil
          </span>
        </div>
      </nav>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            {/* Profile Card */}
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '20px' }}>
              <div className="card-body p-4">
                {/* Avatar Section */}
                <div className="text-center mb-4">
                  <div
                    className="d-inline-flex align-items-center justify-content-center mx-auto mb-3"
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      backgroundColor: '#667eea',
                      color: 'white',
                      fontSize: '3rem',
                      fontWeight: '700'
                    }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 style={{ color: '#2d3748', fontWeight: '700' }}>{user.name}</h3>
                  <p className="text-muted mb-0">{user.email}</p>
                  <span
                    className="badge mt-2"
                    style={{
                      backgroundColor: user.role === 'admin' ? '#667eea' : '#10b981',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}
                  >
                    {user.role === 'admin' ? '👑 Administrateur' : '👤 Utilisateur'}
                  </span>
                </div>

                {/* Edit Profile Button */}
                <div className="text-center mb-4">
                  <button
                    className="btn px-4 py-2"
                    onClick={() => navigate('/profile/edit')}
                    style={{
                      backgroundColor: '#667eea',
                      color: 'white',
                      borderRadius: '25px',
                      border: 'none',
                      fontWeight: '600'
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="me-2">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.1022 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.1022 21.5 2.5C21.8978 2.8978 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.1022 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Modifier mon profil
                  </button>
                </div>

                <hr className="my-4" />

                {/* Profile Information */}
                <div className="mb-4">
                  <h5 style={{ color: '#667eea', fontWeight: '600', marginBottom: '20px' }}>
                    Informations du compte
                  </h5>
                  <div className="row g-3">
                    <div className="col-12">
                      <div className="p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
                        <small className="text-muted d-block mb-1">Nom complet</small>
                        <strong style={{ color: '#2d3748' }}>{user.name}</strong>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
                        <small className="text-muted d-block mb-1">Adresse e-mail</small>
                        <strong style={{ color: '#2d3748' }}>{user.email}</strong>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
                        <small className="text-muted d-block mb-1">Rôle</small>
                        <strong style={{ color: '#2d3748' }}>
                          {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reading Statistics */}
                {stats && (
                  <>
                    <hr className="my-4" />
                    <div>
                      <h5 style={{ color: '#667eea', fontWeight: '600', marginBottom: '20px' }}>
                        Statistiques de lecture
                      </h5>
                      <div className="row g-3">
                        <div className="col-6">
                          <div className="p-3 text-center" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '5px' }}>📚</div>
                            <h4 className="mb-1" style={{ color: '#667eea', fontWeight: '700' }}>
                              {stats.totalBooks}
                            </h4>
                            <small className="text-muted">Total de livres</small>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="p-3 text-center" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '5px' }}>✅</div>
                            <h4 className="mb-1" style={{ color: '#10b981', fontWeight: '700' }}>
                              {stats.completedBooks}
                            </h4>
                            <small className="text-muted">Livres terminés</small>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="p-3 text-center" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '5px' }}>📖</div>
                            <h4 className="mb-1" style={{ color: '#f59e0b', fontWeight: '700' }}>
                              {stats.inProgressBooks}
                            </h4>
                            <small className="text-muted">En cours</small>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="p-3 text-center" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '5px' }}>📊</div>
                            <h4 className="mb-1" style={{ color: '#8b5cf6', fontWeight: '700' }}>
                              {stats.averageProgress}%
                            </h4>
                            <small className="text-muted">Progression moy.</small>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '12px' }}>
                            <small className="text-muted d-block mb-1">Dernière lecture</small>
                            <strong style={{ color: '#2d3748' }}>{formatDate(stats.lastRead)}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Quick Actions */}
                <hr className="my-4" />
                <div className="d-grid gap-2">
                  <button
                    className="btn btn-outline-secondary py-2"
                    onClick={() => navigate('/my-books')}
                    style={{
                      borderRadius: '20px',
                      borderColor: '#d1d5db',
                      color: '#5f6368',
                      fontWeight: '600'
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="me-2">
                      <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20M4 19.5C4 20.163 4.26339 20.7989 4.73223 21.2678C5.20107 21.7366 5.83696 22 6.5 22H20V2H6.5C5.83696 2 5.20107 2.26339 4.73223 2.73223C4.26339 3.20107 4 3.83696 4 4.5V19.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Voir mes livres
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
