'use client';

import React from 'react';
import { Agent } from '@/types/debate';
import { Check, Volume2 } from 'lucide-react';

interface AgentRosterProps {
  agents: Agent[];
  selectedIds: string[];
  activeSpeakerId: string | null;
  onToggleAgent: (id: string) => void;
  isDebating: boolean;
}

export const AgentRoster: React.FC<AgentRosterProps> = ({
  agents,
  selectedIds,
  activeSpeakerId,
  onToggleAgent,
  isDebating,
}) => {
  return (
    <div className="w-full bg-slate-950/60 border-y border-slate-800/60 py-3 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Agentes na Mesa Redonda ({selectedIds.length} selecionados)
            </span>
            <span className="text-[10px] text-slate-500 hidden md:inline">
              • Clica num agente para ativar ou desativar a sua presença
            </span>
          </div>
        </div>

        {/* Grelha / Lista de Agentes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {agents.map(agent => {
            const isSelected = selectedIds.includes(agent.id);
            const isSpeaking = activeSpeakerId === agent.id;

            return (
              <button
                key={agent.id}
                onClick={() => onToggleAgent(agent.id)}
                disabled={isDebating}
                className={`relative flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all duration-300 ${
                  isSpeaking
                    ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-500/20 scale-[1.02]'
                    : isSelected
                    ? 'bg-slate-900/70 border-slate-700/60 hover:border-slate-600 hover:bg-slate-900'
                    : 'bg-slate-950/40 border-slate-800/40 opacity-40 hover:opacity-75'
                }`}
              >
                {/* Avatar com Indicador de Fala */}
                <div className="relative flex-shrink-0 w-9 h-9 rounded-lg bg-slate-800/90 flex items-center justify-center text-lg border border-slate-700/50 shadow-inner">
                  <span>{agent.avatar}</span>
                  {isSpeaking && (
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md">
                      <Volume2 className="w-2.5 h-2.5 animate-pulse" />
                    </span>
                  )}
                  {isSelected && !isSpeaking && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500/90 flex items-center justify-center text-slate-950">
                      <Check className="w-2 h-2 stroke-[3]" />
                    </span>
                  )}
                </div>

                {/* Informações do Agente */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-slate-200 truncate">
                      {agent.name}
                    </p>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate">
                    {agent.roleTitle}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-400 border border-slate-700/40 truncate max-w-[120px]">
                      {agent.model.split('/')[1] || agent.model}
                    </span>
                  </div>
                </div>

                {/* Animação de Onda Sonora quando está a falar */}
                {isSpeaking && (
                  <div className="absolute right-2 top-2 flex items-end gap-0.5 h-3">
                    <span className="w-0.5 h-full bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-0.5 h-full bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-0.5 h-full bg-indigo-400 rounded-full animate-bounce" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
