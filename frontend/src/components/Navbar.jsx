import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  LogOut,
  Compass,
  Calendar,
  Shield,
  Briefcase,
  Menu,
  X,
  Home,
  MapPin,
  Package,
  Sparkles,
  Heart,
  ChevronRight,
  Layers,
  LogIn,
  UserPlus,
  ArrowRight
} from 'lucide-react';
import { getSavedWishlistIds } from '../utils/wishlistHelper';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isOperator, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(() => getSavedWishlistIds().length);

  // Auto-close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Keep wishlist count badge in sync
  useEffect(() => {
    const updateCount = () => {
      setWishlistCount(getSavedWishlistIds().length);
    };
    window.addEventListener('wishlist-changed', updateCount);
    return () => window.removeEventListener('wishlist-changed', updateCount);
  }, []);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const isGotripsView = location.pathname.startsWith('/operator') || location.pathname.startsWith('/admin');

  const scrollToSection = (sectionId) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 200);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // ==========================================
  // 1. OPERATOR / ADMIN VIEW
  // ==========================================
  if (isGotripsView) {
    return (
      <>
        <header className="gotrips-topbar-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Link
              to="/"
              className="gotrips-logo"
              style={{ textDecoration: 'none', color: '#111827', fontWeight: 800, fontSize: '18px', display: 'flex', alignItems: 'center' }}
            >
              <span>{isAdmin ? 'Admin Portal' : 'Operator Portal'}</span>
            </Link>

            {/* Mobile hamburger toggle */}
            <button
              type="button"
              className="navbar-mobile-toggle"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Toggle navigation menu"
            >
              <Menu size={24} color="#111827" />
            </button>
          </div>

          {/* Desktop Nav Pills */}
          <nav className="gotrips-nav-pills desktop-only-flex">
            {isAdmin ? (
              <>
                <NavLink to="/admin" end className={({ isActive }) => `gotrips-pill-link ${isActive ? 'active' : ''}`}>
                  Dashboard
                </NavLink>
                <NavLink to="/admin/packages" className={({ isActive }) => `gotrips-pill-link ${isActive ? 'active' : ''}`}>
                  Package Approvals
                </NavLink>
                <NavLink to="/admin/bookings" className={({ isActive }) => `gotrips-pill-link ${isActive ? 'active' : ''}`}>
                  Bookings
                </NavLink>
                <NavLink to="/admin/operators" className={({ isActive }) => `gotrips-pill-link ${isActive ? 'active' : ''}`}>
                  Operators
                </NavLink>
                <NavLink to="/admin/users" className={({ isActive }) => `gotrips-pill-link ${isActive ? 'active' : ''}`}>
                  Tourists
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/operator" end className={({ isActive }) => `gotrips-pill-link ${isActive ? 'active' : ''}`}>
                  Dashboard
                </NavLink>
                <NavLink to="/operator/bookings" className={({ isActive }) => `gotrips-pill-link ${isActive ? 'active' : ''}`}>
                  Bookings
                </NavLink>
                <NavLink to="/operator/packages" className={({ isActive }) => `gotrips-pill-link ${isActive ? 'active' : ''}`}>
                  Packages
                </NavLink>
                <NavLink to="/operator/explore" className={({ isActive }) => `gotrips-pill-link ${isActive ? 'active' : ''}`}>
                  Explore
                </NavLink>
              </>
            )}
          </nav>

          {/* Desktop User actions */}
          <div className="gotrips-user-actions desktop-only-flex">
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{user?.fullName || 'Operator'}</div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280' }}>{user?.role}</div>
            </div>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
              {isAdmin ? <Shield size={18} /> : <Briefcase size={18} />}
            </div>
            <button onClick={() => { logout(); navigate('/'); }} className="gotrips-icon-btn" title="Sign Out">
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Mobile Drawer (Rendered outside header to prevent clipping) */}
        {mobileMenuOpen && (
          <div className="mobile-fullscreen-modal">
            <div className="mobile-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  {isAdmin ? 'Admin Portal' : 'Operator Portal'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-modal-close-btn"
                aria-label="Close menu"
              >
                <X size={22} color="#0f172a" />
              </button>
            </div>

            <div className="mobile-modal-body">
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '14px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                  {user?.fullName?.charAt(0) || 'O'}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{user?.fullName}</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#0284c7' }}>{user?.role}</div>
                </div>
              </div>

              <div className="mobile-menu-label">OPERATOR SECTIONS</div>
              <div className="mobile-nav-column">
                {isAdmin ? (
                  <>
                    <NavLink to="/admin" end onClick={() => setMobileMenuOpen(false)} className="mobile-link-card">
                      <Layers size={18} color="#0284c7" /> <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/admin/packages" onClick={() => setMobileMenuOpen(false)} className="mobile-link-card">
                      <Package size={18} color="#0284c7" /> <span>Package Approvals</span>
                    </NavLink>
                    <NavLink to="/admin/bookings" onClick={() => setMobileMenuOpen(false)} className="mobile-link-card">
                      <Calendar size={18} color="#0284c7" /> <span>All Bookings</span>
                    </NavLink>
                    <NavLink to="/admin/operators" onClick={() => setMobileMenuOpen(false)} className="mobile-link-card">
                      <Briefcase size={18} color="#0284c7" /> <span>Operators</span>
                    </NavLink>
                    <NavLink to="/admin/users" onClick={() => setMobileMenuOpen(false)} className="mobile-link-card">
                      <User size={18} color="#0284c7" /> <span>Tourists</span>
                    </NavLink>
                  </>
                ) : (
                  <>
                    <NavLink to="/operator" end onClick={() => setMobileMenuOpen(false)} className="mobile-link-card">
                      <Layers size={18} color="#f59e0b" /> <span>Dashboard</span>
                    </NavLink>
                    <NavLink to="/operator/bookings" onClick={() => setMobileMenuOpen(false)} className="mobile-link-card">
                      <Calendar size={18} color="#f59e0b" /> <span>Customer Bookings</span>
                    </NavLink>
                    <NavLink to="/operator/packages" onClick={() => setMobileMenuOpen(false)} className="mobile-link-card">
                      <Package size={18} color="#f59e0b" /> <span>My Packages</span>
                    </NavLink>
                    <NavLink to="/operator/explore" onClick={() => setMobileMenuOpen(false)} className="mobile-link-card">
                      <Compass size={18} color="#f59e0b" /> <span>Explore Destinations</span>
                    </NavLink>
                  </>
                )}

                <div style={{ height: '1px', background: '#e2e8f0', margin: '10px 0' }} />

                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="mobile-link-card">
                  <Home size={18} color="#64748b" /> <span>Return to Tourist Site</span>
                </Link>

                <button
                  onClick={() => { setMobileMenuOpen(false); logout(); navigate('/'); }}
                  className="mobile-link-card"
                  style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fee2e2', cursor: 'pointer' }}
                >
                  <LogOut size={18} color="#dc2626" /> <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ==========================================
  // 2. MAIN TOURIST PORTAL VIEW
  // ==========================================
  return (
    <>
      <header className="travivu-navbar">
        <div className="travivu-nav-container">
          {/* Brand Logo */}
          <Link to="/" className="travivu-brand" style={{ textDecoration: 'none', color: '#0284c7', fontWeight: 800, fontSize: '22px' }}>
            <span>Travel Planner</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="travivu-nav-links desktop-only-flex">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink>
            <NavLink to="/destinations" className={({ isActive }) => isActive ? 'active' : ''}>Destinations</NavLink>
            <NavLink to="/packages" className={({ isActive }) => isActive ? 'active' : ''}>Tours</NavLink>
            <NavLink to="/planner" className={({ isActive }) => isActive ? 'active' : ''}>Smart Planner</NavLink>
            {isAuthenticated && (
              <NavLink to="/trips" className={({ isActive }) => isActive ? 'active' : ''}>
                My Trips
                {wishlistCount > 0 && (
                  <span className="nav-badge-pill">{wishlistCount}</span>
                )}
              </NavLink>
            )}
            {isOperator && (
              <NavLink to="/operator" style={{ color: '#f59e0b', fontWeight: 700 }}>Operator Portal</NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin" style={{ color: '#0284c7', fontWeight: 700 }}>Admin Panel</NavLink>
            )}
          </nav>

          {/* Desktop Nav Actions */}
          <div className="travivu-nav-actions desktop-only-flex">
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>
                  Hi, {user?.fullName?.split(' ')[0]}
                </span>
                <button onClick={logout} className="btn-link" title="Logout">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-link">
                  <User size={16} /> Sign In
                </Link>
                <Link to="/register" className="btn-link">
                  Register
                </Link>
              </>
            )}
            <Link to="/planner" className="btn-primary-orange">
              Explore Tours
            </Link>
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            className="navbar-mobile-toggle"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={28} color="#0f172a" />
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* FULLSCREEN MOBILE NAVIGATION DRAWER                        */}
      {/* (Rendered outside <header> to prevent CSS clipping)       */}
      {/* ========================================================= */}
      {mobileMenuOpen && (
        <div className="mobile-fullscreen-modal">
          {/* Top Bar with Brand & Close Button */}
          <div className="mobile-modal-header">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              style={{ textDecoration: 'none', color: '#0284c7', fontWeight: 800, fontSize: '20px' }}
            >
              Travel Planner
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="mobile-modal-close-btn"
              aria-label="Close menu"
            >
              <X size={24} color="#0f172a" />
            </button>
          </div>

          <div className="mobile-modal-body">
            {/* 1. AUTHENTICATION / USER SECTION (AT THE VERY TOP) */}
            <div className="mobile-auth-banner">
              {isAuthenticated ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px' }}>
                      {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{user?.fullName}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{user?.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => { setMobileMenuOpen(false); logout(); navigate('/'); }}
                    style={{ background: '#fee2e2', border: 'none', color: '#dc2626', padding: '8px 12px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Account Access
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        padding: '12px',
                        background: '#ffffff',
                        border: '1.5px solid #cbd5e1',
                        borderRadius: '12px',
                        color: '#0f172a',
                        fontWeight: 700,
                        fontSize: '14px',
                        textAlign: 'center',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <LogIn size={16} color="#0284c7" /> Sign In
                    </Link>

                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{
                        padding: '12px',
                        background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '14px',
                        textAlign: 'center',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(234, 88, 12, 0.25)'
                      }}
                    >
                      <UserPlus size={16} /> Register
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 2. MAIN NAVIGATION SECTIONS */}
            <div className="mobile-menu-label">EXPLORE & PLAN</div>
            <div className="mobile-nav-column">
              <NavLink to="/" end onClick={() => setMobileMenuOpen(false)} className="mobile-link-card">
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Home size={18} color="#0284c7" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Home</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Start your journey & search</div>
                </div>
                <ChevronRight size={18} color="#94a3b8" />
              </NavLink>

              <NavLink to="/planner" onClick={() => setMobileMenuOpen(false)} className="mobile-link-card" style={{ border: '1.5px solid #fed7aa', background: '#fffaf5' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ffedd5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={18} color="#ea580c" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#c2410c' }}>Smart Travel Planner</span>
                    <span style={{ fontSize: '10px', fontWeight: 800, background: '#ea580c', color: '#fff', padding: '1px 6px', borderRadius: '9999px' }}>AI</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#9a3412' }}>Generate optimized itineraries</div>
                </div>
                <ChevronRight size={18} color="#ea580c" />
              </NavLink>

              <NavLink to="/packages" onClick={() => setMobileMenuOpen(false)} className="mobile-link-card">
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={18} color="#16a34a" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Tour Packages</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Handcrafted holidays & departures</div>
                </div>
                <ChevronRight size={18} color="#94a3b8" />
              </NavLink>

              <NavLink to="/destinations" onClick={() => setMobileMenuOpen(false)} className="mobile-link-card">
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={18} color="#7c3aed" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Destinations & Cities</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Discover top sights & landmarks</div>
                </div>
                <ChevronRight size={18} color="#94a3b8" />
              </NavLink>

              <NavLink to="/trips" onClick={() => setMobileMenuOpen(false)} className="mobile-link-card">
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={18} color="#0284c7" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>My Trips & Bookings</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>View tickets, passes & manifests</div>
                </div>
                <ChevronRight size={18} color="#94a3b8" />
              </NavLink>

              <NavLink to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="mobile-link-card">
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ffe4e6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Heart size={18} color="#e11d48" fill="#e11d48" />
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>Wishlist Places</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>Saved destinations to visit</div>
                  </div>
                  {wishlistCount > 0 && (
                    <span style={{ fontSize: '11px', fontWeight: 800, background: '#e11d48', color: '#fff', padding: '2px 8px', borderRadius: '9999px' }}>
                      {wishlistCount}
                    </span>
                  )}
                </div>
                <ChevronRight size={18} color="#94a3b8" />
              </NavLink>
            </div>

            {/* 3. QUICK JUMP TO HOME SECTIONS */}
            <div className="mobile-menu-label">PAGE SECTIONS SHORTCUTS</div>
            <div className="mobile-sections-shortcut-grid">
              <button
                type="button"
                onClick={() => scrollToSection('destinations-section')}
                className="shortcut-chip-btn"
              >
                <MapPin size={15} color="#0284c7" />
                <span>📍 Destinations</span>
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('packages-section')}
                className="shortcut-chip-btn"
              >
                <Package size={15} color="#16a34a" />
                <span>🎒 Tours & Trips</span>
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('planner-section')}
                className="shortcut-chip-btn"
              >
                <Sparkles size={15} color="#ea580c" />
                <span>✨ Smart Planner</span>
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('why-us-section')}
                className="shortcut-chip-btn"
              >
                <Shield size={15} color="#6366f1" />
                <span>🛡️ Why Choose Us</span>
              </button>
            </div>

            {/* 4. MANAGEMENT PORTALS (IF PERMITTED) */}
            {(isOperator || isAdmin) && (
              <>
                <div className="mobile-menu-label">MANAGEMENT PORTALS</div>
                <div className="mobile-nav-column">
                  {isOperator && (
                    <NavLink to="/operator" onClick={() => setMobileMenuOpen(false)} className="mobile-link-card" style={{ background: '#fefce8', border: '1px solid #fef08a' }}>
                      <Briefcase size={18} color="#ca8a04" />
                      <div style={{ flex: 1, fontSize: '14.5px', fontWeight: 700, color: '#854d0e' }}>Operator Portal</div>
                      <ChevronRight size={18} color="#ca8a04" />
                    </NavLink>
                  )}
                  {isAdmin && (
                    <NavLink to="/admin" onClick={() => setMobileMenuOpen(false)} className="mobile-link-card" style={{ background: '#f0f9ff', border: '1px solid #bae6fd' }}>
                      <Shield size={18} color="#0284c7" />
                      <div style={{ flex: 1, fontSize: '14.5px', fontWeight: 700, color: '#0369a1' }}>Admin Control Panel</div>
                      <ChevronRight size={18} color="#0284c7" />
                    </NavLink>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
