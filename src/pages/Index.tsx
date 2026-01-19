import AppHeader from "@/components/AppHeader";
import CaptureInput from "@/components/CaptureInput";
import EntryList from "@/components/EntryList";
import { Toaster } from "@/components/ui/sonner";

export default function Index() {
  return (
    <div className="flex flex-col h-screen">
      <AppHeader />
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
          <EntryList />
        </div>
      </main>
      <footer className="bg-background border-t">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-4">
          <CaptureInput />
        </div>
      </footer>
      <Toaster />
    </div>
  );
}
