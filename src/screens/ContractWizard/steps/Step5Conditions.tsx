import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { ContractData } from '../../../types/contract';
import { Section, Field, Toggle, Input, HintBox } from '../components/FormField';
import { C } from '../../../theme';

interface Props {
  data: ContractData;
  updateData: (updates: Partial<ContractData>) => void;
}

const PROOF_OPTIONS = [
  'Zdjęcie stanu przed pracami',
  'Zdjęcia w trakcie prac',
  'Zdjęcia finalnego efektu',
  'Faktura za materiały',
  'Protokół odbioru',
  'Kosztorys szczegółowy',
];

const CONDITION_OPTIONS = [
  'Prace zgodnie z projektem',
  'Materiały zatwierdzone przez klienta',
  'Brak zmian w trakcie bez akceptacji',
  'Sprzątanie po pracach',
  'Przestrzeganie harmonogramu',
  'Ochrona mebli i podłóg',
];

export default function Step5Conditions({ data, updateData }: Props) {
  const toggleProof = (item: string) => {
    const next = data.requiredProofs.includes(item)
      ? data.requiredProofs.filter(p => p !== item)
      : [...data.requiredProofs, item];
    updateData({ requiredProofs: next });
  };

  const toggleCondition = (item: string) => {
    const next = data.executionConditions.includes(item)
      ? data.executionConditions.filter(c => c !== item)
      : [...data.executionConditions, item];
    updateData({ executionConditions: next });
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.stepTitle}>Warunki wykonania</Text>
        <Text style={styles.stepDesc}>Odbiór, poprawki i terminy wypłaty.</Text>
      </View>

      {data.contractType === 'remont' && !data.hasAcceptanceProtocol && (
        <HintBox
          type="suggestion"
          message="Przy remoncie rekomendowane jest zdjęcie wykonanej pracy i protokół odbioru."
        />
      )}

      {data.correctionDays === 0 && (
        <HintBox type="suggestion" message="Brak terminu na poprawki – sugerujemy 7 dni roboczych." />
      )}

      <Section title="Protokół odbioru">
        <Toggle
          label="Wymagany protokół odbioru"
          value={data.hasAcceptanceProtocol}
          onToggle={() => updateData({ hasAcceptanceProtocol: !data.hasAcceptanceProtocol })}
          icon="📄"
        />
        {data.hasAcceptanceProtocol && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Obie strony podpisują protokół przed wypłatą depozytu.
            </Text>
          </View>
        )}
      </Section>

      <Section title="Terminy">
        <Field
          label="Termin na poprawki (dni robocze)"
          hint="0 = brak prawa do poprawek w ramach umowy"
        >
          <Input
            value={data.correctionDays > 0 ? String(data.correctionDays) : ''}
            onChangeText={v => updateData({ correctionDays: parseInt(v) || 0 })}
            placeholder="7"
            keyboardType="numeric"
          />
        </Field>
        <Field
          label="Termin wypłaty depozytu (dni od odbioru)"
          hint="Po ilu dniach środki trafiają do wykonawcy."
        >
          <Input
            value={data.paymentDeadlineDays > 0 ? String(data.paymentDeadlineDays) : ''}
            onChangeText={v => updateData({ paymentDeadlineDays: parseInt(v) || 0 })}
            placeholder="14"
            keyboardType="numeric"
          />
        </Field>
      </Section>

      <Section title="Wymagane dowody">
        {PROOF_OPTIONS.map(item => (
          <Toggle
            key={item}
            label={item}
            value={data.requiredProofs.includes(item)}
            onToggle={() => toggleProof(item)}
          />
        ))}
      </Section>

      <Section title="Warunki dodatkowe">
        {CONDITION_OPTIONS.map(item => (
          <Toggle
            key={item}
            label={item}
            value={data.executionConditions.includes(item)}
            onToggle={() => toggleCondition(item)}
          />
        ))}
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 24 },
  header: { marginBottom: 16 },
  stepTitle: { color: C.white, fontSize: 22, fontWeight: '800', marginBottom: 4 },
  stepDesc: { color: C.textSec, fontSize: 14, lineHeight: 20 },
  infoBox: {
    backgroundColor: C.purpleSubtle,
    borderRadius: C.radiusSm,
    padding: 10,
    marginTop: 8,
  },
  infoText: { color: C.textSec, fontSize: 12, lineHeight: 18 },
});
