import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TransportContractData } from '../../../types/transport';
import { Section, Field, Input, Toggle } from '../../ContractWizard/components/FormField';
import { C } from '../../../theme';

interface Props { data: TransportContractData; updateData: (updates: Partial<TransportContractData>) => void; }

const SPECIAL_REQUIREMENTS = ['Kruchy', 'Materiały niebezpieczne', 'Chłodnia', 'Ponadgabarytowy', 'Żywe zwierzęta'];

export default function Step3Cargo({ data, updateData }: Props) {
  const toggleRequirement = (item: string) => updateData({ specialRequirements: data.specialRequirements.includes(item) ? data.specialRequirements.filter(r => r !== item) : [...data.specialRequirements, item] });
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.stepNum}>Krok 3</Text>
        <Text style={styles.stepTitle}>Ładunek</Text>
        <Text style={styles.stepDesc}>Opisz ładunek, wagę i specjalne wymagania.</Text>
      </View>
      <Section title="Opis ładunku">
        <Field label="Opis ładunku">
          <Input value={data.cargoDescription} onChangeText={v => updateData({ cargoDescription: v })} placeholder="Opisz przewożony ładunek..." multiline />
        </Field>
        <Field label="Waga (kg)">
          <Input value={data.cargoWeightKg > 0 ? String(data.cargoWeightKg) : ''} onChangeText={v => updateData({ cargoWeightKg: parseFloat(v) || 0 })} placeholder="0" keyboardType="numeric" />
        </Field>
      </Section>
      <Section title="Specjalne wymagania">
        <View style={styles.chipsRow}>
          {SPECIAL_REQUIREMENTS.map(item => {
            const isActive = data.specialRequirements.includes(item);
            return (
              <TouchableOpacity key={item} style={[styles.chip, isActive && styles.chipActive]} onPress={() => toggleRequirement(item)} activeOpacity={0.75}>
                <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{item}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Section>
      <Section title="Ubezpieczenie">
        <Toggle label="Ubezpieczenie ładunku" value={data.hasInsurance} onToggle={() => updateData({ hasInsurance: !data.hasInsurance })} icon="🛡" />
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
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: C.cardAlt, borderWidth: 1, borderColor: C.border },
  chipActive: { backgroundColor: C.purpleDim, borderColor: C.purple },
  chipText: { color: C.textSec, fontSize: 13, fontWeight: '500' },
  chipTextActive: { color: C.purpleLight, fontWeight: '700' },
});
