import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ContractData, ContractType, ContractCategory, PricingMethod } from '../../../types/contract';
import { Section, ChipGroup, Field, Input } from '../components/FormField';
import { C } from '../../../theme';

interface Props {
  data: ContractData;
  updateData: (updates: Partial<ContractData>) => void;
}

const CONTRACT_TYPES: { value: ContractType; icon: string; label: string; desc: string }[] = [
  { value: 'remont',      icon: '🔨', label: 'Remont',      desc: 'Prace remontowe'     },
  { value: 'budowa',      icon: '🏗️', label: 'Budowa',      desc: 'Nowa konstrukcja'    },
  { value: 'instalacja',  icon: '⚡', label: 'Instalacja',  desc: 'Elektryka, wod-kan'  },
  { value: 'wykonczenie', icon: '🪟', label: 'Wykończenie', desc: 'Prace wykończeniowe'  },
  { value: 'inne',        icon: '📋', label: 'Inne',        desc: 'Pozostałe prace'     },
];

const CATEGORIES: { value: ContractCategory; label: string }[] = [
  { value: 'mieszkaniowy', label: '🏠 Mieszkaniowy' },
  { value: 'komercyjny',   label: '🏢 Komercyjny'   },
  { value: 'przemyslowy',  label: '🏭 Przemysłowy'  },
];

const PRICING_METHODS: { value: PricingMethod; label: string }[] = [
  { value: 'per_m2',    label: 'Za m²'     },
  { value: 'ryczalt',   label: 'Ryczałt'   },
  { value: 'godzinowy', label: 'Godzinowy' },
];

export default function Step1Basics({ data, updateData }: Props) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <View style={styles.heroIconWrap}>
          <Text style={styles.heroEmoji}>🛡️</Text>
        </View>
        <Text style={styles.heroTitle}>Nowa umowa</Text>
        <Text style={styles.heroSub}>Zabezpiecz każdą współpracę w 6 krokach</Text>
      </View>

      <Section title="Typ umowy">
        <View style={styles.typeGrid}>
          {CONTRACT_TYPES.map(t => {
            const active = data.contractType === t.value;
            return (
              <TouchableOpacity
                key={t.value}
                style={[styles.typeCard, active && styles.typeCardActive]}
                onPress={() => updateData({ contractType: t.value })}
                activeOpacity={0.75}
              >
                <Text style={styles.typeIcon}>{t.icon}</Text>
                <Text style={[styles.typeLabel, active && styles.typeLabelActive]}>{t.label}</Text>
                <Text style={styles.typeDesc}>{t.desc}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Section>

      <Section title="Kategoria obiektu">
        <ChipGroup
          options={CATEGORIES}
          selected={data.category}
          onSelect={v => updateData({ category: v as ContractCategory })}
        />
      </Section>

      <Section title="Sposób wyceny">
        <ChipGroup
          options={PRICING_METHODS}
          selected={data.pricingMethod}
          onSelect={v => updateData({ pricingMethod: v as PricingMethod })}
        />
        <Text style={styles.hint}>Możesz zmienić w kroku 3.</Text>
      </Section>

      <Section title="Termin realizacji">
        <Field label="Data zakończenia prac" hint="np. 30.06.2025">
          <Input
            value={data.deadline}
            onChangeText={v => updateData({ deadline: v })}
            placeholder="30.06.2025"
          />
        </Field>
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: C.bg },
  content: { padding: 16, paddingBottom: 24 },

  hero: {
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 4,
  },
  heroIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.purpleSubtle,
    borderWidth: 1.5,
    borderColor: C.purpleDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: C.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  heroEmoji: { fontSize: 28 },
  heroTitle: {
    color: C.white,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  heroSub: {
    color: C.textSec,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },

  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeCard: {
    width: '48%',
    backgroundColor: C.inputBg,
    borderRadius: C.radiusSm,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 3,
  },
  typeCardActive: {
    backgroundColor: C.purpleSubtle,
    borderColor: C.purple,
  },
  typeIcon: { fontSize: 22 },
  typeLabel: { color: C.textSec, fontSize: 13, fontWeight: '600' },
  typeLabelActive: { color: C.purpleLight },
  typeDesc: { color: C.textMuted, fontSize: 10, textAlign: 'center' },

  hint: { color: C.textMuted, fontSize: 11, marginTop: 6 },
});
