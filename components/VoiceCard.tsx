
import React, { useRef, useState, useEffect } from 'react';
import { Voice } from '../types';
import { Lang, getT } from '../services/i18n';
import { generateSpeech } from '../services/geminiTtsService';

interface VoiceCardProps {
  voice: Voice;
  isSelected: boolean;
  onSelect: (voice: Voice) => void;
  lang?: Lang;
}

const VoiceCard: React.FC<VoiceCardProps> = ({ voice, isSelected, onSelect, lang = 'vi' as Lang }) => {
  const t = getT(lang);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  // Cache the preview URL to avoid re-generating on subsequent hovers
  const [cachedPreviewUrl, setCachedPreviewUrl] = useState<string | null>(null);
  
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

  const stopPreview = () => {
    // Clear debounce timer
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    
    // Abort any pending API request to save quota
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPreviewing(false);
    setLoadingPreview(false);
  };

  const handleMouseEnter = () => {
    // Debounce 250ms: Fast enough to feel responsive, slow enough to skip fly-over
    hoverTimerRef.current = setTimeout(async () => {
      try {
        setLoadingPreview(true);

        // If we have a cached URL, use it immediately (no API cost)
        if (cachedPreviewUrl) {
            const audio = new Audio(cachedPreviewUrl);
            audioRef.current = audio;
            audio.onended = () => {
              setIsPreviewing(false);
              setLoadingPreview(false);
            };
            setLoadingPreview(false);
            setIsPreviewing(true);
            await audio.play();
            return;
        }

        // Setup AbortController for this specific request
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();

        const previewText = lang === 'vi' 
          ? `Xin chào, mình là ${getName(voice)}. Đây là giọng đọc mẫu của mình.` 
          : `Hello, I am ${getName(voice)}. This is my sample voice.`;
          
        const targetLang = lang === 'vi' ? 'Vietnamese' : 'English';
        const styleDesc = voice.styleDescription || voice.description;
        
        const url = await generateSpeech(
          previewText, 
          voice.geminiVoice, 
          targetLang, 
          undefined, 
          1.0, 
          'normal',
          { styleDescription: styleDesc },
          abortControllerRef.current.signal // Pass signal to service
        );
        
        setCachedPreviewUrl(url);
        
        // Only play if we are still hovering (and not aborted implicitly)
        // Note: generateSpeech throws if aborted, so we land in catch block usually.
        // But double check is safe.
        if (!abortControllerRef.current?.signal.aborted) {
          const audio = new Audio(url);
          audioRef.current = audio;
          audio.onended = () => {
            setIsPreviewing(false);
            setLoadingPreview(false);
          };
          
          setLoadingPreview(false);
          setIsPreviewing(true);
          await audio.play();
        }
      } catch (err: any) {
        // Ignore aborted requests (user moved mouse away)
        if (err.message === 'ABORTED') {
          setLoadingPreview(false);
          return;
        }

        // Handle Quota Exceeded silently or with debug log to avoid user panic
        if (err.message === 'QUOTA_EXCEEDED' || (err.message && err.message.includes('429'))) {
          console.debug("Preview rate limit hit - ignoring.");
        } else {
          console.error("Preview failed", err);
        }
        setLoadingPreview(false);
      }
    }, 250);
  };

  const handleMouseLeave = () => {
    stopPreview();
  };

  useEffect(() => {
    return () => stopPreview();
  }, []);

  return (
    <button
      onClick={() => onSelect(voice)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
          isPreviewing || loadingPreview
            ? 'bg-indigo-600 text-white scale-110'
            : voice.gender === 'Male' ? 'bg-indigo-50 text-indigo-500' : 'bg-rose-50 text-rose-500'
        }`}>
          {loadingPreview ? (
             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : isPreviewing ? (
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
             </svg>
          ) : voice.gender === 'Male' ? (
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
      
      {/* Visual Indicator for Hover Preview */}
      {loadingPreview && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center rounded-[1.5rem]">
           <div className="text-[9px] font-black text-indigo-600 uppercase tracking-widest animate-pulse">{lang === 'vi' ? 'Đang tải giọng...' : 'Loading preview...'}</div>
        </div>
      )}
    </button>
  );
};

export default VoiceCard;
