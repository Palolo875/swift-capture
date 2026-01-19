export default function AppHeader() {
  return (
    <header className="bg-background border-b">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">MEMEX-Reel</h1>
          <p className="text-sm text-muted-foreground">
            Capturez vos pensées et listes instantanément.
          </p>
        </div>
      </div>
    </header>
  );
}
