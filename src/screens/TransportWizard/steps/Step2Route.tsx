import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { TransportContractData } from '../../../types/transport';
import { Section, Field, Input, HintBox } from '../../ContractWizard/components/FormField';
import { C } from '../../../theme';

interface Props { data: TransportContractData; updateData: (updates: Partial<TransportContractData>) => void; }

export default function Step2Route({ data, updateData }: Props) {
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.stepNum}>Krok 2</Text>
        <Text style={styles.stepTitle}>Trasa</Text>
        <Text style={styles.stepDesc}>Podaj punkt odbioru, dostawy i odległość.</Text>
      </View>
      <Section title="Adresy">
        <Field label="Skąd">
          <Input value={data.fromAddress} onChangeText={v => updateData({ fromAddress: v })} placeholder="Adres odbioru" />
        </Field>
        <Field label="Dokąd">
          <Input value={data.toAddress} onChangeText={v => updateData({ toAddress: v })} placeholder="Adres dostawy" />
        </Field>
      </Section>
      <Section title="Dystans">
        <HintBox type="info" message="Dystans zostanie użyty do obliczenia ceny za km" />
        <Field label="Dystans (km)">
          <Input value={data.distanceKm > 0 ? String(data.distanceKm) : ''} onChangeText={v => updateData({ distanceKm: parseFloat(v) || 0 })} placeholder="0" keyboardType="decimal-pad" />
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
