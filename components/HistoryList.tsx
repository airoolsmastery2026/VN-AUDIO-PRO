
import React, { useState, useMemo } from 'react';
import { HistoryItem } from '../types';
import { Lang, getT } from '../services/i18n';

interface HistoryListProps {
  items: HistoryItem[];
  onPlay: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  lang: Lang;
}

type SortOption = 'newest' | 'oldest' | 'alphabetical';

const HistoryList: React.FC<HistoryListProps> = ({ items, onPlay, onDelete, lang }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const t = getT(lang);

  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // Search filter
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.text.toLowerCase().includes(lowerSearch) || 
        item.voiceName.toLowerCase().includes(lowerSearch)
      );
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.timestamp - a.timestamp;
        case 'oldest':
          return a.timestamp - b.timestamp;
        case 'alphabetical':
          return a.text.localeCompare(b.text);
        default:
          return 0;
      }
    });

    return result;
  }, [items, searchTerm, sortBy]);

  if (items.length === 0) {
    return (
      <div className="text-center py-12 px-6">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-8 md:w-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">{t.emptyHistory}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Sort Controls */}
      <div className="space-y-3 mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder={t.searchHistory}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
          />
          <svg className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.sort}</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-transparent text-[10px] font-black text-indigo-600 uppercase tracking-widest border-none focus:ring-0 cursor-pointer py-0"
          >
            <option value="newest">{t.newest}</option>
            <option value="oldest">{t.oldest}</option>
            <option value="alphabetical">A - Z</option>
          </select>
        </div>
      </div>

      {filteredAndSortedItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{t.noResult}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAndSortedItems.map((item) => (
            <div key={item.id} className="group glass-card p-3 md:p-4 rounded-2xl flex items-center justify-between gap-4 hover:shadow-lg hover:border-indigo-200 transition-all border border-transparent">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] md:text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${item.isCloned ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
                    {item.voiceName}
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold">
                    {new Date(item.timestamp).toLocaleTimeString(lang === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-gray-700 truncate font-medium">
                  {item.text}
                </p>
              </div>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button 
                  onClick={() => onPlay(item)}
                  className="p-1.5 md:p-2 bg-indigo-600 text-white rounded-lg md:rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all active:scale-90"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <button 
                  onClick={() => onDelete(item.id)}
                  className="p-1.5 md:p-2 bg-white text-gray-400 hover:text-rose-600 border border-gray-100 rounded-lg md:rounded-xl hover:bg-rose-50 transition-all active:scale-90"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryList;
