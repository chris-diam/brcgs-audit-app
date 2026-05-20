import React from 'react'
import { View, Text } from 'react-native'
import type { AuditSummary } from '../core/types'

interface Props {
  summary: AuditSummary
}

const KPIS: Array<{
  key: keyof AuditSummary | 'pending'
  label: string
  color: string
  bg: string
}> = [
  { key: 'ok',       label: 'OK',       color: '#16a34a', bg: '#f0fdf4' },
  { key: 'ofi',      label: 'OFI',      color: '#0284c7', bg: '#f0f9ff' },
  { key: 'minor',    label: 'Minor',    color: '#d97706', bg: '#fffbeb' },
  { key: 'major',    label: 'Major',    color: '#dc2626', bg: '#fef2f2' },
  { key: 'critical', label: 'Critical', color: '#7f1d1d', bg: '#fef2f2' },
  { key: 'pending',  label: 'Εκκρεμή', color: '#64748b', bg: '#f8fafc' },
]

export default function KPIBar({ summary }: Props) {
  const pending = summary.total - summary.done

  const getValue = (key: string) => {
    if (key === 'pending') return pending
    return summary[key as keyof AuditSummary] as number
  }

  return (
    <View className="flex-row flex-wrap gap-2">
      {KPIS.map(({ key, label, color, bg }) => (
        <View
          key={key}
          className="rounded-xl p-2 items-center"
          style={{ backgroundColor: bg, width: '30%', flexGrow: 1, borderWidth: 1, borderColor: `${color}22` }}
        >
          <Text className="text-xl font-black" style={{ color }}>{getValue(key)}</Text>
          <Text className="text-xs font-bold mt-0.5" style={{ color }}>{label}</Text>
        </View>
      ))}
    </View>
  )
}
