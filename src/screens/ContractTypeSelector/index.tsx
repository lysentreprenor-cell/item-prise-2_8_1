import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { C } from '../../theme';

type ContractTypeKey = 'remont' | 'usluga' | 'transport' | 'sprzedaz' | 'wlasna';

interface Props { onSelect: (type: ContractTypeKey) => void; }

const CONTRACT_TYPES: { type: ContractTypeKey; icon: string; name: string; desc: string; accent?: boolean }[] = [
  { type: 'remont', icon: '🔨', name: 'Remont', desc: 'Prace budowlane, wykończenie, instalacje' },
  { type: 'usluga', icon: '🛎', name: 'Usługa', desc: 'Sprzątanie, opieka, korepetycje i inne' },
  { type: 'transport', icon: '🚛', name: 'Transport', desc: 'Przewóz towaru, przeprowadzki, kurierzy' },
  { type: 'sprzedaz', icon: '🏷', name: 'Sprzedaż', desc: 'Sprzedaż rzeczy, towaru lub mienia' },
  { type: 'wlasna', icon: '⚙️', name: 'Własna umowa', desc: 'Zbuduj umowę z własnego katalogu pozycji – m, m², szt., godz. i więcej', accent: true },
];

export default function ContractTypeSelector({ onSelect }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" backgroundColor={C.bg} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Nowa umowa</Text>
          <Text style={styles.subtitle}>Wybierz rodzaj umowy</Text>
        </View>
        <View style={styles.grid}>
          {CONTRACT_TYPES.map(item => (
            <TouchableOpacity key={item.type} style={[styles.card, item.accent && styles.cardAccent, item.type === 'wlasna' && styles.cardFull]} onPress={() => onSelect(item.type)} activeOpacity={0.8}>
              <Text style={styles.cardIcon}>{item.icon}</Text>
              <Text style={[styles.cardName, item.accent && styles.cardNameAccent]}>{item.name}</Text>
              <Text style={styles.cardDesc}>{item.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 32 },
  header: { marginBottom: 28, marginTop: 8 },
  title: { color: C.white, fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { color: C.textSec, fontSize: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '48%', backgroundColor: C.card, borderRadius: C.radius, borderWidth: 1, borderColor: C.border, padding: 20, alignItems: 'flex-start' },
  cardAccent: { backgroundColor: C.purpleSubtle, borderColor: C.purple },
  cardFull: { width: '100%' },
  cardIcon: { fontSize: 32, marginBottom: 12 },
  cardName: { color: C.white, fontSize: 18, fontWeight: '700', marginBottom: 6 },
  cardNameAccent: { color: C.purpleLight },
  cardDesc: { color: C.textSec, fontSize: 12, lineHeight: 17 },
});
