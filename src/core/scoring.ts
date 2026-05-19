import type { Clause, ClauseState, Severity, ClauseEval, AuditSummary } from './types'

const SEV_RANK: Record<string, number> = {
  OK: 0, OFI: 1, Minor: 2, Major: 3, Critical: 4,
}

export function normResult(res: string): string {
  if (!res) return ''
  if (res === 'OK' || res === 'Καλύπτεται' || res === 'Τεκμηριωμένο') return 'OK'
  if (
    res === 'Μερικό' ||
    res === 'Ανεπαρκής τεκμηρίωση / απόδειξη' ||
    res === 'Ανεπαρκώς τεκμηριωμένο'
  ) return 'Μερικό'
  if (
    res === 'Μη συμμόρφωση' ||
    res === 'Αστοχία / μη συμμόρφωση' ||
    res === 'Αστοχία'
  ) return 'Μη συμμόρφωση'
  if (res === 'N/A') return 'N/A'
  return res
}

function maxSev(a: string, b: string): string {
  return (SEV_RANK[b] ?? -1) > (SEV_RANK[a] ?? -1) ? b : a
}

function sevFromResult(
  item: { weight?: number; default_partial?: string; default_nonconformity?: string },
  res: string,
  fundamental: boolean,
): string {
  const r = normResult(res)
  if (r === 'OK' || r === 'N/A' || !r) return 'OK'
  if (r === 'Μερικό') {
    return item.default_partial || ((item.weight ?? 1) >= 3 ? 'Minor' : 'OFI')
  }
  if (r === 'Μη συμμόρφωση') {
    let s = item.default_nonconformity || ((item.weight ?? 1) >= 3 ? 'Major' : 'Minor')
    if (fundamental && (item.weight ?? 1) >= 3 && s === 'Minor') s = 'Major'
    return s
  }
  return 'OK'
}

function pctVal(res: string): number | null {
  const r = normResult(res)
  if (r === 'OK') return 100
  if (r === 'Μερικό') return 50
  if (r === 'Μη συμμόρφωση') return 0
  return null
}

export function evalClause(clause: Clause, st: ClauseState | undefined): ClauseEval {
  const items = (clause.scored_checklist ?? []).filter(i => !i.non_assessable_header)
  if (items.length === 0) {
    return { severity: 'Δεν αξιολογήθηκε', score: 100, finding: '', done: true }
  }

  const results = st?.results ?? {}
  let worstSev = 'OK'
  let totalWeight = 0
  let weightedScore = 0
  let anyDone = false
  const findingParts: string[] = []

  for (const item of items) {
    const res = results[item.id] ?? ''
    const r = normResult(res)
    if (!r) continue
    anyDone = true
    const sev = sevFromResult(item, res, clause.fundamental_context)
    worstSev = maxSev(worstSev, sev)
    const pct = pctVal(res)
    const w = item.weight ?? 1
    totalWeight += w
    if (pct !== null) weightedScore += pct * w
    if (sev !== 'OK' && item.text) {
      findingParts.push(`[${sev}] ${item.text}`)
    }
  }

  if (!anyDone) return { severity: 'Εκκρεμεί', score: 0, finding: '', done: false }

  const score = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 100
  const finding = [
    findingParts.join('\n'),
    st?.comments ? `Σχόλια: ${st.comments}` : '',
  ].filter(Boolean).join('\n\n')

  const override = st?.override
  if (override && override !== 'Auto') {
    return { severity: override as Severity, score, finding, done: true }
  }

  return { severity: worstSev as Severity, score, finding, done: true }
}

export function computeGrade(counts: {
  major: number; minor: number; critical: number; total: number
}): string {
  const { major, minor, critical, total } = counts
  if (total === 0) return 'N/A'
  if (critical > 0) return 'F'
  if (major > 2) return 'D'
  if (major === 2) return 'C'
  if (major === 1) return 'B'
  if (minor > Math.floor(total * 0.075)) return 'A'
  return 'AA'
}

export function aggregateResults(
  clauses: Clause[],
  clauseStates: Record<string, ClauseState | undefined>,
): AuditSummary {
  let ok = 0, ofi = 0, minor = 0, major = 0, critical = 0
  let total = 0, done = 0, scoreSum = 0

  for (const clause of clauses) {
    const items = (clause.scored_checklist ?? []).filter(i => !i.non_assessable_header)
    if (items.length === 0) continue
    total++
    const ev = evalClause(clause, clauseStates[clause.clause])
    if (ev.done) {
      done++
      scoreSum += ev.score
      const s = ev.severity
      if (s === 'OK') ok++
      else if (s === 'OFI') ofi++
      else if (s === 'Minor') minor++
      else if (s === 'Major') major++
      else if (s === 'Critical') critical++
    }
  }

  const avgScore = done > 0 ? Math.round(scoreSum / done) : 0
  const grade = computeGrade({ major, minor, critical, total: done })
  return { ok, ofi, minor, major, critical, total, done, avgScore, grade }
}
