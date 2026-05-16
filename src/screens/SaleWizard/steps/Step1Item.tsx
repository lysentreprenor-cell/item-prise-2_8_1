import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SaleContractData, ItemCondition } from '../../../types/sale';
import { Section, Field, Input, ChipGroup } from '../../ContractWizard/components/FormField';
import { C } from '../../../theme';

interface Props { data: SaleContractData; updateData: (updates: Partial<SaleContractData>) => void; }

const CONDITION_OPTIONS: { value: ItemCondition; label: string }[] = [
  { value: 'new', label: 'Nowy' },
  { value: 'used', label: 'Używany' },
  { value: 'refurbished', label: 'Odnowiony' },
];

export default function Step1Item({ data, updateData }: Props) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.stepNum}>Krok 1</Text>
        <Text style={styles.stepTitle}>Towar</Text>
        <Text style={styles.stepDesc}>Opisz sprzedawany przedmiot i jego stan.</Text>
      </View>
      <Section title="Dane towaru">
        <Field label="Nazwa towaru">
          <Input value={data.itemName} onChangeText={v => updateData({ itemName: v })} placeholder="np. Laptop Dell XPS 15" />
        </Field>
        <Field label="Opis">
          <Input value={data.itemDescription} onChangeText={v => updateData({ itemDescription: v })} placeholder="Opisz szczegółowo przedmiot..." multiline />
        </Field>
      </Section>
      <Section title="Stan i ilość">
        <Field label="Stan towaru">
          <ChipGroup options={CONDITION_OPTIONS} selected={data.itemCondition} onSelect={v => updateData({ itemCondition: v as ItemCondition })} />
        </Field>
        <Field label="Ilość">
          <Input value={data.quantity > 0 ? String(data.quantity) : ''} onChangeText={v => updateData({ quantity: parseInt(v) || 1 })} placeholder="1" keyboardType="numeric" />
        </Field>
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
});
