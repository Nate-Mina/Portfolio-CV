# Nate Mina AI Assistant (Live Voice & Chatbot)

An intelligent, multi-modal portfolio assistant that greets visitors, introduces Nathaniel Mina (Mechanical Engineer, Entrepreneur, Founder of Pure Computers, and Musician), assists with computer hardware diagnostics and technical troubleshooting, offers free 15-minute consultations (covering tech support, custom PC sales, website creation, AI implementations, and new business startups), and provides 24/7 direct escalation via interactive click-to-call and click-to-text to Nate's work line at **585-484-1764**.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and user experience decisions were confirmed during the planning clarification phase:
> 
> - **Widget Placement**: Floating corner widget anchored at the bottom-right, persistent and accessible across all portfolio tabs (Bio, Pure Computers, Works, Music, Resume, Cases, and Calculator).
> - **Voice & Chat Mode**: Unified interface with an intuitive tab/toggle switcher between **Live Voice Mode** (real-time audio conversation with animated equalizer) and **Chatbot Mode** (multi-turn streaming text conversation).
> - **24/7 Work Line Escalation (585-484-1764)**: Prominent interactive Call (`tel:5854841764`) and Text (`sms:5854841764`) action buttons that appear when the visitor requests direct human help, when technical issues exceed automated resolution, or when scheduling a consultation.

---

## 1. Overview & Core Concept

### What It Does
- **Warm Persona & Greeting**: Proactively introduces Nate Mina—highlighting his background in mechanical engineering (UB SUNY), computer hardware architecture (Pure Computers), web development, and music production.
- **Consultation Intake & Triage**: Inquires if visitors need computer tech support, custom PC build sales, or a free 15-minute consultation spanning tech support, custom workstation sales, bespoke website design, enterprise AI integration, or new business ideas.
- **Deep Technical Support Proficiency**: Diagnoses hardware bottlenecks, thermal throttling, OS crashes, GPU/CPU stability, custom loop cooling maintenance, network troubleshooting, and data backup strategies with authoritative precision.
- **Seamless 24/7 Escalation**: When complex diagnostics require hands-on physical inspection, or when visitors request direct contact, the assistant provides immediate one-tap calling and texting to Nate's work number (`585-484-1764`), with optional automatic Google Task logging for follow-ups.

### Target Audience & Persona
- Potential clients seeking custom liquid-cooled PC builds, workstation engineering, or managed IT support.
- Founders and business owners looking for full-stack web applications, AI automation, or startup consulting.
- Technical recruiters and engineering peers exploring Nate's cross-disciplinary portfolio.

---

## 2. User Experience & Visual Design

### Key User Flows

```
[ Visitor Lands on Portfolio ]
              │
              ▼
[ Floating Assistant Pill (Bottom-Right) ]
   "👋 Hi! I'm Nate's AI Assistant. Ask me anything or start a live voice chat."
              │  (Click to open)
              ▼
[ Unified Assistant Window ]
 ┌────────────────────────────────────────────────────────┐
 │ Header: Nate AI Assistant · [● Live Voice] [💬 Chat]  │
 ├────────────────────────────────────────────────────────┤
 │ Initial Message:                                       │
 │ "Hello! I'm Nate Mina's AI assistant. Nate is a       │
 │ mechanical engineer, entrepreneur, founder of Pure    │
 │ Computers, and musician.                               │
 │                                                        │
 │ How can I help you today?                              │
 │ • Computer Tech Support or Hardware Diagnostics        │
 │ • Custom PC Build Quotes & Sales                       │
 │ • Free 15-Min Consult (Tech, Web, AI, or Startups)     │
 ├────────────────────────────────────────────────────────┤
 │ Quick Prompt Chips:                                    │
 │ [Diagnose PC Issue] [Book Free Consult] [Who is Nate?] │
 ├────────────────────────────────────────────────────────┤
 │ Escalation Banner (Always Visible on Need):            │
 │ 📞 Need Nate directly? Call or Text 24/7: 585-484-1764 │
 │ [Call Nate] [Text Nate]                                │
 └────────────────────────────────────────────────────────┘
```

