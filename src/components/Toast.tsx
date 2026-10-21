import React, { useEffect, useState, useRef } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  X,
  FileSpreadsheet,
  ListTodo,
  ExternalLink,
  Clock,
  Phone,
  Mail,
  User,
  MonitorCheck
} from 'lucide-react';
import { ToastItem, useToast } from '../context/ToastContext';

interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const ToastCard: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);
  const startTimeRef = useRef<number>(Date.now());
  const remainingTimeRef = useRef<number>(toast.duration || 6500);
  const animationFrameRef = useRef<number | null>(null);

  // Manage progress bar and auto-dismiss with hover pause
  useEffect(() => {
    const totalDuration = toast.duration || 6500;

    const updateTimer = () => {
      if (isHovered) {
        animationFrameRef.current = requestAnimationFrame(updateTimer);
        return;
      }

      const elapsed = Date.now() - startTimeRef.current;
      const timeLeft = Math.max(0, remainingTimeRef.current - elapsed);
      const percentage = (timeLeft / totalDuration) * 100;
      setProgress(percentage);

      if (timeLeft <= 0) {
        onDismiss(toast.id);
      } else {
        animationFrameRef.current = requestAnimationFrame(updateTimer);
      }
    };

    startTimeRef.current = Date.now();
    animationFrameRef.current = requestAnimationFrame(updateTimer);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isHovered, onDismiss, toast.duration, toast.id]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    // calculate remaining
    const totalDuration = toast.duration || 6500;
    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
  };

  const handleMouseLeave = () => {
    startTimeRef.current = Date.now();
    setIsHovered(false);
  };

  // Distinct theme styling by toast type
  const isGoogleForm = toast.type === 'google-form';
  const isSuccess = toast.type === 'success' || isGoogleForm;
  const isError = toast.type === 'error';
  const isWarning = toast.type === 'warning';
  const isInfo = toast.type === 'info';

  let borderColor = 'border-slate-800';
  let glowColor = 'shadow-slate-950/80';
  let barColor = 'bg-emerald-500';
  let iconComponent = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;

  if (isGoogleForm) {
    borderColor = 'border-emerald-500/50';
    glowColor = 'shadow-emerald-950/60 shadow-xl';
    barColor = 'bg-gradient-to-r from-purple-500 via-sky-500 to-emerald-400';
    iconComponent = <FileSpreadsheet className="w-5 h-5 text-purple-400 shrink-0" />;
  } else if (isSuccess) {
    borderColor = 'border-emerald-500/40';
    glowColor = 'shadow-emerald-950/40 shadow-lg';
    barColor = 'bg-emerald-400';
    iconComponent = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
  } else if (isError) {
    borderColor = 'border-rose-500/50';
    glowColor = 'shadow-rose-950/40 shadow-lg';
    barColor = 'bg-rose-500';
    iconComponent = <XCircle className="w-5 h-5 text-rose-400 shrink-0" />;
  } else if (isWarning) {
    borderColor = 'border-amber-500/50';
    glowColor = 'shadow-amber-950/40 shadow-lg';
    barColor = 'bg-amber-400';
    iconComponent = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
  } else if (isInfo) {
    borderColor = 'border-sky-500/40';
    glowColor = 'shadow-sky-950/40 shadow-lg';
    barColor = 'bg-sky-400';
    iconComponent = <Info className="w-5 h-5 text-sky-400 shrink-0" />;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full max-w-md overflow-hidden rounded-2xl bg-slate-900/95 backdrop-blur-xl border ${borderColor} ${glowColor} transition-all duration-300 animate-in fade-in slide-in-from-top-4`}
    >
      {/* Decorative subtle ambient backdrop glow */}
      {isGoogleForm && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
      )}

      {/* Main card body */}
      <div className="p-4 space-y-3 relative z-10">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isGoogleForm ? 'bg-purple-500/15 border border-purple-500/30' : 'bg-slate-800/80 border border-slate-700/50'}`}>
              {iconComponent}
            </div>
            <div>
              {isGoogleForm && (
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Google Form Service Request
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Confirmed
                  </span>
                </div>
              )}
              <h4 className="text-xs font-mono font-bold text-slate-100 leading-tight">
                {toast.title}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-slate-400" />
              {toast.timestamp}
            </span>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Message */}
        <p className="text-xs font-sans text-slate-300 leading-relaxed">
          {toast.message}
        </p>

        {/* Details tags (e.g. for Google Form inquiries) */}
        {toast.details && toast.details.length > 0 && (
          <div className="grid grid-cols-2 gap-1.5 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono">
            {toast.details.map((d, idx) => (
              <div key={idx} className="flex flex-col truncate">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                  {d.label}
                </span>
                <span className="text-slate-200 truncate font-semibold">
                  {d.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Action Button if specified */}
        {toast.action && (
          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                toast.action?.onClick();
                onDismiss(toast.id);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md cursor-pointer"
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>{toast.action.label}</span>
            </button>
          </div>
        )}
      </div>

      {/* Auto-dismiss animated countdown progress bar */}
      <div className="w-full h-1 bg-slate-800/80 overflow-hidden">
        <div
          className={`h-full transition-all duration-75 ease-linear ${barColor}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className="fixed top-5 right-5 z-[99999] flex flex-col gap-3 pointer-events-none w-full max-w-sm px-4 sm:px-0 sm:max-w-md pointer-events-auto"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
};
export default ToastContainer;
