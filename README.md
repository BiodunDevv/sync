# Azure Translator - Next.js 16 Translation System

A full-featured translation web application built with Next.js 16, ShadCN UI components, and Azure Translator API. The app supports multiple target languages, automatically detects source languages, and stores translation history in local storage.

## Features

✅ **Real-time Translation** - Translate text instantly using Azure Translator API  
✅ **Auto-detect Source Language** - Automatically identifies the input language  
✅ **Multiple Languages** - Support for 17+ languages including Afrikaans, Arabic, Chinese, Dutch, English, French, German, Hindi, Italian, Japanese, Korean, Portuguese, Russian, Spanish, Swahili, and Zulu  
✅ **Translation History** - Saves all translations to browser's local storage  
✅ **Scrollable History Panel** - View past translations with timestamps  
✅ **Clear History** - Option to clear all saved translations  
✅ **Responsive UI** - Mobile-first design using ShadCN components  
✅ **Dark Mode Support** - Automatic dark mode based on system preferences

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI Components**: ShadCN UI
- **Styling**: Tailwind CSS v4
- **Translation API**: Azure Cognitive Services Translator API
- **Storage**: Browser Local Storage

## Project Structure

```
sync/
├── app/
│   ├── api/
│   │   └── translate/
│   │       └── route.ts          # Backend API route for translation
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main translation page
├── components/
│   ├── ui/                       # ShadCN UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── scroll-area.tsx
│   │   └── select.tsx
│   ├── ChatHistory.tsx           # Translation history component
│   ├── TranslateButton.tsx       # Translate action button
│   ├── TranslatedText.tsx        # Display translated text
│   └── TranslationInput.tsx      # Input field component
├── lib/
│   ├── translator.ts             # Azure Translator API utility
│   ├── types.ts                  # TypeScript type definitions
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

1. **Enter Text**: Type or paste text into the input field
2. **Select Target Language**: Choose your desired translation language from the dropdown
3. **Translate**: Click the "Translate" button
4. **View Translation**: The translated text appears below with source → target language indication
5. **View History**: All translations are saved and displayed in the history panel
6. **Clear History**: Click "Clear History" to remove all saved translations

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

Translation history is stored in `localStorage` under `translation_history`:

```typescript
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
