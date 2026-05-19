import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native'
import { useAuditStore } from '../../src/store/auditStore'
import { allClauses, mainSections } from '../../src/data'
import ClauseListItem from '../../src/components/ClauseListItem'

export default function AuditScreen() {
  const { clauses, summary, recomputeSummary } = useAuditStore()
  const [search, setSearch] = useState('')
  const [activeSection, setActiveSection] = useState<string | null>(null)

  useEffect(() => {
    recomputeSummary()
  }, [clauses])

  const filtered = allClauses.filter(c => {
    const matchSection = !activeSection || c.main_section === activeSection
    const matchSearch =
      !search ||
      c.clause.includes(search) ||
      c.title.toLowerCase().includes(search.toLowerCase())
    return matchSection && matchSearch
  })

  const sectionLabel = (s: string) => {
    const num = s.split(' ')[0]
    return `§${num}`
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="bg-teal-700 px-4 pt-5 pb-3">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-white text-xl font-black">Έλεγχος Ρητρών</Text>
          {summary && (
            <View className="bg-teal-600 px-3 py-1 rounded-full">
              <Text className="text-white text-xs font-bold">
                {summary.done}/{summary.total}
              </Text>
            </View>
          )}
        </View>
        <TextInput
          className="bg-teal-600 rounded-xl px-4 py-2.5 text-white"
          placeholder="Αναζήτηση ρήτρας..."
          placeholderTextColor="#5eead4"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View className="bg-white border-b border-slate-100">
        <FlatList
          horizontal
          data={[null, ...mainSections]}
          keyExtractor={(_, i) => String(i)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8, gap: 6 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActiveSection(item)}
              className={`px-3 py-1.5 rounded-full border ${
                activeSection === item
                  ? 'bg-teal-700 border-teal-700'
                  : 'bg-white border-slate-200'
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  activeSection === item ? 'text-white' : 'text-slate-600'
                }`}
              >
                {item ? sectionLabel(item) : 'Όλες'}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.clause}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <ClauseListItem clause={item} state={clauses[item.clause]} />
        )}
        ListEmptyComponent={
          <Text className="text-slate-400 text-center mt-10">
            Δεν βρέθηκαν ρήτρες
          </Text>
        }
      />
    </SafeAreaView>
  )
}
