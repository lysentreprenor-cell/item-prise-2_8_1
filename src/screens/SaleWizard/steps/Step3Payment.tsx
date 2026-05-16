import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SaleContractData, SalePaymentMethod } from '../../../types/sale';
import { Section, HintBox } from '../../ContractWizard/components/FormField';
import { formatCurrency } from '../../../utils/pricing';
import { C } from '../../../theme';

interface Props { data: SaleContractData; updateData: (updates: Partial<SaleContractData>) => void; totalAmount: number; }

const PAYMENT_OPTIONS: { value: SalePaymentMethod; label: string; desc: string; icon: string }[] = [
  { value: 'bank_transfer', label: 'Przelew bankowy', desc: 'Płatność przelewem na konto sprzedającego.', icon: '🏦' },
  { value: 'cash', label: 'Gotówka', desc: 'Płatność gotówką przy odbiorze.', icon: '💵' },
  { value: 'deposit', label: 'Depozyt bezpieczny', desc: 'Środki trzymane w depozycie do momentu odbioru towaru.', icon: '🔒' },
];

export default function Step3Payment({ data, updateData, totalAmount }: Props) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.stepNum}>Krok 3</Text>
        <Text style={styles.stepTitle}>Metoda płatności</Text>
        <Text style={styles.stepDesc}>Wybierz preferowaną metodę płatności za {formatCurrency(totalAmount)}.</Text>
      </View>
      <Section title="Metoda płatności">
        {PAYMENT_OPTIONS.map(opt => {
          const isActive = data.paymentMethod === opt.value;
          return (
            <TouchableOpacity key={opt.value} style={[styles.payCard, isActive && styles.payCardActive]} onPress={() => updateData({ paymentMethod: opt.value })} activeOpacity={0.8}>
              <View style={styles.payRow}>
                <Text style={styles.payIcon}>{opt.icon}</Text>
                <View style={styles.payInfo}><Text style={[styles.payLabel, isActive && styles.payLabelActive]}>{opt.label}</Text><Text style={styles.payDesc}>{opt.desc}</Text></View>
                <View style={[styles.radio, isActive && styles.radioActive]}>{isActive && <View style={styles.radioDot} />}</View>
              </View>
            </TouchableOpacity>
          );
        })}
      </Section>
      {data.paymentMethod === 'deposit' && (
        <HintBox type="suggestion" message="Depozyt bezpieczny chroni kupującego – środki są wypłacane sprzedającemu dopiero po potwierdzeniu odbioru towaru." />
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
  payCard: { backgroundColor: C.cardAlt, borderRadius: C.radiusSm, borderWidth: 1, borderColor: C.border, padding: 12, marginBottom: 8 },
  payCardActive: { backgroundColor: C.purpleSubtle, borderColor: C.purple },
  payRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  payIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  payInfo: { flex: 1 },
  payLabel: { color: C.textSec, fontSize: 14, fontWeight: '600' },
  payLabelActive: { color: C.purpleLight },
  payDesc: { color: C.textMuted, fontSize: 12, marginTop: 2, lineHeight: 16 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: C.purple },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.purple },
});
