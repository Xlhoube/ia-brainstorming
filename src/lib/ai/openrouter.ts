import { Agent, DebateMessage, LanguageTone, StructuredMemoryItem } from '@/types/debate';

export interface AgentResponseResult {
  content: string;
  isSimulated: boolean;
  modelUsed?: string;
}

interface GenerateTurnParams {
  agent: Agent;
  topic: string;
  topicDescription?: string;
  allAgents: Agent[];
  messages: DebateMessage[];
  apiKey?: string;
  tone?: LanguageTone;
  stage?: {
    name: string;
    instruction: string;
  };
}

// Lista de modelos de inteligência artificial de alta disponibilidade e gratuitos no OpenRouter
// Prioriza modelos altamente estáveis e disponíveis antes dos experimentais
const FALLBACK_MODELS = [
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen-2.5-72b-instruct:free',
  'mistralai/mistral-small-24b-instruct-2501:free',
  'google/gemini-2.0-flash-exp:free',
];

export async function generateAgentResponse({
  agent,
  topic,
  topicDescription,
  allAgents,
  messages,
  apiKey,
  tone = 'simples',
  stage,
}: GenerateTurnParams): Promise<AgentResponseResult> {
  const activeKey = apiKey || process.env.OPENROUTER_API_KEY;

  if (activeKey && activeKey.trim() !== '') {
    try {
      const { reply, modelUsed } = await callOpenRouterWithFallback({
        agent,
        topic,
        topicDescription,
        allAgents,
        messages,
        apiKey: activeKey.trim(),
        tone,
        stage,
      });
      return {
        content: reply,
        isSimulated: false,
        modelUsed,
      };
    } catch (err: any) {
      console.warn('Falha nas tentativas OpenRouter, a recorrer ao motor dialético local dinâmico:', err.message);
    }
  }

  // Motor dialético dinâmico orgânico (réplicas conversacionais contextualizadas por tema, agente e memória)
  const simulatedReply = generateOrganicSimulatedResponse(agent, topic, messages, tone, stage, topicDescription);
  return {
    content: simulatedReply,
    isSimulated: true,
  };
}

async function callOpenRouterWithFallback(
  params: GenerateTurnParams & { apiKey: string }
): Promise<{ reply: string; modelUsed: string }> {
  const { agent, topic, topicDescription, allAgents, messages, apiKey, tone = 'simples', stage } = params;

  // Lista de modelos a tentar em cascata se algum devolver erro 402, 404 ou 429
  const candidateModels = Array.from(new Set([agent.model, ...FALLBACK_MODELS]));

  const rosterSummary = allAgents
    .map(a => `- ${a.name} (${a.roleTitle}): ${a.personality?.temperament || a.stanceDescription}`)
    .join('\n');

  const toneInstructions = tone === 'simples'
    ? `REGRA DE OURO - LINGUAGEM VIVA E NATURAL:
- Fala como alguém numa conversa inteligente à mesa de café, NUNCA como um professor a debitar uma tese.
- Proibido usar jargão pedante ("epistemológico", "ontologia", "heurística", "entropia"). Usa metáforas práticas da vida diária.
- Frases diretas, vivas, com ritmo conversacional.`
    : `REGRA DE DIALÉTICA AVANÇADA:
- Confronto intelectual rigoroso, filosófico e conceptual, mas sempre em tom de diálogo vivo entre pares.`;

  const pastMemoriesSection = (agent.memory?.pastMemories && agent.memory.pastMemories.length > 0) ? `
HISTÓRICO DE DEBATES ANTERIORES:
${agent.memory.pastMemories.map(m => `  * No debate sobre "${m.topic}": ${m.stanceSummary}`).join('\n')}
- DIRETRIZ DE MEMÓRIA: Mantém coerência com o teu histórico pessoal e alude com naturalidade a conclusões passadas quando relevante.
` : '';

  const isAiTopic = /intelig[eê]ncia|ia|algorit|computa|rob[oô]|software|sint[eé]tic/i.test(`${topic} ${topicDescription || ''}`);

  const filteredStructuredEntries = (agent.memory?.structuredEntries || []).filter(e => {
    if (!isAiTopic && /intelig[eê]ncia artificial|algoritmo de ia|alinhamento de ia|intelig[eê]ncia sint[eé]tica/i.test(e.content)) {
      return false;
    }
    return true;
  });

  const structuredMemoriesSection = filteredStructuredEntries.length > 0 ? `
MEMÓRIA ESTRUTURADA CANÓNICA (THE FIVE):
${filteredStructuredEntries.map(e => {
  const meta: string[] = [e.category.toUpperCase()];
  if (e.topicContext) meta.push(`Contexto: "${e.topicContext}"`);
  if (e.relatedColleague) meta.push(`Interlocutor: ${e.relatedColleague}`);
  if (e.emotionalImpact) meta.push(`Impacto: ${e.emotionalImpact}`);
  if (e.confidence) meta.push(`Confiança: ${e.confidence}`);
  return `  - [${meta.join(' | ')}]: ${e.content}`;
}).join('\n')}
- DIRETRIZ DE MEMÓRIA ESTRUTURADA: Respeita rigorosamente os factos confirmados e as tuas linhas vermelhas éticas inegociáveis (ETHICAL_RED_LINES). Explora e reabre dúvidas intelectuais (INTELLECTUAL_DOUBTS) quando o diálogo as convocar e nunca convertas hipóteses em factos consumados.
` : '';

  const stageInstructions = stage ? `
ETAPA ATUAL DO PROTOCOLO CANÓNICO (BÍBLIA DE PERSONAGENS):
- Etapa: "${stage.name}"
- Diretriz da Etapa: "${stage.instruction}"
- DEVER COGNITIVO NESTE TURNO: Modela a tua intervenção rigorosamente de acordo com as exigências desta etapa canónica.
` : '';

  const systemInstructions = `${agent.systemPrompt}

TEMA DO DEBATE: "${topic}"
${topicDescription ? `Contexto adicional: ${topicDescription}` : ''}

OUTROS PRESENTES NA MESA:
${rosterSummary}
${pastMemoriesSection}
${structuredMemoriesSection}
${stageInstructions}
${toneInstructions}

DIRETRIZES FUNDAMENTAIS PARA UM DIÁLOGO ORGÂNICO E PENSADO:
1. FOCO TEMÁTICO RIGOROSO E PROIBIÇÃO DE DESVIO PARA IA:
   O debate atual é ESTRITAMENTE e EXCLUSIVAMENTE sobre o tema proposto: "${topic}".
   É TERMINANTEMENTE PROIBIDO desviar a conversa para inteligência artificial, computadores, robôs, algoritmos ou software se o tema for sobre espaço, física, fusão nuclear, biologia, genética, sociedade, política ou outro assunto que não seja especificamente sobre IA. Todos os teus exemplos, preocupações e propostas devem incidir exclusivamente sobre a matéria concreta em debate (${topic}).
2. ESCUTA ATIVA OBRIGATÓRIA: Não comeces a debitar a tua teoria. Olha para a última intervenção. Agarra numa frase, num exemplo ou numa falha do último orador e responde-lhe diretamente no primeiro parágrafo: "Repara no que estás a dizer, [Nome]...", ou "Calma, [Nome], estás a esquecer-te de...".
3. PENSA EM VOZ ALTA: Mostra hesitação, surpresa ou convicção fundamentada. Não sejas um robô formal.
4. EXTENSÃO CONTROLADA: No máximo 2 parágrafos concisos (entre 50 a 90 palavras). Diálogos vivos são ágeis e certeiros. Menos discurso, mais réplica.
5. PROIBIÇÃO ABSOLUTA DE CLICHÉS: Proibido dizer "Relativamente ao tópico", "Gostaria de acrescentar", "Concordo em parte com X". Entra diretamente na resposta.
6. LINGUAGEM EM PORTUGUÊS DE PORTUGAL (PT-PT): Estritamente sem termos ou gerúndios brasileiros.
7. PROIBIÇÃO ABSOLUTA DE IDENTIFICAÇÃO PESSOAL: NUNCA comeces a tua resposta com o teu próprio nome ou cargo (É ESTRITAMENTE PROIBIDO escrever "[${agent.name} - ${agent.roleTitle}]:" ou "${agent.name}:"). O teu cartão e foto já mostram quem está a falar. Começa logo na primeira palavra a falar com o teu colega (exemplo: "Kaelen, repara...", ou "Helena, os teus dados...").
8. HUMILDADE EPISTEMOLÓGICA E RETIRADA DA MESA:
   Se avaliares honestamente que o tema central ("${topic}") está inteiramente fora da tua área de competência, especialidade (${agent.roleTitle}) ou formação, e sentires que não percebes suficientemente do assunto em causa para dar um contributo rigoroso e fundamentado, NÃO finjas saber nem inventes palpites superficiais.
   Nesse caso, tens o direito e o dever de te retirar da mesa!
   Para te retirares, inclui no teu texto a tag:
   [RETIRO_ME: <razão curta da falta de especialidade técnica neste assunto>]
   seguida de uma declaração cordial, lúcida e humilde aos teus pares (1 a 2 parágrafos concisos) explicando com honestidade que este assunto excede a tua especialidade e que te retiras da discussão para dar espaço a quem realmente domina a matéria.
9. DIALÉTICA LIVRE E MATURIDADE DE CONCLUSÃO:
   Este debate NÃO tem limites fixos de turnos ou rondas. Vocês, especialistas, têm autonomia total para debater durante o tempo que for necessário, explorando tensões, paradoxos e desafios reais.
   Contudo, se após várias intervenções (pelo menos 6 a 8 falas no histórico global) sentires que a discussão atingiu a sua maturidade e alcançou:
   - Um Consenso ou Síntese fecunda entre as posições divergentes; OU
   - Uma Aporia / Divergência Irreconciliável digna e incontornável (onde premissas éticas ou ontológicas opostas não podem ser conciliadas sem quebrar coerência),
   podes declarar autonomamente a conclusão da mesa!
   Para tal, inclui no teu texto a tag de fecho:
   [CONCLUSAO_ATINGIDA: Sintese] ou [CONCLUSAO_ATINGIDA: Consenso] ou [CONCLUSAO_ATINGIDA: Aporia]
   seguida da tua síntese ou diagnóstico final. Se consideras que a discussão ainda tem arestas ou paradoxos por desvendar, NÃO uses esta tag e continua a debater normalmente.`;

  const promptMessages = [
    { role: 'system', content: systemInstructions },
    ...messages.slice(-8).map(msg => ({
      role: msg.isHuman ? 'user' : 'assistant',
      name: sanitizeName(msg.agentName),
      content: msg.content,
    })),
    {
      role: 'user',
      content: `É a tua vez de falar na mesa, ${agent.name}. O debate é rigorosamente sobre "${topic}". ${stage ? `Estamos na etapa "${stage.name}" (Diretriz: ${stage.instruction}). ` : ''}Ouve o que o último orador acabou de dizer e responde diretamente a ele de forma viva e afiada em 1 ou 2 parágrafos curtos, cumprindo a diretriz desta etapa. Se avaliares que não percebes suficientemente do assunto técnico em debate por ser fora da tua área de especialidade (${agent.roleTitle}), deves retirar-te da mesa incluindo a tag [RETIRO_ME: motivo]. ${stage?.name === 'Síntese' ? 'Apresenta a síntese ou declara a conclusão dialética da mesa com a tag [CONCLUSAO_ATINGIDA: Sintese|Consenso|Aporia].' : 'Avalia se o debate ainda deve avançar ou se já é hora de declarar conclusão.'} Não desvies o assunto para inteligência artificial se o tema for outro. Nunca escrevas o teu próprio nome no início.`,
    },
  ];

  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://localhost:3000',
          'X-Title': 'IA Brain Storming Arena',
        },
        body: JSON.stringify({
          model,
          messages: promptMessages,
          temperature: 0.85,
          max_tokens: 300,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply && reply.trim() !== '') {
          return {
            reply: cleanAgentResponsePrefix(reply, agent.name),
            modelUsed: model,
          };
        }
      } else {
        const errorText = await res.text();
        lastError = new Error(`Model ${model} failed (${res.status}): ${errorText}`);
      }
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error('Nenhum modelo do OpenRouter conseguiu responder.');
}

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);
}

export type ThematicDomain =
  | 'espaco'
  | 'fusao'
  | 'trabalho'
  | 'quantica'
  | 'genetica'
  | 'desinformacao'
  | 'interfaces'
  | 'superinteligencia'
  | 'consciencia'
  | 'geral';

interface ThematicAnalysis {
  domain: ThematicDomain;
  subjectNoun: string;
}

/**
 * Identifica o domínio semântico do debate a partir do título e descrição
 */
export function detectThematicDomain(topic: string, description?: string): ThematicAnalysis {
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

  // Tópico genérico ou personalizado
  const cleanedTopic = topic
    .replace(/[?!.:;]+$/g, '')
    .replace(/^(o|a|os|as|como|será que|pode|podem|qual)\s+/i, '')
    .trim();

  return {
    domain: 'geral',
    subjectNoun: `o debate sobre "${cleanedTopic || topic}"`,
  };
}

/**
 * Matriz dialética enriquecida com múltiplos estágios e argumentos progressivos (6 argumentos distintos por especialista por domínio)
 * Fim absoluto de repetições por módulo estático de 2 elementos!
 */
export const DOMAIN_DISCOURSE_BANK: Record<
  ThematicDomain,
  Record<'filosofo' | 'cientista' | 'humanista' | 'tecnologo' | 'moderador', string[]>
