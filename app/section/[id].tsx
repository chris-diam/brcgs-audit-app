import React from 'react'
import { View, Text, FlatList, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAuditStore } from '../../src/store/auditStore'
import { allClauses, mainSections } from '../../src/data'
import { evalClause } from '../../src/core/scoring'

const SEV_COLOR: Record<string, string> = {
  OK:                  '#16a34a',
  OFI:                 '#0284c7',
  Minor:               '#d97706',
  Major:               '#dc2626',
  Critical:            '#7f1d1d',
  'Εκκρεμεί':         '#cbd5e1',
  'Δεν αξιολογήθηκε': '#e2e8f0',
}

export default function SectionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { clauses } = useAuditStore()

  const sectionIdx = parseInt(id ?? '0', 10)
  const section = mainSections[sectionIdx] ?? ''
  const sectionNum = section.split(' ')[0]
  const sectionName = section.replace(/^\d+\s*/, '')

  const sectionClauses = allClauses.filter(c => c.main_section === section)
  const scorable = sectionClauses.filter(
    c => (c.scored_checklist ?? []).filter(i => !i.non_assessable_header).length > 0
  )
  const done = scorable.filter(c => evalClause(c, clauses[c.clause]).done).length

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-teal-700 px-5 pt-4 pb-5">
        <TouchableOpacity onPress={() => router.back()} className="mb-2">
          <Text className="text-teal-300 text-sm font-bold">← Ενότητες</Text>
        </TouchableOpacity>
        <View className="flex-row items-center gap-2">
          <Text className="text-teal-300 font-black text-xl">{sectionNum}</Text>
          <Text className="text-white font-black text-lg flex-1 leading-snug">{sectionName}</Text>
        </View>
        <Text className="text-teal-200 text-sm mt-1">
          {done} / {scorable.length} ρήτρες ολοκληρωμένες
        </Text>
      </View>

      <FlatList
        data={sectionClauses}
        keyExtractor={item => item.clause}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const items = (item.scored_checklist ?? []).filter(i => !i.non_assessable_header)
          const ev = evalClause(item, clauses[item.clause])
          const dotColor = SEV_COLOR[ev.severity] ?? '#cbd5e1'
          const doneCount = Object.values(clauses[item.clause]?.results ?? {}).filter(Boolean).length

          return (
            <TouchableOpacity
              onPress={() => router.push(`/clause/${encodeURIComponent(item.clause)}` as any)}
              activeOpacity={0.7}
              className="bg-white rounded-2xl px-4 py-3 mb-2 shadow-sm border border-slate-100"
            >
              <View className="flex-row items-center gap-3">
                <View
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: dotColor }}
                />
                <View className="flex-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-teal-700 font-black text-sm">{item.clause}</Text>
                    {item.fundamental_context && (
                      <View className="bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                        <Text className="text-amber-700 text-xs font-bold">F</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-slate-800 text-sm font-medium leading-snug mt-0.5" numberOfLines={2}>
                    {item.title}
                  </Text>
                  {items.length > 0 && (
                    <Text className="text-slate-400 text-xs mt-1">
                      {doneCount}/{items.length} σημεία
                    </Text>
                  )}
                </View>
                <Text className="text-slate-300 text-xl">›</Text>
              </View>
            </TouchableOpacity>
          )
        }}
        ListFooterComponent={<View className="h-4" />}
      />
    </SafeAreaView>
  )
}
