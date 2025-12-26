
import React, { useState, useEffect, useRef } from 'react';
import { generateAiContentStream } from '../services/geminiTtsService';
import { Lang, getT } from '../services/i18n';

interface WriterStudioProps {
  onSendToEditor: (text: string) => void;
  lang: Lang;
}

const WriterStudio: React.FC<WriterStudioProps> = ({ onSendToEditor, lang }) => {
  const t = getT(lang);
  const [taskType, setTaskType] = useState<'writing' | 'prompt'>('writing');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const presets = {
    writing: lang === 'vi' ? [
      { id: 'script', label: 'Kịch bản Video', prompt: 'Viết kịch bản TikTok 60s giới thiệu iPhone 15 Pro Max bản Titan, giọng văn hào hứng, kịch tính.' },
      { id: 'story', label: 'Kể chuyện đêm muộn', prompt: 'Viết một mẩu chuyện ngắn kinh dị đô thị Việt Nam, bối cảnh một chung cư cũ lúc 2h sáng.' },
      { id: 'ad', label: 'Quảng cáo FB', prompt: 'Viết nội dung quảng cáo khóa học tiếng Anh cho người đi làm bận rộn, nhấn mạnh vào sự tiện lợi.' },
    ] : [
      { id: 'script', label: 'Video Script', prompt: 'Write a 60s TikTok script introducing iPhone 15 Pro Max Titanium, exciting and dramatic tone.' },
      { id: 'story', label: 'Night Story', prompt: 'Write a short urban horror story set in an old apartment at 2 AM.' },
      { id: 'ad', label: 'FB Ad', prompt: 'Write ad copy for an English course for busy professionals, emphasizing convenience.' },
    ],
    prompt: lang === 'vi' ? [
      { id: 'mj', label: 'Art Cinematic', prompt: 'Cyberpunk Hanoi in 2077, cinematic lighting, ultra realistic, 8k.' },
      { id: 'photo', label: 'Portrait Pro', prompt: 'Close up portrait of a Vietnamese girl in Ao Dai, rainy old town background, soft bokeh.' },
    ] : [
      { id: 'mj', label: 'Art Cinematic', prompt: 'Cyberpunk London in 2077, cinematic lighting, ultra realistic, 8k.' },
      { id: 'photo', label: 'Portrait Pro', prompt: 'Close up portrait of a professional model, sunset background, soft bokeh.' },
    ]
  };

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setIsGenerating(true);
    setError(null);
    setOutput(""); 
    
    try {
      const stream = generateAiContentStream(input, taskType);
      for await (const text of stream) {
        setOutput(prev => prev + text);
      }
    } catch (err: any) {
      setError(err.message || (lang === 'vi' ? "Kết nối AI bị gián đoạn." : "AI connection interrupted."));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-2xl shadow-gray-200/40">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter">{t.writerTitle}</h2>
            <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">{t.writerSub}</p>
          </div>
          <div className="flex bg-gray-100 p-2 rounded-2xl border border-gray-200">
            <button 
              onClick={() => setTaskType('writing')}
              className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${taskType === 'writing' ? 'bg-indigo-600 text-white shadow-xl' : 'text-gray-400 hover:text-indigo-600'}`}
            >
              {t.writerWrite}
            </button>
            <button 
              onClick={() => setTaskType('prompt')}
              className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${taskType === 'prompt' ? 'bg-teal-600 text-white shadow-xl' : 'text-gray-400 hover:text-teal-600'}`}
            >
              {t.writerPrompt}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <label className="text-[11px] font-black text-indigo-600 uppercase tracking-widest ml-1">{t.writerInput}</label>
              <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={taskType === 'writing' ? (lang === 'vi' ? "Hãy mô tả ý tưởng của bạn... AI sẽ viết thay bạn." : "Describe your idea... AI will write for you.") : (lang === 'vi' ? "Nhập từ khóa ngắn, AI sẽ tạo prompt chuyên sâu." : "Enter short keywords, AI will generate deep prompts.") }
                className="w-full h-48 bg-gray-50 border border-gray-200 rounded-[2.5rem] p-8 text-base font-medium text-gray-700 focus:ring-4 focus:ring-indigo-100 focus:bg-white transition-all resize-none shadow-inner"
              />
            </div>

            <div className="space-y-4">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">{t.writerQuick}</label>
              <div className="flex flex-wrap gap-2">
                {presets[taskType].map(p => (
                  <button 
                    key={p.id}
                    onClick={() => setInput(p.prompt)}
                    className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-[11px] font-bold text-gray-500 hover:border-indigo-600 hover:text-indigo-600 hover:shadow-md transition-all"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !input.trim()}
              className={`w-full py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-4 transition-all shadow-2xl active:scale-95 ${
                taskType === 'writing' 
                ? 'bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700' 
                : 'bg-teal-600 text-white shadow-teal-200 hover:bg-teal-700'
              } disabled:opacity-50 disabled:grayscale`}
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.4s]"></div>
                  <span>{t.writerThinking}</span>
                </div>
              ) : t.writerGen}
            </button>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-4 h-full flex flex-col">
              <div className="flex items-center justify-between px-2">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{t.writerDraft}</label>
                {output && !isGenerating && (
                  <button 
                    onClick={() => onSendToEditor(output)}
                    className="group flex items-center gap-2 text-[11px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700"
                  >
                    {t.sendToEditor}
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </button>
                )}
              </div>
              
              <div className="relative flex-1 min-h-[500px]">
                <div 
                  ref={outputRef}
                  className={`absolute inset-0 w-full h-full bg-slate-950 rounded-[3rem] p-10 text-slate-100 text-lg font-medium leading-relaxed overflow-y-auto border-4 border-slate-900 custom-scrollbar shadow-2xl ${!output && 'flex items-center justify-center'}`}
                >
                  {output ? (
                    <div className="whitespace-pre-wrap">{output}</div>
                  ) : (
                    <div className="text-center space-y-4 opacity-20">
                       <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                       </svg>
                       <p className="text-sm font-black uppercase tracking-widest">{t.writerWait}</p>
                    </div>
                  )}
                </div>
                
                {output && !isGenerating && (
                   <div className="absolute bottom-6 right-6 flex gap-2">
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(output);
                          const btn = document.getElementById('copy-hint');
                          if (btn) btn.innerText = t.copied;
                          setTimeout(() => { if (btn) btn.innerText = t.copy; }, 2000);
                        }}
                        className="px-6 py-3 bg-slate-800 hover:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all border border-slate-700"
                      >
                        <span id="copy-hint">{t.copy}</span>
                      </button>
                   </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WriterStudio;