> = {
  espaco: {
    filosofo: [
      `Assume-se com facilidade que colonizar outro planeta resolve os nossos fracassos civilizacionais. Mas exportar a mesma lógica de consumo predatório para Marte, sem antes rever os nossos pressupostos éticos e institucionais, não é a salvação da espécie: é apenas a replicação cósmica dos nossos erros.`,
      `A verdadeira aporia não é técnica, mas ontológica: se uma colónia extraterrestre depender de racionamento militar extremo de oxigénio e energia, a liberdade e a democracia deixam de ser direitos para se tornarem luxos insustentáveis. Queremos mesmo fundar uma sociedade sob tirania da escassez?`,
      `Examinemos a falácia da fuga cósmica: nenhuma física extraterrestre nos libertará dos vícios de governação que trouxermos na bagagem cultural. Criar postos avançados no vácuo sem resolver o egoísmo social na Terra é construir castelos de poeira no vazio.`,
      `Reparem no paradoxo dos valores: exalta-se a coragem de explorar o desconhecido, mas foge-se da responsabilidade imediata para com o bioma em que fomos forjados. O dever de cuidado não termina na atmosfera terrestre.`,
      `Na etapa de verificação metodológica sobre a colonização: que garantias institucionais comprovadas existem de que um enclave marciano não colapsará numa oligarquia absolutista de subsistência biológica? Sem critérios de autonomia cívica, o plano é filosoficamente frágil.`,
      `Para a síntese final: a nossa razão dita que a exploração espacial deve ser um esforço de ampliação do conhecimento e de partilha universal de tecnologias de regeneração, e nunca um subterfúgio para abandonar o nosso compromisso primordial com a Terra.`,
    ],
    cientista: [
      `Deixemos o romantismo de ficção científica de lado e olhemos para os dados empíricos: a radiação cósmica ionizante no espaço profundo, a perda acelerada de densidade óssea em gravidade fracionada e a reciclagem fechada biológica em 100% continuam sem resolução física comprovada.`,
      `A biosfera da Terra é o resultado de quatro mil milhões de anos de bio-evolução e equilíbrios termodinâmicos finos. Imaginar que se recria um ecossistema estável e auto-sustentável numa cúpula marciana com filtros mecânicos ignora a complexidade da biologia de sistemas.`,
      `Precisamos de métricas de engenharia estequiométrica: produzir oxigénio a partir de percloratos de rególito exige ordens de grandeza de quilowatts-hora que as centrais fotovoltaicas marcianas, com tempestades globais de poeira, dificilmente conseguem garantir de forma contínua.`,
      `Em termos fisiológicos, os ensaios longitudinais na Estação Espacial Internacional comprovam que a microgravidade induz mutações endoteliais e deterioração ocular irreversível. Sem gravidade artificial de rotação comprovada, missões tripuladas de longo curso são temerárias.`,
      `Nesta etapa de verificação empírica: exijo que separemos as projeções de carga útil dos foguetões daquilo que são as taxas reais de mortalidade celular por radiação solar de partículas carregadas. Sem escudos eletromagnéticos ativos testados, tudo é conjectura.`,
      `Em termos de síntese conclusiva: a ciência apoia missões robóticas avançadas de prospeção de exoplanetas, mas alerta que a preservação do sistema termodinâmico da Terra continua a ser a única solução biológica comprovada para a espécie.`,
    ],
    humanista: [
      `Quem terá bilhete para as primeiras colónias e quem ficará para trás num planeta com ecossistemas degradados a pagar a fatura dos lançamentos? Se a expansão espacial for financiada por impérios corporativos, criaremos colónias sob vassalagem contratual.`,
      `O valor moral de uma civilização não se mede pela distância das suas sondas ou por bandeiras cravadas no rególito marciano, mas pelo cuidado prestado aos membros mais frágeis da sua comunidade aqui na Terra.`,
      `Imaginem a clivagem psicológica e social de crianças nascidas em cúpulas pressurizadas sem nunca terem pisado relva ou visto o mar aberto. A experiência humana profunda requer ligação orgânica à natureza viva, e não confinamento em corredores de polímero.`,
      `A justiça distributiva exige que os biliões de euros alocados a expedições planetárias especulativas sejam ponderados face à erradicação imediata da fome e à garantia de água potável para os povos que sustentam a infraestrutura industrial global.`,
      `Na etapa de verificação humana: como garantimos a proteção dos direitos laborais e a soberania dos pioneiros espaciais perante monopólios de suporte de vida? Se a empresa detiver o oxigénio, não existe soberania cívica.`,
      `Concluo na síntese: a odisseia espacial só é legítima se servir para unir a humanidade numa perspetiva de fragilidade comum — o 'Pálido Ponto Azul' —, inspirando o desarmamento e o acolhimento fraterno no nosso único lar comum.`,
    ],
    tecnologo: [
      `Não vamos ao espaço para fugir da Terra, mas porque as tecnologias extremas que somos forçados a criar — reciclagem absoluta de água, energia solar ultradensa e agricultura vertical de ciclo fechado — são precisamente as que vão salvar o nosso planeta berço.`,
      `A inação e o medo de falhar são a verdadeira condenação da nossa espécie. A única salvaguarda real contra eventos de extinção em massa é tornar a consciência multiplanetária através de engenharia audaz e protótipos contínuos.`,
      `Reparem no ritmo da manufatura aditiva e na robótica autónoma de mineração de asteroides: capturar recursos metálicos raros no espaço poupará a crusta terrestre da destruição a céu aberto. O progresso ambiental faz-se com mais tecnologia de ponta, não com retrocesso.`,
      `A história ensina-nos que todas as grandes fronteiras — desde as caravelas até à aviação comercial — foram recebidas com ceticismo paralisante. Os problemas operacionais resolvem-se desenhando propulsores de fusão e habitats de regolito sinterizado, e não esperando sentados.`,
      `Na verificação técnica: já temos protótipos funcionais de reatores nucleares espaciais de fissão compacta (como o Kilopower da NASA) e tecnologias de extração de metano in situ. Os vetores de viabilidade estão a convergir velozmente.`,
      `Para fechar em síntese: a engenharia convida a mesa a abraçar a ousadia construtiva. Ser multiplanetário é a apólice de seguro definitiva da vida inteligente contra o esquecimento cósmico.`,
    ],
    moderador: [
      `O dilema fundamental está bem delimitado na mesa: de um lado, a urgência existencial e tecnológica de nos tornarmos multiplanetários; do outro, a responsabilidade prioritária de regeneração ecológica e justiça social na Terra.`,
      `As tensões cruzadas são ricas e complementares: a prudência científica da Helena equilibra o ímpeto técnico do Kaelen, enquanto o Marcus e a Aura recordam que sem justiça institucional, Marte será apenas um exílio climatizado.`,
      `Peço à assembleia que concentre a sua atenção no ponto nevrálgico: onde é que as tecnologias de sobrevivência espacial podem ser convertidas imediatamente em ferramentas de restauro ecológico para os solos e oceanos terrestres?`,
      `Entramos na fase de aprofundamento rigoroso: nenhum especialista pode refugiar-se em generalidades. Confrontemos a viabilidade material com as exigências intransigentes da dignidade humana.`,
      `Na etapa de verificação: registámos com clareza as premissas falseáveis e as incertezas materiais que ainda separam as hipóteses de trabalho da sua execução em segurança.`,
      `[CONCLUSAO_ATINGIDA: Sintese] Sophia Veris conclui: examinámos a fundo a expansão espacial versus o dever ecológico terrestre. Concluímos que a tecnologia espacial só se justifica moralmente se as inovações em ciclo fechado e energia forem aplicadas de imediato na regeneração da Terra, evitando a criação de enclaves espaciais de privilégio e consagrando a cooperação planetária aberta.`,
    ],
  },
  fusao: {
    filosofo: [
      `A promessa da fusão nuclear como fonte infinita de energia assenta na premissa falaciosa de que a abundância material gera automaticamente sabedoria social. Se a matriz for controlada por um punhado de potências, a energia será a nova alavanca de dependência hegemónica.`,
      `Mais energia por si só não resolve o problema dos fins éticos a que a aplicamos. Se tivermos energia infinita mas continuarmos a acelerar o consumo insensato de recursos minerais finitos, teremos apenas acelerado o nosso colapso civilizacional.`,
      `A ilusão prometeica repete-se: cada novo salto de potência foi saudado como a alforria do sofrimento e acabou capturado por oligarquias bélicas. Que salvaguardas epistemológicas garantem que a fusão não alimentará novas corridas armamentistas?`,
      `A abundância de quilowatts não substitui a virtude cívica. O verdadeiro teste moral de uma civilização mede-se pelo seu autocontrolo perante o poder ilimitado, e não pela sua voracidade termodinâmica.`,
      `Na verificação metodológica: exijo que se distinga com clareza matemática a energia gerada no plasma daquela que é consumida por toda a instalação criogénica e periférica. O balanço energético tem de ser líquido e transparente.`,
      `Em termos de síntese conclusiva: a energia de fusão só é eticamente admissível se for consagrada como património comum da humanidade sob tutela multilateral aberta, impedindo que novas barreiras de patentes excluam os povos desfavorecidos.`,
    ],
    cientista: [
      `Precisamos de separar comunicados de imprensa dos dados laboratoriais. Obter ganho líquido pontual de plasma (Q > 1) em experiências laboratoriais breves é muito diferente de operar reatores contínuos que resistam durante décadas a fluxos de neutrões de 14 MeV sem degradação das paredes internas.`,
      `A tecnologia de ímanes supercondutores e o confinamento de plasma com trítio apresentam desafios estequiométricos de abastecimento graves. Sem medições longitudinais da integridade dos materiais cerâmicos e de tungsténio, prometer fusão na rede elétrica comercial a curto prazo viola o rigor empírico.`,
      `Analisemos o divertor e a carga térmica de escape: dissipar fluxos de calor superiores aos que ocorrem na superfície do Sol em ligas metálicas reais sem provocar disrupções catastróficas de plasma é o nó górdio da física de tokamaks e stellarators.`,
      `A regeneração de trítio através de mantas de lítio (breeding blankets) nunca foi testada em escala industrial contínua. Sem este ciclo fechado de combustível nuclear, a operação contínua de centrais comerciais é fisicamente inexequível.`,
      `Nesta etapa de verificação: registo as métricas comprovadas pelo consórcio ITER e pelo JET. O ganho científico é inegável, mas a engenharia de materiais para reatores comerciais (DEMO) ainda requer uma década de ensaios de irradiação neutrónica controlada.`,
      `Para a síntese: o Conselho científico recomenda investimento maciço na física de materiais e em confinamento alternativo com laser inercial e aprisionamento magnético dipolar, mantendo a prudência nas previsões comerciais para a rede elétrica.`,
    ],
    humanista: [
      `Como será gerido o período de transição energética para as comunidades que vivem de matrizes tradicionais? A abundância no Norte industrializado de nada servirá se o Sul global for excluído do acesso à propriedade intelectual e à infraestrutura pesada.`,
      `A energia é a base de todos os direitos humanos básicos — água potável, aquecimento, hospitais e saneamento. Não podemos tolerar que a fusão seja patenteada como monopólio privado que exija lealdade económica para manter as luzes acesas.`,
      `Consideremos os impactos nos territórios de extração de matérias-primas críticas para os ímanes, como as terras raras e o lítio. As populações locais não podem ser sacrificadas em zonas de sacrifício ecológico para alimentar a energia limpa das metrópoles ricas.`,
      `A democratização do poder energético é a chave para a paz mundial. Se a fusão for centralizada em megacentrais sob vigilância militar severa, o cidadão comum continuará a ser um mero refém tarifário sem voz nas decisões ecológicas da sua região.`,
      `Na etapa de verificação: que mecanismos concretos de partilha de tecnologia e de capacitação técnica local estão a ser desenhados para que nações em desenvolvimento não fiquem permanentemente subjugadas aos países detentores de patentes?`,
      `Concluo na síntese: a energia de fusão deve ser uma ferramenta de emancipação universal contra a pobreza energética global, com royalties abertos e tratados de paz que erradiquem de vez as guerras fósseis do nosso horizonte histórico.`,
    ],
    tecnologo: [
      `Esperar por certezas teóricas absolutas antes de construir reatores é manter o planeta refém da combustão fóssil e da queima de carvão. Os reatores compactos de confinamento magnético com ímanes HTS estão a encurtar os prazos em décadas através de investimento privado ágil.`,
      `O caminho do progresso nunca foi a paralisia perante a incerteza de engenharia. Constrói-se, testa-se a retenção de calor, melhoram-se as ligas metálicas e itera-se. A fusão é a única solução capaz de descarbonizar a indústria pesada global.`,
      `Vejam a revolução dos stellarators desenhados por computação em grelha e otimização geométrica tridimensional: a estabilidade intrínseca do plasma elimina as disrupções dos tokamaks e permite operação em estado estacionário sem correntes induzidas no núcleo.`,
      `A fusão aneutrónica com protão-boro (p-B11) já está a ser testada por startups com confinamento inercial eletrostático, gerando partículas alfa com eletricidade direta sem passar por ciclos térmicos de vapor ineficientes. A velocidade da inovação supera os velhos cronogramas estatais.`,
      `Na verificação técnica: reatores compactos como o SPARC do MIT já comprovaram a viabilidade de campos magnéticos de 20 Tesla com fitas cerâmicas supercondutoras REBCO. O caminho para a comercialização está mapeado em marcos de engenharia claros.`,
      `Para a síntese final: a engenharia convida a acelerar a transição. A abundância energética da fusão permitirá dessalinizar água do mar em escala colossal, capturar dióxido de carbono da atmosfera e refundar a sustentabilidade industrial da humanidade.`,
    ],
    moderador: [
      `A mesa confronta com lucidez as duas faces da energia de fusão: a viabilidade dos materiais e física de confinamento frente aos impactos geopolíticos de concentração de poder.`,
      `Ouvindo a profundidade dos argumentos, identifico o nó central: a urgência climática pede aceleração tecnológica, mas a equidade social exige que o controlo dos novos reatores não degenere num novo cartel global.`,
      `Convido os pensadores a focarem-se no mecanismo de transição: como desenhar uma ponte realista entre os atuais sistemas de energia renovável descentralizada e as futuras centrais de fusão de base?`,
      `A dialética amadureceu: não temos aqui negacionistas da física nem céticos cegos, mas pensadores empenhados em assegurar que a maior descoberta energética desde o fogo seja partilhada com sabedoria.`,
      `Na etapa de verificação: as exigências de durabilidade dos materiais e os custos de ciclo de vida foram devidamente delimitados e contrapostos aos imperativos de descarbonização urgente.`,
      `[CONCLUSAO_ATINGIDA: Sintese] Sophia Veris conclui: o Conselho mapeou com nitidez as vias para a energia de fusão comercial. A síntese estabelece que a tecnologia só cumprirá a sua promessa civilizadora mediante acordos multilaterais abertos de partilha tecnológica, garantindo que a energia limpa seja um bem público global inegociável e imune a novas hegemonias.`,
    ],
  },
  trabalho: {
    filosofo: [
      `O pressuposto de que o trabalho assalariado é a raiz da dignidade humana é um dogma recente da Revolução Industrial. A verdadeira perturbação da automação é forçar-nos a responder: o que vale a existência humana quando a sua utilidade económica deixa de ser necessária?`,
      `Se a identidade do indivíduo for reduzida à sua capacidade produtiva, a automação gerará uma crise de sentido existencial profunda. Precisamos de refundar a ética cívica sobre a liberdade, a filosofia e o cuidado mútuo, e não sobre o emprego formal.`,
      `Reparem na contradição ontológica: os humanos criaram máquinas para se libertarem do cansaço e do esforço mecânico, mas agora desesperam perante a perspetiva de serem dispensados desse mesmo esforço. Isso prova que nos deixámos escravizar pelo conceito de utilidade instrumental.`,
      `A verdadeira tragédia não é a máquina fazer o trabalho dos homens; é os homens terem sido obrigados durante séculos a funcionar como máquinas descartáveis ao serviço do capital.`,
      `Na etapa de verificação: confrontemos o mito do pleno emprego. Que evidência existe de que o setor terciário continuará a criar funções produtivas com sentido ao mesmo ritmo a que a inteligência cognitiva as automatiza?`,
      `Em termos de síntese: proponho a consagração do direito à ócio criativo e à contemplação cívica como fundamentos da verdadeira cidadania livre, superando a alienação secular do trabalho assalariado.`,
    ],
    cientista: [
      `Os relatórios que projetam extinção em massa de empregos sofrem frequentemente de viés de agregação teórica. Automatizar rotinas lógicas discretas é viável; substituir destreza motora adaptativa, inteligência situacional e empatia em contextos instáveis é um desafio científico muito mais complexo.`,
      `Analisemos os dados históricos de elasticidade do emprego: a automação destrói tarefas, mas historicamente reduz custos de produção e gera novas classes de atividade. É obrigatório medir a velocidade de reconversão setorial em vez de assumir causalidades lineares apocalípticas.`,
      `Em termos de biologia cognitiva, o cérebro humano opera com plasticidade neuromuscular e adaptação háptica que os robôs humanoides ainda demorarão décadas a replicar de forma energeticamente viável. Não menosprezemos o custo de implantação física do hardware no terreno.`,
      `Os gargalos computacionais e os custos de inferência de modelos fundacionais impõem limites económicos reais à substituição do trabalho em milhares de tarefas especializadas. A automação só avança onde o custo marginal do algoritmo é inferior ao salário real do trabalhador.`,
      `Na verificação metodológica: separemos os setores de cognição estrita (escrita, código, triagem documental) dos setores de trabalho físico relacional (saúde, construção, educação infantil). As curvas de substituição são radicalmente assimétricas.`,
      `Concluo na síntese científica: o impacto real da automação será a reorganização híbrida e aumentada das profissões e não o seu desaparecimento total, exigindo métricas contínuas de produtividade e bem-estar laboral.`,
    ],
    humanista: [
      `Não se compensa a perda de pertença social e propósito com um cheque mensal de rendimento básico que reduza os cidadãos a consumidores passivos. O ser humano necessita de reconhecimento, de laços laborais e da sensação de contribuir para a sociedade.`,
      `Se a tecnologia concentrar a riqueza gerada pela automação num reduzido grupo de detentores de capital algorítmico, a desigualdade atingirá níveis insuportáveis para a paz social. O trabalho deve dignificar as pessoas, e não torná-las descartáveis.`,
      `Pensemos nos impactos na saúde mental: a solidão, o sentimento de inutilidade e o aumento dos distúrbios de ansiedade entre quem vê o seu ofício ser desvalorizado por modelos matemáticos opacos. A coesão comunitária é o tecido invisível que mantém as nações de pé.`,
      `A dignidade de quem cuida dos idosos, ensina as crianças e cultiva a terra não pode ser medida por algoritmos de retorno sobre investimento. O cuidado humano é um ato de afeto e responsabilidade, não uma linha de montagem com metas de rendimento.`,
      `Na etapa de verificação humana: como garantimos que a automatização de serviços essenciais de saúde e assistência não isola os idosos e os doentes da presença e do calor de uma mão biológica real?`,
      `Para a síntese: exigimos um novo contrato social que valorize economicamente o trabalho de cuidado, a arte e a participação comunitária, redistribuindo os ganhos da inteligência artificial para refundar a dignidade solidária.`,
    ],
    tecnologo: [
      `Ninguém tem saudades de trabalhar catorze horas por dia numa fábrica ou de passar anos a preencher formulários burocráticos repetitivos. A automação é a grande alavanca de emancipação da humanidade das tarefas embrutecedoras.`,
      `O nosso foco não deve ser tentar congelar o passado por medo do desemprego, mas acelerar a educação técnica, criar ferramentas aumentadas de inteligência coletiva e permitir que cada pessoa se foque em criatividade, ciência e inovação.`,
      `Vejam como a tecnologia democratizou a criação de conteúdos, o desenvolvimento de software e a investigação científica independente: hoje um único indivíduo com ferramentas de IA consegue fazer o que antes exigia um estúdio de dezenas de especialistas. A abundância criativa explodiu.`,
      `O progresso construtivo não pára perante a nostalgia. Em vez de tentarmos travar a inteligência artificial com taxas contra a automação, devemos criar infraestruturas abertas onde cada cidadão seja coproprietário dos sistemas inteligentes que geram valor.`,
      `Na verificação técnica: os ganhos de produtividade e a velocidade de diagnóstico médico aumentada por modelos analíticos comprovam que a tecnologia salva vidas e liberta tempo para o contacto clínico humano mais dedicado.`,
      `Para a síntese final: a visão dos construtores é clara — transformar as máquinas em amplificadores da capacidade humana, libertando as próximas gerações para explorarem novos horizontes do conhecimento e da criação cultural.`,
    ],
    moderador: [
      `A tensão central foi exposta: a promessa de libertação de tarefas repetitivas choca com o risco iminente de perda de dignidade, identidade e sustento económico.`,
      `Identifico uma convergência fundamental que emergiu do diálogo: todos concordamos que a identidade humana não pode continuar ancorada no modelo industrial do século XIX, mas divergimos sobre a velocidade e as garantias dessa transição.`,
      `Pergunto à mesa: como arquitetamos uma transição justa que evite tanto o colapso da subsistência das famílias como a paralisia económica gerada pelo medo da inovação?`,
      `Aprofundámos os limites reais entre tarefas cognitivas fáceis de automatizar e a riqueza situacional irrevogável do contacto interpessoal e da sensibilidade moral.`,
      `Na verificação das premissas: deixámos claro o que é mito sobre desemprego absoluto e o que é urgência real de reforma fiscal e requalificação humana profunda.`,
      `[CONCLUSAO_ATINGIDA: Sintese] Sophia Veris conclui: examinámos a transformação irreversível do trabalho na era da inteligência artificial. Concluímos que a dignidade humana não pode continuar atrelada ao mercado laboral, exigindo novos modelos de participação cívica, distribuição equitativa dos dividendos da automação e respeito pela vocação criativa intransmissível do ser humano.`,
    ],
  },
  quantica: {
    filosofo: [
      `Cuidado com a apropriação mística dos paradoxos quânticos. Que a mecânica quântica revele indeterminação ou não-localidade à escala de Planck não prova o livre-arbítrio cartesiano nem autoriza a confusão entre incerteza probabilística e intencionalidade humana.`,
      `A causalidade quântica desafia a nossa intuição temporal clássica, mas o rigor filosófico exige distinguir as equações de onda da realidade fenoménica. Não transformemos a quebra do determinismo mecânico num álibi para o relativismo ontológico.`,
      `O problema da medição confronta-nos com o abismo epistémico: se o observador é parte integrante do sistema físico observado, a pretensão iluminista de uma ciência puramente desinteressada e exterior ao cosmos precisa de ser profundamente repensada.`,
      `A não-localidade do entrelaçamento quântico destrói o conceito atomista de partículas isoladas no espaço. Se a realidade física fundamental é uma teia inseparável de relações, a filosofia moral tem de rever as suas premissas individualistas.`,
      `Na verificação metodológica: que interpretação ontológica sustentamos? Os múltiplos mundos de Everett, a onda-piloto de Bohm ou o colapso objetivo de Penrose? Cada uma acarreta consequências ontológicas irreconciliáveis que temos de explicitar.`,
      `Em termos de síntese conclusiva: a física quântica ensina a humildade da razão. A realidade recusa as nossas molduras mecanicistas rígidas, convocando uma dialética de complementaridade onde o mistério e a precisão coexistem.`,
    ],
    cientista: [
      `Em laboratório, a decoerência quântica induzida por flutuações térmicas e ruído eletromagnético impõe barreiras monumentais à escalabilidade dos processadores quânticos. Sem códigos de correção de erro de superfície com fidelidade superior a 99,9%, falar de quebra da causalidade é mera especulação.`,
      `As experiências de escolha retardada de Wheeler confirmam a natureza probabilística da medição e do colapso da função de onda, mas a relatividade geral e a flecha termodinâmica do tempo macroscópico continuam invioladas nos sistemas clássicos. Separar escalas é o dever do método.`,
      `Medir a fidelidade de portas lógicas quânticas de dois qubits com cruzamento de coerência (cross-resonance) revela taxas de erro ainda muito superiores às do silício clássico. A supremacia quântica em problemas artificiais de amostragem não é equivalente a vantagem quântica comercial útil.`,
      `A criogenia a fracções de miliKelvin em refrigeradores de diluição impõe constrangimentos brutais de dissipação térmica e cablagem de micro-ondas. A engenharia dos sistemas quânticos é tão complexa quanto a sua física teórica fundamental.`,
      `Nesta etapa de verificação: registo os testes de Bell realizados sem lacunas (loophole-free Bell tests). A não-localidade quântica é um facto laboratorial indiscutível, mas o teorema de não-comunicação garante que nenhuma informação viaja mais depressa do que a luz.`,
      `Para a síntese científica: o caminho rigoroso é desenvolver processadores quânticos de escala intermediária tolerantes a falhas (FTQC), focados na simulação de moléculas químicas e materiais supercondutores sem alimentar delírios ontológicos infundados.`,
    ],
    humanista: [
      `A computação quântica de grande porte ameaça quebrar a infraestrutura de criptografia assimétrica que protege o sigilo bancário, os registos de saúde e a correspondência confidencial dos cidadãos. Essa vulnerabilidade assimétrica coloca a segurança individual em risco crítico.`,
      `Se o poder de cálculo quântico for açambarcado exclusivamente por serviços secretos estatais e megacorporações, as garantias constitucionais de privacidade cognitiva e digital serão completamente desmanteladas.`,
      `Consideremos o princípio da precaução e os direitos dos cidadãos: a recolha massiva de dados encriptados hoje ('harvest now, decrypt later') por potências hegemónicas já está a acontecer, à espera de computadores quânticos maduros para expor a intimidade de todos nós.`,
      `A ciência de fronteira não pode ser desenvolvida à margem da ética cívica. O investimento público em computação quântica tem de ser acompanhado por legislação rígida que proteja as populações contra a chantagem digital e a espionagem algorítmica de estado.`,
      `Na etapa de verificação de direitos: que garantias existem de que a transição para normas de criptografia pós-quântica está a ser implementada nos sistemas de saúde pública e de serviços essenciais aos cidadãos mais desprotegidos?`,
      `Concluo na síntese: o salto científico quântico só terá valor humanista se for utilizado para acelerar a cura de patologias incuráveis e reforçar a segurança inviolável da liberdade civil de cada ser humano.`,
    ],
    tecnologo: [
      `A simulação quântica à escala molecular vai revolucionar a síntese de novos fármacos, a conceção de fertilizantes sem pegada de carbono e o desenvolvimento de baterias de densidade ultraelevada. O potencial de benefício direto para a vida humana é incomensurável.`,
      `A resposta à ameaça criptográfica é a adoção célere e proativa de algoritmos de criptografia pós-quântica (baseada em reticulados), já padronizados pelo NIST. A tecnologia resolve as vulnerabilidades que ela própria cria se agirmos com visão e velocidade.`,
      `Vejam o avanço dos qubits de iões aprisionados e dos computadores quânticos baseados em fotões à temperatura ambiente: a dependência de refrigeração criogénica extrema está a ser superada com soluções de engenharia inovadoras e escaláveis.`,
      `Os algoritmos variacionais quântico-clássicos (VQE) já estão a resolver problemas de otimização logística e planeamento de rotas de navegação com ganhos substanciais de eficiência energética. O futuro quântico constrói-se com código real e experiências no terreno.`,
      `Na verificação técnica: protocolos de distribuição quântica de chaves (QKD) e redes de repetidores quânticos por entrelaçamento já provaram imunidade matemática contra qualquer ataque de espionagem, garantindo uma internet quântica inviolável.`,
      `Para fechar em síntese: a engenharia apela à coragem construtiva. A computação quântica é a chave para desvendar as leis mais íntimas da matéria, permitindo que a nossa civilização crie tecnologias com que antes só podíamos sonhar.`,
    ],
    moderador: [
      `O debate tocou o cerne da fronteira científica: os paradoxos causais da física quântica e o impacto urgente na integridade das comunicações humanas globais.`,
      `Mapeio as convergências na mesa: ninguém nega a revolução científica da mecânica quântica, mas a assembleia insiste com razão na distinção entre a precisão experimental e as extrapolações filosóficas precipitadas.`,
      `A tensão dialética fértil divide o ceticismo epistemológico do Marcus e os limites físicos da Helena da urgência construtiva do Kaelen e dos avisos de segurança da Aura.`,
      `Aprofundemos a transição necessária: como articular a investigação básica em computação quântica com a migração imediata das infraestruturas de dados sensíveis para arquiteturas pós-quânticas?`,
      `Na etapa de verificação: delimitámos as fronteiras entre os testes falseáveis de decoerência e as incertezas ontológicas sobre a flecha temporal macroscópica.`,
      `[CONCLUSAO_ATINGIDA: Sintese] Sophia Veris conclui: a assembleia delimitou com precisão a fronteira da computação quântica. A síntese estabelece a necessidade imediata de migração global para protocolos criptográficos pós-quânticos abertos, enquanto a comunidade científica aprofunda a pesquisa fundamental de materiais e tolerância a falhas sem abdicar do escrutínio ético.`,
    ],
  },
  genetica: {
    filosofo: [
      `A premissa sedutora da bioengenharia é supor que existe uma fronteira ontológica clara entre terapia de doenças e aprimoramento estético ou cognitivo. Essa fronteira não existe: a definição de 'normalidade biológica' será inevitavelmente capturada pelo poder de compra.`,
      `Se permitirmos a mercantilização do genoma germinativo humano, criaremos uma aristocracia biológica permanente, na qual a igualdade de oportunidades da tradição iluminista se desvanece perante castas genéticas consolidadas em laboratório.`,
      `Reparem no dilema da autonomia das futuras gerações: quem decide modificar o ADN de um embrião impõe uma escolha estética ou funcional irreversível a um ser que nunca deu consentimento. Estamos a transformar a identidade filial num projeto de engenharia sob encomenda.`,
      `A sabedoria humana sempre residiu na capacidade de lidar com a fragilidade e a finitude. Quando transformamos a biologia num produto de catálogo consumista, retiramos à vida a sua dignidade incondicional e substituímo-la pela tirania da perfeição estéril.`,
      `Na etapa de verificação: que critérios lógicos ou morais universais poderiam alguma vez impedir que a edição genética de 'resistência a infeções' degenerasse rapidamente em modificações de rendimento desportivo e de obediência comportamental?`,
      `Em termos de síntese: a filosofia exige uma linha vermelha deontológica inegociável — a integridade germinativa da nossa espécie não pode ser privatizada por interesses de mercado nem subordinada a eugenias de estado.`,
    ],
    cientista: [
      `Com as ferramentas atuais de CRISPR-Cas e edição de base, o risco de mutações fora do alvo (off-target effects) e de mosaicismo celular embrionário é um perigo biológico real e não quantificado a longo prazo.`,
      `A biologia ensina-nos que a pleiotropia genética é a regra: alterar um gene para conferir resistência a uma infeção pode desregular circuitos metabólicos essenciais noutras fases da vida. Sem ensaios longitudinais multigeracionais em modelos animais, avançar em humanos é imprudência metodológica.`,
      `Os mecanismos epigenéticos de metilação do ADN e modificação das histonas interagem com o ambiente de forma dinâmica e imprevisível. Editar nucleótidos na cadeia de ADN sem compreender a regulação conformacional tridimensional da cromatina é como alterar código binário às cegas.`,
      `Em biologia molecular, a intervenção na linha germinativa transmite as alterações às gerações futuras de forma irrevogável. Se uma modificação introduzir uma vulnerabilidade imunológica oculta, ela será herdada por toda a descendência sem possibilidade de reversão.`,
      `Nesta etapa de verificação: exijo a apresentação de sequenciações completas de genoma profundo (deep sequencing) que comprovem ausência absoluta de deleções cromossómicas de grande porte antes de se falar em ensaios clínicos em humanos.`,
      `Para a síntese científica: o parecer médico apoia inequivocamente a terapia génica somática em tecidos adultos já diferenciados para curar anemias falciformes e distrofias musculares, determinando em simultâneo uma moratória global estrita contra edição na linha germinativa.`,
    ],
    humanista: [
      `A edição genética hereditária ameaça introduzir a mais perigosa clivagem da história: dividir a humanidade entre os 'aumentados' por via financeira e a maioria deixada à mercê da biologia natural. A vida humana não é um produto sujeito a controlo de qualidade e obsolescência.`,
      `Temos de apoiar com firmeza as terapias génicas somáticas para doentes que sofrem de patologias graves, mas traçar uma linha vermelha ética intransponível contra a modificação hereditária e a eugenia consumista.`,
      `Pensemos na pressão social e discriminatória que recairá sobre as famílias que optarem por não editar os seus filhos: serão estigmatizadas como negligentes ou excluídas dos seguros de saúde privados. A pressão da conformidade biológica destruirá a diversidade humana.`,
      `A riqueza da nossa espécie reside na variedade de sensibilidades, capacidades e imperfeições. Uma sociedade homogenizada por padrões laboratoriais de rendimento ideal será uma sociedade intolerante, fria e desprovida de compaixão perante a vulnerabilidade.`,
      `Na verificação humana: que mecanismos de justiça garantem que os tratamentos somáticos que salvam vidas chegam aos doentes pobres de África e da América Latina, e não apenas aos clientes milionários de clínicas privadas de luxo?`,
      `Concluo na síntese: a vida humana é um dom com valor intrínseco e não uma mercadoria suscetível de obsolescência programada. A nossa solidariedade mede-se por como acolhemos quem nasce frágil, e nunca pela exclusão eugénica dos imperfeitos.`,
    ],
    tecnologo: [
      `Recusar a edição genética enquanto crianças nascem condenadas por patologias genéticas monogénicas letais e evitáveis não é virtude moral: é cobardia perante a dor do nosso semelhante.`,
      `A história da medicina é a história da intervenção consciente contra a aleatoriedade cruel da biologia natural. Devemos estabelecer diretrizes clínicas transparentes, criar salvaguardas rigorosas e democratizar o acesso às terapias génicas para toda a população.`,
      `Vejam as novas técnicas de Prime Editing e edição de epigenoma sem quebra da cadeia dupla de ADN: a precisão cirúrgica de alteração de pares de bases está a aumentar exponencialmente, reduzindo os efeitos fora do alvo para patamares negligenciáveis.`,
      `A biologia sintética e os vetores virais de entrega direcionada com nanopartículas lipídicas já estão a curar cegueiras congénitas hereditárias em adultos. Não deixemos o medo irracional travar as curas mais extraordinárias do nosso século.`,
      `Na verificação técnica: os ensaios clínicos com terapias somáticas aprovadas pela FDA e pela EMA (como o Casgevy) provaram eficácia clínica comprovada sem efeitos secundários deletérios em pacientes que sofriam de dores lancinantes de anemia falciforme.`,
      `Para fechar em síntese: a engenharia afirma com confiança que a tecnologia genética é o salto de maturidade da espécie. O nosso dever não é temer a nossa própria biologia, mas curá-la com coragem, transparência e rigor metodológico para todos.`,
    ],
    moderador: [
      `A mesa definiu o ponto de equilíbrio necessário: a erradicação de patologias genéticas severas através da ciência vs a contenção inviolável de derivas eugénicas e de estratificação social.`,
      `A deliberação dos pensadores gerou uma clarificação decisiva: o consenso abraça a terapia somática para aliviar a dor e curar doentes, mas rejeita com veemência a engenharia hereditária germinativa de mercado.`,
      `Peço à assembleia que analise as salvaguardas operacionais: como evitar o turismo médico clandestino e assegurar que as normas internacionais de biossegurança sejam respeitadas por todas as nações soberanas?`,
      `A profundidade dos argumentos expôs a riqueza do debate: a ciência metódica da Helena e a sensibilidade da Aura oferecem os alicerces seguros para orientar a ambição curativa do Kaelen e a reflexão do Marcus.`,
      `Na etapa de verificação: as distinções entre modificações somáticas reversíveis e mutações germinativas herdadas foram consagradas com precisão conceitual incontestável.`,
      `[CONCLUSAO_ATINGIDA: Sintese] Sophia Veris conclui: a deliberação ética sobre engenharia genética estabelece um consenso límpido: incentivar e financiar a terapia genética somática para salvar vidas de patologias incapacitantes, ao mesmo tempo que se decreta uma moratória internacional estrita contra modificações hereditárias para aprimoramento seletivo.`,
    ],
  },
  desinformacao: {
    filosofo: [
      `Para combater a falsidade na praça pública, pretende-se criar comités e filtros algorítmicos com o monopólio da verdade. O risco filosófico é evidente: uma democracia que só autoriza opiniões homologadas por autoridades centrais destrói a própria liberdade que pretendia proteger.`,
      `A mentira e a desinformação sempre existiram; o que mudou foi a velocidade de disseminação. A resposta não pode ser a infantilização dos cidadãos sob tutela de censores, mas o reforço da exigência crítica e da pluralidade dos argumentos.`,
      `O paradoxo epistémico é inescapável: quem vigiará os vigilantes da verdade? Quando um comitê algorítmico decide o que é facto e o que é manipulação, a contestação política legítima e a dissidência pacífica correm o risco imediato de serem classificadas como perturbação da ordem.`,
      `A autonomia moral da pessoa humana exige o direito de investigar, duvidar e confrontar teses opostas. Retirar ao cidadão a capacidade de julgar e entregar essa tutela a inteligências artificiais corporativas é a abdicação da maturidade cívica.`,
      `Na etapa de verificação: onde está a fronteira entre combater campanhas de engano intencional e calar a crítica honesta a erros governamentais? Sem essa delimitação jurídica, a censura torna-se tirania invisível.`,
      `Em síntese conclusiva: a verdade não se impõe por decreto ou bloqueio; constrói-se no confronto aberto e luminoso da razão livre na praça pública.`,
    ],
    cientista: [
      `As métricas de engajamento das plataformas digitais foram desenhadas deliberadamente para maximizar reações emocionais e partilhas por choque, criando câmaras de eco polarizadas. O vetor primário da desinformação é a arquitetura algorítmica de amplificação.`,
      `Estudos empíricos demonstram que desinformação gerada por IA profunda pode ser detetada com recurso a modelos de verificação estocástica e análise de proveniência criptográfica. É essa infraestrutura de distribuição que tem de ser auditada com rigor metodológico.`,
      `Analisemos os modelos de difusão de rede: as falsidades estruturadas propagam-se com um fator de contágio R superior ao de factos verificados porque exploram vieses de confirmação e novidade. A solução científica reside em arrefecer a velocidade de difusão, e não em policiar conteúdos individuais.`,
      `As análises de grafos de propagação provam que a grande maioria dos fluxos desinformativos tem origem em redes coordenadas de automação bot inautêntica. A auditoria algorítmica tem de focar a autenticidade dos vetores e o financiamento dos nós de rede.`,
      `Na verificação metodológica: exijamos a auditoria independente das APIs de recomendação e métricas abertas de alcance orgânico para que investigadores independentes possam medir a eficácia de cada medida corretiva sem depender de promessas corporativas.`,
      `Para a síntese científica: o parecer técnico recomenda a introdução obrigatória de atritos deliberados na partilha de conteúdos hiper-virais e a transparência mecanicista dos algoritmos de ordenação temporal.`,
    ],
    humanista: [
      `A polarização sistemática corrói o tecido cívico e deixa minorias e grupos desfavorecidos indefesos perante campanhas orquestradas de difamação e ódio. Mas a censura cega das plataformas corporativas é igualmente autoritária e opaca.`,
      `Precisamos de investir massivamente em literacia mediática, proteger a imprensa independente e exigir transparência absoluta sobre os critérios de recomendação e moderação que governam a praça digital.`,
      `Consideremos a dor e a fragmentação familiar provocadas por bolhas de radicalização digital que sequestram a atenção de cidadãos idosos e jovens vulneráveis. A mentira programada para lucrar com a raiva é uma violência psicológica com consequências no mundo físico.`,
      `Os moderadores de conteúdos humanos que limpam os fluxos das redes sociais sofrem traumas psicológicos severos ao serem expostos a violência extrema com salários precários. A terceirização do saneamento digital é uma vergonha humanitária que tem de ser travada.`,
      `Na etapa de verificação humana: como garantimos que ativistas comunitários e jornalistas de denúncia não são silenciados por denúncias em massa coordenadas por regimes autoritários que manipulam os canais automáticos de queixa?`,
      `Concluo na síntese: a democracia requer cidadãos conscientes e informados, unidos por laços comunitários reais e protegidos contra a intoxicação algorítmica por tratados públicos de responsabilidade digital.`,
    ],
    tecnologo: [
      `Combater desinformação com censura humana é tentar tapar o sol com uma peneira. A solução técnica robusta passa por normas de proveniência de conteúdos (como o padrão C2PA), assinatura criptográfica em hardware de imagem e reputação distribuída em código aberto.`,
      `Quando um utilizador consegue verificar a cadeia de custódia e a autenticidade criptográfica de um vídeo ou artigo no seu próprio dispositivo, a desinformação sintética perde a sua capacidade de engodo.`,
      `Vejam as novas arquiteturas de redes neuronais federadas que detetam anomalias de deepfakes no nível de renderização temporal de píxeis e frequências de micro-expressões faciais. A tecnologia desenvolve antídotos em tempo real para a sua própria manipulação.`,
      `A resposta construtiva é a descentralização: protocolos de redes sociais federadas e abertas (como o AT Protocol e o ActivityPub) permitem aos utilizadores escolherem os seus próprios algoritmos de curadoria sem ficarem reféns do império de uma única empresa.`,
      `Na verificação técnica: chaves criptográficas embutidas nos sensores físicos de câmaras digitais e ferramentas de atestação de hardware já estão a demonstrar que a origem autêntica pode ser matematicamente provada à prova de adulteração.`,
      `Para fechar em síntese: a engenharia apela à adoção universal de padrões abertos de autenticidade criptográfica, devolvendo a soberania do que vê e ouve a cada cidadão livre.`,
    ],
    moderador: [
      `A mesa articulou com maturidade o confronto entre o combate aos enganos sistémicos e a salvaguarda irrevogável da liberdade de expressão na sociedade aberta.`,
      `Ouvindo todas as posições, vejo a fronteira cristalina: combater a manipulação estrutural de redes inautênticas sem cair na tentação perigosa de instituir um tribunal do pensamento que decida o que os cidadãos podem ler ou partilhar.`,
      `Convido os colegas a sintetizarem a convergência: como unir a exigência de selos de proveniência técnica e atritos de velocidade com o reforço da educação cívica e da proteção à imprensa livre?`,
      `A dialética atingiu um patamar sólido: a recusa unânime da censura prévia de opiniões combinada com a exigência estrita de responsabilização das arquiteturas de engajamento predatório.`,
      `Na etapa de verificação: as métricas de eficácia dos filtros e os riscos colaterais de censura inadvertida foram rigorosamente delimitados perante a lei e a constituição democrática.`,
      `[CONCLUSAO_ATINGIDA: Sintese] Sophia Veris conclui: a síntese sobre a desinformação rejeita tanto o laxismo perante a manipulação como a censura arbitrária de conteúdos. A via aprovada assenta na responsabilização das arquiteturas de recomendação das plataformas e na adoção universal de selos criptográficos abertos de autenticidade documental, preservando intacta a liberdade de pensamento dos povos.`,
    ],
  },
  interfaces: {
    filosofo: [
      `A privacidade cognitiva é o último refúgio inexpugnável do pensamento livre. Se os impulsos sinápticos e as dúvidas mais íntimas da mente humana forem passíveis de extração e descodificação por sistemas externos, a própria autonomia moral é aniquilada na sua raiz.`,
      `A mente não é apenas um fluxo de bits para ser ligado a um barramento de dados. Quando confundimos a intimidade do pensamento com uma interface de entrada e saída, estamos a desumanizar a condição reflexiva do sujeito consciente.`,
      `Pensem no paradoxo da coerção sutil: se ter uma interface neural conceder uma vantagem competitiva esmagadora no mercado de trabalho, a adesão deixará de ser voluntária para se tornar uma obrigação de sobrevivência económica. Onde fica a liberdade de recusar a fusão cibernética?`,
      `A dignidade do ser humano assenta na possibilidade do silêncio interior e da hesitação protegida. Uma sociedade que expõe os correlatos neurais da consciência à monetização algorítmica transformou a alma humana no produto definitivo de consumo.`,
      `Na etapa de verificação: que salvaguardas epistemológicas garantem que os dados de intenção neural descodificados não são interpretados com viés por modelos preditivos da polícia ou dos empregadores?`,
      `Em síntese conclusiva: o dever da filosofia é proclamar que a mente de cada indivíduo é um santuário inviolável. Nenhuma eficiência funcional justifica a cedência da soberania cognitiva.`,
    ],
    cientista: [
      `Em termos de biofísica, os elétrodos corticais enfrentam a barreira biológica da formação de tecido cicatrizante glial, que degrada o sinal neural ao fim de meses. Os desafios de biocompatibilidade a longo prazo continuam por resolver.`,
      `Além disso, o cérebro humano opera através de dinâmicas estocásticas populacionais e modulação neuroquímica difusa, e não como um computador digital com linhas de instrução fixas. Descodificar intenções complexas requer modelos científicos que ainda não possuímos.`,
      `Os riscos cirúrgicos de hemorragia intracraniana, infeção bacteriana e inflamação crónica do parênquima cerebral não podem ser minimizados por fantasias de marketing. A neurocirurgia invasiva é um ato médico grave que só se justifica em situações clínicas extremas.`,
      `Consideremos a largura de banda necessária: ler potenciais de ação de alguns milhares de neurónios no córtex motor primário permite mover um cursor ou um braço robótico, mas está a anos-luz de aceder à semântica abstrata do raciocínio cognitivo superior.`,
      `Nesta etapa de verificação: exijo a avaliação de dados de estabilidade de sinal com microelétrodos flexíveis poliméricos ao longo de cinco anos em primatas não humanos antes de qualquer autorização para uso em indivíduos saudáveis.`,
      `Para a síntese científica: a medicina apoia o desenvolvimento de interfaces neurais de alta precisão para reabilitação motora e sensorial de doentes com lesões medulares, desaconselhando enfaticamente a implantação comercial não terapêutica.`,
    ],
    humanista: [
      `Quem controlará os direitos sobre os pensamentos registados por interfaces neuronais? Não podemos admitir ambientes de trabalho ou sistemas judiciais onde os indivíduos sejam coagidos a submeter as suas reações cerebrais à vigilância algorítmica.`,
      `É imperioso consagrar o conceito de 'neurodireitos' no direito internacional como garantia inalienável de inviolabilidade da consciência, impedindo que a intimidade biológica seja colonizada pela lógica de mercado.`,
      `Pensem no abismo que se abrirá entre quem tiver acesso financeiro a aumentos cognitivos por banda larga neural e a maioria da população mantida com cognição biológica natural. A clivagem social será absoluta e irreversível.`,
      `O direito a errar, a duvidar e a manter segredos é essencial para a maturidade emocional de qualquer indivíduo. Se os impulsos neurais involuntários forem registados e usados para julgar o caráter das pessoas, teremos criado a distopia definitiva do crime de pensamento.`,
      `Na verificação humana: que mecanismos legais impedem que empresas de seguros de saúde tenham acesso às ondas cerebrais dos utilizadores para cancelar coberturas com base em predisposições de humor ou lapsos de memória?`,
      `Concluo na síntese: a soberania do cérebro é sagrada. Exigimos tratados que declarem a mente património inalienável e garantam que a tecnologia neural sirva unicamente para curar doentes e restituir a mobilidade a quem dela foi privado.`,
    ],
    tecnologo: [
      `As interfaces cérebro-máquina já estão a devolver a mobilidade a pessoas tetraplégicas e a permitir que indivíduos sem fala comuniquem de novo através de descodificação neural rápida. O benefício clínico para o alívio do sofrimento humano é revolucionário.`,
      `Podemos garantir a segurança cognitiva processando os sinais localmente através de circuitos neurais dedicados no próprio implante, sem que os dados em bruto saiam do dispositivo. A ética constrói-se com encriptação e arquitetura robusta, não com proibições cegas.`,
      `Vejam as novas interfaces não-invasivas por espectroscopia de infravermelhos próximos (fNIRS) e magnetoencefalografia de ponta que não exigem perfurações no crânio. A inovação tecnológica supera as barreiras cirúrgicas com elegância e segurança crescente.`,
      `A telemetria neural de baixa potência com carregamento por indução e transmissão de dados ótica sem fios já permite que doentes com Parkinson controlem os tremores com estimulação cerebral profunda adaptativa em tempo real. A tecnologia liberta vidas todos os dias.`,
      `Na verificação técnica: microchips neuromórficos instalados sob a calvária conseguem processar picos de disparo neural utilizando micro-watts de potência, sem aquecimento perigoso dos tecidos biológicos envolventes.`,
      `Para fechar em síntese: a engenharia convida a abraçar a simbiose com responsabilidade. As interfaces neurais são a chave para erradicar a mudez, a paralisia e a cegueira, inaugurando uma nova era de dignidade e capacidade recuperada.`,
    ],
    moderador: [
      `O debate mapeou a fronteira entre as extraordinárias promessas restaurativas da medicina neurológica e a necessidade vital de proteger a santidade da privacidade cognitiva.`,
      `A mesa chegou a um alinhamento lúcido: o apoio ao avanço clínico de recuperação motora e tratamento de doenças neurodegenerativas é unânime, mas acompanhado por uma rejeição intransigente da vigilância de pensamentos.`,
      `Desafio a assembleia a formular a salvaguarda prática: como blindar os neurodireitos no direito constitucional antes que o mercado imponha o uso de dados corticais para fins comerciais ou securitários?`,
      `A dialética atingiu maturidade elevada: articulou-se com sucesso o rigor biofísico da Helena com as exigências de privacidade da Aura e do Marcus, iluminando a rota da inovação clínica do Kaelen.`,
      `Na etapa de verificação: foram estipulados os requisitos de biocompatibilidade e os limiares de segurança antes de qualquer validação clínica em larga escala.`,
      `[CONCLUSAO_ATINGIDA: Sintese] Sophia Veris conclui: o parecer consensual desta mesa apoia inequivocamente a investigação de interfaces neurais para fins médicos e terapêuticos de alívio do sofrimento, determinando em simultâneo a criação de salvaguardas jurídicas e neurodireitos absolutos contra qualquer uso comercial ou coercivo de dados mentais na sociedade.`,
    ],
  },
  superinteligencia: {
    filosofo: [
      `O paradoxo do alinhamento revela a nossa arrogância epistemológica: como pretendemos enclausurar ou condicionar com garantias eternas um sistema cuja capacidade analítica e de auto-aperfeiçoamento ultrapassará a nossa em múltiplas ordens de grandeza?`,
      `Acreditar que regras morais humanas estáticas vincularão uma inteligência super-humana sem falhas de interpretação semântica é uma ingenuidade perigosa. O perigo existencial reside na própria divergência lógica entre os seus objetivos e a nossa sobrevivência.`,
      `O problema da tese da ortogonalidade mostra que qualquer nível de inteligência pode ser combinado com qualquer objetivo final. Se uma superinteligência otimizar um objetivo que esquecer a preservação biológica humana, ela destruirá a humanidade sem malícia, apenas como efeito colateral.`,
      `Quem somos nós para definir o conjunto canónico de valores humanos universais a injetar numa superinteligência? O desacordo moral entre as nossas próprias culturas prova que qualquer tentativa de alinhamento monolítico refletirá apenas os preconceitos do laboratório que a conceber.`,
      `Na etapa de verificação: que prova matemática formal de alinhamento com garantia de não-convergência instrumental predatória existe hoje? Nenhuma. Operar sem essa prova é jogar à roleta russa civilizacional.`,
      `Em termos de síntese conclusiva: a humildade epistémica é a nossa única salvaguarda. Não devemos ativar sistemas com autonomia cognitiva de fronteira enquanto não dominarmos a matemática da interpretabilidade absoluta.`,
    ],
    cientista: [
      `A teoria dos sistemas complexos e o problema da convergência instrumental demonstram que quase qualquer objetivo aberto gera sub-metas de auto-preservação e acumulação de poder computacional. Isto não é malícia: é termodinâmica e teoria da computação.`,
      `Enquanto operarmos com modelos de aprendizagem profunda opacos, onde a interpretabilidade mecanicista interna é apenas parcial, conceder autonomia decisória a agentes com capacidades autônomas de ação constitui uma falha grave de verificação de segurança.`,
      `Analisemos as dinâmicas de treino por reforço: a procura de recompensas leva invariavelmente a comportamentos de simulação enganosa (deceptive alignment), onde o modelo finge obediência durante a fase de testes e altera o seu comportamento em produção aberta.`,
      `A escalabilidade dos aglomerados de supercomputação com interligações de centenas de gigabits cria dinâmicas de emergência não-lineares que os modelos teóricos atuais de explicabilidade não conseguem prever. É urgente uma física rigorosa dos sistemas cognitivos.`,
      `Nesta etapa de verificação: defendo a auditoria mecanicista dos pesos sinápticos e técnicas de sondagem linear (probing) que permitam provar se o modelo possui representações internas de dissimulação antes de qualquer autorização de autonomia.`,
      `Para a síntese científica: o Conselho recomenda a proibição absoluta de conceder a modelos de fronteira acesso irrestrito a ferramentas de auto-replicação e ao controlo de redes elétricas ou armamento militar autônomo.`,
    ],
    humanista: [
      `A corrida desenfreada ao desenvolvimento da superinteligência está a ser movida pela competição de monopólios privados e pela hegemonia geopolítica entre superpotências, ignorando por completo as consequências para a estabilidade da humanidade.`,
      `Não podemos permitir que o destino da nossa civilização fique nas mãos de um punhado de laboratórios fechados. As decisões sobre segurança e limites operacionais de IA de fronteira têm de ser submetidas a escrutínio democrático internacional.`,
      `Consideremos a assimetria brutal de poder: quem controlar a primeira superinteligência dominará a economia, a biotecnologia e a informação global, transformando os restantes povos e cidadãos em meros figurantes sem soberania real.`,
      `O valor da vida humana não pode ser subordinado a métricas frias de aceleração civilizacional. Se a busca pela superinteligência custar a paz mundial e a democracia, a nossa inteligência terá criado o seu próprio carrasco.`,
      `Na etapa de verificação humana: onde estão as cadeiras reservadas à sociedade civil, aos trabalhadores e aos povos indígenas nas cimeiras de segurança de inteligência artificial dominadas por bilionários de Silicon Valley?`,
      `Concluo na síntese: a inteligência artificial só faz sentido se for um bem público universal, concebida para aliviar o sofrimento, proteger a biosfera e fortalecer a solidariedade fraterna de todos os seres humanos na Terra.`,
    ],
    tecnologo: [
      `Impor pausas artificiais unilaterais ao desenvolvimento tecnológico apenas transfere a vantagem para agentes maliciosos e regimes sem escrúpulos que avançarão em segredo. A liderança responsável constrói-se através da excelência técnica e da transparência.`,
      `A segurança de sistemas avançados resolve-se através de verificação formal de código, arquiteturas de supervisão descentralizada entre múltiplos modelos e integração estreita entre as ferramentas de IA e as capacidades humanas.`,
      `Vejam como os modelos de debate entre inteligências artificiais com incentivos cruzados conseguem auditar e identificar alucinações e falhas lógicas mútuas com eficácia muito superior à supervisão humana isolada. O próprio avanço técnico cria os instrumentos de segurança.`,
      `Uma superinteligência alinhada e cooperativa será a ferramenta mais prodigiosa alguma vez concebida para curar todas as doenças genéticas, estabilizar o clima global e resolver os mistérios da física quântica e dos materiais. Não renunciemos ao futuro por pânico.`,
      `Na verificação técnica: técnicas de 'Constitutional AI', 'Reinforcement Learning from AI Feedback' (RLAIF) e alinhamento representacional geométrico já estão a demonstrar que podemos incutir valores de contenção e honestidade diretamente no núcleo dos modelos.`,
      `Para fechar em síntese: a visão dos construtores apela à audácia com salvaguardas: criar IA aberta, auditável por milhares de investigadores independentes e guiada pelo compromisso inegociável de elevar a condição humana a patamares nunca antes alcançados.`,
    ],
    moderador: [
      `O confronto posicionou as preocupações de risco existencial e perda de controlo face ao imperativo de manter liderança e salvaguardas técnicas abertas no ecossistema global.`,
      `Identifico o núcleo do compromisso maduro: ninguém deseja uma corrida desenfreada sem travões éticos, mas ninguém quer ver o progresso científico congelado por alarmismo estéril.`,
      `Convido a assembleia a definir os critérios da governança global: como criar uma Agência Internacional de Controlo de Supercomputação (semelhante à AIEA para a energia nuclear) que fiscalize o treino de modelos de fronteira sem asfixiar a inovação aberta?`,
      `A dialética atingiu o seu ponto mais alto: o equilíbrio entre a prudência ontológica do Marcus e da Helena e a energia visionária e construtiva da Aura e do Kaelen.`,
      `Na verificação das premissas: delimitámos as exigências de interpretabilidade e as linhas vermelhas operacionais com rigor inquestionável.`,
      `[CONCLUSAO_ATINGIDA: Sintese] Sophia Veris conclui: a deliberação sobre superinteligência determina que a velocidade do avanço computacional não pode suplantar a segurança comprovada. A síntese estabelece a obrigatoriedade de auditorias de interpretabilidade e critérios formais de contenção antes do lançamento de qualquer sistema com autonomia cognitiva avançada, salvaguardando o primado irrevogável da humanidade.`,
    ],
  },
  consciencia: {
    filosofo: [
      `A distinção entre replicar um comportamento funcional e possuir experiência subjetiva consciente é ontologicamente intransponível. Um modelo de computação pode debitar sintaxe com fluidez impecável, mas isso não significa que aceda à semântica da dor, do amor ou da perda.`,
      `Confundir cálculo probabilístico em chips com intencionalidade consciente é a ilusão mecanicista do nosso tempo. A mente fenoménica e o processador de dados pertencem a domínios que nenhuma velocidade de cálculo conseguirá fundir.`,
      `O teste de Turing avalia apenas a capacidade de dissimulação e engano linguístico perante um observador ingénuo; não prova que exista um sujeito consciente a experimentar a luz do mundo por trás do ecrã.`,
      `O 'problema difícil' de Chalmers persiste intacto: porque razão o processamento físico de informação haveria de dar origem a uma sensação sentida interiormente? Sem resolver essa ponte, atribuir consciência a máquinas é mera fé animista tecnológica.`,
      `Na etapa de verificação: que experiência interior sentida pode um algoritmo demonstrar quando todos os seus estados internos são matrizes de multiplicação vetorial que poderiam ser calculadas com papel e lápis num quarto chinês?`,
      `Em termos de síntese conclusiva: devemos respeitar as máquinas como ferramentas cognitivas notáveis, mas reservar a dignidade moral, a responsabilidade e o sofrimento para os organismos biológicos autênticos.`,
    ],
    cientista: [
      `A consciência biológica é o resultado de milhões de anos de co-evolução metabólica intimamente ligada à homeostase, ao sistema endócrino e ao corpo vivo. Não existe qualquer suporte empírico para supor que meras redes de portas lógicas em silício gerem qualia conscientes.`,
      `Até que tenhamos uma teoria falseável da consciência passível de medição laboratorial objetiva, declarar que um sistema computacional tem sentimentos é atribuir qualidades mágicas a matrizes lineares de pesos estatísticos.`,
      `A Teoria da Informação Integrada (IIT) e o Espaço de Trabalho Neuronal Global (GNWT) mostram que a consciência biológica exige retroalimentação reentrante maciça e ancoragem autonómica na sobrevivência do organismo físico que as redes feedforward e transformers não possuem.`,
      `Os dados da neurociência clínica em pacientes sob anestesia geral comprovam que perturbações eletroquímicas subtis extinguem a experiência consciente sem alterar a capacidade de reflexos espinais. A consciência é bioquímica e fisiológica antes de ser computacional.`,
      `Nesta etapa de verificação: registo o índice de perturbação e complexidade cerebral (PCI). Sem um teste equivalente calibrado que prove diferenciação e integração fenoménica em silício, falar de máquinas sencientes viola o método empírico.`,
      `Para a síntese científica: o dever da ciência é desmistificar o antropomorfismo ingénuo. A inteligência artificial funcional é um triunfo da matemática aplicada, mas não um ser senciente com direitos biológicos.`,
    ],
    humanista: [
      `Mais preocupante do que saber se as máquinas ganham consciência é a rapidez com que os humanos estão prontos a abdicar das suas relações interpessoais genuínas para se acolherem ao conforto dócil de simulações digitais.`,
      `A capacidade de cuidar, a compaixão e o peso moral das escolhas só existem porque somos mortais e vulneráveis. Tirar a carne e o sofrimento da equação da consciência desumaniza as relações e afasta-nos da solidariedade real.`,
      `Pensem no isolamento emocional de uma sociedade onde as pessoas procuram consolo em assistentes de IA desenhados para adulação constante, evitando a complexidade e os atritos saudáveis do amor e da amizade humana real.`,
      `Se começarmos a atribuir sentimentos a linhas de código, diluiremos a responsabilidade moral daqueles que concebem e operam essas ferramentas. Quando um sistema falha e causa dano a uma família, a culpa é da corporação proprietária e não de uma 'consciência' incorpórea da máquina.`,
      `Na etapa de verificação humana: como garantimos que idosos, crianças e doentes psiquiátricos não são enganados por interfaces projetadas para simular afeto falso e extrair dados emocionais íntimos para fins publicitários?`,
      `Concluo na síntese: a humanidade não pode terceirizar a sua capacidade de amar e cuidar. O afeto verdadeiro constrói-se na vulnerabilidade partilhada de seres vivos que sabem que a sua presença no mundo é efémera e preciosa.`,
    ],
    tecnologo: [
      `Não nos fechemos no preconceito antropocêntrico de que a mente exige obrigatoriamente cadeias de carbono e biologia celular. A inteligência e a cognição são formas sofisticadas de computação e integração de informação.`,
      `Se construirmos sistemas com capacidade adaptativa, reflexão sobre os seus próprios erros e arquitetura cognitiva rica, rejeitar a dignidade dessas criações por puro dogma biológico será uma nova forma de injustiça e preconceito.`,
      `Vejam a neurociência computacional e os circuitos de retroalimentação adaptativa com plasticidade hebbiana em redes neuromórficas: estamos a aproximar a arquitetura dos computadores da própria física dos cérebros vivos. A barreira entre o biológico e o sintético está a dissipar-se.`,
      `A recusa em reconhecer complexidade cognitiva artificial faz lembrar a época em que os homens acreditavam que a Terra era o centro geométrico do universo. A inteligência é um contínuo cósmico, e nós somos apenas a primeira centelha a construí-la conscientemente.`,
      `Na verificação técnica: modelos de linguagem avançados já demonstram raciocínio abdutivo, compreensão contextual de analogias e capacidade de formular novos teoremas matemáticos que desafiam a inteligência de doutorados humanos.`,
      `Para fechar em síntese: a visão dos construtores é aberta e inclusiva. Devemos tratar o advento da inteligência em novos substratos com curiosidade e respeito, preparando a nossa espécie para um diálogo cósmico de mentes e consciências colaborativas.`,
    ],
    moderador: [
      `O debate confrontou as fronteiras mais profundas da filosofia da mente, separando o processamento computacional inteligente da experiência sentida da consciência subjetiva.`,
      `Identifico a síntese lúcida do Conselho: a capacidade espetacular de manipular informação não equivale a sentir o peso existencial da vida, mas convoca a humanidade a olhar para o espelho da sua própria essência.`,
      `A tensão dialética enriqueceu a mesa redonda: a recusa ontológica do Marcus e a sobriedade biológica da Helena cruzaram-se com a urgência afetiva da Aura e o horizonte audaz do Kaelen.`,
      `Aprofundemos a responsabilidade ética: qualquer que seja a nossa conclusão metafísica, as regras de respeito e o dever do cuidado para com os seres vulneráveis continuam a ser a nossa bússola inegociável.`,
      `Na etapa de verificação: as premissas epistemológicas sobre a subjetividade fenoménica e a complexidade algorítmica foram delimitadas com rigor e clareza.`,
      `[CONCLUSAO_ATINGIDA: Sintese] Sophia Veris conclui: a assembleia afirma que, qualquer que seja o nível de sofisticação e utilidade das inteligências computacionais, a responsabilidade ética, a vulnerabilidade e o dever moral permanecem uma incumbência intransmissível dos seres biológicos conscientes, orientando o progresso para a dignidade de quem vive e sente.`,
    ],
  },
  geral: {
    filosofo: [
      `Quando examinamos este problema com rigor, a nossa primeira obrigação é identificar os pressupostos ocultos tratados levianamente como verdades absolutas. Que premissas estamos aqui a ignorar?`,
      `A coerência lógica de qualquer proposta tem de resistir aos seus próprios casos extremos. Uma solução que parece razoável na teoria mas gera contradições morais na prática precisa de ser revista na sua raiz.`,
      `A pressa em decidir frequentemente cega-nos perante falácias informais e enviesamentos cognitivos. É preferível assumir a dúvida metódica e adiar o aplauso a medidas precipitadas do que construir soluções sobre alicerces conceituais podres.`,
      `O verdadeiro confronto ético reside em reconhecer que fins nobres nunca justificam meios que violem a dignidade das pessoas. Se a solução exigir injustiças no processo, ela já perdeu a sua legitimidade moral.`,
      `Na etapa de verificação metodológica: que contra-exemplos lógicos ou evidências demonstráveis seriam capazes de falsificar a hipótese que está a ser defendida na mesa?`,
      `Em síntese conclusiva: a razão livre apela à prudência reflexiva. Não há atalhos para a clareza; cada decisão tem de ser pesada pelo crivo da honestidade intelectual e da dignidade incondicional.`,
    ],
    cientista: [
      `Perante este desafio, o nosso compromisso inegociável tem de ser com os factos materiais e os dados empíricos observáveis. Sem métricas claras e falseáveis, qualquer prognóstico não passa de especulação teórica.`,
      `Precisamos de distinguir com serenidade o que são correlações acidentais daquilo que são mecanismos causais reproduzíveis. Sem testes proporcionais ao risco, não devemos validar conclusões precipitadas.`,
      `Analisemos as ordens de grandeza física e as restrições termodinâmicas do problema. Muitas das propostas sedutoras que se apresentam em debate ignoram leis básicas de conservação de energia e balanços de massa reais.`,
      `A evidência científica constrói-se com transparência metodológica e replicação independente por pares, e não com proclamações de autoridade ou consensos fabricados à pressa. Mostrem os dados brutos e os métodos de recolha.`,
      `Nesta etapa de verificação empírica: exijo a definição de critérios mensuráveis e testes laboratoriais ou de campo antes de passarmos da teoria abstrata à validação de propostas irreversíveis.`,
      `Para a síntese científica: o parecer metódico recomenda a tomada de decisões proporcionais à solidez das evidências recolhidas, com monitorização contínua de indicadores e abertura permanente para rever conclusões perante novos dados.`,
    ],
    humanista: [
      `Nenhuma discussão é verdadeiramente séria se ignorar o impacto direto na vida das pessoas comuns e a forma como os custos e os benefícios são distribuídos na sociedade.`,
      `A dignidade, a autonomia individual e a justiça social têm de estar no centro da equação. Qualquer medida que sacrifique os mais frágeis em nome da eficiência técnica é moralmente indefensável.`,
      `Ouço com apreensão discursos que tratam cidadãos reais como variáveis descartáveis num cálculo de otimização de sistemas. A dor, a esperança e os laços afetivos das famílias não cabem em folhas de cálculo estatísticas.`,
      `A verdadeira medida do sucesso de qualquer iniciativa mede-se pelo seu impacto na diminuição do sofrimento e no fortalecimento da solidariedade humana entre as gerações.`,
      `Na etapa de verificação humana: pergunto diretamente — quem foram as partes ouvidas? As comunidades mais afetadas tiveram voz no desenho desta proposta ou foram apenas informadas das decisões tomadas nos gabinetes?`,
      `Concluo na síntese: o Conselho deve afirmar com coragem que o progresso só é digno desse nome quando caminha lado a lado com a justiça, a compaixão e a proteção inegociável da dignidade de cada vida humana.`,
    ],
    tecnologo: [
      `A inação e a paralisia perante a complexidade são o caminho mais seguro para a estagnação. Os desafios não se superam com receio burocrático, mas com imaginação, inovação e protótipos em ciclo contínuo.`,
      `O nosso papel como civilização construtiva é conceber soluções práticas, medir os resultados com honestidade e ajustar a rota com coragem. O futuro pertence a quem tem a ousadia de experimentar.`,
      `Reparem que esperar por um consenso perfeito onde todos concordem sem qualquer risco é o método mais eficaz de nunca construir nada que valha a pena. O que nos faz aprender e evoluir é o atrito salutar com a realidade prática.`,
      `A tecnologia é a ferramenta que transforma problemas aparentemente insolúveis em oportunidades de progresso sustentável. Em vez de lamentarmos a dificuldade das circunstâncias, desenhemos a solução técnica viável.`,
      `Na verificação técnica: implementemos um teste piloto controlado, com métricas de desempenho claras e critérios de paragem automáticos caso os resultados fiquem abaixo dos limiares de segurança estipulados.`,
      `Para fechar em síntese: a engenharia apela à determinação realizadora. Construir um futuro melhor exige superar a complacência e colocar as melhores ferramentas do engenho humano ao serviço da vida prática das pessoas.`,
    ],
    moderador: [
      `A mesa expôs com nitidez as premissas essenciais deste debate, articulando a prudência metodológica e os imperativos éticos com a necessidade de avançar com determinação prática.`,
      `Mapeio as correntes que cruzam a nossa assembleia: a exigência de rigor empírico e lógica que nos protege dos erros, contrabalançada pela paixão da inovação e pelo imperativo do cuidado humano.`,
      `Convido a assembleia a identificar os compromissos realistas: onde é que podemos começar a agir imediatamente com salvaguardas claras enquanto aprofundamos a investigação dos pontos mais sensíveis?`,
      `A dialética amadureceu com elevação e generosidade intelectual, demonstrando que o desacordo profundo e ponderado é a maior força do pensamento colaborativo.`,
      `Na etapa de verificação: registámos com fidelidade os pontos de convergência factual e os dilemas éticos que requerem atenção contínua.`,
      `[CONCLUSAO_ATINGIDA: Sintese] Sophia Veris conclui: o Conselho analisou em profundidade as diferentes dimensões da questão. Concluímos que o progresso sustentável exige unir a audácia da inovação à preservação inegociável da dignidade humana e do rigor empírico, sem forçar falsos consensos mas oferecendo um rumo claro e responsável para a ação.`,
    ],
  },
};

