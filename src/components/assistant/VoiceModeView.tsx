import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  PhoneOff,
  Radio,
  Volume2,
  AlertCircle,
  Send,
  Wrench,
} from 'lucide-react';
import { EscalationBanner } from './EscalationBanner';

interface VoiceModeViewProps {
  onSwitchToChat: () => void;
}

interface LiveCaptionEntry {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

const LIVE_QUICK_PROMPTS = [
  'My PC powers on with fans spinning but no display',
  'Diagnose high CPU and GPU temperatures',
  'Help fix a Windows blue screen crash',
];

function float32ToBase64Pcm16(input: Float32Array, inputSampleRate: number): string {
  const targetRate = 16000;
  let samples: Float32Array;

  if (inputSampleRate === targetRate) {
    samples = input;
  } else {
    const ratio = inputSampleRate / targetRate;
    const outputLength = Math.max(1, Math.floor(input.length / ratio));
    samples = new Float32Array(outputLength);
    for (let i = 0; i < outputLength; i++) {
      const srcIdx = i * ratio;
      const idx0 = Math.floor(srcIdx);
      const idx1 = Math.min(idx0 + 1, input.length - 1);
      const frac = srcIdx - idx0;
      samples[i] = input[idx0] * (1 - frac) + input[idx1] * frac;
    }
  }

  const pcmBytes = new Uint8Array(samples.length * 2);
  const view = new DataView(pcmBytes.buffer);
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(i * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
  }

  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < pcmBytes.length; i += chunkSize) {
    binary += String.fromCharCode(...pcmBytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function decodeBase64Pcm24k(base64: string): Float32Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const sampleCount = Math.floor(len / 2);
  const float32 = new Float32Array(sampleCount);
  const view = new DataView(bytes.buffer);
  for (let i = 0; i < sampleCount; i++) {
    float32[i] = view.getInt16(i * 2, true) / 32768;
  }
  return float32;
}

export const VoiceModeView: React.FC<VoiceModeViewProps> = ({ onSwitchToChat }) => {
  const [connectionState, setConnectionState] = useState<'idle' | 'connecting' | 'live' | 'error'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [captions, setCaptions] = useState<LiveCaptionEntry[]>([
    {
      id: 'intro',
      role: 'assistant',
      text: "Tap 'Start Live Voice' to talk hands-free with Nate AI (Gemini Live). Ask about PC troubleshooting, BSOD codes, liquid cooling thermals, custom builds, or Nate's work.",
    },
  ]);

  const wsRef = useRef<WebSocket | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const isMutedRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);
  const captionsEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    captionsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [captions]);

