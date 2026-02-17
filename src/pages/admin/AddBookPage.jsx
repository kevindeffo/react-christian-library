import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addBook } from '../../services/bookService';
import { useCategories } from '../../hooks/useCategories';
import AdminLayout from '../../components/layouts/AdminLayout';
import { Card, CardContent } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Label from '../../components/ui/Label';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { toast } from '../../components/ui/Toaster';
import { Upload, FileCheck, X, BookOpen } from 'lucide-react';
import { cn } from '../../lib/utils';

function AddBookPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookDescription, setBookDescription] = useState('');
  const [bookPrice, setBookPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('fiction');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { categories } = useCategories();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      // Auto-remplir le titre avec le nom du fichier (sans l'extension)
      if (!bookTitle) {
        setBookTitle(file.name.replace('.pdf', ''));
      }
    } else {
      toast.error('Veuillez sélectionner un fichier PDF');
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();

    if (!selectedFile || !bookTitle || !bookAuthor) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setSaving(true);
    try {
      const bookData = {
        name: bookTitle,
        author: bookAuthor,
        description: bookDescription,
        category: selectedCategory,
        price: bookPrice ? parseFloat(bookPrice) : 0,
        coverUrl: '',
        totalPages: 0,
      };

      // Pass the PDF file as second argument for Supabase Storage upload
      await addBook(bookData, selectedFile);
      toast.success('Livre publié avec succès !');
      // Reset form
      setSelectedFile(null);
      setBookTitle('');
      setBookAuthor('');
      setBookDescription('');
      setBookPrice('');
      setSelectedCategory('fiction');
      // Rediriger vers la gestion des livres
      navigate('/admin/books');
    } catch (error) {
      console.error('Erreur lors de la publication:', error);
      toast.error('Erreur lors de la publication du livre');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-1">
            Ajouter un nouveau livre
          </h2>
          <p className="text-gray-500">
            Remplissez les informations ci-dessous pour publier un nouveau livre dans la bibliothèque
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardContent>
            <form onSubmit={handlePublish} className="space-y-6">
              {/* Upload PDF */}
              <div>
                <Label htmlFor="pdfFile" required>Fichier PDF</Label>
                <div
                  className={cn(
                    'mt-2 border-2 border-dashed rounded-xl p-8 text-center transition-colors',
                    selectedFile
                      ? 'border-success bg-success/5'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  )}
                >
                  {!selectedFile ? (
                    <>
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <label
                        htmlFor="pdfFile"
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary text-white text-sm font-medium cursor-pointer hover:bg-primary/90 transition-colors"
                      >
                        Sélectionner le PDF
                      </label>
                      <input
                        type="file"
                        id="pdfFile"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                        required
                      />
                      <p className="text-gray-400 text-sm mt-3">
                        Le titre sera automatiquement rempli avec le nom du fichier
                      </p>
                    </>
                  ) : (
                    <div>
                      <FileCheck className="h-10 w-10 text-success mx-auto mb-3" />
                      <p className="font-semibold text-gray-700 mb-1">{selectedFile.name}</p>
                      <p className="text-gray-400 text-sm mb-4">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-danger text-danger text-sm hover:bg-danger/5 transition-colors"
                        onClick={() => {
                          setSelectedFile(null);
                          setBookTitle('');
                        }}
                      >
                        <X className="h-3.5 w-3.5" />
                        Changer de fichier
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Titre du livre */}
              <div>
                <Label htmlFor="bookTitle" required>Titre du livre</Label>
                <Input
                  id="bookTitle"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder="Ex: Le Petit Prince"
                  className="mt-2"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">
                  Vous pouvez modifier le titre auto-rempli
                </p>
              </div>

              {/* Auteur */}
              <div>
                <Label htmlFor="bookAuthor" required>Auteur</Label>
                <Input
                  id="bookAuthor"
                  value={bookAuthor}
                  onChange={(e) => setBookAuthor(e.target.value)}
                  placeholder="Ex: Antoine de Saint-Exupéry"
                  className="mt-2"
                  required
                />
              </div>

              {/* Catégorie */}
              <div>
                <Label htmlFor="bookCategory" required>Catégorie</Label>
                <Select
                  id="bookCategory"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="mt-2"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="bookDescription">Description</Label>
                <textarea
                  id="bookDescription"
                  rows="4"
                  value={bookDescription}
                  onChange={(e) => setBookDescription(e.target.value)}
                  placeholder="Une brève description du livre..."
                  className={cn(
                    'mt-2 flex w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm transition-colors',
                    'placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                    'disabled:cursor-not-allowed disabled:opacity-50 resize-none'
                  )}
                />
              </div>

              {/* Prix */}
              <div>
                <Label htmlFor="bookPrice">Prix (optionnel)</Label>
                <div className="mt-2 flex">
                  <Input
                    type="number"
                    id="bookPrice"
                    value={bookPrice}
                    onChange={(e) => setBookPrice(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="rounded-r-none"
                  />
                  <span className="inline-flex items-center px-4 rounded-r-xl border border-l-0 border-gray-200 bg-gray-50 text-sm text-gray-500 font-medium">
                    FCFA
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Laissez vide pour un livre gratuit</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  className="rounded-full"
                  onClick={() => navigate('/admin/books')}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className="rounded-full"
                  loading={saving}
                >
                  <BookOpen className="h-5 w-5" />
                  Publier le livre
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

export default AddBookPage;
