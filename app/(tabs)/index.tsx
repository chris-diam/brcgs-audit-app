import React, { useEffect } from 'react'
import { ScrollView, View, Text, TextInput, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useAuditStore } from '../../src/store/auditStore'
import KPIBar from '../../src/components/KPIBar'

const GRADE_COLOR: Record<string, string> = {
  AA: '#16a34a', A: '#16a34a', B: '#d97706',
  C: '#ea580c', D: '#dc2626', F: '#7f1d1d', 'N/A': '#334155',
}

function Field({
  label, value, onChangeText, placeholder, flex,
}: {
  label: string; value: string; onChangeText: (v: string) => void
  placeholder?: string; flex?: boolean
}) {
  return (
    <View style={flex ? { flex: 1 } : undefined} className="mb-3">
      <Text className="text-slate-500 text-xs font-bold mb-1 uppercase tracking-wide">{label}</Text>
      <TextInput
        className="border border-slate-200 rounded-xl px-3 py-2.5 bg-white text-slate-900 text-sm"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? label}
        placeholderTextColor="#94a3b8"
      />
    </View>
  )
}

export default function DashboardScreen() {
  const router = useRouter()
  const { meta, setMeta, summary, recomputeSummary } = useAuditStore()

  useEffect(() => { recomputeSummary() }, [])

  const done = summary?.done ?? 0
  const total = summary?.total ?? 344
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const grade = summary?.grade ?? 'N/A'
  const gradeColor = GRADE_COLOR[grade] ?? '#334155'

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-teal-700 px-5 pt-4 pb-5">
        <Text className="text-teal-300 text-xs font-bold tracking-widest uppercase">
          BRCGS FOOD SAFETY · ISSUE 9
        </Text>
        <Text className="text-white text-2xl font-black mt-1">Πίνακας ελέγχου</Text>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>

        {/* Grade card */}
        <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-slate-100">
          <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">ΒΑΘΜΟΣ</Text>
          <View className="flex-row items-center gap-4">
            <View
              className="rounded-2xl w-16 h-16 items-center justify-center"
              style={{ backgroundColor: grade === 'N/A' ? '#334155' : gradeColor }}
            >
              <Text className="text-white text-3xl font-black">
                {grade === 'N/A' ? '—' : grade}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-slate-800 font-bold text-sm">
                {done} / {total} ρήτρες ολοκληρωμένες
              </Text>
              <View className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                <View
                  className="h-full bg-teal-500 rounded-full"
                  style={{ width: `${pct}%` }}
                />
              </View>
              <Text className="text-slate-400 text-xs mt-1">{pct}% πρόοδος</Text>
            </View>
          </View>
        </View>

        {/* KPI grid */}
        {summary && (
          <View className="mb-3">
            <KPIBar summary={summary} />
          </View>
        )}

        {/* Metadata form */}
        <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-slate-100">
          <Text className="text-slate-700 font-bold text-sm mb-3">Στοιχεία επιθεώρησης</Text>
          <Field
            label="Εγκατάσταση"
            value={meta.site}
            onChangeText={v => setMeta({ site: v })}
          />
          <Field
            label="Επωνυμία"
            value={meta.company}
            onChangeText={v => setMeta({ company: v })}
          />
          <View className="flex-row gap-3">
            <Field
              label="Ημερομηνία"
              value={meta.auditDate}
              onChangeText={v => setMeta({ auditDate: v })}
              placeholder="ΕΕΕΕ-ΜΜ-ΗΗ"
              flex
            />
            <Field
              label="Επιθεωρητής"
              value={meta.auditor}
              onChangeText={v => setMeta({ auditor: v })}
              flex
            />
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity
          onPress={() => router.navigate('/(tabs)/audit')}
          className="bg-teal-700 rounded-2xl py-4 items-center mb-3"
          activeOpacity={0.85}
        >
          <Text className="text-white font-black text-base">Έναρξη ελέγχου ›</Text>
        </TouchableOpacity>

        <Text className="text-slate-400 text-xs text-center mb-6">
          9 ενότητες · 344 ρήτρες · τοπική αποθήκευση
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}