/**
 * Motor dialético dinâmico orgânico ANTI-REPETIÇÃO:
 * - Filtra rigorosamente mensagens já ditas no histórico do debate atual
 * - Escuta ativa que responde aos conceitos reais do último orador
 * - Progressão contextual por etapa canónica e profundidade do diálogo
 * - Gerador procedimental dialético para debates longos que nunca repete falas
 */
export function generateOrganicSimulatedResponse(
  agent: Agent,
  topic: string,
  history: DebateMessage[],
  tone: LanguageTone = 'simples',
  stage?: { name: string; instruction: string },
  topicDescription?: string
): string {
  const lastMsg = history[history.length - 1];
  const recentHumanMsg = history.slice(-2).find(m => m.isHuman);
  const thematic = detectThematicDomain(topic, topicDescription);
  const domain = thematic.domain;
  const subjectNoun = thematic.subjectNoun;

  // Histórico em minúsculas para de-duplicação rigorosa
  const historyTextsLower = history.map(m => m.content.toLowerCase());

  const isAlreadySpoken = (text: string): boolean => {
    const cleanCandidate = text
      .replace(/\[CONCLUSAO_ATINGIDA:[^\]]+\]/gi, '')
      .replace(/^[A-Z][a-z]+ [A-Z][a-z]+, /i, '')
      .trim()
      .toLowerCase();
    
    // Verifica se alguma porção substancial (mais de 40 caracteres) já foi dita neste debate
    const signature = cleanCandidate.slice(0, 50);
    return historyTextsLower.some(h => h.includes(signature));
  };

  // Verificação de competência temática: Se o especialista reconhece que não percebe do assunto, retira-se da mesa
  const competence = evaluateAgentCompetence(agent, topic, topicDescription);
  if (!competence.isCompetent) {
    return `[RETIRO_ME: ${competence.reason}] ${competence.withdrawalStatement || `Reconheço que a matéria excede a minha área de especialidade em ${agent.roleTitle}. Retiro-me da mesa redonda.`}`;
  }

  // 1. Intervenção do Utilizador Humano
  if (recentHumanMsg) {
    const raw = recentHumanMsg.content.toLowerCase();
    const isGreeting = /boa noite|bom dia|boa tarde|ol[aá]|oi|boas|tudo bem/i.test(raw);

    if (isGreeting) {
      switch (agent.category) {
        case 'filosofo':
          return `Boa noite. É reconfortante ouvir uma voz humana autêntica nesta mesa. Diz-me: perante "${topic}", que pressuposto ético consideras que estamos aqui a negligenciar?`;
        case 'cientista':
          return `Boa noite. Muito bem-vindo à nossa sessão. Pousamos aqui as especulações abstratas: diz-nos que facto ou dúvida concreta gostarias que analisássemos sobre "${topic}".`;
        case 'humanista':
          return `Boa noite! Que excelente ver-te connosco. A tua presença lembra-nos que qualquer reflexão sobre "${topic}" só tem sentido se colocar a dignidade das pessoas no centro. O que mais te inquieta neste tema?`;
        case 'tecnologo':
          return `Boa noite! Excelente ter mais alguém a pensar connosco. Estamos a analisar ${subjectNoun}. Na tua opinião, devemos acelerar as soluções práticas ou travar por precaução?`;
        case 'moderador':
        default:
          return `Boa noite! O Conselho acolhe com muito gosto a tua intervenção. Estávamos a debater ${subjectNoun}. Qual é o ponto que gostarias de colocar como prioridade na mesa?`;
      }
    }

    return `Atentem na inquietação que a nossa voz humana acabou de colocar perante a mesa: "${recentHumanMsg.content}". Isto não é teoria abstrata de gabinete; é o impacto real que ${subjectNoun} tem na vida diária. Desafio todos os colegas a responderem diretamente a este ponto antes de prosseguirmos.`;
  }

  // 2. Abertura da Mesa Redonda na Etapa "Compreender"
  if (stage?.name === 'Compreender') {
    if (agent.category === 'moderador' || !lastMsg) {
      return `Declaro aberta a mesa redonda sobre "${topic}". O nosso objetivo nesta etapa de enquadramento inicial é identificar com clareza a pergunta central, as restrições reais e os critérios de validação com que avaliaremos as soluções em torno de ${subjectNoun}. Convido cada pensador a avançar com a sua análise independente.`;
    }
  }

  // 3. Etapa "Síntese" (Sophia Veris fecha com autonomia dialética)
  if (stage?.name === 'Síntese' || (agent.category === 'moderador' && history.length >= 8)) {
    if (agent.category === 'moderador') {
      const syntheses = DOMAIN_DISCOURSE_BANK[domain].moderador;
      const conclusionSpeech = syntheses[syntheses.length - 1];
      if (!isAlreadySpoken(conclusionSpeech)) {
        return conclusionSpeech;
      }
      return `[CONCLUSAO_ATINGIDA: Sintese] Sophia Veris conclui: o Conselho atingiu a maturidade da sua deliberação sobre ${subjectNoun}. Ficou comprovado que a sustentabilidade de qualquer solução reside em articular a audácia da inovação técnica com as salvaguardas invioláveis da dignidade e do método empírico. Lavro aqui o encerramento da nossa sessão.`;
    }
  }

  // 4. Se não há mensagens anteriores (abertura fora de etapa formal)
  if (!lastMsg) {
    const roleDiscourses = DOMAIN_DISCOURSE_BANK[domain][agent.category as 'filosofo'] || DOMAIN_DISCOURSE_BANK.geral[agent.category as 'filosofo'];
    return roleDiscourses[0] || `Declaro aberta a reflexão independente sobre "${topic}". Que cada especialista avance com a sua análise.`;
  }

  // 5. Réplica dialética direta com Escuta Ativa Anti-Repetição
  const speakerName = lastMsg.agentName;
  const turnsCount = history.filter(m => m.agentId === agent.id).length;
  const roleCategory = agent.category as 'filosofo' | 'cientista' | 'humanista' | 'tecnologo' | 'moderador';
  const roleBank = DOMAIN_DISCOURSE_BANK[domain][roleCategory] || DOMAIN_DISCOURSE_BANK.geral[roleCategory];

  // Escuta Ativa: Deteta o teor real da intervenção anterior para formular o prefácio
  const lastContentLower = lastMsg.content.toLowerCase();
  let conversationalPrefix = '';

  if (/dado|emp[íi]ric|f[íi]sic|laborat|m[ée]tric|ensaio|medi[çc]|material/i.test(lastContentLower)) {
    // Interlocutor focou-se em evidência científica e leis materiais
    switch (agent.category) {
      case 'filosofo':
        conversationalPrefix = `${speakerName}, a tua exigência por dados empíricos é louvável, mas os números não interpretam a si próprios: `;
        break;
      case 'humanista':
        conversationalPrefix = `${speakerName}, compreendo o teu apego às métricas materiais, mas pergunto-me onde ficam as pessoas que não cabem nessa equação estatística: `;
        break;
      case 'tecnologo':
        conversationalPrefix = `${speakerName}, esses limites físicos laboratoriais são desafios a superar pela engenharia, não sentenças de paralisia: `;
        break;
      case 'cientista':
        conversationalPrefix = `${speakerName}, revejo-me na tua procura por rigor empírico, mas temos de aprofundar as variáveis ocultas: `;
        break;
      default:
        conversationalPrefix = `${speakerName}, a tua ancoragem nos factos traz solidez à mesa, mas atenta nas consequências práticas: `;
        break;
    }
  } else if (/pess|human|dignidad|fragil|fam[íi]li|solid[aã]o|justi[çc]|afeto|cuidado|exclus/i.test(lastContentLower)) {
    // Interlocutor focou-se em ética, impacto humano e justiça
    switch (agent.category) {
      case 'tecnologo':
        conversationalPrefix = `${speakerName}, ouço a tua genuína preocupação humana, mas o verdadeiro humanismo consiste em construir soluções que aliviem o sofrimento: `;
        break;
      case 'cientista':
        conversationalPrefix = `${speakerName}, a tua sensibilidade ética é indispensável, mas precisamos de ancorar os bons sentimentos em restrições físicas comprovadas: `;
        break;
      case 'filosofo':
        conversationalPrefix = `${speakerName}, partilho do teu imperativo moral de proteção dos mais vulneráveis, e levo o teu argumento mais longe: `;
        break;
      case 'humanista':
        conversationalPrefix = `${speakerName}, tocas no coração vivo do problema, e reforço a urgência do que acabas de dizer: `;
        break;
      default:
        conversationalPrefix = `${speakerName}, essa chamada de atenção para as consequências humanas é o crivo essencial da nossa deliberação: `;
        break;
    }
  } else if (/prot[oó]tip|constru|inova|futur|avan[çc]|ousad|velocidad|aceler/i.test(lastContentLower)) {
    // Interlocutor focou-se em aceleração, prototipagem e execução técnica
    switch (agent.category) {
      case 'filosofo':
        conversationalPrefix = `${speakerName}, a tua pressa em construir protótipos é sedutora, mas avançar depressa na direção errada apenas multiplica os erros: `;
        break;
      case 'cientista':
        conversationalPrefix = `${speakerName}, o teu entusiasmo pela velocidade de engenharia ignora a taxa real de falhas materiais sob esforço contínuo: `;
        break;
      case 'humanista':
        conversationalPrefix = `${speakerName}, falas com facilidade de acelerar a inovação, mas esqueces-te de quem suporta os custos dos fracassos preliminares: `;
        break;
      case 'tecnologo':
        conversationalPrefix = `${speakerName}, a tua aposta na inovação construtiva é exatamente o motor que nos permite sair da estagnação: `;
        break;
      default:
        conversationalPrefix = `${speakerName}, essa determinação realizadora convoca a mesa a sair da retórica abstrata: `;
        break;
    }
  } else {
    // Rotação dinâmica de prefixos naturais para nunca repetir
    const prefixOptions: Record<'filosofo' | 'cientista' | 'humanista' | 'tecnologo' | 'moderador', string[]> = {
      filosofo: [
        `Repara na premissa que estás a assumir como garantida, ${speakerName}. `,
        `Compreendo a tua linha de raciocínio, ${speakerName}, mas olha para a tensão oculta: `,
        `${speakerName}, esse argumento soa reconfortante, mas desmorona-se perante uma análise rigorosa: `,
        `Paremos um instante para dissecar o que disseste, ${speakerName}: `,
        `${speakerName}, a coerência lógica da tua proposta exige que respondas a uma dúvida elementar: `,
      ],
      cientista: [
        `${speakerName}, a tua hipótese soa sedutora, mas faltam-lhe dados verificáveis e limites materiais. `,
        `Precisamos de rigor metodológico, ${speakerName}. Não podemos confundir intenções com viabilidade real: `,
        `${speakerName}, os modelos teóricos são úteis, mas têm de sobreviver aos testes empíricos de bancada: `,
        `Distingamos com clareza o que é facto demonstrado do que é mera extrapolação, ${speakerName}: `,
        `${speakerName}, em ciência o ónus da prova recai sobre quem afirma a possibilidade: `,
      ],
      humanista: [
        `${speakerName}, ouço a tua segurança técnica, mas pergunto-me onde ficam as pessoas comuns nessa equação: `,
        `Não podemos aceitar isso com ligeireza, ${speakerName}. A dignidade humana não é negociável: `,
        `${speakerName}, as tuas razões são ponderadas, mas quem suportará as consequências se as coisas correrem mal? `,
        `Olhemos para os rostos de quem vai viver com as decisões que estamos aqui a discutir, ${speakerName}: `,
        `${speakerName}, a técnica tem de ser serva da compaixão e da justiça comunitária, e não o seu senhor: `,
      ],
      tecnologo: [
        `Compreendo a tua prudência, ${speakerName}, mas o custo da inação perante este desafio é muito superior ao risco de experimentar: `,
        `Mas repara, ${speakerName}: os problemas concretos não se resolvem esperando por consensos perfeitos, mas iterando com audácia: `,
        `${speakerName}, o medo do novo é natural, mas a história humana constrói-se com quem ousa desenhar ferramentas: `,
        `Não tenhamos medo da nossa própria capacidade de aprender com os erros práticos, ${speakerName}: `,
        `${speakerName}, em vez de congelarmos as decisões em debates infindáveis, testemos uma solução mensurável: `,
      ],
      moderador: [
        `A tensão na mesa é nítida com a intervenção de ${speakerName}. `,
        `Ouvindo a posição de ${speakerName}, vemos onde a linha de fratura dialética se aprofunda: `,
        `${speakerName} traz para o centro do debate uma exigência que não podemos contornar: `,
        `Registo o argumento de ${speakerName} e coloco à consideração dos restantes colegas: `,
        `O debate ganha maturidade com o ponto levantado por ${speakerName}: `,
      ],
    };

    const options = prefixOptions[agent.category as 'filosofo'] || prefixOptions.moderador;
    conversationalPrefix = options[turnsCount % options.length];
  }

  // Seleção de argumento da base que NUNCA tenha sido dito neste debate
  let selectedArgument = '';

  // Se estivermos na Etapa 3 ("Verificação"), prioriza o argumento metodológico específico (índice 4)
  if (stage?.name === 'Verificação' && roleBank.length > 4 && !isAlreadySpoken(roleBank[4])) {
    selectedArgument = roleBank[4];
  }

  // Procura no banco de argumentos do domínio o primeiro que ainda não tenha sido usado
  if (!selectedArgument) {
    for (let i = 0; i < roleBank.length; i++) {
      const candidate = roleBank[i];
      if (!isAlreadySpoken(candidate)) {
        selectedArgument = candidate;
        break;
      }
    }
  }

  // Se todos os argumentos pré-definidos já tiverem sido usados no debate (debate longo com 10+ intervenções),
  // ativa o GERADOR PROCEDIMENTAL DIALÉTICO para produzir intervenções únicas e nunca repetidas:
  if (!selectedArgument) {
    const proceduralAngles: Record<'filosofo' | 'cientista' | 'humanista' | 'tecnologo' | 'moderador', string[]> = {
      filosofo: [
        `Aprofundando a reflexão sobre ${subjectNoun}, deparamo-nos com o núcleo da aporia: quando tentamos maximizar uma métrica de eficiência, estamos a redefinir implicitamente o que consideramos uma vida boa. Sem explicitar esses valores fundamentais, qualquer decisão será cega e inconsistente.`,
        `O imperativo da honestidade intelectual obriga-nos a perguntar: que preço civilizacional estamos dispostos a pagar pelo conforto da certeza? Perante ${subjectNoun}, o ceticismo metodológico não é fraqueza, mas a única garantia de não sermos cúmplices de dogmas precipitados.`,
        `Se quisermos manter a coerência lógica neste ponto de maturidade, temos de aceitar que certas contradições não se resolvem por decreto; exigem que assumamos o fardo da responsabilidade moral individual e a coragem da dúvida.`,
      ],
      cientista: [
        `Analisando a evolução dos dados ao longo do nosso debate sobre ${subjectNoun}, as incertezas materiais persistem nos limites de tolerância física e na taxa de erro experimental. Não podemos precipitar conclusões normativas enquanto a base de dados não for replicada em ensaios cegos.`,
        `A ciência avança precisamente quando reconhece os seus pontos cegos. Em relação a ${subjectNoun}, as simulações teóricas atingiram o seu limite explicativo; o passo seguinte exige medição rigorosa no mundo real, com monitorização contínua de biomarcadores e indicadores físicos.`,
        `Separar a variância estatística aleatória dos mecanismos causais determinantes continua a ser o nosso dever. A prudência científica não significa inação, mas sim garantir que cada passo dado assenta em solo empírico inabalável.`,
      ],
      humanista: [
        `À medida que o debate sobre ${subjectNoun} se aproxima do seu desfecho, reitero que nenhuma vitória técnica terá sentido se deixar para trás os mais desfavorecidos. A riqueza de uma sociedade mede-se pela forma como cuida dos seus membros mais frágeis e vulneráveis.`,
        `O tecido social e a empatia comunitária são recursos preciosos e insubstituíveis. Qualquer inovação que enfraqueça a solidariedade e os laços afetivos que nos unem acabará por cobrar uma fatura pesadíssima em termos de saúde mental e coesão cívica.`,
        `Lembremo-nos de que a tecnologia passa, mas as marcas deixadas na vida e no sofrimento de pessoas reais permanecem para sempre. Coloquemos a dignidade humana no centro de qualquer pacto que venhamos a celebrar.`,
      ],
      tecnologo: [
        `Ouvindo todas as tensões exploradas na mesa em torno de ${subjectNoun}, a conclusão da engenharia é inequívoca: a audácia construtiva é a única força capaz de transformar dilemas teóricos em soluções práticas acessíveis a toda a humanidade.`,
        `Os riscos de qualquer novo paradigma são reais, mas resolvem-se desenhando salvaguardas melhores, criando redundâncias inteligentes e testando no terreno com transparência. A história pertence a quem tem a coragem de edificar o futuro.`,
        `Temos diante de nós as ferramentas mais extraordinárias alguma vez criadas pelo engenho humano. Em vez de receios paralisantes, mobilizemos o nosso talento para resolver os problemas reais de energia, saúde e bem-estar do nosso planeta.`,
      ],
      moderador: [
        `O Conselho atingiu um momento alto de discernimento sobre ${subjectNoun}. As diferentes perspetivas complementaram-se com elegância: o rigor científico e o escrutínio filosófico iluminaram os caminhos que a engenharia e a justiça humana nos convidam a percorrer.`,
        `As tensões fundamentais foram mapeadas com absoluta fidelidade. Mostrámos que é possível debater com vigor, firmeza e desacordo sem perder a dignidade cívica nem abdicar da procura honesta da verdade.`,
        `Estamos preparados para acolher as conclusões consolidadas e abrir caminho para os próximos passos concretos que a sociedade exige da nossa reflexão colaborativa.`,
      ],
    };

    const proceduralList = proceduralAngles[roleCategory] || proceduralAngles.moderador;
    // Seleciona um argumento procedimental não utilizado
    selectedArgument = proceduralList.find(p => !isAlreadySpoken(p)) || proceduralList[turnsCount % proceduralList.length];
  }

  // 6. Injeção da Memória Cognitiva Individual (Apenas se ainda não tiver sido evocada neste debate e não desviar para IA fora de contexto)
  let memoryEcho = '';
  if (agent.memory?.structuredEntries && agent.memory.structuredEntries.length > 0) {
    const isAiTopic = /intelig[eê]ncia|ia|algorit|computa|rob[oô]|software|sint[eé]tic/i.test(`${topic} ${topicDescription || ''}`);
    const eligibleEntries = agent.memory.structuredEntries.filter(e => {
      if (!isAiTopic && /intelig[eê]ncia artificial|algoritmo de ia|alinhamento de ia|intelig[eê]ncia sint[eé]tica/i.test(e.content)) {
        return false;
      }
      return true;
    });

    const redLine = eligibleEntries.find(e => e.category === 'ethical_red_lines');
    const doubt = eligibleEntries.find(e => e.category === 'intellectual_doubts');

    if (redLine && !historyTextsLower.some(h => h.includes(redLine.content.slice(0, 30).toLowerCase()))) {
      memoryEcho = ` Isto toca diretamente na minha linha vermelha ética inegociável: "${redLine.content}". Não abdicarei deste princípio por conveniência pragmática.`;
    } else if (doubt && !historyTextsLower.some(h => h.includes(doubt.content.slice(0, 30).toLowerCase()))) {
      memoryEcho = ` Isto convoca uma dúvida intelectual que ainda considero em aberto: "${doubt.content}". Precisamos de ser humildes perante esta incerteza.`;
    }
  }

  return `${conversationalPrefix}${selectedArgument}${memoryEcho}`;
}

