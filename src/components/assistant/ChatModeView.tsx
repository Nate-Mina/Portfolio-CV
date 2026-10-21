import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, RefreshCw, Phone, MessageSquare, AlertCircle } from 'lucide-react';
import { EscalationBanner } from './EscalationBanner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  escalation?: boolean;
}

const INITIAL_MESSAGE: Message = {
  id: 'init-1',
  role: 'assistant',
  text: `Hello and welcome! I am Nathaniel (Nate) Mina's personal AI assistant.\n\nNate is a **Mechanical Engineer** (University at Buffalo, SUNY), **entrepreneur**, **founder & CEO of Pure Computers**, and **musician**.\n\nHow can I help you today?\n• **Computer Tech Support & Diagnostics**: Troubleshoot hardware, crashes, thermals, or OS issues.\n• **Custom PC Build Quotes & Sales**: High-performance workstations, custom loops, and AI rigs.\n• **Free 15-Minute Consultation**: Discuss tech support, sales, custom website creation, or AI implementation for your existing business or a new startup idea!\n\nIf you ever need direct assistance, you can call or text Nate 24/7 at **585-484-1764**.`,
  timestamp: 'Just now',
  escalation: true,
};

const SUGGESTIONS = [
  'Tell me about Nate Mina',
  'I need computer tech support',
  'Book free 15-min consult',
  'Custom PC build sales',
  'AI implementation for business',
  'Call or text Nate directly',
];

export const ChatModeView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}-u`,
      role: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      // Prepare history payload for server
      const historyPayload = messages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query.trim(),
          history: historyPayload,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg: Message = {
        id: `msg-${Date.now()}-a`,
        role: 'assistant',
        text: data.reply || "I'm here to help. You can also reach Nate directly at 585-484-1764.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        escalation: data.escalationSuggested ?? true,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      const fallbackMsg: Message = {
        id: `msg-${Date.now()}-err`,
        role: 'assistant',
        text: `I'm having a connection glitch, but Nate is available directly! You can call or text his work line 24/7 at **585-484-1764** for computer tech support, custom sales, or your free 15-minute consultation.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        escalation: true,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[520px] max-h-[80vh]">
      {/* Top Direct Contact Bar */}
      <div className="p-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-300">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>24/7 Work Line: 585-484-1764</span>
        </span>
        <div className="flex items-center gap-2">
          <a
            href="tel:5854841764"
            className="text-xs text-slate-300 hover:text-emerald-400 underline font-semibold"
          >
            Call
          </a>
          <span>·</span>
          <a
            href="sms:5854841764"
            className="text-xs text-slate-300 hover:text-sky-400 underline font-semibold"
          >
            Text
          </a>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 space-y-2 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white font-sans rounded-br-sm shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 font-sans rounded-bl-sm shadow-md'
              }`}
            >
              {/* Formatted body text */}
              <div className="whitespace-pre-wrap space-y-1.5">
                {msg.text.split('\n\n').map((paragraph, pIdx) => (
                  <p key={pIdx}>
                    {paragraph.split('**').map((chunk, cIdx) =>
                      cIdx % 2 === 1 ? (
                        <strong key={cIdx} className="font-bold text-white font-mono">
                          {chunk}
                        </strong>
                      ) : (
                        chunk
                      )
                    )}
                  </p>
                ))}
              </div>

              {/* Timestamp */}
              <div
                className={`text-[10px] font-mono text-right ${
                  msg.role === 'user' ? 'text-emerald-200' : 'text-slate-500'
                }`}
              >
                {msg.timestamp}
              </div>

              {/* Escalation buttons if flagged */}
              {msg.escalation && (
                <div className="pt-2 border-t border-slate-800/80">
                  <EscalationBanner compact={true} />
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
              <span>Nate AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="px-3 py-2 bg-slate-950/60 border-t border-slate-800/80 overflow-x-auto flex items-center gap-2 no-scrollbar">
        {SUGGESTIONS.map((suggestion, sIdx) => (
          <button
            key={sIdx}
            type="button"
            onClick={() => handleSend(suggestion)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-emerald-300 shrink-0 transition-colors cursor-pointer"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about tech support, PC sales, 15-min consult, or Nate..."
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-100 placeholder-slate-500 focus:border-emerald-500 outline-none transition-colors"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white transition-all shadow-md cursor-pointer shrink-0"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
