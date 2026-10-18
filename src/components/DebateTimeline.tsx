'use client';

import React, { useEffect, useRef } from 'react';
import { Agent, DebateMessage } from '@/types/debate';
import { Copy, Check, Volume2, User, Brain, Sparkles } from 'lucide-react';
import { cleanAgentResponsePrefix } from '@/lib/ai/openrouter';

interface DebateTimelineProps {
  messages: DebateMessage[];
  agents?: Agent[];
  topic: string;
  topicDescription: string;
  isGenerating: boolean;
  activeSpeakerName?: string;
  onOpenTopics: () => void;
  onSpeakMessage?: (agentId: string, text: string) => void;
  onQuickSpeak?: (text: string) => void;
}

export const DebateTimeline: React.FC<DebateTimelineProps> = ({
  messages,
  agents,
  topic,
  topicDescription,
  isGenerating,
  activeSpeakerName,
  onOpenTopics,
  onSpeakMessage,
  onQuickSpeak,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-6">
      <div className="max-w-4xl mx-auto w-full space-y-4 sm:space-y-6">
        {/* Banner do Tópico Ativo */}
        <div className="relative rounded-xl sm:rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 p-3.5 sm:p-5 shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-1.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Tema Central em Análise
                </span>
              </div>
              <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white tracking-tight leading-snug">
                {topic}
              </h2>
              {topicDescription && (
                <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed max-w-2xl line-clamp-2 sm:line-clamp-none">
                  {topicDescription}
                </p>
              )}
            </div>
            <button
              onClick={onOpenTopics}
              className="flex-shrink-0 text-[11px] sm:text-xs text-indigo-400 hover:text-indigo-300 font-medium px-2 sm:px-2.5 py-1 rounded-lg bg-indigo-950/30 hover:bg-indigo-950/50 border border-indigo-800/40 transition-colors"
            >
              Mudar Tema
            </button>
          </div>
        </div>

        {/* Mensagens do Debate */}
        {messages.length === 0 ? (
          <div className="text-center py-4 sm:py-8 px-2 sm:px-4 space-y-4 sm:space-y-6">
            {/* Banner Cinemático do Painel de Especialistas */}
            <div className="relative max-w-2xl mx-auto rounded-xl sm:rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950 group">
              <div className="relative aspect-[16/6] w-full overflow-hidden">
                <img
                  src="/avatars/painel_especialistas_banner.png"
                  alt="Painel de Especialistas da Mesa Redonda"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-95"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-slate-950/80 border border-slate-700/60 text-[9px] sm:text-[10px] text-indigo-300 font-semibold backdrop-blur-sm">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Painel de Especialistas Convocado</span>
                </div>
              </div>
              <div className="p-3 sm:p-4 bg-slate-950/90 text-left border-t border-slate-800/80">
                <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  Mesa Redonda Pronta para Diálogo
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-1 leading-relaxed">
                  Os 5 especialistas aguardam a tua questão ou uma saudação direta. Podes falar pelo campo inferior ou usar uma das saudações abaixo:
                </p>
              </div>
            </div>

            {onQuickSpeak && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 pt-1">
                <button
                  onClick={() => onQuickSpeak('Boa noite a todos!')}
                  className="px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-indigo-950/60 border border-slate-700/70 hover:border-indigo-500/60 text-[11px] sm:text-xs text-indigo-300 font-medium transition-all shadow-sm hover:scale-[1.03]"
                >
                  👋 &ldquo;Boa noite a todos!&rdquo;
                </button>
                <button
                  onClick={() => onQuickSpeak('O que acham que vai acontecer com o futuro do trabalho e da inteligência artificial?')}
                  className="px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-indigo-950/60 border border-slate-700/70 hover:border-indigo-500/60 text-[11px] sm:text-xs text-indigo-300 font-medium transition-all shadow-sm hover:scale-[1.03]"
                >
                  💬 &ldquo;O que acham do futuro do trabalho?&rdquo;
                </button>
                <button
                  onClick={() => onQuickSpeak('Será que uma máquina consegue ter sentimentos reais e consciência?')}
                  className="px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-indigo-950/60 border border-slate-700/70 hover:border-indigo-500/60 text-[11px] sm:text-xs text-indigo-300 font-medium transition-all shadow-sm hover:scale-[1.03]"
                >
                  🤖 &ldquo;As máquinas conseguem sentir?&rdquo;
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {messages.map((msg, index) => {
              const isHuman = msg.isHuman;

              return (
                <article
                  key={msg.id}
                  className={`group relative rounded-xl sm:rounded-2xl p-3.5 sm:p-5 transition-all duration-200 border ${
                    isHuman
                      ? 'bg-blue-950/30 border-blue-800/60 shadow-lg shadow-blue-500/5'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700/80 shadow-md backdrop-blur-sm'
                  }`}
                >
                  {/* Cabeçalho da Mensagem */}
                  <div className="flex items-start justify-between gap-2.5 sm:gap-3 mb-2.5 sm:mb-3">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div
                        className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center text-lg sm:text-xl shadow-md border overflow-hidden flex-shrink-0"
                        style={{
                          backgroundColor: isHuman ? '#1e3a8a' : '#0f172a',
                          borderColor: msg.accentColor || '#3b82f6',
                        }}
                      >
                        {isHuman ? (
                          <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-200" />
                        ) : msg.image ? (
                          <img
                            src={msg.image}
                            alt={msg.agentName}
                            className="w-full h-full object-cover"
                            onError={e => {
                              // Se falhar o carregamento, oculta a imagem e deixa o avatar de fallback
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <span>{msg.avatar}</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
                            {msg.agentName}
                          </h4>
                          <span
                            className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full border truncate"
                            style={{
                              backgroundColor: `${msg.accentColor}15`,
                              borderColor: `${msg.accentColor}40`,
                              color: msg.accentColor || '#93c5fd',
                            }}
                          >
                            {msg.agentRole}
                          </span>

                          {/* Tag de Personalidade Psicológica do Especialista */}
                          {!isHuman && (() => {
                            const speakerAgent = agents?.find(
                              a => a.id === msg.agentId || a.name.toLowerCase() === msg.agentName.toLowerCase()
                            );
                            if (!speakerAgent?.personality) return null;
                            return (
                              <span
                                className="text-[8px] sm:text-[9px] font-medium px-1.5 sm:px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/60 flex items-center gap-1 cursor-help hover:border-indigo-500/50 transition-colors"
                                title={`Temperamento: ${speakerAgent.personality.temperament}\nComo evolui: ${speakerAgent.personality.evolutionStyle}`}
                              >
                                <span>🎭</span>
                                <span>{speakerAgent.personality.traits[0]}</span>
                              </span>
                            );
                          })()}
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
                          {isHuman ? 'Intervenção Humana' : `Intervenção #${index + 1}`} • {msg.timestamp}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                      {onSpeakMessage && !isHuman && (
                        <button
                          onClick={() => onSpeakMessage(msg.agentId, cleanAgentResponsePrefix(msg.content, msg.agentName))}
                          className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800"
                          title="Ouvir novamente esta intervenção"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleCopy(msg.id, cleanAgentResponsePrefix(msg.content, msg.agentName))}
                        className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-1 sm:p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                        title="Copiar citação"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Conteúdo com Formatação Limpa de Parágrafos (Sem prefixos de identificação) */}
                  <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2 sm:space-y-2.5 font-normal">
                    {cleanAgentResponsePrefix(msg.content, msg.agentName).split('\n\n').map((paragraph, pIdx) => (
                      <p key={pIdx}>{paragraph}</p>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Indicador de que um agente está a formular resposta */}
        {isGenerating && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-950/20 border border-indigo-800/40 backdrop-blur-sm animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-indigo-900/60 flex items-center justify-center text-sm">
              <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
            </div>
            <div className="text-xs">
              <p className="font-semibold text-indigo-200">
                {activeSpeakerName || 'Agente'} a elaborar intervenção...
              </p>
              <p className="text-[11px] text-slate-400">
                A articular argumentos dialéticos contra as premissas anteriores.
              </p>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};
