'use client';

import React, { useEffect, useRef } from 'react';
import { DebateMessage } from '@/types/debate';
import { Copy, Check, Volume2, User, Brain, Sparkles } from 'lucide-react';

interface DebateTimelineProps {
  messages: DebateMessage[];
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
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto px-4 lg:px-8 py-6">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Banner do Tópico Ativo */}
        <div className="relative rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 p-5 shadow-xl backdrop-blur-sm overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Tema Central em Análise
                </span>
              </div>
              <h2 className="text-lg lg:text-xl font-bold text-white tracking-tight leading-snug">
                {topic}
              </h2>
              {topicDescription && (
                <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                  {topicDescription}
                </p>
              )}
            </div>
            <button
              onClick={onOpenTopics}
              className="flex-shrink-0 text-xs text-indigo-400 hover:text-indigo-300 font-medium px-2.5 py-1 rounded-lg bg-indigo-950/30 hover:bg-indigo-950/50 border border-indigo-800/40 transition-colors"
            >
              Mudar Tema
            </button>
          </div>
        </div>

        {/* Mensagens do Debate */}
        {messages.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-950/40 border border-indigo-800/40 flex items-center justify-center text-2xl text-indigo-400 shadow-lg">
              <Brain className="w-8 h-8 animate-pulse text-indigo-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-slate-200">
                A Mesa de Debate está Pronta
              </h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Fala diretamente para a sala através do campo inferior ou clica numa saudação rápida para os especialistas te acolherem e responderem em tempo real:
              </p>
            </div>

            {onQuickSpeak && (
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => onQuickSpeak('Boa noite a todos!')}
                  className="px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-indigo-950/60 border border-slate-700/70 hover:border-indigo-500/60 text-xs text-indigo-300 font-medium transition-all shadow-sm hover:scale-[1.03]"
                >
                  👋 &ldquo;Boa noite a todos!&rdquo;
                </button>
                <button
                  onClick={() => onQuickSpeak('O que acham que vai acontecer com o futuro do trabalho e da inteligência artificial?')}
                  className="px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-indigo-950/60 border border-slate-700/70 hover:border-indigo-500/60 text-xs text-indigo-300 font-medium transition-all shadow-sm hover:scale-[1.03]"
                >
                  💬 &ldquo;O que acham do futuro do trabalho?&rdquo;
                </button>
                <button
                  onClick={() => onQuickSpeak('Será que uma máquina consegue ter sentimentos reais e consciência?')}
                  className="px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-indigo-950/60 border border-slate-700/70 hover:border-indigo-500/60 text-xs text-indigo-300 font-medium transition-all shadow-sm hover:scale-[1.03]"
                >
                  🤖 &ldquo;As máquinas conseguem sentir?&rdquo;
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => {
              const isHuman = msg.isHuman;

              return (
                <article
                  key={msg.id}
                  className={`group relative rounded-2xl p-5 transition-all duration-200 border ${
                    isHuman
                      ? 'bg-blue-950/30 border-blue-800/60 shadow-lg shadow-blue-500/5'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700/80 shadow-md backdrop-blur-sm'
                  }`}
                >
                  {/* Cabeçalho da Mensagem */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md border"
                        style={{
                          backgroundColor: isHuman ? '#1e3a8a' : '#0f172a',
                          borderColor: msg.accentColor || '#3b82f6',
                        }}
                      >
                        {isHuman ? <User className="w-5 h-5 text-blue-200" /> : msg.avatar}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white tracking-tight">
                            {msg.agentName}
                          </h4>
                          <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                            style={{
                              backgroundColor: `${msg.accentColor}15`,
                              borderColor: `${msg.accentColor}40`,
                              color: msg.accentColor || '#93c5fd',
                            }}
                          >
                            {msg.agentRole}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {isHuman ? 'Intervenção Humana' : `Intervenção #${index + 1}`} • {msg.timestamp}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {onSpeakMessage && !isHuman && (
                        <button
                          onClick={() => onSpeakMessage(msg.agentId, msg.content)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800"
                          title="Ouvir novamente esta intervenção"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
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

                  {/* Conteúdo com Formatação Limpa de Parágrafos */}
                  <div className="text-xs sm:text-sm text-slate-300 leading-relaxed space-y-2.5 font-normal">
                    {msg.content.split('\n\n').map((paragraph, pIdx) => (
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
