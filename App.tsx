
import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import VoiceCard from './components/VoiceCard';
import HistoryList from './components/HistoryList';
import PricingContent from './components/PricingContent';
import DocumentationContent from './components/DocumentationContent';
import BatchStudio from './components/BatchStudio';
import VocalStudio from './components/VocalStudio';
import WriterStudio from './components/WriterStudio';
import MusicStudio from './components/MusicStudio';
import AdminStudio from './components/AdminStudio';
import CheckoutModal from './components/CheckoutModal';
import AuthModal from './components/AuthModal';
import WelcomeScreen from './components/WelcomeScreen';
import { VOICES } from './constants';
import { Voice, HistoryItem, BatchTask, LicenseInfo, UserProfile, ActiveTab } from './types';
import { generateSpeech, GenerationProgress, translateText, generateClonedSpeech } from './services/geminiTtsService';
import { getLicense, saveLicense } from './services/licensingService';
import { getCustomVoices } from './services/voiceStorageService';
import { getCurrentUser, logout } from './services/authService';
import { Lang, getT, translations } from './services/i18n';
import { readTextFile } from './utils/fileHelpers';

const LANGUAGES = [
  { code: 'Auto', name: 'Auto Detect' },
  { code: 'Vietnamese', name: 'Tiếng Việt' },
  { code: 'English', name: 'English' },
  { code: 'Chinese', name: 'Chinese' },
  { code: 'Japanese', name: 'Japanese' },
  { code: 'Korean', name: 'Korean' },
  { code: 'French', name: 'French' },
  { code: 'German', name: 'German' },
  { code: 'Spanish', name: 'Spanish' },
  { code: 'Thai', name: 'Thai' },
  { code: 'Russian', name: 'Russian' },
];

const HISTORY_STORAGE_KEY = 'VN_AUDIO_PRO_HISTORY_V1';
const LANG_STORAGE_KEY = 'VN_AUDIO_PRO_LANG';

