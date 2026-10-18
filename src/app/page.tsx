'use client';

import React, { useState } from 'react';
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

export default function HomePage() {
  const {
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
  } = useDebate();

  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSynthesisModalOpen, setIsSynthesisModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

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
    <div className="flex flex-col h-screen overflow-hidden bg-[#050814] text-slate-100 relative">
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
      />

      {/* Roster de Agentes da Mesa Redonda */}
      <AgentRoster
        agents={agents}
        selectedIds={selectedAgentIds}
        activeSpeakerId={activeSpeakerId}
        onToggleAgent={toggleAgent}
        isDebating={status === 'running'}
      />

      {/* Linha do Tempo e Mensagens do Debate */}
      <DebateTimeline
        messages={messages}
        topic={topic}
        topicDescription={topicDescription}
        isGenerating={isGenerating}
        activeSpeakerName={activeAgent?.name}
        onOpenTopics={() => setIsTopicModalOpen(true)}
        onSpeakMessage={speakSingleMessage}
        onQuickSpeak={injectHumanIntervention}
      />

      {/* Barra Inferior de Controlos e Intervenção Humana */}
      <ControlsBar
        status={status}
        onStart={() => startDebate()}
        onPause={pauseDebate}
        onResume={resumeDebate}
        onNextTurn={runNextTurn}
        onSynthesize={handleOpenSynthesis}
        onInjectHuman={injectHumanIntervention}
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
        isOpen={isSynthesisModalOpen || Boolean(synthesisResult && !isSynthesizing && status === 'concluded')}
        onClose={() => setIsSynthesisModalOpen(false)}
        topic={topic}
        synthesis={synthesisResult}
        currentMessagesCount={messages.length}
        onRefreshSynthesis={synthesizeDebate}
        isSynthesizing={isSynthesizing}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onLoadSession={loadSavedSession}
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
