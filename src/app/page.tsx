'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDebate } from '@/hooks/useDebate';
import { Navbar } from '@/components/Navbar';
import { AgentRoster } from '@/components/AgentRoster';
import { DebateTimeline } from '@/components/DebateTimeline';
import { ControlsBar } from '@/components/ControlsBar';
import { TopicModal } from '@/components/TopicModal';
import { SettingsModal } from '@/components/SettingsModal';
import { SynthesisModal } from '@/components/SynthesisModal';
import { HistoryModal } from '@/components/HistoryModal';
import { EditorialReport } from '@/components/EditorialReport';
import { PodcastModal } from '@/components/PodcastModal';

export default function HomePage() {
  const {
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
    activeSpeakerId,
    messages,
    apiKey,
    saveApiKey,
    tone,
    setTone,
    isGenerating,
    isSynthesizing,
    synthesisResult,
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
    addStructuredMemoryEntry,
    deleteStructuredMemoryEntry,
    canonicalStages,
    currentStage,
    currentStageIndex,
    setStage,
  } = useDebate();

  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSynthesisModalOpen, setIsSynthesisModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isPodcastModalOpen, setIsPodcastModalOpen] = useState(false);

  // Auto-abertura da síntese uma única vez após a conclusão do debate
  const autoOpenedSynthesisSessionRef = useRef<string | null>(null);

  useEffect(() => {
    if (status === 'concluded' && synthesisResult && !isSynthesizing) {
      if (autoOpenedSynthesisSessionRef.current !== sessionId) {
        autoOpenedSynthesisSessionRef.current = sessionId;
        setIsSynthesisModalOpen(true);
      }
    }
  }, [status, synthesisResult, isSynthesizing, sessionId]);

  // Agente ativo atual
  const activeAgent = agents.find(a => a.id === activeSpeakerId);

  const handleSelectTopic = (newTopic: string, newDesc: string) => {
    setTopic(newTopic);
    setTopicDescription(newDesc);
    resetDebate();
  };

  const handleOpenSynthesis = async () => {
    setIsSynthesisModalOpen(true);
    // Se ainda não há síntese ou se novas mensagens foram adicionadas ao debate, recalcula imediatamente
    if (!synthesisResult || (synthesisResult.analyzedCount && synthesisResult.analyzedCount < messages.length)) {
      await synthesizeDebate();
    }
  };

  const handleToggleTone = () => {
    const nextTone = tone === 'simples' ? 'academico' : 'simples';
    setTone(nextTone);
  };

  return (
    <div className="flex flex-col h-screen h-[100dvh] overflow-hidden bg-[#050814] text-slate-100 relative">
      {/* Barra de Navegação com Controlos de Áudio, Tom e Histórico */}
      <Navbar
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenTopics={() => setIsTopicModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        onReset={resetDebate}
        isAudioEnabled={isAudioEnabled}
        isSpeakingAudio={isSpeakingAudio}
        onToggleAudio={toggleAudio}
        tone={tone}
        onToggleTone={handleToggleTone}
        apiKey={apiKey}
        status={status}
        currentRound={currentRound}
        maxRounds={maxRounds}
        currentStageName={currentStage?.name}
        currentStageIndex={currentStageIndex}
      />

      {/* Área Central Dividida: Especialistas de um lado e Diálogo do outro */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden relative">
        {/* Painel Lateral dos Especialistas */}
        <aside className="w-full md:w-80 lg:w-[340px] xl:w-[360px] flex-shrink-0 border-b md:border-b-0 md:border-r border-slate-800/80 bg-slate-950/70 backdrop-blur-md flex flex-col min-h-0 z-10">
          <AgentRoster
            agents={agents}
            selectedIds={selectedAgentIds}
            activeSpeakerId={activeSpeakerId}
            onToggleAgent={toggleAgent}
            onAddAgentLearning={addAgentLearning}
            onAddStructuredMemory={addStructuredMemoryEntry}
            onDeleteStructuredMemory={deleteStructuredMemoryEntry}
            isDebating={status === 'running'}
          />
        </aside>

        {/* Painel Central do Diálogo e Linha do Tempo */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          <DebateTimeline
            messages={messages}
            agents={agents}
            topic={topic}
            topicDescription={topicDescription}
            isGenerating={isGenerating}
            activeSpeakerName={activeAgent?.name}
            canonicalStages={canonicalStages}
            currentStageIndex={currentStageIndex}
            onSelectStage={setStage}
            onOpenTopics={() => setIsTopicModalOpen(true)}
            onSpeakMessage={speakSingleMessage}
            onQuickSpeak={injectHumanIntervention}
          />
        </main>
      </div>

      {/* Barra Inferior de Controlos e Intervenção Humana */}
      <ControlsBar
        status={status}
        onStart={() => startDebate()}
        onPause={pauseDebate}
        onResume={resumeDebate}
        onNextTurn={runNextTurn}
        onSynthesize={handleOpenSynthesis}
        onInjectHuman={injectHumanIntervention}
        onOpenPodcast={() => setIsPodcastModalOpen(true)}
        onReset={resetDebate}
        onOpenTopics={() => setIsTopicModalOpen(true)}
        isGenerating={isGenerating}
        isSynthesizing={isSynthesizing}
        messagesCount={messages.length}
      />

      {/* Modais */}
      <TopicModal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        currentTopic={topic}
        onSelectTopic={handleSelectTopic}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={saveApiKey}
      />

      <SynthesisModal
        isOpen={isSynthesisModalOpen}
        onClose={() => setIsSynthesisModalOpen(false)}
        topic={topic}
        synthesis={synthesisResult}
        currentMessagesCount={messages.length}
        onRefreshSynthesis={synthesizeDebate}
        isSynthesizing={isSynthesizing}
        onOpenPodcast={() => setIsPodcastModalOpen(true)}
        onResetDebate={() => {
          setIsSynthesisModalOpen(false);
          resetDebate();
        }}
        onOpenTopics={() => {
          setIsSynthesisModalOpen(false);
          setIsTopicModalOpen(true);
        }}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onLoadSession={loadSavedSession}
      />

      {/* Estúdio de Podcast Dialético e Masterização de Áudio */}
      <PodcastModal
        isOpen={isPodcastModalOpen}
        onClose={() => setIsPodcastModalOpen(false)}
        topic={topic}
        topicDescription={topicDescription}
        messages={messages}
        agents={agents}
        stages={canonicalStages}
        synthesis={synthesisResult}
      />

      {/* Relatório com Design Editorial White Paper (ativo no modo de impressão/PDF) */}
      <EditorialReport
        topic={topic}
        topicDescription={topicDescription}
        synthesis={synthesisResult}
        messages={messages}
      />
    </div>
  );
}
