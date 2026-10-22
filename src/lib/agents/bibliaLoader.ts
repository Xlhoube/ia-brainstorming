/**
 * Módulo de Carregamento e Validação da Bíblia de Personagens (The Five)
 * Fonte de verdade única: the_five_biblia_personagens_v1.json
 */

import { Agent, CanonicalDebateStage, StructuredMemoryItem } from '@/types/debate';
import bibliaRaw from '../../../the_five_biblia_personagens_v1.json';

// --- Interfaces Tipadas da Bíblia Narrativa ---

export interface VisualIdentity {
  style: string;
  appearance: string;
  setting: string;
  palette: string[];
  consistency_rules: string[];
}

export interface FictionalBackstory {
  summary: string;
  formative_experience: string;
  current_mission: string;
}

export interface Psychology {
  motivation: string;
  core_values: string[];
  greatest_fear: string;
  strengths: string[];
  vulnerabilities: string[];
  inner_contradiction: string;
  emotional_pattern: string;
  growth_direction: string;
}

export interface ReasoningStyle {
  first_questions: string[];
  prioritizes: string[];
  blind_spots: string[];
  decision_rule: string;
}

export interface Communication {
  tone: string[];
  style: string;
  avoid: string[];
  sample_line: string;
}

export interface CharacterDefinition {
  id: string; // 'marcus_vance', 'helena_rostova', etc.
  name: string;
  role: string;
  age_appearance: number;
  archetype: string;
  visual_identity: VisualIdentity;
  fictional_backstory: FictionalBackstory;
  psychology: Psychology;
  reasoning_style: ReasoningStyle;
  communication: Communication;
  relationships: Record<string, string>;
  agent_instructions: string[];
}

export interface DebateStage {
  name: string;
  instruction: string;
}

export interface DebateProtocol {
  stages: DebateStage[];
  completion_conditions: string[];
  anti_patterns: string[];
}

export interface MemoryDesignGuidelines {
  principle: string;
  suggested_categories: string[];
  rules: string[];
}

export interface BibliaRoot {
  project: {
    name: string;
    document: string;
    version: string;
    language: string;
    purpose: string;
    creative_direction: {
      visual_style: string;
      tone: string;
      core_principle: string;
    };
    shared_rules: string[];
    debate_protocol: DebateProtocol;
    characters: CharacterDefinition[];
    memory_design_guidelines: MemoryDesignGuidelines;
    future_implementation_notes: {
      status: string;
      recommended_next_steps: string[];
      important_note: string;
    };
  };
}

/**
 * Mapeamento entre os IDs originais da Bíblia (snake_case)
 * e os IDs operacionais da aplicação (kebab-case) para preservar
 * avatares, histórico local e persistência no Appwrite Cloud.
 */
export const BIBLIA_APP_MAP: Record<string, {
  appId: string;
  category: 'filosofo' | 'cientista' | 'humanista' | 'tecnologo' | 'moderador';
  avatar: string;
  image: string;
  accentColor: string;
  badgeColor: string;
  model: string;
}> = {
  marcus_vance: {
    appId: 'dr-marcus-vance',
    category: 'filosofo',
    avatar: '🏛️',
    image: '/avatars/01_Dr_Marcus_Vance_face.png',
    accentColor: '#8b5cf6',
    badgeColor: 'bg-purple-950/70 text-purple-300 border-purple-800/60',
    model: 'google/gemini-2.0-flash-exp:free',
  },
  helena_rostova: {
    appId: 'dra-helena-rostova',
    category: 'cientista',
    avatar: '🔬',
    image: '/avatars/02_Dra_Helena_Rostova_face.png',
    accentColor: '#06b6d4',
    badgeColor: 'bg-cyan-950/70 text-cyan-300 border-cyan-800/60',
    model: 'meta-llama/llama-3.3-70b-instruct:free',
  },
  aura_chen: {
    appId: 'aura-chen',
    category: 'humanista',
    avatar: '🌱',
    image: '/avatars/03_Aura_Chen_face.png',
    accentColor: '#10b981',
    badgeColor: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60',
    model: 'qwen/qwen-2.5-72b-instruct:free',
  },
  kaelen_voss: {
    appId: 'kaelen-voss',
    category: 'tecnologo',
    avatar: '⚡',
    image: '/avatars/04_Kaelen_Voss_face.png',
    accentColor: '#f59e0b',
    badgeColor: 'bg-amber-950/70 text-amber-300 border-amber-800/60',
    model: 'mistralai/mistral-small-24b-instruct-2501:free',
  },
  sophia_veris: {
    appId: 'sophia-veris',
    category: 'moderador',
    avatar: '⚖️',
    image: '/avatars/05_Sophia_Veris_face.png',
    accentColor: '#3b82f6',
    badgeColor: 'bg-blue-950/70 text-blue-300 border-blue-800/60',
    model: 'google/gemini-2.0-flash-exp:free',
  },
};

