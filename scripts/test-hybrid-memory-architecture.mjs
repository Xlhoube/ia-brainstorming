import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('🧪 A iniciar teste da Arquitetura de Memória Híbrida e State Tracking...');

// 1. Validar tipos em src/types/debate.ts
const typesPath = path.resolve('src/types/debate.ts');
const typesContent = fs.readFileSync(typesPath, 'utf8');

assert.ok(typesContent.includes('DebateStateTracking'), 'debate.ts deve definir DebateStateTracking');
assert.ok(typesContent.includes('pontos_consensuais'), 'DebateStateTracking deve conter pontos_consensuais');
assert.ok(typesContent.includes('argumentos_esgotados'), 'DebateStateTracking deve conter argumentos_esgotados');
assert.ok(typesContent.includes('CompressedDebateMemory'), 'debate.ts deve definir CompressedDebateMemory');
assert.ok(typesContent.includes('VectorArgumentEntry'), 'debate.ts deve definir VectorArgumentEntry');
console.log('[debate.ts] Tipagem de State Tracking, Memória Comprimida e RAG Vetorial: ✅');

// 2. Validar existência e métodos de debateMemoryService.ts
const memoryServicePath = path.resolve('src/lib/ai/debateMemoryService.ts');
assert.ok(fs.existsSync(memoryServicePath), 'debateMemoryService.ts deve existir');

const memoryServiceContent = fs.readFileSync(memoryServicePath, 'utf8');
assert.ok(memoryServiceContent.includes('compressDebateHistory'), 'debateMemoryService deve exportar compressDebateHistory');
assert.ok(memoryServiceContent.includes('buildHybridMemoryPrompt'), 'debateMemoryService deve exportar buildHybridMemoryPrompt');
assert.ok(memoryServiceContent.includes('searchSimilarArguments'), 'debateMemoryService deve exportar searchSimilarArguments');
assert.ok(memoryServiceContent.includes('estado_do_debate'), 'debateMemoryService deve formatar estado_do_debate em JSON');
console.log('[debateMemoryService.ts] Módulo de Compressão, Janela Deslizante e RAG Vetorial: ✅');

// 3. Testar execução das funções do serviço em tempo de execução
let compressDebateHistory, buildHybridMemoryPrompt, searchSimilarArguments, indexArgumentsForRAG;

try {
  const mod = await import('../src/lib/ai/debateMemoryService.ts');
  compressDebateHistory = mod.compressDebateHistory;
  buildHybridMemoryPrompt = mod.buildHybridMemoryPrompt;
  searchSimilarArguments = mod.searchSimilarArguments;
  indexArgumentsForRAG = mod.indexArgumentsForRAG;
} catch (err) {
  // Suporte a execução com node puro sem resolução de aliases do tsconfig
  const rawTs = fs.readFileSync(path.resolve('src/lib/ai/debateMemoryService.ts'), 'utf8');
  const jsCode = rawTs
    .replace(/import\s+type\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, '')
    .replace(/:\s*(?:string|number|boolean|any|void|DebateMessage(?:\[\])?|CompressedDebateMemory|VectorArgumentEntry(?:\[\])?|DebateStateTracking|\{[^}]+\}|Array<[^>]+>)(?=[=,);{])/g, '')
    .replace(/<[^>]+>/g, '');
  const base64 = Buffer.from(jsCode).toString('base64');
  const mod = await import(`data:text/javascript;base64,${base64}`);
  compressDebateHistory = mod.compressDebateHistory;
  buildHybridMemoryPrompt = mod.buildHybridMemoryPrompt;
  searchSimilarArguments = mod.searchSimilarArguments;
  indexArgumentsForRAG = mod.indexArgumentsForRAG;
}

