import React from 'react';
import { Phone, MessageSquare, Clock, ShieldCheck } from 'lucide-react';

interface EscalationBannerProps {
  compact?: boolean;
}

export const EscalationBanner: React.FC<EscalationBannerProps> = ({ compact = false }) => {
  const phoneNumber = '5854841764';
  const displayPhone = '585-484-1764';

  if (compact) {
    return (
      <div className="p-3 rounded-2xl bg-slate-950/90 border border-emerald-500/30 flex items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Phone className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <div className="text-[11px] font-mono font-bold text-slate-100 flex items-center gap-1">
              <span>Nate's Work Line: {displayPhone}</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300">24/7</span>
            </div>
            <p className="text-[10px] font-sans text-slate-400">
              Call or text directly anytime for tech support &amp; inquiries.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href={`tel:${phoneNumber}`}
            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[11px] font-bold flex items-center gap-1 transition-colors"
          >
            <Phone className="w-3 h-3" />
            <span>Call</span>
          </a>
          <a
            href={`sms:${phoneNumber}`}
            className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-mono text-[11px] font-bold flex items-center gap-1 transition-colors"
          >
            <MessageSquare className="w-3 h-3" />
            <span>Text</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/40 shadow-xl space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono font-bold text-slate-100">
                Direct Contact · Nate Mina
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                Available 24/7
              </span>
            </div>
            <p className="text-xs font-mono font-semibold text-emerald-400 mt-0.5">
              Work Line: {displayPhone}
            </p>
          </div>
        </div>

        <div className="text-[10px] font-mono text-slate-500 hidden sm:flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/70" />
          <span>Direct Line</span>
        </div>
      </div>

      <p className="text-xs font-sans text-slate-300 leading-relaxed">
        Not getting the exact answer you need, or have a critical hardware emergency? You can call or text Nate's personal work phone at <strong className="text-emerald-300 font-mono">{displayPhone}</strong> 24/7 for prompt technical support or consultation.
      </p>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <a
          href={`tel:${phoneNumber}`}
          className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Call 585-484-1764</span>
        </a>
        <a
          href={`sms:${phoneNumber}`}
          className="w-full py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Text 585-484-1764</span>
        </a>
      </div>
    </div>
  );
};
