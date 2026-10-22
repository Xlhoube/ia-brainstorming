import { ID, Query } from 'appwrite';
import { appwriteDatabases, APPWRITE_CONFIG } from './client';
import { SavedDebateSession, LocalDatabase } from '@/lib/db/localDatabase';

export class AppwriteDatabaseService {
  /**
   * Guarda ou atualiza uma sessão de debate no Appwrite Cloud.
   * Mantém sempre cópia local de segurança via LocalDatabase.
   */
  public static async saveSession(session: SavedDebateSession): Promise<void> {
    // 1. Guardar sempre primeiro localmente (Local-First resiliente)
    LocalDatabase.saveSession(session);

    // 2. Tentar sincronizar com o Appwrite Cloud
    try {
      const payload = {
        sessionId: session.id,
        topic: session.topic.substring(0, 500),
        topicDescription: (session.topicDescription || '').substring(0, 1000),
        data: JSON.stringify(session),
        updatedAt: new Date().toISOString(),
      };

      // Tenta atualizar se existir ou criar novo
      try {
        await appwriteDatabases.updateDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collectionId,
          session.id,
          payload
        );
      } catch (updateErr: any) {
        // Se não existir, cria com o ID da sessão
        if (updateErr?.code === 404 || updateErr?.message?.includes('not found')) {
          await appwriteDatabases.createDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collectionId,
            session.id,
            payload
          );
        } else {
          throw updateErr;
        }
      }
    } catch (err: any) {
      // Registo silencioso: o utilizador não é interrompido porque o LocalDatabase já salvou com sucesso
      console.warn('Appwrite Cloud sync info:', err.message || err);
    }
  }

  /**
   * Lista as sessões disponíveis, combinando Appwrite Cloud e LocalDatabase.
   */
  public static async listSessions(): Promise<SavedDebateSession[]> {
    const localList = LocalDatabase.listSessions();

    try {
      const res = await appwriteDatabases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collectionId,
        [Query.orderDesc('updatedAt'), Query.limit(50)]
      );

      if (res.documents && res.documents.length > 0) {
        const cloudSessions: SavedDebateSession[] = res.documents
          .map(doc => {
            try {
              return JSON.parse(doc.data) as SavedDebateSession;
            } catch {
              return null;
            }
          })
          .filter(Boolean) as SavedDebateSession[];

        // Mesclar local e cloud sem duplicados
        const map = new Map<string, SavedDebateSession>();
        localList.forEach(s => map.set(s.id, s));
        cloudSessions.forEach(s => {
          const local = map.get(s.id);
          if (!local || (s.updatedAt && s.updatedAt > local.updatedAt)) {
            map.set(s.id, s);
          }
        });

        return Array.from(map.values()).sort((a, b) => b.updatedAt - a.updatedAt);
      }
    } catch (err: any) {
      // Se o Appwrite ainda não tiver coleção criada, retorna a lista local com garantia de integridade
      console.warn('Appwrite listSessions fallback para local:', err.message || err);
    }

    return localList;
  }

  /**
   * Remove uma sessão do Appwrite e do armazenamento local.
   */
  public static async deleteSession(id: string): Promise<void> {
    LocalDatabase.deleteSession(id);

    try {
      await appwriteDatabases.deleteDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collectionId,
        id
      );
    } catch (err: any) {
      console.warn('Appwrite deleteSession info:', err.message || err);
    }
  }

  /**
   * Sincroniza e persiste as memórias cognitivas individuais de todos os especialistas
   * no Appwrite Cloud (mantendo cópia local imediata de alta disponibilidade).
   */
  public static async saveAgentMemories(memories: Record<string, import('@/types/debate').AgentMemory>): Promise<void> {
    LocalDatabase.saveAllAgentMemories(memories);

    try {
      const docId = 'global_agent_memories';
      const payload = {
        sessionId: docId,
        topic: 'Arquivo Cognitivo de Especialistas',
        topicDescription: 'Sincronização persistente de memórias individuais dos 5 pensadores (The Five)',
        data: JSON.stringify(memories),
        updatedAt: new Date().toISOString(),
      };

      try {
        await appwriteDatabases.updateDocument(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collectionId,
          docId,
          payload
        );
      } catch (updateErr: any) {
        if (updateErr?.code === 404 || updateErr?.message?.includes('not found')) {
          await appwriteDatabases.createDocument(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collectionId,
            docId,
            payload
          );
        } else {
          throw updateErr;
        }
      }
    } catch (err: any) {
      console.warn('Appwrite Cloud saveAgentMemories info:', err.message || err);
    }
  }

  /**
   * Obtém as memórias dos agentes, mesclando cloud e local de forma resiliente.
   */
  public static async getAgentMemories(): Promise<Record<string, import('@/types/debate').AgentMemory>> {
    const local = LocalDatabase.getAgentMemories();

    try {
      const doc = await appwriteDatabases.getDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collectionId,
        'global_agent_memories'
      );

      if (doc && doc.data) {
        const cloudMemories = JSON.parse(doc.data) as Record<string, import('@/types/debate').AgentMemory>;
        const merged: Record<string, import('@/types/debate').AgentMemory> = { ...local };

        for (const [agentId, cloudMem] of Object.entries(cloudMemories)) {
          if (!merged[agentId]) {
            merged[agentId] = cloudMem;
          } else {
            const localEntries = merged[agentId].structuredEntries || [];
            const cloudEntries = cloudMem.structuredEntries || [];
            const allEntries = [...localEntries];
            for (const ce of cloudEntries) {
              if (!allEntries.some(e => e.id === ce.id)) {
                allEntries.push(ce);
              }
            }

            merged[agentId] = {
              ...merged[agentId],
              ...cloudMem,
              structuredEntries: allEntries,
              pastMemories: [
                ...(merged[agentId].pastMemories || []),
                ...(cloudMem.pastMemories || [])
              ].filter((m, idx, arr) => arr.findIndex(x => x.topic === m.topic) === idx),
            };
          }
        }

        LocalDatabase.saveAllAgentMemories(merged);
        return merged;
      }
    } catch (err: any) {
      console.warn('Appwrite Cloud getAgentMemories fallback para local:', err.message || err);
    }

    return local;
  }
}
