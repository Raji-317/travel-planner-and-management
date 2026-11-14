import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Edit3, Users, DollarSign } from 'lucide-react';

export const PackageCard = ({ pkg, onEdit, onSelect, isOperatorView }) => {
  const formatPrice = (price) => {
    if (!price) return '₹7,500';
    if (price > 1000) {
      return `₹${price.toLocaleString()}`;
    }
    return `$${price.toLocaleString()}`;
  };

  const cardContent = (
    <>
      <img
        src={pkg.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'}
        alt={pkg.title}
        className="gotrips-card-img"
        loading="lazy"
      />

      {/* Operator status badge */}
      {isOperatorView && (
        <div style={{ position: 'absolute', top: '14px', left: '14px', zIndex: 2 }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: '9999px',
              background: pkg.isActive ? 'rgba(22, 163, 74, 0.9)' : 'rgba(217, 119, 6, 0.9)',
              color: '#ffffff',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            }}
          >
            {pkg.isActive ? '● Live on Portal' : '⏳ Pending Approval'}
          </span>
        </div>
      )}

      {isOperatorView && onEdit && (
        <button
          type="button"
          className="gotrips-card-edit-btn"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onEdit(pkg);
          }}
          title="Edit Package Details"
        >
          <Edit3 size={15} />
        </button>
      )}

      <div className="gotrips-card-overlay">
        <div className="gotrips-card-title-row">
          <h3 className="gotrips-card-title">{pkg.title}</h3>
          <span className="gotrips-card-price">{formatPrice(pkg.basePricePerPerson)}</span>
        </div>

        <div className="gotrips-card-location">
          {pkg.destinationName || 'India'}
        </div>

        <div className="gotrips-card-footer">
          <span className="gotrips-duration-badge">
            {pkg.durationDays} Days / {pkg.durationNights} Nights
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#facc15' }}>
              {pkg.rating?.toFixed(1) || '4.8'}
              <Star size={12} fill="#facc15" color="#facc15" />
            </span>
            <span className="gotrips-bookings-meta">
              {pkg.totalBookings || 0} Bookings
            </span>
          </div>
        </div>
      </div>
    </>
  );

  if (isOperatorView) {
    return (
      <div
        className="gotrips-package-card"
        onClick={() => onSelect && onSelect(pkg)}
        style={{ cursor: 'pointer' }}
        title="Click to view tourists & package manifest"
      >
        {cardContent}
      </div>
    );
  }

  return (
    <Link to={`/packages/${pkg.packageId}`} className="gotrips-package-card">
      {cardContent}
    </Link>
  );
};
