
import React, { useState, useRef, useEffect } from 'react';
import { GenerationProgress, generateLyrics } from '../services/geminiTtsService';
import { VOICES } from '../constants';
import { Voice } from '../types';
import VoiceRecorder from './VoiceRecorder';
import { saveCustomVoice } from '../services/voiceStorageService';
import { Lang, getT } from '../services/i18n';

interface VocalStudioProps {
  onGenerate: (text: string, audioBase64: string, voice?: Voice) => Promise<void>;
  onStop: () => void;
  isGenerating: boolean;
  progress: GenerationProgress | null;
  onRefreshCustomVoices?: () => void;
  lang: Lang;
}

const VocalStudio: React.FC<VocalStudioProps> = ({ 
  onGenerate, 
  onStop,
  isGenerating, 
  progress, 
  onRefreshCustomVoices,
  lang 
}) => {
  const t = getT(lang);
  const [lyrics, setLyrics] = useState("");
  const [projectName, setProjectName] = useState("");
  const [selectedVocalist, setSelectedVocalist] = useState<Voice | null>(null);
  const [refFileBase64, setRefFileBase64] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState(t.status_ready);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showLyricAI, setShowLyricAI] = useState(false);
  const [lyricTheme, setLyricTheme] = useState('');
  const [lyricGenre, setLyricGenre] = useState('Pop');
  const [isLyricGenerating, setIsLyricGenerating] = useState(false);
  
  const [cloneMode, setCloneMode] = useState<'upload' | 'record'>('upload');
  const [isSavingVoice, setIsSavingVoice] = useState(false);
  const [hasGeneratedOnce, setHasGeneratedOnce] = useState(false);

  useEffect(() => {
    if (isGenerating) {
      const messages = [
        t.status_analyzing,
        t.status_processing,
        t.status_rendering,
        t.status_mastering
      ];
      let i = 0;
      const interval = setInterval(() => {
        setStatusMessage(messages[i % messages.length]);
        i++;
      }, 3000);
      return () => clearInterval(interval);
    } else {
      setStatusMessage(t.status_ready);
    }
  }, [isGenerating, lang, t]);

  const artistVoices = VOICES.filter(v => v.isLegend);
  const coreVoices = VOICES.filter(v => v.id.includes('-core'));

  const getName = (voice: Voice) => {
    const key = `name_${voice.id}` as keyof typeof t;
    return (t[key] as string) || voice.name;
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setRefFileBase64(base64);
        setSelectedVocalist(null);
        if (!projectName) setProjectName(file.name.split('.')[0]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRecordingComplete = (blob: Blob, base64: string) => {
    setRefFileBase64(base64);
    setSelectedVocalist(null);
    if (!projectName) setProjectName('Recording_' + Date.now().toString().slice(-4));
  };

  const handleSaveToLibrary = () => {
    if (!refFileBase64 || !projectName) return;
    setIsSavingVoice(true);
    const newVoice: Voice = {
      id: 'custom-' + Date.now(),
      name: projectName,
      region: 'International',
      gender: 'Male',
      description: lang === 'vi' ? 'Giọng nhân bản cá nhân' : 'Personal cloned voice',
      geminiVoice: 'cloned',
      category: 'Custom-Clone',
      referenceAudio: refFileBase64
    };
    saveCustomVoice(newVoice);
    setTimeout(() => {
      setIsSavingVoice(false);
      alert(t.vocalSaveSuccess);
      if (onRefreshCustomVoices) onRefreshCustomVoices();
    }, 800);
  };

  const handleCreateLyrics = async () => {
    if (!lyricTheme.trim()) return;
    setIsLyricGenerating(true);
    try {
      const generatedLyrics = await generateLyrics(lyricTheme, lyricGenre);
      if (generatedLyrics) setLyrics(generatedLyrics);
      setShowLyricAI(false);
    } catch (err) { 
      alert(lang === 'vi' ? "Lỗi sáng tác." : "Composition error."); 
    } finally { setIsLyricGenerating(false); }
  };

  const handleSubmit = async () => {
    if (isGenerating) {
      onStop();
      return;
    }
    if (!lyrics.trim()) return;
    let finalRef = refFileBase64;
    await onGenerate(lyrics, finalRef || "", selectedVocalist || undefined);
    setHasGeneratedOnce(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="bg-slate-950 rounded-[4rem] p-1 shadow-[0_0_80px_rgba(79,70,229,0.15)] overflow-hidden border border-slate-900">
        <div className="bg-slate-950 rounded-[3.9rem] p-12 md:p-16 relative">
          <div className="relative z-10 space-y-16">
            <div className="flex flex-col md:flex-row items-start justify-between gap-8">
              <div className="space-y-4">
                <h2 className="text-5xl font-black text-white tracking-tighter">Vocal <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-amber-400">Clone Studio</span></h2>
                <p className="text-slate-500 text-sm max-w-md font-medium">{t.vocalSub}</p>
              </div>
              <div className="w-full md:w-80 p-6 bg-slate-900/50 rounded-3xl border border-slate-800 space-y-2">
                 <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest pl-2">{t.projectName}</label>
                 <input 
                  type="text" 
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="..."
                  className="w-full bg-transparent border-none p-0 text-xl font-bold text-white focus:ring-0 placeholder:text-slate-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              <div className="lg:col-span-5 space-y-12">
                {/* Core Cloning Templates Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
                      Core Library
                      <span className="bg-indigo-600 text-[8px] px-2 py-0.5 rounded-full text-white">OPTIMIZED</span>
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {coreVoices.map((v) => (
                      <button 
                        key={v.id}
                        disabled={isGenerating}
                        onClick={() => { setSelectedVocalist(v); setRefFileBase64(null); }}
                        className={`p-6 rounded-[2rem] border-2 transition-all text-left relative overflow-hidden group ${selectedVocalist?.id === v.id ? 'bg-indigo-600 border-indigo-400 shadow-xl' : 'bg-slate-900 border-slate-800 hover:border-slate-700'} disabled:opacity-50`}
                      >
                        <div className="absolute top-[-20%] right-[-10%] opacity-10 group-hover:scale-110 transition-transform">
                          <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                        </div>
                        <h4 className="text-sm font-black text-white tracking-tight relative z-10">{getName(v)}</h4>
                        <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest relative z-10">{v.gender}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Artist Presets Section */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{t.vocalArtist}</h3>
                  <div className="grid grid-cols-2 gap-4 h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                    {artistVoices.map((v) => (
                      <button 
                        key={v.id}
                        disabled={isGenerating}
                        onClick={() => { setSelectedVocalist(v); setRefFileBase64(null); }}
                        className={`p-5 rounded-[2rem] border-2 transition-all text-left ${selectedVocalist?.id === v.id ? 'bg-indigo-600 border-indigo-400 shadow-xl' : 'bg-slate-900 border-slate-800 hover:border-slate-700'} disabled:opacity-50`}
                      >
                        <h4 className="text-xs font-black text-white tracking-tight">{getName(v)}</h4>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Personal Cloning Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{t.vocalPersonal}</h3>
                    <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800">
                      <button disabled={isGenerating} onClick={() => setCloneMode('upload')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${cloneMode === 'upload' ? 'bg-indigo-600 text-white' : 'text-slate-500'} disabled:opacity-50`}>Upload</button>
                      <button disabled={isGenerating} onClick={() => setCloneMode('record')} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${cloneMode === 'record' ? 'bg-indigo-600 text-white' : 'text-slate-500'} disabled:opacity-50`}>Record</button>
                    </div>
                  </div>
                  
                  <div className="p-8 rounded-[2rem] border-2 border-slate-800 bg-slate-900/30 flex flex-col items-center gap-6">
                    {cloneMode === 'upload' ? (
                      <div onClick={() => !isGenerating && fileInputRef.current?.click()} className={`text-center cursor-pointer group ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="audio/*" className="hidden" />
                        <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 ${refFileBase64 && !selectedVocalist ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700'}`}>
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0L8 8m4-4v12" /></svg>
                        </div>
                        <p className="text-white text-[10px] font-black uppercase tracking-widest">{refFileBase64 && !selectedVocalist ? t.vocalLoaded : t.vocalUpload}</p>
                      </div>
                    ) : (
                      <div className={isGenerating ? 'opacity-50 pointer-events-none' : ''}>
                        <VoiceRecorder lang={lang} onRecordingComplete={handleRecordingComplete} />
                      </div>
                    )}

                    {refFileBase64 && !selectedVocalist && (
                      <button 
                        onClick={handleSaveToLibrary}
                        disabled={isSavingVoice || !projectName || isGenerating}
                        className="px-6 py-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:text-white transition-all disabled:opacity-30"
                      >
                        {isSavingVoice ? t.vocalSaving : t.vocalLibrary}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-8 flex flex-col">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{t.vocalScript}</h3>
                    <button disabled={isGenerating} onClick={() => setShowLyricAI(!showLyricAI)} className="px-4 py-2 rounded-xl text-[10px] font-black uppercase text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/10 transition-all disabled:opacity-50">{t.aiLyricist}</button>
                  </div>
                  <textarea 
                    value={lyrics}
                    disabled={isGenerating}
                    onChange={(e) => setLyrics(e.target.value)}
                    placeholder={lang === 'vi' ? "Nhập nội dung muốn nhân bản đọc..." : "Enter the content you want the clone to read..."}
                    className="w-full h-[350px] bg-slate-900/40 border border-slate-800 rounded-[3rem] p-10 text-white focus:ring-2 focus:ring-indigo-500 resize-none text-lg leading-relaxed shadow-inner disabled:opacity-50"
                  />
                </div>
                <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex items-center justify-center gap-4 text-xs font-black uppercase text-indigo-400 tracking-widest relative">
                  <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-indigo-500 animate-pulse' : 'bg-slate-600'}`}></div>
                  {isGenerating ? statusMessage : t.status_ready}
                  {isGenerating && progress && (
                    <div className="absolute top-0 left-0 h-1 bg-indigo-500/30 transition-all duration-300" style={{ width: `${(progress.current / progress.total) * 100}%` }}></div>
                  )}
                </div>
                
                <div className="flex gap-4">
                  <button 
                    onClick={handleSubmit}
                    disabled={!isGenerating && (!lyrics.trim() || (!refFileBase64 && !selectedVocalist))}
                    className={`flex-1 py-8 rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-4 transition-all shadow-2xl active:scale-95 ${isGenerating ? 'bg-rose-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
                  >
                    {isGenerating ? (lang === 'vi' ? 'DỪNG LẠI' : 'STOP') : t.vocalStart}
                  </button>

                  {hasGeneratedOnce && !isGenerating && (
                    <button 
                      onClick={handleSubmit}
                      className="px-10 py-8 rounded-[2.5rem] bg-slate-900 text-indigo-400 border border-slate-800 hover:bg-slate-800 smooth-transition active:scale-95 group"
                      title={lang === 'vi' ? 'Tạo lại' : 'Regenerate'}
                    >
                      <svg className="w-6 h-6 group-hover:rotate-180 smooth-transition duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocalStudio;
