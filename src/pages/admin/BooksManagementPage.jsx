import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBooks, deleteBook } from '../../services/bookService';
import categories from '../../config/categories.json';
import AdminLayout from '../../components/layouts/AdminLayout';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/Dialog';
import { toast } from '../../components/ui/Toaster';
import { PlusCircle, Search, BookOpen, Trash2, Loader2 } from 'lucide-react';

function BooksManagementPage() {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, bookId: null, bookName: '' });
  const navigate = useNavigate();

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    let result = books;

    // Filtre par catégorie
    if (selectedCategory !== 'all') {
      result = result.filter(book => book.category === selectedCategory);
    }

    // Filtre par recherche
    if (searchQuery.trim()) {
      result = result.filter(book =>
        book.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredBooks(result);
  }, [selectedCategory, searchQuery, books]);

  const loadBooks = async () => {
    try {
      const allBooks = await getAllBooks();
      setBooks(allBooks);
      setFilteredBooks(allBooks);
    } catch (error) {
      console.error('Erreur lors du chargement des livres:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryInfo = (categoryId) => {
    return categories.find(cat => cat.id === categoryId) || categories.find(cat => cat.id === 'other');
  };

  const handleDeleteBook = (bookId, bookName) => {
    setDeleteDialog({ open: true, bookId, bookName });
  };

  const confirmDelete = async () => {
    try {
      await deleteBook(deleteDialog.bookId);
      await loadBooks();
      toast.success('Livre supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression du livre');
    } finally {
      setDeleteDialog({ open: false, bookId: null, bookName: '' });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifié';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-1">
              Gestion des livres
            </h2>
            <p className="text-gray-500">
              {filteredBooks.length} livre{filteredBooks.length > 1 ? 's' : ''} au total
            </p>
          </div>
          <Button
            onClick={() => navigate('/admin/add-book')}
            size="lg"
            className="rounded-full"
          >
            <PlusCircle className="h-5 w-5" />
            Ajouter un livre
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Rechercher</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher un livre..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Catégorie</label>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="all">Toutes les catégories ({books.length})</option>
                  {categories.map(cat => {
                    const count = books.filter(b => b.category === cat.id).length;
                    return (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({count})
                      </option>
                    );
                  })}
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Books List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredBooks.length === 0 ? (
          <Card>
            <div className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-1">
                {searchQuery || selectedCategory !== 'all'
                  ? 'Aucun livre trouvé avec ces critères'
                  : 'Aucun livre dans la bibliothèque'}
              </h3>
              {!searchQuery && selectedCategory === 'all' && (
                <Button
                  className="mt-4 rounded-full"
                  size="lg"
                  onClick={() => navigate('/admin/add-book')}
                >
                  Ajouter votre premier livre
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left font-semibold text-gray-600 py-3 px-4 first:rounded-tl-xl">Livre</th>
                    <th className="text-left font-semibold text-gray-600 py-3 px-4">Catégorie</th>
                    <th className="text-left font-semibold text-gray-600 py-3 px-4">Taille</th>
                    <th className="text-left font-semibold text-gray-600 py-3 px-4">Date d&apos;ajout</th>
                    <th className="text-right font-semibold text-gray-600 py-3 px-4 last:rounded-tr-xl">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.map((book) => (
                    <tr key={book.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 shrink-0">
                            <BookOpen className="h-5 w-5 text-gray-500" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-700 truncate">
                              {book.name}
                            </div>
                            {book.lastRead && (
                              <div className="text-xs text-gray-400">
                                Dernière lecture: {formatDate(book.lastRead)}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-lg text-white"
                          style={{ backgroundColor: getCategoryInfo(book.category).color }}
                        >
                          {getCategoryInfo(book.category).name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {formatSize(book.size)}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {formatDate(book.addedDate)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteBook(book.id, book.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Supprimer
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialog.open} onOpenChange={(open) => {
          if (!open) setDeleteDialog({ open: false, bookId: null, bookName: '' });
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer &laquo; {deleteDialog.bookName} &raquo; ?
                Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setDeleteDialog({ open: false, bookId: null, bookName: '' })}
              >
                Annuler
              </Button>
              <Button
                variant="danger"
                onClick={confirmDelete}
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

export default BooksManagementPage;
