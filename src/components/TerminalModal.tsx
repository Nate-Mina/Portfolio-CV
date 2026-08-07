import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, X, Maximize2, Minimize2, Play } from 'lucide-react';
import { profileData } from '../data/profileData';

interface TerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeThemeName: string;
}

interface CommandLog {
  command: string;
  output: React.ReactNode;
}

export const TerminalModal: React.FC<TerminalModalProps> = ({ isOpen, onClose, activeThemeName }) => {
  const [inputVal, setInputVal] = useState('');
  const [logs, setLogs] = useState<CommandLog[]>([
    {
      command: 'jekyll build --trace',
      output: (
        <div className="text-emerald-400 space-y-1 font-mono text-xs">
          <div>Configuration file: /workspace/_config.yml</div>
          <div>Source: /workspace</div>
          <div>Destination: /workspace/_site</div>
          <div>Incremental build: disabled</div>
          <div>Generating...</div>
          <div className="text-slate-300">
            Reading markdown: index.md, resume.md, links.md, case-studies.md...
          </div>
          <div className="text-emerald-300 font-semibold">
            &gt; Build completed successfully in 0.42s. Theme applied: [{activeThemeName}]
          </div>
          <div className="text-slate-400">Type &apos;help&apos; for available Jekyll CLI commands.</div>
        </div>
      ),
    },
  ]);
  const [isExpanded, setIsExpanded] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  if (!isOpen) return null;

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = inputVal.trim().toLowerCase();
    if (!cmd) return;

    let outputNode: React.ReactNode = null;

    switch (cmd) {
      case 'help':
        outputNode = (
          <div className="space-y-1 text-slate-300 text-xs font-mono">
            <div className="text-amber-400 font-semibold">Available Jekyll & Systems CLI Commands:</div>
            <div><span className="text-emerald-400">jekyll build</span> - Simulate Jekyll static site build process</div>
            <div><span className="text-emerald-400">cat resume.md</span> - Output Nathaniel Mina&apos;s raw CV/Resume</div>
            <div><span className="text-emerald-400">cat _config.yml</span> - Inspect Jekyll theme & site metadata</div>
            <div><span className="text-emerald-400">links</span> - List all bio links and social endpoints</div>
            <div><span className="text-emerald-400">sysinfo</span> - Output workstation & system architecture spec</div>
            <div><span className="text-emerald-400">efficiency</span> - Print system efficiency equation</div>
            <div><span className="text-emerald-400">clear</span> - Clear terminal window</div>
          </div>
        );
        break;

      case 'jekyll build':
      case 'jekyll serve':
        outputNode = (
          <div className="text-emerald-400 space-y-1 text-xs font-mono">
            <div>Building site with Jekyll theme [{activeThemeName}]...</div>
            <div>Liquid templates parsed. GitHub Pages deployment target: gh-pages</div>
            <div className="text-sky-300">Server address: http://localhost:4000/</div>
            <div className="text-slate-400">Server running... press CTRL-C to stop.</div>
          </div>
        );
        break;

      case 'cat resume.md':
      case 'resume':
        outputNode = (
          <div className="space-y-2 text-slate-300 text-xs font-mono bg-slate-950 p-3 rounded border border-slate-800">
            <div className="text-emerald-400 font-bold"># {profileData.name}</div>
            <div className="text-slate-400">{profileData.title} | {profileData.location}</div>
            <div className="text-amber-300">Website: {profileData.website} | Email: {profileData.emails[0]}</div>
            <div className="border-t border-slate-800 pt-2 text-slate-300">{profileData.missionStatement}</div>
            <div className="text-sky-400">Formula: {profileData.efficiencyFormulaLatex}</div>
          </div>
        );
        break;

      case 'cat _config.yml':
        outputNode = (
          <div className="text-amber-300 text-xs font-mono whitespace-pre bg-slate-950 p-3 rounded border border-slate-800">
{`title: ${profileData.name} - Pure Computers
description: ${profileData.bioSummary}
theme: jekyll-theme-${activeThemeName.toLowerCase().replace(/\s+/g, '-')}
baseurl: ""
url: "https://${profileData.links[0].displayUrl}"
author:
  name: "${profileData.name}"
  email: "${profileData.emails[0]}"
  location: "${profileData.location}"
plugins:
  - jekyll-seo-tag
  - jekyll-sitemap
  - jekyll-katex`}
          </div>
        );
        break;

      case 'links':
        outputNode = (
          <div className="space-y-1 text-xs font-mono">
            <div className="text-sky-400 font-bold mb-1">=== Pure Computers Link Tree ===</div>
            {profileData.links.map((link) => (
              <div key={link.id} className="flex justify-between items-center text-slate-300">
                <span className="text-emerald-400">{link.title}:</span>
                <a href={link.url} target="_blank" rel="noreferrer" className="text-slate-400 underline hover:text-white">
                  {link.displayUrl}
                </a>
              </div>
            ))}
          </div>
        );
        break;

      case 'sysinfo':
        outputNode = (
          <div className="text-slate-300 space-y-1 text-xs font-mono bg-slate-950 p-3 rounded border border-slate-800">
            <div className="text-emerald-400 font-bold">WORKSTATION & LAB SPECIFICATION</div>
            <div>[CPU]: Dual AMD EPYC / High-Clock Intel Xeon Scalable</div>
            <div>[GPU]: Multi-GPU Custom Liquid Cooled Node (Compute / LLM Inference)</div>
            <div>[OS]: Linux Kernel / Hardened Custom Workstation Runtime</div>
            <div>[Automation]: Power Automate Workflows & Local Fine-tuned LLM Hooks</div>
            <div>[Company]: Pure Computers (Pittsford & Rochester, NY)</div>
          </div>
        );
        break;

      case 'efficiency':
        outputNode = (
          <div className="text-amber-300 text-xs font-mono bg-slate-950 p-3 rounded border border-slate-800">
            <div>Systemic Efficiency Formula:</div>
            <div className="text-emerald-400 font-bold my-1">
              &eta; = Value-Generated Throughput / (Energy + Time Capital Expended)
            </div>
            <div className="text-slate-400">Target: Eliminate friction, minimize human error, maximize throughput.</div>
          </div>
        );
        break;

      case 'clear':
        setLogs([]);
        setInputVal('');
        return;

      default:
        outputNode = (
          <div className="text-rose-400 text-xs font-mono">
            Command not recognized: &apos;{cmd}&apos;. Type &apos;help&apos; for available commands.
          </div>
        );
    }

    setLogs((prev) => [...prev, { command: inputVal, output: outputNode }]);
    setInputVal('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div
        className={`relative w-full ${
          isExpanded ? 'max-w-5xl h-[85vh]' : 'max-w-2xl h-[550px]'
        } rounded-xl border border-slate-700 bg-slate-950 shadow-2xl flex flex-col overflow-hidden transition-all duration-200`}
      >
        {/* Terminal Window Header */}
        <div className="flex items-center justify-between bg-slate-900 px-4 py-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80 cursor-pointer" onClick={onClose} />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <TerminalIcon className="w-3.5 h-3.5 text-emerald-400" />
              nate@purecomp-gh-pages: ~/site
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Terminal Output Area */}
        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-4">
          {logs.map((log, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center gap-2 text-slate-400">
                <span className="text-emerald-400 font-bold">$</span>
                <span className="text-slate-100 font-semibold">{log.command}</span>
              </div>
              <div className="pl-4">{log.output}</div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Terminal Input Bar */}
        <form onSubmit={handleCommand} className="flex items-center gap-2 p-3 bg-slate-900 border-t border-slate-800">
          <span className="text-emerald-400 font-bold text-xs font-mono">$</span>
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Type 'help', 'jekyll build', 'resume', or 'sysinfo'..."
            className="flex-1 bg-transparent border-none text-xs font-mono text-slate-100 focus:outline-none placeholder:text-slate-600"
            autoFocus
          />
          <button
            type="submit"
            className="p-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
