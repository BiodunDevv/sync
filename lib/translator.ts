import { AzureTranslatorResponse } from "./types";

export async function translateText(
  text: string,
  targetLanguage: string
): Promise<AzureTranslatorResponse> {
  const apiKey = process.env.NEXT_PUBLIC_TRANSLATOR_API_KEY;
  const region = process.env.NEXT_PUBLIC_TRANSLATOR_REGION;
  const endpoint = process.env.NEXT_PUBLIC_TRANSLATOR_ENDPOINT;

  if (!apiKey || !region || !endpoint) {
    throw new Error("Azure Translator API credentials are missing");
  }

  const url = `${endpoint}/translate?api-version=3.0&to=${targetLanguage}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": apiKey,
      "Ocp-Apim-Subscription-Region": region,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([{ text }]),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Translation failed: ${response.status} - ${JSON.stringify(errorData)}`
    );
  }

  const data = await response.json();
  return data[0];
}
