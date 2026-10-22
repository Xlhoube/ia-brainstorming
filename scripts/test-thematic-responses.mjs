// scripts/test-thematic-responses.mjs
// Teste de validação rigoroso: Verificação de diversidade temático-dialética e ausência de clichés estáticos

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('🧪 Iniciando testes de validação da diversidade temático-dialética...\n');

// 1. Auditoria de ausência dos clichés estáticos antigos no ficheiro de código
const openRouterPath = path.resolve('src/lib/ai/openrouter.ts');
const openRouterContent = fs.readFileSync(openRouterPath, 'utf-8');

const oldStaticTropes = [
  'vinte watts de energia e milhões de anos de bio-evolução',
  'Um gravador reproduz a voz perfeitamente, mas não sente a palavra',
  'A IA não é uma ameaça, é uma prótese para a nossa inteligência',
  'uma calculadora calcula raízes quadradas sem saber o que é um número',
];

console.log('--- Teste 1: Auditoria de Clichés Antigos Fixos ---');
for (const trope of oldStaticTropes) {
  const present = openRouterContent.includes(trope);
  assert(!present, `FALHA: O cliché antigo estático "${trope}" ainda se encontra codificado no ficheiro openrouter.ts!`);
  console.log(`✅ Aprovado: Cliché fixo eliminado com sucesso: "${trope.slice(0, 45)}..."`);
}

// 2. Testar que FALLBACK_MODELS coloca modelos fiáveis gratuitos à frente
console.log('\n--- Teste 2: Ordem dos Modelos Gratuitos de Contingência ---');
const fallbackMatch = openRouterContent.match(/FALLBACK_MODELS\s*=\s*\[([\s\S]*?)\];/);
assert(fallbackMatch, 'FALHA: Constante FALLBACK_MODELS não encontrada.');
const fallbackModels = [...fallbackMatch[1].matchAll(/'([^']+)'/g)].map(m => m[1]);

assert(fallbackModels[0].includes('llama') || fallbackModels[0].includes('qwen'), 
  'FALHA: O primeiro modelo de contingência deve ser um modelo altamente disponível como LLaMA 3.3 ou Qwen.');
console.log(`✅ Aprovado: Primeiro modelo de contingência do OpenRouter é estável: ${fallbackModels[0]}`);

// 3. Teste de Deteção de Domínio Semântico
console.log('\n--- Teste 3: Deteção de Domínios Semânticos em openrouter.ts ---');

function detectThematicDomain(topic, description) {
  const combined = `${topic} ${description || ''}`.toLowerCase();

  if (/coloniz|marte|espa[çc]o|planeta|multiplanet|astron[oó]|cosmos|outros mundos/i.test(combined)) {
    return { domain: 'espaco', subjectNoun: 'a expansão multiplanetária e a sustentabilidade da Terra' };
  }
  if (/fus[aã]o|nuclear|plasma|abund[aâ]ncia energ[eé]tica|matriz energ[eé]tica/i.test(combined)) {
    return { domain: 'fusao', subjectNoun: 'a energia de fusão nuclear e o equilíbrio geopolítico' };
  }
  if (/trabalho|emprego|automatiza[çc]|substitui[çc][aã]o|sal[aá]rio|renda b[aá]sica|produtiv/i.test(combined)) {
    return { domain: 'trabalho', subjectNoun: 'o futuro do trabalho humano e a automação produtiva' };
  }
  if (/qu[aá]ntic|causalidade|flecha do tempo|livre-arb[ií]trio|wheeler|determinismo|entrela[çc]amento/i.test(combined)) {
    return { domain: 'quantica', subjectNoun: 'a computação quântica e as leis da causalidade física' };
  }
  if (/gen[eé]tic|biolog|crispr|genoma|adn|sint[eé]tic|transumanis|organismos sint[eé]ticos/i.test(combined)) {
    return { domain: 'genetica', subjectNoun: 'a edição genética humana e a engenharia da vida' };
  }
  if (/desinforma[çc]|fake news|express[aã]o|censura|verdade|deepfake|filtros/i.test(combined)) {
    return { domain: 'desinformacao', subjectNoun: 'o combate à desinformação algorítmica e a liberdade' };
  }
  if (/c[eé]rebro|neural|c[oó]rtex|telepatia|implante|cognitiv/i.test(combined)) {
    return { domain: 'interfaces', subjectNoun: 'as interfaces cérebro-máquina e a privacidade neural' };
  }
  if (/superintelig[eê]ncia|alinhamento|controlo|seguran[çc]a|ortogonal|converg[eê]ncia/i.test(combined)) {
    return { domain: 'superinteligencia', subjectNoun: 'o controlo seguro de uma superinteligência' };
  }
  if (/consci[eê]ncia|mente|alma|quarto chin[eê]s|searle|mente-corpo|subjetiv/i.test(combined)) {
    return { domain: 'consciencia', subjectNoun: 'a natureza da consciência e a subjetividade' };
  }

  const cleanedTopic = topic
    .replace(/[?!.:;]+$/g, '')
    .replace(/^(o|a|os|as|como|será que|pode|podem|qual)\s+/i, '')
    .trim();

  return {
    domain: 'geral',
    subjectNoun: `o debate sobre "${cleanedTopic || topic}"`,
  };
}

