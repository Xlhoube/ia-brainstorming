'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Agent, DebateMessage, DebateState, LanguageTone, DebatePacing, CanonicalDebateStage, StructuredMemoryCategory, StructuredMemoryItem, DialecticalOutcome } from '@/types/debate';
import { DEFAULT_AGENTS } from '@/lib/constants/agents';
import { getCanonicalDebateStages } from '@/lib/agents/bibliaLoader';
import { speechService } from '@/lib/speech/speechService';
import { LocalDatabase, SavedDebateSession } from '@/lib/db/localDatabase';
import { AppwriteDatabaseService } from '@/lib/appwrite/databaseService';

const STORAGE_KEY_API = 'ia_brainstorming_openrouter_key';
const STORAGE_KEY_AGENTS = 'ia_brainstorming_selected_agents';
const STORAGE_KEY_TONE = 'ia_brainstorming_tone';
const STORAGE_KEY_PACING = 'ia_brainstorming_pacing_v1';

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

  // 5 Etapas Canónicas do Protocolo de Debate (The Five)
  const canonicalStages = useMemo<CanonicalDebateStage[]>(() => getCanonicalDebateStages(), []);
  const [currentStageIndex, setCurrentStageIndex] = useState<number>(0);
  const currentStage = canonicalStages[currentStageIndex] || canonicalStages[0];
  const currentStageIndexRef = useRef(0);
  currentStageIndexRef.current = currentStageIndex;

  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
  const [speedDelayMs, setSpeedDelayMs] = useState<number>(2500);
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [apiKey, setApiKey] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [synthesisResult, setSynthesisResult] = useState<any | null>(null);

  // Cadência e Ritmo de Leitura (calmo por defeito para leitura humana sem sobressaltos)
  const [pacing, setPacingState] = useState<DebatePacing>('calmo');
  const [readingCountdown, setReadingCountdown] = useState<number | null>(null);
  const [isWaitingForNextTurn, setIsWaitingForNextTurn] = useState<boolean>(false);

  const pacingRef = useRef<DebatePacing>('calmo');
  pacingRef.current = pacing;

  const readingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

      const savedPacing = localStorage.getItem(STORAGE_KEY_PACING) as DebatePacing;
      if (savedPacing && ['manual', 'calmo', 'normal', 'rapido'].includes(savedPacing)) {
        setPacingState(savedPacing);
        pacingRef.current = savedPacing;
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

      // Carregar memórias guardadas locais e mesclar com os agentes
      const savedMemories = LocalDatabase.getAgentMemories();
      if (savedMemories && Object.keys(savedMemories).length > 0) {
        setAgents(prev => prev.map(a => {
          if (savedMemories[a.id]) {
            return {
              ...a,
              memory: {
                ...a.memory,
                ...savedMemories[a.id],
                knownColleagues: {
                  ...a.memory.knownColleagues,
                  ...(savedMemories[a.id].knownColleagues || {})
                },
                cumulativeLearnings: Array.from(new Set([
                  ...(savedMemories[a.id].cumulativeLearnings || []),
                  ...a.memory.cumulativeLearnings
                ])),
                pastMemories: [
                  ...(savedMemories[a.id].pastMemories || []),
                  ...a.memory.pastMemories
                ].filter((m, idx, arr) => arr.findIndex(x => x.topic === m.topic) === idx),
                structuredEntries: [
                  ...(savedMemories[a.id].structuredEntries || []),
                  ...(a.memory.structuredEntries || [])
                ].filter((m, idx, arr) => arr.findIndex(x => x.id === m.id) === idx),
              }
            };
          }
          return a;
        }));
      }

      // Sincronização em segundo plano com o Appwrite Cloud
      AppwriteDatabaseService.getAgentMemories().then(cloudMemories => {
        if (cloudMemories && Object.keys(cloudMemories).length > 0) {
          setAgents(prev => prev.map(a => {
            if (cloudMemories[a.id]) {
              return {
                ...a,
                memory: {
                  ...a.memory,
                  ...cloudMemories[a.id],
                  knownColleagues: {
                    ...a.memory.knownColleagues,
                    ...(cloudMemories[a.id].knownColleagues || {})
                  },
                  cumulativeLearnings: Array.from(new Set([
                    ...(cloudMemories[a.id].cumulativeLearnings || []),
                    ...a.memory.cumulativeLearnings
                  ])),
                  pastMemories: [
                    ...(cloudMemories[a.id].pastMemories || []),
                    ...a.memory.pastMemories
                  ].filter((m, idx, arr) => arr.findIndex(x => x.topic === m.topic) === idx),
                  structuredEntries: [
                    ...(cloudMemories[a.id].structuredEntries || []),
                    ...(a.memory.structuredEntries || [])
                  ].filter((m, idx, arr) => arr.findIndex(x => x.id === m.id) === idx),
                }
              };
            }
            return a;
          }));
        }
      }).catch(err => {
        console.warn('Sincronização de memórias Appwrite em background:', err);
      });

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
        currentStageIndex,
        currentStageName: currentStage.name,
        maxRounds,
        synthesisResult,
        createdAt: parseInt(sessionId.replace('session-', '')) || Date.now(),
        updatedAt: Date.now(),
      });
    }
  }, [messages, synthesisResult, sessionId, topic, topicDescription, selectedAgentIds, currentRound, currentStageIndex, currentStage.name, maxRounds]);

  const setTone = (newTone: LanguageTone) => {
    setToneState(newTone);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_TONE, newTone);
    }
  };

  const setPacing = (newPacing: DebatePacing) => {
    setPacingState(newPacing);
    pacingRef.current = newPacing;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_PACING, newPacing);
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

  // Turno atómico com gestão humana de cadência e leitura com progressão nas 5 etapas canónicas
  const runNextTurn = useCallback(async () => {
    if (isGenerating) return;

    // Cancela quaisquer contagens ou temporizadores de leitura pendentes
    if (readingTimerRef.current) clearTimeout(readingTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setReadingCountdown(null);
    setIsWaitingForNextTurn(false);
    speechService.stop();

    const activeAgents = agents.filter(a => selectedAgentIds.includes(a.id));
    if (activeAgents.length === 0) return;

    const moderator = activeAgents.find(a => a.id === 'sophia-veris' || a.category === 'moderador');
    const nonModerators = activeAgents.filter(a => a.id !== (moderator?.id || ''));

    const stageIdx = currentStageIndexRef.current;
    const stageObj = canonicalStages[stageIdx] || canonicalStages[0];

    // Determinação do orador adequado conforme a etapa canónica (The Five)
    let currentAgent: Agent;

    if (stageIdx === 0) {
      // Etapa 0: Compreender (Sophia Veris / Moderadora abre a discussão e enquadra o problema)
      currentAgent = moderator || activeAgents[0];
    } else if (stageIdx === 1) {
      // Etapa 1: Análise independente (Cada pensador expressa primeiro a sua visão autónoma)
      const targetPool = nonModerators.length > 0 ? nonModerators : activeAgents;
      const spokenStage1 = messages.filter(m => m.stageIndex === 1).map(m => m.agentId);
      const pendingStage1 = targetPool.filter(a => !spokenStage1.includes(a.id));
      currentAgent = pendingStage1[0] || targetPool[currentSpeakerIndexRef.current % targetPool.length];
    } else if (stageIdx === 4) {
      // Etapa 4: Síntese (Sophia Veris / Moderadora sintetiza convergências e aporias sem forçar consenso)
      currentAgent = moderator || activeAgents[0];
    } else {
      // Etapa 2 (Confronto de argumentos) e Etapa 3 (Verificação)
      currentAgent = activeAgents[currentSpeakerIndexRef.current % activeAgents.length];
    }

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
          stage: stageObj,
          stageIndex: stageIdx,
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        if (!data.message.stageName) {
          data.message.stageName = stageObj.name;
          data.message.stageIndex = stageIdx;
        }

        // Se estiver na etapa 4 (Síntese) e nenhum desfecho veio indicado no texto, atribuir desfecho de síntese
        if (stageIdx === 4 && !data.message.dialecticalConclusion) {
          data.message.dialecticalConclusion = 'sintese';
        }

        setMessages(prev => [...prev, data.message]);

        if (currentSpeakerIndexRef.current % activeAgents.length === 0) {
          setCurrentRound(r => r + 1);
        }

        // Progressão automática entre as 5 etapas canónicas da Bíblia:
        if (stageIdx === 0) {
          // Após o enquadramento inicial de Compreender, passa à Análise independente
          setCurrentStageIndex(1);
          currentStageIndexRef.current = 1;
        } else if (stageIdx === 1) {
          // Quando todos os pensadores tiverem formulado a sua análise independente, passa ao Confronto
          const targetPool = nonModerators.length > 0 ? nonModerators : activeAgents;
          const stage1Count = [...messages, data.message].filter(m => m.stageIndex === 1).length;
          if (stage1Count >= targetPool.length) {
            setCurrentStageIndex(2);
            currentStageIndexRef.current = 2;
          }
        } else if (stageIdx === 2) {
          // Após pelo menos 1 ciclo de confronto entre os pensadores, avança para Verificação
          const stage2Count = [...messages, data.message].filter(m => m.stageIndex === 2).length;
          if (stage2Count >= Math.max(activeAgents.length, 3)) {
            setCurrentStageIndex(3);
            currentStageIndexRef.current = 3;
          }
        } else if (stageIdx === 3) {
          // Após intervenções de verificação empírica, avança para Síntese
          const stage3Count = [...messages, data.message].filter(m => m.stageIndex === 3).length;
          if (stage3Count >= Math.min(activeAgents.length, 2)) {
            setCurrentStageIndex(4);
            currentStageIndexRef.current = 4;
          }
        }

        // Se o especialista declarou autonomamente a conclusão dialética da mesa (Síntese, Consenso ou Aporia)
        const conclusion = data.message.dialecticalConclusion || data.dialecticalConclusion;
        if (conclusion) {
          setStatus('concluded');
          setActiveSpeakerId(null);
          setIsWaitingForNextTurn(false);
          setReadingCountdown(null);
          try {
            const rawConclusion = String(conclusion).toLowerCase();
            const dialecticalOutcome: DialecticalOutcome = rawConclusion.includes('aporia')
              ? 'aporia'
              : (rawConclusion.includes('consenso') ? 'consenso' : 'sintese');

            // Registo automático de aprendizagens e memória estruturada para cada pensador presente
            activeAgents.forEach(ag => {
              const agentMsgs = [...messages, data.message].filter(m => m.agentId === ag.id);
              const lastSpeak = agentMsgs[agentMsgs.length - 1];
              const summary = lastSpeak ? lastSpeak.content.slice(0, 160) + '...' : `Defendeu a sua posição sobre "${topic}"`;
              const prevSpeaker = messages.length > 0 ? messages[messages.length - 1].agentName : undefined;

              LocalDatabase.recordAutomaticDebateConclusionMemory(
                ag.id,
                topic,
                summary,
                dialecticalOutcome,
                prevSpeaker
              );
            });

            // Atualizar o estado em memória dos agentes na interface
            const updatedMemories = LocalDatabase.getAgentMemories();
            setAgents(prev => prev.map(a => {
              if (updatedMemories[a.id]) {
                return {
                  ...a,
                  memory: updatedMemories[a.id]
                };
              }
              return a;
            }));

            // Sincronizar automaticamente no Appwrite Cloud
            AppwriteDatabaseService.saveAgentMemories(updatedMemories);
          } catch (memErr) {
            console.warn('Erro ao arquivar memórias de debate:', memErr);
          }

          speechService.speak(currentAgent.id, data.message.content);
          setTimeout(() => {
            synthesizeDebate();
          }, 1200);
          return;
        }

        // Caso normal de debate contínuo:
        // Executado logo após a voz do agente terminar (ou logo a seguir se áudio desativado)
        const onSpeechDone = () => {
          // Se estiver em modo manual / passo a passo: pára e aguarda que o utilizador avance
          if (pacingRef.current === 'manual') {
            setIsWaitingForNextTurn(true);
            setReadingCountdown(null);
            return;
          }

          const wordCount = (data.message.content || '').split(/\s+/).length;
          let delayMs = 4500; // Calmo com áudio ativo: 4.5s de reflexão pós-voz

          if (pacingRef.current === 'normal') delayMs = 2500;
          if (pacingRef.current === 'rapido') delayMs = 1200;

          // Se o áudio estiver desligado, dar tempo suficiente para leitura tranquila
          if (!speechService.getAudioEnabled()) {
            if (pacingRef.current === 'calmo') {
              delayMs = Math.max(9000, Math.min(22000, wordCount * 220));
            } else if (pacingRef.current === 'normal') {
              delayMs = Math.max(5000, Math.min(13000, wordCount * 140));
            } else {
              delayMs = 2500;
            }
          }

          setIsWaitingForNextTurn(true);
          let secondsLeft = Math.ceil(delayMs / 1000);
          setReadingCountdown(secondsLeft);

          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = setInterval(() => {
            secondsLeft -= 1;
            if (secondsLeft <= 0) {
              if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
              setReadingCountdown(null);
            } else {
              setReadingCountdown(secondsLeft);
            }
          }, 1000);

          if (readingTimerRef.current) clearTimeout(readingTimerRef.current);
          readingTimerRef.current = setTimeout(() => {
            setIsWaitingForNextTurn(false);
            setReadingCountdown(null);
            setActiveSpeakerId(null);
            if (statusRef.current === 'running') {
              runNextTurn();
            }
          }, delayMs);
        };

        // Falar mensagem audível e despoletar transição após conclusão
        speechService.speak(currentAgent.id, data.message.content, onSpeechDone);
      }
    } catch (err) {
      console.error('Erro ao gerar turno do agente:', err);
      setActiveSpeakerId(null);
    } finally {
      setIsGenerating(false);
    }
  }, [agents, selectedAgentIds, isGenerating, topic, topicDescription, messages, apiKey, tone]);

  const addAgentLearning = (agentId: string, insight: string) => {
    if (!insight.trim()) return;
    setAgents(prev => {
      const updated = prev.map(a => {
        if (a.id === agentId) {
          const updatedMemory = {
            ...a.memory,
            cumulativeLearnings: [insight.trim(), ...(a.memory.cumulativeLearnings || [])]
          };
          LocalDatabase.saveAgentMemory(agentId, updatedMemory);
          return { ...a, memory: updatedMemory };
        }
        return a;
      });
      AppwriteDatabaseService.saveAgentMemories(LocalDatabase.getAgentMemories());
      return updated;
    });
  };

  const addAgentMemoryEntry = (agentId: string, memoryTopic: string, stance: string) => {
    if (!memoryTopic.trim()) return;
    setAgents(prev => {
      const updated = prev.map(a => {
        if (a.id === agentId) {
          const newEntry = {
            topic: memoryTopic.trim(),
            stanceSummary: stance.trim(),
            date: new Date().toLocaleDateString('pt-PT')
          };
          const updatedMemory = {
            ...a.memory,
            pastMemories: [newEntry, ...(a.memory.pastMemories || []).slice(0, 5)]
          };
          LocalDatabase.saveAgentMemory(agentId, updatedMemory);
          return { ...a, memory: updatedMemory };
        }
        return a;
      });
      AppwriteDatabaseService.saveAgentMemories(LocalDatabase.getAgentMemories());
      return updated;
    });
  };

  const addStructuredMemoryEntry = (
    agentId: string,
    categoryOrItem: StructuredMemoryCategory | Omit<StructuredMemoryItem, 'id' | 'timestamp'>,
    contentParam?: string,
    sourceParam: string = 'Utilizador',
    confidenceParam: 'baixa' | 'media' | 'alta' | 'confirmada' = 'confirmada',
    statusParam: 'confirmado' | 'hipotese' | 'revisto' | 'arquivado' = 'confirmado'
  ) => {
    let category: StructuredMemoryCategory;
    let content: string;
    let source = sourceParam;
    let confidence = confidenceParam;
    let status = statusParam;
    let emotionalImpact: 'neutro' | 'revelador' | 'inquietante' | 'decisivo' | undefined = undefined;
    let relatedColleague: string | undefined = undefined;
    let topicContext: string | undefined = undefined;

    if (typeof categoryOrItem === 'object') {
      category = categoryOrItem.category;
      content = categoryOrItem.content;
      if (categoryOrItem.source) source = categoryOrItem.source;
      if (categoryOrItem.confidence) confidence = categoryOrItem.confidence;
      if (categoryOrItem.status) status = categoryOrItem.status;
      if (categoryOrItem.emotionalImpact) emotionalImpact = categoryOrItem.emotionalImpact;
      if (categoryOrItem.relatedColleague) relatedColleague = categoryOrItem.relatedColleague;
      if (categoryOrItem.topicContext) topicContext = categoryOrItem.topicContext;
    } else {
      category = categoryOrItem;
      content = contentParam || '';
    }

    if (!content.trim()) return;
    const newItem: StructuredMemoryItem = {
      id: 'mem-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      category,
      content: content.trim(),
      source: source.trim(),
      confidence,
      status,
      date: new Date().toLocaleDateString('pt-PT'),
      timestamp: Date.now(),
      emotionalImpact,
      relatedColleague,
      topicContext,
    };

    setAgents(prev => {
      const updated = prev.map(a => {
        if (a.id === agentId) {
          const updatedEntries = [newItem, ...(a.memory.structuredEntries || [])];
          const updatedMemory = { ...a.memory, structuredEntries: updatedEntries };
          LocalDatabase.saveAgentMemory(agentId, updatedMemory);
          return { ...a, memory: updatedMemory };
        }
        return a;
      });
      AppwriteDatabaseService.saveAgentMemories(LocalDatabase.getAgentMemories());
      return updated;
    });
  };

  const deleteStructuredMemoryEntry = (agentId: string, itemId: string) => {
    setAgents(prev => {
      const updated = prev.map(a => {
        if (a.id === agentId) {
          const updatedEntries = (a.memory.structuredEntries || []).filter(e => e.id !== itemId);
          const updatedMemory = { ...a.memory, structuredEntries: updatedEntries };
          LocalDatabase.saveAgentMemory(agentId, updatedMemory);
          return { ...a, memory: updatedMemory };
        }
        return a;
      });
      AppwriteDatabaseService.saveAgentMemories(LocalDatabase.getAgentMemories());
      return updated;
    });
  };


  const startDebate = (newTopic?: string, newDescription?: string) => {
    if (newTopic) setTopic(newTopic);
    if (newDescription) setTopicDescription(newDescription);
    const newId = 'session-' + Date.now();
    setSessionId(newId);
    setMessages([]);
    setCurrentRound(1);
    setCurrentStageIndex(0);
    currentStageIndexRef.current = 0;
    currentSpeakerIndexRef.current = 0;
    setSynthesisResult(null);
    setStatus('running');
    setIsWaitingForNextTurn(false);
    setReadingCountdown(null);
    if (readingTimerRef.current) clearTimeout(readingTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    // Dispara a intervenção de abertura da mesa redonda na Etapa 0 (Compreender)
    setTimeout(() => {
      runNextTurn();
    }, 200);
  };

  const pauseDebate = () => {
    setStatus('paused');
    speechService.stop();
    if (readingTimerRef.current) clearTimeout(readingTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setReadingCountdown(null);
    setIsWaitingForNextTurn(false);
  };

  const resumeDebate = () => {
    setStatus('running');
    // Se não estiver já a gerar nem em contagem ativa, retoma o próximo turno
    if (!isGenerating && !isSpeakingAudio && !readingCountdown) {
      runNextTurn();
    }
  };

  const resetDebate = () => {
    setStatus('idle');
    setSessionId('session-' + Date.now());
    setMessages([]);
    setCurrentRound(1);
    setCurrentStageIndex(0);
    currentStageIndexRef.current = 0;
    currentSpeakerIndexRef.current = 0;
    setActiveSpeakerId(null);
    setSynthesisResult(null);
    speechService.stop();
    if (readingTimerRef.current) clearTimeout(readingTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setReadingCountdown(null);
    setIsWaitingForNextTurn(false);
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
    const loadedStageIdx = saved.currentStageIndex ?? (saved.messages?.length ? (saved.messages[saved.messages.length - 1].stageIndex ?? 0) : 0);
    setCurrentStageIndex(loadedStageIdx);
    currentStageIndexRef.current = loadedStageIdx;
    setSynthesisResult(saved.synthesisResult || null);
    currentSpeakerIndexRef.current = (saved.messages || []).length;
  };

  const injectHumanIntervention = async (content: string) => {
    if (!content.trim()) return;

    const raw = content.trim();
    const isGreeting = /boa noite|bom dia|boa tarde|ol[aá]|oi|boas|como est[aã]o|tudo bem/i.test(raw);
    const currentStageObj = canonicalStages[currentStageIndexRef.current] || canonicalStages[0];

    const humanMsg: DebateMessage = {
      id: 'human-' + Date.now(),
      agentId: 'human',
      agentName: 'Tu (Humano na Sala)',
      agentRole: 'Voz da Humanidade',
      avatar: '👤',
      accentColor: '#3b82f6',
      content: raw,
      round: currentRound,
      stageName: currentStageObj.name,
      stageIndex: currentStageIndexRef.current,
      timestamp: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      isHuman: true,
    };

    const nextMessages = [...messages, humanMsg];
    setMessages(nextMessages);
    setStatus('running');

    // Cancela contagens anteriores
    if (readingTimerRef.current) clearTimeout(readingTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setReadingCountdown(null);
    setIsWaitingForNextTurn(false);
    speechService.stop();

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
          stage: currentStageObj,
          stageIndex: currentStageIndexRef.current,
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setMessages(prev => [...prev, data.message]);

        const conclusion = data.message.dialecticalConclusion || data.dialecticalConclusion;
        if (conclusion) {
          setStatus('concluded');
          setActiveSpeakerId(null);
          setIsWaitingForNextTurn(false);
          setReadingCountdown(null);
          try {
            const rawConclusion = String(conclusion).toLowerCase();
            const dialecticalOutcome: DialecticalOutcome = rawConclusion.includes('aporia')
              ? 'aporia'
              : (rawConclusion.includes('consenso') ? 'consenso' : 'sintese');

            activeAgents.forEach(ag => {
              const agentMsgs = [...nextMessages, data.message].filter(m => m.agentId === ag.id);
              const lastSpeak = agentMsgs[agentMsgs.length - 1];
              const summary = lastSpeak ? lastSpeak.content.slice(0, 160) + '...' : `Defendeu a sua posição sobre "${topic}"`;
              const prevSpeaker = nextMessages.length > 0 ? nextMessages[nextMessages.length - 1].agentName : undefined;

              LocalDatabase.recordAutomaticDebateConclusionMemory(
                ag.id,
                topic,
                summary,
                dialecticalOutcome,
                prevSpeaker
              );
            });

            const updatedMemories = LocalDatabase.getAgentMemories();
            setAgents(prev => prev.map(a => {
              if (updatedMemories[a.id]) {
                return {
                  ...a,
                  memory: updatedMemories[a.id]
                };
              }
              return a;
            }));

            AppwriteDatabaseService.saveAgentMemories(updatedMemories);
          } catch (memErr) {
            console.warn('Erro ao arquivar memórias de debate:', memErr);
          }
          speechService.speak(respondingAgent.id, data.message.content);
          setTimeout(() => {
            synthesizeDebate();
          }, 1200);
          return;
        }

        const onSpeechDone = () => {
          if (pacingRef.current === 'manual') {
            setIsWaitingForNextTurn(true);
            setReadingCountdown(null);
            return;
          }

          const wordCount = (data.message.content || '').split(/\s+/).length;
          let delayMs = 4500;
          if (pacingRef.current === 'normal') delayMs = 2500;
          if (pacingRef.current === 'rapido') delayMs = 1200;

          if (!speechService.getAudioEnabled()) {
            if (pacingRef.current === 'calmo') {
              delayMs = Math.max(9000, Math.min(22000, wordCount * 220));
            } else if (pacingRef.current === 'normal') {
              delayMs = Math.max(5000, Math.min(13000, wordCount * 140));
            } else {
              delayMs = 2500;
            }
          }

          setIsWaitingForNextTurn(true);
          let secondsLeft = Math.ceil(delayMs / 1000);
          setReadingCountdown(secondsLeft);

          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = setInterval(() => {
            secondsLeft -= 1;
            if (secondsLeft <= 0) {
              if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
              setReadingCountdown(null);
            } else {
              setReadingCountdown(secondsLeft);
            }
          }, 1000);

          if (readingTimerRef.current) clearTimeout(readingTimerRef.current);
          readingTimerRef.current = setTimeout(() => {
            setIsWaitingForNextTurn(false);
            setReadingCountdown(null);
            setActiveSpeakerId(null);
            if (statusRef.current === 'running') {
              runNextTurn();
            }
          }, delayMs);
        };

        speechService.speak(respondingAgent.id, data.message.content, onSpeechDone);
      }
    } catch (err) {
      console.error('Erro ao responder à fala humana na sala:', err);
      setActiveSpeakerId(null);
    } finally {
      setIsGenerating(false);
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
    pacing,
    setPacing,
    readingCountdown,
    isWaitingForNextTurn,
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
    addAgentLearning,
    addAgentMemoryEntry,
    addStructuredMemoryEntry,
    deleteStructuredMemoryEntry,
    // Protocolo Canónico em 5 Etapas (The Five)
    canonicalStages,
    currentStageIndex,
    currentStage,
    setStage: (idx: number) => {
      if (idx >= 0 && idx < canonicalStages.length) {
        setCurrentStageIndex(idx);
        currentStageIndexRef.current = idx;
      }
    },
  };
}