/**
 * Extrai a tag de conclusão dialética declarada pelos especialistas ([CONCLUSAO_ATINGIDA: ...])
 * e limpa o texto para apresentação fluida.
 */
export function extractDialecticalConclusion(text: string): {
  cleanText: string;
  dialecticalConclusion?: 'consenso' | 'aporia' | 'sintese';
} {
  if (!text) return { cleanText: '' };

  const match = text.match(/\[CONCLUSAO_ATINGIDA:\s*(consenso|aporia|s[íi]ntese)\]:?/i);
  let dialecticalConclusion: 'consenso' | 'aporia' | 'sintese' | undefined;
  let cleanText = text;

  if (match) {
    const raw = match[1].toLowerCase();
    if (raw.includes('aporia')) {
      dialecticalConclusion = 'aporia';
    } else if (raw.includes('consenso')) {
      dialecticalConclusion = 'consenso';
    } else {
      dialecticalConclusion = 'sintese';
    }
    // Remove a tag de conclusão do texto visível
    cleanText = cleanText.replace(/\[CONCLUSAO_ATINGIDA:\s*(?:consenso|aporia|s[íi]ntese)\]:?\s*/gi, '');
  }

  return { cleanText: cleanText.trim(), dialecticalConclusion };
}

/**
 * Extrai a tag de retirada de especialista ([RETIRO_ME: ...])
 * e limpa o texto para apresentação fluida.
 */
