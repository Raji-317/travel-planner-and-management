import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HeroSearch } from '../components/HeroSearch';
import { DestinationCard } from '../components/DestinationCard';
import { PackageCard } from '../components/PackageCard';
import { apiClient } from '../api/apiClient';
import {
  Sparkles,
  Compass,
  ShieldCheck,
  Clock,
  ArrowRight,
  Award,
  Zap,
  MapPin,
  Package,
  Layers
} from 'lucide-react';

export const HomePage = () => {
  const [destinations, setDestinations] = useState([]);
  const [featuredPackages, setFeaturedPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dList, pList] = await Promise.all([
          apiClient.get('/destinations?featured=true'),
          apiClient.get('/packages'),
        ]);
        setDestinations(dList ? dList.slice(0, 5) : []);
        setFeaturedPackages(pList ? pList.slice(0, 4) : []);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Handle smooth scroll when navigating to #section-id
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const timer = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div>
      {/* 1. TRAVIVU HERO SECTION */}
      <section className="travivu-hero" id="hero-section">
        <div className="travivu-hero-content">
          <h1 className="travivu-hero-title">
            Beginning of<br />Your Travel Journey
          </h1>
          <p className="travivu-hero-subtitle">
            Discover amazing places, unforgettable experiences and the best deals — all in one place.
          </p>
        </div>

        {/* Multi-Segment Pill Search Bar */}
        <HeroSearch />

        {/* Mobile Quick-Jump Section Chips (visible on phones) */}
        <div className="mobile-section-chips-bar">
          <button
            type="button"
            onClick={() => scrollToSection('destinations-section')}
            className="mobile-chip-btn"
          >
            <MapPin size={13} color="#0284c7" /> Destinations
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('packages-section')}
            className="mobile-chip-btn"
          >
            <Package size={13} color="#0284c7" /> Tours & Packages
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('planner-section')}
            className="mobile-chip-btn"
          >
            <Sparkles size={13} color="#f59e0b" /> Smart Planner
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('why-us-section')}
            className="mobile-chip-btn"
          >
            <ShieldCheck size={13} color="#10b981" /> Why Us
          </button>
        </div>
      </section>

      {/* 2. TOP DESTINATIONS SECTION */}
      <section className="section-destinations section-anchor" id="destinations-section">
        <div className="section-header-row">
          <div>
            <div className="section-tag">Top Destinations</div>
            <h2 className="section-title">Popular Destinations</h2>
          </div>
          <Link to="/destinations" className="section-link">
            View all destinations <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            Loading top destinations...
          </div>
        ) : (
          <div className="destinations-grid-5">
            {destinations.map((dest) => (
              <DestinationCard key={dest.destinationId} destination={dest} />
            ))}
          </div>
        )}
      </section>

      {/* 3. WHY CHOOSE US */}
      <section className="section-anchor" id="why-us-section" style={{ maxWidth: '1280px', margin: '70px auto', padding: '0 24px', textAlign: 'center' }}>
        <div className="section-tag" style={{ margin: '0 auto 6px' }}>Why Choose Us</div>
        <h2 className="section-title" style={{ marginBottom: '40px' }}>Travel Services You Can Trust</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          <div style={{ background: '#ffffff', padding: '32px 24px', borderRadius: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid #e2e8f0', textAlign: 'left' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Zap size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>
              Smart Travel Planner
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
              Dijkstra-optimized route sequencing, automatic daily budgeting, and interest-based attraction clustering.
            </p>
          </div>

          <div style={{ background: '#ffffff', padding: '32px 24px', borderRadius: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid #e2e8f0', textAlign: 'left' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fef3c7', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>
              Safe Concurrent Bookings
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
              Atomic JDBC transactions and seat reservation locks protect against double-booking on peak tours.
            </p>
          </div>

          <div style={{ background: '#ffffff', padding: '32px 24px', borderRadius: '20px', boxShadow: 'var(--shadow-sm)', border: '1px solid #e2e8f0', textAlign: 'left' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f0fdf4', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
              <Award size={24} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#0f172a' }}>
              Verified Travel Operators
            </h3>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
              Only licensed, administrator-approved travel agencies manage packages, itineraries, and departures.
            </p>
          </div>
        </div>
      </section>

      {/* 4. SMART TRAVEL PLANNER CALLOUT */}
      <section className="section-anchor" id="planner-section" style={{ maxWidth: '1280px', margin: '70px auto', padding: '0 24px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '28px', padding: '50px 40px', color: '#ffffff',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '30px'
        }}>
          <div style={{ maxWidth: '600px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(2, 132, 199, 0.25)', color: '#38bdf8', padding: '6px 14px', borderRadius: '9999px', fontSize: '12px', fontWeight: 800, marginBottom: '14px' }}>
              <Sparkles size={14} /> AI-FREE DETERMINISTIC ALGORITHM
            </div>
            <h2 style={{ fontSize: '34px', fontWeight: 800, lineHeight: 1.2, marginBottom: '16px' }}>
              Plan Your Dream Itinerary in Seconds
            </h2>
            <p style={{ fontSize: '15px', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '24px' }}>
              Input your destination, days, budget, and travel preferences. Our algorithmic engine crafts morning, afternoon, and evening schedules with real distances and travel times.
            </p>
            <Link to="/planner" className="btn-primary-orange" style={{ padding: '14px 28px', fontSize: '15px' }}>
              Try Smart Travel Planner <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '20px', padding: '24px', border: '1px solid rgba(255,255,255,0.15)', minWidth: '280px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>Example Output:</div>
            <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>Visakhapatnam • 3 Days</div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px' }}>Budget: ₹10,000 • 2 Travelers</div>
            <div style={{ fontSize: '12.5px', color: '#e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div>🌅 Day 1: RK Beach & Submarine Museum</div>
              <div>☀️ Day 2: Kailasagiri Hill & Rishikonda Watersports</div>
              <div>🌇 Day 3: Simhachalam Heritage & Coastal Sunset</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURED PACKAGES SECTION */}
      <section className="section-anchor" id="packages-section" style={{ maxWidth: '1280px', margin: '70px auto 40px', padding: '0 24px' }}>
        <div className="section-header-row">
          <div>
            <div className="section-tag">Handcrafted Tours</div>
            <h2 className="section-title">Featured Travel Packages</h2>
          </div>
          <Link to="/packages" className="section-link">
            Explore all packages <ArrowRight size={16} />
          </Link>
        </div>

        <div className="gotrips-packages-grid">
          {featuredPackages.map((pkg) => (
            <PackageCard key={pkg.packageId} pkg={pkg} />
          ))}
        </div>
      </section>
    </div>
  );
};
