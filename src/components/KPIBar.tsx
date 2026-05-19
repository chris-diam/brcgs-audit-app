import React from 'react'
import { View, Text } from 'react-native'
import type { AuditSummary } from '../core/types'

interface Props {
  summary: AuditSummary
}

const KPIS = [
  { key: 'ok'       as const, label: 'OK',       bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  { key: 'ofi'      as const, label: 'OFI',      bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200' },
  { key: 'minor'    as const, label: 'Minor',    bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200' },
  { key: 'major'    as const, label: 'Major',    bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200' },
  { key: 'critical' as const, label: 'Critical', bg: 'bg-red-900',    text: 'text-white',       border: 'border-red-900' },
]

export default function KPIBar({ summary }: Props) {
  return (
    <View className="flex-row gap-2">
      {KPIS.map(({ key, label, bg, text, border }) => (
        <View key={key} className={`flex-1 ${bg} border ${border} rounded-xl p-2 items-center`}>
          <Text className={`${text} text-xl font-black`}>{summary[key]}</Text>
          <Text className={`${text} text-xs font-bold`}>{label}</Text>
        </View>
      ))}
    </View>
  )
}
