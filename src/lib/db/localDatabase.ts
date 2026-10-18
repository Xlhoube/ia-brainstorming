import { DebateMessage, AgentMemory, AgentMemoryEntry, DialecticalOutcome } from '@/types/debate';

export interface SavedDebateSession {
  id: string;
  topic: string;
  topicDescription: string;
  messages: DebateMessage[];
  selectedAgentIds: string[];
  currentRound: number;
  maxRounds?: number;
  dialecticalOutcome?: DialecticalOutcome;
  synthesisResult: any | null;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY_DEBATES = 'ia_brainstorming_debates_v1';
const STORAGE_KEY_MEMORIES = 'ia_brainstorming_agent_memories_v1';

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
}
