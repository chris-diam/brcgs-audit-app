import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAuditStore } from '../../src/store/auditStore'
import { getClause, allClauses } from '../../src/data'
import { evalClause } from '../../src/core/scoring'
import SeverityPicker from '../../src/components/SeverityPicker'

const SEV_BADGE: Record<string, string> = {
  OK:                   'bg-emerald-100 text-emerald-700',
  OFI:                  'bg-blue-100 text-blue-700',
  Minor:                'bg-amber-100 text-amber-700',
  Major:                'bg-red-100 text-red-600',
  Critical:             'bg-red-900 text-white',
  'Εκκρεμεί':          'bg-slate-100 text-slate-500',
  'Δεν αξιολογήθηκε':  'bg-slate-100 text-slate-400',
}

export default function ClauseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const clauseId = decodeURIComponent(id ?? '')
  const clause = getClause(clauseId)
  const { clauses, setItemResult, setOverride, setComments, recomputeSummary } = useAuditStore()
  const [showGuidance, setShowGuidance] = useState(false)

  if (!clause) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center px-6">
        <Text className="text-slate-500 text-center">Η ρήτρα δεν βρέθηκε: {clauseId}</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-teal-700 px-4 py-2 rounded-xl">
          <Text className="text-white font-bold">← Πίσω</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const st = clauses[clauseId]
  const ev = evalClause(clause, st)
  const badgeCls = SEV_BADGE[ev.severity] ?? 'bg-slate-100 text-slate-500'
  const items = (clause.scored_checklist ?? []).filter(i => !i.non_assessable_header)

  const idx = allClauses.findIndex(c => c.clause === clauseId)
  const prev = idx > 0 ? allClauses[idx - 1] : null
  const next = idx < allClauses.length - 1 ? allClauses[idx + 1] : null

  const handleResult = (itemId: string, result: string) => {
    setItemResult(clauseId, itemId, result)
    recomputeSummary()
  }

  const doneCount = Object.values(st?.results ?? {}).filter(Boolean).length

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-teal-700 px-4 pt-3 pb-4">
        <View className="flex-row items-center gap-2 mb-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-teal-600 rounded-xl px-3 py-1.5"
          >
            <Text className="text-white font-bold text-sm">← Πίσω</Text>
          </TouchableOpacity>
          <Text className="text-teal-200 font-black text-base flex-1">{clause.clause}</Text>
          <View className={`px-2.5 py-1 rounded-full ${badgeCls}`}>
            <Text className="text-xs font-bold">{ev.severity}</Text>
          </View>
        </View>
        <Text className="text-white font-bold text-sm leading-snug">{clause.title}</Text>
        <Text className="text-teal-300 text-xs mt-1" numberOfLines={1}>{clause.section}</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* Progress */}
        <View className="flex-row items-center gap-2 mb-4">
          <View className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <View
              className="h-full bg-teal-500 rounded-full"
              style={{ width: items.length > 0 ? `${Math.round((doneCount / items.length) * 100)}%` as any : '0%' }}
            />
          </View>
          <Text className="text-slate-400 text-xs">{doneCount}/{items.length}</Text>
        </View>

        {/* Requirement */}
        <View className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-4">
          <Text className="text-blue-700 font-bold text-xs mb-1.5 uppercase tracking-wide">
            Απαίτηση BRCGS
          </Text>
          <Text className="text-slate-700 text-sm leading-relaxed">
            {clause.requirement_checklist}
          </Text>
        </View>

        {/* Checklist items */}
        <Text className="text-teal-800 font-bold text-sm mb-2">
          Σημεία Ελέγχου ({items.length})
        </Text>
        {items.map(item => {
          const result = st?.results?.[item.id] ?? ''
          return (
            <View
              key={item.id}
              className="bg-white border border-slate-100 rounded-2xl p-4 mb-3 shadow-sm"
            >
              <View className="flex-row flex-wrap gap-1.5 mb-2">
                <View className="bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  <Text className="text-amber-700 text-xs font-bold">Βάρος {item.weight}</Text>
                </View>
                {item.axes?.map(ax => (
                  <View key={ax} className="bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
                    <Text className="text-sky-700 text-xs">{ax}</Text>
                  </View>
                ))}
              </View>
              <Text className="text-slate-800 text-sm leading-relaxed mb-3">{item.text}</Text>
              <SeverityPicker value={result} onChange={v => handleResult(item.id, v)} />
            </View>
          )
        })}

        {/* Comments */}
        <View className="bg-white border border-slate-100 rounded-2xl p-4 mb-4 shadow-sm">
          <Text className="text-teal-800 font-bold text-sm mb-2">Σχόλια Επιθεωρητή</Text>
          <TextInput
            className="border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 text-sm"
            style={{ minHeight: 80 }}
            multiline
            value={st?.comments ?? ''}
            onChangeText={v => setComments(clauseId, v)}
            placeholder="Προαιρετικά σχόλια..."
            placeholderTextColor="#94a3b8"
            textAlignVertical="top"
          />
        </View>

        {/* Auto finding */}
        {ev.finding ? (
          <View className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-4">
            <Text className="text-orange-700 font-bold text-xs mb-1.5 uppercase tracking-wide">
              Αυτόματη Εύρεση
            </Text>
            <Text className="text-orange-800 text-sm leading-relaxed">{ev.finding}</Text>
          </View>
        ) : null}

        {/* Support guidance */}
        {(clause.support_guidance?.length ?? 0) > 0 && (
          <TouchableOpacity
            onPress={() => setShowGuidance(v => !v)}
            className="bg-teal-50 border border-teal-200 rounded-2xl p-4 mb-4"
            activeOpacity={0.8}
          >
            <Text className="text-teal-700 font-bold text-sm">
              {showGuidance ? '▾' : '▸'} Οδηγίες Υποστήριξης ({clause.support_guidance.length})
            </Text>
            {showGuidance &&
              clause.support_guidance.map((g, i) => (
                <View key={i} className="mt-3 border-t border-teal-100 pt-3">
                  <Text className="text-slate-700 text-sm leading-relaxed">{g.text}</Text>
                  <View className="flex-row flex-wrap gap-1 mt-1.5">
                    {g.tags?.map(tag => (
                      <View key={tag} className="bg-teal-100 px-2 py-0.5 rounded-full">
                        <Text className="text-teal-700 text-xs">{tag}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
          </TouchableOpacity>
        )}

        {/* Score bar */}
        <View className="bg-white border border-slate-100 rounded-2xl p-4 mb-4 shadow-sm">
          <Text className="text-teal-800 font-bold text-sm mb-2">Βαθμολογία Ρήτρας</Text>
          <View className="h-3 bg-slate-100 rounded-full overflow-hidden mb-1">
            <View
              className="h-full bg-teal-500 rounded-full"
              style={{ width: `${ev.score}%` as any }}
            />
          </View>
          <Text className="text-slate-500 text-xs">{ev.score}% συμμόρφωση</Text>
        </View>

        {/* Navigation */}
        <View className="flex-row gap-3 mb-10">
          {prev ? (
            <TouchableOpacity
              onPress={() =>
                router.replace(`/clause/${encodeURIComponent(prev.clause)}` as any)
              }
              className="flex-1 bg-slate-200 rounded-xl py-3.5 items-center"
            >
              <Text className="text-slate-700 font-bold text-sm">← {prev.clause}</Text>
            </TouchableOpacity>
          ) : <View className="flex-1" />}
          {next && (
            <TouchableOpacity
              onPress={() =>
                router.replace(`/clause/${encodeURIComponent(next.clause)}` as any)
              }
              className="flex-1 bg-teal-700 rounded-xl py-3.5 items-center"
            >
              <Text className="text-white font-bold text-sm">{next.clause} →</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
