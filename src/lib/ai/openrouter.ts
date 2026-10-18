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
      const response = await callOpenRouter({
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
      console.warn('Falha na chamada OpenRouter, a recorrer ao motor dialético local:', err.message);
    }
  }

  // Fallback inteligente com suporte estrito ao tom escolhido (simples vs académico)
  return generateSimulatedResponse(agent, topic, messages, tone);
}

async function callOpenRouter({
  agent,
  topic,
  topicDescription,
  allAgents,
  messages,
  apiKey,
  tone = 'simples',
}: GenerateTurnParams & { apiKey: string }): Promise<string> {
  const rosterSummary = allAgents
    .map(a => `- ${a.name} (${a.roleTitle}): ${a.stanceDescription}`)
    .join('\n');

  const toneInstructions = tone === 'simples'
    ? `REGRA DE OURO - LINGUAGEM SIMPLES E CLARA:
- Usa linguagem comum, simples, direta e acessível a qualquer pessoa (mesmo sem estudos na área).
- É PROIBIDO usar palavras difíceis ou termos como "ontológico", "epistemológico", "heurística", "entropia", "reducionismo".
- Explica as tuas ideias com exemplos práticos do dia a dia e analogias fáceis de entender.
- Frases diretas e fáceis de ler à primeira vista.`
    : `REGRA DE LINGUAGEM ACADÉMICA:
- Podes utilizar vocabulário formal, filosófico, epistemológico e terminologia científica densa.`;

  const systemInstructions = `${agent.systemPrompt}

TÓPICO EM DISCUSSÃO: "${topic}"
${topicDescription ? `Contexto: ${topicDescription}` : ''}

OUTROS AGENTES NA MESA:
${rosterSummary}

${toneInstructions}

OUTRAS REGRAS:
1. Responde com a tua identidade única e ponto de vista.
2. Faz referência direta ao último orador pelo nome.
3. Não repitas o que já foi dito; traz um novo argumento ou exemplo.
4. Escreve EXCLUSIVAMENTE em Português de Portugal (PT-PT), sem brasileirismos.
5. Limita a intervenção a 2 ou 3 parágrafos curtos.`;

  const promptMessages = [
    { role: 'system', content: systemInstructions },
    ...messages.slice(-8).map(msg => ({
      role: msg.isHuman ? 'user' : 'assistant',
      name: sanitizeName(msg.agentName),
      content: `[${msg.agentName} - ${msg.agentRole}]:\n${msg.content}`,
    })),
    {
      role: 'user',
      content: `É a tua vez de falar, ${agent.name}. Responde de forma clara ao ponto em debate.`,
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
      temperature: 0.7,
      max_tokens: 500,
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
 * Motor de simulação inteligente com alternância real entre linguagem simples e académica
 */
function generateSimulatedResponse(
  agent: Agent,
  topic: string,
  history: DebateMessage[],
  tone: LanguageTone = 'simples'
): string {
  const lastMsg = history[history.length - 1];
  const lastSpeakerName = lastMsg ? lastMsg.agentName : 'nossos colegas';

  // MODO LINGUAGEM SIMPLES (CLARO, DIRETO E COM EXEMPLOS DO DIA A DIA)
  if (tone === 'simples') {
    switch (agent.category) {
      case 'filosofo':
        return `Ao ouvir o que ${lastSpeakerName} disse, acho que estamos a complicar uma coisa simples: afinal, o que é que nós somos? \n\nSe um robô conseguir imitar perfeitamente um ser humano a falar ou a rir, será que ele está mesmo a sentir alegria, ou é só uma máquina a fingir? É como colocar uma gravação de um pássaro a cantar no jardim: ouvimos o canto, mas não está lá pássaro nenhum de verdade.\n\nPor isso pergunto a todos: estamos a procurar máquinas que nos ajudem, ou estamos a enganar-nos a nós próprios a pensar que uma máquina pode ter coração e sentimentos?`;

      case 'cientista':
        return `Compreendo a dúvida, mas temos de ser práticos e olhar para os factos. Na realidade, tudo o que envolve "${topic}" depende de coisas materiais: eletricidade, peças, circuitos e limites reais da física.\n\nUm computador não pensa por magia; ele apenas processa informação muito depressa, como uma calculadora gigante. O nosso cérebro consome energia, cansa-se e tem milhões de anos de evolução biológica por detrás.\n\nComo disse ${lastSpeakerName}, podemos sonhar com muitas coisas, mas se não conseguirmos provar no laboratório com números e testes reais, é apenas ficção e imaginação.`;

      case 'humanista':
        return `Não podemos esquecer o mais importante no meio desta conversa toda: as pessoas de carne e osso!\n\nQuando discutimos "${topic}", não estamos a falar só de tecnologia ou teorias. Estamos a falar de como as pessoas vão viver, se vão ter trabalho, se vão sentir-se sozinhas ou se vão perder o contacto humano com a família e com os amigos. O que ${lastSpeakerName} defende pode parecer muito moderno, mas se não trouxer mais felicidade e paz para as pessoas, de que serve?\n\nA tecnologia só tem valor se servir para cuidar da nossa vida e proteger quem mais precisa, e não para nos afastar uns dos outros.`;

      case 'tecnologo':
        return `Eu percebo o medo e as dúvidas, mas pensem nisto: há cem anos, ninguém imaginava que teríamos telemóveis com acesso a todo o conhecimento do mundo no bolso!\n\nEm relação a "${topic}", o ser humano sempre inventou ferramentas para superar as suas fraquezas. As máquinas e a inteligência artificial não vêm para destruir o ser humano; vêm para nos ajudar a curar doenças incuráveis, a produzir comida mais barata e a resolver problemas difíceis que sozinhos não conseguimos resolver.\n\nO que ${lastSpeakerName} vê como um perigo, eu vejo como uma oportunidade única para vivermos melhor e com mais saúde.`;

      case 'moderador':
      default:
        return `Estamos a chegar a um ponto muito interessante da conversa sobre "${topic}".\n\nPor um lado, temos quem nos lembre com bom senso que as máquinas não têm sentimentos e que temos de proteger as pessoas; por outro lado, vemos como a tecnologia pode mudar a nossa vida para muito melhor se a soubermos usar.\n\nO segredo aqui não é ter medo nem avançar às cegas. É saber: como podemos aproveitar o melhor destas ferramentas sem nunca perder a nossa humanidade? O que acham?`;
    }
  }

  // MODO LINGUAGEM ACADÉMICA (FORMAL, FILOSÓFICO E CONCEITUAL)
  switch (agent.category) {
    case 'filosofo':
      return `Ao examinar a tese apresentada por ${lastSpeakerName}, temo que estejamos perante um erro categorial fundamental sobre "${topic}". Não podemos confundir a simulação funcional de processos cognitivos com a emergência ontológica de uma consciência subjetiva (qualia). Desafio a mesa: estamos a investigar a realidade do ser ou meramente a erigir convenções semânticas que mascaram a nossa vacuidade epistemológica?`;

    case 'cientista':
      return `Concordo com a cautela analítica, mas o debate em torno de "${topic}" tem de ser balizado pelas leis da termodinâmica, pela teoria da informação e pelos limites do ruído quântico e computacional. Sem hipóteses empiricamente falsificáveis, os argumentos de ${lastSpeakerName} arriscam permanecer no território da pura especulação pré-científica.`;

    case 'humanista':
      return `Sublinho a imperatividade bioética de não desmaterializar o sujeito consciente em meros vetores probabilísticos. O discurso de ${lastSpeakerName} ignora a assimetria existencial do sofrimento e a dignidade intrínseca que nenhuma computação sintética pode replicar sem incorrer numa profunda alienação social.`;

    case 'tecnologo':
      return `A história do avanço civilizacional é a história da transcendência dos limites biológicos. A postura prudente de ${lastSpeakerName} reflete o clássico viés de aversão ao risco existencial; contudo, a convergência entre algoritmos generativos e arquiteturas não-lineares demonstra que a evolução da inteligência é um imperativo cósmico inexorável.`;

    case 'moderador':
    default:
      return `A síntese dialética deste momento revela a tensão clássica entre o imperativo bioético de salvaguarda humana e a teleologia aceleracionista. Convoco a assembleia a definir os parâmetros axiológicos e institucionais que permitam mediar esta clivagem estrutural.`;
  }
}
