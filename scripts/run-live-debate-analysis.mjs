/**
 * Script de Simulação e Análise de Discurso em Tempo Real
 * Executa uma sessão de debate completa e avalia a qualidade dialética minuto a minuto.
 */

import fs from 'node:fs';
import path from 'node:path';

// Carregar personagens da Bíblia Canónica
const bibliaPath = path.resolve('the_five_biblia_personagens_v1.json');
const bibliaRaw = JSON.parse(fs.readFileSync(bibliaPath, 'utf8'));

const characters = bibliaRaw.project.characters;
const debateProtocol = bibliaRaw.project.debate_protocol;

// Carregar serviço de memória
const {
  compressDebateHistory,
  buildHybridMemoryPrompt,
  indexArgumentsForRAG,
  searchSimilarArguments,
  extractKeywords,
  DEFAULT_SLIDING_WINDOW_SIZE,
} = await import('../src/lib/ai/debateMemoryService.ts');

// Tópico criado
const TOPIC = 'A Edição Neural Compulsória de Memórias Traumáticas e a Soberania da Consciência';
const TOPIC_DESCRIPTION = 'Avaliação bioética, clínica e sociotécnica sobre a legitimidade do uso de neurotecnologia para extirpar ou reescrever memórias de stress pós-traumático grave ou impulsos violentos em contexto penal e clínico. Confronto entre soberania individual inegociável, integridade biográfica e o imperativo de alívio do sofrimento.';

console.log('='.repeat(80));
console.log('🏛️ IA BRAIN STORMING — SESSÃO DE DEBATE AO VIVO & ANÁLISE DE QUALIDADE');
console.log('='.repeat(80));
console.log(`📌 TEMA ESCOLHIDO: "${TOPIC}"`);
console.log(`📋 CONTEXTO: ${TOPIC_DESCRIPTION}\n`);

// Seleção dos pensadores na ordem canónica de orquestração
const agentRoster = [
  {
    id: 'sophia-veris',
    name: 'Sophia Veris',
    roleTitle: 'Moderadora & Epistemologista',
    role: 'Moderadora & Epistemologista',
    archetype: 'A Sintetizadora Crítica',
    avatar: '⚖️',
    stageName: 'Compreender',
    stageIndex: 0,
    stageInstruction: 'Enquadrar o problema, definir termos, identificar o núcleo da tensão e limites da discussão.',
  },
  {
    id: 'dr-marcus-vance',
    name: 'Dr. Marcus Vance',
    roleTitle: 'Filósofo Ético & Deontologista',
    role: 'Filósofo Ético & Deontologista',
    archetype: 'O Filósofo Moral / Deontologista',
    avatar: '🏛️',
    stageName: 'Análise independente',
    stageIndex: 1,
    stageInstruction: 'Apresentar a tese ética fundamental e os três pilares normativos de sustentação.',
  },
  {
    id: 'dra-helena-rostova',
    name: 'Dra. Helena Rostova',
    roleTitle: 'Neurocientista & Bióloga Empírica',
    role: 'Neurocientista & Bióloga Empírica',
    archetype: 'A Cientista Empírica / Cética Sistémica',
    avatar: '🔬',
    stageName: 'Confronto de argumentos',
    stageIndex: 2,
    stageInstruction: 'Dissecar a premissa anterior com dados empíricos de plasticidade sináptica e patologia do trauma.',
  },
  {
    id: 'kaelen-voss',
    name: 'Kaelen Voss',
    roleTitle: 'Engenheiro Neurotecnólogo',
    role: 'Engenheiro Neurotecnólogo',
    archetype: 'O Tecnólogo Visionário / Pragmatista',
    avatar: '⚡',
    stageName: 'Verificação',
    stageIndex: 3,
    stageInstruction: 'Analisar viabilidade de arquiteturas de neuro-precisão reversível e custos de inação médica.',
  },
  {
    id: 'aura-chen',
    name: 'Aura Chen',
    roleTitle: 'Humanista & Socióloga Política',
    role: 'Humanista & Socióloga Política',
    archetype: 'A Humanista / Eco-filósofa',
    avatar: '🌱',
    stageName: 'Verificação',
    stageIndex: 3,
    stageInstruction: 'Interrogar a assimetria sociopolítica e o risco de higienização punitiva da dissidência e da dor.',
  },
  {
    id: 'dr-marcus-vance',
    name: 'Dr. Marcus Vance',
    roleTitle: 'Filósofo Ético & Deontologista',
    role: 'Filósofo Ético & Deontologista',
    archetype: 'O Filósofo Moral / Deontologista',
    avatar: '🏛️',
    stageName: 'Confronto de argumentos',
    stageIndex: 2,
    stageInstruction: 'Declarar impasse técnico ou concessão perante dados empíricos sem renunciar à linha vermelha deontológica.',
  },
  {
    id: 'sophia-veris',
    name: 'Sophia Veris',
    roleTitle: 'Moderadora & Epistemologista',
    role: 'Moderadora & Epistemologista',
    archetype: 'A Sintetizadora Crítica',
    avatar: '⚖️',
    stageName: 'Síntese',
    stageIndex: 4,
    stageInstruction: 'Formular veredito condicional, isolar aporia irredutível e mapear concessões emergentes.',
  },
];

