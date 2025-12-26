
import React, { useState } from 'react';
import { Lang, getT } from '../services/i18n';

interface CheckoutModalProps {
  plan: any;
  onClose: () => void;
  lang: Lang;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ plan, onClose, lang }) => {
  const t = getT(lang);
  const [step, setStep] = useState<'info' | 'payment'>('info');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white rounded-[3.5rem] w-full max-w-2xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-500">
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-400 hover:text-gray-900 transition-colors">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12">
          <div className="md:col-span-5 bg-indigo-600 p-12 text-white flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">{t.checkPay}</span>
              <h3 className="text-3xl font-black tracking-tighter mt-4 mb-2">{t.checkPlan} {plan.name}</h3>
              <p className="text-indigo-200 text-xs font-bold leading-relaxed">{plan.description}</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-500/30 pb-4">
                <span className="text-xs font-bold opacity-70">{t.checkTotal}:</span>
                <span className="text-2xl font-black">{plan.price.toLocaleString(lang === 'vi' ? 'vi-VN' : 'en-US')}{lang === 'vi' ? 'đ' : '$'}</span>
              </div>
              <p className="text-[9px] font-bold text-indigo-300 uppercase tracking-widest italic">{t.checkAuto}</p>
            </div>
          </div>

          <div className="md:col-span-7 p-12">
            {step === 'info' ? (
              <div className="space-y-8">
                <h4 className="text-xl font-black text-gray-900 tracking-tight">{t.checkCust}</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.authFull}</label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="..." className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.checkEmail}</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none" />
                  </div>
                </div>
                <button 
                  onClick={() => setStep('payment')}
                  disabled={!fullName || !email}
                  className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl uppercase tracking-widest text-xs shadow-xl"
                >
                  {t.checkNext}
                </button>
              </div>
            ) : (
              <div className="space-y-6 text-center">
                <h4 className="text-xl font-black text-gray-900 tracking-tight">{t.checkQR}</h4>
                <div className="bg-white p-4 rounded-3xl border-4 border-indigo-50 inline-block">
                  <img src={`https://img.vietqr.io/image/vcb-123456789-compact2.png?amount=${plan.price}&addInfo=VNAUDIOPRO%20KEY&accountName=VN%20AUDIO%20PRO`} alt="QR" className="w-48 h-48" />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.checkContent}</p>
                  <p className="text-lg font-black text-indigo-600 tracking-widest uppercase">VNAUDIOPRO PRO KEY</p>
                </div>
                <div className="flex items-center gap-3 bg-amber-50 p-4 rounded-2xl border border-amber-100">
                  <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                  <p className="text-[10px] text-amber-700 font-bold uppercase tracking-tight text-left leading-relaxed">{t.checkWait}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
