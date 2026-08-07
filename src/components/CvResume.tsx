import React, { useState } from 'react';
import {
  Cpu,
  Zap,
  BarChart3,
  Code,
  FlaskConical,
  Mail,
  Globe,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Calculator,
  Download,
  Copy,
  Check,
  ChevronRight,
  Layers,
  Sparkles,
  GraduationCap,
  Briefcase,
  Award,
  ShieldCheck,
  BookOpen,
  ExternalLink,
  Camera,
  Maximize2,
} from 'lucide-react';
import { JekyllTheme } from '../types';
import { profileData } from '../data/profileData';
import { SystemCalculator } from './SystemCalculator';

interface CvResumeProps {
  currentTheme: JekyllTheme;
  onOpenTerminal: () => void;
  onOpenGallery?: () => void;
}

export const CvResume: React.FC<CvResumeProps> = ({ currentTheme, onOpenTerminal, onOpenGallery }) => {
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEmail(text);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-12">
      {/* CV Header Hero */}
      <div className={`p-8 rounded-2xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} shadow-2xl backdrop-blur-md relative overflow-hidden`}>
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Clickable Profile Avatar */}
            <div
              onClick={onOpenGallery}
              className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-0.5 bg-gradient-to-tr from-emerald-400 via-sky-500 to-emerald-600 shadow-xl shrink-0 cursor-pointer group hover:scale-105 transition-all"
              title="Click to expand & view photo gallery"
            >
              <img
                src={profileData.avatarUrl}
                alt={profileData.name}
                className="w-full h-full object-cover rounded-[14px]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 rounded-[14px] bg-slate-950/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                <Maximize2 className="w-5 h-5 text-emerald-400" />
                <span className="text-[9px] font-mono text-white mt-0.5 bg-emerald-600 px-1.5 py-0.2 rounded-full">
                  Carousel
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Mechanical Engineering, Marine IT Network Infrastructure &amp; Fiber Networks</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-mono font-bold text-slate-100 tracking-tight">
                  {profileData.name}
                </h1>

                {onOpenGallery && (
                  <button
                    type="button"
                    onClick={onOpenGallery}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold transition-all shadow-sm"
                    title="Open Interactive Photo Gallery"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Photo Gallery</span>
                  </button>
                )}
              </div>

              <p className="text-base font-mono text-emerald-400 font-semibold">
                {profileData.title}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  {profileData.location}
                </span>
                <span>&bull;</span>
                <a
                  href={profileData.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-slate-300 hover:text-emerald-400 underline transition-colors"
                >
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  PureComp.Net
                </a>
              </div>
            </div>
          </div>

          {/* Quick Contact Box */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 shrink-0">
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Primary Direct Emails
            </div>
            {profileData.emails.map((email) => (
              <div key={email} className="flex items-center justify-between gap-3 text-xs font-mono">
                <span className="text-slate-200">{email}</span>
                <button
                  onClick={() => copyToClipboard(email)}
                  className="p-1 text-slate-400 hover:text-emerald-400 transition-colors"
                  title="Copy email"
                >
                  {copiedEmail === email ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Executive Summary */}
        <div className="pt-6">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
            Executive Brief &amp; Technical Stance
          </h2>
          <p className="text-sm font-sans text-slate-300 leading-relaxed">
            {profileData.missionStatement}
          </p>
        </div>
      </div>

      {/* Education Section - Primary Focus on Mechanical Engineering */}
      <div className={`p-8 rounded-2xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} shadow-xl space-y-6`}>
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-mono font-bold text-slate-100">
              Education &amp; Academic Foundation
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Primary Field: Mechanical Engineering (Rochester Institute of Technology - RIT)
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {profileData.education.map((edu, idx) => (
            <div key={idx} className="relative pl-6 border-l-2 border-emerald-500/40 space-y-1.5">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 border-4 border-slate-950" />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-mono font-bold text-slate-100">
                  {edu.institution}
                </h3>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                  {edu.period}
                </span>
              </div>

              <div className="text-sm font-mono text-emerald-300 font-semibold">
                {edu.degree}
              </div>

              {edu.details && (
                <ul className="list-disc list-inside space-y-1 text-xs font-sans text-slate-300 pt-1">
                  {edu.details.map((detail, dIdx) => (
                    <li key={dIdx}>{detail}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Professional Experience Section */}
      <div className={`p-8 rounded-2xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} shadow-xl space-y-6`}>
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-mono font-bold text-slate-100">
              Professional Work Experience
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Mechanical Engineering, Systems Architecture, Leadership &amp; Infrastructure
            </p>
          </div>
        </div>

        <div className="space-y-8">
          {profileData.experience.map((exp, idx) => (
            <div key={idx} className="relative pl-6 border-l-2 border-sky-500/30 space-y-2">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-sky-400 border-4 border-slate-950" />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-mono font-bold text-slate-100">
                    {exp.role}
                  </h3>
                  <div className="text-xs font-mono text-emerald-400 font-semibold">
                    {exp.company} &bull; {exp.location}
                  </div>
                </div>
                <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                  {exp.period}
                </span>
              </div>

              <ul className="space-y-1.5 pt-2">
                {exp.highlights.map((highlight, hIdx) => (
                  <li key={hIdx} className="text-xs font-sans text-slate-300 flex items-start gap-2 leading-relaxed">
                    <ChevronRight className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Certifications & Recognition Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Certifications */}
        <div className={`p-6 rounded-2xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} space-y-4`}>
          <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-base border-b border-slate-800 pb-3">
            <Award className="w-5 h-5" />
            <h3>Certifications</h3>
          </div>

          <div className="space-y-3">
            {profileData.certifications.map((cert, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 group hover:border-emerald-500/50 transition-colors">
                <div className="space-y-0.5">
                  <div className="text-xs font-mono font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                    {cert.name}
                  </div>
                  {cert.issuer && <div className="text-[11px] font-mono text-slate-400">{cert.issuer}</div>}
                </div>
                {cert.url && (
                  <a
                    href={cert.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-slate-900 hover:bg-emerald-600 text-slate-400 hover:text-white transition-all shrink-0 flex items-center gap-1 text-[11px] font-mono"
                    title="Verify Certification on Coursera"
                  >
                    <span className="hidden sm:inline">Verify</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Awards & Recognition */}
        <div className={`p-6 rounded-2xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} space-y-4`}>
          <div className="flex items-center gap-2 text-violet-400 font-mono font-bold text-base border-b border-slate-800 pb-3">
            <ShieldCheck className="w-5 h-5" />
            <h3>Awards &amp; Recognition</h3>
          </div>

          <div className="space-y-3">
            {profileData.awards.map((award, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-mono font-bold text-slate-100">{award.title}</div>
                  <div className="text-[11px] font-mono text-slate-400">{award.organization}</div>
                </div>
                {award.year && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20 shrink-0">
                    {award.year}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Memberships & Languages */}
      <div className={`p-6 rounded-2xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} flex flex-col md:flex-row justify-between gap-6`}>
        <div className="space-y-2 flex-1">
          <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" /> Professional Memberships
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {profileData.memberships.map((m, idx) => (
              <span key={idx} className="text-xs font-mono px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200">
                {m}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-2 flex-1">
          <div className="text-xs font-mono uppercase tracking-wider text-sky-400 font-bold flex items-center gap-1.5">
            <Globe className="w-4 h-4" /> Languages Spoken
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <span className="text-xs font-mono px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200">
              English (Primary / Native)
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200">
              German (Professional / Working)
            </span>
            <span className="text-xs font-mono px-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200">
              Spanish (Conversational)
            </span>
          </div>
        </div>
      </div>

      {/* Mission & Systems Philosophy Section */}
      <div className={`p-8 rounded-2xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} shadow-xl space-y-6`}>
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-mono font-bold text-slate-100">
              First-Principles Objective Function
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Deterministic modeling for friction reduction
            </p>
          </div>
        </div>

        {/* LaTeX Equation Box */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-center font-mono">
          <div className="text-xs text-slate-400 uppercase tracking-widest mb-2">
            System Efficiency Objective Function
          </div>
          <div className="text-base sm:text-xl font-bold text-emerald-400 tracking-wide overflow-x-auto py-2">
            &eta; = <span className="underline underline-offset-4 decoration-emerald-500/50">Value-Generated Throughput</span> / (<span className="text-amber-300">Energy Capital</span> + <span className="text-sky-300">Time Capital Expended</span>) &rarr; max
          </div>
        </div>

        {/* Embedded Interactive Efficiency Calculator */}
        <SystemCalculator themeAccent={currentTheme.accentColor} />
      </div>

      {/* Tech Stack & Tooling Matrix */}
      <div className={`p-8 rounded-2xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} space-y-6`}>
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Code className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-mono font-bold text-slate-100">
              Tech Stack &amp; Tooling Matrix
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Mechanical Design, Automation, Computing, &amp; Infrastructure
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 bg-slate-950/60 rounded-tl-lg">Domain</th>
                <th className="py-3 px-4 bg-slate-950/60 rounded-tr-lg">Technologies &amp; Frameworks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {profileData.techStack.map((item) => (
                <tr key={item.domain} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-emerald-400 whitespace-nowrap">
                    {item.domain}
                  </td>
                  <td className="py-3.5 px-4 text-slate-200">
                    <div className="flex flex-wrap gap-2">
                      {item.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-200"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Call To Action Box */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border border-emerald-500/40 text-center space-y-4 shadow-2xl">
        <h2 className="text-2xl font-mono font-bold text-slate-100">
          Let&apos;s Connect and Build the Future
        </h2>
        <p className="text-sm font-sans text-slate-300 max-w-xl mx-auto leading-relaxed">
          Whether you are looking to scale your enterprise via custom automation workflows or require specialized hardware engineering to accelerate your computational workloads, let&apos;s build it.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <a
            href="https://www.PureComp.Net"
            target="_blank"
            rel="noopener noreferrer"
            className="py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-lg flex items-center gap-2"
          >
            <Globe className="w-4 h-4" /> Visit PureComp.Net
          </a>
          <a
            href={`mailto:${profileData.emails[0]}`}
            className="py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-mono text-xs font-bold transition-colors flex items-center gap-2"
          >
            <Mail className="w-4 h-4 text-emerald-400" /> Direct Consultation Email
          </a>
        </div>

        <p className="text-xs font-mono text-emerald-400/80 italic pt-2">
          &ldquo;Ready to optimize your tech and dominate your fate?&rdquo;
        </p>
      </div>
    </div>
  );
};
