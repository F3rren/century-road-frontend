import { Navigate } from "react-router-dom";
import { hasSeenWelcome } from "@/lib/welcomeSeen";
import { MapPage } from "./MapPage";

// The very first visit routes through /welcome; every later one lands
// straight on the Mappa — the same "default unless a preference says
// otherwise" shape the app already uses for theme/language/projection.
export function IndexRoute() {
  if (!hasSeenWelcome()) return <Navigate to="/welcome" replace />;
  return <MapPage />;
}
