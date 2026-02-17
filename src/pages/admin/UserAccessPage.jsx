import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getUserById } from '../../services/userService';
import { getUserAccess, grantAccess, revokeAccess } from '../../services/bookAccessService';
import { getAllBooks } from '../../services/bookService';
import AdminLayout from '../../components/layouts/AdminLayout';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog';
import { toast } from '../../components/ui/Toaster';
import { ROUTES } from '../../utils/constants';
import { ArrowLeft, BookOpen, Trash2, PlusCircle, Loader2, User, Clock, Infinity } from 'lucide-react';

const DURATION_OPTIONS = [
  { value: 'unlimited', label: 'Illimité' },
  { value: '7', label: '7 jours' },
  { value: '30', label: '30 jours' },
  { value: '90', label: '90 jours' },
  { value: '365', label: '1 an' },
];

function UserAccessPage() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState(null);
  const [accessList, setAccessList] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGrantDialog, setShowGrantDialog] = useState(false);
  const [granting, setGranting] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('unlimited');

  useEffect(() => {
    if (!userId) {
      navigate(ROUTES.ADMIN_USERS);
      return;
    }
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [user, access, books] = await Promise.all([
        getUserById(userId),
        getUserAccess(userId),
        getAllBooks(),
      ]);

      if (!user) {
        toast.error('Utilisateur introuvable');
        navigate(ROUTES.ADMIN_USERS);
        return;
      }

      setUserProfile(user);
      setAccessList(access);
      setAllBooks(books);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleGrantAccess = async (e) => {
    e.preventDefault();

    if (!selectedBookId) {
      toast.error('Veuillez sélectionner un livre');
      return;
    }

    setGranting(true);
    try {
      let expiresAt = null;
      if (selectedDuration !== 'unlimited') {
        const days = parseInt(selectedDuration, 10);
        const date = new Date();
        date.setDate(date.getDate() + days);
        expiresAt = date.toISOString();
      }

      await grantAccess(userId, selectedBookId, expiresAt);
      toast.success('Accès accordé avec succès');
      setShowGrantDialog(false);
      setSelectedBookId('');
      setSelectedDuration('unlimited');
      await loadData();
    } catch (error) {
      toast.error('Erreur lors de l\'attribution de l\'accès');
    } finally {
      setGranting(false);
    }
  };

  const handleRevokeAccess = async (bookId, bookName) => {
    if (!confirm(`Révoquer l'accès à « ${bookName} » ?`)) return;

    try {
      await revokeAccess(userId, bookId);
      toast.success('Accès révoqué');
      await loadData();
    } catch (error) {
      toast.error('Erreur lors de la révocation de l\'accès');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  // Books not yet granted to this user
  const accessBookIds = new Set(accessList.map(a => a.book_id));
  const availableBooks = allBooks.filter(b => !accessBookIds.has(b.id));

  return (
    <AdminLayout>
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <button
            className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-4"
            onClick={() => navigate(ROUTES.ADMIN_USERS)}
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux utilisateurs
          </button>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* User Info */}
              <Card className="mb-6">
                <CardContent className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10">
                    <User className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-700">
                      {userProfile?.name || 'Sans nom'}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {userProfile?.id} &middot; Inscrit le {formatDate(userProfile?.created_at)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Access Management */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Livres accessibles ({accessList.length})
                </h3>
                <Button
                  onClick={() => setShowGrantDialog(true)}
                  className="rounded-full"
                  disabled={availableBooks.length === 0}
                >
                  <PlusCircle className="h-4 w-4" />
                  Ajouter un livre
                </Button>
              </div>

              {accessList.length === 0 ? (
                <Card>
                  <div className="p-12 text-center">
                    <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-500 mb-1">
                      Aucun livre accessible
                    </h3>
                    <p className="text-gray-400 mb-4">
                      Attribuez des livres à cet utilisateur
                    </p>
                    <Button
                      className="rounded-full"
                      onClick={() => setShowGrantDialog(true)}
                      disabled={availableBooks.length === 0}
                    >
                      <PlusCircle className="h-4 w-4" />
                      Ajouter un livre
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left font-semibold text-gray-600 py-3 px-4">Livre</th>
                          <th className="text-left font-semibold text-gray-600 py-3 px-4">Accordé le</th>
                          <th className="text-left font-semibold text-gray-600 py-3 px-4">Expiration</th>
                          <th className="text-right font-semibold text-gray-600 py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {accessList.map((access) => {
                          const book = access.books;
                          const expired = isExpired(access.expires_at);
                          return (
                            <tr key={access.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 shrink-0">
                                    <BookOpen className="h-5 w-5 text-gray-500" />
                                  </div>
                                  <div className="font-semibold text-gray-700">
                                    {book?.name || 'Livre supprimé'}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-500">
                                {formatDate(access.granted_at)}
                              </td>
                              <td className="px-4 py-3">
                                {access.expires_at ? (
                                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg ${
                                    expired
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-amber-100 text-amber-700'
                                  }`}>
                                    <Clock className="h-3 w-3" />
                                    {expired ? 'Expiré' : formatDate(access.expires_at)}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700">
                                    <Infinity className="h-3 w-3" />
                                    Illimité
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleRevokeAccess(access.book_id, book?.name)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Révoquer
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Grant Access Dialog */}
        <Dialog open={showGrantDialog} onOpenChange={setShowGrantDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un livre</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleGrantAccess} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Livre</label>
                <Select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  required
                >
                  <option value="">Sélectionner un livre...</option>
                  {availableBooks.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.name} — {book.author}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Durée d&apos;accès</label>
                <Select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                >
                  {DURATION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
              </div>
              <DialogFooter>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setShowGrantDialog(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" loading={granting}>
                  <PlusCircle className="h-4 w-4" />
                  Accorder l&apos;accès
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

export default UserAccessPage;
