import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/ui/PageHeader";
import { useIsDesktop } from "@/hooks/useMediaQuery";

interface ContentsItem {
  id: string;
  title: string;
}

interface ReadingPageProps {
  title: string;
  description: string;
  // The language of the title and description, when it is not the interface's.
  lang?: string;
  children: ReactNode;
}

// A long page read top to bottom (the guide, the methodology, the legal pages):
// the text in a reading column, and a list of its sections to see what is there
// and jump to one. On a wide screen the list sits in the left margin and stays in
// view while the text scrolls; on a narrow one it folds under the title, closed.
//
// The list is read from the page itself, every top-level <section> and its <h2>,
// rather than passed in: the legal pages write their headings by hand, and a
// second copy of each title would drift. A section without an id gets one, so it
// can be linked to.
export function ReadingPage({ title, description, lang, children }: ReadingPageProps) {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const textRef = useRef<HTMLDivElement>(null);
  const [contents, setContents] = useState<ContentsItem[]>([]);

  // Re-read whenever the page re-renders its sections (children are new elements
  // each time, a language switch included). Setting the same list again is
  // skipped, so this settles after one pass.
  useLayoutEffect(() => {
    const sections = [...(textRef.current?.querySelectorAll<HTMLElement>(":scope > section") ?? [])];
    const next = sections.map((section, i) => {
      if (!section.id) section.id = `section-${i + 1}`;
      return { id: section.id, title: section.querySelector("h2")?.textContent ?? "" };
    });
    setContents((prev) =>
      prev.length === next.length && prev.every((item, i) => item.id === next[i].id && item.title === next[i].title)
        ? prev
        : next,
    );
  }, [children]);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-5xl pb-8 lg:grid lg:grid-cols-[12rem_minmax(0,65ch)] lg:gap-x-12">
        <div className="lg:col-start-2">
          <PageHeader title={title} description={description} lang={lang} />
        </div>

        {contents.length > 0 && (
          <nav
            aria-label={t("common.onThisPage")}
            className="mt-6 lg:sticky lg:top-0 lg:col-start-1 lg:row-start-2 lg:mt-8 lg:self-start"
          >
            {/* Keyed on the breakpoint so the open state follows it on a resize. */}
            <details key={String(isDesktop)} open={isDesktop} className="group">
              <summary className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-eyebrow text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:pointer-events-none lg:min-h-0">
                <ChevronRight
                  className="h-4 w-4 transition-transform group-open:rotate-90 motion-reduce:transition-none lg:hidden"
                  aria-hidden="true"
                />
                {t("common.onThisPage")}
              </summary>
              <ul className="mt-2 space-y-0.5 border-l border-border">
                {contents.map(({ id, title: itemTitle }) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      className="-ml-px block border-l border-transparent py-1 pl-3 text-sm text-muted-foreground hover:border-primary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {itemTitle}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
          </nav>
        )}

        <div ref={textRef} className="mt-8 space-y-8 lg:col-start-2 lg:row-start-2">
          {children}
        </div>
      </div>
    </div>
  );
}
