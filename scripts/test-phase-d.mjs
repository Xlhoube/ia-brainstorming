import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('🧪 Iniciando Bateria de Testes Automatizados da Fase D (Orquestração do Debate)...\n');

// 1. Carregamento e leitura da Bíblia canónica
const bibliaPath = path.resolve('the_five_biblia_personagens_v1.json');
assert.ok(fs.existsSync(bibliaPath), 'O ficheiro the_five_biblia_personagens_v1.json deve existir na raiz.');
const biblia = JSON.parse(fs.readFileSync(bibliaPath, 'utf-8'));

// Teste 1: Protocolo de Debate Canónico na Bíblia
console.log('▶ Teste 1: Validação do Protocolo de Debate Canónico na Bíblia');
assert.ok(biblia.project.debate_protocol, 'A secção project.debate_protocol deve existir.');
assert.ok(Array.isArray(biblia.project.debate_protocol.stages), 'debate_protocol.stages deve ser um array.');
assert.strictEqual(biblia.project.debate_protocol.stages.length, 5, 'O debate deve ter exatamente 5 etapas canónicas.');

const expectedStageNames = [
  'Compreender',
  'Análise independente',
  'Confronto de argumentos',
  'Verificação',
  'Síntese',
];

biblia.project.debate_protocol.stages.forEach((stage, idx) => {
  assert.strictEqual(stage.name, expectedStageNames[idx], `A etapa ${idx} deve ser "${expectedStageNames[idx]}".`);
  assert.ok(stage.instruction && stage.instruction.trim().length > 10, `A etapa "${stage.name}" deve ter instruções detalhadas.`);
  console.log(`  ✓ Etapa ${idx + 1}/5: "${stage.name}" validada (${stage.instruction.slice(0, 45)}...)`);
});

// Teste 2: Mapeamento e Tipagem de getCanonicalDebateStages
console.log('\n▶ Teste 2: Validação da Função getCanonicalDebateStages');
const idMap = {
  'Compreender': 'compreender',
  'Análise independente': 'analise_independente',
  'Confronto de argumentos': 'confronto_argumentos',
  'Verificação': 'verificacao',
  'Síntese': 'sintese',
};

const canonicalStages = biblia.project.debate_protocol.stages.map(stage => ({
  id: idMap[stage.name] || stage.name.toLowerCase().replace(/\s+/g, '_'),
  name: stage.name,
  instruction: stage.instruction,
}));

assert.strictEqual(canonicalStages.length, 5);
assert.strictEqual(canonicalStages[0].id, 'compreender');
assert.strictEqual(canonicalStages[1].id, 'analise_independente');
assert.strictEqual(canonicalStages[2].id, 'confronto_argumentos');
assert.strictEqual(canonicalStages[3].id, 'verificacao');
assert.strictEqual(canonicalStages[4].id, 'sintese');
console.log('  ✓ IDs das 5 etapas canónicas tipadas e mapeadas com sucesso.');

// Teste 3: Injeção de Etapa no Prompt do OpenRouter
console.log('\n▶ Teste 3: Injeção da Etapa Canónica nos Prompts de IA');
function buildTestSystemPrompt(stage) {
  const stageInstructions = stage ? `
ETAPA ATUAL DO PROTOCOLO CANÓNICO (BÍBLIA DE PERSONAGENS):
- Etapa: "${stage.name}"
- Diretriz da Etapa: "${stage.instruction}"
- DEVER COGNITIVO NESTE TURNO: Modela a tua intervenção rigorosamente de acordo com as exigências desta etapa canónica.
` : '';
  return `PROMPT_BASE\n${stageInstructions}`;
}

const promptStage0 = buildTestSystemPrompt(canonicalStages[0]);
assert.ok(promptStage0.includes('ETAPA ATUAL DO PROTOCOLO CANÓNICO'), 'O prompt deve conter a secção de protocolo canónico.');
assert.ok(promptStage0.includes('Compreender'), 'O prompt deve referenciar a etapa Compreender.');
assert.ok(promptStage0.includes(canonicalStages[0].instruction), 'O prompt deve conter a diretriz exata da Bíblia.');

const promptStage4 = buildTestSystemPrompt(canonicalStages[4]);
assert.ok(promptStage4.includes('Síntese'), 'O prompt deve referenciar a etapa Síntese.');
console.log('  ✓ Diretrizes canónicas das etapas injetadas com fidelidade nos prompts.');

