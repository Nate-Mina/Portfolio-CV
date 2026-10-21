import React, { useState } from 'react';
import { FileSpreadsheet, X, Send, CheckCircle2, ShieldCheck, Sparkles, MonitorCheck } from 'lucide-react';
import { JekyllTheme } from '../types';

interface GoogleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    email: string;
    phone: string;
    remoteOnly: boolean;
    category: string;
    details: string;
  }) => void;
  currentTheme: JekyllTheme;
  formResponderUri?: string | null;
}

export const GoogleFormModal: React.FC<GoogleFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  currentTheme,
  formResponderUri,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [remoteChoice, setRemoteChoice] = useState<'yes' | 'no'>('no');
  const [category, setCategory] = useState('repair');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmit({
        name,
        email,
        phone,
        remoteOnly: remoteChoice === 'yes',
        category,
        details,
      });
      setIsSubmitting(false);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className={`w-full max-w-xl my-8 rounded-3xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95`}>
        {/* Top Google Forms Purple Accent Strip */}
        <div className="h-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 w-full" />

        <div className="p-6 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                    Official Google Form Intake
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Verified Pure Computers
                  </span>
                </div>
                <h3 className="text-xl font-mono font-bold text-slate-100 mt-1">
                  Pure Computers Service Request Form
                </h3>
                <p className="text-xs font-sans text-slate-400">
                  Submissions directly trigger instant confirmation toasts, follow-up notifications, and Google Tasks sync.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {formResponderUri && (
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs font-mono text-purple-300 flex items-center justify-between">
              <span>Google Form Responder URL Active</span>
              <a
                href={formResponderUri}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-purple-200 font-bold"
              >
                View on Google Forms
              </a>
            </div>
          )}

          {/* Form Questions */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Question 1: Name */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <label className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1">
                <span>1. What is your full name?</span>
                <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Mercer"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-mono text-slate-100 focus:border-purple-500 outline-none"
              />
            </div>

            {/* Question 2: Email */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <label className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1">
                <span>2. Email Address</span>
                <span className="text-rose-400">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. alex@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-mono text-slate-100 focus:border-purple-500 outline-none"
              />
            </div>

            {/* Question 3: Phone Number */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <label className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1">
                <span>3. Phone Number</span>
                <span className="text-rose-400">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. (585) 555-0199"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-mono text-slate-100 focus:border-purple-500 outline-none"
              />
            </div>

            {/* Question 4: Remote Tech Support Only */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <label className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1">
                <span>4. Do you only want remote tech support?</span>
                <span className="text-rose-400">*</span>
              </label>
              <div className="space-y-2 text-xs font-mono">
                <label className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="remoteChoice"
                    value="yes"
                    checked={remoteChoice === 'yes'}
                    onChange={() => setRemoteChoice('yes')}
                    className="accent-purple-500"
                  />
                  <div className="flex flex-col">
                    <span className="text-slate-200 font-bold">Yes - Remote Only</span>
                    <span className="text-[11px] font-sans text-slate-400">Virtual screen share diagnostics, software repair &amp; IT troubleshooting</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="remoteChoice"
                    value="no"
                    checked={remoteChoice === 'no'}
                    onChange={() => setRemoteChoice('no')}
                    className="accent-purple-500"
                  />
                  <div className="flex flex-col">
                    <span className="text-slate-200 font-bold">No - On-Site / Drop-Off Preferred</span>
                    <span className="text-[11px] font-sans text-slate-400">Physical hardware inspection, bench assembly, or workshop drop-off</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Question 5: Service Needed */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <label className="text-xs font-mono font-bold text-slate-200">
                5. Service Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-mono text-slate-100 focus:border-purple-500 outline-none"
              >
                <option value="build">Custom PC Build &amp; Thermal Engineering</option>
                <option value="repair">Hardware Diagnostics &amp; Repair</option>
                <option value="it">Managed IT &amp; Network Setup</option>
                <option value="data">Data Recovery &amp; Storage Array Migration</option>
              </select>
            </div>

            {/* Question 6: Issue Description */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
              <label className="text-xs font-mono font-bold text-slate-200">
                6. Issue Description / Preferred Hardware Specs
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe your PC build vision or diagnostic symptoms..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-mono text-slate-100 focus:border-purple-500 outline-none"
              />
            </div>

            {/* Submit Action Row */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-500 hover:to-sky-500 text-white font-mono text-xs font-bold shadow-xl flex items-center gap-2 cursor-pointer transition-all"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting to Google Form...' : 'Submit Google Form Request'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
