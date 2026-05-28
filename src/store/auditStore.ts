import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Platform } from 'react-native'
import type { AuditMeta, ClauseState, OverrideMode, AuditSummary } from '../core/types'
import { aggregateResults } from '../core/scoring'
import { DATASETS } from '../data/datasets'
import type { DatasetKey } from '../data/datasets'

const storage =
  Platform.OS === 'web'
    ? createJSONStorage(() => localStorage)
    : createJSONStorage(() => require('@react-native-async-storage/async-storage').default)

const defaultMeta: AuditMeta = {
  site: '',
  company: '',
  auditDate: new Date().toISOString().split('T')[0],
  auditor: '',
  auditType: 'Ανακοινωμένος',
  auditProgram: 'BRCGS Food Safety Issue 9',
}

const defaultClauseState = (): ClauseState => ({
  results: {},
  supportChecked: {},
  quick: '',
  override: 'Auto',
  comments: '',
})

interface AuditStore {
  activeDataset: DatasetKey
  meta: AuditMeta
  // Clause states keyed by dataset, then by clauseId
  clausesByDataset: Record<string, Record<string, ClauseState>>
  summary: AuditSummary | null
  setActiveDataset: (key: DatasetKey) => void
  setMeta: (meta: Partial<AuditMeta>) => void
  setItemResult: (clauseId: string, itemId: string, result: string) => void
  setOverride: (clauseId: string, override: OverrideMode) => void
  setComments: (clauseId: string, comments: string) => void
  toggleSupportChecked: (clauseId: string, idx: string) => void
  recomputeSummary: () => void
  resetAudit: () => void
}

export const useAuditStore = create<AuditStore>()(
  persist(
    (set, get) => ({
      activeDataset: 'brcgs_el',
      meta: defaultMeta,
      clausesByDataset: {},
      summary: null,

      setActiveDataset: (key) => {
        set({ activeDataset: key })
        // Recompute summary for the new dataset immediately
        const { clausesByDataset } = get()
        const clauses = clausesByDataset[key] ?? {}
        const summary = aggregateResults(DATASETS[key].clauses, clauses)
        set({ summary })
      },

      setMeta: (meta) => set(s => ({ meta: { ...s.meta, ...meta } })),

      setItemResult: (clauseId, itemId, result) =>
        set(s => {
          const { activeDataset, clausesByDataset } = s
          const datasetClauses = clausesByDataset[activeDataset] ?? {}
          const cs = datasetClauses[clauseId] ?? defaultClauseState()
          return {
            clausesByDataset: {
              ...clausesByDataset,
              [activeDataset]: {
                ...datasetClauses,
                [clauseId]: { ...cs, results: { ...cs.results, [itemId]: result } },
              },
            },
          }
        }),

      setOverride: (clauseId, override) =>
        set(s => {
          const { activeDataset, clausesByDataset } = s
          const datasetClauses = clausesByDataset[activeDataset] ?? {}
          const cs = datasetClauses[clauseId] ?? defaultClauseState()
          return {
            clausesByDataset: {
              ...clausesByDataset,
              [activeDataset]: { ...datasetClauses, [clauseId]: { ...cs, override } },
            },
          }
        }),

      setComments: (clauseId, comments) =>
        set(s => {
          const { activeDataset, clausesByDataset } = s
          const datasetClauses = clausesByDataset[activeDataset] ?? {}
          const cs = datasetClauses[clauseId] ?? defaultClauseState()
          return {
            clausesByDataset: {
              ...clausesByDataset,
              [activeDataset]: { ...datasetClauses, [clauseId]: { ...cs, comments } },
            },
          }
        }),

      toggleSupportChecked: (clauseId, idx) =>
        set(s => {
          const { activeDataset, clausesByDataset } = s
          const datasetClauses = clausesByDataset[activeDataset] ?? {}
          const cs = datasetClauses[clauseId] ?? defaultClauseState()
          const sc = { ...cs.supportChecked, [idx]: !cs.supportChecked[idx] }
          return {
            clausesByDataset: {
              ...clausesByDataset,
              [activeDataset]: { ...datasetClauses, [clauseId]: { ...cs, supportChecked: sc } },
            },
          }
        }),

      recomputeSummary: () => {
        const { activeDataset, clausesByDataset } = get()
        const clauses = clausesByDataset[activeDataset] ?? {}
        const summary = aggregateResults(DATASETS[activeDataset].clauses, clauses)
        set({ summary })
      },

      resetAudit: () => {
        const { activeDataset, clausesByDataset } = get()
        set({
          clausesByDataset: { ...clausesByDataset, [activeDataset]: {} },
          meta: { ...defaultMeta, auditDate: new Date().toISOString().split('T')[0] },
          summary: null,
        })
      },
    }),
    { name: 'brcgs-audit-v2', storage },
  ),
)

// Selector helpers
export const selectActiveClauses = (s: AuditStore) =>
  s.clausesByDataset[s.activeDataset] ?? {}
