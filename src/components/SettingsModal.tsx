'use client';

import React, { useState } from 'react';
import { X, Key, ShieldCheck, Cpu, ExternalLink } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
}) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveApiKey(inputKey.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Cabeçalho */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Configuração de Motores de IA
              </h3>
              <p className="text-[11px] text-slate-400">
                OpenRouter API & Privacidade Local-First
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

        {/* Corpo */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
              <span>Chave de API OpenRouter</span>
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                Obter chave no OpenRouter <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </label>
            <input
              type="password"
              value={inputKey}
              onChange={e => setInputKey(e.target.value)}
              placeholder="sk-or-v1-xxxxxxxxxxxxxxxx..."
              className="w-full h-11 px-3.5 rounded-xl bg-slate-950 border border-slate-700/80 focus:border-indigo-500 font-mono text-xs text-white placeholder:text-slate-600 outline-none"
            />
            <p className="text-[11px] text-slate-400 leading-relaxed">
              A tua chave é guardada <strong>exclusivamente no teu browser local</strong> e nunca sai da tua máquina para servidores de terceiros.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2.5">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              <span>Multi-Modelos Conectados</span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-1">
              <p>• <strong>Dr. Marcus:</strong> Claude 3.5 Sonnet (Anthropic)</p>
              <p>• <strong>Dra. Helena:</strong> DeepSeek V3 (DeepSeek)</p>
              <p>• <strong>Aura Chen:</strong> GPT-4o (OpenAI)</p>
              <p>• <strong>Kaelen Voss:</strong> Llama 3.3 70B (Meta)</p>
              <p>• <strong>Sophia Veris:</strong> Gemini 2.0 Flash (Google)</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Se não inserires chave, o motor dialético simulado assegura o debate.</span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shadow-md shadow-indigo-600/20"
            >
              {savedSuccess ? 'Guardado com Sucesso!' : 'Guardar Chave'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
