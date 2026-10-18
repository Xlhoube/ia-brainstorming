import { NextRequest, NextResponse } from 'next/server';
import { generateAgentResponse } from '@/lib/ai/openrouter';
import { Agent, DebateMessage } from '@/types/debate';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agent, topic, topicDescription, allAgents, messages, apiKey } = body as {
      agent: Agent;
      topic: string;
      topicDescription?: string;
      allAgents: Agent[];
      messages: DebateMessage[];
      apiKey?: string;
    };

    if (!agent || !topic) {
      return NextResponse.json(
        { error: 'Agente e tópico são parâmetros obrigatórios.' },
        { status: 400 }
      );
    }

    const content = await generateAgentResponse({
      agent,
      topic,
      topicDescription,
      allAgents: allAgents || [],
      messages: messages || [],
      apiKey,
    });

    const newMessage: DebateMessage = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      agentId: agent.id,
      agentName: agent.name,
      agentRole: agent.roleTitle,
      avatar: agent.avatar,
      accentColor: agent.accentColor,
      content,
      round: (messages && messages.length > 0 ? messages[messages.length - 1].round : 1),
      timestamp: new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
    };

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error: any) {
    console.error('Erro na rota next-turn:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar intervenção do agente.' },
      { status: 500 }
    );
  }
}
