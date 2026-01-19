import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { captureEntry } from "@/lib/capture";
import { useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";

export default function CaptureInput() {
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = inputRef.current?.value;
    if (!value) return;

    try {
      await captureEntry(value);
      await queryClient.invalidateQueries({ queryKey: ["entries"] });
      toast.success("Note ajoutée !");
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch {
      toast.error("Erreur lors de l'ajout de la note");
    }
  };

  return (
    <form className="relative" onSubmit={handleSubmit}>
      <Input
        ref={inputRef}
        placeholder="Capturez une idée..."
        className="w-full rounded-full px-6 py-6 text-lg"
      />
      <Button
        type="submit"
        size="icon"
        className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full"
      >
        <Send size={20} />
      </Button>
    </form>
  );
}