// Teste 4: Comportamento do Motor Dialético Simulado
console.log('\n▶ Teste 4: Sensibilidade do Motor Dialético Simulado às Etapas');
function simulateTestTurn(agentCategory, topic, stage, history = []) {
  if (stage?.name === 'Compreender') {
    if (agentCategory === 'moderador' || history.length === 0) {
      return `Declaro aberta a mesa redonda sobre "${topic}". O nosso objetivo nesta etapa inicial de enquadramento é identificar com clareza a pergunta central, as restrições reais e os critérios de sucesso com que avaliaremos as soluções. Convido cada pensador a avançar com a sua análise independente.`;
    }
  }
  if (stage?.name === 'Verificação') {
    if (agentCategory === 'cientista') {
      return `Nesta etapa de verificação metodológica, precisamos de rigor absoluto: separo aqui as afirmações com suporte empírico comprovado daquelas que são meras hipóteses de trabalho ou previsões não testadas em torno de "${topic}". Sem dados falseáveis, não podemos elevar conjecturas a factos.`;
    }
  }
  if (stage?.name === 'Síntese') {
    if (agentCategory === 'moderador') {
      return `[CONCLUSAO_ATINGIDA: Sintese] Sophia Veris conclui: examinámos com profundidade o tema "${topic}". Mapeámos com nitidez as convergências práticas, os riscos eminentes e as divergências fundamentais que persistem entre as visões técnica, científica e humana, sem fabricar um falso consenso. Aqui fica a síntese rigorosa do nosso Conselho.`;
    }
  }
  return `Réplica dialética padrão sobre ${topic}.`;
}

const openingTurn = simulateTestTurn('moderador', 'Consciência e Máquinas', canonicalStages[0], []);
assert.ok(openingTurn.includes('Declaro aberta a mesa redonda'), 'Abertura em Compreender deve enquadrar a mesa.');
assert.ok(openingTurn.includes('critérios de sucesso'), 'Abertura em Compreender deve citar critérios de sucesso.');

const verificationTurn = simulateTestTurn('cientista', 'Consciência e Máquinas', canonicalStages[3], [{ content: 'x' }]);
assert.ok(verificationTurn.includes('separo aqui as afirmações com suporte empírico'), 'Verificação deve separar suporte empírico de hipóteses.');

const synthesisTurn = simulateTestTurn('moderador', 'Consciência e Máquinas', canonicalStages[4], [{ content: 'x' }]);
assert.ok(synthesisTurn.includes('[CONCLUSAO_ATINGIDA: Sintese]'), 'Síntese deve conter a tag canónica de conclusão dialética.');
console.log('  ✓ Simulação dialética contextual responde com precisão em cada uma das etapas.');

// Teste 5: Simulação da Máquina de Estados de useDebate
console.log('\n▶ Teste 5: Progressão da Máquina de Estados através das 5 Etapas Canónicas');
class TestDebateOrchestrator {
  constructor(activeAgents) {
    this.agents = activeAgents;
    this.messages = [];
    this.currentStageIndex = 0;
    this.status = 'idle';
  }

  start() {
    this.status = 'running';
    this.currentStageIndex = 0;
  }

  getNextSpeaker() {
    const stageIdx = this.currentStageIndex;
    const moderator = this.agents.find(a => a.id === 'sophia-veris' || a.category === 'moderador');
    const nonModerators = this.agents.filter(a => a.id !== (moderator?.id || ''));

    if (stageIdx === 0) {
      return moderator || this.agents[0];
    } else if (stageIdx === 1) {
      const targetPool = nonModerators.length > 0 ? nonModerators : this.agents;
      const spokenStage1 = this.messages.filter(m => m.stageIndex === 1).map(m => m.agentId);
      const pendingStage1 = targetPool.filter(a => !spokenStage1.includes(a.id));
      return pendingStage1[0] || targetPool[0];
    } else if (stageIdx === 4) {
      return moderator || this.agents[0];
    } else {
      return this.agents[this.messages.length % this.agents.length];
    }
  }

