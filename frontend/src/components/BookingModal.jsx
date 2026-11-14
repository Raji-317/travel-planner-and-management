import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import { X, CheckCircle, CreditCard, ShieldCheck, Users, Calendar, AlertTriangle, Trash2 } from 'lucide-react';

export const BookingModal = ({ pkg, isOpen, onClose, onBookingSuccess }) => {
  if (!isOpen || !pkg) return null;

  const navigate = useNavigate();

  const [selectedDeparture, setSelectedDeparture] = useState(
    pkg.departures && pkg.departures.length > 0 ? pkg.departures[0].departureId : ''
  );
  const [numTravelers, setNumTravelers] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('CARD_SIMULATED');
  const [specialRequests, setSpecialRequests] = useState('');
  const [travelers, setTravelers] = useState([
    { fullName: '', age: 26, gender: 'MALE', idProofType: 'AADHAAR', idProofNumber: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Overlapping schedule conflict state
  const [conflictInfo, setConflictInfo] = useState(null);
  const [cancellingConflict, setCancellingConflict] = useState(false);

  const handleNumTravelersChange = (val) => {
    const count = Math.max(1, Math.min(10, parseInt(val) || 1));
    setNumTravelers(count);

    const updated = [...travelers];
    while (updated.length < count) {
      updated.push({ fullName: '', age: 25, gender: 'MALE', idProofType: 'AADHAAR', idProofNumber: '' });
    }
    while (updated.length > count) {
      updated.pop();
    }
    setTravelers(updated);
  };

  const handleTravelerField = (index, field, value) => {
    const updated = [...travelers];
    updated[index][field] = value;
    setTravelers(updated);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setConflictInfo(null);

    if (!selectedDeparture) {
      setError('Please select an available departure date.');
      return;
    }

    for (let i = 0; i < travelers.length; i++) {
      if (!travelers[i].fullName.trim()) {
        setError(`Please enter the full name for Traveler #${i + 1}`);
        return;
      }
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/bookings', {
        departureId: parseInt(selectedDeparture),
        numTravelers,
        paymentMethod,
        specialRequests,
        travelers,
      });

      setConfirmedBooking(res);
      if (onBookingSuccess) onBookingSuccess(res);
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('SCHEDULE_CONFLICT:')) {
        const parts = msg.split(':');
        const conflictId = parseInt(parts[1]);
        const detailedMsg = parts.slice(2).join(':');
        setConflictInfo({
          conflictId,
          message: detailedMsg
        });
        setError(detailedMsg);
      } else {
        setError(msg || 'Booking reservation failed. Please try again.');
        setConflictInfo(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConflictAndRebook = async () => {
    if (!conflictInfo?.conflictId) return;
    setCancellingConflict(true);
    try {
      await apiClient.delete(`/bookings/${conflictInfo.conflictId}`);
      setConflictInfo(null);
      setError('');
      // Immediately place new booking after removing the conflicting one
      const res = await apiClient.post('/bookings', {
        departureId: parseInt(selectedDeparture),
        numTravelers,
        paymentMethod,
        specialRequests,
        travelers,
      });
      setConfirmedBooking(res);
      if (onBookingSuccess) onBookingSuccess(res);
    } catch (err) {
      setError('Failed to cancel existing booking: ' + (err.message || 'Error'));
    } finally {
      setCancellingConflict(false);
    }
  };

  const totalPrice = (pkg.basePricePerPerson || 0) * numTravelers;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div style={{
        background: '#ffffff', borderRadius: '24px', maxWidth: '640px', width: '100%',
        maxHeight: '90vh', overflowY: 'auto', padding: '32px', boxShadow: '0 20px 45px rgba(0,0,0,0.25)',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
        >
          <X size={22} />
        </button>

        {confirmedBooking ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
              Booking Confirmed!
            </h2>
            <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
              Your reservation reference is:
            </p>
            <div style={{
              background: '#f1f5f9', padding: '14px', borderRadius: '12px',
              fontFamily: 'monospace', fontSize: '18px', fontWeight: 700, color: '#0284c7',
              marginBottom: '24px'
            }}>
              {confirmedBooking.bookingRef}
            </div>
            <div style={{ fontSize: '14px', color: '#334155', marginBottom: '24px' }}>
              Trip: <strong>{pkg.title}</strong> • Travelers: {confirmedBooking.numTravelers} • Amount: ₹{confirmedBooking.totalAmount?.toLocaleString()}
            </div>
            <button onClick={onClose} className="btn-primary-orange" style={{ width: '100%', justifyContent: 'center' }}>
              Done & View My Trips
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
              Reserve Your Tour
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
              {pkg.title} • {pkg.durationDays} Days / {pkg.durationNights} Nights
            </p>

            {error && !conflictInfo && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            {conflictInfo && (
              <div style={{
                background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '14px',
                padding: '16px', marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontWeight: 800, fontSize: '14px', marginBottom: '6px' }}>
                  <AlertTriangle size={18} /> Tour Schedule Conflict Detected
                </div>
                <p style={{ fontSize: '13px', color: '#92400e', marginBottom: '14px', lineHeight: 1.5 }}>
                  {conflictInfo.message}
                </p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleCancelConflictAndRebook}
                    disabled={cancellingConflict}
                    style={{
                      background: '#dc2626', color: '#fff', border: 'none', borderRadius: '10px',
                      padding: '10px 16px', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    <Trash2 size={14} />
                    {cancellingConflict ? 'Cancelling Old Tour...' : 'Cancel Previous Tour & Book This One'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { onClose(); navigate('/my-bookings'); }}
                    style={{
                      background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '10px',
                      padding: '10px 16px', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer'
                    }}
                  >
                    Manage in My Trips
                  </button>
                </div>
              </div>
            )}

            {/* Departure Selection */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                Select Departure Date
              </label>
              <select
                value={selectedDeparture}
                onChange={(e) => setSelectedDeparture(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '14px', fontWeight: 600, outline: 'none' }}
                required
              >
                {pkg.departures && pkg.departures.length > 0 ? (
                  pkg.departures.map((d) => (
                    <option key={d.departureId} value={d.departureId} disabled={d.availableSlots <= 0}>
                      {d.startDate} to {d.endDate} ({d.availableSlots} seats available)
                    </option>
                  ))
                ) : (
                  <option value="">No departures scheduled</option>
                )}
              </select>
            </div>

            {/* Number of Travelers */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                Number of Travelers
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={numTravelers}
                onChange={(e) => handleNumTravelersChange(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '14px', fontWeight: 600, outline: 'none' }}
              />
            </div>

            {/* Passenger Manifest */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '10px' }}>
                Traveler Details
              </label>
              {travelers.map((t, idx) => (
                <div key={idx} style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                    Traveler #{idx + 1}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Full Name as on ID"
                      value={t.fullName}
                      onChange={(e) => handleTravelerField(idx, 'fullName', e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Age"
                      min="1"
                      max="110"
                      value={t.age}
                      onChange={(e) => handleTravelerField(idx, 'age', parseInt(e.target.value) || 25)}
                      style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      required
                    />
                    <select
                      value={t.gender}
                      onChange={(e) => handleTravelerField(idx, 'gender', e.target.value)}
                      style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>

            {/* Simulated Payment */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
                Simulated Payment Method
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                {['CARD_SIMULATED', 'UPI_SIMULATED', 'NETBANKING_SIMULATED'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    style={{
                      padding: '10px', borderRadius: '10px', fontSize: '12px', fontWeight: 700,
                      border: paymentMethod === method ? '2px solid #0284c7' : '1px solid #cbd5e1',
                      background: paymentMethod === method ? '#e0f2fe' : '#ffffff',
                      color: paymentMethod === method ? '#0369a1' : '#475569',
                      cursor: 'pointer'
                    }}
                  >
                    {method.replace('_SIMULATED', '')}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Total Payable ({numTravelers} travelers)</div>
                <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
                  ₹{totalPrice.toLocaleString()}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '12.5px', fontWeight: 700 }}>
                <ShieldCheck size={16} /> Instant Lock
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary-orange"
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}
            >
              {loading ? 'Processing Reservation...' : `Confirm & Pay ₹${totalPrice.toLocaleString()}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

