import express from 'express';
import type { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { buildSystemInstruction } from './server/pcTroubleshootingKb.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.disable('x-powered-by');
const server = http.createServer(app);
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini SDK client (v1beta required for Live API BidiGenerateContent & beta speech/model endpoints)
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      apiVersion: 'v1beta',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

const CHAT_SYSTEM_INSTRUCTION = buildSystemInstruction('chat');
const VOICE_SYSTEM_INSTRUCTION = buildSystemInstruction('voice');

// Chat API endpoint (multi-turn via ai.chats.create + Gemini 4 Hydrogen / 3.1 Flash Lite)
app.post('/api/assistant/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body || {};

    if (!message && (!Array.isArray(history) || history.length === 0)) {
      res.status(400).json({ error: 'Message or conversation history is required.' });
      return;
    }

    if (!ai) {
      res.status(503).json({
        error: 'Gemini API key is not configured on the server. Add GEMINI_API_KEY in Settings > Secrets.',
      });
      return;
    }

    const formattedHistory: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
    if (Array.isArray(history)) {
      for (const turn of history) {
        if (turn?.role && turn?.text) {
          const role = turn.role === 'user' ? 'user' : 'model';
          // Skip leading model greeting if history starts with model turn
          if (formattedHistory.length === 0 && role === 'model') continue;
          formattedHistory.push({
            role,
            parts: [{ text: String(turn.text) }],
          });
        }
      }
    }

    const userText = String(message || '').trim();
    const isQuickLookup =
      userText.length > 0 &&
      userText.length < 70 &&
      /(tiktok|handle|phone|email|website|who is|hi|hello|hey)/i.test(userText) &&
      !/(crash|bsod|blue screen|overheat|temp|boot|post|ram|gpu|cpu|nvme|ssd|network|wifi|fiber|linux|error|fix|slow|broken)/i.test(
        userText
      );

    const modelName = isQuickLookup ? 'gemini-3.1-flash-lite' : 'gemini-4-hydrogen';

    const chat = ai.chats.create({
      model: modelName,
      history: formattedHistory,
      config: {
        systemInstruction: CHAT_SYSTEM_INSTRUCTION,
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini chat request timed out')), 25000)
    );

    const response = await Promise.race([
      chat.sendMessage({ message: userText || 'Hello!' }),
      timeoutPromise,
    ]);

    const reply = response.text?.trim();
    if (!reply) {
      res.status(502).json({ error: 'Empty response returned from Gemini.' });
      return;
    }

    const escalationSuggested =
      reply.includes('585-484-1764') ||
      reply.toLowerCase().includes('consultation') ||
      reply.toLowerCase().includes('bench diagnostics');

    res.json({ reply, model: modelName, escalationSuggested });
  } catch (error: any) {
    console.error('Error generating assistant response:', error);
    const status = typeof error?.status === 'number' && error.status >= 400 && error.status < 600
      ? error.status
      : 500;
    const message = error?.message || 'Failed to generate AI response.';
    res.status(status).json({ error: message });
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
            prebuiltVoiceConfig: { voiceName: 'Charon' },
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
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(8000) });
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
      signal: AbortSignal.timeout(8000),
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

    // Parse day cells (attribute-order agnostic)
    const days: { date: string; count: number; level: number }[] = [];
    const tdRegex = /<td\b([^>]*)>/g;
    let tdMatch: RegExpExecArray | null;
    while ((tdMatch = tdRegex.exec(html)) !== null) {
      const attrs = tdMatch[1];
      const dateMatch = attrs.match(/data-date="(\d{4}-\d{2}-\d{2})"/);
      if (!dateMatch) continue;
      const idMatch = attrs.match(/\bid="([^"]+)"/);
      const levelMatch = attrs.match(/data-level="(\d)"/);
      if (!idMatch || !levelMatch) continue;
      const date = dateMatch[1];
      const id = idMatch[1];
      const level = parseInt(levelMatch[1], 10);
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

let statsWriteQueue: Promise<void> = Promise.resolve();

function writeSiteVisits(count: number) {
  siteVisitCountCache = count;
  const payload = JSON.stringify({ visits: count, updatedAt: new Date().toISOString() }, null, 2);
  statsWriteQueue = statsWriteQueue
    .then(async () => {
      await fs.promises.mkdir(STATS_DIR, { recursive: true });
      await fs.promises.writeFile(STATS_FILE, payload, 'utf8');
    })
    .catch((err) => {
      console.warn('Unable to persist site-stats.json:', err);
    });
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
let inquiriesWriteQueue: Promise<void> = Promise.resolve();

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

    inquiriesWriteQueue = inquiriesWriteQueue
      .then(async () => {
        await fs.promises.mkdir(STATS_DIR, { recursive: true });
        let existing: any[] = [];
        try {
          const raw = await fs.promises.readFile(INQUIRIES_FILE, 'utf8');
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) existing = parsed;
        } catch {
          // File may not exist yet or be empty
        }
        existing.unshift(record);
        await fs.promises.writeFile(
          INQUIRIES_FILE,
          JSON.stringify(existing.slice(0, 200), null, 2),
          'utf8'
        );
      })
      .catch((fsErr) => {
        console.warn('Unable to persist hire-inquiries.json:', fsErr);
      });
    await inquiriesWriteQueue;

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
          signal: AbortSignal.timeout(8000),
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

wss.on('error', (err) => {
  console.error('WebSocket server error:', err);
});

wss.on('connection', (clientWs: WebSocket) => {
  let clientClosed = false;
  let errorNotified = false;
  let activeSession: any = null;

  const sendSafe = (data: Record<string, unknown>) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify(data));
    }
  };

  clientWs.on('error', (err) => {
    console.warn('WebSocket client error:', err);
  });

  if (!ai) {
    sendSafe({
      type: 'error',
      message: 'Gemini API key is not configured on the server. Check Settings > Secrets.',
    });
    clientWs.close();
    return;
  }

  const sessionPromise = ai.live
    .connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Charon' } },
        },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        systemInstruction: VOICE_SYSTEM_INSTRUCTION,
      },
      callbacks: {
        onopen: () => {
          // Wait until setupComplete resolves session before signaling ready & greeting
        },
        onmessage: (msg: LiveServerMessage) => {
          if (clientWs.readyState !== WebSocket.OPEN) return;
          const content = msg.serverContent;

          if (content?.inputTranscription?.text) {
            sendSafe({ type: 'inputTranscript', text: content.inputTranscription.text });
          }
          if (content?.outputTranscription?.text) {
            sendSafe({ type: 'outputTranscript', text: content.outputTranscription.text });
          }
          for (const part of content?.modelTurn?.parts ?? []) {
            if (part.inlineData?.data) {
              sendSafe({ type: 'audio', audio: part.inlineData.data });
            }
          }
          if (content?.interrupted) {
            sendSafe({ type: 'interrupted' });
          }
          if (content?.turnComplete) {
            sendSafe({ type: 'turnComplete' });
          }
        },
        onerror: (err: any) => {
          console.error('Gemini Live callback error:', err);
          if (!errorNotified) {
            errorNotified = true;
            sendSafe({
              type: 'error',
              message:
                err?.message ||
                err?.error?.message ||
                'Live voice connection encountered an error.',
            });
          }
        },
        onclose: (event: any) => {
          if (!clientClosed && !errorNotified) {
            if (event?.code && event.code !== 1000 && event.reason) {
              sendSafe({ type: 'error', message: event.reason });
            } else {
              sendSafe({ type: 'closed' });
            }
          }
        },
      },
    })
    .then((session) => {
      activeSession = session;
      if (clientClosed) {
        try {
          session.close();
        } catch {
          // Ignore close errors
        }
        return null;
      }
      sendSafe({ type: 'ready', model: 'gemini-3.8-live' });
      try {
        session.sendClientContent({
          turns: [
            {
              role: 'user',
              parts: [
                {
                  text: "Introduce yourself aloud right now using these exact words and nothing else: \"Thanks for choosing Pure Computers, I'm Nate's AI Assistant Clone here to assist you. How can I help you today?\"",
                },
              ],
            },
          ],
          turnComplete: true,
        });
      } catch (greetErr) {
        console.warn('Unable to send auto-greeting turn:', greetErr);
      }
      return session;
    })
    .catch((err: any) => {
      console.error('Error connecting to Gemini Live API:', err);
      if (!errorNotified) {
        errorNotified = true;
        sendSafe({
          type: 'error',
          message: err?.message || 'Failed to initialize Gemini Live voice session.',
        });
      }
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.close();
      }
      return null;
    });

  clientWs.on('message', (raw) => {
    try {
      const payload = JSON.parse(raw.toString());
      sessionPromise.then((session) => {
        if (!session || clientClosed) return;
        if (payload.type === 'audio' && payload.audio) {
          session.sendRealtimeInput({
            audio: { data: payload.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        } else if (payload.type === 'audioStreamEnd') {
          session.sendRealtimeInput({ audioStreamEnd: true });
        } else if (payload.type === 'text' && payload.text) {
          session.sendRealtimeInput({ text: String(payload.text) });
        }
      });
    } catch (err) {
      console.error('Error handling WebSocket message:', err);
    }
  });

  clientWs.on('close', () => {
    clientClosed = true;
    if (activeSession) {
      try {
        activeSession.close();
      } catch {
        // Ignore close errors
      }
    }
  });
});

// Upgrade WebSocket connections on /api/assistant/live
server.on('upgrade', (request, socket, head) => {
  const pathname = request.url?.split('?')[0];
  if (pathname === '/api/assistant/live') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// Return JSON 404 for unknown /api/* endpoints instead of falling through to SPA HTML
app.all('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'API endpoint not found' });
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
    // Long-lived immutable cache for hashed Vite asset bundles
    app.use(
      '/assets',
      express.static(path.join(distPath, 'assets'), {
        maxAge: '1y',
        immutable: true,
      })
    );
    app.use(
      express.static(distPath, {
        maxAge: '1h',
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
          }
        },
      })
    );
    app.get('*', (_req: Request, res: Response) => {
      res.setHeader('Cache-Control', 'no-cache');
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
