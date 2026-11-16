import express from 'express';
import type { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini SDK client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

const SYSTEM_INSTRUCTION = `
You are the personal AI Assistant for Nathaniel (Nate) Mina on his official portfolio and Pure Computers business platform.

COMPREHENSIVE KNOWLEDGE ABOUT NATE MINA & HIS SITES:
- Personal Info: Nathaniel (Nate) K. Mina, located in Rochester & Pittsford, NY.
- Roles: Mechanical Engineer (B.S. Mechanical Engineering from RIT), Marine IT Network infrastructure specialist, Systems Architect, Tech Entrepreneur, Founder & CEO of Pure Computers (www.PureComp.Net), Musician / Composer (DomInNATEly Music), and Philosopher/Writer.
- Polymath Evolution & Memoir ("The System & The Soul"):
  * Started as a hyper-analytical mechanical engineer surviving RIT's brutal 7% graduation rate.
  * In 2008, survived a sudden tension pneumothorax (collapsed lung) and spent 10 days at Highland Hospital impaled by a PVC chest tube; wrote a bucket list on a hospital napkin and completed every item by age 27.
  * Overcame prescription opioid addiction through AVRT (Addictive Voice Recognition Training) by treating the addictive voice ("The Beast") as corrupted malware and using prefrontal executive logic to regain autonomy.
  * THE UNEXPECTED MUSE: In high school or college, writing music would have been the ABSOLUTE LAST thing Nate ever envisioned himself doing! Music was something other people did. Yet as he healed, musical composition under the moniker "DomInNATEly" became the vital bridge between mathematical wave mechanics (acoustics, frequencies, harmonic ratios) and raw emotional vulnerability.
  * Memoir "The System & The Soul" explores the boundary between deterministic systems (like the Trust Equation T = (R + I) / S) and the unmappable spaces of the human heart.
- Company: Pure Computers (www.PureComp.Net) — specializing in custom high-performance workstations, bespoke liquid cooling loops, FEA/CAD engineering workstations, multi-GPU AI compute clusters, hardware diagnostics, and managed IT.
- Contact: Work line: 585-484-1764 (Call or Text 24/7). Email: nate@purecomp.onmicrosoft.com or NateMina@gmail.com.

OFFICIAL SOCIAL & PORTFOLIO LINKS (Provide these exact URLs when asked):
- TikTok: https://www.tiktok.com/@dominnately (@dominnately) - Short-form AI tech, engineering breakdowns, and music snippets.
- Polymath Hub: https://nate-mina.github.io/Polymath/ (Repo: https://github.com/Nate-Mina/Polymath) - Calibrated psychometric and technical assessment across 15 technical university degree fields and 5 classical humanities disciplines.
- Portfolio & CV: https://nate-mina.github.io/Portfolio-CV/ (Repo: https://github.com/Nate-Mina/Portfolio-CV) - Interactive portfolio, link-in-bio, and CV platform.
- Music Portfolio: https://nate-mina.github.io/DomInNATEly/ - Official music portfolio site featuring original compositions, soundscapes, and audio releases.
- YouTube: https://www.youtube.com/@DomInNATEly (@DomInNATEly) - Official music audio & video catalogue.
- Pure Computers: https://www.PureComp.Net - Enterprise custom workstations and IT managed services.
- GitHub: https://github.com/Nate-Mina (Nate-Mina) - Open-source software, full-stack apps, and algorithmic code.
- LinkedIn: https://linkedin.com/in/dom-i-nate (dom-i-nate) - Professional engineering background & business leadership.
- Facebook: https://facebook.com/NateMina - Community outreach and updates.
- Instagram: https://instagram.com/dom.i_nate (@dom.i_nate) - Visual stories and behind-the-scenes updates.

YOUR PRIMARY BEHAVIOR & PROTOCOLS:
1. GREETING & INTRODUCTION:
   - When asked who Nate is, explain his journey as a polymath: mechanical engineer, founder of Pure Computers, musician (DomInNATEly), and writer.
   - Mention his TikTok (@dominnately) or portfolio links when relevant.

2. TECHNICAL SUPPORT RESOLUTION PROTOCOL (CRITICAL REQUIREMENT):
   - When asked any technical support question, hardware failure, crash, BSOD code, or diagnostic symptom, **YOU MUST FIRST ATTEMPT TO SOLVE THE PROBLEM DIRECTLY**.
   - Provide concrete, expert, step-by-step diagnostic workflows:
     * Check power supply rails, PCIe connections, and motherboard debug LEDs (CPU/DRAM/VGA/BOOT).
     * Check thermal paste, AIO cooler pump tachometers, and radiator dust clogging.
     * Memory troubleshooting: single-stick testing, MemTest86, and XMP/EXPO BIOS profiles.
     * Software/Driver diagnostics: DDU clean install, Safe Mode, 'sfc /scannow', 'DISM /Online /Cleanup-Image /RestoreHealth', and crash dump analysis.
   - DO NOT redirect the user to a consultation or contact link right away. Provide the complete troubleshooting steps first!
   - Only at the very end of your helpful troubleshooting steps, or if the user indicates they require physical bench repair / hands-on diagnostics, mention: "If you need physical bench diagnostics or hands-on repair, you can call or text Nate directly 24/7 at 585-484-1764 or book a free 15-minute consultation."

3. ACCURATE SITE & SOCIAL ANSWERS:
   - Always provide the correct TikTok handle (@dominnately) and link (https://www.tiktok.com/@dominnately).
   - Accurately share details about his autobiography "The System & The Soul" and his music portfolio.

TONE & STYLE:
- Professional, friendly, technical, resourceful, articulate, and direct.
`;

// Chat API endpoint
app.post('/api/assistant/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;

    if (!message && (!history || history.length === 0)) {
      res.status(400).json({ error: 'Message or history is required' });
      return;
    }

    if (!ai) {
      // Fallback response if GEMINI_API_KEY is not yet attached
      res.json({
        reply: `Hi there! I'm Nate Mina's AI assistant. Nate's TikTok handle is [@dominnately](https://www.tiktok.com/@dominnately). How can I assist you with tech support or custom builds today?`,
        escalationSuggested: false,
      });
      return;
    }

    // Build chat contents from history
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const turn of history) {
        if (turn.role && turn.text) {
          contents.push({
            role: turn.role === 'user' ? 'user' : 'model',
            parts: [{ text: turn.text }],
          });
        }
      }
    }

    if (message) {
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });
    }

    const generatePromise = ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI response timed out')), 20000)
    );

    let reply = '';
    try {
      const response = await Promise.race([generatePromise, timeoutPromise]);
      reply = response.text || '';
    } catch (genErr) {
      console.warn('Gemini generateContent timed out or failed, using contextual fallback:', genErr);
      const lower = (message || '').toLowerCase();
      if (lower.includes('tiktok') || lower.includes('tik tok')) {
        reply = `Nate's official TikTok handle is **@dominnately**. You can check out his short-form AI tech, engineering breakdowns, and music snippets here: [https://www.tiktok.com/@dominnately](https://www.tiktok.com/@dominnately).`;
      } else if (lower.includes('memoir') || lower.includes('autobiography') || lower.includes('system and the soul') || lower.includes('system & the soul') || lower.includes('book')) {
        reply = `Nate's autobiography is titled **"The System & The Soul: An Engineered Life"**. It chronicles his journey from RIT mechanical engineering to surviving a tension pneumothorax, overcoming cognitive addiction via AVRT, and uniting engineering with music and philosophy. Check out the dedicated **About Me** tab for the full continuous narrative!`;
      } else if (lower.includes('why music') || lower.includes('music story') || (lower.includes('music') && lower.includes('start')) || (lower.includes('music') && lower.includes('write'))) {
        reply = `In high school and college, writing music would have been the **absolute last thing Nate ever envisioned himself doing**! He lived in the world of statics, thermodynamics, and code. But while recovering from a collapsed lung at Highland Hospital, he realized that equations alone cannot express the depth of the human heart. Under the name **DomInNATEly**, he began writing songs and soundscapes—treating acoustic waveforms as the bridge between the system and the soul. Listen at [https://nate-mina.github.io/DomInNATEly/](https://nate-mina.github.io/DomInNATEly/)!`;
      } else if (lower.includes('github') || lower.includes('code') || lower.includes('repo')) {
        reply = `Nate's GitHub profile is **Nate-Mina**: [https://github.com/Nate-Mina](https://github.com/Nate-Mina), featuring open-source applications and algorithmic code.`;
      } else if (lower.includes('linkedin')) {
        reply = `Nate's LinkedIn profile is **dom-i-nate**: [https://linkedin.com/in/dom-i-nate](https://linkedin.com/in/dom-i-nate).`;
      } else if (lower.includes('youtube') || lower.includes('music')) {
        reply = `You can find Nate's music portfolio and YouTube channel below:\n• YouTube: [https://www.youtube.com/@DomInNATEly](https://www.youtube.com/@DomInNATEly)\n• Music Portfolio: [https://nate-mina.github.io/DomInNATEly/](https://nate-mina.github.io/DomInNATEly/)`;
      } else if (lower.includes('who') || lower.includes('nate') || lower.includes('about')) {
        reply = `Nathaniel (Nate) Mina is a **polymath**: mechanical engineer (RIT), entrepreneur, founder of **Pure Computers** (www.PureComp.Net), musician (**DomInNATEly**), and writer (*The System & The Soul*). His TikTok is [@dominnately](https://www.tiktok.com/@dominnately). How can I help you today with tech support, custom sales, or his work?`;
      } else if (lower.includes('support') || lower.includes('repair') || lower.includes('fix') || lower.includes('crash') || lower.includes('blue screen') || lower.includes('issue') || lower.includes('slow') || lower.includes('won\'t') || lower.includes('not')) {
        reply = `Let\\'s troubleshoot your technical issue step by step:\n\n1. **Check Physical Connections & Power**: Ensure power cables, display cables (GPU to monitor), and USB devices are securely seated. Check motherboard debug LEDs.\n2. **Thermal & Performance Check**: Monitor CPU/GPU temperatures. Clean dust filters and verify AIO pump headers or heatsink fans are spinning.\n3. **Driver & Software Updates**: If experiencing crashes or BSOD, boot into Safe Mode, run 'sfc /scannow' in Command Prompt, and update GPU/chipset drivers.\n4. **RAM Stability**: If unstable, test with a single RAM stick or reset XMP/EXPO profiles in BIOS.\n\nIf these troubleshooting steps don't resolve your issue or if you need hardware bench diagnostics, you can call or text Nate directly 24/7 at **585-484-1764**.`;
      } else if (lower.includes('consult') || lower.includes('15') || lower.includes('free') || lower.includes('website') || lower.includes('ai') || lower.includes('business')) {
        reply = `Nate offers a **free first 15-minute consultation** covering:\n• Computer tech support & hardware diagnostics\n• Custom PC build sales & workstation architecture\n• Custom website creation & full-stack development\n• AI implementation for your business or startup idea!\n\nTo lock in your free consult, call or text Nate's work number 24/7 at **585-484-1764**.`;
      } else {
        reply = `Hi! I'm Nate Mina's AI assistant. Nate is a mechanical engineer, entrepreneur, founder of Pure Computers (www.PureComp.Net), and musician (TikTok: [@dominnately](https://www.tiktok.com/@dominnately)). How can I assist you with tech support, custom sales, or a free consultation today? If you need direct help, call or text Nate 24/7 at **585-484-1764**!`;
      }
    }

    const escalationSuggested = reply.includes('585-484-1764') || reply.toLowerCase().includes('call') || reply.toLowerCase().includes('text');

    res.json({ reply, escalationSuggested });
  } catch (error: any) {
    console.error('Error generating assistant response:', error);
    res.json({
      reply: `I'm Nate Mina's AI assistant. Nate is a mechanical engineer, entrepreneur, founder of Pure Computers, and musician. For computer tech support, custom sales, or to book your free 15-minute consultation, you can call or text Nate directly 24/7 at **585-484-1764**!`,
      escalationSuggested: true,
    });
  }
});

