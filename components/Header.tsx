
import React, { useState } from 'react';
import { APP_CONFIG } from '../constants';
import { UserProfile } from '../types';
import { Lang, getT } from '../services/i18n';

interface HeaderProps {
  activeTab: 'editor' | 'pricing' | 'docs';
  onTabChange: (tab: 'editor' | 'pricing' | 'docs') => void;
  user: UserProfile | null;
  onAuthClick: () => void;
  onLogout: () => void;
  lang: Lang;
  onLangToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, user, onAuthClick, onLogout, lang, onLangToggle }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = getT(lang);

  const navLinks: { id: 'editor' | 'pricing' | 'docs', label: string }[] = [
    { id: 'editor', label: t.studio },
    { id: 'pricing', label: t.pricing },
    { id: 'docs', label: t.docs }
  ];

  return (
    <header className="py-4 px-6 md:px-12 border-b bg-white/80 backdrop-blur-2xl sticky top-0 z-[100] border-slate-100">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between">
        {/* Logo Section */}
        <button 
          onClick={() => onTabChange('editor')}
          className="flex items-center space-x-3 group transition-transform active:scale-95"
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:rotate-3 smooth-transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div className="text-left">
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight leading-none">{APP_CONFIG.TITLE}</h1>
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] leading-none mt-1 hidden sm:block">STUDIO PRO</p>
          </div>
        </button>
        
        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-10">
          {navLinks.map(link => (
            <button 
              key={link.id}
              onClick={() => onTabChange(link.id)}
              className={`text-xs font-black uppercase tracking-[0.15em] smooth-transition ${activeTab === link.id ? 'tab-active' : 'text-slate-400 hover:text-indigo-600'}`}
            >
              {link.label}
            </button>
          ))}
        </nav>
        
        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Locked width Language Toggle to prevent jumping */}
          <button 
            onClick={onLangToggle}
            className="flex items-center justify-center gap-2 px-3 py-2 min-w-[75px] rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-200 smooth-transition shadow-sm"
          >
            <span className="text-[10px] font-black uppercase text-slate-600">{lang}</span>
            <div className="w-5 h-3 overflow-hidden rounded-sm relative shrink-0 shadow-sm">
              {lang === 'vi' ? (
                <div className="absolute inset-0 bg-red-600 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-yellow-400 rotate-45"></div></div>
              ) : (
                <div className="absolute inset-0 bg-[#00247d] flex flex-col"><div className="h-1/2 bg-[#cf142b]"></div><div className="h-1/2 bg-white"></div></div>
              )}
            </div>
          </button>

          {user ? (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 bg-white border border-slate-100 pl-1 pr-4 py-1 rounded-2xl hover:border-indigo-200 hover:shadow-md smooth-transition active:scale-95"
              >
                <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-md">
                  {user.fullName.charAt(0)}
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-[11px] font-black text-slate-900 leading-none">{user.fullName}</p>
                  <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mt-0.5">{user.accountType}</p>
                </div>
                <svg className={`w-4 h-4 text-slate-300 smooth-transition ${showDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-3 w-52 bg-white rounded-3xl shadow-2xl border border-slate-50 p-2 z-[110] animate-fade-up">
                  <button className="w-full text-left px-5 py-3 rounded-2xl hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors">{t.profile}</button>
                  <button className="w-full text-left px-5 py-3 rounded-2xl hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors">{t.settings}</button>
                  <div className="h-px bg-slate-50 my-2 mx-3"></div>
                  <button 
                    onClick={() => { onLogout(); setShowDropdown(false); }}
                    className="w-full text-left px-5 py-3 rounded-2xl hover:bg-rose-50 text-xs font-black text-rose-500 transition-colors"
                  >
                    {t.logout}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              onClick={onAuthClick}
              className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-700 hover:shadow-indigo-200 shadow-lg smooth-transition active:scale-95"
            >
              {t.joinPro}
            </button>
          )}

          {/* Mobile menu trigger */}
          <button className="md:hidden p-2 text-slate-400" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
