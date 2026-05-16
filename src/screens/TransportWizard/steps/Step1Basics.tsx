import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { TransportContractData } from '../../../types/transport';
import { Section, Field, Input } from '../../ContractWizard/components/FormField';
import { C } from '../../../theme';

interface Props { data: TransportContractData; updateData: (updates: Partial<TransportContractData>) => void; }

export default function Step1Basics({ data, updateData }: Props) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.stepNum}>Krok 1</Text>
        <Text style={styles.stepTitle}>Podstawy transportu</Text>
        <Text style={styles.stepDesc}>Podaj tytuł, przewoźnika i datę transportu.</Text>
      </View>
      <Section title="Dane podstawowe">
        <Field label="Tytuł">
          <Input value={data.title} onChangeText={v => updateData({ title: v })} placeholder="np. Przeprowadzka Warszawa-Kraków" />
        </Field>
      </Section>
      <Section title="Wykonawca / Przewoźnik">
        <Field label="Przewoźnik">
          <Input value={data.executorSearch} onChangeText={v => updateData({ executorSearch: v })} placeholder="Szukaj po imieniu lub e-mailu" />
        </Field>
      </Section>
      <Section title="Termin">
        <Field label="Data transportu" hint="Format: RRRR-MM-DD">
          <Input value={data.deadline} onChangeText={v => updateData({ deadline: v })} placeholder="np. 2024-06-30" />
        </Field>
      </Section>
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
});
