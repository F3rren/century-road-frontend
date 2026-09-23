import { Link } from "react-router-dom";

interface SeeAlsoProps {
  to: string;
  label: string;
}

// Points from one legal page to its sibling, closing the page.
export function SeeAlso({ to, label }: SeeAlsoProps) {
  return (
    <p className="border-t border-border pt-4 text-sm text-muted-foreground">
      Vedi anche:{" "}
      <Link
        to={to}
        className="text-primary underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {label}
      </Link>
    </p>
  );
}
