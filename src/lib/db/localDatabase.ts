import { Agent, DebateMessage, AgentMemory, AgentMemoryEntry, DialecticalOutcome, StructuredMemoryItem } from '@/types/debate';

export interface SavedDebateSession {
  id: string;
  topic: string;
  topicDescription: string;
  messages: DebateMessage[];
  selectedAgentIds: string[];
  currentRound: number;
  currentStageIndex?: number;
  currentStageName?: string;
  maxRounds?: number;
  dialecticalOutcome?: DialecticalOutcome;
  synthesisResult: any | null;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY_DEBATES = 'ia_brainstorming_debates_v1';
const STORAGE_KEY_MEMORIES = 'ia_brainstorming_agent_memories_v1';
const STORAGE_KEY_CUSTOM_AGENTS = 'ia_brainstorming_custom_agents_v1';

export class LocalDatabase {
  public static listSessions(): SavedDebateSession[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY_DEBATES);
      if (!data) return [];
      const parsed: SavedDebateSession[] = JSON.parse(data);
      return parsed.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch (err) {
      console.error('Erro ao listar sessões locais:', err);
      return [];
    }
  }

  public static getSession(id: string): SavedDebateSession | null {
    const list = this.listSessions();
    return list.find(s => s.id === id) || null;
  }

  public static saveSession(session: SavedDebateSession): void {
    if (typeof window === 'undefined') return;
    try {
      const list = this.listSessions();
      const existingIdx = list.findIndex(s => s.id === session.id);

      if (existingIdx >= 0) {
        list[existingIdx] = { ...session, updatedAt: Date.now() };
      } else {
        list.unshift({ ...session, updatedAt: Date.now() });
      }

      localStorage.setItem(STORAGE_KEY_DEBATES, JSON.stringify(list));
    } catch (err) {
      console.error('Erro ao guardar sessão local:', err);
    }
  }

  public static deleteSession(id: string): void {
    if (typeof window === 'undefined') return;
    try {
      const list = this.listSessions();
      const updated = list.filter(s => s.id !== id);
      localStorage.setItem(STORAGE_KEY_DEBATES, JSON.stringify(updated));
    } catch (err) {
      console.error('Erro ao eliminar sessão local:', err);
    }
  }

