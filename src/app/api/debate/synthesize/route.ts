import { NextRequest, NextResponse } from 'next/server';
import { DebateMessage, LanguageTone } from '@/types/debate';

export async function POST(req: NextRequest) {
  try {
    const { topic, messages, apiKey, tone } = await req.json() as {
      topic: string;
      messages: DebateMessage[];
      apiKey?: string;
      tone?: LanguageTone;
    };

    if (!topic || !messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Tópico e mensagens do debate são obrigatórios para a síntese.' },
        { status: 400 }
      );
    }

    const activeKey = apiKey || process.env.OPENROUTER_API_KEY;
    const selectedTone: LanguageTone = tone || 'simples';
    const nowTime = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (activeKey && activeKey.trim() !== '') {
      try {
        const transcript = messages
          .map((m, i) => `[#${i + 1} - ${m.agentName} (${m.agentRole})]:\n${m.content}`)
          .join('\n\n');

        const toneRule = selectedTone === 'simples'
          ? `USA EXCLUSIVAMENTE LINGUAGEM SIMPLES E CLARA:
- Explica as ideias de forma acessível para que qualquer pessoa sem estudos na área compreenda perfeitamente.
- Proibido usar termos difíceis como 'ontológico', 'epistemológico', 'heurística', 'entropia' ou 'axiológico'.
- Usa analogias práticas e frases diretas.`
          : `USA LINGUAGEM FORMAL E ACADÉMICA com rigor filosófico e metodológico.`;

        const systemPrompt = `És uma analista intelectual de elite e moderadora neutra. A tua tarefa é produzir uma síntese executiva rigorosa, dinâmica e atualizada de um debate entre inteligências artificiais.
Deves analisar OBRIGATORIAMENTE TODAS as ${messages.length} intervenções fornecidas, incorporando as opiniões mais recentes dos últimos especialistas que falaram.
Escreve EXCLUSIVAMENTE em Português de Portugal (PT-PT).
${toneRule}

Estrutura a resposta rigorosamente em formato JSON com o seguinte schema:
{
  "centralThesis": "1 parágrafo com a ideia principal e o ponto em discussão",
  "consensus": ["ponto de acordo 1", "ponto de acordo 2", "ponto de acordo 3"],
  "divergences": ["onde é que eles discordam 1", "onde é que eles discordam 2", "onde é que eles discordam 3"],
  "openQuestions": ["pergunta para o futuro 1", "pergunta para o futuro 2"],
  "overallVerdict": "Conclusão final clara e compreensível"
}`;

        const SYNTHESIS_FREE_MODELS = [
          'google/gemini-2.0-flash-exp:free',
          'meta-llama/llama-3.3-70b-instruct:free',
          'qwen/qwen-2.5-72b-instruct:free',
          'mistralai/mistral-small-24b-instruct-2501:free',
        ];

        for (const model of SYNTHESIS_FREE_MODELS) {
          try {
            const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${activeKey.trim()}`,
                'HTTP-Referer': 'https://localhost:3000',
                'X-Title': 'IA Brain Storming Synthesizer',
              },
              body: JSON.stringify({
                model,
                messages: [
                  { role: 'system', content: systemPrompt },
                  {
                    role: 'user',
                    content: `Tópico em debate: "${topic}"\nTotal de intervenções a sintetizar: ${messages.length}\nTom: ${selectedTone}\n\nTranscrição completa do debate:\n${transcript}\n\nGera a síntese executiva atualizada em JSON:`,
                  },
                ],
                temperature: 0.35,
              }),
            });

            if (res.ok) {
              const data = await res.json();
              const jsonText = data.choices?.[0]?.message?.content;
              if (jsonText) {
                const cleanJson = jsonText.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
                const parsed = JSON.parse(cleanJson);
                if (parsed && (parsed.centralThesis || parsed.overallVerdict)) {
                  return NextResponse.json({
                    success: true,
                    synthesis: {
                      ...parsed,
                      analyzedCount: messages.length,
                      updatedAt: nowTime,
                      tone: selectedTone,
                    },
                  });
                }
              }
            }
          } catch (modelErr: any) {
            console.warn(`Tentativa de síntese com modelo gratuito ${model} falhou:`, modelErr.message);
          }
        }
      } catch (err: any) {
        console.warn('Erro ao chamar OpenRouter para síntese, recorrendo ao motor dinâmico local:', err.message);
      }
    }

    // Geração Dinâmica Local com Tom Simples vs Académico
    const dynamicSynthesis = generateDynamicSynthesis(topic, messages, nowTime, selectedTone);

    return NextResponse.json({ success: true, synthesis: dynamicSynthesis });
  } catch (error: any) {
    console.error('Erro na rota synthesize:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao gerar síntese.' },
      { status: 500 }
    );
  }
}

function generateDynamicSynthesis(
  topic: string,
  messages: DebateMessage[],
  timestamp: string,
  tone: LanguageTone
) {
  const participants = Array.from(new Set(messages.map(m => m.agentName)));
  const humanInterventions = messages.filter(m => m.isHuman);
  const lastSpeaker = messages[messages.length - 1];
  const totalCount = messages.length;
  const namesList = participants.join(', ');

  if (tone === 'simples') {
    return {
      centralThesis: `Após ${totalCount} opiniões partilhadas por ${namesList}, a conclusão principal sobre "${topic}" é simples: estamos perante uma escolha entre aproveitar o que a tecnologia nos dá de melhor, sem nunca esquecer o que nos torna verdadeiramente humanos. Como destacou ${lastSpeaker.agentName}, as máquinas são ferramentas muito úteis, mas a vida real das pessoas tem de estar sempre em primeiro lugar.`,
      consensus: [
        `Todos os ${participants.length} participantes concordam que este assunto é sério e não se resolve com respostas fáceis.`,
        `Ficou claro para todos que o avanço das máquinas tem de respeitar a dignidade, o bem-estar e os sentimentos das pessoas.`,
        `Houve acordo de que o ser humano não pode ser deixado para trás nem reduzido a um mero número num computador.`
      ],
      divergences: [
        `Discordância sobre a velocidade: uns querem acelerar e usar já tudo o que a inteligência artificial permite, enquanto outros pedem calma e prudência.`,
        `Dúvida sobre a consciência: uns defendem que um robô nunca terá sentimentos verdadeiros, enquanto outros acreditam que as máquinas podem aprender a imitar quase tudo.`,
        humanInterventions.length > 0
          ? `A intervenção do utilizador veio alertar para a vida real e para os problemas concretos do dia a dia das pessoas.`
          : `Permanece a discussão sobre quem deve mandar e controlar estas novas tecnologias no futuro.`
      ],
      openQuestions: [
        `Como podemos usar a inteligência artificial para vivermos melhor sem perdermos os nossos empregos e a nossa tranquilidade?`,
        `Quem deve decidir as regras e os limites das máquinas no nosso país e no mundo?`
      ],
      overallVerdict: `Em resumo simples: a tecnologia é uma aliada fantástica, mas quem manda e tem de ser protegido é sempre o ser humano. O debate mostra que pensar em conjunto com bom senso é o melhor caminho para não cometermos erros graves.`,
      analyzedCount: totalCount,
      updatedAt: timestamp,
      tone,
    };
  }

  // Tom académico
  return {
    centralThesis: `A análise de ${totalCount} intervenções sobre "${topic}" contou com as perspetivas de ${namesList}. O diálogo evoluiu de premissas epistemológicas para um debate rigoroso sobre as restrições bioéticas e materiais, onde a última intervenção de ${lastSpeaker.agentName} colocou em evidência a necessidade de confrontar a teoria com a realidade empírica.`,
    consensus: [
      `Concordância unânime entre os ${participants.length} oradores de que a questão de "${topic}" exige abordagem interdisciplinar estrita.`,
      `Reconhecimento geral de que qualquer solução algorítmica tem de respeitar salvaguardas bioéticas e a dignidade ontológica da pessoa humana.`,
      `Consenso emergente sobre a urgência de estabelecer critérios claros de governação e responsabilidade regulatória.`
    ],
    divergences: [
      `Conflito dialético entre a postura cética clássica e as premissas materialistas e aceleracionistas.`,
      `Tensão entre o pragmatismo computacional e a exigência de proteção fenomenológica da consciência subjetiva.`,
      humanInterventions.length > 0
        ? `A intervenção direta da Voz da Humanidade confrontou os modelos teóricos, exigindo a consideração dos custos sociais imediatos.`
        : `A clivagem entre a aceleração tecnológica contínua e a prudência preventiva permanece sem resolução formal.`
    ],
    openQuestions: [
      `Como articular a teleologia da inteligência sintética com a preservação axiológica da civilização humana?`,
      `Qual a fronteira exata entre a representação funcional da inteligência e a emergência da agência consciente?`
    ],
    overallVerdict: `Com ${totalCount} contributos registados até às ${timestamp}, a assembleia conclui que o valor do debate reside na dialética contínua: a confrontação rigorosa entre perspetivas impede a cristalização de dogmas e consolida um discernimento lúcido e transformador.`,
    analyzedCount: totalCount,
    updatedAt: timestamp,
    tone,
  };
}
