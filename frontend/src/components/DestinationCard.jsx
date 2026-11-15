import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isDestinationWishlisted, toggleDestinationWishlist } from '../utils/wishlistHelper';

export const DestinationCard = ({ destination }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(() => isDestinationWishlisted(destination?.destinationId));

  useEffect(() => {
    setIsSaved(isDestinationWishlisted(destination?.destinationId));

    const handleWishlistChange = () => {
      setIsSaved(isDestinationWishlisted(destination?.destinationId));
    };

    window.addEventListener('wishlist-changed', handleWishlistChange);
    return () => window.removeEventListener('wishlist-changed', handleWishlistChange);
  }, [destination?.destinationId]);

  const formatReviewCount = (count) => {
    if (!count) return '1.2k';
    return count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count;
  };

  const handlePlanDirectly = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/planner?destinationId=${destination.destinationId}&destination=${encodeURIComponent(destination.name)}`);
  };

  const handleToggleHeart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextSaved = await toggleDestinationWishlist(destination, user);
    setIsSaved(nextSaved);
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
            backdropFilter: 'blur(4px)',
            transition: 'transform 0.15s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Sparkles size={12} color="#38bdf8" /> Plan
        </button>

        <button
          type="button"
          className={`dest-card-heart ${isSaved ? 'active' : ''}`}
          onClick={handleToggleHeart}
          title={isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}
          style={{
            background: isSaved ? '#fee2e2' : 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            transition: 'all 0.2s ease'
          }}
        >
          <Heart
            size={16}
            color={isSaved ? '#ef4444' : '#64748b'}
            fill={isSaved ? '#ef4444' : 'none'}
          />
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
