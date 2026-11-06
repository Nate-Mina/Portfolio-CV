# Implementation Plan - "About Me" Polymath Memoir, Assistant Auto-Popup, and Site Knowledge Updates

Create a dedicated "About Me" tab in the top navigation bar presenting Nathaniel Mina's journey as an engineer turned musician and philosopher in a continuous narrative blog format with chapter anchors, based on his autobiography "The System & The Soul". Configure the AI Assistant Widget to auto-expand with a contextual greeting when the user navigates to the Pure Computers tab, and update assistant logic and server endpoints to prioritize direct, step-by-step technical problem solving before offering consultation links, while answering site-wide questions including his TikTok handle.

## User Review Required

> [!IMPORTANT]
> - **Top Navigation Ordering**: Following your answer, the new "About Me" tab will be placed in the **second position**, immediately after "Link In Bio" (`Link In Bio` → `About Me` → `Pure Computers` → `Portfolio / Works` → `Music & Podcasts` → `CV & Resume` → `Case Studies` → `η Calculator`).
> - **Pure Computers Tab Auto-Popup**: When a visitor clicks into the "Pure Computers" tab, the AI Assistant will automatically pop open with an active greeting tailored for tech support diagnostics and custom workstation inquiries. Users can minimize or close the dialog at any time.
> - **Tech Support First Workflow**: The chatbot will rigorously provide direct, actionable troubleshooting steps (hardware, software, thermals, BIOS/RAM) first before offering consultation booking or contact escalation.

---

## Proposed Changes

### 1. New "About Me" Page Component (`src/components/AboutMePage.tsx`)

- **Format & Style**: Continuous narrative blog format with sticky chapter anchor sidebar navigation, written in a casual, reflective, and engaging first-person voice.
- **Narrative Structure & Polymath Evolution**:
  - **Introduction: The Mechanical Mind**: The foundation of an engineer who approaches life through deterministic models and first principles.
  - **The Crucible & The Napkin Bucket List**: Surviving RIT's 7% graduation threshold, the 2008 Highland Hospital tension pneumothorax crisis, and the napkin bucket list completed by age 27.
  - **The Unexpected Muse: From Equations to DomInNATEly**: Exploring how writing music, audio composition, and philosophy would have been the last thing Nate ever envisioned in high school or college, but became a vital creative anchor.
  - **The System & The Soul**: Integrating the mathematical Trust Equation ($T = \frac{R + I}{S}$), utility models, and cognitive debugging (AVRT) with the realization that human hearts, vulnerability, and artistic expression exist beyond simple calculators.
  - **Current Frontiers**: Leading Pure Computers, custom multi-GPU hardware, and applied thermodynamic projects (such as the house-to-pool heat recovery system).
- **Interactive Chapter Anchors**: Smooth-scrolling table of contents with active section highlights.
- **Visual Design**: Themed layout adhering to Jekyll themes, code/math block callouts, rich imagery integration from profile photos, and links to his music portfolio (`DomInNATEly`), TikTok (`@dominnately`), and YouTube.

### 2. Navigation & Header Integration (`src/components/Header.tsx`, `src/App.tsx`, `src/types.ts`)

- Update `activeTab` type to include `'about'`:
  `'links' | 'about' | 'purecomp' | 'portfolio' | 'resume' | 'music' | 'cases' | 'calculator'`.
- Insert the **"About Me"** tab button in `Header.tsx` as the second tab directly following "Link In Bio".
- Render `<AboutMePage />` in `App.tsx` when `activeTab === 'about'`.

### 3. Assistant Pure Computers Tab Auto-Popup (`src/components/assistant/AIAssistantWidget.tsx`, `src/App.tsx`)

- Pass `activeTab` or an `autoOpenOnPureComp` trigger from `App.tsx` to `AIAssistantWidget`.
- When `activeTab === 'purecomp'` is triggered, automatically set `isOpen(true)` with a welcoming toast/message prompting visitors for tech support and hardware diagnostics.
- Ensure visitors can dismiss or minimize without it re-popping annoying loops on re-renders.

### 4. Assistant System Prompt & Endpoint Upgrades (`server.ts`, `src/components/assistant/ChatModeView.tsx`)

- **Tech Support First Protocol**: Ensure the AI assistant's system instructions and fallback logic explicitly require providing direct diagnostic workflows and solutions first (e.g., checking power rails, thermal paste/pump headers, memory reseating, driver DDU clean installs, BSOD analysis) before recommending a consultation booking or calling Nate at 585-484-1764.
- **Site-Wide Knowledge**: Ensure immediate accurate answers with direct links for:
  - TikTok: `@dominnately` ([https://www.tiktok.com/@dominnately](https://www.tiktok.com/@dominnately))
  - Polymath memoir & autobiography ("The System & The Soul")
  - DomInNATEly Music & YouTube portfolio
  - Pure Computers custom workstation and repair offerings
- **Quick Action Chips**: Add direct query chips in `ChatModeView.tsx` including "Tech Support Problem", "Nate's TikTok Handle", "Why DomInNATEly Music?", and "Book 15m Consult".

---

## Verification Plan

### Automated Verification
- Run `compile_applet` to verify TypeScript builds without compile errors.
- Run `lint_applet` (`tsc --noEmit`) to verify clean type checking across new and updated components.

### Manual Verification
1. **Navigation**: Click "About Me" in the top bar to verify the new tab loads in position 2 with continuous blog narrative, chapter anchor scrolling, and responsive styling.
2. **Pure Computers Tab Auto-Popup**: Click the "Pure Computers" tab and verify the AI Assistant widget automatically expands with a contextual welcome.
3. **Tech Support Query**: Ask the chatbot: *"My computer won't boot and the motherboard shows a yellow DRAM LED. What should I do?"* Verify it answers with step-by-step diagnostic advice first without immediately telling the user to book a consultation.
4. **TikTok Query**: Ask the chatbot: *"What is Nate's TikTok handle?"* Verify it returns `@dominnately` with a link to `https://www.tiktok.com/@dominnately`.
5. **Polymath Question**: Ask: *"Why did Nate start writing music?"* Verify it answers using insights from his autobiography (*The System & The Soul*).
