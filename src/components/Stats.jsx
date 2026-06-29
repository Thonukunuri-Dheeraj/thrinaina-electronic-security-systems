import { ShieldAlert, Users, Award, ShieldCheck } from 'lucide-react';

export default function Stats() {
  const statsList = [
    {
      icon: <Award className="w-7 h-7 text-security-gold" />,
      value: '20+',
      label: 'Years in Business',
      desc: 'Deploying robust surveillance systems since 2006.'
    },
    {
      icon: <ShieldCheck className="w-7 h-7 text-security-gold" />,
      value: '1 Lakh +',
      label: 'CCTV Cameras Installed',
      desc: 'Trusted by residential communities and corporate complexes.'
    },
    {
      icon: <Users className="w-7 h-7 text-security-gold" />,
      value: '90K+',
      label: 'Happy Customers',
      desc: 'Residential and commercial clients trust our surveillance solutions.'
    },
    {
      icon: <ShieldAlert className="w-7 h-7 text-security-gold" />,
      value: '99.9%',
      label: 'Uptime Reliability',
      desc: 'High-availability storage setups and fallback wiring.'
    }
  ];

  return (
    <section className="py-16 bg-slate-950/60 border-y border-slate-900/60 relative overflow-hidden">
      <div className="absolute inset-0 cctv-radar opacity-20" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {statsList.map((stat, i) => (
            <div
              key={i}
              className="flex items-center gap-5 p-6 glass-panel border-slate-900 bg-[#070d19]/80 shadow-md transform hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 shrink-0">
                {stat.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-3xl font-extrabold text-slate-100 tracking-tight glowing-text-gold">
                  {stat.value}
                </span>
                <span className="text-sm font-semibold text-security-gold mt-0.5">
                  {stat.label}
                </span>
                <span className="text-xs text-security-textGray mt-1 leading-relaxed">
                  {stat.desc}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
