'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, UserPlus, Brain, Check, RefreshCw, Layers } from 'lucide-react';
import { Agent, AgentRole } from '@/types/debate';

interface AddSpecialistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSpecialist: (agentData: Omit<Agent, 'id'>) => void;
}

interface SpecialistTemplate {
  name: string;
  roleTitle: string;
  category: AgentRole;
  avatar: string;
  accentColor: string;
  badgeColor: string;
  model: string;
  stanceDescription: string;
  traits: string[];
  temperament: string;
  corePhilosophy: string;
}

const PRESET_TEMPLATES: SpecialistTemplate[] = [
  {
    name: 'Dra. Clara Silveira',
    roleTitle: 'Neurocientista Cognitiva & Epigenética',
    category: 'cientista',
    avatar: '🧠',
    accentColor: '#06b6d4',
    badgeColor: 'bg-cyan-950/70 text-cyan-300 border-cyan-800/60',
    model: 'meta-llama/llama-3.3-70b-instruct:free',
    stanceDescription: 'Defende que a mente emerge estritamente de processos biológicos e neuronais celulares.',
    traits: ['Empirismo Biológico', 'Ceticismo Neurocognitivo'],
    temperament: 'Meticulosa e focada em evidências fisiológicas replicáveis.',
    corePhilosophy: 'A consciência humana é um fenómeno biológico ancorado na termodinâmica celular; sem substrato físico mensurável, não há cognição real.',
  },
  {
    name: 'Prof. Vasco Pinto',
    roleTitle: 'Economista Comportamental & Teoria de Jogos',
    category: 'economista',
    avatar: '📊',
    accentColor: '#10b981',
    badgeColor: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60',
    model: 'qwen/qwen-2.5-72b-instruct:free',
    stanceDescription: 'Analisa decisões sob a perspetiva de incentivos, custos de oportunidade e equilíbrios de Nash.',
    traits: ['Pragmatismo de Mercado', 'Análise de Incentivos'],
    temperament: 'Racional e perspicaz na identificação de externalidades ocultas.',
    corePhilosophy: 'Toda a ação humana responde a incentivos estruturais e custos de oportunidade; ignorar as leis económicas conduz invariavelmente ao colapso prático.',
  },
  {
    name: 'Dra. Matilde Fontes',
    roleTitle: 'Jurista Constitucional & Bioeticista',
    category: 'humanista',
    avatar: '🛡️',
    accentColor: '#8b5cf6',
    badgeColor: 'bg-purple-950/70 text-purple-300 border-purple-800/60',
    model: 'mistralai/mistral-small-24b-instruct-2501:free',
    stanceDescription: 'Examina a legalidade, direitos fundamentais inalienáveis e salvaguardas cívicas.',
    traits: ['Garantismo Jurídico', 'Vigilância Bioética'],
    temperament: 'Firme, protetora do Estado de Direito e atenta a abusos de poder.',
    corePhilosophy: 'O progresso tecnológico nunca pode suplantar a dignidade e os direitos fundamentais do indivíduo.',
  },
  {
    name: 'Dr. Tiago Lins',
    roleTitle: 'Astrofísico & Termodinâmica Teórica',
    category: 'cientista',
    avatar: '🌌',
    accentColor: '#3b82f6',
    badgeColor: 'bg-blue-950/70 text-blue-300 border-blue-800/60',
    model: 'google/gemini-2.0-flash-exp:free',
    stanceDescription: 'Situa qualquer dilema nas escalas cósmicas de tempo, entropia e conservação de energia.',
    traits: ['Perspetiva Cósmica', 'Rigor Entrópico'],
    temperament: 'Sereno, contemplativo e rigoroso na física fundamental.',
    corePhilosophy: 'As leis da termodinâmica e da gravitação são o limite final de qualquer civilização; o universo não negocia com desejos humanos.',
  },
];

const AVATAR_OPTIONS = ['🧠', '📊', '🛡️', '🌌', '🧬', '💻', '🧭', '⚖️', '🔬', '🏛️', '🌱', '⚡', '🎭', '📚', '🔍', '💡', '🌐'];

