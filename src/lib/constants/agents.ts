/**
 * Definições canónicas dos agentes da Arena de Debate (The Five)
 * Fonte de verdade única: the_five_biblia_personagens_v1.json via bibliaLoader
 */

import { Agent } from '@/types/debate';
import { getAppAgentsFromBiblia } from '@/lib/agents/bibliaLoader';

export const DEFAULT_AGENTS: Agent[] = getAppAgentsFromBiblia();
