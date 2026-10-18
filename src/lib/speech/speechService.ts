'use client';

export interface VoiceProfile {
  pitch: number;
  rate: number;
  preferredLang: string;
}

// Perfis acústicos distintos para cada agente
export const AGENT_VOICE_PROFILES: Record<string, VoiceProfile> = {
  'dr-marcus-vance': {
    pitch: 0.85, // Tom grave, reflexivo e solene
    rate: 0.92,  // Cadência ponderada
    preferredLang: 'pt-PT',
  },
  'dra-helena-rostova': {
    pitch: 1.05, // Tom preciso e focado
    rate: 1.05,  // Ritmo cirúrgico e ágil
    preferredLang: 'pt-PT',
  },
  'aura-chen': {
    pitch: 1.18, // Tom suave, quente e empático
    rate: 0.96,  // Ritmo melodioso e acolhedor
    preferredLang: 'pt-PT',
  },
  'kaelen-voss': {
    pitch: 0.95, // Tom dinâmico e direto
    rate: 1.15,  // Ritmo acelerado e futurista
    preferredLang: 'pt-PT',
  },
  'sophia-veris': {
    pitch: 1.0,  // Tom equilibrado, claro e neutro
    rate: 1.0,   // Cadência exemplar de moderação
    preferredLang: 'pt-PT',
  },
};

class SpeechService {
  private isAudioEnabled: boolean = true;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private onSpeakingChangeCallbacks: Set<(isSpeaking: boolean, speakingAgentId: string | null) => void> = new Set();
  private speakingAgentId: string | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
      
      const stored = localStorage.getItem('ia_brainstorming_audio_enabled');
      if (stored !== null) {
        this.isAudioEnabled = stored === 'true';
      }
    }
  }

  private loadVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.voices = window.speechSynthesis.getVoices();
  }

  public getAudioEnabled(): boolean {
    return this.isAudioEnabled;
  }

  public setAudioEnabled(enabled: boolean) {
    this.isAudioEnabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('ia_brainstorming_audio_enabled', enabled ? 'true' : 'false');
    }
    if (!enabled) {
      this.stop();
    }
  }

  public subscribe(cb: (isSpeaking: boolean, speakingAgentId: string | null) => void) {
    this.onSpeakingChangeCallbacks.add(cb);
    return () => {
      this.onSpeakingChangeCallbacks.delete(cb);
    };
  }

  private notify(isSpeaking: boolean, agentId: string | null) {
    this.speakingAgentId = isSpeaking ? agentId : null;
    this.onSpeakingChangeCallbacks.forEach(cb => cb(isSpeaking, agentId));
  }

  public speak(agentId: string, text: string) {
    if (!this.isAudioEnabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    this.stop();

    // Limpar texto de caracteres especiais ou quebras excessivas
    const cleanText = text.replace(/[*_#`]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const profile = AGENT_VOICE_PROFILES[agentId] || { pitch: 1.0, rate: 1.0, preferredLang: 'pt-PT' };

    utterance.pitch = profile.pitch;
    utterance.rate = profile.rate;

    // Selecionar a melhor voz em Português
    if (this.voices.length === 0) {
      this.loadVoices();
    }

    const ptVoice = this.voices.find(v => v.lang === 'pt-PT') 
      || this.voices.find(v => v.lang.startsWith('pt'))
      || this.voices.find(v => v.default);

    if (ptVoice) {
      utterance.voice = ptVoice;
    }

    utterance.onstart = () => {
      this.notify(true, agentId);
    };

    utterance.onend = () => {
      this.notify(false, null);
      this.currentUtterance = null;
    };

    utterance.onerror = (e) => {
      // Ignora cancelamentos intencionais
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('SpeechSynthesis error:', e.error);
      }
      this.notify(false, null);
      this.currentUtterance = null;
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
    this.notify(false, null);
  }
}

export const speechService = new SpeechService();
