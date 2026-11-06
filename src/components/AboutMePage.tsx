import React, { useState } from 'react';
import {
  BookOpen,
  Music,
  Cpu,
  Compass,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Activity,
  Award,
  Layers,
  Wrench,
  Radio,
  FileText,
  Terminal,
  QrCode,
  Zap,
  ArrowRight,
  CheckCircle2,
  Server,
  Heart,
  Globe,
} from 'lucide-react';
import { JekyllTheme } from '../types';
import { profileData } from '../data/profileData';

interface AboutMePageProps {
  currentTheme: JekyllTheme;
  onOpenTerminal: () => void;
  onOpenQr: () => void;
  onOpenGallery?: () => void;
}

export const AboutMePage: React.FC<AboutMePageProps> = ({
  currentTheme,
  onOpenTerminal,
  onOpenQr,
  onOpenGallery,
}) => {
  // Page mode: 'both' | 1 | 2
  const [currentPage, setCurrentPage] = useState<'both' | 1 | 2>('both');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Page Navigation Controls */}
      <div className={`p-6 sm:p-8 rounded-3xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} shadow-xl relative overflow-hidden backdrop-blur-md space-y-5`}>
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border-b border-slate-800 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Executive Memoir &amp; Career Synthesis</span>
              </span>
              <span className="text-xs font-mono text-slate-400">
                2-Page Edition
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold text-slate-100 tracking-tight">
              About Nathaniel (Nate) Mina
            </h1>
            <p className="text-xs sm:text-sm font-sans text-slate-300">
              The concise two-page synthesis of my autobiography <em>&ldquo;The System &amp; The Soul&rdquo;</em> combined with ten years of engineering, enterprise leadership, and sonic artistry.
            </p>
          </div>

          {/* Quick Page View Switcher */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shrink-0 text-xs font-mono font-semibold">
            <button
              onClick={() => setCurrentPage('both')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                currentPage === 'both'
                  ? 'bg-purple-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Complete (2 Pages)
            </button>
            <button
              onClick={() => setCurrentPage(1)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                currentPage === 1
                  ? 'bg-emerald-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Page 1: The Engineer
            </button>
            <button
              onClick={() => setCurrentPage(2)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                currentPage === 2
                  ? 'bg-sky-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Page 2: The Musician &amp; Soul
            </button>
          </div>
        </div>

        {/* Quick Credentials Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-300 pt-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span><strong>B.S. Mechanical Engineering</strong> &bull; RIT (7% Cohort)</span>
          </div>
          <div>
            <span><strong>CEO &amp; Founder</strong> &bull; Pure Computers</span>
          </div>
          <div>
            <span><strong>Artist &amp; Composer</strong> &bull; DomInNATEly</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://www.tiktok.com/@dominnately"
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-400 hover:underline inline-flex items-center gap-1"
            >
              <Radio className="w-3 h-3" />
              <span>@dominnately</span>
            </a>
          </div>
        </div>
      </div>

      {/* ================= PAGE 1 ================= */}
      {(currentPage === 'both' || currentPage === 1) && (
        <article className={`p-8 sm:p-10 rounded-3xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} shadow-2xl relative overflow-hidden backdrop-blur-md space-y-6 transition-all`}>
          {/* Page Top Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-bold text-xs">
                PAGE 01 / 02
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-mono font-bold text-slate-100">
                  Part I: The Analytical Blueprint &amp; The Crucible
                </h2>
                <p className="text-[11px] font-mono text-slate-400">
                  Bunker Foundations &bull; RIT&apos;s 7% Crucible &bull; Marine IT &amp; Siemens &bull; The Napkin Bucket List
                </p>
              </div>
            </div>

            <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">
              Deterministic Systems
            </span>
          </div>

          {/* Narrative Content */}
          <div className="space-y-4 font-sans text-slate-200 text-sm sm:text-base leading-relaxed">
            <p>
              I have spent my life approaching reality through a first-principles engineering lens. Raised in Henrietta, New York
              amid volatile domestic friction, I quickly discovered that while human behavior can feel unpredictable, the physical universe
              is bound by unyielding laws. When shouting matches shook the house, my father and I physically rebuilt our basement into
              a subterranean sanctuary—learning early that concrete, copper circuits, and deterministic logic offered safety when emotional
              systems failed.
            </p>

            <p>
              Transitioning abruptly from home study to public high school in the 9th grade, administrators warned I was at risk of failing.
              My response was to treat the classroom as an empirical laboratory: I took exhaustive, graduate-level notes and graduated with
              a <strong>99.4% GPA</strong>, simultaneously reverse-engineering high school social dynamics through self-deprecating humor and athletics.
            </p>

            {/* Embedded Resume & Career Matrix Callout */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3 my-4">
              <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-2">
                <Server className="w-4 h-4" />
                <span>Engineering &amp; Enterprise Track Record</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-sans text-slate-300">
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <strong className="text-slate-100 block font-mono">Rochester Institute of Tech (RIT)</strong>
                  <span className="text-[11px] text-slate-400 block pb-1">B.S. Mechanical Engineering</span>
                  Conquered the notorious 7% cohort graduation rate, mastering solid mechanics, thermodynamics, fluid dynamics, and FEA.
                </div>
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <strong className="text-slate-100 block font-mono">Waveguide Communications</strong>
                  <span className="text-[11px] text-slate-400 block pb-1">Marine IT Project Lead (Germany/FL)</span>
                  Architected shipboard fiber network infrastructure for global vessels; conducted Finite Element Analysis for harsh marine stress.
                </div>
                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <strong className="text-slate-100 block font-mono">Siemens Energy Global</strong>
                  <span className="text-[11px] text-slate-400 block pb-1">Munich Technical Design Lead</span>
                  Led a 10-engineer team delivering three flagship hardware/software products generating $10M in revenue on a $1M budget.
                </div>
              </div>
            </div>

            <p>
              Then, in late 2008 at age 22, the physical machine failed. Walking home from RIT, I suffered a spontaneous
              <strong> tension pneumothorax</strong>—a life-threatening lung collapse that compressed my thoracic cavity. At Highland Hospital,
              an initial quarter-inch chest tube was prematurely removed; my lung immediately re-collapsed, and doctors impaled a crude
              one-inch PVC pipe directly between my ribs for ten days of agonizing immobility. Fainting from pain before my finger could
              depress the nurse call switch, I experienced the total stripping of bodily control.
            </p>

            <p>
              Lying in that bed, convinced death was near, I scrawled a fearless <strong>bucket list on a hospital napkin</strong>, vowing
              to compress a lifetime of risk, enterprise, and intensity into a single decade.
              <strong className="text-emerald-300 font-mono ml-1">I completed every single item on that napkin by age 27.</strong>
              Yet at the bottom of the list lay the unoptimized question: <em>&ldquo;Now what?&rdquo;</em>
            </p>
          </div>

          {/* Page Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500">
            <span>The System &amp; The Soul &bull; Part I Summary</span>
            {currentPage === 1 && (
              <button
                onClick={() => setCurrentPage(2)}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold cursor-pointer"
              >
                <span>Proceed to Page 2</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </article>
      )}

      {/* ================= PAGE 2 ================= */}
      {(currentPage === 'both' || currentPage === 2) && (
        <article className={`p-8 sm:p-10 rounded-3xl border ${currentTheme.borderClass} ${currentTheme.cardBgClass} shadow-2xl relative overflow-hidden backdrop-blur-md space-y-6 transition-all`}>
          {/* Page Top Header Bar */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono font-bold text-xs">
                PAGE 02 / 02
              </span>
              <div>
                <h2 className="text-lg sm:text-xl font-mono font-bold text-slate-100">
                  Part II: The Creative Awakening &amp; The Polymath Soul
                </h2>
                <p className="text-[11px] font-mono text-slate-400">
                  Cognitive Debugging &bull; Becoming DomInNATEly &bull; Pure Computers &bull; Applied Thermodynamics
                </p>
              </div>
            </div>

            <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-purple-300">
              Creative &amp; Philosophical Synthesis
            </span>
          </div>

          {/* Narrative Content */}
          <div className="space-y-4 font-sans text-slate-200 text-sm sm:text-base leading-relaxed">
            <p>
              The post-operative recovery introduced pharmaceutical opioids. When someone noted that intranasal ingestion yielded
              ~95% bioavailability versus ~50% oral absorption, my analytical mind fell into a lethal trap: weaponizing efficiency against
              my own survival. Breaking free required treating the mind as software. Through <strong>AVRT (Addictive Voice Recognition Training)</strong>,
              I learned cognitive debugging: isolating the primitive addictive voice (&ldquo;The Beast&rdquo;) as corrupted background malware
              and commanding prefrontal executive authority: <em>&ldquo;I hear you; I will not comply.&rdquo;</em>
            </p>

            {/* The Pivotal Musical Awakening Callout */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/60 to-slate-900/90 border border-purple-800/60 space-y-3 my-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-mono text-purple-300 font-bold flex items-center gap-2">
                  <Music className="w-4 h-4 text-purple-400" />
                  <span>The Unexpected Muse: DomInNATEly Music</span>
                </span>
                <a
                  href="https://nate-mina.github.io/DomInNATEly/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-purple-300 hover:text-white underline font-semibold flex items-center gap-1"
                >
                  <span>Listen on Music Portfolio</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="text-sm font-sans text-purple-100 leading-relaxed">
                If you had asked me in high school or while grinding through fluid mechanics at RIT what I would be doing today,
                <strong> writing original music and producing albums would have been the absolute LAST thing I ever envisioned myself doing.</strong>
                In school, I was strictly the guy with the graphing calculator, the tennis racket, and the circuit schematics.
              </p>
              <p className="text-xs font-sans text-slate-300 leading-relaxed">
                Yet as I healed, I discovered that mathematics can diagnose a system failure, but it cannot express the ache of survival.
                Under the artist moniker <strong className="text-white font-mono">DomInNATEly</strong>, sound synthesis became applied physics
                elevated into emotional truth—merging acoustic frequency envelopes, heavy guitar riffs, and melodic ballads to express what
                no differential equation ever could.
              </p>
            </div>

            <p>
              This realization culminated in love and philosophy. When relationships were tested by past trauma firewalls, my instinct was
              to present formal game theory and the <strong>Trust Equation</strong>:
              <span className="font-mono text-purple-300 font-bold mx-1">T = (R + I) / S</span>
              (Trust = Reliability + Intimacy / Self-Orientation). But human hearts are not algorithms to be solved. Love requires accepting
              vulnerability without a mathematical guarantee.
            </p>

            <p>
              Today, I channel this polymath union of discipline and art into my daily work. As CEO of <strong>Pure Computers</strong> (www.PureComp.Net),
              I design bespoke liquid-cooled workstations, multi-GPU AI compute clusters, and managed IT pipelines with zero tolerance for failure.
              At home, I designed a closed-loop <strong>residential-to-pool thermodynamic heat-recovery system</strong>, routing heat from compute
              nodes to warm outdoor pool water—defying conventional utility bills through deterministic thermal engineering.
            </p>

            <blockquote className="p-4 rounded-2xl bg-slate-950/80 border-l-4 border-purple-500 font-mono text-xs sm:text-sm text-slate-300 italic">
              &ldquo;Surviving the human condition ultimately requires accepting chaos, embracing vulnerability, and recognizing that love,
              trust, and healing reside in spaces that no calculator can ever fully map. The equation does not resolve. You solve it anyway.&rdquo;
            </blockquote>
          </div>

          {/* Page 2 Action Footer */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <span className="text-slate-500">The System &amp; The Soul &bull; Part II Summary</span>

            <div className="flex flex-wrap items-center gap-2">
              <a
                href="https://www.PureComp.Net"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition-all"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Pure Computers</span>
              </a>

              <a
                href="https://nate-mina.github.io/DomInNATEly/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold flex items-center gap-1.5 transition-all"
              >
                <Music className="w-3.5 h-3.5" />
                <span>DomInNATEly Music</span>
              </a>

              <button
                onClick={onOpenTerminal}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-400 border border-slate-800 font-bold flex items-center gap-1.5 transition-all"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>CLI Terminal</span>
              </button>
            </div>
          </div>
        </article>
      )}
    </div>
  );
};
