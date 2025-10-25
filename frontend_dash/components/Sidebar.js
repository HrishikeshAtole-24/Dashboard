import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: '📊',
      badge: null
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: '📈',
      badge: null
    },
    {
      name: 'Goals',
      href: '/goals',
      icon: '🎯',
      badge: null
    },
    {
      name: 'Websites',
      href: '/websites',
      icon: '🌐',
      badge: null
    },
    {
      name: 'Real-time',
      href: '/realtime',
      icon: '⚡',
      badge: 'Live'
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: '👤',
      badge: null
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: '⚙️',
      badge: null
    }
  ];

  const isActive = (href) => {
    return router.pathname === href;
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getUserInitials = (email) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button 
        className="mobile-menu-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰
      </button>

      {/* Sidebar */}
      <div className={`dashboard-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <h2>Dashboard</h2>
          <span>Analytics Pro</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <div key={item.name} className="nav-item">
              <Link 
                href={item.href}
                className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
                onClick={() => setIsOpen(false)}
              >
                <span className="icon">{item.icon}</span>
                {item.name}
                {item.badge && (
                  <span className="badge">{item.badge}</span>
                )}
              </Link>
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className="user-profile">
          <div className="user-avatar">
            {getUserInitials(user?.email)}
          </div>
          <div className="user-info">
            <h4>{user?.name || 'User'}</h4>
            <p>{user?.email || 'user@example.com'}</p>
          </div>
          <button 
            onClick={handleLogout}
            style={{ 
              marginLeft: 'auto', 
              background: 'none', 
              border: 'none', 
              color: '#6b7280', 
              cursor: 'pointer',
              fontSize: '1.125rem'
            }}
            title="Logout"
          >
            🚪
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-999 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;