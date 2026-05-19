import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import type { Clause, ClauseState } from '../core/types'
import { evalClause } from '../core/scoring'

const SEV_DOT: Record<string, string> = {
  OK:                   'bg-emerald-500',
  OFI:                  'bg-blue-500',
  Minor:                'bg-amber-400',
  Major:                'bg-red-500',
  Critical:             'bg-red-900',
  'Εκκρεμεί':          'bg-slate-300',
  'Δεν αξιολογήθηκε':  'bg-slate-200',
}

interface Props {
  clause: Clause
  state: ClauseState | undefined
}

export default function ClauseListItem({ clause, state }: Props) {
  const router = useRouter()
  const ev = evalClause(clause, state)
  const dotColor = SEV_DOT[ev.severity] ?? 'bg-slate-300'
  const items = (clause.scored_checklist ?? []).filter(i => !i.non_assessable_header)
  const doneCount = Object.values(state?.results ?? {}).filter(Boolean).length

  return (
    <TouchableOpacity
      onPress={() => router.push(`/clause/${encodeURIComponent(clause.clause)}` as any)}
      className="bg-white border border-slate-100 rounded-xl px-4 py-3 mb-2 flex-row items-center gap-3 shadow-sm"
      activeOpacity={0.7}
    >
      <View className={`w-3 h-3 rounded-full ${dotColor}`} />
      <View className="flex-1">
        <Text className="text-teal-700 font-bold text-sm">{clause.clause}</Text>
        <Text className="text-slate-800 text-sm font-medium" numberOfLines={1}>
          {clause.title}
        </Text>
        <Text className="text-slate-400 text-xs mt-0.5">
          {doneCount}/{items.length} σημεία
        </Text>
      </View>
      <Text className="text-slate-300 text-xl">›</Text>
    </TouchableOpacity>
  )
}