const App: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState<boolean>(!sessionStorage.getItem('welcome_seen'));
  const [lang, setLang] = useState<Lang>((localStorage.getItem(LANG_STORAGE_KEY) as Lang) || 'vi');
  const t = getT(lang);
  
  const [activeTab, setActiveTab] = useState<ActiveTab>('editor');
  const [user, setUser] = useState<UserProfile | null>(getCurrentUser());
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const [text, setText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [sourceLang, setSourceLang] = useState('Auto');
  const [targetLang, setTargetLang] = useState('English');

  // TTS Mode: Cloud (Gemini) vs Local (Web Speech API)
  const [ttsMode, setTtsMode] = useState<'cloud' | 'local'>('cloud');

  const abortControllerRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sampleVi = translations.vi.sampleText;
    const sampleEn = translations.en.sampleText;
    if (!text || text === sampleVi || text === sampleEn) {
      setText(t.sampleText);
    }
  }, [lang]);
  
  // In Offline Mode, we still show standard voices, but we map them logic-wise
  const standardVoices = VOICES.filter(v => v.category === 'Standard');

  const [selectedVoice, setSelectedVoice] = useState<Voice>(standardVoices[0] || VOICES[0]);
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastGeneratedUrl, setLastGeneratedUrl] = useState<string | null>(null);
  
  const [license, setLicense] = useState<LicenseInfo>(getLicense());
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [hasUserKey, setHasUserKey] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1.0);
  const [pitch, setPitch] = useState<string>('normal');
  const [bgmUrl, setBgmUrl] = useState<string>('');
  const [enableSmartSFX, setEnableSmartSFX] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [customVoices, setCustomVoices] = useState<Voice[]>(getCustomVoices());

  // Batch Studio State
  const [batchTasks, setBatchTasks] = useState<BatchTask[]>([]);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [autoBatchDownload, setAutoBatchDownload] = useState(false);
  const [batchOutputDirectory, setBatchOutputDirectory] = useState<string | null>(null);

  const isStudioPage = !['pricing', 'docs'].includes(activeTab);

  useEffect(() => {
    checkApiKeyStatus();
    const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        // Only keep URL if it's not a local protocol tag
        setHistory(parsed.map((item: HistoryItem) => ({ 
          ...item, 
          audioUrl: item.audioUrl.startsWith('local:') ? item.audioUrl : '' 
        })));
      } catch (e) {}
    }
  }, []);

  const toggleLang = () => {
    const newLang = lang === 'vi' ? 'en' : 'vi';
    setLang(newLang);
    localStorage.setItem(LANG_STORAGE_KEY, newLang);
  };

  const handleEnterApp = () => {
    sessionStorage.setItem('welcome_seen', 'true');
    setShowWelcome(false);
    if (!user) {
      setTimeout(() => setShowAuthModal(true), 300);
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
    setActiveTab('editor');
  };

  const refreshCustomVoices = () => {
    setCustomVoices(getCustomVoices());
  };

  const checkApiKeyStatus = async () => {
    if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setHasUserKey(hasKey);
    }
  };

  const handleOpenKeySelector = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
      setHasUserKey(true); 
      setError(null);
    }
  };

  // Electron Directory Selection
  const handleSelectBatchDirectory = async () => {
    if (window.electronAPI) {
      const path = await window.electronAPI.selectDirectory();
      if (path) setBatchOutputDirectory(path);
    } else {
      alert("Tính năng này chỉ khả dụng trên ứng dụng Desktop.");
    }
  };

  const getTranslatedName = (voice: Voice) => {
    if (voice.category === 'Local-Offline') return voice.name;
    const key = `name_${voice.id}` as keyof typeof t;
    return (t[key] as string) || voice.name;
  };

  const handleTranslate = async () => {
    if (!text.trim() || isTranslating) return;
    setIsTranslating(true);
    setError(null);
    try {
      const sourceLabel = sourceLang === 'Auto' ? 'auto-detect mixed languages' : sourceLang;
      const result = await translateText(text, sourceLabel, targetLang);
      if (result) setText(result);
    } catch (err: any) {
      if (err.message === "QUOTA_EXCEEDED") {
        setError(lang === 'vi' ? "Bạn đã hết lượt sử dụng miễn phí (10 lần/ngày). Vui lòng thử lại sau 24h hoặc đổi API Key." : "You have exceeded the free usage limit (10/day). Please try again in 24h or change API Key.");
      } else {
        setError(err.message || "Translation failed.");
      }
    } finally {
      setIsTranslating(false);
    }
  };

  const swapTranslationLangs = () => {
    if (sourceLang === 'Auto') return; 
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (ttsMode === 'local') {
      window.speechSynthesis.cancel();
    }
    setIsGenerating(false);
    setProgress(null);
    setError(lang === 'vi' ? "Đã dừng tạo giọng nói." : "Voice generation stopped.");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const content = await readTextFile(file);
        setText(content);
        e.target.value = ''; // Reset input
      } catch (err) {
        setError(lang === 'vi' ? "Lỗi đọc file." : "Error reading file.");
      }
    }
  };

  const getBestSystemVoice = (desiredVoice: Voice, targetLangCode: string) => {
    const voices = window.speechSynthesis.getVoices();
    // 1. Try exact language match
    let candidates = voices.filter(v => v.lang.startsWith(targetLangCode));
    
    // 2. If Vietnamese, prioritize Microsoft or Google
    if (targetLangCode === 'vi') {
       // Heuristic: Microsoft An/Nam are popular on Windows
       const maleKeywords = ['An', 'Nam', 'Minh', 'Khoi'];
       const femaleKeywords = ['Hoai', 'Lan', 'Mai', 'Thao', 'Google'];

       if (desiredVoice.gender === 'Male') {
          const male = candidates.find(v => maleKeywords.some(k => v.name.includes(k)));
          if (male) return male;
       } else {
          const female = candidates.find(v => femaleKeywords.some(k => v.name.includes(k)));
          if (female) return female;
       }
    }

    // 3. Fallback to just matching language
    if (candidates.length > 0) return candidates[0];

    // 4. Fallback to English if target not found
    return voices.find(v => v.lang.startsWith('en')) || voices[0];
  };

  const handlePlayHistory = (item: HistoryItem) => {
    if (item.audioUrl.startsWith('local:')) {
      // Local Playback logic
      window.speechSynthesis.cancel();
      const content = item.audioUrl.replace('local:', '');
      const voiceName = item.voiceName; // This is the displayed name (e.g., Binh)
      
      // Try to re-resolve the voice based on stored metadata or just pick best current
      const targetLangCode = item.targetLangName === 'Vietnamese' ? 'vi' : 'en';
      const dummyVoice = standardVoices.find(v => getTranslatedName(v) === voiceName) || standardVoices[0];
      
      const utterance = new SpeechSynthesisUtterance(content);
      const sysVoice = getBestSystemVoice(dummyVoice, targetLangCode);
      if (sysVoice) utterance.voice = sysVoice;
      
      utterance.rate = item.speed;
      // Map Pitch string to number
      utterance.pitch = item.pitch === 'high' ? 1.2 : item.pitch === 'low' ? 0.8 : 1.0;
      
      window.speechSynthesis.speak(utterance);
    } else {
      // Cloud Playback logic
      if (audioRef.current) { 
        audioRef.current.src = item.audioUrl; 
        audioRef.current.play().catch(e => console.warn("Playback error:", e)); 
      }
    }
  };

  const handleGenerate = async (overrideText?: string, overrideRefAudio?: string, overrideVoice?: Voice) => {
    const targetText = overrideText || text;
    const targetVoice = overrideVoice || selectedVoice;

    if (!targetText.trim()) return;
    
    setIsGenerating(true);
    setProgress(null);
    setError(null);

    // --- OFFLINE MODE LOGIC ---
    if (ttsMode === 'local') {
      try {
        window.speechSynthesis.cancel(); // Stop current
        const targetLangCode = lang === 'vi' ? 'vi' : 'en';
        const sysVoice = getBestSystemVoice(targetVoice, targetLangCode);

        const utterance = new SpeechSynthesisUtterance(targetText);
        if (sysVoice) utterance.voice = sysVoice;
        utterance.rate = speed;
        utterance.pitch = pitch === 'high' ? 1.2 : pitch === 'low' ? 0.8 : 1.0;

        utterance.onend = () => {
          setIsGenerating(false);
        };
        
        utterance.onerror = (e) => {
          console.error(e);
          setIsGenerating(false);
          setError("TTS Error");
        };

        window.speechSynthesis.speak(utterance);

        // Add to history with special local protocol
        const newItem: HistoryItem = { 
          id: Date.now().toString(), 
          text: targetText, 
          voiceName: getTranslatedName(targetVoice), 
          geminiVoice: targetVoice.geminiVoice, 
          targetLangName: lang === 'vi' ? 'Vietnamese' : 'English', 
          audioUrl: `local:${targetText}`, // Store text for playback
          timestamp: Date.now(), 
          speed, 
          pitch, 
          isCloned: false,
          projectTag: 'OFFLINE'
        };
        setHistory(prev => [newItem, ...prev]);

      } catch (err) {
        setIsGenerating(false);
        setError("Offline generation failed.");
      }
      return; // Exit early
    }

    // --- ONLINE MODE LOGIC ---
    abortControllerRef.current = new AbortController();

    try {
      const targetLangName = lang === 'vi' ? 'Vietnamese' : 'English';
      let audioUrl = "";
      
      if (overrideRefAudio || targetVoice.referenceAudio) {
        const refAudio = overrideRefAudio || targetVoice.referenceAudio;
        if (!refAudio) throw new Error("Missing reference audio for cloning.");
        audioUrl = await generateClonedSpeech(targetText, refAudio, (p) => setProgress(p), abortControllerRef.current.signal);
      } else {
        audioUrl = await generateSpeech(
          targetText, 
          targetVoice.geminiVoice, 
          targetLangName, 
          (p) => setProgress(p), 
          speed, 
          pitch, 
          { bgmUrl, enableSmartSFX },
          abortControllerRef.current.signal
        );
      }

      const newItem: HistoryItem = { 
        id: Date.now().toString(), 
        text: targetText, 
        voiceName: getTranslatedName(targetVoice), 
        geminiVoice: targetVoice.geminiVoice, 
        targetLangName, 
        audioUrl, 
        timestamp: Date.now(), 
        speed, 
        pitch, 
        isCloned: !!overrideRefAudio || !!targetVoice.referenceAudio 
      };
      
      setHistory(prev => [newItem, ...prev]);
      setLastGeneratedUrl(audioUrl);
      if (audioRef.current) { 
        audioRef.current.src = audioUrl; 
        audioRef.current.play().catch(e => console.warn("Autoplay blocked:", e));
      }
    } catch (err: any) { 
      if (err.message === "ABORTED") {
        console.log("Generation stopped by user.");
      } else if (err.message === "QUOTA_EXCEEDED") {
        setError(lang === 'vi' ? "Giới hạn sử dụng miễn phí (10 lượt/ngày) đã hết. Vui lòng thử lại sau 24h hoặc sử dụng API Key trả phí." : "Free usage limit (10/day) reached. Please try again later or use a paid API Key.");
      } else {
        setError(err.message || "Error generating audio."); 
      }
    } finally { 
      setIsGenerating(false); 
      abortControllerRef.current = null;
    }
  };

  // --- BATCH PROCESSING LOGIC WITH AUTO-SAVE ---
  const handleStartBatch = async (prefix: string) => {
    setIsBatchProcessing(true);
    const tasksToProcess = batchTasks.filter(t => t.status === 'pending');
    
    // Check if offline
    if (ttsMode === 'local') {
       alert(lang === 'vi' ? "Chế độ Hàng loạt chưa hỗ trợ Offline." : "Batch mode not supported in Offline mode.");
       setIsBatchProcessing(false);
       return;
    }

    for (const task of tasksToProcess) {
      if (!isBatchProcessing) break; // Check cancel
      
      // Update status to processing
      setBatchTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'processing' } : t));
      
      try {
        const voice = VOICES.find(v => v.id === task.voiceId) || VOICES[0];
        const url = await generateSpeech(task.text, voice.geminiVoice, task.targetLang, undefined, task.speed, task.pitch);
        
        // Update status done
        setBatchTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'done', audioUrl: url } : t));
        
        // Auto Save Logic
        if (autoBatchDownload && url) {
           const filename = `${prefix}_${task.id}_${voice.name}.wav`;
           
           if (window.electronAPI && batchOutputDirectory) {
               // Use Electron Save
               const response = await fetch(url);
               const blob = await response.blob();
               const buffer = await blob.arrayBuffer();
               await window.electronAPI.saveAudioFile(batchOutputDirectory, filename, buffer);
           } else {
               // Fallback Browser Download
               const a = document.createElement('a');
               a.href = url;
               a.download = filename;
               a.click();
           }
        }
      } catch (e) {
        setBatchTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'error' } : t));
      }
    }
    setIsBatchProcessing(false);
  };

  const handleMusicGenerate = async (audioUrl: string, artistName: string, projectName: string) => {
    const newItem: HistoryItem = { id: Date.now().toString(), text: `[Music Production] ${projectName}`, voiceName: artistName, geminiVoice: 'music-engine', targetLangName: 'Music', audioUrl, timestamp: Date.now(), speed: 1.0, pitch: 'normal' };
    setHistory(prev => [newItem, ...prev]);
    if (audioRef.current) { audioRef.current.src = audioUrl; audioRef.current.play().catch(e => console.warn(e)); }
  };

  const studioModes = [
    { id: 'editor', label: t.studioSingle, icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' },
    { id: 'batch', label: t.studioBatch, icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
    { id: 'vocal', label: t.studioClone, icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { id: 'music', label: t.studioMusic, icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3' },
    { id: 'writer', label: t.studioWriter, icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5' }
  ];

  if (showWelcome) {
    return <WelcomeScreen onEnter={handleEnterApp} lang={lang} onLangToggle={toggleLang} />;
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-24 animate-in fade-in duration-700">
      <Header 
        activeTab={activeTab === 'batch' || activeTab === 'vocal' || activeTab === 'writer' || activeTab === 'music' || activeTab === 'admin' ? 'editor' : activeTab} 
        onTabChange={(tab: any) => setActiveTab(tab)} 
        user={user}
        onAuthClick={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        lang={lang}
        onLangToggle={toggleLang}
      />
      
      {isStudioPage && (
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 pt-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="w-full lg:w-auto bg-white/60 backdrop-blur-md p-1.5 rounded-2xl border border-white shadow-sm flex gap-1 overflow-x-auto no-scrollbar scroll-smooth snap-x">
              {studioModes.map(mode => (
                <button key={mode.id} onClick={() => setActiveTab(mode.id as any)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase whitespace-nowrap smooth-transition flex items-center gap-2 snap-start ${activeTab === mode.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:text-indigo-600 hover:bg-white'}`}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={mode.icon} /></svg>
                  {mode.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 w-full lg:w-auto">
               {/* Update Folder Button (Electron) */}
               {window.electronAPI && (
                <button onClick={() => window.electronAPI?.openUpdateFolder()} className="flex-none p-3 bg-slate-200 text-slate-600 rounded-2xl hover:bg-indigo-100 transition-all" title="Open App Folder">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" /></svg>
                </button>
               )}
              <button onClick={handleOpenKeySelector} className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border smooth-transition ${hasUserKey ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-400'}`}>
                <div className={`w-2 h-2 rounded-full ${hasUserKey ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
                {hasUserKey ? t.keyActive : t.connectKey}
              </button>
              {license.status === 'activated' && (
                <div className="flex-1 lg:flex-none px-6 py-3 bg-indigo-600 text-white rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-100">
                  <span className="text-[10px] font-black uppercase tracking-widest">{t.proLicense}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="max-w-[1440px] mx-auto px-6 md:px-12 py-10">
        {activeTab === 'pricing' ? (
          <PricingContent onSelectPlan={(plan) => setSelectedPlan(plan)} lang={lang} />
        ) : activeTab === 'docs' ? (
          <DocumentationContent lang={lang} />
        ) : activeTab === 'vocal' ? (
          <VocalStudio onGenerate={handleGenerate} onStop={stopGeneration} onRefreshCustomVoices={refreshCustomVoices} isGenerating={isGenerating} progress={progress} lang={lang} />
        ) : activeTab === 'music' ? (
          <MusicStudio onGenerate={handleMusicGenerate} isGenerating={isGenerating} progress={progress} lang={lang} />
        ) : activeTab === 'writer' ? (
          <WriterStudio onSendToEditor={(t) => { setText(t); setActiveTab('editor'); }} lang={lang} />
        ) : activeTab === 'admin' ? (
          <AdminStudio lang={lang} />
        ) : activeTab === 'batch' ? (
          <BatchStudio 
            tasks={batchTasks} 
            onAddBatchTasks={(newTasks) => setBatchTasks(prev => [...prev, ...newTasks.map((t, i) => ({...t, id: Date.now() + i, status: 'pending'} as BatchTask))])} 
            onUpdateTask={(id, updates) => setBatchTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))} 
            onRemoveTask={(id) => setBatchTasks(prev => prev.filter(t => t.id !== id))} 
            onClearTasks={() => setBatchTasks([])} 
            onStartBatch={handleStartBatch} 
            onStopBatch={() => setIsBatchProcessing(false)} 
            onDownloadAll={() => {}} 
            isProcessing={isBatchProcessing} 
            languages={LANGUAGES} 
            autoDownload={autoBatchDownload} 
            onToggleAutoDownload={() => setAutoBatchDownload(!autoBatchDownload)} 
            lang={lang}
            outputDirectory={batchOutputDirectory}
            onSelectOutputDirectory={handleSelectBatchDirectory}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              {/* Neural Translation Hub */}
              <div className="bg-white rounded-[2.5rem] p-4 md:p-6 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 11.37 9.188 16.524 5 20" /></svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">{t.transHub}</p>
                    <p className="text-[11px] font-bold text-slate-900 leading-none">{lang === 'vi' ? 'Dịch thuật Neural' : 'Neural Translation'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                  <select 
                    value={sourceLang} 
                    onChange={(e) => setSourceLang(e.target.value)}
                    className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-600 focus:ring-0 border-none px-4 py-1.5"
                  >
                    {LANGUAGES.map(l => (
                      <option key={l.code} value={l.code}>
                        {l.code === 'Auto' ? (lang === 'vi' ? '✨ Tự động nhận diện' : '✨ Auto Detect') : l.name}
                      </option>
                    ))}
                  </select>
                  
                  <button 
                    onClick={swapTranslationLangs} 
                    disabled={sourceLang === 'Auto'}
                    className={`p-2 bg-white rounded-xl shadow-sm smooth-transition active:scale-90 ${sourceLang === 'Auto' ? 'opacity-20 cursor-not-allowed' : 'text-slate-400 hover:text-indigo-600'}`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                  </button>

                  <select 
                    value={targetLang} 
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-600 focus:ring-0 border-none px-4 py-1.5"
                  >
                    {LANGUAGES.filter(l => l.code !== 'Auto').map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                  </select>
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept=".txt,.md,.srt" 
                  className="hidden" 
                  onChange={handleFileUpload} 
                />
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-3 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-indigo-100 smooth-transition flex items-center gap-2"
                    title={lang === 'vi' ? "Tải lên tệp văn bản (.txt)" : "Upload text file (.txt)"}
                  >
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0L8 8m4-4v12" /></svg>
                  </button>
                  <button 
                    onClick={handleTranslate}
                    disabled={isTranslating || !text.trim()}
                    className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg smooth-transition flex items-center gap-2 ${isTranslating ? 'bg-slate-200 text-slate-400' : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-slate-200'}`}
                  >
                    {isTranslating && <div className="w-3 h-3 border-2 border-white/30 border-t-white animate-spin rounded-full"></div>}
                    {isTranslating ? t.translating : t.translateNow}
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 border border-slate-100">
                <textarea 
                  value={text} 
                  onChange={(e) => setText(e.target.value)} 
                  placeholder={t.placeholderEditor} 
                  className="w-full h-64 p-6 rounded-3xl bg-slate-50 border-none focus:ring-4 focus:ring-indigo-50 text-slate-700 resize-none smooth-transition placeholder:text-slate-300 font-medium leading-relaxed text-lg" 
                />
                <div className="mt-8 flex flex-col gap-6 border-t border-slate-50 pt-8">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6">
                      <button onClick={() => setEnableSmartSFX(!enableSmartSFX)} className="flex items-center gap-4 group">
                        <div className={`w-12 h-6 rounded-full p-1 smooth-transition ${enableSmartSFX ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full smooth-transition shadow-sm ${enableSmartSFX ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-600 smooth-transition">{t.smartSfx}</p>
                          <p className="text-[9px] font-bold text-slate-300 mt-0.5">{t.smartSfxSub}</p>
                        </div>
                      </button>

                      {/* Offline Mode Toggle with Smart Mapping explanation */}
                      <button onClick={() => setTtsMode(prev => prev === 'cloud' ? 'local' : 'cloud')} className="flex items-center gap-4 group">
                        <div className={`w-12 h-6 rounded-full p-1 smooth-transition ${ttsMode === 'local' ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full smooth-transition shadow-sm ${ttsMode === 'local' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </div>
                        <div className="text-left">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-emerald-500 smooth-transition">{lang === 'vi' ? 'Chế độ Offline' : 'Offline Mode'}</p>
                          <p className="text-[9px] font-bold text-slate-300 mt-0.5">{lang === 'vi' ? 'Sử dụng giọng máy tính' : 'Uses system voices'}</p>
                        </div>
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.speed}</span>
                      <div className="flex bg-slate-100 p-1 rounded-xl">
                        {[0.8, 1.0, 1.2, 1.5].map(s => (
                          <button key={s} onClick={() => setSpeed(s)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black smooth-transition ${speed === s ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{s}x</button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => isGenerating ? stopGeneration() : handleGenerate()} 
                      disabled={!isGenerating && !text.trim()} 
                      className={`flex-1 py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-sm text-white shadow-2xl smooth-transition relative overflow-hidden active:scale-[0.98] ${isGenerating ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}
                    >
                      {isGenerating && progress && (
                        <div className="absolute bottom-0 left-0 h-1 bg-white/30 transition-all duration-300" style={{ width: `${(progress.current / progress.total) * 100}%` }}></div>
                      )}
                      {isGenerating ? (lang === 'vi' ? 'DỪNG LẠI' : 'STOP') : t.generateBtn}
                    </button>

                    {lastGeneratedUrl && !isGenerating && (
                      <button 
                        onClick={() => handleGenerate()}
                        className="px-8 py-6 rounded-3xl bg-slate-100 text-indigo-600 hover:bg-indigo-50 smooth-transition active:scale-[0.98] flex items-center justify-center group"
                        title={lang === 'vi' ? 'Tạo lại' : 'Regenerate'}
                      >
                        <svg className="w-6 h-6 group-hover:rotate-180 smooth-transition duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {error && (
                    <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold text-center animate-in fade-in">
                      {error}
                    </div>
                  )}
                </div>
              </div>
              
              <section className="space-y-8">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">{t.voiceLibrary}</h2>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${ttsMode === 'local' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-400'}`}>
                    {ttsMode === 'local' ? (lang === 'vi' ? 'Offline (Giọng hệ thống)' : 'Offline (System Voice)') : 'Pro Voices'}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {/* Show Custom Voices */}
                  {customVoices.length > 0 && customVoices.map(v => <VoiceCard key={v.id} voice={v} isSelected={selectedVoice.id === v.id} onSelect={setSelectedVoice} lang={lang} />)}
                  
                  {standardVoices.map((voice) => (
                    <VoiceCard key={voice.id} voice={voice} isSelected={selectedVoice.id === voice.id} onSelect={setSelectedVoice} lang={lang} />
                  ))}
                </div>
              </section>
            </div>

            <div className="lg:col-span-4">
              <section className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col h-[700px] lg:h-[calc(100vh-160px)] lg:sticky lg:top-32">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">{t.historyTitle}</h2>
                  <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <HistoryList lang={lang} items={history} onPlay={handlePlayHistory} onDelete={(id) => setHistory(prev => prev.filter(h => h.id !== id))} />
                </div>
              </section>
            </div>
          </div>
        )}
      </main>
      
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onSuccess={(u) => setUser(u)} lang={lang} />}
      {selectedPlan && <CheckoutModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} lang={lang} />}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default App;
