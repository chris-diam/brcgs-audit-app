import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'

const OPTIONS = [
  { value: 'OK',               label: 'OK',       activeStyle: { backgroundColor: '#22c55e' } },
  { value: 'Μερικό',           label: 'Μερικό',   activeStyle: { backgroundColor: '#fbbf24' } },
  { value: 'Μη συμμόρφωση',   label: 'Μη Συμμ.', activeStyle: { backgroundColor: '#ef4444' } },
  { value: 'N/A',              label: 'N/A',      activeStyle: { backgroundColor: '#94a3b8' } },
]

interface Props {
  value: string
  onChange: (v: string) => void
}

export default function SeverityPicker({ value, onChange }: Props) {
  return (
    <View className="flex-row gap-1.5">
      {OPTIONS.map(opt => {
        const active = value === opt.value
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onChange(active ? '' : opt.value)}
            className="flex-1 py-2.5 rounded-xl items-center justify-center bg-slate-100"
            style={active ? opt.activeStyle : undefined}
            activeOpacity={0.7}
          >
            <Text
              className="font-bold text-sm text-slate-500"
              style={active ? { color: '#fff' } : undefined}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}
