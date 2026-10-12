import type { PathGroup } from './pathFilters';

// The backend's topics are a closed list of ~25, too many to read as one column: the page gathers
// them under a few headings. The grouping is the page's, not the content's, so it lives here and a
// topic the backend adds before this table knows it is listed last, under "other", not lost.
const MACRO_TOPICS: readonly { code: string; topics: readonly string[] }[] = [
  { code: 'ANTICHITA', topics: ['MONDO_ANTICO', 'ROMA_REPUBBLICANA', 'ROMA_IMPERIALE'] },
  { code: 'MEDIOEVO_E_RINASCIMENTO', topics: ['MEDIOEVO', 'RINASCIMENTO'] },
  { code: 'ETA_MODERNA_E_OTTOCENTO', topics: ['ETA_MODERNA', 'OTTOCENTO'] },
  {
    code: 'NOVECENTO',
    topics: ['PRIMA_GUERRA_MONDIALE', 'TRA_LE_DUE_GUERRE', 'SECONDA_GUERRA_MONDIALE', 'GUERRA_FREDDA', 'OGGI'],
  },
  { code: 'ITALIA_E_MONDO', topics: ['ITALIA', 'ASIA', 'MONDO_ISLAMICO', 'AFRICA', 'AMERICHE'] },
  { code: 'SCIENZA_E_TECNICA', topics: ['SCIENZA', 'MEDICINA', 'ESPLORAZIONI_E_SPAZIO', 'TECNOLOGIA_ED_ECONOMIA'] },
  { code: 'IDEE_E_SOCIETA', topics: ['ARTE_E_CULTURA', 'RELIGIONI_E_IDEE', 'DIRITTI_E_SOCIETA', 'CITTA_E_LUOGHI'] },
];

export const OTHER_MACRO = 'ALTRO';

const MACRO_OF_TOPIC = new Map(MACRO_TOPICS.flatMap(({ code, topics }) => topics.map((topic) => [topic, code] as const)));
const MACRO_ORDER = [...MACRO_TOPICS.map(({ code }) => code), OTHER_MACRO];

export interface MacroGroup {
  // null: paths the backend sent without a topic (an older backend): one group, no heading.
  macro: string | null;
  // The topics in it, in the order the backend lists them.
  groups: PathGroup[];
}

// The topic groups gathered by heading, in the order of the table above. A topic keeps its place
// among its own heading's topics (the backend's order); a heading with no path left is not listed.
export function groupByMacro(groups: readonly PathGroup[]): MacroGroup[] {
  const byMacro = new Map<string | null, PathGroup[]>();
  for (const group of groups) {
    const macro = group.topic === null ? null : (MACRO_OF_TOPIC.get(group.topic) ?? OTHER_MACRO);
    byMacro.set(macro, [...(byMacro.get(macro) ?? []), group]);
  }
  const order = [null, ...MACRO_ORDER];
  return order.flatMap((macro) => {
    const found = byMacro.get(macro);
    return found ? [{ macro, groups: found }] : [];
  });
}
