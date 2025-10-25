import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', emoji: '📊' },
  { name: 'Analytics', href: '/analytics', emoji: '📈' },
  { name: 'Goals', href: '/goals', emoji: '🎯' },
  { name: 'Websites', href: '/websites', emoji: '🌐' },
  { name: 'Real-time', href: '/realtime', emoji: '⚡', badge: 'LIVE' },
  { name: 'Profile', href: '/profile', emoji: '👤' },
  { name: 'Settings', href: '/settings', emoji: '⚙️' },
];

export default function DashboardLayout({ children, title = 'Dashboard', hideHeader = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Error logging out');
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
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        ☰
      </button>

      <div className="dashboard-container">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
          {/* Brand */}
          <div className="sidebar-brand">
            <h2>Analytics Pro</h2>
            <span>Professional Dashboard</span>
          </div>

          {/* Navigation */}
          <nav className="sidebar-nav">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href;
              return (
                <div key={item.name} className="nav-item">
                  <Link 
                    href={item.href}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="icon">{item.emoji}</span>
                    {item.name}
                    {item.badge && (
                      <span className="badge">{item.badge}</span>
                    )}
                  </Link>
                </div>
              );
            })}
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
              className="btn btn-secondary"
              style={{ 
                marginLeft: 'auto', 
                padding: '0.375rem 0.5rem',
                fontSize: '0.75rem'
              }}
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="dashboard-main">
          {!hideHeader && (
            <div className="dashboard-header">
              <h1>{title}</h1>
              <p>Welcome back! Here's what's happening with your analytics.</p>
            </div>
          )}
          {children}
        </main>
      </div>
    </>
  );
}