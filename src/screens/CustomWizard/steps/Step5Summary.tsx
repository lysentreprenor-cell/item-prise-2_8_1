import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CustomContractData, UNIT_LABELS, lineTotal, contractTotal } from '../../../types/custom';
import { HintBox } from '../../ContractWizard/components/FormField';
import { formatCurrency } from '../../../utils/pricing';
import { C } from '../../../theme';

interface Props {
  data: CustomContractData;
  updateData: (u: Partial<CustomContractData>) => void;
  goToStep: (s: number) => void;
  onCreateContract: () => void;
}

const PAYMENT_LABELS: Record<string, string> = {
  full_deposit: 'Całość w depozycie',
  upfront: 'Płatne z góry',
  split: 'Częściowo w depozycie',
  custom: 'Własny podział',
};

function SCard({ title, step, onEdit, children }: { title: string; step: number; onEdit: () => void; children: React.ReactNode }) {
  return (
    <View style={sc.card}>
      <View style={sc.header}>
        <Text style={sc.title}>{title}</Text>
        <TouchableOpacity onPress={onEdit} style={sc.editBtn} activeOpacity={0.75}><Text style={sc.editText}>Edytuj →</Text></TouchableOpacity>
      </View>
      {children}
    </View>
  );
}

function Row({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <View style={r.row}>
      <Text style={r.label}>{label}</Text>
      <Text style={[r.value, warn && r.valueWarn]}>{value}</Text>
    </View>
  );
}

export default function Step5Summary({ data, goToStep, onCreateContract }: Props) {
  const total = contractTotal(data.items);
  const warnings: string[] = [];
  if (!data.title) warnings.push('Brak tytułu umowy');
  if (data.items.length === 0) warnings.push('Brak pozycji w umowie');
  if (total === 0) warnings.push('Łączna kwota wynosi 0 zł');
  if (!data.paymentSplit) warnings.push('Brak modelu płatności');
  if (!data.deadline) warnings.push('Brak terminu realizacji');

  const missingPrices = data.items.filter(i => i.unitPrice === 0).length;
  const groupedByCategory: Record<string, number> = {};
  data.items.forEach(i => { groupedByCategory[i.category] = (groupedByCategory[i.category] || 0) + lineTotal(i); });

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <Text style={s.stepNum}>Krok 5</Text>
        <Text style={s.stepTitle}>Podsumowanie</Text>
        <Text style={s.stepDesc}>Sprawdź wszystkie dane przed utworzeniem umowy.</Text>
      </View>

      {warnings.length > 0 && (
        <View style={s.warnBox}>
          <Text style={s.warnTitle}>⚠️ Brakujące dane ({warnings.length})</Text>
          {warnings.map(w => <Text key={w} style={s.warnItem}>• {w}</Text>)}
        </View>
      )}
      {missingPrices > 0 && <HintBox type="info" message={`${missingPrices} pozycji bez ceny – uzupełnij w kroku 2.`} />}

      <SCard title="Podstawy" step={1} onEdit={() => goToStep(1)}>
        <Row label="Tytuł" value={data.title || '—'} warn={!data.title} />
        <Row label="Wykonawca" value={data.executorSearch || '—'} />
        <Row label="Termin" value={data.deadline || '—'} warn={!data.deadline} />
      </SCard>

      <SCard title={`Pozycje (${data.items.length})`} step={2} onEdit={() => goToStep(2)}>
        {data.items.length === 0
          ? <Row label="Pozycje" value="Brak" warn />
          : Object.entries(groupedByCategory).map(([cat, catTotal]) => (
            <Row key={cat} label={cat} value={formatCurrency(catTotal)} />
          ))
        }
      </SCard>

      <SCard title="Wycena" step={3} onEdit={() => goToStep(3)}>
        <Row label="Liczba pozycji" value={String(data.items.length)} warn={data.items.length === 0} />
        <Row label="Łączna kwota" value={formatCurrency(total)} warn={total === 0} />
      </SCard>

      <SCard title="Płatność" step={4} onEdit={() => goToStep(4)}>
        <Row label="Model" value={data.paymentSplit ? PAYMENT_LABELS[data.paymentSplit] : '—'} warn={!data.paymentSplit} />
      </SCard>

      <View style={s.finalCard}>
        <Text style={s.finalLabel}>ŁĄCZNA KWOTA UMOWY</Text>
        <Text style={s.finalValue}>{formatCurrency(total)}</Text>
        <Text style={s.finalSub}>{data.items.length} pozycji kosztorysowych</Text>
      </View>

      <TouchableOpacity style={[s.createBtn, warnings.length > 0 && s.createBtnWarn]} onPress={onCreateContract} activeOpacity={0.85}>
        <Text style={s.createBtnText}>{warnings.length > 0 ? '⚠️ Utwórz mimo braków' : '✓ Utwórz umowę'}</Text>
      </TouchableOpacity>
      {warnings.length > 0 && <Text style={s.hint}>Uzupełnij brakujące dane, aby umowa była precyzyjniejsza.</Text>}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 32 },
  header: { marginBottom: 16 },
  stepNum: { color: C.purple, fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  stepTitle: { color: C.white, fontSize: 22, fontWeight: '800', marginBottom: 4 },
  stepDesc: { color: C.textSec, fontSize: 14, lineHeight: 20 },
  warnBox: { backgroundColor: C.warningBg, borderRadius: C.radiusSm, borderWidth: 1, borderColor: C.warning, padding: 12, marginBottom: 12 },
  warnTitle: { color: C.warning, fontSize: 13, fontWeight: '700', marginBottom: 6 },
  warnItem: { color: C.warning, fontSize: 12, lineHeight: 20 },
  finalCard: { backgroundColor: C.purpleSubtle, borderRadius: C.radius, borderWidth: 1.5, borderColor: C.purple, padding: 20, alignItems: 'center', marginVertical: 16 },
  finalLabel: { color: C.purpleLight, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 },
  finalValue: { color: C.white, fontSize: 34, fontWeight: '800', letterSpacing: -0.5 },
  finalSub: { color: C.textMuted, fontSize: 12, marginTop: 4 },
  createBtn: { backgroundColor: C.purple, borderRadius: C.radius, paddingVertical: 16, alignItems: 'center', marginBottom: 8, elevation: 6 },
  createBtnWarn: { backgroundColor: '#92400E' },
  createBtnText: { color: C.white, fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },
  hint: { color: C.textMuted, fontSize: 12, textAlign: 'center', lineHeight: 18 },
});

const sc = StyleSheet.create({
  card: { backgroundColor: C.card, borderRadius: C.radius, borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  title: { color: C.purpleLight, fontSize: 12, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  editBtn: { paddingHorizontal: 8, paddingVertical: 4 },
  editText: { color: C.purple, fontSize: 12, fontWeight: '600' },
});

const r = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 5 },
  label: { color: C.textSec, fontSize: 13, flex: 1 },
  value: { color: C.white, fontSize: 13, fontWeight: '500', flex: 1.2, textAlign: 'right' },
  valueWarn: { color: C.warning },
});
