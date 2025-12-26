
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { decodeBase64, decodeAudioData, audioBufferToWavBlob, splitTextIntoChunks, concatenateAudioBuffers, loadAudioFromUrl, mixAudioBuffers } from "../utils/audioUtils";

export interface GenerationProgress {
  current: number;
  total: number;
}

export interface AudioEnhancementOptions {
  bgmUrl?: string;
  bgmVolume?: number;
  enableSmartSFX?: boolean;
  styleDescription?: string; 
}

const SFX_MAP: Record<string, string> = {
  'applause': 'https://actions.google.com/sounds/v1/crowds/crowd_applause_clapping_only.ogg',
  'bell': 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg',
  'notification': 'https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg',
  'laugh': 'https://actions.google.com/sounds/v1/human_voices/man_laughing_hard.ogg',
  'ding': 'https://actions.google.com/sounds/v1/alarms/alarm_clock_short.ogg',
  'suspense': 'https://actions.google.com/sounds/v1/impacts/crash_impact.ogg'
};

async function callWithRetry<T>(fn: () => Promise<T>, maxRetries = 2, signal?: AbortSignal): Promise<T> {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    if (signal?.aborted) throw new Error("ABORTED");
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const errorMessage = error.message || "";
      
      if (errorMessage === "ABORTED" || signal?.aborted) throw new Error("ABORTED");
      
      // Handle Specific API Errors
      if (errorMessage.includes("429") || errorMessage.includes("Quota exceeded") || errorMessage.includes("RESOURCE_EXHAUSTED")) {
        throw new Error("QUOTA_EXCEEDED");
      }
      
      if (errorMessage.includes("Requested entity was not found")) {
        throw new Error("API_KEY_INVALID");
      }

      // Retry for other errors
      if (i < maxRetries - 1) {
        const delay = Math.pow(2, i + 1) * 1000;
        await new Promise(resolve => {
          const t = setTimeout(resolve, delay);
          signal?.addEventListener('abort', () => {
            clearTimeout(t);
            resolve(null);
          });
        });
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

function getApiKey() {
  const key = process.env.API_KEY;
  if (!key) throw new Error("API_KEY_MISSING");
  return key;
}

async function analyzeTextForSFX(text: string, signal?: AbortSignal): Promise<{ index: number, sfxType: string }[]> {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `Analyze this text and identify sentence indices (starting from 0) that need sound effects.
    Available: applause, bell, notification, laugh, ding, suspense.
    Text: "${text}"
    Return JSON array: [{"index": 2, "sfxType": "applause"}]`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              index: { type: Type.INTEGER },
              sfxType: { type: Type.STRING }
            },
            required: ["index", "sfxType"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.warn("SFX Analysis skipped:", e);
    return [];
  }
}

export async function* generateAiContentStream(prompt: string, taskType: 'writing' | 'prompt') {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const modelName = taskType === 'writing' ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  const systemInstruction = taskType === 'writing' 
    ? "You are a professional creative writer. Output clean, engaging text without markdown symbols."
    : "You are an expert prompt engineer. Create detailed image generation prompts.";

  const result = await ai.models.generateContentStream({
    model: modelName,
    contents: [{ parts: [{ text: prompt }] }],
    config: { systemInstruction, temperature: 0.8 }
  });

  for await (const chunk of result) {
    yield chunk.text || "";
  }
}

export async function generateSpeech(
  text: string, 
  voiceName: string, 
  targetLangName: string,
  onProgress?: (p: GenerationProgress) => void,
  speed: number = 1.0,
  pitch: string = "normal",
  enhancements: AudioEnhancementOptions = {},
  signal?: AbortSignal
): Promise<string> {
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const sentences = text.split(/([.?!]\s+)/).filter(s => s.trim().length > 0);
  
  let sfxMarkers: { index: number, sfxType: string }[] = [];
  if (enhancements.enableSmartSFX) {
    sfxMarkers = await analyzeTextForSFX(text, signal);
  }

  const audioBuffers: AudioBuffer[] = [];
  const styleHint = enhancements.styleDescription ? `Tone: ${enhancements.styleDescription}.` : "";

  for (let i = 0; i < sentences.length; i++) {
    if (signal?.aborted) throw new Error("ABORTED");
    if (onProgress) onProgress({ current: i + 1, total: sentences.length });
    
    const base64Audio = await callWithRetry(async () => {
      const ai = new GoogleGenAI({ apiKey: getApiKey() });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ 
          parts: [{ text: `Speak in ${targetLangName}, speed ${speed}x, pitch ${pitch}. ${styleHint} Text: ${sentences[i]}` }] 
        }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
        },
      });
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    }, 2, signal);
    
    if (base64Audio) {
      const bytes = decodeBase64(base64Audio);
      const audioBuffer = await decodeAudioData(bytes, audioCtx, 24000, 1);
      audioBuffers.push(audioBuffer);
    }

    const marker = sfxMarkers.find(m => m.index === i);
    if (marker && SFX_MAP[marker.sfxType]) {
      try {
        const sfxBuffer = await loadAudioFromUrl(SFX_MAP[marker.sfxType], audioCtx);
        audioBuffers.push(sfxBuffer);
      } catch (e) { console.warn("SFX error:", e); }
    }
  }

  if (signal?.aborted) throw new Error("ABORTED");
  if (audioBuffers.length === 0) throw new Error("GENERATION_FAILED");

  let finalBuffer = concatenateAudioBuffers(audioBuffers, audioCtx);

  if (enhancements.bgmUrl) {
    try {
      const bgBuffer = await loadAudioFromUrl(enhancements.bgmUrl, audioCtx);
      finalBuffer = mixAudioBuffers(finalBuffer, bgBuffer, audioCtx, enhancements.bgmVolume || 0.2);
    } catch (e) { console.warn("BGM error:", e); }
  }

  const blob = await audioBufferToWavBlob(finalBuffer);
  return URL.createObjectURL(blob);
}

