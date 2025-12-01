import { NextRequest, NextResponse } from "next/server";
import { translateText } from "@/lib/translator";
import { TranslateRequest, TranslateResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body: TranslateRequest = await request.json();
    const { text, targetLanguage } = body;

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: "Missing text or targetLanguage" },
        { status: 400 }
      );
    }

    const result = await translateText(text, targetLanguage);

    const response: TranslateResponse = {
      translatedText: result.translations[0].text,
      detectedLanguage: result.detectedLanguage?.language || "unknown",
      targetLanguage: result.translations[0].to,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Translation failed" },
      { status: 500 }
    );
  }
}
