'use client';

import React, { useState } from 'react';
import { X, FileText, CheckCircle2, AlertCircle, HelpCircle, Award, Copy, Check, RefreshCw, Sparkles, Printer } from 'lucide-react';

interface SynthesisModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic: string;
  synthesis: {
    centralThesis: string;
    consensus: string[];
    divergences: string[];
    openQuestions: string[];
    overallVerdict: string;
    analyzedCount?: number;
    updatedAt?: string;
    tone?: 'simples' | 'academico';
  } | null;
  currentMessagesCount: number;
  onRefreshSynthesis: () => void;
  isSynthesizing: boolean;
}

export const SynthesisModal: React.FC<SynthesisModalProps> = ({
  isOpen,
  onClose,
  topic,
  synthesis,
  currentMessagesCount,
  onRefreshSynthesis,
  isSynthesizing,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !synthesis) return null;

  const analyzedCount = synthesis.analyzedCount || 0;
  const hasNewMessages = currentMessagesCount > analyzedCount;
  const isSimple = synthesis.tone === 'simples';

  const handleCopyMarkdown = () => {
    const md = `# Relatório Executivo de Debate | IA Brain Storming
**Tema:** ${topic}
**Tom:** ${isSimple ? 'Linguagem Simples & Acessível' : 'Linguagem Académica'}
**Intervenções Analisadas:** ${analyzedCount}
**Última Atualização:** ${synthesis.updatedAt || new Date().toLocaleTimeString('pt-PT')}

---

## 🏛️ Ideia Central
${synthesis.centralThesis}

## ✅ Pontos em Que Concordam
${synthesis.consensus.map(c => `- ${c}`).join('\n')}

## ⚡ Onde Discordam
${synthesis.divergences.map(d => `- ${d}`).join('\n')}

## ❓ Perguntas Para o Futuro
${synthesis.openQuestions.map(q => `- ${q}`).join('\n')}

## 🏆 Conclusão Final
${synthesis.overallVerdict}
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in no-print">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Síntese do Debate & Relatório
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                  {analyzedCount} opiniões
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${isSimple ? 'bg-amber-950/50 text-amber-300 border-amber-800/50' : 'bg-purple-950/50 text-purple-300 border-purple-800/50'}`}>
                  {isSimple ? 'Linguagem Simples' : 'Académica'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-md">
                Atualizada às {synthesis.updatedAt || 'tempo real'} • {topic}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Botão de Exportação em PDF com Design Editorial */}
            <button
              onClick={handlePrintPDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
              title="Exportar Relatório em PDF Editorial de Alta Fidelidade"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Exportar PDF</span>
            </button>

            <button
              onClick={onRefreshSynthesis}
              disabled={isSynthesizing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/50 hover:bg-indigo-900/50 border border-indigo-700/50 text-indigo-300 text-xs font-semibold transition-all shadow-sm"
              title="Recalcular síntese com as últimas mensagens do debate"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSynthesizing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isSynthesizing ? 'A recalcular...' : 'Recalcular'}</span>
            </button>

            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              title="Copiar em Markdown"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copiado' : 'Copiar'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Alerta de Novas Intervenções Disponíveis */}
        {hasNewMessages && (
          <div className="bg-amber-950/40 border-b border-amber-800/50 px-6 py-2.5 flex items-center justify-between gap-3 text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                Surgiram <strong>{currentMessagesCount - analyzedCount} novas opiniões</strong> no debate após esta síntese ter sido gerada.
              </span>
            </div>
            <button
              onClick={onRefreshSynthesis}
              disabled={isSynthesizing}
              className="px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition-colors flex-shrink-0"
            >
              {isSynthesizing ? 'A atualizar...' : 'Atualizar Síntese'}
            </button>
          </div>
        )}

        {/* Corpo com Scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Tese Central */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>{isSimple ? 'A Ideia Principal Deste Debate' : 'Tese Central & Enquadramento'}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
              {synthesis.centralThesis}
            </p>
          </div>

          {/* Duas Colunas: Consenso vs Divergências */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Consenso */}
            <div className="p-4 rounded-xl bg-emerald-950/15 border border-emerald-900/40 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSimple ? 'Em Que Pontos Todos Concordam?' : 'Pontos de Consenso'}</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {synthesis.consensus.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Divergências */}
            <div className="p-4 rounded-xl bg-amber-950/15 border border-amber-900/40 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <AlertCircle className="w-4 h-4" />
                <span>{isSimple ? 'Onde É Que Eles Discordam?' : 'Divergências Críticas Entre Especialistas'}</span>
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                {synthesis.divergences.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-400 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Questões em Aberto */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>{isSimple ? 'Perguntas Para Continuarmos a Pensar' : 'Questões em Aberto para Reflexão'}</span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {synthesis.openQuestions.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">?</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Veredito Geral */}
          <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-800/40 space-y-2">
            <span className="text-indigo-400 text-xs font-bold uppercase tracking-wider">
              {isSimple ? 'Resumo Final em Português Claro' : 'Veredito Final da Assembleia de IA'}
            </span>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
              &ldquo;{synthesis.overallVerdict}&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