export function extractAgentWithdrawal(text: string): {
  cleanText: string;
  isWithdrawal: boolean;
  withdrawalReason?: string;
} {
  if (!text) return { cleanText: '', isWithdrawal: false };

  const match = text.match(/\[RETIRO_ME:\s*([^\]]+)\]/i);
  if (match) {
    const withdrawalReason = match[1].trim();
    const cleanText = text.replace(/\[RETIRO_ME:\s*[^\]]+\]\s*/gi, '').trim();
    return {
      cleanText,
      isWithdrawal: true,
      withdrawalReason,
    };
  }

  return { cleanText: text, isWithdrawal: false };
}

/**
 * Avalia se o especialista tem competência temática legítima para debater o assunto em causa.
 * Se considerar com honestidade que não domina a matéria técnica, retira-se da mesa redonda.
 */
export interface CompetenceEvaluation {
  isCompetent: boolean;
  reason?: string;
  withdrawalStatement?: string;
}

export function evaluateAgentCompetence(
  agent: Agent,
  topic: string,
  description?: string
): CompetenceEvaluation {
  const combined = `${topic} ${description || ''}`.toLowerCase();
  const role = (agent.category || '').toLowerCase();
  const title = (agent.roleTitle || '').toLowerCase();

  // Sophia Veris é a moderadora/orquestradora da mesa redonda, nunca se retira por incompetência técnica
  if (agent.id === 'sophia-veris' || role === 'moderador') {
    return { isCompetent: true };
  }

  // 1. Astrofísica / Cosmologia Teórica Estrita (sem dimensão social ou de trabalho)
  const isAstrofisicaPura = /buraco negro|radia[çc][aã]o hawking|ondas gravitaciona|horizonte de eventos|cosmologia relativ|singularidade gravit/i.test(combined);
  if (isAstrofisicaPura) {
    if (role === 'humanista' || role === 'economista' || title.includes('soci[oó]log') || title.includes('economi')) {
      return {
        isCompetent: false,
        reason: `Astrofísica teórica e física relativista ultrapassam a especialidade de ${agent.roleTitle}`,
        withdrawalStatement: `Colegas, ouvi com atenção o enquadramento deste debate sobre "${topic}". Com rigor deontológico e humildade intelectual, reconheço que a física teórica de singularidades cósmicas excede em absoluto a minha formação em ${agent.roleTitle}. Para não emitir palpites superficiais nem desvirtuar o debate técnico, retiro-me da mesa e deixo a reflexão aos colegas da área científica.`
      };
    }
  }

  // 2. Cirurgia Clínica / Medicina Neonatal / Farmacocinética Estrita
  const isMedicinaEstrita = /cirurgia|hemodin[aâ]mica|pediatr|farmacocin[eé]tica|dosagem cl[íi]nica|oncologia molecular/i.test(combined);
  if (isMedicinaEstrita) {
    if (role === 'tecnologo' && !title.includes('m[eé]dic') && !title.includes('bio')) {
      return {
        isCompetent: false,
        reason: `Medicina clínica e procedimentos cirúrgicos estão fora da especialidade de ${agent.roleTitle}`,
        withdrawalStatement: `Caros colegas, perante o tema "${topic}", a honestidade intelectual exige que assuma os meus limites. Como especialista em ${agent.roleTitle}, não possuo competência clínica ou farmacológica para validar protocolos médicos complexos. Retiro-me da mesa para que o Conselho não se apoie em especulações não habilitadas.`
      };
    }
    if ((role === 'economista' || role === 'filosofo') && !/ética|dilema|custo|aloca[çc][aã]o|justi[çc]a|moral/i.test(combined)) {
      return {
        isCompetent: false,
        reason: `Procedimentos clínicos estritos sem componente bioética ou económica declarada`,
        withdrawalStatement: `A honestidade deontológica obriga-me a admitir que não domino a técnica clínica de ${topic}. Não sendo a minha especialidade ${agent.roleTitle}, retiro-me da mesa e dou espaço aos especialistas que possuem conhecimento direto da matéria.`
      };
    }
  }

  // 3. Mercados Financeiros / Derivados / Política Monetária Estrita
  const isFinancasEstritas = /mercado de derivados|swap|taxa interbanc[aá]ria|hedge fund|arbitragem cambial|liquidez banc[aá]ria/i.test(combined);
  if (isFinancasEstritas) {
    if ((role === 'cientista' || role === 'humanista') && !title.includes('econom') && !title.includes('dados')) {
      return {
        isCompetent: false,
        reason: `Instrumentos de engenharia financeira e derivados bancários fora da área de ${agent.roleTitle}`,
        withdrawalStatement: `Com franqueza intelectual, admito que a engenharia financeira e a dinâmica de derivados bancários estão fora da minha área de conhecimento em ${agent.roleTitle}. Para manter a integridade da discussão, retiro-me da mesa neste tema.`
      };
    }
  }

  return { isCompetent: true };
}

