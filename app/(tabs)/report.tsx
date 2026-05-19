import React, { useEffect } from 'react'
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Share,
  Alert,
} from 'react-native'
import { useAuditStore } from '../../src/store/auditStore'
import { allClauses } from '../../src/data'
import { evalClause } from '../../src/core/scoring'
import GradeBadge from '../../src/components/GradeBadge'
import KPIBar from '../../src/components/KPIBar'

const SEV_ORDER = ['Critical', 'Major', 'Minor', 'OFI']

const SEV_STYLE: Record<string, { bar: string; bg: string; text: string }> = {
  Critical: { bar: 'border-red-900',  bg: 'bg-red-50',    text: 'text-red-900' },
  Major:    { bar: 'border-red-400',  bg: 'bg-red-50',    text: 'text-red-700' },
  Minor:    { bar: 'border-amber-400',bg: 'bg-amber-50',  text: 'text-amber-700' },
  OFI:      { bar: 'border-blue-300', bg: 'bg-blue-50',   text: 'text-blue-700' },
}

export default function ReportScreen() {
  const { meta, clauses, summary, recomputeSummary, resetAudit } = useAuditStore()

  useEffect(() => {
    recomputeSummary()
  }, [clauses])

  const findings = allClauses
    .map(c => ({ clause: c, ev: evalClause(c, clauses[c.clause]) }))
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

  const handleShare = async () => {
    try {
      await Share.share({ message: generateText() })
    } catch {
      Alert.alert('Σφάλμα', 'Η κοινοποίηση απέτυχε.')
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

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="bg-teal-700 px-4 pt-5 pb-4">
        <Text className="text-white text-xl font-black">Έκθεση Ελέγχου</Text>
        <Text className="text-teal-200 text-sm mt-1">
          {meta.site || 'Εγκατάσταση'} · {meta.auditDate || '—'}
        </Text>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {summary && (
          <>
            <View className="mb-4">
              <GradeBadge
                grade={summary.grade}
                done={summary.done}
                total={summary.total}
                avgScore={summary.avgScore}
              />
            </View>
            <View className="mb-6">
              <KPIBar summary={summary} />
            </View>
          </>
        )}

        <Text className="text-teal-800 font-bold text-base mb-3">
          Ευρήματα ({findings.length})
        </Text>

        {findings.length === 0 && (
          <View className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4">
            <Text className="text-emerald-700 font-bold">✓ Δεν βρέθηκαν αποκλίσεις</Text>
            <Text className="text-emerald-600 text-sm mt-1">
              Ολοκληρώστε τον έλεγχο για να εμφανιστούν τα ευρήματα.
            </Text>
          </View>
        )}

        {findings.map(({ clause, ev }) => {
          const style = SEV_STYLE[ev.severity as string] ?? { bar: 'border-slate-200', bg: 'bg-white', text: 'text-slate-700' }
          return (
            <View
              key={clause.clause}
              className={`border-l-4 ${style.bar} ${style.bg} rounded-r-2xl p-4 mb-3`}
            >
              <View className="flex-row items-center gap-2 mb-1">
                <Text className="text-teal-700 font-black text-sm">{clause.clause}</Text>
                <View className="bg-white/60 px-2 py-0.5 rounded-full">
                  <Text className={`${style.text} text-xs font-bold`}>{ev.severity}</Text>
                </View>
              </View>
              <Text className="text-slate-800 font-semibold text-sm mb-1.5">{clause.title}</Text>
              {ev.finding ? (
                <Text className="text-slate-600 text-xs leading-relaxed">{ev.finding}</Text>
              ) : null}
            </View>
          )
        })}

        <View className="gap-3 mt-4 mb-10">
          <TouchableOpacity
            onPress={handleShare}
            className="bg-teal-700 rounded-2xl py-4 items-center shadow-sm"
          >
            <Text className="text-white font-bold text-base">Κοινοποίηση Έκθεσης</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleReset}
            className="bg-slate-200 rounded-2xl py-4 items-center"
          >
            <Text className="text-slate-600 font-bold">Νέος Έλεγχος</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
