# Sync Cloud - Multi-Cloud Services Platform

A modern multi-cloud platform built with Next.js 16 and ShadCN UI, featuring three powerful cloud services: Azure Translation, Brevo Email, and OpenWeather API. Access enterprise-grade cloud services through beautiful, intuitive interfaces.

## 🌐 Cloud Services

### 1. **Azure Translator** (`/translate`)

- ChatGPT-style translation interface
- 20+ languages with Nigerian language support (Igbo, Yoruba, Hausa)
- Real-time translation with auto-detection
- Persistent chat sessions
- Retranslation to different languages
- Copy and share translations

### 2. **Brevo Email** (`/email`)

- Send beautifully formatted HTML emails
- Custom email templates with gradient styling
- Test email functionality
- Real-time delivery status
- Professional email layouts

### 3. **OpenWeather** (`/weather`)

- Real-time weather data for any city
- Current conditions with detailed metrics
- Temperature, humidity, wind speed, visibility
- Sunrise/sunset times
- Weather icons and descriptions

## ✨ Features

✅ **Multi-Cloud Platform** - Three cloud services in one unified interface  
✅ **Modern UI** - Built entirely with ShadCN components  
✅ **Cloud-Powered** - No local processing, 100% cloud computing  
✅ **Responsive Design** - Beautiful on desktop, tablet, and mobile  
✅ **Dark Mode** - System-aware theme switching  
✅ **Toast Notifications** - Real-time feedback with Sonner  
✅ **Type-Safe** - Full TypeScript implementation  
✅ **API Routes** - Next.js server-side API endpoints

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI Components**: ShadCN UI (Card, Button, Input, Textarea, Dropdown, etc.)
- **Icons**: Lucide React
- **Styling**: Tailwind CSS v4
- **Notifications**: Sonner
- **Theme**: next-themes

## ☁️ Cloud APIs

- **Azure Translator API** - Microsoft Cognitive Services
- **Brevo Email API** - Professional email delivery service
- **OpenWeather API** - Real-time weather data

## 📁 Project Structure

```text
sync/
├── app/
│   ├── api/
│   │   ├── translate/
│   │   │   └── route.ts          # Azure translation endpoint
│   │   ├── send-email/
│   │   │   └── route.ts          # Brevo email endpoint
│   │   └── weather/
│   │       └── route.ts          # OpenWeather endpoint
│   ├── translate/
│   │   └── page.tsx              # Translation chat interface
│   ├── email/
│   │   └── page.tsx              # Email testing interface
│   ├── weather/
│   │   └── page.tsx              # Weather dashboard
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout with ThemeProvider
│   └── page.tsx                  # Welcome/landing page
├── components/
│   └── ui/                       # ShadCN UI components
│       ├── card.tsx
│       ├── button.tsx
│       ├── input.tsx
│       ├── textarea.tsx
│       ├── dropdown-menu.tsx
│       └── ... (more components)
├── lib/
│   ├── translator.ts             # Azure Translator utility
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

Create or update `.env.local` with the following API credentials:

```env
# Azure Translator API
NEXT_PUBLIC_TRANSLATOR_API_KEY=your_azure_api_key
NEXT_PUBLIC_TRANSLATOR_REGION=southafricanorth
NEXT_PUBLIC_TRANSLATOR_ENDPOINT=https://api.cognitive.microsofttranslator.com

# Brevo Email Service
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_sender_email@example.com
BREVO_SENDER_NAME=Your Name

# OpenWeather API
NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key
```

**Get your API keys:**

- Azure Translator: [Azure Portal](https://portal.azure.com)
- Brevo: [Brevo Dashboard](https://app.brevo.com)
- OpenWeather: [OpenWeather API](https://openweathermap.org/api)

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
