'use client';

import React from 'react';
import { Sparkles, Key, BookOpen, RotateCcw, BrainCircuit } from 'lucide-react';

interface NavbarProps {
  onOpenSettings: () => void;
  onOpenTopics: () => void;
  onReset: () => void;
  apiKey: string;
  status: string;
  currentRound: number;
  maxRounds: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSettings,
  onOpenTopics,
  onReset,
  apiKey,
  status,
  currentRound,
  maxRounds,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#050814]/85 backdrop-blur-md px-4 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Logo & Marca */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/20">
          <div className="w-full h-full bg-[#050814] rounded-[10px] flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base lg:text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              IA Brain Storming
            </h1>
            <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Arena v0.1.0
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            Diálogo Dialético Multi-Agente & Síntese de Consciência
          </p>
        </div>
      </div>

      {/* Indicadores Centrais */}
      <div className="flex items-center gap-2 sm:gap-3">
        {status !== 'idle' && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs">
            <span className="text-slate-400">Ronda</span>
            <span className="font-mono font-bold text-blue-400">
              {Math.min(currentRound, maxRounds)}
            </span>
            <span className="text-slate-600">/</span>
            <span className="font-mono text-slate-400">{maxRounds}</span>
          </div>
        )}

        <button
          onClick={onOpenTopics}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/60 transition-all text-xs font-medium shadow-sm"
          title="Escolher Tópico de Debate"
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Temas</span>
        </button>

        <button
          onClick={onOpenSettings}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all shadow-sm ${
            apiKey
              ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300 hover:bg-emerald-950/50'
              : 'bg-indigo-950/40 border-indigo-700/50 text-indigo-300 hover:bg-indigo-900/40 animate-pulse'
          }`}
          title="Configuração de Motores & OpenRouter"
        >
          <Key className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">
            {apiKey ? 'API Conectada' : 'Ligar OpenRouter'}
          </span>
        </button>

        {status !== 'idle' && (
          <button
            onClick={onReset}
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-800/60 text-slate-400 hover:text-rose-300 transition-all text-xs"
            title="Reiniciar Debate"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </header>
  );
};
