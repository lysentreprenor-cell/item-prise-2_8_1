import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ServiceContractData } from '../../../types/service';
import { Section, Field, Input } from '../../ContractWizard/components/FormField';
import { formatCurrency } from '../../../utils/pricing';
import { C } from '../../../theme';

interface Props { data: ServiceContractData; updateData: (updates: Partial<ServiceContractData>) => void; }

type PaymentSplit = ServiceContractData['paymentSplit'];

const SPLIT_OPTIONS: { value: PaymentSplit; label: string; icon: string; desc: string }[] = [
  { value: 'full_deposit', label: 'Całość w depozycie', icon: '🔒', desc: 'Cała kwota trafia do depozytu i jest wypłacana po wykonaniu.' },
  { value: 'upfront', label: 'Płatne z góry', icon: '💳', desc: 'Wykonawca otrzymuje zapłatę przed realizacją usługi.' },
  { value: 'split', label: 'Częściowo w depozycie', icon: '📋', desc: 'Część w depozycie, reszta płatna po wykonaniu.' },
];

export default function Step3Payment({ data, updateData }: Props) {
  const totalAmount = data.pricingMethod === 'fixed'
    ? data.fixedPrice
    : data.pricingMethod === 'hourly'
    ? data.hourlyRate * data.estimatedHours
    : 0;
  const depositAmount = data.paymentSplit === 'full_deposit' ? totalAmount : data.paymentSplit === 'split' ? totalAmount * data.depositPercent / 100 : 0;
  const upfrontAmount = data.paymentSplit === 'upfront' ? totalAmount : 0;
  const afterAmount = data.paymentSplit === 'split' ? totalAmount - depositAmount : 0;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.stepNum}>Krok 3</Text>
        <Text style={styles.stepTitle}>Płatność i depozyt</Text>
        <Text style={styles.stepDesc}>Określ model płatności za usługę.</Text>
      </View>
      <Section title="Model płatności">
        {SPLIT_OPTIONS.map(opt => {
          const isActive = data.paymentSplit === opt.value;
          return (
            <TouchableOpacity key={opt.value} style={[styles.splitCard, isActive && styles.splitCardActive]} onPress={() => updateData({ paymentSplit: opt.value })} activeOpacity={0.8}>
              <View style={styles.splitRow}>
                <Text style={styles.splitIcon}>{opt.icon}</Text>
                <View style={styles.splitInfo}><Text style={[styles.splitLabel, isActive && styles.splitLabelActive]}>{opt.label}</Text><Text style={styles.splitDesc}>{opt.desc}</Text></View>
                <View style={[styles.radio, isActive && styles.radioActive]}>{isActive && <View style={styles.radioDot} />}</View>
              </View>
            </TouchableOpacity>
          );
        })}
      </Section>
      {data.paymentSplit === 'split' && (
        <Section title="Konfiguracja podziału">
          <Field label="Procent w depozycie (%)" hint="Reszta płatna po wykonaniu.">
            <Input value={String(data.depositPercent)} onChangeText={v => updateData({ depositPercent: Math.min(100, Math.max(0, parseInt(v) || 0)) })} keyboardType="numeric" placeholder="100" />
          </Field>
        </Section>
      )}
      {totalAmount > 0 && data.paymentSplit !== '' && (
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Podział płatności</Text>
          {upfrontAmount > 0 && <View style={styles.breakdownRow}><View style={[styles.dot, styles.dotWhite]} /><Text style={styles.breakdownLabel}>Płatne z góry</Text><Text style={styles.breakdownValue}>{formatCurrency(upfrontAmount)}</Text></View>}
          {depositAmount > 0 && <View style={styles.breakdownRow}><View style={[styles.dot, styles.dotPurple]} /><Text style={styles.breakdownLabel}>W depozycie</Text><Text style={[styles.breakdownValue, styles.breakdownValuePurple]}>{formatCurrency(depositAmount)}</Text></View>}
          {afterAmount > 0 && <View style={styles.breakdownRow}><View style={[styles.dot, styles.dotGreen]} /><Text style={styles.breakdownLabel}>Po wykonaniu</Text><Text style={[styles.breakdownValue, styles.breakdownValueGreen]}>{formatCurrency(afterAmount)}</Text></View>}
          <View style={styles.breakdownDivider} />
          <View style={styles.breakdownRow}><Text style={styles.breakdownTotalLabel}>Łącznie</Text><Text style={styles.breakdownTotalValue}>{formatCurrency(totalAmount)}</Text></View>
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
  breakdownCard: { backgroundColor: C.card, borderRadius: C.radius, borderWidth: 1, borderColor: C.border, padding: 16, marginTop: 4 },
  breakdownTitle: { color: C.textSec, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  dotWhite: { backgroundColor: C.textMuted },
  dotPurple: { backgroundColor: C.purple },
  dotGreen: { backgroundColor: C.success },
  breakdownLabel: { flex: 1, color: C.textSec, fontSize: 13 },
  breakdownValue: { color: C.white, fontSize: 13, fontWeight: '600' },
  breakdownValuePurple: { color: C.purpleLight },
  breakdownValueGreen: { color: C.success },
  breakdownDivider: { height: 1, backgroundColor: C.border, marginVertical: 12 },
  breakdownTotalLabel: { flex: 1, color: C.white, fontSize: 14, fontWeight: '700' },
  breakdownTotalValue: { color: C.white, fontSize: 16, fontWeight: '800' },
});
