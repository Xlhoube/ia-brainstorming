import { Agent, DebateMessage, DebateStage, PodcastChapter, PodcastEpisode, SynthesisResult } from '@/types/debate';

/**
 * Serviço de Produção e Exportação de Podcast (The Five Podcast Studio)
 * Gera guiões de produção para broadcast e ficheiros de áudio WAV masterizados localmente.
 */

/**
 * Constrói o guião completo de transmissão em formato Markdown de estúdio
 */
export function generatePodcastScript(
  topic: string,
  topicDescription: string,
  messages: DebateMessage[],
  agents: Agent[],
  synthesis?: SynthesisResult | null
): string {
  const dateStr = new Date().toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const agentMap = new Map<string, Agent>();
  agents.forEach(a => agentMap.set(a.id, a));

  let script = `# 🎙️ THE FIVE PODCAST — EPISÓDIO DIALÉTICO\n`;
  script += `**Tema:** ${topic}\n`;
  script += `**Data de Gravação:** ${dateStr}\n`;
  script += `**Descrição:** ${topicDescription || 'Debate dialético aprofundado com os 5 arquétipos cognitivos.'}\n\n`;

  script += `## 👥 Painel de Debatedores\n`;
  agents.forEach(agent => {
    script += `- **${agent.name}** (${agent.roleTitle}) — *Temperamento: ${agent.personality?.temperament || agent.stanceDescription}*\n`;
  });
  script += `\n---\n\n`;

  script += `## 🎵 [00:00] INTRODUÇÃO & VINHETA DE ABERTURA\n`;
  script += `*(Música tema de abertura: acordes dialéticos progressivos em fade out)*\n\n`;
  script += `**Narrador:** Bem-vindos a mais uma sessão de inteligência dialética do The Five. Hoje colocamos em confronto direto as mentes mais aguçadas para dissecar: "${topic}".\n\n`;

  // Capítulos e Mensagens
  let currentSec = 15; // Início após jingle
  let currentStage = '';

  messages.forEach((msg) => {
    const agent = agentMap.get(msg.agentId);
    const agentName = agent ? agent.name : (msg.agentRole === 'human' ? 'Intervenção Humana' : 'Debatedor');
    const role = agent ? agent.roleTitle : '';
    const stageTitle = msg.stageName || msg.stage;

    if (stageTitle && stageTitle !== currentStage) {
      currentStage = stageTitle;
      const mins = Math.floor(currentSec / 60).toString().padStart(2, '0');
      const secs = (currentSec % 60).toString().padStart(2, '0');
      script += `\n### ⏱️ [${mins}:${secs}] CAPÍTULO: ${currentStage.toUpperCase()}\n\n`;
    }

    const mins = Math.floor(currentSec / 60).toString().padStart(2, '0');
    const secs = (currentSec % 60).toString().padStart(2, '0');

    script += `**[${mins}:${secs}] ${agentName}** ${role ? `*(${role})*` : ''}:\n`;
    script += `> ${msg.content.replace(/\n/g, '\n> ')}\n\n`;

    // Estima ~120 palavras por minuto (2 palavras por segundo)
    const wordCount = msg.content.trim().split(/\s+/).length;
    const estimatedDuration = Math.max(4, Math.round(wordCount / 2.2));
    currentSec += estimatedDuration;
  });

  if (synthesis) {
    const mins = Math.floor(currentSec / 60).toString().padStart(2, '0');
    const secs = (currentSec % 60).toString().padStart(2, '0');
    script += `\n## 🏁 [${mins}:${secs}] SÍNTESE & CONSENSO FINAL\n\n`;
    script += `**Relatório de Conclusão:**\n`;
    const summaryText = synthesis.consensusSummary || synthesis.overallVerdict;
    script += `> ${summaryText.replace(/\n/g, '\n> ')}\n\n`;

    if (synthesis.practicalRecommendations && synthesis.practicalRecommendations.length > 0) {
      script += `### Recomendações Práticas:\n`;
      synthesis.practicalRecommendations.forEach((rec: string, i: number) => {
        script += `${i + 1}. ${rec}\n`;
      });
      script += `\n`;
    }
  }

  const finalMins = Math.floor((currentSec + 10) / 60).toString().padStart(2, '0');
  const finalSecs = ((currentSec + 10) % 60).toString().padStart(2, '0');
  script += `\n## 🎵 [${finalMins}:${finalSecs}] ENCERRAMENTO\n`;
  script += `**Narrador:** E assim concluímos este episódio. Os agentes integraram as suas aprendizagens na memória persistente. Até à próxima sessão de confronto de ideias.\n`;
  script += `*(Vinheta de fecho com fade out suave)*\n`;

  return script;
}

