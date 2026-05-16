import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SaleContractData } from '../../../types/sale';
import { Section, Field, Input, Toggle } from '../../ContractWizard/components/FormField';
import { C } from '../../../theme';

interface Props { data: SaleContractData; updateData: (updates: Partial<SaleContractData>) => void; }

const CONDITION_OPTIONS = ['Towar bez wad ukrytych', 'Zgodny z opisem', 'Kompletny', 'Sprawdzony przed wysyłką'];

export default function Step4Conditions({ data, updateData }: Props) {
  const toggleCondition = (item: string) => updateData({ conditions: data.conditions.includes(item) ? data.conditions.filter(c => c !== item) : [...data.conditions, item] });
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.stepNum}>Krok 4</Text>
        <Text style={styles.stepTitle}>Warunki sprzedaży</Text>
        <Text style={styles.stepDesc}>Określ gwarancję, prawo do zwrotu i warunki towaru.</Text>
      </View>
      <Section title="Prawo do zwrotu">
        <Toggle label="Prawo do zwrotu" value={data.hasReturnPolicy} onToggle={() => updateData({ hasReturnPolicy: !data.hasReturnPolicy })} icon="🔄" />
        {data.hasReturnPolicy && (
          <Field label="Termin zwrotu (dni)">
            <Input value={data.returnDays > 0 ? String(data.returnDays) : ''} onChangeText={v => updateData({ returnDays: parseInt(v) || 14 })} placeholder="14" keyboardType="numeric" />
          </Field>
        )}
      </Section>
      <Section title="Gwarancja">
        <Field label="Gwarancja (dni)" hint="0 = brak gwarancji">
          <Input value={data.warrantyDays > 0 ? String(data.warrantyDays) : ''} onChangeText={v => updateData({ warrantyDays: parseInt(v) || 0 })} placeholder="0" keyboardType="numeric" />
        </Field>
      </Section>
      <Section title="Warunki towaru">
        <View style={styles.chipsRow}>
          {CONDITION_OPTIONS.map(item => {
            const isActive = data.conditions.includes(item);
            return (
              <TouchableOpacity key={item} style={[styles.chip, isActive && styles.chipActive]} onPress={() => toggleCondition(item)} activeOpacity={0.75}>
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{item}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 24 },
  header: { marginBottom: 16 },
  stepNum: { color: C.purple, fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  stepTitle: { color: C.white, fontSize: 22, fontWeight: '800', marginBottom: 4 },
  stepDesc: { color: C.textSec, fontSize: 14, lineHeight: 20 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: C.cardAlt, borderWidth: 1, borderColor: C.border },
  chipActive: { backgroundColor: C.purpleDim, borderColor: C.purple },
  chipText: { color: C.textSec, fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: C.purpleLight, fontWeight: '700' },
});
