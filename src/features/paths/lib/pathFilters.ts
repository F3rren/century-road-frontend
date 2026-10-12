import type { PathSummary } from '@/features/history';

// What the list of paths is narrowed by. Both live in the URL (`/paths?topic=ROMA_IMPERIALE&q=augusto`),
// so a filtered list is a link, and Back returns to it.
export interface PathFilters {
  query: string;
  // The backend's code for the topic (a closed list on its side), null = every topic.
  topic: string | null;
}

export const NO_FILTERS: PathFilters = { query: '', topic: null };

// What a code looks like, so that a hand-edited URL cannot put anything else in the filter.
const TOPIC_CODE = /^[A-Z][A-Z0-9_]*$/;

// Anything malformed falls back to "no filter" instead of erroring, like the other pages' params.
export function parsePathFilters(params: URLSearchParams): PathFilters {
  const topic = params.get('topic');
  return {
    query: params.get('q') ?? '',
    topic: topic !== null && TOPIC_CODE.test(topic) ? topic : null,
  };
}

// The defaults are left out, so the address of the whole list stays `/paths`.
export function toPathSearchParams({ query, topic }: PathFilters): URLSearchParams {
  const params = new URLSearchParams();
  if (topic !== null) params.set('topic', topic);
  if (query !== '') params.set('q', query);
  return params;
}

export function hasFilters({ query, topic }: PathFilters): boolean {
  return query.trim() !== '' || topic !== null;
}

// "perche" finds "Perché": lower case, accents off. Titles are Italian whatever the interface
// language, and readers of every language type without accents.
export function normalizeText(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

// Every word of the query has to be somewhere in the title, the tagline or the topic's name.
export function matchesPath(path: Pick<PathSummary, 'title' | 'tagline' | 'topicLabel'>, query: string): boolean {
  const words = normalizeText(query).split(/\s+/).filter((word) => word !== '');
  if (words.length === 0) return true;
  const haystack = normalizeText(`${path.title} ${path.tagline} ${path.topicLabel ?? ''}`);
  return words.every((word) => haystack.includes(word));
}

export function filterPaths(paths: readonly PathSummary[], filters: PathFilters): PathSummary[] {
  return paths.filter((path) => (filters.topic === null || path.topic === filters.topic) && matchesPath(path, filters.query));
}

export interface TopicOption {
  code: string;
  // The backend's Italian name: what is shown when the interface has no translation of the code.
  label: string;
  // How many paths of that topic match the search words.
  count: number;
}

// The topics that exist, in the order the backend lists them (the order it means them to be read
// in), each with how many of its paths match what has been typed. A topic that is chosen stays in
// the list even when the search leaves it no path, so the select never shows a value it lacks.
export function topicOptions(all: readonly PathSummary[], query: string, chosen: string | null): TopicOption[] {
  const options = new Map<string, TopicOption>();
  for (const path of all) {
    if (path.topic === undefined) continue;
    const option = options.get(path.topic) ?? { code: path.topic, label: path.topicLabel ?? path.topic, count: 0 };
    if (matchesPath(path, query)) option.count += 1;
    options.set(path.topic, option);
  }
  const list = [...options.values()];
  return chosen !== null && !options.has(chosen) ? [...list, { code: chosen, label: chosen, count: 0 }] : list;
}

export interface PathGroup {
  // null: paths the backend sent without a topic (an older backend), listed in one group.
  topic: string | null;
  label: string | null;
  paths: PathSummary[];
}

// Runs of the same topic, in the order they come: the backend already orders by topic, and the
// frontend does not second-guess it. With no topic anywhere there is one group and no headings.
export function groupByTopic(paths: readonly PathSummary[]): PathGroup[] {
  const groups = new Map<string | null, PathGroup>();
  for (const path of paths) {
    const key = path.topic ?? null;
    const group = groups.get(key) ?? { topic: key, label: key === null ? null : path.topicLabel ?? key, paths: [] };
    group.paths.push(path);
    groups.set(key, group);
  }
  return [...groups.values()];
}
