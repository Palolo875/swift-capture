import { db } from "@/lib/db";
import type { Entry } from "@/types/entry";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";

interface EntryCardProps {
  entry: Entry;
}

export default function EntryCard({ entry }: EntryCardProps) {
  const handleDelete = async () => {
    try {
      await db.entries.delete(entry.id!);
      toast.success("Note supprimée !");
    } catch (error) {
      toast.error("Erreur lors de la suppression de la note");
    }
  };

  return (
    <div className="bg-card rounded-2xl p-5 shadow-sm border border-border">
      <p className="text-card-foreground leading-relaxed whitespace-pre-wrap">
        {entry.rawText}
      </p>
      <div className="flex items-center justify-between mt-4">
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true, locale: fr })}
        </span>
        <Button variant="ghost" size="icon" onClick={handleDelete}>
          <X size={16} />
        </Button>
      </div>
    </div>
  );
}
