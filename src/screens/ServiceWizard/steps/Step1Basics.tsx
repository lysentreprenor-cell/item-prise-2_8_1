import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { ServiceContractData } from '../../../types/service';
import { Section, Field, Input } from '../../ContractWizard/components/FormField';
import { C } from '../../../theme';

interface Props { data: ServiceContractData; updateData: (updates: Partial<ServiceContractData>) => void; }

export default function Step1Basics({ data, updateData }: Props) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.stepNum}>Krok 1 / Podstawy usługi</Text>
        <Text style={styles.stepTitle}>Podstawy usługi</Text>
        <Text style={styles.stepDesc}>Opisz usługę, wskaż wykonawcę i termin realizacji.</Text>
      </View>
      <Section title="Informacje ogólne">
        <Field label="Tytuł">
          <Input value={data.title} onChangeText={v => updateData({ title: v })} placeholder="np. Sprzątanie mieszkania" />
        </Field>
        <Field label="Opis">
          <Input value={data.description} onChangeText={v => updateData({ description: v })} placeholder="Opisz zakres usługi..." multiline />
        </Field>
      </Section>
      <Section title="Wykonawca">
        <Field label="Wykonawca">
          <Input value={data.executorSearch} onChangeText={v => updateData({ executorSearch: v })} placeholder="Szukaj po imieniu lub e-mailu" />
        </Field>
      </Section>
      <Section title="Termin realizacji">
        <Field label="Termin" hint="Format: RRRR-MM-DD">
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
