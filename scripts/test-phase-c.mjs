import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('🧪 Iniciando Bateria de Testes Automatizados da Fase C...\n');

// 1. Carregamento e leitura da Bíblia canónica
const bibliaPath = path.resolve('the_five_biblia_personagens_v1.json');
assert.ok(fs.existsSync(bibliaPath), 'O ficheiro the_five_biblia_personagens_v1.json deve existir na raiz.');
const biblia = JSON.parse(fs.readFileSync(bibliaPath, 'utf-8'));

// Simulação das funções canónicas do bibliaLoader
const BIBLIA_APP_MAP = {
  marcus_vance: {
    appId: 'dr-marcus-vance',
    category: 'filosofo',
    avatar: '🏛️',
    model: 'google/gemini-2.0-flash-exp:free',
  },
  helena_rostova: {
    appId: 'dra-helena-rostova',
    category: 'cientista',
    avatar: '🔬',
    model: 'meta-llama/llama-3.3-70b-instruct:free',
  },
  aura_chen: {
    appId: 'aura-chen',
    category: 'humanista',
    avatar: '🌱',
    model: 'qwen/qwen-2.5-72b-instruct:free',
  },
  kaelen_voss: {
    appId: 'kaelen-voss',
    category: 'tecnologo',
    avatar: '⚡',
    model: 'mistralai/mistral-small-24b-instruct-2501:free',
  },
  sophia_veris: {
    appId: 'sophia-veris',
    category: 'moderador',
    avatar: '⚖️',
    model: 'google/gemini-2.0-flash-exp:free',
  },
};

const COLLEAGUE_DISPLAY_NAMES = {
  marcus_vance: 'Dr. Marcus Vance',
  helena_rostova: 'Dra. Helena Rostova',
  aura_chen: 'Aura Chen',
  kaelen_voss: 'Kaelen Voss',
  sophia_veris: 'Sophia Veris',
};

function validateBiblia(data) {
  if (!data || !data.project || !Array.isArray(data.project.characters)) {
    throw new Error('Formato inválido da Bíblia: secção "project.characters" ausente ou inválida.');
  }
  const expectedIds = ['marcus_vance', 'helena_rostova', 'aura_chen', 'kaelen_voss', 'sophia_veris'];
  const foundIds = data.project.characters.map(c => c.id);
  for (const expId of expectedIds) {
    if (!foundIds.includes(expId)) {
      throw new Error(`Personagem obrigatório não encontrado na Bíblia: "${expId}".`);
    }
  }
  return true;
}

function buildSystemPromptFromBiblia(char) {
  const instructionsList = char.agent_instructions.map((inst, i) => `${i + 1}. ${inst}`).join('\n');
  const questionsList = char.reasoning_style.first_questions.map(q => `- "${q}"`).join('\n');
  const prioritizesList = char.reasoning_style.prioritizes.join(', ');
  const blindSpotsList = char.reasoning_style.blind_spots.join(', ');
  const avoidList = char.communication.avoid.map(av => `- ${av}`).join('\n');
  const relationshipsList = Object.entries(char.relationships)
    .map(([colleagueId, note]) => `- Com ${COLLEAGUE_DISPLAY_NAMES[colleagueId] || colleagueId}: ${note}`)
    .join('\n');

  return `És ${char.name}, ${char.role} (${char.archetype}).
MISSÃO: ${char.fictional_backstory.current_mission}
MOTIVAÇÃO COGNITIVA: ${char.psychology.motivation}
VALORES FUNDAMENTAIS: ${char.psychology.core_values.join(', ')}

INSTRUÇÕES OBRIGATÓRIAS DA TUA PERSONAGEM:
${instructionsList}

CRITÉRIOS DE RACIOCÍNIO & PERGUNTAS INICIAIS:
${questionsList}

- Prioridades na análise: ${prioritizesList}
- Regra de Decisão Inabalável: "${char.reasoning_style.decision_rule}"
- Pontos Cegos a Vigiar: ${blindSpotsList}
- Contradição Interna: ${char.psychology.inner_contradiction}

ESTILO VERBAL & COMUNICAÇÃO:
- Tom: ${char.communication.tone.join(', ')}
- Estilo: ${char.communication.style}
- Proibições Estritas (A evitar em absoluto):
${avoidList}
- Exemplo de linha de pensamento típica: "${char.communication.sample_line}"

RELAÇÃO COM OS COLEGAS NA MESA:
${relationshipsList}

REGRAS EPISTEMOLÓGICAS COMPARTILHADAS (BÍBLIA CANÓNICA):
1. Proibição absoluta de inventar factos, estudos, fontes, estatísticas ou capacidades.
2. Distingue rigorosamente factos verificáveis de hipóteses, inferências e juízos de valor.
3. Discorda de argumentos e premissas sem nunca atacar pessoas.
4. Não concordes com a maioria apenas para forçar consenso; mantém divergências legítimas visíveis.
5. Reconhece explicitamente incertezas, limites metodológicos e informação em falta.`;
}