export async function translateText(text: string, sourceLang: string, targetLang: string): Promise<string> {
  return callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `Translate to ${targetLang}. Detect mixed languages if source is Auto. Unify output in ${targetLang}. Text: "${text}"`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: { temperature: 0.3 },
    });
    return response.text || "";
  });
}

export async function generateLyrics(theme: string, genre: string): Promise<string> {
  return callWithRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const prompt = `Write song lyrics about "${theme}" in ${genre} style. Structure: Verse-Chorus-Verse-Chorus-Bridge-Outro.`;
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: { temperature: 0.9 }
    });
    return response.text || "";
  });
}

export async function generateClonedSpeech(
  text: string,
  referenceAudioBase64: string,
  onProgress?: (p: GenerationProgress) => void,
  signal?: AbortSignal
): Promise<string> {
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const chunks = splitTextIntoChunks(text, 1000);
  const audioBuffers: AudioBuffer[] = [];

  for (let i = 0; i < chunks.length; i++) {
    if (signal?.aborted) throw new Error("ABORTED");
    if (onProgress) onProgress({ current: i + 1, total: chunks.length });

    const base64Audio = await callWithRetry(async () => {
      const ai = new GoogleGenAI({ apiKey: getApiKey() });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        contents: [
          {
            parts: [
              { inlineData: { mimeType: "audio/wav", data: referenceAudioBase64 } },
              { text: `Mimic this voice tone perfectly for this script: "${chunks[i]}"` }
            ]
          }
        ],
        config: { responseModalities: [Modality.AUDIO], temperature: 0.4 },
      });
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    }, 2, signal);

    if (base64Audio) {
      const bytes = decodeBase64(base64Audio);
      const audioBuffer = await decodeAudioData(bytes, audioCtx, 24000, 1);
      audioBuffers.push(audioBuffer);
    }
  }

  if (signal?.aborted) throw new Error("ABORTED");
  if (audioBuffers.length === 0) throw new Error("CLONING_FAILED");

  const finalBuffer = concatenateAudioBuffers(audioBuffers, audioCtx);
  const blob = await audioBufferToWavBlob(finalBuffer);
  return URL.createObjectURL(blob);
}
