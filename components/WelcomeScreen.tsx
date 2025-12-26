
import React from 'react';
import { APP_CONFIG } from '../constants';
import { Lang, getT } from '../services/i18n';

interface WelcomeScreenProps {
  onEnter: () => void;
  lang: Lang;
  onLangToggle: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnter, lang, onLangToggle }) => {
  const t = getT(lang);

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex items-center justify-center overflow-hidden">
      {/* Animated Neural Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-20">
           <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(79, 70, 229, 0.1)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      <div className="relative z-10 max-w-4xl w-full px-8 text-center space-y-12">
        {/* Branding Area */}
        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-1000">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(79,70,229,0.4)] border border-white/10 relative group">
            <div className="absolute inset-0 rounded-[2.5rem] bg-indigo-400 blur-xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 md:h-16 md:w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-none">
              {APP_CONFIG.TITLE.split(' ')[0]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-400">{APP_CONFIG.TITLE.split(' ').slice(1).join(' ')}</span>
            </h1>
            <p className="text-indigo-400/60 text-xs md:text-sm font-black uppercase tracking-[0.5em] md:tracking-[0.8em]">
              {APP_CONFIG.SUBTITLE}
            </p>
          </div>
        </div>

        {/* Feature Teasers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-bottom-8 duration-1000 [animation-delay:400ms]">
          {[
            { label: t.studioSingle, desc: lang === 'vi' ? 'Giọng đọc AI tự nhiên' : 'Natural AI Voiceover' },
            { label: t.studioMusic, desc: lang === 'vi' ? 'Sản xuất nhạc đỉnh cao' : 'High-end Music Prod' },
            { label: t.studioClone, desc: lang === 'vi' ? 'Nhân bản giọng nói' : 'Voice Cloning' }
          ].map((feature, idx) => (
            <div key={idx} className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[2rem] hover:bg-white/10 transition-colors">
              <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{feature.label}</h3>
              <p className="text-slate-400 text-xs font-medium">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="flex flex-col items-center gap-8 animate-in slide-in-from-bottom-12 duration-1000 [animation-delay:800ms]">
          <button 
            onClick={onEnter}
            className="group relative px-12 py-5 bg-white text-slate-950 rounded-full font-black uppercase tracking-[0.2em] text-sm overflow-hidden transition-all hover:pr-16 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-95"
          >
            <span className="relative z-10">{lang === 'vi' ? 'Khám phá ngay' : 'Explore Now'}</span>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 group-hover:-translate-x-6 transition-transform">
              <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </div>
          </button>

          <div className="flex items-center gap-6">
            <button 
              onClick={onLangToggle}
              className="flex items-center justify-center gap-2 px-4 py-2 min-w-[80px] rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all shadow-sm"
            >
              <span className="text-[10px] font-black uppercase text-white/60">{lang}</span>
              <div className="w-5 h-3 overflow-hidden rounded-sm relative shrink-0 shadow-sm">
                {lang === 'vi' ? (
                  <div className="absolute inset-0 bg-red-600 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-yellow-400 rotate-45"></div></div>
                ) : (
                  <div className="absolute inset-0 bg-[#00247d] flex flex-col"><div className="h-1/2 bg-[#cf142b]"></div><div className="h-1/2 bg-white"></div></div>
                )}
              </div>
            </button>
            <div className="h-4 w-px bg-white/10"></div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">© 2025 Neural Labs</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
