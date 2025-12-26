
import React from 'react';
import { Voice } from '../types';
import { Lang, getT } from '../services/i18n';

interface VoiceCardProps {
  voice: Voice;
  isSelected: boolean;
  onSelect: (voice: Voice) => void;
  lang?: Lang;
}

const VoiceCard: React.FC<VoiceCardProps> = ({ voice, isSelected, onSelect, lang = 'vi' as Lang }) => {
  const t = getT(lang);
  
  const getRegionLabel = (region: string) => {
    if (lang === 'en') {
      if (region === 'North') return 'North';
      if (region === 'South') return 'South';
      return 'Global';
    }
    if (region === 'North') return 'Bắc';
    if (region === 'South') return 'Nam';
    return 'Quốc tế';
  };

  const getName = (voice: Voice) => {
    const key = `name_${voice.id}` as keyof typeof t;
    return (t[key] as string) || voice.name;
  };

  const getVoiceDesc = (voice: Voice) => {
    const key = `voiceDesc_${voice.id}` as keyof typeof t;
    return (t[key] as string) || voice.description;
  };

  return (
    <button
      onClick={() => onSelect(voice)}
      className={`relative p-5 rounded-[1.5rem] border-2 smooth-transition text-left group overflow-hidden ${
        isSelected 
          ? 'border-indigo-600 bg-indigo-50/30 shadow-xl shadow-indigo-100 ring-4 ring-indigo-50' 
          : 'border-slate-50 bg-white hover:border-slate-200 hover:shadow-lg'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
          voice.region === 'North' ? 'bg-amber-50 text-amber-700' : 
          voice.region === 'South' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
        }`}>
          {getRegionLabel(voice.region)}
        </span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
          voice.gender === 'Male' ? 'bg-indigo-50 text-indigo-500' : 'bg-rose-50 text-rose-500'
        }`}>
          {voice.gender === 'Male' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </div>
      </div>
      <h3 className={`font-black text-xs uppercase tracking-tight smooth-transition ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
        {getName(voice)}
      </h3>
      <p className="text-[10px] text-slate-400 font-bold mt-1 line-clamp-1">
        {getVoiceDesc(voice)}
      </p>
      
      {isSelected && (
        <div className="absolute top-0 right-0 p-1.5">
          <div className="bg-indigo-600 rounded-bl-xl rounded-tr-xl p-1 shadow-sm">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}
    </button>
  );
};

export default VoiceCard;