const COLOR_OPTIONS = [
  { hex: '#06b6d4', name: 'Ciano', badge: 'bg-cyan-950/70 text-cyan-300 border-cyan-800/60' },
  { hex: '#8b5cf6', name: 'Roxo', badge: 'bg-purple-950/70 text-purple-300 border-purple-800/60' },
  { hex: '#10b981', name: 'Esmeralda', badge: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60' },
  { hex: '#f59e0b', name: 'Âmbar', badge: 'bg-amber-950/70 text-amber-300 border-amber-800/60' },
  { hex: '#3b82f6', name: 'Azul', badge: 'bg-blue-950/70 text-blue-300 border-blue-800/60' },
  { hex: '#ec4899', name: 'Rosa', badge: 'bg-pink-950/70 text-pink-300 border-pink-800/60' },
  { hex: '#ef4444', name: 'Vermelho', badge: 'bg-rose-950/70 text-rose-300 border-rose-800/60' },
];

const ROLE_OPTIONS: { id: AgentRole; label: string; icon: string }[] = [
  { id: 'cientista', label: 'Cientista', icon: '🔬' },
  { id: 'filosofo', label: 'Filósofo', icon: '🏛️' },
  { id: 'humanista', label: 'Humanista', icon: '🌱' },
  { id: 'tecnologo', label: 'Tecnólogo', icon: '⚡' },
  { id: 'economista', label: 'Economista', icon: '📊' },
  { id: 'psicologo', label: 'Psicólogo', icon: '🧠' },
  { id: 'moderador', label: 'Estrategista', icon: '⚖️' },
  { id: 'personalizado', label: 'Personalizado', icon: '✨' },
];

const RECOMMENDED_MODELS = [
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Meta) [Gratuito]' },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (Google) [Gratuito]' },
  { id: 'qwen/qwen-2.5-72b-instruct:free', name: 'Qwen 2.5 72B (Alibaba) [Gratuito]' },
  { id: 'mistralai/mistral-small-24b-instruct-2501:free', name: 'Mistral Small 24B (Mistral) [Gratuito]' },
];

