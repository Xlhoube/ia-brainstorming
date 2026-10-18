import { NextRequest, NextResponse } from 'next/server';
import { generateAgentResponse, extractDialecticalConclusion } from '@/lib/ai/openrouter';
import { Agent, DebateMessage, LanguageTone } from '@/types/debate';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agent, topic, topicDescription, allAgents, messages, apiKey, tone } = body as {
      agent: Agent;
      topic: string;
      topicDescription?: string;
      allAgents: Agent[];
      messages: DebateMessage[];
      apiKey?: string;
      tone?: LanguageTone;
    };

    if (!agent || !topic) {
      return NextResponse.json(
        { error: 'Agente e tópico são parâmetros obrigatórios.' },
        { status: 400 }
      );
    }

    const rawContent = await generateAgentResponse({
      agent,
      topic,
      topicDescription,
      allAgents: allAgents || [],
      messages: messages || [],
      apiKey,
      tone: tone || 'simples',
    });

    const { cleanText, dialecticalConclusion } = extractDialecticalConclusion(rawContent);

    const newMessage: DebateMessage = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      agentId: agent.id,
      agentName: agent.name,
      agentRole: agent.roleTitle,
      avatar: agent.avatar,
      image: agent.image,
      accentColor: agent.accentColor,
      content: cleanText,
      round: (messages && messages.length > 0 ? messages[messages.length - 1].round : 1),
      timestamp: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      dialecticalConclusion,
    };

    return NextResponse.json({
      success: true,
      message: newMessage,
      dialecticalConclusion,
    });
  } catch (error: any) {
    console.error('Erro na rota next-turn:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar intervenção do agente.' },
      { status: 500 }
    );
  }
}
