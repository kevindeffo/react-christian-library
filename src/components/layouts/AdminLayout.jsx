import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function AdminLayout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      path: '/admin/dashboard',
      icon: '📊',
      label: 'Tableau de bord',
      name: 'dashboard'
    },
    {
      path: '/admin/books',
      icon: '📚',
      label: 'Gestion des livres',
      name: 'books'
    },
    {
      path: '/admin/add-book',
      icon: '➕',
      label: 'Ajouter un livre',
      name: 'add-book'
    },
    {
      path: '/admin/categories',
      icon: '🏷️',
      label: 'Catégories',
      name: 'categories'
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="d-flex min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Sidebar */}
      <div
        className="bg-white shadow-sm d-flex flex-column"
        style={{
          width: isSidebarCollapsed ? '80px' : '280px',
          transition: 'width 0.3s ease',
          position: 'fixed',
          height: '100vh',
          overflowY: 'auto',
          zIndex: 1000
        }}
      >
        {/* Header */}
        <div className="p-4 border-bottom">
          <div className="d-flex align-items-center justify-content-between">
            {!isSidebarCollapsed && (
              <div className="d-flex align-items-center">
                <span style={{ fontSize: '1.5rem', marginRight: '8px' }}>📖</span>
                <span style={{ fontWeight: '600', color: '#8b5cf6', fontSize: '1.1rem' }}>
                  Admin
                </span>
              </div>
            )}
            <button
              className="btn btn-sm btn-link text-decoration-none p-0"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              style={{ color: '#5f6368' }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-grow-1 py-3">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-100 btn text-start d-flex align-items-center border-0 ${
                isActive(item.path) ? '' : ''
              }`}
              style={{
                padding: isSidebarCollapsed ? '16px 28px' : '16px 24px',
                backgroundColor: isActive(item.path) ? '#f3f4f6' : 'transparent',
                color: isActive(item.path) ? '#8b5cf6' : '#5f6368',
                borderLeft: isActive(item.path) ? '4px solid #8b5cf6' : '4px solid transparent',
                fontWeight: isActive(item.path) ? '600' : '400',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontSize: '1.3rem' }}>{item.icon}</span>
              {!isSidebarCollapsed && (
                <span className="ms-3">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="border-top p-3">
          <button
            onClick={() => navigate('/')}
            className="w-100 btn text-start d-flex align-items-center border-0"
            style={{
              padding: isSidebarCollapsed ? '12px 24px' : '12px 16px',
              color: '#5f6368',
              transition: 'all 0.2s ease'
            }}
          >
            <span style={{ fontSize: '1.3rem' }}>🏠</span>
            {!isSidebarCollapsed && (
              <span className="ms-3">Retour au site</span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          marginLeft: isSidebarCollapsed ? '80px' : '280px',
          width: `calc(100% - ${isSidebarCollapsed ? '80px' : '280px'})`,
          transition: 'margin-left 0.3s ease, width 0.3s ease'
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default AdminLayout;
