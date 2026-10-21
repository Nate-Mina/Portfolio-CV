import React, { useState } from 'react';
import { Bot, Mic, MessageSquare, X, Minus, Sparkles, Phone, Volume2 } from 'lucide-react';
import { VoiceModeView } from './VoiceModeView';
import { ChatModeView } from './ChatModeView';
import { JekyllTheme } from '../../types';

interface AIAssistantWidgetProps {
  currentTheme?: JekyllTheme;
}

export const AIAssistantWidget: React.FC<AIAssistantWidgetProps> = ({ currentTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'voice' | 'chat'>('voice'); // Voice is primary as requested

  return (
    <>
      {/* Floating launcher trigger (bottom-right) */}
      {!isOpen && (
        <aside
          aria-label="AI Assistant"
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 group"
        >
          {/* Quick Call pill tooltip */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] font-mono text-slate-300 shadow-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Call/Text Nate 24/7:</span>
            <a
              href="tel:5854841764"
              className="text-emerald-400 font-bold hover:underline"
            >
              585-484-1764
            </a>
          </div>

          <button
            onClick={() => setIsOpen(true)}
            className="px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-mono text-xs font-bold shadow-2xl flex items-center gap-2.5 transition-all transform hover:-translate-y-0.5 cursor-pointer ring-4 ring-emerald-500/20 active:scale-95"
            aria-label="Open Nate Mina AI Assistant"
          >
            <div className="relative">
              <Mic className="w-4 h-4 text-white" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
            </div>
            <span>Nate AI · Voice &amp; Chat</span>
          </button>
        </aside>
      )}

      {/* Expanded Assistant Dialog */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Nate Mina AI Voice & Chat Assistant"
          className="fixed bottom-4 right-4 z-50 w-[95vw] sm:w-[430px] rounded-3xl bg-slate-900/95 backdrop-blur-2xl border border-slate-800 shadow-2xl shadow-slate-950 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-purple-500/20 border border-emerald-500/30 text-emerald-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-mono font-bold text-slate-100 flex items-center gap-1.5">
                  <span>Nate Mina AI Assistant</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[10px] font-mono text-slate-400">
                  Tech Support · Quotes · 15m Consult
                </p>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono font-bold">
              <button
                onClick={() => setMode('voice')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  mode === 'voice'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Mic className="w-3 h-3" />
                <span>Voice</span>
              </button>

              <button
                onClick={() => setMode('chat')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                  mode === 'chat'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-3 h-3" />
                <span>Chat</span>
              </button>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Minimize assistant"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Mode View */}
          <div className="bg-slate-900/60 flex-1 overflow-hidden">
            {mode === 'voice' ? (
              <VoiceModeView onSwitchToChat={() => setMode('chat')} />
            ) : (
              <ChatModeView />
            )}
          </div>
        </div>
      )}
    </>
  );
};
