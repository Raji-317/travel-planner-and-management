import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import { MapPin, Calendar, DollarSign, Star, Clock, Compass, ArrowRight, CheckCircle2 } from 'lucide-react';

export const DestinationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [destination, setDestination] = useState(null);
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dest, atts] = await Promise.all([
          apiClient.get(`/destinations/${id}`),
          apiClient.get(`/attractions?destinationId=${id}`),
        ]);
        setDestination(dest);
        setAttractions(atts || []);
      } catch (err) {
        console.error('Error fetching destination details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '80px', color: '#64748b' }}>Loading destination details...</div>;
  }

  if (!destination) {
    return <div style={{ textAlign: 'center', padding: '80px', color: '#ef4444' }}>Destination not found.</div>;
  }

  return (
    <div>
      {/* Hero Header */}
      <div style={{
        position: 'relative', height: '420px',
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(15,23,42,0.85) 100%), url(${destination.imageUrl})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'flex', alignItems: 'flex-end', padding: '40px 24px', color: '#ffffff'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', padding: '4px 12px', borderRadius: '9999px', fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>
            <MapPin size={14} /> {destination.state}, {destination.country}
          </div>
          <h1 style={{ fontSize: '44px', fontWeight: 800, marginBottom: '12px' }}>{destination.name}</h1>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '14px', fontWeight: 600 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Star size={16} fill="#facc15" color="#facc15" /> {destination.popularityScore?.toFixed(1)} ({destination.totalReviews} reviews)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={16} color="#38bdf8" /> Best Season: {destination.bestSeason}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <DollarSign size={16} color="#4ade80" /> Daily Est: ₹{destination.dailyBudgetEstimated?.toLocaleString()} / person
            </div>
          </div>
        </div>
      </div>

      <div className="detail-page-layout">
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>About {destination.name}</h2>
          <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.7, marginBottom: '36px' }}>
            {destination.description}
          </p>

          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>
            Top Attractions & Points of Interest ({attractions.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {attractions.map((att) => (
              <div key={att.attractionId} style={{
                background: '#ffffff', borderRadius: '16px', padding: '18px 22px',
                border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)',
                display: 'flex', gap: '20px', alignItems: 'center'
              }}>
                <img
                  src={att.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200'}
                  alt={att.name}
                  style={{ width: '90px', height: '90px', borderRadius: '12px', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>{att.name}</h3>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#0284c7' }}>
                      {att.ticketPrice > 0 ? `₹${att.ticketPrice}` : 'Free Entry'}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#0284c7', marginBottom: '6px' }}>
                    {att.categoryName}
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, marginBottom: '8px' }}>
                    {att.description}
                  </p>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} /> {att.estimatedDurationMin} mins
                    </span>
                    <span>Hours: {att.openingTime?.substring(0, 5)} - {att.closingTime?.substring(0, 5)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sticky Action Sidebar */}
        <div>
          <div style={{
            background: '#ffffff', padding: '28px', borderRadius: '20px',
            border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-md)', position: 'sticky', top: '100px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>
              Plan a Custom Trip to {destination.name}
            </h3>
            <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.6, marginBottom: '20px' }}>
              Use our Smart Travel Planner algorithm to build an optimized day-wise itinerary matching your dates, budget, and travel pace.
            </p>
            <button
              onClick={() => navigate(`/planner?destinationId=${destination.destinationId}&destination=${encodeURIComponent(destination.name)}`)}
              className="btn-primary-orange"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}
            >
              Generate Smart Itinerary <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

