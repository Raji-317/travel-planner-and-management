import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, Calendar, Tag, Search, CheckCircle2 } from 'lucide-react';

export const HeroSearch = ({ onSearch }) => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [tripType, setTripType] = useState('');
  const [duration, setDuration] = useState('');
  const [budget, setBudget] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ location, tripType, duration, budget });
    } else {
      const params = new URLSearchParams();
      if (location) params.append('search', location);
      if (duration) params.append('durationDays', duration);
      if (budget) params.append('maxPrice', budget);
      navigate(`/packages?${params.toString()}`);
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <form className="travivu-search-card" onSubmit={handleSearchSubmit}>
        {/* Segment 1: Location */}
        <div className="search-segment">
          <div className="search-icon-circle">
            <MapPin size={18} />
          </div>
          <div className="search-meta">
            <span className="search-label">Location</span>
            <input
              type="text"
              placeholder="Where to?"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* Segment 2: Trip Type */}
        <div className="search-segment">
          <div className="search-icon-circle">
            <Briefcase size={18} />
          </div>
          <div className="search-meta">
            <span className="search-label">Trip Type</span>
            <select
              value={tripType}
              onChange={(e) => setTripType(e.target.value)}
              className="search-select"
            >
              <option value="">Any Type</option>
              <option value="Adventure">Adventure</option>
              <option value="Beach">Beach & Coastal</option>
              <option value="Heritage">Heritage & Culture</option>
              <option value="Nature">Nature & Hills</option>
            </select>
          </div>
        </div>

        {/* Segment 3: Duration */}
        <div className="search-segment">
          <div className="search-icon-circle">
            <Calendar size={18} />
          </div>
          <div className="search-meta">
            <span className="search-label">Duration</span>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="search-select"
            >
              <option value="">Any Duration</option>
              <option value="3">3 Days</option>
              <option value="5">5 Days</option>
              <option value="7">7 Days</option>
            </select>
          </div>
        </div>

        {/* Segment 4: Price */}
        <div className="search-segment">
          <div className="search-icon-circle">
            <Tag size={18} />
          </div>
          <div className="search-meta">
            <span className="search-label">Price</span>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="search-select"
            >
              <option value="">Any Budget</option>
              <option value="15000">Under ₹15,000</option>
              <option value="50000">Under ₹50,000</option>
              <option value="100000">Under ₹100,000</option>
            </select>
          </div>
        </div>

        {/* CTA Button */}
        <button type="submit" className="btn-hero-search">
          <Search size={18} /> Search
        </button>
      </form>

      {/* Trust Badges */}
      <div className="hero-trust-badges">
        <div className="trust-item">
          <CheckCircle2 className="trust-check-icon" />
          <span>Best Price Guarantee</span>
        </div>
        <div className="trust-item">
          <CheckCircle2 className="trust-check-icon" />
          <span>24/7 Customer Support</span>
        </div>
        <div className="trust-item">
          <CheckCircle2 className="trust-check-icon" />
          <span>Trusted by Thousands</span>
        </div>
      </div>
    </div>
  );
};

