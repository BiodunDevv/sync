import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TranslationInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function TranslationInput({ value, onChange }: TranslationInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="source-text">Enter text to translate</Label>
      <Input
        id="source-text"
        placeholder="Type your text here..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[100px] resize-none"
      />
    </div>
  );
}
