export interface TranslationHistory {
  timestamp: string;
  source_text: string;
  translated_text: string;
  target_language: string;
  detected_language: string;
}

export interface ChatSession {
  id: string;
  title: string;
  timestamp: string;
  conversations: TranslationHistory[];
}

export interface AzureTranslatorResponse {
  detectedLanguage?: {
    language: string;
    score: number;
  };
  translations: Array<{
    text: string;
    to: string;
  }>;
}

export interface TranslateRequest {
  text: string;
  targetLanguage: string;
}

export interface TranslateResponse {
  translatedText: string;
  detectedLanguage: string;
  targetLanguage: string;
}
