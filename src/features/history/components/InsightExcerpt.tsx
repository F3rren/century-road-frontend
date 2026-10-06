import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { insightRoute } from '../lib/editorial';
import type { Excerpt } from '../lib/excerpt';
import { YearMark } from './YearMark';

// An insight's before, the event, after and a few connections, without a heading of its own: the
// caller says what it is (the dialog's "Perché conta", the path stop's summary). The hand-written
// text is Italian only, whatever the interface language.
//
// Set apart from Wikipedia's text around it by its own palette, drawn from the system's tokens: a
// Haze surface (tone, not a shadow or a box), a 2px Exposure Blue rule on its edge, and the part
// labels in Exposure Blue. Every pairing clears 7:1 in both themes, measured: Prussian on Haze
// 12.0:1, Shade 7.5:1, Exposure Blue 7.1:1 (light); 12.7, 7.2 and 7.3 (dark).
export function InsightExcerpt({ excerpt }: { excerpt: Excerpt }) {
  const { t } = useTranslation();
  const { parts, connections } = excerpt;
  return (
    <div className="border-l-2 border-primary bg-muted px-4 py-3">
      <div className="space-y-4">
        {parts.map((part) => (
          <div key={part.key}>
            <h4 className="text-sm font-bold text-primary">{t(`insights.${part.key}`)}</h4>
            <div lang="it" className="mt-1 space-y-2">
              {part.paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
      {connections.length > 0 && (
        <div className="mt-5">
          <h4 className="text-sm font-bold text-primary">{t('history.dialog.connections')}</h4>
          <ul className="mt-1 divide-y divide-border border-y border-border">
            {connections.map((related) => (
              <li key={related.slug} className="py-2.5">
                <Link
                  to={insightRoute(related.slug)}
                  className="group grid grid-cols-[3.75rem_minmax(0,1fr)] gap-x-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <YearMark year={related.date.year} />
                  <span lang="it">
                    <span className="block font-serif text-base leading-snug group-hover:text-primary">
                      {related.title}
                    </span>
                    <span className="mt-1 block text-sm text-muted-foreground">{related.reason}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
