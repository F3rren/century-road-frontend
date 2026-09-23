import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Archive, FileText, Globe, LayoutDashboard, Settings, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  open: boolean;
  isDesktop: boolean;
  onClose: () => void;
  className?: string;
}

const navItems = [
  { label: 'Mappa',        href: '/',          icon: Globe,            end: true,  shortcut: '1' },
  { label: 'Dashboard',    href: '/dashboard', icon: LayoutDashboard,  end: true,  shortcut: '2' },
  { label: 'Archivio',     href: '/archive',   icon: Archive,          end: false, shortcut: '3' },
  { label: 'Impostazioni', href: '/settings',  icon: Settings,         end: false, shortcut: '4' },
];

// Legal pages: reachable from anywhere but not part of the app proper, so they
// sit below the main links instead of taking a shortcut number.
const legalItems = [
  { label: 'Privacy',              href: '/privacy', icon: ShieldCheck },
  { label: 'Termini e condizioni', href: '/terms',   icon: FileText },
];

// Index-tab look shared by the main links and the legal links below them.
function navLinkClass({ isActive }: { isActive: boolean }): string {
  return cn(
    'flex items-center gap-3 whitespace-nowrap border-l-2 px-[calc(1rem-2px)] py-2.5 font-display text-sm font-semibold uppercase tracking-wide transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar',
    isActive
      ? 'border-sidebar-accent bg-sidebar-border/40 text-sidebar-accent'
      : 'border-transparent text-sidebar-foreground/70 hover:border-sidebar-border hover:bg-sidebar-border/20 hover:text-sidebar-foreground',
  );
}

export function Sidebar({ open, isDesktop, onClose, className }: SidebarProps) {
  // Mobile drawer: Escape closes it, like any overlay.
  useEffect(() => {
    if (isDesktop || !open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isDesktop, open, onClose]);

  return (
    <>
      {!isDesktop && open && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        aria-label="Navigazione principale"
        className={cn(
          'flex shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300 motion-reduce:duration-75',
          isDesktop
            ? open
              ? 'w-60'
              : 'w-0'
            : cn(
                'fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 motion-reduce:duration-75',
                open ? 'translate-x-0' : '-translate-x-full'
              ),
          className,
        )}
        // Closed (either width-collapsed on desktop, or off-screen on
        // mobile) means genuinely hidden: no tabbing into it, no
        // announcing it to screen readers.
        aria-hidden={!open}
      >
        {/* Inner content keeps a fixed width so it clips instead of
            reflowing/wrapping while the <aside> animates its width. */}
        <div className={cn('flex h-full flex-col', isDesktop ? 'w-60' : 'w-64')}>
          <div className="flex h-14 shrink-0 items-center border-b border-sidebar-border px-4 whitespace-nowrap">
            <span className="font-display text-lg font-semibold uppercase tracking-wide">
              Century Road
            </span>
          </div>
          {/* Index tabs, not nav pills: an active left rule in the one
              accent color, like a tabbed directory board — not a filled
              rounded highlight. */}
          <nav className="flex-1 px-0 py-2">
            {navItems.map(({ label, href, icon: Icon, end, shortcut }) => (
              <NavLink
                key={href}
                to={href}
                end={end}
                tabIndex={!open ? -1 : undefined}
                aria-keyshortcuts={shortcut}
                onClick={() => {
                  if (!isDesktop) onClose();
                }}
                className={navLinkClass}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>
          {/* Legal links, set apart from the sections of the app by a rule. */}
          <div className="shrink-0 border-t border-sidebar-border py-2">
            {legalItems.map(({ label, href, icon: Icon }) => (
              <NavLink
                key={href}
                to={href}
                tabIndex={!open ? -1 : undefined}
                onClick={() => {
                  if (!isDesktop) onClose();
                }}
                className={navLinkClass}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
