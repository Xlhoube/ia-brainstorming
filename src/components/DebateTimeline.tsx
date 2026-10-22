'use client';

import React, { useEffect, useRef } from 'react';
import { Agent, DebateMessage, DebateStage } from '@/types/debate';
import { Copy, Check, Volume2, User, Brain, Sparkles, CheckCircle2, ChevronRight, Layers } from 'lucide-react';
import { cleanAgentResponsePrefix } from '@/lib/ai/openrouter';

interface DebateTimelineProps {
  messages: DebateMessage[];
  agents?: Agent[];
  topic: string;
  topicDescription: string;
  isGenerating: boolean;
  activeSpeakerName?: string;
  canonicalStages?: DebateStage[];
  currentStageIndex?: number;
  onSelectStage?: (idx: number) => void;
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
  canonicalStages,
  currentStageIndex = 0,
  onSelectStage,
  onOpenTopics,
  onSpeakMessage,
  onQuickSpeak,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  useEffect(() => {
    if (messages.length > 0 || isGenerating) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
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

        {/* Stepper Visual das 5 Etapas Canónicas (The Five Protocol) */}
        {canonicalStages && canonicalStages.length > 0 && (
          <div className="rounded-xl sm:rounded-2xl bg-slate-900/70 border border-slate-800/80 p-3 sm:p-4 backdrop-blur-sm shadow-lg">
            <div className="flex items-center justify-between mb-2 sm:mb-2.5">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Protocolo Canónico em 5 Etapas</span>
              </span>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/40">
                Etapa {currentStageIndex + 1} de {canonicalStages.length}
              </span>
            </div>

            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2">
              {canonicalStages.map((stage, idx) => {
                const isCurrent = idx === currentStageIndex;
                const isPassed = idx < currentStageIndex;

                return (
                  <button
                    key={stage.id}
                    onClick={() => onSelectStage && onSelectStage(idx)}
                    disabled={!onSelectStage}
                    className={`relative flex flex-col items-start p-2 sm:p-2.5 rounded-xl border text-left transition-all ${
                      isCurrent
                        ? 'bg-indigo-950/80 border-indigo-500 shadow-md shadow-indigo-500/20 ring-1 ring-indigo-400'
                        : isPassed
                        ? 'bg-slate-900/90 border-emerald-900/60 text-slate-300 hover:border-emerald-700'
                        : 'bg-slate-950/40 border-slate-800/60 text-slate-500 opacity-60 hover:opacity-90'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                          isCurrent
                            ? 'bg-indigo-500 text-white'
                            : isPassed
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        0{idx + 1}
                      </span>
                      {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      {isCurrent && (
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                      )}
                    </div>
                    <span className="text-[11px] sm:text-xs font-semibold text-white truncate w-full">
                      {stage.name}
                    </span>
                    <span className="text-[9px] text-slate-400 line-clamp-1 mt-0.5 hidden xs:block">
                      {stage.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Mensagens do Debate */}
        {messages.length === 0 ? (
          <div className="text-center py-1 sm:py-3 px-2 sm:px-4 space-y-2.5 sm:space-y-3.5">
            {/* Banner Cinemático do Painel de Especialistas */}
            <div className="relative max-w-2xl mx-auto rounded-xl sm:rounded-2xl overflow-hidden border border-slate-800/90 shadow-2xl bg-slate-950 flex flex-col items-center">
              <div className="w-full flex items-center justify-center p-2 bg-slate-950">
                <img
                  src="/avatars/painel_especialistas.png"
                  alt="Painel de Especialistas da Mesa Redonda"
                  className="w-full h-auto object-contain mx-auto"
                />
              </div>
              <div className="w-full p-2 sm:p-2.5 bg-slate-950/90 text-left border-t border-slate-800/80">
                <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight">
                  Mesa Redonda Pronta para Diálogo
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Os 5 pensadores aguardam a tua pergunta ou saudação. Fala pelo campo abaixo ou usa as sugestões rápidas:
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
                  onClick={() => onQuickSpeak(`Qual é, na vossa opinião, o principal dilema ou desacordo sobre "${topic}"?`)}
                  className="px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-indigo-950/60 border border-slate-700/70 hover:border-indigo-500/60 text-[11px] sm:text-xs text-indigo-300 font-medium transition-all shadow-sm hover:scale-[1.03]"
                >
                  💬 &ldquo;Qual é o vosso principal desacordo?&rdquo;
                </button>
                <button
                  onClick={() => onQuickSpeak(`Como podemos equilibrar os riscos e as oportunidades reais de "${topic}"?`)}
                  className="px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-indigo-950/60 border border-slate-700/70 hover:border-indigo-500/60 text-[11px] sm:text-xs text-indigo-300 font-medium transition-all shadow-sm hover:scale-[1.03]"
                >
                  ⚖️ &ldquo;Como equilibrar riscos e benefícios?&rdquo;
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

                          {/* Distintivo de Etapa Canónica (The Five) */}
                          {msg.stageName && (
                            <span
                              className="text-[8px] sm:text-[9px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full bg-indigo-950/70 text-indigo-300 border border-indigo-700/60 flex items-center gap-1 shadow-sm"
                              title={`Etapa do Protocolo Canónico: ${msg.stageName}`}
                            >
                              <span>🧭</span>
                              <span>{msg.stageName}</span>
                            </span>
                          )}

                          {/* Distintivo de Origem da Intervenção: Motor Local Inteligente ou IA Remota */}
                          {!isHuman && (
                            msg.isSimulated ? (
                              <span
                                className="text-[8px] sm:text-[9px] font-medium px-1.5 sm:px-2 py-0.5 rounded-full bg-amber-950/40 text-amber-300 border border-amber-500/30 flex items-center gap-1 shadow-sm cursor-help"
                                title="Gerado pelo Motor Dialético Local Dinâmico (contextualizado por tema, réplica ao orador e memória do especialista)."
                              >
                                <span>⚙️</span>
                                <span>Motor Dialético Local</span>
                              </span>
                            ) : msg.modelUsed ? (
                              <span
                                className="text-[8px] sm:text-[9px] font-medium px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-950/50 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 shadow-sm cursor-help"
                                title={`Gerado pela IA Remota OpenRouter (${msg.modelUsed})`}
                              >
                                <span>⚡</span>
                                <span className="truncate max-w-[120px]">{msg.modelUsed.split('/')[1] || msg.modelUsed}</span>
                              </span>
                            ) : null
                          )}
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

                  {/* Distintivo de Conclusão Dialética Emergente */}
                  {msg.dialecticalConclusion && (
                    <div
                      className={`mb-2.5 sm:mb-3 px-3 py-1.5 rounded-xl border text-[11px] sm:text-xs font-semibold flex items-center gap-2 shadow-md ${
                        msg.dialecticalConclusion === 'sintese'
                          ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 shadow-emerald-950/30'
                          : msg.dialecticalConclusion === 'consenso'
                          ? 'bg-blue-950/60 border-blue-500/50 text-blue-300 shadow-blue-950/30'
                          : 'bg-amber-950/60 border-amber-500/50 text-amber-300 shadow-amber-950/30'
                      }`}
                    >
                      <span className="text-sm">
                        {msg.dialecticalConclusion === 'sintese' ? '⚖️' : msg.dialecticalConclusion === 'consenso' ? '🤝' : '⚡'}
                      </span>
                      <span>
                        {msg.dialecticalConclusion === 'sintese'
                          ? 'Síntese Dialética Declarada pelo Orador'
                          : msg.dialecticalConclusion === 'consenso'
                          ? 'Consenso Emergente Declarado pelo Orador'
                          : 'Aporia / Divergência Irreconciliável Declarada'}
                      </span>
                    </div>
                  )}

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
