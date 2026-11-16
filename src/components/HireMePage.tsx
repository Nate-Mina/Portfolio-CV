import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Building2,
  Code2,
  Sparkles,
  MapPin,
  Mail,
  Phone,
  Send,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Cpu,
  Wrench,
  Music,
  Server,
  Award,
  UserCheck,
  ArrowRight,
  Globe,
} from 'lucide-react';
import { JekyllTheme, PortfolioTabId } from '../types';
import { profileData } from '../data/profileData';
import { useToast } from '../context/ToastContext';
import { handleImageError } from '../utils/imageUtils';

export type HireInquiryType = 'employer' | 'contract' | 'portfolio_build';

interface HireMePageProps {
  currentTheme: JekyllTheme;
  initialInquiryType?: HireInquiryType;
  onNavigateTab: (tab: PortfolioTabId) => void;
}

const INQUIRY_OPTIONS: {
  id: HireInquiryType;
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ReactNode;
}[] = [
  {
    id: 'employer',
    title: 'Employer / Full-Time Role',
    subtitle: "I'm an employer or recruiter interested in hiring Nate for a technical or leadership role.",
    badge: 'Engineering / IT',
    icon: <Building2 className="w-5 h-5 text-sky-400" />,
  },
  {
    id: 'contract',
    title: 'Contract / Consulting Job',
    subtitle: 'I want to hire Nate for a contract engineering, IT infrastructure, automation, or custom build job.',
    badge: 'Project / Contract',
    icon: <Wrench className="w-5 h-5 text-amber-400" />,
  },
  {
    id: 'portfolio_build',
    title: 'Interactive Portfolio Like This One',
    subtitle: 'I want Nate to build me a custom interactive portfolio / link-in-bio site starting at $20.',
    badge: 'From $20',
    icon: <Sparkles className="w-5 h-5 text-emerald-400" />,
  },
];

