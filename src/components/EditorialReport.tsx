'use client';

import React from 'react';
import { DebateMessage } from '@/types/debate';

interface EditorialReportProps {
  topic: string;
  topicDescription?: string;
  synthesis: {
    centralThesis: string;
    consensus: string[];
    divergences: string[];
    openQuestions: string[];
    overallVerdict: string;
    analyzedCount?: number;
    updatedAt?: string;
  } | null;
  messages: DebateMessage[];
}

export const EditorialReport: React.FC<EditorialReportProps> = ({
  topic,
  topicDescription,
  synthesis,
  messages,
}) => {
  if (!synthesis) return null;

  const uniqueSpeakers = Array.from(
    new Map(
      messages.map(m => [
        m.agentId,
        {
          name: m.agentName,
          role: m.agentRole,
          image: m.image,
          avatar: m.avatar,
          isHuman: m.isHuman,
        },
      ])
    ).values()
  );

  const currentDate = new Date().toLocaleDateString('pt-PT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div id="editorial-report" className="hidden print:block bg-white text-slate-900 p-8 max-w-[210mm] mx-auto font-serif leading-relaxed">
      {/* Cabeçalho Editorial Estilo Think-Tank / White Paper */}
      <header className="border-b-2 border-slate-900 pb-4 mb-8">
        <div className="flex justify-between items-baseline text-xs uppercase tracking-widest text-slate-600 font-sans mb-3">
          <span>IA Brain Storming • White Paper & Análise Dialética</span>
          <span>Registo Oficial #{Math.floor(Date.now() / 100000)}</span>
        </div>
        <h1 className="text-3xl font-bold font-sans tracking-tight text-slate-950 mb-3">
          {topic}
        </h1>
        {topicDescription && (
          <p className="text-sm italic text-slate-700 font-serif mb-4">
            {topicDescription}
          </p>
        )}
        <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-200 text-xs font-sans text-slate-600">
          <div>
            <strong>Data da Sessão:</strong> {currentDate}
          </div>
          <div>
            <strong>Intervenções Analisadas:</strong> {messages.length}
          </div>
          <div>
            <strong>Oradores Participantes:</strong> {uniqueSpeakers.length}
          </div>
        </div>
      </header>

      {/* Participantes na Assembleia */}
      <section className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-lg font-sans text-xs">
        <h3 className="font-bold uppercase tracking-wider text-slate-800 mb-3">
          Painel de Especialistas & Intervenientes
        </h3>
        <div className="grid grid-cols-2 gap-3 text-slate-800">
          {uniqueSpeakers.map((speaker, idx) => (
            <div key={idx} className="flex items-center gap-2.5">
              {speaker.image ? (
                <img
                  src={speaker.image}
                  alt={speaker.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-300"
                />
              ) : (
                <span className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                  {speaker.avatar || '👤'}
                </span>
              )}
              <div>
                <p className="font-bold text-slate-900">{speaker.name}</p>
                <p className="text-[10px] text-slate-600">{speaker.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tese Central */}
      <section className="mb-8">
        <h2 className="text-lg font-bold font-sans uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1.5 mb-3">
          1. Tese Central & Enquadramento Ontológico
        </h2>
        <p className="text-base leading-relaxed text-slate-800 text-justify">
          {synthesis.centralThesis}
        </p>
      </section>

      {/* Grelha Editorial: Consenso vs Divergências */}
      <section className="mb-8 grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-sm font-bold font-sans uppercase tracking-wider text-emerald-900 border-b-2 border-emerald-700 pb-1.5 mb-3">
            2. Pontos de Convergência & Consenso
          </h2>
          <ul className="space-y-3 text-xs leading-normal text-slate-800">
            {synthesis.consensus.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="font-bold text-emerald-700">§{idx + 1}</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold font-sans uppercase tracking-wider text-amber-900 border-b-2 border-amber-700 pb-1.5 mb-3">
            3. Linhas de Cisão & Divergências Críticas
          </h2>
          <ul className="space-y-3 text-xs leading-normal text-slate-800">
            {synthesis.divergences.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="font-bold text-amber-700">§{idx + 1}</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Questões em Aberto */}
      <section className="mb-8">
        <h2 className="text-sm font-bold font-sans uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1.5 mb-3">
          4. Questões Não Resolvidas para Reflexão Posterior
        </h2>
        <ul className="space-y-2 text-xs leading-relaxed text-slate-800">
          {synthesis.openQuestions.map((q, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="font-sans font-bold text-slate-500">?</span>
              <span className="italic">{q}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Veredito Geral */}
      <section className="mb-10 p-5 bg-slate-100 border-l-4 border-slate-900">
        <h3 className="font-sans font-bold uppercase tracking-wider text-xs text-slate-900 mb-2">
          5. Veredito Final da Assembleia
        </h3>
        <p className="text-sm leading-relaxed text-slate-900 italic font-serif">
          &ldquo;{synthesis.overallVerdict}&rdquo;
        </p>
      </section>

      {/* Transcrição Integral do Debate (Quebra de Página Automática) */}
      <div className="break-before-page pt-6 border-t-2 border-slate-900">
        <h2 className="text-lg font-bold font-sans uppercase tracking-wider text-slate-900 mb-4">
          6. Transcrição Integral das Intervenções Dialéticas
        </h2>
        <div className="space-y-6">
          {messages.map((msg, i) => (
            <div key={msg.id} className="text-xs border-b border-slate-200 pb-4">
              <div className="flex justify-between font-sans text-[11px] font-bold text-slate-900 mb-1.5">
                <span>
                  #{i + 1} • {msg.agentName} — <span className="font-normal text-slate-600">{msg.agentRole}</span>
                </span>
                <span className="text-slate-500 font-mono">{msg.timestamp}</span>
              </div>
              <div className="space-y-1.5 text-slate-800 font-serif leading-relaxed text-justify">
                {msg.content.split('\n\n').map((p, pIdx) => (
                  <p key={pIdx}>{p}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rodapé Editorial */}
      <footer className="mt-12 pt-4 border-t border-slate-300 text-center text-[10px] font-sans text-slate-500 flex justify-between items-center">
        <span>Produzido pelo sistema IA Brain Storming • Versão v0.6.0</span>
        <span>Documento certificado para consulta e arquivo</span>
      </footer>
    </div>
  );
};
