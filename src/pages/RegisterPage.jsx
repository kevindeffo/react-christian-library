import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { colors, gradients } from '../config/theme';
import { ROUTES } from '../utils/constants';

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      // Redirect to home after successful registration
      navigate(ROUTES.HOME);
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center py-5"
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
              <p className="text-white-50">Créez votre compte pour accéder à nos livres</p>
            </div>

            {/* Register Card */}
            <Card padding="xl">
              <h3 className="mb-4 text-center" style={{ color: colors.text }}>
                Inscription
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
                {/* Name */}
                <div className="mb-3">
                  <label htmlFor="name" className="form-label fw-semibold">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Jean Dupont"
                    style={{ borderRadius: '10px' }}
                    autoComplete="name"
                    required
                  />
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label fw-semibold">
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control form-control-lg"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="votre@email.com"
                    style={{ borderRadius: '10px' }}
                    autoComplete="email"
                    required
                  />
                </div>

                {/* Password */}
                <div className="mb-3">
                  <label htmlFor="password" className="form-label fw-semibold">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    style={{ borderRadius: '10px' }}
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                  <small className="text-muted">
                    Au moins 6 caractères
                  </small>
                </div>

                {/* Confirm Password */}
                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label fw-semibold">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    style={{ borderRadius: '10px' }}
                    autoComplete="new-password"
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
                  S'inscrire
                </Button>
              </form>

              {/* Login Link */}
              <div className="text-center mt-4">
                <p className="text-muted mb-0">
                  Vous avez déjà un compte ?{' '}
                  <Link
                    to={ROUTES.LOGIN}
                    style={{ color: colors.primary, fontWeight: '600' }}
                  >
                    Se connecter
                  </Link>
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

export default RegisterPage;
