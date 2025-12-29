import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { colors, gradients } from '../config/theme';
import { ROUTES } from '../utils/constants';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from location state, default to home
  const from = location.state?.from?.pathname || ROUTES.HOME;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      // Redirect to the page they tried to visit or home
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: gradients.primary }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-5">
            {/* Logo/Header */}
            <div className="text-center mb-4">
              <Link to={ROUTES.HOME} className="text-decoration-none">
                <div className="d-flex align-items-center justify-content-center mb-3">
                  <span style={{ fontSize: '3rem' }}>📖</span>
                </div>
                <h2 className="text-white mb-2">Bibliothèque Chrétienne</h2>
              </Link>
              <p className="text-white-50">Connectez-vous pour lire nos livres</p>
            </div>

            {/* Login Card */}
            <Card padding="xl">
              <h3 className="mb-4 text-center" style={{ color: colors.text }}>
                Connexion
              </h3>

              {error && (
                <div
                  className="alert alert-danger"
                  style={{ borderRadius: '10px' }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Email */}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label fw-semibold">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-lg"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    style={{ borderRadius: '10px' }}
                    autoComplete="email"
                    required
                  />
                </div>

                {/* Password */}
                <div className="mb-4">
                  <label htmlFor="password" className="form-label fw-semibold">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={{ borderRadius: '10px' }}
                    autoComplete="current-password"
                    required
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loading}
                  disabled={loading}
                >
                  Se connecter
                </Button>
              </form>

              {/* Register Link */}
              <div className="text-center mt-4">
                <p className="text-muted mb-0">
                  Pas encore de compte ?{' '}
                  <Link
                    to={ROUTES.REGISTER}
                    style={{ color: colors.primary, fontWeight: '600' }}
                  >
                    S'inscrire
                  </Link>
                </p>
              </div>

              {/* Demo Credentials */}
              <div className="mt-4 p-3" style={{ backgroundColor: colors.backgroundDark, borderRadius: '10px' }}>
                <p className="small mb-2 fw-semibold" style={{ color: colors.text }}>
                  Comptes de démonstration :
                </p>
                <p className="small mb-1 text-muted">
                  <strong>Admin:</strong> admin@booklib.com / admin123
                </p>
                <p className="small mb-0 text-muted">
                  <strong>User:</strong> user@booklib.com / user123
                </p>
              </div>
            </Card>

            {/* Back to Home */}
            <div className="text-center mt-3">
              <Link
                to={ROUTES.HOME}
                className="text-white text-decoration-none"
              >
                ← Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
