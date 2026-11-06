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
