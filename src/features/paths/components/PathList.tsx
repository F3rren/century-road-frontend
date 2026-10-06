import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { insightRoute, pathRoute, type PathSummary, type StartHereItem } from '@/features/history';
import { formatEventDate } from '@/lib/months';

const ROW_LINK_CLASS =
  'group block py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring';
const TITLE_CLASS = 'block font-display text-xl font-semibold leading-snug group-hover:text-primary';

// "9 tappe, 7 minuti di lettura": counted by the backend (reading time from the words at 200 a
// minute), never written by hand, so it is shown as given.
function PathMeta({ path }: { path: PathSummary }) {
  const { t } = useTranslation();
  return (
    <span className="mt-1 block text-xs text-muted-foreground">
      {t('paths.meta', { stops: t('paths.stops', { count: path.stopCount }), minutes: t('paths.minutes', { count: path.readingMinutes }) })}
    </span>
  );
}

// Every path as a ruled row, title first: no boxes (DESIGN.md, The Flat Rule). The cover is not
// in the list on purpose - a Commons photograph is shown only with the link to its author and
// licence, which belongs on the path's own page.
export function PathList({ paths }: { paths: readonly PathSummary[] }) {
  return (
    <ul className="divide-y divide-border border-y border-border">
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

// "Inizia da qui": a few paths and events picked by hand, each with a sentence on why to open it.
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
                {formatEventDate(item.insight.date.day, item.insight.date.month, item.insight.date.year, i18n.language)}
              </span>
            )}
          </Link>
        </li>
      ))}
    </ol>
  );
}
