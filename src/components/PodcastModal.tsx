'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { X, Mic, Radio, Download, Copy, Check, Play, Pause, Disc3, Clock, Layers, Sparkles, FileText, Volume2 } from 'lucide-react';
import { Agent, DebateMessage, DebateStage, SynthesisResult } from '@/types/debate';
import { generatePodcastScript, generatePodcastChapters, generatePodcastIntroWavBlob, downloadBlob, exportPodcastMarkdown } from '@/lib/audio/podcastService';

interface PodcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  topicDescription: string;
  messages: DebateMessage[];
  agents: Agent[];
  stages: DebateStage[];
  synthesis: SynthesisResult | null;
}

export const PodcastModal: React.FC<PodcastModalProps> = ({
  isOpen,
  onClose,
  topic,
  topicDescription,
  messages,
  agents,
  stages,
  synthesis,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'chapters' | 'audio'>('audio');
  const [copiedScript, setCopiedScript] = useState(false);
  const [isPlayingJingle, setIsPlayingJingle] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Gera guião e capítulos
  const scriptContent = useMemo(() => {
    return generatePodcastScript(topic, topicDescription, messages, agents, synthesis);
  }, [topic, topicDescription, messages, agents, synthesis]);

  const chapters = useMemo(() => {
    return generatePodcastChapters(messages, stages);
  }, [messages, stages]);

  // Criação do Blob de áudio WAV para o jingle
  useEffect(() => {
    if (!isOpen) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlayingJingle(false);
      return;
    }

    try {
      const wavBlob = generatePodcastIntroWavBlob(8);
      const url = URL.createObjectURL(wavBlob);
      setAudioUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } catch (err) {
      console.error('Erro ao gerar áudio WAV:', err);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleJingle = () => {
    if (!audioRef.current) {
      if (audioUrl) {
        audioRef.current = new Audio(audioUrl);
        audioRef.current.onended = () => setIsPlayingJingle(false);
      }
    }

    if (audioRef.current) {
      if (isPlayingJingle) {
        audioRef.current.pause();
        setIsPlayingJingle(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlayingJingle(true);
        }).catch(err => {
          console.error('Erro na reprodução de áudio:', err);
          setIsPlayingJingle(false);
        });
      }
    }
  };

  const handleDownloadWav = () => {
    const wavBlob = generatePodcastIntroWavBlob(8);
    const safeTopic = topic.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 30);
    downloadBlob(wavBlob, `the_five_jingle_${safeTopic}.wav`);
  };

  const handleDownloadScript = () => {
    const safeTopic = topic.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 30);
    exportPodcastMarkdown(scriptContent, `the_five_podcast_script_${safeTopic}.md`);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(scriptContent);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const totalDurationSec = chapters.length > 0 ? chapters[chapters.length - 1].startTimeSec + 30 : 120;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[90vh] bg-[#0c1222] border border-blue-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        role="dialog"
        aria-modal="true"
      >
        {/* Cabeçalho do Estúdio */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-blue-900/40 bg-gradient-to-r from-blue-950/60 via-indigo-950/40 to-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-indigo-400/30">
              <Mic className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  The Five Podcast Studio
                </h2>
                <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full">
                  Broadcast v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Geração de episódios dialéticos, masterização de áudio WAV e guiões canónicos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
            title="Fechar Estúdio"
            aria-label="Fechar Estúdio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Navegação de Separadores */}
        <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-800 bg-[#0f172a]/70">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('audio')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'audio'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Disc3 className="w-4 h-4" />
              Áudio & Masterização
            </button>
            <button
              onClick={() => setActiveTab('chapters')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'chapters'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Clock className="w-4 h-4" />
              Capítulos ({chapters.length})
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'preview'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              Guião de Produção
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyScript}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors"
            >
              {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedScript ? 'Copiado!' : 'Copiar Guião'}
            </button>
            <button
              onClick={handleDownloadScript}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Descarregar Guião (.md)
            </button>
          </div>
        </div>

        {/* Conteúdo Principal do Separador */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'audio' && (
            <div className="space-y-6">
              {/* Cartão de Masterização de Abertura */}
              <div className="p-5 rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-purple-950/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                    <Radio className="w-4 h-4 animate-pulse" />
                    Vinheta Temática Sintetizada (PCM 16-Bit)
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Acorde Dialético de Abertura & Transição
                  </h3>
                  <p className="text-xs text-slate-300 max-w-xl">
                    Sintetizado matematicamente através de modulação aditiva harmónica com os 5 timbres correspondentes aos arquétipos de The Five.
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={handleToggleJingle}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg ${
                      isPlayingJingle
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                    }`}
                  >
                    {isPlayingJingle ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                    {isPlayingJingle ? 'Pausar Vinheta' : 'Pré-escutar (8s)'}
                  </button>

                  <button
                    onClick={handleDownloadWav}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Descarregar .WAV
                  </button>
                </div>
              </div>

              {/* Informação do Episódio & Metadados */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
                  <span className="text-xs font-semibold text-slate-400 block mb-1">Duração Estimada</span>
                  <div className="text-2xl font-bold text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    {formatSeconds(totalDurationSec)}
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">Calculado com base em ~120 ppm</span>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
                  <span className="text-xs font-semibold text-slate-400 block mb-1">Intervenções Dialéticas</span>
                  <div className="text-2xl font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-400" />
                    {messages.length} Turnos
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">Distribuídos por {stages.length} etapas</span>
                </div>

                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
                  <span className="text-xs font-semibold text-slate-400 block mb-1">Painel Ativo</span>
                  <div className="text-2xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    {agents.length} Debatedores
                  </div>
                  <span className="text-xs text-slate-500 mt-1 block">Arquétipos cognitivos alinhados</span>
                </div>
              </div>

              {/* Resumo do Tema para Broadcast */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/30 space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Sinopse Oficial do Episódio
                </div>
                <h4 className="text-base font-semibold text-slate-100">{topic}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {topicDescription || 'Exploração dialética estruturada em 5 etapas fundamentais, confrontando dados empíricos, premissas de primeiro princípio e síntese executiva.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'chapters' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Capítulos automáticos formatados com marcadores de tempo para plataformas de Podcast (Spotify, Apple Podcasts, YouTube):
                </p>
              </div>

              <div className="space-y-2">
                {chapters.map((ch, idx) => (
                  <div 
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-between hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                        {formatSeconds(ch.startTimeSec)}
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-white">{ch.title}</div>
                        {ch.stage && (
                          <div className="text-xs text-slate-400">
                            Etapa do Protocolo: <span className="text-indigo-400">{ch.stage}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {ch.speaker && (
                      <span className="text-xs text-slate-400 px-2 py-1 rounded bg-slate-800 border border-slate-700">
                        {ch.speaker}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-800 bg-black/40 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto selection:bg-blue-600 selection:text-white">
                {scriptContent}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#0c1222] flex items-center justify-between">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            Compatível com formato broadcast WAV PCM 44.1kHz e guiões Markdown
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};