export const HireMePage: React.FC<HireMePageProps> = ({
  currentTheme,
  initialInquiryType = 'contract',
  onNavigateTab,
}) => {
  const { showSuccess, showError } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [organization, setOrganization] = useState('');
  const [inquiryType, setInquiryType] = useState<HireInquiryType>(initialInquiryType);
  const [budgetOrTimeline, setBudgetOrTimeline] = useState('');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    mailtoUrl: string;
    plainText: string;
    emailDispatched: boolean;
  } | null>(null);
  const [copiedEmailText, setCopiedEmailText] = useState(false);

  useEffect(() => {
    setInquiryType(initialInquiryType);
  }, [initialInquiryType]);

  const buildEmailPayload = () => {
    const selectedOption = INQUIRY_OPTIONS.find((opt) => opt.id === inquiryType);
    const typeLabel = selectedOption ? selectedOption.title : inquiryType;

    const subject = `[Hire Nate: ${typeLabel}] Inquiry from ${name} (${location})`;
    const bodyLines = [
      `Hi Nate,`,
      ``,
      `I reached out via the Hire Me page on your portfolio.`,
      ``,
      `--- Contact & Background ---`,
      `Who I am: ${name}${organization ? ` (${organization})` : ''}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : null,
      `Where I'm from: ${location}`,
      `Hiring Interest: ${typeLabel}`,
      budgetOrTimeline ? `Role / Timeline / Budget: ${budgetOrTimeline}` : null,
      ``,
      `--- Details ---`,
      message.trim() || 'Looking forward to connecting!',
    ].filter((line): line is string => line !== null);

    const plainText = bodyLines.join('\n');
    const primaryEmail = 'NateMina@gmail.com';
    const ccEmail = 'nate@purecomp.onmicrosoft.com';
    const mailtoUrl = `mailto:${primaryEmail}?cc=${encodeURIComponent(ccEmail)}&subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(plainText)}`;

    return { mailtoUrl, plainText };
  };

  const triggerMailto = (mailtoUrl: string) => {
    const anchor = document.createElement('a');
    anchor.href = mailtoUrl;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !location.trim()) {
      showError('Missing Fields', 'Please enter your name, email address, and where you are from.');
      return;
    }

    setSubmitting(true);
    const { mailtoUrl, plainText } = buildEmailPayload();
    let emailDispatched = false;

    try {
      const res = await fetch('/api/hire-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          location: location.trim(),
          organization: organization.trim(),
          inquiryType,
          budgetOrTimeline: budgetOrTimeline.trim(),
          message: message.trim(),
        }),
      });
      if (res.ok) {
        const json = await res.json();
        emailDispatched = Boolean(json?.emailDispatched);
      }
    } catch {
      // Static-only fallback still opens the user's email client directly
    } finally {
      setSubmitting(false);
    }

    setSubmittedData({ mailtoUrl, plainText, emailDispatched });
    triggerMailto(mailtoUrl);

    showSuccess(
      'Inquiry Prepared!',
      emailDispatched
        ? 'Your inquiry was sent directly to Nate and saved.'
        : 'Your email draft is ready — confirm sending in your mail client or copy the message below.'
    );
  };

  const handleCopyMessage = () => {
    if (!submittedData) return;
    navigator.clipboard.writeText(submittedData.plainText);
    setCopiedEmailText(true);
    setTimeout(() => setCopiedEmailText(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Hero Banner */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} shadow-2xl relative overflow-hidden space-y-6`}
      >
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src={profileData.avatarUrl}
              alt={profileData.name}
              data-filename="MAIN.jpg"
              onError={(e) => handleImageError(e, 'MAIN.jpg')}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-xl shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Available for Full-Time, Contract &amp; Custom Portfolio Builds</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold text-slate-100 tracking-tight">
                Hire Nathaniel (Nate) Mina
              </h1>
              <p className="text-xs sm:text-sm font-sans text-slate-300 max-w-2xl leading-relaxed">
                Mechanical Engineer (RIT B.S.), Systems Architect, CEO of{' '}
                <strong className="text-emerald-400">Pure Computers</strong>, and full-stack builder. Whether you&apos;re hiring for an engineering role, need a tough technical contract solved, or want a custom interactive portfolio built starting at <strong className="text-amber-300">$20</strong>—let&apos;s build something great.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap lg:flex-col gap-2 shrink-0">
            <a
              href="tel:5854841764"
              className="px-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-emerald-500/50 text-xs font-mono text-slate-200 flex items-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>{profileData.phone}</span>
            </a>
            <a
              href="mailto:NateMina@gmail.com"
              className="px-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-sky-500/50 text-xs font-mono text-slate-200 flex items-center gap-2 transition-colors"
            >
              <Mail className="w-4 h-4 text-sky-400" />
              <span>NateMina@gmail.com</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Split Grid: Left About Me Info | Right Email Contact Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: About Me Summary & Capabilities */}
        <div className="lg:col-span-5 space-y-6">
          <div
            className={`p-6 rounded-2xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} shadow-xl space-y-5`}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-mono font-bold text-slate-100">
                  About Me Snapshot
                </h2>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                Polymath Profile
              </span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm font-sans text-slate-300 leading-relaxed">
              <p>
                I&apos;m a mechanical engineer turned systems architect and entrepreneur who thrives at the intersection of physical engineering, resilient IT infrastructure, and modern full-stack software.
              </p>
              <p>
                With over a decade leading <strong className="text-slate-100">Pure Computers</strong>, engineering marine fiber networks for <strong className="text-slate-100">Waveguide Communications</strong>, and designing energy systems at <strong className="text-slate-100">Siemens Energy</strong>, I approach every problem from first principles—and also produce original music under <strong className="text-purple-300">DomInNATEly</strong>.
              </p>
            </div>

            {/* Core Highlight Cards */}
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-3">
                <Cpu className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-mono font-bold text-slate-100">
                    Systems &amp; Hardware Architecture
                  </div>
                  <p className="text-[11px] font-sans text-slate-400 mt-0.5">
                    Custom multi-GPU compute nodes, liquid thermal loops, marine IT, and enterprise networking.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-3">
                <Server className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-mono font-bold text-slate-100">
                    Full-Stack Web, AI &amp; Automation
                  </div>
                  <p className="text-[11px] font-sans text-slate-400 mt-0.5">
                    React, TypeScript, Express, Python pipelines, Power Automate, and Gemini / local LLM workflows.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-3">
                <Award className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-mono font-bold text-slate-100">
                    RIT B.S. Mechanical Engineering
                  </div>
                  <p className="text-[11px] font-sans text-slate-400 mt-0.5">
                    Minor in Mathematics &amp; Computer Science • Dean&apos;s List • SolidWorks, AutoCAD &amp; FEA.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-3">
                <Music className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-mono font-bold text-slate-100">
                    Creative Direction &amp; Philosophy
                  </div>
                  <p className="text-[11px] font-sans text-slate-400 mt-0.5">
                    Author of <em>&ldquo;The System &amp; The Soul&rdquo;</em> and electronic/alt-rock artist as @DomInNATEly.
                  </p>
                </div>
              </div>
            </div>

            {/* Deep Links to Explore More */}
            <div className="pt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onNavigateTab('about')}
                className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-300 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Read Full About Me</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('resume')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>View CV &amp; Resume</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('portfolio')}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>See Works</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* $20 Custom Interactive Portfolio Promo Box */}
          <div className="p-6 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/50 via-slate-900 to-sky-950/40 shadow-xl space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-4 h-4" />
                <span>Custom Portfolio Package</span>
              </span>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950">
                From $20
              </span>
            </div>
            <h3 className="text-base font-mono font-bold text-slate-100">
              Want an Interactive Portfolio Like This One?
            </h3>
            <p className="text-xs font-sans text-slate-300 leading-relaxed">
              Get a fast, modern, mobile-ready Link-in-Bio &amp; interactive portfolio tailored to your brand, resume, music, or business starting at <strong className="text-emerald-400">$20</strong>. <strong>First, text me at 585-484-1764</strong> and I will call you as soon as possible!
            </p>
            <button
              type="button"
              onClick={() => setInquiryType('portfolio_build')}
              className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition-colors cursor-pointer"
            >
              Select &ldquo;$20+ Portfolio Build&rdquo; in Form &rarr;
            </button>
          </div>
        </div>

        {/* Right Column: Contact & Hire Form */}
        <div className="lg:col-span-7">
          <div
            className={`p-6 sm:p-8 rounded-2xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} shadow-2xl space-y-6`}
          >
            <div className="border-b border-slate-800 pb-4 space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                <Mail className="w-4 h-4" />
                <span>Direct Email Inquiry</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-mono font-bold text-slate-100">
                Tell Me About You &amp; Your Project
              </h2>
              <p className="text-xs font-sans text-slate-400">
                Fill out who you are, where you&apos;re from, and what you&apos;re looking to hire me for—this will record your inquiry and open a pre-addressed email straight to Nate.
              </p>
            </div>

            {submittedData ? (
              <div className="p-6 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h3 className="text-base font-mono font-bold text-emerald-300">
                      {submittedData.emailDispatched
                        ? 'Email Sent & Inquiry Recorded!'
                        : 'Inquiry Saved & Email Ready to Send!'}
                    </h3>
                    <p className="text-xs font-sans text-slate-300 leading-relaxed">
                      {submittedData.emailDispatched
                        ? 'Your message was emailed directly to Nate and saved on the server. Your mail client was also opened if you want a local copy.'
                        : 'Your inquiry has been logged and your default email app was triggered to shoot an email directly to NateMina@gmail.com. If your mail app did not open automatically, use the buttons below:'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {submittedData.plainText}
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <a
                    href={submittedData.mailtoUrl}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Open Email Client</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedEmailText ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied Email Body!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Message</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSubmittedData(null)}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono transition-colors cursor-pointer ml-auto"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Step 1: Inquiry Type Selection */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-mono font-bold text-slate-200">
                    1. How are you looking to hire me? <span className="text-rose-400">*</span>
                  </label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {INQUIRY_OPTIONS.map((opt) => {
                      const active = inquiryType === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setInquiryType(opt.id)}
                          className={`text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                            active
                              ? 'bg-emerald-500/10 border-emerald-500 shadow-md shadow-emerald-950/30'
                              : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                            {opt.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span
                                className={`text-xs sm:text-sm font-mono font-bold ${
                                  active ? 'text-emerald-300' : 'text-slate-100'
                                }`}
                              >
                                {opt.title}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                                {opt.badge}
                              </span>
                            </div>
                            <p className="text-[11px] font-sans text-slate-400 mt-1 leading-relaxed">
                              {opt.subtitle}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: Who they are */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-bold text-slate-200">
                      2. Who are you? (Your Name) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 outline-none text-xs font-mono text-slate-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-bold text-slate-200">
                      Company / Organization (Optional)
                    </label>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="e.g. Acme Engineering / Independent"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 outline-none text-xs font-mono text-slate-100"
                    />
                  </div>
                </div>

                {/* Step 3: Where they're from & Contact info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>
                        3. Where are you from? <span className="text-rose-400">*</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Rochester, NY / Austin, TX / Remote"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 outline-none text-xs font-mono text-slate-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-bold text-slate-200">
                      Your Email Address <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 outline-none text-xs font-mono text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-bold text-slate-200">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 outline-none text-xs font-mono text-slate-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-mono font-bold text-slate-200">
                      {inquiryType === 'employer'
                        ? 'Role / Position Title'
                        : inquiryType === 'portfolio_build'
                        ? 'Target Budget / Style Preference'
                        : 'Project Timeline / Budget'}
                    </label>
                    <input
                      type="text"
                      value={budgetOrTimeline}
                      onChange={(e) => setBudgetOrTimeline(e.target.value)}
                      placeholder={
                        inquiryType === 'employer'
                          ? 'e.g. Senior Systems Engineer'
                          : inquiryType === 'portfolio_build'
                          ? 'e.g. $20 Starter / Custom Theme + Links'
                          : 'e.g. 2 weeks / Flexible'
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 outline-none text-xs font-mono text-slate-100"
                    />
                  </div>
                </div>

                {/* Step 4: Details */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-slate-200">
                    4. Project, Job, or Portfolio Details
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      inquiryType === 'employer'
                        ? 'Share details about the team, role responsibilities, and location/remote setup...'
                        : inquiryType === 'portfolio_build'
                        ? 'Tell me about the links, sections, colors, or features you want in your custom interactive portfolio...'
                        : 'Describe the contract scope, technical stack, hardware needs, or goals...'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 outline-none text-xs font-mono text-slate-100"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Delivers to NateMina@gmail.com</span>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white text-xs font-mono font-bold shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'Sending Inquiry...' : 'Send Email to Nate'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
