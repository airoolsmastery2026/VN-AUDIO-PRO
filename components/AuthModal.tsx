
import React, { useState } from 'react';
import { login, register } from '../services/authService';
import { UserProfile } from '../types';
import { Lang, getT } from '../services/i18n';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  lang: Lang;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onSuccess, lang }) => {
  const t = getT(lang);
  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>('login');
  
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    await new Promise(r => setTimeout(r, 800));

    if (mode === 'login') {
      const res = login(email, password);
      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setError(res.message);
      }
    } else if (mode === 'register') {
      if (!fullName || !username || !email || !phoneNumber || !password) {
        setError(t.authErrFill);
        setIsLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError(t.authErrPass);
        setIsLoading(false);
        return;
      }
      const res = register(email, username, fullName, password, phoneNumber);
      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setError(res.message);
      }
    } else if (mode === 'forgot-password') {
      if (!email) {
        setError(lang === 'vi' ? 'Vui lòng nhập địa chỉ email.' : 'Please enter email address.');
        setIsLoading(false);
        return;
      }
      setMessage(t.authSent);
      setEmail('');
    }
    setIsLoading(false);
  };

  const getTitle = () => {
    if (mode === 'login') return t.authWelcome;
    if (mode === 'register') return t.authRegister;
    return t.authRestore;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[3.5rem] w-full max-w-lg overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-500 border border-white/20">
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-400 hover:text-gray-900 transition-colors z-20">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="p-10 md:p-12 overflow-y-auto max-h-[90vh] custom-scrollbar">
          <div className="text-center mb-10 space-y-2">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-100">
               <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">{getTitle()}</h2>
            <p className="text-gray-400 text-sm font-medium">{t.authSub}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.authFull}</label>
                  <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="NGUYEN VAN A" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-5 text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.authUser}</label>
                  <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="user_vnaudio" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-5 text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none" />
                </div>
              </div>
            )}
            
            <div className={`space-y-1.5`}>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{mode === 'login' ? t.authMailUser : 'Email'}</label>
              <input type="text" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-5 text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none" />
            </div>

            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.authPhone}</label>
                <input type="tel" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="09xx xxx xxx" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 px-5 text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none" />
              </div>
            )}

            {mode !== 'forgot-password' && (
              <div className={`grid grid-cols-1 ${mode === 'register' ? 'md:grid-cols-2' : ''} gap-4`}>
                <div className="space-y-1.5 relative">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.authPass}</label>
                  <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-5 pr-12 text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none" />
                </div>
                {mode === 'register' && (
                  <div className="space-y-1.5 relative">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.authConfirm}</label>
                    <input type={showConfirmPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-5 pr-12 text-sm font-bold focus:ring-2 focus:ring-indigo-600 outline-none" />
                  </div>
                )}
              </div>
            )}

            {mode === 'login' && (
              <div className="flex justify-end">
                <button type="button" onClick={() => setMode('forgot-password')} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">{t.authForgot}</button>
              </div>
            )}

            {error && <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-[11px] font-bold text-center">{error}</div>}
            {message && <div className="p-3 bg-green-50 border border-green-100 rounded-xl text-green-600 text-[11px] font-bold text-center">{message}</div>}

            <button type="submit" disabled={isLoading} className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl flex items-center justify-center gap-3 mt-4 bg-indigo-600 text-white hover:bg-indigo-700">
              {isLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>}
              {mode === 'login' ? t.login : mode === 'register' ? 'Sign Up' : t.authSend}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="text-xs font-bold text-gray-400 hover:text-indigo-600">
              {mode === 'login' ? t.authNoAcc : t.authHasAcc}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
