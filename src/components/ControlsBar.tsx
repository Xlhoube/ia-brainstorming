'use client';

import React, { useState } from 'react';
import { Play, Pause, FastForward, FileText, Send, Sparkles } from 'lucide-react';

interface ControlsBarProps {
  status: 'idle' | 'running' | 'paused' | 'concluded';
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onNextTurn: () => void;
  onSynthesize: () => void;
  onInjectHuman: (content: string) => void;
  isGenerating: boolean;
  isSynthesizing: boolean;
  messagesCount: number;
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  status,
  onStart,
  onPause,
  onResume,
  onNextTurn,
  onSynthesize,
  onInjectHuman,
  isGenerating,
  isSynthesizing,
  messagesCount,
}) => {
  const [humanInput, setHumanInput] = useState('');

  const handleSubmitHuman = (e: React.FormEvent) => {
    e.preventDefault();
    if (!humanInput.trim()) return;
    onInjectHuman(humanInput);
    setHumanInput('');
  };

  return (
    <footer className="sticky bottom-0 z-40 border-t border-slate-800/80 bg-[#050814]/90 backdrop-blur-md px-4 lg:px-8 py-3.5 space-y-3">
      <div className="max-w-4xl mx-auto space-y-3">
        {/* Formulário de Intervenção Humana */}
        <form onSubmit={handleSubmitHuman} className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={humanInput}
              onChange={e => setHumanInput(e.target.value)}
              placeholder="Fala diretamente para a sala (ex: 'Boa noite a todos', 'O que acham...', ou propõe um tema)..."
              className="w-full h-11 pl-4 pr-10 rounded-xl bg-slate-900/90 border border-slate-700/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 outline-none transition-all"
            />
            <span className="absolute right-3 top-3 text-[10px] text-slate-500 font-medium hidden sm:inline">
              Enter ↵
            </span>
          </div>

          <button
            type="submit"
            disabled={!humanInput.trim() || isGenerating}
            className="h-11 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isGenerating ? 'A responder...' : 'Falar na Sala'}</span>
          </button>

        </form>

        {/* Barra de Ações Principais do Debate */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {status === 'idle' ? (
              <button
                onClick={onStart}
                className="h-10 px-5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs tracking-wide flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02]"
              >
                <Play className="w-4 h-4 fill-white" />
                Iniciar Debate
              </button>
            ) : status === 'running' ? (
              <button
                onClick={onPause}
                className="h-10 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 transition-all"
              >
                <Pause className="w-4 h-4 text-amber-400" />
                Pausar
              </button>
            ) : (
              <button
                onClick={onResume}
                className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                Retomar
              </button>
            )}

            {status !== 'idle' && (
              <button
                onClick={onNextTurn}
                disabled={isGenerating}
                className="h-10 px-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 disabled:opacity-40 text-slate-300 font-medium text-xs flex items-center gap-1.5 transition-all"
                title="Acelerar para a intervenção do próximo agente"
              >
                <FastForward className="w-3.5 h-3.5 text-blue-400" />
                <span className="hidden sm:inline">Próximo Turno</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {messagesCount >= 2 && (
              <button
                onClick={onSynthesize}
                disabled={isSynthesizing}
                className="h-10 px-4 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-700/50 text-emerald-300 disabled:opacity-50 font-semibold text-xs flex items-center gap-2 transition-all shadow-sm"
              >
                {isSynthesizing ? (
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileText className="w-3.5 h-3.5" />
                )}
                <span>{isSynthesizing ? 'A Sintetizar...' : 'Síntese & Relatório'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
