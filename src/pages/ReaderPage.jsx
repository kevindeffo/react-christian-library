import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useAuth } from '../context/AuthContext';
import { saveReadingProgress, getReadingProgress } from '../services/readingProgressService';
import { ArrowLeft, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Button from '../components/ui/Button';

// Configuration de PDF.js worker pour la version bundled avec react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

function ReaderPage() {
  const [bookFile, setBookFile] = useState(null);
  const [bookName, setBookName] = useState('');
  const [bookId, setBookId] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    // Récupérer le fichier depuis l'état de navigation
    if (location.state?.file && location.state?.fileName) {
      setBookFile(location.state.file);
      setBookName(location.state.fileName);

      // Store bookId if provided
      if (location.state?.bookId) {
        setBookId(location.state.bookId);
      }
    } else {
      // Si pas de fichier, rediriger vers la page d'accueil
      navigate('/');
    }

    // Désactiver le clic droit pour empêcher le téléchargement
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Désactiver les raccourcis clavier de sauvegarde
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p')) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate, location]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setError(null);

    // Load last read page if user and bookId are available
    if (user && bookId) {
      const progress = getReadingProgress(user.id, bookId);
      if (progress && progress.currentPage) {
        setPageNumber(progress.currentPage);
      }
    }
  };

  const onDocumentLoadError = (error) => {
    console.error('Erreur de chargement du PDF:', error);
    setError('Impossible de charger le fichier PDF. Veuillez réessayer avec un autre fichier.');
  };

  // Save reading progress whenever page changes
  useEffect(() => {
    if (user && bookId && numPages && pageNumber) {
      saveReadingProgress(user.id, bookId, pageNumber, numPages);
    }
  }, [pageNumber, user, bookId, numPages]);

  const goToPreviousPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 2.0));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.6));
  };

  const handleClose = () => {
    navigate('/');
  };

  if (!bookFile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              className="text-gray-500 hover:text-gray-700 transition-colors p-1"
              onClick={handleClose}
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <span className="text-gray-600 font-semibold text-base truncate max-w-xs sm:max-w-md">
              {bookName}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Zoom Controls */}
            <div className="inline-flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
              <button
                className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
                onClick={zoomOut}
                disabled={scale <= 0.6}
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-3 py-1.5 text-sm text-gray-600 border-x border-gray-200 min-w-[52px] text-center select-none">
                {Math.round(scale * 100)}%
              </span>
              <button
                className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
                onClick={zoomIn}
                disabled={scale >= 2.0}
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Page Info */}
            <span className="text-gray-500 text-sm hidden sm:inline">
              Page {pageNumber} / {numPages || '...'}
            </span>
          </div>
        </div>
      </nav>

      {/* Reader Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="rounded-xl border border-gray-100 bg-white shadow-card mb-6 overflow-hidden">
          <div
            className="flex justify-center p-4 overflow-auto"
            style={{
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none'
            }}
          >
            {error ? (
              <div className="flex flex-col items-center py-16">
                <p className="text-danger mb-4 text-center">{error}</p>
                <Button
                  variant="ghost"
                  className="rounded-full"
                  onClick={handleClose}
                >
                  Retour à l&apos;accueil
                </Button>
              </div>
            ) : (
              <Document
                file={bookFile}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={
                  <div className="flex flex-col items-center py-16">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-3" />
                    <p className="text-gray-500">Chargement du livre...</p>
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                />
              </Document>
            )}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-center items-center gap-3 pb-6">
          <Button
            className="rounded-xl"
            onClick={goToPreviousPage}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="w-5 h-5" />
            Précédent
          </Button>

          <span className="text-gray-500 text-sm sm:hidden">
            {pageNumber} / {numPages || '...'}
          </span>

          <Button
            className="rounded-xl"
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
          >
            Suivant
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ReaderPage;
