import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { SaleContractData, DeliveryMethod } from '../../../types/sale';
import { Section, Field, Input, Toggle, ChipGroup } from '../../ContractWizard/components/FormField';
import { formatCurrency } from '../../../utils/pricing';
import { C } from '../../../theme';

interface Props { data: SaleContractData; updateData: (updates: Partial<SaleContractData>) => void; totalAmount: number; }

const DELIVERY_OPTIONS: { value: DeliveryMethod; label: string }[] = [
  { value: 'pickup', label: 'Odbiór osobisty' },
  { value: 'shipping', label: 'Wysyłka' },
  { value: 'none', label: 'Brak dostawy' },
];

export default function Step2Pricing({ data, updateData, totalAmount }: Props) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.stepNum}>Krok 2</Text>
        <Text style={styles.stepTitle}>Cena</Text>
        <Text style={styles.stepDesc}>Podaj cenę towaru i metodę dostawy.</Text>
      </View>
      <Section title="Cena towaru">
        <Field label="Cena (PLN)">
          <Input value={data.price > 0 ? String(data.price) : ''} onChangeText={v => updateData({ price: parseFloat(v) || 0 })} placeholder="0" keyboardType="decimal-pad" />
        </Field>
        <Toggle label="Cena zawiera VAT" value={data.includesVAT} onToggle={() => updateData({ includesVAT: !data.includesVAT })} icon="📄" />
      </Section>
      <Section title="Dostawa">
        <Field label="Metoda dostawy">
          <ChipGroup options={DELIVERY_OPTIONS} selected={data.deliveryMethod} onSelect={v => updateData({ deliveryMethod: v as DeliveryMethod })} />
        </Field>
        {data.deliveryMethod === 'shipping' && (
          <Field label="Koszt wysyłki (PLN)">
            <Input value={data.deliveryPrice > 0 ? String(data.deliveryPrice) : ''} onChangeText={v => updateData({ deliveryPrice: parseFloat(v) || 0 })} placeholder="0" keyboardType="decimal-pad" />
          </Field>
        )}
      </Section>
      {totalAmount > 0 && (
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>ŁĄCZNA KWOTA</Text>
          <Text style={styles.totalValue}>{formatCurrency(totalAmount)}</Text>
          {data.deliveryMethod === 'shipping' && data.deliveryPrice > 0 && (
            <Text style={styles.totalNote}>w tym wysyłka {formatCurrency(data.deliveryPrice)}</Text>
          )}
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
  totalCard: { backgroundColor: C.purpleSubtle, borderRadius: C.radius, borderWidth: 1.5, borderColor: C.purple, padding: 20, alignItems: 'center', marginTop: 4 },
  totalLabel: { color: C.purpleLight, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 },
  totalValue: { color: C.white, fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  totalNote: { color: C.textSec, fontSize: 12, marginTop: 4 },
});
