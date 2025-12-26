
import React, { useState } from 'react';
import { VOICES } from '../constants';
import { Voice } from '../types';
import { GenerationProgress, generateLyrics, generateSpeech } from '../services/geminiTtsService';
import { Lang, getT } from '../services/i18n';

interface MusicStudioProps {
  onGenerate: (audioUrl: string, artistName: string, projectName: string) => void;
  isGenerating: boolean;
  progress: GenerationProgress | null;
  lang: Lang;
}

const MusicStudio: React.FC<MusicStudioProps> = ({ onGenerate, isGenerating, progress, lang }) => {
  const t = getT(lang);
  const [lyrics, setLyrics] = useState('');
  const [projectName, setProjectName] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<Voice>(VOICES.find(v => v.isLegend) || VOICES[0]);
  
  const [genre, setGenre] = useState('Pop');
  const [mood, setMood] = useState('passionate');

  const [showAILyricist, setShowAILyricist] = useState(false);
  const [lyricTheme, setLyricTheme] = useState('');
  const [lyricGenre, setLyricGenre] = useState('Pop');
  const [isLyricGenerating, setIsLyricGenerating] = useState(false);

  const artists = VOICES.filter(v => v.isLegend);

  const GENRES = ['Pop', 'Ballad', 'Lofi', 'R&B', 'Rap', 'Soul', 'EDM'];
  const MOOD_KEYS = ['passionate', 'energetic', 'melancholy', 'youthful', 'epic', 'chill'];

  const getName = (voice: Voice) => {
    const key = `name_${voice.id}` as keyof typeof t;
    return (t[key] as string) || voice.name;
  };

  const getVoiceDesc = (voice: Voice) => {
    const key = `voiceDesc_${voice.id}` as keyof typeof t;
    return (t[key] as string) || voice.description;
  };

  const getMoodLabel = (mKey: string) => {
    const key = `mood_${mKey}` as keyof typeof t;
    return (t[key] as string) || mKey;
  };

  const handleGenerateLyrics = async () => {
    if (!lyricTheme.trim()) return;
    setIsLyricGenerating(true);
    try {
      const result = await generateLyrics(lyricTheme, lyricGenre);
      if (result) {
        setLyrics(result);
        setShowAILyricist(false);
        setGenre(lyricGenre);
      }
    } catch (err) {
      alert(lang === 'vi' ? "Lỗi khi sáng tác lời bài hát." : "Error composing lyrics.");
    } finally {
      setIsLyricGenerating(false);
    }
  };

  const handleStartProduction = async () => {
    if (!lyrics.trim()) return;
    try {
      const moodLabel = getMoodLabel(mood);
      const styleDesc = `Singing in ${genre} style, ${moodLabel} mood. ${selectedArtist.styleDescription || ''}`;
      const audioUrl = await generateSpeech(
        lyrics, 
        selectedArtist.geminiVoice, 
        lang === 'vi' ? 'Vietnamese' : 'English', 
        undefined, 
        1.0, 
        'normal', 
        { styleDescription: styleDesc }
      );
      onGenerate(audioUrl, getName(selectedArtist), projectName || 'My Song');
    } catch (err) {
      alert(lang === 'vi' ? "Lỗi sản xuất âm nhạc." : "Music production error.");
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <div className="bg-[#0f172a] rounded-[2rem] md:rounded-[3.5rem] border border-indigo-500/20 shadow-[0_0_60px_rgba(79,70,229,0.12)] overflow-hidden">
        <div className="p-6 md:p-14 space-y-8 md:space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-6 md:pb-10">
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white">
                   <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                </div>
                <span className="text-indigo-400 text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em]">Neural Music Engine</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-none">AI Music <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Production</span></h2>
            </div>
            <div className="w-full md:w-72">
               <label className="text-[8px] md:text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2 ml-1">{t.projectName}</label>
               <input 
                type="text" 
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="New Track..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl md:rounded-2xl py-3 md:py-4 px-4 md:px-6 text-white text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all outline-none placeholder:text-slate-700"
               />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-14">
            <div className="lg:col-span-5 space-y-10 md:space-y-12">
              <section className="space-y-4 md:space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">{t.artist}</h3>
                  <span className="text-[8px] md:text-[9px] text-indigo-400 font-black bg-indigo-500/10 px-2 md:px-3 py-1 rounded-full border border-indigo-500/20">PREMIUM VOCALS</span>
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-4 max-h-[250px] md:max-h-[320px] overflow-y-auto pr-2 md:pr-3 custom-scrollbar">
                  {artists.map((artist) => (
                    <button 
                      key={artist.id}
                      onClick={() => setSelectedArtist(artist)}
                      className={`p-3 md:p-5 rounded-2xl md:rounded-[2rem] border-2 transition-all text-left relative group overflow-hidden ${
                        selectedArtist.id === artist.id 
                        ? 'border-indigo-500 bg-indigo-500/10' 
                        : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                      }`}
                    >
                      <div className="relative z-10">
                        <p className={`text-[11px] md:text-sm font-black transition-colors ${selectedArtist.id === artist.id ? 'text-white' : 'text-slate-400'}`}>{getName(artist)}</p>
                        <p className="text-[8px] md:text-[10px] text-slate-500 font-bold mt-1 line-clamp-1">{getVoiceDesc(artist)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-6 md:space-y-8">
                <div className="space-y-4">
                  <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">{t.genre} & {t.mood}</h3>
                  <div className="flex flex-wrap gap-2">
                    {GENRES.map(g => (
                      <button key={g} onClick={() => setGenre(g)} className={`px-3 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase transition-all ${genre === g ? 'bg-white text-slate-950' : 'bg-slate-900 text-slate-500 border border-slate-800'}`}>{g}</button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {MOOD_KEYS.map(mKey => (
                      <button key={mKey} onClick={() => setMood(mKey)} className={`px-3 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase transition-all ${mood === mKey ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-500 border border-slate-800'}`}>{getMoodLabel(mKey)}</button>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            <div className="lg:col-span-7 flex flex-col space-y-6 md:space-y-8">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">{t.lyrics}</h3>
                  <button onClick={() => setShowAILyricist(!showAILyricist)} className={`px-4 py-1.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${showAILyricist ? 'bg-amber-400 text-amber-950' : 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'}`}>{t.aiLyricist}</button>
                </div>

                <div className="relative">
                  {showAILyricist && (
                    <div className="absolute inset-0 bg-slate-900/98 backdrop-blur-md border-2 border-amber-400/30 rounded-2xl md:rounded-[3rem] p-6 md:p-10 z-30 flex flex-col gap-6 animate-in zoom-in-95">
                      <h4 className="text-amber-400 text-sm md:text-lg font-black uppercase tracking-widest">{t.aiLyricist}</h4>
                      <textarea 
                        value={lyricTheme}
                        onChange={(e) => setLyricTheme(e.target.value)}
                        placeholder={t.lyricTheme}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl md:rounded-2xl p-4 md:p-5 text-white text-sm font-medium outline-none resize-none"
                      />
                      <button onClick={handleGenerateLyrics} disabled={isLyricGenerating} className="w-full py-4 bg-amber-400 text-amber-950 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-xs">
                        {isLyricGenerating ? (lang === 'vi' ? 'Đang viết...' : 'Writing...') : t.startLyricist}
                      </button>
                    </div>
                  )}

                  <textarea 
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                    placeholder={lang === 'vi' ? 'Lời bài hát...' : 'Lyrics content...'}
                    className="w-full h-[300px] md:h-[450px] bg-slate-900/60 border border-slate-800 rounded-2xl md:rounded-[3rem] p-6 md:p-10 text-white text-sm md:text-xl font-medium leading-relaxed outline-none"
                  />
                </div>
              </div>

              <button 
                onClick={handleStartProduction}
                disabled={isGenerating || !lyrics.trim()}
                className="w-full py-5 md:py-8 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-xl md:rounded-[2.5rem] font-black uppercase text-xs md:text-sm tracking-widest md:tracking-[0.5em] shadow-2xl active:scale-95 transition-all"
              >
                {isGenerating ? (lang === 'vi' ? 'Hệ thống đang xử lý...' : 'Processing...') : t.startProduction}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicStudio;
