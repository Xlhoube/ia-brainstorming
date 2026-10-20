import assert from 'node:assert';
import { getMemoryDesignGuidelines, getInitialStructuredMemories, getAppAgentsFromBiblia } from '../src/lib/agents/bibliaLoader';
import { generatePodcastScript, generatePodcastChapters, generatePodcastIntroWavBlob } from '../src/lib/audio/podcastService';
import { PRESET_TOPICS } from '../src/lib/constants/topics';
import { DebateMessage } from '../src/types/debate';

console.log('🧪 A iniciar testes de validação para Fase E e Estúdio de Podcast...');

// 1. Teste de Memória Estruturada da Bíblia
console.log('1️⃣ A testar diretrizes e memórias estruturadas da Bíblia Canónica...');
const guidelines = getMemoryDesignGuidelines();
assert.ok(guidelines, 'Diretrizes de design de memória devem existir');
assert.ok(Array.isArray(guidelines.suggested_categories), 'Categorias canónicas devem ser uma lista');
assert.strictEqual(guidelines.suggested_categories.length, 6, 'Devem existir 6 categorias canónicas');

const marcusMemories = getInitialStructuredMemories('marcus_vance');
assert.ok(Array.isArray(marcusMemories), 'Marcus Vance deve ter memórias estruturadas');
assert.ok(marcusMemories.length > 0, 'Marcus Vance deve ter pelo menos um registo');
assert.ok(marcusMemories.some(m => m.category === 'confirmed_facts'), 'Marcus deve ter confirmed_facts');
assert.ok(marcusMemories.some(m => m.category === 'explicit_preferences'), 'Marcus deve ter explicit_preferences');

const agents = getAppAgentsFromBiblia();
assert.strictEqual(agents.length, 5, 'Devem ser carregados exatamente 5 agentes');
agents.forEach(agent => {
  assert.ok(agent.memory, `Agente ${agent.id} deve ter objeto de memória`);
  assert.ok(Array.isArray(agent.memory.structuredEntries), `Agente ${agent.id} deve ter structuredEntries`);
  assert.ok((agent.memory.structuredEntries?.length ?? 0) > 0, `Agente ${agent.id} deve ter registos estruturados iniciais`);
});
console.log('   ✅ Memória Estruturada Canónica validada com sucesso!');

// 2. Teste do Estúdio de Podcast
console.log('2️⃣ A testar gerador de guião e capítulos de Podcast...');
const dummyMessages: DebateMessage[] = [
  {
    id: 'msg-1',
    agentId: 'dr-marcus-vance',
    agentName: 'Dr. Marcus Vance',
    agentRole: 'Especialista em Lógica',
    avatar: '👨‍🏫',
    accentColor: '#3b82f6',
    round: 1,
    content: 'Temos de examinar a causalidade retroativa com rigor matemático inegociável.',
    timestamp: new Date().toISOString(),
    stageName: 'Análise Independente',
  },
  {
    id: 'msg-2',
    agentId: 'aura-chen',
    agentName: 'Aura Chen',
    agentRole: 'Arquiteta de Sistemas',
    avatar: '👩‍💻',
    accentColor: '#8b5cf6',
    round: 1,
    content: 'Do ponto de vista sistémico, o colapso da função de onda gera padrões estocásticos observáveis.',
    timestamp: new Date().toISOString(),
    stageName: 'Confronto de Argumentos',
  }
];

const script = generatePodcastScript(
  'Computação Quântica e Causalidade',
  'Debate sobre a flecha do tempo',
  dummyMessages,
  agents
);

assert.ok(script.includes('# 🎙️ THE FIVE PODCAST'), 'Guião deve incluir título de podcast');
assert.ok(script.includes('Dr. Marcus Vance'), 'Guião deve mencionar Marcus Vance');
assert.ok(script.includes('Aura Chen'), 'Guião deve mencionar Aura Chen');
assert.ok(script.includes('VINHETA DE ABERTURA'), 'Guião deve conter vinheta');
assert.ok(script.includes('ENCERRAMENTO'), 'Guião deve conter encerramento');

const chapters = generatePodcastChapters(dummyMessages, [
  { id: '1', name: 'Compreender', instruction: 'Compreensão' },
  { id: '2', name: 'Análise Independente', instruction: 'Análise' },
]);
assert.ok(chapters.length >= 2, 'Devem ser gerados múltiplos capítulos');
assert.strictEqual(chapters[0].startTimeSec, 0, 'Primeiro capítulo deve começar em 0s');

const wavBlob = generatePodcastIntroWavBlob(2);
assert.ok(wavBlob, 'Blob WAV deve ser gerado');
assert.strictEqual(wavBlob.type, 'audio/wav', 'MIME type deve ser audio/wav');
assert.ok(wavBlob.size > 44, 'Blob WAV deve ter cabeçalho RIFF e amostras de dados');
console.log(`   ✅ Estúdio de Podcast validado com sucesso! (Blob WAV gerado com ${wavBlob.size} bytes)`);

// 3. Teste de Tópicos Expandidos
console.log('3️⃣ A testar expansão de tópicos dialéticos...');
assert.strictEqual(PRESET_TOPICS.length, 10, 'Devem existir 10 tópicos de fronteira');
const hasQuantum = PRESET_TOPICS.some(t => t.id === 'computacao-quantica-causalidade');
const hasSyntheticBio = PRESET_TOPICS.some(t => t.id === 'biologia-sintetica-vida-artificial');
const hasBCI = PRESET_TOPICS.some(t => t.id === 'interfaces-cerebro-maquina');
assert.ok(hasQuantum, 'Deve conter tópico de computação quântica');
assert.ok(hasSyntheticBio, 'Deve conter tópico de biologia sintética');
assert.ok(hasBCI, 'Deve conter tópico de interfaces cérebro-máquina');
console.log('   ✅ 10 Tópicos Dialéticos de Fronteira Científica validados!');

console.log('\n🎉 TODOS OS TESTES DA FASE E E PODCAST STUDIO PASSARAM COM SUCESSO!');
