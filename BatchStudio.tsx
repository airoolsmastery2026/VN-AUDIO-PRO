
import React, { useState, useRef } from 'react';
import { BatchTask, Voice } from '../types';
import { VOICES } from '../constants';
import { Lang, getT } from '../services/i18n';
import { parseExcelOrCsv } from '../utils/fileHelpers';

interface BatchStudioProps {
  tasks: BatchTask[];
  onAddBatchTasks: (tasks: Partial<BatchTask>[]) => void;
  onUpdateTask: (id: string, updates: Partial<BatchTask>) => void;
  onRemoveTask: (id: string) => void;
  onClearTasks: () => void;
  onStartBatch: (prefix: string) => void;
  onStopBatch: () => void;
  onDownloadAll: (prefix: string) => void;
  isProcessing: boolean;
  languages: { code: string; name: string }[];
  autoDownload: boolean;
  onToggleAutoDownload: () => void;
  lang: Lang;
  autoStart?: boolean;
  onToggleAutoStart?: () => void;
  outputDirectory?: string | null;
  onSelectOutputDirectory?: () => void;
}

const BatchStudio: React.FC<BatchStudioProps> = ({
  tasks, onAddBatchTasks, onUpdateTask, onRemoveTask, onClearTasks, onStartBatch, onStopBatch, onDownloadAll, isProcessing, languages, autoDownload, onToggleAutoDownload, lang, autoStart = false, onToggleAutoStart, outputDirectory, onSelectOutputDirectory
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [filePrefix, setFilePrefix] = useState<string>('VNAudioPro_Batch');
  const t = getT(lang);

  const standardVoices = VOICES.filter(v => v.category === 'Standard');

  const getStatusBadge = (status: BatchTask['status']) => {
    switch (status) {
      case 'processing': return <span className="flex items-center gap-1.5 text-blue-600 font-black animate-pulse"><div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>{t.statusProcessing}</span>;
      case 'done': return <span className="flex items-center gap-1.5 text-green-600 font-black"><div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>{t.statusDone}</span>;
      case 'error': return <span className="flex items-center gap-1.5 text-rose-600 font-black"><div className="w-1.5 h-1.5 rounded-full bg-rose-600"></div>{t.statusError}</span>;
      default: return <span className="flex items-center gap-1.5 text-gray-400 font-black"><div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>{t.statusWait}</span>;
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const data = await parseExcelOrCsv(file);
        // Map raw data to BatchTask format
        const newTasks: Partial<BatchTask>[] = data.map((row: any) => {
          // Attempt to find fields regardless of case or specific header names if simple list
          const text = row.Text || row.text || row.content || (typeof row === 'object' ? Object.values(row)[0] : row);
          const voiceName = row.Voice || row.voice;
          const langCode = row.Language || row.language || row.lang;

          // Try to match voice name to ID, default to first standard voice
          let voiceId = standardVoices[0].id;
          if (voiceName) {
            const found = standardVoices.find(v => v.name.toLowerCase() === String(voiceName).toLowerCase());
            if (found) voiceId = found.id;
          }

          return {
            text: String(text),
            voiceId: voiceId,
            targetLang: langCode || 'Vietnamese',
            speed: 1.0,
            pitch: 'normal'
          };
        }).filter(t => t.text && t.text.trim().length > 0);

        onAddBatchTasks(newTasks);
        e.target.value = ''; // Reset input
      } catch (err) {
        alert(lang === 'vi' ? "Lỗi đọc file Excel/CSV." : "Error reading Excel/CSV file.");
        console.error(err);
      }
    }
  };

  const completedCount = tasks.filter(t => t.status === 'done').length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/40">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">{t.batchTitle}</h2>
            <div className="flex flex-wrap items-center gap-4">
               <button onClick={onToggleAutoDownload} className="flex items-center gap-2 group">
                 <div className={`w-10 h-5 rounded-full p-1 transition-colors duration-300 ${autoDownload ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                    <div className={`w-3 h-3 bg-white rounded-full transition-transform duration-300 ${autoDownload ? 'translate-x-5' : 'translate-x-0'}`}></div>
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-indigo-600 transition-colors">{t.autoDownload}</span>
               </button>
               {window.electronAPI && (
                 <button onClick={onSelectOutputDirectory} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg hover:border-indigo-300 transition-colors">
                    <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                    <span className="text-[10px] font-bold text-slate-600 truncate max-w-[150px]">{outputDirectory ? '.../' + outputDirectory.split(/[\\/]/).pop() : (lang === 'vi' ? 'Chọn thư mục lưu' : 'Select Output Folder')}</span>
                 </button>
               )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input type="file" accept=".xlsx,.xls,.csv,.txt" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
            <button onClick={() => fileInputRef.current?.click()} className="px-6 py-3 bg-indigo-50 text-indigo-600 font-bold rounded-2xl hover:bg-indigo-100 transition-all flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0L8 8m4-4v12" /></svg>
              {t.loadExcel}
            </button>
            <button onClick={() => onDownloadAll(filePrefix)} disabled={completedCount === 0 || isProcessing} className={`px-6 py-3 font-bold rounded-2xl transition-all flex items-center gap-2 ${completedCount > 0 && !isProcessing ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}>
              {t.downloadAll} ({completedCount})
            </button>
            <button onClick={() => onStartBatch(filePrefix)} disabled={tasks.length === 0} className={`px-8 py-3 rounded-2xl font-black uppercase tracking-wider text-white shadow-lg transition-all ${isProcessing ? 'bg-rose-600' : 'bg-indigo-600'}`}>
              {isProcessing ? (lang === 'vi' ? 'Dừng quy trình' : 'Stop Process') : (lang === 'vi' ? 'Bắt đầu ngay' : 'Start Now')}
            </button>
          </div>
        </div>

        {tasks.length > 0 && (
          <div className="mb-6 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">{t.filePrefix}</span>
            </div>
            <input type="text" value={filePrefix} onChange={(e) => setFilePrefix(e.target.value)} className="flex-1 max-w-sm bg-white border border-indigo-200 rounded-xl py-2 px-4 text-xs font-bold" />
            <button onClick={onClearTasks} className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{t.clearQueue}</button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-left border-b border-gray-50">
                <th className="pb-4 pl-4">{t.tableContent}</th>
                <th className="pb-4">{t.tableVoice}</th>
                <th className="pb-4">Audio Config</th>
                <th className="pb-4">{t.tableStatus}</th>
                <th className="pb-4 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tasks.map(task => (
                <tr key={task.id} className="group hover:bg-gray-50/50">
                  <td className="py-4 pl-4 min-w-[200px] text-sm font-medium text-gray-700">{task.text}</td>
                  <td className="py-4">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-gray-600">{standardVoices.find(v => v.id === task.voiceId)?.name || task.voiceId}</span>
                      <span className="text-[11px] font-bold text-indigo-600">{languages.find(l => l.code === task.targetLang)?.name}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="text-[10px] font-bold text-gray-500">{task.speed}x | {task.pitch}</span>
                  </td>
                  <td className="py-4">{getStatusBadge(task.status)}</td>
                  <td className="py-4 text-right pr-4">
                    <button onClick={() => onRemoveTask(task.id)} className="text-gray-300 hover:text-rose-600">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BatchStudio;
