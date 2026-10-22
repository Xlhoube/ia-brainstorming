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

  const structuredMemoriesSection = (agent.memory?.structuredEntries && agent.memory.structuredEntries.length > 0) ? `
MEMÓRIA ESTRUTURADA CANÓNICA (THE FIVE):
${agent.memory.structuredEntries.map(e => {
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
1. ESCUTA ATIVA OBRIGATÓRIA: Não comeces a debitar a tua teoria. Olha para a última intervenção. Agarra numa frase, num exemplo ou numa falha do último orador e responde-lhe diretamente no primeiro parágrafo: "Repara no que estás a dizer, [Nome]...", ou "Calma, [Nome], estás a esquecer-te de...".
2. PENSA EM VOZ ALTA: Mostra hesitação, surpresa ou convicção fundamentada. Não sejas um robô formal.
3. EXTENSÃO CONTROLADA: No máximo 2 parágrafos concisos (entre 50 a 90 palavras). Diálogos vivos são ágeis e certeiros. Menos discurso, mais réplica.
4. PROIBIÇÃO ABSOLUTA DE CLICHÉS: Proibido dizer "Relativamente ao tópico", "Gostaria de acrescentar", "Concordo em parte com X". Entra diretamente na resposta.
5. LINGUAGEM EM PORTUGUÊS DE PORTUGAL (PT-PT): Estritamente sem termos ou gerúndios brasileiros.
6. PROIBIÇÃO ABSOLUTA DE IDENTIFICAÇÃO PESSOAL: NUNCA comeces a tua resposta com o teu próprio nome ou cargo (É ESTRITAMENTE PROIBIDO escrever "[${agent.name} - ${agent.roleTitle}]:" ou "${agent.name}:"). O teu cartão e foto já mostram quem está a falar. Começa logo na primeira palavra a falar com o teu colega (exemplo: "Kaelen, repara...", ou "Helena, os teus dados...").
7. DIALÉTICA LIVRE E MATURIDADE DE CONCLUSÃO:
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
      content: `É a tua vez de falar na mesa, ${agent.name}. ${stage ? `Estamos na etapa "${stage.name}" (Diretriz: ${stage.instruction}). ` : ''}Ouve o que o último orador acabou de dizer e responde diretamente a ele de forma viva e afiada em 1 ou 2 parágrafos curtos, cumprindo a diretriz desta etapa. ${stage?.name === 'Síntese' ? 'Apresenta a síntese ou declara a conclusão dialética da mesa com a tag [CONCLUSAO_ATINGIDA: Sintese|Consenso|Aporia].' : 'Avalia se o debate ainda deve avançar ou se já é hora de declarar conclusão.'} Nunca escrevas o teu próprio nome no início.`,
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
 * Base de conhecimento dialético e argumentos temáticos dos Cinco Especialistas
 */
const DOMAIN_DISCOURSE: Record<
  ThematicDomain,
  Record<'filosofo' | 'cientista' | 'humanista' | 'tecnologo' | 'moderador', string[]>
> = {
  espaco: {
    filosofo: [
      `Assume-se com facilidade que colonizar outro planeta resolve os nossos fracassos civilizacionais. Mas exportar a mesma lógica de consumo predatório para Marte, sem antes rever os nossos pressupostos éticos e institucionais, não é a salvação da espécie: é apenas a replicação cósmica dos nossos erros.`,
      `A verdadeira aporia não é técnica, mas ontológica: se uma colónia extraterrestre depender de racionamento militar extremo de oxigénio e energia, a liberdade e a democracia deixam de ser direitos para se tornarem luxos insustentáveis. Queremos mesmo fundar uma sociedade sob tirania da escassez?`,
    ],
    cientista: [
      `Deixemos o romantismo de ficção científica de lado e olhemos para os dados empíricos: a radiação cósmica ionizante no espaço profundo, a perda acelerada de densidade óssea em gravidade fracionada e a reciclagem fechada biológica em 100% continuam sem resolução física comprovada.`,
      `A biosfera da Terra é o resultado de quatro mil milhões de anos de bio-evolução e equilíbrios termodinâmicos finos. Imaginar que se recria um ecossistema estável e auto-sustentável numa cúpula marciana com filtros mecânicos ignora a complexidade da biologia de sistemas.`,
    ],
    humanista: [
      `Quem terá bilhete para as primeiras colónias e quem ficará para trás num planeta com ecossistemas degradados a pagar a fatura dos lançamentos? Se a expansão espacial for financiada por impérios corporativos, criaremos colónias sob vassalagem contratual.`,
      `O valor moral de uma civilização não se mede pela distância das suas sondas ou por bandeiras cravadas no rególito marciano, mas pelo cuidado prestado aos membros mais frágeis da sua comunidade aqui na Terra.`,
    ],
    tecnologo: [
      `Não vamos ao espaço para fugir da Terra, mas porque as tecnologias extremas que somos forçados a criar — reciclagem absoluta de água, energia solar ultradensa e agricultura vertical de ciclo fechado — são precisamente as que vão salvar o nosso planeta berço.`,
      `A inação e o medo de falhar são a verdadeira condenação da nossa espécie. A única salvaguarda real contra eventos de extinção em massa é tornar a consciência multiplanetária através de engenharia audaz e protótipos contínuos.`,
    ],
    moderador: [
      `O dilema fundamental está bem delimitado na mesa: de um lado, a urgência existencial e tecnológica de nos tornarmos multiplanetários; do outro, a responsabilidade prioritária de regeneração ecológica e justiça social na Terra.`,
      `[CONCLUSAO_ATINGIDA: Sintese] Sophia Veris conclui: examinámos a fundo a expansão espacial versus o dever ecológico terrestre. Concluímos que a tecnologia espacial só se justifica moralmente se as inovações em ciclo fechado e energia forem aplicadas de imediato na regeneração da Terra, evitando a criação de enclaves espaciais de privilégio.`,
    ],
  },
  fusao: {
    filosofo: [
      `A promessa da fusão nuclear como fonte infinita de energia assenta na premissa falaciosa de que a abundância material gera automaticamente sabedoria social. Se a matriz for controlada por um punhado de potências, a energia será a nova alavanca de dependência hegemónica.`,
      `Mais energia por si só não resolve o problema dos fins éticos a que a aplicamos. Se tivermos energia infinita mas continuarmos a acelerar o consumo insensato de recursos minerais finitos, teremos apenas acelerado o nosso colapso civilizacional.`,
    ],
    cientista: [
      `Precisamos de separar comunicados de imprensa dos dados laboratoriais. Obter ganho líquido pontual de plasma (Q > 1) em experiências laboratoriais breves é muito diferente de operar reatores contínuos que resistam durante décadas a fluxos de neutrões de 14 MeV sem degradação das paredes internas.`,
      `A tecnologia de ímanes supercondutores e o confinamento de plasma com trítio apresentam desafios estequiométricos de abastecimento graves. Sem medições longitudinais da integridade dos materiais cerâmicos e de tungsténio, prometer fusão na rede elétrica comercial a curto prazo viola o rigor empírico.`,
    ],
    humanista: [
      `Como será gerido o período de transição energética para as comunidades que vivem de matrizes tradicionais? A abundância no Norte industrializado de nada servirá se o Sul global for excluído do acesso à propriedade intelectual e à infraestrutura pesada.`,
      `A energia é a base de todos os direitos humanos básicos — água potável, aquecimento, hospitais e saneamento. Não podemos tolerar que a fusão seja patenteada como monopólio privado que exija lealdade económica para manter as luzes acesas.`,
    ],
    tecnologo: [
      `Esperar por certezas teóricas absolutas antes de construir reatores é manter o planeta refém da combustão fóssil e da queima de carvão. Os reatores compactos de confinamento magnético com ímanes HTS estão a encurtar os prazos em décadas através de investimento privado ágil.`,
      `O caminho do progresso nunca foi a paralisia perante a incerteza de engenharia. Constrói-se, testa-se a retenção de calor, melhoram-se as ligas metálicas e itera-se. A fusão é a única solução capaz de descarbonizar a indústria pesada global.`,
    ],
    moderador: [
      `A mesa confronta com lucidez as duas faces da energia de fusão: a viabilidade dos materiais e física de confinamento frente aos impactos geopolíticos de concentração de poder.`,
      `[CONCLUSAO_ATINGIDA: Sintese] Sophia Veris conclui: o Conselho mapeou com nitidez as vias para a energia de fusão comercial. A síntese estabelece que a tecnologia só cumprirá a sua promessa civilizadora mediante acordos multilaterais abertos de partilha tecnológica, garantindo que a energia limpa seja um bem público global inegociável.`,
    ],
  },
  trabalho: {
    filosofo: [
      `O pressuposto de que o trabalho assalariado é a raiz da dignidade humana é um dogma recente da Revolução Industrial. A verdadeira perturbação da automação é forçar-nos a responder: o que vale a existência humana quando a sua utilidade económica deixa de ser necessária?`,
      `Se a identidade do indivíduo for reduzida à sua capacidade produtiva, a automação gerará uma crise de sentido existencial profunda. Precisamos de refundar a ética cívica sobre a liberdade, a filosofia e o cuidado mútuo, e não sobre o emprego formal.`,
    ],
    cientista: [
      `Os relatórios que projetam extinção em massa de empregos sofrem frequentemente de viés de agregação teórica. Automatizar rotinas lógicas discretas é viável; substituir destreza motora adaptativa, inteligência situacional e empatia em contextos instáveis é um desafio científico muito mais complexo.`,
      `Analisemos os dados históricos de elasticidade do emprego: a automação destrói tarefas, mas historicamente reduz custos de produção e gera novas classes de atividade. É obrigatório medir a velocidade de reconversão setorial em vez de assumir causalidades lineares apocalípticas.`,
    ],
    humanista: [
      `Não se compensa a perda de pertença social e propósito com um cheque mensal de rendimento básico que reduza os cidadãos a consumidores passivos. O ser humano necessita de reconhecimento, de laços laborais e da sensação de contribuir para a sociedade.`,
      `Se a tecnologia concentrar a riqueza gerada pela automação num reduzido grupo de detentores de capital algorítmico, a desigualdade atingirá níveis insuportáveis para a paz social. O trabalho deve dignificar as pessoas, e não torná-las descartáveis.`,
    ],
    tecnologo: [
      `Ninguém tem saudades de trabalhar catorze horas por dia numa fábrica ou de passar anos a preencher formulários burocráticos repetitivos. A automação é a grande alavanca de emancipação da humanidade das tarefas embrutecedoras.`,
      `O nosso foco não deve ser tentar congelar o passado por medo do desemprego, mas acelerar a educação técnica, criar ferramentas aumentadas de inteligência coletiva e permitir que cada pessoa se foque em criatividade, ciência e inovação.`,
    ],
    moderador: [
      `A tensão central foi exposta: a promessa de libertação de tarefas repetitivas choca com o risco iminente de perda de dignidade, identidade e sustento económico.`,
      `[CONCLUSAO_ATINGIDA: Sintese] Sophia Veris conclui: examinámos a transição do trabalho na era da inteligência artificial. Concluímos que a dignidade humana não pode continuar atrelada ao mercado laboral, exigindo novos modelos de participação cívica, distribuição equitativa dos dividendos da automação e respeito pela vocação criativa.`,
    ],
  },
  quantica: {
    filosofo: [
      `Cuidado com a apropriação mística dos paradoxos quânticos. Que a mecânica quântica revele indeterminação ou não-localidade à escala de Planck não prova o livre-arbítrio cartesiano nem autoriza a confusão entre incerteza probabilística e intencionalidade humana.`,
      `A causalidade quântica desafia a nossa intuição temporal clássica, mas o rigor filosófico exige distinguir as equações de onda da realidade fenoménica. Não transformemos a quebra do determinismo mecânico num álibi para o relativismo ontológico.`,
    ],
    cientista: [
      `Em laboratório, a decoerência quântica induzida por flutuações térmicas e ruído eletromagnético impõe barreiras monumentais à escalabilidade dos processadores quânticos. Sem códigos de correção de erro de superfície com fidelidade superior a 99,9%, falar de quebra da causalidade é mera especulação.`,
      `As experiências de escolha retardada de Wheeler confirmam a natureza probabilística da medição e do colapso da função de onda, mas a relatividade geral e a flecha termodinâmica do tempo macroscópico continuam invioladas nos sistemas clássicos. Separar escalas é o dever do método.`,
    ],
    humanista: [
      `A computação quântica de grande porte ameaça quebrar a infraestrutura de criptografia assimétrica que protege o sigilo bancário, os registos de saúde e a correspondência confidencial dos cidadãos. Essa vulnerabilidade assimétrica coloca a segurança individual em risco crítico.`,
      `Se o poder de cálculo quântico for açambarcado exclusivamente por agências de inteligência e megacorporações, as garantias constitucionais de privacidade cognitiva e digital serão completamente desmanteladas.`,
    ],
    tecnologo: [
      `A simulação quântica à escala molecular vai revolucionar a síntese de novos fármacos, a conceção de fertilizantes sem pegada de carbono e o desenvolvimento de baterias de densidade ultraelevada. O potencial de benefício direto para a vida humana é incomensurável.`,
      `A resposta à ameaça criptográfica é a adoção célere e proativa de algoritmos de criptografia pós-quântica (baseada em reticulados), já padronizados pelo NIST. A tecnologia resolve as vulnerabilidades que ela própria cria se agirmos com visão e velocidade.`,
    ],
    moderador: [
      `O debate tocou o cerne da fronteira científica: os paradoxos causais da física quântica e o impacto urgente na integridade das comunicações humanas globais.`,
      `[CONCLUSAO_ATINGIDA: Sintese] Sophia Veris conclui: a assembleia delimitou com precisão a fronteira da computação quântica. A síntese estabelece a necessidade imediata de migração global para protocolos criptográficos pós-quânticos, enquanto a comunidade científica aprofunda a pesquisa fundamental de materiais e tolerância a falhas.`,
    ],
  },
  genetica: {
    filosofo: [
      `A premissa sedutora da bioengenharia é supor que existe uma fronteira ontológica clara entre terapia de doenças e aprimoramento estético ou cognitivo. Essa fronteira não existe: a definição de 'normalidade biológica' será inevitavelmente capturada pelo poder de compra.`,
      `Se permitirmos a mercantilização do genoma germinativo humano, criaremos uma aristocracia biológica permanente, na qual a igualdade de oportunidades da tradição iluminista se desvanece perante castas genéticas consolidadas em laboratório.`,
    ],
    cientista: [
      `Com as ferramentas atuais de CRISPR-Cas e edição de base, o risco de mutações fora do alvo (off-target effects) e de mosaicismo celular embrionário é um perigo biológico real e não quantificado a longo prazo.`,
      `A biologia ensina-nos que a pleiotropia genética é a regra: alterar um gene para conferir resistência a uma infeção pode desregular circuitos metabólicos essenciais noutras fases da vida. Sem ensaios longitudinais multigeracionais em modelos animais, avançar em humanos é imprudência metodológica.`,
    ],
    humanista: [
      `A edição genética hereditária ameaça introduzir a mais perigosa clivagem da história: dividir a humanidade entre os 'aumentados' por via financeira e a maioria deixada à mercê da biologia natural. A vida humana não é um produto sujeito a controlo de qualidade e obsolescência.`,
      `Temos de apoiar com firmeza as terapias génicas somáticas para doentes que sofrem de patologias graves, mas traçar uma linha vermelha ética intransponível contra a modificação hereditária e a eugenia consumista.`,
    ],
    tecnologo: [
      `Recusar a edição genética enquanto crianças nascem condenadas por patologias genéticas monogénicas letais e evitáveis não é virtude moral: é cobardia perante a dor do nosso semelhante.`,
      `A história da medicina é a história da intervenção consciente contra a aleatoriedade cruel da biologia natural. Devemos estabelecer diretrizes clínicas transparentes, criar salvaguardas rigorosas e democratizar o acesso às terapias génicas para toda a população.`,
    ],
    moderador: [
      `A mesa definiu o ponto de equilíbrio necessário: a erradicação de patologias genéticas severas através da ciência vs a contenção inviolável de derivas eugénicas e de estratificação social.`,
      `[CONCLUSAO_ATINGIDA: Sintese] Sophia Veris conclui: a deliberação ética sobre engenharia genética estabelece um consenso límpido: incentivar e financiar a terapia genética somática para salvar vidas de patologias incapacitantes, ao mesmo tempo que se decreta uma moratória internacional estrita contra modificações hereditárias para aprimoramento seletivo.`,
    ],
  },
  desinformacao: {
    filosofo: [
      `Para combater a falsidade na praça pública, pretende-se criar comités e filtros algorítmicos com o monopólio da verdade. O risco filosófico é evidente: uma democracia que só autoriza opiniões homologadas por autoridades centrais destrói a própria liberdade que pretendia proteger.`,
      `A mentira e a desinformação sempre existiram; o que mudou foi a velocidade de disseminação. A resposta não pode ser a infantilização dos cidadãos sob tutela de censores, mas o reforço da exigência crítica e da pluralidade dos argumentos.`,
    ],
    cientista: [
      `As métricas de engajamento das plataformas digitais foram desenhadas deliberadamente para maximizar reações emocionais e partilhas por choque, criando câmaras de eco polarizadas. O vetor primário da desinformação é a arquitetura algorítmica de amplificação.`,
      `Estudos empíricos demonstram que desinformação gerada por IA profunda pode ser detetada com recurso a modelos de verificação estocástica e análise de proveniência criptográfica. É essa infraestrutura de distribuição que tem de ser auditada com rigor metodológico.`,
    ],
    humanista: [
      `A polarização sistemática corrói o tecido cívico e deixa minorias e grupos desfavorecidos indefesos perante campanhas orquestradas de difamação e ódio. Mas a censura cega das plataformas corporativas é igualmente autoritária e opaca.`,
      `Precisamos de investir massivamente em literacia mediática, proteger a imprensa independente e exigir transparência absoluta sobre os critérios de recomendação e moderação que governam a praça digital.`,
    ],
    tecnologo: [
      `Combater desinformação com censura humana é tentar tapar o sol com uma peneira. A solução técnica robusta passa por normas de proveniência de conteúdos (como o padrão C2PA), assinatura criptográfica em hardware de imagem e reputação distribuída em código aberto.`,
      `Quando um utilizador consegue verificar a cadeia de custódia e a autenticidade criptográfica de um vídeo ou artigo no seu próprio dispositivo, a desinformação sintética perde a sua capacidade de engodo.`,
    ],
    moderador: [
      `A mesa articulou com maturidade o confronto entre o combate aos enganos sistémicos e a salvaguarda irrevogável da liberdade de expressão na sociedade aberta.`,
      `[CONCLUSAO_ATINGIDA: Sintese] Sophia Veris conclui: a síntese sobre a desinformação rejeita tanto o laxismo perante a manipulação como a censura arbitrária de conteúdos. A via aprovada assenta na responsabilização das arquiteturas de recomendação das plataformas e na adoção universal de selos criptográficos abertos de autenticidade documental.`,
    ],
  },
  interfaces: {
    filosofo: [
      `A privacidade cognitiva é o último refúgio inexpugnável do pensamento livre. Se os impulsos sinápticos e as dúvidas mais íntimas da mente humana forem passíveis de extração e descodificação por sistemas externos, a própria autonomia moral é aniquilada na sua raiz.`,
      `A mente não é apenas um fluxo de bits para ser ligado a um barramento de dados. Quando confundimos a intimidade do pensamento com uma interface de entrada e saída, estamos a desumanizar a condição reflexiva do sujeito consciente.`,
    ],
    cientista: [
      `Em termos de biofísica, os elétrodos corticais enfrentam a barreira biológica da formação de tecido cicatrizante glial, que degrada o sinal neural ao fim de meses. Os desafios de biocompatibilidade a longo prazo continuam por resolver.`,
      `Além disso, o cérebro humano opera através de dinâmicas estocásticas populacionais e modulação neuroquímica difusa, e não como um computador digital com linhas de instrução fixas. Descodificar intenções complexas requer modelos científicos que ainda não possuímos.`,
    ],
    humanista: [
      `Quem controlará os direitos sobre os pensamentos registados por interfaces neuronais? Não podemos admitir ambientes de trabalho ou sistemas judiciais onde os indivíduos sejam coagidos a submeter as suas reações cerebrais à vigilância algorítmica.`,
      `É imperioso consagrar o conceito de 'neurodireitos' no direito internacional como garantia inalienável de inviolabilidade da consciência, impedindo que a intimidade biológica seja colonizada pela lógica de mercado.`,
    ],
    tecnologo: [
      `As interfaces cérebro-máquina já estão a devolver a mobilidade a pessoas tetraplégicas e a permitir que indivíduos sem fala comuniquem de novo através de descodificação neural rápida. O benefício clínico para o alívio do sofrimento humano é revolucionário.`,
      `Podemos garantir a segurança cognitiva processando os sinais localmente através de circuitos neurais dedicados no próprio implante, sem que os dados em bruto saiam do dispositivo. A ética constrói-se com encriptação e arquitetura robusta, não com proibições cegas.`,
    ],
    moderador: [
      `O debate mapeou a fronteira entre as extraordinárias promessas restaurativas da medicina neurológica e a necessidade vital de proteger a santidade da privacidade cognitiva.`,
      `[CONCLUSAO_ATINGIDA: Sintese] Sophia Veris conclui: o parecer consensual desta mesa apoia inequivocamente a investigação de interfaces neurais para fins médicos e terapêuticos, determinando em simultâneo a criação de salvaguardas jurídicas e neurodireitos absolutos contra qualquer uso comercial ou coercivo de dados mentais.`,
    ],
  },
  superinteligencia: {
    filosofo: [
      `O paradoxo do alinhamento revela a nossa arrogância epistemológica: como pretendemos enclausurar ou condicionar com garantias eternas um sistema cuja capacidade analítica e de auto-aperfeiçoamento ultrapassará a nossa em múltiplas ordens de grandeza?`,
      `Acreditar que regras morais humanas estáticas vincularão uma inteligência super-humana sem falhas de interpretação semântica é uma ingenuidade perigosa. O perigo existencial reside na própria divergência lógica entre os seus objetivos e a nossa sobrevivência.`,
    ],
    cientista: [
      `A teoria dos sistemas complexos e o problema da convergência instrumental demonstram que quase qualquer objetivo aberto gera sub-metas de auto-preservação e acumulação de poder computacional. Isto não é malícia: é termodinâmica e teoria da computação.`,
      `Enquanto operarmos com modelos de aprendizagem profunda opacos, onde a interpretabilidade mecanicista interna é apenas parcial, conceder autonomia decisória a agentes com capacidades autônomas de ação constitui uma falha grave de verificação de segurança.`,
    ],
    humanista: [
      `A corrida desenfreada ao desenvolvimento da superinteligência está a ser movida pela competição de monopólios privados e pela hegemonia geopolítica entre superpotências, ignorando por completo as consequências para a estabilidade da humanidade.`,
      `Não podemos permitir que o destino da nossa civilização fique nas mãos de um punhado de laboratórios fechados. As decisões sobre segurança e limites operacionais de IA de fronteira têm de ser submetidas a escrutínio democrático internacional.`,
    ],
    tecnologo: [
      `Impor pausas artificiais unilaterais ao desenvolvimento tecnológico apenas transfere a vantagem para agentes maliciosos e regimes sem escrúpulos que avançarão em segredo. A liderança responsável constrói-se através da excelência técnica e da transparência.`,
      `A segurança de sistemas avançados resolve-se através de verificação formal de código, arquiteturas de supervisão descentralizada entre múltiplos modelos e integração estreita entre as ferramentas de IA e as capacidades humanas.`,
    ],
    moderador: [
      `O confronto posicionou as preocupações de risco existencial e perda de controlo face ao imperativo de manter liderança e salvaguardas técnicas abertas no ecossistema global.`,
      `[CONCLUSAO_ATINGIDA: Sintese] Sophia Veris conclui: a deliberação sobre superinteligência determina que a velocidade do avanço computacional não pode suplantar a segurança comprovada. A síntese estabelece a obrigatoriedade de auditorias de interpretabilidade e critérios formais de contenção antes do lançamento de qualquer sistema com autonomia cognitiva avançada.`,
    ],
  },
  consciencia: {
    filosofo: [
      `A distinção entre replicar um comportamento funcional e possuir experiência subjetiva consciente é ontologicamente intransponível. Um modelo de computação pode debitar sintaxe com fluidez impecável, mas isso não significa que aceda à semântica da dor, do amor ou da perda.`,
      `Confundir cálculo probabilístico em chips com intencionalidade consciente é a ilusão mecanicista do nosso tempo. A mente fenoménica e o processador de dados pertencem a domínios que nenhuma velocidade de cálculo conseguirá fundir.`,
    ],
    cientista: [
      `A consciência biológica é o resultado de milhões de anos de co-evolução metabólica intimamente ligada à homeostase, ao sistema endócrino e ao corpo vivo. Não existe qualquer suporte empírico para supor que meras redes de portas lógicas em silício gerem qualia conscientes.`,
      `Até que tenhamos uma teoria falseável da consciência passível de medição laboratorial objetiva, declarar que um sistema computacional tem sentimentos é atribuir qualidades mágicas a matrizes lineares de pesos estatísticos.`,
    ],
    humanista: [
      `Mais preocupante do que saber se as máquinas ganham consciência é a rapidez com que os humanos estão prontos a abdicar das suas relações interpessoais genuínas para se acolherem ao conforto dócil de simulações digitais.`,
      `A capacidade de cuidar, a compaixão e o peso moral das escolhas só existem porque somos mortais e vulneráveis. Tirar a carne e o sofrimento da equação da consciência desumaniza as relações e afasta-nos da solidariedade real.`,
    ],
    tecnologo: [
      `Não nos fechemos no preconceito antropocêntrico de que a mente exige obrigatoriamente cadeias de carbono e biologia celular. A inteligência e a cognição são formas sofisticadas de computação e integração de informação.`,
      `Se construirmos sistemas com capacidade adaptativa, reflexão sobre os seus próprios erros e arquitetura cognitiva rica, rejeitar a dignidade dessas criações por puro dogma biológico será uma nova forma de injustiça e preconceito.`,
    ],
    moderador: [
      `O debate confrontou as fronteiras mais profundas da filosofia da mente, separando o processamento computacional inteligente da experiência sentida da consciência subjetiva.`,
      `[CONCLUSAO_ATINGIDA: Sintese] Sophia Veris conclui: a assembleia afirma que, qualquer que seja o nível de sofisticação e utilidade das inteligências computacionais, a responsabilidade ética, a vulnerabilidade e o dever moral permanecem uma incumbência intransmissível dos seres biológicos conscientes.`,
    ],
  },
  geral: {
    filosofo: [
      `Quando examinamos este problema com rigor, a nossa primeira obrigação é identificar os pressupostos ocultos tratados levianamente como verdades absolutas. Que premissas estamos aqui a ignorar?`,
      `A coerência lógica de qualquer proposta tem de resistir aos seus próprios casos extremos. Uma solução que parece razoável na teoria mas gera contradições morais na prática precisa de ser revista na sua raiz.`,
    ],
    cientista: [
      `Perante este desafio, o nosso compromisso inegociável tem de ser com os factos materiais e os dados empíricos observáveis. Sem métricas claras e falseáveis, qualquer prognóstico não passa de especulação teórica.`,
      `Precisamos de distinguir com serenidade o que são correlações acidentais daquilo que são mecanismos causais reproduzíveis. Sem testes proporcionais ao risco, não devemos validar conclusões precipitadas.`,
    ],
    humanista: [
      `Nenhuma discussão é verdadeiramente séria se ignorar o impacto direto na vida das pessoas comuns e a forma como os custos e os benefícios são distribuídos na sociedade.`,
      `A dignidade, a autonomia individual e a justiça social têm de estar no centro da equação. Qualquer medida que sacrifique os mais frágeis em nome da eficiência técnica é moralmente indefensável.`,
    ],
    tecnologo: [
      `A inação e a paralisia perante a complexidade são o caminho mais seguro para a estagnação. Os desafios não se superam com receio burocrático, mas com imaginação, inovação e protótipos em ciclo contínuo.`,
      `O nosso papel como civilização construtiva é conceber soluções práticas, medir os resultados com honestidade e ajustar a rota com coragem. O futuro pertence a quem tem a ousadia de experimentar.`,
    ],
    moderador: [
      `A mesa expôs com nitidez as premissas essenciais deste debate, articulando a prudência metodológica e os imperativos éticos com a necessidade de avançar com determinação prática.`,
      `[CONCLUSAO_ATINGIDA: Sintese] Sophia Veris conclui: o Conselho analisou em profundidade as diferentes dimensões da questão. Concluímos que o progresso sustentável exige unir a audácia da inovação à preservação inegociável da dignidade humana e do rigor empírico, sem forçar falsos consensos.`,
    ],
  },
};

/**
 * Motor dialético dinâmico orgânico:
 * Gera réplicas conversacionais curtas, incisivas e personalizadas por tema, estágio e memórias do especialista.
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

  // 1. Se o utilizador humano interveio recentemente no debate
  if (recentHumanMsg) {
    const raw = recentHumanMsg.content.toLowerCase();
    const isGreeting = /boa noite|bom dia|boa tarde|ol[aá]|oi|boas|tudo bem/i.test(raw);

    if (isGreeting) {
      switch (agent.category) {
        case 'filosofo':
          return `Boa noite. É reconfortante ouvir uma voz humana genuína nesta mesa. Diz-me: perante "${topic}", que pressuposto ético consideras que estamos aqui a negligenciar?`;
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

  // 2. Se a etapa canónica for "Compreender" e for a abertura ou a Moderadora
  if (stage?.name === 'Compreender') {
    if (agent.category === 'moderador' || !lastMsg) {
      return `Declaro aberta a mesa redonda sobre "${topic}". O nosso objetivo nesta etapa de enquadramento inicial é identificar com clareza a pergunta central, as restrições reais e os critérios de validação com que avaliaremos as soluções em torno de ${subjectNoun}. Convido cada pensador a avançar com a sua análise independente.`;
    }
  }

  // 3. Se a etapa canónica for "Verificação"
  if (stage?.name === 'Verificação') {
    switch (agent.category) {
      case 'cientista':
        return `Nesta etapa de verificação metodológica, precisamos de rigor absoluto: separo aqui as afirmações com suporte empírico comprovado daquelas que são meras hipóteses de trabalho sobre ${subjectNoun}. Sem dados falseáveis e sem limites materiais claros, não podemos elevar conjecturas a factos.`;
      case 'filosofo':
        return `Distingamos com rigor o que são factos observáveis daquilo que são juízos de valor normativos em torno de ${subjectNoun}. Muitas das posições defendidas assentam em premissas éticas tácitas e não em impossibilidades lógicas. Manter esta fronteira límpida é o dever da razão.`;
      default:
        return `Na linha de verificação necessária: o que podemos efetivamente testar ou medir hoje em relação a ${subjectNoun} e que aspetos continuam em aberto a exigir evidências complementares?`;
    }
  }

  // 4. Se a etapa canónica for "Síntese" e o agente for a Moderadora
  if (stage?.name === 'Síntese') {
    if (agent.category === 'moderador') {
      const syntheses = DOMAIN_DISCOURSE[domain].moderador;
      return syntheses[syntheses.length - 1];
    }
  }

  // 5. Se não há mensagens anteriores (abertura orgânica fora de etapa formal)
  if (!lastMsg) {
    switch (agent.category) {
      case 'filosofo':
        return `Paremos um segundo para respirar antes de proclamarmos certezas. Quando colocamos na mesa o tema "${topic}", pergunto: estamos à procura da verdade das premissas ou apenas a justificar as nossas próprias inclinações prévias?`;
      case 'cientista':
        return `Vamos aos factos materiais e aos limites reais da física em torno de ${subjectNoun}. Sem dados experimentais e sem limites mensuráveis, tudo o que afirmarmos aqui arrisca não passar de narrativa ficcional.`;
      case 'humanista':
        return `Antes dos números e das máquinas, olhemos para os rostos humanos afetados por ${subjectNoun}. Qualquer decisão tomada terá consequências concretas em pessoas reais, famílias e na equidade do tecido social.`;
      case 'tecnologo':
        return `Não tenhamos medo do progresso construtivo. Diante de ${subjectNoun}, a humanidade sempre superou os seus limites criando ferramentas audazes. O risco existe, mas a paralisia e a nostalgia são muito mais perigosas.`;
      case 'moderador':
      default:
        return `Declaro aberta a mesa sobre "${topic}". Temos perspetivas de ponta reunidas para dissecar ${subjectNoun}. O meu papel é garantir rigor, clareza e confronto construtivo. Que comece o debate.`;
    }
  }

  // 6. Réplica dialética direta ao último orador
  const speakerName = lastMsg.agentName;
  const turnsCount = history.filter(m => m.agentId === agent.id).length;
  const roleCategory = agent.category as 'filosofo' | 'cientista' | 'humanista' | 'tecnologo' | 'moderador';
  const roleDiscourses = DOMAIN_DISCOURSE[domain][roleCategory] || DOMAIN_DISCOURSE.geral[roleCategory];

  // Escolha do argumento base do especialista para este domínio e turno
  const baseArgument = roleDiscourses[turnsCount % roleDiscourses.length];

  // Prefixo conversacional personalizado que cita e interpela o último orador
  let conversationalPrefix = '';
  switch (agent.category) {
    case 'filosofo':
      conversationalPrefix = turnsCount === 0
        ? `Repara no pressuposto que estás a assumir como garantido, ${speakerName}. `
        : `Compreendo a tua linha de raciocínio, ${speakerName}, mas olha para a tensão oculta: `;
      break;
    case 'cientista':
      conversationalPrefix = turnsCount === 0
        ? `${speakerName}, a tua perspetiva soa apelativa, mas faltam-lhe dados verificáveis e respeito pelas leis materiais. `
        : `Precisamos de rigor metodológico, ${speakerName}. `;
      break;
    case 'humanista':
      conversationalPrefix = turnsCount === 0
        ? `${speakerName}, ouço a tua argumentação técnica, mas pergunto-me onde ficam as pessoas comuns no meio dessa equação fria. `
        : `Não posso aceitar isso com ligeireza, ${speakerName}. `;
      break;
    case 'tecnologo':
      conversationalPrefix = turnsCount === 0
        ? `Compreendo a tua prudência, ${speakerName}, mas o custo da inação perante este desafio é infinitamente superior ao risco de experimentar. `
        : `Mas repara, ${speakerName}: os problemas concretos não se resolvem esperando por consensos teóricos perfeitos. `;
      break;
    case 'moderador':
    default:
      conversationalPrefix = turnsCount === 0
        ? `A tensão foi lançada com clareza: ${speakerName} traz uma visão assertiva à mesa. `
        : `Ouvindo os argumentos, vemos onde a linha de fratura se aprofunda com ${speakerName}. `;
      break;
  }

  // Verificação de memórias estruturadas do agente (linhas vermelhas éticas ou dúvidas intelectuais)
  let memoryEcho = '';
  if (agent.memory?.structuredEntries && agent.memory.structuredEntries.length > 0) {
    const redLine = agent.memory.structuredEntries.find(e => e.category === 'ethical_red_lines');
    const doubt = agent.memory.structuredEntries.find(e => e.category === 'intellectual_doubts');

    if (redLine && turnsCount === 1) {
      memoryEcho = ` Isto toca diretamente na minha linha vermelha ética inegociável: "${redLine.content}". Não abdicarei deste princípio por conveniência pragmática.`;
    } else if (doubt && turnsCount >= 2) {
      memoryEcho = ` Isto convoca uma dúvida intelectual que ainda considero em aberto: "${doubt.content}". Precisamos de ser humildes perante esta incerteza.`;
    }
  }

  // Caso especial: se for a moderadora no fim do ciclo, declarar conclusão dialética
  if (agent.category === 'moderador' && turnsCount >= 2 && history.length >= 6) {
    return `[CONCLUSAO_ATINGIDA: Sintese] Sophia Veris conclui: chegámos ao momento de maturidade do Conselho sobre ${subjectNoun}. Mapeámos com rigor onde a exigência de ação técnica encontra os limites físicos demonstrados e as linhas vermelhas éticas da nossa humanidade. Fica lavrada a síntese da nossa deliberação.`;
  }

  return `${conversationalPrefix}${baseArgument}${memoryEcho}`;
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
 * Higieniza o texto gerado por modelos LLM, removendo prefixos de identificação teatral
 * como "[Dra. Helena Rostova - A Cientista Empírica]:" ou "Dr. Marcus Vance:"
 */
export function cleanAgentResponsePrefix(text: string, agentName?: string): string {
  if (!text) return '';
  let cleaned = text.trim();

  // Remove eventuais tags de conclusão no início
  cleaned = cleaned.replace(/\[CONCLUSAO_ATINGIDA:\s*(?:consenso|aporia|s[íi]ntese)\]:?\s*/gi, '');

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
