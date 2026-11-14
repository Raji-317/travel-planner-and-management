import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { BookingModal } from '../components/BookingModal';
import { Star, Calendar, Users, Check, X, Shield, MapPin, Clock, MessageSquare, Award } from 'lucide-react';

export const PackageDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [pkg, setPkg] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Review submission state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewMsg, setReviewMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [pkgData, revData] = await Promise.all([
        apiClient.get(`/packages/${id}`),
        apiClient.get(`/reviews?packageId=${id}`),
      ]);
      setPkg(pkgData);
      setReviews(revData || []);
    } catch (err) {
      console.error('Error fetching package details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await apiClient.post('/reviews', {
        packageId: parseInt(id),
        rating,
        reviewTitle,
        comment,
      });
      setReviewMsg('Review submitted successfully!');
      setComment('');
      setReviewTitle('');
      fetchData();
    } catch (err) {
      setReviewMsg(err.message || 'Error submitting review');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '80px', color: '#64748b' }}>Loading package details...</div>;
  if (!pkg) return <div style={{ textAlign: 'center', padding: '80px', color: '#ef4444' }}>Package not found.</div>;

  return (
    <div>
      {/* Hero Banner */}
      <div style={{
        position: 'relative', height: '400px',
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(15,23,42,0.85) 100%), url(${pkg.imageUrl})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'flex', alignItems: 'flex-end', padding: '40px 24px', color: '#ffffff'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', padding: '4px 12px', borderRadius: '9999px', fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>
            <MapPin size={14} /> {pkg.destinationName}
          </div>
          <h1 style={{ fontSize: '40px', fontWeight: 800, marginBottom: '12px' }}>{pkg.title}</h1>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '14px', fontWeight: 600 }}>
            <span>{pkg.durationDays} Days / {pkg.durationNights} Nights</span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#facc15' }}>
              <Star size={16} fill="#facc15" color="#facc15" /> {pkg.rating?.toFixed(1)} ({pkg.totalBookings} booked)
            </span>
            <span>•</span>
            <span>Operated by {pkg.operatorName}</span>
          </div>
        </div>
      </div>

      <div className="detail-page-layout">
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>Tour Overview</h2>
          <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.7, marginBottom: '32px' }}>
            {pkg.description}
          </p>

          {/* Day-wise Itinerary */}
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>
            Day-by-Day Itinerary
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
            {pkg.itineraryDays && pkg.itineraryDays.map((d) => (
              <div key={d.dayNumber} style={{ background: '#ffffff', padding: '22px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '6px 14px', borderRadius: '9999px', fontSize: '13px', fontWeight: 800 }}>
                    Day {d.dayNumber}
                  </div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>{d.title}</h3>
                </div>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, marginBottom: '12px' }}>
                  {d.description}
                </p>
                <div className="day-activity-grid">
                  <div>🌅 <strong>Morning:</strong> {d.morningActivity || 'Sightseeing'}</div>
                  <div>☀️ <strong>Afternoon:</strong> {d.afternoonActivity || 'Local highlights'}</div>
                  <div>🌇 <strong>Evening:</strong> {d.eveningActivity || 'Free time'}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Included / Excluded */}
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>What's Included & Excluded</h2>
          <div className="inclusions-grid">
            <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: 800, marginBottom: '10px' }}>
                <Check size={18} /> Inclusions
              </div>
              <p style={{ fontSize: '13.5px', color: '#166534', lineHeight: 1.6 }}>{pkg.includedServices || 'Hotels, guided transfers, breakfast'}</p>
            </div>
            <div style={{ background: '#fef2f2', padding: '20px', borderRadius: '16px', border: '1px solid #fecaca' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontWeight: 800, marginBottom: '10px' }}>
                <X size={18} /> Exclusions
              </div>
              <p style={{ fontSize: '13.5px', color: '#991b1b', lineHeight: 1.6 }}>{pkg.excludedServices || 'Airfare, personal shopping, tips'}</p>
            </div>
          </div>

          {/* Customer Reviews */}
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>
            Verified Traveler Reviews ({reviews.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
            {reviews.map((r) => (
              <div key={r.reviewId} style={{ background: '#ffffff', padding: '18px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{r.userFullName}</div>
                  <div style={{ display: 'flex', gap: '2px', color: '#facc15' }}>
                    {[...Array(r.rating)].map((_, i) => <Star key={i} size={14} fill="#facc15" />)}
                  </div>
                </div>
                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{r.reviewTitle}</div>
                <p style={{ fontSize: '13.5px', color: '#475569' }}>{r.comment}</p>
              </div>
            ))}
          </div>

          {/* Review Box */}
          {isAuthenticated && (
            <form onSubmit={handleReviewSubmit} style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Write a Review</h3>
              {reviewMsg && <div style={{ fontSize: '13px', color: '#0284c7', marginBottom: '10px' }}>{reviewMsg}</div>}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setRating(star)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Star size={20} fill={star <= rating ? '#facc15' : 'none'} color="#facc15" />
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Review Headline"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '10px' }}
                required
              />
              <textarea
                placeholder="Share your experience on this trip..."
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '12px' }}
                required
              />
              <button type="submit" className="btn-primary-orange">Submit Review</button>
            </form>
          )}
        </div>

        {/* Sticky Booking Card */}
        <div>
          <div style={{
            background: '#ffffff', padding: '30px', borderRadius: '24px',
            border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-md)', position: 'sticky', top: '100px'
          }}>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Starting Price</div>
            <div style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
              ₹{pkg.basePricePerPerson?.toLocaleString()} <span style={{ fontSize: '14px', fontWeight: 500, color: '#64748b' }}>/ person</span>
            </div>

            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', marginBottom: '20px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Accommodation:</span>
                <span style={{ fontWeight: 600 }}>{pkg.accommodationDetails || '4-Star Resort'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Transport:</span>
                <span style={{ fontWeight: 600 }}>{pkg.transportationDetails || 'AC Vehicle'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Max Capacity:</span>
                <span style={{ fontWeight: 600 }}>{pkg.maxTravellers} travelers</span>
              </div>
            </div>

            <button
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/login');
                } else {
                  setIsBookingOpen(true);
                }
              }}
              className="btn-primary-orange"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '16px' }}
            >
              Reserve Seats Now
            </button>
          </div>
        </div>
      </div>

      <BookingModal
        pkg={pkg}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onBookingSuccess={() => fetchData()}
      />
    </div>
  );
};

