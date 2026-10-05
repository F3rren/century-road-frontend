import { Menu, X } from "lucide-react";
import { Wordmark } from "@/components/ui/Wordmark";
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
        "flex h-14 items-center border-b bg-background px-4 gap-4 print:hidden",
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
      {/* One name on screen at a time: the open sidebar already carries the
          wordmark, so the header then keeps only the tagline; with the
          sidebar closed (phones, or collapsed on desktop) the header carries
          the name itself, so identity never drops. */}
      <span className="flex min-w-0 items-center gap-3">
        {!sidebarOpen && <Wordmark className="whitespace-nowrap text-lg" markClassName="h-4" />}
        <span className="hidden truncate text-sm text-muted-foreground lg:inline">{t("nav.brandTagline")}</span>
      </span>
      <div className="flex-1" />
    </header>
  );
}
