import React, { useEffect } from 'react'
import { ScrollView, View, Text, TextInput, SafeAreaView } from 'react-native'
import { useAuditStore } from '../../src/store/auditStore'
import GradeBadge from '../../src/components/GradeBadge'
import KPIBar from '../../src/components/KPIBar'

function Field({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string
  value: string
  onChangeText: (v: string) => void
  placeholder?: string
}) {
  return (
    <View className="mb-3">
      <Text className="text-slate-500 text-xs font-bold mb-1 uppercase tracking-wide">
        {label}
      </Text>
      <TextInput
        className="border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 text-slate-900 text-sm"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? label}
        placeholderTextColor="#94a3b8"
      />
    </View>
  )
}

export default function DashboardScreen() {
  const { meta, setMeta, summary, recomputeSummary } = useAuditStore()

  useEffect(() => {
    recomputeSummary()
  }, [])

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="bg-teal-700 px-5 pt-5 pb-6">
        <Text className="text-white text-2xl font-black">BRCGS Audit</Text>
        <Text className="text-teal-200 text-sm mt-1">Food Safety Issue 9 — Greek Edition</Text>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        <View className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <Text className="text-teal-800 font-bold text-base mb-3">Στοιχεία Ελέγχου</Text>
          <Field
            label="Εγκατάσταση"
            value={meta.site}
            onChangeText={v => setMeta({ site: v })}
          />
          <Field
            label="Ημερομηνία"
            value={meta.auditDate}
            onChangeText={v => setMeta({ auditDate: v })}
            placeholder="ΕΕΕΕ-ΜΜ-ΗΗ"
          />
          <Field
            label="Επιθεωρητής"
            value={meta.auditor}
            onChangeText={v => setMeta({ auditor: v })}
          />
        </View>

        {summary && summary.total > 0 && (
          <>
            <View className="mb-4">
              <GradeBadge
                grade={summary.grade}
                done={summary.done}
                total={summary.total}
                avgScore={summary.avgScore}
              />
            </View>
            <KPIBar summary={summary} />
          </>
        )}

        {(!summary || summary.total === 0) && (
          <View className="bg-teal-50 border border-teal-200 rounded-2xl p-5 mt-2">
            <Text className="text-teal-800 font-bold text-base">Καλωσορίσατε</Text>
            <Text className="text-teal-600 text-sm mt-2 leading-relaxed">
              Συμπληρώστε τα στοιχεία του ελέγχου παραπάνω, στη συνέχεια πατήστε{' '}
              <Text className="font-bold">Έλεγχος</Text> για να ξεκινήσετε.
            </Text>
            <Text className="text-teal-500 text-xs mt-3">
              344 ρήτρες · 944 σημεία ελέγχου · BRCGS Issue 9
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
