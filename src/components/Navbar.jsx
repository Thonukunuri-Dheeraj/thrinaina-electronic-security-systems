import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, User, ArrowRight } from 'lucide-react';
import { isCustomerAuthenticated, getStoredCustomer, customerLogout } from '../services/api';
import logoImg from '../assets/logo.jpg';

export default function Navbar({ onProfileClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const isCustomer = isCustomerAuthenticated();
  const customerUser = getStoredCustomer();

  // Set background transparency on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dropdown click-away listener
  useEffect(() => {
    if (!isDropdownOpen) return;
    const closeDropdown = () => setIsDropdownOpen(false);
    window.addEventListener('click', closeDropdown);
    return () => window.removeEventListener('click', closeDropdown);
  }, [isDropdownOpen]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Installation', path: '/booking' },
    { name: 'Service Booking', path: '/support' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleLogout = () => {
    customerLogout();
    window.dispatchEvent(new Event('storage'));
    window.location.reload();
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-300 ${
          isScrolled || isOpen
            ? 'bg-security-bg/90 backdrop-blur-md border-b border-slate-800 shadow-lg py-3'
            : 'bg-transparent border-b border-transparent py-3 md:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img
              src={logoImg}
              alt="Thrinaina Electronic Security System"
              className="h-12 md:h-16 w-auto object-contain rounded-xl drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium transition-all duration-300 relative py-1 ${
                    isActive(link.path)
                      ? 'text-security-gold font-semibold'
                      : 'text-slate-300 hover:text-security-gold'
                  }`}
                >
                  {link.name}
                  {isActive(link.path) && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-security-gold rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isCustomer ? (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen(!isDropdownOpen);
                  }}
                  className="flex flex-col items-center justify-center gap-1 group cursor-pointer focus:outline-none"
                  title="Open Account Menu"
                >
                  {/* Silhouette User Icon Circle */}
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-900 via-slate-950 to-security-blue/40 border border-security-gold/30 group-hover:border-security-gold/60 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.6),0_0_10px_rgba(201,168,76,0.1)] group-hover:shadow-[0_0_15px_rgba(201,168,76,0.25)] transition-all duration-300 group-hover:scale-105 relative shrink-0">
                    <User className="w-5 h-5 text-security-gold" strokeWidth={2.2} />
                    {/* Glowing online indicator */}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
                  </div>
                  {/* Short Name below it */}
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-350 group-hover:text-security-gold transition-colors duration-300 truncate max-w-[80px] leading-tight select-none mt-0.5">
                    {customerUser?.full_name ? customerUser.full_name.split(' ')[0] : 'Client'}
                  </span>
                </button>
                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-security-bg/95 backdrop-blur-lg border border-slate-800 rounded-xl p-2 shadow-2xl z-50">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onProfileClick();
                      }}
                      className="w-full text-left flex items-center px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-security-gold hover:bg-slate-900/60 rounded-lg transition-colors cursor-pointer"
                    >
                      My Bookings
                    </button>
                    <hr className="border-slate-800/80 my-1" />
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left flex items-center px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-405 hover:bg-red-500/5 rounded-lg transition-colors cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-100 border border-security-gold/50 hover:border-security-gold bg-transparent hover:bg-security-gold hover:text-security-bg rounded-lg transition-all duration-300 hover:shadow-gold-glow"
              >
                Sign In / Sign Up
              </Link>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(prev => !prev)}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-100 focus:outline-none transition-colors duration-200"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    </nav>

    {/* Mobile Drawer */}
    <div
      className={`md:hidden fixed top-[88px] left-0 right-0 bottom-0 z-50 bg-security-bg/95 backdrop-blur-lg border-t border-slate-800 transition-all duration-300 transform overflow-y-auto ${
        isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="px-4 py-6 space-y-4">
        {navLinks.map((link) => {
          return (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-3 text-base font-semibold rounded-xl transition-all duration-300 ${
                isActive(link.path)
                  ? 'text-security-gold bg-security-card border-l-4 border-security-gold'
                  : 'text-slate-300 hover:text-security-gold hover:bg-slate-900/50'
              }`}
            >
              {link.name}
            </Link>
          );
        })}

        <hr className="border-slate-800 my-4" />

        {isCustomer ? (
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 bg-slate-950/40 border border-slate-900 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-900 via-slate-950 to-security-blue/40 border border-security-gold/40 flex items-center justify-center text-security-gold shrink-0 relative">
                <User className="w-5.5 h-5.5 text-security-gold" strokeWidth={2.2} />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse" />
              </div>
              
              <div className="flex-grow text-left truncate">
                <div className="text-xs font-bold text-slate-100 truncate">
                  {customerUser?.full_name || 'Customer'}
                </div>
                <div className="text-[10px] text-security-textGray truncate">
                  {customerUser?.email}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setIsOpen(false);
                onProfileClick();
              }}
              className="flex items-center justify-center w-full py-3 bg-slate-900 border border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-205 hover:text-security-gold rounded-xl cursor-pointer transition-all duration-300"
            >
              My Bookings
            </button>
            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="flex items-center justify-center w-full py-3 bg-red-500/5 border border-red-500/20 text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-400 rounded-xl cursor-pointer transition-all duration-300"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center w-full py-3.5 bg-security-gold hover:bg-security-goldHover text-security-bg font-extrabold rounded-xl transition-all duration-300 shadow-gold-glow"
          >
            Sign In / Sign Up
          </Link>
        )}
      </div>
    </div>
  </>
  );
}