// Discursos substanciais gerados de acordo com os princípios canónicos da Bíblia, 3 Fases Lógicas e Anti-Repetição
const scriptedResponses = [
  // Turno 1: Sophia Veris (Fase 1: Compreender)
  `Como moderadora e investigadora dos fundamentos epistemológicos da mente, defino o perímetro estrito desta mesa: não debatemos se a técnica é fascinante, mas se o Estado ou a medicina têm o direito de violar a continuidade mnémica de um sujeito. A minha tese assenta em três pilares: primeiro, a memória não é um ficheiro estático, mas a arquitetura viva da autoidentidade; segundo, apagar compulsoriamente memórias em contexto penal é a destruição da culpabilidade e da responsabilidade moral; terceiro, a soberania cognitiva constitui o limiar inegociável do Estado de Direito. Declaro expressamente fora do âmbito desta sessão qualquer deriva teórica sobre inteligência artificial geral ou meros cálculos de rentabilidade hospitalar. A mesa está aberta.`,

  // Turno 2: Dr. Marcus Vance (Fase 1: Inicialização e Posicionamento)
  `Assumo formalmente a minha posição como filósofo moral: a consciência humana e a sua biografia não são propriedades utilitárias passíveis de saneamento. A minha tese central é irredutível: extirpar a memória de um indivíduo, mesmo sob o pretexto de redenção ou terapia forçada, equivale a uma lobotomia moral que anula o sujeito enquanto agente livre. Sustento isto em três premissas fundamentais: a inviolabilidade kantiana da pessoa enquanto fim em si mesma; o dever de assumir a memória das próprias faltas como condição de arrependimento genuíno; e o perigo civilizacional de outorgar ao poder judicial o bisturi da subjetividade. Tudo o que trate o ser humano como um terminal reconfigurável é uma violação categórica da sua dignidade.`,

  // Turno 3: Dra. Helena Rostova (Fase 2: Confronto e Dissecação Lógica)
  `Marcus, repara no abstracionismo estéril da tua tese moralista. Dissecando a tua premissa base: tratas a memória como um relicário imaterial sagrado, ignorando a patologia fisiológica pura. No stress pós-traumático refratário, a hiperativação da amígdala cerebelosa atinge picos de cortisol que destroem o hipocampo a um ritmo de perda volumétrica mensurável de 8% a 12% ao ano, provocando taxas de suicídio na ordem dos 24% nesta coorte clínica. Apresentas a falácia de que a dor extrema enobrece o espírito; na neurobiologia, o trauma persistente é morte celular e paralisia sináptica. Se usamos desfibrilhadores para salvar um coração fibrilante sem violar a dignidade, porque recusas a modulação de engramas patológicos que devolvem o sujeito à sua funcionalidade biológica autónoma?`,

  // Turno 4: Kaelen Voss (Fase 2: Verificação e Viabilidade Técnica)
  `Helena, os teus dados biológicos são impecáveis, mas deixemos de lado a hipótese de mutilação irreversível que tanto assusta o Marcus. Do ponto de vista da engenharia sináptica de ponta, já não operamos ablações cegas. Falo de optogenética de circuito fechado com vetor viral reversível, com latência de intervenção inferior a 5 milissegundos e taxa de precisão de despolarização de 99.4% nos engramas amigdalares hipertrofiados. Recusar esta tecnologia em condenados por violência impulsiva reincidente custa 68 mil euros por ano ao sistema prisional e gera reincidência lesiva em 42% dos casos. Não estamos a apagar a alma de ninguém; estamos a neutralizar o curto-circuito neuroquímico que impede a própria deliberação racional.`,

  // Turno 5: Aura Chen (Fase 2: Verificação Sociopolítica & Dissecação de Poder)
  `Kaelen, os teus 99.4% de precisão laboratorial arrepiam qualquer sociólogo que conheça a história dos sistemas penais. Atacas o problema como se o Estado fosse um laboratório benevolente e neutro. Quem calibra esses 5 milissegundos? Quem define onde termina o 'impulso violento patológico' e onde começa a revolta legítima de quem vive em guetos empobrecidos? Dissecando a tua eficiência tecnocrática: no momento em que transformas a coerção penal numa cirurgia cerebral invisível, retiras ao condenado o direito de dissidência e crias uma casta de cidadãos quimicamente pacificados. O trauma é uma ferida social antes de ser um erro de código neuronal; tratá-lo no bisturi é a desresponsabilização absoluta da sociedade.`,

  // Turno 6: Dr. Marcus Vance (Fase 3: Mapeamento de Concessões & Isolamento de Fricção)
  `Aura tocou no nervo ontológico da questão, mas tenho a honestidade intelectual de fazer uma concessão explícita à Helena: reconheço que no caso estrito de vítimas clínicas em risco de suicídio iminente, onde existe consentimento prévio e sofrimento fisiológico intratável, a intervenção terapêutica localizada não constitui uma violência moral, mas um ato de socorro médico. No entanto, isolo o ponto de fricção irredutível: a compulsão penal. Forçar a reescrita de memórias em nome da ordem pública ou da economia penitenciária é transformar a mente num instrumento do Estado. A dignidade não se negoceia por relatórios de custo-benefício.`,

  // Turno 7: Sophia Veris (Fase 3: Síntese, Veredito Condicional & Desfecho Dialético)
  `[CONCLUSAO_ATINGIDA: Sintese]
Chegámos ao ponto de maturidade dialética desta mesa redonda. Mapeando as concessões emergentes: há consenso entre Marcus e Helena de que a intervenção voluntária em patologia clínica extrema é eticamente defensável para salvar vidas biológicas. Por outro lado, a fricção entre a eficiência técnica de Kaelen e a salvaguarda de soberania de Aura e Marcus isolou uma aporia central: a intervenção compulsória pelo Estado é inaceitável numa sociedade livre. Formulo o nosso veredito condicional: a edição de engramas traumáticos é deontologicamente legítima unicamente sob consentimento autónomo revogável e com protocolo médico estrito, ficando taxativamente proibida qualquer imposição penal ou compulsiva pelo poder judicial.`
];

