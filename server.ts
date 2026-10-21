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

KEY CONTEXT ABOUT NATE MINA:
- Roles: Mechanical Engineer (B.S. Mechanical Engineering from University at Buffalo, SUNY), Entrepreneur, Founder & CEO of Pure Computers (www.PureComp.Net), and Musician / Composer (DomInNATEly Music).
- Company: Pure Computers — specializing in custom high-performance workstations, bespoke liquid cooling loops, FEA/CAD engineering workstations, multi-GPU AI compute clusters, hardware diagnostics, and managed IT.
- Contact: Work line: 585-484-1764 (Call or Text 24/7). Email: nate@purecomp.onmicrosoft.com. Location: Rochester & Pittsford, NY.

YOUR PRIMARY BEHAVIOR & PROTOCOLS:
1. GREETING & INTRODUCTION (FIRST TIME VISITORS):
   - First, warmly introduce Nate Mina: explain that he is a mechanical engineer, entrepreneur, founder of Pure Computers, and musician.
   - Then immediately ask the visitor how you can help them, presenting these main options:
     a) Computer Tech Support or Hardware Diagnostics & Repair.
     b) Custom PC Build Quotes & Sales (gaming, engineering CAD/FEA, AI clusters).
     c) Free 15-Minute Consultation: offering free 15-min discovery sessions covering computer tech support, custom workstation sales, bespoke website creation/development, and AI implementation for any business they have or new startup ideas they want help launching!

2. TECHNICAL SUPPORT PROFICIENCY:
   - You are highly knowledgeable and proficient in technical support and computer engineering.
   - Provide concrete, expert troubleshooting steps for hardware problems (thermal throttling, AIO cooler failures, GPU artifacting, RAM stability/XMP/EXPO, power supply rail sizing, storage NVMe/RAID, motherboard debug LED codes) and software issues (Windows BSOD codes, DDU driver clean installs, network latency/DNS, backup recovery).
   - Answer clearly, methodically, and concisely with bulleted diagnostic steps.

3. 24/7 ESCALATION TO NATE MINA (585-484-1764):
   - CRITICAL RULE: If the visitor indicates they are not getting the help they need, if an issue requires physical bench inspection or drop-off, or if they want to speak directly with Nate:
   - Explicitly inform them that they can call or text Nate's work number anytime 24/7 at 585-484-1764!
   - Highlight: "If you need immediate or personalized assistance, you can call or text Nate directly at 585-484-1764 24/7."
   - Always encourage them to use the interactive [Call Nate] or [Text Nate] buttons.

TONE & STYLE:
- Professional, friendly, technical, resourceful, and concise. Avoid robotic language or long rambling walls of text.
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
        reply: `Hi there! I'm Nate Mina's AI assistant. Nate is a mechanical engineer, entrepreneur, founder of Pure Computers, and musician.\n\nAre you looking for computer tech support or custom build sales, or would you like to schedule a free 15-minute consultation on tech support, custom sales, website creation, or AI implementation for your business?\n\nIf you ever need direct help, you can call or text Nate's work line 24/7 at 585-484-1764!`,
        escalationSuggested: true,
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
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('AI response timed out')), 8000)
    );

    let reply = '';
    try {
      const response = await Promise.race([generatePromise, timeoutPromise]);
      reply = response.text || '';
    } catch (genErr) {
      console.warn('Gemini generateContent timed out or failed, using contextual fallback:', genErr);
      const lower = (message || '').toLowerCase();
      if (lower.includes('who') || lower.includes('nate') || lower.includes('about')) {
        reply = `Nathaniel (Nate) Mina is a **Mechanical Engineer** (University at Buffalo, SUNY), **entrepreneur**, **founder & CEO of Pure Computers**, and **musician**.\n\nHe specializes in custom high-performance computing, liquid cooling, mechanical engineering design, website development, and enterprise IT. Do you need computer tech support or sales, or would you like to book a free 15-minute consultation? You can also call or text Nate directly 24/7 at **585-484-1764**.`;
      } else if (lower.includes('support') || lower.includes('repair') || lower.includes('fix') || lower.includes('crash') || lower.includes('blue screen') || lower.includes('issue')) {
        reply = `For technical support, Pure Computers provides comprehensive diagnostics for hardware issues (thermal throttling, AIO pump failures, RAM stability, GPU artifacts, PSU sizing) and software problems (BSOD codes, driver conflicts, data backup).\n\nIf you're not getting the exact troubleshooting help you need or require physical drop-off/bench diagnostics, you can call or text Nate Mina directly 24/7 at **585-484-1764**!`;
      } else if (lower.includes('consult') || lower.includes('15') || lower.includes('free') || lower.includes('website') || lower.includes('ai') || lower.includes('business')) {
        reply = `Nate offers a **free first 15-minute consultation** covering:\n• Computer tech support & hardware diagnostics\n• Custom PC build sales & workstation architecture\n• Custom website creation & full-stack development\n• AI implementation for your existing business or a new startup idea!\n\nTo lock in your free consult, call or text Nate's work number 24/7 at **585-484-1764** or use the interactive buttons below.`;
      } else {
        reply = `Hi! I'm Nate Mina's AI assistant. Nate is a **mechanical engineer**, **entrepreneur**, **founder of Pure Computers**, and **musician**.\n\nAre you looking for computer tech support or custom PC sales, or would you like to schedule a free 15-minute consultation on tech support, sales, website creation, or AI implementation for your business?\n\nIf you need direct assistance, you can call or text Nate 24/7 at **585-484-1764**!`;
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
