import { ShieldCheck, Eye, Compass, Award, Users, CheckCircle } from 'lucide-react';

export default function About() {
  const values = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-security-gold" />,
      title: 'Certified Protection',
      desc: 'We exclusively deploy STQC-certified cameras and high-security equipment to guarantee data privacy and compliance.'
    },
    {
      icon: <Eye className="w-6 h-6 text-security-gold" />,
      title: 'Full-Color Night Vision',
      desc: 'Clear sight even in total darkness. Our installations feature advanced night-vision technology to secure round-the-clock operations.'
    },
    {
      icon: <Compass className="w-6 h-6 text-security-gold" />,
      title: 'Custom Architectures',
      desc: 'Every layout is custom designed based on detail site-survey analysis and your premises requirements.'
    },
    {
      icon: <Award className="w-6 h-6 text-security-gold" />,
      title: '1-Year Warranty',
      desc: 'We stand by our work. All major camera installations and recording units carry a full 1-year manufacturer hardware warranty.'
    }
  ];

  return (
    <div className="pt-28 pb-20 relative min-h-screen bg-security-bg text-slate-100 selection:bg-security-gold selection:text-security-bg">
      <div className="absolute inset-0 tech-grid opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-security-gold block mb-3">
            Who We Are
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-100 tracking-wider leading-tight">
            ABOUT THRINAINA ELECTRONIC SECURITY SYSTEMS
          </h1>
          <div className="w-16 h-1 bg-security-gold mx-auto my-5 rounded-full" />
          <p className="text-security-textGray text-base leading-relaxed">
            Leading providers of smart security surveillance systems, DVR/NVR network configuration, and AI-driven security integrations in Hyderabad.
          </p>
        </div>

        {/* Intro Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24 animate-fade-in-up">
          <div className="lg:col-span-6 space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight leading-snug">
              Advanced Security Infrastructure Engineered to Protect What Matters Most
            </h2>
            <p className="text-security-textGray text-sm leading-relaxed">
              Established with a vision to provide state-of-the-art security installations, <strong>Thrinaina Electronic Security System</strong> has grown to become a premium service provider across residential societies, commercial offices, and heavy industrial yards.
            </p>
            <p className="text-security-textGray text-sm leading-relaxed">
              We design end-to-end surveillance architectures featuring IP camera grids, central Network Video Recorders, failover power modules, and remote monitoring setups. Our team consists of skilled network and installation engineers committed to delivering rock-solid reliability.
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-slate-200 text-xs">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-security-gold shrink-0" />
                1080p to 4K UHD Grids
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-security-gold shrink-0" />
                Remote Phone & Tablet Live view
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-security-gold shrink-0" />
                Smart Intrusion Detection Alerts
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-security-gold shrink-0" />
                DVR/NVR Storage Playback Support
              </li>
            </ul>
          </div>
          <div className="lg:col-span-6 flex justify-center">
            {/* Visual Decorative Box */}
            <div className="glass-panel p-8 bg-security-card/65 border-slate-900/60 max-w-md w-full relative hover:border-security-gold/20 transition-all duration-300">
              <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-security-gold/30" />
              <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-security-gold/30" />
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6 text-security-gold" />
                  </div>
                  <div>
                    <h4 className="text-slate-100 font-bold text-sm">Customer First Approach</h4>
                    <p className="text-security-textGray text-xs mt-1">We listen to your specific needs and design layout solutions matching both safety goals and budget options.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                    <Compass className="w-6 h-6 text-security-gold" />
                  </div>
                  <div>
                    <h4 className="text-slate-100 font-bold text-sm">Free Site Visit</h4>
                    <p className="text-security-textGray text-xs mt-1">We offer free site visiting for new installation of cameras in Hyderabad.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="space-y-12 animate-fade-in-up">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">Our Core Standards</h2>
            <p className="text-security-textGray text-xs mt-2">Every camera mounted and cable laid reflects our core dedication to high security standards.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div key={i} className="glass-panel p-6 bg-security-card/45 border-slate-900/60 hover:border-security-gold/30 transition-all duration-300 rounded-xl space-y-4">
                <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-850 flex items-center justify-center shrink-0">
                  {v.icon}
                </div>
                <h3 className="text-slate-100 font-bold text-sm">{v.title}</h3>
                <p className="text-security-textGray text-xs leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
