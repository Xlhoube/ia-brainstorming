'use client';

import React, { useState } from 'react';
import { Play, Pause, FastForward, FileText, Send, Sparkles, BookOpen, Mic } from 'lucide-react';
import { DebatePacing } from '@/types/debate';

interface ControlsBarProps {
  status: 'idle' | 'running' | 'paused' | 'concluded';
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onNextTurn: () => void;
  onSynthesize: () => void;
  onInjectHuman: (content: string) => void;
  onOpenPodcast?: () => void;
  isGenerating: boolean;
  isSynthesizing: boolean;
  messagesCount: number;
  pacing?: DebatePacing;
  onPacingChange?: (pacing: DebatePacing) => void;
  readingCountdown?: number | null;
  isWaitingForNextTurn?: boolean;
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  status,
  onStart,
  onPause,
  onResume,
  onNextTurn,
  onSynthesize,
  onInjectHuman,
  onOpenPodcast,
  isGenerating,
  isSynthesizing,
  messagesCount,
  pacing = 'calmo',
  onPacingChange,
  readingCountdown = null,
  isWaitingForNextTurn = false,
}) => {
  const [humanInput, setHumanInput] = useState('');

  const handleSubmitHuman = (e: React.FormEvent) => {
    e.preventDefault();
    if (!humanInput.trim()) return;
    onInjectHuman(humanInput);
    setHumanInput('');
  };

  return (
    <footer className="sticky bottom-0 z-40 border-t border-slate-800/80 bg-[#050814]/90 backdrop-blur-md px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 space-y-2 sm:space-y-2.5">
      <div className="max-w-4xl mx-auto space-y-2 sm:space-y-2.5">
        {/* Aviso de Pausa para Leitura Confortável */}
        {readingCountdown !== null && (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-[11px] sm:text-xs animate-fade-in shadow-sm">
            <div className="flex items-center gap-2 min-w-0 truncate">
              <span className="font-mono font-bold px-1.5 py-0.5 rounded bg-amber-900/70 text-amber-300 border border-amber-700/60 flex-shrink-0">
                {readingCountdown}s
              </span>
              <span className="truncate">Pausa para leitura tranquila. Podes ler ao teu ritmo...</span>
            </div>
            <button
              onClick={onNextTurn}
              className="text-[11px] font-semibold text-amber-300 hover:text-white bg-amber-900/60 hover:bg-amber-800/80 px-2.5 py-1 rounded-lg border border-amber-600/50 transition-colors flex-shrink-0 ml-2"
            >
              Avançar Já ⏭️
            </button>
          </div>
        )}

        {/* Aviso do Modo Passo a Passo */}
        {pacing === 'manual' && isWaitingForNextTurn && status !== 'idle' && (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-indigo-950/40 border border-indigo-600/40 text-indigo-200 text-[11px] sm:text-xs animate-fade-in shadow-sm">
            <div className="flex items-center gap-2 min-w-0 truncate">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
              <span className="truncate">Modo Passo a Passo: lê com calma. Clica em &ldquo;Próximo Turno&rdquo; quando quiseres continuar.</span>
            </div>
            <button
              onClick={onNextTurn}
              disabled={isGenerating}
              className="text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1 rounded-lg shadow-sm shadow-indigo-500/20 transition-colors flex-shrink-0 ml-2"
            >
              Próximo Turno ↵
            </button>
          </div>
        )}
        {/* Formulário de Intervenção Humana */}
        <form onSubmit={handleSubmitHuman} className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={humanInput}
              onChange={e => setHumanInput(e.target.value)}
              placeholder="Fala para a sala (ex: 'Boa noite a todos', 'O que acham...')..."
              className="w-full h-10 sm:h-11 pl-3.5 sm:pl-4 pr-10 rounded-xl bg-slate-900/90 border border-slate-700/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 outline-none transition-all"
            />
            <span className="absolute right-3 top-2.5 sm:top-3 text-[10px] text-slate-500 font-medium hidden sm:inline">
              Enter ↵
            </span>
          </div>

          <button
            type="submit"
            disabled={!humanInput.trim() || isGenerating}
            className="h-10 sm:h-11 px-3 sm:px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{isGenerating ? 'A responder...' : 'Falar na Sala'}</span>
            <span className="inline xs:hidden">{isGenerating ? '...' : 'Falar'}</span>
          </button>
        </form>

        {/* Barra de Ações Principais do Debate */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {status === 'idle' ? (
              <button
                onClick={onStart}
                className="h-9 sm:h-10 px-3.5 sm:px-5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs tracking-wide flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02]"
              >
                <Play className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-white" />
                <span>Iniciar Debate</span>
              </button>
            ) : status === 'running' ? (
              <button
                onClick={onPause}
                className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 sm:gap-2 transition-all"
              >
                <Pause className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-amber-400" />
                <span>Pausar</span>
              </button>
            ) : (
              <button
                onClick={onResume}
                className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 sm:gap-2 shadow-md transition-all"
              >
                <Play className="w-3.5 sm:w-4 h-3.5 sm:h-4 fill-white" />
                <span>Retomar</span>
              </button>
            )}

            {status !== 'idle' && (
              <button
                onClick={onNextTurn}
                disabled={isGenerating}
                className="h-9 sm:h-10 px-2.5 sm:px-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 disabled:opacity-40 text-slate-300 font-medium text-xs flex items-center gap-1 sm:gap-1.5 transition-all"
                title="Avançar imediatamente para a intervenção do próximo agente"
              >
                <FastForward className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Próximo Turno</span>
                <span className="inline sm:hidden">Avançar</span>
              </button>
            )}

            {/* Seletor de Ritmo & Cadência de Leitura */}
            {onPacingChange && (
              <div className="flex items-center p-0.5 rounded-xl bg-slate-900 border border-slate-700/60 text-[11px] flex-shrink-0">
                <button
                  type="button"
                  onClick={() => onPacingChange('manual')}
                  className={`px-2 py-1 rounded-lg transition-all font-medium flex items-center gap-1 ${
                    pacing === 'manual'
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Modo Passo a Passo: o debate avança apenas quando clicares em Próximo Turno"
                >
                  <span>📖</span>
                  <span className="hidden sm:inline">Passo a Passo</span>
                  <span className="inline sm:hidden">Manual</span>
                </button>
                <button
                  type="button"
                  onClick={() => onPacingChange('calmo')}
                  className={`px-2 py-1 rounded-lg transition-all font-medium flex items-center gap-1 ${
                    pacing === 'calmo'
                      ? 'bg-amber-600/80 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Modo Calmo: dá tempo confortável para ler e escutar sem pressa"
                >
                  <span>🧘</span>
                  <span>Calmo</span>
                </button>
                <button
                  type="button"
                  onClick={() => onPacingChange('normal')}
                  className={`px-2 py-1 rounded-lg transition-all font-medium hidden sm:inline-flex items-center gap-1 ${
                    pacing === 'normal'
                      ? 'bg-slate-700 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Modo Normal: ritmo equilibrado"
                >
                  <span>⏱️</span>
                  <span>Normal</span>
                </button>
                <button
                  type="button"
                  onClick={() => onPacingChange('rapido')}
                  className={`px-2 py-1 rounded-lg transition-all font-medium hidden md:inline-flex items-center gap-1 ${
                    pacing === 'rapido'
                      ? 'bg-slate-700 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Modo Rápido: transições aceleradas"
                >
                  <span>⚡</span>
                  <span>Rápido</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onOpenPodcast && (
              <button
                onClick={onOpenPodcast}
                className="h-9 sm:h-10 px-3 sm:px-3.5 rounded-xl bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-700/50 text-indigo-300 font-semibold text-xs flex items-center gap-1.5 sm:gap-2 transition-all shadow-sm"
                title="Abrir o Estúdio de Podcast (guiões, capítulos e masterização áudio)"
              >
                <Mic className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Podcast Studio</span>
                <span className="inline sm:hidden">Podcast</span>
              </button>
            )}

            {messagesCount >= 2 && (
              <button
                onClick={onSynthesize}
                disabled={isSynthesizing}
                className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-700/50 text-emerald-300 disabled:opacity-50 font-semibold text-xs flex items-center gap-1.5 sm:gap-2 transition-all shadow-sm"
              >
                {isSynthesizing ? (
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileText className="w-3.5 h-3.5" />
                )}
                <span className="hidden sm:inline">{isSynthesizing ? 'A Sintetizar...' : 'Síntese & Relatório'}</span>
                <span className="inline sm:hidden">{isSynthesizing ? 'A analisar...' : 'Síntese'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
