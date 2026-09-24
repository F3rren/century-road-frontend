import { Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeaderProps {
  sidebarOpen: boolean;
  onMenuToggle: () => void;
  className?: string;
}

export function Header({ sidebarOpen, onMenuToggle, className }: HeaderProps) {
  const { t } = useTranslation();

  return (
    <header
      className={cn(
        "flex h-14 items-center border-b bg-background px-4 gap-4",
        className
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuToggle}
        aria-label={sidebarOpen ? t("header.closeMenu") : t("header.openMenu")}
        aria-pressed={sidebarOpen}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      {/* Masthead: stays visible even with the sidebar collapsed (mobile,
          or manually closed on desktop) so identity never fully drops.
          Sized up from a detail-sized text-sm — the header is the one place
          this identity repeats on every single visit, so it earns real
          typographic weight, not just the Welcome page's one-time hero. */}
      <span className="hidden items-baseline gap-2.5 font-display uppercase tracking-wide sm:flex">
        <span className="text-lg font-semibold tracking-tight">Century Road</span>
        <span className="text-xs text-muted-foreground">{t("nav.brandTagline")}</span>
      </span>
      <div className="flex-1" />
    </header>
  );
}
