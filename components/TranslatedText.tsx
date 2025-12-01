import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TranslatedTextProps {
  text: string;
  detectedLanguage?: string;
  targetLanguage?: string;
}

export function TranslatedText({
  text,
  detectedLanguage,
  targetLanguage,
}: TranslatedTextProps) {
  if (!text) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          Translation
          {detectedLanguage && targetLanguage && (
            <span className="text-sm font-normal text-muted-foreground">
              {detectedLanguage} → {targetLanguage}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-base leading-relaxed">{text}</p>
      </CardContent>
    </Card>
  );
}
