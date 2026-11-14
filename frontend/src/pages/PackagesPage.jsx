import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import { PackageCard } from '../components/PackageCard';
import { Search, Filter, Calendar, Tag } from 'lucide-react';

export const PackagesPage = () => {
  const [searchParams] = useSearchParams();
  const [packages, setPackages] = useState([]);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [duration, setDuration] = useState(searchParams.get('durationDays') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, [duration, maxPrice]);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const list = await apiClient.get('/packages', {
        search,
        durationDays: duration,
        maxPrice,
      });
      setPackages(list || []);
    } catch (err) {
      console.error('Error fetching packages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPackages();
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '40px auto', padding: '0 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
          Travel Packages & Curated Tours
        </h1>
        <p style={{ color: '#64748b', fontSize: '16px' }}>
          Explore multi-day packages with hand-selected hotels, transit, and guided itineraries.
        </p>
      </div>

      {/* Filter Bar */}
      <form onSubmit={handleSearchSubmit} style={{
        background: '#ffffff', padding: '20px', borderRadius: '16px',
        boxShadow: 'var(--shadow-sm)', border: '1px solid #e2e8f0',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px', alignItems: 'center', marginBottom: '36px'
      }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} color="#94a3b8" style={{ position: 'absolute', top: '14px', left: '14px' }} />
          <input
            type="text"
            placeholder="Search tours, keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
          />
        </div>

        <select
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          style={{ padding: '12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#fff' }}
        >
          <option value="">Any Duration</option>
          <option value="3">3 Days</option>
          <option value="4">4 Days</option>
          <option value="5">5 Days</option>
          <option value="6">6 Days</option>
          <option value="7">7 Days</option>
        </select>

        <select
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          style={{ padding: '12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#fff' }}
        >
          <option value="">Any Price</option>
          <option value="15000">Under ₹15,000</option>
          <option value="80000">Under ₹80,000</option>
          <option value="120000">Under ₹120,000</option>
        </select>

        <button type="submit" className="btn-primary-orange" style={{ height: '48px', justifyContent: 'center' }}>
          <Filter size={16} /> Filter Tours
        </button>
      </form>

      {/* Packages Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Loading packages...</div>
      ) : (
        <div className="gotrips-packages-grid">
          {packages.map((pkg) => (
            <PackageCard key={pkg.packageId} pkg={pkg} />
          ))}
        </div>
      )}
    </div>
  );
};

