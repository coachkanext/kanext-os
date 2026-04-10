import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Switch,
  Alert,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { RolePill } from '@/components/ui/role-pill';
import { useColors } from '@/hooks/use-colors';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { openSidePanel } from '@/utils/global-side-panel';
import { useDemoRole } from '@/utils/demo-role-store';
import { resetFooter } from '@/utils/global-footer-hide';
import { useScrollFooter } from '@/hooks/use-scroll-footer';
import { useOwnerGuard } from '@/hooks/use-owner-guard';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Category {
  id: string;
  name: string;
  color: string;
  visible: boolean;
  eventCount: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PERSONAL_CATEGORIES: Category[] = [
  { id: 'cat1', name: 'Content',   color: '#1A1714', visible: true, eventCount: 14 },
  { id: 'cat2', name: 'Meetings',  color: '#E0DBD4', visible: true, eventCount: 8  },
  { id: 'cat3', name: 'Deadlines', color: '#B8943E', visible: true, eventCount: 3  },
  { id: 'cat4', name: 'Personal',  color: '#9C9790', visible: true, eventCount: 6  },
  { id: 'cat5', name: 'Bookings',  color: '#5A8A6E', visible: true, eventCount: 5  },
];

const PALETTE = [
  { label: 'Carbon',  hex: '#1A1714' },
  { label: 'Mist',    hex: '#E0DBD4' },
  { label: 'Caution', hex: '#B8943E' },
  { label: 'Drift',   hex: '#9C9790' },
  { label: 'Gain',    hex: '#5A8A6E' },
  { label: 'Heat',    hex: '#B85C5C' },
  { label: 'Ember',   hex: '#8B2500' },
];

// ---------------------------------------------------------------------------
// Helper — blank category template
// ---------------------------------------------------------------------------

function blankCategory(): Category {
  return {
    id: `cat-${Date.now()}`,
    name: '',
    color: PALETTE[0].hex,
    visible: true,
    eventCount: 0,
  };
}

// ---------------------------------------------------------------------------
// Sub-component — Color swatch row
// ---------------------------------------------------------------------------

interface ColorPickerProps {
  selected: string;
  onChange: (hex: string) => void;
}

function ColorPicker({ selected, onChange }: ColorPickerProps) {
  const C = useColors();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.swatchRow}
    >
      {PALETTE.map((p) => {
        const isSelected = selected === p.hex;
        return (
          <Pressable
            key={p.hex}
            onPress={() => onChange(p.hex)}
            style={[
              styles.swatch,
              { backgroundColor: p.hex },
              isSelected && { borderWidth: 3, borderColor: C.label },
            ]}
            accessibilityLabel={p.label}
          >
            {isSelected && (
              <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ---------------------------------------------------------------------------
// Sub-component — Category Sheet (shared by Edit and Create)
// ---------------------------------------------------------------------------

interface CategorySheetProps {
  visible: boolean;
  category: Category;
  isEdit: boolean;
  onSave: (cat: Category) => void;
  onDelete?: () => void;
  onClose: () => void;
}

function CategorySheet({
  visible,
  category,
  isEdit,
  onSave,
  onDelete,
  onClose,
}: CategorySheetProps) {
  const C = useColors();
  const [draft, setDraft] = useState<Category>(category);

  React.useEffect(() => {
    setDraft(category);
  }, [category]);

  function handleSave() {
    if (!draft.name.trim()) {
      Alert.alert('Name required', 'Please enter a category name.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSave(draft);
  }

  function handleDelete() {
    Alert.alert(
      'Delete category?',
      'Events in this category will become uncategorized.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            onDelete?.();
          },
        },
      ],
    );
  }

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      snapPoints={['50%', '90%']}
      useModal
    >
      <ScrollView
        contentContainerStyle={styles.sheetContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sheetTitle, { color: C.label }]}>
          {isEdit ? 'Edit Category' : 'New Category'}
        </Text>

        <Text style={[styles.fieldLabel, { color: C.secondary }]}>Name</Text>
        <View style={[styles.inputWrap, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <TextInput
            value={draft.name}
            onChangeText={(t) => setDraft((d) => ({ ...d, name: t }))}
            placeholder="Category name"
            placeholderTextColor={C.muted}
            style={[styles.nameInput, { color: C.label }]}
            returnKeyType="done"
            autoFocus={!isEdit}
          />
        </View>

        <Text style={[styles.fieldLabel, { color: C.secondary }]}>Color</Text>
        <ColorPicker
          selected={draft.color}
          onChange={(hex) => setDraft((d) => ({ ...d, color: hex }))}
        />

        <View style={[styles.toggleRow, { borderColor: C.separator }]}>
          <Text style={[styles.toggleLabel, { color: C.label }]}>Show on Calendar</Text>
          <Switch
            value={draft.visible}
            onValueChange={(v) => setDraft((d) => ({ ...d, visible: v }))}
            trackColor={{ false: C.separator, true: C.label }}
            thumbColor={C.bg}
          />
        </View>

        <Pressable
          onPress={handleSave}
          style={[styles.saveBtn, { backgroundColor: C.activePill }]}
        >
          <Text style={[styles.saveBtnText, { color: C.activePillText }]}>Save</Text>
        </Pressable>

        {isEdit && (
          <Pressable
            onPress={handleDelete}
            style={[styles.deleteBtn, { borderColor: '#B85C5C' }]}
          >
            <Text style={[styles.deleteBtnText, { color: '#B85C5C' }]}>Delete Category</Text>
          </Pressable>
        )}
      </ScrollView>
    </BottomSheet>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function CategoriesScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const [role, cycleRole, roleCycles] = useDemoRole('personal:agenda');
  const isOwner = role === roleCycles[0];
  const guardedCycle = useOwnerGuard(role, roleCycles, cycleRole, '/(tabs)/(main)/agenda');

  const [categories, setCategories] = useState<Category[]>(PERSONAL_CATEGORIES);
  const [editCat, setEditCat]         = useState<Category | null>(null);
  const [showCreate, setShowCreate]   = useState(false);
  const [createDraft, setCreateDraft] = useState<Category>(blankCategory());

  useFocusEffect(
    useCallback(() => {
      resetFooter();
    }, []),
  );

  const scrollFooter = useScrollFooter();

  function handleCardPress(cat: Category) {
    Haptics.selectionAsync();
    setEditCat(cat);
  }

  function handleSaveEdit(updated: Category) {
    setCategories((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c)),
    );
    setEditCat(null);
  }

  function handleDeleteEdit() {
    if (!editCat) return;
    setCategories((prev) => prev.filter((c) => c.id !== editCat.id));
    setEditCat(null);
  }

  function handleOpenCreate() {
    Haptics.selectionAsync();
    setCreateDraft(blankCategory());
    setShowCreate(true);
  }

  function handleSaveCreate(cat: Category) {
    setCategories((prev) => [...prev, cat]);
    setShowCreate(false);
  }

  return (
    <View style={[styles.root, { backgroundColor: C.bg, paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => openSidePanel()} hitSlop={8} style={styles.topBarSide}>
          <KMenuButton />
        </Pressable>

        <View style={[styles.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <Text style={[styles.titlePillText, { color: C.label }]}>Categories</Text>
        </View>

        <View style={{ minWidth: 44, alignItems: 'flex-end', justifyContent: 'center' }}>
          <RolePill role={role} onPress={guardedCycle} isPrimary={isOwner} />
        </View>
      </View>

      {/* Category list */}
      <ScrollView
        {...scrollFooter}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {categories.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: C.secondary }]}>
              No categories. Tap + to create one.
            </Text>
          </View>
        ) : (
          categories.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => handleCardPress(cat)}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: pressed ? C.surfacePressed : C.surface },
              ]}
            >
              <View style={[styles.colorDot, { backgroundColor: cat.color }]} />
              <Text style={[styles.catName, { color: C.label }]}>{cat.name}</Text>
              <View style={styles.cardRight}>
                <Text style={[styles.countText, { color: C.secondary }]}>
                  {cat.eventCount} this month
                </Text>
                <IconSymbol name="chevron.right" size={13} color={C.muted} />
              </View>
            </Pressable>
          ))
        )}

        <Pressable
          onPress={handleOpenCreate}
          style={[styles.addCard, { borderColor: C.separator }]}
        >
          <IconSymbol name="plus" size={15} color={C.secondary} />
          <Text style={[styles.addCardText, { color: C.secondary }]}>Add Category</Text>
        </Pressable>
      </ScrollView>

      {editCat && (
        <CategorySheet
          visible={!!editCat}
          category={editCat}
          isEdit
          onSave={handleSaveEdit}
          onDelete={handleDeleteEdit}
          onClose={() => setEditCat(null)}
        />
      )}

      <CategorySheet
        visible={showCreate}
        category={createDraft}
        isEdit={false}
        onSave={handleSaveCreate}
        onClose={() => setShowCreate(false)}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  root: { flex: 1 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  topBarSide: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titlePill: {
    flex: 1,
    marginHorizontal: 10,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titlePillText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.1,
  },

  listContent: { paddingTop: 8 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 12,
  },
  catName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countText: { fontSize: 13 },

  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 4,
    padding: 14,
  },
  addCardText: {
    fontSize: 15,
    fontWeight: '500',
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: { fontSize: 15 },

  sheetContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    marginTop: 8,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 16,
  },
  inputWrap: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 2,
  },
  nameInput: {
    fontSize: 16,
    height: 44,
  },

  swatchRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '500',
  },

  saveBtn: {
    marginTop: 28,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },

  deleteBtn: {
    marginTop: 10,
    borderRadius: 12,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  deleteBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