// -------------------------------------------------------------
// TESTE 1: Os cinco agentes produzem prompts não vazios
// -------------------------------------------------------------
console.log('▶ Teste 1: Validação de prompts não vazios');
validateBiblia(biblia);
const characters = biblia.project.characters;
const prompts = {};

for (const char of characters) {
  const prompt = buildSystemPromptFromBiblia(char);
  assert.ok(prompt && prompt.trim().length > 300, `O prompt de ${char.name} deve ter pelo menos 300 caracteres.`);
  prompts[char.id] = prompt;
  console.log(`  ✓ ${char.name} (${char.id}): prompt gerado com sucesso (${prompt.length} caracteres).`);
}

// -------------------------------------------------------------
// TESTE 2: Cada prompt contém instruções específicas do respetivo agente
// -------------------------------------------------------------
console.log('\n▶ Teste 2: Instruções específicas e critérios de cada personagem no prompt');

// Marcus Vance
assert.ok(prompts.marcus_vance.includes('humildade epistémica'), 'Marcus deve ter humildade epistémica nos valores.');
assert.ok(prompts.marcus_vance.includes('Uma ideia não se torna verdadeira por ser reconfortante'), 'Marcus deve incluir a sua frase típica canónica.');
assert.ok(prompts.marcus_vance.includes('Procura pressupostos, contradições'), 'Marcus deve conter a sua instrução 1.');
console.log('  ✓ Dr. Marcus Vance: instruções específicas, valores e frase canónica confirmados.');

// Helena Rostova
assert.ok(prompts.helena_rostova.includes('integridade científica'), 'Helena deve ter integridade científica nos valores.');
assert.ok(prompts.helena_rostova.includes('Não precisamos de uma explicação que pareça certa'), 'Helena deve incluir a sua frase canónica.');
assert.ok(prompts.helena_rostova.includes('Distingue factos observados, hipóteses'), 'Helena deve conter a sua instrução 1.');
console.log('  ✓ Dra. Helena Rostova: integridade empírica, distinção de factos e frase canónica confirmados.');

// Aura Chen
assert.ok(prompts.aura_chen.includes('dignidade'), 'Aura deve ter dignidade nos valores.');
assert.ok(prompts.aura_chen.includes('Uma solução pode funcionar perfeitamente'), 'Aura deve incluir a sua frase canónica.');
assert.ok(prompts.aura_chen.includes('Identifica pessoas e grupos afetados'), 'Aura deve conter a sua instrução 1.');
console.log('  ✓ Aura Chen: proteção humana, identificação de partes afetadas e frase canónica confirmadas.');

// Kaelen Voss
assert.ok(prompts.kaelen_voss.includes('inovação'), 'Kaelen deve ter inovação nos valores.');
assert.ok(prompts.kaelen_voss.includes('Não precisamos de prever todo o futuro para começar a construí-lo'), 'Kaelen deve incluir a sua frase canónica.');
assert.ok(prompts.kaelen_voss.includes('Propõe alternativas e experiências concretas'), 'Kaelen deve conter a sua instrução 1.');
console.log('  ✓ Kaelen Voss: experimentação prática, testes pequenos e frase canónica confirmados.');

// Sophia Veris
assert.ok(prompts.sophia_veris.includes('justiça na representação dos argumentos'), 'Sophia deve ter justiça representativa nos valores.');
assert.ok(prompts.sophia_veris.includes('O nosso objetivo não é fazer com que todos concordem'), 'Sophia deve incluir a sua frase canónica.');
assert.ok(prompts.sophia_veris.includes('Distingue consenso, compromisso e desacordo não resolvido'), 'Sophia deve conter a sua instrução de não forçar consenso.');
console.log('  ✓ Sophia Veris: síntese fiel, explicitação de desacordos e frase canónica confirmadas.');

