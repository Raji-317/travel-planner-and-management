import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles, MapPin, Calendar, Users, DollarSign, Compass, Clock,
  ArrowRight, ShieldCheck, AlertCircle, Save, Printer, RefreshCw, Car, Check, Train,
  Plus, CheckSquare, Square
} from 'lucide-react';

const POPULAR_INDIA_DESTINATIONS = [
  { name: 'Araku Valley', state: 'Andhra Pradesh', tag: 'Borra Caves, Coffee Hills & Waterfalls' },
  { name: 'Amaravathi', state: 'Andhra Pradesh', tag: 'Dhyana Buddha & Krishna River Heritage' },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', tag: 'Coastal Beaches & INS Kursura Museum' },
  { name: 'Bhimavaram', state: 'Andhra Pradesh', tag: 'Pancharama Kshetra & Canals' },
  { name: 'Tirupati', state: 'Andhra Pradesh', tag: 'Tirumala Balaji & Waterfalls' },
  { name: 'Goa', state: 'Goa', tag: 'Golden Beaches & Portuguese Forts' },
  { name: 'Jaipur', state: 'Rajasthan', tag: 'Royal Forts & Palaces' },
  { name: 'Varanasi', state: 'Uttar Pradesh', tag: 'Ganga Aarti & Kashi Vishwanath' },
  { name: 'Agra', state: 'Uttar Pradesh', tag: 'Taj Mahal & Mughal Marvels' },
  { name: 'Manali', state: 'Himachal Pradesh', tag: 'Himalayan Snow Valleys & Solang' },
  { name: 'Kochi', state: 'Kerala', tag: 'Fort Kochi & Backwaters' },
  { name: 'Delhi', state: 'NCR', tag: 'Historic Monuments & Bazaars' },
  { name: 'Amritsar', state: 'Punjab', tag: 'Golden Temple & Wagah Border' },
  { name: 'Ooty', state: 'Tamil Nadu', tag: 'Nilgiri Toy Train & Tea Hills' },
  { name: 'Udaipur', state: 'Rajasthan', tag: 'City of Lakes & Palaces' },
];