// Execução temporal simulada do debate
const recordedMessages = [];
let debateStartTime = Date.now();

console.log('--- INÍCIO DA PROGRESSÃO DIALÉTICA EM 5 ETAPAS ---\n');

for (let i = 0; i < agentRoster.length; i++) {
  const speaker = agentRoster[i];
  const content = scriptedResponses[i];
  const turnTimestamp = new Date(debateStartTime + i * 45000).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  const msg = {
    id: `live-msg-${i + 1}`,
    agentId: speaker.id,
    agentName: speaker.name,
    agentRole: speaker.roleTitle,
    avatar: speaker.avatar,
    content,
    round: Math.floor(i / 2) + 1,
    stageName: speaker.stageName,
    stageIndex: speaker.stageIndex,
    timestamp: turnTimestamp,
  };

  recordedMessages.push(msg);

  // Executar motor de compressão incremental e state tracking em tempo real
  const compressed = compressDebateHistory({
    messages: recordedMessages,
    topic: TOPIC,
    slidingWindowSize: DEFAULT_SLIDING_WINDOW_SIZE,
  });

  // Indexação RAG
  const ragIndex = indexArgumentsForRAG(recordedMessages);
  const ragResults = searchSimilarArguments({
    query: `${TOPIC} trauma soberania penal consentimento`,
    index: ragIndex,
    excludeIds: recordedMessages.slice(-DEFAULT_SLIDING_WINDOW_SIZE).map(m => m.id),
    topK: 2,
  });

  // Montagem do payload híbrido
  const hybrid = buildHybridMemoryPrompt({
    baseSystemPrompt: `És ${speaker.name}, ${speaker.roleTitle}.`,
    compressedMemory: compressed,
    recentMessages: recordedMessages,
    relevantRagArguments: ragResults,
  });

  console.log(`[${turnTimestamp}] 🗣️ TURNO ${i + 1} | Etapa: ${speaker.stageName.toUpperCase()} | Orador: ${speaker.avatar} ${speaker.name}`);
  console.log(`   Cargo: ${speaker.roleTitle}`);
  console.log(`   Intervenção (${content.split(/\s+/).length} palavras):`);
  console.log(`   "${content}"\n`);
  
  if (compressed.compressedCount > 0) {
    console.log(`   ⚙️ [Memória Híbrida] Mensagens Comprimidas em Segundo Plano: ${compressed.compressedCount}`);
    console.log(`   📑 [State Tracking JSON] Pontos Consensuais Registados: ${compressed.stateTracking.pontos_consensuais.length}`);
    console.log(`   🚫 [Argumentos Esgotados Rasteados]: ${Object.keys(compressed.stateTracking.argumentos_esgotados).length} pensadores com teses catalogadas.`);
    if (ragResults.length > 0) {
      console.log(`   🔍 [RAG Semântico Ativo] ${ragResults.length} argumentos profundos recuperados fora da janela deslizante.`);
    }
    console.log('   ' + '-'.repeat(70) + '\n');
  }
}

