import { useEntries } from "@/lib/db";
import EntryCard from "./EntryCard";
import { Inbox, Loader2 } from "lucide-react";

export default function EntryList() {
  const { entries, isLoading } = useEntries();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (entries && entries.length === 0) {
    return (
      <div className="text-center h-full flex flex-col justify-center items-center">
        <Inbox className="w-12 h-12 text-muted-foreground" />
        <h3 className="text-lg font-medium mt-4">Boîte de réception vide</h3>
        <p className="text-muted-foreground mt-1">
          Commencez par capturer une nouvelle idée.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries?.map((entry, index) => (
        <div
          key={entry.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <EntryCard entry={entry} />
        </div>
      ))}
    </div>
  );
}
