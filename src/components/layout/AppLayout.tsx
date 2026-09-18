import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

export function AppLayout() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);
  const navigate = useNavigate();

  useKeyboardShortcuts({
    "1": () => navigate("/"),
    "2": () => navigate("/dashboard"),
    "3": () => navigate("/settings"),
  });

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
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        open={sidebarOpen}
        isDesktop={isDesktop}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          sidebarOpen={sidebarOpen}
          onMenuToggle={() => setSidebarOpen((v) => !v)}
        />
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
