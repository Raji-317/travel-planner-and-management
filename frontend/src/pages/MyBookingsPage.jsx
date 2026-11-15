import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Users,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Sparkles,
  MapPin,
  Trash2,
  Compass,
  ArrowRight,
  Star,
  ExternalLink,
  Package
} from 'lucide-react';
import { fetchUserWishlist, removeWishlistItem } from '../utils/wishlistHelper';

export const MyBookingsPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab state: 'bookings' or 'wishlist'
  const initialTab = searchParams.get('tab') === 'wishlist' || location.pathname === '/wishlist' ? 'wishlist' : 'bookings';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('Change of travel schedule');
  const [actionLoading, setActionLoading] = useState(false);
  const [notice, setNotice] = useState('');

  // Wishlist state
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(true);

  useEffect(() => {
    fetchBookings();
    loadWishlist();

    const handleWishlistChange = () => {
      loadWishlist();
    };

    window.addEventListener('wishlist-changed', handleWishlistChange);
    return () => window.removeEventListener('wishlist-changed', handleWishlistChange);
  }, [user]);

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const list = await apiClient.get('/bookings/my');
      setBookings(list || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const loadWishlist = async () => {
    setLoadingWishlist(true);
    try {
      const items = await fetchUserWishlist(user);
      setWishlistItems(items || []);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoadingWishlist(false);
    }
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'wishlist' ? { tab: 'wishlist' } : {});
  };

  const handleRemoveFromWishlist = async (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = await removeWishlistItem(item, user);
    setWishlistItems(updated || []);
    setNotice(`"${item.destinationName || item.packageTitle || 'Item'}" removed from your wishlist.`);
    setTimeout(() => setNotice(''), 4000);
  };

  const handlePlanItinerary = (e, item) => {
    e.preventDefault();
    e.stopPropagation();
    const destId = item.destinationId;
    const destName = item.destinationName || '';
    navigate(`/planner?destinationId=${destId}&destination=${encodeURIComponent(destName)}`);
  };

  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!cancelModalBooking) return;

    setActionLoading(true);
    try {
      await apiClient.post(`/bookings/${cancelModalBooking.bookingId}/cancel`, {
        reason: cancelReason,
      });
      setNotice('Booking cancelled successfully! Simulated refund has been credited.');
      setCancelModalBooking(null);
      fetchBookings();
    } catch (err) {
      alert(err.message || 'Error cancelling booking');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1180px', margin: '40px auto', padding: '0 24px', minHeight: '75vh' }}>
      {/* Header section */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
          <Compass size={16} /> Tourist Portal
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
          My Trips & Wishlist
        </h1>
        <p style={{ color: '#64748b', fontSize: '15px' }}>
          Keep track of your confirmed tour bookings and explore dream destinations saved in your wishlist.
        </p>
      </div>

      {/* Tabs navigation */}
      <div style={{
        display: 'flex',
        gap: '12px',
        borderBottom: '2px solid #e2e8f0',
        marginBottom: '28px',
        paddingBottom: '4px'
      }}>
        <button
          onClick={() => handleTabSwitch('bookings')}
          style={{
            background: 'none',
            border: 'none',
            padding: '12px 20px',
            fontSize: '15px',
            fontWeight: activeTab === 'bookings' ? 800 : 600,
            color: activeTab === 'bookings' ? '#0284c7' : '#64748b',
            borderBottom: activeTab === 'bookings' ? '3px solid #0284c7' : '3px solid transparent',
            marginBottom: '-6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
        >
          <Calendar size={18} />
          My Bookings & Passes
          <span style={{
            background: activeTab === 'bookings' ? '#e0f2fe' : '#f1f5f9',
            color: activeTab === 'bookings' ? '#0369a1' : '#64748b',
            padding: '2px 8px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 700
          }}>
            {bookings.length}
          </span>
        </button>

        <button
          onClick={() => handleTabSwitch('wishlist')}
          style={{
            background: 'none',
            border: 'none',
            padding: '12px 20px',
            fontSize: '15px',
            fontWeight: activeTab === 'wishlist' ? 800 : 600,
            color: activeTab === 'wishlist' ? '#e11d48' : '#64748b',
            borderBottom: activeTab === 'wishlist' ? '3px solid #e11d48' : '3px solid transparent',
            marginBottom: '-6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
        >
          <Heart size={18} fill={activeTab === 'wishlist' ? '#e11d48' : 'none'} color={activeTab === 'wishlist' ? '#e11d48' : '#64748b'} />
          Wishlist Places
          <span style={{
            background: activeTab === 'wishlist' ? '#ffe4e6' : '#f1f5f9',
            color: activeTab === 'wishlist' ? '#be123c' : '#64748b',
            padding: '2px 8px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 700
          }}>
            {wishlistItems.length}
          </span>
        </button>
      </div>

      {/* Global alert notice */}
      {notice && (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          color: '#166534',
          padding: '14px 18px',
          borderRadius: '12px',
          marginBottom: '24px',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.2s ease'
        }}>
          <CheckCircle2 size={18} /> {notice}
        </div>
      )}

      {/* TAB 1: BOOKINGS CONTENT */}
      {activeTab === 'bookings' && (
        <div>
          {loadingBookings ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Loading your trips...</div>
          ) : bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#94a3b8' }}>
                <Calendar size={32} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>You have no tour bookings yet</h3>
              <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px', maxWidth: '420px', margin: '0 auto 20px' }}>
                Explore handpicked vacation packages across India, or browse your wishlist places to generate an instant itinerary!
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <Link to="/packages" className="btn-primary-orange">Explore Tours & Packages</Link>
                <button onClick={() => handleTabSwitch('wishlist')} style={{ background: '#f8fafc', border: '1px solid #cbd5e1', color: '#334155', padding: '10px 18px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer' }}>
                  View Wishlist Places
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {bookings.map((b) => (
                <div key={b.bookingId} style={{
                  background: '#ffffff', borderRadius: '20px', padding: '24px 28px',
                  border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 800, background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', color: '#0284c7' }}>
                          {b.bookingRef}
                        </span>
                        <span style={{
                          fontSize: '12px', fontWeight: 800, padding: '3px 10px', borderRadius: '9999px',
                          background: b.bookingStatus === 'CONFIRMED' ? '#dcfce7' : '#fee2e2',
                          color: b.bookingStatus === 'CONFIRMED' ? '#15803d' : '#b91c1c'
                        }}>
                          {b.bookingStatus}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{b.packageTitle}</h3>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>Destination: {b.destinationName}</div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Total Paid</div>
                      <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
                        ₹{b.totalAmount?.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: '#f8fafc', padding: '16px', borderRadius: '14px', marginBottom: '16px', fontSize: '13.5px' }}>
                    <div>
                      <span style={{ color: '#64748b' }}>Departure: </span>
                      <strong>{b.startDate} to {b.endDate}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Travelers: </span>
                      <strong>{b.numTravelers} Person(s)</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Payment: </span>
                      <strong>{b.payment?.paymentStatus || 'SUCCESS'} ({b.payment?.paymentMethod || 'CARD'})</strong>
                    </div>
                  </div>

                  {/* Passenger list */}
                  {b.travelers && b.travelers.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Travelers Manifest
                      </div>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {b.travelers.map((t, i) => (
                          <span key={i} style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 600 }}>
                            {t.fullName} ({t.age}y, {t.gender})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {b.bookingStatus === 'CONFIRMED' && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => setCancelModalBooking(b)}
                        style={{ background: 'none', border: '1px solid #fca5a5', color: '#dc2626', padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Cancel Booking & Refund
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: WISHLIST PLACES CONTENT */}
      {activeTab === 'wishlist' && (
        <div>
          {loadingWishlist ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Loading your wishlist places...</div>
          ) : wishlistItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#e11d48' }}>
                <Heart size={34} fill="#ffe4e6" />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                Your Wishlist is Empty
              </h3>
              <p style={{ fontSize: '14.5px', color: '#64748b', maxWidth: '440px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                Click the heart icon on any destination card to save places here. You can plan instant itineraries or view travel packages whenever you're ready!
              </p>
              <Link to="/destinations" className="btn-primary-orange" style={{ padding: '12px 24px' }}>
                Explore Destinations & Landmarks
              </Link>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div style={{ fontSize: '15px', color: '#64748b' }}>
                  Showing <strong>{wishlistItems.length}</strong> saved place{wishlistItems.length > 1 ? 's' : ''}
                </div>
                <Link
                  to="/destinations"
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 700,
                    color: '#0284c7',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  + Add More Destinations
                </Link>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '24px'
              }}>
                {wishlistItems.map((item) => {
                  const destId = item.destinationId;
                  const title = item.destinationName || item.packageTitle || 'Dream Destination';
                  const locationStr = item.destinationState
                    ? `${item.destinationState}, ${item.destinationCountry || 'India'}`
                    : (item.destinationCountry || 'India');
                  const image = item.imageUrl || 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800';
                  const rating = item.popularityScore ? Number(item.popularityScore).toFixed(1) : '4.8';
                  const budget = item.dailyBudgetEstimated ? `₹${Number(item.dailyBudgetEstimated).toLocaleString()}/day` : null;

                  return (
                    <div
                      key={item.wishlistId || destId || Math.random()}
                      style={{
                        background: '#ffffff',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        border: '1px solid #e2e8f0',
                        boxShadow: 'var(--shadow-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-3px)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                      }}
                    >
                      {/* Image header with heart remove button */}
                      <div style={{ position: 'relative', height: '190px', width: '100%', overflow: 'hidden' }}>
                        <img
                          src={image}
                          alt={title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%)'
                        }} />

                        {/* Top action buttons */}
                        <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '8px', zIndex: 2 }}>
                          <button
                            onClick={(e) => handleRemoveFromWishlist(e, item)}
                            title="Remove from Wishlist"
                            style={{
                              background: '#ffffff',
                              border: 'none',
                              borderRadius: '50%',
                              width: '34px',
                              height: '34px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                              color: '#ef4444'
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Badge on bottom left */}
                        <div style={{ position: 'absolute', bottom: '12px', left: '14px', display: 'flex', gap: '8px', zIndex: 2 }}>
                          <span style={{
                            background: 'rgba(15, 23, 42, 0.75)',
                            backdropFilter: 'blur(4px)',
                            color: '#ffffff',
                            padding: '4px 10px',
                            borderRadius: '9999px',
                            fontSize: '12px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <Star size={13} fill="#facc15" color="#facc15" /> {rating}
                          </span>
                          {budget && (
                            <span style={{
                              background: 'rgba(15, 23, 42, 0.75)',
                              backdropFilter: 'blur(4px)',
                              color: '#4ade80',
                              padding: '4px 10px',
                              borderRadius: '9999px',
                              fontSize: '12px',
                              fontWeight: 700
                            }}>
                              {budget}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                          <MapPin size={13} color="#0284c7" />
                          <span>{locationStr}</span>
                        </div>

                        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                          {title}
                        </h3>

                        {item.description && (
                          <p style={{
                            fontSize: '13px',
                            color: '#64748b',
                            lineHeight: 1.5,
                            marginBottom: '16px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            flex: 1
                          }}>
                            {item.description}
                          </p>
                        )}

                        {/* Action buttons */}
                        <div style={{ marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {/* Plan Itinerary CTA */}
                          {destId ? (
                            <button
                              onClick={(e) => handlePlanItinerary(e, item)}
                              style={{
                                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                                color: '#ffffff',
                                border: 'none',
                                padding: '10px 16px',
                                borderRadius: '10px',
                                fontSize: '13.5px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <Sparkles size={15} color="#7dd3fc" /> Plan Smart Itinerary
                            </button>
                          ) : null}

                          <div style={{ display: 'flex', gap: '8px' }}>
                            {destId && (
                              <Link
                                to={`/destinations/${destId}`}
                                style={{
                                  flex: 1,
                                  background: '#f8fafc',
                                  border: '1px solid #cbd5e1',
                                  color: '#334155',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  fontSize: '12.5px',
                                  fontWeight: 600,
                                  textAlign: 'center',
                                  textDecoration: 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '4px'
                                }}
                              >
                                View Details
                              </Link>
                            )}

                            <Link
                              to={`/packages?search=${encodeURIComponent(item.destinationName || '')}`}
                              style={{
                                flex: 1,
                                background: '#f8fafc',
                                border: '1px solid #cbd5e1',
                                color: '#334155',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                fontSize: '12.5px',
                                fontWeight: 600,
                                textAlign: 'center',
                                textDecoration: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '4px'
                              }}
                            >
                              <Package size={13} /> View Tours
                            </Link>

                            <button
                              onClick={(e) => handleRemoveFromWishlist(e, item)}
                              title="Remove from Wishlist"
                              style={{
                                background: '#fff1f2',
                                border: '1px solid #fecdd3',
                                color: '#e11d48',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                fontSize: '12.5px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cancellation Modal */}
      {cancelModalBooking && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '28px', maxWidth: '480px', width: '100%' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Cancel Booking ({cancelModalBooking.bookingRef})?
            </h3>
            <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: 1.5, marginBottom: '16px' }}>
              Are you sure you want to cancel this booking? The {cancelModalBooking.numTravelers} seat(s) will be restored to the tour inventory, and a simulated refund of ₹{cancelModalBooking.totalAmount?.toLocaleString()} will be issued.
            </p>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Reason for Cancellation</label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                required
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setCancelModalBooking(null)} className="btn-link">Keep Booking</button>
              <button onClick={handleCancelSubmit} disabled={actionLoading} style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                {actionLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
