'use client';

import { DebateMessage } from '@/types/debate';

export interface SavedDebateSession {
  id: string;
  topic: string;
  topicDescription: string;
  messages: DebateMessage[];
  selectedAgentIds: string[];
  currentRound: number;
  maxRounds: number;
  synthesisResult: any | null;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY_DEBATES = 'ia_brainstorming_debates_v1';

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
}
