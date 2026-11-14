import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Send, User, Briefcase, Mail, Lock, Phone, AlertCircle } from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { registerTourist, registerOperator } = useAuth();
  const [role, setRole] = useState('TOURIST'); // TOURIST or OPERATOR

  // Tourist fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Operator extra fields
  const [companyName, setCompanyName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [yearsInBusiness, setYearsInBusiness] = useState(2);
  const [officeAddress, setOfficeAddress] = useState('');
  const [supportPhone, setSupportPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (role === 'OPERATOR') {
        await registerOperator({
          email,
          password,
          fullName: fullName || companyName,
          phone: phone || supportPhone,
          companyName,
          licenseNumber,
          yearsInBusiness: parseInt(yearsInBusiness) || 1,
          officeAddress,
          supportPhone: supportPhone || phone,
          supportEmail: email,
        });
        navigate('/operator');
      } else {
        await registerTourist(email, password, fullName, phone);
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 180px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div style={{ maxWidth: '520px', width: '100%', background: '#ffffff', borderRadius: '24px', padding: '36px', boxShadow: 'var(--shadow-md)', border: '1px solid #e2e8f0' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>Create an Account</h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>Register as a traveler or tour operator</p>
        </div>

        {/* Role Toggle */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '12px', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => setRole('TOURIST')}
            style={{
              padding: '10px', borderRadius: '10px', fontSize: '13.5px', fontWeight: 700, border: 'none',
              background: role === 'TOURIST' ? '#ffffff' : 'transparent',
              color: role === 'TOURIST' ? '#0284c7' : '#64748b',
              boxShadow: role === 'TOURIST' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}
          >
            <User size={16} /> Tourist
          </button>
          <button
            type="button"
            onClick={() => setRole('OPERATOR')}
            style={{
              padding: '10px', borderRadius: '10px', fontSize: '13.5px', fontWeight: 700, border: 'none',
              background: role === 'OPERATOR' ? '#ffffff' : 'transparent',
              color: role === 'OPERATOR' ? '#f59e0b' : '#64748b',
              boxShadow: role === 'OPERATOR' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}
          >
            <Briefcase size={16} /> Travel Operator
          </button>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px', borderRadius: '10px', fontSize: '13.5px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
              Full Name
            </label>
            <input
              type="text"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
              Password
            </label>
            <input
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
              required
            />
          </div>

          {/* Operator Specific Fields */}
          {role === 'OPERATOR' && (
            <>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Company / Agency Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. GoTrips Global Travels Ltd"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Commercial Tourism License No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. OP-LIC-2026-9041"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Office Address
                </label>
                <input
                  type="text"
                  placeholder="Suite or street address"
                  value={officeAddress}
                  onChange={(e) => setOfficeAddress(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary-orange"
            style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px', marginTop: '8px' }}
          >
            {loading ? 'Creating Account...' : `Register as ${role === 'OPERATOR' ? 'Travel Operator' : 'Tourist'}`}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '13.5px', color: '#64748b' }}>
          Already have an account? <Link to="/login" style={{ color: '#0284c7', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
};

