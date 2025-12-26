
import React, { useState, useRef, useEffect } from 'react';
import { Lang } from '../services/i18n';

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob, base64: string) => void;
  lang?: Lang;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete, lang = 'vi' }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<any>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          onRecordingComplete(blob, base64);
        };
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
      setTimer(0);
      intervalRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    } catch (err) {
      alert(lang === 'vi' ? "Không thể truy cập Micro." : "Microphone access denied.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    clearInterval(intervalRef.current);
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-2xl ${isRecording ? 'bg-rose-600 animate-pulse scale-110' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
        {isRecording ? (
          <button onClick={stopRecording} className="w-8 h-8 bg-white rounded-md"></button>
        ) : (
          <button onClick={startRecording} className="text-white">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"/></svg>
          </button>
        )}
      </div>
      <div className="text-center">
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
          {isRecording ? `${lang === 'vi' ? 'Đang ghi âm' : 'Recording'}: ${formatTime(timer)}` : (lang === 'vi' ? 'Nhấn để bắt đầu thu mẫu' : 'Click to start recording')}
        </p>
        <p className="text-[10px] text-slate-600 font-bold mt-1">{lang === 'vi' ? 'Đọc đoạn văn 10-15 giây để đạt kết quả tốt nhất.' : 'Read for 10-15s for best results.'}</p>
      </div>
    </div>
  );
};

export default VoiceRecorder;
