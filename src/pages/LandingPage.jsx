import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCategories } from '../hooks/useCategories';
import { BookOpen, Sparkles, Smartphone, ShieldCheck, Menu, X, BookMarked, User, LogOut, Library, GraduationCap, Heart, LayoutDashboard } from 'lucide-react';
import { ROUTES } from '../utils/constants';
import Button from '../components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../components/ui/DropdownMenu';

function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { categories } = useCategories();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip link */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-primary">
        Aller au contenu principal
      </a>

      {/* Navigation */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Navigation principale">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 no-underline">
              <BookOpen className="h-7 w-7 text-primary" />
              <span className="font-bold text-primary text-xl">BiblioHub</span>
            </a>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-6">
              <a href="#catalogue" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors no-underline">Catalogue</a>
              <a href="#categories" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors no-underline">Catégories</a>
              <a href="#about" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors no-underline">À propos</a>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                      <User className="h-5 w-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      <div className="text-gray-500 text-xs font-normal">Connecté en tant que</div>
                      <div className="text-primary font-semibold">{user.name}</div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user.role === 'admin' && (
                      <DropdownMenuItem onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)}>
                        <LayoutDashboard className="h-4 w-4 text-gray-500" /> Dashboard
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => navigate('/my-books')}>
                      <BookMarked className="h-4 w-4 text-gray-500" /> Mes livres
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="h-4 w-4 text-gray-500" /> Mon profil
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-danger">
                      <LogOut className="h-4 w-4" /> Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.LOGIN)}>Connexion</Button>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 py-4 space-y-2">
              <a href="#catalogue" className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 no-underline">Catalogue</a>
              <a href="#categories" className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 no-underline">Catégories</a>
              <a href="#about" className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 no-underline">À propos</a>
              <div className="pt-2 border-t border-gray-100 flex gap-2">
                {user ? (
                  <div className="flex flex-col gap-2 w-full">
                    {user.role === 'admin' && (
                      <Button variant="ghost" size="sm" fullWidth onClick={() => { navigate(ROUTES.ADMIN_DASHBOARD); setMobileMenuOpen(false); }}>
                        <LayoutDashboard className="h-4 w-4" /> Dashboard
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" fullWidth onClick={() => { navigate('/my-books'); setMobileMenuOpen(false); }}>
                      <BookMarked className="h-4 w-4" /> Mes livres
                    </Button>
                    <Button variant="ghost" size="sm" fullWidth onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}>
                      <User className="h-4 w-4" /> Mon profil
                    </Button>
                    <Button variant="danger" size="sm" fullWidth onClick={handleLogout}>
                      <LogOut className="h-4 w-4" /> Déconnexion
                    </Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="sm" fullWidth onClick={() => navigate(ROUTES.LOGIN)}>Connexion</Button>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      <main id="main-content">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 py-24 lg:py-32">
          {/* Floating shapes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-[10%] w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-10 right-[15%] w-96 h-96 bg-purple-400/15 rounded-full blur-3xl animate-float-delayed" />
            <div className="absolute top-1/2 left-[60%] w-48 h-48 bg-indigo-300/10 rounded-full blur-2xl animate-float-slow" />
            {/* Floating icons */}
            <BookOpen className="absolute top-16 right-[20%] h-12 w-12 text-white/10 animate-float" strokeWidth={1} />
            <Library className="absolute bottom-20 left-[12%] h-16 w-16 text-white/8 animate-float-delayed" strokeWidth={0.8} />
            <GraduationCap className="absolute top-1/3 right-[8%] h-10 w-10 text-white/8 animate-float-slow" strokeWidth={1} />
            <Heart className="absolute bottom-1/3 left-[30%] h-8 w-8 text-white/6 animate-float" strokeWidth={1} />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Text content */}
              <div className="text-white">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-white/90 mb-6">
                  <Sparkles className="h-4 w-4" />
                  Votre bibliothèque numérique
                </div>
                <h1 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight tracking-tight">
                  Explorez un monde de <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-300">connaissances</span>
                </h1>
                <p className="text-lg lg:text-xl text-white/70 mb-10 max-w-lg leading-relaxed">
                  Découvrez des milliers de livres pour enrichir votre culture, stimuler votre imagination et élargir vos horizons.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button
                    variant="none"
                    size="lg"
                    className="bg-white text-primary hover:bg-gray-100 font-semibold shadow-lg shadow-black/10"
                    onClick={() => navigate('/catalog')}
                  >
                    Explorer le catalogue
                  </Button>
                </div>
              </div>

              {/* Glassmorphism card */}
              <div className="hidden lg:flex justify-center">
                <div className="relative">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl shadow-black/10">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                        <BookOpen className="h-8 w-8 text-amber-300 mb-3" />
                        <p className="text-white font-semibold text-lg">1000+</p>
                        <p className="text-white/60 text-sm">Livres disponibles</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                        <GraduationCap className="h-8 w-8 text-emerald-300 mb-3" />
                        <p className="text-white font-semibold text-lg">{categories.length}</p>
                        <p className="text-white/60 text-sm">Catégories</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                        <Smartphone className="h-8 w-8 text-blue-300 mb-3" />
                        <p className="text-white font-semibold text-lg">24/7</p>
                        <p className="text-white/60 text-sm">Accès illimité</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                        <ShieldCheck className="h-8 w-8 text-pink-300 mb-3" />
                        <p className="text-white font-semibold text-lg">100%</p>
                        <p className="text-white/60 text-sm">Contenu vérifié</p>
                      </div>
                    </div>
                  </div>
                  {/* Glow effect behind the card */}
                  <div className="absolute -inset-4 bg-gradient-to-r from-violet-400/20 to-indigo-400/20 rounded-3xl blur-2xl -z-10" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Sparkles, title: 'Collection Variée', desc: 'Des livres pour tous les âges et tous les goûts', color: 'text-amber-500 bg-amber-50' },
                { icon: Smartphone, title: 'Lecture Facile', desc: "Lisez sur n'importe quel appareil, à tout moment", color: 'text-blue-500 bg-blue-50' },
                { icon: ShieldCheck, title: 'Contenu de Qualité', desc: 'Des livres soigneusement sélectionnés et vérifiés', color: 'text-emerald-500 bg-emerald-50' },
              ].map((f) => (
                <div key={f.title} className="text-center p-6">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${f.color} mb-4`}>
                    <f.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section id="categories" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Nos Catégories</h2>
              <p className="text-lg text-gray-500">Explorez notre collection organisée par thèmes</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-card p-6 text-center hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                  onClick={() => navigate(`/catalog?category=${category.id}`)}
                >
                  <div className="text-3xl mb-3">{category.icon}</div>
                  <h4 className="text-sm font-semibold" style={{ color: category.color }}>
                    {category.name}
                  </h4>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* About */}
        <section id="about" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Notre Mission</h2>
                <p className="text-lg text-gray-500 mb-4">
                  Rendre la lecture accessible à tous, partout dans le monde.
                </p>
                <p className="text-gray-500">
                  BiblioHub a été créée avec la vision de permettre à chacun d&apos;accéder facilement à des livres de qualité. Que vous soyez passionné de romans, de sciences ou de développement personnel, vous trouverez des ouvrages qui enrichiront votre esprit et nourriront votre curiosité.
                </p>
              </div>
              <div className="hidden lg:flex justify-center">
                <BookOpen className="h-48 w-48 text-primary/20" strokeWidth={0.5} />
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-br from-violet-600 to-purple-800">
          <div className="max-w-3xl mx-auto px-4 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Prêt à commencer votre aventure littéraire ?</h2>
            <p className="text-lg text-white/80 mb-8">Explorez notre catalogue et trouvez le livre qui transformera votre vie</p>
            <Button
              variant="none"
              size="lg"
              className="bg-white text-primary hover:bg-gray-100 font-semibold shadow-lg shadow-black/10"
              onClick={() => navigate('/catalog')}
            >
              Voir le catalogue
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <BookOpen className="h-5 w-5" />
            <strong>BiblioHub</strong>
          </div>
          <p className="text-gray-400 text-sm">© 2024 BiblioHub. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
