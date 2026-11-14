import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import {
  ShieldCheck, Users, Briefcase, DollarSign, CheckCircle2, XCircle,
  AlertCircle, Package, TrendingUp, Calendar, Search, Filter, Eye, X,
  Clock, Check, ChevronRight, BarChart3, AlertTriangle
} from 'lucide-react';

export const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname.replace(/\/$/, '');
  let urlTab = 'analytics';
  if (currentPath === '/admin/packages') urlTab = 'packages';
  else if (currentPath === '/admin/bookings') urlTab = 'bookings';
  else if (currentPath === '/admin/operators') urlTab = 'operators';
  else if (currentPath === '/admin/users') urlTab = 'users';

  const [activeTab, setActiveTab] = useState(urlTab);

  useEffect(() => {
    setActiveTab(urlTab);
  }, [urlTab]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'analytics') navigate('/admin');
    else navigate(`/admin/${tabId}`);
  };

  const [metrics, setMetrics] = useState(null);
  const [operators, setOperators] = useState([]);
  const [packages, setPackages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  // Selected Booking Modal State
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Search & Filter state for bookings
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingFilter, setBookingFilter] = useState('ALL');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [m, o, p, b, u] = await Promise.all([
        apiClient.get('/admin/dashboard'),
        apiClient.get('/admin/operators'),
        apiClient.get('/admin/packages'),
        apiClient.get('/admin/bookings'),
        apiClient.get('/admin/users'),
      ]);
      setMetrics(m);
      setOperators(o || []);
      setPackages(p || []);
      setBookings(b || []);
      setUsers(u || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOperatorApproval = async (operatorId, approve) => {
    try {
      await apiClient.put(`/admin/operators/${operatorId}/approval`, {
        approve,
        adminNotes: approve ? 'Verified all licenses & identity' : 'Suspended by administrator',
      });
      setActionMsg(`Operator ID #${operatorId} status updated to ${approve ? 'Approved (Active)' : 'Suspended'}.`);
      fetchData();
    } catch (err) {
      alert(err.message || 'Error updating operator approval status');
    }
  };

  const handlePackageApproval = async (packageId, approve) => {
    let rejectionNotes = null;
    if (!approve) {
      const reason = window.prompt('Enter reason for rejecting this tour package:', 'Package details, safety terms, or itinerary require revision.');
      if (reason === null) return; // User cancelled prompt
      rejectionNotes = reason;
    }

    try {
      await apiClient.put(`/admin/packages/${packageId}/approval`, {
        approve,
        rejectionNotes,
      });
      setActionMsg(`Package ID #${packageId} has been ${approve ? 'Approved & Published to Tourist Portal' : 'Rejected / Hidden from Tourist Portal'}.`);
      fetchData();
    } catch (err) {
      alert(err.message || 'Error updating package status');
    }
  };

  const touristsList = users.filter((u) => u.role === 'TOURIST');
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.bookingRef?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.packageTitle?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.userFullName?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.userEmail?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.operatorName?.toLowerCase().includes(bookingSearch.toLowerCase());
    const matchesStatus = bookingFilter === 'ALL' || b.bookingStatus === bookingFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ maxWidth: '1280px', margin: '40px auto', padding: '0 24px' }}>
      {/* Admin Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0284c7', background: '#e0f2fe', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 800, marginBottom: '8px' }}>
            <ShieldCheck size={14} /> PLATFORM ADMINISTRATOR CONTROL CENTER
          </div>
          <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Administrator Dashboard
          </h1>
          <p style={{ color: '#64748b', fontSize: '14.5px', marginTop: '4px' }}>
            Customer reservations, operator package moderation, licensing approvals, and platform analytics.
          </p>
        </div>

        {/* Global Refresh Button */}
        <button
          onClick={fetchData}
          style={{
            padding: '10px 18px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px',
            fontSize: '13px', fontWeight: 700, color: '#334155', cursor: 'pointer'
          }}
        >
          ↻ Refresh Data
        </button>
      </div>

      {actionMsg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '12px 18px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} /> {actionMsg}
        </div>
      )}

      {/* Navigation Pills Bar */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '28px', overflowX: 'auto' }}>
        {[
          { id: 'analytics', label: '📊 Overview & Analytics' },
          { id: 'packages', label: `📦 Package Approvals (${packages.filter(p => !p.isActive).length} Pending)` },
          { id: 'bookings', label: `👥 Customer Bookings (${bookings.length})` },
          { id: 'operators', label: `🏢 Operators (${operators.length})` },
          { id: 'users', label: `👤 Tourists (${touristsList.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === tab.id ? '#0f172a' : '#f1f5f9',
              color: activeTab === tab.id ? '#ffffff' : '#475569',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 1. OVERVIEW & ANALYTICS TAB                                               */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div>
          {/* Key Metric Cards */}
          {metrics && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              <div style={{ background: '#ffffff', padding: '22px', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>Total Tourists</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0284c7' }}>{metrics.totalTourists}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Registered Customers</div>
              </div>

              <div style={{ background: '#ffffff', padding: '22px', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>Travel Operators</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#f59e0b' }}>{metrics.totalOperators}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{metrics.pendingApprovals} Pending License Review</div>
              </div>

              <div style={{ background: '#ffffff', padding: '22px', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>Tour Packages</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#10b981' }}>{metrics.totalPackages}</div>
                <div style={{ fontSize: '11px', color: '#10b981', marginTop: '2px' }}>{metrics.activePackages} Active • {metrics.pendingPackages} Pending</div>
              </div>

              <div style={{ background: '#ffffff', padding: '22px', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>Customer Bookings</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#6366f1' }}>{metrics.totalBookings}</div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{metrics.confirmedBookings} Confirmed</div>
              </div>

              <div style={{ background: '#ffffff', padding: '22px', borderRadius: '18px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 600 }}>Platform Revenue</div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a' }}>₹{metrics.totalRevenue?.toLocaleString()}</div>
                <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '2px' }}>Total Package GMV</div>
              </div>
            </div>
          )}

          {/* Analytics Deep-Dive: Operator Performance & Top Packages */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px', marginBottom: '32px' }}>
            {/* Operator Performance Ranking */}
            <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Operator Performance & Revenue Analytics
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>By Total GMV</span>
              </div>

              {metrics?.operatorStats && metrics.operatorStats.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {metrics.operatorStats.map((op, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14.5px' }}>
                          {op.companyName || op.operatorName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {op.packageCount} Package(s) • {op.totalBookings} Total Booking(s)
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#16a34a' }}>
                          ₹{op.totalEarned?.toLocaleString()}
                        </div>
                        <span style={{ fontSize: '10.5px', fontWeight: 800, color: op.isVerified ? '#15803d' : '#b45309' }}>
                          {op.isVerified ? '✓ Verified' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#64748b', fontSize: '13px' }}>No operator sales data yet.</p>
              )}
            </div>

            {/* Top Booked Packages Breakdown */}
            <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Top Packages by Customer Volume
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Most Booked</span>
              </div>

              {metrics?.topPackages && metrics.topPackages.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {metrics.topPackages.map((p, idx) => (
                    <div key={idx} style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ maxWidth: '65%' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.title}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          Base Rate: ₹{p.price?.toLocaleString()} / person
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#0284c7' }}>
                          {p.bookingsCount} Bookings
                        </div>
                        <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700 }}>
                          ₹{p.revenue?.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#64748b', fontSize: '13px' }}>No booking statistics available yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. OPERATOR PACKAGE APPROVALS QUEUE                                       */}
      {/* ========================================================================= */}
      {activeTab === 'packages' && (
        <div style={{ background: '#ffffff', borderRadius: '24px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Operator Tour Packages Moderation Queue ({packages.length})
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                Review package itineraries submitted by operators. Accept to publish on the tourist portal or reject with reason notes.
              </p>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 800, padding: '4px 12px', borderRadius: '9999px', background: '#eff6ff', color: '#1d4ed8' }}>
              {packages.filter(p => !p.isActive).length} Pending Review
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {packages.map((pkg) => (
              <div
                key={pkg.packageId}
                style={{
                  background: pkg.isActive ? '#ffffff' : '#fffbeb',
                  padding: '20px',
                  borderRadius: '16px',
                  border: pkg.isActive ? '1px solid #e2e8f0' : '1.5px solid #fde68a',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 800,
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        background: pkg.isActive ? '#dcfce7' : '#fee2e2',
                        color: pkg.isActive ? '#15803d' : '#b91c1c',
                      }}
                    >
                      {pkg.isActive ? '● Live on Tourist Portal' : '⏳ Pending / Rejected'}
                    </span>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>
                      {pkg.destinationName} • {pkg.durationDays} Days / {pkg.durationNights} Nights
                    </span>
                  </div>

                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
                    {pkg.title}
                  </div>

                  <div style={{ fontSize: '13px', color: '#4b5563', display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '6px' }}>
                    <span>🏢 Operator: <strong>{pkg.companyName || pkg.operatorName}</strong> ({pkg.operatorEmail})</span>
                    <span>💰 Price: <strong>₹{pkg.basePricePerPerson?.toLocaleString()}</strong></span>
                    <span>👥 Capacity: {pkg.maxTravellers} slots</span>
                  </div>

                  {pkg.rejectionNotes && (
                    <div style={{ fontSize: '12px', color: '#b91c1c', background: '#fef2f2', padding: '6px 12px', borderRadius: '8px', marginTop: '6px' }}>
                      ⚠️ <strong>Rejection Reason:</strong> {pkg.rejectionNotes}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {!pkg.isActive ? (
                    <button
                      onClick={() => handlePackageApproval(pkg.packageId, true)}
                      style={{
                        background: '#10b981', color: '#ffffff', border: 'none', padding: '10px 18px',
                        borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px'
                      }}
                    >
                      <CheckCircle2 size={16} /> Accept & Publish
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePackageApproval(pkg.packageId, false)}
                      style={{
                        background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '10px 18px',
                        borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '6px'
                      }}
                    >
                      <XCircle size={16} /> Reject / Unpublish
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CUSTOMER BOOKINGS TAB                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'bookings' && (
        <div style={{ background: '#ffffff', borderRadius: '24px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Customers Who Booked Packages ({filteredBookings.length})
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                Complete list of tourists who reserved tour packages across all travel operators.
              </p>
            </div>

            {/* Search & Status Filter */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search tourist name, ref, package..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                style={{ padding: '8px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px', minWidth: '240px' }}
              />
              <select
                value={bookingFilter}
                onChange={(e) => setBookingFilter(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
              >
                <option value="ALL">All Status</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {filteredBookings.length === 0 ? (
            <p style={{ color: '#64748b', padding: '30px', textAlign: 'center' }}>No customer bookings found.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
                    <th style={{ padding: '12px 14px' }}>Booking Ref</th>
                    <th style={{ padding: '12px 14px' }}>Tourist Customer</th>
                    <th style={{ padding: '12px 14px' }}>Package Title</th>
                    <th style={{ padding: '12px 14px' }}>Operator</th>
                    <th style={{ padding: '12px 14px' }}>Travel Dates</th>
                    <th style={{ padding: '12px 14px' }}>Travelers</th>
                    <th style={{ padding: '12px 14px' }}>Total Amount</th>
                    <th style={{ padding: '12px 14px' }}>Status</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((b) => (
                    <tr key={b.bookingId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '14px', fontFamily: 'monospace', fontWeight: 800, color: '#0284c7' }}>
                        {b.bookingRef}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{b.userFullName}</div>
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>{b.userEmail}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{b.userPhone || '+91 9876543210'}</div>
                      </td>
                      <td style={{ padding: '14px', fontWeight: 700, color: '#0f172a', maxWidth: '220px' }}>
                        {b.packageTitle}
                      </td>
                      <td style={{ padding: '14px', color: '#475569' }}>
                        <strong>{b.operatorCompany || b.operatorName || 'Partner'}</strong>
                      </td>
                      <td style={{ padding: '14px', color: '#475569', fontSize: '12.5px' }}>
                        {b.startDate} to {b.endDate}
                      </td>
                      <td style={{ padding: '14px', fontWeight: 700 }}>
                        {b.numTravelers} Person(s)
                      </td>
                      <td style={{ padding: '14px', fontWeight: 800, color: '#16a34a' }}>
                        ₹{b.totalAmount?.toLocaleString()}
                      </td>
                      <td style={{ padding: '14px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            background: b.bookingStatus === 'CONFIRMED' ? '#dcfce7' : '#fee2e2',
                            color: b.bookingStatus === 'CONFIRMED' ? '#15803d' : '#b91c1c',
                          }}
                        >
                          {b.bookingStatus}
                        </span>
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedBooking(b)}
                          style={{
                            padding: '6px 12px', background: '#0284c7', color: '#ffffff',
                            border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer'
                          }}
                        >
                          View Manifest
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. OPERATORS MANAGEMENT TAB                                              */}
      {/* ========================================================================= */}
      {activeTab === 'operators' && (
        <div style={{ background: '#ffffff', borderRadius: '24px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>
            Registered Travel Operators ({operators.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {operators.map((op) => (
              <div key={op.userId} style={{ background: '#f8fafc', padding: '18px 22px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>{op.companyName || op.fullName}</span>
                    <span style={{
                      fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '9999px',
                      background: op.status === 'ACTIVE' ? '#dcfce7' : '#fef3c7',
                      color: op.status === 'ACTIVE' ? '#15803d' : '#b45309'
                    }}>
                      {op.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#64748b' }}>
                    License: <strong>{op.licenseNumber || 'LIC-VERIFIED'}</strong> • Contact: {op.phone} ({op.email}) • {op.yearsInBusiness || 1} yrs in business
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {op.status !== 'ACTIVE' ? (
                    <button
                      onClick={() => handleOperatorApproval(op.userId, true)}
                      style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Approve Operator
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOperatorApproval(op.userId, false)}
                      style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Suspend
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. REGISTERED CUSTOMERS (TOURISTS) TAB                                    */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div style={{ background: '#ffffff', borderRadius: '24px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '20px' }}>
            Registered Tourists & Customers ({touristsList.length})
          </h2>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '12px' }}>User ID</th>
                  <th style={{ padding: '12px' }}>Customer Name</th>
                  <th style={{ padding: '12px' }}>Email Address</th>
                  <th style={{ padding: '12px' }}>Phone Number</th>
                  <th style={{ padding: '12px' }}>Account Status</th>
                </tr>
              </thead>
              <tbody>
                {touristsList.map((u) => (
                  <tr key={u.userId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px', fontFamily: 'monospace' }}>#{u.userId}</td>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#0f172a' }}>{u.fullName}</td>
                    <td style={{ padding: '12px', color: '#475569' }}>{u.email}</td>
                    <td style={{ padding: '12px', color: '#475569' }}>{u.phone || 'N/A'}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '9999px',
                        background: u.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2',
                        color: u.status === 'ACTIVE' ? '#15803d' : '#b91c1c'
                      }}>
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PASSENGER MANIFEST MODAL (Inspect traveler details for any booking)       */}
      {/* ========================================================================= */}
      {selectedBooking && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(17, 24, 39, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', maxWidth: '580px', width: '100%', padding: '30px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Customer Booking & Passenger Manifest
                </h3>
                <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#0284c7', fontWeight: 800 }}>
                  Reference: {selectedBooking.bookingRef}
                </span>
              </div>
              <button onClick={() => setSelectedBooking(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px' }}>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '16px', marginBottom: '4px' }}>
                  {selectedBooking.packageTitle}
                </div>
                <div style={{ color: '#64748b', fontSize: '12.5px' }}>
                  🏢 Operator: <strong>{selectedBooking.operatorCompany || selectedBooking.operatorName}</strong> • Dates: <strong>{selectedBooking.startDate}</strong> to <strong>{selectedBooking.endDate}</strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>CUSTOMER CONTACT</div>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>{selectedBooking.userFullName}</div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>{selectedBooking.userEmail}</div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>{selectedBooking.userPhone || '+91 9876543210'}</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>PAYMENT DETAILS</div>
                  <div style={{ fontWeight: 800, color: '#16a34a', fontSize: '18px' }}>₹{selectedBooking.totalAmount?.toLocaleString()}</div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#0284c7' }}>{selectedBooking.bookingStatus}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{selectedBooking.numTravelers} Passenger(s)</div>
                </div>
              </div>

              {selectedBooking.travelers && selectedBooking.travelers.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                    Individual Passenger Manifest
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedBooking.travelers.map((t, idx) => (
                      <div key={idx} style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>{t.fullName}</strong>
                          <span style={{ color: '#64748b', marginLeft: '6px' }}>({t.age} yrs, {t.gender})</span>
                        </div>
                        <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                          {t.idProofType}: {t.idProofNumber}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setSelectedBooking(null)}
                style={{ padding: '8px 18px', borderRadius: '10px', background: '#f1f5f9', border: '1px solid #cbd5e1', fontWeight: 700, cursor: 'pointer' }}
              >
                Close Manifest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
