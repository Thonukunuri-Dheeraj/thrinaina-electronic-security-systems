import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, ShieldCheck } from 'lucide-react';

export default function CctvCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const cameras = [
    {
      id: 'bullet',
      title: 'Bullet Camera',
      image: '/bullet-cctv.png',
      badge: 'Certified Security | Outdoor Deterrence',
      features: [
        'Visible physical security barrier for perimeters',
        'Long-range array night vision mapping',
        'Heavy-duty weatherproof casing structure',
        'Smart intruder detection alerts setup'
      ]
    },
    {
      id: 'dome',
      title: 'Dome Camera',
      image: '/dome-cctv.png',
      badge: 'Certified Security | Indoor Surveillance',
      features: [
        'Subtle, low-profile wall/ceiling integration',
        'Wide-angle coverage lens to eliminate blindspots',
        'Vandal-resistant impact-proof glass housing',
        'Sleek residential and office indoor layout'
      ]
    },
    {
      id: 'outdoor',
      title: 'Outdoor Camera',
      image: '/outdoor-cctv.png',
      badge: 'IP67 Waterproof | Extreme Durability',
      features: [
        'Rugged double-shielded protective weather hoods',
        'Thermal insulation against summer heat loads',
        'Advanced night-vision infrared filter switches',
        'Rust-proof powder-coated metal chassis'
      ]
    },
    {
      id: 'panoramic',
      title: '360° Camera',
      image: '/panoramic-cctv.png',
      badge: 'Panoramic Feed | Multi-View Coverage',
      features: [
        'Single camera replaces multiple traditional grids',
        'Full 360° panoramic area overview stream',
        'Digital split dewarping display interfaces',
        'Perfect for central lobbies, halls, and junctions'
      ]
    },
    {
      id: 'solar',
      title: 'Solar Camera',
      image: '/solar-cctv.png',
      badge: 'Eco-Friendly | Wireless Power Backup',
      features: [
        'Integrated high-efficiency solar charger panel',
        'Wireless battery backup operation capability',
        'Eco-friendly green power conservation mode',
        'Perfect for remote yards and farming sectors'
      ]
    }
  ];

  // Autoplay loop
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % cameras.length);
    }, 2000);

    return () => clearInterval(timer);
  }, [isPaused, cameras.length]);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % cameras.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + cameras.length) % cameras.length);
  };

  return (
    <div 
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="glass-panel p-4 bg-security-card/75 border-slate-900 shadow-premium rounded-2.5xl relative overflow-hidden w-full max-w-[255px] sm:max-w-[300px] lg:max-w-[335px] select-none"
    >
      {/* Cybernetic Corner Borders */}
      <span className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-2 border-l-2 border-security-gold/30" />
      <span className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-2 border-r-2 border-security-gold/30" />
      <span className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-2 border-l-2 border-security-gold/30" />
      <span className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-2 border-r-2 border-security-gold/30" />

      {/* Header telemetry info */}
      <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 mb-3.5">
        <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono font-bold text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>STQC CERTIFIED</span>
        </div>
        <div className="flex items-center gap-1.5 pr-0.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-led-blink-fast shadow-[0_0_10px_#10B981]" />
        </div>
      </div>

      {/* Carousel active slide */}
      <div className="flex flex-col items-center gap-3 relative min-h-[240px] sm:min-h-[315px] lg:min-h-[355px] w-full">
        {/* Static Camera Image Display Area (Centered in one spot) */}
        <div className="h-40 sm:h-44 lg:h-52 flex items-center justify-center relative overflow-visible w-full">
          {cameras.map((cam, idx) => (
            <div
              key={cam.id}
              className={`absolute inset-0 flex items-center justify-center transition-all duration-500 transform ${
                idx === activeIndex
                  ? 'opacity-100 scale-100 pointer-events-auto'
                  : 'opacity-0 scale-95 pointer-events-none'
              }`}
            >
              <div className="relative flex items-center justify-center w-full max-w-[120px] sm:max-w-[155px] lg:max-w-[185px] aspect-square">
                {/* Subtle glowing ring background behind camera */}
                <div className="absolute w-[92%] h-[92%] rounded-full bg-security-gold/5 border border-security-gold/10 animate-pulse-slow" />
                
                {/* Cam image - completely plain casing, no logos or text */}
                <img
                  src={cam.image}
                  alt={cam.title}
                  className="w-[92%] h-[92%] object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.55)]"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Camera Spec Text */}
        <div className="w-full text-center sm:text-left space-y-1.5 px-0.5">
          <span className="text-[8px] sm:text-[9px] font-mono font-extrabold uppercase tracking-[0.2em] text-security-gold leading-normal block">
            {cameras[activeIndex].badge}
          </span>
          <h3 className="text-lg sm:text-[19px] lg:text-xl font-bold text-slate-100 tracking-tight leading-none mt-0.5">
            {cameras[activeIndex].title}
          </h3>
          
          <ul className="grid grid-cols-1 gap-2 pt-2.5 text-left">
            {cameras[activeIndex].features.map((feat, fIdx) => (
              <li key={fIdx} className="flex items-start gap-2.5 text-xs text-security-textGray">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{feat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between border-t border-slate-900 pt-3.5 mt-3.5">
        {/* Indicators */}
        <div className="flex items-center gap-1">
          {cameras.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`p-0 w-2 h-2 rounded-full transition-all duration-300 border cursor-pointer block shrink-0 ${
                idx === activeIndex
                  ? 'bg-security-gold border-security-gold w-5'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
              title={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-lg border border-slate-850 hover:border-security-gold bg-slate-950/60 hover:bg-security-gold hover:text-security-bg text-slate-400 transition-all duration-200 cursor-pointer flex items-center justify-center"
            title="Previous Camera"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg border border-slate-850 hover:border-security-gold bg-slate-950/60 hover:bg-security-gold hover:text-security-bg text-slate-400 transition-all duration-200 cursor-pointer flex items-center justify-center"
            title="Next Camera"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
