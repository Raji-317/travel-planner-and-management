import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Send, Lock, Mail, Shield, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'OPERATOR') {
        navigate('/operator');
      } else if (user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password@123');
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 180px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ maxWidth: '440px', width: '100%', background: '#ffffff', borderRadius: '24px', padding: '36px', boxShadow: 'var(--shadow-md)', border: '1px solid #e2e8f0' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>Welcome Back</h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>Sign in to manage your tours, itineraries, and bookings</p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px', borderRadius: '10px', fontSize: '13.5px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#94a3b8" style={{ position: 'absolute', top: '14px', left: '14px' }} />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '12px 14px 12px 40px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#94a3b8" style={{ position: 'absolute', top: '14px', left: '14px' }} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 14px 12px 40px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary-orange"
            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px', marginTop: '6px' }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Quick Demo Switcher */}
        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', textAlign: 'center' }}>
            Quick Demo Accounts (Password: Password@123)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              type="button"
              onClick={() => fillDemo('tourist@gmail.com')}
              style={{ padding: '8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
            >
              👤 <strong>Tourist:</strong> tourist@gmail.com
            </button>
            <button
              type="button"
              onClick={() => fillDemo('operator@travelplanner.com')}
              style={{ padding: '8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
            >
              🏢 <strong>Operator:</strong> operator@travelplanner.com
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin@edu.com')}
              style={{ padding: '8px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
            >
              🛡️ <strong>Admin:</strong> admin@edu.com
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '13.5px', color: '#64748b' }}>
          Don't have an account? <Link to="/register" style={{ color: '#0284c7', fontWeight: 700, textDecoration: 'none' }}>Register here</Link>
        </div>
      </div>
    </div>
  );
};

