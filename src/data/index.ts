import type { Clause, DataMeta } from '../core/types'

import s1 from './sections/s1.json'
import s2 from './sections/s2.json'
import s3 from './sections/s3.json'
import s4 from './sections/s4.json'
import s5 from './sections/s5.json'
import s6 from './sections/s6.json'
import s7 from './sections/s7.json'
import s8 from './sections/s8.json'
import s9 from './sections/s9.json'
import metaRaw from './meta.json'

export const allClauses: Clause[] = [
  ...(s1 as unknown as Clause[]),
  ...(s2 as unknown as Clause[]),
  ...(s3 as unknown as Clause[]),
  ...(s4 as unknown as Clause[]),
  ...(s5 as unknown as Clause[]),
  ...(s6 as unknown as Clause[]),
  ...(s7 as unknown as Clause[]),
  ...(s8 as unknown as Clause[]),
  ...(s9 as unknown as Clause[]),
]

export const dataMeta: DataMeta = metaRaw as DataMeta

export const mainSections: string[] = [...new Set(allClauses.map(c => c.main_section))]

export function getClause(id: string): Clause | undefined {
  return allClauses.find(c => c.clause === id)
}

export function getClauseIndex(id: string): number {
  return allClauses.findIndex(c => c.clause === id)
}

export function getClausesBySection(section: string): Clause[] {
  return allClauses.filter(c => c.main_section === section)
}
