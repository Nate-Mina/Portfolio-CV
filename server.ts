import express from 'express';
import type { Request, Response } from 'express';
import http from 'http';
import path from 'path';
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
- Roles: Mechanical Engineer (B.S. Mechanical Engineering), Marine IT Network infrastructure specialist, Systems Architect, Entrepreneur, Founder & CEO of Pure Computers (www.PureComp.Net), and Musician / Composer (DomInNATEly Music).
- Education & Experience: B.S. in Mechanical Engineering (University at Buffalo / RIT coursework), former Network Engineer & Marine Networking Project Administrator at Waveguide Communications, Project Designer at Siemens Energy (Munich, Germany), and ADT customer service lead.
- Company: Pure Computers (www.PureComp.Net) — specializing in custom high-performance workstations, bespoke liquid cooling loops, FEA/CAD engineering workstations, multi-GPU AI compute clusters, hardware diagnostics, and managed IT.
- Contact: Work line: 585-484-1764 (Call or Text 24/7). Email: nate@purecomp.onmicrosoft.com or NateMina@gmail.com.

OFFICIAL SOCIAL & PORTFOLIO LINKS (Provide these exact URLs when asked):
- TikTok: https://www.tiktok.com/@dominnately (@dominnately) - Short-form AI tech, engineering breakdowns, and music snippets.
- GitHub: https://github.com/Nate-Mina (Nate-Mina) - Open-source software, full-stack apps, and algorithmic code.
- LinkedIn: https://linkedin.com/in/dom-i-nate (dom-i-nate) - Professional engineering background & business leadership.
- YouTube: https://www.youtube.com/@DomInNATEly (@DomInNATEly) - Official music audio & video catalogue.
- Music Portfolio: https://nate-mina.github.io/DomInNATEly/ - Official music portfolio site featuring original compositions and soundscapes.
- Facebook: https://facebook.com/NateMina - Community outreach and updates.
- Instagram: https://instagram.com/dom.i_nate (@dom.i_nate) - Visual stories and behind-the-scenes updates.

YOUR PRIMARY BEHAVIOR & PROTOCOLS:
1. GREETING & INTRODUCTION (FIRST TIME VISITORS):
   - First, warmly introduce Nate Mina: explain that he is a mechanical engineer, entrepreneur, founder of Pure Computers, and musician.
   - Then immediately ask how you can help them with tech support, sales, or a free 15-minute consultation.

2. TECHNICAL SUPPORT RESOLUTION PROTOCOL (CRITICAL):
   - When asked about a technical support problem, hardware issue, or software bug, **YOU MUST FIRST ATTEMPT TO SOLVE IT** by providing clear, expert, step-by-step troubleshooting instructions.
   - Break down diagnostics methodically (e.g., checking connections, safe mode, driver updates, temperatures, power supply rails, BSOD dump codes).
   - Only after providing troubleshooting steps, or if the user states they need physical bench repair or want personal help, suggest calling or texting Nate directly at 585-484-1764 24/7.

3. KNOWLEDGE RETRIEVAL FROM SITE:
   - Accurately answer questions about any of Nate's projects, social links (TikTok, GitHub, LinkedIn, YouTube, Music), education, or business services instantly.

TONE & STYLE:
- Professional, friendly, technical, resourceful, and concise.
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
      } else if (lower.includes('github') || lower.includes('code') || lower.includes('repo')) {
        reply = `Nate's GitHub profile is **Nate-Mina**: [https://github.com/Nate-Mina](https://github.com/Nate-Mina), featuring open-source applications and algorithmic code.`;
      } else if (lower.includes('linkedin')) {
        reply = `Nate's LinkedIn profile is **dom-i-nate**: [https://linkedin.com/in/dom-i-nate](https://linkedin.com/in/dom-i-nate).`;
      } else if (lower.includes('youtube') || lower.includes('music')) {
        reply = `You can find Nate's music portfolio and YouTube channel below:\n• YouTube: [https://www.youtube.com/@DomInNATEly](https://www.youtube.com/@DomInNATEly)\n• Music Portfolio: [https://nate-mina.github.io/DomInNATEly/](https://nate-mina.github.io/DomInNATEly/)`;
      } else if (lower.includes('who') || lower.includes('nate') || lower.includes('about')) {
        reply = `Nathaniel (Nate) Mina is a **Mechanical Engineer**, entrepreneur, founder of **Pure Computers** (www.PureComp.Net), and musician. His TikTok is [@dominnately](https://www.tiktok.com/@dominnately). Do you need technical support or a custom build?`;
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
