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
                    {/* Badge de Temperamento */}
                    {agent.personality && (
                      <p className="text-[9px] text-indigo-300/80 truncate mt-0.5">
                        🎭 {agent.personality.traits[0]}
                      </p>
                    )}
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

      {/* Modal do Painel Cinemático de Especialistas com Personalidades */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl max-h-[92vh] bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            {/* Cabeçalho do Modal */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Painel de Especialistas • Personalidades & Dinâmica Dialética
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    O temperamento e perfil psicológico de cada pensador influenciam a sua postura e evolução no debate
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowTeamModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              {/* Imagem Cinemática da Equipa */}
              <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] bg-slate-950 overflow-hidden border-b border-slate-800">
                <img
                  src="/avatars/painel_especialistas.png"
                  alt="Painel Cinemático de Especialistas em Equipa"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-85" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-300">
                  <span className="bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-700/70 backdrop-blur-sm font-semibold">
                    Conselho Estratégico de Inteligência Artificial
                  </span>
                  <span className="text-[11px] text-slate-400 bg-slate-950/70 px-2 py-0.5 rounded border border-slate-800">
                    5 Psiques Dialéticas Complementares
                  </span>
                </div>
              </div>

              {/* Cartões Detalhados de Personalidade dos 5 Especialistas */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 bg-slate-950/60">
                {agents.map(agent => (
                  <div
                    key={agent.id}
                    className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2.5">
                        <img
                          src={agent.image}
                          alt={agent.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-700 shadow-md flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">
                            {agent.name}
                          </p>
                          <p className="text-xs text-indigo-400 font-medium">
                            {agent.roleTitle}
                          </p>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/50">
                            {agent.model.split('/')[1] || agent.model}
                          </span>
                        </div>
                      </div>

                      {/* Temperamento */}
                      {agent.personality && (
                        <div className="space-y-2 text-xs">
                          <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                              Temperamento Psicológico
                            </span>
                            <p className="text-slate-300 text-[11px] leading-relaxed">
                              {agent.personality.temperament}
                            </p>
                          </div>

                          {/* Traços */}
                          <div>
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                              Traços Dominantes
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {agent.personality.traits.map((t, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-950/50 text-indigo-300 border border-indigo-800/40 font-medium"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Dinâmica de Evolução */}
                          <div className="pt-1">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400/90 block mb-0.5">
                              Como a Opinião Evolui no Debate
                            </span>
                            <p className="text-slate-400 text-[11px] leading-normal italic">
                              &ldquo;{agent.personality.evolutionStyle}&rdquo;
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

