import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import { PackageCard } from '../components/PackageCard';
import {
  Plus, LayoutGrid, List, ChevronDown, Check, X, ShieldAlert,
  Calendar, Users, DollarSign, Package, TrendingUp, Search, Eye, MapPin,
  Clock, CheckCircle, AlertTriangle
} from 'lucide-react';

export const OperatorDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from URL path
  const currentPath = location.pathname.replace(/\/$/, '');
  let activeTab = 'dashboard';
  if (currentPath === '/operator/bookings') {
    activeTab = 'bookings';
  } else if (currentPath === '/operator/packages') {
    activeTab = 'packages';
  } else if (currentPath === '/operator/explore') {
    activeTab = 'explore';
  } else {
    activeTab = 'dashboard';
  }

  const [packages, setPackages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(true);

  // New Package form state
  const [title, setTitle] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [durationDays, setDurationDays] = useState(3);
  const [durationNights, setDurationNights] = useState(2);
  const [basePrice, setBasePrice] = useState(3999);
  const [maxTravellers, setMaxTravellers] = useState(25);
  const [description, setDescription] = useState('');
  const [includedServices, setIncludedServices] = useState('Resort Stay, Daily Breakfast & Dinner, AC Sightseeing Cab, Entry Passes');
  const [excludedServices, setExcludedServices] = useState('Personal shopping, Airfare/Train tickets, Tips');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800');
  const [startDate, setStartDate] = useState('2026-12-01');
  const [endDate, setEndDate] = useState('2026-12-04');
  const [addLoading, setAddLoading] = useState(false);
  const [autoGenLoading, setAutoGenLoading] = useState(false);
  const [selectedBookingForModal, setSelectedBookingForModal] = useState(null);

  // Dynamic Day-Wise Itinerary Plan for new package
  const [itineraryDaysList, setItineraryDaysList] = useState([
    { dayNumber: 1, title: 'Arrival, Resort Check-in & Scenic Sunset', description: 'Station/Airport pickup transfer, resort check-in, orientation, and evening scenic stroll.' },
    { dayNumber: 2, title: 'Key Heritage & Nature Sightseeing Excursion', description: 'Full day excursion with private AC cab exploring top caves, viewpoints, and cultural spots.' },
    { dayNumber: 3, title: 'Morning Nature Walk, Souvenir Shopping & Departure', description: 'Early morning sunrise view, local tribal market shopping, and departure transfer.' },
  ]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pkgs, bks, dests] = await Promise.all([
        apiClient.get('/operator/packages'),
        apiClient.get('/operator/bookings'),
        apiClient.get('/destinations'),
      ]);
      setPackages(pkgs || []);
      setBookings(bks || []);
      setDestinations(dests || []);
      if (dests && dests.length > 0 && !destinationId) {
        setDestinationId(dests[0].destinationId);
      }
    } catch (err) {
      console.error('Error fetching operator dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoGenerateItinerary = async () => {
    setAutoGenLoading(true);
    try {
      const selectedDest = destinations.find(d => d.destinationId === parseInt(destinationId));
      const targetName = selectedDest ? selectedDest.name : 'India';
      const places = await apiClient.get(`/planner/places?destination=${encodeURIComponent(targetName)}`);

      const numDays = parseInt(durationDays) || 3;
      const generated = [];
      const placeNames = places && places.length > 0
        ? places.map(p => p.name)
        : ['Main Temple & Historical Shrines', 'Scenic Nature Waterfall & Caves', 'Valley Viewpoint', 'Local Handicrafts Market', 'Archaeological Museum'];

      for (let i = 1; i <= numDays; i++) {
        if (i === 1) {
          const p1 = placeNames[0] || 'City Gateway';
          generated.push({
            dayNumber: 1,
            title: `Arrival, Resort Check-in & ${p1}`,
            description: `Pickup transfer from arrival point and hotel check-in. Afternoon guided visit to ${p1} followed by evening orientation and dinner.`
          });
        } else if (i === numDays) {
          const pLast = placeNames[placeNames.length - 1] || 'Local Bazaar';
          generated.push({
            dayNumber: i,
            title: `Sunrise Views, ${pLast} & Departure Drop`,
            description: `Scenic morning sunrise viewpoint, authentic souvenir shopping at ${pLast}, followed by departure drop-off.`
          });
        } else {
          const pA = placeNames[(i - 1) % placeNames.length];
          const pB = placeNames[i % placeNames.length];
          generated.push({
            dayNumber: i,
            title: `${pA} & ${pB} Excursion`,
            description: `Full day guided excursion exploring ${pA} and ${pB} with traditional lunch halt and photography stops.`
          });
        }
      }
      setItineraryDaysList(generated);
      alert(`✨ Generated ${numDays}-Day Itinerary Plan based on authentic attractions in ${targetName}!`);
    } catch (err) {
      console.error('Error auto-generating itinerary:', err);
      alert('Could not auto-generate itinerary. You can still write or customize the days manually.');
    } finally {
      setAutoGenLoading(false);
    }
  };

  const handleCreatePackage = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      await apiClient.post('/operator/packages', {
        destinationId: parseInt(destinationId),
        title,
        description,
        durationDays: parseInt(durationDays),
        durationNights: parseInt(durationNights),
        basePricePerPerson: parseFloat(basePrice),
        maxTravellers: parseInt(maxTravellers),
        includedServices,
        excludedServices,
        imageUrl,
        itineraryDays: itineraryDaysList,
        departures: [
          { startDate, endDate, totalSlots: parseInt(maxTravellers) },
        ],
      });

      setIsAddModalOpen(false);
      setTitle('');
      setDescription('');
      fetchData();
      alert('Package created successfully! It is now submitted to the Admin for approval.');
      navigate('/operator/packages');
    } catch (err) {
      alert(err.message || 'Error creating package');
    } finally {
      setAddLoading(false);
    }
  };

  const filteredPackages = selectedCountry === 'All'
    ? packages
    : packages.filter((p) => p.destinationName?.toLowerCase().includes(selectedCountry.toLowerCase()));

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.bookingRef?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.packageTitle?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.userFullName?.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.userEmail?.toLowerCase().includes(bookingSearch.toLowerCase());
    const matchesStatus = bookingStatusFilter === 'ALL' || b.bookingStatus === bookingStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  // Computations for selected package
  const selectedPkgBookings = selectedPackage
    ? bookings.filter((b) => b.packageId === selectedPackage.packageId)
    : [];
  const selectedPkgRevenue = selectedPkgBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const selectedPkgSeats = selectedPkgBookings.reduce((sum, b) => sum + (b.numTravelers || 0), 0);

  return (
    <div className="gotrips-dashboard-layout">
      {/* Page Header & Navigation Bar */}
      <div className="gotrips-page-header">
        <div>
          <h1 className="gotrips-page-title" style={{ fontSize: '26px', fontWeight: 800, color: '#111827', margin: 0 }}>
            {activeTab === 'dashboard' && 'Operator Overview & Earnings'}
            {activeTab === 'bookings' && 'Customer Reservations'}
            {activeTab === 'packages' && 'Tour Packages Management'}
            {activeTab === 'explore' && 'Destination Explorer'}
          </h1>
          <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
            {activeTab === 'dashboard' && 'Monitor package earnings, customer reservations, and approval statuses'}
            {activeTab === 'bookings' && 'Track confirmed customer reservations, traveler manifests, and payments'}
            {activeTab === 'packages' && 'Manage your commercial tour itineraries, click any package to inspect booked customers'}
            {activeTab === 'explore' && 'Discover popular destinations and craft new packages'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/operator')}
            className={`gotrips-pill-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            style={{ border: '1px solid #d1d5db', cursor: 'pointer' }}
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('/operator/bookings')}
            className={`gotrips-pill-link ${activeTab === 'bookings' ? 'active' : ''}`}
            style={{ border: '1px solid #d1d5db', cursor: 'pointer' }}
          >
            Bookings ({bookings.length})
          </button>
          <button
            onClick={() => navigate('/operator/packages')}
            className={`gotrips-pill-link ${activeTab === 'packages' ? 'active' : ''}`}
            style={{ border: '1px solid #d1d5db', cursor: 'pointer' }}
          >
            Packages ({packages.length})
          </button>
          <button
            onClick={() => navigate('/operator/explore')}
            className={`gotrips-pill-link ${activeTab === 'explore' ? 'active' : ''}`}
            style={{ border: '1px solid #d1d5db', cursor: 'pointer' }}
          >
            Explore ({destinations.length})
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-gotrips-add"
            style={{ marginLeft: '6px' }}
          >
            <Plus size={16} /> New Package
          </button>
        </div>
      </div>

      {/* ---------------- 1. DASHBOARD OVERVIEW VIEW ---------------- */}
      {activeTab === 'dashboard' && (
        <div>
          {/* KPI Stat Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '32px' }}>
            <div style={{ background: '#ffffff', borderRadius: '18px', padding: '22px', border: '1px solid #e5e7eb', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>Total Packages Created</span>
                <span style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={18} />
                </span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#111827' }}>{packages.length}</div>
              <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>
                {packages.filter(p => p.isActive).length} Live • {packages.filter(p => !p.isActive).length} Pending Approval
              </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '18px', padding: '22px', border: '1px solid #e5e7eb', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>Total Customers Booked</span>
                <span style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={18} />
                </span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#111827' }}>{bookings.length}</div>
              <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>
                {bookings.reduce((sum, b) => sum + (b.numTravelers || 0), 0)} Total Passengers
              </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '18px', padding: '22px', border: '1px solid #e5e7eb', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>Total Money Earned</span>
                <span style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DollarSign size={18} />
                </span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#111827' }}>₹{totalRevenue.toLocaleString()}</div>
              <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>Total Package Earnings</div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '18px', padding: '22px', border: '1px solid #e5e7eb', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>Operator Status</span>
                <span style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fae8ff', color: '#a21caf', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={18} />
                </span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827' }}>Verified Active</div>
              <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>Commercial Tourism License</div>
            </div>
          </div>

          {/* List of Created Packages with Earnings & Customer Links */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e5e7eb', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827' }}>
                  Your Packages & Financial Performance
                </h3>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>
                  Click "View Customers" on any package to see the complete list of tourists who booked it
                </p>
              </div>
              <button onClick={() => navigate('/operator/packages')} className="btn-link" style={{ fontSize: '13px', color: '#0284c7' }}>
                Manage All Packages →
              </button>
            </div>

            {packages.length === 0 ? (
              <p style={{ color: '#6b7280', padding: '20px', textAlign: 'center' }}>No packages published yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#475569', fontWeight: 700 }}>
                      <th style={{ padding: '12px 16px' }}>Package Title</th>
                      <th style={{ padding: '12px 16px' }}>Destination</th>
                      <th style={{ padding: '12px 16px' }}>Price / Person</th>
                      <th style={{ padding: '12px 16px' }}>Booked Customers</th>
                      <th style={{ padding: '12px 16px' }}>Money Earned</th>
                      <th style={{ padding: '12px 16px' }}>Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packages.map((pkg) => {
                      const pkgBookings = bookings.filter((b) => b.packageId === pkg.packageId);
                      const pkgRev = pkgBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
                      const pkgSeats = pkgBookings.reduce((sum, b) => sum + (b.numTravelers || 0), 0);

                      return (
                        <tr key={pkg.packageId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>
                            {pkg.title}
                          </td>
                          <td style={{ padding: '14px 16px', color: '#475569' }}>
                            {pkg.destinationName}
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 700 }}>
                            ₹{pkg.basePricePerPerson?.toLocaleString()}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{ fontWeight: 800, color: '#0284c7' }}>{pkgBookings.length}</span> ({pkgSeats} seats)
                          </td>
                          <td style={{ padding: '14px 16px', fontWeight: 800, color: '#16a34a' }}>
                            ₹{pkgRev.toLocaleString()}
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span
                              style={{
                                fontSize: '11px',
                                fontWeight: 800,
                                padding: '3px 8px',
                                borderRadius: '9999px',
                                background: pkg.isActive ? '#dcfce7' : '#fef3c7',
                                color: pkg.isActive ? '#15803d' : '#b45309',
                              }}
                            >
                              {pkg.isActive ? 'Live on Portal' : 'Pending Approval'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                            <button
                              onClick={() => setSelectedPackage(pkg)}
                              style={{
                                padding: '6px 14px',
                                borderRadius: '8px',
                                background: '#0284c7',
                                color: '#ffffff',
                                border: 'none',
                                fontWeight: 700,
                                fontSize: '12px',
                                cursor: 'pointer',
                              }}
                            >
                              View Customers ({pkgBookings.length})
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- 2. BOOKINGS VIEW ---------------- */}
      {activeTab === 'bookings' && (
        <div style={{ background: '#ffffff', borderRadius: '20px', padding: '28px', border: '1px solid #e5e7eb' }}>
          {/* Controls row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div style={{ position: 'relative', minWidth: '280px', flex: 1, maxWidth: '420px' }}>
              <Search size={16} color="#9ca3af" style={{ position: 'absolute', top: '12px', left: '14px' }} />
              <input
                type="text"
                placeholder="Search booking ref, customer, package..."
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                style={{ width: '100%', padding: '10px 14px 10px 40px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '13.5px', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setBookingStatusFilter(st)}
                  className={`gotrips-pill-link ${bookingStatusFilter === st ? 'active' : ''}`}
                  style={{ fontSize: '12px', padding: '6px 14px', border: '1px solid #e5e7eb', cursor: 'pointer' }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Loading bookings...</div>
          ) : filteredBookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>
              <p>No customer reservations matching your search.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredBookings.map((b) => (
                <div
                  key={b.bookingId}
                  style={{
                    background: '#f9fafb',
                    padding: '20px',
                    borderRadius: '16px',
                    border: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0284c7', fontSize: '13.5px' }}>
                        {b.bookingRef}
                      </span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          background: b.bookingStatus === 'CONFIRMED' ? '#dcfce7' : '#fef3c7',
                          color: b.bookingStatus === 'CONFIRMED' ? '#15803d' : '#b45309',
                          padding: '2px 10px',
                          borderRadius: '9999px',
                        }}
                      >
                        {b.bookingStatus}
                      </span>
                    </div>

                    <div style={{ fontSize: '17px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
                      {b.packageTitle}
                    </div>

                    <div style={{ fontSize: '13.5px', color: '#4b5563', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <span>👤 Customer: <strong>{b.userFullName}</strong> ({b.userEmail})</span>
                      <span>📞 {b.userPhone || '+91 9876543210'}</span>
                      <span>👥 {b.numTravelers} traveler(s)</span>
                      <span>📅 {b.startDate} to {b.endDate}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#111827' }}>
                      ₹{b.totalAmount?.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, marginBottom: '8px' }}>Payment Received</div>
                    <button
                      onClick={() => setSelectedBookingForModal(b)}
                      style={{
                        padding: '6px 14px', borderRadius: '8px', background: '#0284c7', color: '#fff',
                        border: 'none', fontWeight: 700, fontSize: '12px', cursor: 'pointer'
                      }}
                    >
                      View Tourist Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------- 3. PACKAGES VIEW ---------------- */}
      {activeTab === 'packages' && (
        <>
          <div className="gotrips-subbar">
            <div>
              <div className="gotrips-subbar-title">
                Total Packages Created ({filteredPackages.length})
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Click on any package card to view its booked customer manifest and earnings
              </div>
            </div>

            <div className="gotrips-filter-group">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="gotrips-select-country"
              >
                <option value="All">All Locations</option>
                <option value="India">India</option>
                <option value="Visakhapatnam">Visakhapatnam</option>
                <option value="Araku Valley">Araku Valley</option>
                <option value="Amaravathi">Amaravathi</option>
                <option value="Goa">Goa</option>
                <option value="Jaipur">Jaipur</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#6b7280' }}>Loading packages...</div>
          ) : filteredPackages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '20px' }}>
              <p style={{ color: '#6b7280', marginBottom: '14px' }}>No packages found under this filter.</p>
              <button onClick={() => setIsAddModalOpen(true)} className="btn-gotrips-add" style={{ margin: '0 auto' }}>
                <Plus size={16} /> Create Your First Package
              </button>
            </div>
          ) : (
            <div className="gotrips-packages-grid">
              {filteredPackages.map((pkg) => (
                <PackageCard
                  key={pkg.packageId}
                  pkg={pkg}
                  isOperatorView
                  onSelect={(p) => setSelectedPackage(p)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ---------------- 4. EXPLORE VIEW ---------------- */}
      {activeTab === 'explore' && (
        <div style={{ background: '#ffffff', borderRadius: '20px', padding: '28px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827' }}>
                Popular Destinations for Tour Operators
              </h2>
              <p style={{ fontSize: '13.5px', color: '#6b7280' }}>
                Click any destination to pre-fill and launch a new commercial package
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {destinations.map((d) => (
              <div
                key={d.destinationId}
                style={{
                  borderRadius: '16px',
                  border: '1px solid #e5e7eb',
                  overflow: 'hidden',
                  background: '#f9fafb',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <img
                  src={d.imageUrl || d.thumbnailUrl}
                  alt={d.name}
                  style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                />
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                      <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#111827' }}>{d.name}</h3>
                      <span style={{ fontSize: '12px', color: '#6b7280' }}>{d.country}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.5, marginBottom: '12px' }}>
                      {d.description?.slice(0, 100)}...
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setDestinationId(d.destinationId);
                      setTitle(`${d.name} Special Tour Package`);
                      setIsAddModalOpen(true);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '10px',
                      background: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <Plus size={14} /> Add Package for {d.name}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- 5. PACKAGE BOOKING & CUSTOMER MANIFEST MODAL ---------------- */}
      {selectedPackage && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(17, 24, 39, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', maxWidth: '780px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '3px 10px',
                      borderRadius: '9999px',
                      background: selectedPackage.isActive ? '#dcfce7' : '#fef3c7',
                      color: selectedPackage.isActive ? '#15803d' : '#b45309',
                    }}
                  >
                    {selectedPackage.isActive ? '● Live on Tourist Portal' : '⏳ Pending Admin Approval'}
                  </span>
                  <span style={{ fontSize: '13px', color: '#64748b' }}>
                    {selectedPackage.destinationName}
                  </span>
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#111827' }}>
                  {selectedPackage.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedPackage(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Package KPI Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Price / Person</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                  ₹{selectedPackage.basePricePerPerson?.toLocaleString()}
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Total Customers Booked</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0284c7' }}>
                  {selectedPkgBookings.length} ({selectedPkgSeats} seats)
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Total Revenue from this Package</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#16a34a' }}>
                  ₹{selectedPkgRevenue.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Customers Manifest Table */}
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginBottom: '14px' }}>
              Customers Who Booked This Package ({selectedPkgBookings.length})
            </h3>

            {selectedPkgBookings.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', background: '#f9fafb', borderRadius: '14px', color: '#64748b' }}>
                No reservations placed for this package yet. Once tourists book on the consumer portal, their names, contact info, and payments will appear here.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedPkgBookings.map((b) => (
                  <div key={b.bookingId} style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
                        👤 {b.userFullName}
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: 800, color: '#16a34a' }}>
                        ₹{b.totalAmount?.toLocaleString()}
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', color: '#4b5563', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <span>✉️ {b.userEmail}</span>
                      <span>📞 {b.userPhone || '+91 9876543210'}</span>
                      <span>👥 {b.numTravelers} Passenger(s)</span>
                      <span>📅 Dates: {b.startDate} to {b.endDate}</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0284c7' }}>Ref: {b.bookingRef}</span>
                    </div>

                    {b.travelers && b.travelers.length > 0 && (
                      <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #e2e8f0', fontSize: '12px', color: '#64748b' }}>
                        <strong>Passenger Manifest:</strong> {b.travelers.map(t => `${t.fullName} (${t.age} yrs, ${t.gender})`).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                onClick={() => setSelectedPackage(null)}
                style={{ padding: '10px 20px', borderRadius: '10px', background: '#f1f5f9', border: '1px solid #cbd5e1', fontWeight: 700, cursor: 'pointer' }}
              >
                Close Manifest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Package Modal */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(17, 24, 39, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', maxWidth: '640px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827' }}>Create New Travel Package</h2>
                <p style={{ fontSize: '12px', color: '#64748b' }}>New packages will be submitted to the Admin for approval before going live to tourists</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleCreatePackage} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', marginBottom: '4px' }}>Package Title</label>
                <input type="text" placeholder="e.g. Scottish Highlands Adventure" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #d1d5db', fontSize: '14px' }} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', marginBottom: '4px' }}>Destination</label>
                  <select value={destinationId} onChange={(e) => setDestinationId(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #d1d5db', fontSize: '13.5px' }} required>
                    {destinations.map((d) => <option key={d.destinationId} value={d.destinationId}>{d.name} ({d.country})</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', marginBottom: '4px' }}>Price Per Person (₹ / $)</label>
                  <input type="number" min="500" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #d1d5db', fontSize: '14px' }} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', marginBottom: '4px' }}>Duration Days</label>
                  <input type="number" min="1" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #d1d5db' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', marginBottom: '4px' }}>Nights</label>
                  <input type="number" min="0" value={durationNights} onChange={(e) => setDurationNights(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #d1d5db' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', marginBottom: '4px' }}>Max Capacity</label>
                  <input type="number" min="1" value={maxTravellers} onChange={(e) => setMaxTravellers(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #d1d5db' }} required />
                </div>
              </div>

              {/* Automatic Itinerary Generator */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#0f172a' }}>
                      Day-Wise Itinerary Plan ({itineraryDaysList.length} Days)
                    </label>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                      Auto-generate itinerary from authentic tourist spots or customize days
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoGenerateItinerary}
                    disabled={autoGenLoading}
                    style={{
                      padding: '6px 12px', background: '#0284c7', color: '#fff', border: 'none',
                      borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '4px'
                    }}
                  >
                    {autoGenLoading ? 'Generating...' : '✨ Auto-Generate Itinerary'}
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                  {itineraryDaysList.map((day, idx) => (
                    <div key={idx} style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12.5px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 800, color: '#0284c7' }}>Day {day.dayNumber}:</span>
                        <input
                          type="text"
                          value={day.title}
                          onChange={(e) => {
                            const updated = [...itineraryDaysList];
                            updated[idx].title = e.target.value;
                            setItineraryDaysList(updated);
                          }}
                          style={{ flex: 1, padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12.5px', fontWeight: 700 }}
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={day.description}
                        onChange={(e) => {
                          const updated = [...itineraryDaysList];
                          updated[idx].description = e.target.value;
                          setItineraryDaysList(updated);
                        }}
                        style={{ width: '100%', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', marginBottom: '4px' }}>Description</label>
                <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Overview of the tour itinerary..." style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #d1d5db', fontSize: '13.5px' }} required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', marginBottom: '4px' }}>Cover Image URL</label>
                <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #d1d5db', fontSize: '13px' }} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', marginBottom: '4px' }}>First Departure Date</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #d1d5db' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', marginBottom: '4px' }}>Return Date</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #d1d5db' }} required />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '14px' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-link">Cancel</button>
                <button type="submit" disabled={addLoading} className="btn-primary-orange">
                  {addLoading ? 'Submitting...' : 'Submit Package for Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* View Individual Tourist Booking Details Modal */}
      {selectedBookingForModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(17, 24, 39, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', maxWidth: '580px', width: '100%', padding: '30px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Booking & Passenger Manifest
                </h3>
                <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#0284c7', fontWeight: 800 }}>
                  Ref: {selectedBookingForModal.bookingRef}
                </span>
              </div>
              <button onClick={() => setSelectedBookingForModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13.5px' }}>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '16px', marginBottom: '4px' }}>
                  {selectedBookingForModal.packageTitle}
                </div>
                <div style={{ color: '#64748b', fontSize: '12.5px' }}>
                  📅 Tour Dates: <strong>{selectedBookingForModal.startDate}</strong> to <strong>{selectedBookingForModal.endDate}</strong>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>PRIMARY TOURIST</div>
                  <div style={{ fontWeight: 800, color: '#0f172a' }}>{selectedBookingForModal.userFullName}</div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>{selectedBookingForModal.userEmail}</div>
                  <div style={{ fontSize: '12px', color: '#475569' }}>{selectedBookingForModal.userPhone || '+91 9876543210'}</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>PAYMENT & STATUS</div>
                  <div style={{ fontWeight: 800, color: '#16a34a', fontSize: '18px' }}>₹{selectedBookingForModal.totalAmount?.toLocaleString()}</div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#0284c7' }}>{selectedBookingForModal.bookingStatus}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{selectedBookingForModal.numTravelers} Passenger(s)</div>
                </div>
              </div>

              {selectedBookingForModal.travelers && selectedBookingForModal.travelers.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                    Passenger Names & Identification Details
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedBookingForModal.travelers.map((t, idx) => (
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
                onClick={() => setSelectedBookingForModal(null)}
                style={{ padding: '8px 18px', borderRadius: '10px', background: '#f1f5f9', border: '1px solid #cbd5e1', fontWeight: 700, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
