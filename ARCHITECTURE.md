# Application Architecture

## Overview

Sync is a chat-first translation assistant built with Next.js 16 (App Router) and ShadCN UI. Users can create persistent chat sessions, send source text, and instantly receive Azure Translator responses. The layout mirrors modern AI chat apps: a session sidebar, fixed header, scrollable conversation pane, and a composer anchored to the bottom. All conversations are stored locally so returning users can pick up where they left off.

---

## System Flow

```text
┌───────────────────────────────────────────────────────────────┐
│                           Browser                             │
│                                                               │
│  ┌──────────────┐    ┌────────────────────┐    ┌────────────┐ │
│  │ Sidebar      │    │ Chat Timeline      │    │ Composer   │ │
│  │ (Sessions)   │    │ (AI + User msgs)   │    │ (Input)    │ │
│  └─────┬────────┘    └──────────┬─────────┘    └────┬───────┘ │
│        │ interactions (clicks, scroll, send)        │          │
│        │                                            │ onSubmit │
└────────┼────────────────────────────────────────────┼──────────┘
            │                                            │ fetch POST
            ▼                                            ▼
┌───────────────────────────────────────────────────────────────┐
│        API Route `app/api/translate/route.ts`                 │
│  1. Parse { text, targetLanguage }                            │
│  2. Call translator utility                                   │
│  3. Return { translatedText, detectedLanguage, targetLanguage }│
└───────────────┬───────────────────────────────────────────────┘
                     │ HTTPS POST (Azure Cognitive Services)
                     ▼
┌───────────────────────────────────────────────────────────────┐
│           `lib/translator.ts` (server-side util)              │
│  - Builds Azure Translator endpoint                           │
│  - Adds key + region headers                                  │
│  - Sends request & normalizes response                        │
└───────────────┬───────────────────────────────────────────────┘
                     │ Azure Translator API
                     ▼
┌───────────────────────────────────────────────────────────────┐
│        Azure Translator (Cognitive Services)                  │
│  - Detects source language                                    │
│  - Translates to requested target                             │
│  - Responds with translation metadata                         │
└───────────────────────────────────────────────────────────────┘
```

---

## UI & Component Structure

```text
app/page.tsx (client)
├── Sidebar (desktop & mobile overlay)
│   ├── Session list (localStorage backed)
│   ├── New Chat button
│   └── Clear All (AlertDialog confirmation)
├── Header (fixed)
│   └── Brand + Azure attribution
├── Chat Area (absolute, scrollable)
│   ├── Empty state (language suggestions)
│   └── Conversation list
│       ├── User bubble (right aligned)
│       └── AI bubble (left aligned + language selector + copy)
└── Composer (fixed bottom)
     ├── Text input + send button
     └── Language quick-pills + select dropdown
```

Key shared UI primitives come from `@/components/ui/*` (Button, Select, ScrollArea, AlertDialog). No legacy components (`TranslationInput`, `ChatHistory`, etc.) are used anymore.

---

## Data Lifecycle

1. **Initialization**

   - On mount, `useEffect` reads `sync_chat_sessions` and `sync_active_session` from `localStorage`.
   - State stores: `chatSessions`, `activeSessionId`, `sourceText`, `targetLanguage`, `isThinking`, etc.

2. **Sending a message** (`handleTranslate`)

   1. Ensure active session (create if needed).
   2. Set loading + thinking states.
   3. POST to `/api/translate` with `{ text, targetLanguage }`.
   4. On success, append AI/user pair to the session’s `conversations`.
   5. Persist sessions back to `localStorage`.

3. **Retranslating** (`retranslateMessage`)

   - Replays the source text with a new language, updates just that conversation entry, and shows a per-message spinner.

4. **Copying output**

   - `navigator.clipboard.writeText` with a 2s visual confirmation state per message.

5. **Clearing data**
   - Triggered from sidebar “Clear All Chats” button.
   - Confirmation handled via ShadCN `AlertDialog`.
   - On confirm, sessions are wiped and storage keys removed.

---

## Storage & Persistence

| Storage Key           | Description                                        |
| --------------------- | -------------------------------------------------- |
| `sync_chat_sessions`  | Array of `ChatSession` objects with conversations. |
| `sync_active_session` | ID of the session that should load on next visit.  |

Each conversation item follows the `TranslationHistory` interface:

```ts
{
  timestamp: string,
  source_text: string,
  translated_text: string,
  target_language: string,
  detected_language: string
}
```

---

## File Dependencies

```text
app/page.tsx
├── @/components/ui/button
├── @/components/ui/select
├── @/components/ui/scroll-area
├── @/components/ui/alert-dialog
├── @/lib/types
└── app/api/translate (via fetch)

app/api/translate/route.ts
├── next/server
├── @/lib/translator
└── @/lib/types

lib/translator.ts
├── process.env (Azure credentials)
└── @/lib/types

lib/types.ts
└── (shared interfaces: TranslationHistory, ChatSession, Translator response)
```

---

## Technology Stack

| Layer        | Technologies                                                  |
| ------------ | ------------------------------------------------------------- |
| Frontend     | Next.js 16 App Router, React 19, TypeScript, ShadCN, Tailwind |
| UI Styling   | Tailwind CSS v4 utility classes + ShadCN components           |
| API Layer    | Next.js Route Handlers (`app/api/translate/route.ts`)         |
| External API | Azure Cognitive Services – Translator API                     |
| Persistence  | Browser `localStorage`                                        |

---

## State Management Summary

- **Local State (useState)**
  - `sourceText`, `targetLanguage`, `chatSessions`, `activeSessionId`
  - UI-specific: `loading`, `isThinking`, `sidebarOpen`, `retranslatingIndex`, `copiedIndex`, `showClearAlert`
- **Effects (useEffect)**
  - Sync sessions/active ID with `localStorage`
  - Auto-scroll to bottom on new messages or thinking indicator change

This architecture keeps the UX responsive (everything renders client-side) while delegating translation work to secure Next.js API routes backed by Azure Translator.
