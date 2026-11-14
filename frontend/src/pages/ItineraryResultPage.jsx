import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles, MapPin, Calendar, Users, DollarSign, Clock, ArrowLeft,
  ShieldCheck, AlertCircle, Save, Printer, Train, Car, Check, ExternalLink,
  Ticket, Utensils, Navigation, Bus, Bike, Plus, Trash2, ArrowRight,
  TrendingUp, CreditCard, X, Info, Edit3, ArrowUp, ArrowDown, PlusCircle
} from 'lucide-react';

export const ItineraryResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Retrieve itinerary from navigation state or fallback to sessionStorage
  const [itinerary, setItinerary] = useState(() => {
    if (location.state && location.state.itinerary) {
      sessionStorage.setItem('last_itinerary', JSON.stringify(location.state.itinerary));
      return location.state.itinerary;
    }
    const saved = sessionStorage.getItem('last_itinerary');
    return saved ? JSON.parse(saved) : null;
  });

  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Editing Mode States
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTitle, setEditingTitle] = useState(itinerary?.title || '');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Add Spot to Day Modal
  const [addSpotModalDay, setAddSpotModalDay] = useState(null);
  const [newSpotName, setNewSpotName] = useState('');
  const [newSpotSlot, setNewSpotSlot] = useState('MORNING');
  const [newSpotDuration, setNewSpotDuration] = useState(60);
  const [newSpotTicket, setNewSpotTicket] = useState(50);
  const [newSpotCategory, setNewSpotCategory] = useState('Sightseeing & Culture');

  // Log Expenses State
  const [loggedExpenses, setLoggedExpenses] = useState(() => {
    const saved = sessionStorage.getItem(`expenses_${itinerary?.destinationName || 'default'}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('FOOD');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState('Day 1');
  const [expenseNotes, setExpenseNotes] = useState('');

  // Save expenses to sessionStorage whenever they change
  useEffect(() => {
    if (itinerary?.destinationName) {
      sessionStorage.setItem(`expenses_${itinerary.destinationName}`, JSON.stringify(loggedExpenses));
    }
  }, [loggedExpenses, itinerary]);

  if (!itinerary) {
    return (
      <div style={{ maxWidth: '800px', margin: '80px auto', textAlign: 'center', padding: '40px 24px', background: '#fff', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
        <Sparkles size={48} color="#0284c7" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
          No Active Itinerary Found
        </h2>
        <p style={{ color: '#64748b', fontSize: '15px', marginBottom: '24px' }}>
          Please use the Smart Travel Planner to configure and generate your personalized travel schedule.
        </p>
        <button onClick={() => navigate('/planner')} className="btn-primary-orange" style={{ margin: '0 auto' }}>
          <ArrowLeft size={16} /> Open Smart Planner
        </button>
      </div>
    );
  }

  const handleSaveItinerary = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setSaveLoading(true);
    setError('');
    setMessage('');

    try {
      const saved = await apiClient.post('/planner/save', itinerary);
      setMessage(`Itinerary successfully saved to your profile! (ID: ${saved.itineraryId || 'Saved'})`);
    } catch (err) {
      setError(err.message || 'Error saving itinerary.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveTitle = () => {
    if (!editingTitle.trim()) return;
    const updated = { ...itinerary, title: editingTitle.trim() };
    setItinerary(updated);
    sessionStorage.setItem('last_itinerary', JSON.stringify(updated));
    setIsEditingTitle(false);
  };

  const recalculateItineraryCosts = (updatedDays) => {
    let totalDayCosts = 0;
    updatedDays.forEach((d) => {
      let dayTickets = 0;
      let dayActivities = 0;
      (d.places || []).forEach((p) => {
        dayTickets += (p.estimatedCost || 0) * (itinerary.numTravelers || 1);
        dayActivities += (p.activityCost || 0) * (itinerary.numTravelers || 1);
      });
      d.dayTicketsCost = dayTickets;
      d.estimatedDayCost = dayTickets + dayActivities + (d.dayTransportCost || 300) + (d.dayFoodCost || 1200);
      totalDayCosts += d.estimatedDayCost;
    });

    const transportCost = itinerary.budgetBreakdown?.transportCost || 1800;
    const accommodationCost = itinerary.budgetBreakdown?.accommodationCost || 3200;
    const newTotal = totalDayCosts + transportCost + accommodationCost;

    return {
      ...itinerary,
      days: updatedDays,
      estimatedCost: newTotal,
      budgetBreakdown: {
        ...(itinerary.budgetBreakdown || {}),
        ticketCost: updatedDays.reduce((acc, d) => acc + (d.dayTicketsCost || 0), 0),
        totalEstimatedCost: newTotal,
        costPerPerson: Math.round(newTotal / (itinerary.numTravelers || 1)),
        remainingBudget: (itinerary.totalBudget || 10000) - newTotal,
        isExceeded: newTotal > (itinerary.totalBudget || 10000),
      },
    };
  };

  const handleDeleteSpot = (dayNumber, placeIndex) => {
    const updatedDays = itinerary.days.map((day) => {
      if (day.dayNumber === dayNumber) {
        const updatedPlaces = day.places
          .filter((_, idx) => idx !== placeIndex)
          .map((p, idx) => ({ ...p, visitOrder: idx + 1 }));
        return { ...day, places: updatedPlaces };
      }
      return day;
    });
    const updated = recalculateItineraryCosts(updatedDays);
    setItinerary(updated);
    sessionStorage.setItem('last_itinerary', JSON.stringify(updated));
  };

  const handleMoveSpot = (dayNumber, placeIndex, direction) => {
    const updatedDays = itinerary.days.map((day) => {
      if (day.dayNumber === dayNumber) {
        const places = [...(day.places || [])];
        const targetIndex = direction === 'up' ? placeIndex - 1 : placeIndex + 1;
        if (targetIndex < 0 || targetIndex >= places.length) return day;

        const temp = places[placeIndex];
        places[placeIndex] = places[targetIndex];
        places[targetIndex] = temp;

        const reordered = places.map((p, idx) => ({ ...p, visitOrder: idx + 1 }));
        return { ...day, places: reordered };
      }
      return day;
    });
    const updated = recalculateItineraryCosts(updatedDays);
    setItinerary(updated);
    sessionStorage.setItem('last_itinerary', JSON.stringify(updated));
  };

  const handleConfirmAddSpot = (e) => {
    e.preventDefault();
    if (!newSpotName.trim()) {
      alert('Please enter a place name.');
      return;
    }
    const costPerPerson = parseFloat(newSpotTicket) || 0;
    const dur = parseInt(newSpotDuration) || 60;
    const timeStr = newSpotSlot === 'MORNING' ? '10:00 AM' : (newSpotSlot === 'AFTERNOON' ? '02:30 PM' : '05:45 PM');

    const newPlace = {
      attractionId: 0,
      attractionName: newSpotName.trim(),
      categoryName: newSpotCategory,
      timeSlot: newSpotSlot,
      visitStartTime: timeStr,
      allocatedDurationMin: dur,
      estimatedCost: costPerPerson,
      activityCost: 0,
      totalPlaceExpenditure: costPerPerson * (itinerary.numTravelers || 1),
      expenditureBreakdown: `Entry: ₹${costPerPerson} / person`,
      notes: 'Custom spot added by tourist',
    };

    const updatedDays = itinerary.days.map((day) => {
      if (day.dayNumber === addSpotModalDay) {
        const places = [...(day.places || []), { ...newPlace, visitOrder: (day.places?.length || 0) + 1 }];
        return { ...day, places };
      }
      return day;
    });

    const updated = recalculateItineraryCosts(updatedDays);
    setItinerary(updated);
    sessionStorage.setItem('last_itinerary', JSON.stringify(updated));
    setAddSpotModalDay(null);
    setNewSpotName('');
    setNewSpotTicket(50);
  };

  const handleAddDay = () => {
    const newDayNum = (itinerary.days?.length || 0) + 1;
    const newDayObj = {
      dayNumber: newDayNum,
      estimatedDayCost: 1500,
      dayTicketsCost: 100,
      dayTransportCost: 250,
      dayFoodCost: 1150,
      estimatedTravelTimeMin: 25,
      places: [
        {
          attractionId: 0,
          attractionName: `Scenic Discovery & Local Bazaar (Day ${newDayNum})`,
          categoryName: 'Scenic & Culture',
          timeSlot: 'MORNING',
          visitStartTime: '10:00 AM',
          allocatedDurationMin: 90,
          estimatedCost: 50,
          activityCost: 0,
          totalPlaceExpenditure: 50 * (itinerary.numTravelers || 1),
          expenditureBreakdown: 'Entry: ₹50 / person',
          visitOrder: 1,
        },
      ],
    };
    const updatedDays = [...(itinerary.days || []), newDayObj];
    const updated = {
      ...recalculateItineraryCosts(updatedDays),
      travelDays: newDayNum,
    };
    setItinerary(updated);
    sessionStorage.setItem('last_itinerary', JSON.stringify(updated));
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!expenseTitle.trim() || !expenseAmount || parseFloat(expenseAmount) <= 0) {
      alert('Please enter a valid expense title and amount.');
      return;
    }

    const newExpense = {
      id: Date.now(),
      title: expenseTitle.trim(),
      category: expenseCategory,
      amount: parseFloat(expenseAmount),
      expenseDate,
      notes: expenseNotes.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setLoggedExpenses([newExpense, ...loggedExpenses]);
    setExpenseTitle('');
    setExpenseAmount('');
    setExpenseNotes('');
    setIsExpenseModalOpen(false);

    // Optionally post to backend
    apiClient.post('/planner/expenses', {
      itineraryId: itinerary.itineraryId || 0,
      title: newExpense.title,
      category: newExpense.category,
      amount: newExpense.amount,
      expenseDate: newExpense.expenseDate,
      notes: newExpense.notes,
    }).catch(err => console.log('Stored expense locally:', err));
  };

  const handleDeleteExpense = (id) => {
    setLoggedExpenses(loggedExpenses.filter(e => e.id !== id));
  };

  const totalLoggedExpenseAmount = loggedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingRealBudget = (itinerary.totalBudget || 10000) - totalLoggedExpenseAmount;
  const targetBudget = itinerary.totalBudget || 10000;
  const estimatedCost = itinerary.estimatedCost || (itinerary.budgetBreakdown?.totalEstimatedCost || 8500);
  const budgetSpentPct = Math.min(100, Math.round((totalLoggedExpenseAmount / targetBudget) * 100));

  const preferredTransport = (itinerary.preferredTransport || 'TRAIN').toUpperCase();
  const trainList = itinerary.trainSchedules || [];
  const busList = itinerary.busSchedules || [];
  const cabList = itinerary.cabOptions || [];
  const outboundTransit = itinerary.outboundTransit;
  const returnTransit = itinerary.returnTransit;

  return (
    <div style={{ maxWidth: '1240px', margin: '40px auto', padding: '0 24px' }}>
      {/* Top Navigation & Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/planner')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#ffffff', border: '1px solid #cbd5e1', padding: '10px 18px',
            borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: '#334155', cursor: 'pointer'
          }}
        >
          <ArrowLeft size={16} /> Edit Parameters
        </button>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: isEditMode ? '#f59e0b' : '#ffffff',
              color: isEditMode ? '#ffffff' : '#0f172a',
              border: isEditMode ? 'none' : '1.5px solid #cbd5e1',
              padding: '10px 18px', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
              boxShadow: isEditMode ? '0 2px 10px rgba(245, 158, 11, 0.35)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Edit3 size={16} /> {isEditMode ? '✓ Done Customizing' : '✏️ Customize Itinerary'}
          </button>

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#059669', color: '#ffffff', border: 'none', padding: '10px 18px',
              borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)'
            }}
          >
            <CreditCard size={16} /> 💳 Log Tour Expense
          </button>

          <button
            onClick={handleSaveItinerary}
            disabled={saveLoading}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#0284c7', color: '#ffffff', border: 'none', padding: '10px 18px',
              borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer'
            }}
          >
            <Save size={16} /> {saveLoading ? 'Saving...' : 'Save Itinerary'}
          </button>

          <button
            onClick={() => window.print()}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#ffffff', border: '1px solid #cbd5e1', padding: '10px 18px',
              borderRadius: '12px', fontSize: '14px', fontWeight: 700, color: '#334155', cursor: 'pointer'
            }}
          >
            <Printer size={16} /> Print / PDF
          </button>
        </div>
      </div>

      {message && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '12px 18px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={18} /> {message}
        </div>
      )}

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px 18px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {/* Main Itinerary Header Card */}
      <div style={{ background: '#ffffff', borderRadius: '24px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 800, marginBottom: '14px' }}>
          <Sparkles size={14} /> COMPLETE ROUND-TRIP OPTIMIZED PLAN
        </div>

        {isEditingTitle ? (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', maxWidth: '650px', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              style={{
                flex: 1, padding: '8px 14px', borderRadius: '10px',
                border: '1.5px solid #0284c7', fontSize: '20px', fontWeight: 800, outline: 'none'
              }}
              autoFocus
            />
            <button
              onClick={handleSaveTitle}
              style={{ padding: '8px 16px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
            >
              Save
            </button>
            <button
              onClick={() => { setIsEditingTitle(false); setEditingTitle(itinerary.title); }}
              style={{ padding: '8px 14px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '30px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {itinerary.title}
            </h1>
            {isEditMode && (
              <button
                onClick={() => setIsEditingTitle(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 700 }}
              >
                <Edit3 size={16} /> Edit Title
              </button>
            )}
          </div>
        )}

        <p style={{ fontSize: '15px', color: '#64748b', maxWidth: '820px', marginBottom: '24px' }}>
          Full circuit from <strong>{itinerary.startingLocation}</strong> to <strong>{itinerary.destinationName}</strong> and return. Features Dijkstra-optimized attraction routing, day-wise itemized budgets, and verified real-time transport options.
        </p>

        {/* Quick Parameter Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin size={20} color="#0284c7" />
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Route Circuit</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                {itinerary.startingLocation} ➔ {itinerary.destinationName} ➔ {itinerary.startingLocation}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={20} color="#0284c7" />
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Trip Duration</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                {itinerary.travelDays} Days ({itinerary.travelDays > 1 ? itinerary.travelDays - 1 : 1} Nights)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={20} color="#0284c7" />
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Travelers</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                {itinerary.numTravelers} Person(s)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <DollarSign size={20} color="#16a34a" />
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Estimated Plan Cost</div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#16a34a' }}>
                ₹{estimatedCost.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. EXPENDITURE ANALYTICS & REAL-TIME EXPENSE TRACKER                     */}
      {/* ========================================================================= */}
      <div style={{ background: '#ffffff', borderRadius: '24px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#059669', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase' }}>
              <TrendingUp size={15} /> Real-Time Expenditure Tracker & Budget Variance
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>
              Tour Expenditure Analytics
            </h2>
          </div>
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            style={{
              padding: '8px 16px', background: '#059669', color: '#fff', border: 'none', borderRadius: '10px',
              fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <Plus size={16} /> Log Expense Now
          </button>
        </div>

        {/* Analytics Top KPI Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>Target Budget</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>₹{targetBudget.toLocaleString()}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Total allocated funds</div>
          </div>

          <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>Estimated Plan Cost</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0284c7' }}>₹{estimatedCost.toLocaleString()}</div>
            <div style={{ fontSize: '11px', color: '#0284c7', marginTop: '2px' }}>Algorithmic baseline</div>
          </div>

          <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>Actual Logged Expenses</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: totalLoggedExpenseAmount > targetBudget ? '#dc2626' : '#059669' }}>
              ₹{totalLoggedExpenseAmount.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{loggedExpenses.length} transaction(s) recorded</div>
          </div>

          <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>Remaining Wallet Balance</div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: remainingRealBudget < 0 ? '#dc2626' : '#16a34a' }}>
              ₹{remainingRealBudget.toLocaleString()}
            </div>
            <div style={{ fontSize: '11px', color: remainingRealBudget < 0 ? '#dc2626' : '#16a34a', marginTop: '2px' }}>
              {remainingRealBudget < 0 ? '⚠️ Budget Exceeded' : '✓ Surplus Available'}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
            <span>Spent of Target Budget: {budgetSpentPct}%</span>
            <span>₹{totalLoggedExpenseAmount.toLocaleString()} / ₹{targetBudget.toLocaleString()}</span>
          </div>
          <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '9999px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${budgetSpentPct}%`,
                height: '100%',
                background: budgetSpentPct > 90 ? '#ef4444' : '#059669',
                borderRadius: '9999px',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>

        {/* Logged Expenses Table / List */}
        {loggedExpenses.length > 0 ? (
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
              Logged Tour Expenses List ({loggedExpenses.length})
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {loggedExpenses.map((exp) => (
                <div
                  key={exp.id}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0',
                    fontSize: '13px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, padding: '2px 8px', borderRadius: '6px', background: '#e0f2fe', color: '#0369a1' }}>
                      {exp.category}
                    </span>
                    <div>
                      <strong style={{ color: '#0f172a' }}>{exp.title}</strong>
                      <span style={{ color: '#64748b', marginLeft: '8px' }}>({exp.expenseDate} • {exp.timestamp || 'Recorded'})</span>
                      {exp.notes && <div style={{ fontSize: '11.5px', color: '#64748b' }}>{exp.notes}</div>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                      ₹{exp.amount.toLocaleString()}
                    </span>
                    <button
                      onClick={() => handleDeleteExpense(exp.id)}
                      style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                      title="Delete expense"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ padding: '18px', textAlign: 'center', background: '#f9fafb', borderRadius: '12px', color: '#64748b', fontSize: '13px' }}>
            No expenses logged yet on this tour. Click <strong>"Log Expense Now"</strong> to record restaurant bills, cab fares, entry passes, and shopping in real-time.
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. ROUND-TRIP JOURNEY FLOW (Outbound Leg -> Spot Visits -> Return Leg)   */}
      {/* ========================================================================= */}
      <div style={{ marginBottom: '36px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
          Complete Round-Trip Travel Flow
        </h2>
        <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
          Complete itinerary spanning initial outbound journey from your origin to destination sights and return journey back home.
        </p>

        {/* OUTBOUND TRANSIT LEG */}
        {outboundTransit && (
          <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '20px', padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#16a34a', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '9999px' }}>
                  STEP 1 • OUTBOUND TRANSIT
                </span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#166534' }}>
                  {outboundTransit.fromLocation} ➔ {outboundTransit.toLocation}
                </span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#166534' }}>
                Estimated Cost: ₹{outboundTransit.estimatedCost} • Duration: {outboundTransit.duration}
              </div>
            </div>

            <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              {outboundTransit.title}
            </div>
            <p style={{ fontSize: '13.5px', color: '#334155', margin: '0 0 10px' }}>
              {outboundTransit.routeDescription}
            </p>
            <div style={{ fontSize: '12px', color: '#15803d', background: '#dcfce7', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info size={14} /> <strong>Traveler Tip:</strong> {outboundTransit.tips} (Departs around {outboundTransit.departureTime}, arrives ~{outboundTransit.arrivalTime})
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. DYNAMIC TRANSPORTATION DETAILS ACCORDING TO SELECTION                  */}
        {/* ========================================================================= */}
        {/* IF TRAIN WAS CHOSEN */}
        {preferredTransport.includes('TRAIN') && trainList.length > 0 && (
          <div style={{ background: '#f0f9ff', borderRadius: '20px', padding: '24px', border: '1px solid #bae6fd', marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Train size={22} color="#0284c7" />
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0369a1', margin: 0 }}>
                Direct Train Schedules ({itinerary.startingLocation} ➔ {itinerary.destinationName})
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '14px' }}>
              {trainList.map((t, idx) => (
                <div key={idx} style={{ background: '#ffffff', borderRadius: '16px', padding: '18px', border: '1px solid #e0f2fe' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: '6px' }}>
                      #{t.trainNumber}
                    </span>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#16a34a' }}>
                      ₹{t.fareEstimated}
                    </span>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                    {t.trainName}
                  </div>
                  <div style={{ fontSize: '13px', color: '#475569', marginBottom: '8px' }}>
                    <strong>{t.departureTime}</strong> ({t.departureStation}) ➔ <strong>{t.arrivalTime}</strong> ({t.arrivalStation})
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    ⏱ Duration: <strong>{t.duration}</strong> • Classes: {t.classes} • Runs: {t.runsOn}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* IF BUS WAS CHOSEN */}
        {preferredTransport.includes('BUS') && busList.length > 0 && (
          <div style={{ background: '#fffbeb', borderRadius: '20px', padding: '24px', border: '1px solid #fde68a', marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Bus size={22} color="#d97706" />
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#b45309', margin: 0 }}>
                Available State RTC & Luxury Buses ({itinerary.startingLocation} ➔ {itinerary.destinationName})
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {busList.map((b, idx) => (
                <div key={idx} style={{ background: '#ffffff', borderRadius: '16px', padding: '18px', border: '1px solid #fef3c7' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#b45309', background: '#fef3c7', padding: '2px 8px', borderRadius: '6px' }}>
                      {b.serviceNumber}
                    </span>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#16a34a' }}>
                      ₹{b.farePerSeat} / seat
                    </span>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                    {b.operatorName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                    {b.busType} • {b.seatsAvailable} Seats Available
                  </div>
                  <div style={{ fontSize: '13px', color: '#475569', marginBottom: '6px' }}>
                    Board: <strong>{b.boardingPoint}</strong> ({b.departureTime})<br />
                    Drop: <strong>{b.droppingPoint}</strong> ({b.arrivalTime})
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#78716c' }}>
                    ⚡ {b.amenities}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* IF CAB / CAR / AUTO / BIKE WAS CHOSEN */}
        {(!preferredTransport.includes('TRAIN') && !preferredTransport.includes('BUS')) && cabList.length > 0 && (
          <div style={{ background: '#f8fafc', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Car size={22} color="#0284c7" />
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Verified Cabs, Taxis & Rental Options for {itinerary.destinationName}
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {cabList.map((c, idx) => (
                <div key={idx} style={{ background: '#ffffff', borderRadius: '16px', padding: '18px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: '6px' }}>
                      {c.vehicleType}
                    </span>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#16a34a' }}>
                      ₹{c.estimatedTotalFare?.toLocaleString()} (Total)
                    </span>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                    {c.serviceName}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
                    👥 {c.capacity} • {c.provider}
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#475569', marginBottom: '6px' }}>
                    🏷 {c.ratePerKm} • {c.driverAllowance} • {c.tollTaxes}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#10b981', fontWeight: 600 }}>
                    ✓ {c.features}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. DAY-BY-DAY SIGHTSEEING ITINERARY WITH ITEMIZED EXPENDITURES           */}
        {/* ========================================================================= */}
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
          Day-Wise Sightseeing & Spot Visits
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {itinerary.days?.map((day) => (
            <div key={day.dayNumber} style={{ background: '#ffffff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.03)' }}>
              {/* Day Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px' }}>
                    {day.dayNumber}
                  </span>
                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      Day {day.dayNumber} • Highlights & Sightseeing
                    </h4>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      {day.places?.length || 0} Places • Est. Transit: {day.estimatedTravelTimeMin || 25} mins
                    </span>
                  </div>
                </div>

                {/* Day Cost Breakdown */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#16a34a' }}>
                    Est. Day Cost: ₹{day.estimatedDayCost?.toLocaleString() || '1,800'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>
                    Tickets: ₹{day.dayTicketsCost || 0} • Local Transit: ₹{day.dayTransportCost || 0} • Food: ₹{day.dayFoodCost || 0}
                  </div>
                </div>
              </div>

              {/* Day 1 Transit Arrival Banner */}
              {day.trainArrivalNote && (
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Navigation size={16} /> {day.trainArrivalNote}
                </div>
              )}

              {/* Places List for this Day */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {day.places?.map((p, pIdx) => (
                  <div
                    key={pIdx}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: '#f8fafc', padding: '14px 18px', borderRadius: '14px', border: '1px solid #e2e8f0',
                      flexWrap: 'wrap', gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#0284c7', background: '#e0f2fe', width: '26px', height: '26px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {p.visitOrder}
                      </span>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                          {p.attractionName}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '2px' }}>
                          <span>⏰ Time: <strong>{p.visitStartTime}</strong> ({p.timeSlot})</span>
                          <span>⏱ Duration: {p.allocatedDurationMin} mins</span>
                          <span>🏷 Category: {p.categoryName || 'Sightseeing'}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                          ₹{p.totalPlaceExpenditure || (p.estimatedCost + p.activityCost) * itinerary.numTravelers}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {p.expenditureBreakdown || `Entry: ₹${p.estimatedCost} • Activity: ₹${p.activityCost}`}
                        </div>
                      </div>

                      {isEditMode && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            disabled={pIdx === 0}
                            onClick={() => handleMoveSpot(day.dayNumber, pIdx, 'up')}
                            style={{
                              background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px',
                              padding: '5px', cursor: pIdx === 0 ? 'not-allowed' : 'pointer',
                              color: pIdx === 0 ? '#94a3b8' : '#334155'
                            }}
                            title="Move spot earlier"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            type="button"
                            disabled={pIdx === day.places.length - 1}
                            onClick={() => handleMoveSpot(day.dayNumber, pIdx, 'down')}
                            style={{
                              background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px',
                              padding: '5px', cursor: pIdx === day.places.length - 1 ? 'not-allowed' : 'pointer',
                              color: pIdx === day.places.length - 1 ? '#94a3b8' : '#334155'
                            }}
                            title="Move spot later"
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSpot(day.dayNumber, pIdx)}
                            style={{
                              background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '6px',
                              padding: '5px', cursor: 'pointer', color: '#dc2626'
                            }}
                            title="Remove spot from this day"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {isEditMode && (
                <button
                  type="button"
                  onClick={() => setAddSpotModalDay(day.dayNumber)}
                  style={{
                    marginTop: '14px', padding: '10px 18px', background: '#f0fdf4',
                    border: '1.5px dashed #86efac', borderRadius: '12px', color: '#166534',
                    fontSize: '13px', fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px', width: 'fit-content'
                  }}
                >
                  <Plus size={16} /> + Add Must-Visit Spot to Day {day.dayNumber}
                </button>
              )}
            </div>
          ))}

          {isEditMode && (
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button
                type="button"
                onClick={handleAddDay}
                style={{
                  padding: '12px 24px', background: '#0284c7', color: '#fff',
                  border: 'none', borderRadius: '14px', fontSize: '14px', fontWeight: 800,
                  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
                }}
              >
                <PlusCircle size={18} /> + Add Another Day to Trip
              </button>
            </div>
          )}
        </div>

        {/* RETURN TRANSIT LEG */}
        {returnTransit && (
          <div style={{ background: '#fdf2f8', border: '1.5px solid #fbcfe8', borderRadius: '20px', padding: '24px', marginTop: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ background: '#db2777', color: '#fff', fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '9999px' }}>
                  STEP 3 • RETURN TRANSIT BACK HOME
                </span>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#9d174d' }}>
                  {returnTransit.fromLocation} ➔ {returnTransit.toLocation}
                </span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#9d174d' }}>
                Estimated Cost: ₹{returnTransit.estimatedCost} • Duration: {returnTransit.duration}
              </div>
            </div>

            <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
              {returnTransit.title}
            </div>
            <p style={{ fontSize: '13.5px', color: '#334155', margin: '0 0 10px' }}>
              {returnTransit.routeDescription}
            </p>
            <div style={{ fontSize: '12px', color: '#be185d', background: '#fce7f3', padding: '8px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Info size={14} /> <strong>Return Tip:</strong> {returnTransit.tips} (Departs around {returnTransit.departureTime}, reaches home ~{returnTransit.arrivalTime})
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. LOG EXPENSE MODAL                                                      */}
      {/* ========================================================================= */}
      {isExpenseModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(17, 24, 39, 0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '24px', maxWidth: '480px', width: '100%', padding: '28px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Log Tour Expense
                </h3>
                <p style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>
                  Record your spending during the tour to track your live budget
                </p>
              </div>
              <button onClick={() => setIsExpenseModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddExpense} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Expense Title / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Borra Caves Entry Pass, Lunch at Hilltop Cafe"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '14px' }}
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Category
                  </label>
                  <select
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13.5px' }}
                  >
                    <option value="FOOD">🍽️ Food & Dining</option>
                    <option value="TRANSIT">🚗 Local Transit / Cab</option>
                    <option value="TICKETS">🎟️ Entry Tickets</option>
                    <option value="HOTEL">🏨 Hotel / Stay</option>
                    <option value="SHOPPING">🛍️ Souvenirs & Shopping</option>
                    <option value="OTHER">⚡ Other Misc</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="10"
                    min="1"
                    placeholder="e.g. 450"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '14px' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Trip Day
                </label>
                <select
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13.5px' }}
                >
                  {itinerary.days?.map(d => (
                    <option key={d.dayNumber} value={`Day ${d.dayNumber}`}>
                      Day {d.dayNumber}
                    </option>
                  ))}
                  <option value="Outbound Journey">Outbound Transit</option>
                  <option value="Return Journey">Return Transit</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Paid via UPI, includes tips"
                  value={expenseNotes}
                  onChange={(e) => setExpenseNotes(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13.5px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  style={{ padding: '10px 16px', borderRadius: '10px', background: '#f1f5f9', border: '1px solid #cbd5e1', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', borderRadius: '10px', background: '#059669', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer' }}
                >
                  Save Expense Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Spot to Specific Day */}
      {addSpotModalDay !== null && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '24px', maxWidth: '480px', width: '100%',
            padding: '28px', boxShadow: '0 20px 45px rgba(0,0,0,0.25)', position: 'relative'
          }}>
            <button
              onClick={() => setAddSpotModalDay(null)}
              style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              Add Must-Visit Spot to Day {addSpotModalDay}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>
              Add a viewpoint, cave, temple, beach, or local spot to Day {addSpotModalDay}'s schedule.
            </p>

            <form onSubmit={handleConfirmAddSpot} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Spot / Landmark Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Borra Caves, Kailasagiri, Beach Promenade"
                  value={newSpotName}
                  onChange={(e) => setNewSpotName(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none' }}
                  required
                  autoFocus
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Time Slot
                  </label>
                  <select
                    value={newSpotSlot}
                    onChange={(e) => setNewSpotSlot(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none' }}
                  >
                    <option value="MORNING">Morning (10:00 AM)</option>
                    <option value="AFTERNOON">Afternoon (02:30 PM)</option>
                    <option value="EVENING">Evening (05:45 PM)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="360"
                    step="15"
                    value={newSpotDuration}
                    onChange={(e) => setNewSpotDuration(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Entry Fee / Person (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={newSpotTicket}
                    onChange={(e) => setNewSpotTicket(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Category
                  </label>
                  <select
                    value={newSpotCategory}
                    onChange={(e) => setNewSpotCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1.5px solid #cbd5e1', fontSize: '13.5px', outline: 'none' }}
                  >
                    <option value="Sightseeing & Culture">Sightseeing & Culture</option>
                    <option value="Nature & Hills">Nature & Hills</option>
                    <option value="Temple & Spiritual">Temple & Spiritual</option>
                    <option value="Beach & Relaxation">Beach & Relaxation</option>
                    <option value="Local Food & Market">Local Food & Market</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setAddSpotModalDay(null)}
                  style={{ flex: 1, padding: '12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '10px', fontSize: '13.5px', fontWeight: 700, color: '#334155', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '12px', background: '#0284c7', border: 'none', borderRadius: '10px', fontSize: '13.5px', fontWeight: 700, color: '#ffffff', cursor: 'pointer' }}
                >
                  Add Spot to Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
