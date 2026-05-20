export interface ScoredItem {
  id: string
  text: string
  weight: number
  weight_label: string
  default_partial: string
  default_nonconformity: string
  axes: string[]
  source: string
  non_assessable_header?: boolean
}

export interface SupportGuidance {
  text: string
  tags: string[]
}

export interface Clause {
  clause: string
  section: string
  main_section: string
  title: string
  requirement_checklist: string
  fundamental_context: boolean
  scored_checklist: ScoredItem[]
  support_guidance: SupportGuidance[]
  source: string
}

export interface DataMeta {
  version: string
  title: string
  principle: string
}

export type Severity = 'OK' | 'OFI' | 'Minor' | 'Major' | 'Critical'
export type OverrideMode = 'Auto' | Severity

export interface ClauseState {
  results: Record<string, string>
  supportChecked: Record<string, boolean>
  quick: string
  override: OverrideMode
  comments: string
}

export interface AuditMeta {
  site: string
  company: string
  auditDate: string
  auditor: string
  auditType: string
  auditProgram: string
}

export interface ClauseEval {
  severity: Severity | 'Εκκρεμεί' | 'Δεν αξιολογήθηκε'
  score: number
  finding: string
  done: boolean
}

export interface AuditSummary {
  ok: number
  ofi: number
  minor: number
  major: number
  critical: number
  total: number
  done: number
  avgScore: number
  grade: string
}
