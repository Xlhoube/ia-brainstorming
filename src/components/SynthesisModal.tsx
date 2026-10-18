'use client';

import React, { useState } from 'react';
import { X, FileText, CheckCircle2, AlertCircle, HelpCircle, Award, Copy, Check, Download } from 'lucide-react';

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
  } | null;
}

export const SynthesisModal: React.FC<SynthesisModalProps> = ({
  isOpen,
  onClose,
  topic,
  synthesis,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !synthesis) return null;

  const handleCopyMarkdown = () => {
    const md = `# Relatório Executivo de Debate | IA Brain Storming
**Tema:** ${topic}
**Data:** ${new Date().toLocaleDateString('pt-PT')}

---

## 🏛️ Tese Central
${synthesis.centralThesis}

## ✅ Pontos de Consenso
${synthesis.consensus.map(c => `- ${c}`).join('\n')}

## ⚡ Divergências Críticas
${synthesis.divergences.map(d => `- ${d}`).join('\n')}

## ❓ Questões em Aberto
${synthesis.openQuestions.map(q => `- ${q}`).join('\n')}

## 🏆 Veredito Final & Perspetiva Prospetiva
${synthesis.overallVerdict}
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Síntese Dialética & Relatório Final
              </h3>
              <p className="text-[11px] text-slate-400 truncate max-w-md">
                Tema: {topic}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              title="Copiar em Markdown"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar Markdown'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Corpo com Scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Tese Central */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>Tese Central do Debate</span>
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
                <span>Pontos de Consenso</span>
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
                <span>Divergências Críticas</span>
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
              <span>Questões em Aberto para Reflexão Futura</span>
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
              Veredito Final da Assembleia de IA
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
