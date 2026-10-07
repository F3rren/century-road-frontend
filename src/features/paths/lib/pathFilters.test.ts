import { describe, expect, it } from 'vitest';
import type { PathSummary } from '@/features/history';
import {
  filterPaths,
  groupByTopic,
  hasFilters,
  matchesPath,
  NO_FILTERS,
  normalizeText,
  parsePathFilters,
  toPathSearchParams,
  topicOptions,
} from './pathFilters';

const path = (slug: string, title: string, topic?: string, topicLabel?: string, tagline = 'Una frase.'): PathSummary => ({
  slug,
  title,
  tagline,
  topic,
  topicLabel,
  readingMinutes: 5,
  stopCount: 8,
});

const rome = path('augusto', "Augusto e il principato", 'ROMA_IMPERIALE', 'Roma imperiale');
const caesar = path('cesare', 'Giulio Cesare', 'ROMA_REPUBBLICANA', 'Roma repubblicana');
const gracchi = path('gracchi', 'I Gracchi e la crisi', 'ROMA_REPUBBLICANA', 'Roma repubblicana', 'Una riforma agraria che divide.');
const medicine = path('medicina', 'Le scoperte che hanno cambiato la medicina', 'MEDICINA', 'Medicina ed epidemie');
const all = [caesar, gracchi, rome, medicine];

describe('parsePathFilters / toPathSearchParams', () => {
  it('reads the query and the topic, and writes only what is not the default', () => {
    const filters = parsePathFilters(new URLSearchParams('topic=ROMA_IMPERIALE&q=augusto'));
    expect(filters).toEqual({ query: 'augusto', topic: 'ROMA_IMPERIALE' });
    expect(toPathSearchParams(filters).toString()).toBe('topic=ROMA_IMPERIALE&q=augusto');
    expect(toPathSearchParams(NO_FILTERS).toString()).toBe('');
  });

  it('falls back to no filter for a topic that cannot be a code', () => {
    expect(parsePathFilters(new URLSearchParams('topic=roma')).topic).toBeNull();
    expect(parsePathFilters(new URLSearchParams('topic=%3Cscript%3E')).topic).toBeNull();
    expect(parsePathFilters(new URLSearchParams('topic=')).topic).toBeNull();
    expect(parsePathFilters(new URLSearchParams('')).query).toBe('');
  });

  it('keeps a code the frontend has never heard of: the backend may know topics it does not', () => {
    expect(parsePathFilters(new URLSearchParams('topic=NUOVO_ARGOMENTO')).topic).toBe('NUOVO_ARGOMENTO');
  });

  it('says whether anything is filtering the list', () => {
    expect(hasFilters(NO_FILTERS)).toBe(false);
    expect(hasFilters({ query: '  ', topic: null })).toBe(false);
    expect(hasFilters({ query: 'a', topic: null })).toBe(true);
    expect(hasFilters({ query: '', topic: 'MEDICINA' })).toBe(true);
  });
});

describe('matchesPath', () => {
  it('finds a word without its accent or its capital', () => {
    expect(normalizeText('Perché')).toBe('perche');
    expect(matchesPath(medicine, 'MEDICINA')).toBe(true);
    expect(matchesPath(path('x', 'Perché conta'), 'perche')).toBe(true);
  });

  it('wants every word, in any order, in the title, the tagline or the topic', () => {
    expect(matchesPath(caesar, 'cesare giulio')).toBe(true);
    expect(matchesPath(gracchi, 'riforma agraria')).toBe(true);
    expect(matchesPath(caesar, 'repubblicana cesare')).toBe(true);
    expect(matchesPath(caesar, 'cesare augusto')).toBe(false);
  });

  it('matches everything for an empty or blank query', () => {
    expect(matchesPath(caesar, '')).toBe(true);
    expect(matchesPath(caesar, '   ')).toBe(true);
  });
});

describe('filterPaths', () => {
  it('narrows by topic and by query together', () => {
    expect(filterPaths(all, { query: '', topic: 'ROMA_REPUBBLICANA' }).map((p) => p.slug)).toEqual(['cesare', 'gracchi']);
    expect(filterPaths(all, { query: 'gracchi', topic: 'ROMA_REPUBBLICANA' }).map((p) => p.slug)).toEqual(['gracchi']);
    expect(filterPaths(all, { query: 'gracchi', topic: 'MEDICINA' })).toEqual([]);
    expect(filterPaths(all, NO_FILTERS)).toHaveLength(4);
  });
});

describe('topicOptions', () => {
  it('lists the topics in the order they come, each counting the paths that match the search', () => {
    expect(topicOptions(all, '', null)).toEqual([
      { code: 'ROMA_REPUBBLICANA', label: 'Roma repubblicana', count: 2 },
      { code: 'ROMA_IMPERIALE', label: 'Roma imperiale', count: 1 },
      { code: 'MEDICINA', label: 'Medicina ed epidemie', count: 1 },
    ]);
    expect(topicOptions(all, 'roma', null).map((o) => o.count)).toEqual([2, 1, 0]);
  });

  it('keeps a chosen topic in the list even when no path of it exists or matches', () => {
    expect(topicOptions(all, 'zzz', 'MEDICINA').find((o) => o.code === 'MEDICINA')?.count).toBe(0);
    const withUnknown = topicOptions(all, '', 'SCONOSCIUTO');
    expect(withUnknown[withUnknown.length - 1]).toEqual({ code: 'SCONOSCIUTO', label: 'SCONOSCIUTO', count: 0 });
  });

  it('has no options when the backend sends no topics', () => {
    expect(topicOptions([path('a', 'A'), path('b', 'B')], '', null)).toEqual([]);
  });
});

describe('groupByTopic', () => {
  it('makes a group per topic in the order of first appearance, keeping the order inside', () => {
    const groups = groupByTopic(all);
    expect(groups.map((g) => g.topic)).toEqual(['ROMA_REPUBBLICANA', 'ROMA_IMPERIALE', 'MEDICINA']);
    expect(groups[0].label).toBe('Roma repubblicana');
    expect(groups[0].paths.map((p) => p.slug)).toEqual(['cesare', 'gracchi']);
  });

  it('is a single group with no label when no path has a topic (an older backend)', () => {
    const groups = groupByTopic([path('a', 'A'), path('b', 'B')]);
    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({ topic: null, label: null });
    expect(groups[0].paths).toHaveLength(2);
  });
});
