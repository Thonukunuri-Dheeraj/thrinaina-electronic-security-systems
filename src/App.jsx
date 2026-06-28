import { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import Packages from './pages/Packages';
import Booking from './pages/Booking';
import ServiceRequest from './pages/ServiceRequest';
import Contact from './pages/Contact';
import { isCustomerAuthenticated, api, customerLogout, getStoredCustomer } from './services/api';
import logoImg from './assets/logo.jpg';
import { AlertTriangle, User, Mail, LogOut, CheckCircle, Copy, X, Wrench, Eye, EyeOff } from 'lucide-react';

// Customer Account Dashboard Modal Overlay
function AccountDashboardModal({ onClose, onLogout }) {
  const [customer, setCustomer] = useState(getStoredCustomer());
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'installations', 'services'
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [editName, setEditName] = useState(customer?.full_name || '');
  const [editPhone, setEditPhone] = useState(customer?.phone || '');
  const [editPassword, setEditPassword] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(null);

  // History states
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const displayStatus = (status, type) => {
    if (type === 'Service') {
      if (status === 'Confirmed' || status === 'Technician Assigned' || status === 'Assigned') return 'Assigned';
      if (status === 'Resolved' || status === 'Completed') return 'Resolved';
      if (status === 'Closed' || status === 'Cancelled') return 'Cancelled';
      if (status === 'Pending' || status === 'Open' || status === 'In Progress') return 'In Progress';
      return status;
    }
    if (status === 'Confirmed' || status === 'Technician Assigned' || status === 'Assigned') return 'Technician Assigned';
    if (status === 'Resolved' || status === 'Completed') return 'Completed';
    if (status === 'Closed' || status === 'Cancelled') return 'Cancelled';
    return status;
  };

  const getStatusBadgeClass = (status, type) => {
    const displayVal = displayStatus(status, type);
    switch (displayVal) {
      case 'Completed':
      case 'Resolved':
        return 'bg-emerald-500/10 border-emerald-500/35 text-emerald-450';
      case 'Pending':
      case 'In Progress':
        return type === 'Service'
          ? 'bg-orange-500/10 border-orange-500/35 text-orange-450'
          : 'bg-amber-500/10 border-amber-500/35 text-amber-400';
      case 'Technician Assigned':
      case 'Assigned':
        return 'bg-blue-500/10 border-blue-500/35 text-blue-405';
      case 'Cancelled':
        return 'bg-red-500/10 border-red-500/35 text-red-400';
      default:
        return 'bg-slate-900 border-slate-850 text-slate-450';
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      setHistoryLoading(true);
      try {
        const res = await api.bookings.getMyBookings();
        if (res.success) {
          setHistory(res.bookings);
        }
      } catch (err) {
        console.error('Error fetching dashboard bookings:', err);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setEditError(null);
    setEditSuccess(null);

    if (!editName.trim()) {
      setEditError('Name is required');
      return;
    }
    if (!editPhone.trim() || !/^\d{10}$/.test(editPhone)) {
      setEditError('Provide a valid 10-digit phone number');
      return;
    }

    setEditLoading(true);
    try {
      const res = await api.customerAuth.updateProfile({
        full_name: editName,
        phone: editPhone,
        password: editPassword
      });
      if (res.success) {
        setEditSuccess('Profile updated successfully!');
        setCustomer(res.user);
        setIsEditing(false);
        setEditPassword('');
      }
    } catch (err) {
      setEditError(err.message || 'Failed to update profile.');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel max-w-3xl w-full border-slate-900/60 bg-security-card/95 shadow-gold-glow flex flex-col md:flex-row rounded-2xl overflow-hidden min-h-[480px] relative animate-fade-in-up">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-950/60 border border-slate-850 hover:border-security-gold/40 text-slate-400 hover:text-security-gold transition-colors cursor-pointer z-50"
          title="Close Dashboard"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Sidebar */}
        <div className="w-full md:w-60 bg-[#030712]/60 p-5 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-900/80">
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-900 pb-4">
              <div className="w-10 h-10 rounded-full bg-blue-950/40 border border-security-gold/30 flex items-center justify-center font-bold text-security-gold text-xs shrink-0 select-none">
                {customer?.full_name?.split(' ').map(n => n[0]).join('') || 'C'}
              </div>
              <div className="truncate">
                <span className="font-bold text-slate-100 text-xs block truncate">{customer?.full_name}</span>
                <span className="text-[10px] text-security-textGray block truncate">{customer?.email}</span>
              </div>
            </div>

            <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible py-1 md:py-0 select-none">
              <button
                onClick={() => { setActiveTab('profile'); setEditError(null); setEditSuccess(null); }}
                className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap cursor-pointer w-full text-left ${activeTab === 'profile'
                    ? 'bg-security-gold text-security-bg'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                  }`}
              >
                <User className="w-4 h-4 shrink-0" />
                Profile Info
              </button>
              <button
                onClick={() => setActiveTab('installations')}
                className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap cursor-pointer w-full text-left ${activeTab === 'installations'
                    ? 'bg-security-gold text-security-bg'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                  }`}
              >
                <CheckCircle className="w-4 h-4 shrink-0" />
                Installations
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors whitespace-nowrap cursor-pointer w-full text-left ${activeTab === 'services'
                    ? 'bg-security-gold text-security-bg'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                  }`}
              >
                <Wrench className="w-4 h-4 shrink-0" />
                Service History
              </button>
            </nav>
          </div>

          <div className="pt-6 border-t border-slate-900 mt-6 md:mt-0">
            <button
              onClick={onLogout}
              className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-400 hover:bg-red-500/5 rounded-lg w-full text-left cursor-pointer transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Content Container */}
        <div className="flex-grow p-6 sm:p-8 flex flex-col justify-between relative mt-4 md:mt-0">

          {/* 1. Profile Panel */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <User className="w-5 h-5 text-security-gold" />
                  Your Customer Profile
                </h3>
                <p className="text-[11px] text-security-textGray mt-0.5">
                  View and manage your account contact preferences below.
                </p>
              </div>

              {editSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-450 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <span className="bg-emerald-500 text-security-bg w-5 h-5 rounded-full flex items-center justify-center font-extrabold text-[10px] select-none">✓</span>
                  <span>{editSuccess}</span>
                </div>
              )}

              {editError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              {!isEditing ? (
                <div className="space-y-4 border-t border-slate-900 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="bg-[#030712]/35 border border-slate-900/60 p-3.5 rounded-xl">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block mb-0.5 tracking-wider">Full Name</span>
                      <span className="font-semibold text-slate-200 text-sm">{customer?.full_name}</span>
                    </div>
                    <div className="bg-[#030712]/35 border border-slate-900/60 p-3.5 rounded-xl">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block mb-0.5 tracking-wider">Email Address</span>
                      <span className="font-semibold text-slate-200 font-mono text-sm">{customer?.email}</span>
                    </div>
                    <div className="bg-[#030712]/35 border border-slate-900/60 p-3.5 rounded-xl">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block mb-0.5 tracking-wider">Phone Number</span>
                      <span className="font-semibold text-slate-200 font-mono text-sm">{(customer?.phone && customer.phone !== 'N/A') ? customer.phone : 'Not Configured'}</span>
                    </div>
                    <div className="bg-[#030712]/35 border border-slate-900/60 p-3.5 rounded-xl">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block mb-0.5 tracking-wider">Access Type</span>
                      <span className="font-bold text-security-gold uppercase tracking-wider text-xs">
                        {customer?.google_id ? 'Linked Google Account' : 'Credentials Password Login'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-5 py-2.5 bg-slate-900 border border-slate-805 hover:border-security-gold text-slate-200 hover:text-security-gold font-bold text-xs uppercase rounded-xl transition-all cursor-pointer"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleProfileSave} className="space-y-4 border-t border-slate-900 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="edit_name" className="text-[10px] font-bold uppercase text-slate-355">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="edit_name"
                        required
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full bg-[#030712] border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-security-gold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="edit_phone" className="text-[10px] font-bold uppercase text-slate-355">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="edit_phone"
                        required
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full bg-[#030712] border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-security-gold"
                      />
                    </div>
                    {!customer?.google_id && (
                      <div className="space-y-1 sm:col-span-2">
                        <label htmlFor="edit_pass" className="text-[10px] font-bold uppercase text-slate-350">
                          Update Password <span className="text-slate-500 normal-case font-normal">(leave blank to keep current)</span>
                        </label>
                        <input
                          type="password"
                          id="edit_pass"
                          value={editPassword}
                          onChange={(e) => setEditPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#030712] border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-security-gold"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={editLoading}
                      className="px-5 py-2.5 bg-security-gold hover:bg-security-goldHover text-security-bg font-extrabold text-xs uppercase rounded-xl transition-all cursor-pointer shadow-md"
                    >
                      {editLoading ? 'Saving...' : 'Save Profile'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setEditName(customer?.full_name || '');
                        setEditPhone(customer?.phone || '');
                        setEditPassword('');
                        setEditError(null);
                      }}
                      className="px-5 py-2.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs uppercase cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* 2. Installations History Panel */}
          {activeTab === 'installations' && (
            <div className="space-y-4 flex-grow flex flex-col justify-start">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-security-gold" />
                  Installation Bookings
                </h3>
                <p className="text-[11px] text-security-textGray mt-0.5">
                  Track dates and current status of your submitted system installation slots.
                </p>
              </div>

              <div className="border-t border-slate-900 pt-4 flex-grow overflow-y-auto max-h-[300px] pr-1 space-y-3">
                {historyLoading ? (
                  <div className="text-center py-8 text-xs text-slate-500 font-bold uppercase tracking-wider animate-pulse">
                    Syncing database...
                  </div>
                ) : history.filter(b => b.booking_type === 'Installation').length === 0 ? (
                  <div className="text-center py-12 text-slate-500 italic text-xs">
                    No installation bookings placed yet.
                  </div>
                ) : (
                  history
                    .filter(b => b.booking_type === 'Installation')
                    .map((b) => (
                      <div key={b.id} className="p-3.5 bg-[#030712]/35 border border-slate-900/60 rounded-xl flex items-center justify-between text-xs hover:border-slate-805 transition-colors">
                        <div className="space-y-1 max-w-[70%]">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-250 tracking-wider text-xs">{b.track_id}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(b.track_id);
                                setCopiedId(b.id);
                                setTimeout(() => setCopiedId(null), 2000);
                              }}
                              className="p-1 hover:bg-slate-900 text-slate-450 hover:text-security-gold rounded transition-colors cursor-pointer"
                              title="Copy ID"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            {copiedId === b.id && <span className="text-[8px] font-bold text-security-gold uppercase animate-fade-in">Copied</span>}
                          </div>
                          <span className="text-slate-400 block font-semibold text-[10px]">{b.service_type}</span>
                          <span className="text-[9.5px] text-slate-500 block font-mono">
                            Booking Date: {new Date(b.created_at).toLocaleDateString()}
                          </span>
                          <span className="text-[9.5px] text-slate-500 block font-mono">
                            Slot: {b.preferred_date} @ {b.preferred_time}
                          </span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded text-[8.5px] font-bold uppercase border select-none ${getStatusBadgeClass(b.status, b.booking_type)}`}>
                          {displayStatus(b.status, b.booking_type)}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* 3. Services History Panel */}
          {activeTab === 'services' && (
            <div className="space-y-4 flex-grow flex flex-col justify-start">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-security-gold" />
                  Service Request Tickets
                </h3>
                <p className="text-[11px] text-security-textGray mt-0.5">
                  Track live diagnostic, repair, and maintenance requests linked to your account.
                </p>
              </div>

              <div className="border-t border-slate-900 pt-4 flex-grow overflow-y-auto max-h-[300px] pr-1 space-y-3">
                {historyLoading ? (
                  <div className="text-center py-8 text-xs text-slate-500 font-bold uppercase tracking-wider animate-pulse">
                    Syncing database...
                  </div>
                ) : history.filter(b => b.booking_type === 'Service').length === 0 ? (
                  <div className="text-center py-12 text-slate-500 italic text-xs">
                    No service request tickets found.
                  </div>
                ) : (
                  history
                    .filter(b => b.booking_type === 'Service')
                    .map((b) => (
                      <div key={b.id} className="p-3.5 bg-[#030712]/35 border border-slate-900/60 rounded-xl flex items-center justify-between text-xs hover:border-slate-805 transition-colors">
                        <div className="space-y-1 max-w-[70%]">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-250 tracking-wider text-xs">{b.track_id}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(b.track_id);
                                setCopiedId(b.id);
                                setTimeout(() => setCopiedId(null), 2000);
                              }}
                              className="p-1 hover:bg-slate-900 text-slate-450 hover:text-security-gold rounded transition-colors cursor-pointer"
                              title="Copy ID"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            {copiedId === b.id && <span className="text-[8px] font-bold text-security-gold uppercase animate-fade-in">Copied</span>}
                          </div>
                          <span className="text-slate-400 block font-semibold text-[10px]">{b.service_type}</span>
                          <span className="text-[9.5px] text-slate-500 block font-mono">
                            Booking Date: {new Date(b.created_at).toLocaleDateString()}
                          </span>
                          <p className="text-[9.5px] text-slate-500 block truncate max-w-xs">{b.text || b.description}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded text-[8.5px] font-bold uppercase border select-none ${getStatusBadgeClass(b.status, b.booking_type)}`}>
                          {displayStatus(b.status, b.booking_type)}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}



function AppContent() {
  // Customer Portal Gate States
  const [isCustomerAuth, setIsCustomerAuth] = useState(isCustomerAuthenticated());
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'register'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP / Forgot-Password step states
  const [authStep, setAuthStep] = useState('form'); // 'form' | 'otp' | 'forgot' | 'reset' | 'done'
  const [pendingEmail, setPendingEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);  // seconds
  const [otpSuccess, setOtpSuccess] = useState('');

  // Welcome Splash Screen/Preloader State
  const [showPreloader, setShowPreloader] = useState(() => {
    const hasPreloaderShown = sessionStorage.getItem('thrinaina_preloader_shown');
    if (hasPreloaderShown) {
      return false;
    }
    sessionStorage.setItem('thrinaina_preloader_shown', 'true');
    return true;
  });
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!showPreloader) return;

    let start = null;
    const delay = 2150;
    const duration = 700;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;

      if (elapsed < delay) {
        setProgress(0);
        requestAnimationFrame(animate);
      } else {
        const tickingElapsed = elapsed - delay;
        const progressVal = Math.min((tickingElapsed / duration) * 100, 100);
        setProgress(Math.floor(progressVal));

        if (tickingElapsed < duration) {
          requestAnimationFrame(animate);
        } else {
          setIsFadingOut(true);
          const timer = setTimeout(() => {
            setShowPreloader(false);
          }, 600);
          return () => clearTimeout(timer);
        }
      }
    };

    const animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [showPreloader]);

  // ── Countdown timer for OTP resend cooldown ──
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setAuthError(null);

    if (!authEmail.trim() || !/^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(authEmail)) {
      setAuthError('Email address must end with @gmail.com');
      return;
    }

    setAuthLoading(true);
    try {
      const res = await api.customerAuth.login(authEmail, authPassword);
      if (res.success) {
        setIsCustomerAuth(true);
        window.dispatchEvent(new Event('storage'));
      }
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('verify')) {
        setPendingEmail(authEmail);
        setResendCooldown(0);
        setAuthStep('otp');
        setAuthError('Your email is not verified yet. Enter the OTP sent to your inbox.');
      } else {
        setAuthError(err.message || 'Invalid email or password.');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError(null);

    if (!authName.trim()) { setAuthError('Name is required'); return; }
    if (!/^[A-Za-z\s]+$/.test(authName)) { setAuthError('Name must contain only letters'); return; }
    if (!authPhone.trim() || !/^\d{10}$/.test(authPhone)) { setAuthError('Provide a valid 10-digit mobile number'); return; }
    if (!authEmail.trim() || !/^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(authEmail)) { setAuthError('Email address must end with @gmail.com'); return; }
    if (authPassword.length < 6) { setAuthError('Password must be at least 6 characters long'); return; }
    if (authPassword !== authConfirmPassword) { setAuthError('Passwords do not match'); return; }

    setAuthLoading(true);
    try {
      const res = await api.customerAuth.register({
        full_name: authName,
        email: authEmail,
        phone: authPhone,
        password: authPassword,
        confirmPassword: authConfirmPassword
      });
      if (res.success) {
        setPendingEmail(authEmail);
        setOtpValue("");
        setAuthStep("otp");
        setOtpSuccess(res.message || "Verification code sent to your email.");
        setAuthError(null);
      }
    } catch (err) {
      setAuthError(err.message || 'Registration failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setAuthError(null);
    if (!otpValue.trim() || otpValue.length !== 6) {
      setAuthError('Please enter the 6-digit code.');
      return;
    }
    setAuthLoading(true);
    try {
      const res = await api.customerAuth.verifyOTP(pendingEmail, otpValue);
      if (res.success) {
        setIsCustomerAuth(true);
        window.dispatchEvent(new Event('storage'));
      }
    } catch (err) {
      setAuthError(err.message || 'Invalid or expired OTP.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setAuthError(null);
    try {
      await api.customerAuth.resendOTP(pendingEmail);
      setResendCooldown(60);
      setOtpSuccess('A new code has been sent to ' + pendingEmail);
    } catch (err) {
      setAuthError(err.message || 'Could not resend OTP.');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setAuthError(null);
    if (!forgotEmail.trim()) { setAuthError('Please enter your email address.'); return; }
    setAuthLoading(true);
    try {
      await api.customerAuth.forgotPassword(forgotEmail);
      setPendingEmail(forgotEmail);
      setResendCooldown(60);
      setAuthStep('reset');
      setOtpSuccess('A password reset code has been sent to ' + forgotEmail);
    } catch (err) {
      setAuthError(err.message || 'Request failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setAuthError(null);
    if (!resetOtp.trim() || resetOtp.length !== 6) { setAuthError('Please enter the 6-digit reset code.'); return; }
    if (newPassword.length < 6) { setAuthError('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirmNewPassword) { setAuthError('Passwords do not match.'); return; }
    setAuthLoading(true);
    try {
      const res = await api.customerAuth.resetPassword(pendingEmail, resetOtp, newPassword, confirmNewPassword);
      if (res.success) {
        setAuthStep('form');
        setAuthTab('login');
        setAuthError(null);
        setOtpSuccess('Password reset! You can now log in with your new password.');
        setResetOtp(''); setNewPassword(''); setConfirmNewPassword('');
      }
    } catch (err) {
      setAuthError(err.message || 'Reset failed.');
    } finally {
      setAuthLoading(false);
    }
  };



  const handleLogout = () => {
    customerLogout();
    setIsCustomerAuth(false);
    setIsDashboardOpen(false);
    window.dispatchEvent(new Event('storage'));
    window.location.reload();
  };

  if (showPreloader) {
    return (
      <div className="flex flex-col min-h-screen bg-security-bg text-slate-100 selection:bg-security-gold selection:text-security-bg">
        <div className="fixed inset-0 z-[9999] pointer-events-none flex flex-col justify-between overflow-hidden">
          {/* Top Panel (Gate) */}
          <div
            className={`w-full h-1/2 relative transition-transform duration-[800ms] ease-in-out ${isFadingOut ? '-translate-y-full' : 'translate-y-0'
              }`}
            style={{
              background: 'linear-gradient(to bottom, #070b19 0%, #03050c 100%)',
            }}
          >
            <div className="absolute inset-0 bg-security-grid-overlay opacity-15" />
            <div className="absolute inset-0 crt-overlay opacity-20" />
            <div className="absolute top-8 left-8 w-12 h-12 border-t-2 border-l-2 border-security-gold/20" />
            <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-security-gold/20" />
          </div>

          {/* Bottom Panel (Gate) */}
          <div
            className={`w-full h-1/2 relative transition-transform duration-[800ms] ease-in-out ${isFadingOut ? 'translate-y-full' : 'translate-y-0'
              }`}
            style={{
              background: 'linear-gradient(to top, #070b19 0%, #03050c 100%)',
            }}
          >
            <div className="absolute inset-0 bg-security-grid-overlay opacity-15" />
            <div className="absolute inset-0 crt-overlay opacity-20" />
            <div className="absolute bottom-8 left-8 w-12 h-12 border-b-2 border-l-2 border-security-gold/20" />
            <div className="absolute bottom-8 right-8 w-12 h-12 border-b-2 border-r-2 border-security-gold/20" />
          </div>

          {/* Centered Contents */}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center z-10 transition-all duration-500 ease-out ${isFadingOut ? 'opacity-0 scale-110 pointer-events-none' : 'opacity-100 scale-100'
              }`}
          >
            <div className="absolute w-[200px] h-[200px] bg-white/20 blur-[60px] rounded-full pointer-events-none animate-pulse" />
            <div className="absolute w-[300px] h-[300px] bg-security-blue/20 blur-[100px] rounded-full pointer-events-none" />

            <div className="absolute z-20 pointer-events-none animate-camera-sequence flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-80 h-80">
                <defs>
                  <clipPath id="camera-dome-clip">
                    <path d="M13,48 A25,25 0 0,0 63,48 Z" />
                  </clipPath>
                </defs>

                <circle cx="38" cy="48" r="34" fill="none" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="3 5" className="animate-hud-ring opacity-60" />
                <circle cx="38" cy="48" r="29" fill="none" stroke="#c9a84c" strokeWidth="0.75" strokeDasharray="15 35" className="animate-hud-ring-reverse opacity-50" />

                <g className="opacity-45 animate-hud-focus">
                  <path d="M 30 34 L 24 34 L 24 40" fill="none" stroke="#3b82f6" strokeWidth="0.8" />
                  <path d="M 46 34 L 52 34 L 52 40" fill="none" stroke="#3b82f6" strokeWidth="0.8" />
                  <path d="M 30 62 L 24 62 L 24 56" fill="none" stroke="#3b82f6" strokeWidth="0.8" />
                  <path d="M 46 62 L 52 62 L 52 56" fill="none" stroke="#3b82f6" strokeWidth="0.8" />
                </g>

                <line x1="76" y1="20" x2="76" y2="95" stroke="#cbd5e1" strokeWidth="1.5" opacity="0.9" />
                <path d="M72,10 L94,10 A2,2 0 0,1 96,12 L96,28 A2,2 0 0,1 94,30 L72,30 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
                <circle cx="91" cy="14" r="1.5" fill="#475569" />
                <circle cx="91" cy="26" r="1.5" fill="#475569" />
                <path d="M44,18 L76,18 L76,24 L48,24 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
                <path d="M46,24 L76,24 L76,26 L48,26 Z" fill="#cbd5e1" />
                <path d="M13,48 A25,25 0 0,0 63,48 Z" fill="#020202" />
                <path d="M16,52 A22,22 0 0,0 60,52" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.2" strokeLinecap="round" />

                <g className="animate-camera-pan" clipPath="url(#camera-dome-clip)">
                  <g className="animate-camera-squish">
                    <circle cx="38" cy="60" r="9" fill="#0c0c0e" stroke="#222" strokeWidth="1.5" />
                    <circle cx="38" cy="60" r="5" fill="#020617" stroke="#3b82f6" strokeWidth="1.5" />
                    <circle cx="36.5" cy="58.5" r="1.2" fill="#ffffff" opacity="0.9" />
                    <circle cx="33" cy="68" r="2.2" fill="#fef08a" style={{ filter: 'drop-shadow(0 0 4px #eab308)' }} />
                    <circle cx="43" cy="68" r="2.2" fill="#fef08a" style={{ filter: 'drop-shadow(0 0 4px #eab308)' }} />
                  </g>
                </g>

                <path d="M22,33 L10,8 C9.5,7 8.5,7.5 9,8.5 L18,36 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                <path d="M54,33 L66,8 C66.5,7 67.5,7.5 67,8.5 L58,36 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
                <path d="M13,48 C13,30 20,24 38,24 C56,24 63,30 63,48 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.2" />
                <text x="38" y="42" textAnchor="middle" fill="#94a3b8" fontSize="4.2" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.4">THRINAINA</text>
                <circle cx="38" cy="32" r="1.2" fill="#ef4444" className="animate-led-sequence" style={{ filter: 'drop-shadow(0 0 3px #ef4444)' }} />
              </svg>
            </div>

            <div className="absolute inset-0 bg-white z-30 pointer-events-none animate-shutter-flash" />

            <svg viewBox="0 0 100 100" className="w-16 h-16 absolute animate-star-swoosh z-20 pointer-events-none" style={{ color: '#C9A84C', filter: 'drop-shadow(0 0 18px #C9A84C)' }}>
              <path fill="currentColor" d="M50 0 C50 33, 67 50, 100 50 C67 50, 50 67, 50 100 C50 67, 33 50, 0 50 C33 50, 50 33, 50 0 Z" />
            </svg>
            <svg viewBox="0 0 100 100" className="w-10 h-10 absolute animate-star-swoosh-2 z-20 pointer-events-none" style={{ color: '#4A90E2', filter: 'drop-shadow(0 0 14px #4A90E2)' }}>
              <path fill="currentColor" d="M50 0 C50 33, 67 50, 100 50 C67 50, 50 67, 50 100 C50 67, 33 50, 0 50 C33 50, 50 33, 50 0 Z" />
            </svg>
            <svg viewBox="0 0 100 100" className="w-7 h-7 absolute animate-star-swoosh-3 z-20 pointer-events-none" style={{ color: '#10B981', filter: 'drop-shadow(0 0 10px #10B981)' }}>
              <path fill="currentColor" d="M50 0 C50 33, 67 50, 100 50 C67 50, 50 67, 50 100 C50 67, 33 50, 0 50 C33 50, 50 33, 50 0 Z" />
            </svg>

            <div className="flex flex-col items-center max-w-md px-6 text-center">
              <div className="relative mb-8 w-28 h-28 rounded-full overflow-hidden border-2 border-white bg-white shadow-[0_15px_45px_rgba(0,0,0,0.95)] animate-logo-reveal z-10">
                <img src={logoImg} alt="Thrinaina Logo" className="w-full h-full object-contain p-1.5 select-none" />
              </div>

              <div className="animate-text-reveal flex flex-col items-center">
                <h1 className="text-3xl font-extrabold uppercase tracking-[0.25em] mb-2 flex items-center justify-center colourful-text-gradient">
                  <span>THRINAINA</span>
                  <span className="font-black ml-3">SECURITY</span>
                </h1>
                <p className="text-[10px] tracking-[0.3em] text-security-textGray uppercase mb-8">
                  AI SMART INTEGRATIONS & SURVEILLANCE
                </p>
              </div>

              <div className="animate-loader-reveal flex flex-col items-center w-full">
                <div className="w-64 flex flex-col items-center gap-2">
                  <div className="w-full h-[5px] bg-slate-900/90 rounded-full overflow-hidden relative border border-slate-800/80 shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)]">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-security-blue via-security-gold to-security-lightBlue rounded-full shadow-[0_0_10px_#C9A84C]"
                      style={{ width: `${progress}%`, transition: 'width 0.1s linear' }}
                    />
                  </div>
                  <div className="flex justify-between w-full font-mono text-[10px] text-security-textGray tracking-wider px-0.5">
                    <span>SECTOR_01</span>
                    <span className="text-security-gold font-bold">{progress}%</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-2.5 text-[9px] tracking-[0.2em] text-slate-500 uppercase font-mono">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_8px_#22c55e]"></span>
                  </span>
                  <span>CONNECTION_SECURE_SSL</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Auth gate for client links
  if (!showPreloader && !isCustomerAuth) {
    return (
      <div className="min-h-screen bg-security-bg text-slate-100 flex justify-center items-center relative py-12 px-4 select-none overflow-hidden">
        <div className="cctv-bg" aria-hidden="true" />
        <div className="absolute inset-0 security-grid-overlay opacity-[0.04] pointer-events-none" />
        <div className="absolute inset-0 tech-grid opacity-20 pointer-events-none" />

        <div className="absolute w-[200px] h-[200px] bg-security-blue/15 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute w-[300px] h-[300px] bg-security-gold/10 blur-[120px] rounded-full pointer-events-none" />

        {/* Spinning HUD Target behind the card */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] opacity-[0.035] pointer-events-none select-none hidden md:block">
          <svg viewBox="0 0 100 100" className="w-full h-full text-security-blue animate-scan-rotate-reverse">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 5" />
            <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="15 35" />
            <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" strokeWidth="0.3" />
            <line x1="50" y1="0" x2="50" y2="10" stroke="currentColor" strokeWidth="0.5" />
            <line x1="50" y1="90" x2="50" y2="100" stroke="currentColor" strokeWidth="0.5" />
            <line x1="0" y1="50" x2="10" y2="50" stroke="currentColor" strokeWidth="0.5" />
            <line x1="90" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.5" />
          </svg>
        </div>

        {/* 2 Floating CCTV Camera Animations (Top-Left & Top-Right, animated, colorful) */}

        {/* 1. Top-Left Dome Camera */}
        <div className="absolute left-[6%] top-[10%] w-28 h-28 sm:w-32 sm:h-32 hidden md:block animate-float-slow hover:scale-110 transition-transform duration-300 pointer-events-none select-none">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(59,130,246,0.35)]">
            <path d="M20 20 H80 L70 30 H30 Z" fill="#1e293b" stroke="#475569" strokeWidth="1.5" />
            <path d="M30 30 A20 20 0 0 0 70 30" fill="rgba(30, 41, 59, 0.2)" stroke="#cbd5e1" strokeWidth="1" />
            <g className="animate-dome-scan" style={{ transformOrigin: '50px 30px' }}>
              <path d="M40 30 L43 52 H57 L60 30 Z" fill="#1e293b" stroke="#475569" strokeWidth="1.2" />
              <circle cx="50" cy="45" r="6.5" fill="#020617" stroke="#3b82f6" strokeWidth="1.8" />
              <circle cx="48" cy="43" r="1.8" fill="#ffffff" opacity="0.8" />
              <circle cx="44" cy="38" r="1.2" fill="#10b981" className="animate-led-blink" style={{ filter: 'drop-shadow(0 0 4px #10b981)' }} />
            </g>
          </svg>
        </div>

        {/* 2. Top-Right Bullet Camera */}
        <div className="absolute right-[6%] top-[10%] w-28 h-28 sm:w-32 sm:h-32 hidden md:block animate-float-medium hover:scale-110 transition-transform duration-300 pointer-events-none select-none">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_12px_rgba(201,168,76,0.35)]">
            <path d="M80 65 H70 V45 H80 Z" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
            <path d="M70 55 H55 V48 H70 Z" fill="#334155" stroke="#475569" strokeWidth="1" />
            <g className="animate-bullet-pan" style={{ transformOrigin: '60px 52px' }}>
              <rect x="25" y="38" width="32" height="24" rx="2" fill="#1e293b" stroke="#475569" strokeWidth="1.2" />
              <path d="M20 35 H58 L55 38 H22 Z" fill="#c9a84c" />
              <ellipse cx="25" cy="50" rx="1.5" ry="6.5" fill="#020617" stroke="#3b82f6" strokeWidth="1" />
              <circle cx="45" cy="46" r="1.5" fill="#ef4444" className="animate-led-blink" style={{ filter: 'drop-shadow(0 0 4px #ef4444)' }} />
            </g>
          </svg>
        </div>

        {/* Center Login Card */}
        <div className="max-w-md w-full relative z-10 space-y-6 animate-fade-in-up">
          <div className="text-center">
            <div className="inline-block relative mb-4 w-20 h-20 rounded-full overflow-hidden border-2 border-white bg-white shadow-premium">
              <img
                src={logoImg}
                alt="Thrinaina Logo"
                className="w-full h-full object-contain p-1 select-none"
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-wider uppercase colourful-text-gradient px-4">
              Thrinaina Electronic Security Systems
            </h1>
            <p className="text-[10px] tracking-[0.25em] text-security-textGray uppercase mt-1">
              Customer Secure Access Portal
            </p>
          </div>

          <div className="glass-panel p-6 sm:p-8 bg-security-card/85 border-slate-800/80 hover:border-security-gold/30 shadow-premium relative group overflow-hidden transition-colors duration-500">
            {/* Tech Corner Brackets on Login Card */}
            <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-security-gold/30 group-hover:border-security-gold/60 transition-colors duration-500" />
            <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-security-gold/30 group-hover:border-security-gold/60 transition-colors duration-500" />
            <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-security-gold/30 group-hover:border-security-gold/60 transition-colors duration-500" />
            <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-security-gold/30 group-hover:border-security-gold/60 transition-colors duration-500" />



            {/* Success message */}
            {otpSuccess && !authError && (
              <div className="mb-4 p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{otpSuccess}</span>
              </div>
            )}

            {authError && (
              <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* ── OTP Verification Step ─────────────────────────────── */}
            {authStep === 'otp' && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="text-center mb-2">
                  <div className="w-12 h-12 rounded-full bg-security-gold/10 border border-security-gold/30 flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-5 h-5 text-security-gold" />
                  </div>
                  <p className="text-xs text-slate-400">Enter the 6-digit code sent to</p>
                  <p className="text-sm font-bold text-security-gold mt-0.5">{pendingEmail}</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-355">Verification Code</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    value={otpValue}
                    onChange={e => setOtpValue(e.target.value.replace(/\D/g, ''))}
                    placeholder="------"
                    className="w-full bg-[#030712] border border-slate-805 focus:border-security-gold text-2xl text-center font-mono tracking-[0.5em] text-slate-100 rounded-xl px-4 py-4 focus:outline-none"
                    autoComplete="one-time-code"
                  />
                </div>
                <button type="submit" disabled={authLoading}
                  className="w-full py-4 bg-security-gold hover:bg-security-goldHover text-security-bg font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all duration-300 shadow-gold-glow cursor-pointer">
                  {authLoading ? 'Verifying...' : 'Verify Email'}
                </button>
                <div className="flex items-center justify-between text-xs">
                  <button type="button" onClick={() => { setAuthStep('form'); setOtpSuccess(''); setAuthError(null); }}
                    className="text-slate-500 hover:text-slate-300 transition-colors">
                    ← Back
                  </button>
                  <button type="button" onClick={handleResendOTP} disabled={resendCooldown > 0}
                    className="text-security-gold disabled:text-slate-600 disabled:cursor-not-allowed font-bold transition-colors">
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                </div>
              </form>
            )}

            {/* ── Forgot Password Step ──────────────────────────────── */}
            {authStep === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="text-center mb-2">
                  <p className="text-sm font-bold text-slate-200">Forgot Password?</p>
                  <p className="text-xs text-slate-400 mt-1">Enter your email and we'll send a reset code.</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-355">Email Address</label>
                  <input type="email" required value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full bg-[#030712] border border-slate-805 focus:border-security-gold text-sm text-slate-200 rounded-xl px-4 py-3 focus:outline-none" />
                </div>
                <button type="submit" disabled={authLoading}
                  className="w-full py-4 bg-security-gold hover:bg-security-goldHover text-security-bg font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all duration-300 shadow-gold-glow cursor-pointer">
                  {authLoading ? 'Sending...' : 'Send Reset Code'}
                </button>
                <button type="button" onClick={() => { setAuthStep('form'); setAuthError(null); }}
                  className="w-full text-xs text-slate-500 hover:text-slate-300 mt-1 transition-colors">
                  ← Back to Login
                </button>
              </form>
            )}

            {/* ── Reset Password Step ───────────────────────────────── */}
            {authStep === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="text-center mb-2">
                  <p className="text-sm font-bold text-slate-200">Reset Password</p>
                  <p className="text-xs text-slate-400 mt-1">Enter the code sent to <span className="text-security-gold">{pendingEmail}</span></p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-355">Reset Code</label>
                  <input type="text" maxLength={6} required value={resetOtp}
                    onChange={e => setResetOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="------"
                    className="w-full bg-[#030712] border border-slate-805 focus:border-security-gold text-2xl text-center font-mono tracking-[0.5em] text-slate-100 rounded-xl px-4 py-4 focus:outline-none"
                    autoComplete="one-time-code" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-355">New Password</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} required value={newPassword}
                      onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters"
                      autoComplete="new-password"
                      className="w-full bg-[#030712] border border-slate-805 focus:border-security-gold text-sm text-slate-200 rounded-xl pl-4 pr-11 py-3 focus:outline-none transition-colors duration-200" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 focus:outline-none transition-colors duration-200">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-355">Confirm Password</label>
                  <div className="relative">
                    <input type={showConfirmPassword ? 'text' : 'password'} required value={confirmNewPassword}
                      onChange={e => setConfirmNewPassword(e.target.value)} placeholder="Re-enter password"
                      autoComplete="new-password"
                      className="w-full bg-[#030712] border border-slate-805 focus:border-security-gold text-sm text-slate-200 rounded-xl pl-4 pr-11 py-3 focus:outline-none transition-colors duration-200" />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 focus:outline-none transition-colors duration-200">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={authLoading}
                  className="w-full py-4 bg-security-gold hover:bg-security-goldHover text-security-bg font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all duration-300 shadow-gold-glow cursor-pointer">
                  {authLoading ? 'Resetting...' : 'Reset Password'}
                </button>
                <div className="flex items-center justify-between text-xs">
                  <button type="button" onClick={() => { setAuthStep('forgot'); setAuthError(null); }}
                    className="text-slate-500 hover:text-slate-300 transition-colors">← Back</button>
                  <button type="button" onClick={handleResendOTP} disabled={resendCooldown > 0}
                    className="text-security-gold disabled:text-slate-600 disabled:cursor-not-allowed font-bold transition-colors">
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                </div>
              </form>
            )}

            {/* ── Login / Register Tabs (only when authStep === 'form') ── */}
            {authStep === 'form' && (
              <>
                <div className="flex bg-[#030712] p-1 rounded-xl mb-6 border border-slate-800">
                  <button type="button" onClick={() => { setAuthTab('login'); setAuthError(null); setOtpSuccess(''); }}
                    className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer ${authTab === 'login' ? 'bg-security-gold text-security-bg shadow-gold-glow' : 'text-slate-400 hover:text-slate-200'}`}>
                    Sign In
                  </button>
                  <button type="button" onClick={() => { setAuthTab('register'); setAuthError(null); setOtpSuccess(''); }}
                    className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200 cursor-pointer ${authTab === 'register' ? 'bg-security-gold text-security-bg shadow-gold-glow' : 'text-slate-400 hover:text-slate-200'}`}>
                    Sign Up
                  </button>
                </div>

                {authTab === 'login' ? (
                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <label htmlFor="app_auth_email" className="text-xs font-bold uppercase text-slate-355">Email Address</label>
                      <input type="email" id="app_auth_email" required autoComplete="off"
                        value={authEmail} onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="name@gmail.com"
                        className="w-full bg-[#030712] border border-slate-805 focus:border-security-gold text-sm text-slate-200 rounded-xl px-4 py-3 focus:outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="app_auth_password" className="text-xs font-bold uppercase text-slate-355">Password</label>
                      <div className="relative">
                        <input type={showPassword ? 'text' : 'password'} id="app_auth_password" required autoComplete="new-password"
                          value={authPassword} onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-[#030712] border border-slate-805 focus:border-security-gold text-sm text-slate-200 rounded-xl pl-4 pr-11 py-3 focus:outline-none transition-colors duration-200" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 focus:outline-none transition-colors duration-200">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <button type="button" onClick={() => { setAuthStep('forgot'); setForgotEmail(authEmail); setAuthError(null); setOtpSuccess(''); }}
                        className="text-xs text-security-gold hover:text-amber-400 font-semibold transition-colors">
                        Forgot Password?
                      </button>
                    </div>
                    <button type="submit" disabled={authLoading}
                      className="w-full py-4 bg-security-gold hover:bg-security-goldHover text-security-bg font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all duration-300 shadow-gold-glow cursor-pointer">
                      {authLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-1.5">
                      <label htmlFor="app_auth_name" className="text-xs font-bold uppercase text-slate-355">Full Name</label>
                      <input type="text" id="app_auth_name" required autoComplete="off"
                        value={authName} onChange={(e) => setAuthName(e.target.value.replace(/[^A-Za-z\s]/g, ''))}
                        placeholder="Enter full name"
                        className="w-full bg-[#030712] border border-slate-805 focus:border-security-gold text-sm text-slate-200 rounded-xl px-4 py-3 focus:outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="app_auth_reg_email" className="text-xs font-bold uppercase text-slate-355">Email Address</label>
                      <input type="email" id="app_auth_reg_email" required autoComplete="off"
                        value={authEmail} onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="name@gmail.com"
                        className="w-full bg-[#030712] border border-slate-805 focus:border-security-gold text-sm text-slate-200 rounded-xl px-4 py-3 focus:outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="app_auth_phone" className="text-xs font-bold uppercase text-slate-355">Phone Number</label>
                      <input type="tel" id="app_auth_phone" required autoComplete="off"
                        value={authPhone} onChange={(e) => setAuthPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="10-digit number"
                        className="w-full bg-[#030712] border border-slate-805 focus:border-security-gold text-sm text-slate-200 rounded-xl px-4 py-3 focus:outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="app_auth_reg_password" className="text-xs font-bold uppercase text-slate-355">Password</label>
                      <div className="relative">
                        <input type={showPassword ? 'text' : 'password'} id="app_auth_reg_password" required autoComplete="new-password"
                          value={authPassword} onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full bg-[#030712] border border-slate-805 focus:border-security-gold text-sm text-slate-200 rounded-xl pl-4 pr-11 py-3 focus:outline-none transition-colors duration-200" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 focus:outline-none transition-colors duration-200">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="app_auth_confirm_password" className="text-xs font-bold uppercase text-slate-355">Confirm Password</label>
                      <div className="relative">
                        <input type={showConfirmPassword ? 'text' : 'password'} id="app_auth_confirm_password" required autoComplete="new-password"
                          value={authConfirmPassword} onChange={(e) => setAuthConfirmPassword(e.target.value)}
                          placeholder="Re-enter password"
                          className="w-full bg-[#030712] border border-slate-805 focus:border-security-gold text-sm text-slate-200 rounded-xl pl-4 pr-11 py-3 focus:outline-none transition-colors duration-200" />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-300 focus:outline-none transition-colors duration-200">
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <button type="submit" disabled={authLoading}
                      className="w-full py-4 bg-security-gold hover:bg-security-goldHover text-security-bg font-extrabold uppercase text-xs tracking-wider rounded-xl transition-all duration-300 shadow-gold-glow cursor-pointer">
                      {authLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>


      </div>
    );
  }


  return (
    <div className="flex flex-col min-h-screen bg-security-bg text-slate-100 selection:bg-security-gold selection:text-security-bg">
      <div className="cctv-bg" aria-hidden="true" />

      <Navbar onProfileClick={() => setIsDashboardOpen(true)} />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/support" element={<ServiceRequest />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      {/* Account Dashboard Modal Overlay */}
      {isDashboardOpen && (
        <AccountDashboardModal
          onClose={() => setIsDashboardOpen(false)}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