export const SmartPlannerPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [startingLocation, setStartingLocation] = useState('Bhimavaram');
  const [destinationName, setDestinationName] = useState('Visakhapatnam');
  const [customDestination, setCustomDestination] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  const [travelDays, setTravelDays] = useState(3);
  const [numTravelers, setNumTravelers] = useState(2);
  const [totalBudget, setTotalBudget] = useState(10000);
  const [travelPace, setTravelPace] = useState('BALANCED');
  const [preferredTransport, setPreferredTransport] = useState('TRAIN');
  const [selectedInterests, setSelectedInterests] = useState(['Beach', 'Nature', 'Heritage']);

  // Available attractions in the chosen destination
  const [availablePlaces, setAvailablePlaces] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [customPlaceInput, setCustomPlaceInput] = useState('');
  const [placesLoading, setPlacesLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const interestOptions = [
    { label: 'Beaches & Coastal', value: 'Beach' },
    { label: 'Nature & Hills', value: 'Nature' },
    { label: 'Heritage & Forts', value: 'Heritage' },
    { label: 'Religious & Shrines', value: 'Religious' },
    { label: 'Adventure Sports', value: 'Adventure' },
    { label: 'Shopping & Bazaars', value: 'Shopping' },
    { label: 'Food & Culinary', value: 'Food' },
    { label: 'Relaxation & Scenic', value: 'Relaxation' },
  ];

  // Read destination from URL parameters (e.g. from DestinationCard or DestinationDetail click)
  useEffect(() => {
    const destParam = searchParams.get('destination') || searchParams.get('city') || searchParams.get('name');
    const destIdParam = searchParams.get('destinationId') || searchParams.get('id');

    if (destParam && destParam.trim()) {
      const cleanParam = destParam.trim();
      const match = POPULAR_INDIA_DESTINATIONS.find(
        (d) => d.name.toLowerCase() === cleanParam.toLowerCase() ||
               cleanParam.toLowerCase().includes(d.name.toLowerCase()) ||
               d.name.toLowerCase().includes(cleanParam.toLowerCase())
      );
      if (match) {
        setDestinationName(match.name);
        setIsCustomMode(false);
      } else {
        setCustomDestination(cleanParam);
        setIsCustomMode(true);
      }
    } else if (destIdParam) {
      const idNum = parseInt(destIdParam);
      apiClient.get(`/destinations/${idNum}`).then((dest) => {
        if (dest && dest.name) {
          const match = POPULAR_INDIA_DESTINATIONS.find(
            (d) => d.name.toLowerCase() === dest.name.toLowerCase()
          );
          if (match) {
            setDestinationName(match.name);
            setIsCustomMode(false);
          } else {
            setCustomDestination(dest.name);
            setIsCustomMode(true);
          }
        }
      }).catch((err) => {
        console.warn('Could not pre-fetch destination by ID:', err);
      });
    }
  }, [searchParams]);

  // Fetch places whenever destination changes
  useEffect(() => {
    const target = isCustomMode ? customDestination : destinationName;
    if (!target || target.trim().length < 2) return;

    const fetchPlaces = async () => {
      setPlacesLoading(true);
      try {
        const places = await apiClient.get(`/planner/places?destination=${encodeURIComponent(target.trim())}`);
        if (places && places.length > 0) {
          setAvailablePlaces(places);
          // By default, select all available places so the optimizer can sequence them
          setSelectedPlaces(places.map(p => p.name));
        } else {
          setAvailablePlaces([]);
        }
      } catch (err) {
        console.error('Error fetching places:', err);
      } finally {
        setPlacesLoading(false);
      }
    };

    fetchPlaces();
  }, [destinationName, customDestination, isCustomMode]);

  const toggleInterest = (val) => {
    if (selectedInterests.includes(val)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== val));
    } else {
      setSelectedInterests([...selectedInterests, val]);
    }
  };

  const togglePlaceSelection = (placeName) => {
    if (selectedPlaces.includes(placeName)) {
      setSelectedPlaces(selectedPlaces.filter(p => p !== placeName));
    } else {
      setSelectedPlaces([...selectedPlaces, placeName]);
    }
  };

  const handleSelectAllPlaces = () => {
    setSelectedPlaces(availablePlaces.map(p => p.name));
  };

  const handleClearAllPlaces = () => {
    setSelectedPlaces([]);
  };

  const handleAddCustomPlace = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!customPlaceInput.trim()) {
      alert('Please enter a place, viewpoint, or landmark name to add.');
      return;
    }
    const newName = customPlaceInput.trim();

    // 1. Add to availablePlaces list if not already present
    setAvailablePlaces((prev) => {
      const exists = prev.some((p) => p.name.toLowerCase() === newName.toLowerCase());
      if (exists) return prev;
      return [
        ...prev,
        {
          name: newName,
          category: 'Custom Must-Visit Spot',
          durationMin: 60,
          ticketPrice: 0,
          estimatedCost: 100.0,
        },
      ];
    });

    // 2. Add to selectedPlaces so it is checked and included in the itinerary
    setSelectedPlaces((prev) => {
      if (prev.includes(newName)) return prev;
      return [...prev, newName];
    });

    setCustomPlaceInput('');
  };

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    const activeDest = isCustomMode ? customDestination.trim() : destinationName.trim();
    if (!activeDest) {
      setError('Please choose or enter a destination in India.');
      setLoading(false);
      return;
    }

    try {
      const result = await apiClient.post('/planner/generate', {
        destinationName: activeDest,
        startingLocation,
        travelDays: parseInt(travelDays),
        numTravelers: parseInt(numTravelers),
        totalBudget: parseFloat(totalBudget),
        interests: selectedInterests,
        travelPace,
        preferredTransport,
        selectedPlaces: selectedPlaces.length > 0 ? selectedPlaces : null,
      });

      // Save to session storage and redirect to dedicated results page
      sessionStorage.setItem('last_itinerary', JSON.stringify(result));
      navigate('/planner/result', { state: { itinerary: result } });
    } catch (err) {
      setError(err.message || 'Unable to generate itinerary. Please try different parameters.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="planner-container">
      {/* Header Banner */}
      <div className="planner-header-card">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>
            <Sparkles size={14} /> SMART TRAVEL PLANNER • ALL INDIA COVERAGE
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 800, marginBottom: '10px' }}>
            Personalized Day-Wise Travel Itinerary
          </h1>
          <p style={{ fontSize: '15px', opacity: 0.9, maxWidth: '680px' }}>
            Choose any city, town, or village across India. Select must-visit spots, schedule train timings, calculate itemized budgets, and optimize your routes.
          </p>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleGenerate} className="planner-form-card">
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '24px' }}>
          Trip Parameters & India Destination
        </h2>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '14px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        <div className="planner-form-grid">
          {/* Starting Location */}
          <div className="planner-field">
            <label>Starting Location (Origin Station / Town)</label>
            <input
              type="text"
              placeholder="e.g. Bhimavaram, Vijayawada, Hyderabad"
              value={startingLocation}
              onChange={(e) => setStartingLocation(e.target.value)}
              className="planner-input"
              required
            />
          </div>

          {/* Destination City Selection */}
          <div className="planner-field">
            <label>Destination in India</label>
            {!isCustomMode ? (
              <select
                value={destinationName}
                onChange={(e) => {
                  if (e.target.value === 'CUSTOM') {
                    setIsCustomMode(true);
                  } else {
                    setDestinationName(e.target.value);
                  }
                }}
                className="planner-select"
                required
              >
                {POPULAR_INDIA_DESTINATIONS.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name} ({d.state})
                  </option>
                ))}
                <option value="CUSTOM">🔍 Enter Another City or Village in India...</option>
              </select>
            ) : (
              <div style={{ display: 'flex', gap: '8px', width: '100%', minWidth: 0 }}>
                <input
                  type="text"
                  placeholder="Type any Village or City in India (e.g. Somaramam, Hampi, Puri, Shirdi)"
                  value={customDestination}
                  onChange={(e) => setCustomDestination(e.target.value)}
                  className="planner-input"
                  style={{ flex: 1, minWidth: 0 }}
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  style={{ padding: '0 14px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  Presets
                </button>
              </div>
            )}
          </div>

          {/* Travel Days */}
          <div className="planner-field">
            <label>Trip Duration (Days)</label>
            <input
              type="number"
              min="1"
              max="14"
              value={travelDays}
              onChange={(e) => setTravelDays(e.target.value)}
              className="planner-input"
              required
            />
          </div>

          {/* Travelers */}
          <div className="planner-field">
            <label>Number of Travelers</label>
            <input
              type="number"
              min="1"
              max="20"
              value={numTravelers}
              onChange={(e) => setNumTravelers(e.target.value)}
              className="planner-input"
              required
            />
          </div>

          {/* Budget */}
          <div className="planner-field">
            <label>Total Budget (₹)</label>
            <input
              type="number"
              step="500"
              min="1000"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              className="planner-input"
              required
            />
          </div>

          {/* Travel Pace */}
          <div className="planner-field">
            <label>Travel Pace</label>
            <select
              value={travelPace}
              onChange={(e) => setTravelPace(e.target.value)}
              className="planner-select"
            >
              <option value="RELAXED">Relaxed (2 places / day)</option>
              <option value="BALANCED">Balanced (3-4 places / day)</option>
              <option value="PACKED">Packed (4-5 places / day)</option>
            </select>
          </div>
        </div>

        {/* ---------------- MUST-VISIT PLACES SELECTOR ---------------- */}
        <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '18px', border: '1px solid #e2e8f0', margin: '24px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Choose Must-Visit Places & Landmarks in {isCustomMode ? (customDestination || 'Destination') : destinationName}
              </h3>
              <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                Select specific places you want to prioritize in your itinerary, or let our Dijkstra router pick the top sights
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleSelectAllPlaces}
                style={{ fontSize: '12px', fontWeight: 700, padding: '4px 10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}
              >
                Select All
              </button>
              <button
                type="button"
                onClick={handleClearAllPlaces}
                style={{ fontSize: '12px', fontWeight: 700, padding: '4px 10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', cursor: 'pointer' }}
              >
                Clear
              </button>
            </div>
          </div>

          {placesLoading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
              Loading famous attractions for {isCustomMode ? customDestination : destinationName}...
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '10px', marginBottom: '14px' }}>
              {availablePlaces.map((p, idx) => {
                const isSelected = selectedPlaces.includes(p.name);
                return (
                  <div
                    key={idx}
                    onClick={() => togglePlaceSelection(p.name)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      border: isSelected ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}} // handled by parent onClick
                      style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#0284c7' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>{p.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', gap: '10px' }}>
                        <span>{p.category}</span>
                        <span>⏱ ~{p.durationMin}m</span>
                        <span>🎟 {p.ticketPrice > 0 ? `₹${p.ticketPrice}` : 'Free'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add custom village place */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="+ Add any local village shrine, viewpoint, or custom spot..."
              value={customPlaceInput}
              onChange={(e) => setCustomPlaceInput(e.target.value)}
              style={{ flex: '1 1 200px', minWidth: 0, padding: '10px 14px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
              onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustomPlace(e); }}
            />
            <button
              type="button"
              onClick={handleAddCustomPlace}
              style={{ padding: '10px 18px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              Add Spot
            </button>
          </div>
        </div>

        {/* Transport Mode Selection */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '8px' }}>
            Preferred Transportation
          </label>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { id: 'TRAIN', label: '🚆 Train (IRCTC Express & Vistadome)' },
              { id: 'BUS', label: '🚌 Bus (State RTC & Luxury Sleeper)' },
              { id: 'CAR', label: '🚗 Cab / Taxi (Sedan / SUV / Innova)' },
              { id: 'AUTO', label: '🛺 Auto Rickshaw / Local Connector' },
              { id: 'BIKE', label: '🏍️ Bike / Motorcycle Rental' }
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setPreferredTransport(m.id)}
                className={`interest-pill ${preferredTransport === m.id ? 'selected' : ''}`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Interests */}
        <div style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '8px' }}>
            Travel Interests & Focus Areas
          </label>
          <div className="interests-pill-group">
            {interestOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleInterest(opt.value)}
                className={`interest-pill ${selectedInterests.includes(opt.value) ? 'selected' : ''}`}
              >
                {selectedInterests.includes(opt.value) && <Check size={14} style={{ display: 'inline', marginRight: '4px' }} />}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary-orange"
          style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '16px' }}
        >
          {loading ? 'Optimizing Day-Wise Routes & Train Timings...' : 'Generate Intelligent Day-Wise Itinerary'}
        </button>
      </form>
    </div>
  );
};
