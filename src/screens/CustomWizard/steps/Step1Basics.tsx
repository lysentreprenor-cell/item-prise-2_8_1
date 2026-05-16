import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { CustomContractData } from '../../../types/custom';
import { Section, Field, Input } from '../../ContractWizard/components/FormField';
import { C } from '../../../theme';

interface Props { data: CustomContractData; updateData: (u: Partial<CustomContractData>) => void; }

export default function Step1Basics({ data, updateData }: Props) {
  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <Text style={s.stepNum}>Krok 1</Text>
        <Text style={s.stepTitle}>Podstawy umowy</Text>
        <Text style={s.stepDesc}>Podaj tytuł, strony i termin realizacji.</Text>
      </View>
      <Section title="Dane umowy">
        <Field label="Tytuł umowy">
          <Input value={data.title} onChangeText={v => updateData({ title: v })} placeholder="Np. Budowa chodnika przy posesji" />
        </Field>
        <Field label="Opis / uwagi">
          <Input value={data.description} onChangeText={v => updateData({ description: v })} placeholder="Dodatkowe informacje, wymagania…" multiline />
        </Field>
      </Section>
      <Section title="Wykonawca">
        <Field label="Szukaj wykonawcy">
          <Input value={data.executorSearch} onChangeText={v => updateData({ executorSearch: v })} placeholder="Imię, e-mail lub nazwa użytkownika" />
        </Field>
      </Section>
      <Section title="Termin">
        <Field label="Data zakończenia prac" hint="Format: RRRR-MM-DD">
          <Input value={data.deadline} onChangeText={v => updateData({ deadline: v })} placeholder="np. 2025-09-30" />
        </Field>
      </Section>
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
});
