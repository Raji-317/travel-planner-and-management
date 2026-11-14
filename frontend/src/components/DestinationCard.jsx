import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, Sparkles } from 'lucide-react';

export const DestinationCard = ({ destination }) => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  const formatReviewCount = (count) => {
    if (!count) return '1.2k';
    return count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count;
  };

  const handlePlanDirectly = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/planner?destinationId=${destination.destinationId}&destination=${encodeURIComponent(destination.name)}`);
  };

  return (
    <Link to={`/destinations/${destination.destinationId}`} className="dest-card" style={{ position: 'relative' }}>
      <img
        src={destination.imageUrl || destination.thumbnailUrl}
        alt={destination.name}
        className="dest-card-image"
        loading="lazy"
      />

      <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px', zIndex: 3 }}>
        <button
          type="button"
          onClick={handlePlanDirectly}
          title={`Plan Smart Itinerary for ${destination.name}`}
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            border: 'none',
            borderRadius: '9999px',
            color: '#fff',
            padding: '5px 10px',
            fontSize: '11px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            backdropFilter: 'blur(4px)'
          }}
        >
          <Sparkles size={12} color="#38bdf8" /> Plan
        </button>

        <button
          type="button"
          className={`dest-card-heart ${isSaved ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsSaved(!isSaved);
          }}
          title="Save Destination"
        >
          <Heart size={16} fill={isSaved ? '#ef4444' : 'none'} />
        </button>
      </div>

      <div className="dest-card-overlay">
        <h3 className="dest-card-title">
          {destination.name}, {destination.country || destination.state}
        </h3>
        <div className="dest-card-meta">
          <span className="star-rating-badge">
            <Star size={13} fill="#facc15" color="#facc15" />
            {destination.popularityScore?.toFixed(1) || '4.8'}
          </span>
          <span>({formatReviewCount(destination.totalReviews)} reviews)</span>
        </div>
      </div>
    </Link>
  );
};

