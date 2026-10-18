'use client';

import React, { useState } from 'react';
import { PRESET_TOPICS } from '@/lib/constants/topics';
import { PresetTopic } from '@/types/debate';
import { X, Sparkles, BookOpen, Check } from 'lucide-react';

interface TopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTopic: string;
  onSelectTopic: (topic: string, description: string) => void;
}

export const TopicModal: React.FC<TopicModalProps> = ({
  isOpen,
  onClose,
  currentTopic,
  onSelectTopic,
}) => {
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');

  if (!isOpen) return null;

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;
    onSelectTopic(customTitle.trim(), customDesc.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Cabeçalho */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Temas & Dilemas de Brainstorming
              </h3>
              <p className="text-[11px] text-slate-400">
                Seleciona uma questão existencial ou cria o teu próprio tema
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Criar Tópico Personalizado */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Criar Tópico Personalizado
              </h4>
            </div>
            <form onSubmit={handleApplyCustom} className="space-y-3">
              <div>
                <input
                  type="text"
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  placeholder="Escreve uma pergunta, teoria ou dilema provocatório..."
                  className="w-full h-10 px-3.5 rounded-lg bg-slate-900 border border-slate-700 focus:border-indigo-500 text-xs text-white placeholder:text-slate-500 outline-none"
                />
              </div>
              <div>
                <textarea
                  rows={2}
                  value={customDesc}
                  onChange={e => setCustomDesc(e.target.value)}
                  placeholder="Contexto opcional (ex: premissas a considerar, limites da discussão)..."
                  className="w-full p-3 rounded-lg bg-slate-900 border border-slate-700 focus:border-indigo-500 text-xs text-white placeholder:text-slate-500 outline-none resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={!customTitle.trim()}
                className="w-full h-9 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
              >
                Definir Este Tópico no Debate
              </button>
            </form>
          </div>

          {/* Temas Sugeridos */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Temas Predefinidos de Alto Impacto
            </h4>
            <div className="space-y-2.5">
              {PRESET_TOPICS.map(topicItem => {
                const isSelected = currentTopic === topicItem.title;

                return (
                  <button
                    key={topicItem.id}
                    onClick={() => {
                      onSelectTopic(topicItem.title, topicItem.description);
                      onClose();
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-indigo-950/30 border-indigo-500 ring-1 ring-indigo-500/50'
                        : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                            {topicItem.category}
                          </span>
                        </div>
                        <h5 className="text-sm font-bold text-slate-100">
                          {topicItem.title}
                        </h5>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {topicItem.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-slate-950 flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
