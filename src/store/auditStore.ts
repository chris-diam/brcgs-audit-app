import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Platform } from 'react-native'
import type { AuditMeta, ClauseState, OverrideMode, AuditSummary } from '../core/types'
import { aggregateResults } from '../core/scoring'
import { allClauses } from '../data'

const storage =
  Platform.OS === 'web'
    ? createJSONStorage(() => localStorage)
    : createJSONStorage(() => require('@react-native-async-storage/async-storage').default)

const defaultMeta: AuditMeta = {
  site: '',
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
  meta: AuditMeta
  clauses: Record<string, ClauseState>
  summary: AuditSummary | null
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
      meta: defaultMeta,
      clauses: {},
      summary: null,

      setMeta: (meta) => set(s => ({ meta: { ...s.meta, ...meta } })),

      setItemResult: (clauseId, itemId, result) =>
        set(s => {
          const cs = s.clauses[clauseId] ?? defaultClauseState()
          return {
            clauses: {
              ...s.clauses,
              [clauseId]: { ...cs, results: { ...cs.results, [itemId]: result } },
            },
          }
        }),

      setOverride: (clauseId, override) =>
        set(s => {
          const cs = s.clauses[clauseId] ?? defaultClauseState()
          return { clauses: { ...s.clauses, [clauseId]: { ...cs, override } } }
        }),

      setComments: (clauseId, comments) =>
        set(s => {
          const cs = s.clauses[clauseId] ?? defaultClauseState()
          return { clauses: { ...s.clauses, [clauseId]: { ...cs, comments } } }
        }),

      toggleSupportChecked: (clauseId, idx) =>
        set(s => {
          const cs = s.clauses[clauseId] ?? defaultClauseState()
          const sc = { ...cs.supportChecked, [idx]: !cs.supportChecked[idx] }
          return { clauses: { ...s.clauses, [clauseId]: { ...cs, supportChecked: sc } } }
        }),

      recomputeSummary: () => {
        const { clauses } = get()
        const summary = aggregateResults(allClauses, clauses)
        set({ summary })
      },

      resetAudit: () =>
        set({ clauses: {}, meta: { ...defaultMeta, auditDate: new Date().toISOString().split('T')[0] }, summary: null }),
    }),
    { name: 'brcgs-audit-v1', storage },
  ),
)
