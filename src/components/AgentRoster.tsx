'use client';

import React, { useState } from 'react';
import { Agent } from '@/types/debate';
import { Check, Volume2, Users, X, Sparkles } from 'lucide-react';

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
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const handleImageError = (agentId: string) => {
    setFailedImages(prev => ({ ...prev, [agentId]: true }));
  };

  return (
    <>
      <div className="w-full bg-slate-950/70 border-y border-slate-800/60 py-3 px-4 lg:px-8 backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                Mesa Redonda ({selectedIds.length}/{agents.length} ativos)
              </span>
              <span className="text-[10px] text-slate-500 hidden md:inline">
                • Clica num especialista para ligar ou desligar a sua presença
              </span>
            </div>

            {/* Botão de Destaque: Painel de Especialistas */}
            <button
              onClick={() => setShowTeamModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-700/40 hover:border-indigo-500/60 text-[11px] text-indigo-300 font-medium transition-all duration-200 shadow-sm hover:scale-[1.02]"
              title="Ver o retrato cinemático da equipa reunida"
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Painel de Especialistas</span>
              <Sparkles className="w-3 h-3 text-amber-400" />
            </button>
          </div>

          {/* Grelha / Lista de Agentes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {agents.map(agent => {
              const isSelected = selectedIds.includes(agent.id);
              const isSpeaking = activeSpeakerId === agent.id;
              const hasImage = Boolean(agent.image && !failedImages[agent.id]);

              return (
                <button
                  key={agent.id}
                  onClick={() => onToggleAgent(agent.id)}
                  disabled={isDebating}
                  className={`group relative flex items-center gap-3 p-2 rounded-xl border text-left transition-all duration-300 ${
                    isSpeaking
                      ? 'bg-indigo-950/50 border-indigo-500 ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-500/25 scale-[1.02]'
                      : isSelected
                      ? 'bg-slate-900/80 border-slate-700/70 hover:border-slate-600 hover:bg-slate-900'
                      : 'bg-slate-950/40 border-slate-800/40 opacity-40 hover:opacity-75'
                  }`}
                >
                  {/* Avatar com Imagem ou Fallback de Emoji */}
                  <div className="relative flex-shrink-0 w-11 h-11 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-700/60 shadow-md">
                    {hasImage ? (
                      /* Imagem fotográfica do Avatar */
                      <img
                        src={agent.image}
                        alt={agent.name}
                        onError={() => handleImageError(agent.id)}
                        className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                          isSpeaking ? 'brightness-110' : ''
                        }`}
                      />
                    ) : (
                      <span className="text-xl">{agent.avatar}</span>
                    )}

                    {/* Indicador de Fala */}
                    {isSpeaking && (
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md ring-1 ring-white/20">
                        <Volume2 className="w-2.5 h-2.5 animate-pulse" />
                      </span>
                    )}

                    {/* Checkmark de Seleção */}
                    {isSelected && !isSpeaking && (
                      <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950 shadow-sm">
                        <Check className="w-2 h-2 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  {/* Informações do Agente */}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-200 truncate">
                      {agent.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {agent.roleTitle}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-400 border border-slate-700/40 truncate max-w-[110px]">
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

      {/* Modal do Painel Cinemático de Especialistas */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            {/* Cabeçalho do Modal */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white tracking-tight">
                  Painel de Especialistas • Mesa Dialética
                </h3>
              </div>
              <button
                onClick={() => setShowTeamModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Imagem Cinemática da Equipa */}
            <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] bg-slate-950 overflow-hidden border-b border-slate-800">
              <img
                src="/avatars/painel_especialistas.png"
                alt="Painel Cinemático de Especialistas em Equipa"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-300">
                <span className="bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-700/70 backdrop-blur-sm">
                  Conselho Estratégico de Inteligência Artificial
                </span>
                <span className="text-[11px] text-slate-400">
                  5 Perspetivas Complementares
                </span>
              </div>
            </div>

            {/* Mini-Perfis dos 5 Especialistas */}
            <div className="p-4 grid grid-cols-1 sm:grid-cols-5 gap-3 bg-slate-950/40">
              {agents.map(agent => (
                <div
                  key={agent.id}
                  className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center sm:flex-col sm:text-center gap-2.5"
                >
                  <img
                    src={agent.image}
                    alt={agent.name}
                    className="w-10 h-10 sm:w-14 sm:h-14 rounded-full object-cover border border-slate-700 shadow"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-200 truncate">
                      {agent.name}
                    </p>
                    <p className="text-[10px] text-indigo-400 font-medium truncate">
                      {agent.roleTitle}
                    </p>
                    <p className="text-[9px] text-slate-400 line-clamp-2 mt-1 hidden sm:block">
                      {agent.stanceDescription}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