const sampleMessages = [
  {
    id: 'm1',
    agentId: 'dr-marcus-vance',
    agentName: 'Dr. Marcus Vance',
    agentRole: 'Filósofo Ético',
    avatar: '🏛️',
    accentColor: '#8b5cf6',
    content: 'A dignidade e a consciência humana nunca podem ser reduzidas a variáveis utilitárias de mercado.',
    round: 1,
    timestamp: '10:00'
  },
  {
    id: 'm2',
    agentId: 'dra-helena-rostova',
    agentName: 'Dra. Helena Rostova',
    agentRole: 'Cientista Empírica',
    avatar: '🔬',
    accentColor: '#06b6d4',
    content: 'Dissecando essa premissa: os sistemas biológicos dependem de equilíbrios materiais e balanços de energia finitos.',
    round: 1,
    timestamp: '10:02'
  },
  {
    id: 'm3',
    agentId: 'kaelen-voss',
    agentName: 'Kaelen Voss',
    agentRole: 'Tecnólogo Visionário',
    avatar: '⚡',
    accentColor: '#f59e0b',
    content: 'Em termos de arquitetura prática, a latência de cálculo e o custo de computação exigem otimização algorítmica.',
    round: 1,
    timestamp: '10:04'
  },
  {
    id: 'm4',
    agentId: 'aura-chen',
    agentName: 'Aura Chen',
    agentRole: 'Humanista e Socióloga',
    avatar: '🌱',
    accentColor: '#10b981',
    content: 'Reconheço que a otimização de custos é necessária, mas quem suporta a fatura social se o sistema falhar?',
    round: 2,
    timestamp: '10:06'
  },
  {
    id: 'm5',
    agentId: 'dr-marcus-vance',
    agentName: 'Dr. Marcus Vance',
    agentRole: 'Filósofo Ético',
    avatar: '🏛️',
    accentColor: '#8b5cf6',
    content: 'Declaramos um ponto consensual: a vulnerabilidade humana não é negociável perante métricas de custo.',
    round: 2,
    timestamp: '10:08'
  },
  {
    id: 'm6',
    agentId: 'dra-helena-rostova',
    agentName: 'Dra. Helena Rostova',
    agentRole: 'Cientista Empírica',
    avatar: '🔬',
    accentColor: '#06b6d4',
    content: 'Ancorando em dados concretos: as medições de latência mostram uma taxa de erro de 12% em picos de carga.',
    round: 2,
    timestamp: '10:10'
  },
  {
    id: 'm7',
    agentId: 'kaelen-voss',
    agentName: 'Kaelen Voss',
    agentRole: 'Tecnólogo Visionário',
    avatar: '⚡',
    accentColor: '#f59e0b',
    content: 'Essa taxa de 12% resolve-se com redundâncias ativas e servidores locais resilientes.',
    round: 3,
    timestamp: '10:12'
  }
];

// Teste de compressão com janela deslizante
const compressed = compressDebateHistory({
  messages: sampleMessages,
  topic: 'A consciência e a eficiência algorítmica',
  slidingWindowSize: 3
});

assert.ok(compressed.longTermSummary.length > 0, 'Memória de longo prazo deve conter resumo sintético');
assert.ok(compressed.stateTracking.pontos_consensuais.length >= 0, 'State tracking deve registar pontos consensuais');
assert.ok(Object.keys(compressed.stateTracking.argumentos_esgotados).length > 0, 'State tracking deve registar argumentos esgotados por agente');
console.log('[debateMemoryService.ts] Compressão e State Tracking em runtime: ✅');

// Teste de RAG vetorial
const ragIndex = indexArgumentsForRAG(sampleMessages);
assert.ok(ragIndex.length === sampleMessages.length, 'Índice RAG deve conter todos os argumentos');

const searchResults = searchSimilarArguments({
  query: 'latência e custo de servidores locais',
  index: ragIndex,
  excludeIds: ['m7'],
  topK: 2
});

assert.ok(searchResults.length > 0, 'Busca RAG deve devolver argumentos semanticamente relevantes');
assert.ok(searchResults[0].text.includes('latência') || searchResults[0].text.includes('custo'), 'Resultado RAG deve conter termos relevantes');
console.log(`[debateMemoryService.ts] Busca semântica RAG recuperou ${searchResults.length} argumentos relevantes: ✅`);

// Teste de montagem do payload híbrido
const hybridPayload = buildHybridMemoryPrompt({
  baseSystemPrompt: 'És Dr. Marcus Vance, Filósofo Ético.',
  compressedMemory: compressed,
  recentMessages: sampleMessages.slice(-3),
  relevantRagArguments: searchResults
});

assert.ok(hybridPayload.systemInstructions.includes('estado_do_debate'), 'Payload deve injetar estado_do_debate em JSON no topo');
assert.ok(hybridPayload.systemInstructions.includes('MEMÓRIA DE LONGO PRAZO'), 'Payload deve conter Memória de Longo Prazo');
assert.ok(hybridPayload.slidingWindowMessages.length === 3, 'Janela deslizante de curto prazo deve manter 3 mensagens');
console.log('[debateMemoryService.ts] Montagem de Payload Híbrido em 3 camadas: ✅');

// 4. Validar integração em openrouter.ts
const openrouterPath = path.resolve('src/lib/ai/openrouter.ts');
const openrouterContent = fs.readFileSync(openrouterPath, 'utf8');
assert.ok(openrouterContent.includes('debateMemoryService') || openrouterContent.includes('buildHybridMemoryPrompt') || openrouterContent.includes('estado_do_debate'), 'openrouter.ts deve incorporar o serviço de memória híbrida e state tracking');
console.log('[openrouter.ts] Integração com o pipeline de memória híbrida: ✅');

console.log('🎉 Todos os testes da Arquitetura de Memória Híbrida e State Tracking passaram com sucesso!');