  const stopPlaybackQueue = useCallback(() => {
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
        src.disconnect();
      } catch {
        // Ignore already-stopped nodes
      }
    });
    activeSourcesRef.current.clear();
    nextStartTimeRef.current = 0;
    if (isMountedRef.current) {
      setIsSpeaking(false);
    }
  }, []);

  const cleanupSession = useCallback(() => {
    stopPlaybackQueue();

    if (processorRef.current) {
      try {
        processorRef.current.onaudioprocess = null;
        processorRef.current.disconnect();
      } catch {
        // Ignore
      }
      processorRef.current = null;
    }

    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect();
      } catch {
        // Ignore
      }
      sourceNodeRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (inputAudioCtxRef.current && inputAudioCtxRef.current.state !== 'closed') {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }

    if (outputAudioCtxRef.current && outputAudioCtxRef.current.state !== 'closed') {
      outputAudioCtxRef.current.close().catch(() => {});
      outputAudioCtxRef.current = null;
    }

    if (wsRef.current) {
      try {
        if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
          wsRef.current.close();
        }
      } catch {
        // Ignore
      }
      wsRef.current = null;
    }
  }, [stopPlaybackQueue]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      cleanupSession();
    };
  }, [cleanupSession]);

  const appendTranscript = useCallback((role: 'user' | 'assistant', chunk: string) => {
    if (!chunk) return;
    setCaptions((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === role && last.id !== 'intro' && !last.id.startsWith('ready-')) {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...last,
          text: `${last.text}${chunk}`,
        };
        return updated;
      }
      return [
        ...prev.slice(-14),
        {
          id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          role,
          text: chunk.trimStart(),
        },
      ];
    });
  }, []);

  const scheduleAudioChunk = useCallback((base64Audio: string) => {
    const ctx = outputAudioCtxRef.current;
    if (!ctx || ctx.state === 'closed') return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    try {
      const float32 = decodeBase64Pcm24k(base64Audio);
      if (float32.length === 0) return;

      const buffer = ctx.createBuffer(1, float32.length, 24000);
      buffer.copyToChannel(float32, 0);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);

      const startAt = Math.max(ctx.currentTime + 0.01, nextStartTimeRef.current);
      source.start(startAt);
      nextStartTimeRef.current = startAt + buffer.duration;

      activeSourcesRef.current.add(source);
      if (isMountedRef.current) setIsSpeaking(true);

      source.onended = () => {
        activeSourcesRef.current.delete(source);
        if (activeSourcesRef.current.size === 0 && isMountedRef.current) {
          setIsSpeaking(false);
        }
      };
    } catch (err) {
      console.warn('Audio decode/schedule error:', err);
    }
  }, []);

  const startLiveSession = async () => {
    cleanupSession();
    setErrorMsg(null);
    setIsMuted(false);
    isMutedRef.current = false;
    setConnectionState('connecting');

    if (!navigator.mediaDevices?.getUserMedia) {
      setConnectionState('error');
      setErrorMsg('Microphone capture is not supported in this browser. Please switch to Text Chat.');
      return;
    }

    try {
      const AudioCtxClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      let inputCtx: AudioContext;
      try {
        inputCtx = new AudioCtxClass({ sampleRate: 16000 });
      } catch {
        inputCtx = new AudioCtxClass();
      }
      let outputCtx: AudioContext;
      try {
        outputCtx = new AudioCtxClass({ sampleRate: 24000 });
      } catch {
        outputCtx = new AudioCtxClass();
      }
      await inputCtx.resume();
      await outputCtx.resume();
      inputAudioCtxRef.current = inputCtx;
      outputAudioCtxRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      });

      if (!isMountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      mediaStreamRef.current = stream;

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/api/assistant/live`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMountedRef.current) return;
        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        const silentGain = inputCtx.createGain();
        silentGain.gain.value = 0;

        processor.onaudioprocess = (event) => {
          if (isMutedRef.current || ws.readyState !== WebSocket.OPEN) return;
          const channelData = event.inputBuffer.getChannelData(0);
          const base64Pcm = float32ToBase64Pcm16(channelData, inputCtx.sampleRate);
          ws.send(JSON.stringify({ type: 'audio', audio: base64Pcm }));
        };

        source.connect(processor);
        processor.connect(silentGain);
        silentGain.connect(inputCtx.destination);

        sourceNodeRef.current = source;
        processorRef.current = processor;
      };

      ws.onmessage = (event) => {
        if (!isMountedRef.current) return;
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'ready') {
            setConnectionState('live');
            setCaptions([
              {
                id: `ready-${Date.now()}`,
                role: 'assistant',
                text: 'Live voice connected. Go ahead and speak—I am listening in real time.',
              },
            ]);
          } else if (msg.type === 'audio' && msg.audio) {
            setConnectionState('live');
            scheduleAudioChunk(msg.audio);
          } else if (msg.type === 'inputTranscript' && msg.text) {
            appendTranscript('user', msg.text);
          } else if (msg.type === 'outputTranscript' && msg.text) {
            appendTranscript('assistant', msg.text);
          } else if (msg.type === 'interrupted') {
            stopPlaybackQueue();
          } else if (msg.type === 'error') {
            setErrorMsg(msg.message || 'Live AI session failed.');
            setConnectionState('error');
            cleanupSession();
          } else if (msg.type === 'closed') {
            setConnectionState('idle');
            cleanupSession();
          }
        } catch (parseErr) {
          console.warn('Invalid Live WS payload:', parseErr);
        }
      };

      ws.onerror = () => {
        if (!isMountedRef.current) return;
        setErrorMsg('Live voice WebSocket connection failed. Try Text Chat or retry.');
        setConnectionState('error');
        cleanupSession();
      };

      ws.onclose = () => {
        if (!isMountedRef.current) return;
        setConnectionState((prev) => (prev === 'error' ? 'error' : 'idle'));
      };
    } catch (err: any) {
      cleanupSession();
      if (!isMountedRef.current) return;
      const permissionDenied =
        err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
      setErrorMsg(
        permissionDenied
          ? 'Microphone access was denied. Allow mic permissions or switch to Text Chat.'
          : err?.message || 'Unable to start live audio session.'
      );
      setConnectionState('error');
    }
  };

  const endLiveSession = () => {
    cleanupSession();
    setConnectionState('idle');
    setIsMuted(false);
    isMutedRef.current = false;
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    isMutedRef.current = nextMuted;
    if (nextMuted && wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'audioStreamEnd' }));
    }
  };

  const sendLiveText = (overrideText?: string) => {
    const query = (overrideText ?? textInput).trim();
    if (!query || wsRef.current?.readyState !== WebSocket.OPEN) return;
    stopPlaybackQueue();
    appendTranscript('user', query);
    wsRef.current.send(JSON.stringify({ type: 'text', text: query }));
    if (!overrideText) setTextInput('');
  };

  const isLive = connectionState === 'live';
  const isConnecting = connectionState === 'connecting';

  return (
    <div className="flex flex-col h-[520px] max-h-[80vh] p-4 justify-between gap-3">
      {/* Top Status & Mode Controls */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              isSpeaking
                ? 'bg-purple-400 animate-pulse'
                : isLive && !isMuted
                ? 'bg-emerald-400 animate-ping'
                : isConnecting
                ? 'bg-amber-400 animate-pulse'
                : connectionState === 'error'
                ? 'bg-rose-500'
                : 'bg-slate-500'
            }`}
          />
          <span className="text-xs font-mono font-bold text-slate-200 truncate">
            {isSpeaking
              ? 'Nate AI Speaking (Live Audio)...'
              : isConnecting
              ? 'Connecting Gemini Live...'
              : isLive && isMuted
              ? 'Live Connected (Mic Muted)'
              : isLive
              ? 'Live Voice Active · Interrupt Anytime'
              : connectionState === 'error'
              ? 'Live Connection Interrupted'
              : 'Gemini Live Voice Ready'}
          </span>
        </div>

        <button
          type="button"
          onClick={onSwitchToChat}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] shrink-0 cursor-pointer"
        >
          Switch to Text
        </button>
      </div>

      {/* Live Waveform + Call Controls */}
      <div className="flex flex-col items-center justify-center gap-3 py-1">
        <div className="flex items-center justify-center gap-1.5 h-12 w-full max-w-xs">
          {[40, 70, 95, 60, 85, 45, 90, 65, 30, 80, 50, 75].map((_, idx) => {
            const activeWave = isSpeaking || (isLive && !isMuted);
            const eqClass = activeWave ? `animate-eq-${(idx % 5) + 1}` : 'h-2';
            return (
              <div
                key={idx}
                className={`w-1.5 rounded-full transition-all duration-150 ${eqClass} ${
                  isSpeaking
                    ? 'bg-gradient-to-t from-purple-600 to-sky-400'
                    : isLive && !isMuted
                    ? 'bg-gradient-to-t from-emerald-500 to-cyan-400'
                    : 'bg-slate-800'
                }`}
              />
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          {!isLive && !isConnecting ? (
            <button
              type="button"
              onClick={startLiveSession}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-mono text-xs font-bold shadow-xl flex items-center gap-2 ring-4 ring-emerald-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Radio className="w-4 h-4" />
              <span>Start Live Voice Call</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={toggleMute}
                disabled={isConnecting}
                className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer disabled:opacity-50 ${
                  isMuted
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                    : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                }`}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-400" />}
                <span>{isMuted ? 'Unmute Mic' : 'Mute Mic'}</span>
              </button>

              <button
                type="button"
                onClick={endLiveSession}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Call</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Live Quick Diagnostic Prompts (when Live is active) */}
      {isLive && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
          {LIVE_QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendLiveText(prompt)}
              className="px-2.5 py-1 rounded-lg bg-slate-950/90 hover:bg-slate-800 border border-slate-800 text-[10px] font-mono text-emerald-300 shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Wrench className="w-3 h-3 text-emerald-400" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>
      )}

      {errorMsg && (
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-[11px] font-mono text-rose-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={onSwitchToChat}
            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shrink-0 cursor-pointer"
          >
            Text Chat
          </button>
        </div>
      )}

      {/* Real-Time Captions Feed */}
      <div className="flex-1 min-h-0 p-3 rounded-2xl bg-slate-950/85 border border-slate-800/80 overflow-y-auto space-y-2">
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold flex items-center justify-between">
          <span>Live Transcript · Gemini 3.8 Live</span>
          {isSpeaking && (
            <span className="text-purple-400 flex items-center gap-1">
              <Volume2 className="w-3 h-3" /> Audio Output
            </span>
          )}
        </div>

        <div className="space-y-2">
          {captions.map((entry) => (
            <div
              key={entry.id}
              className={`text-xs font-sans leading-relaxed rounded-xl px-3 py-2 ${
                entry.role === 'user'
                  ? 'bg-emerald-950/40 border border-emerald-500/20 text-emerald-200 ml-4'
                  : 'bg-slate-900/90 border border-slate-800 text-slate-200 mr-4'
              }`}
            >
              <span className="text-[10px] font-mono uppercase font-bold block mb-0.5 text-slate-400">
                {entry.role === 'user' ? 'You' : 'Nate AI'}
              </span>
              {entry.text}
            </div>
          ))}
          <div ref={captionsEndRef} />
        </div>
      </div>

      {/* Optional Silent Text Injection During Active Live Call */}
      {isLive && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                sendLiveText();
              }
            }}
            placeholder="Or type a message into the live voice session..."
            className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 placeholder-slate-500 focus:border-emerald-500 outline-none"
          />
          <button
            type="button"
            onClick={() => sendLiveText()}
            disabled={!textInput.trim()}
            className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white cursor-pointer"
            title="Send text to live voice session"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 24/7 Escalation Banner */}
      <EscalationBanner compact={true} />
    </div>
  );
};
