import React, { useEffect } from 'react'
import { ScrollView, View, Text, TouchableOpacity, Share, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuditStore } from '../../src/store/auditStore'
import { useDataset } from '../../src/data'
import { selectActiveClauses } from '../../src/store/auditStore'
import { evalClause } from '../../src/core/scoring'
import KPIBar from '../../src/components/KPIBar'

const SEV_ORDER = ['Critical', 'Major', 'Minor', 'OFI']

const SEV_STYLE: Record<string, { borderColor: string; backgroundColor: string; textColor: string }> = {
  Critical: { borderColor: '#7f1d1d', backgroundColor: '#fef2f2', textColor: '#7f1d1d' },
  Major:    { borderColor: '#f87171', backgroundColor: '#fef2f2', textColor: '#b91c1c' },
  Minor:    { borderColor: '#fbbf24', backgroundColor: '#fffbeb', textColor: '#b45309' },
  OFI:      { borderColor: '#93c5fd', backgroundColor: '#eff6ff', textColor: '#1d4ed8' },
}

const GRADE_COLOR: Record<string, { bg: string; text: string }> = {
  AA:    { bg: '#16a34a', text: '#fff' },
  A:     { bg: '#16a34a', text: '#fff' },
  B:     { bg: '#d97706', text: '#fff' },
  C:     { bg: '#ea580c', text: '#fff' },
  D:     { bg: '#dc2626', text: '#fff' },
  F:     { bg: '#7f1d1d', text: '#fff' },
  'N/A': { bg: '#334155', text: '#fff' },
}

