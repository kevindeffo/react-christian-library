import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen } from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import { toast } from '../components/ui/Toaster';
import { ROUTES } from '../utils/constants';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || ROUTES.HOME;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-700 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to={ROUTES.HOME} className="inline-flex flex-col items-center no-underline">
            <BookOpen className="h-12 w-12 text-white mb-3" />
            <h2 className="text-2xl font-bold text-white">BiblioHub</h2>
          </Link>
          <p className="text-white/70 mt-2">Connectez-vous pour lire nos livres</p>
        </div>

        {/* Login Card */}
        <Card>
          <CardContent className="pt-8 pb-8">
            <h3 className="text-xl font-semibold text-gray-700 text-center mb-6">Connexion</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  autoComplete="email"
                  className="h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="h-12"
                  required
                />
              </div>

              <Button type="submit" size="lg" fullWidth loading={loading}>
                Se connecter
              </Button>
            </form>

          </CardContent>
        </Card>

        <div className="text-center mt-4">
          <Link to={ROUTES.HOME} className="text-white/80 hover:text-white text-sm no-underline">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
