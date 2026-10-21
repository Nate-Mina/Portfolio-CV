import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, Phone, MessageSquare, AlertCircle } from 'lucide-react';
import { EscalationBanner } from './EscalationBanner';

interface VoiceModeViewProps {
  onSwitchToChat: () => void;
}

export const VoiceModeView: React.FC<VoiceModeViewProps> = ({ onSwitchToChat }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiSpeechText, setAiSpeechText] = useState(
    "Hello! I'm Nate Mina's AI assistant. Nate is a mechanical engineer, entrepreneur, founder of Pure Computers, and musician. How can I assist you with tech support, PC sales, or a free 15-minute consultation today? You can also call or text Nate 24/7 at 585-484-1764."
  );
  const [speechSupported, setSpeechSupported] = useState(true);
  const [micPermissionError, setMicPermissionError] = useState(false);
  const recognitionRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Play audio greeting or assistant response using server TTS or Web Speech fallback
  const speakText = async (textToSpeak: string) => {
    // Stop any existing speech
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(true);

    try {
      const res = await fetch('/api/assistant/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSpeak }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audio) {
          const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
          audioPlayerRef.current = audio;
          audio.onended = () => {
            setIsSpeaking(false);
          };
          audio.onerror = () => {
            setIsSpeaking(false);
          };
          await audio.play();
          return;
        }
      }
    } catch (err) {
      console.warn('Server TTS failed, falling back to Web Speech API:', err);
    }

    // Fallback: Web Speech API
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(false);
    }
  };

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const text = event.results[current][0].transcript;
      setTranscript(text);
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition warning/error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setMicPermissionError(true);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // When speech recognition ends with a non-empty transcript, query the assistant
  const handleQuery = async (userQuery: string) => {
    if (!userQuery.trim()) return;

    setIsThinking(true);
    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userQuery,
          history: [{ role: 'assistant', text: aiSpeechText }],
        }),
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const reply = data.reply || "I'm here to help. You can also call or text Nate directly at 585-484-1764.";
      setAiSpeechText(reply);
      setIsThinking(false);
      speakText(reply);
    } catch (err) {
      console.error('Error in voice query:', err);
      setIsThinking(false);
      const fallback = "I encountered a network issue, but you can reach Nate Mina directly anytime at 585-484-1764.";
      setAiSpeechText(fallback);
      speakText(fallback);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (transcript.trim()) {
        handleQuery(transcript);
      }
    } else {
      setTranscript('');
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        setIsSpeaking(false);
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.error('Failed to start speech recognition:', e);
        }
      }
    }
  };

  const handlePlayGreeting = () => {
    speakText(aiSpeechText);
  };

  const handleStopSpeaking = () => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  return (
    <div className="flex flex-col h-[520px] max-h-[80vh] p-5 justify-between space-y-4">
      {/* Top Status & Controls */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isSpeaking
                ? 'bg-purple-400 animate-pulse'
                : isListening
                ? 'bg-rose-400 animate-ping'
                : isThinking
                ? 'bg-amber-400 animate-spin'
                : 'bg-emerald-400'
            }`}
          />
          <span className="text-xs font-mono font-bold text-slate-200">
            {isSpeaking
              ? 'Nate AI Speaking...'
              : isListening
              ? 'Listening to you...'
              : isThinking
              ? 'Analyzing technical inquiry...'
              : 'Live Voice Ready'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isSpeaking ? (
            <button
              onClick={handleStopSpeaking}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <VolumeX className="w-3.5 h-3.5" />
              <span>Mute</span>
            </button>
          ) : (
            <button
              onClick={handlePlayGreeting}
              className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 font-mono text-[11px] flex items-center gap-1 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Speak Greeting</span>
            </button>
          )}

          <button
            onClick={onSwitchToChat}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] cursor-pointer"
          >
            Switch to Text
          </button>
        </div>
      </div>

      {/* Visualizer & Mic Area */}
      <div className="flex flex-col items-center justify-center space-y-4 py-2">
        {/* Animated Equalizer Waveform */}
        <div className="flex items-center justify-center gap-1.5 h-20 w-full max-w-xs">
          {[40, 70, 95, 60, 85, 45, 90, 65, 30, 80, 50, 75].map((val, idx) => (
            <div
              key={idx}
              className={`w-2 rounded-full transition-all duration-150 ${
                isSpeaking
                  ? 'bg-gradient-to-t from-purple-600 to-sky-400'
                  : isListening
                  ? 'bg-gradient-to-t from-rose-500 to-amber-400'
                  : 'bg-slate-800'
              }`}
              style={{
                height: isSpeaking
                  ? `${Math.max(12, (val * (Math.sin(Date.now() / 200 + idx) + 1.2)) / 2)}px`
                  : isListening
                  ? `${Math.max(15, (val * (Math.cos(Date.now() / 150 + idx) + 1.4)) / 2)}px`
                  : '10px',
              }}
            />
          ))}
        </div>

        {/* Central Push-to-Talk / Mic Button */}
        <button
          type="button"
          onClick={toggleListening}
          className={`relative p-6 rounded-full transition-all shadow-2xl active:scale-95 cursor-pointer flex items-center justify-center ${
            isListening
              ? 'bg-rose-500 text-white ring-8 ring-rose-500/20 animate-pulse'
              : 'bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white ring-4 ring-emerald-500/20'
          }`}
          title={isListening ? 'Click to stop and send' : 'Click to speak to Nate AI'}
        >
          {isListening ? <Mic className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          <span className="sr-only">{isListening ? 'Stop Listening' : 'Start Talking'}</span>
        </button>

        <p className="text-xs font-mono text-slate-400 text-center">
          {isListening ? (
            <span className="text-rose-400 font-bold">Listening... Click button when done speaking</span>
          ) : (
            <span>Tap mic to speak your question or diagnostic symptom</span>
          )}
        </p>

        {transcript && (
          <div className="w-full p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-emerald-300 text-center max-w-sm truncate">
            &ldquo;{transcript}&rdquo;
          </div>
        )}

        {micPermissionError && (
          <div className="w-full p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-300 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Microphone access blocked. Switch to Text Chat or call/text Nate at 585-484-1764.</span>
            </div>
            <button
              onClick={onSwitchToChat}
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] cursor-pointer"
            >
              Switch to Chat
            </button>
          </div>
        )}
      </div>

      {/* Live Captions of Assistant Response */}
      <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 max-h-36 overflow-y-auto">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold flex items-center justify-between">
          <span>Live Captions · Nate AI</span>
          {isSpeaking && <span className="text-purple-400 animate-pulse">● Audio Active</span>}
        </div>
        <p className="text-xs font-sans text-slate-200 leading-relaxed">
          {aiSpeechText}
        </p>
      </div>

      {/* 24/7 Escalation Banner */}
      <EscalationBanner compact={false} />
    </div>
  );
};
