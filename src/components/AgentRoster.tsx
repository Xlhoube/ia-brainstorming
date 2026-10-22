'use client';

import React, { useState } from 'react';
import { Agent, StructuredMemoryCategory, StructuredMemoryItem } from '@/types/debate';
import { Check, Volume2, Users, X, Sparkles, Brain, Plus, BookmarkCheck, Trash2, Tag, ShieldCheck } from 'lucide-react';

interface AgentRosterProps {
  agents: Agent[];
  selectedIds: string[];
  activeSpeakerId: string | null;
  onToggleAgent: (id: string) => void;
  isDebating: boolean;
  onAddAgentLearning?: (agentId: string, insight: string) => void;
  onAddStructuredMemory?: (agentId: string, item: Omit<StructuredMemoryItem, 'id' | 'timestamp'>) => void;
  onDeleteStructuredMemory?: (agentId: string, entryId: string) => void;
}

export const AgentRoster: React.FC<AgentRosterProps> = ({
  agents,
  selectedIds,
  activeSpeakerId,
  onToggleAgent,
  isDebating,
  onAddAgentLearning,
  onAddStructuredMemory,
  onDeleteStructuredMemory,
}) => {
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'profile' | 'memory'>('profile');
  const [newLearningInputs, setNewLearningInputs] = useState<Record<string, string>>({});
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [newStructuredInputs, setNewStructuredInputs] = useState<
    Record<string, { content: string; category: StructuredMemoryCategory }>
  >({});

  const handleImageError = (agentId: string) => {
    setFailedImages(prev => ({ ...prev, [agentId]: true }));
  };

  const handleAddLearning = (agentId: string) => {
    const text = newLearningInputs[agentId]?.trim();
    if (!text || !onAddAgentLearning) return;
    onAddAgentLearning(agentId, text);
    setNewLearningInputs(prev => ({ ...prev, [agentId]: '' }));
  };

  const handleAddStructuredMemory = (agentId: string) => {
    const current = newStructuredInputs[agentId];
    if (!current || !current.content.trim() || !onAddStructuredMemory) return;
    onAddStructuredMemory(agentId, {
      category: current.category || 'lessons_learned',
      content: current.content.trim(),
    });
    setNewStructuredInputs(prev => ({
      ...prev,
      [agentId]: { content: '', category: current.category || 'lessons_learned' },
    }));
  };

  return (
    <>
      <div className="w-full bg-slate-950/70 border-y border-slate-800/60 py-2 sm:py-3 px-3 sm:px-6 lg:px-8 backdrop-blur-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-2 sm:mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                Mesa Redonda ({selectedIds.length}/{agents.length} ativos)
              </span>
              <span className="text-[10px] text-slate-500 hidden md:inline">
                • Clica num especialista para ligar ou desligar a sua presença
              </span>
            </div>

            {/* Botão de Destaque: Painel de Especialistas */}
            <button
              onClick={() => setShowTeamModal(true)}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-700/40 hover:border-indigo-500/60 text-[10px] sm:text-[11px] text-indigo-300 font-medium transition-all duration-200 shadow-sm hover:scale-[1.02]"
              title="Ver o perfil psicológico e a memória dos pensadores"
            >
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden xs:inline">Painel & Memória</span>
              <span className="inline xs:hidden">Painel</span>
              <Sparkles className="w-3 h-3 text-amber-400" />
            </button>
          </div>

          {/* Grelha / Lista de Agentes: Carrossel Horizontal em Mobile e Grelha em Tablet/Desktop */}
          <div className="flex overflow-x-auto pb-1 sm:pb-0 sm:grid sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-2.5 scrollbar-none snap-x">
            {agents.map(agent => {
              const isSelected = selectedIds.includes(agent.id);
              const isSpeaking = activeSpeakerId === agent.id;
              const hasImage = Boolean(agent.image && !failedImages[agent.id]);

              return (
                <button
                  key={agent.id}
                  onClick={() => onToggleAgent(agent.id)}
                  disabled={isDebating}
                  className={`group relative flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-xl border text-left transition-all duration-300 flex-shrink-0 w-[170px] sm:w-auto snap-start ${
                    isSpeaking
                      ? 'bg-indigo-950/50 border-indigo-500 ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-500/25 scale-[1.02]'
                      : isSelected
                      ? 'bg-slate-900/80 border-slate-700/70 hover:border-slate-600 hover:bg-slate-900'
                      : 'bg-slate-950/40 border-slate-800/40 opacity-40 hover:opacity-75'
                  }`}
                >
                  {/* Avatar com Imagem ou Fallback de Emoji */}
                  <div className="relative flex-shrink-0 w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-700/60 shadow-md">
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
                      <span className="text-lg sm:text-xl">{agent.avatar}</span>
                    )}

                    {/* Indicador de Fala */}
                    {isSpeaking && (
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md ring-1 ring-white/20">
                        <Volume2 className="w-2 sm:w-2.5 h-2 sm:h-2.5 animate-pulse" />
                      </span>
                    )}
                  </div>

                  {/* Informações do Agente */}
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] sm:text-xs font-semibold text-slate-200 truncate">
                      {agent.name}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-slate-400 truncate">
                      {agent.roleTitle}
                    </p>
                    {/* Badge de Temperamento & Memória */}
                    <div className="mt-0.5 flex items-center gap-1 flex-wrap">
                      {agent.personality && (
                        <span className="text-[8px] sm:text-[9px] font-medium px-1 sm:px-1.5 py-0.2 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 truncate max-w-[95px]">
                          🎭 {agent.personality.traits[0]}
                        </span>
                      )}
                      {agent.memory && (
                        <span
                          className="text-[8px] sm:text-[9px] font-medium px-1 sm:px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40 flex items-center gap-0.5"
                          title={`${agent.memory.pastMemories.length} debates passados arquivados`}
                        >
                          🧠 {agent.memory.pastMemories.length}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Animação de Onda Sonora quando está a falar */}
                  {isSpeaking && (
                    <div className="absolute right-1.5 sm:right-2 top-1.5 sm:top-2 flex items-end gap-0.5 h-2.5 sm:h-3">
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

      {/* Modal do Painel Cinemático de Especialistas com Personalidades e Memória */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl max-h-[92vh] max-h-[92dvh] bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            {/* Cabeçalho do Modal */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80 gap-3 flex-shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <Users className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                    Conselho de Pensadores • Psique & Memória Cognitiva
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                    Perfis psicológicos, histórico acumulado de debates e evolução de opiniões
                  </p>
                </div>
              </div>

              {/* Seletor de Separador: Psique vs Memória */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
                  <button
                    onClick={() => setActiveModalTab('profile')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      activeModalTab === 'profile'
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    🎭 Perfil & Psique
                  </button>
                  <button
                    onClick={() => setActiveModalTab('memory')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      activeModalTab === 'memory'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Brain className="w-3.5 h-3.5" />
                    <span>Memória Cognitiva</span>
                  </button>
                </div>

                <button
                  onClick={() => setShowTeamModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {/* Imagem Cinemática da Equipa */}
              <div className="relative w-full aspect-[16/6] bg-slate-950 overflow-hidden border-b border-slate-800">
                <img
                  src="/avatars/painel_especialistas_banner.png"
                  alt="Painel Cinemático de Especialistas em Equipa"
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-85" />
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-300">
                  <span className="bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-700/70 backdrop-blur-sm font-semibold text-[11px] sm:text-xs">
                    Conselho Estratégico de Inteligência Artificial
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-slate-400 bg-slate-950/70 px-2 py-0.5 rounded border border-slate-800 hidden xs:inline">
                    {activeModalTab === 'profile' ? '5 Psiques Dialéticas Complementares' : 'Memória e Raciocínio Contínuo'}
                  </span>
                </div>
              </div>

              {/* Conteúdo do Separador Selecionado */}
              {activeModalTab === 'profile' ? (
                /* Cartões Detalhados de Personalidade dos 5 Especialistas */
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
              ) : (
                /* Cartões Detalhados de Memória Cognitiva & Histórico */
                <div className="p-4 space-y-4 bg-slate-950/60">
                  {/* Barra de Filtros de Categoria de Memória */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                    <span className="text-[10px] uppercase font-bold text-slate-400 mr-1 flex items-center gap-1 shrink-0">
                      <Tag className="w-3 h-3 text-blue-400" />
                      <span>Filtrar:</span>
                    </span>
                    {[
                      { id: 'all', label: 'Todas as Memórias' },
                      { id: 'ethical_red_lines', label: '🛑 Linhas Vermelhas' },
                      { id: 'intellectual_doubts', label: '❓ Dúvidas Intelectuais' },
                      { id: 'lessons_learned', label: '💡 Lições Aprendidas' },
                      { id: 'confirmed_facts', label: '📊 Factos Confirmados' },
                      { id: 'decisions', label: '⚖️ Decisões' },
                      { id: 'open_hypotheses', label: '🔬 Hipóteses Abertas' },
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setCategoryFilter(f.id)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all shrink-0 ${
                          categoryFilter === f.id
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {agents.map(agent => (
                    <div
                      key={agent.id}
                      className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors shadow-md"
                    >
                      <div className="space-y-3.5">
                        {/* Cabeçalho do Agente */}
                        <div className="flex items-center gap-3">
                          <img
                            src={agent.image}
                            alt={agent.name}
                            className="w-11 h-11 rounded-xl object-cover border border-slate-700 shadow-md flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">
                              {agent.name}
                            </p>
                            <p className="text-xs text-emerald-400 font-medium">
                              {agent.roleTitle}
                            </p>
                          </div>
                        </div>

                        {agent.memory && (
                          <div className="space-y-3 text-xs">
                            {/* Filosofia Nuclear */}
                            <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-800/40 text-amber-200">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                                🏛️ Filosofia Nuclear Inegociável
                              </span>
                              <p className="text-[11px] leading-relaxed italic">
                                &ldquo;{agent.memory.corePhilosophy}&rdquo;
                              </p>
                            </div>

                            {/* O que pensa dos colegas */}
                            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                                👥 O que Pensa Pessoalmente dos Colegas
                              </span>
                              <div className="space-y-1.5">
                                {Object.entries(agent.memory.knownColleagues).map(([colleague, opinion], oIdx) => (
                                  <div key={oIdx} className="text-[11px] text-slate-300 pl-2 border-l-2 border-indigo-500/40">
                                    <strong className="text-indigo-300">{colleague}:</strong> {opinion}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Memória Estruturada Canónica (The Five Protocol) */}
                            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                                  <span>Memória Estruturada Canónica</span>
                                </span>
                                <span className="text-blue-400 font-mono text-[9px]">
                                  {(agent.memory.structuredEntries || []).length} registos
                                </span>
                              </div>

                              {/* Lista de Registos Estruturados */}
                              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                {(!agent.memory.structuredEntries || agent.memory.structuredEntries.length === 0) ? (
                                  <p className="text-[10px] text-slate-500 italic">Nenhum registo estruturado ativo.</p>
                                ) : (
                                  agent.memory.structuredEntries
                                    .filter(item => categoryFilter === 'all' || item.category === categoryFilter)
                                    .map(item => {
                                      const categoryBadgeMap: Record<StructuredMemoryCategory, { label: string; color: string }> = {
                                        confirmed_facts: { label: 'Facto Confirmado', color: 'bg-blue-950/60 text-blue-300 border-blue-800/40' },
                                        explicit_preferences: { label: 'Preferência', color: 'bg-purple-950/60 text-purple-300 border-purple-800/40' },
                                        decisions: { label: 'Decisão', color: 'bg-amber-950/60 text-amber-300 border-amber-800/40' },
                                        open_hypotheses: { label: 'Hipótese Aberta', color: 'bg-cyan-950/60 text-cyan-300 border-cyan-800/40' },
                                        lessons_learned: { label: 'Lição Aprendida', color: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40' },
                                        conversation_summaries: { label: 'Resumo', color: 'bg-slate-800 text-slate-300 border-slate-700' },
                                        ethical_red_lines: { label: '🛑 Linha Vermelha Ética', color: 'bg-rose-950/70 text-rose-300 border-rose-800/60' },
                                        intellectual_doubts: { label: '❓ Dúvida Intelectual', color: 'bg-violet-950/70 text-violet-300 border-violet-800/60' },
                                      };
                                      const badge = categoryBadgeMap[item.category] || { label: item.category, color: 'bg-slate-800 text-slate-300 border-slate-700' };

                                      return (
                                        <div
                                          key={item.id}
                                          className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] flex items-start justify-between gap-2 hover:border-slate-700 transition-colors"
                                        >
                                          <div className="space-y-1 min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                              <span className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold ${badge.color}`}>
                                                {badge.label}
                                              </span>
                                              {item.emotionalImpact && (
                                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800/80 text-amber-300 border border-slate-700/60 font-mono">
                                                  {item.emotionalImpact === 'decisivo' && '⚡ '}
                                                  {item.emotionalImpact === 'revelador' && '✨ '}
                                                  {item.emotionalImpact === 'inquietante' && '🌊 '}
                                                  {item.emotionalImpact}
                                                </span>
                                              )}
                                              {item.relatedColleague && (
                                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 font-mono">
                                                  com {item.relatedColleague}
                                                </span>
                                              )}
                                              <span className="text-[9px] text-slate-500 font-mono ml-auto">
                                                {new Date(item.timestamp).toLocaleDateString('pt-PT')}
                                              </span>
                                            </div>
                                            {item.topicContext && (
                                              <p className="text-[10px] text-slate-400 font-mono italic">
                                                Contexto: {item.topicContext}
                                              </p>
                                            )}
                                            <p className="text-slate-200 text-[11px] leading-relaxed break-words">
                                              {item.content}
                                            </p>
                                          </div>
                                          {onDeleteStructuredMemory && (
                                            <button
                                              onClick={() => onDeleteStructuredMemory(agent.id, item.id)}
                                              className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-slate-800 transition-colors shrink-0"
                                              title="Eliminar este registo de memória"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          )}
                                        </div>
                                      );
                                    })
                                )}
                              </div>

                              {/* Formulário para Adicionar Entrada de Memória Estruturada */}
                              {onAddStructuredMemory && (
                                <div className="pt-2 border-t border-slate-800/60 space-y-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <select
                                      value={newStructuredInputs[agent.id]?.category || 'lessons_learned'}
                                      onChange={e =>
                                        setNewStructuredInputs(prev => ({
                                          ...prev,
                                          [agent.id]: {
                                            content: prev[agent.id]?.content || '',
                                            category: e.target.value as StructuredMemoryCategory,
                                          },
                                        }))
                                      }
                                      className="h-7 px-2 rounded-md bg-slate-950 border border-slate-800 text-[10px] text-slate-300 focus:outline-none focus:border-blue-500"
                                    >
                                      <option value="lessons_learned">💡 Lição Aprendida</option>
                                      <option value="ethical_red_lines">🛑 Linha Vermelha Ética</option>
                                      <option value="intellectual_doubts">❓ Dúvida Intelectual</option>
                                      <option value="confirmed_facts">📊 Facto Confirmado</option>
                                      <option value="decisions">⚖️ Decisão</option>
                                      <option value="open_hypotheses">🔬 Hipótese Aberta</option>
                                      <option value="explicit_preferences">🎯 Preferência</option>
                                    </select>
                                    <input
                                      type="text"
                                      value={newStructuredInputs[agent.id]?.content || ''}
                                      onChange={e =>
                                        setNewStructuredInputs(prev => ({
                                          ...prev,
                                          [agent.id]: {
                                            category: prev[agent.id]?.category || 'lessons_learned',
                                            content: e.target.value,
                                          },
                                        }))
                                      }
                                      onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          handleAddStructuredMemory(agent.id);
                                        }
                                      }}
                                      placeholder="Novo registo para este agente..."
                                      className="flex-1 h-7 px-2 rounded-md bg-slate-950 border border-slate-800 text-[11px] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                                    />
                                    <button
                                      onClick={() => handleAddStructuredMemory(agent.id)}
                                      disabled={!newStructuredInputs[agent.id]?.content?.trim()}
                                      className="h-7 px-2.5 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-medium text-[10px] flex items-center gap-1 transition-all shrink-0"
                                    >
                                      <Plus className="w-3 h-3" />
                                      <span>Gravar</span>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Debates Passados Recordados */}
                            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                                <span>📚 Debates Anteriores na Memória</span>
                                <span className="text-emerald-400 font-mono text-[9px]">{agent.memory.pastMemories.length} registos</span>
                              </span>
                              <div className="space-y-1.5">
                                {agent.memory.pastMemories.map((entry, eIdx) => (
                                  <div key={eIdx} className="p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px]">
                                    <div className="flex items-center justify-between text-[10px] text-emerald-400 font-semibold mb-0.5">
                                      <span>Tema: {entry.topic}</span>
                                      <span className="text-slate-500 font-normal">{entry.date}</span>
                                    </div>
                                    <p className="text-slate-300 text-[11px]">{entry.stanceSummary}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Lições Acumuladas */}
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                                💡 Lições & Conclusões Acumuladas
                              </span>
                              <ul className="space-y-1">
                                {agent.memory.cumulativeLearnings.map((learning, lIdx) => (
                                  <li key={lIdx} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                                    <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                    <span>{learning}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Formulário Interativo: Ensinar Nova Lição ao Especialista */}
                      {onAddAgentLearning && (
                        <div className="pt-2 border-t border-slate-800">
                          <label className="text-[10px] font-semibold text-slate-400 block mb-1">
                            Ensinar nova lição a {agent.name}:
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={newLearningInputs[agent.id] || ''}
                              onChange={e => setNewLearningInputs({ ...newLearningInputs, [agent.id]: e.target.value })}
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddLearning(agent.id);
                                }
                              }}
                              placeholder="Ex: Não esquecer o impacto na saúde mental..."
                              className="flex-1 h-8 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                            />
                            <button
                              onClick={() => handleAddLearning(agent.id)}
                              disabled={!newLearningInputs[agent.id]?.trim()}
                              className="h-8 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-medium text-xs flex items-center gap-1 transition-all flex-shrink-0"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Ensinar</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

