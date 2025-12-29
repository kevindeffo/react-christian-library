import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addBook } from '../../services/bookService';
import categories from '../../config/categories.json';
import AdminLayout from '../../components/layouts/AdminLayout';

function AddBookPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookDescription, setBookDescription] = useState('');
  const [bookPrice, setBookPrice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('bible');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      // Auto-remplir le titre avec le nom du fichier (sans l'extension)
      if (!bookTitle) {
        setBookTitle(file.name.replace('.pdf', ''));
      }
    } else {
      alert('Veuillez sélectionner un fichier PDF');
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();

    if (!selectedFile || !bookTitle || !bookAuthor) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setSaving(true);
    try {
      // Create book data object
      const bookData = {
        name: bookTitle,
        author: bookAuthor,
        description: bookDescription,
        category: selectedCategory,
        price: bookPrice ? parseFloat(bookPrice) : 0,
        pdfUrl: `/books/${selectedFile.name}`,
        coverUrl: '',
        size: selectedFile.size,
        totalPages: 0, // TODO: Extract actual page count from PDF
      };

      await addBook(bookData);
      alert('Livre publié avec succès!');
      // Reset form
      setSelectedFile(null);
      setBookTitle('');
      setBookAuthor('');
      setBookDescription('');
      setBookPrice('');
      setSelectedCategory('bible');
      // Rediriger vers la gestion des livres
      navigate('/admin/books');
    } catch (error) {
      console.error('Erreur lors de la publication:', error);
      alert('Erreur lors de la publication du livre');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-4">
        {/* Header */}
        <div className="mb-4">
          <h2 className="mb-2" style={{ color: '#5f6368', fontWeight: '600' }}>
            Ajouter un nouveau livre
          </h2>
          <p className="text-muted">
            Remplissez les informations ci-dessous pour publier un nouveau livre dans la bibliothèque
          </p>
        </div>

        {/* Form */}
        <div className="card border-0 shadow-sm" style={{ borderRadius: '15px' }}>
          <div className="card-body p-4">
            <form onSubmit={handlePublish}>
              {/* Upload PDF - PREMIER ELEMENT */}
              <div className="mb-4">
                <label htmlFor="pdfFile" className="form-label fw-semibold">
                  Fichier PDF <span className="text-danger">*</span>
                </label>
                <div
                  className="border-2 border-dashed p-5 text-center"
                  style={{
                    borderRadius: '15px',
                    borderColor: selectedFile ? '#10b981' : '#e0e0e0',
                    backgroundColor: selectedFile ? '#f0fdf4' : '#f8f9fa'
                  }}
                >
                  {!selectedFile ? (
                    <>
                      <div className="mb-3" style={{ fontSize: '3rem' }}>📄</div>
                      <label htmlFor="pdfFile" className="btn btn-lg" style={{
                        backgroundColor: '#8b5cf6',
                        color: 'white',
                        borderRadius: '25px',
                        border: 'none',
                        cursor: 'pointer'
                      }}>
                        Sélectionner le PDF
                      </label>
                      <input
                        type="file"
                        id="pdfFile"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        style={{ display: 'none' }}
                        required
                      />
                      <p className="text-muted small mt-3 mb-0">
                        Le titre sera automatiquement rempli avec le nom du fichier
                      </p>
                    </>
                  ) : (
                    <div>
                      <div className="mb-2" style={{ fontSize: '2rem' }}>✅</div>
                      <p className="mb-2 fw-semibold">{selectedFile.name}</p>
                      <p className="text-muted small mb-3">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          setSelectedFile(null);
                          setBookTitle('');
                        }}
                        style={{ borderRadius: '15px' }}
                      >
                        Changer de fichier
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Titre du livre */}
              <div className="mb-4">
                <label htmlFor="bookTitle" className="form-label fw-semibold">
                  Titre du livre <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  id="bookTitle"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder="Ex: La Bible Segond 21"
                  style={{ borderRadius: '10px' }}
                  required
                />
                <small className="text-muted">
                  Vous pouvez modifier le titre auto-rempli
                </small>
              </div>

              {/* Auteur */}
              <div className="mb-4">
                <label htmlFor="bookAuthor" className="form-label fw-semibold">
                  Auteur <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  id="bookAuthor"
                  value={bookAuthor}
                  onChange={(e) => setBookAuthor(e.target.value)}
                  placeholder="Ex: Charles Spurgeon"
                  style={{ borderRadius: '10px' }}
                  required
                />
              </div>

              {/* Catégorie */}
              <div className="mb-4">
                <label htmlFor="bookCategory" className="form-label fw-semibold">
                  Catégorie <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select form-select-lg"
                  id="bookCategory"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ borderRadius: '10px' }}
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label htmlFor="bookDescription" className="form-label fw-semibold">
                  Description
                </label>
                <textarea
                  className="form-control"
                  id="bookDescription"
                  rows="4"
                  value={bookDescription}
                  onChange={(e) => setBookDescription(e.target.value)}
                  placeholder="Une brève description du livre..."
                  style={{ borderRadius: '10px' }}
                />
              </div>

              {/* Prix */}
              <div className="mb-4">
                <label htmlFor="bookPrice" className="form-label fw-semibold">
                  Prix (optionnel)
                </label>
                <div className="input-group input-group-lg">
                  <input
                    type="number"
                    className="form-control"
                    id="bookPrice"
                    value={bookPrice}
                    onChange={(e) => setBookPrice(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    style={{ borderRadius: '10px 0 0 10px' }}
                  />
                  <span
                    className="input-group-text"
                    style={{
                      backgroundColor: '#f8f9fa',
                      borderRadius: '0 10px 10px 0'
                    }}
                  >
                    FCFA
                  </span>
                </div>
                <small className="text-muted">Laissez vide pour un livre gratuit</small>
              </div>

              {/* Buttons */}
              <div className="d-flex gap-3 justify-content-end">
                <button
                  type="button"
                  className="btn btn-lg px-4"
                  onClick={() => navigate('/admin/books')}
                  style={{
                    backgroundColor: '#e5e7eb',
                    color: '#4b5563',
                    borderRadius: '25px',
                    border: 'none'
                  }}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-lg px-5"
                  disabled={saving}
                  style={{
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    borderRadius: '25px',
                    border: 'none'
                  }}
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Publication...
                    </>
                  ) : (
                    <>
                      <span className="me-2">📚</span>
                      Publier le livre
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AddBookPage;
