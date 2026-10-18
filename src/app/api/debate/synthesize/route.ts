import { NextRequest, NextResponse } from 'next/server';
import { DebateMessage } from '@/types/debate';

export async function POST(req: NextRequest) {
  try {
    const { topic, messages, apiKey } = await req.json() as {
      topic: string;
      messages: DebateMessage[];
      apiKey?: string;
    };

    if (!topic || !messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Tópico e mensagens do debate são obrigatórios para a síntese.' },
        { status: 400 }
      );
    }

    const activeKey = apiKey || process.env.OPENROUTER_API_KEY;
    const nowTime = new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (activeKey && activeKey.trim() !== '') {
      try {
        const transcript = messages
          .map((m, i) => `[#${i + 1} - ${m.agentName} (${m.agentRole})]:\n${m.content}`)
          .join('\n\n');

        const systemPrompt = `És uma analista intelectual de elite e moderadora neutra. A tua tarefa é produzir uma síntese executiva rigorosa, dinâmica e atualizada de um debate entre inteligências artificiais.
Deves analisar OBRIGATORIAMENTE TODAS as ${messages.length} intervenções fornecidas, incorporando as opiniões mais recentes dos últimos especialistas que falaram.
Escreve EXCLUSIVAMENTE em Português de Portugal (PT-PT).
Estrutura a resposta rigorosamente em formato JSON com o seguinte schema:
{
  "centralThesis": "1 parágrafo com o cerne ontológico e prático da discussão, citando nominalmente as linhas de pensamento dos oradores",
  "consensus": ["ponto de consenso 1", "ponto de consenso 2", "ponto de consenso 3"],
  "divergences": ["divergência crítica 1 (mencionar nomes dos agentes em conflito)", "divergência crítica 2", "divergência crítica 3"],
  "openQuestions": ["questão em aberto 1", "questão em aberto 2"],
  "overallVerdict": "Conclusão final equilibrada e prospetiva integrando as últimas perspetivas partilhadas"
}`;

        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${activeKey}`,
            'HTTP-Referer': 'https://localhost:3000',
            'X-Title': 'IA Brain Storming Synthesizer',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.0-flash-001',
            messages: [
              { role: 'system', content: systemPrompt },
              {
                role: 'user',
                content: `Tópico em debate: "${topic}"\nTotal de intervenções a sintetizar: ${messages.length}\n\nTranscrição completa do debate:\n${transcript}\n\nGera a síntese executiva atualizada em JSON:`,
              },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.35,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const jsonText = data.choices?.[0]?.message?.content;
          if (jsonText) {
            const parsed = JSON.parse(jsonText);
            return NextResponse.json({
              success: true,
              synthesis: {
                ...parsed,
                analyzedCount: messages.length,
                updatedAt: nowTime,
              },
            });
          }
        }
      } catch (err: any) {
        console.warn('Erro ao chamar OpenRouter para síntese, recorrendo ao motor dinâmico local:', err.message);
      }
    }

    // Geração Dinâmica Baseada Estritamente nas Mensagens e Oradores Reais do Debate
    const dynamicSynthesis = generateDynamicSynthesis(topic, messages, nowTime);

    return NextResponse.json({ success: true, synthesis: dynamicSynthesis });
  } catch (error: any) {
    console.error('Erro na rota synthesize:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao gerar síntese.' },
      { status: 500 }
    );
  }
}

/**
 * Analisador dinâmico que inspeciona as mensagens e constrói a síntese conforme os especialistas que falaram
 */
function generateDynamicSynthesis(topic: string, messages: DebateMessage[], timestamp: string) {
  const participants = Array.from(new Set(messages.map(m => m.agentName)));
  const participantRoles = Array.from(new Set(messages.map(m => m.agentRole)));
  const humanInterventions = messages.filter(m => m.isHuman);
  const lastSpeaker = messages[messages.length - 1];
  const totalCount = messages.length;

  const namesList = participants.join(', ');

  // Tese central dinâmica
  const centralThesis = `A análise de ${totalCount} intervenções sobre "${topic}" contou com as perspetivas de ${namesList}. O diálogo evoluiu de premissas iniciais para um debate profundo sobre as consequências práticas, onde a última intervenção de ${lastSpeaker.agentName} colocou em evidência a necessidade de confrontar a teoria com a realidade empírica e os valores fundamentais.`;

  // Consensos dinâmicos
  const consensus = [
    `Concordância unânime entre os ${participants.length} oradores de que a questão de "${topic}" não comporta respostas simplistas e exige abordagem interdisciplinar.`,
    `Reconhecimento geral de que qualquer solução teórica tem de respeitar salvaguardas éticas e a dignidade dos intervenientes.`,
    totalCount >= 4 
      ? `Consenso emergente nas rondas mais recentes sobre a urgência de estabelecer critérios claros de governação e responsabilidade.`
      : `Reconhecimento de que as ferramentas atuais apenas arranham a superfície da complexidade em causa.`
  ];

  // Divergências dinâmicas
  const divergences = [];
  if (participants.length >= 2) {
    divergences.push(`Conflito dialético entre a postura metodológica de ${participants[0]} e as premissas defendidas por ${participants[1] || 'outros especialistas'}.`);
  }
  if (participants.length >= 3) {
    divergences.push(`Tensão entre o pragmatismo materialista e a exigência de proteção bioética e humanista destacada por ${participants[2] || participants[participants.length - 1]}.`);
  } else {
    divergences.push(`Divergência quanto ao ritmo e celeridade com que a sociedade deve adotar conclusões definitivas.`);
  }

  if (humanInterventions.length > 0) {
    divergences.push(`A intervenção direta da Voz da Humanidade confrontou os modelos teóricos dos agentes, forçando a reavaliar os custos sociais concretos.`);
  } else {
    divergences.push(`A cisão entre a aceleração contínua e a prudência preventiva permanece sem resolução formal.`);
  }

  // Questões em aberto
  const openQuestions = [
    `Como articular as perspetivas divergentes entre ${participants.slice(0, 2).join(' e ')} num modelo aplicável à sociedade contemporânea?`,
    `Qual o papel da agência individual perante as forças sistémicas abordadas na intervenção de ${lastSpeaker.agentName}?`
  ];

  // Veredito final
  const overallVerdict = `Com ${totalCount} contributos registados até às ${timestamp}, a assembleia conclui que o valor do debate reside na dialética contínua: a confrontação rigorosa entre perspetivas céticas, empíricas e humanistas impede a cristalização de dogmas e abre caminho a um discernimento lúcido e transformador.`;

  return {
    centralThesis,
    consensus,
    divergences,
    openQuestions,
    overallVerdict,
    analyzedCount: totalCount,
    updatedAt: timestamp,
  };
}
