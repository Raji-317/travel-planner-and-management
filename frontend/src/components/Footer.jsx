import React from 'react';
import { Link } from 'react-router-dom';
import { Send, MapPin, Phone, Mail, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '60px 24px 30px', marginTop: '80px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '40px', marginBottom: '40px' }}>
        <div>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#ffffff', fontSize: '22px', fontWeight: 800, marginBottom: '16px' }}>
            Travel Planner
          </Link>
          <p style={{ fontSize: '13.5px', lineHeight: 1.6, marginBottom: '20px' }}>
            Next-generation Travel & Tourism Management System with a Smart Route-Optimized Travel Planner.
          </p>
        </div>

        <div>
          <h4 style={{ color: '#ffffff', fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <li><Link to="/destinations" style={{ color: 'inherit', textDecoration: 'none' }}>Destinations</Link></li>
            <li><Link to="/packages" style={{ color: 'inherit', textDecoration: 'none' }}>Tour Packages</Link></li>
            <li><Link to="/planner" style={{ color: 'inherit', textDecoration: 'none' }}>Smart Travel Planner</Link></li>
            <li><Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>Sign In</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#ffffff', fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Travel Categories</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px' }}>
            <li><Link to="/packages?search=Beach" style={{ color: 'inherit', textDecoration: 'none' }}>Beach Holidays</Link></li>
            <li><Link to="/packages?search=Adventure" style={{ color: 'inherit', textDecoration: 'none' }}>Adventure Expeditions</Link></li>
            <li><Link to="/packages?search=Heritage" style={{ color: 'inherit', textDecoration: 'none' }}>Historical Forts & Palaces</Link></li>
            <li><Link to="/packages?search=Nature" style={{ color: 'inherit', textDecoration: 'none' }}>Hill Stations & Wildlife</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#ffffff', fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Contact & Support</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} color="#0284c7" /> Beach Road, Visakhapatnam, AP, India
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={16} color="#0284c7" /> +91 98765 43210
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} color="#0284c7" /> support@travelplanner.com
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', paddingTop: '24px', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '13px' }}>
        <div>© 2026 Travel & Tourism Management System. Built with Pure Java + JDBC + React.</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          Crafted for Computer Science Engineering Excellence <Heart size={14} color="#f97316" fill="#f97316" />
        </div>
      </div>
    </footer>
  );
};