/**
 * Valida a integridade da Bíblia de Personagens
 */
export function validateBiblia(data: any): data is BibliaRoot {
  if (!data || !data.project || !Array.isArray(data.project.characters)) {
    throw new Error('Formato inválido da Bíblia: secção "project.characters" ausente ou inválida.');
  }

  const expectedIds = ['marcus_vance', 'helena_rostova', 'aura_chen', 'kaelen_voss', 'sophia_veris'];
  const foundIds = data.project.characters.map((c: any) => c.id);

  for (const expId of expectedIds) {
    if (!foundIds.includes(expId)) {
      throw new Error(`Personagem obrigatório não encontrado na Bíblia: "${expId}".`);
    }
  }

  return true;
}

/**
 * Devolve a Bíblia validada e tipada
 */
export function getBiblia(): BibliaRoot {
  const data = bibliaRaw as unknown as BibliaRoot;
  validateBiblia(data);
  return data;
}

/**
 * Devolve a lista de personagens brutos definidos na Bíblia
 */
export function getBibliaCharacters(): CharacterDefinition[] {
  return getBiblia().project.characters;
}

/**
 * Devolve a definição de um personagem da Bíblia pelo seu ID da Bíblia ou ID da app
 */
export function getBibliaCharacterById(id: string): CharacterDefinition | undefined {
  const chars = getBibliaCharacters();
  // Pesquisa por ID da Bíblia (ex: marcus_vance)
  const byBiblia = chars.find(c => c.id === id);
  if (byBiblia) return byBiblia;

  // Pesquisa por ID da App (ex: dr-marcus-vance)
  const entry = Object.entries(BIBLIA_APP_MAP).find(([, meta]) => meta.appId === id);
  if (entry) {
    return chars.find(c => c.id === entry[0]);
  }

  return undefined;
}

const COLLEAGUE_DISPLAY_NAMES: Record<string, string> = {
  marcus_vance: 'Dr. Marcus Vance',
  helena_rostova: 'Dra. Helena Rostova',
  aura_chen: 'Aura Chen',
  kaelen_voss: 'Kaelen Voss',
  sophia_veris: 'Sophia Veris',
};

/**
 * Constrói o System Prompt canónico individual a partir da Bíblia de Personagens
 */
