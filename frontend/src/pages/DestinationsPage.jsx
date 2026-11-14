import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/apiClient';
import { DestinationCard } from '../components/DestinationCard';
import { Search, Filter, Compass } from 'lucide-react';

export const DestinationsPage = () => {
  const [destinations, setDestinations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [season, setSeason] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDestinations();
  }, [season, maxBudget]);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const [dList, cList] = await Promise.all([
        apiClient.get('/destinations', { search, season, maxBudget }),
        apiClient.get('/categories'),
      ]);
      setDestinations(dList || []);
      setCategories(cList || []);
    } catch (err) {
      console.error('Error fetching destinations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchDestinations();
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '40px auto', padding: '0 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
          Explore Destinations
        </h1>
        <p style={{ color: '#64748b', fontSize: '16px' }}>
          Discover breathtaking coastal cities, mountain peaks, cultural capitals, and island retreats.
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
            placeholder="Search city, state, country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
          />
        </div>

        <select
          value={season}
          onChange={(e) => setSeason(e.target.value)}
          style={{ padding: '12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#fff' }}
        >
          <option value="">All Seasons</option>
          <option value="October">October to March</option>
          <option value="November">November to February</option>
          <option value="Summer">Summer Months</option>
        </select>

        <select
          value={maxBudget}
          onChange={(e) => setMaxBudget(e.target.value)}
          style={{ padding: '12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '14px', outline: 'none', background: '#fff' }}
        >
          <option value="">Any Daily Budget</option>
          <option value="3000">Under ₹3,000 / day</option>
          <option value="6000">Under ₹6,000 / day</option>
          <option value="15000">Under ₹15,000 / day</option>
        </select>

        <button type="submit" className="btn-primary-orange" style={{ height: '48px', justifyContent: 'center' }}>
          <Filter size={16} /> Filter Results
        </button>
      </form>

      {/* Destinations Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
          Loading destinations catalog...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {destinations.map((dest) => (
            <DestinationCard key={dest.destinationId} destination={dest} />
          ))}
        </div>
      )}
    </div>
  );
};

