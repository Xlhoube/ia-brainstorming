'use client';

import React from 'react';
import { Volume2, VolumeX, History, BookOpen, RotateCcw, BrainCircuit, Sparkles, GraduationCap } from 'lucide-react';
import { LanguageTone } from '@/types/debate';

interface NavbarProps {
  onOpenSettings?: () => void;
  onOpenTopics: () => void;
  onOpenHistory: () => void;
  onReset: () => void;
  isAudioEnabled: boolean;
  isSpeakingAudio: boolean;
  onToggleAudio: () => void;
  tone: LanguageTone;
  onToggleTone: () => void;
  apiKey?: string;
  status: string;
  currentRound: number;
  maxRounds: number;
  currentStageName?: string;
  currentStageIndex?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSettings,
  onOpenTopics,
  onOpenHistory,
  onReset,
  isAudioEnabled,
  isSpeakingAudio,
  onToggleAudio,
  tone,
  onToggleTone,
  apiKey,
  status,
  currentRound,
  maxRounds,
  currentStageName,
  currentStageIndex,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#050814]/85 backdrop-blur-md px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2">
      {/* Logo & Marca */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink-0">
        <div className="relative flex-shrink-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20">
          <div className="w-full h-full bg-[#050814] rounded-[9px] sm:rounded-[10px] flex items-center justify-center">
            <BrainCircuit className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-emerald-500"></span>
          </span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="text-xs sm:text-base lg:text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent truncate">
              IA Brain Storming
            </h1>
            <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase px-1.5 sm:px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hidden md:inline-block">
              v0.14.0
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 hidden lg:block truncate">
            Voz TTS • PDF Editorial • Linguagem {tone === 'simples' ? 'Simples & Acessível' : 'Académica'}
          </p>
        </div>
      </div>

      {/* Indicadores Centrais & Ações */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-0.5 flex-shrink-0">
        {status !== 'idle' && (
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] sm:text-xs flex-shrink-0 shadow-inner">
            {status === 'concluded' ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>⚖️ Conclusão da Mesa</span>
              </span>
            ) : status === 'running' ? (
              <span className="flex items-center gap-1.5 text-blue-300 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                <span>{currentStageName ? `🧭 Etapa ${(currentStageIndex ?? 0) + 1}/5: ${currentStageName}` : 'Dialética Livre'}</span>
                <span className="text-slate-600">•</span>
                <span className="font-mono font-bold text-blue-400">Ciclo {currentRound}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-300 font-medium">
                <span>⏸️ Em Pausa</span>
                {currentStageName && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span>🧭 {currentStageName}</span>
                  </>
                )}
                <span className="text-slate-600">•</span>
                <span className="font-mono text-amber-400">Ciclo {currentRound}</span>
              </span>
            )}
          </div>
        )}

        {/* Seletor de Tom: Linguagem Simples vs Académica */}
        <button
          onClick={onToggleTone}
          className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg border text-[11px] sm:text-xs font-semibold transition-all shadow-sm flex-shrink-0 ${
            tone === 'simples'
              ? 'bg-amber-950/40 border-amber-700/60 text-amber-300 hover:bg-amber-900/40'
              : 'bg-purple-950/40 border-purple-700/60 text-purple-300 hover:bg-purple-900/40'
          }`}
          title={tone === 'simples' ? 'Modo Linguagem Simples ativo (Clica para mudar para Académica)' : 'Modo Linguagem Académica ativo (Clica para mudar para Simples)'}
        >
          {tone === 'simples' ? (
            <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          ) : (
            <GraduationCap className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
          )}
          <span className="hidden sm:inline">{tone === 'simples' ? 'Linguagem Simples' : 'Linguagem Académica'}</span>
          <span className="inline sm:hidden">{tone === 'simples' ? 'Simples' : 'Académica'}</span>
        </button>

        {/* Controlo de Áudio TTS */}
        <button
          onClick={onToggleAudio}
          className={`flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border text-xs font-medium transition-all flex-shrink-0 ${
            isAudioEnabled
              ? isSpeakingAudio
                ? 'bg-indigo-900/40 border-indigo-500 text-indigo-300 ring-2 ring-indigo-500/40 animate-pulse'
                : 'bg-slate-900/80 border-slate-700/60 text-slate-200 hover:text-white hover:bg-slate-800'
              : 'bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-400'
          }`}
          title={isAudioEnabled ? (isSpeakingAudio ? 'A falar... Clica para silenciar' : 'Voz Ativa (Clica para silenciar)') : 'Voz Desativada (Clica para ativar)'}
        >
          {isAudioEnabled ? (
            <Volume2 className={`w-3.5 h-3.5 ${isSpeakingAudio ? 'text-indigo-400 animate-bounce' : 'text-blue-400'}`} />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-slate-500" />
          )}
          <span className="hidden md:inline">
            {isAudioEnabled ? (isSpeakingAudio ? 'A Falar...' : 'Voz Ligada') : 'Mudo'}
          </span>
        </button>

        {/* Histórico Local */}
        <button
          onClick={onOpenHistory}
          className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/60 transition-all text-xs font-medium shadow-sm flex-shrink-0"
          title="Ver Debates Guardados na Base de Dados Local"
        >
          <History className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Histórico</span>
        </button>

        {/* Temas */}
        <button
          onClick={onOpenTopics}
          className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/60 transition-all text-xs font-medium shadow-sm flex-shrink-0"
          title="Escolher Tópico de Debate"
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Temas</span>
        </button>

        {status !== 'idle' && (
          <button
            onClick={onReset}
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-800/60 text-slate-400 hover:text-rose-300 transition-all text-xs flex-shrink-0"
            title="Reiniciar Debate"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  );
};
