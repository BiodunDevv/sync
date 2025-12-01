import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TranslationHistory } from "@/lib/types";
import { Button } from "@/components/ui/button";

interface ChatHistoryProps {
  history: TranslationHistory[];
  onClear: () => void;
}

export function ChatHistory({ history, onClear }: ChatHistoryProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-xl">Translation History</CardTitle>
        {history.length > 0 && (
          <Button variant="outline" size="sm" onClick={onClear}>
            Clear History
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No translations yet
            </p>
          ) : (
            <div className="space-y-4">
              {history.map((item, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardContent className="pt-4 space-y-2">
                    <div className="text-xs text-muted-foreground">
                      {new Date(item.timestamp).toLocaleString()} •{" "}
                      {item.detected_language} → {item.target_language}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Original:</p>
                      <p className="text-sm text-muted-foreground">
                        {item.source_text}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Translation:</p>
                      <p className="text-sm text-primary">
                        {item.translated_text}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