### Visual Identity & Theme
- **Cyberpunk / Dark Terminal Aesthetic**: Consistent with Nate's existing Jekyll themes (Midnight, Dracula, Hacker, Chirpy, Cayman), featuring high-contrast typography, emerald/cyan accents, and glassmorphic translucent panels.
- **Zero-Pill Discipline**: Metadata, response tags, and timestamps rendered as clean unboxed typography with typographic dots (`·`). Interactive controls rendered as clean functional buttons.
- **Live Voice Visualizer**: Pulsing audio wave / equalizer bars indicating model speaking, user listening, and thinking states.
- **Responsive Layout**: Adapts gracefully from a compact 400px bottom-right desktop drawer to a full-viewport mobile overlay with safe-area spacing.

---

## 3. Key Product Decisions & Trade-Offs

| Decision | Chosen Approach | Rationale | Alternatives Considered |
| :--- | :--- | :--- | :--- |
| **Backend Integration** | Express server (`server.ts`) with `@google/genai` SDK | Secure API key management, streaming SSE responses, WebSocket support for Live audio | Client-side API calls (violates security & guidelines) |
| **AI Models** | `gemini-3.8-flash` for multi-turn chat & `gemini-3.8-live` / `gemini-3.8-flash-lite-tts` for voice | Low latency, high reasoning fidelity for technical troubleshooting, native voice synthesis | Deprecated `gemini-1.5` / `gemini-2.0` models (strictly prohibited) |
| **Escalation Path** | Direct `tel:` and `sms:` deep-links + Google Tasks sync | Instant zero-friction visitor action on mobile & desktop; integrates with existing Google Tasks follow-up engine | Email-only contact (slower conversion) |
| **Voice Interaction** | Client Web Audio API (16kHz capture, 24kHz playback) | Natural conversational back-and-forth matching Live API protocol standards | Browser SpeechSynthesis (robotic, low fidelity) |

---

## 4. Technical Architecture & System Flow

```
┌───────────────────────────────────────────────────────────────┐
│                      Client (Browser SPA)                     │
│                                                               │
│   ┌─────────────────────┐       ┌─────────────────────────┐   │
│   │  Floating Launcher  │ ────▶ │  AIAssistantModal       │   │
│   └─────────────────────┘       │  ├─ VoiceModeView       │   │
│                                 │  │   └─ AudioVisualizer │   │
│                                 │  ├─ ChatModeView        │   │
│                                 │  │   └─ MessageThread   │   │
│                                 │  └─ EscalationBar       │   │
│                                 │      ├─ [Call 585...]   │   │
│                                 │      └─ [Text 585...]   │   │
│                                 └─────────────────────────┘   │
└───────────────────────────────┬───────────────────────────────┘
                                │ HTTP / WebSocket
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                   Server (Express - server.ts)                │
│                                                               │
│   POST /api/assistant/chat  ──▶  GoogleGenAI (gemini-3.8-flash)│
│                                 System Instruction:           │
│                                 - Nate Mina biography         │
│                                 - Pure Computers hardware specs│
│                                 - 15-min consult offerings    │
│                                 - Troubleshooting protocols   │
│                                 - 585-484-1764 escalation     │
│                                                               │
│   WS   /api/assistant/live  ──▶  Live Session (gemini-3.8-live)│
│                                 Bidirectional PCM Audio Bridge│
└───────────────────────────────────────────────────────────────┘
```

### Component Structure
- `src/components/assistant/AIAssistantWidget.tsx`: The primary floating launcher and container.
- `src/components/assistant/ChatModeView.tsx`: Multi-turn conversational view with streaming text, markdown formatting, suggestion chips, and automated escalation buttons.
- `src/components/assistant/VoiceModeView.tsx`: Real-time voice interaction with animated waveform visualization, mic input controls, speaker audio output, and live transcript captions.
- `src/components/assistant/EscalationBanner.tsx`: Prominent 24/7 contact card with clickable `tel:5854841764` and `sms:5854841764` buttons.
- `server.ts`: Full-stack Express server proxying Gemini 3.8 requests and hosting WebSocket live audio bridge.
