import React, { useState } from 'react';
import {
  Cpu,
  Wrench,
  ShieldCheck,
  Zap,
  Phone,
  Mail,
  MapPin,
  Globe,
  CheckCircle2,
  ChevronRight,
  HardDrive,
  Activity,
  Award,
  Sparkles,
  Layers,
  Send,
  Check,
  Laptop,
  Server,
  Droplet,
  ExternalLink,
  Calculator,
} from 'lucide-react';
import { JekyllTheme } from '../types';
import { profileData } from '../data/profileData';

interface PureComputersPageProps {
  currentTheme: JekyllTheme;
  onOpenTerminal: () => void;
}

export const PureComputersPage: React.FC<PureComputersPageProps> = ({ currentTheme }) => {
  // Configurator state for custom PC estimate
  const [workload, setWorkload] = useState<'gaming' | 'ai' | 'cad' | 'office'>('gaming');
  const [cooling, setCooling] = useState<'air' | 'aio' | 'custom_loop'>('aio');
  const [tier, setTier] = useState<'mid' | 'high' | 'ultra'>('high');
  const [formSent, setFormSent] = useState(false);
  const [serviceCategory, setServiceCategory] = useState<'build' | 'repair' | 'it' | 'data'>('build');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMsg, setContactMsg] = useState('');

  // Estimate price calculation logic
  const calculateEstimate = () => {
    let base = 1200;
    if (workload === 'ai') base = 3200;
    if (workload === 'cad') base = 2400;
    if (workload === 'office') base = 750;

    if (tier === 'mid') base *= 0.85;
    if (tier === 'ultra') base *= 1.6;

    if (cooling === 'aio') base += 150;
    if (cooling === 'custom_loop') base += 650;

    return Math.round(base);
  };

  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail) return;
    setFormSent(true);
    setTimeout(() => {
      setFormSent(false);
      setContactName('');
      setContactEmail('');
      setContactMsg('');
    }, 4000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      {/* Hero Banner Section */}
      <div className={`p-8 rounded-3xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} shadow-2xl relative overflow-hidden`}>
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Official Business Showcase &bull; www.PureComp.Net</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-mono font-bold text-slate-100 tracking-tight">
                Pure Computers
              </h1>
              <p className="text-base text-emerald-400 font-mono font-medium">
                Custom High-Performance PC Builds, Liquid Cooling, Hardware Diagnostics &amp; Managed IT
              </p>
            </div>

            <a
              href="https://www.PureComp.Net"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold shadow-lg transition-all"
            >
              <span>Visit www.PureComp.Net</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <p className="text-sm font-sans text-slate-300 leading-relaxed max-w-4xl">
            At <strong className="text-emerald-400 font-mono">Pure Computers</strong>, we combine mechanical engineering precision with deep IT architecture. Whether you need a bespoke liquid-cooled workstation for heavy FEA/CAD rendering, multi-GPU AI compute clusters, high-frame-rate gaming setups, or enterprise IT network support in Rochester and Pittsford, NY — we deliver unmatched performance with zero downtime.
          </p>

          {/* Quick Contact Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-500 uppercase">Direct Phone</div>
                <a href={`tel:${profileData.phone}`} className="text-xs font-mono font-bold text-slate-200 hover:text-emerald-400">
                  {profileData.phone}
                </a>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-500 uppercase">Email Support</div>
                <a href={`mailto:${profileData.emails[1]}`} className="text-xs font-mono font-bold text-slate-200 hover:text-sky-400">
                  {profileData.emails[1]}
                </a>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-500 uppercase">Location</div>
                <span className="text-xs font-mono font-bold text-slate-200">
                  {profileData.location}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[10px] font-mono text-slate-500 uppercase">Web Domain</div>
                <a href="https://www.PureComp.Net" target="_blank" rel="noopener noreferrer" className="text-xs font-mono font-bold text-slate-200 hover:text-violet-400">
                  PureComp.Net
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Business Services Matrix */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-mono font-bold text-slate-100">
              Our Core Services &amp; Solutions
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Precision engineering applied to computer hardware, liquid loops, &amp; business IT
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Service 1 */}
          <div className={`p-6 rounded-2xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} space-y-4 shadow-xl hover:border-emerald-500/50 transition-colors`}>
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-mono font-bold text-slate-100">
                  Bespoke Custom PC Builds
                </h3>
                <p className="text-xs font-mono text-emerald-400">
                  Tailored for Gaming, AI/ML, CAD, &amp; Content Creation
                </p>
              </div>
            </div>
            <ul className="space-y-2 text-xs font-sans text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Hand-selected, stress-tested premium GPUs, CPUs, motherboard platforms, and high-frequency RAM modules.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Custom liquid cooling engineering (AIO &amp; open loop) with fluid dynamics and thermal dissipation modeling.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Clean, ergonomic cable routing for optimized airflow and maximum aesthetic polish.</span>
              </li>
            </ul>
          </div>

          {/* Service 2 */}
          <div className={`p-6 rounded-2xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} space-y-4 shadow-xl hover:border-sky-500/50 transition-colors`}>
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-mono font-bold text-slate-100">
                  Hardware Diagnostics &amp; Repair
                </h3>
                <p className="text-xs font-mono text-sky-400">
                  Component-Level Repair &amp; Performance Restorations
                </p>
              </div>
            </div>
            <ul className="space-y-2 text-xs font-sans text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Comprehensive 5-Whys root cause analysis for BSODs, unexpected shutdowns, and boot loop failures.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Thermal repasting, GPU liquid pad replacement, liquid loop flush/refill, and PSU power testing.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <span>Hardware upgrades: NVMe SSD expansions, RAM upgrades, motherboard swaps, and BIOS/firmware flashing.</span>
              </li>
            </ul>
          </div>

          {/* Service 3 */}
          <div className={`p-6 rounded-2xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} space-y-4 shadow-xl hover:border-amber-500/50 transition-colors`}>
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-mono font-bold text-slate-100">
                  Managed IT Infrastructure &amp; Networking
                </h3>
                <p className="text-xs font-mono text-amber-400">
                  Enterprise Networks, Microsoft 365, &amp; Cloud Systems
                </p>
              </div>
            </div>
            <ul className="space-y-2 text-xs font-sans text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Small business network administration, Wi-Fi 7 mesh deployments, firewall setup, and VLAN isolation.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Microsoft 365 cloud tenant setup, email migrations (Exchange Online), and Microsoft Power Automate flows.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>On-site &amp; remote desktop support with zero-trust security configuration and automated ticketing.</span>
              </li>
            </ul>
          </div>

          {/* Service 4 */}
          <div className={`p-6 rounded-2xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} space-y-4 shadow-xl hover:border-violet-500/50 transition-colors`}>
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-mono font-bold text-slate-100">
                  Data Recovery &amp; Storage Solutions
                </h3>
                <p className="text-xs font-mono text-violet-400">
                  Drive Forensics &amp; Redundant Backup Architectures
                </p>
              </div>
            </div>
            <ul className="space-y-2 text-xs font-sans text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <span>Deep sector scan and forensic data extraction from failing HDDs, corrupted SSDs, and flash drives.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <span>3-2-1 backup implementation (Local NAS + Cloud encrypted backups) for business continuity.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                <span>Secure drive sanitization and HIPAA/GDPR compliant data destruction certification.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Interactive Custom Build Configurator */}
      <div className={`p-8 rounded-3xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} shadow-2xl space-y-6`}>
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-mono font-bold text-slate-100">
              Interactive Custom PC Build Estimator
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Select your performance requirements to generate an instant baseline hardware budget estimate
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Workload */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block">
                1. Select Primary Workload
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setWorkload('gaming')}
                  className={`p-3 rounded-xl border text-left font-mono transition-all ${
                    workload === 'gaming'
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">4K Gaming</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">High FPS &amp; Ray Tracing</div>
                </button>

                <button
                  type="button"
                  onClick={() => setWorkload('ai')}
                  className={`p-3 rounded-xl border text-left font-mono transition-all ${
                    workload === 'ai'
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">AI / Multi-GPU</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Local LLMs &amp; PyTorch</div>
                </button>

                <button
                  type="button"
                  onClick={() => setWorkload('cad')}
                  className={`p-3 rounded-xl border text-left font-mono transition-all ${
                    workload === 'cad'
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">FEA / CAD Workstation</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">SolidWorks &amp; Rendering</div>
                </button>

                <button
                  type="button"
                  onClick={() => setWorkload('office')}
                  className={`p-3 rounded-xl border text-left font-mono transition-all ${
                    workload === 'office'
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">Business IT</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Reliable Office Desktop</div>
                </button>
              </div>
            </div>

            {/* Step 2: Thermal Management */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block">
                2. Thermal Solution / Cooling Architecture
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCooling('air')}
                  className={`p-3 rounded-xl border text-left font-mono transition-all ${
                    cooling === 'air'
                      ? 'bg-sky-500/15 border-sky-500 text-sky-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <Laptop className="w-3.5 h-3.5 text-sky-400" /> High-Airflow Tower
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Dual-tower heatsink</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCooling('aio')}
                  className={`p-3 rounded-xl border text-left font-mono transition-all ${
                    cooling === 'aio'
                      ? 'bg-sky-500/15 border-sky-500 text-sky-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <Droplet className="w-3.5 h-3.5 text-sky-400" /> 360mm AIO Liquid
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Sealed liquid loop</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCooling('custom_loop')}
                  className={`p-3 rounded-xl border text-left font-mono transition-all ${
                    cooling === 'custom_loop'
                      ? 'bg-sky-500/15 border-sky-500 text-sky-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center gap-1.5">
                    <Droplet className="w-3.5 h-3.5 text-emerald-400" /> Custom Open Water Loop
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Hardline fluid dynamics</div>
                </button>
              </div>
            </div>

            {/* Step 3: Performance Tier */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold block">
                3. Performance Tier
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTier('mid')}
                  className={`p-3 rounded-xl border text-center font-mono transition-all ${
                    tier === 'mid'
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">Standard</div>
                </button>

                <button
                  type="button"
                  onClick={() => setTier('high')}
                  className={`p-3 rounded-xl border text-center font-mono transition-all ${
                    tier === 'high'
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">High Performance</div>
                </button>

                <button
                  type="button"
                  onClick={() => setTier('ultra')}
                  className={`p-3 rounded-xl border text-center font-mono transition-all ${
                    tier === 'ultra'
                      ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">Extreme / Workstation</div>
                </button>
              </div>
            </div>
          </div>

          {/* Estimate Display Box */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="text-xs font-mono uppercase text-emerald-400 font-bold tracking-wider">
                Estimated Build Budget
              </div>
              <div className="text-4xl font-mono font-bold text-slate-100">
                ~${calculateEstimate().toLocaleString()} USD
              </div>
              <p className="text-xs font-sans text-slate-400 leading-relaxed">
                Includes parts selection, mechanical assembly, stress testing, thermal calibration, Windows OS setup, and Pure Computers warranty.
              </p>

              <div className="border-t border-slate-800/80 pt-3 space-y-1.5 text-xs font-mono text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Workload Profile:</span>
                  <span className="text-slate-100 font-bold uppercase">{workload}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Thermal Solution:</span>
                  <span className="text-slate-100 font-bold uppercase">{cooling.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Assembly &amp; Testing:</span>
                  <span className="text-emerald-400 font-bold">Included</span>
                </div>
              </div>
            </div>

            <a
              href={`mailto:${profileData.emails[1]}?subject=Quote%20Request%20for%20Custom%20Build%20($${calculateEstimate()})&body=Hi%20Nate,%20I%20would%20like%20to%20request%20a%20custom%20PC%20build%20consultation%20with%20workload:%20${workload},%20cooling:%20${cooling},%20tier:%20${tier}.`}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold text-center transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Request Formal Build Quote</span>
            </a>
          </div>
        </div>
      </div>

      {/* Direct Service Request / Consultation Form */}
      <div className={`p-8 rounded-3xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} space-y-6`}>
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-mono font-bold text-slate-100">
              Submit Service Request or Consultation
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Get in touch directly with Nate Mina for repairs, upgrades, or custom computer inquiries
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmitQuote} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300">Your Full Name</label>
              <input
                type="text"
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Alex Mercer"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-slate-300">Your Email Address</label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="e.g. alex@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-300">Service Needed</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setServiceCategory('build')}
                className={`py-2 px-3 rounded-lg border text-xs font-mono transition-all ${
                  serviceCategory === 'build'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Custom PC Build
              </button>
              <button
                type="button"
                onClick={() => setServiceCategory('repair')}
                className={`py-2 px-3 rounded-lg border text-xs font-mono transition-all ${
                  serviceCategory === 'repair'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Hardware Repair
              </button>
              <button
                type="button"
                onClick={() => setServiceCategory('it')}
                className={`py-2 px-3 rounded-lg border text-xs font-mono transition-all ${
                  serviceCategory === 'it'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Managed IT Support
              </button>
              <button
                type="button"
                onClick={() => setServiceCategory('data')}
                className={`py-2 px-3 rounded-lg border text-xs font-mono transition-all ${
                  serviceCategory === 'data'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Data Recovery
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-300">Project Details or System Issue</label>
            <textarea
              rows={3}
              value={contactMsg}
              onChange={(e) => setContactMsg(e.target.value)}
              placeholder="Describe your computer hardware requirements, preferred specs, or symptoms if requesting repair..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:border-emerald-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-colors shadow-lg flex items-center justify-center gap-2"
          >
            {formSent ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Request Received! We will respond shortly.</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Service Inquiry to Pure Computers</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
