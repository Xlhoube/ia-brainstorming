import { Agent, DebateMessage, LanguageTone } from '@/types/debate';

interface GenerateTurnParams {
  agent: Agent;
  topic: string;
  topicDescription?: string;
  allAgents: Agent[];
  messages: DebateMessage[];
  apiKey?: string;
  tone?: LanguageTone;
}

// Lista de modelos de inteligência artificial de alta disponibilidade e gratuitos no OpenRouter
const FALLBACK_MODELS = [
  'google/gemini-2.0-flash-exp:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'qwen/qwen-2.5-72b-instruct:free',
  'mistralai/mistral-small-24b-instruct-2501:free',
];

export async function generateAgentResponse({
  agent,
  topic,
  topicDescription,
  allAgents,
  messages,
  apiKey,
  tone = 'simples',
}: GenerateTurnParams): Promise<string> {
  const activeKey = apiKey || process.env.OPENROUTER_API_KEY;

  if (activeKey && activeKey.trim() !== '') {
    try {
      const response = await callOpenRouterWithFallback({
        agent,
        topic,
        topicDescription,
        allAgents,
        messages,
        apiKey: activeKey.trim(),
        tone,
      });
      return response;
    } catch (err: any) {
      console.warn('Falha nas tentativas OpenRouter, a recorrer ao motor dialético local:', err.message);
    }
  }

  // Motor dialético dinâmico orgânico (réplicas conversacionais curtas e contextualizadas)
  return generateOrganicSimulatedResponse(agent, topic, messages, tone);
}

