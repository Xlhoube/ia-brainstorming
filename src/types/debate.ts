export type AgentRole = 
  | 'filosofo' 
  | 'cientista' 
  | 'humanista' 
  | 'tecnologo' 
  | 'moderador'
  | 'economista'
  | 'psicologo'
  | 'personalizado';

export type LanguageTone = 'simples' | 'academico';
export type DebatePacing = 'manual' | 'calmo' | 'normal' | 'rapido';

export interface AgentPersonality {
  traits: string[];
  temperament: string;
  reactionTrigger: string;
  evolutionStyle: string;
  dialogueHabits: string;
}

export interface AgentMemoryEntry {
  topic: string;
  stanceSummary: string;
  date: string;
}

export type StructuredMemoryCategory =
  | 'confirmed_facts'
  | 'explicit_preferences'
  | 'decisions'
  | 'open_hypotheses'
  | 'lessons_learned'
  | 'conversation_summaries'
  | 'ethical_red_lines'
  | 'intellectual_doubts';

export interface StructuredMemoryItem {
  id: string;
  category: StructuredMemoryCategory;
  content: string;
  source?: string;
  confidence?: 'baixa' | 'media' | 'alta' | 'confirmada';
  status?: 'confirmado' | 'hipotese' | 'revisto' | 'arquivado';
  date?: string;
  timestamp: number;
  emotionalImpact?: 'neutro' | 'revelador' | 'inquietante' | 'decisivo';
  relatedColleague?: string;
  topicContext?: string;
}

export interface AgentMemory {
  corePhilosophy: string;
  cumulativeLearnings: string[];
  knownColleagues: Record<string, string>;
  pastMemories: AgentMemoryEntry[];
  structuredEntries?: StructuredMemoryItem[];
}

export interface PodcastChapter {
  title: string;
  startTimeSec: number;
  speakerName?: string;
  speaker?: string;
  stage?: string;
}

export interface PodcastEpisode {
  id: string;
  title: string;
  topic: string;
  durationSec: number;
  audioBlobUrl?: string;
  chapters: PodcastChapter[];
  scriptMarkdown: string;
  createdAt: number;
}

export interface SynthesisResult {
  centralThesis: string;
  consensus: string[];
  divergences: string[];
  openQuestions: string[];
  overallVerdict: string;
  consensusSummary?: string;
  practicalRecommendations?: string[];
  analyzedCount?: number;
  updatedAt?: string;
  tone?: LanguageTone;
}

export interface Agent {
  id: string;
  name: string;
  roleTitle: string;
  category: AgentRole;
  avatar: string;
  image?: string;
  accentColor: string;
  badgeColor: string;
  systemPrompt: string;
  model: string;
  provider: 'openrouter' | 'groq' | 'google' | 'mock';
  stanceDescription: string;
  personality: AgentPersonality;
  memory: AgentMemory;
}

export type DialecticalOutcome = 'consenso' | 'aporia' | 'sintese';

export interface CanonicalDebateStage {
  id: string;
  name: string;
  instruction: string;
  description?: string;
}

export type DebateStage = CanonicalDebateStage;

export interface DebateMessage {
  id: string;
  agentId: string;
  agentName: string;
  agentRole: string;
  avatar: string;
  image?: string;
  accentColor: string;
  content: string;
  round: number;
  stageName?: string;
  stage?: string;
  stageIndex?: number;
  timestamp: string;
  isHuman?: boolean;
  replyToAgentName?: string;
  keyPoints?: string[];
  dialecticalConclusion?: DialecticalOutcome;
  isWithdrawal?: boolean;
  withdrawalReason?: string;
  isSimulated?: boolean;
  modelUsed?: string;
}

export interface PresetTopic {
  id: string;
  title: string;
  category:
    | 'Filosofia & Consciência'
    | 'Sociedade & Futuro'
    | 'Tecnologia & IA'
    | 'Ciência & Espaço'
    | 'Ética & Humanidade'
    | 'Física & Fronteira Científica'
    | 'Biotecnologia & Ética'
    | 'Neurociência & Futuro'
    | 'IA de Fronteira & Segurança'
    | 'Energia & Geopolítica';
  description: string;
  suggestedAgents: string[];
}

export interface DebateState {
  id: string;
  topic: string;
  topicDescription: string;
  status: 'idle' | 'running' | 'paused' | 'concluded';
  currentRound: number;
  currentStageIndex?: number;
  currentStageName?: string;
  maxRounds?: number;
  activeSpeakerId: string | null;
  speedDelayMs: number;
  selectedAgentIds: string[];
  withdrawnAgentIds?: string[];
  messages: DebateMessage[];
  tone: LanguageTone;
  conclusionSummary?: string;
  consensusPoints?: string[];
  divergencePoints?: string[];
  dialecticalOutcome?: DialecticalOutcome;
}

export interface OpenRouterConfig {
  apiKey: string;
  siteUrl?: string;
  siteName?: string;
}

/**
 * Mapeamento de Estado (State Tracking) em JSON para eliminação de repetições e economia de tokens
 */
export interface DebateStateTracking {
  pontos_consensuais: string[];
  argumentos_esgotados: Record<string, string[]>;
  teses_centrais?: string[];
  dados_factuais?: string[];
  concessoes_feitas?: string[];
}

/**
 * Estrutura de Memória Comprimida de Longo Prazo
 */
export interface CompressedDebateMemory {
  longTermSummary: string;
  stateTracking: DebateStateTracking;
  compressedCount: number;
  updatedAt: number;
}

/**
 * Registo de Argumento Indexado para RAG Semântico
 */
export interface VectorArgumentEntry {
  id: string;
  messageId: string;
  agentName: string;
  agentRole: string;
  text: string;
  keywords: string[];
  timestamp: number;
  embeddingVector?: number[];
}
