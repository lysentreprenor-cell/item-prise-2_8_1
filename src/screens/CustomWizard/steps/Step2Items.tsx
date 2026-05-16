import React, { useState } from 'react';
import {
  ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList,
} from 'react-native';
import { CustomContractData, LineItem, Unit, UNIT_LABELS, ALL_UNITS, lineTotal } from '../../../types/custom';
import { CATALOG, CatalogCategory, searchCatalog } from '../data/catalog';
import { formatCurrency } from '../../../utils/pricing';
import { C } from '../../../theme';

interface Props { data: CustomContractData; updateData: (u: Partial<CustomContractData>) => void; }

function UnitPicker({ value, onChange }: { value: Unit; onChange: (u: Unit) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TouchableOpacity style={up.btn} onPress={() => setOpen(true)} activeOpacity={0.8}>
        <Text style={up.btnText}>{UNIT_LABELS[value]} ▾</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={up.overlay} onPress={() => setOpen(false)} activeOpacity={1}>
          <View style={up.sheet}>
            <Text style={up.sheetTitle}>Wybierz jednostkę</Text>
            {ALL_UNITS.map(u => (
              <TouchableOpacity key={u} style={[up.row, value === u && up.rowActive]} onPress={() => { onChange(u); setOpen(false); }} activeOpacity={0.75}>
                <Text style={[up.rowText, value === u && up.rowTextActive]}>{UNIT_LABELS[u]}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

function ItemRow({ item, onUpdate, onRemove }: { item: LineItem; onUpdate: (i: LineItem) => void; onRemove: () => void }) {
  return (
    <View style={ir.card}>
      <View style={ir.top}>
        <Text style={ir.name} numberOfLines={1}>{item.name}</Text>
        <TouchableOpacity onPress={onRemove} style={ir.removeBtn}><Text style={ir.removeText}>✕</Text></TouchableOpacity>
      </View>
      <View style={ir.row}>
        <View style={ir.qtyWrap}>
          <Text style={ir.fieldLabel}>Ilość</Text>
          <TextInput
            style={ir.input}
            value={item.quantity > 0 ? String(item.quantity) : ''}
            onChangeText={v => onUpdate({ ...item, quantity: parseFloat(v) || 0 })}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={C.textMuted}
            selectionColor={C.purple}
          />
        </View>
        <View style={ir.unitWrap}>
          <Text style={ir.fieldLabel}>Jednostka</Text>
          <UnitPicker value={item.unit} onChange={u => onUpdate({ ...item, unit: u })} />
        </View>
        <View style={ir.priceWrap}>
          <Text style={ir.fieldLabel}>Cena / jedn. (PLN)</Text>
          <TextInput
            style={ir.input}
            value={item.unitPrice > 0 ? String(item.unitPrice) : ''}
            onChangeText={v => onUpdate({ ...item, unitPrice: parseFloat(v) || 0 })}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={C.textMuted}
            selectionColor={C.purple}
          />
        </View>
      </View>
      {lineTotal(item) > 0 && (
        <View style={ir.totalRow}>
          <Text style={ir.totalLabel}>Razem:</Text>
          <Text style={ir.totalValue}>{formatCurrency(lineTotal(item))}</Text>
        </View>
      )}
    </View>
  );
}

export default function Step2Items({ data, updateData }: Props) {
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState<string>(CATALOG[0].id);
  const [customName, setCustomName] = useState('');
  const [customUnit, setCustomUnit] = useState<Unit>('szt');

  const filteredCatalog = searchCatalog(search);
  const displayCat = search.trim()
    ? filteredCatalog
    : filteredCatalog.filter(c => c.id === activeCat);

  const addItem = (cat: CatalogCategory, ci: { id: string; name: string; defaultUnit: Unit }) => {
    const existing = data.items.find(i => i.id === ci.id);
    if (existing) {
      updateData({ items: data.items.map(i => i.id === ci.id ? { ...i, quantity: i.quantity + 1 } : i) });
    } else {
      const newItem: LineItem = { id: ci.id, category: cat.name, name: ci.name, unit: ci.defaultUnit, quantity: 1, unitPrice: 0 };
      updateData({ items: [...data.items, newItem] });
    }
  };

  const addCustomItem = () => {
    if (!customName.trim()) return;
    const newItem: LineItem = {
      id: `custom_${Date.now()}`,
      category: 'Własna',
      name: customName.trim(),
      unit: customUnit,
      quantity: 1,
      unitPrice: 0,
    };
    updateData({ items: [...data.items, newItem] });
    setCustomName('');
  };

  const updateItem = (updated: LineItem) => updateData({ items: data.items.map(i => i.id === updated.id ? updated : i) });
  const removeItem = (id: string) => updateData({ items: data.items.filter(i => i.id !== id) });

  const total = data.items.reduce((s, i) => s + lineTotal(i), 0);

  return (
    <ScrollView style={s.scroll} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <Text style={s.stepNum}>Krok 2</Text>
        <Text style={s.stepTitle}>Pozycje umowy</Text>
        <Text style={s.stepDesc}>Wybierz z katalogu lub dodaj własne pozycje.</Text>
      </View>

      {/* Selected items */}
      {data.items.length > 0 && (
        <View style={s.selectedSection}>
          <View style={s.selectedHeader}>
            <Text style={s.selectedTitle}>Wybrane pozycje ({data.items.length})</Text>
            {total > 0 && <Text style={s.selectedTotal}>{formatCurrency(total)}</Text>}
          </View>
          {data.items.map(item => (
            <ItemRow key={item.id} item={item} onUpdate={updateItem} onRemove={() => removeItem(item.id)} />
          ))}
        </View>
      )}

      {/* Search */}
      <View style={s.searchWrap}>
        <TextInput
          style={s.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Szukaj pozycji w katalogu…"
          placeholderTextColor={C.textMuted}
          selectionColor={C.purple}
        />
        {search.length > 0 && (
          <TouchableOpacity style={s.clearBtn} onPress={() => setSearch('')}><Text style={s.clearText}>✕</Text></TouchableOpacity>
        )}
      </View>

      {/* Category tabs */}
      {!search.trim() && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catScroll} contentContainerStyle={s.catContent}>
          {CATALOG.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[s.catChip, activeCat === cat.id && s.catChipActive]}
              onPress={() => setActiveCat(cat.id)}
              activeOpacity={0.75}
            >
              <Text style={s.catIcon}>{cat.icon}</Text>
              <Text style={[s.catLabel, activeCat === cat.id && s.catLabelActive]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Catalog items */}
      {displayCat.map(cat => (
        <View key={cat.id} style={s.catSection}>
          {search.trim() && <Text style={s.catSectionTitle}>{cat.icon} {cat.name}</Text>}
          {cat.items.map(ci => {
            const isAdded = data.items.some(i => i.id === ci.id);
            return (
              <TouchableOpacity key={ci.id} style={[s.catalogItem, isAdded && s.catalogItemAdded]} onPress={() => addItem(cat, ci)} activeOpacity={0.75}>
                <View style={s.catalogItemLeft}>
                  <Text style={s.catalogItemName}>{ci.name}</Text>
                  <Text style={s.catalogItemUnit}>{UNIT_LABELS[ci.defaultUnit]}</Text>
                </View>
                <View style={[s.addBtn, isAdded && s.addBtnAdded]}>
                  <Text style={[s.addBtnText, isAdded && s.addBtnTextAdded]}>{isAdded ? '✓' : '+'}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {/* Custom item */}
      <View style={s.customSection}>
        <Text style={s.customTitle}>➕ Własna pozycja</Text>
        <TextInput
          style={s.customInput}
          value={customName}
          onChangeText={setCustomName}
          placeholder="Nazwa pozycji…"
          placeholderTextColor={C.textMuted}
          selectionColor={C.purple}
        />
        <View style={s.customRow}>
          <View style={s.customUnitWrap}>
            <Text style={s.fieldLabel}>Jednostka</Text>
            <UnitPicker value={customUnit} onChange={setCustomUnit} />
          </View>
          <TouchableOpacity style={[s.customAddBtn, !customName.trim() && s.customAddBtnDisabled]} onPress={addCustomItem} disabled={!customName.trim()} activeOpacity={0.8}>
            <Text style={s.customAddBtnText}>Dodaj</Text>
          </TouchableOpacity>
        </View>
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
  selectedSection: { marginBottom: 16 },
  selectedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  selectedTitle: { color: C.purpleLight, fontSize: 12, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
  selectedTotal: { color: C.white, fontSize: 14, fontWeight: '800' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.border, borderRadius: C.radiusSm, marginBottom: 12 },
  searchInput: { flex: 1, color: C.white, padding: 12, fontSize: 14 },
  clearBtn: { padding: 12 },
  clearText: { color: C.textMuted, fontSize: 14 },
  catScroll: { marginBottom: 12 },
  catContent: { gap: 8, paddingRight: 8 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.cardAlt, borderWidth: 1, borderColor: C.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  catChipActive: { backgroundColor: C.purpleDim, borderColor: C.purple },
  catIcon: { fontSize: 14 },
  catLabel: { color: C.textSec, fontSize: 12, fontWeight: '500' },
  catLabelActive: { color: C.purpleLight, fontWeight: '700' },
  catSection: { marginBottom: 8 },
  catSectionTitle: { color: C.purpleLight, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  catalogItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: C.radiusSm, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 6 },
  catalogItemAdded: { borderColor: C.purple, backgroundColor: C.purpleSubtle },
  catalogItemLeft: { flex: 1 },
  catalogItemName: { color: C.white, fontSize: 13, fontWeight: '500' },
  catalogItemUnit: { color: C.textMuted, fontSize: 11, marginTop: 2 },
  addBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: C.purple, alignItems: 'center', justifyContent: 'center' },
  addBtnAdded: { backgroundColor: C.purpleDim },
  addBtnText: { color: C.white, fontSize: 18, fontWeight: '300', lineHeight: 24 },
  addBtnTextAdded: { fontSize: 14, fontWeight: '700' },
  customSection: { backgroundColor: C.card, borderRadius: C.radius, borderWidth: 1, borderColor: C.border, padding: 16, marginTop: 8 },
  customTitle: { color: C.purpleLight, fontSize: 12, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 },
  customInput: { backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.border, borderRadius: C.radiusSm, color: C.white, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 10 },
  customRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-end' },
  customUnitWrap: { flex: 1 },
  fieldLabel: { color: C.textSec, fontSize: 12, marginBottom: 6 },
  customAddBtn: { backgroundColor: C.purple, borderRadius: C.radiusSm, paddingHorizontal: 20, paddingVertical: 11 },
  customAddBtnDisabled: { opacity: 0.4 },
  customAddBtnText: { color: C.white, fontSize: 14, fontWeight: '700' },
});

const up = StyleSheet.create({
  btn: { backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.border, borderRadius: C.radiusSm, paddingHorizontal: 10, paddingVertical: 9 },
  btnText: { color: C.purpleLight, fontSize: 13, fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  sheet: { backgroundColor: C.card, borderRadius: C.radius, padding: 16, width: 260, borderWidth: 1, borderColor: C.border },
  sheetTitle: { color: C.white, fontSize: 14, fontWeight: '700', marginBottom: 12 },
  row: { paddingVertical: 10, paddingHorizontal: 8, borderRadius: C.radiusSm },
  rowActive: { backgroundColor: C.purpleSubtle },
  rowText: { color: C.textSec, fontSize: 14 },
  rowTextActive: { color: C.purpleLight, fontWeight: '700' },
});

const ir = StyleSheet.create({
  card: { backgroundColor: C.cardAlt, borderRadius: C.radiusSm, borderWidth: 1, borderColor: C.border, padding: 12, marginBottom: 8 },
  top: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  name: { flex: 1, color: C.white, fontSize: 13, fontWeight: '600' },
  removeBtn: { padding: 4 },
  removeText: { color: C.error, fontSize: 13 },
  row: { flexDirection: 'row', gap: 8 },
  qtyWrap: { flex: 1 },
  unitWrap: { flex: 1 },
  priceWrap: { flex: 1.4 },
  fieldLabel: { color: C.textMuted, fontSize: 10, marginBottom: 4 },
  input: { backgroundColor: C.inputBg, borderWidth: 1, borderColor: C.border, borderRadius: C.radiusSm, color: C.white, paddingHorizontal: 8, paddingVertical: 8, fontSize: 13 },
  totalRow: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: C.border },
  totalLabel: { color: C.textMuted, fontSize: 12 },
  totalValue: { color: C.purpleLight, fontSize: 14, fontWeight: '700' },
});
