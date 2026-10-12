import { describe, expect, it } from 'vitest';
import type { PathSummary } from '@/features/history';
import { groupByMacro, OTHER_MACRO } from './macroTopics';
import type { PathGroup } from './pathFilters';

function group(topic: string | null): PathGroup {
  const path: PathSummary = { slug: `${topic}-1`, title: 't', tagline: 't', readingMinutes: 1, stopCount: 6 };
  return { topic, label: topic, paths: [path] };
}

describe('groupByMacro', () => {
  it('gathers topics under their heading, headings in the table order, topics in the order they came', () => {
    const macros = groupByMacro([group('ROMA_REPUBBLICANA'), group('ROMA_IMPERIALE'), group('MEDIOEVO'), group('MONDO_ANTICO')]);

    expect(macros.map(({ macro }) => macro)).toEqual(['ANTICHITA', 'MEDIOEVO_E_RINASCIMENTO']);
    expect(macros[0].groups.map(({ topic }) => topic)).toEqual(['ROMA_REPUBBLICANA', 'ROMA_IMPERIALE', 'MONDO_ANTICO']);
  });

  it('lists a topic the table does not know last, under "other", instead of dropping it', () => {
    const macros = groupByMacro([group('TOPIC_DI_DOMANI'), group('SCIENZA')]);

    expect(macros.map(({ macro }) => macro)).toEqual(['SCIENZA_E_TECNICA', OTHER_MACRO]);
  });

  it('keeps paths with no topic (an older backend) in a group with no heading', () => {
    expect(groupByMacro([group(null)])).toEqual([{ macro: null, groups: [group(null)] }]);
  });

  it('has nothing to group when there is nothing', () => {
    expect(groupByMacro([])).toEqual([]);
  });
});