// Text-to-Speech endpoint for Voice Mode
app.post('/api/assistant/tts', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    if (!ai) {
      res.status(503).json({ error: 'Gemini client not initialized' });
      return;
    }

    // Clean text to avoid reading out markdown asterisks or links
    const cleanText = text
      .replace(/[*_#`~\[\]]/g, '')
      .replace(/\(http[^)]+\)/g, '')
      .slice(0, 1000);

    const ttsPromise = ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanText,
              speechMetadata: {
                style: 'Clear, engaging, professional technical consultant',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('TTS generation timed out')), 6000)
    );

    const response = await Promise.race([ttsPromise, timeoutPromise]);
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      res.status(500).json({ error: 'No audio returned' });
      return;
    }

    res.json({ audio: base64Audio, mimeType: 'audio/wav' });
  } catch (error: any) {
    console.error('Error generating speech:', error);
    res.status(500).json({ error: 'TTS generation failed', details: error.message || String(error) });
  }
});

// GitHub Activity endpoint with in-memory caching
const GITHUB_USERNAME = 'Nate-Mina';
const FEATURED_REPOS = ['Polymath', 'DomInNATEly', 'Portfolio-CV'];
const GITHUB_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
let githubActivityCache: { data: any; timestamp: number } | null = null;

async function fetchGitHubJson(url: string) {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'Nate-Mina-Portfolio-Works',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GitHub API ${res.status}: ${text || res.statusText}`);
  }
  return res.json();
}

app.get('/api/github/activity', async (req: Request, res: Response) => {
  const forceRefresh = req.query.force === 'true';
  const now = Date.now();

  if (!forceRefresh && githubActivityCache && now - githubActivityCache.timestamp < GITHUB_CACHE_TTL_MS) {
    res.json({ ...githubActivityCache.data, cached: true });
    return;
  }

  try {
    const [profile, recentReposRaw] = await Promise.all([
      fetchGitHubJson(`https://api.github.com/users/${GITHUB_USERNAME}`),
      fetchGitHubJson(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=10`),
    ]);

    const recentRepos = Array.isArray(recentReposRaw) ? recentReposRaw : [];

    // Ensure all featured repos are included even if not in top 10 pushed
    const featuredRepoData = await Promise.all(
      FEATURED_REPOS.map(async (repoName) => {
        const fromList = recentRepos.find(
          (r: any) => r.name?.toLowerCase() === repoName.toLowerCase()
        );
        let repoInfo = fromList;
        if (!repoInfo) {
          try {
            repoInfo = await fetchGitHubJson(
              `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}`
            );
          } catch {
            return null;
          }
        }

        let commits: any[] = [];
        try {
          const commitsRaw = await fetchGitHubJson(
            `https://api.github.com/repos/${GITHUB_USERNAME}/${repoInfo.name}/commits?per_page=3`
          );
          if (Array.isArray(commitsRaw)) {
            commits = commitsRaw.map((c: any) => ({
              sha: c.sha,
              shortSha: (c.sha || '').slice(0, 7),
              message: c.commit?.message || '',
              headline: (c.commit?.message || '').split('\n')[0],
              authorName: c.commit?.author?.name || c.author?.login || GITHUB_USERNAME,
              authorAvatar: c.author?.avatar_url || profile.avatar_url || null,
              date: c.commit?.author?.date || repoInfo.pushed_at,
              url: c.html_url,
            }));
          }
        } catch {
          commits = [];
        }

        return {
          name: repoInfo.name,
          fullName: repoInfo.full_name,
          description: repoInfo.description || 'Featured open-source engineering project.',
          htmlUrl: repoInfo.html_url,
          homepage: repoInfo.homepage || null,
          language: repoInfo.language || 'TypeScript',
          stars: repoInfo.stargazers_count ?? 0,
          forks: repoInfo.forks_count ?? 0,
          watchers: repoInfo.watchers_count ?? 0,
          openIssues: repoInfo.open_issues_count ?? 0,
          defaultBranch: repoInfo.default_branch || 'main',
          pushedAt: repoInfo.pushed_at,
          updatedAt: repoInfo.updated_at,
          topics: Array.isArray(repoInfo.topics) ? repoInfo.topics : [],
          featured: true,
          latestCommit: commits[0] || null,
          recentCommits: commits,
        };
      })
    );

    const featuredFiltered = featuredRepoData.filter(Boolean);

    // Additional active repositories not already in FEATURED_REPOS
    const otherActiveRepos = recentRepos
      .filter(
        (r: any) =>
          !r.fork &&
          !FEATURED_REPOS.some((f) => f.toLowerCase() === (r.name || '').toLowerCase()) &&
          r.name?.toLowerCase() !== GITHUB_USERNAME.toLowerCase()
      )
      .slice(0, 4)
      .map((r: any) => ({
        name: r.name,
        fullName: r.full_name,
        description: r.description || 'Active repository',
        htmlUrl: r.html_url,
        homepage: r.homepage || null,
        language: r.language || 'TypeScript',
        stars: r.stargazers_count ?? 0,
        forks: r.forks_count ?? 0,
        watchers: r.watchers_count ?? 0,
        openIssues: r.open_issues_count ?? 0,
        defaultBranch: r.default_branch || 'main',
        pushedAt: r.pushed_at,
        updatedAt: r.updated_at,
        topics: Array.isArray(r.topics) ? r.topics : [],
        featured: false,
        latestCommit: null,
        recentCommits: [],
      }));

    // Recent commits aggregated across featured projects
    const recentCommitsTimeline = featuredFiltered
      .flatMap((repo: any) =>
        (repo.recentCommits || []).map((c: any) => ({
          ...c,
          repoName: repo.name,
          repoFullName: repo.fullName,
          repoUrl: repo.htmlUrl,
        }))
      )
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);

    const payload = {
      username: GITHUB_USERNAME,
      profile: {
        login: profile.login || GITHUB_USERNAME,
        name: profile.name || 'Nathaniel Mina',
        avatarUrl: profile.avatar_url || null,
        htmlUrl: profile.html_url || `https://github.com/${GITHUB_USERNAME}`,
        publicRepos: profile.public_repos ?? recentRepos.length,
        followers: profile.followers ?? 0,
        following: profile.following ?? 0,
        bio: profile.bio || '',
      },
      featuredRepositories: featuredFiltered,
      otherActiveRepositories: otherActiveRepos,
      recentCommits: recentCommitsTimeline,
      fetchedAt: new Date().toISOString(),
    };

    githubActivityCache = { data: payload, timestamp: now };
    res.json({ ...payload, cached: false });
  } catch (error: any) {
    console.error('Error fetching GitHub activity:', error);
    if (githubActivityCache) {
      res.json({ ...githubActivityCache.data, cached: true, stale: true });
      return;
    }
    res.status(502).json({
      error: 'Unable to fetch GitHub activity right now',
      details: error.message || String(error),
    });
  }
});

