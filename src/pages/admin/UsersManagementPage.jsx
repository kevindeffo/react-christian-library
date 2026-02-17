import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, createUser } from '../../services/userService';
import { getUserAccess } from '../../services/bookAccessService';
import AdminLayout from '../../components/layouts/AdminLayout';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Label from '../../components/ui/Label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog';
import { toast } from '../../components/ui/Toaster';
import { ROUTES } from '../../utils/constants';
import { Users, UserPlus, BookOpen, Shield, Loader2, Eye } from 'lucide-react';

function UsersManagementPage() {
  const [users, setUsers] = useState([]);
  const [userAccessCounts, setUserAccessCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', name: '', password: '' });
  const navigate = useNavigate();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsers();
      setUsers(allUsers);

      // Charger le nombre de livres accessibles par utilisateur
      const counts = {};
      await Promise.all(
        allUsers.map(async (user) => {
          try {
            const access = await getUserAccess(user.id);
            counts[user.id] = access.length;
          } catch {
            counts[user.id] = 0;
          }
        })
      );
      setUserAccessCounts(counts);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!newUser.email || !newUser.name || !newUser.password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (newUser.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setCreating(true);
    try {
      await createUser(newUser.email, newUser.name, newUser.password);
      toast.success('Utilisateur créé avec succès');
      setShowAddDialog(false);
      setNewUser({ email: '', name: '', password: '' });
      await loadUsers();
    } catch (error) {
      toast.error(error.message || 'Erreur lors de la création de l\'utilisateur');
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifié';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-1">
              Gestion des utilisateurs
            </h2>
            <p className="text-gray-500">
              {users.length} utilisateur{users.length > 1 ? 's' : ''} au total
            </p>
          </div>
          <Button
            onClick={() => setShowAddDialog(true)}
            size="lg"
            className="rounded-full"
          >
            <UserPlus className="h-5 w-5" />
            Ajouter un utilisateur
          </Button>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : users.length === 0 ? (
          <Card>
            <div className="p-12 text-center">
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-1">
                Aucun utilisateur
              </h3>
              <Button
                className="mt-4 rounded-full"
                size="lg"
                onClick={() => setShowAddDialog(true)}
              >
                Ajouter votre premier utilisateur
              </Button>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left font-semibold text-gray-600 py-3 px-4">Utilisateur</th>
                    <th className="text-left font-semibold text-gray-600 py-3 px-4">Rôle</th>
                    <th className="text-left font-semibold text-gray-600 py-3 px-4">Livres accessibles</th>
                    <th className="text-left font-semibold text-gray-600 py-3 px-4">Date d&apos;inscription</th>
                    <th className="text-right font-semibold text-gray-600 py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-semibold text-gray-700">{user.name || 'Sans nom'}</div>
                          <div className="text-xs text-gray-400">{user.id.slice(0, 8)}...</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg ${
                          user.role === 'admin'
                            ? 'bg-violet-100 text-violet-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {user.role === 'admin' && <Shield className="h-3 w-3" />}
                          {user.role === 'admin' ? 'Admin' : 'Utilisateur'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-sm text-gray-600">
                          <BookOpen className="h-4 w-4 text-gray-400" />
                          {userAccessCounts[user.id] ?? '...'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`${ROUTES.ADMIN_USER_ACCESS}?userId=${user.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                          Gérer l&apos;accès
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Add User Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un utilisateur</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-name">Nom</Label>
                <Input
                  id="user-name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="Nom complet"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-email">Email</Label>
                <Input
                  id="user-email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="email@exemple.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-password">Mot de passe</Label>
                <Input
                  id="user-password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="Minimum 6 caractères"
                  required
                />
              </div>
              <DialogFooter>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setShowAddDialog(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" loading={creating}>
                  <UserPlus className="h-4 w-4" />
                  Créer l&apos;utilisateur
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

export default UsersManagementPage;
