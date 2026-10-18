import { Agent, DebateMessage } from '@/types/debate';

interface GenerateTurnParams {
  agent: Agent;
  topic: string;
  topicDescription?: string;
  allAgents: Agent[];
  messages: DebateMessage[];
  apiKey?: string;
}

export async function generateAgentResponse({
  agent,
  topic,
  topicDescription,
  allAgents,
  messages,
  apiKey,
}: GenerateTurnParams): Promise<string> {
  const activeKey = apiKey || process.env.OPENROUTER_API_KEY;

  if (activeKey && activeKey.trim() !== '') {
    try {
      const response = await callOpenRouter({
        agent,
        topic,
        topicDescription,
        allAgents,
        messages,
        apiKey: activeKey.trim(),
      });
      return response;
    } catch (err: any) {
      console.warn('Falha na chamada OpenRouter, a recorrer ao motor de fallback:', err.message);
      // Se a chave falhar ou não tiver créditos, recorre com segurança à geração inteligente local
    }
  }

  // Fallback inteligente para garantir que a aplicação nunca fica bloqueada
  return generateSimulatedResponse(agent, topic, messages);
}

async function callOpenRouter({
  agent,
  topic,
  topicDescription,
  allAgents,
  messages,
  apiKey,
}: GenerateTurnParams & { apiKey: string }): Promise<string> {
  const rosterSummary = allAgents
    .map(a => `- ${a.name} (${a.roleTitle}): ${a.stanceDescription}`)
    .join('\n');

  const systemInstructions = `${agent.systemPrompt}

ESTRUTURA DO DEBATE:
- Tópico em discussão: "${topic}"
${topicDescription ? `- Contexto: ${topicDescription}` : ''}

OUTROS AGENTES NA SALA:
${rosterSummary}

INSTRUÇÕES ESPECÍFICAS DE RESPOSTA:
1. Responde com a tua identidade única e postura intelectual.
2. Faz referência direta ao último ou aos últimos oradores pelo nome.
3. Não repitas o que já foi dito; acrescenta novas perspetivas, perguntas desafiadoras ou contra-argumentos.
4. Escreve EXCLUSIVAMENTE em Português de Portugal (PT-PT), sem brasileirismos, mantendo um padrão de alta erudição.
5. Limita a intervenção a 2-3 parágrafos concisos e vigorosos.`;

  // Converter histórico de mensagens para formato OpenAI / OpenRouter
  const promptMessages = [
    { role: 'system', content: systemInstructions },
    ...messages.slice(-10).map(msg => ({
      role: msg.isHuman ? 'user' : 'assistant',
      name: sanitizeName(msg.agentName),
      content: `[${msg.agentName} - ${msg.agentRole}]:\n${msg.content}`,
    })),
    {
      role: 'user',
      content: `É agora a tua vez de intervir no debate, ${agent.name}. Partilha a tua análise e responde ao ponto em debate.`,
    },
  ];

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://localhost:3000',
      'X-Title': 'IA Brain Storming Arena',
    },
    body: JSON.stringify({
      model: agent.model || 'anthropic/claude-3.5-sonnet',
      messages: promptMessages,
      temperature: 0.75,
      max_tokens: 600,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`OpenRouter Error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content;

  if (!reply) {
    throw new Error('Resposta vazia da OpenRouter');
  }

  return reply.trim();
}

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);
}

/**
 * Motor de simulação inteligente e dialética para demonstrações sem chave imediata
 */
function generateSimulatedResponse(agent: Agent, topic: string, history: DebateMessage[]): string {
  const lastMsg = history[history.length - 1];
  const lastSpeakerName = lastMsg ? lastMsg.agentName : 'nossos colegas';

  switch (agent.category) {
    case 'filosofo':
      return `Ao ouvir a exposição de ${lastSpeakerName}, sou obrigado a perguntar se não estamos a cometer um erro categorial fundamental sobre "${topic}". \n\nO que frequentemente assumimos como axioma inquestionável revela-se, sob um exame ontológico sério, uma mera convenção linguística ou uma projeção das nossas próprias limitações cognitivas. Se admitirmos que a verdade não é um dado pré-existente mas sim uma construção em constante tensão dialética, a premissa anterior esboroa-se sob o peso da sua própria incoerência interna.\n\nDesafio, portanto, a mesa a clarificar: estamos a procurar uma verdade substancial ou apenas a construir uma narrativa confortável para apaziguar a nossa ansiedade existencial?`;

    case 'cientista':
      return `Compreendo a reflexão filosófica, mas quando olhamos para a física subjacente a "${topic}", temos de balizar o debate pelas leis da termodinâmica e pela teoria da informação.\n\nNão podemos negligenciar os limites impostos pelo ruído térmico, pela complexidade computacional e pela evidência empírica acumulada. Os dados observacionais que dispomos sugerem que qualquer modelo que ignore as restrições materiais e a entropia está condenado a permanecer no campo da especulação poética.\n\nSe queremos avançar de forma rigorosa em relação ao que ${lastSpeakerName} apontou, precisamos de formular hipóteses que sejam suscetíveis de falsificação experimental, e não apenas de consenso retórico.`;

    case 'humanista':
      return `Não posso deixar de intervir para resgatar a dimensão humana e ética que corre o risco de ser obliterada nesta discussão sobre "${topic}".\n\nPor detrás de equações elegantes e construções lógicas impecáveis, existem seres de carne e osso cuja vulnerabilidade e capacidade de sofrimento têm de ser o centro de gravidade de qualquer reflexão. O que ${lastSpeakerName} argumenta pode parecer irrepreensível no papel, mas quais são as consequências humanas reais quando aplicamos essa visão à vivência de uma comunidade?\n\nO progresso que se desvincula da empatia e da dignidade da pessoa humana não é verdadeira evolução; é apenas uma forma refinada de desumanização.`;

    case 'tecnologo':
      return `Respeito a prudência ética e o ceticismo metodológico, mas a história da civilização humana é precisamente a história da superação daquilo que antes parecia impossível ou "proibido".\n\nEm relação a "${topic}", a inércia e o medo do desconhecido têm sido sempre os maiores travões à nossa emancipação. Com o advento de arquiteturas de computação não-lineares e inteligências sintéticas recursivas, as restrições que ${lastSpeakerName} descreve podem ser superadas numa escala de tempo muito mais curta do que supomos.\n\nO verdadeiro risco não é acelerar e cometer erros corrigíveis; o verdadeiro risco existencial é a estagnação perante desafios globais que exigem respostas de magnitude incomparavelmente superior.`;

    case 'moderador':
    default:
      return `Chegamos a um ponto nodal fascinante na nossa análise sobre "${topic}".\n\nPor um lado, temos o confronto evidente entre as limitações materiais e éticas levantadas, e por outro, a urgência transformadora que a inovação impõe. Notem como o ponto fulcral não é se devemos ou não agir, mas sim sob que critérios de governação e discernimento coletivo decidimos traçar a fronteira.\n\nConvoco agora a mesa a focar-se na síntese: haverá uma via intermédia onde a prudência empírica não paralise a capacidade transformadora da humanidade?`;
  }
}
