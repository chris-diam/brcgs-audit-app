import { useAuditStore } from '../store/auditStore'
import { DATASETS } from './datasets'
import type { Clause, DataMeta } from '../core/types'

export { DATASETS } from './datasets'
export type { DatasetKey, Dataset } from './datasets'

export interface ActiveDataset {
  clauses: Clause[]
  mainSections: string[]
  meta: DataMeta
}

export function useDataset(): ActiveDataset {
  const activeDataset = useAuditStore(s => s.activeDataset)
  return DATASETS[activeDataset]
}

export function getClause(clauses: Clause[], id: string): Clause | undefined {
  return clauses.find(c => c.clause === id)
}

export function getClauseIndex(clauses: Clause[], id: string): number {
  return clauses.findIndex(c => c.clause === id)
}

export function getClausesBySection(clauses: Clause[], section: string): Clause[] {
  return clauses.filter(c => c.main_section === section)
}