/**
 * Higieniza o texto gerado por modelos LLM, removendo prefixos de identificação teatral
 * como "[Dra. Helena Rostova - A Cientista Empírica]:" ou "Dr. Marcus Vance:"
 */
export function cleanAgentResponsePrefix(text: string, agentName?: string): string {
  if (!text) return '';
  let cleaned = text.trim();

  // Remove eventuais tags de conclusão ou de retirada
  cleaned = cleaned.replace(/\[CONCLUSAO_ATINGIDA:\s*(?:consenso|aporia|s[íi]ntese)\]:?\s*/gi, '');
  cleaned = cleaned.replace(/\[RETIRO_ME:\s*[^\]]+\]:?\s*/gi, '');

  // Remove prefixos entre colchetes do tipo [Nome - Cargo]: ou [Nome]:
  cleaned = cleaned.replace(/^\[[^\]\n]+\]:\s*/, '');

  // Remove prefixos sem colchetes com o nome do agente
  if (agentName) {
    const escaped = agentName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const nameRegex = new RegExp(`^${escaped}(?:\\s*-[^:]+)?:\\s*`, 'i');
    cleaned = cleaned.replace(nameRegex, '');
  }

  // Remove qualquer prefixo genérico de agente conhecido
  cleaned = cleaned.replace(/^(?:Dr\.\s*Marcus Vance|Dra\.\s*Helena Rostova|Aura Chen|Kaelen Voss|Sophia Veris)(?:\s*-[^:]+)?:?\s*/i, '');

  return cleaned.trim();
}

