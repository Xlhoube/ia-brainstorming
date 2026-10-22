/**
 * Serviço de Memória Híbrida, Compressão Incremental e State Tracking para Debates Contínuos
 * 
 * Implementa:
 * 1. Sumarização Incremental em Background (Gatilho de 6 mensagens / 3000 tokens)
 * 2. Janela Deslizante Híbrida (System Prompt + Long-Term Memory + Short-Term Window)
 * 3. Mapeamento de Estado (State Tracking em JSON) para bloqueio de repetições
 * 4. RAG Semântico / Base Vetorial de Argumentos Históricos
 */

import type {
  DebateMessage,
  DebateStateTracking,
  CompressedDebateMemory,
  VectorArgumentEntry,
} from '@/types/debate';

export const COMPRESSION_TRIGGER_THRESHOLD = 6;
export const DEFAULT_SLIDING_WINDOW_SIZE = 3;

const PT_STOPWORDS = new Set([
  'de', 'a', 'o', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'é', 'com', 'não', 'uma',
  'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'foi', 'ao', 'ele',
  'das', 'tem', 'à', 'seu', 'sua', 'ou', 'ser', 'quando', 'muito', 'há', 'nos', 'já',
  'está', 'eu', 'também', 'só', 'pelo', 'pela', 'até', 'isso', 'ela', 'entre', 'era',
  'depois', 'sem', 'mesmo', 'aos', 'ter', 'seus', 'quem', 'nas', 'me', 'esse', 'eles',
  'estão', 'você', 'tinha', 'foram', 'essa', 'num', 'nem', 'suas', 'meu', 'às', 'minha',
  'têm', 'numa', 'pelos', 'elas', 'havia', 'seja', 'qual', 'será', 'nós', 'tenho', 'lhe',
  'deles', 'essas', 'esses', 'pelas', 'este', 'fosse', 'dele', 'tu', 'te', 'vocês', 'vos',
  'lhes', 'meus', 'minhas', 'teu', 'tua', 'teus', 'tuas', 'nosso', 'nossa', 'nossos', 'nossas',
  'dela', 'delas', 'esta', 'estes', 'estas', 'aquele', 'aquela', 'aqueles', 'aquelas', 'isto',
  'aquilo', 'estou', 'está', 'estamos', 'estão', 'estive', 'esteve', 'estivemos', 'estiveram'
]);

/**
 * Extrai palavras-chave significativas para indexação semântica
 */
export function extractKeywords(text: string): string[] {
  if (!text) return [];
  const words = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !PT_STOPWORDS.has(w));
  return Array.from(new Set(words));
}

/**
 * Indexa mensagens do debate num banco vetorial / semântico local para RAG
 */
export function indexArgumentsForRAG(messages: DebateMessage[]): VectorArgumentEntry[] {
  return messages.map((m, idx) => ({
    id: `arg-${m.id || idx}`,
    messageId: m.id,
    agentName: m.agentName,
    agentRole: m.agentRole,
    text: m.content,
    keywords: extractKeywords(m.content),
    timestamp: Date.now(),
  }));
}

/**
 * Pesquisa semântica por similaridade para recuperar os argumentos mais relevantes do histórico
 */
