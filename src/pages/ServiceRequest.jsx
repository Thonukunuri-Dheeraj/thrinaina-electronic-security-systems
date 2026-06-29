import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api, isCustomerAuthenticated, getStoredCustomer } from '../services/api';
import { Search, FileText, AlertTriangle, User, Phone, Mail, MapPin, Wrench, Copy } from 'lucide-react';

export default function ServiceRequest() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('raise'); // 'raise' or 'track'

  // Customer State
  const [customer, setCustomer] = useState(getStoredCustomer());
  const [isCustomerAuth, setIsCustomerAuth] = useState(isCustomerAuthenticated());
  const [showAuthWarning, setShowAuthWarning] = useState(false);

  // Tab 1: Raise request states
  const [formData, setFormData] = useState({
    name: customer?.full_name || '',
    mobile: (customer?.phone && customer?.phone !== 'N/A') ? customer.phone : '',
    email: customer?.email || '',
    address: '',
    request_type: '',
    description: ''
  });
  const [raiseLoading, setRaiseLoading] = useState(false);
  const [raiseError, setRaiseError] = useState(null);
  const [raiseSuccess, setRaiseSuccess] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [copiedId, setCopiedId] = useState(null);

  // Tab 2: Tracking states
  const [trackSearchId, setTrackSearchId] = useState(location.state?.searchBookingId || '');
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState(null);
  const [trackResult, setTrackResult] = useState(null);

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
      setRaiseError("Authentication Required: Please sign in or sign up to raise support tickets.");
      setTimeout(() => {
        navigate('/login', {
          state: {
            from: location.pathname,
            originalState: formData,
            warning: "Authentication Required: Please sign in or sign up to raise support tickets."
          }
        });
      }, 1500);
    }
  };

  const handleInputChange = (e) => {
    setShowSuccess(false);
    const { name, value } = e.target;
    let newValue;
    if (name === 'mobile') {
      newValue = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'name') {
      newValue = value.replace(/[^A-Za-z.\s]/g, '');
    } else {
      newValue = value;
    }
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const validateRaiseForm = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!/^[A-Za-z.\s]+$/.test(formData.name)) return 'Name must contain only letters and dot';
    if (!formData.mobile.trim()) return 'Mobile number is required';
    if (!/^\d{10}$/.test(formData.mobile)) return 'Provide a valid 10-digit mobile number';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.email.trim().toLowerCase().endsWith('@gmail.com')) {
      return 'Email must be a valid @gmail.com address';
    }
    if (!formData.address.trim()) return 'Please fill address details';
    if (!formData.request_type) return 'Please select a service request category';
    if (!formData.description.trim()) return 'Provide a description of the issue';
    return null;
  };

  const handleRaiseSubmit = async (e) => {
    e.preventDefault();
    setRaiseSuccess(null);
    setRaiseError(null);
    const valError = validateRaiseForm();
    if (valError) {
      setRaiseError(valError);
      return;
    }

    setRaiseLoading(true);
    try {
      const res = await api.requests.create(formData);
      if (res.success) {
        setRaiseSuccess(res.request);
        setShowSuccess(true);
        setFormKey(prev => prev + 1);
        setFormData({
          name: customer?.full_name || '',
          email: customer?.email || '',
          mobile: (customer?.phone && customer?.phone !== 'N/A') ? customer.phone : '',
          address: '',
          request_type: '',
          description: ''
        });
      } else {
        setRaiseError(res.message || 'Failed to submit service request.');
      }
    } catch (err) {
      setRaiseError(err.message || 'Connection failed. Please check backend connection.');
    } finally {
      setRaiseLoading(false);
    }
  };

  const triggerTracking = async (trackIdVal) => {
    if (!trackIdVal.trim()) return;
    setTrackLoading(true);
    setTrackError(null);
    setTrackResult(null);
    try {
      const res = await api.requests.track(trackIdVal.trim());
      if (res.success) {
        setTrackResult(res.request);
      } else {
        setTrackError('Invalid Request ID');
      }
    } catch (err) {
      setTrackError(err.message || 'Invalid Request ID');
    } finally {
      setTrackLoading(false);
    }
  };

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    triggerTracking(trackSearchId);
  };

  const displayStatus = (status) => {
    if (status === 'Confirmed' || status === 'Technician Assigned' || status === 'Assigned') return 'Assigned';
    if (status === 'Resolved' || status === 'Completed') return 'Resolved';
    if (status === 'Closed' || status === 'Cancelled') return 'Cancelled';
    if (status === 'Pending' || status === 'Open' || status === 'In Progress') return 'In Progress';
    return status;
  };

  const getStatusBadgeClass = (status) => {
    const displayVal = displayStatus(status);
    switch (displayVal) {
      case 'Resolved':
        return 'bg-emerald-500/10 border-emerald-500/35 text-emerald-450';
      case 'Pending':
      case 'In Progress':
        return 'bg-orange-500/10 border-orange-500/35 text-orange-450';
      case 'Assigned':
        return 'bg-blue-500/10 border-blue-500/35 text-blue-405';
      case 'Cancelled':
        return 'bg-red-500/10 border-red-500/35 text-red-400';
      default:
        return 'bg-slate-900 border-slate-850 text-slate-450';
    }
  };

  return (
    <div className="pt-28 pb-20 relative">
      <div className="absolute inset-0 tech-grid opacity-20 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 space-y-8">

        {/* Header */}
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-security-gold block mb-3">
            Client Portal
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">Service Booking</h1>
          <p className="text-xs text-security-textGray mt-1.5 leading-relaxed">
            File hardware support requests, report failures, or track the real-time status of your pending bookings.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="max-w-3xl mx-auto">
          <div className="flex bg-[#030712] p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('raise')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 cursor-pointer ${
                activeTab === 'raise'
                  ? 'bg-security-gold text-security-bg shadow-gold-glow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              File Support Ticket
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
              Track Ticket Status
            </button>
          </div>
        </div>

        {/* TAB 1: File Support Ticket */}
        {activeTab === 'raise' && (
          <div className="max-w-3xl mx-auto space-y-8 animate-fade-in-up">
            {showSuccess && raiseSuccess ? (
              <div className="glass-panel p-8 bg-security-card/90 border-slate-900 shadow-premium text-center space-y-6 animate-fade-in-up">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/35 rounded-full flex items-center justify-center animate-radar-pulse">
                    <span className="text-2xl text-emerald-450 font-extrabold">✓</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 uppercase tracking-wide">
                    ✓ Service Request Submitted Successfully
                  </h2>
                </div>

                <p className="text-slate-350 text-sm max-w-md mx-auto leading-relaxed">
                  Your Service Request has been received successfully.
                </p>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 max-w-md mx-auto space-y-3">
                  <div>
                    <span className="text-slate-500 block text-[9.5px] uppercase font-bold tracking-widest mb-1">Track ID</span>
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-mono text-slate-150 font-black tracking-wider text-base">{raiseSuccess.request_id || raiseSuccess.track_id}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(raiseSuccess.request_id || raiseSuccess.track_id);
                          setCopiedId(raiseSuccess.id || 'copied');
                          setTimeout(() => setCopiedId(null), 2000);
                        }}
                        className="p-1.5 hover:bg-slate-900 text-slate-400 hover:text-security-gold rounded transition-colors cursor-pointer"
                        title="Copy Track ID"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {copiedId === (raiseSuccess.id || 'copied') && <span className="text-[8px] font-bold text-security-gold uppercase animate-fade-in">Copied</span>}
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
                  This request has been securely saved to your account.
                </p>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSuccess(false);
                      setRaiseSuccess(null);
                    }}
                    className="px-8 py-3 bg-security-gold hover:bg-security-goldHover text-security-bg font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all duration-300 shadow-gold-glow cursor-pointer"
                  >
                    Continue
                  </button>
                </div>
              </div>
            ) : (
              <>
                {raiseError && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-405 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{raiseError}</span>
                  </div>
                )}

                <div className="w-full">
                  {!isCustomerAuth && (
                    <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-semibold flex items-center justify-between gap-4 w-full animate-pulse">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-security-gold" />
                        <span>Authentication Required: Please sign in or sign up to raise support tickets.</span>
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
                    onSubmit={handleRaiseSubmit}
                    onClickCapture={handleGuestInteraction}
                    onFocusCapture={handleGuestInteraction}
                    noValidate
                    className="glass-panel p-6 sm:p-8 bg-security-card/75 border-slate-900 space-y-6 shadow-premium text-left"
                  >
                  <h3 className="text-lg font-bold text-slate-205 border-b border-slate-900/60 pb-3 flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-security-gold" />
                    Raise Support or Complaint Ticket
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-security-gold" />
                        Contact Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        readOnly
                        value={formData.name}
                        className="w-full bg-[#030712] border border-slate-805 text-sm text-slate-400 rounded-xl px-4 py-3 cursor-not-allowed opacity-70"
                      />
                    </div>
                    {/* Mobile */}
                    <div className="space-y-2">
                      <label htmlFor="mobile" className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-security-gold" />
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        id="mobile"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        className="w-full bg-[#030712] border border-slate-800 focus:border-security-gold text-sm text-slate-200 rounded-xl px-4 py-3 focus:outline-none"
                      />
                    </div>
                    {/* Email */}
                    <div className="space-y-2 md:col-span-2">
                      <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-security-gold" />
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        readOnly
                        value={formData.email}
                        className="w-full bg-[#030712] border border-slate-805 text-sm text-slate-400 rounded-xl px-4 py-3 cursor-not-allowed opacity-70"
                      />
                    </div>
                    {/* Address */}
                    <div className="space-y-2 md:col-span-2">
                      <label htmlFor="address" className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-security-gold" />
                        Site Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="address"
                        name="address"
                        rows="3"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full bg-[#030712] border border-slate-800 focus:border-security-gold text-sm text-slate-200 rounded-xl px-4 py-3 focus:outline-none resize-none"
                      />
                    </div>
                    {/* Request Type */}
                    <div className="space-y-2">
                      <label htmlFor="request_type" className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-security-gold" />
                        Request Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="request_type"
                        name="request_type"
                        value={formData.request_type}
                        onChange={handleInputChange}
                        className="w-full bg-[#030712] border border-slate-805 focus:border-security-gold text-sm text-slate-200 rounded-xl px-4 py-3.5 focus:outline-none transition-colors duration-200"
                      >
                        <option value="" disabled className="bg-security-card">Select CCTV Service Issue</option>
                        <option value="Camera Not Working" className="bg-security-card">Camera Not Working</option>
                        <option value="DVR/NVR Not Recording" className="bg-security-card">DVR/NVR Not Recording</option>
                        <option value="Mobile Phone Viewing Issue" className="bg-security-card">Mobile Phone Viewing Issue</option>
                        <option value="Power Supply Problem" className="bg-security-card">Power Supply Problem</option>
                        <option value="Camera Cable Damage" className="bg-security-card">Camera Cable Damage</option>
                        <option value="Poor Video Quality" className="bg-security-card">Poor Video Quality</option>
                        <option value="Night Vision Issue" className="bg-security-card">Night Vision Issue</option>
                        <option value="Storage/Hard Disk Issue" className="bg-security-card">Storage/Hard Disk Issue</option>
                      </select>
                    </div>
                    {/* Description */}
                    <div className="space-y-2 md:col-span-2">
                      <label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        Problem Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        rows="3"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full bg-[#030712] border border-slate-800 focus:border-security-gold text-sm text-slate-200 rounded-xl px-4 py-3 focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={raiseLoading}
                    className="w-full py-4 bg-security-gold text-security-bg font-extrabold uppercase text-xs rounded-xl transition-all duration-300 shadow-gold-glow cursor-pointer"
                  >
                    {raiseLoading ? 'Submitting...' : 'Submit Support Ticket'}
                  </button>
                  </form>
                </div>
              </>
            )}

          </div>
        )}

        {/* TAB 2: Track Ticket Status */}
        {activeTab === 'track' && (
          <div className="max-w-3xl mx-auto animate-fade-in-up">
            <div className="glass-panel p-6 sm:p-8 bg-security-card/75 border-slate-900 shadow-premium space-y-4 text-left">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Search className="w-5 h-5 text-security-gold" />
                  Track Service Status
                </h3>
                <p className="text-[10px] text-security-textGray mt-0.5 leading-relaxed">
                  Enter your Service Track ID to view current progress.
                </p>
              </div>

              <form onSubmit={handleTrackSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="trackSearchId" className="text-[10px] font-bold uppercase text-slate-350 tracking-wider">
                    Track ID
                  </label>
                  <input
                    type="text"
                    id="trackSearchId"
                    required
                    value={trackSearchId}
                    onChange={(e) => setTrackSearchId(e.target.value)}
                    placeholder="e.g. TES20260003"
                    className="w-full bg-[#030712] border border-slate-800 focus:border-security-gold text-xs text-slate-250 rounded-lg px-3 py-2.5 focus:outline-none"
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
                        onClick={() => {
                          navigator.clipboard.writeText(trackResult.track_id);
                          setCopiedId('tracked');
                          setTimeout(() => setCopiedId(null), 2000);
                        }}
                        className="p-1 hover:bg-slate-900 text-slate-455 hover:text-security-gold rounded transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      {copiedId === 'tracked' && <span className="text-[8px] font-bold text-security-gold uppercase animate-fade-in">Copied</span>}
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
