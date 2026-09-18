import { Menu, X, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";

interface HeaderProps {
  sidebarOpen: boolean;
  onMenuToggle: () => void;
  className?: string;
}

export function Header({ sidebarOpen, onMenuToggle, className }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

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
        aria-label={sidebarOpen ? "Chiudi menu" : "Apri menu"}
        aria-pressed={sidebarOpen}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      <div className="flex-1" />
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        aria-label={theme === "dark" ? "Passa al tema chiaro" : "Passa al tema scuro"}
      >
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>
    </header>
  );
}