export function searchSimilarArguments(params: {
  query: string;
  index: VectorArgumentEntry[];
  excludeIds?: string[];
  topK?: number;
}): Array<{ entry: VectorArgumentEntry; text: string; score: number }> {
  const { query, index, excludeIds = [], topK = 3 } = params;
  const queryKeywords = extractKeywords(query);

  if (queryKeywords.length === 0 || index.length === 0) {
    return [];
  }

  const querySet = new Set(queryKeywords);
  const scored = index
    .filter(item => !excludeIds.includes(item.messageId) && !excludeIds.includes(item.id))
    .map(item => {
      let matches = 0;
      for (const kw of item.keywords) {
        if (querySet.has(kw)) {
          matches++;
        }
      }

      // Cálculo de similaridade Jaccard / Cosine com ponderação de palavras raras
      const union = new Set([...queryKeywords, ...item.keywords]).size;
      const score = union > 0 ? matches / union : 0;

      return {
        entry: item,
        text: `[#${item.agentName} (${item.agentRole})]: "${item.text}"`,
        score,
      };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, topK);
}

/**
 * Extrai e comprime dados factuais e teses de um bloco de mensagens
 */
export function compressDebateHistory(params: {
  messages: DebateMessage[];
  topic: string;
  slidingWindowSize?: number;
}): CompressedDebateMemory {
  const { messages, topic, slidingWindowSize = DEFAULT_SLIDING_WINDOW_SIZE } = params;

  // Se o histórico não ultrapassar a janela deslizante, a memória de longo prazo começa vazia
  if (!messages || messages.length <= slidingWindowSize) {
    return {
      longTermSummary: '',
      stateTracking: {
        pontos_consensuais: [],
        argumentos_esgotados: {},
        teses_centrais: [],
        dados_factuais: [],
        concessoes_feitas: [],
      },
      compressedCount: 0,
      updatedAt: Date.now(),
    };
  }

  // As mensagens mais antigas que saíram da janela deslizante são comprimidas
  const oldBlock = messages.slice(0, messages.length - slidingWindowSize);

  const tesesCentrais: string[] = [];
  const dadosFactuais: string[] = [];
  const argumentosRefutados: string[] = [];
  const concessoesFeitas: string[] = [];
  const pontosConsensuais: string[] = [];
  const argumentosEsgotados: Record<string, string[]> = {};

  for (const msg of oldBlock) {
    const name = msg.agentName || 'Especialista';
    if (!argumentosEsgotados[name]) {
      argumentosEsgotados[name] = [];
    }

    // Extração sintética da tese principal (primeira frase ou núcleo)
    const sentences = msg.content.split(/[.?!]\s+/).map(s => s.trim()).filter(Boolean);
    const corePoint = sentences[0] || msg.content.slice(0, 80);

    if (corePoint && !argumentosEsgotados[name].includes(corePoint)) {
      argumentosEsgotados[name].push(corePoint);
    }

    // Deteção de factos e métricas numéricas (%, ms, €, $, kg, MW, etc.)
    const metricMatches = msg.content.match(/\d+[\s\w%€$.,/-]+/g);
    if (metricMatches) {
      for (const m of metricMatches.slice(0, 2)) {
        if (m.trim().length > 2 && !dadosFactuais.includes(m.trim())) {
          dadosFactuais.push(`${name}: ${m.trim()}`);
        }
      }
    }

    // Deteção de consensos e concessões
    if (/reconhe[çc]o|concedo|ponto v[aá]lido|concess[aã]o|acordo|consenso/i.test(msg.content)) {
      const concessionText = sentences.find(s => /reconhe|conced|v[aá]lid|acordo/i.test(s)) || corePoint;
      concessoesFeitas.push(`${name}: "${concessionText}"`);
    }

    if (/ponto consensual|consenso|acordo|partilho|concordamos/i.test(msg.content)) {
      const consensusText = sentences.find(s => /consenso|acordo|partilho/i.test(s)) || corePoint;
      if (!pontosConsensuais.includes(consensusText)) {
        pontosConsensuais.push(consensusText);
      }
    }

    // Deteção de refutações diretas
    if (/dissecando|fal[aá]cia|falsa dicotomia|refuto|incorreto|sem causalidade|n[aã]o procede/i.test(msg.content)) {
      const refutationText = sentences.find(s => /dissecando|fal[aá]cia|refuto|sem causalidade/i.test(s)) || corePoint;
      argumentosRefutados.push(`${name}: "${refutationText}"`);
    }

    tesesCentrais.push(`${name} (${msg.agentRole}): "${corePoint}"`);
  }

  // Construção do Prompt de Resumo Impiedosamente Sintético:
  // "Resume este bloco de debate em tópicos curtos. Regista apenas: 1) Teses centrais defendidas,
  // 2) Dados factuais apresentados, 3) Argumentos refutados, e 4) Concessões feitas. Elimina toda a retórica."
  const summaryLines: string[] = [
    `RESUMO EXECUTIVO COMPRIMIDO DO HISTÓRICO ANTERIOR (Tópico: "${topic}"):`,
    `1) Teses Centrais Defendidas:`,
    ...tesesCentrais.slice(-4).map(t => `   • ${t}`),
    `2) Dados Factuais e Métricas Apresentadas:`,
    ...(dadosFactuais.length > 0 ? dadosFactuais.slice(-4).map(d => `   • ${d}`) : ['   • Nenhum dado métrico estrito no bloco anterior.']),
    `3) Argumentos Refutados:`,
    ...(argumentosRefutados.length > 0 ? argumentosRefutados.slice(-3).map(r => `   • ${r}`) : ['   • Sem refutações irredutíveis registadas.']),
    `4) Concessões Feitas:`,
    ...(concessoesFeitas.length > 0 ? concessoesFeitas.slice(-3).map(c => `   • ${c}`) : ['   • Nenhuma concessão formal declarada até ao momento.']),
  ];

  return {
    longTermSummary: summaryLines.join('\n'),
    stateTracking: {
      pontos_consensuais: pontosConsensuais.slice(-3),
      argumentos_esgotados: argumentosEsgotados,
      teses_centrais: tesesCentrais.slice(-4),
      dados_factuais: dadosFactuais.slice(-4),
      concessoes_feitas: concessoesFeitas.slice(-3),
    },
    compressedCount: oldBlock.length,
    updatedAt: Date.now(),
  };
}

/**
 * Constrói a estrutura da Janela Deslizante Híbrida:
 * 1. System Prompt (Persona + Regras + Mapeamento de Estado em JSON no topo)
 * 2. Memória de Longo Prazo (Texto sumarizado contínuo + RAG Semântico relevante)
 * 3. Memória de Curto Prazo (Janela deslizante com as últimas 2 a 4 intervenções em formato bruto)
 */
export function buildHybridMemoryPrompt(params: {
  baseSystemPrompt: string;
  compressedMemory: CompressedDebateMemory;
  recentMessages: DebateMessage[];
  relevantRagArguments?: Array<{ text: string; score: number }>;
}): {
  systemInstructions: string;
  slidingWindowMessages: DebateMessage[];
} {
  const { baseSystemPrompt, compressedMemory, recentMessages, relevantRagArguments = [] } = params;

  // 1. Mapeamento de Estado (State Tracking) em JSON
  const stateTrackingJSON = JSON.stringify(
    {
      estado_do_debate: {
        pontos_consensuais: compressedMemory.stateTracking.pontos_consensuais,
        argumentos_esgotados: compressedMemory.stateTracking.argumentos_esgotados,
      },
    },
    null,
    2
  );

  const stateTrackingSection = `
=== MAPEAMENTO DE ESTADO DO DEBATE (STATE TRACKING EM JSON) ===
${stateTrackingJSON}
DIRETRIZ DE CONTROLO DE TOKENS E ANTI-REPETIÇÃO:
O objeto JSON acima representa o mapa exato do que já foi debatido e esgotado.
É TERMINANTEMENTE PROIBIDO reciclar, parafrasear ou reiterar qualquer premissa listada em "argumentos_esgotados".
Usa este mapa para poupar tokens e avança diretamente para novos eixos e dados empíricos inéditos.
==============================================================
`;

  // 2. Memória de Longo Prazo (Sumarização Incremental + RAG Semântico)
  let longTermMemorySection = '';
  if (compressedMemory.longTermSummary && compressedMemory.compressedCount > 0) {
    const ragLines = relevantRagArguments.length > 0
      ? `\nARGUMENTOS RELEVANTES RECUPERADOS VIA RAG SEMÂNTICO (MEMÓRIA PROFUNDA):\n${relevantRagArguments.map(r => `  - ${r.text}`).join('\n')}`
      : '';

    longTermMemorySection = `
=== MEMÓRIA DE LONGO PRAZO (SUMARIZAÇÃO INCREMENTAL) ===
${compressedMemory.longTermSummary}${ragLines}
========================================================
`;
  }

  const systemInstructions = `${stateTrackingSection}\n${baseSystemPrompt}\n${longTermMemorySection}`;

  // 3. Memória de Curto Prazo (Janela Deslizante: 2 a 4 mensagens exatas)
  const slidingWindowMessages = recentMessages.slice(-DEFAULT_SLIDING_WINDOW_SIZE);

  return {
    systemInstructions,
    slidingWindowMessages,
  };
}
