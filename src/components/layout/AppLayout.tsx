import { Suspense, useMemo, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { RouteFallback } from "./RouteFallback";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

export function AppLayout() {
  const isDesktop = useIsDesktop();
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);
  const navigate = useNavigate();

  const shortcuts = useMemo(
    () => ({
      "1": () => navigate("/"),
      "2": () => navigate("/dashboard"),
      "3": () => navigate("/archive"),
      "4": () => navigate("/century"),
      "5": () => navigate("/settings"),
    }),
    [navigate],
  );
  useKeyboardShortcuts(shortcuts);

  // Re-sync sidebarOpen whenever the breakpoint itself changes (resize/
  // rotation), so it never gets stuck closed-on-desktop or open-on-mobile.
  // Adjusted during render (React's documented pattern for this) rather
  // than in an effect, to avoid an extra post-mount render pass.
  const [prevIsDesktop, setPrevIsDesktop] = useState(isDesktop);
  if (isDesktop !== prevIsDesktop) {
    setPrevIsDesktop(isDesktop);
    setSidebarOpen(isDesktop);
  }

  return (
    // On paper the fixed screen frame lets go, so a long page flows across sheets instead of
    // being clipped to one viewport.
    <div className="flex h-screen overflow-hidden print:block print:h-auto print:overflow-visible">
      <Sidebar
        open={sidebarOpen}
        isDesktop={isDesktop}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden print:block print:overflow-visible">
        <Header
          sidebarOpen={sidebarOpen}
          onMenuToggle={() => setSidebarOpen((v) => !v)}
        />
        <main className="flex-1 overflow-hidden print:overflow-visible">
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
