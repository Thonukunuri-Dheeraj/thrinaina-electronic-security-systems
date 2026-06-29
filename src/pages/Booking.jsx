import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { api, isCustomerAuthenticated, getStoredCustomer } from '../services/api';
import { Calendar, Clock, Camera, FileText, Copy, AlertTriangle, ArrowRight, User, Phone, Mail, MapPin, Search } from 'lucide-react';

export default function Booking() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [activeTab, setActiveTab] = useState('book'); // 'book' or 'track'

  // Inline Tracking State
  const [trackId, setTrackId] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [trackError, setTrackError] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackCopied, setTrackCopied] = useState(false);

  // Customer State
  const [customer, setCustomer] = useState(getStoredCustomer());
  const [isCustomerAuth, setIsCustomerAuth] = useState(isCustomerAuthenticated());
  const [showAuthWarning, setShowAuthWarning] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: customer?.full_name || '',
    mobile: (customer?.phone && customer?.phone !== 'N/A') ? customer.phone : '',
    email: customer?.email || '',
    address: '',
    service_type: location.state?.serviceType || 'CCTV Installation',
    cameras_count: location.state?.camerasCount !== undefined ? location.state.camerasCount : 4,
    preferred_date: '',
    preferred_time: '09:00 AM - 12:00 PM',
    additional_requirements: ''
  });

  // Sync auth state
  useEffect(() => {
    const syncAuth = () => {
      setIsCustomerAuth(isCustomerAuthenticated());
      const stored = getStoredCustomer();
      setCustomer(stored);
    };
    window.addEventListener('storage', syncAuth);
    return () => window.removeEventListener('storage', syncAuth);
  }, []);

  // Pre-fill / Restore state from navigation
  useEffect(() => {
    const stored = getStoredCustomer();
    if (stored) {
      setFormData(prev => ({
        ...prev,
        name: stored.full_name || prev.name,
        email: stored.email || prev.email,
        mobile: (stored.phone && stored.phone !== 'N/A') ? stored.phone : prev.mobile
      }));
    }
    if (location.state?.originalState) {
      setFormData(prev => ({
        ...prev,
        ...location.state.originalState
      }));
    }
  }, [location, isCustomerAuth]);

  const handleGuestInteraction = (e) => {
    if (!isCustomerAuth) {
      e.preventDefault();
      e.stopPropagation();
      setError("Authentication Required: Please sign in or sign up to schedule this installation.");
      setTimeout(() => {
        navigate('/login', {
          state: {
            from: location.pathname,
            originalState: formData,
            warning: "Authentication Required: Please sign in or sign up to schedule this installation."
          }
        });
      }, 1500);
    }
  };





  const timeSlots = [
    '09:00 AM - 12:00 PM',
    '12:00 PM - 03:00 PM',
    '03:00 PM - 06:00 PM'
  ];

  const handleInputChange = (e) => {
    setShowSuccess(false);
    const { name, value } = e.target;
    let newValue;
    if (name === 'mobile') {
      newValue = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'name') {
      newValue = value.replace(/[^A-Za-z.\s]/g, '');
    } else if (name === 'cameras_count') {
      newValue = Math.min(parseInt(value.replace(/\D/g, '')) || 0, 1000).toString();
    } else if (name === 'preferred_date') {
      const parts = value.split('-');
      if (parts[0] && parts[0].length > 4) {
        parts[0] = parts[0].slice(0, 4);
      }
      newValue = parts.join('-');
    } else {
      newValue = value;
    }
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleCameraCountChange = (amount) => {
    setShowSuccess(false);
    setFormData(prev => {
      const current = Number(prev.cameras_count);
      const next = current + amount;
      return { ...prev, cameras_count: next < 1 ? 1 : next };
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      const el = document.getElementById('name');
      el?.focus();
      return 'Name is required';
    }
    if (!/^[A-Za-z.\s]+$/.test(formData.name)) {
      const el = document.getElementById('name');
      el?.focus();
      return 'Name must contain only letters and dot';
    }
    if (!formData.mobile.trim()) {
      const el = document.getElementById('mobile');
      el?.focus();
      return 'Mobile number is required';
    }
    if (!/^\d{10}$/.test(formData.mobile)) {
      const el = document.getElementById('mobile');
      el?.focus();
      return 'Provide a valid 10-digit mobile number';
    }
    if (!formData.email.trim()) {
      const el = document.getElementById('email');
      el?.focus();
      return 'Email is required';
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      const el = document.getElementById('email');
      el?.focus();
      return 'Please enter a valid email address';
    }
    if (!formData.email.trim().toLowerCase().endsWith('@gmail.com')) {
      const el = document.getElementById('email');
      el?.focus();
      return 'Email must be a valid @gmail.com address';
    }
    if (!formData.address.trim()) {
      const el = document.getElementById('address');
      el?.focus();
      return 'Please fill address details';
    }
    if (!formData.preferred_date) {
      const el = document.getElementById('preferred_date');
      el?.focus();
      return 'Preferred date is required';
    }

    let selectedDate;
    if (formData.preferred_date.includes('/')) {
      const parts = formData.preferred_date.split('/');
      selectedDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    } else {
      selectedDate = new Date(formData.preferred_date);
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      const el = document.getElementById('preferred_date');
      el?.focus();
      return 'Preferred date cannot be in the past';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      let formattedDateForBackend = formData.preferred_date;
      if (formData.preferred_date.includes('/')) {
        const parts = formData.preferred_date.split('/');
        formattedDateForBackend = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      
      const payload = { 
        ...formData, 
        preferred_date: formattedDateForBackend
      };
      const response = await api.bookings.create(payload);
      
      if (response.success) {
        setSuccessData(response.booking);
        setShowSuccess(true);
        setFormKey(prev => prev + 1);
        // Reset fields keeping authenticated pre-fills
        setFormData({
          name: customer.full_name || '',
          email: customer.email || '',
          mobile: (customer.phone && customer.phone !== 'N/A') ? customer.phone : '',
          address: '',
          service_type: 'CCTV Installation',
          cameras_count: 4,
          preferred_date: '',
          preferred_time: '09:00 AM - 12:00 PM',
          additional_requirements: ''
        });
      } else {
        setError(response.message || 'Failed to place booking.');
      }
    } catch (err) {
      setError(err.message || 'Server connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const displayStatus = (status) => {
    if (status === 'Confirmed' || status === 'Technician Assigned') return 'Technician Assigned';
    if (status === 'Resolved') return 'Completed';
    if (status === 'Closed') return 'Cancelled';
    return status;
  };

  const getStatusBadgeClass = (status) => {
    const displayVal = displayStatus(status);
    switch (displayVal) {
      case 'Completed':
        return 'bg-emerald-500/10 border-emerald-500/35 text-emerald-450';
      case 'Pending':
        return 'bg-slate-900 border-slate-850 text-slate-450';
      case 'Technician Assigned':
        return 'bg-blue-500/10 border-blue-500/35 text-blue-405';
      case 'In Progress':
        return 'bg-amber-500/10 border-amber-500/35 text-amber-400';
      case 'Cancelled':
        return 'bg-red-500/10 border-red-500/35 text-red-400';
      default:
        return 'bg-slate-900 border-slate-850 text-slate-450';
    }
  };

  const copyBookingId = () => {
    if (successData && (successData.booking_id || successData.track_id)) {
      navigator.clipboard.writeText(successData.booking_id || successData.track_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTrackCheck = async (e) => {
    e.preventDefault();
    if (!trackId.trim()) return;
    setTrackLoading(true);
    setTrackError(null);
    setTrackResult(null);
    try {
      const res = await api.bookings.track(trackId.trim());
      if (res.success) {
        setTrackResult(res.booking);
      } else {
        setTrackError('Invalid Tracking ID');
      }
    } catch (err) {
      setTrackError(err.message || 'Invalid Tracking ID');
    } finally {
      setTrackLoading(false);
    }
  };

  const copyTrackedId = () => {
    if (trackResult) {
      navigator.clipboard.writeText(trackResult.track_id);
      setTrackCopied(true);
      setTimeout(() => setTrackCopied(false), 2000);
    }
  };



  return (
    <div className="pt-28 pb-20 relative">
      <div className="absolute inset-0 tech-grid opacity-20 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 space-y-8">

        {/* Header */}
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-security-gold block mb-3">
            Secure Setup
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
            Schedule System Installation
          </h1>
          <p className="text-xs text-security-textGray mt-1.5">
            Signed in as: <span className="text-security-gold font-bold">{customer?.full_name}</span>. Provide your site requirements below.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2 max-w-3xl mx-auto">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="max-w-3xl mx-auto">
          <div className="flex bg-[#030712] p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('book')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 cursor-pointer ${
                activeTab === 'book'
                  ? 'bg-security-gold text-security-bg shadow-gold-glow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Book Installation
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('track')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 cursor-pointer ${
                activeTab === 'track'
                  ? 'bg-security-gold text-security-bg shadow-gold-glow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Track Installation Status
            </button>
          </div>
        </div>

        {/* TAB 1: Book Installation */}
        {activeTab === 'book' && (
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in-up">
            {showSuccess && successData ? (
              <div className="glass-panel p-8 bg-security-card/90 border-slate-900 shadow-premium text-center space-y-6 animate-fade-in-up">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/35 rounded-full flex items-center justify-center animate-radar-pulse">
                    <span className="text-2xl text-emerald-450 font-extrabold">✓</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 uppercase tracking-wide">
                    ✓ Installation Booking Submitted Successfully
                  </h2>
                </div>

                <p className="text-slate-350 text-sm max-w-md mx-auto leading-relaxed">
                  Your Installation Request has been received successfully.
                </p>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 max-w-md mx-auto space-y-3">
                  <div>
                    <span className="text-slate-500 block text-[9.5px] uppercase font-bold tracking-widest mb-1">Track ID</span>
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-mono text-slate-150 font-black tracking-wider text-base">{successData.booking_id || successData.track_id}</span>
                      <button
                        type="button"
                        onClick={copyBookingId}
                        className="p-1.5 hover:bg-slate-900 text-slate-400 hover:text-security-gold rounded transition-colors cursor-pointer"
                        title="Copy Track ID"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {copied && <span className="text-[8px] font-bold text-security-gold uppercase animate-fade-in">Copied</span>}
                    </div>
                  </div>

                  <div className="border-t border-slate-900 pt-2">
                    <span className="text-slate-500 block text-[9.5px] uppercase font-bold tracking-widest mb-1">Current Status</span>
                    <span className="px-2.5 py-0.5 rounded text-[8.5px] font-bold uppercase border bg-slate-900 border-slate-850 text-slate-405">
                      Pending
                    </span>
                  </div>
                </div>

                <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
                  This booking has been securely saved to your account.
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSuccess(false);
                      setSuccessData(null);
                    }}
                    className="px-8 py-3 bg-security-gold hover:bg-security-goldHover text-security-bg font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all duration-300 shadow-gold-glow cursor-pointer"
                  >
                    Continue
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full">
                {!isCustomerAuth && (
                  <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-semibold flex items-center justify-between gap-4 w-full animate-pulse">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-security-gold" />
                      <span>Authentication Required: Please sign in or sign up to schedule this installation.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/login', { state: { from: location.pathname } })}
                      className="px-3.5 py-2 bg-security-gold hover:bg-security-goldHover text-security-bg font-extrabold uppercase text-[10px] tracking-wider rounded-lg transition-colors cursor-pointer shrink-0"
                    >
                      Sign In / Sign Up
                    </button>
                  </div>
                )}
                <form
                  key={formKey}
                  onSubmit={handleSubmit}
                  onClickCapture={handleGuestInteraction}
                  onFocusCapture={handleGuestInteraction}
                  noValidate
                  className="glass-panel p-6 sm:p-8 bg-security-card/75 border-slate-900 space-y-6 shadow-premium text-left"
                >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Name */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-security-gold" />
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      readOnly
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-[#030712] border border-slate-850 focus:border-security-gold text-sm text-slate-400 rounded-xl px-4 py-3 focus:outline-none cursor-not-allowed opacity-70"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-2">
                    <label htmlFor="mobile" className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-security-gold" />
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="mobile"
                      name="mobile"
                      required
                      value={formData.mobile}
                      onChange={handleInputChange}
                      placeholder="Enter 10-digit number"
                      className="w-full bg-[#030712] border border-slate-800 focus:border-security-gold text-sm text-slate-200 rounded-xl px-4 py-3 focus:outline-none transition-colors duration-200"
                    />
                  </div>

                  {/* Email Address */}
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-security-gold" />
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      readOnly
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-[#030712] border border-slate-855 focus:border-security-gold text-sm text-slate-400 rounded-xl px-4 py-3 focus:outline-none cursor-not-allowed opacity-70"
                    />
                  </div>

                  {/* Full Installation Address */}
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-security-gold" />
                      Full Site Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      required
                      rows="3"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Door No, Street name, Landmark, Locality, Pincode"
                      className="w-full bg-[#030712] border border-slate-800 focus:border-security-gold text-sm text-slate-200 rounded-xl px-4 py-3 focus:outline-none transition-colors duration-200 resize-none"
                    />
                  </div>

                  {/* Service Type Selection */}
                  <div className="space-y-2">
                    <label htmlFor="service_type" className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-security-gold" />
                      Required Solution
                    </label>
                    <input
                      type="text"
                      id="service_type"
                      name="service_type"
                      readOnly
                      value="CCTV Installation"
                      className="w-full bg-[#030712] border border-slate-855 text-sm text-slate-400 rounded-xl px-4 py-3 focus:outline-none cursor-not-allowed opacity-70"
                    />
                  </div>

                  {/* Cameras Count */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-security-gold" />
                      Estimated Camera Units
                    </label>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => handleCameraCountChange(-1)} className="p-2 rounded bg-[#030712] border border-slate-800 text-slate-205 hover:bg-slate-800 flex items-center justify-center font-bold text-lg select-none cursor-pointer" style={{ width: '2.5rem', height: '2.5rem' }}>-</button>
                      <input type="number" min="1" max="1000" name="cameras_count" className="text-sm font-bold text-slate-200 w-20 text-center bg-[#030712] border border-slate-800 rounded h-10 focus:outline-none" value={formData.cameras_count} onChange={handleInputChange} />
                      <button type="button" onClick={() => handleCameraCountChange(1)} className="p-2 rounded bg-[#030712] border border-slate-800 text-slate-205 hover:bg-slate-800 flex items-center justify-center font-bold text-lg select-none cursor-pointer" style={{ width: '2.5rem', height: '2.5rem' }}>+</button>
                    </div>
                  </div>

                  {/* Preferred Date */}
                  <div className="space-y-2">
                    <label htmlFor="preferred_date" className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-security-gold" />
                      Preferred Date <span className="text-red-500">*</span>
                    </label>
                    <DatePicker
                      selected={formData.preferred_date ? new Date(formData.preferred_date.split('/').reverse().join('-')) : null}
                      onChange={(date) => {
                        setShowSuccess(false);
                        const formatted = date
                          ? `${('0' + date.getDate()).slice(-2)}/${('0' + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()}`
                          : '';
                        setFormData((prev) => ({ ...prev, preferred_date: formatted }));
                      }}
                      minDate={new Date()}
                      maxDate={new Date('9999-12-31')}
                      filterDate={(date) => date.getFullYear().toString().length <= 4}
                      placeholderText="Select a date"
                      dateFormat="dd/MM/yyyy"
                      className="w-full bg-[#030712] border border-slate-805 focus:border-security-gold text-sm text-slate-200 rounded-xl px-4 py-3 focus:outline-none transition-colors duration-200"
                    />
                  </div>

                  {/* Preferred Time Slot */}
                  <div className="space-y-2">
                    <label htmlFor="preferred_time" className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-security-gold" />
                      Preferred Time Slot
                    </label>
                    <select
                      id="preferred_time"
                      name="preferred_time"
                      value={formData.preferred_time}
                      onChange={handleInputChange}
                      className="w-full bg-[#030712] border border-slate-800 focus:border-security-gold text-sm text-slate-200 rounded-xl px-4 py-3.5 focus:outline-none transition-colors duration-200"
                    >
                      {timeSlots.map((slot, i) => (
                        <option key={i} value={slot} className="bg-security-card">
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Additional Requirements */}
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="additional_requirements" className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Additional Requirements / Specific Site details
                    </label>
                    <textarea
                      id="additional_requirements"
                      name="additional_requirements"
                      rows="4"
                      value={formData.additional_requirements}
                      onChange={handleInputChange}
                      placeholder="Mention specific details like ceiling height, wiring preference, STQC requirements, backup hours, etc."
                      className="w-full bg-[#030712] border border-slate-800 focus:border-security-gold text-sm text-slate-200 rounded-xl px-4 py-3 focus:outline-none transition-colors duration-200 resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-security-gold hover:bg-security-goldHover disabled:bg-slate-700 disabled:cursor-not-allowed text-security-bg font-extrabold uppercase tracking-wider rounded-xl transition-all duration-300 shadow-gold-glow flex items-center justify-center gap-2 cursor-pointer animate-pulse-slow"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-security-bg border-t-transparent rounded-full animate-spin" />
                        Generating Secure Ticket...
                      </>
                    ) : (
                      <>
                        Confirm Secure Booking
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          </div>
        )}

        {/* TAB 2: Track Installation Status */}
        {activeTab === 'track' && (
          <div className="max-w-3xl mx-auto animate-fade-in-up">
            <div className="glass-panel p-6 sm:p-8 bg-security-card/75 border-slate-900 shadow-premium space-y-4 text-left">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Search className="w-5 h-5 text-security-gold" />
                  Track Installation Status
                </h3>
                <p className="text-[10px] text-security-textGray mt-0.5 leading-relaxed">
                  Enter your Installation Track ID to view booking progress.
                </p>
              </div>

              <form onSubmit={handleTrackCheck} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="installationTrackId" className="text-[10px] font-bold uppercase text-slate-350 tracking-wider">
                    Track ID
                  </label>
                  <input
                    type="text"
                    id="installationTrackId"
                    required
                    value={trackId}
                    onChange={(e) => setTrackId(e.target.value)}
                    placeholder="e.g. TES20260001"
                    className="w-full bg-[#030712] border border-slate-800 focus:border-security-gold text-xs text-slate-250 rounded-lg px-3 py-2.5 focus:outline-none transition-colors duration-200"
                  />
                </div>
                <button
                  type="submit"
                  disabled={trackLoading}
                  className="w-full py-2.5 bg-security-gold hover:bg-security-goldHover disabled:bg-slate-700 text-security-bg font-extrabold uppercase text-xs rounded-lg transition-colors cursor-pointer"
                >
                  {trackLoading ? 'Checking...' : 'Check Status'}
                </button>
              </form>

              {trackError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg flex items-center gap-2 animate-fade-in">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{trackError}</span>
                </div>
              )}

              {trackResult && (
                <div className="p-4 bg-[#030712]/35 border border-slate-850 rounded-xl space-y-2.5 text-xs animate-fade-in">
                  <div className="flex justify-between items-center py-1.5 border-b border-slate-900/60">
                    <span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider">Track ID</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-slate-200 font-bold tracking-wider">{trackResult.track_id}</span>
                      <button
                        type="button"
                        onClick={copyTrackedId}
                        className="p-1 hover:bg-slate-900 text-slate-450 hover:text-security-gold rounded transition-colors cursor-pointer"
                        title="Copy Track ID"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {trackCopied && <span className="text-[8px] font-bold text-security-gold uppercase animate-fade-in">Copied</span>}
                    </div>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-slate-900/60">
                    <span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider">Booking Date</span>
                    <span className="text-slate-200 font-semibold">
                      {new Date(trackResult.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-slate-900/60">
                    <span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider">Current Status</span>
                    <span className={`px-2.5 py-0.5 rounded text-[8.5px] font-bold uppercase border select-none ${getStatusBadgeClass(trackResult.status)}`}>
                      {displayStatus(trackResult.status)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-slate-500 font-bold uppercase text-[9px] tracking-wider">Last Updated</span>
                    <span className="text-slate-200 font-semibold">
                      {new Date(trackResult.updated_at || trackResult.created_at).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
