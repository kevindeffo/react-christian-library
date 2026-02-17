import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, PlusCircle, Tags, Users, Home, Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';

const menuItems = [
  { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
  { path: '/admin/books', icon: BookOpen, label: 'Gestion des livres' },
  { path: '/admin/add-book', icon: PlusCircle, label: 'Ajouter un livre' },
  { path: '/admin/categories', icon: Tags, label: 'Catégories' },
  { path: '/admin/users', icon: Users, label: 'Utilisateurs' },
];

function AdminLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleNav = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const SidebarContent = ({ collapsed }) => (
    <>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-bold text-primary text-lg">Admin</span>
            </div>
          )}
          {/* Desktop toggle */}
          <button
            className="hidden lg:flex p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label="Basculer la barre latérale"
          >
            <Menu className="h-5 w-5" />
          </button>
          {/* Mobile close */}
          <button
            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(false)}
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3" aria-label="Menu administration">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => handleNav(item.path)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-l-4',
                isActive(item.path)
                  ? 'bg-primary/10 text-primary font-semibold border-primary'
                  : 'text-gray-600 hover:bg-gray-50 border-transparent'
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-gray-200 p-3">
        <button
          onClick={() => handleNav('/')}
          className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <Home className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Retour au site</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile hamburger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-white rounded-lg shadow-md text-gray-600 hover:bg-gray-50"
        onClick={() => setMobileOpen(true)}
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed left-0 top-0 h-full w-72 bg-white z-50 flex flex-col transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent collapsed={false} />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-white border-r border-gray-200 transition-all duration-300 z-20',
          sidebarCollapsed ? 'w-20' : 'w-70'
        )}
      >
        <SidebarContent collapsed={sidebarCollapsed} />
      </aside>

      {/* Main content */}
      <main
        className={cn(
          'flex-1 transition-all duration-300',
          'lg:ml-70',
          sidebarCollapsed && 'lg:ml-20',
          'pt-14 lg:pt-0'
        )}
      >
        {children}
      </main>
    </div>
  );
}

export default AdminLayout;
