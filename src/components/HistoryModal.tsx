'use client';

import React, { useState, useEffect } from 'react';
import { LocalDatabase, SavedDebateSession } from '@/lib/db/localDatabase';
import { AppwriteDatabaseService } from '@/lib/appwrite/databaseService';
import { X, History, Trash2, ArrowRight, MessageSquare, Calendar, Award, Cloud } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSession: (session: SavedDebateSession) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  onLoadSession,
}) => {
  const [sessions, setSessions] = useState<SavedDebateSession[]>([]);
  const [isLoadingCloud, setIsLoadingCloud] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Carregamento instantâneo do cache local
      setSessions(LocalDatabase.listSessions());

      // Sincronização em segundo plano com Appwrite Cloud
      setIsLoadingCloud(true);
      AppwriteDatabaseService.listSessions()
        .then(list => {
          if (list && list.length > 0) {
            setSessions(list);
          }
        })
        .finally(() => setIsLoadingCloud(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions(prev => prev.filter(s => s.id !== id));
    await AppwriteDatabaseService.deleteSession(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Cabeçalho */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Histórico de Debates Guardados
                </h3>
                <span className="flex items-center gap-1 text-[9px] px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 font-mono">
                  <Cloud className="w-2.5 h-2.5" />
                  Appwrite Cloud Sync
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Sincronização em tempo real • {sessions.length} debates registados {isLoadingCloud && '(a sincronizar...)'}
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

        {/* Lista com Scroll */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {sessions.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <History className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-xs text-slate-400">
                Ainda não tens debates gravados na base de dados local.
              </p>
              <p className="text-[11px] text-slate-500">
                Inicia um debate na mesa redonda e ele será guardado automaticamente a cada intervenção.
              </p>
            </div>
          ) : (
            sessions.map(session => (
              <div
                key={session.id}
                onClick={() => {
                  onLoadSession(session);
                  onClose();
                }}
                className="group relative p-4 rounded-xl bg-slate-950/60 hover:bg-slate-800/50 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-200 group-hover:text-indigo-300 transition-colors line-clamp-2">
                    {session.topic}
                  </h4>
                  <button
                    onClick={e => handleDelete(session.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-all"
                    title="Eliminar debate do histórico"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    {new Date(session.updatedAt).toLocaleDateString('pt-PT', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-slate-500" />
                    {session.messages?.length || 0} intervenções
                  </span>
                  {session.synthesisResult && (
                    <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-800/40 text-[10px]">
                      <Award className="w-2.5 h-2.5" />
                      Com Síntese
                    </span>
                  )}
                  <span className="ml-auto text-indigo-400 flex items-center gap-1 font-semibold group-hover:translate-x-0.5 transition-transform">
                    Carregar <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
