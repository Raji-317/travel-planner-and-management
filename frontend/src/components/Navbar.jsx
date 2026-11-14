import React from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Send, User, LogOut, Compass, Calendar, Shield, Briefcase } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isOperator, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isGotripsView = location.pathname.startsWith('/operator') || location.pathname.startsWith('/admin');

  if (isGotripsView) {
    return (
      <header className="gotrips-topbar-card">
        <Link to="/" className="gotrips-logo" style={{ textDecoration: 'none', color: '#111827', fontWeight: 800, fontSize: '18px', display: 'flex', alignItems: 'center' }}>
          <span>{isAdmin ? 'Admin Portal' : 'Operator Portal'}</span>
        </Link>

        <nav className="gotrips-nav-pills">
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

        <div className="gotrips-user-actions">
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
    );
  }

  return (
    <header className="travivu-navbar">
      <div className="travivu-nav-container">
        <Link to="/" className="travivu-brand" style={{ textDecoration: 'none', color: '#0284c7', fontWeight: 800, fontSize: '22px' }}>
          <span>Travel Planner</span>
        </Link>

        <nav className="travivu-nav-links">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink>
          <NavLink to="/destinations" className={({ isActive }) => isActive ? 'active' : ''}>Destinations</NavLink>
          <NavLink to="/packages" className={({ isActive }) => isActive ? 'active' : ''}>Tours</NavLink>
          <NavLink to="/planner" className={({ isActive }) => isActive ? 'active' : ''}>Smart Planner</NavLink>
          {isAuthenticated && (
            <NavLink to="/my-bookings" className={({ isActive }) => isActive ? 'active' : ''}>My Trips</NavLink>
          )}
          {isOperator && (
            <NavLink to="/operator" style={{ color: '#f59e0b', fontWeight: 700 }}>Operator Portal</NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" style={{ color: '#0284c7', fontWeight: 700 }}>Admin Panel</NavLink>
          )}
        </nav>

        <div className="travivu-nav-actions">
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
      </div>
    </header>
  );
};

