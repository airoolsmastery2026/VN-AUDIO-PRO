
import React, { useState, useEffect } from 'react';
import { VOICES } from '../constants';
import { Voice } from '../types';
import { generateSpeech } from '../services/geminiTtsService';
import { getCustomVoices, deleteCustomVoice } from '../services/voiceStorageService';
import { getT, Lang } from '../services/i18n';

interface VoicesContentProps {
  onSelectVoice: (voice: Voice) => void;
  refreshTrigger?: number;
  lang: Lang;
}

const VoicesContent: React.FC<VoicesContentProps> = ({ onSelectVoice, refreshTrigger, lang }) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [customVoices, setCustomVoices] = useState<Voice[]>([]);
  const t = getT(lang);

  useEffect(() => {
    setCustomVoices(getCustomVoices());
  }, [refreshTrigger]);

  const handlePlayDemo = async (voice: Voice) => {
    if (playingId) return;
    setPlayingId(voice.id);
    try {
      const demoText = lang === 'vi' 
        ? `Chào bạn, mình là ${voice.name}, giọng nói của bạn đã sẵn sàng.` 
        : `Hello, I am ${voice.name}, your voice is ready for use.`;
      const audioUrl = await generateSpeech(demoText, voice.geminiVoice, lang === 'vi' ? 'Vietnamese' : 'English');
      const audio = new Audio(audioUrl);
      audio.onended = () => { setPlayingId(null); URL.revokeObjectURL(audioUrl); };
      audio.play();
    } catch (error) { setPlayingId(null); }
  };

  const handleDelete = (id: string) => {
    if (confirm(t.deleteVoiceConfirm)) {
      deleteCustomVoice(id);
      setCustomVoices(getCustomVoices());
    }
  };

  const getVoiceDesc = (voice: Voice) => {
    const key = `voiceDesc_${voice.id}` as keyof typeof t;
    return (t[key] as string) || voice.description;
  };

  const renderVoiceGrid = (voiceList: Voice[], isCustom = false) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {voiceList.map((voice) => (
        <div key={voice.id} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl flex flex-col justify-between hover:shadow-2xl transition-all group relative">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${isCustom ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              </div>
              {isCustom && (
                <button onClick={() => handleDelete(voice.id)} className="p-2 text-gray-300 hover:text-rose-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{voice.name}</h3>
            <p className="text-gray-500 text-xs leading-relaxed mb-6">{getVoiceDesc(voice)}</p>
          </div>
          <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
            <button onClick={() => onSelectVoice(voice)} className="flex-1 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-indigo-600 transition-all text-xs uppercase tracking-widest">{t.useVoice}</button>
            <button onClick={() => handlePlayDemo(voice)} disabled={playingId !== null} className="p-3 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 transition-all">
               {playingId === voice.id ? <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent animate-spin rounded-full"></div> : <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>}
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">{t.voiceLibTitle}</h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">{t.voiceLibSub}</p>
      </div>

      {customVoices.length > 0 && (
        <section className="space-y-8">
          <h2 className="text-xs font-black text-amber-600 uppercase tracking-[0.3em] flex items-center gap-4">
            <div className="w-12 h-[1px] bg-amber-200"></div> {t.clonedVoiceGroup}
          </h2>
          {renderVoiceGrid(customVoices, true)}
        </section>
      )}

      <section className="space-y-8">
        <h2 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-4">
          <div className="w-12 h-[1px] bg-indigo-100"></div> {t.standardVoiceGroup}
        </h2>
        {renderVoiceGrid(VOICES.filter(v => v.category === 'Standard'))}
      </section>
    </div>
  );
};

export default VoicesContent;