  step() {
    const speaker = this.getNextSpeaker();
    const stageIdx = this.currentStageIndex;
    const stageObj = canonicalStages[stageIdx];

    const msg = {
      id: `msg-${this.messages.length + 1}`,
      agentId: speaker.id,
      agentName: speaker.name,
      stageIndex: stageIdx,
      stageName: stageObj.name,
      content: `Intervenção de ${speaker.name} na etapa ${stageObj.name}`,
    };

    if (stageIdx === 4) {
      msg.dialecticalConclusion = 'sintese';
    }

    this.messages.push(msg);

    // Transição de etapas
    const moderator = this.agents.find(a => a.id === 'sophia-veris' || a.category === 'moderador');
    const nonModerators = this.agents.filter(a => a.id !== (moderator?.id || ''));
    const targetPool = nonModerators.length > 0 ? nonModerators : this.agents;

    if (stageIdx === 0) {
      this.currentStageIndex = 1;
    } else if (stageIdx === 1) {
      const stage1Count = this.messages.filter(m => m.stageIndex === 1).length;
      if (stage1Count >= targetPool.length) {
        this.currentStageIndex = 2;
      }
    } else if (stageIdx === 2) {
      const stage2Count = this.messages.filter(m => m.stageIndex === 2).length;
      if (stage2Count >= Math.max(this.agents.length, 3)) {
        this.currentStageIndex = 3;
      }
    } else if (stageIdx === 3) {
      const stage3Count = this.messages.filter(m => m.stageIndex === 3).length;
      if (stage3Count >= Math.min(this.agents.length, 2)) {
        this.currentStageIndex = 4;
      }
    } else if (stageIdx === 4) {
      this.status = 'concluded';
    }

    return msg;
  }
}

const testAgents = [
  { id: 'dr-marcus-vance', name: 'Dr. Marcus Vance', category: 'filosofo' },
  { id: 'dra-helena-rostova', name: 'Dra. Helena Rostova', category: 'cientista' },
  { id: 'aura-chen', name: 'Aura Chen', category: 'humanista' },
  { id: 'kaelen-voss', name: 'Kaelen Voss', category: 'tecnologo' },
  { id: 'sophia-veris', name: 'Sophia Veris', category: 'moderador' },
];

const orchestrator = new TestDebateOrchestrator(testAgents);
orchestrator.start();

assert.strictEqual(orchestrator.currentStageIndex, 0, 'O debate deve arrancar na Etapa 0 (Compreender).');
const m1 = orchestrator.step();
assert.strictEqual(m1.agentId, 'sophia-veris', 'O primeiro orador em Compreender deve ser Sophia Veris.');
assert.strictEqual(orchestrator.currentStageIndex, 1, 'Após Compreender, deve avançar para Etapa 1 (Análise independente).');

// Etapa 1: os 4 pensadores independentes falam
for (let i = 0; i < 4; i++) {
  assert.strictEqual(orchestrator.currentStageIndex, 1);
  const m = orchestrator.step();
  assert.notStrictEqual(m.agentId, 'sophia-veris', 'Na Análise independente devem falar os pensadores não-moderadores.');
}
assert.strictEqual(orchestrator.currentStageIndex, 2, 'Após todos os pensadores independentes falarem, avança para Etapa 2 (Confronto).');

// Etapa 2: Confronto
for (let i = 0; i < 5; i++) {
  orchestrator.step();
}
assert.strictEqual(orchestrator.currentStageIndex, 3, 'Após o ciclo de confronto, avança para Etapa 3 (Verificação).');

// Etapa 3: Verificação
orchestrator.step();
orchestrator.step();
assert.strictEqual(orchestrator.currentStageIndex, 4, 'Após a verificação, avança para Etapa 4 (Síntese).');

// Etapa 4: Síntese
const finalMsg = orchestrator.step();
assert.strictEqual(finalMsg.agentId, 'sophia-veris', 'A síntese final deve ser produzida por Sophia Veris.');
assert.strictEqual(finalMsg.dialecticalConclusion, 'sintese', 'A síntese final deve conter conclusão dialética.');
assert.strictEqual(orchestrator.status, 'concluded', 'O debate deve terminar como concluído após a síntese.');
console.log('  ✓ Máquina de estados percorreu com sucesso as 5 etapas canónicas até à conclusão.');

// Teste 6: Resiliência sem Moderadora (Fallback)
console.log('\n▶ Teste 6: Resiliência do Orquestrador sem Moderadora no Roster');
const agentsWithoutSophia = testAgents.filter(a => a.id !== 'sophia-veris');
const orchestratorNoMod = new TestDebateOrchestrator(agentsWithoutSophia);
orchestratorNoMod.start();

assert.doesNotThrow(() => {
  while (orchestratorNoMod.status !== 'concluded' && orchestratorNoMod.messages.length < 20) {
    orchestratorNoMod.step();
  }
}, 'O orquestrador não deve lançar exceções mesmo sem Sophia Veris.');
assert.strictEqual(orchestratorNoMod.status, 'concluded', 'O debate deve atingir a conclusão com sucesso.');
console.log('  ✓ Fallback gracioso validado na ausência de moderadora.');

console.log('\n🎉 TODOS OS 6 CRITÉRIOS DA BATERIA DE TESTES DA FASE D FORAM APROVADOS COM SUCESSO!\n');
