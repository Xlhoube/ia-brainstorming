'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Agent, DebateMessage, DebateState, LanguageTone } from '@/types/debate';
import { DEFAULT_AGENTS } from '@/lib/constants/agents';
import { speechService } from '@/lib/speech/speechService';
import { LocalDatabase, SavedDebateSession } from '@/lib/db/localDatabase';
import { AppwriteDatabaseService } from '@/lib/appwrite/databaseService';

const STORAGE_KEY_API = 'ia_brainstorming_openrouter_key';
const STORAGE_KEY_AGENTS = 'ia_brainstorming_selected_agents';
const STORAGE_KEY_TONE = 'ia_brainstorming_tone';

export function useDebate() {
  const [sessionId, setSessionId] = useState<string>('session-' + Date.now());
  const [agents, setAgents] = useState<Agent[]>(DEFAULT_AGENTS);
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>([
    'dr-marcus-vance',
    'dra-helena-rostova',
    'aura-chen',
    'kaelen-voss',
    'sophia-veris',
  ]);

  const [topic, setTopic] = useState<string>('A consciência humana pode ser transferida ou replicada por máquinas?');
  const [topicDescription, setTopicDescription] = useState<string>(
    'Debate sobre se um computador consegue sentir emoções ou se a mente humana é algo que nunca poderá ser copiado por máquinas.'
  );

  const [status, setStatus] = useState<DebateState['status']>('idle');
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [maxRounds, setMaxRounds] = useState<number>(4);
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
  const [speedDelayMs, setSpeedDelayMs] = useState<number>(2500);
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [apiKey, setApiKey] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [synthesisResult, setSynthesisResult] = useState<any | null>(null);

  // Tom de Linguagem: 'simples' por defeito para que todos percebam!
  const [tone, setToneState] = useState<LanguageTone>('simples');

  // Estados de Áudio TTS
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [isSpeakingAudio, setIsSpeakingAudio] = useState<boolean>(false);

  const statusRef = useRef(status);
  statusRef.current = status;

  const currentSpeakerIndexRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Inicialização e preferências locais
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsAudioEnabled(speechService.getAudioEnabled());

      const unsubscribe = speechService.subscribe((speaking) => {
        setIsSpeakingAudio(speaking);
      });

      const savedKey = localStorage.getItem(STORAGE_KEY_API);
      if (savedKey) setApiKey(savedKey);

      const savedTone = localStorage.getItem(STORAGE_KEY_TONE) as LanguageTone;
      if (savedTone === 'simples' || savedTone === 'academico') {
        setToneState(savedTone);
      }

      const savedAgents = localStorage.getItem(STORAGE_KEY_AGENTS);
      if (savedAgents) {
        try {
          const parsed = JSON.parse(savedAgents);
          if (Array.isArray(parsed) && parsed.length >= 2) {
            setSelectedAgentIds(parsed);
          }
        } catch (e) {
          // Manter predefinições
        }
      }

      return () => {
        unsubscribe();
        speechService.stop();
      };
    }
  }, []);

  // Gravação automática em base de dados (Local-First + Appwrite Cloud Sync)
  useEffect(() => {
    if (messages.length > 0) {
      AppwriteDatabaseService.saveSession({
        id: sessionId,
        topic,
        topicDescription,
        messages,
        selectedAgentIds,
        currentRound,
        maxRounds,
        synthesisResult,
        createdAt: parseInt(sessionId.replace('session-', '')) || Date.now(),
        updatedAt: Date.now(),
      });
    }
  }, [messages, synthesisResult, sessionId, topic, topicDescription, selectedAgentIds, currentRound, maxRounds]);

  const setTone = (newTone: LanguageTone) => {
    setToneState(newTone);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_TONE, newTone);
    }
  };

  const toggleAudio = () => {
    const nextState = !isAudioEnabled;
    setIsAudioEnabled(nextState);
    speechService.setAudioEnabled(nextState);
  };

  const speakSingleMessage = (agentId: string, text: string) => {
    speechService.speak(agentId, text);
  };

  const saveApiKey = (key: string) => {
    setApiKey(key);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_API, key);
    }
  };

  const toggleAgent = (agentId: string) => {
    if (status === 'running') return;
    setSelectedAgentIds(prev => {
      let updated: string[];
      if (prev.includes(agentId)) {
        if (prev.length <= 2) return prev;
        updated = prev.filter(id => id !== agentId);
      } else {
        updated = [...prev, agentId];
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_AGENTS, JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Turno atómico
  const runNextTurn = useCallback(async () => {
    if (isGenerating) return;
    const activeAgents = agents.filter(a => selectedAgentIds.includes(a.id));
    if (activeAgents.length === 0) return;

    const nextAgentIndex = currentSpeakerIndexRef.current % activeAgents.length;
    const currentAgent = activeAgents[nextAgentIndex];
    currentSpeakerIndexRef.current += 1;

    setActiveSpeakerId(currentAgent.id);
    setIsGenerating(true);

    try {
      const res = await fetch('/api/debate/next-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: currentAgent,
          topic,
          topicDescription,
          allAgents: activeAgents,
          messages,
          apiKey,
          tone,
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setMessages(prev => [...prev, data.message]);

        // Falar a mensagem sintetizada através do Web Speech Synthesis
        speechService.speak(currentAgent.id, data.message.content);

        if (currentSpeakerIndexRef.current % activeAgents.length === 0) {
          setCurrentRound(r => {
            const nextR = r + 1;
            if (nextR > maxRounds) {
              setStatus('concluded');
            }
            return nextR;
          });
        }
      }
    } catch (err) {
      console.error('Erro ao gerar turno do agente:', err);
    } finally {
      setIsGenerating(false);
      setActiveSpeakerId(null);
    }
  }, [agents, selectedAgentIds, isGenerating, topic, topicDescription, messages, apiKey, tone, maxRounds]);

  // Ciclo automático
  useEffect(() => {
    if (status === 'running' && !isGenerating && !activeSpeakerId) {
      timeoutRef.current = setTimeout(() => {
        if (statusRef.current === 'running') {
          runNextTurn();
        }
      }, speedDelayMs);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [status, isGenerating, activeSpeakerId, runNextTurn, speedDelayMs]);

  const startDebate = (newTopic?: string, newDescription?: string) => {
    if (newTopic) setTopic(newTopic);
    if (newDescription) setTopicDescription(newDescription);
    const newId = 'session-' + Date.now();
    setSessionId(newId);
    setMessages([]);
    setCurrentRound(1);
    currentSpeakerIndexRef.current = 0;
    setSynthesisResult(null);
    setStatus('running');
  };

  const pauseDebate = () => {
    setStatus('paused');
    speechService.stop();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const resumeDebate = () => {
    setStatus('running');
  };

  const resetDebate = () => {
    setStatus('idle');
    setSessionId('session-' + Date.now());
    setMessages([]);
    setCurrentRound(1);
    currentSpeakerIndexRef.current = 0;
    setActiveSpeakerId(null);
    setSynthesisResult(null);
    speechService.stop();
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const loadSavedSession = (saved: SavedDebateSession) => {
    speechService.stop();
    setStatus('paused');
    setSessionId(saved.id);
    setTopic(saved.topic);
    setTopicDescription(saved.topicDescription || '');
    setMessages(saved.messages || []);
    setSelectedAgentIds(saved.selectedAgentIds || selectedAgentIds);
    setCurrentRound(saved.currentRound || 1);
    setMaxRounds(saved.maxRounds || 4);
    setSynthesisResult(saved.synthesisResult || null);
    currentSpeakerIndexRef.current = (saved.messages || []).length;
  };

  const injectHumanIntervention = async (content: string) => {
    if (!content.trim()) return;

    const raw = content.trim();
    const isGreeting = /boa noite|bom dia|boa tarde|ol[aá]|oi|boas|como est[aã]o|tudo bem/i.test(raw);

    const humanMsg: DebateMessage = {
      id: 'human-' + Date.now(),
      agentId: 'human',
      agentName: 'Tu (Humano na Sala)',
      agentRole: 'Voz da Humanidade',
      avatar: '👤',
      accentColor: '#3b82f6',
      content: raw,
      round: currentRound,
      timestamp: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      isHuman: true,
    };

    const nextMessages = [...messages, humanMsg];
    setMessages(nextMessages);
    setStatus('running');

    // Despoletar reação imediata e audível de um dos especialistas na sala
    const activeAgents = agents.filter(a => selectedAgentIds.includes(a.id));
    if (activeAgents.length === 0) return;

    let respondingAgent = activeAgents[currentSpeakerIndexRef.current % activeAgents.length];
    if (isGreeting) {
      const moderator = activeAgents.find(a => a.category === 'moderador');
      if (moderator) {
        respondingAgent = moderator;
      }
    }
    currentSpeakerIndexRef.current += 1;

    setActiveSpeakerId(respondingAgent.id);
    setIsGenerating(true);

    try {
      const res = await fetch('/api/debate/next-turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent: respondingAgent,
          topic,
          topicDescription,
          allAgents: activeAgents,
          messages: nextMessages,
          apiKey,
          tone,
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setMessages(prev => [...prev, data.message]);
        speechService.speak(respondingAgent.id, data.message.content);
      }
    } catch (err) {
      console.error('Erro ao responder à fala humana na sala:', err);
    } finally {
      setIsGenerating(false);
      setActiveSpeakerId(null);
    }
  };


  const synthesizeDebate = async () => {
    if (messages.length === 0) return;
    setIsSynthesizing(true);

    try {
      const res = await fetch('/api/debate/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          messages,
          apiKey,
          tone,
        }),
      });

      const data = await res.json();
      if (data.success && data.synthesis) {
        setSynthesisResult(data.synthesis);
      }
    } catch (err) {
      console.error('Erro na síntese:', err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  return {
    sessionId,
    agents,
    selectedAgentIds,
    toggleAgent,
    topic,
    setTopic,
    topicDescription,
    setTopicDescription,
    status,
    currentRound,
    maxRounds,
    setMaxRounds,
    activeSpeakerId,
    speedDelayMs,
    setSpeedDelayMs,
    messages,
    apiKey,
    saveApiKey,
    tone,
    setTone,
    isGenerating,
    isSynthesizing,
    synthesisResult,
    setSynthesisResult,
    isAudioEnabled,
    isSpeakingAudio,
    toggleAudio,
    speakSingleMessage,
    startDebate,
    pauseDebate,
    resumeDebate,
    resetDebate,
    loadSavedSession,
    runNextTurn,
    injectHumanIntervention,
    synthesizeDebate,
  };
}