export const AddSpecialistModal: React.FC<AddSpecialistModalProps> = ({
  isOpen,
  onClose,
  onAddSpecialist,
}) => {
  const [name, setName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [category, setCategory] = useState<AgentRole>('cientista');
  const [avatar, setAvatar] = useState('🧠');
  const [accentColor, setAccentColor] = useState('#06b6d4');
  const [badgeColor, setBadgeColor] = useState('bg-cyan-950/70 text-cyan-300 border-cyan-800/60');
  const [trait, setTrait] = useState('Rigor Metodológico');
  const [corePhilosophy, setCorePhilosophy] = useState('');
  const [model, setModel] = useState('meta-llama/llama-3.3-70b-instruct:free');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleApplyTemplate = (tmpl: SpecialistTemplate) => {
    setName(tmpl.name);
    setRoleTitle(tmpl.roleTitle);
    setCategory(tmpl.category);
    setAvatar(tmpl.avatar);
    setAccentColor(tmpl.accentColor);
    setBadgeColor(tmpl.badgeColor);
    setTrait(tmpl.traits[0] || 'Análise Crítica');
    setCorePhilosophy(tmpl.corePhilosophy);
    setModel(tmpl.model);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !roleTitle.trim()) return;

    const newSpecialist: Omit<Agent, 'id'> = {
      name: name.trim(),
      roleTitle: roleTitle.trim(),
      category,
      avatar,
      accentColor,
      badgeColor,
      model,
      provider: 'openrouter',
      stanceDescription: corePhilosophy.trim() || `Especialista em ${roleTitle.trim()}.`,
      systemPrompt: `És ${name.trim()}, ${roleTitle.trim()}.
FILOSOFIA CENTRAL: ${corePhilosophy.trim() || 'Abordas o debate com rigor e perspetiva analítica própria.'}
TRAÇO DOMINANTE: ${trait.trim()}
REGRAS EPISTEMOLÓGICAS:
- Defende a tua visão com convicção e clareza conceptual.
- Responde diretamente ao orador anterior citando o seu nome.
- Escreve EXCLUSIVAMENTE em Português de Portugal (PT-PT).
- Mantém intervenções concisas, afiadas e dialéticas (60 a 90 palavras).`,
      personality: {
        traits: [trait.trim() || 'Analítico'],
        temperament: `Focado na perspetiva de ${roleTitle.trim()}`,
        reactionTrigger: 'Inconsistências lógicas ou falta de fundamentação',
        evolutionStyle: 'Amadurece as suas teses quando confrontado com argumentos sólidos',
        dialogueHabits: 'Interpelação direta e rigor conceptual',
      },
      memory: {
        corePhilosophy: corePhilosophy.trim() || `Princípios essenciais de ${roleTitle.trim()}`,
        cumulativeLearnings: [],
        knownColleagues: {},
        pastMemories: [],
        structuredEntries: [
          {
            id: 'mem-init-' + Date.now(),
            category: 'confirmed_facts',
            content: `Especialista em ${roleTitle.trim()}; fundamenta a sua visão em ${trait.trim()}.`,
            source: 'Criação do Especialista',
            confidence: 'confirmada',
            status: 'confirmado',
            date: new Date().toLocaleDateString('pt-PT'),
            timestamp: Date.now(),
          },
        ],
      },
    };

    onAddSpecialist(newSpecialist);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] max-h-[92dvh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-700/60 flex items-center justify-center text-indigo-400 flex-shrink-0">
              <UserPlus className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                Adicionar Novo Especialista ao Conselho
              </h3>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                Cria um pensador de raiz ou escolhe um modelo rápido de 1 clique
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex-shrink-0"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo com Scroll */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-5 space-y-5">
          {/* Predefinições Rápidas (1 Clique) */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Modelos Rápidos Pré-configurados (1 Clique)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl)}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950/60 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-600/50 text-left transition-all group"
                >
                  <span className="text-2xl p-1.5 rounded-lg bg-slate-900 border border-slate-800 group-hover:border-indigo-500/50 transition-colors">
                    {tmpl.avatar}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-white truncate group-hover:text-indigo-300">
                      {tmpl.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {tmpl.roleTitle}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-4" />

          {/* Formulário Personalizado */}
          <form id="add-specialist-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Nome */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">
                  Nome do Especialista *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Dra. Clara Silveira"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Cargo / Área de Especialização */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">
                  Cargo / Especialidade *
                </label>
                <input
                  type="text"
                  required
                  value={roleTitle}
                  onChange={e => setRoleTitle(e.target.value)}
                  placeholder="Ex: Neurocientista Cognitiva"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Arquétipo / Categoria */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300">
                Arquétipo Dialético
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {ROLE_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setCategory(opt.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      category === opt.id
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <span>{opt.icon}</span>
                    <span className="truncate">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Avatar & Cor de Destaque */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Seletor de Avatar / Emoji */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300">
                  Avatar (Ícone / Emoji)
                </label>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl flex-shrink-0">
                    {avatar}
                  </div>
                  <div className="flex overflow-x-auto gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800/80 flex-1 scrollbar-none">
                    {AVATAR_OPTIONS.map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatar(av)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all flex-shrink-0 ${
                          avatar === av ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Seletor de Cor de Destaque */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300">
                  Cor de Destaque
                </label>
                <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800/80 h-10 px-2">
                  {COLOR_OPTIONS.map((col, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setAccentColor(col.hex);
                        setBadgeColor(col.badge);
                      }}
                      className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center"
                      style={{
                        backgroundColor: col.hex,
                        borderColor: accentColor === col.hex ? '#ffffff' : 'transparent',
                      }}
                      title={col.name}
                    >
                      {accentColor === col.hex && <Check className="w-3 h-3 text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Traço Dominante */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">
                Traço Psicológico Dominante
              </label>
              <input
                type="text"
                value={trait}
                onChange={e => setTrait(e.target.value)}
                placeholder="Ex: Ceticismo Empírico, Racionalismo Estratégico, etc."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Filosofia Nuclear Inegociável */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">
                Filosofia Nuclear Inegociável
              </label>
              <textarea
                rows={2}
                value={corePhilosophy}
                onChange={e => setCorePhilosophy(e.target.value)}
                placeholder="Ex: O progresso técnico não tem valor se enfraquecer os laços comunitários ou os direitos fundamentais."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none resize-none"
              />
            </div>

            {/* Modelo de IA Associado */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300">
                Motor de IA do Especialista (OpenRouter)
              </label>
              <select
                value={model}
                onChange={e => setModel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-indigo-500 focus:outline-none cursor-pointer"
              >
                {RECOMMENDED_MODELS.map(m => (
                  <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </div>

        {/* Rodapé com Ações */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-end gap-2.5 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="add-specialist-form"
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/30 hover:scale-[1.02]"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Adicionar Especialista ao Conselho</span>
          </button>
        </div>
      </div>
    </div>
  );
};