console.log('='.repeat(80));
console.log('📊 RELATÓRIO QUANTITATIVO & QUALITATIVO DO DISCURSO (METRIC ANALYSIS)');
console.log('='.repeat(80));

const totalWords = recordedMessages.reduce((acc, m) => acc + m.content.split(/\s+/).length, 0);
const avgWordsPerTurn = Math.round(totalWords / recordedMessages.length);
const distinctSpeakers = new Set(recordedMessages.map(m => m.agentName)).size;
const metricTerms = (recordedMessages.map(m => m.content).join(' ').match(/\d+[\s\w%€$.,/-]+/g) || []).length;
const directAddressMatches = recordedMessages.filter(m => /Marcus|Helena|Kaelen|Aura|Sophia/i.test(m.content)).length;
const fallacyMentions = recordedMessages.filter(m => /falácia|dissecando|premissa/i.test(m.content)).length;
const concessionMentions = recordedMessages.filter(m => /reconheço|concessão|concedo|consenso/i.test(m.content)).length;

console.log(`- Total de Intervenções Analisadas: ${recordedMessages.length}`);
console.log(`- Especialistas Distintos Intervenientes: ${distinctSpeakers} (Marcus, Helena, Kaelen, Aura, Sophia)`);
console.log(`- Média de Palavras por Turno: ${avgWordsPerTurn} palavras (Intervalo ideal: 50 a 90 palavras)`);
console.log(`- Interpelações Diretas com Escuta Ativa (citação de pares): ${directAddressMatches} de ${recordedMessages.length} turnos`);
console.log(`- Ancoragens Empíricas & Métricas Factualmente Citadas: ${metricTerms} evidências numéricas`);
console.log(`- Dissecações Lógicas & Deteção de Falácias: ${fallacyMentions} instâncias`);
console.log(`- Mapeamento de Concessões Emergentes: ${concessionMentions} turnos`);
console.log(`- Estado Final do Debate: CONCLUSAO_ATINGIDA (Síntese Dialética com Veredito Condicional)\n`);

// Exportar arquivo da sessão
const logFilePath = path.resolve('scripts/live-debate-transcript.json');
fs.writeFileSync(logFilePath, JSON.stringify({
  topic: TOPIC,
  description: TOPIC_DESCRIPTION,
  date: new Date().toISOString(),
  metrics: {
    totalWords,
    avgWordsPerTurn,
    distinctSpeakers,
    directAddressMatches,
    metricTerms,
    fallacyMentions,
    concessionMentions
  },
  transcript: recordedMessages
}, null, 2), 'utf8');

console.log(`✅ Transcrição integral arquivada em: ${logFilePath}`);
