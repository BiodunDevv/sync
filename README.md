# Sync - AI Translation Chat

A modern chat-first translation web application built with Next.js 16, ShadCN UI, and Azure Translator API. Experience seamless translation through an intuitive ChatGPT-style interface with persistent chat sessions and Nigerian language support.

## Features

✅ **Chat-Style Interface** - Modern conversational UI similar to ChatGPT  
✅ **Persistent Sessions** - Create and manage multiple chat sessions  
✅ **Real-time Translation** - Instant translation using Azure Translator API  
✅ **Auto-detect Source Language** - Automatically identifies the input language  
✅ **Nigerian Languages Featured** - Quick access to Igbo, Yoruba, and Hausa  
✅ **17+ Supported Languages** - Including Afrikaans, Arabic, Chinese, Dutch, English, French, German, Hindi, Italian, Japanese, Korean, Portuguese, Russian, Spanish, Swahili, and Zulu  
✅ **Retranslation** - Change target language for any AI response  
✅ **Copy to Clipboard** - One-click copy of translations  
✅ **Session History** - All conversations saved to browser local storage  
✅ **Responsive Design** - Smooth mobile experience with slide-out sidebar  
✅ **Dark Mode Support** - Default dark theme with system preference support  
✅ **Fixed Header & Input** - ChatGPT-like layout with scrollable conversation area

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI Components**: ShadCN UI (Button, Select, ScrollArea, AlertDialog)
- **Icons**: Lucide React
- **Styling**: Tailwind CSS v4
- **Translation API**: Azure Cognitive Services Translator API
- **Storage**: Browser Local Storage
- **Theme**: next-themes

## Project Structure

```text
sync/
├── app/
│   ├── api/
│   │   └── translate/
│   │       └── route.ts          # Backend API route for translation
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout with ThemeProvider
│   └── page.tsx                  # Main chat interface (700+ lines)
├── components/
│   └── ui/                       # ShadCN UI components
│       ├── alert-dialog.tsx      # Confirmation modals
│       ├── button.tsx
│       ├── scroll-area.tsx
│       └── select.tsx
├── lib/
│   ├── translator.ts             # Azure Translator API utility
│   ├── types.ts                  # TypeScript interfaces
│   │   ├── TranslationHistory
│   │   ├── ChatSession
│   │   ├── AzureTranslatorResponse
│   │   └── TranslateRequest/Response
│   └── utils.ts                  # Utility functions
├── .env.local                    # Environment variables (API keys)
└── package.json
```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

The `.env.local` file is already configured with Azure Translator API credentials:

```env
NEXT_PUBLIC_TRANSLATOR_API_KEY=your_api_key
NEXT_PUBLIC_TRANSLATOR_REGION=southafricanorth
NEXT_PUBLIC_TRANSLATOR_ENDPOINT=https://api.cognitive.microsofttranslator.com
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

1. **Create/Select Chat**: Click "+ New Chat" or select an existing session from the sidebar
2. **Choose Language**: Select target language from the pills below the input (Igbo, Yoruba, Hausa featured) or use the "More" dropdown
3. **Send Message**: Type your text and press Enter or click the send button
4. **View Translation**: AI responds with the translation, showing detected source language
5. **Retranslate**: Click the language dropdown on any AI response to translate to a different language
6. **Copy Translation**: Click the copy icon next to any translation
7. **Manage Sessions**: View all chat sessions in the sidebar, delete individual chats, or use "Clear All Chats" with confirmation
8. **Mobile**: Tap the menu icon to open the sidebar overlay

## API Endpoints

### POST `/api/translate`

Translates text using Azure Translator API.

**Request:**

```json
{
  "text": "Hello, world!",
  "targetLanguage": "es"
}
```

**Response:**

```json
{
  "translatedText": "¡Hola, mundo!",
  "detectedLanguage": "en",
  "targetLanguage": "es"
}
```

## Supported Languages

### Featured Nigerian Languages

- **ig** - 🇳🇬 Igbo
- **yo** - 🇳🇬 Yoruba
- **ha** - 🇳🇬 Hausa

### Other Languages

- **af** - Afrikaans
- **ar** - Arabic
- **zh-Hans** - Chinese (Simplified)
- **zh-Hant** - Chinese (Traditional)
- **nl** - Dutch
- **en** - English
- **fr** - French
- **de** - German
- **hi** - Hindi
- **it** - Italian
- **ja** - Japanese
- **ko** - Korean
- **pt** - Portuguese
- **ru** - Russian
- **es** - Spanish
- **sw** - Swahili
- **zu** - Zulu

## Local Storage

Chat sessions are persisted in `localStorage`:

**Keys:**

- `sync_chat_sessions` - Array of chat sessions with conversations
- `sync_active_session` - ID of the currently active session

**Interfaces:**

```typescript
interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
  conversations: TranslationHistory[];
}

interface TranslationHistory {
  timestamp: string;
  source_text: string;
  translated_text: string;
  target_language: string;
  detected_language: string;
}
```

## Build for Production

```bash
npm run build
npm start
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Azure Translator API](https://docs.microsoft.com/azure/cognitive-services/translator/)
- [ShadCN UI](https://ui.shadcn.com/)

## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
