
import React, { useState, useEffect } from 'react';
import { getLicense, validateProductKey, saveLicense, getMachineId } from '../services/licensingService';
import { LicenseInfo } from '../types';
import { getT, Lang } from '../services/i18n';

interface ActivationGuardProps {
  children: React.ReactNode;
}

const ActivationGuard: React.FC<ActivationGuardProps> = ({ children }) => {
  const [lang, setLang] = useState<Lang>((localStorage.getItem('VN_AUDIO_PRO_LANG') as Lang) || 'vi');
  const t = getT(lang);
  
  const [license, setLicense] = useState<LicenseInfo | null>(null);
  const [keyInput, setKeyInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [showActivation, setShowActivation] = useState(false);

  useEffect(() => {
    const current = getLicense();
    setLicense(current);
    
    // Nếu là trial và đã dùng quá 15 lần, hoặc đã hết hạn
    if (current.status === 'trial' && current.requestCount >= 15) {
      setShowActivation(true);
    } else if (current.status === 'activated' && current.expiryDate && current.expiryDate < Date.now()) {
      setShowActivation(true);
    }

    // Lắng nghe thay đổi ngôn ngữ từ localStorage nếu cần (tùy chọn)
    const handleStorage = () => {
      const currentLang = localStorage.getItem('VN_AUDIO_PRO_LANG') as Lang;
      if (currentLang && currentLang !== lang) setLang(currentLang);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [lang]);

  const handleActivate = async () => {
    if (!keyInput.trim()) return;
    setIsVerifying(true);
    setError('');
    
    try {
      const result = await validateProductKey(keyInput.trim());
      if (result.success) {
        const newLicense: LicenseInfo = {
          status: 'activated',
          key: keyInput,
          machineId: getMachineId(),
          expiryDate: result.expiry,
          requestCount: license?.requestCount || 0
        };
        saveLicense(newLicense);
        setLicense(newLicense);
        setShowActivation(false);
      } else {
        setError(t.invalidKey);
      }
    } catch (e) {
      setError(t.connectionError);
    } finally {
      setIsVerifying(false);
    }
  };

  if (showActivation) {
    return (
      <div className="fixed inset-0 z-[9999] bg-slate-950 flex items-center justify-center p-6 overflow-y-auto">
        <div className="max-w-xl w-full bg-white rounded-[3.5rem] p-12 shadow-2xl animate-in zoom-in-95 duration-500">
          <div className="text-center space-y-6 mb-10">
            <div className="w-20 h-20 bg-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-indigo-200">
               <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
               </svg>
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter">{t.activationTitle}</h2>
            <p className="text-gray-500 font-medium">{t.activationSub}</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.hardwareId}</label>
              <div className="bg-gray-100 p-4 rounded-2xl text-[11px] font-mono text-gray-500 break-all border border-gray-200 text-center select-all">
                {getMachineId()}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest ml-1">{t.licenseKey}</label>
              <input 
                type="text"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value.toUpperCase())}
                placeholder="PRO-XXXX-XXXX-XXXX"
                className="w-full py-5 px-6 bg-gray-50 border-2 border-gray-100 rounded-2xl text-center text-xl font-black tracking-widest text-indigo-600 focus:border-indigo-600 focus:ring-0 transition-all placeholder:text-gray-200"
              />
            </div>

            {error && <p className="text-center text-xs font-bold text-rose-500 bg-rose-50 py-3 rounded-xl border border-rose-100 animate-in fade-in">{error}</p>}

            <button 
              onClick={handleActivate}
              disabled={isVerifying || !keyInput}
              className="w-full py-6 bg-indigo-600 text-white font-black rounded-3xl uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
            >
              {isVerifying ? t.verifying : t.activateNow}
            </button>

            <div className="pt-8 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400 font-bold mb-4 uppercase tracking-widest">{t.noKey}</p>
              <a 
                href="https://vnaudiopro.com/buy" 
                target="_blank"
                className="inline-flex items-center gap-2 text-indigo-600 font-black text-sm hover:underline"
              >
                {t.buyKey}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ActivationGuard;