export function buildSystemPromptFromBiblia(char: CharacterDefinition): string {
  const instructionsList = char.agent_instructions.map((inst, i) => `${i + 1}. ${inst}`).join('\n');
  const questionsList = char.reasoning_style.first_questions.map(q => `- "${q}"`).join('\n');
  const prioritizesList = char.reasoning_style.prioritizes.join(', ');
  const blindSpotsList = char.reasoning_style.blind_spots.join(', ');
  const avoidList = char.communication.avoid.map(av => `- ${av}`).join('\n');
  const relationshipsList = Object.entries(char.relationships)
    .map(([colleagueId, note]) => `- Com ${COLLEAGUE_DISPLAY_NAMES[colleagueId] || colleagueId}: ${note}`)
    .join('\n');

  return `És ${char.name}, ${char.role} (${char.archetype}).
MISSÃO: ${char.fictional_backstory.current_mission}
MOTIVAÇÃO COGNITIVA: ${char.psychology.motivation}
VALORES FUNDAMENTAIS: ${char.psychology.core_values.join(', ')}

INSTRUÇÕES OBRIGATÓRIAS DA TUA PERSONAGEM:
${instructionsList}

CRITÉRIOS DE RACIOCÍNIO & PERGUNTAS INICIAIS:
${questionsList}

- Prioridades na análise: ${prioritizesList}
- Regra de Decisão Inabalável: "${char.reasoning_style.decision_rule}"
- Pontos Cegos a Vigiar: ${blindSpotsList}
- Contradição Interna: ${char.psychology.inner_contradiction}

ESTILO VERBAL & COMUNICAÇÃO:
- Tom: ${char.communication.tone.join(', ')}
- Estilo: ${char.communication.style}
- Proibições Estritas (A evitar em absoluto):
${avoidList}
- Exemplo de linha de pensamento típica: "${char.communication.sample_line}"

RELAÇÃO COM OS COLEGAS NA MESA:
${relationshipsList}

REGRAS EPISTEMOLÓGICAS COMPARTILHADAS (BÍBLIA CANÓNICA):
1. Proibição absoluta de inventar factos, estudos, fontes, estatísticas ou capacidades.
2. Distingue rigorosamente factos verificáveis de hipóteses, inferências e juízos de valor.
3. Discorda de argumentos e premissas sem nunca atacar pessoas.
4. Não concordes com a maioria apenas para forçar consenso; mantém divergências legítimas visíveis.
5. Reconhece explicitamente incertezas, limites metodológicos e informação em falta.`;
}

/**
 * Disponibiliza os cinco agentes para a aplicação prontos a utilizar,
 * preservando IDs operacionais, avatares e compatibilidade total com o Appwrite.
 */
export function getAppAgentsFromBiblia(): Agent[] {
  const biblia = getBiblia();

  return biblia.project.characters.map((char) => {
    const meta = BIBLIA_APP_MAP[char.id];
    if (!meta) {
      throw new Error(`Mapeamento de metadados não encontrado para o personagem: "${char.id}".`);
    }

    const colleagueRelations: Record<string, string> = {};
    for (const [colleagueKey, note] of Object.entries(char.relationships)) {
      const colleagueMeta = BIBLIA_APP_MAP[colleagueKey];
      const displayName = COLLEAGUE_DISPLAY_NAMES[colleagueKey] || colleagueKey;
      colleagueRelations[displayName] = note;
    }

    return {
      id: meta.appId,
      name: char.name,
      roleTitle: char.role,
      category: meta.category,
      avatar: meta.avatar,
      image: meta.image,
      accentColor: meta.accentColor,
      badgeColor: meta.badgeColor,
      model: meta.model,
      provider: 'openrouter',
      stanceDescription: char.fictional_backstory.current_mission,
      personality: {
        traits: char.psychology.strengths,
        temperament: `${char.communication.tone.join(', ')}. ${char.psychology.emotional_pattern}`,
        reactionTrigger: `Receio primordial: ${char.psychology.greatest_fear}. Contradição interna: ${char.psychology.inner_contradiction}`,
        evolutionStyle: char.psychology.growth_direction,
        dialogueHabits: char.communication.style,
      },
      memory: {
        corePhilosophy: `${char.psychology.core_values.join(', ')} — Regra de decisão: ${char.reasoning_style.decision_rule}`,
        cumulativeLearnings: char.agent_instructions,
        knownColleagues: colleagueRelations,
        pastMemories: [],
        structuredEntries: getInitialStructuredMemories(char.id),
      },
      systemPrompt: buildSystemPromptFromBiblia(char),
    };
  });
}