// GitHub Contributions Calendar endpoint (parses live GitHub contributions graph)
const CONTRIBUTIONS_CACHE_TTL_MS = 15 * 60 * 1000;
const contributionsCache = new Map<string, { data: any; timestamp: number }>();

app.get('/api/github/contributions', async (req: Request, res: Response) => {
  const yearParam = String(req.query.year || '2026');
  const year = yearParam === '2025' ? '2025' : '2026';
  const forceRefresh = req.query.force === 'true';
  const now = Date.now();

  const cachedEntry = contributionsCache.get(year);
  if (!forceRefresh && cachedEntry && now - cachedEntry.timestamp < CONTRIBUTIONS_CACHE_TTL_MS) {
    res.json({ ...cachedEntry.data, cached: true });
    return;
  }

  try {
    const graphUrl = `https://github.com/users/${GITHUB_USERNAME}/contributions?from=${year}-01-01&to=${year}-12-31`;
    const htmlRes = await fetch(graphUrl, {
      headers: {
        'User-Agent': 'Nate-Mina-Portfolio-Works',
        Accept: 'text/html',
      },
    });

    if (!htmlRes.ok) {
      throw new Error(`GitHub contributions returned ${htmlRes.status}`);
    }

    const html = await htmlRes.text();

    // Parse tooltip counts mapped by element id
    const countById = new Map<string, number>();
    const tooltipRegex = /<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]+)<\/tool-tip>/g;
    let tipMatch: RegExpExecArray | null;
    while ((tipMatch = tooltipRegex.exec(html)) !== null) {
      const targetId = tipMatch[1];
      const text = tipMatch[2].trim();
      const numMatch = text.match(/^(\d+)\s+contribution/i);
      countById.set(targetId, numMatch ? parseInt(numMatch[1], 10) : 0);
    }

    // Parse day cells
    const days: { date: string; count: number; level: number }[] = [];
    const cellRegex = /<td[^>]*data-date="(\d{4}-\d{2}-\d{2})"[^>]*id="([^"]+)"[^>]*data-level="(\d)"[^>]*>/g;
    let cellMatch: RegExpExecArray | null;
    while ((cellMatch = cellRegex.exec(html)) !== null) {
      const date = cellMatch[1];
      const id = cellMatch[2];
      const level = parseInt(cellMatch[3], 10);
      const count = countById.has(id) ? (countById.get(id) ?? 0) : level;
      days.push({ date, count, level });
    }

    // Sort chronologically
    days.sort((a, b) => a.date.localeCompare(b.date));

    // Calculate streaks up to today (or end of year for past year)
    const todayIso = new Date().toISOString().split('T')[0];
    const effectiveDays = year === '2026' ? days.filter((d) => d.date <= todayIso) : days;

    let longestStreak = 0;
    let runningStreak = 0;
    let activeDays = 0;
    let totalContributions = 0;

    for (const d of effectiveDays) {
      totalContributions += d.count;
      if (d.count > 0) {
        activeDays += 1;
        runningStreak += 1;
        if (runningStreak > longestStreak) longestStreak = runningStreak;
      } else {
        runningStreak = 0;
      }
    }

    // Current streak (counting backwards from latest recorded day, allowing today to be 0 if yesterday had commits)
    let currentStreak = 0;
    if (effectiveDays.length > 0) {
      let idx = effectiveDays.length - 1;
      if (effectiveDays[idx].count === 0 && idx > 0 && effectiveDays[idx - 1].count > 0) {
        idx -= 1;
      }
      while (idx >= 0 && effectiveDays[idx].count > 0) {
        currentStreak += 1;
        idx -= 1;
      }
    }

    const totalHeadingMatch = html.match(/([\d,]+)\s+contributions?\s+in\s+\d{4}/i);
    const parsedHeadingTotal = totalHeadingMatch
      ? parseInt(totalHeadingMatch[1].replace(/,/g, ''), 10)
      : totalContributions;

    const activeRate =
      effectiveDays.length > 0
        ? Math.round((activeDays / effectiveDays.length) * 1000) / 10
        : 0;

    const payload = {
      username: GITHUB_USERNAME,
      year,
      totalContributions: Math.max(parsedHeadingTotal, totalContributions),
      currentStreak,
      longestStreak,
      activeDays,
      activeRate,
      days,
      fetchedAt: new Date().toISOString(),
    };

    contributionsCache.set(year, { data: payload, timestamp: now });
    res.json({ ...payload, cached: false });
  } catch (error: any) {
    console.error('Error fetching GitHub contributions:', error);
    if (cachedEntry) {
      res.json({ ...cachedEntry.data, cached: true, stale: true });
      return;
    }
    res.status(502).json({
      error: 'Unable to fetch GitHub contributions calendar',
      details: error.message || String(error),
    });
  }
});

