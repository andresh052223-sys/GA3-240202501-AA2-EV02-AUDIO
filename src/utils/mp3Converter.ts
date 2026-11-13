import { Mp3Encoder } from '@breezystack/lamejs';

export interface EncodedAudioResult {
  blob: Blob;
  format: 'mp3' | 'webm' | 'ogg' | 'mp4';
  convertedToMp3: boolean;
  note?: string;
}

function floatTo16BitPCM(input: Float32Array): Int16Array {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return output;
}

export function detectNativeExtension(mimeType: string): 'webm' | 'ogg' | 'mp4' {
  if (mimeType.includes('ogg')) return 'ogg';
  if (mimeType.includes('mp4')) return 'mp4';
  return 'webm';
}

export async function convertAudioBlobToMp3(sourceBlob: Blob): Promise<EncodedAudioResult> {
  try {
    const arrayBuffer = await sourceBlob.arrayBuffer();
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) {
      throw new Error('AudioContext not supported');
    }

    const ctx = new AudioContextClass();
    let audioBuffer: AudioBuffer;
    try {
      audioBuffer = await ctx.decodeAudioData(arrayBuffer);
    } finally {
      await ctx.close().catch(() => {});
    }

    const channels = Math.min(2, Math.max(1, audioBuffer.numberOfChannels));
    const sampleRate = audioBuffer.sampleRate;
    const encoder = new Mp3Encoder(channels, sampleRate, 128);

    const leftSamples = floatTo16BitPCM(audioBuffer.getChannelData(0));
    const rightSamples =
      channels > 1 ? floatTo16BitPCM(audioBuffer.getChannelData(1)) : leftSamples;

    const sampleBlockSize = 1152;
    const mp3Chunks: Uint8Array[] = [];

    for (let i = 0; i < leftSamples.length; i += sampleBlockSize) {
      const leftChunk = leftSamples.subarray(i, i + sampleBlockSize);
      const rightChunk = rightSamples.subarray(i, i + sampleBlockSize);
      const encoded =
        channels === 1
          ? encoder.encodeBuffer(leftChunk)
          : encoder.encodeBuffer(leftChunk, rightChunk);
      if (encoded.length > 0) {
        mp3Chunks.push(new Uint8Array(encoded));
      }
    }

    const flushed = encoder.flush();
    if (flushed.length > 0) {
      mp3Chunks.push(new Uint8Array(flushed));
    }

    const blobParts: BlobPart[] = mp3Chunks.map((chunk) => {
      const copy = new Uint8Array(chunk.byteLength);
      copy.set(chunk);
      return copy.buffer;
    });

    const mp3Blob = new Blob(blobParts, { type: 'audio/mpeg' });
    return {
      blob: mp3Blob,
      format: 'mp3',
      convertedToMp3: true,
    };
  } catch (err) {
    console.warn('MP3 encoding fallback:', err);
    const nativeExt = detectNativeExtension(sourceBlob.type || '');
    return {
      blob: sourceBlob,
      format: nativeExt,
      convertedToMp3: false,
      note: `Este navegador no permitió decodificar el flujo para convertirlo a MP3. Se conservó el archivo real en formato .${nativeExt.toUpperCase()} (puedes subirlo a Spreaker o Podbean para obtener un enlace público).`,
    };
  }
}