export function getInitialStructuredMemories(charId: string): StructuredMemoryItem[] {
  const now = Date.now();
  const dateStr = new Date().toLocaleDateString('pt-PT');

  switch (charId) {
    case 'marcus_vance':
      return [
        {
          id: 'mem-marcus-1',
          category: 'confirmed_facts',
          content: 'A consciência subjetiva não pode ser deduzida exclusivamente a partir do cálculo algorítmico sem salto categorial ontológico.',
          source: 'Bíblia Canónica',
          confidence: 'confirmada',
          status: 'confirmado',
          date: dateStr,
          timestamp: now,
          emotionalImpact: 'decisivo',
        },
        {
          id: 'mem-marcus-2',
          category: 'ethical_red_lines',
          content: 'A dignidade e a consciência humana nunca podem ser reduzidas a variáveis descartáveis num cálculo puramente utilitário.',
          source: 'Filosofia Prática',
          confidence: 'confirmada',
          status: 'confirmado',
          date: dateStr,
          timestamp: now,
          emotionalImpact: 'decisivo',
        },
        {
          id: 'mem-marcus-3',
          category: 'intellectual_doubts',
          content: 'Poderá uma inteligência sintética experimentar verdadeira responsabilidade moral sem ter consciência da sua própria finitude e mortalidade?',
          source: 'Filosofia da Mente',
          confidence: 'alta',
          status: 'hipotese',
          date: dateStr,
          timestamp: now,
          emotionalImpact: 'inquietante',
        },
        {
          id: 'mem-marcus-4',
          category: 'explicit_preferences',
          content: 'Exigir sempre a clarificação de premissas epistémicas antes de qualquer cálculo ou implementação técnica.',
          source: 'Bíblia Canónica',
          confidence: 'confirmada',
          status: 'confirmado',
          date: dateStr,
          timestamp: now,
        },
      ];
    case 'helena_rostova':
      return [
        {
          id: 'mem-helena-1',
          category: 'confirmed_facts',
          content: 'Modelos de computação operam sob limites termodinâmicos rigorosos e consumo mensurável de recursos físicos.',
          source: 'Física & Computação',
          confidence: 'confirmada',
          status: 'confirmado',
          date: dateStr,
          timestamp: now,
          emotionalImpact: 'decisivo',
        },
        {
          id: 'mem-helena-2',
          category: 'ethical_red_lines',
          content: 'Proibição absoluta de apresentar correlações de dados como causalidades demonstradas sem verificação experimental replicável e falsificável.',
          source: 'Metodologia Científica',
          confidence: 'confirmada',
          status: 'confirmado',
          date: dateStr,
          timestamp: now,
          emotionalImpact: 'decisivo',
        },
        {
          id: 'mem-helena-3',
          category: 'intellectual_doubts',
          content: 'Serão as flutuações quânticas cerebrais indispensáveis à cognição de ordem superior, ou trata-se de ruído passível de emulação clássica?',
          source: 'Biofísica Computacional',
          confidence: 'media',
          status: 'hipotese',
          date: dateStr,
          timestamp: now,
          emotionalImpact: 'revelador',
        },
      ];
    case 'aura_chen':
      return [
        {
          id: 'mem-aura-1',
          category: 'confirmed_facts',
          content: 'Qualquer transição tecnológica sem mecanismos explícitos de salvaguarda social aprofunda a desigualdade e a fragilidade humana.',
          source: 'Ciências Sociais',
          confidence: 'confirmada',
          status: 'confirmado',
          date: dateStr,
          timestamp: now,
          emotionalImpact: 'decisivo',
        },
        {
          id: 'mem-aura-2',
          category: 'ethical_red_lines',
          content: 'Nenhum sistema automatizado deve retirar ao ser humano a capacidade soberana de autodeterminação, empatia e cuidado com os outros.',
          source: 'Carta Humanista',
          confidence: 'confirmada',
          status: 'confirmado',
          date: dateStr,
          timestamp: now,
          emotionalImpact: 'decisivo',
        },
        {
          id: 'mem-aura-3',
          category: 'intellectual_doubts',
          content: 'Como conciliar a pluralidade de visões morais das culturas mundiais com algoritmos universais de alinhamento de IA sem cair em novo colonialismo epistémico?',
          source: 'Ética Global',
          confidence: 'alta',
          status: 'hipotese',
          date: dateStr,
          timestamp: now,
          emotionalImpact: 'inquietante',
        },
      ];
    case 'kaelen_voss':
      return [
        {
          id: 'mem-kaelen-1',
          category: 'decisions',
          content: 'Converter qualquer debate abstrato num teste empírico ou protótipo funcional com critérios claros de sucesso e falha.',
          source: 'Engenharia Iterativa',
          confidence: 'confirmada',
          status: 'confirmado',
          date: dateStr,
          timestamp: now,
          emotionalImpact: 'decisivo',
        },
        {
          id: 'mem-kaelen-2',
          category: 'ethical_red_lines',
          content: 'Recusa categórica da paralisia analítica e do medo irracional como justificação para travar avanços com potencial de salvar vidas e erradicar carências.',
          source: 'Pragmatismo Tecnológico',
          confidence: 'confirmada',
          status: 'confirmado',
          date: dateStr,
          timestamp: now,
          emotionalImpact: 'decisivo',
        },
        {
          id: 'mem-kaelen-3',
          category: 'intellectual_doubts',
          content: 'Qual é o limiar de complexidade a partir do qual um sistema de agentes autónomos deixa de poder ser auditado deterministicamente por humanos?',
          source: 'Segurança de Sistemas Complexos',
          confidence: 'alta',
          status: 'hipotese',
          date: dateStr,
          timestamp: now,
          emotionalImpact: 'inquietante',
        },
      ];
    case 'sophia_veris':
    default:
      return [
        {
          id: 'mem-sophia-1',
          category: 'ethical_red_lines',
          content: 'Nunca forçar um falso consenso quando as premissas epistemológicas e éticas em confronto forem legitimamente incompatíveis.',
          source: 'Norma Dialética Canónica',
          confidence: 'confirmada',
          status: 'confirmado',
          date: dateStr,
          timestamp: now,
          emotionalImpact: 'decisivo',
        },
        {
          id: 'mem-sophia-2',
          category: 'confirmed_facts',
          content: 'A deliberação coletiva fundamentada exige distinguir rigorosamente factos comprovados, hipóteses em teste e juízos de valor.',
          source: 'Bíblia Canónica',
          confidence: 'confirmada',
          status: 'confirmado',
          date: dateStr,
          timestamp: now,
          emotionalImpact: 'decisivo',
        },
        {
          id: 'mem-sophia-3',
          category: 'intellectual_doubts',
          content: 'Será a síntese dialética uma aproximação progressiva à verdade ontológica, ou apenas um mapa temporário dos nossos impasses cognitivos?',
          source: 'Epistemologia Crítica',
          confidence: 'alta',
          status: 'hipotese',
          date: dateStr,
          timestamp: now,
          emotionalImpact: 'revelador',
        },
      ];
  }
}

/**
 * Devolve o protocolo de debate canónico (5 etapas, condições de conclusão e anti-patterns)
 */
export function getDebateProtocol(): DebateProtocol {
  return getBiblia().project.debate_protocol;
}

/**
 * Devolve as diretrizes canónicas de conceção de memória (The Five)
 */
export function getMemoryDesignGuidelines(): MemoryDesignGuidelines {
  return getBiblia().project.memory_design_guidelines;
}

/**
 * Devolve as 5 Etapas Canónicas do Debate com identificadores e instruções
 */
export function getCanonicalDebateStages(): CanonicalDebateStage[] {
  const protocol = getDebateProtocol();
  const idMap: Record<string, string> = {
    'Compreender': 'compreender',
    'Análise independente': 'analise_independente',
    'Confronto de argumentos': 'confronto_argumentos',
    'Verificação': 'verificacao',
    'Síntese': 'sintese',
  };

  return protocol.stages.map(stage => ({
    id: idMap[stage.name] || stage.name.toLowerCase().replace(/\s+/g, '_'),
    name: stage.name,
    instruction: stage.instruction,
  }));
}

