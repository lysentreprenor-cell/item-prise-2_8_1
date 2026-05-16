import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SaleContractData } from '../../../types/sale';
import { formatCurrency } from '../../../utils/pricing';
import { C } from '../../../theme';

interface Props { data: SaleContractData; totalAmount: number; goToStep: (step: number) => void; onCreateContract: () => void; }

function SummaryRow({ label, value, warning }: { label: string; value: string; warning?: boolean }) {
  return <View style={rStyles.row}><Text style={rStyles.label}>{label}</Text><Text style={[rStyles.value, warning && rStyles.valueWarning]}>{value}</Text></View>;
}

function SummarySection({ title, onEdit, children }: { title: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <View style={ssStyles.card}>
      <View style={ssStyles.header}><Text style={ssStyles.title}>{title}</Text><TouchableOpacity onPress={onEdit} style={ssStyles.editBtn} activeOpacity={0.75}><Text style={ssStyles.editText}>Edytuj →</Text></TouchableOpacity></View>
      {children}
    </View>
  );
}

const CONDITION_LABELS: Record<string, string> = { new: 'Nowy', used: 'Używany', refurbished: 'Odnowiony' };
const DELIVERY_LABELS: Record<string, string> = { pickup: 'Odbiór osobisty', shipping: 'Wysyłka', none: 'Brak dostawy' };
const PAYMENT_LABELS: Record<string, string> = { bank_transfer: 'Przelew bankowy', cash: 'Gotówka', deposit: 'Depozyt bezpieczny' };

export default function Step5Summary({ data, totalAmount, goToStep, onCreateContract }: Props) {
  const warnings: string[] = [];
  if (!data.itemName) warnings.push('Brak nazwy towaru');
  if (data.price === 0) warnings.push('Cena wynosi 0 zł');
  if (!data.paymentMethod) warnings.push('Brak metody płatności');
  if (!data.itemCondition) warnings.push('Brak stanu towaru');

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}><Text style={styles.stepNum}>Krok 5</Text><Text style={styles.stepTitle}>Podsumowanie</Text><Text style={styles.stepDesc}>Sprawdź wszystkie dane przed utworzeniem umowy.</Text></View>
      {warnings.length > 0 && <View style={styles.warningsBox}><Text style={styles.warningsTitle}>⚠️ Brakujące dane ({warnings.length})</Text>{warnings.map(w => <Text key={w} style={styles.warningItem}>• {w}</Text>)}</View>}
      <SummarySection title="Towar" onEdit={() => goToStep(1)}>
        <SummaryRow label="Nazwa" value={data.itemName || '—'} warning={!data.itemName} />
        <SummaryRow label="Stan" value={data.itemCondition ? CONDITION_LABELS[data.itemCondition] : '—'} warning={!data.itemCondition} />
        <SummaryRow label="Ilość" value={String(data.quantity)} />
      </SummarySection>
      <SummarySection title="Cena" onEdit={() => goToStep(2)}>
        <SummaryRow label="Cena" value={formatCurrency(data.price)} warning={data.price === 0} />
        <SummaryRow label="VAT" value={data.includesVAT ? 'W cenie' : 'Nie dotyczy'} />
        <SummaryRow label="Dostawa" value={data.deliveryMethod ? DELIVERY_LABELS[data.deliveryMethod] : '—'} />
        {data.deliveryMethod === 'shipping' && data.deliveryPrice > 0 && <SummaryRow label="Koszt wysyłki" value={formatCurrency(data.deliveryPrice)} />}
      </SummarySection>
      <SummarySection title="Płatność" onEdit={() => goToStep(3)}>
        <SummaryRow label="Metoda" value={data.paymentMethod ? PAYMENT_LABELS[data.paymentMethod] : '—'} warning={!data.paymentMethod} />
      </SummarySection>
      <SummarySection title="Warunki" onEdit={() => goToStep(4)}>
        <SummaryRow label="Prawo do zwrotu" value={data.hasReturnPolicy ? `Tak – ${data.returnDays} dni` : 'Nie'} />
        <SummaryRow label="Gwarancja" value={data.warrantyDays > 0 ? `${data.warrantyDays} dni` : 'Brak'} />
        <SummaryRow label="Warunki towaru" value={data.conditions.length > 0 ? `${data.conditions.length} zaznaczonych` : 'Brak'} />
      </SummarySection>
      <View style={styles.finalCard}>
        <Text style={styles.finalLabel}>ŁĄCZNA KWOTA UMOWY</Text>
        <Text style={styles.finalValue}>{formatCurrency(totalAmount)}</Text>
        {data.paymentMethod === 'deposit' && totalAmount > 0 && <Text style={styles.finalDeposit}>chroniony depozytem bezpiecznym</Text>}
      </View>
      <TouchableOpacity style={[styles.createBtn, warnings.length > 0 && styles.createBtnWarning]} onPress={onCreateContract} activeOpacity={0.85}>
        <Text style={styles.createBtnText}>{warnings.length > 0 ? '⚠️ Utwórz mimo braków' : 'Utwórz umowę ✓'}</Text>
      </TouchableOpacity>
      {warnings.length > 0 && <Text style={styles.createHint}>Uzupełnij brakujące dane, aby umowa była bardziej precyzyjna.</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({ scroll: { flex: 1, backgroundColor: C.bg }, content: { padding: 16, paddingBottom: 32 }, header: { marginBottom: 16 }, stepNum: { color: C.purple, fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }, stepTitle: { color: C.white, fontSize: 22, fontWeight: '800', marginBottom: 4 }, stepDesc: { color: C.textSec, fontSize: 14, lineHeight: 20 }, warningsBox: { backgroundColor: C.warningBg, borderRadius: C.radiusSm, borderWidth: 1, borderColor: C.warning, padding: 12, marginBottom: 12 }, warningsTitle: { color: C.warning, fontSize: 13, fontWeight: '700', marginBottom: 6 }, warningItem: { color: C.warning, fontSize: 12, lineHeight: 20 }, finalCard: { backgroundColor: C.purpleSubtle, borderRadius: C.radius, borderWidth: 1.5, borderColor: C.purple, padding: 20, alignItems: 'center', marginVertical: 16 }, finalLabel: { color: C.purpleLight, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }, finalValue: { color: C.white, fontSize: 34, fontWeight: '800', letterSpacing: -0.5 }, finalDeposit: { color: C.textSec, fontSize: 13, marginTop: 4 }, createBtn: { backgroundColor: C.purple, borderRadius: C.radius, paddingVertical: 16, alignItems: 'center', marginBottom: 8, elevation: 6 }, createBtnWarning: { backgroundColor: '#92400E' }, createBtnText: { color: C.white, fontSize: 16, fontWeight: '800', letterSpacing: 0.2 }, createHint: { color: C.textMuted, fontSize: 12, textAlign: 'center', lineHeight: 18 } });
const rStyles = StyleSheet.create({ row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 5 }, label: { color: C.textSec, fontSize: 13, flex: 1 }, value: { color: C.white, fontSize: 13, fontWeight: '500', flex: 1.2, textAlign: 'right' }, valueWarning: { color: C.warning } });
const ssStyles = StyleSheet.create({ card: { backgroundColor: C.card, borderRadius: C.radius, borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 10 }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }, title: { color: C.purpleLight, fontSize: 12, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' }, editBtn: { paddingHorizontal: 8, paddingVertical: 4 }, editText: { color: C.purple, fontSize: 12, fontWeight: '600' } });
