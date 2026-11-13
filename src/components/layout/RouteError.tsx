import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Link, useRouteError } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

// A page that failed to load after a deploy: the browser still has the old index and asks for a chunk the
// new build no longer has. Chrome, Firefox and Safari each word it differently, and none gives it a type.
const STALE_CHUNK = /dynamically imported module|importing a module script|loading chunk|loading css chunk/i;

function isStaleChunk(error: unknown): boolean {
  return error instanceof Error && STALE_CHUNK.test(error.message);
}

// What the router shows when a page throws while it renders (or its chunk cannot be fetched), instead of
// a blank screen: React unmounts a tree that throws, and without a boundary that is the whole app. It sits
// inside the layout (see src/router/index.tsx), so the sidebar stays and the rest of the site is one click away.
export function RouteError() {
  const { t } = useTranslation();
  const error = useRouteError();

  // The router logs it in development only; in production this is the one place it is not lost.
  useEffect(() => {
    console.error(error);
  }, [error]);

  const stale = isStaleChunk(error);

  // Its own markup, not EmptyState's: that one prints its title as a paragraph, and a page that has been
  // replaced by a message needs the heading a screen reader jumps to.
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <AlertTriangle aria-hidden="true" className="h-8 w-8 text-destructive" />
      <h1 className="font-display text-xl font-semibold">{t("errorPage.title")}</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        {t(stale ? "errorPage.newVersion" : "errorPage.message")}
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
        <Button size="sm" onClick={() => window.location.reload()}>
          <RotateCw className="h-3.5 w-3.5" />
          {t("errorPage.reload")}
        </Button>
        <Link
          to="/"
          className="text-sm text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t("notFound.backToMap")}
        </Link>
      </div>
    </div>
  );
}
