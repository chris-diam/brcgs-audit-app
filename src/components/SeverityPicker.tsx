import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'

const OPTIONS = [
  { value: 'OK',               label: 'OK',       activeBg: 'bg-emerald-500' },
  { value: 'Μερικό',           label: 'Μερικό',   activeBg: 'bg-amber-400' },
  { value: 'Μη συμμόρφωση',   label: 'Μη Συμμ.', activeBg: 'bg-red-500' },
  { value: 'N/A',              label: 'N/A',      activeBg: 'bg-slate-400' },
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
            className={`flex-1 py-2.5 rounded-xl items-center justify-center ${
              active ? opt.activeBg : 'bg-slate-100'
            }`}
            activeOpacity={0.7}
          >
            <Text
              className={`font-bold text-sm ${active ? 'text-white' : 'text-slate-500'}`}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}
