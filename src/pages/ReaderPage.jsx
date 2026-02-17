import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Document, Page, Thumbnail, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import { useAuth } from '../context/AuthContext';
import { checkAccess } from '../services/bookAccessService';
import { saveReadingProgress, getReadingProgress } from '../services/readingProgressService';
import { BookOpen, ArrowLeft, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Loader2, PanelLeftClose, PanelLeftOpen, Maximize, Minimize } from 'lucide-react';
import Button from '../components/ui/Button';

// Configuration de PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

function ReaderPage() {
  const [pdfSource, setPdfSource] = useState(null);
  const [bookName, setBookName] = useState('');
  const [bookId, setBookId] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [error, setError] = useState(null);
  const [pdfDocument, setPdfDocument] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pageInputValue, setPageInputValue] = useState('');
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const thumbnailRefs = useRef({});
  const contentRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const verifyAccess = async () => {
      if (user && location.state?.bookId && user.role !== 'admin') {
        const { hasAccess } = await checkAccess(user.id, location.state.bookId);
        if (!hasAccess) {
          navigate(`/book?id=${location.state.bookId}`);
          return;
        }
      }
    };

    if (location.state?.pdfUrl && location.state?.fileName) {
      verifyAccess();
      setPdfSource(location.state.pdfUrl);
      setBookName(location.state.fileName);
      if (location.state?.bookId) setBookId(location.state.bookId);
    } else if (location.state?.file && location.state?.fileName) {
      verifyAccess();
      setPdfSource(location.state.file);
      setBookName(location.state.fileName);
      if (location.state?.bookId) setBookId(location.state.bookId);
    } else {
      navigate('/');
    }
  }, [navigate, location, user]);

  const goToPreviousPage = useCallback(() => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setPageNumber((prev) => Math.min(prev + 1, numPages || prev));
  }, [numPages]);

  // Protections + navigation clavier
  useEffect(() => {
    const handleContextMenu = (e) => { e.preventDefault(); };
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'p')) {
        e.preventDefault();
        return;
      }
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); goToPreviousPage(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goToNextPage(); }
    };
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToPreviousPage, goToNextPage]);

  // Écouter changement fullscreen
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const onDocumentLoadSuccess = async (pdf) => {
    setNumPages(pdf.numPages);
    setPdfDocument(pdf);
    setError(null);
    if (user && bookId) {
      const progress = await getReadingProgress(user.id, bookId);
      if (progress && progress.currentPage) setPageNumber(progress.currentPage);
    }
  };

  const onDocumentLoadError = (err) => {
    console.error('Erreur de chargement du PDF:', err);
    setError('Impossible de charger le fichier PDF. Veuillez réessayer avec un autre fichier.');
  };

  // Sauvegarde progression
  useEffect(() => {
    if (user && bookId && numPages && pageNumber) {
      saveReadingProgress(user.id, bookId, pageNumber, numPages);
    }
  }, [pageNumber, user, bookId, numPages]);

  // Auto-scroll miniature active
  useEffect(() => {
    if (sidebarOpen && thumbnailRefs.current[pageNumber]) {
      thumbnailRefs.current[pageNumber].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [pageNumber, sidebarOpen]);

  // Mesurer la largeur du conteneur pour adapter le PDF
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Miniatures virtualisées
  const thumbnailPages = useMemo(() => {
    if (!numPages) return [];
    if (numPages <= 30) return Array.from({ length: numPages }, (_, i) => i + 1);
    const start = Math.max(1, pageNumber - 10);
    const end = Math.min(numPages, pageNumber + 15);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [numPages, pageNumber]);

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.6));
  const handleClose = () => navigate('/');

  const handleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  };

  const handlePageInputSubmit = () => {
    const p = parseInt(pageInputValue, 10);
    if (p >= 1 && p <= numPages) setPageNumber(p);
    setIsEditingPage(false);
  };

  if (!pdfSource) return null;

  const showSidebar = sidebarOpen && pdfDocument;

  // Sur mobile (< 640px), adapter la page PDF à la largeur du conteneur
  // Sur desktop, utiliser le scale classique
  const padding = containerWidth < 640 ? 16 : 48; // p-2 vs p-6
  const availableWidth = containerWidth - padding;
  const isMobile = containerWidth > 0 && containerWidth < 640;
  const pageProps = isMobile
    ? { width: Math.max(availableWidth * scale, 200) }
    : { scale };

  return (
    <div className="fixed inset-0 flex flex-col select-none bg-gray-50">

      {/* ── NAVBAR ── */}
      <nav className="h-16 shrink-0 flex items-center justify-between px-4 sm:px-6 bg-white border-b border-gray-100 shadow-sm z-10">
        {/* Gauche : retour + logo + toggle + titre */}
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={handleClose} title="Retour"
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} />
          </button>

          <div className="hidden sm:flex items-center gap-1.5 text-primary">
            <BookOpen size={20} />
            <span className="font-bold text-sm">BiblioHub</span>
          </div>

          <div className="hidden sm:block w-px h-6 bg-gray-200" />

          <button onClick={() => setSidebarOpen(v => !v)}
            title={sidebarOpen ? 'Masquer les miniatures' : 'Afficher les miniatures'}
            className="hidden lg:flex p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>

          <span className="text-gray-700 font-semibold text-sm truncate max-w-[200px] sm:max-w-[300px]">
            {bookName}
          </span>
        </div>

        {/* Droite : zoom + page + fullscreen */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Zoom */}
          <div className="inline-flex items-center border border-gray-200 rounded-xl overflow-hidden">
            <button onClick={zoomOut} disabled={scale <= 0.6} title="Dézoomer"
              className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40">
              <ZoomOut size={15} />
            </button>
            <span className="px-2.5 py-1.5 text-xs font-medium text-gray-600 border-x border-gray-200 min-w-[48px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button onClick={zoomIn} disabled={scale >= 2.0} title="Zoomer"
              className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40">
              <ZoomIn size={15} />
            </button>
          </div>

          {/* Page info — desktop */}
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-500">
            <span>Page</span>
            {isEditingPage ? (
              <input
                type="number" value={pageInputValue} autoFocus
                onChange={(e) => setPageInputValue(e.target.value)}
                onBlur={handlePageInputSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handlePageInputSubmit();
                  if (e.key === 'Escape') setIsEditingPage(false);
                }}
                className="w-12 text-center border border-primary rounded-lg px-1 py-0.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
                min={1} max={numPages}
              />
            ) : (
              <button
                onClick={() => { setPageInputValue(String(pageNumber)); setIsEditingPage(true); }}
                title="Cliquer pour saisir un numéro de page"
                className="bg-primary/10 text-primary rounded-lg px-2.5 py-0.5 font-semibold text-sm min-w-[32px] hover:bg-primary/20 transition-colors">
                {pageNumber}
              </button>
            )}
            <span className="text-gray-400">/ {numPages || '...'}</span>
          </div>

          {/* Fullscreen */}
          <button onClick={handleFullscreen} title={isFullscreen ? 'Quitter le plein écran' : 'Plein écran'}
            className="hidden sm:flex p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </nav>

      {/* ── BODY : sidebar + main côte à côte ── */}
      <div className="flex flex-row flex-1 min-h-0">

        {/* Sidebar miniatures */}
        {showSidebar && (
          <div className="hidden lg:flex flex-col items-center w-[150px] min-w-[150px] shrink-0 overflow-y-auto overflow-x-hidden border-r border-gray-100 bg-white py-3 gap-1">
            {numPages > 30 && thumbnailPages[0] > 1 && (
              <span className="text-xs text-muted mb-1">··· 1–{thumbnailPages[0] - 1}</span>
            )}

            {thumbnailPages.map((p) => (
              <div
                key={p}
                ref={(el) => { thumbnailRefs.current[p] = el; }}
                onClick={() => setPageNumber(p)}
                className="flex flex-col items-center cursor-pointer group px-2"
              >
                <div className={`rounded-lg overflow-hidden transition-all duration-150 ${
                  p === pageNumber
                    ? 'ring-2 ring-primary shadow-md'
                    : 'ring-1 ring-gray-200 group-hover:ring-primary-light group-hover:shadow-sm'
                }`}>
                  <Thumbnail pdf={pdfDocument} pageNumber={p} width={112} devicePixelRatio={1} />
                </div>
                <span className={`mt-1 text-xs font-medium transition-colors ${
                  p === pageNumber ? 'text-primary' : 'text-muted group-hover:text-gray-600'
                }`}>
                  {p}
                </span>
              </div>
            ))}

            {numPages > 30 && thumbnailPages[thumbnailPages.length - 1] < numPages && (
              <span className="text-xs text-muted mt-1">
                ··· {thumbnailPages[thumbnailPages.length - 1] + 1}–{numPages}
              </span>
            )}
          </div>
        )}

        {/* Main content */}
        <div ref={contentRef} className="relative flex flex-col flex-1 min-w-0">
          <div className="flex-1 overflow-y-auto overflow-x-auto">
            <div className="flex justify-center p-2 sm:p-6">
              {error ? (
                <div className="text-center pt-20">
                  <p className="text-danger mb-4">{error}</p>
                  <Button variant="outline" onClick={handleClose}>
                    Retour à l&apos;accueil
                  </Button>
                </div>
              ) : (
                <Document
                  file={pdfSource}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading={
                    <div className="text-center pt-20">
                      <Loader2 size={40} className="text-primary animate-spin mx-auto" />
                      <p className="text-muted mt-4">Chargement du livre...</p>
                    </div>
                  }
                >
                  <Page pageNumber={pageNumber} {...pageProps} />
                </Document>
              )}
            </div>
          </div>

          {/* Boutons navigation — bas droite */}
          {numPages && (
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 z-10">
              <button
                onClick={goToPreviousPage} disabled={pageNumber <= 1}
                title="Page précédente (←)"
                className="w-9 h-9 rounded-xl border border-gray-200 bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-card hover:shadow-card-hover hover:border-primary-light text-gray-600 hover:text-primary transition-all duration-200 disabled:opacity-40 disabled:cursor-default disabled:hover:border-gray-200 disabled:hover:text-gray-600 disabled:hover:shadow-card"
              >
                <ChevronLeft size={18} />
              </button>

              {/* Numéro de page — mobile */}
              <span className="sm:hidden text-xs font-medium text-primary bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-xl border border-gray-200 shadow-card">
                {pageNumber}/{numPages}
              </span>

              <button
                onClick={goToNextPage} disabled={pageNumber >= numPages}
                title="Page suivante (→)"
                className="w-9 h-9 rounded-xl border border-gray-200 bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-card hover:shadow-card-hover hover:border-primary-light text-gray-600 hover:text-primary transition-all duration-200 disabled:opacity-40 disabled:cursor-default disabled:hover:border-gray-200 disabled:hover:text-gray-600 disabled:hover:shadow-card"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReaderPage;
