import React from 'react'
import { View, Text } from 'react-native'

const GRADE_CONFIG: Record<string, { bgColor: string; textColor: string; label: string }> = {
  AA:    { bgColor: '#d1fae5', textColor: '#065f46', label: 'Άριστα' },
  A:     { bgColor: '#dcfce7', textColor: '#166534', label: 'Πολύ Καλά' },
  B:     { bgColor: '#fef9c3', textColor: '#854d0e', label: 'Καλά' },
  C:     { bgColor: '#ffedd5', textColor: '#9a3412', label: 'Αποδεκτά' },
  D:     { bgColor: '#fee2e2', textColor: '#b91c1c', label: 'Μη Αποδεκτά' },
  F:     { bgColor: '#7f1d1d', textColor: '#ffffff', label: 'Αποτυχία' },
  'N/A': { bgColor: '#f1f5f9', textColor: '#64748b', label: 'Δεν αξιολογήθηκε' },
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
        <View
          className="rounded-2xl w-20 h-20 items-center justify-center"
          style={{ backgroundColor: cfg.bgColor }}
        >
          <Text className="text-4xl font-black" style={{ color: cfg.textColor }}>{grade}</Text>
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
