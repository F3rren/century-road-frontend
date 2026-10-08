import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  formatEditorialDate,
  insightRoute,
  pathRoute,
  type PathSummary,
  type StartHereItem,
} from '@/features/history';
import { cn } from '@/lib/utils';
import type { MacroGroup } from '../lib/macroTopics';
import type { PathGroup } from '../lib/pathFilters';
import { describePath, topicName } from '../lib/pathText';

const ROW_LINK_CLASS =
  'group block py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring';
const TITLE_CLASS = 'block font-display text-xl font-semibold leading-snug group-hover:text-primary';

// "1789–1799, 8 tappe, 9 minuti di lettura": from the backend, never written by hand.
function PathMeta({ path }: { path: PathSummary }) {
  const { t, i18n } = useTranslation();
  return <span className="mt-1 block text-xs text-muted-foreground">{describePath(t, i18n.language, path)}</span>;
}

// Paths as ruled rows, title first: no boxes (DESIGN.md, The Flat Rule). The cover is not in the
// list on purpose - a Commons photograph is shown only with the link to its author and licence,
// which belongs on the path's own page. `nested`: the list sits under a rule of its own (a topic's
// row), so it adds only the one below its rows.
export function PathList({ paths, nested = false }: { paths: readonly PathSummary[]; nested?: boolean }) {
  return (
    <ul className={cn('divide-y divide-border border-border', nested ? 'border-t' : 'border-y')}>
      {paths.map((path) => (
        <li key={path.slug}>
          <Link to={pathRoute(path.slug)} className={ROW_LINK_CLASS}>
            <span lang="it" className="block">
              <span className={TITLE_CLASS}>{path.title}</span>
              <span className="mt-0.5 block font-serif text-base leading-snug text-muted-foreground">{path.tagline}</span>
            </span>
            <PathMeta path={path} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

// A topic is a closed row with its name and how many paths it holds; opening it shows them. A
// named group, so that hovering a path inside does not light up the whole open topic.
function TopicRow({ code, group, open }: { code: string; group: PathGroup; open: boolean }) {
  const { t } = useTranslation();
  return (
    <details open={open} className="group/topic">
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
        <ChevronRight
          className="h-4 w-4 shrink-0 text-primary transition-transform group-open/topic:rotate-90 motion-reduce:transition-none"
          aria-hidden="true"
        />
        <span className="font-display text-lg font-semibold">{topicName(t, code, group.label ?? undefined)}</span>
        <span className="ml-auto text-xs text-muted-foreground">{t('paths.filters.count', { count: group.paths.length })}</span>
      </summary>
      <div className="pl-6">
        <PathList paths={group.paths} nested />
      </div>
    </details>
  );
}

// The paths under a heading per macro-topic, each topic closed until opened. With a search or a
// topic chosen they are open, so that what was asked for is in view. A group with no topic (an
// older backend sends none) has no heading and no row: it is just the list.
export function GroupedPathList({ macros, open }: { macros: readonly MacroGroup[]; open: boolean }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-8">
      {macros.map(({ macro, groups }) =>
        macro === null ? (
          groups.map((group) => <PathList key="no-topic" paths={group.paths} />)
        ) : (
          <section key={macro} aria-labelledby={`macro-${macro}`}>
            <h3 id={`macro-${macro}`} className="mb-1 scroll-mt-6 text-eyebrow text-primary">
              {t(`paths.macro.${macro}`)}
            </h3>
            <div className="divide-y divide-border border-y border-border">
              {groups.map((group) =>
                group.topic === null ? null : <TopicRow key={group.topic} code={group.topic} group={group} open={open} />,
              )}
            </div>
          </section>
        ),
      )}
    </div>
  );
}

// "Inizia da qui": a few paths and events picked by an editor, each with a sentence on why to open it.
export function StartHereList({ items }: { items: readonly StartHereItem[] }) {
  const { t, i18n } = useTranslation();
  return (
    <ol className="divide-y divide-border border-y border-border">
      {items.map((item) => (
        <li key={`${item.type}-${item.slug}`}>
          <Link
            to={item.type === 'PATH' ? pathRoute(item.slug) : insightRoute(item.slug)}
            className={ROW_LINK_CLASS}
          >
            <span className="block text-eyebrow text-primary">
              {t(item.type === 'PATH' ? 'paths.kind.path' : 'paths.kind.insight')}
            </span>
            <span lang="it" className="block">
              <span className={TITLE_CLASS}>{item.title}</span>
              <span className="mt-0.5 block font-serif text-base leading-snug">{item.teaser}</span>
            </span>
            {item.type === 'PATH' ? (
              <PathMeta path={item.path} />
            ) : (
              <span className="mt-1 block text-xs text-muted-foreground">
                {formatEditorialDate(item.insight.date, i18n.language)}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ol>
  );
}
