import { Button } from "@/components/ui/button";

interface TranslateButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function TranslateButton({
  onClick,
  disabled,
  loading,
}: TranslateButtonProps) {
  return (
    <Button onClick={onClick} disabled={disabled || loading} className="w-full">
      {loading ? "Translating..." : "Translate"}
    </Button>
  );
}
