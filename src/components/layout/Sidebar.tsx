import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Globe, LayoutDashboard, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  open: boolean;
  isDesktop: boolean;
  onClose: () => void;
  className?: string;
}

const navItems = [
  { label: 'Mappa',        href: '/',          icon: Globe,            end: true  },
  { label: 'Dashboard',    href: '/dashboard', icon: LayoutDashboard,  end: true  },
  { label: 'Impostazioni', href: '/settings',  icon: Settings,         end: false },
];

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
          'flex shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-300',
          isDesktop
            ? open
              ? 'w-60'
              : 'w-0'
            : cn(
                'fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300',
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
          <div className="flex h-14 items-center px-4 text-lg font-semibold shrink-0 whitespace-nowrap">
            Century Road
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navItems.map(({ label, href, icon: Icon, end }) => (
              <NavLink
                key={href}
                to={href}
                end={end}
                tabIndex={!open ? -1 : undefined}
                onClick={() => {
                  if (!isDesktop) onClose();
                }}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-sidebar-border',
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
