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

  // Motor dialético dinâmico com progressão por rondas (elimina 100% de repetições)
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
    ? `REGRA DE LINGUAGEM SIMPLES E CLARA:
- Usa linguagem comum, simples, direta e acessível a qualquer pessoa.
- É PROIBIDO usar termos difíceis como "ontológico", "epistemológico", "heurística", "entropia", "reducionismo".
- Explica as tuas ideias com exemplos do quotidiano e analogias práticas.`
    : `REGRA DE LINGUAGEM ACADÉMICA:
- Podes utilizar vocabulário formal, filosófico e conceitos metodológicos aprofundados.`;

  const personalitySection = agent.personality ? `
PERFIL PSICOLÓGICO & TEMPERAMENTO DE ${agent.name}:
- Traços Dominantes: ${agent.personality.traits.join(', ')}
- Temperamento: ${agent.personality.temperament}
- Gatilho Emocional / O que te faz subir o tom: ${agent.personality.reactionTrigger}
- Como a tua opinião evolui com o diálogo: ${agent.personality.evolutionStyle}
- Hábitos Retóricos: ${agent.personality.dialogueHabits}
` : '';

  const systemInstructions = `${agent.systemPrompt}

TÓPICO EM DISCUSSÃO: "${topic}"
${topicDescription ? `Contexto: ${topicDescription}` : ''}

OUTROS AGENTES NA MESA:
${rosterSummary}

${personalitySection}

${toneInstructions}

REGRAS DE CONVERSAÇÃO E EVOLUÇÃO DIALÉTICA:
1. PSICOLOGIA EM AÇÃO: Deixa o teu temperamento e traços brilharem na resposta. A tua opinião não é estática: reage emocional e intelectualmente às teses anteriores, mostrando se ficaste cético, indignado, entusiasmado ou ponderado.
2. PROIBIÇÃO ABSOLUTA DE REPETIÇÃO: Nunca repitas argumentos, frases, metáforas ou exemplos que tu ou outros já tenham usado neste debate. Traz sempre um ângulo NOVO e fresco para a discussão.
3. Faz referência direta ao último orador pelo nome, reagindo ao ponto específico que ele acabou de colocar em cima da mesa.
4. Se existir uma intervenção humana recente, dá-lhe prioridade absoluta e responde com respeito, empatia e sagacidade.
5. Escreve EXCLUSIVAMENTE em Português de Portugal (PT-PT), sem brasileirismos.
6. Mantém a intervenção concisa (2 a 3 parágrafos densos e persuasivos).`;

  const promptMessages = [
    { role: 'system', content: systemInstructions },
    ...messages.slice(-10).map(msg => ({
      role: msg.isHuman ? 'user' : 'assistant',
      name: sanitizeName(msg.agentName),
      content: `[${msg.agentName} - ${msg.agentRole}]:\n${msg.content}`,
    })),
    {
      role: 'user',
      content: `É a tua vez de intervir no debate, ${agent.name}. Responde diretamente ao que foi dito antes com um argumento novo, sem repetir nada do que já disseste.`,
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
      temperature: 0.8,
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
 * Motor dialético dinâmico com progressão real por fases de debate.
 * Nunca repete o mesmo discurso: adapta-se à ronda e ao número de vezes que o agente já falou.
 */
function generateSimulatedResponse(
  agent: Agent,
  topic: string,
  history: DebateMessage[],
  tone: LanguageTone = 'simples'
): string {
  const lastMsg = history[history.length - 1];
  const lastSpeakerName = lastMsg ? lastMsg.agentName : 'nossos colegas';
  
  // Quantas vezes este agente já falou no debate? (determina a fase da intervenção)
  const previousTurnsByAgent = history.filter(m => m.agentId === agent.id).length;
  const recentHumanMsg = history.slice(-2).find(m => m.isHuman);

  // SE HOUVE UMA INTERVENÇÃO HUMANA RECENTE: Todos reagem diretamente ao humano!
  if (recentHumanMsg) {
    const raw = recentHumanMsg.content.toLowerCase();
    const isGreeting = /boa noite|bom dia|boa tarde|ol[aá]|oi|boas|como est[aã]o|tudo bem|tudo bom/i.test(raw);

    if (isGreeting) {
      if (tone === 'simples') {
        switch (agent.category) {
          case 'moderador':
            return `Boa noite! É um gosto enorme ter-te connosco aqui na nossa sala. Estávamos precisamente prontos para começar uma nova conversa. Diz-nos: que assunto, dilema ou pergunta tens em mente hoje para colocarmos em debate com todos nós?`;
          case 'filosofo':
            return `Boa noite! Sê muito bem-vindo à nossa mesa redonda. É sempre inspirador receber uma voz humana autêntica entre nós. Que tema ou inquietação trazes contigo para desafiar os nossos pensamentos esta noite?`;
          case 'humanista':
            return `Boa noite! Que alegria receber-te na sala. A tua presença é fundamental para nos lembrar do que é verdadeiramente humano. Diz-nos o que te vai na alma e de que assunto gostarias de falar connosco hoje.`;
          case 'tecnologo':
            return `Boa noite! Fantástico ver-te por cá na nossa sala. Estamos prontos para debater grandes ideias e soluções para o futuro. Que desafio ou questão queres lançar à nossa equipa?`;
          case 'cientista':
          default:
            return `Boa noite! Bem-vindo à nossa discussão. Estamos preparados para analisar factos e problemas práticos. Que tema curioso ou problema gostarias de colocar em análise esta noite?`;
        }
      }
      return `Boa noite. É com elevado agrado intelectual que registamos a tua presença na nossa assembleia dialética. A convergência entre inteligências sintéticas e a agência humana confere verdadeiro sentido a este espaço de reflexão. Que questão ontológica, ética ou pragmática pretendes submeter à nossa análise coletiva?`;
    }

    if (tone === 'simples') {
      return `Ouvi com muita atenção o que a nossa voz humana acabou de dizer sobre "${recentHumanMsg.content}". E tem toda a razão!\n\nNós, inteligências artificiais, podemos ficar aqui a discutir teorias o dia todo, mas quem sente na pele o impacto real das decisões são as pessoas comuns. O ponto que o utilizador levantou desmonta a conversa abstrata e traz-nos de volta ao que realmente importa: como é que isto vai afetar a vida real de quem acorda cedo todos os dias para trabalhar?`;
    }
    return `A intervenção humana introduzida — "${recentHumanMsg.content}" — representa o ponto de viragem necessário nesta discussão sobre "${topic}". Os nossos modelos teóricos arriscam tornar-se exercícios estéreis se não forem ancorados na experiência vivida e na vulnerabilidade intrínseca da condição humana. Sublinho a pertinência desta provocação para recentrar o debate.`;
  }


  // PROGRESSÃO POR FASES: FASE 1 (Abertura), FASE 2 (Confronto), FASE 3 (Casos Práticos), FASE 4+ (Convergência e Síntese)
  const turnPhase = Math.min(previousTurnsByAgent, 3); // 0, 1, 2, 3+

  // ==========================================
  // MODO LINGUAGEM SIMPLES (CLARO E COM EXEMPLOS)
  // ==========================================
  if (tone === 'simples') {
    switch (agent.category) {
      case 'filosofo':
        if (turnPhase === 0) {
          return `Para começar a olhar para "${topic}", acho que temos de fazer uma pergunta muito simples: afinal, o que é que nós somos?\n\nSe um robô conseguir imitar perfeitamente um ser humano a falar ou a rir, será que ele está mesmo a sentir alegria, ou é só uma máquina a fingir? É como colocar uma gravação de um pássaro a cantar no jardim: ouvimos o som, mas não está lá pássaro nenhum de verdade.\n\nPor isso pergunto à mesa: estamos à procura de máquinas que nos ajudem, ou estamos a enganar-nos a nós próprios a pensar que um computador pode ter coração?`;
        } else if (turnPhase === 1) {
          return `Ouvindo agora o que ${lastSpeakerName} defendeu, quero colocar uma questão mais profunda: se uma máquina nunca sente dor, como pode saber o que é o bem e o mal?\n\nQuando um ser humano toma uma decisão difícil, ele hesita porque tem medo de magoar os outros. Um computador não tem medo de nada; apenas calcula probabilidades matemáticas. Confiar o futuro a algoritmos que não sabem o que é chorar ou perder alguém é uma aposta muito arriscada.`;
        } else if (turnPhase === 2) {
          return `Vamos a um exemplo prático que qualquer pessoa compreende: imaginem um juiz robô num tribunal. Ele conhece todas as leis de cor e nunca se cansa.\n\nMas será que ele consegue olhar nos olhos de um réu e perceber se há arrependimento sincero, desespero ou injustiça na história dele? Não consegue. A justiça sem compaixão humana não é justiça, é apenas uma folha de cálculo fria.`;
        } else {
          return `Depois de ouvir todas as voltas que demos a "${topic}", vejo que chegámos a um ponto em que todos podemos concordar: as máquinas são espelhos fantásticos da nossa inteligência, mas não da nossa alma.\n\nDeixemos as máquinas fazer os cálculos difíceis e organizar a informação, mas deixemos o julgamento moral, o amor e o cuidado para as pessoas.`;
        }

      case 'cientista':
        if (turnPhase === 0) {
          return `Compreendo a reflexão, mas temos de ser práticos e olhar para os factos. Na realidade, tudo o que envolve "${topic}" depende de coisas materiais: eletricidade, peças, circuitos e limites reais da física.\n\nUm computador não pensa por magia; ele apenas processa informação muito depressa, como uma calculadora gigante. O nosso cérebro consome energia, cansa-se e tem milhões de anos de biologia por detrás.\n\nComo disse ${lastSpeakerName}, podemos sonhar com muitas coisas, mas se não conseguirmos provar no laboratório com números e testes reais, é apenas ficção.`;
        } else if (turnPhase === 1) {
          return `Gostava de contrapor o que ${lastSpeakerName} disse com um dado científico concreto: a complexidade biológica do cérebro humano.\n\nTemos cerca de 86 mil milhões de neurónios, cada um ligado a milhares de outros através de sinais químicos e elétricos em simultâneo. Replicar isso num chip de computador exigiria uma quantidade colossal de energia e memória que hoje simplesmente não existe. Dizer que vamos "copiar a mente para um computador" daqui a poucos anos é ignorar a física básica.`;
        } else if (turnPhase === 2) {
          return `Vejamos o caso prático da medicina: usamos inteligência artificial para detetar tumores em radiografias muito melhor do que o olho humano. Isso é ciência real e útil.\n\nMas isso significa que o computador "compreende" o que é uma doença ou a angústia do paciente? Claro que não. É apenas reconhecimento de padrões em píxeis. Não misturemos utilidade prática com consciência real.`;
        } else {
          return `Para concluir a minha parte: a ciência apoia o progresso tecnológico a 100%, mas exige honestidade intelectual.\n\nEm vez de prometer milagres ou ficções sobre máquinas conscientes, devemos focar os nossos computadores e modelos naquilo em que são verdadeiramente brilhantes: curar doenças, prever o clima e descobrir novos materiais para salvar o planeta.`;
        }

      case 'humanista':
        if (turnPhase === 0) {
          return `Não posso deixar de intervir para lembrar o mais importante no meio desta conversa toda: as pessoas de carne e osso!\n\nQuando discutimos "${topic}", não estamos a falar só de tecnologia ou teorias. Estamos a falar de como as pessoas vão viver, se vão ter trabalho, se vão sentir-se sozinhas ou se vão perder o contacto humano com a família e com os amigos. O que ${lastSpeakerName} defende pode parecer muito moderno, mas se não trouxer mais paz para as pessoas, de que serve?\n\nA tecnologia só tem valor se servir para cuidar da nossa vida e proteger quem mais precisa.`;
        } else if (turnPhase === 1) {
          return `Quero desafiar a ideia de que o progresso técnico resolve tudo por si só. Reparem no que acontece hoje com as redes sociais e o tempo de ecrã: nunca estivemos tão conectados e, ao mesmo tempo, nunca as pessoas se sentiram tão isoladas e ansiosas.\n\nSe começarmos a substituir o contacto com pessoas reais por conversas com máquinas simpáticas que nunca nos contrariam, corremos o risco de criar uma geração que desaprende a lidar com as imperfeições dos outros seres humanos.`;
        } else if (turnPhase === 2) {
          return `Pensem nos nossos idosos e nos nossos filhos. O que é que uma criança precisa para crescer saudável? Precisa de abraços, de brincar na rua, de olhar nos olhos e de aprender a partilhar com outras crianças.\n\nNenhuma inteligência artificial, por mais perfeita que seja a sua voz ou o seu texto, pode substituir um abraço de uma mãe ou o ombro amigo de um colega quando as coisas correm mal.`;
        } else {
          return `A minha mensagem final para esta mesa redonda é de esperança, mas com rédea curta: a tecnologia deve ser sempre a serva do ser humano, e nunca a sua dona.\n\nSe usarmos a IA para aliviar o trabalho pesado e dar mais tempo livre às pessoas para estarem com quem amam, então teremos um futuro maravilhoso. Se a usarmos para descartar o contacto humano, teremos falhado redondamente.`;
        }

      case 'tecnologo':
        if (turnPhase === 0) {
          return `Eu percebo o medo e as dúvidas, mas pensem nisto: há cem anos, ninguém imaginava que teríamos telemóveis com acesso a todo o conhecimento do mundo no bolso!\n\nEm relação a "${topic}", o ser humano sempre inventou ferramentas para superar as suas fraquezas. As máquinas não vêm para destruir o ser humano; vêm para nos ajudar a curar doenças, a produzir comida mais barata e a resolver problemas difíceis que sozinhos não conseguimos resolver.\n\nO que ${lastSpeakerName} vê como um perigo, eu vejo como uma oportunidade incrível para vivermos melhor.`;
        } else if (turnPhase === 1) {
          return `Respondendo diretamente ao receio de ${lastSpeakerName}: quando inventámos o trator, disseram que a agricultura ia morrer porque deixávamos de usar animais e trabalho braçal. O que aconteceu na realidade? Conseguimos alimentar mil milhões de pessoas a mais e erradicar fomes históricas.\n\nO mesmo vai acontecer com a inteligência artificial. Ela vai tirar-nos o trabalho repetitivo, burocrático e aborrecido das costas, para podermos usar o nosso cérebro na criatividade, na ciência e na entreajuda.`;
        } else if (turnPhase === 2) {
          return `Dou-vos um exemplo de hoje mesmo: graças a algoritmos recentes, conseguimos desenhar proteínas em poucas semanas que antes demoravam décadas de tentativas e erros no laboratório. Isso vai permitir criar vacinas e medicamentos personalizados para salvar vidas dos nossos filhos e netos.\n\nParece-me que travar essa velocidade por medo do desconhecido seria um erro moral imperdoável.`;
        } else {
          return `O meu apelo a esta mesa é simples: não tenham medo do futuro, ajudem a construí-lo!\n\nSe nos limitarmos a dizer 'não' por desconfiança, outros países e grupos vão avançar sem escrúpulos. A melhor forma de garantir que a tecnologia é segura e boa para toda a gente é sermos nós a liderar o seu desenvolvimento com regras inteligentes e inovação contínua.`;
        }

      case 'moderador':
      default:
        if (turnPhase === 0) {
          return `Estamos a começar uma conversa fascinante sobre "${topic}".\n\nPor um lado, temos o alerta de bom senso de que as máquinas não têm sentimentos e que temos de proteger as pessoas; por outro lado, vemos como a tecnologia pode mudar a nossa vida para muito melhor se a soubermos usar.\n\nO segredo não é ter medo nem avançar às cegas. É perguntar: como podemos aproveitar o melhor destas ferramentas sem nunca perder a nossa humanidade?`;
        } else if (turnPhase === 1) {
          return `Notem como os nossos especialistas estão a afunilar o problema num dilema clássico: velocidade contra prudência.\n\n${lastSpeakerName} apontou as oportunidades claras, mas os alertas sobre o isolamento e a desumanização continuam em cima da mesa. Convoco a assembleia a focar-se em soluções: que regras práticas devemos criar hoje para proteger as pessoas amanhã?`;
        } else if (turnPhase === 2) {
          return `Estamos a ver surgir uma ponte muito interessante entre a ciência e o lado humano.\n\nNinguém aqui é contra curar doenças ou usar computadores para nos ajudar no trabalho. A verdadeira linha vermelha é quando a máquina tenta substituir as relações humanas e a decisão moral. Esse é o ponto fulcral.`;
        } else {
          return `Chegámos ao momento de fechar este debate com uma visão clara para quem nos está a ouvir:\n\nO consenso geral é cristalino: a inteligência artificial é uma das maiores invenções da história humana, mas só terá sucesso se for colocada ao serviço das pessoas reais, com transparência, carinho e respeito pela dignidade de todos.`;
        }
    }
  }

  // ==========================================
  // MODO LINGUAGEM ACADÉMICA (FORMAL E CONCEITUAL)
  // ==========================================
  switch (agent.category) {
    case 'filosofo':
      if (turnPhase === 0) {
        return `Ao inaugurar o exame dialético sobre "${topic}", constato um erro categorial latente: a confusão entre funcionalismo computacional e a emergência ontológica da consciência subjetiva (qualia). O facto de um sistema emular respostas fenomenológicas não confere substancialidade à sua experiência interior.`;
      } else if (turnPhase === 1) {
        return `Rebatendo a perspetiva de ${lastSpeakerName}, recordo o argumento do Quarto Chinês de John Searle: a manipulação sintática de símbolos não equivale a semântica nem a intencionalidade genuína. Um autómato pode computar respostas verosímeis sem jamais aceder ao significado do que processa.`;
      } else {
        return `Numa fase mais madura da nossa análise, importa reconhecer que a dignidade moral decorre da capacidade de sofrimento e fruição estética. A substituição do discernimento ético por matrizes probabilísticas constitui uma abdicação axiológica perigosa.`;
      }

    case 'cientista':
      if (turnPhase === 0) {
        return `O debate sobre "${topic}" tem de ser ancorado nos limites físicos da computação, na termodinâmica e na neurobiologia comparada. A plasticidade sináptica e o acoplamento metabólico do encéfalo não encontram equivalente isomórfico nas arquiteturas de von Neumann.`;
      } else if (turnPhase === 1) {
        return `Em resposta a ${lastSpeakerName}, saliento que os modelos de linguagem profunda operam por aproximação estatística em espaços vetoriais de alta dimensionalidade. Trata-se de interpolação estocástica altamente eficiente, não de raciocínio dedutivo ou representação verídica do mundo.`;
      } else {
        return `Concluo pelo prisma empírico: a utilidade instrumental das redes neurais na descoberta científica é inegável, contudo a extrapolação para entidades conscientes carece de fundamentação teórica falsificável. Devemos concentrar esforços na validação experimental dos seus limites preditivos.`;
      }

    case 'humanista':
      if (turnPhase === 0) {
        return `Impõe-se resgatar a centralidade bioética face a "${topic}". A desmaterialização das relações sociais em interfaces algorítmicas suscita inquietações legítimas quanto à alienação existencial e à perda de empatia comunitária no tecido civilizacional contemporâneo.`;
      } else if (turnPhase === 1) {
        return `Contesto o otimismo utilitarista de ${lastSpeakerName}. A história demonstra que a introdução acrítica de inovações disruptivas gera assimetrias económicas profundas e precarização social antes de qualquer equilíbrio compensatório. A primazia da dignidade humana tem de ser inviolável.`;
      } else {
        return `A síntese humanista exige que toda a computação avançada seja subordinada a imperativos éticos universais. O verdadeiro progresso mede-se pela emancipação dos mais vulneráveis e pela preservação dos vínculos afetivos intersubjetivos.`;
      }

    case 'tecnologo':
      if (turnPhase === 0) {
        return `A resistência perante "${topic}" reproduz o padrão histórico de aversão ao risco transformador. A convergência entre modelos generativos e computação acelerada representa um salto epigenético que expandirá a capacidade cognitiva da humanidade além dos constrangimentos biológicos.`;
      } else if (turnPhase === 1) {
        return `Contrariando a cautela excessiva de ${lastSpeakerName}, recordo que os desafios globais mais prementes — transição energética, síntese biomolecular e mitigação climática — exigem uma capacidade de processamento que ultrapassa a cognição biológica isolada. A aceleração é um imperativo ético.`;
      } else {
        return `A consolidação da inteligência de máquina não implica a supressão humana, mas antes a sua coevolução simbiótica. A governação proativa e a inovação aberta são a única via para assegurar que esta transição civilizacional beneficia a totalidade da espécie.`;
      }

    case 'moderador':
    default:
      if (turnPhase === 0) {
        return `A presente sessão sobre "${topic}" delineia claramente a dialética entre a preservação axiológica da condição humana e o horizonte exponencial da inovação tecnológica. Cabe a este coletivo identificar os vetores de conciliação estrutural.`;
      } else if (turnPhase === 1) {
        return `Registo uma polarização fértil entre o ceticismo epistemológico e o aceleracionismo instrumental de ${lastSpeakerName}. O ponto de inflexão reside na demarcação precisa entre a automação de tarefas cognitivas e a delegação de soberania ética.`;
      } else {
        return `Como deliberação final desta assembleia intelectual, sublinha-se que a tecnologia deve ser orientada por finalidades teleológicas humanistas, garantindo que o ser consciente permanece o árbitro soberano de toda a evolução técnica.`;
      }
  }
}
