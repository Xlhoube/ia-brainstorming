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

export interface AgentMemory {
  corePhilosophy: string;
  cumulativeLearnings: string[];
  knownColleagues: Record<string, string>;
  pastMemories: AgentMemoryEntry[];
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
  timestamp: string;
  isHuman?: boolean;
  replyToAgentName?: string;
  keyPoints?: string[];
  dialecticalConclusion?: DialecticalOutcome;
}

export interface PresetTopic {
  id: string;
  title: string;
  category: 'Filosofia & Consciência' | 'Sociedade & Futuro' | 'Tecnologia & IA' | 'Ciência & Espaço' | 'Ética & Humanidade';
  description: string;
  suggestedAgents: string[];
}

export interface DebateState {
  id: string;
  topic: string;
  topicDescription: string;
  status: 'idle' | 'running' | 'paused' | 'concluded';
  currentRound: number;
  maxRounds?: number;
  activeSpeakerId: string | null;
  speedDelayMs: number;
  selectedAgentIds: string[];
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
