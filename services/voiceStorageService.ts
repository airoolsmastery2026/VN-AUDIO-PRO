
import { Voice } from '../types';

const CUSTOM_VOICES_KEY = 'VN_AUDIO_PRO_CUSTOM_VOICES';

export function getCustomVoices(): Voice[] {
  const saved = localStorage.getItem(CUSTOM_VOICES_KEY);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export function saveCustomVoice(voice: Voice) {
  const current = getCustomVoices();
  const updated = [voice, ...current];
  localStorage.setItem(CUSTOM_VOICES_KEY, JSON.stringify(updated));
}

export function deleteCustomVoice(id: string) {
  const current = getCustomVoices();
  const updated = current.filter(v => v.id !== id);
  localStorage.setItem(CUSTOM_VOICES_KEY, JSON.stringify(updated));
}
