import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TransportContractData } from '../../../types/transport';
import { Section, Field, Input, ChipGroup } from '../../ContractWizard/components/FormField';
import { formatCurrency } from '../../../utils/pricing';
import { C } from '../../../theme';

interface Props { data: TransportContractData; updateData: (updates: Partial<TransportContractData>) => void; totalAmount: number; }

const PRICING_OPTIONS = [{ value: 'fixed', label: 'Stała cena' }, { value: 'per_km', label: 'Za kilometr' }];
const SPLIT_OPTIONS: { value: TransportContractData['paymentSplit']; label: string; desc: string; icon: string }[] = [
  { value: 'full_deposit', label: 'Całość w depozycie', desc: 'Cała kwota trafia do depozytu i jest wypłacana po dostawie.', icon: '🔒' },
  { value: 'upfront', label: 'Płatne z góry', desc: 'Pełna płatność przed transportem.', icon: '💳' },
];

export default function Step4Pricing({ data, updateData, totalAmount }: Props) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.stepNum}>Krok 4</Text>
        <Text style={styles.stepTitle}>Wycena</Text>
        <Text style={styles.stepDesc}>Określ cenę i model płatności.</Text>
      </View>
      <Section title="Metoda wyceny">
        <Field label="Sposób rozliczenia">
          <ChipGroup options={PRICING_OPTIONS} selected={data.pricingMethod} onSelect={v => updateData({ pricingMethod: v as TransportContractData['pricingMethod'] })} />
        </Field>
      </Section>
      {data.pricingMethod === 'fixed' && (
        <Section title="Stała cena">
          <Field label="Cena całkowita (PLN)">
            <Input value={data.fixedPrice > 0 ? String(data.fixedPrice) : ''} onChangeText={v => updateData({ fixedPrice: parseFloat(v) || 0 })} placeholder="0" keyboardType="decimal-pad" />
          </Field>
        </Section>
      )}
      {data.pricingMethod === 'per_km' && (
        <Section title="Cena za km">
          <Field label="Cena za km (PLN)">
            <Input value={data.pricePerKm > 0 ? String(data.pricePerKm) : ''} onChangeText={v => updateData({ pricePerKm: parseFloat(v) || 0 })} placeholder="0" keyboardType="decimal-pad" />
          </Field>
          {data.pricePerKm > 0 && data.distanceKm > 0 && (
            <View style={styles.subTotal}>
              <Text style={styles.subTotalLabel}>Szacowany koszt ({data.distanceKm} km × {formatCurrency(data.pricePerKm)})</Text>
              <Text style={styles.subTotalValue}>{formatCurrency(data.pricePerKm * data.distanceKm)}</Text>
            </View>
          )}
        </Section>
      )}
      <Section title="Model płatności">
        {SPLIT_OPTIONS.map(opt => {
          const isActive = data.paymentSplit === opt.value;
          return (
            <TouchableOpacity key={opt.value as string} style={[styles.splitCard, isActive && styles.splitCardActive]} onPress={() => updateData({ paymentSplit: opt.value })} activeOpacity={0.8}>
              <View style={styles.splitRow}>
                <Text style={styles.splitIcon}>{opt.icon}</Text>
                <View style={styles.splitInfo}><Text style={[styles.splitLabel, isActive && styles.splitLabelActive]}>{opt.label}</Text><Text style={styles.splitDesc}>{opt.desc}</Text></View>
                <View style={[styles.radio, isActive && styles.radioActive]}>{isActive && <View style={styles.radioDot} />}</View>
              </View>
            </TouchableOpacity>
          );
        })}
      </Section>
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
  subTotalLabel: { color: C.textSec, fontSize: 13, flex: 1, marginRight: 8 },
  subTotalValue: { color: C.white, fontSize: 13, fontWeight: '600' },
  splitCard: { backgroundColor: C.cardAlt, borderRadius: C.radiusSm, borderWidth: 1, borderColor: C.border, padding: 12, marginBottom: 8 },
  splitCardActive: { backgroundColor: C.purpleSubtle, borderColor: C.purple },
  splitRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  splitIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  splitInfo: { flex: 1 },
  splitLabel: { color: C.textSec, fontSize: 14, fontWeight: '600' },
  splitLabelActive: { color: C.purpleLight },
  splitDesc: { color: C.textMuted, fontSize: 12, marginTop: 2, lineHeight: 16 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: C.purple },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.purple },
  totalCard: { backgroundColor: C.purpleSubtle, borderRadius: C.radius, borderWidth: 1.5, borderColor: C.purple, padding: 20, alignItems: 'center', marginTop: 4 },
  totalLabel: { color: C.purpleLight, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 },
  totalValue: { color: C.white, fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
});
