import { Audio } from "expo-av";
import { Platform, Vibration } from "react-native";

// Mapeamento dos assets nativos de áudio WAV (16-bit PCM Mono)
// Pré-empacotados no bundle da aplicação para execução instantânea no Android, iOS e Web
const SOUND_ASSETS = {
  click: require("../assets/sounds/click.wav"),
  check: require("../assets/sounds/check.wav"),
  levelup: require("../assets/sounds/levelup.wav"),
  beep: require("../assets/sounds/beep.wav"),
  finish: require("../assets/sounds/finish.wav"),
};

class SoundService {
  constructor() {
    this.muted = false;
    this.initialized = false;
    this.initPromise = null;
  }

  async init() {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        if (Platform.OS !== "web") {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
          });
        }
        this.initialized = true;
      } catch (e) {
        console.warn("[SoundService] Configuração de AudioMode:", e);
      } finally {
        this.initPromise = null;
      }
    })();

    return this.initPromise;
  }

  setMuted(value) {
    this.muted = !!value;
  }

  isMuted() {
    return this.muted;
  }

  async playSound(key, hapticPattern = null) {
    // 1. Feedback tátil háptico imediato (funciona mesmo em modo silencioso)
    if (hapticPattern) {
      try {
        Vibration.vibrate(hapticPattern);
      } catch (_) {}
    }

    if (this.muted) return;

    try {
      await this.init();

      const source = SOUND_ASSETS[key];
      if (!source) return;

      const { sound } = await Audio.Sound.createAsync(
        source,
        { shouldPlay: true, volume: 1.0 }
      );

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish || status.error) {
          sound.unloadAsync().catch(() => {});
        }
      });
    } catch (err) {
      console.warn(`[SoundService] Erro ao reproduzir '${key}':`, err);
    }
  }

  playClick() {
    this.playSound("click", 15);
  }

  playCheck() {
    this.playSound("check", [0, 40, 25, 40]);
  }

  playLevelUp() {
    this.playSound("levelup", [0, 60, 40, 60, 40, 100]);
  }

  playBeep() {
    this.playSound("beep", 30);
  }

  playTimerFinish() {
    this.playSound("finish", [0, 100, 50, 150]);
  }
}

export default new SoundService();