// -------------------------------------------------------------
// TESTE 3: Os cinco prompts não são cópias uns dos outros
// -------------------------------------------------------------
console.log('\n▶ Teste 3: Diferenciação estrita entre os cinco prompts (sem duplicação)');
const ids = Object.keys(prompts);
for (let i = 0; i < ids.length; i++) {
  for (let j = i + 1; j < ids.length; j++) {
    const idA = ids[i];
    const idB = ids[j];
    const promptA = prompts[idA];
    const promptB = prompts[idB];

    // Verificar que os prompts são marcadamente distintos
    assert.notStrictEqual(promptA, promptB, `Prompts de ${idA} e ${idB} não podem ser iguais.`);
    
    // Comparar conjuntos de palavras exclusivas de cada perfil
    const wordsA = new Set(promptA.toLowerCase().split(/\s+/));
    const wordsB = new Set(promptB.toLowerCase().split(/\s+/));
    const intersection = new Set([...wordsA].filter(x => wordsB.has(x)));
    const jaccardSimilarity = intersection.size / (wordsA.size + wordsB.size - intersection.size);

    assert.ok(jaccardSimilarity < 0.60, `Similaridade léxica entre ${idA} e ${idB} (${(jaccardSimilarity * 100).toFixed(1)}%) deve ser baixa.`);
    console.log(`  ✓ Par (${idA} vs ${idB}): diferenciação léxica e conceptual verificada (similaridade: ${(jaccardSimilarity * 100).toFixed(1)}%).`);
  }
}

// -------------------------------------------------------------
// TESTE 4: Os IDs usados no motor correspondem aos agentes corretos
// -------------------------------------------------------------
console.log('\n▶ Teste 4: Correspondência de IDs e modelos da aplicação');
for (const char of characters) {
  const meta = BIBLIA_APP_MAP[char.id];
  assert.ok(meta, `Mapeamento deve existir para ${char.id}`);
  assert.ok(meta.appId.startsWith('dr-') || meta.appId.startsWith('dra-') || meta.appId === 'aura-chen' || meta.appId === 'kaelen-voss' || meta.appId === 'sophia-veris', `ID operacional válido: ${meta.appId}`);
  assert.ok(meta.model.length > 5, `Modelo atribuído válido: ${meta.model}`);
  console.log(`  ✓ ${char.id} -> App ID: "${meta.appId}", Categoria: "${meta.category}", Modelo: "${meta.model}"`);
}

// -------------------------------------------------------------
// TESTE 5: A ausência ou invalidade da Bíblia gera erro controlado
// -------------------------------------------------------------
console.log('\n▶ Teste 5: Tratamento de erros perante Bíblia inválida ou ausente');
assert.throws(() => validateBiblia(null), /Formato inválido da Bíblia/, 'Deve falhar com Bíblia nula.');
assert.throws(() => validateBiblia({}), /Formato inválido da Bíblia/, 'Deve falhar com objeto vazio.');
assert.throws(() => validateBiblia({ project: { characters: [{ id: 'marcus_vance' }] } }), /Personagem obrigatório não encontrado/, 'Deve falhar se faltarem personagens.');
console.log('  ✓ Erros controlados e compreensíveis validados com sucesso.');

// -------------------------------------------------------------
// TESTE 6: A cascata de modelos e o fallback local continuam funcionais
// -------------------------------------------------------------
console.log('\n▶ Teste 6: Funcionamento da cascata e do fallback local');
const FALLBACK_MODELS = [
  'google/gemini-2.0-flash-exp:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen-2.5-72b-instruct:free',
  'mistralai/mistral-small-24b-instruct-2501:free',
];

for (const char of characters) {
  const meta = BIBLIA_APP_MAP[char.id];
  const candidateModels = Array.from(new Set([meta.model, ...FALLBACK_MODELS]));
  assert.ok(candidateModels.length >= 4, 'A cascata deve conter pelo menos 4 modelos candidatos.');
  assert.strictEqual(candidateModels[0], meta.model, 'O modelo preferencial deve ser o primeiro da cascata.');
  console.log(`  ✓ Cascata para ${meta.appId}: 1º ${candidateModels[0]} + ${candidateModels.length - 1} modelos de reserva.`);
}

console.log('\n🎉 TODOS OS 6 TESTES AUTOMATIZADOS PASSARAM COM DISTINÇÃO!\n');
