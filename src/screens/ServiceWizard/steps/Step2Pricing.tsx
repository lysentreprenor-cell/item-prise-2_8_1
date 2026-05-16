import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { ServiceContractData } from '../../../types/service';
import { Section, Field, Input, ChipGroup } from '../../ContractWizard/components/FormField';
import { formatCurrency } from '../../../utils/pricing';
import { C } from '../../../theme';

interface Props { data: ServiceContractData; updateData: (updates: Partial<ServiceContractData>) => void; }

const PRICING_OPTIONS = [
  { value: 'fixed', label: 'Stała kwota' },
  { value: 'hourly', label: 'Stawka godzinowa' },
];

export default function Step2Pricing({ data, updateData }: Props) {
  const totalAmount = data.pricingMethod === 'fixed'
    ? data.fixedPrice
    : data.pricingMethod === 'hourly'
    ? data.hourlyRate * data.estimatedHours
    : 0;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.stepNum}>Krok 2</Text>
        <Text style={styles.stepTitle}>Wycena</Text>
        <Text style={styles.stepDesc}>Wybierz metodę rozliczenia i podaj stawki.</Text>
      </View>
      <Section title="Metoda rozliczenia">
        <Field label="Sposób wyceny">
          <ChipGroup options={PRICING_OPTIONS} selected={data.pricingMethod} onSelect={v => updateData({ pricingMethod: v as ServiceContractData['pricingMethod'] })} />
        </Field>
      </Section>
      {data.pricingMethod === 'fixed' && (
        <Section title="Stała kwota">
          <Field label="Kwota (PLN)">
            <Input value={data.fixedPrice > 0 ? String(data.fixedPrice) : ''} onChangeText={v => updateData({ fixedPrice: parseFloat(v) || 0 })} placeholder="0" keyboardType="decimal-pad" />
          </Field>
        </Section>
      )}
      {data.pricingMethod === 'hourly' && (
        <Section title="Stawka godzinowa">
          <Field label="Stawka za godzinę (PLN)">
            <Input value={data.hourlyRate > 0 ? String(data.hourlyRate) : ''} onChangeText={v => updateData({ hourlyRate: parseFloat(v) || 0 })} placeholder="0" keyboardType="decimal-pad" />
          </Field>
          <Field label="Szacowana liczba godzin">
            <Input value={data.estimatedHours > 0 ? String(data.estimatedHours) : ''} onChangeText={v => updateData({ estimatedHours: parseFloat(v) || 0 })} placeholder="0" keyboardType="decimal-pad" />
          </Field>
          {data.hourlyRate > 0 && data.estimatedHours > 0 && (
            <View style={styles.subTotal}>
              <Text style={styles.subTotalLabel}>Szacowana robocizna</Text>
              <Text style={styles.subTotalValue}>{formatCurrency(data.hourlyRate * data.estimatedHours)}</Text>
            </View>
          )}
        </Section>
      )}
      {totalAmount > 0 && (
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>ŁĄCZNA KWOTA UMOWY</Text>
          <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
        </View>
      )}
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
  subTotal: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, marginTop: 4, borderTopWidth: 1, borderTopColor: C.border },
  subTotalLabel: { color: C.textSec, fontSize: 13 },
  subTotalValue: { color: C.white, fontSize: 13, fontWeight: '600' },
  totalCard: { backgroundColor: C.purpleSubtle, borderRadius: C.radius, borderWidth: 1.5, borderColor: C.purple, padding: 20, alignItems: 'center', marginTop: 4 },
  totalLabel: { color: C.purpleLight, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 },
  totalValue: { color: C.white, fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
});
