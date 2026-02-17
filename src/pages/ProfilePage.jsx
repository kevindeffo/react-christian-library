import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getReadingStats } from '../services/readingProgressService';
import { ArrowLeft, Edit3, BookOpen, CheckCircle2, BookMarked, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';

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

  const loadStats = async () => {
    const readingStats = await getReadingStats(user.id);
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
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            className="inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-dark transition-colors"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-5 h-5" />
            Retour à l&apos;accueil
          </button>
          <span className="text-primary font-semibold text-lg">
            Mon Profil
          </span>
        </div>
      </nav>

      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Profile Card */}
        <Card className="mb-6">
          <CardContent className="py-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center text-4xl font-bold mb-3">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h3 className="text-gray-800 font-bold text-xl">{user.name}</h3>
              <p className="text-gray-500 mb-2">{user.email}</p>
              <span
                className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold text-white ${
                  user.role === 'admin' ? 'bg-primary' : 'bg-success'
                }`}
              >
                {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
              </span>
            </div>

            {/* Edit Profile Button */}
            <div className="flex justify-center mb-6">
              <Button
                className="rounded-full"
                onClick={() => navigate('/profile/edit')}
              >
                <Edit3 className="w-4 h-4" />
                Modifier mon profil
              </Button>
            </div>

            <hr className="border-gray-100 my-6" />

            {/* Account Information */}
            <div className="mb-6">
              <h5 className="text-primary font-semibold mb-4">
                Informations du compte
              </h5>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-xl p-4">
                  <span className="text-gray-500 text-sm block mb-1">Nom complet</span>
                  <span className="text-gray-800 font-semibold">{user.name}</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <span className="text-gray-500 text-sm block mb-1">Adresse e-mail</span>
                  <span className="text-gray-800 font-semibold">{user.email}</span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <span className="text-gray-500 text-sm block mb-1">Rôle</span>
                  <span className="text-gray-800 font-semibold">
                    {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                  </span>
                </div>
              </div>
            </div>

            {/* Reading Statistics */}
            {stats && (
              <>
                <hr className="border-gray-100 my-6" />
                <div className="mb-6">
                  <h5 className="text-primary font-semibold mb-4">
                    Statistiques de lecture
                  </h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                        <BookOpen className="w-5 h-5 text-primary" />
                      </div>
                      <h4 className="text-xl font-bold text-primary mb-1">
                        {stats.totalBooks}
                      </h4>
                      <span className="text-gray-500 text-sm">Total de livres</span>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-2">
                        <CheckCircle2 className="w-5 h-5 text-success" />
                      </div>
                      <h4 className="text-xl font-bold text-success mb-1">
                        {stats.completedBooks}
                      </h4>
                      <span className="text-gray-500 text-sm">Livres terminés</span>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-2">
                        <BookMarked className="w-5 h-5 text-warning" />
                      </div>
                      <h4 className="text-xl font-bold text-warning mb-1">
                        {stats.inProgressBooks}
                      </h4>
                      <span className="text-gray-500 text-sm">En cours</span>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 text-center">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                      </div>
                      <h4 className="text-xl font-bold text-primary mb-1">
                        {stats.averageProgress}%
                      </h4>
                      <span className="text-gray-500 text-sm">Progression moy.</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 mt-3">
                    <span className="text-gray-500 text-sm block mb-1">Dernière lecture</span>
                    <span className="text-gray-800 font-semibold">{formatDate(stats.lastRead)}</span>
                  </div>
                </div>
              </>
            )}

            <hr className="border-gray-100 my-6" />

            {/* Quick Actions */}
            <Button
              variant="outline"
              fullWidth
              className="rounded-full"
              onClick={() => navigate('/my-books')}
            >
              <BookOpen className="w-4 h-4" />
              Voir mes livres
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ProfilePage;
