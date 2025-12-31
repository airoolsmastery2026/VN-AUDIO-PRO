
export interface UserProfile {
  id: string;
  email: string;
  username: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  joinedAt: number;
  accountType: 'free' | 'pro' | 'enterprise';
  isAdmin?: boolean;
  requestCount?: number;
  lastActive?: number;
}

export interface Transaction {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  planName: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: number;
  referenceCode: string;
}

export interface Voice {
  id: string;
  name: string;
  region: 'North' | 'South' | 'International';
  gender: 'Male' | 'Female';
  description: string;
  geminiVoice: string;
  isLegend?: boolean;
  styleDescription?: string;
  category?: 'Standard' | 'VN-Artist' | 'Global-Artist' | 'Custom-Clone' | 'Local-Offline';
  referenceAudio?: string;
}

export interface LicenseInfo {
  status: 'trial' | 'activated' | 'expired';
  key?: string;
  machineId: string;
  expiryDate?: number;
  requestCount: number;
  userEmail?: string;
}

export interface HistoryItem {
  id: string;
  text: string;
  voiceName: string;
  geminiVoice: string;
  targetLangName: string;
  audioUrl: string;
  timestamp: number;
  speed: number;
  pitch: string;
  isCloned?: boolean;
  projectTag?: string;
}

export interface BatchTask {
  id: string;
  text: string;
  voiceId: string;
  targetLang: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  progress?: number;
  audioUrl?: string;
  error?: string;
  speed: number;
  pitch: string;
}

export type ActiveTab = 'editor' | 'pricing' | 'docs' | 'batch' | 'vocal' | 'writer' | 'music' | 'admin';

declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    electronAPI?: {
      platform: string;
      selectDirectory: () => Promise<string | null>;
      saveAudioFile: (directory: string, filename: string, buffer: ArrayBuffer) => Promise<{ success: boolean; path?: string }>;
      openUpdateFolder: () => Promise<void>;
    };
    aistudio?: AIStudio;
  }
}
