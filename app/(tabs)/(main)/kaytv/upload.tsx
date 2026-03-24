/**
 * KayTV Upload — upload form with RBAC gate, category pills, visibility toggle.
 * fullScreenModal presentation (set in _layout.tsx).
 * No real processing — shows success state after 1.5s spinner.
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useAppContext } from '@/context/app-context';
import { KAYTV_CATEGORIES } from '@/data/mock-kaytv';

export default function KayTVUploadScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state } = useAppContext();
  const mode = state.activeContext.mode as string;
  const canUpload = mode !== 'personal';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [visibility, setVisibility] = useState<'brand' | 'explore'>('brand');
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  const rawCategories = KAYTV_CATEGORIES[mode] ?? KAYTV_CATEGORIES.sports;
  const categories = rawCategories.filter(c => c !== 'All');

  const handleUpload = useCallback(() => {
    if (!title.trim() || uploading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setUploaded(true);
    }, 1500);
  }, [title, uploading]);

  // RBAC gate
  if (!canUpload) {
    return (
      <View style={[styles.screen, { backgroundColor: C.bg }]}>
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.closeBtn}>
            <IconSymbol name="xmark" size={18} color={C.label} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: C.label }]}>Upload to KayTV</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.centeredView}>
          <IconSymbol name="lock" size={40} color={C.muted} />
          <Text style={[styles.restrictedTitle, { color: C.label }]}>Upload access restricted</Text>
          <Text style={[styles.restrictedSub, { color: C.secondary }]}>
            Switch to a brand mode to upload videos.
          </Text>
        </View>
      </View>
    );
  }

  // Success state
  if (uploaded) {
    return (
      <View style={[styles.screen, { backgroundColor: C.bg }]}>
        <View style={styles.centeredView}>
          <View style={[styles.successIcon, { backgroundColor: C.green + '22' }]}>
            <IconSymbol name="checkmark" size={32} color={C.green} />
          </View>
          <Text style={[styles.successTitle, { color: C.label }]}>Uploaded!</Text>
          <Text style={[styles.successSub, { color: C.secondary }]}>
            Your video is being processed and will be available shortly.
          </Text>
          <Pressable
            style={[styles.doneBtn, { backgroundColor: C.label }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.doneBtnText, { color: C.bg }]}>Done</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: C.bg }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.closeBtn}>
          <IconSymbol name="xmark" size={18} color={C.label} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: C.label }]}>Upload to KayTV</Text>
        <Pressable
          style={[
            styles.uploadBtn,
            { backgroundColor: title.trim() ? C.label : C.surface },
          ]}
          onPress={handleUpload}
          disabled={!title.trim() || uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color={C.bg} />
          ) : (
            <Text style={[styles.uploadBtnText, { color: title.trim() ? C.bg : C.muted }]}>
              Upload
            </Text>
          )}
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Source row */}
        <View style={styles.sourceRow}>
          <Pressable
            style={[styles.sourceBtn, { backgroundColor: C.surface }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Text style={styles.sourceIcon}>📷</Text>
            <Text style={[styles.sourceBtnText, { color: C.label }]}>Camera Roll</Text>
          </Pressable>
          <Pressable
            style={[styles.sourceBtn, { backgroundColor: C.surface }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Text style={styles.sourceIcon}>🎥</Text>
            <Text style={[styles.sourceBtnText, { color: C.label }]}>Record New</Text>
          </Pressable>
        </View>

        {/* Thumbnail placeholder */}
        <View style={styles.thumbWrap}>
          <View style={[styles.thumbPlaceholder, { backgroundColor: C.surface }]}>
            <Text style={{ fontSize: 40 }}>🎬</Text>
          </View>
          <Pressable
            style={[styles.thumbEdit, { backgroundColor: C.surface, borderColor: C.inputBorder }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="pencil" size={13} color={C.label} />
          </Pressable>
        </View>

        {/* Title */}
        <View style={[styles.inputRow, { borderBottomColor: C.separator }]}>
          <TextInput
            style={[styles.titleInput, { color: C.label }]}
            placeholder="Title"
            placeholderTextColor={C.muted}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>

        {/* Description */}
        <View style={[styles.inputRow, { borderBottomColor: C.separator }]}>
          <TextInput
            style={[styles.descInput, { color: C.label }]}
            placeholder="Description (optional)"
            placeholderTextColor={C.muted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={500}
            textAlignVertical="top"
          />
        </View>

        {/* Category */}
        <View style={styles.formSection}>
          <Text style={[styles.formLabel, { color: C.label }]}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 4 }}
          >
            {categories.map(cat => {
              const active = cat === selectedCategory;
              return (
                <Pressable
                  key={cat}
                  style={[
                    styles.pill,
                    active ? { backgroundColor: C.label } : { borderColor: C.separator },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedCategory(active ? '' : cat);
                  }}
                >
                  <Text style={[
                    styles.pillText,
                    { color: active ? C.bg : C.secondary },
                    active && { fontWeight: '600' },
                  ]}>
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Visibility */}
        <View style={styles.formSection}>
          <Text style={[styles.formLabel, { color: C.label }]}>Visibility</Text>
          <Pressable
            style={styles.visibilityOption}
            onPress={() => setVisibility('brand')}
          >
            <View style={[
              styles.radio,
              { borderColor: visibility === 'brand' ? C.label : C.separator },
              visibility === 'brand' && { backgroundColor: C.label },
            ]}>
              {visibility === 'brand' ? (
                <View style={[styles.radioDot, { backgroundColor: C.bg }]} />
              ) : null}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.visibilityTitle, { color: C.label }]}>Brand Only</Text>
              <Text style={[styles.visibilitySub, { color: C.secondary }]}>
                Only visible to your organization
              </Text>
            </View>
          </Pressable>
          <Pressable
            style={styles.visibilityOption}
            onPress={() => setVisibility('explore')}
          >
            <View style={[
              styles.radio,
              { borderColor: visibility === 'explore' ? C.label : C.separator },
              visibility === 'explore' && { backgroundColor: C.label },
            ]}>
              {visibility === 'explore' ? (
                <View style={[styles.radioDot, { backgroundColor: C.bg }]} />
              ) : null}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.visibilityTitle, { color: C.label }]}>Explore-eligible</Text>
              <Text style={[styles.visibilitySub, { color: C.secondary }]}>
                Can appear in Explore for all users
              </Text>
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
  },
  closeBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '600', textAlign: 'center' },
  uploadBtn: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, minWidth: 70,
    alignItems: 'center', justifyContent: 'center',
  },
  uploadBtnText: { fontSize: 14, fontWeight: '600' },

  // Source row
  sourceRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  sourceBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 12,
  },
  sourceIcon: { fontSize: 20 },
  sourceBtnText: { fontSize: 14, fontWeight: '500' },

  // Thumbnail
  thumbWrap: {
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    position: 'relative',
  },
  thumbPlaceholder: {
    width: '100%', height: 180,
    borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  thumbEdit: {
    position: 'absolute', bottom: 10, right: 10,
    width: 30, height: 30, borderRadius: 15,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },

  // Inputs
  inputRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  titleInput: { fontSize: 15, paddingVertical: 10, minHeight: 44 },
  descInput: { fontSize: 14, paddingVertical: 10, minHeight: 80, lineHeight: 20 },

  // Form sections
  formSection: { paddingTop: 20, paddingBottom: 4 },
  formLabel: { fontSize: 13, fontWeight: '600', paddingHorizontal: 16, marginBottom: 8 },

  pill: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5,
  },
  pillText: { fontSize: 13 },

  // Visibility
  visibilityOption: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 16, paddingVertical: 12, gap: 14,
  },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 1, flexShrink: 0,
  },
  radioDot: { width: 8, height: 8, borderRadius: 4 },
  visibilityTitle: { fontSize: 14, fontWeight: '500' },
  visibilitySub: { fontSize: 12, marginTop: 2 },

  // Centered views (restricted / success)
  centeredView: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 12, paddingHorizontal: 40, paddingBottom: 60,
  },
  restrictedTitle: { fontSize: 17, fontWeight: '600', textAlign: 'center' },
  restrictedSub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

  successIcon: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: 'center', justifyContent: 'center',
  },
  successTitle: { fontSize: 22, fontWeight: '700' },
  successSub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  doneBtn: {
    marginTop: 8, paddingHorizontal: 40,
    paddingVertical: 14, borderRadius: 28,
  },
  doneBtnText: { fontSize: 15, fontWeight: '600' },
});