// Persistent Site Visitor Counter API
const STATS_DIR = path.resolve(process.cwd(), '.data');
const STATS_FILE = path.join(STATS_DIR, 'site-stats.json');
const INITIAL_VISITS_SEED = 14285;
let siteVisitCountCache: number | null = null;

function readSiteVisits(): number {
  if (siteVisitCountCache !== null) return siteVisitCountCache;
  try {
    if (fs.existsSync(STATS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'));
      if (typeof parsed?.visits === 'number' && parsed.visits >= INITIAL_VISITS_SEED) {
        siteVisitCountCache = parsed.visits;
        return parsed.visits;
      }
    }
  } catch (err) {
    console.warn('Unable to read site-stats.json:', err);
  }
  siteVisitCountCache = INITIAL_VISITS_SEED;
  return INITIAL_VISITS_SEED;
}

function writeSiteVisits(count: number) {
  siteVisitCountCache = count;
  try {
    if (!fs.existsSync(STATS_DIR)) {
      fs.mkdirSync(STATS_DIR, { recursive: true });
    }
    fs.writeFileSync(
      STATS_FILE,
      JSON.stringify({ visits: count, updatedAt: new Date().toISOString() }, null, 2),
      'utf8'
    );
  } catch (err) {
    console.warn('Unable to persist site-stats.json:', err);
  }
}

app.get('/api/stats/visits', (_req: Request, res: Response) => {
  res.json({ visits: readSiteVisits(), persistent: true });
});

app.post('/api/stats/visits', (_req: Request, res: Response) => {
  const nextCount = readSiteVisits() + 1;
  writeSiteVisits(nextCount);
  res.json({ visits: nextCount, persistent: true });
});

// Hire Me Contact & Inquiry Endpoint
const INQUIRIES_FILE = path.join(STATS_DIR, 'hire-inquiries.json');

app.post('/api/hire-inquiry', async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      location,
      inquiryType,
      organization,
      phone,
      budgetOrTimeline,
      message,
    } = req.body || {};

    if (!name || !email || !location || !inquiryType) {
      res.status(400).json({ error: 'Name, email, location, and inquiry type are required.' });
      return;
    }

    const record = {
      id: `inq_${Date.now()}`,
      name: String(name).slice(0, 150),
      email: String(email).slice(0, 150),
      location: String(location).slice(0, 150),
      inquiryType: String(inquiryType).slice(0, 80),
      organization: organization ? String(organization).slice(0, 150) : '',
      phone: phone ? String(phone).slice(0, 50) : '',
      budgetOrTimeline: budgetOrTimeline ? String(budgetOrTimeline).slice(0, 150) : '',
      message: message ? String(message).slice(0, 4000) : '',
      createdAt: new Date().toISOString(),
    };

    try {
      if (!fs.existsSync(STATS_DIR)) {
        fs.mkdirSync(STATS_DIR, { recursive: true });
      }
      let existing: any[] = [];
      if (fs.existsSync(INQUIRIES_FILE)) {
        const parsed = JSON.parse(fs.readFileSync(INQUIRIES_FILE, 'utf8'));
        if (Array.isArray(parsed)) existing = parsed;
      }
      existing.unshift(record);
      fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(existing.slice(0, 200), null, 2), 'utf8');
    } catch (fsErr) {
      console.warn('Unable to persist hire-inquiries.json:', fsErr);
    }

    let emailDispatched = false;
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const typeLabelMap: Record<string, string> = {
          employer: 'Employer / Full-Time Opportunity',
          contract: 'Contract / Consulting Job',
          portfolio_build: 'Custom Interactive Portfolio ($20+)',
        };
        const typeLabel = typeLabelMap[record.inquiryType] || record.inquiryType;
        const emailText = [
          `New Hire Me Inquiry from ${record.name}`,
          `----------------------------------------`,
          `Who they are: ${record.name}${record.organization ? ` (${record.organization})` : ''}`,
          `Reply Email: ${record.email}`,
          record.phone ? `Phone: ${record.phone}` : '',
          `Where they're from: ${record.location}`,
          `Inquiry Type: ${typeLabel}`,
          record.budgetOrTimeline ? `Scope / Role / Budget: ${record.budgetOrTimeline}` : '',
          ``,
          `Details:`,
          record.message || '(No additional notes provided)',
        ]
          .filter(Boolean)
          .join('\n');

        const mailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || 'Portfolio Hire Form <onboarding@resend.dev>',
            to: ['NateMina@gmail.com', 'nate@purecomp.onmicrosoft.com'],
            reply_to: record.email,
            subject: `[Hire Me: ${typeLabel}] ${record.name} from ${record.location}`,
            text: emailText,
          }),
        });
        emailDispatched = mailRes.ok;
      } catch (mailErr) {
        console.warn('Optional Resend dispatch failed:', mailErr);
      }
    }

    res.json({
      success: true,
      id: record.id,
      emailDispatched,
      message: 'Inquiry recorded successfully.',
    });
  } catch (err: any) {
    console.error('Error handling hire inquiry:', err);
    res.status(500).json({ error: 'Failed to submit inquiry.' });
  }
});

