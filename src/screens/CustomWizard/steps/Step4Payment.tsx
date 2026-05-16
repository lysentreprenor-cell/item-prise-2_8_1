import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CustomContractData, contractTotal } from '../../../types/custom';
import { Section, Field, Input, HintBox } from '../../ContractWizard/components/FormField';
import { formatCurrency } from '../../../utils/pricing';
import { C } from '../../../theme';

interface Props { data: CustomContractData; updateData: (u: Partial<CustomContractData>) => void; }

const SPLITS = [
  { value: 'full_deposit' as const, icon: '🔒', label: 'Całość w depozycie', desc: 'Cała kwota trafia do depozytu, wypłacana po wykonaniu.' },
  { value: 'upfront' as const, icon: '💳', label: 'Płatne z góry', desc: 'Całość płatna przed rozpoczęciem prac.' },
  { value: 'split' as const, icon: '📋', label: 'Częściowo w depozycie', desc: 'Część z góry, reszta w depozycie.' },
  { value: 'custom' as const, icon: '⚙️', label: 'Własny podział', desc: 'Ustaw procenty: z góry / depozyt / po wykonaniu.' },
];

export default function Step4Payment({ data, updateData }: Props) {
  const total = contractTotal(data.items);
  const pct = data.upfrontPercent + data.depositPercent + data.afterPercent;

  const deposit = data.paymentSplit === 'full_deposit' ? total
    : data.paymentSplit === 'upfront' ? 0
    : data.paymentSplit === 'split' ? total * (data.depositPercent / 100)
    : total * (data.depositPercent / 100);
  const upfront = data.paymentSplit === 'upfront' ? total
    : data.paymentSplit === 'split' ? total * (data.upfrontPercent / 100)
    : data.paymentSplit === 'custom' ? total * (data.upfrontPercent / 100)
    : 0;
  const after = data.paymentSplit === 'custom' ? total * (data.afterPercent / 100)
    : data.paymentSplit === 'split' ? total - deposit - upfront
    : 0;

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <Text style={s.stepNum}>Krok 4</Text>
        <Text style={s.stepTitle}>Płatność i depozyt</Text>
        <Text style={s.stepDesc}>Jak zostanie rozliczona kwota {formatCurrency(total)}?</Text>
      </View>

      <Section title="Model płatności">
        {SPLITS.map(opt => {
          const active = data.paymentSplit === opt.value;
          return (
            <TouchableOpacity key={opt.value} style={[s.card, active && s.cardActive]} onPress={() => updateData({ paymentSplit: opt.value })} activeOpacity={0.8}>
              <View style={s.cardRow}>
                <Text style={s.cardIcon}>{opt.icon}</Text>
                <View style={s.cardInfo}>
                  <Text style={[s.cardLabel, active && s.cardLabelActive]}>{opt.label}</Text>
                  <Text style={s.cardDesc}>{opt.desc}</Text>
                </View>
                <View style={[s.radio, active && s.radioActive]}>{active && <View style={s.radioDot} />}</View>
              </View>
            </TouchableOpacity>
          );
        })}
      </Section>

      {data.paymentSplit === 'split' && (
        <Section title="Podział">
          <Field label="Płatne z góry (%)" hint="Reszta trafi do depozytu.">
            <Input value={String(data.upfrontPercent)} onChangeText={v => { const p = Math.min(100, Math.max(0, parseInt(v) || 0)); updateData({ upfrontPercent: p, depositPercent: 100 - p }); }} keyboardType="numeric" placeholder="0" />
          </Field>
        </Section>
      )}

      {data.paymentSplit === 'custom' && (
        <Section title="Własny podział (suma = 100%)">
          <Field label="Z góry (%)"><Input value={String(data.upfrontPercent)} onChangeText={v => updateData({ upfrontPercent: Math.min(100, parseInt(v) || 0) })} keyboardType="numeric" placeholder="0" /></Field>
          <Field label="Depozyt (%)"><Input value={String(data.depositPercent)} onChangeText={v => updateData({ depositPercent: Math.min(100, parseInt(v) || 0) })} keyboardType="numeric" placeholder="100" /></Field>
          <Field label="Po wykonaniu (%)"><Input value={String(data.afterPercent)} onChangeText={v => updateData({ afterPercent: Math.min(100, parseInt(v) || 0) })} keyboardType="numeric" placeholder="0" /></Field>
          {pct !== 100 && <HintBox type="warning" message={`Suma wynosi ${pct}% – powinna wynosić 100%.`} />}
        </Section>
      )}

      {data.paymentSplit && total > 0 && (
        <View style={s.breakdown}>
          <Text style={s.breakdownTitle}>Podział płatności</Text>
          {upfront > 0 && <View style={s.bRow}><View style={s.dot} /><Text style={s.bLabel}>Z góry</Text><Text style={s.bVal}>{formatCurrency(upfront)}</Text></View>}
          {deposit > 0 && <View style={s.bRow}><View style={[s.dot, s.dotPurple]} /><Text style={s.bLabel}>Depozyt</Text><Text style={[s.bVal, s.bValPurple]}>{formatCurrency(deposit)}</Text></View>}
          {after > 0 && <View style={s.bRow}><View style={[s.dot, s.dotGreen]} /><Text style={s.bLabel}>Po wykonaniu</Text><Text style={[s.bVal, s.bValGreen]}>{formatCurrency(after)}</Text></View>}
          <View style={s.bDivider} />
          <View style={s.bRow}><Text style={[s.bLabel, { color: C.white, fontWeight: '700' }]}>Łącznie</Text><Text style={[s.bVal, { color: C.white, fontWeight: '800' }]}>{formatCurrency(total)}</Text></View>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 24 },
  header: { marginBottom: 16 },
  stepNum: { color: C.purple, fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  stepTitle: { color: C.white, fontSize: 22, fontWeight: '800', marginBottom: 4 },
  stepDesc: { color: C.textSec, fontSize: 14, lineHeight: 20 },
  card: { backgroundColor: C.cardAlt, borderRadius: C.radiusSm, borderWidth: 1, borderColor: C.border, padding: 12, marginBottom: 8 },
  cardActive: { backgroundColor: C.purpleSubtle, borderColor: C.purple },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  cardInfo: { flex: 1 },
  cardLabel: { color: C.textSec, fontSize: 14, fontWeight: '600' },
  cardLabelActive: { color: C.purpleLight },
  cardDesc: { color: C.textMuted, fontSize: 12, marginTop: 2, lineHeight: 16 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: C.purple },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.purple },
  breakdown: { backgroundColor: C.card, borderRadius: C.radius, borderWidth: 1, borderColor: C.border, padding: 16, marginTop: 4 },
  breakdownTitle: { color: C.textSec, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 },
  bRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.textMuted, marginRight: 10 },
  dotPurple: { backgroundColor: C.purple },
  dotGreen: { backgroundColor: C.success },
  bLabel: { flex: 1, color: C.textSec, fontSize: 13 },
  bVal: { color: C.white, fontSize: 13, fontWeight: '600' },
  bValPurple: { color: C.purpleLight },
  bValGreen: { color: C.success },
  bDivider: { height: 1, backgroundColor: C.border, marginVertical: 10 },
});
