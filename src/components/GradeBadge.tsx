import React from 'react'
import { View, Text } from 'react-native'

const GRADE_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  AA:    { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Άριστα' },
  A:     { bg: 'bg-green-100',   text: 'text-green-800',   label: 'Πολύ Καλά' },
  B:     { bg: 'bg-yellow-100',  text: 'text-yellow-800',  label: 'Καλά' },
  C:     { bg: 'bg-orange-100',  text: 'text-orange-800',  label: 'Αποδεκτά' },
  D:     { bg: 'bg-red-100',     text: 'text-red-700',     label: 'Μη Αποδεκτά' },
  F:     { bg: 'bg-red-900',     text: 'text-white',       label: 'Αποτυχία' },
  'N/A': { bg: 'bg-slate-100',   text: 'text-slate-500',   label: 'Δεν αξιολογήθηκε' },
}

interface Props {
  grade: string
  done: number
  total: number
  avgScore: number
}

export default function GradeBadge({ grade, done, total, avgScore }: Props) {
  const cfg = GRADE_CONFIG[grade] ?? GRADE_CONFIG['N/A']
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm">
      <View className="flex-row items-center gap-4">
        <View className={`${cfg.bg} rounded-2xl w-20 h-20 items-center justify-center`}>
          <Text className={`${cfg.text} text-4xl font-black`}>{grade}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-slate-900 text-lg font-bold">{cfg.label}</Text>
          <Text className="text-slate-500 text-sm mt-1">
            {done}/{total} ρήτρες • Μέσος {avgScore}%
          </Text>
          <View className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
            <View
              className="h-full bg-teal-500 rounded-full"
              style={{ width: `${pct}%` as any }}
            />
          </View>
          <Text className="text-slate-400 text-xs mt-1">{pct}% ολοκληρωμένο</Text>
        </View>
      </View>
    </View>
  )
}