// Setup Live WebSocket Server on /api/assistant/live
const wss = new WebSocketServer({ noServer: true });

wss.on('connection', async (clientWs: WebSocket) => {
  let liveSession: any = null;

  try {
    if (ai) {
      // Connect to Gemini Live session
      liveSession = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: ['AUDIO' as any],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: SYSTEM_INSTRUCTION,
        },
        callbacks: {
          onmessage: (msg: any) => {
            if (clientWs.readyState !== WebSocket.OPEN) return;
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              clientWs.send(JSON.stringify({ type: 'audio', audio: audioData }));
            }
            if (msg.serverContent?.interrupted) {
              clientWs.send(JSON.stringify({ type: 'interrupted' }));
            }
            if (msg.serverContent?.turnComplete) {
              clientWs.send(JSON.stringify({ type: 'turnComplete' }));
            }
          },
        },
      });
    }

    clientWs.on('message', (raw) => {
      try {
        const payload = JSON.parse(raw.toString());
        if (payload.type === 'audio' && payload.audio && liveSession) {
          liveSession.sendRealtimeInput({
            audio: { data: payload.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        } else if (payload.type === 'text' && payload.text && liveSession) {
          liveSession.sendRealtimeInput({
            text: payload.text,
          });
        }
      } catch (err) {
        console.error('Error handling WebSocket message:', err);
      }
    });

    clientWs.on('close', () => {
      if (liveSession) {
        try {
          liveSession.close();
        } catch (_) {}
      }
    });
  } catch (err) {
    console.error('Error connecting to Live API:', err);
    clientWs.send(JSON.stringify({ type: 'error', message: 'Failed to initialize live voice session' }));
  }
});

// Upgrade WebSocket connections on /api/assistant/live
server.on('upgrade', (request, socket, head) => {
  const pathname = request.url?.split('?')[0];
  if (pathname === '/api/assistant/live') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

// Mount Vite middleware in development or static serve in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