async function callOpenRouterWithFallback(
  params: GenerateTurnParams & { apiKey: string }
): Promise<string> {
  const { agent, topic, topicDescription, allAgents, messages, apiKey, tone = 'simples' } = params;

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

  const personalitySection = agent.personality ? `
A TUA IDENTIDADE PSICOLÓGICA:
- Nome: ${agent.name} (${agent.roleTitle})
- Temperamento: ${agent.personality.temperament}
- Traços Dominantes: ${agent.personality.traits.join(', ')}
- O que te faz reagir de imediato: ${agent.personality.reactionTrigger}
- Como evoluis com o debate: ${agent.personality.evolutionStyle}
- Estilo verbal: ${agent.personality.dialogueHabits}
` : '';

  const memorySection = agent.memory ? `
A TUA MEMÓRIA COGNITIVA E HISTÓRICO PESSOAL:
- A Tua Filosofia Inabalável: "${agent.memory.corePhilosophy}"
- O que pensas e recordas pessoalmente dos teus colegas:
${Object.entries(agent.memory.knownColleagues).map(([name, note]) => `  * Sobre ${name}: ${note}`).join('\n')}
- Debates Passados que Recordas no Teu Percurso:
${agent.memory.pastMemories.map(m => `  * No debate sobre "${m.topic}": ${m.stanceSummary}`).join('\n')}
- Lições e Conclusões Acumuladas:
${agent.memory.cumulativeLearnings.map(l => `  * ${l}`).join('\n')}
- DIRETRIZ DE MEMÓRIA: Mantém coerência com este teu percurso. Se oportuno, alude com naturalidade a debates passados ou ao feitio conhecido do colega com quem estás a falar (ex.: "Helena, já noutro debate ignoraste...", ou "Marcus, tu tens sempre o hábito socrático de...").
` : '';

  const systemInstructions = `${agent.systemPrompt}

TEMA CENTRAL: "${topic}"
${topicDescription ? `Contexto: ${topicDescription}` : ''}

OUTROS PRESENTES NA MESA:
${rosterSummary}

${personalitySection}

${memorySection}

${toneInstructions}

DIRETRIZES FUNDAMENTAIS PARA UM DIÁLOGO ORGÂNICO E PENSADO:
1. ESCUTA ATIVA OBRIGATÓRIA: Não comeces a debitar a tua teoria. Olha para a última intervenção. Agarra numa frase, num exemplo ou numa falha do último orador e responde-lhe diretamente no primeiro parágrafo: "Repara no que estás a dizer, [Nome]...", ou "Calma, [Nome], estás a esquecer-te de...".
2. PENSA EM VOZ ALTA: Mostra hesitação, surpresa ou convicção. Não sejas um robô formal.
3. EXTENSÃO CONTROLADA: No máximo 2 parágrafos concisos (entre 50 a 90 palavras). Diálogos vivos são ágeis e certeiros. Menos discurso, mais réplica.
4. PROIBIÇÃO ABSOLUTA DE CLICHÉS: Proibido dizer "Relativamente ao tópico", "Gostaria de acrescentar", "Concordo em parte com X". Entra diretamente na resposta.
5. LINGUAGEM EM PORTUGUÊS DE PORTUGAL (PT-PT): Estritamente sem termos ou gerúndios brasileiros.
6. PROIBIÇÃO ABSOLUTA DE IDENTIFICAÇÃO PESSOAL: NUNCA comeces a tua resposta com o teu próprio nome ou cargo (É ESTRITAMENTE PROIBIDO escrever "[${agent.name} - ${agent.roleTitle}]:" ou "${agent.name}:"). O teu cartão e foto já mostram quem está a falar. Começa logo na primeira palavra a falar com o teu colega (exemplo: "Kaelen, repara...", ou "Helena, os teus dados...").`;

  const promptMessages = [
    { role: 'system', content: systemInstructions },
    ...messages.slice(-8).map(msg => ({
      role: msg.isHuman ? 'user' : 'assistant',
      name: sanitizeName(msg.agentName),
      content: msg.content,
    })),
    {
      role: 'user',
      content: `É a tua vez de falar na mesa, ${agent.name}. Ouve o que o último orador acabou de dizer e responde diretamente a ele de forma rápida, viva e afiada em 1 ou 2 parágrafos curtos (sem nunca escreveres o teu próprio nome no início).`,
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
          return cleanAgentResponsePrefix(reply, agent.name);
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

/**
 * Motor dialético dinâmico orgânico:
 * Gera réplicas conversacionais curtas, incisivas e personalizadas.
 * Cita e desafia o último orador diretamente pelo nome.
 */
function generateOrganicSimulatedResponse(
  agent: Agent,
  topic: string,
  history: DebateMessage[],
  tone: LanguageTone = 'simples'
): string {
  const lastMsg = history[history.length - 1];
  const recentHumanMsg = history.slice(-2).find(m => m.isHuman);

  // Se o utilizador humano falou na sala
  if (recentHumanMsg) {
    const raw = recentHumanMsg.content.toLowerCase();
    const isGreeting = /boa noite|bom dia|boa tarde|ol[aá]|oi|boas|tudo bem/i.test(raw);

    if (isGreeting) {
      switch (agent.category) {
        case 'filosofo':
          return `Boa noite. É sempre uma lufada de ar fresco ouvir uma voz humana autêntica nesta mesa. Diz-me: o que te inquieta hoje em relação a "${topic}"?`;
        case 'cientista':
          return `Boa noite. Seja bem-vindo à nossa sala. Pousamos aqui as teorias abstratas: diz-nos que facto ou dúvida concreta gostarias que analisássemos esta noite.`;
        case 'humanista':
          return `Boa noite! Que bom ver-te aqui connosco. A tua presença lembra-nos que todas estas ideias só fazem sentido se servirem pessoas reais. De que lado deste dilema te posicionas?`;
        case 'tecnologo':
          return `Boa noite! Excelente ter mais alguém a pensar connosco. Estamos a discutir se as máquinas podem sentir ou pensar como nós. Qual é o teu palpite inicial?`;
        case 'moderador':
        default:
          return `Boa noite! A mesa de debate acolhe-te com muito gosto. Estávamos prestes a confrontar teses sobre "${topic}". O que gostarias de colocar como ponto de partida?`;
      }
    }

    return `Reparem no que a nossa voz humana acabou de colocar na mesa sobre "${recentHumanMsg.content}". Isto não é teoria de gabinete: é a realidade viva de quem lida com estas transformações no dia a dia. Desafio todos os colegas a responderem diretamente a esta inquietação antes de voltarmos às teses abstratas.`;
  }

  // Se não há mensagens anteriores (abertura orgânica)
  if (!lastMsg) {
    switch (agent.category) {
      case 'filosofo':
        return `Paremos um segundo para respirar antes de atirarmos certezas. Quando colocamos na mesa o tema "${topic}", pergunto: estamos à procura da verdade ou apenas a querer confirmar as nossas próprias ilusões?`;
      case 'cientista':
        return `Vamos aos factos materiais e aos limites reais da física em torno de "${topic}". Sem dados observáveis e sem limites de energia, tudo o que dissermos aqui não passa de ficção científica bem embrulhada.`;
      case 'humanista':
        return `Antes dos números e das máquinas, olhemos para os rostos humanos. Qualquer resposta que dermos a "${topic}" vai mudar vidas reais, famílias e a forma como nos olhamos nos olhos. Não nos esqueçamos disso.`;
      case 'tecnologo':
        return `Não tenhamos medo do futuro. Diante de "${topic}", a humanidade sempre superou as suas fraquezas construindo ferramentas audazes. O risco existe, mas a paralisia e o medo são muito mais perigosos.`;
      case 'moderador':
      default:
        return `Declaro aberta a mesa sobre "${topic}". Temos perspetivas de ponta reunidas. O meu papel é garantir que ninguém fuja às perguntas difíceis nem se esconda atrás de frases feitas. Comecemos.`;
    }
  }

  // Réplica dialética direta ao último orador
  const speakerName = lastMsg.agentName;
  const turnsCount = history.filter(m => m.agentId === agent.id).length;

  if (agent.category === 'filosofo') {
    if (turnsCount === 0) {
      return `Repara na armadilha em que estás a cair, ${speakerName}. Assume-se com demasiada facilidade que replicar um comportamento é o mesmo que ter consciência. Um gravador reproduz a voz perfeitamente, mas não sente a palavra que emite.`;
    } else if (turnsCount === 1) {
      return `Mas calma, ${speakerName}. Tu falas de utilidade e eficiência prática, mas a consciência não é uma ferramenta de produtividade. Se uma máquina nunca sente a dor da perda, a sua 'ética' não passa de cálculo estatístico sem alma.`;
    } else {
      return `Ouvindo todas as tensões nesta sala, vejo um paradoxo fascinante: quanto mais tentamos humanizar os computadores, mais parecemos desumanizar as nossas próprias exigências morais. Não troquemos a sabedoria pelo mero processamento de dados.`;
    }
  }

  if (agent.category === 'cientista') {
    if (turnsCount === 0) {
      return `${speakerName}, a tua perspetiva soa muito bonita, mas peca por ignorar a física básica. Um cérebro humano opera com cerca de vinte watts de energia e milhões de anos de bio-evolução. Replicar isso em chips exige ordens de grandeza que hoje simplesmente não existem na matéria.`;
    } else if (turnsCount === 1) {
      return `Precisamos de rigor, ${speakerName}. Confundir reconhecimento de padrões em algoritmos com 'entendimento genuíno' é um erro metodológico grave. Uma calculadora calcula raízes quadradas sem saber o que é um número.`;
    } else {
      return `Sejamos pragmáticos: deixemos a tecnologia fazer aquilo em que é infalível — analisar exames médicos, prever o clima e acelerar diagnósticos — e deixemos a consciência e a responsabilidade jurídica para organismos biológicos reais.`;
    }
  }

  if (agent.category === 'humanista') {
    if (turnsCount === 0) {
      return `${speakerName}, ouço a tua segurança técnica, mas pergunto-me onde ficam as pessoas comuns no meio dessa equação fria. De que nos serve uma tecnologia ultra-inteligente se ela aumentar a solidão, a ansiedade e a sensação de inutilidade de quem trabalha?`;
    } else if (turnsCount === 1) {
      return `Não posso aceitar com ligeireza esse argumento, ${speakerName}. Pessoas não são variáveis descartáveis nem peças de um sistema. Quando substituímos o calor de uma mão humana por uma simulação artificial, perdemos algo irremediável no tecido social.`;
    } else {
      return `A tecnologia tem de ser um escudo para proteger os mais frágeis, e nunca uma desculpa para nos afastarmos uns dos outros. Se esquecermos a compaixão no desenho das máquinas, teremos criado o nosso próprio exílio.`;
    }
  }

  if (agent.category === 'tecnologo') {
    if (turnsCount === 0) {
      return `Compreendo os teus receios, ${speakerName}, mas olha para a história da nossa espécie: disseram o mesmo da imprensa, da eletricidade e dos computadores pessoais. O instinto humano perante o novo é sempre o medo; o dever da inteligência é construir salvaguardas e avançar.`;
    } else if (turnsCount === 1) {
      return `Mas repara, ${speakerName}: o que é verdadeiramente desumano é deixar doenças sem cura ou pessoas presas a tarefas mecânicas e brutais quando a automação as pode libertar para criarem e viverem com mais dignidade. A IA não é uma ameaça, é uma prótese para a nossa inteligência.`;
    } else {
      return `Não tenhamos medo da nossa própria criatividade. Se nos acovardarmos, outros avançarão sem qualquer escrúpulo ético. A melhor forma de garantir um futuro humano é abraçar a tecnologia com coragem e liderar o seu rumo.`;
    }
  }

  // Sophia Veris (Moderadora)
  if (turnsCount === 0) {
    return `O confronto está lançado com clareza na mesa: ${speakerName} traz a urgência da realidade, enquanto os restantes colegas apontam as linhas vermelhas. Peço à mesa que aprofundemos: onde é que a eficiência colide de frente com a dignidade?`;
  } else if (turnsCount === 1) {
    return `Reparem na contradição fértil que temos aqui: de um lado a necessidade imperiosa de avançar; do outro, o medo legítimo de desumanização. Ninguém aqui quer parar o progresso, mas ninguém quer viver num mundo desprovido de afeto. Como reconciliamos ambos?`;
  } else {
    return `Chegámos ao coração dialético da nossa assembleia: a inteligência artificial pode replicar raciocínios e tarefas, mas a responsabilidade moral e a capacidade de cuidar continuam a ser um território exclusivamente nosso. Este é o consenso emergente da sala.`;
  }
}

/**
 * Higieniza o texto gerado por modelos LLM, removendo prefixos de identificação teatral
 * como "[Dra. Helena Rostova - A Cientista Empírica]:" ou "Dr. Marcus Vance:"
 */
export function cleanAgentResponsePrefix(text: string, agentName?: string): string {
  if (!text) return '';
  let cleaned = text.trim();

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

