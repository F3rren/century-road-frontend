interface LastUpdatedProps {
  // ISO date (YYYY-MM-DD); the visible label is derived from it.
  iso: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function LastUpdated({ iso }: LastUpdatedProps) {
  return (
    <p className="text-sm text-muted-foreground">
      Ultimo aggiornamento: <time dateTime={iso}>{formatDate(iso)}</time>
    </p>
  );
}
