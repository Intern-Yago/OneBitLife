import { Audio } from "expo-av";
import { Platform, Vibration } from "react-native";

// Helper para sintetizar pequenas ondas WAV em Base64
function generateWavBase64(sampleRate, durationSec, sampleFn) {
  const numSamples = Math.floor(sampleRate * durationSec);
  const dataSize = numSamples;
  // Construção de header RIFF WAV PCM 8-bit mono
  const header = [
    0x52, 0x49, 0x46, 0x46, // "RIFF"
    (36 + dataSize) & 0xff, ((36 + dataSize) >> 8) & 0xff, ((36 + dataSize) >> 16) & 0xff, ((36 + dataSize) >> 24) & 0xff,
    0x57, 0x41, 0x56, 0x45, // "WAVE"
    0x66, 0x6d, 0x74, 0x20, // "fmt "
    16, 0, 0, 0,             // Subchunk1Size = 16
    1, 0,                    // AudioFormat = 1 (PCM)
    1, 0,                    // NumChannels = 1
    sampleRate & 0xff, (sampleRate >> 8) & 0xff, (sampleRate >> 16) & 0xff, (sampleRate >> 24) & 0xff,
    sampleRate & 0xff, (sampleRate >> 8) & 0xff, (sampleRate >> 16) & 0xff, (sampleRate >> 24) & 0xff, // ByteRate
    1, 0,                    // BlockAlign = 1
    8, 0,                    // BitsPerSample = 8
    0x64, 0x61, 0x74, 0x61, // "data"
    dataSize & 0xff, (dataSize >> 8) & 0xff, (dataSize >> 16) & 0xff, (dataSize >> 24) & 0xff,
  ];

  const bytes = new Uint8Array(44 + numSamples);
  for (let i = 0; i < 44; i++) {
    bytes[i] = header[i];
  }

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const val = sampleFn(t, i, numSamples);
    const clamped = Math.max(0, Math.min(255, Math.floor(val * 127 + 128)));
    bytes[44 + i] = clamped;
  }

  // Conversão segura para Base64
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  if (typeof btoa !== "undefined") {
    return btoa(binary);
  }
  // Fallback Node / React Native
  try {
    return Buffer.from(bytes).toString("base64");
  } catch (_) {
    return "";
  }
}

// 1. Click sutil (40ms, 800Hz decay)
const CLICK_URI = "data:audio/wav;base64," + generateWavBase64(22050, 0.04, (t) => {
  return Math.sin(2 * Math.PI * 750 * t) * Math.exp(-t * 90);
});

// 2. Quest Check: Acorde ascendente Cyber (C5 -> E5 -> G5)
const CHECK_URI = "data:audio/wav;base64," + generateWavBase64(22050, 0.28, (t) => {
  let freq = 523.25; // C5
  if (t > 0.09) freq = 659.25; // E5
  if (t > 0.18) freq = 783.99; // G5
  return Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 8);
});

// 3. Level Up: Fanfarra Épica 8-Bit (0.55s)
const LEVELUP_URI = "data:audio/wav;base64," + generateWavBase64(22050, 0.55, (t) => {
  let freq = 440; // A4
  if (t > 0.1) freq = 554.37; // C#5
  if (t > 0.2) freq = 659.25; // E5
  if (t > 0.3) freq = 880.00; // A5
  if (t > 0.42) freq = 1108.73; // C#6
  const envelope = Math.max(0, 1 - (t / 0.55));
  // Onda mista (seno + harmônico quadrado) para timbre 8-bit
  const square = Math.sin(2 * Math.PI * freq * t) > 0 ? 0.6 : -0.6;
  return square * envelope;
});

// 4. Timer Beep (0.1s, 900Hz)
const BEEP_URI = "data:audio/wav;base64," + generateWavBase64(22050, 0.10, (t) => {
  return Math.sin(2 * Math.PI * 900 * t) * Math.exp(-t * 15);
});

// 5. Timer Finish Gong / Ressonância (0.6s)
const FINISH_URI = "data:audio/wav;base64," + generateWavBase64(22050, 0.65, (t) => {
  const f1 = Math.sin(2 * Math.PI * 520 * t);
  const f2 = 0.5 * Math.sin(2 * Math.PI * 1040 * t);
  const f3 = 0.3 * Math.sin(2 * Math.PI * 1560 * t);
  return (f1 + f2 + f3) * Math.exp(-t * 6);
});

class SoundService {
  constructor() {
    this.muted = false;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    try {
      if (Platform.OS !== "web") {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });
      }
      this.initialized = true;
    } catch (e) {
      console.warn("[SoundService] Inicialização de áudio:", e);
    }
  }

  setMuted(value) {
    this.muted = !!value;
  }

  isMuted() {
    return this.muted;
  }

  async playUri(uri, hapticPattern = null) {
    if (this.muted) return;
    try {
      if (hapticPattern) {
        try {
          Vibration.vibrate(hapticPattern);
        } catch (_) {}
      }

      await this.init();

      if (Platform.OS === "web") {
        const audio = new window.Audio(uri);
        audio.volume = 0.6;
        audio.play().catch(() => {});
        return;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, volume: 0.7 }
      );
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync().catch(() => {});
        }
      });
    } catch (err) {
      console.log("[SoundService] Falha ao reproduzir:", err);
    }
  }

  playClick() {
    this.playUri(CLICK_URI, 15);
  }

  playCheck() {
    this.playUri(CHECK_URI, [0, 40, 20, 40]);
  }

  playLevelUp() {
    this.playUri(LEVELUP_URI, [0, 60, 40, 60, 40, 100]);
  }

  playBeep() {
    this.playUri(BEEP_URI, 30);
  }

  playTimerFinish() {
    this.playUri(FINISH_URI, [0, 100, 50, 150]);
  }
}

export default new SoundService();
