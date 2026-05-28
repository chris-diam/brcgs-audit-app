import React from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useAuditStore, selectActiveClauses } from '../../src/store/auditStore'
import { useDataset } from '../../src/data'
import { evalClause } from '../../src/core/scoring'

const SEV_RANK: Record<string, number> = {
  Critical: 5, Major: 4, Minor: 3, OFI: 2, OK: 1,
}

function worstSeverityColor(worst: string): string {
  if (worst === 'Critical') return '#7f1d1d'
  if (worst === 'Major')    return '#dc2626'
  if (worst === 'Minor')    return '#d97706'
  if (worst === 'OFI')      return '#0284c7'
  if (worst === 'OK')       return '#16a34a'
  return '#cbd5e1'
}

export default function AuditScreen() {
  const router = useRouter()
  const { clauses: allClauses, mainSections } = useDataset()
  const clauses = useAuditStore(selectActiveClauses)

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-teal-700 px-5 pt-4 pb-5">
        <Text className="text-teal-300 text-xs font-bold tracking-widest uppercase">ΕΛΕΓΧΟΣ</Text>
        <Text className="text-white text-2xl font-black mt-1">Ενότητες</Text>
        <Text className="text-teal-200 text-sm mt-1">
          9 ενότητες · επιλέξτε για να ξεκινήσετε
        </Text>
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        {mainSections.map((section, idx) => {
          const sectionClauses = allClauses.filter(
            c => c.main_section === section &&
              (c.scored_checklist ?? []).filter(i => !i.non_assessable_header).length > 0
          )
          const total = sectionClauses.length
          let done = 0
          let worst = ''

          for (const c of sectionClauses) {
            const ev = evalClause(c, clauses[c.clause])
            if (ev.done) {
              done++
              if ((SEV_RANK[ev.severity as string] ?? 0) > (SEV_RANK[worst] ?? 0)) {
                worst = ev.severity as string
              }
            }
          }

          const pct = total > 0 ? Math.round((done / total) * 100) : 0
          const dotColor = worstSeverityColor(worst)
          const sectionNum = section.split(' ')[0]

          return (
            <TouchableOpacity
              key={section}
              onPress={() => router.push(`/section/${idx}` as any)}
              activeOpacity={0.7}
              className="bg-white rounded-2xl px-4 py-4 mb-3 shadow-sm border border-slate-100"
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-row items-start flex-1 gap-3">
                  <Text className="text-teal-700 font-black text-lg w-6">{sectionNum}</Text>
                  <View className="flex-1">
                    <Text className="text-slate-800 font-bold text-sm leading-snug">
                      {section.replace(/^\d+\s*/, '')}
                    </Text>
                    <Text className="text-slate-400 text-xs mt-1">
                      {done} / {total} ρήτρες
                    </Text>
                  </View>
                </View>
                <View
                  className="w-3 h-3 rounded-full mt-1 ml-2"
                  style={{ backgroundColor: dotColor }}
                />
              </View>

              {/* Progress bar */}
              <View className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#16a34a' : '#0f766e' }}
                />
              </View>
            </TouchableOpacity>
          )
        })}

        <View className="h-4" />
      </ScrollView>
    </SafeAreaView>
  )
}
