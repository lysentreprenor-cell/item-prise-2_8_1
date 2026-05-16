import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { CustomContractData, LineItem, UNIT_LABELS, lineTotal, contractTotal } from '../../../types/custom';
import { formatCurrency } from '../../../utils/pricing';
import { HintBox } from '../../ContractWizard/components/FormField';
import { C } from '../../../theme';

interface Props { data: CustomContractData; }

function GroupedItems({ items }: { items: LineItem[] }) {
  const groups: Record<string, LineItem[]> = {};
  items.forEach(i => { (groups[i.category] = groups[i.category] || []).push(i); });
  return (
    <>
      {Object.entries(groups).map(([cat, catItems]) => (
        <View key={cat} style={g.group}>
          <Text style={g.catLabel}>{cat}</Text>
          {catItems.map(item => (
            <View key={item.id} style={g.row}>
              <View style={g.left}>
                <Text style={g.name}>{item.name}</Text>
                <Text style={g.detail}>
                  {item.quantity} {UNIT_LABELS[item.unit]} × {formatCurrency(item.unitPrice)}
                </Text>
              </View>
              <Text style={[g.total, lineTotal(item) === 0 && g.totalZero]}>
                {lineTotal(item) === 0 ? 'brak ceny' : formatCurrency(lineTotal(item))}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </>
  );
}

export default function Step3Review({ data }: Props) {
  const total = contractTotal(data.items);
  const missingPrices = data.items.filter(i => i.unitPrice === 0);
  const missingQty = data.items.filter(i => i.quantity === 0);

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <Text style={s.stepNum}>Krok 3</Text>
        <Text style={s.stepTitle}>Przegląd wyceny</Text>
        <Text style={s.stepDesc}>Sprawdź wszystkie pozycje i kwoty przed przejściem dalej.</Text>
      </View>

      {data.items.length === 0 && (
        <HintBox type="warning" message="Brak pozycji — wróć do kroku 2 i dodaj pozycje do umowy." />
      )}
      {missingPrices.length > 0 && (
        <HintBox type="warning" message={`${missingPrices.length} pozycj${missingPrices.length === 1 ? 'a' : 'i'} bez podanej ceny. Wróć do kroku 2 i uzupełnij.`} />
      )}
      {missingQty.length > 0 && (
        <HintBox type="info" message={`${missingQty.length} pozycj${missingQty.length === 1 ? 'a' : 'i'} z ilością 0.`} />
      )}

      {data.items.length > 0 && (
        <View style={s.card}>
          <GroupedItems items={data.items} />
        </View>
      )}

      <View style={s.totalCard}>
        <Text style={s.totalLabel}>ŁĄCZNA KWOTA UMOWY</Text>
        <Text style={s.totalValue}>{formatCurrency(total)}</Text>
        <Text style={s.totalSub}>{data.items.length} pozycji</Text>
      </View>
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
  card: { backgroundColor: C.card, borderRadius: C.radius, borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 12 },
  totalCard: { backgroundColor: C.purpleSubtle, borderRadius: C.radius, borderWidth: 1.5, borderColor: C.purple, padding: 20, alignItems: 'center' },
  totalLabel: { color: C.purpleLight, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 },
  totalValue: { color: C.white, fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  totalSub: { color: C.textMuted, fontSize: 12, marginTop: 4 },
});

const g = StyleSheet.create({
  group: { marginBottom: 12 },
  catLabel: { color: C.purpleLight, fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: C.border },
  left: { flex: 1 },
  name: { color: C.white, fontSize: 13, fontWeight: '500' },
  detail: { color: C.textMuted, fontSize: 11, marginTop: 2 },
  total: { color: C.white, fontSize: 13, fontWeight: '700', minWidth: 90, textAlign: 'right' },
  totalZero: { color: C.warning },
});
