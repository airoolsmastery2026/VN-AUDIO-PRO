
/**
 * Decodes a base64 string into a Uint8Array.
 */
export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Loads an audio file from a URL and decodes it into an AudioBuffer.
 */
export async function loadAudioFromUrl(url: string, ctx: AudioContext): Promise<AudioBuffer> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return await ctx.decodeAudioData(arrayBuffer);
}

/**
 * Decodes raw PCM audio data into an AudioBuffer.
 * The Gemini TTS API returns raw PCM data.
 */
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Convert 16-bit PCM to float range [-1.0, 1.0]
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

/**
 * Concatenates multiple AudioBuffers into one.
 */
export function concatenateAudioBuffers(buffers: AudioBuffer[], ctx: AudioContext): AudioBuffer {
  if (buffers.length === 0) return ctx.createBuffer(1, 1, 24000);
  if (buffers.length === 1) return buffers[0];

  const totalLength = buffers.reduce((acc, buf) => acc + buf.length, 0);
  const out = ctx.createBuffer(buffers[0].numberOfChannels, totalLength, buffers[0].sampleRate);

  for (let channel = 0; channel < out.numberOfChannels; channel++) {
    let offset = 0;
    for (const buffer of buffers) {
      out.getChannelData(channel).set(buffer.getChannelData(channel), offset);
      offset += buffer.length;
    }
  }
  return out;
}

/**
 * Mixes two audio buffers with specific volume levels.
 * The background buffer will loop or be truncated to match the main buffer.
 */
export function mixAudioBuffers(
  mainBuffer: AudioBuffer,
  bgBuffer: AudioBuffer,
  ctx: AudioContext,
  bgVolume: number = 0.2
): AudioBuffer {
  const out = ctx.createBuffer(mainBuffer.numberOfChannels, mainBuffer.length, mainBuffer.sampleRate);

  for (let channel = 0; channel < out.numberOfChannels; channel++) {
    const mainData = mainBuffer.getChannelData(channel);
    const bgData = bgBuffer.getChannelData(channel % bgBuffer.numberOfChannels);
    const outData = out.getChannelData(channel);

    for (let i = 0; i < mainBuffer.length; i++) {
      const bgSample = bgData[i % bgBuffer.length] * bgVolume;
      outData[i] = mainData[i] + bgSample;
    }
  }
  return out;
}

/**
 * Adds an effect buffer to the beginning or end of a main buffer.
 */
export function addEffectToBuffer(
  mainBuffer: AudioBuffer,
  effectBuffer: AudioBuffer,
  ctx: AudioContext,
  position: 'start' | 'end' = 'start'
): AudioBuffer {
  const totalLength = mainBuffer.length + effectBuffer.length;
  const out = ctx.createBuffer(mainBuffer.numberOfChannels, totalLength, mainBuffer.sampleRate);

  for (let channel = 0; channel < out.numberOfChannels; channel++) {
    const mainData = mainBuffer.getChannelData(channel);
    const effectData = effectBuffer.getChannelData(channel % effectBuffer.numberOfChannels);
    const outData = out.getChannelData(channel);

    if (position === 'start') {
      outData.set(effectData, 0);
      outData.set(mainData, effectBuffer.length);
    } else {
      outData.set(mainData, 0);
      outData.set(effectData, mainBuffer.length);
    }
  }
  return out;
}

/**
 * Splits text into chunks by sentences/paragraphs, aiming for maxChunkSize characters.
 */
export function splitTextIntoChunks(text: string, maxChunkSize: number = 1500): string[] {
  const chunks: string[] = [];
  let currentChunk = "";

  // Split by common sentence boundaries or newlines
  const segments = text.split(/([.?!]\s+|\n+)/);

  for (const segment of segments) {
    if ((currentChunk + segment).length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = segment;
    } else {
      currentChunk += segment;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Converts an AudioBuffer to a Blob URL for playback.
 */
export async function audioBufferToWavBlob(buffer: AudioBuffer): Promise<Blob> {
  const length = buffer.length * buffer.numberOfChannels * 2 + 44;
  const view = new DataView(new ArrayBuffer(length));
  const channels = [];
  const sampleRate = buffer.sampleRate;
  let offset = 0;
  let pos = 0;

  // RIFF identifier
  writeString(view, pos, 'RIFF'); pos += 4;
  // file length
  view.setUint32(pos, length - 8, true); pos += 4;
  // RIFF type
  writeString(view, pos, 'WAVE'); pos += 4;
  // format chunk identifier
  writeString(view, pos, 'fmt '); pos += 4;
  // format chunk length
  view.setUint32(pos, 16, true); pos += 4;
  // sample format (raw)
  view.setUint16(pos, 1, true); pos += 2;
  // channel count
  view.setUint16(pos, buffer.numberOfChannels, true); pos += 2;
  // sample rate
  view.setUint32(pos, sampleRate, true); pos += 4;
  // byte rate (sample rate * block align)
  view.setUint32(pos, sampleRate * 4, true); pos += 4;
  // block align (channel count * bytes per sample)
  view.setUint16(pos, buffer.numberOfChannels * 2, true); pos += 2;
  // bits per sample
  view.setUint16(pos, 16, true); pos += 2;
  // data chunk identifier
  writeString(view, pos, 'data'); pos += 4;
  // data chunk length
  view.setUint32(pos, length - pos - 4, true); pos += 4;

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < length) {
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++;
  }

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