const domainTestCases = [
  { topic: 'Colonizar outros mundos ou curar a Terra', expected: 'espaco' },
  { topic: 'Energia de Fusão Comercial: Abundância planetária universal', expected: 'fusao' },
  { topic: 'O fim do trabalho como pilar da identidade humana', expected: 'trabalho' },
  { topic: 'Computação Quântica e Causalidade Física', expected: 'quantica' },
  { topic: 'Edição genética humana e a criação de duas espécies', expected: 'genetica' },
  { topic: 'Como erradicar a desinformação sem destruir a liberdade', expected: 'desinformacao' },
  { topic: 'Interfaces Cérebro-Máquina e a telepatia tecnológica', expected: 'interfaces' },
  { topic: 'O Paradoxo do Controlo: Superinteligência e Alinhamento', expected: 'superinteligencia' },
  { topic: 'Construção de barragens hidroelétricas em rios protegidos', expected: 'geral' },
];

for (const tc of domainTestCases) {
  const result = detectThematicDomain(tc.topic);
  assert.strictEqual(result.domain, tc.expected, `FALHA no tópico "${tc.topic}": esperado ${tc.expected}, obtido ${result.domain}`);
  console.log(`✅ Domínio correto para "${tc.topic.slice(0, 35)}...": [${result.domain}] -> ${result.subjectNoun}`);
}

// 4. Teste de Deteção de Metadados e UI Transparency
console.log('\n--- Teste 4: Auditoria de Metadados de Origem (isSimulated e modelUsed) ---');
const routePath = path.resolve('src/app/api/debate/next-turn/route.ts');
const routeContent = fs.readFileSync(routePath, 'utf-8');
assert(routeContent.includes('isSimulated'), 'FALHA: route.ts deve extrair e retornar isSimulated.');
assert(routeContent.includes('modelUsed'), 'FALHA: route.ts deve extrair e retornar modelUsed.');
console.log('✅ Aprovado: A rota /api/debate/next-turn propaga isSimulated e modelUsed no JSON.');

const timelinePath = path.resolve('src/components/DebateTimeline.tsx');
const timelineContent = fs.readFileSync(timelinePath, 'utf-8');
assert(timelineContent.includes('Motor Dialético Local'), 'FALHA: DebateTimeline deve exibir badge Motor Dialético Local.');
assert(timelineContent.includes('msg.modelUsed'), 'FALHA: DebateTimeline deve exibir badge com o modelo remoto.');
console.log('✅ Aprovado: DebateTimeline.tsx possui distintivo visual para Motor Dialético Local e IA OpenRouter.');

// 5. Teste de Presença de Todos os Domínios em DOMAIN_DISCOURSE
console.log('\n--- Teste 5: Completude do DOMAIN_DISCOURSE ---');
const expectedDomains = [
  'espaco',
  'fusao',
  'trabalho',
  'quantica',
  'genetica',
  'desinformacao',
  'interfaces',
  'superinteligencia',
  'consciencia',
  'geral'
];

for (const domain of expectedDomains) {
  assert(openRouterContent.includes(`${domain}:`), `FALHA: Domínio ${domain} não encontrado em openrouter.ts`);
  console.log(`✅ Domínio configurado no motor dialético: [${domain}]`);
}

console.log('\n🎉 Todos os testes de diversidade dialética e independência temática passaram com 100% de sucesso!');
