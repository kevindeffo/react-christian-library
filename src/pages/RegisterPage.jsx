import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen } from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import { toast } from '../components/ui/Toaster';
import { ROUTES } from '../utils/constants';

function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      await register({ name: formData.name, email: formData.email, password: formData.password });
      navigate(ROUTES.HOME);
    } catch (err) {
      toast.error(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-700 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to={ROUTES.HOME} className="inline-flex flex-col items-center no-underline">
            <BookOpen className="h-12 w-12 text-white mb-3" />
            <h2 className="text-2xl font-bold text-white">BiblioHub</h2>
          </Link>
          <p className="text-white/70 mt-2">Créez votre compte pour accéder à nos livres</p>
        </div>

        <Card>
          <CardContent className="pt-8 pb-8">
            <h3 className="text-xl font-semibold text-gray-700 text-center mb-6">Inscription</h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Jean Dupont" autoComplete="name" className="h-12" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="votre@email.com" autoComplete="email" className="h-12" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" autoComplete="new-password" className="h-12" minLength={6} required />
                <p className="text-xs text-gray-400">Au moins 6 caractères</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" autoComplete="new-password" className="h-12" required />
              </div>

              <Button type="submit" size="lg" fullWidth loading={loading}>
                S&apos;inscrire
              </Button>
            </form>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">
                Vous avez déjà un compte ?{' '}
                <Link to={ROUTES.LOGIN} className="text-primary font-semibold hover:underline">Se connecter</Link>
              </p>
            </div>
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

export default RegisterPage;
