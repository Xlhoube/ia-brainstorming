'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Agent, DebateMessage, DebateState } from '@/types/debate';
import { DEFAULT_AGENTS } from '@/lib/constants/agents';

const STORAGE_KEY_API = 'ia_brainstorming_openrouter_key';
const STORAGE_KEY_AGENTS = 'ia_brainstorming_selected_agents';

export function useDebate() {
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
    'Debate sobre o problema difícil da consciência, funcionalismo computacional, o quarto chinês e a continuidade da identidade subjetiva.'
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

  const statusRef = useRef(status);
  statusRef.current = status;

  const currentSpeakerIndexRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Carregar API Key e Agentes do LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem(STORAGE_KEY_API);
      if (savedKey) setApiKey(savedKey);

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
    }
  }, []);

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
        if (prev.length <= 2) return prev; // Mínimo 2 agentes para debate
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

  // Função atómica para gerar o próximo turno
  const runNextTurn = useCallback(async () => {
    if (isGenerating) return;
    const activeAgents = agents.filter(a => selectedAgentIds.includes(a.id));
    if (activeAgents.length === 0) return;

    // Determinar próximo orador
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
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setMessages(prev => [...prev, data.message]);

        // Verificar se completou uma ronda inteira
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
  }, [agents, selectedAgentIds, isGenerating, topic, topicDescription, messages, apiKey, maxRounds]);

  // Loop automático quando o estado está 'running'
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
    setMessages([]);
    setCurrentRound(1);
    currentSpeakerIndexRef.current = 0;
    setSynthesisResult(null);
    setStatus('running');
  };

  const pauseDebate = () => {
    setStatus('paused');
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const resumeDebate = () => {
    setStatus('running');
  };

  const resetDebate = () => {
    setStatus('idle');
    setMessages([]);
    setCurrentRound(1);
    currentSpeakerIndexRef.current = 0;
    setActiveSpeakerId(null);
    setSynthesisResult(null);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const injectHumanIntervention = (content: string) => {
    if (!content.trim()) return;

    const humanMsg: DebateMessage = {
      id: 'human-' + Date.now(),
      agentId: 'human',
      agentName: 'Tu (Intervenção Humana)',
      agentRole: 'Voz da Humanidade',
      avatar: '👤',
      accentColor: '#3b82f6',
      content: content.trim(),
      round: currentRound,
      timestamp: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      isHuman: true,
    };

    setMessages(prev => [...prev, humanMsg]);
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
    isGenerating,
    isSynthesizing,
    synthesisResult,
    setSynthesisResult,
    startDebate,
    pauseDebate,
    resumeDebate,
    resetDebate,
    runNextTurn,
    injectHumanIntervention,
    synthesizeDebate,
  };
}