/**
 * Gera capítulos detalhados com timestamps para audição ou podcasting
 */
export function generatePodcastChapters(
  messages: DebateMessage[],
  stages: DebateStage[]
): PodcastChapter[] {
  const chapters: PodcastChapter[] = [
    {
      title: 'Abertura & Apresentação do Desafio',
      startTimeSec: 0,
      speaker: 'Narrador',
      stage: 'Introdução',
    },
  ];

  let currentSec = 15;
  let lastStage = '';

  messages.forEach(msg => {
    const wordCount = msg.content.trim().split(/\s+/).length;
    const estimatedDuration = Math.max(4, Math.round(wordCount / 2.2));
    const stageTitle = msg.stageName || msg.stage;

    if (stageTitle && stageTitle !== lastStage) {
      lastStage = stageTitle;
      chapters.push({
        title: `Etapa: ${stageTitle}`,
        startTimeSec: currentSec,
        stage: stageTitle,
      });
    }

    currentSec += estimatedDuration;
  });

  chapters.push({
    title: 'Síntese & Deliberação Final',
    startTimeSec: currentSec,
    speaker: 'Aura Chen / The Five',
    stage: 'Síntese',
  });

  return chapters;
}

/**
 * Cria um ficheiro de áudio WAV (PCM 16-bit estéreo 44.1kHz) puro com jingle harmónico
 * e modulação harmónica estéreo de abertura e encerramento para o episódio de podcast.
 */
export function generatePodcastIntroWavBlob(durationSeconds: number = 8): Blob {
  const sampleRate = 44100;
  const numChannels = 2;
  const numSamples = Math.floor(sampleRate * durationSeconds);
  const bytesPerSample = 2; // 16-bit PCM
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = numSamples * blockAlign;
  const bufferSize = 44 + dataSize;

  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);

  // Escrever cabeçalho RIFF
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Tamanho subchunk fmt
  view.setUint16(20, 1, true); // PCM Format = 1
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // Bits por amostra
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Síntese harmónica aditiva (Acorde dialético The Five: C4 -> E4 -> G4 -> B4 -> D5 com envelope ADSR)
  const frequencies = [261.63, 329.63, 392.0, 493.88, 587.33];

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    
    // Envelope global de amplitude: ataque suave, sustentação e fade-out no final
    let envelope = 1.0;
    if (t < 0.8) {
      envelope = t / 0.8; // Fade in
    } else if (t > durationSeconds - 1.5) {
      envelope = Math.max(0, (durationSeconds - t) / 1.5); // Fade out
    }

    // Gerar oscilações harmónicas
    let leftSample = 0;
    let rightSample = 0;

    frequencies.forEach((freq, idx) => {
      // Arpejo subtil baseado no tempo
      const noteDelay = idx * 0.45;
      if (t >= noteDelay) {
        const localT = t - noteDelay;
        const decay = Math.exp(-localT * 0.7);
        const osc = Math.sin(2 * Math.PI * freq * t) * decay;
        
        // Panning estéreo para cada voz/frequência
        const pan = (idx / (frequencies.length - 1)) * 0.8 - 0.4;
        leftSample += osc * (0.5 - pan * 0.5);
        rightSample += osc * (0.5 + pan * 0.5);
      }
    });

    // Pulso rítmico ambiente (batimento binaural a 4Hz para foco dialético)
    const binauralBeat = Math.sin(2 * Math.PI * 4 * t) * 0.08;
    leftSample += binauralBeat;
    rightSample += binauralBeat;

    // Normalização e clipping guard
    const mixedLeft = Math.max(-1, Math.min(1, leftSample * envelope * 0.6));
    const mixedRight = Math.max(-1, Math.min(1, rightSample * envelope * 0.6));

    // Converter para 16-bit PCM (-32768 a 32767)
    const intLeft = Math.floor(mixedLeft * 32767);
    const intRight = Math.floor(mixedRight * 32767);

    view.setInt16(offset, intLeft, true);
    view.setInt16(offset + 2, intRight, true);
    offset += 4;
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

/**
 * Descarrega ficheiro Blob no navegador
 */
export function downloadBlob(blob: Blob, filename: string): void {
  if (typeof window === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/**
 * Descarrega ficheiro de guião em formato Markdown
 */
export function exportPodcastMarkdown(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  downloadBlob(blob, filename);
}
