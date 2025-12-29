import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useAuth } from '../context/AuthContext';
import { saveReadingProgress, getReadingProgress } from '../services/readingProgressService';

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
    <div className="min-vh-100" style={{ backgroundColor: '#f5f7fa' }}>
      {/* Navbar */}
      <nav className="navbar navbar-light bg-white shadow-sm sticky-top">
        <div className="container-fluid px-4">
          <div className="d-flex align-items-center">
            <button
              className="btn btn-link text-decoration-none me-3"
              onClick={handleClose}
              style={{ color: '#5f6368' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <span className="navbar-brand mb-0 h5" style={{ color: '#5f6368' }}>{bookName}</span>
          </div>

          <div className="d-flex align-items-center gap-3">
            {/* Zoom Controls */}
            <div className="btn-group" role="group">
              <button
                className="btn btn-sm"
                onClick={zoomOut}
                disabled={scale <= 0.6}
                style={{
                  backgroundColor: 'white',
                  color: '#5f6368',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px 0 0 8px'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button
                className="btn btn-sm"
                style={{
                  backgroundColor: 'white',
                  color: '#5f6368',
                  border: '1px solid #e0e0e0',
                  borderLeft: 'none',
                  borderRight: 'none',
                  pointerEvents: 'none',
                  minWidth: '60px'
                }}
              >
                {Math.round(scale * 100)}%
              </button>
              <button
                className="btn btn-sm"
                onClick={zoomIn}
                disabled={scale >= 2.0}
                style={{
                  backgroundColor: 'white',
                  color: '#5f6368',
                  border: '1px solid #e0e0e0',
                  borderRadius: '0 8px 8px 0'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Page Info */}
            <span className="text-muted small">
              Page {pageNumber} / {numPages || '...'}
            </span>
          </div>
        </div>
      </nav>

      {/* Reader Content */}
      <div className="container-fluid py-4">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8">
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '20px', backgroundColor: 'white' }}>
              <div className="card-body p-0">
                <div className="d-flex justify-content-center p-4" style={{
                  overflow: 'auto',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none'
                }}>
                  {error ? (
                    <div className="text-center py-5">
                      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-3">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#d32f2f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="#d32f2f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="#d32f2f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <p className="text-danger mb-3">{error}</p>
                      <button
                        className="btn px-4"
                        onClick={handleClose}
                        style={{
                          backgroundColor: '#9fa8da',
                          color: 'white',
                          borderRadius: '50px',
                          border: 'none'
                        }}
                      >
                        Retour à l'accueil
                      </button>
                    </div>
                  ) : (
                    <Document
                      file={bookFile}
                      onLoadSuccess={onDocumentLoadSuccess}
                      onLoadError={onDocumentLoadError}
                      loading={
                        <div className="text-center py-5">
                          <div className="spinner-border" style={{ color: '#9fa8da' }} role="status">
                            <span className="visually-hidden">Chargement...</span>
                          </div>
                          <p className="mt-3 text-muted">Chargement du livre...</p>
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
            </div>

            {/* Navigation Controls */}
            <div className="d-flex justify-content-center gap-3 pb-4">
              <button
                className="btn btn-lg px-4"
                onClick={goToPreviousPage}
                disabled={pageNumber <= 1}
                style={{
                  backgroundColor: '#9fa8da',
                  color: 'white',
                  borderRadius: '50px',
                  border: 'none',
                  opacity: pageNumber <= 1 ? 0.5 : 1
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="me-2">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Précédent
              </button>

              <button
                className="btn btn-lg px-4"
                onClick={goToNextPage}
                disabled={pageNumber >= numPages}
                style={{
                  backgroundColor: '#9fa8da',
                  color: 'white',
                  borderRadius: '50px',
                  border: 'none',
                  opacity: pageNumber >= numPages ? 0.5 : 1
                }}
              >
                Suivant
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="ms-2">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReaderPage;
