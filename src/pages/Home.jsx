import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ChevronDown, ArrowRight } from 'lucide-react';
import Stats from '../components/Stats';
import WhyChooseUs from '../components/WhyChooseUs';
import Testimonials from '../components/Testimonials';
import CctvMonitor from '../components/CctvMonitor';
import CctvCarousel from '../components/CctvCarousel';

export default function Home() {
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    {
      q: 'Do you charge for a site survey before installation?',
      a: 'For commercial premises and housing societies in and near Hyderabad, we offer free site visits and surveillance layout mapping. For residential installations, a nominal visit fee is adjusted against the final invoice upon booking confirmation.'
    },
    {
      q: 'Are the cameras and recorders certified?',
      a: 'We exclusively deploy STQC-certified cameras to guarantee top-tier cybersecurity compliance, reliability, and data privacy standard compliance.'
    },
    {
      q: 'How long does a typical CCTV installation take?',
      a: 'A standard residential setup with 4-8 cameras takes about 4-6 hours including cabling, DVR/NVR configuration, and mobile app setup. Larger commercial projects may take 1-2 days depending on the site layout and number of cameras.'
    },
    {
      q: 'Can I view the camera footage on my phone from outside Hyderabad?',
      a: 'Yes. We configure remote cloud dns (P2P setups) on all DVR/NVR units. As long as the recorder is connected to a local router with internet, you can monitor live feeds and playback archives via dedicated Android/iOS apps.'
    },
    {
      q: 'What is the standard warranty on security systems?',
      a: 'All our cameras and DVRs/NVRs carry a 1-year manufacturer hardware warranty. The hard disk drives carry a 3-year warranty, and we provide 1-year free on-site installation support for any wiring or setup tweaks.'
    }
  ];

  return (
    <div className="relative">
      {/* 1. Hero Section */}
      <header className="relative min-h-[75vh] flex items-center justify-center overflow-hidden pt-24">
        {/* Background Grid & Radar Sweep */}
        <div className="absolute inset-0 bg-security-bg/80 z-0" />
        <div className="absolute inset-0 tech-grid opacity-30 z-0" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full cctv-radar z-0 animate-pulse-slow" />
        
        {/* Background scanline grid elements removed */}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-8 pb-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Text Content Column */}
            <div className="lg:col-span-7 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-security-blue/25 border border-security-blue/40 rounded-full mb-6">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-300">
                  Complete Electronics Security Solutions
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-100 leading-none">
                Smart Security Solutions For <br />
                <span className="gold-text-gradient glowing-text-gold">Home & Business Surveillance</span>
              </h1>

              <p className="mt-6 text-base sm:text-lg text-security-textGray leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Thrinaina Electronic Security System designs, installs, and supports premium CCTV cameras, DVR/NVR recording systems, and complete surveillance solutions in Hyderabad.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/booking"
                  className="w-full sm:w-auto px-8 py-4 bg-security-gold hover:bg-security-goldHover text-security-bg font-extrabold uppercase tracking-wider rounded-xl transition-all duration-300 shadow-gold-glow flex items-center justify-center gap-2"
                >
                  Book Installation
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/support"
                  className="w-full sm:w-auto px-8 py-4 border border-slate-700 hover:border-security-gold bg-transparent hover:bg-slate-900/40 text-slate-200 hover:text-security-gold font-bold uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Raise Service Ticket
                </Link>
              </div>
            </div>

            {/* Types of Cameras Interactive Carousel */}
            <div className="lg:col-span-5 w-full flex justify-center z-10">
              <CctvCarousel />
            </div>
          </div>
        </div>
      </header>

      {/* 2. Company Introduction */}
      <section id="about" className="py-24 bg-[#0C1224]/30 border-t border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Animated Single Feed CCTV Monitor Display Panel */}
            <div className="lg:col-span-6 relative z-20">
              <CctvMonitor />
              <div className="absolute -bottom-6 -right-6 w-36 h-36 bg-security-blue/10 rounded-full blur-2xl z-0" />
            </div>

            {/* Intro Content */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-bold uppercase tracking-[0.25em] text-security-gold">
                About The System
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight leading-tight">
                Advanced Security Infrastructure Engineered to Protect What Matters Most
              </h2>
              <p className="text-security-textGray text-base leading-relaxed">
                Established with a vision to provide state-of-the-art security installations, **Thrinaina Electronic Security System** has grown to become a premium service provider across residential societies, commercial offices, and heavy industrial yards.
              </p>
              <p className="text-security-textGray text-base leading-relaxed">
                We design end-to-end surveillance architectures featuring IP camera grids, central Network Video Recorders, failover power modules, and remote monitoring setups.
              </p>
              
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 text-slate-200">
                <li className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-security-gold shrink-0" />
                  1080p / 4K UHD Night Vision Setup
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-security-gold shrink-0" />
                  Remote Phone & Tablet Feeds
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-security-gold shrink-0" />
                  Smart Motion & Intrusion Alert
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-security-gold shrink-0" />
                  DVR/NVR Storage & Playback Setup
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CCTV Installation Showcase Section */}
      <section className="py-24 bg-security-bg relative border-t border-slate-900">
        <div className="absolute inset-0 tech-grid opacity-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-security-gold block mb-3">
              Installation Categories
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight font-sans">
              Professional CCTV & Security Installation
            </h2>
            <div className="w-16 h-1 bg-security-gold mx-auto my-5 rounded-full" />
            <p className="text-security-textGray text-base leading-relaxed">
              We design and configure customized installations based on your property layout and security demands.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Residential */}
            <div className="glass-panel p-8 bg-security-card/85 border-slate-900 hover:border-security-gold/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="text-4xl mb-6">🏠</div>
                <h3 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-security-gold transition-colors duration-200">Residential Installation</h3>
                <p className="text-xs text-security-textGray leading-relaxed mb-6">
                  Secure your home, villas, or apartment complexes with high-definition CCTV cameras and reliable DVR recording systems.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-350 mb-8">
                  <li className="flex items-center gap-2">✓ Perimeter surveillance monitoring</li>
                  <li className="flex items-center gap-2">✓ HD & 4K Dome & Bullet cameras</li>
                  <li className="flex items-center gap-2">✓ Color Night Vision with IR sensors</li>
                  <li className="flex items-center gap-2">✓ Mobile app remote streaming setup</li>
                </ul>
              </div>
              <Link 
                to="/booking" 
                state={{ serviceType: 'CCTV Installation' }} 
                className="w-full py-3 bg-slate-950 hover:bg-security-gold hover:text-security-bg text-center text-xs font-bold uppercase tracking-wider text-slate-350 rounded-xl border border-slate-850 hover:border-security-gold transition-all duration-205"
              >
                Schedule Home Setup
              </Link>
            </div>

            {/* Commercial */}
            <div className="glass-panel p-8 bg-security-card/85 border-slate-900 hover:border-security-gold/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="text-4xl mb-6">🏢</div>
                <h3 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-security-gold transition-colors duration-200">Commercial Installation</h3>
                <p className="text-xs text-security-textGray leading-relaxed mb-6">
                  Enhance office premises, retail shops, and complexes with integrated CCTV surveillance and DVR recording.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-350 mb-8">
                  <li className="flex items-center gap-2">✓ Multi-channel DVR/NVR configurations</li>
                  <li className="flex items-center gap-2">✓ High-capacity NVR cloud storage</li>
                  <li className="flex items-center gap-2">✓ Indoor Dome & 360° Fisheye cams</li>
                  <li className="flex items-center gap-2">✓ Server room backup monitoring</li>
                </ul>
              </div>
              <Link 
                to="/booking" 
                state={{ serviceType: 'Office Security Solutions' }} 
                className="w-full py-3 bg-slate-950 hover:bg-security-gold hover:text-security-bg text-center text-xs font-bold uppercase tracking-wider text-slate-350 rounded-xl border border-slate-850 hover:border-security-gold transition-all duration-205"
              >
                Schedule Office Setup
              </Link>
            </div>

            {/* Industrial */}
            <div className="glass-panel p-8 bg-security-card/85 border-slate-900 hover:border-security-gold/40 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="text-4xl mb-6">🏭</div>
                <h3 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-security-gold transition-colors duration-200">Industrial Installation</h3>
                <p className="text-xs text-security-textGray leading-relaxed mb-6">
                  Secure warehouses, construction yards, and manufacturing facilities with heavy duty night-vision layouts.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-350 mb-8">
                  <li className="flex items-center gap-2">✓ Long-range PTZ tracking dome cameras</li>
                  <li className="flex items-center gap-2">✓ Explosion-proof & weather-proof chassis</li>
                  <li className="flex items-center gap-2">✓ Fibre optic loop cabling backbones</li>
                  <li className="flex items-center gap-2">✓ Central guard-room monitor matrix</li>
                </ul>
              </div>
              <Link 
                to="/booking" 
                state={{ serviceType: 'Industrial Security Solutions' }} 
                className="w-full py-3 bg-slate-950 hover:bg-security-gold hover:text-security-bg text-center text-xs font-bold uppercase tracking-wider text-slate-350 rounded-xl border border-slate-850 hover:border-security-gold transition-all duration-205"
              >
                Schedule Yard Setup
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Stats Section */}
      <Stats />

      {/* 4. Why Choose Us */}
      <WhyChooseUs />

      {/* 5. Testimonials */}
      <Testimonials />

      {/* 6. FAQ Accordion */}
      <section className="py-24 bg-security-bg relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-security-gold block mb-3">
              FAQ
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
              Frequently Asked Questions
            </h2>
            <div className="w-16 h-1 bg-security-gold mx-auto my-5 rounded-full" />
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => {
              const isOpen = activeFaq === i;
              return (
                <div
                  key={i}
                  className="glass-panel border-slate-900 bg-security-card/60 overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : i)}
                    className="flex justify-between items-center w-full p-6 text-left font-bold text-slate-200 hover:text-security-gold transition-colors duration-200 focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-security-gold shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      isOpen ? 'max-h-60 border-t border-slate-800/50 p-6' : 'max-h-0 pointer-events-none'
                    }`}
                  >
                    <p className="text-sm text-security-textGray leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