export default function ReportScreen() {
  const { clauses: allClauses } = useDataset()
  const activeClauses = useAuditStore(selectActiveClauses)
  const { meta, summary, recomputeSummary, resetAudit } = useAuditStore()

  useEffect(() => { recomputeSummary() }, [activeClauses])

  const findings = allClauses
    .map(c => ({ clause: c, ev: evalClause(c, activeClauses[c.clause]) }))
    .filter(({ ev }) => SEV_ORDER.includes(ev.severity as string))
    .sort(
      (a, b) =>
        SEV_ORDER.indexOf(a.ev.severity as string) -
        SEV_ORDER.indexOf(b.ev.severity as string),
    )

  const generateText = () => {
    const lines = [
      'BRCGS Food Safety Audit Report',
      '='.repeat(40),
      `Εγκατάσταση: ${meta.site || '—'}`,
      `Επωνυμία:    ${meta.company || '—'}`,
      `Ημερομηνία:  ${meta.auditDate || '—'}`,
      `Επιθεωρητής: ${meta.auditor || '—'}`,
      `Βαθμός:      ${summary?.grade ?? 'N/A'}`,
      `Πρόοδος:     ${summary?.done ?? 0}/${summary?.total ?? 0} ρήτρες`,
      '',
      `ΕΥΡΗΜΑΤΑ (${findings.length})`,
      '='.repeat(40),
      ...findings.map(({ clause, ev }) =>
        `\n[${ev.severity}] ${clause.clause} – ${clause.title}\n${ev.finding || '—'}`,
      ),
    ]
    return lines.join('\n')
  }

  const handleExportJSON = async () => {
    const payload = {
      meta,
      grade: summary?.grade ?? 'N/A',
      summary,
      findings: findings.map(({ clause, ev }) => ({
        clause: clause.clause,
        title: clause.title,
        severity: ev.severity,
        score: ev.score,
        finding: ev.finding,
      })),
      clauses: activeClauses,
    }
    try {
      await Share.share({ message: JSON.stringify(payload, null, 2) })
    } catch {
      Alert.alert('Σφάλμα', 'Η εξαγωγή απέτυχε.')
    }
  }

  const handlePrint = async () => {
    try {
      await Share.share({ message: generateText() })
    } catch {
      Alert.alert('Σφάλμα', 'Η εκτύπωση απέτυχε.')
    }
  }

  const handleReset = () => {
    Alert.alert(
      'Νέος Έλεγχος',
      'Θα διαγραφούν όλα τα δεδομένα του τρέχοντος ελέγχου. Συνέχεια;',
      [
        { text: 'Ακύρωση', style: 'cancel' },
        { text: 'Επαναφορά', style: 'destructive', onPress: resetAudit },
      ],
    )
  }

  const grade = summary?.grade ?? 'N/A'
  const gradeCfg = GRADE_COLOR[grade] ?? GRADE_COLOR['N/A']
  const done = summary?.done ?? 0
  const total = summary?.total ?? 0
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-teal-700 px-5 pt-4 pb-5">
        <Text className="text-teal-300 text-xs font-bold tracking-widest uppercase">ΕΚΘΕΣΗ</Text>
        <Text className="text-white text-2xl font-black mt-1">Σύνοψη επιθεώρησης</Text>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>

        {/* Grade card */}
        <View className="bg-white rounded-2xl p-5 mb-3 shadow-sm border border-slate-100 items-center">
          <View
            className="rounded-2xl w-20 h-20 items-center justify-center mb-3"
            style={{ backgroundColor: gradeCfg.bg }}
          >
            <Text className="text-4xl font-black" style={{ color: gradeCfg.text }}>
              {grade === 'N/A' ? '—' : grade}
            </Text>
          </View>
          <Text className="text-slate-700 font-bold text-sm">
            {meta.site || 'Χωρίς εγκατάσταση'}
          </Text>
          <Text className="text-slate-400 text-xs mt-0.5">{meta.auditDate || '—'}</Text>
          <View className="w-full mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <View
              className="h-full rounded-full bg-teal-500"
              style={{ width: `${pct}%` }}
            />
          </View>
          <Text className="text-slate-400 text-xs mt-1">{done}/{total} ρήτρες · {pct}% πρόοδος</Text>
        </View>

        {/* KPIs */}
        {summary && (
          <View className="mb-4">
            <KPIBar summary={summary} />
          </View>
        )}

        {/* Findings */}
        <Text className="text-slate-700 font-bold text-sm mb-2 uppercase tracking-wide">
          ΕΥΡΗΜΑΤΑ ({findings.length})
        </Text>

        {findings.length === 0 ? (
          <View className="bg-white border border-slate-100 rounded-2xl p-4 mb-4 items-center">
            <Text className="text-slate-400 text-sm">Δεν έχουν καταχωρηθεί ευρήματα ακόμα.</Text>
          </View>
        ) : (
          findings.map(({ clause, ev }) => {
            const style = SEV_STYLE[ev.severity as string] ?? { borderColor: '#e2e8f0', backgroundColor: '#ffffff', textColor: '#334155' }
            return (
              <View
                key={clause.clause}
                className="rounded-r-2xl p-4 mb-2"
                style={{ borderLeftWidth: 4, borderLeftColor: style.borderColor, backgroundColor: style.backgroundColor }}
              >
                <View className="flex-row items-center gap-2 mb-1">
                  <Text className="text-teal-700 font-black text-sm">{clause.clause}</Text>
                  <View className="px-2 py-0.5 rounded-full bg-white/60">
                    <Text className="text-xs font-bold" style={{ color: style.textColor }}>{ev.severity}</Text>
                  </View>
                </View>
                <Text className="text-slate-800 font-semibold text-sm mb-1">{clause.title}</Text>
                {ev.finding ? (
                  <Text className="text-slate-600 text-xs leading-relaxed">{ev.finding}</Text>
                ) : null}
              </View>
            )
          })
        )}

        {/* Action buttons */}
        <View className="gap-3 mt-4 mb-4">
          <TouchableOpacity
            onPress={handleExportJSON}
            className="bg-teal-700 rounded-2xl py-4 items-center"
            activeOpacity={0.85}
          >
            <Text className="text-white font-black text-base">Εξαγωγή JSON</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handlePrint}
            className="rounded-2xl py-4 items-center border-2 border-teal-700"
            activeOpacity={0.85}
          >
            <Text className="text-teal-700 font-black text-base">Εκτύπωση / PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleReset}
            className="rounded-2xl py-3.5 items-center"
            activeOpacity={0.85}
          >
            <Text className="text-slate-400 font-bold text-sm">Νέος Έλεγχος</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}