  public static clearAll(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY_DEBATES);
  }

  // --- Gestão de Memória Cognitiva dos Agentes ---
  public static getAgentMemories(): Record<string, AgentMemory> {
    if (typeof window === 'undefined') return {};
    try {
      const data = localStorage.getItem(STORAGE_KEY_MEMORIES);
      return data ? JSON.parse(data) : {};
    } catch (err) {
      console.error('Erro ao carregar memórias locais dos agentes:', err);
      return {};
    }
  }

  public static saveAgentMemory(agentId: string, memory: AgentMemory): void {
    if (typeof window === 'undefined') return;
    try {
      const all = this.getAgentMemories();
      all[agentId] = memory;
      localStorage.setItem(STORAGE_KEY_MEMORIES, JSON.stringify(all));
    } catch (err) {
      console.error('Erro ao gravar memória do agente:', err);
    }
  }

  public static saveAllAgentMemories(memories: Record<string, AgentMemory>): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_MEMORIES, JSON.stringify(memories));
    } catch (err) {
      console.error('Erro ao gravar todas as memórias locais:', err);
    }
  }

  public static recordDebateMemoryForAgent(
    agentId: string,
    topic: string,
    stanceSummary: string
  ): void {
    if (typeof window === 'undefined') return;
    try {
      const all = this.getAgentMemories();
      const current = all[agentId];
      if (current) {
        const newEntry: AgentMemoryEntry = {
          topic,
          stanceSummary,
          date: new Date().toLocaleDateString('pt-PT')
        };
        current.pastMemories = [newEntry, ...(current.pastMemories || []).slice(0, 5)];
        this.saveAgentMemory(agentId, current);
      }
    } catch (err) {
      console.error('Erro ao registar memória de debate:', err);
    }
  }

  public static recordAutomaticDebateConclusionMemory(
    agentId: string,
    topic: string,
    stanceSummary: string,
    outcome: DialecticalOutcome = 'sintese',
    colleagueName?: string
  ): StructuredMemoryItem {
    const all = this.getAgentMemories();
    const current = all[agentId] || {
      corePhilosophy: '',
      cumulativeLearnings: [],
      knownColleagues: {},
      pastMemories: [],
      structuredEntries: []
    };

    let category: import('@/types/debate').StructuredMemoryCategory = 'lessons_learned';
    let emotionalImpact: 'neutro' | 'revelador' | 'inquietante' | 'decisivo' = 'decisivo';

    if (outcome === 'consenso') {
      category = 'decisions';
      emotionalImpact = 'revelador';
    } else if (outcome === 'aporia') {
      category = 'open_hypotheses';
      emotionalImpact = 'inquietante';
    }

    const newItem: StructuredMemoryItem = {
      id: `mem-auto-${agentId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      category,
      content: stanceSummary,
      source: `Debate Dialético: ${topic}`,
      confidence: 'alta',
      status: 'confirmado',
      date: new Date().toLocaleDateString('pt-PT'),
      timestamp: Date.now(),
      topicContext: topic,
      relatedColleague: colleagueName,
      emotionalImpact,
    };

    current.structuredEntries = [newItem, ...(current.structuredEntries || [])];

    const pastEntry: AgentMemoryEntry = {
      topic,
      stanceSummary,
      date: new Date().toLocaleDateString('pt-PT'),
    };
    current.pastMemories = [pastEntry, ...(current.pastMemories || []).slice(0, 7)];

    this.saveAgentMemory(agentId, current);
    return newItem;
  }

  public static addStructuredMemory(agentId: string, item: StructuredMemoryItem): void {
    if (typeof window === 'undefined') return;
    try {
      const all = this.getAgentMemories();
      const current = all[agentId] || {
        corePhilosophy: '',
        cumulativeLearnings: [],
        knownColleagues: {},
        pastMemories: [],
        structuredEntries: []
      };
      current.structuredEntries = [item, ...(current.structuredEntries || [])];
      this.saveAgentMemory(agentId, current);
    } catch (err) {
      console.error('Erro ao adicionar memória estruturada:', err);
    }
  }

  public static deleteStructuredMemory(agentId: string, itemId: string): void {
    if (typeof window === 'undefined') return;
    try {
      const all = this.getAgentMemories();
      const current = all[agentId];
      if (current && current.structuredEntries) {
        current.structuredEntries = current.structuredEntries.filter(m => m.id !== itemId);
        this.saveAgentMemory(agentId, current);
      }
    } catch (err) {
      console.error('Erro ao remover memória estruturada:', err);
    }
  }

  public static updateStructuredMemory(
    agentId: string,
    itemId: string,
    updates: Partial<StructuredMemoryItem>
  ): void {
    if (typeof window === 'undefined') return;
    try {
      const all = this.getAgentMemories();
      const current = all[agentId];
      if (current && current.structuredEntries) {
        current.structuredEntries = current.structuredEntries.map(m =>
          m.id === itemId ? { ...m, ...updates } : m
        );
        this.saveAgentMemory(agentId, current);
      }
    } catch (err) {
      console.error('Erro ao atualizar memória estruturada:', err);
    }
  }

  public static getStructuredMemories(agentId: string): StructuredMemoryItem[] {
    const all = this.getAgentMemories();
    return all[agentId]?.structuredEntries || [];
  }

  // --- Gestão de Especialistas Personalizados ---
  public static getCustomAgents(): Agent[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY_CUSTOM_AGENTS);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error('Erro ao carregar especialistas personalizados locais:', err);
      return [];
    }
  }

  public static saveCustomAgent(agent: Agent): void {
    if (typeof window === 'undefined') return;
    try {
      const list = this.getCustomAgents();
      const idx = list.findIndex(a => a.id === agent.id);
      if (idx >= 0) {
        list[idx] = agent;
      } else {
        list.push(agent);
      }
      localStorage.setItem(STORAGE_KEY_CUSTOM_AGENTS, JSON.stringify(list));
    } catch (err) {
      console.error('Erro ao gravar especialista personalizado:', err);
    }
  }

  public static deleteCustomAgent(id: string): void {
    if (typeof window === 'undefined') return;
    try {
      const list = this.getCustomAgents();
      const updated = list.filter(a => a.id !== id);
      localStorage.setItem(STORAGE_KEY_CUSTOM_AGENTS, JSON.stringify(updated));
    } catch (err) {
      console.error('Erro ao remover especialista personalizado:', err);
    }
  }
}

