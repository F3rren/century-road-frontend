import { Settings } from "lucide-react";
import { usePageTitle } from "@/hooks/usePageTitle";

export function SettingsPage() {
  usePageTitle("Impostazioni");

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
      <Settings className="h-8 w-8 text-muted-foreground" />
      <h1 className="text-xl font-semibold">Impostazioni</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Questa sezione è in arrivo. Torna a trovarci presto.
      </p>
    </div>
  );
}
