import { Link } from "react-router-dom";
import { usePageTitle } from "@/hooks/usePageTitle";

export function NotFoundPage() {
  usePageTitle("Pagina non trovata");

  return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <h1 className="font-display text-6xl font-semibold text-muted-foreground">404</h1>
      <p className="text-lg text-muted-foreground">Pagina non trovata</p>
      <Link to="/" className="text-primary hover:underline text-sm">
        Torna alla Mappa
      </Link>
    </div>
  );
}
