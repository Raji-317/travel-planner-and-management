import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Send,
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
  HelpCircle
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
  // OPERATOR / ADMIN TOPBAR VIEW
  // ==========================================
  if (isGotripsView) {
    return (
      <header className="gotrips-topbar-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <Link
            to="/"
            className="gotrips-logo"
            style={{ textDecoration: 'none', color: '#111827', fontWeight: 800, fontSize: '18px', display: 'flex', alignItems: 'center' }}
          >
            <span>{isAdmin ? 'Admin Portal' : 'Operator Portal'}</span>
          </Link>

          {/* Mobile hamburger toggle for Operator/Admin */}
          <button
            type="button"
            className="navbar-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
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

        {/* Mobile Dropdown Drawer for Operator / Admin */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #e5e7eb', background: '#f8fafc' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{user?.fullName}</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#0284c7' }}>{user?.role} PORTAL</div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{ background: '#e2e8f0', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="mobile-nav-links-list">
              {isAdmin ? (
                <>
                  <NavLink to="/admin" end onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item">
                    <Layers size={18} color="#0284c7" /> Dashboard
                  </NavLink>
                  <NavLink to="/admin/packages" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item">
                    <Package size={18} color="#0284c7" /> Package Approvals
                  </NavLink>
                  <NavLink to="/admin/bookings" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item">
                    <Calendar size={18} color="#0284c7" /> All Bookings
                  </NavLink>
                  <NavLink to="/admin/operators" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item">
                    <Briefcase size={18} color="#0284c7" /> Manage Operators
                  </NavLink>
                  <NavLink to="/admin/users" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item">
                    <User size={18} color="#0284c7" /> Manage Tourists
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/operator" end onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item">
                    <Layers size={18} color="#f59e0b" /> Operator Dashboard
                  </NavLink>
                  <NavLink to="/operator/bookings" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item">
                    <Calendar size={18} color="#f59e0b" /> Customer Bookings
                  </NavLink>
                  <NavLink to="/operator/packages" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item">
                    <Package size={18} color="#f59e0b" /> My Tour Packages
                  </NavLink>
                  <NavLink to="/operator/explore" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item">
                    <Compass size={18} color="#f59e0b" /> Explore Destinations
                  </NavLink>
                </>
              )}

              <div style={{ height: '1px', background: '#e2e8f0', margin: '10px 0' }} />

              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item">
                <Home size={18} color="#64748b" /> Return to Tourist Site
              </Link>

              <button
                onClick={() => { setMobileMenuOpen(false); logout(); navigate('/'); }}
                className="mobile-nav-item"
                style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', color: '#dc2626', cursor: 'pointer' }}
              >
                <LogOut size={18} color="#dc2626" /> Sign Out
              </button>
            </div>
          </div>
        )}
      </header>
    );
  }

  // ==========================================
  // MAIN TOURIST NAVBAR
  // ==========================================
  return (
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
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={26} color="#0f172a" /> : <Menu size={26} color="#0f172a" />}
        </button>
      </div>

      {/* ========================================================= */}
      {/* FULL MOBILE NAVIGATION DRAWER & SECTION NAVIGATOR */}
      {/* ========================================================= */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          {/* Header row in mobile menu */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={20} color="#0284c7" />
              <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Menu & Sections</span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              style={{ background: '#e2e8f0', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={18} color="#475569" />
            </button>
          </div>

          <div className="mobile-nav-scroll-area">
            {/* Section 1: Main Pages */}
            <div className="mobile-menu-group-title">MAIN PAGES</div>
            <div className="mobile-nav-links-list">
              <NavLink to="/" end onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item">
                <Home size={18} color="#0284c7" />
                <span>Home Page</span>
                <ChevronRight size={16} className="item-arrow" />
              </NavLink>

              <NavLink to="/destinations" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item">
                <MapPin size={18} color="#0284c7" />
                <span>Destinations & Cities</span>
                <ChevronRight size={16} className="item-arrow" />
              </NavLink>

              <NavLink to="/packages" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item">
                <Package size={18} color="#0284c7" />
                <span>Tour Packages</span>
                <ChevronRight size={16} className="item-arrow" />
              </NavLink>

              <NavLink to="/planner" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item">
                <Sparkles size={18} color="#f59e0b" />
                <span>Smart Travel Planner</span>
                <ChevronRight size={16} className="item-arrow" />
              </NavLink>

              {isAuthenticated ? (
                <>
                  <NavLink to="/trips" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item">
                    <Calendar size={18} color="#0284c7" />
                    <span>My Trips & Bookings</span>
                    <ChevronRight size={16} className="item-arrow" />
                  </NavLink>

                  <NavLink to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item">
                    <Heart size={18} color="#e11d48" fill="#ffe4e6" />
                    <span>Wishlist Places</span>
                    {wishlistCount > 0 && (
                      <span className="mobile-badge-pill">{wishlistCount} saved</span>
                    )}
                    <ChevronRight size={16} className="item-arrow" />
                  </NavLink>
                </>
              ) : (
                <NavLink to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item">
                  <Heart size={18} color="#e11d48" fill="#ffe4e6" />
                  <span>Wishlist Places</span>
                  {wishlistCount > 0 && (
                    <span className="mobile-badge-pill">{wishlistCount} saved</span>
                  )}
                  <ChevronRight size={16} className="item-arrow" />
                </NavLink>
              )}
            </div>

            {/* Section 2: Jump directly to sections on Home Page */}
            <div className="mobile-menu-group-title">JUMP TO HOME SECTIONS</div>
            <div className="mobile-nav-links-list">
              <button
                type="button"
                onClick={() => scrollToSection('destinations-section')}
                className="mobile-nav-item mobile-section-btn"
              >
                <MapPin size={18} color="#10b981" />
                <span>📍 Popular Destinations</span>
                <span className="jump-tag">Jump</span>
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('packages-section')}
                className="mobile-nav-item mobile-section-btn"
              >
                <Package size={18} color="#0284c7" />
                <span>🎒 Handcrafted Tours</span>
                <span className="jump-tag">Jump</span>
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('planner-section')}
                className="mobile-nav-item mobile-section-btn"
              >
                <Sparkles size={18} color="#f59e0b" />
                <span>✨ Smart Itinerary Engine</span>
                <span className="jump-tag">Jump</span>
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('why-us-section')}
                className="mobile-nav-item mobile-section-btn"
              >
                <Shield size={18} color="#6366f1" />
                <span>🛡️ Why Choose Us</span>
                <span className="jump-tag">Jump</span>
              </button>
            </div>

            {/* Section 3: Portals (if applicable) */}
            {(isOperator || isAdmin) && (
              <>
                <div className="mobile-menu-group-title">MANAGEMENT PORTALS</div>
                <div className="mobile-nav-links-list">
                  {isOperator && (
                    <NavLink to="/operator" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item" style={{ color: '#d97706', fontWeight: 700 }}>
                      <Briefcase size={18} color="#d97706" /> Operator Portal
                    </NavLink>
                  )}
                  {isAdmin && (
                    <NavLink to="/admin" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-item" style={{ color: '#0284c7', fontWeight: 700 }}>
                      <Shield size={18} color="#0284c7" /> Admin Control Panel
                    </NavLink>
                  )}
                </div>
              </>
            )}

            {/* Section 4: User Profile & Authentication */}
            <div className="mobile-user-section">
              {isAuthenticated ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px' }}>
                      {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{user?.fullName}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{user?.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => { setMobileMenuOpen(false); logout(); navigate('/'); }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#fff1f2',
                      border: '1px solid #fecdd3',
                      borderRadius: '12px',
                      color: '#e11d48',
                      fontWeight: 700,
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                      padding: '12px',
                      background: '#f1f5f9',
                      borderRadius: '12px',
                      color: '#0f172a',
                      fontWeight: 700,
                      fontSize: '14px',
                      textAlign: 'center',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <User size={16} /> Sign In to Account
                  </Link>

                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-primary-orange"
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      textAlign: 'center',
                      justifyContent: 'center',
                      fontSize: '14px'
                    }}
                  >
                    Create Free Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
