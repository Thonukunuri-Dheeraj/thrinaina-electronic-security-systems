import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api, isCustomerAuthenticated } from '../services/api';
import logoImg from '../assets/logo.jpg';
import { AlertTriangle, User, Mail, CheckCircle, Eye, EyeOff } from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isCustomerAuthenticated()) {
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    }
  }, [navigate, location]);

  const [authTab, setAuthTab] = useState('login'); // 'login' | 'register'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authError, setAuthError] = useState(location.state?.warning || null);

  // Set warning message from navigation state if present
  useEffect(() => {
    if (location.state?.warning) {
      setAuthError(location.state.warning);
    }
  }, [location.state]);
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP / Forgot-Password step states
  const [authStep, setAuthStep] = useState('form'); // 'form' | 'otp' | 'forgot' | 'reset'
  const [pendingEmail, setPendingEmail] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);  // seconds
  const [otpSuccess, setOtpSuccess] = useState('');

  // ── Countdown timer for OTP resend cooldown ──
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleLoginComplete = () => {
    if (onLoginSuccess) {
      onLoginSuccess();
    }
    const from = location.state?.from || '/';
    const originalState = location.state?.originalState || null;
    navigate(from, { state: originalState, replace: true });
  };

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
        handleLoginComplete();
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
        handleLoginComplete();
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

  return (
    <div className="min-h-screen bg-security-bg text-slate-100 flex justify-center items-center relative py-28 px-4 select-none overflow-hidden">
      <div className="cctv-bg" aria-hidden="true" />
      <div className="absolute inset-0 security-grid-overlay opacity-[0.04] pointer-events-none" />
      <div className="absolute inset-0 tech-grid opacity-20 pointer-events-none" />

      <div className="absolute w-[200px] h-[200px] bg-security-blue/15 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] bg-security-gold/10 blur-[120px] rounded-full pointer-events-none" />

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
          {/* Tech Corner Brackets */}
          <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-security-gold/30 group-hover:border-security-gold/60 transition-colors duration-500" />
          <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-security-gold/30 group-hover:border-security-gold/60 transition-colors duration-500" />
          <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-security-gold/30 group-hover:border-security-gold/60 transition-colors duration-500" />
          <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-security-gold/30 group-hover:border-security-gold/60 transition-colors duration-500" />

          {/* Messages */}
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

          {/* OTP Verification Step */}
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

          {/* Forgot Password Step */}
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

          {/* Reset Password Step */}
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

          {/* Login / Register Tabs */}
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
                    <label htmlFor="login_email" className="text-xs font-bold uppercase text-slate-355">Email Address</label>
                    <input type="email" id="login_email" required autoComplete="off"
                      value={authEmail} onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="name@gmail.com"
                      className="w-full bg-[#030712] border border-slate-805 focus:border-security-gold text-sm text-slate-200 rounded-xl px-4 py-3 focus:outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="login_password" className="text-xs font-bold uppercase text-slate-355">Password</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} id="login_password" required autoComplete="new-password"
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
                    <label htmlFor="register_name" className="text-xs font-bold uppercase text-slate-355">Full Name</label>
                    <input type="text" id="register_name" required autoComplete="off"
                      value={authName} onChange={(e) => setAuthName(e.target.value.replace(/[^A-Za-z\s]/g, ''))}
                      placeholder="Enter full name"
                      className="w-full bg-[#030712] border border-slate-805 focus:border-security-gold text-sm text-slate-200 rounded-xl px-4 py-3 focus:outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="register_email" className="text-xs font-bold uppercase text-slate-355">Email Address</label>
                    <input type="email" id="register_email" required autoComplete="off"
                      value={authEmail} onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="name@gmail.com"
                      className="w-full bg-[#030712] border border-slate-805 focus:border-security-gold text-sm text-slate-200 rounded-xl px-4 py-3 focus:outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="register_phone" className="text-xs font-bold uppercase text-slate-355">Phone Number</label>
                    <input type="tel" id="register_phone" required autoComplete="off"
                      value={authPhone} onChange={(e) => setAuthPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="10-digit number"
                      className="w-full bg-[#030712] border border-slate-805 focus:border-security-gold text-sm text-slate-200 rounded-xl px-4 py-3 focus:outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="register_password" className="text-xs font-bold uppercase text-slate-355">Password</label>
                    <div className="relative">
                      <input type={showPassword ? 'text' : 'password'} id="register_password" required autoComplete="new-password"
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
                    <label htmlFor="register_confirm_password" className="text-xs font-bold uppercase text-slate-355">Confirm Password</label>
                    <div className="relative">
                      <input type={showConfirmPassword ? 'text' : 'password'} id="register_confirm_password" required autoComplete="new-password"
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
