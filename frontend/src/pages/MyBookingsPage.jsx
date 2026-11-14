import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/apiClient';
import { Calendar, Users, ShieldAlert, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('Change of travel schedule');
  const [actionLoading, setActionLoading] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const list = await apiClient.get('/bookings/my');
      setBookings(list || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
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
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
          My Bookings & Travel Passes
        </h1>
        <p style={{ color: '#64748b', fontSize: '15px' }}>
          Manage your upcoming tour reservations, passenger manifests, and cancellations.
        </p>
      </div>

      {notice && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '14px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} /> {notice}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Loading your trips...</div>
      ) : bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '16px', color: '#64748b', marginBottom: '16px' }}>You have no trip bookings yet.</p>
          <Link to="/packages" className="btn-primary-orange">Explore Tours & Packages</Link>
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

