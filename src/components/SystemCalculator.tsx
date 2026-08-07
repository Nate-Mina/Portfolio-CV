import React, { useState } from 'react';
import { Calculator, Zap, Sliders, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';

export const SystemCalculator: React.FC<{ themeAccent: string }> = ({ themeAccent }) => {
  const [throughput, setThroughput] = useState<number>(85); // Value-Generated Throughput
  const [energy, setEnergy] = useState<number>(20); // Energy Expended
  const [time, setTime] = useState<number>(25); // Time Capital Expended

  // Eta = Throughput / (Energy + Time)
  const denominator = Math.max(1, energy + time);
  const etaRaw = (throughput / denominator);
  const etaNormalized = Math.min(100, Math.round(etaRaw * 50)); // Scale for visual %
  
  const getEfficiencyRating = (score: number) => {
    if (score >= 80) return { label: 'Optimal System (Peak Flow)', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
    if (score >= 50) return { label: 'Moderate Efficiency (Sub-optimal friction)', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
    return { label: 'High Friction Bottleneck', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' };
  };

  const rating = getEfficiencyRating(etaNormalized);

  const resetValues = () => {
    setThroughput(95);
    setEnergy(15);
    setTime(15);
  };

  return (
    <div className="my-8 rounded-xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-sm shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-mono font-semibold text-slate-100 flex items-center gap-2">
              Systemic Efficiency Calculator
              <span className="text-xs font-sans px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                Interactive Equation
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Evaluate deterministic performance based on Nathaniel Mina&apos;s First-Principles Equation
            </p>
          </div>
        </div>
        <button
          onClick={resetValues}
          className="text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-md transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Optimize System
        </button>
      </div>

      {/* Equation Display */}
      <div className="my-6 p-4 rounded-lg bg-slate-950 border border-slate-800 font-mono text-center">
        <div className="text-slate-400 text-xs uppercase tracking-wider mb-2">Deterministic Formula</div>
        <div className="text-base md:text-lg text-emerald-400 font-semibold tracking-wide overflow-x-auto py-1">
          &eta; = <span className="underline underline-offset-4 decoration-emerald-500/50">Value-Generated Throughput</span> &divide; (<span className="text-amber-300">Energy Capital</span> + <span className="text-sky-300">Time Capital</span>)
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Sliders */}
        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-emerald-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> Value Throughput
              </span>
              <span className="text-slate-200 font-semibold">{throughput} units</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={throughput}
              onChange={(e) => setThroughput(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-amber-300 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5" /> Energy Expended
              </span>
              <span className="text-slate-200 font-semibold">{energy} units</span>
            </div>
            <input
              type="range"
              min="5"
              max="80"
              value={energy}
              onChange={(e) => setEnergy(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-mono mb-1.5">
              <span className="text-sky-300 flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5" /> Time Capital Expended
              </span>
              <span className="text-slate-200 font-semibold">{time} units</span>
            </div>
            <input
              type="range"
              min="5"
              max="80"
              value={time}
              onChange={(e) => setTime(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>
        </div>

        {/* Calculated Result Card */}
        <div className={`p-6 rounded-xl border ${rating.bg} flex flex-col justify-between h-full`}>
          <div>
            <div className="text-xs uppercase font-mono tracking-wider text-slate-400 mb-1">
              Calculated System Efficiency (&eta;)
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl md:text-5xl font-mono font-bold text-slate-100">
                {etaNormalized}%
              </span>
              <span className="text-xs font-mono text-slate-400">
                ({etaRaw.toFixed(2)} ratio)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 bg-slate-950/80 rounded-full overflow-hidden p-0.5 border border-slate-800 mb-4">
              <div
                className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-emerald-500 via-sky-400 to-emerald-300"
                style={{ width: `${Math.min(100, etaNormalized)}%` }}
              />
            </div>

            <div className={`text-sm font-semibold flex items-center gap-2 ${rating.color}`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {rating.label}
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-300 leading-relaxed font-sans border-t border-slate-800/80 pt-3">
            {etaNormalized >= 80 ? (
              <span>Automated pipelines eliminate friction. High value density achieved with low capital waste.</span>
            ) : etaNormalized >= 50 ? (
              <span>Friction present. Consider implementing Power Automate hooks or thermal multi-GPU compute scaling.</span>
            ) : (
              <span>Severe systemic bottleneck. Apply 5 Whys analysis to isolate mechanical/logistical friction.</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
