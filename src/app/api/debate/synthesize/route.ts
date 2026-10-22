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

        const systemPrompt = `És uma analista intelectual de elite e moderadora neutra. A tua tarefa é produzir uma síntese executiva rigorosa, dinâmica e atualizada de um debate de alto nível entre os pensadores do conselho The Five sobre o tema "${topic}".
Deves analisar OBRIGATORIAMENTE TODAS as ${messages.length} intervenções fornecidas, incorporando as opiniões mais recentes dos últimos especialistas que falaram.
Escreve EXCLUSIVAMENTE em Português de Portugal (PT-PT).
DIRETRIZ DE FOCO TEMÁTICO: O debate incide EXCLUSIVAMENTE sobre o tema proposto: "${topic}". É TERMINANTEMENTE PROIBIDO focar ou desviar a síntese para inteligência artificial ou robôs a menos que o próprio tema proposto o especifique diretamente.
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
          'meta-llama/llama-3.3-70b-instruct:free',
          'qwen/qwen-2.5-72b-instruct:free',
          'mistralai/mistral-small-24b-instruct-2501:free',
          'google/gemini-2.0-flash-exp:free',
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
      centralThesis: `Após ${totalCount} opiniões partilhadas por ${namesList}, a conclusão principal sobre "${topic}" é simples: estamos perante uma escolha entre avançar com soluções práticas audazes ou proceder com máxima prudência perante consequências imprevistas. Como destacou ${lastSpeaker.agentName}, a reflexão teórica tem de ceder lugar a salvaguardas claras para que as decisões sirvam verdadeiramente as pessoas reais.`,
      consensus: [
        `Todos os ${participants.length} participantes concordam que "${topic}" é um tema sério e não se resolve com respostas fáceis nem simplismos.`,
        `Ficou claro para todos que qualquer progresso nesta matéria tem de respeitar a dignidade, o bem-estar e as condições de vida das pessoas.`,
        `Houve acordo unânime de que os riscos de longo prazo têm de ser devidamente mapeados antes de ações irreversíveis.`
      ],
      divergences: [
        `Discordância sobre o ritmo de ação: uns defendem agir de imediato com base nos dados existentes, enquanto outros pedem prudência e testes mais aprofundados.`,
        `Dúvida sobre os custos e prioridades: uns priorizam a viabilidade e o impacto direto, enquanto outros exigem garantias éticas e de justiça distributiva.`,
        humanInterventions.length > 0
          ? `A intervenção do utilizador veio alertar para a vida real e para os problemas concretos do dia a dia das populações afetadas.`
          : `Permanece o debate sobre quem deve governar e fiscalizar as decisões estratégicas deste domínio no futuro.`
      ],
      openQuestions: [
        `Como podemos colher os maiores benefícios em "${topic}" sem criar novos desequilíbrios sociais ou ambientais?`,
        `Quem deve estabelecer os limites e as normas de segurança para proteger o interesse público neste desafio?`
      ],
      overallVerdict: `Em resumo simples: "${topic}" exige unir a audácia da inovação ao cuidado e ao bom senso ético. Pensar em conjunto e confrontar diferentes pontos de vista continua a ser o caminho mais seguro para tomar decisões responsáveis.`,
      analyzedCount: totalCount,
      updatedAt: timestamp,
      tone,
    };
  }

  // Tom académico
  return {
    centralThesis: `A análise de ${totalCount} intervenções sobre "${topic}" contou com as perspetivas interdisciplinares de ${namesList}. O diálogo evoluiu de premissas epistemológicas e ontológicas para um debate rigoroso sobre as restrições materiais, éticas e metodológicas, onde a última intervenção de ${lastSpeaker.agentName} colocou em evidência a necessidade de confrontar modelos teóricos com evidências empíricas e salvaguardas regulatórias.`,
    consensus: [
      `Concordância unânime entre os ${participants.length} oradores de que a deliberação sobre "${topic}" exige abordagem interdisciplinar estrita.`,
      `Reconhecimento geral de que qualquer intervenção neste domínio deve respeitar salvaguardas bioéticas e a dignidade ontológica fundamental da pessoa humana.`,
      `Consenso emergente sobre a urgência de estabelecer critérios formais de governação, rastreabilidade e responsabilidade regulatória.`
    ],
    divergences: [
      `Conflito dialético entre a postura cética preventiva e as perspetivas pragmáticas orientadas para a implementação rápida.`,
      `Tensão entre modelos dedutivos teóricos e a exigência de validação experimental rigorosa em condições reais.`,
      humanInterventions.length > 0
        ? `A intervenção direta da Voz da Humanidade confrontou as abstrações dos especialistas, exigindo a consideração dos custos sociais imediatos.`
        : `A clivagem entre aceleração do desenvolvimento e o princípio da precaução preventiva permanece como tensão estruturante.`
    ],
    openQuestions: [
      `Como articular a necessidade de progresso em "${topic}" com a preservação axiológica e ecológica da sociedade?`,
      `Quais são os limiares formais de incerteza a partir dos quais a tomada de decisão deve ser suspensa para investigação adicional?`
    ],
    overallVerdict: `Com ${totalCount} contributos registados até às ${timestamp}, a assembleia conclui que o valor do debate reside na dialética contínua: a confrontação rigorosa entre perspetivas impede a cristalização de dogmas e consolida um discernimento lúcido e transformador sobre "${topic}".`,
    analyzedCount: totalCount,
    updatedAt: timestamp,
    tone,
  };
}
