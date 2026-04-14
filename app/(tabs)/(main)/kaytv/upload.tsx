/**
 * KayTV Upload — upload form with RBAC gate, category pills, visibility toggle.
 * fullScreenModal presentation (set in _layout.tsx).
 * No real processing — shows success state after 1.5s spinner.
 */

import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView,
  StyleSheet, ActivityIndicator, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { useAppContext } from '@/context/app-context';
import { useDemoRole } from '@/utils/demo-role-store';

const PERSONAL_CATEGORIES = ['Coaching', 'Business', 'Creator', 'Behind the Scenes', 'Q&A', 'Live'];

const GAIN = '#5A8A6E';

export default function KayTVUploadScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state } = useAppContext();
  const mode = state.activeContext.mode as string;
  const [role, , roleCycles] = useDemoRole('personal:kaytv');
  const isOwner = role === roleCycles[0];
  // Personal mode: only owners can upload. Other modes: all admins can.
  const canUpload = mode === 'personal' ? isOwner : mode !== 'personal';

  const TOP_BAR_H = insets.top + 54;

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<'public' | 'subscribers' | 'tier'>('public');
  const [selectedSeries, setSelectedSeries] = useState('None');
  const [scheduled, setScheduled] = useState(false);
  const [commentsOn, setCommentsOn] = useState(true);
  const [tipsOn, setTipsOn] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

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
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }} hitSlop={10} style={styles.closeBtn}>
            <IconSymbol name="xmark" size={18} color={C.label} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: C.label }]}>Upload to KTV</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.centeredView}>
          <IconSymbol name="lock" size={40} color={C.secondary} />
          <Text style={[styles.restrictedTitle, { color: C.label }]}>Upload access restricted</Text>
          <Text style={[styles.restrictedSub, { color: C.secondary }]}>
            {mode === 'personal' ? 'Switch to Owner mode to upload videos.' : 'Switch to a brand mode to upload videos.'}
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
          <View style={[styles.successIcon, { backgroundColor: GAIN + '22' }]}>
            <IconSymbol name="checkmark" size={32} color={GAIN} />
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
      <Animated.View style={{ backgroundColor: C.bg, paddingTop: insets.top, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, opacity }}>
        <View style={[styles.header, { paddingTop: 12 }]}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }} hitSlop={10} style={styles.closeBtn}>
            <IconSymbol name="xmark" size={18} color={C.label} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: C.label }]}>Upload to KTV</Text>
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
              <Text style={[styles.uploadBtnText, { color: title.trim() ? C.bg : C.secondary }]}>
                Upload
              </Text>
            )}
          </Pressable>
        </View>
      </Animated.View>
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: TOP_BAR_H + 8, paddingBottom: insets.bottom + 40 }}
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
            style={[styles.thumbEdit, { backgroundColor: C.surface, borderColor: C.separator }]}
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
            placeholderTextColor={C.secondary}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
        </View>

        {/* Description */}
        <View style={[styles.inputRow, { borderBottomColor: C.separator, position: 'relative' }]}>
          <TextInput
            style={[styles.descInput, { color: C.label }]}
            placeholder="Description (optional)"
            placeholderTextColor={C.secondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={500}
            textAlignVertical="top"
          />
          <Pressable
            style={{ position: 'absolute', top: 10, right: 16 }}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); /* Dipson assist */ }}
          >
            <Text style={{ fontSize: 16 }}>✨</Text>
          </Pressable>
        </View>

        {/* Category */}
        <View style={styles.formSection}>
          <Text style={[styles.formLabel, { color: C.label }]}>Category (select all that apply)</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 4 }}
          >
            {PERSONAL_CATEGORIES.map(cat => {
              const active = selectedCategories.includes(cat);
              return (
                <Pressable
                  key={cat}
                  style={[
                    styles.pill,
                    active ? { backgroundColor: C.label } : { borderColor: C.separator },
                  ]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
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

        {/* Series */}
        <View style={styles.formSection}>
          <Text style={[styles.formLabel, { color: C.label }]}>Add to Series</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 4 }}>
            {(['None', 'Building KaNeXT', 'Coaching Philosophy', 'Creator Toolkit', '+ New Series'] as const).map(s => {
              const active = selectedSeries === s;
              return (
                <Pressable
                  key={s}
                  style={[styles.pill, active ? { backgroundColor: C.label } : { borderColor: C.separator }]}
                  onPress={() => { Haptics.selectionAsync(); setSelectedSeries(active ? 'None' : s); }}
                >
                  <Text style={[styles.pillText, { color: active ? C.bg : C.secondary }, active && { fontWeight: '600' }]}>{s}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Visibility */}
        <View style={styles.formSection}>
          <Text style={[styles.formLabel, { color: C.label }]}>Visibility</Text>
          {([
            { id: 'public', title: 'Public', sub: 'Visible to everyone. Appears on your channel and in Explore.' },
            { id: 'subscribers', title: 'Subscribers Only', sub: 'Only visible to paid subscribers (Supporter and above).' },
            { id: 'tier', title: 'Specific Tier', sub: 'Choose which subscriber tier can access this video.' },
          ] as const).map(opt => (
            <Pressable
              key={opt.id}
              style={styles.visibilityOption}
              onPress={() => setVisibility(opt.id)}
            >
              <View style={[styles.radio, { borderColor: visibility === opt.id ? C.label : C.separator }, visibility === opt.id && { backgroundColor: C.label }]}>
                {visibility === opt.id && <View style={[styles.radioDot, { backgroundColor: C.bg }]} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.visibilityTitle, { color: C.label }]}>{opt.title}</Text>
                <Text style={[styles.visibilitySub, { color: C.secondary }]}>{opt.sub}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Schedule */}
        <View style={styles.formSection}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 }}>
            <View>
              <Text style={[styles.formLabel, { color: C.label, paddingHorizontal: 0 }]}>Schedule</Text>
              <Text style={{ fontSize: 12, color: C.secondary }}>Set a future publish date</Text>
            </View>
            <Pressable
              onPress={() => { Haptics.selectionAsync(); setScheduled(!scheduled); }}
              style={{ width: 44, height: 26, borderRadius: 13, backgroundColor: scheduled ? C.label : C.separator, justifyContent: 'center', paddingHorizontal: 2 }}
            >
              <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: C.bg, alignSelf: scheduled ? 'flex-end' : 'flex-start' }} />
            </Pressable>
          </View>
          {scheduled && (
            <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
              <Text style={{ fontSize: 13, color: C.secondary, backgroundColor: C.surface, padding: 12, borderRadius: 10 }}>
                📅 Tap to pick date/time (date picker coming soon)
              </Text>
            </View>
          )}
        </View>

        {/* Toggles */}
        <View style={[styles.formSection, { paddingHorizontal: 16, gap: 14 }]}>
          {[
            { label: 'Allow Comments', sub: 'Viewers can comment on this video', state: commentsOn, toggle: () => setCommentsOn(!commentsOn) },
            { label: 'Enable Tips', sub: 'Viewers can send tips via KPay during playback', state: tipsOn, toggle: () => setTipsOn(!tipsOn) },
          ].map(item => (
            <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, marginRight: 16 }}>
                <Text style={{ fontSize: 14, fontWeight: '500', color: C.label }}>{item.label}</Text>
                <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{item.sub}</Text>
              </View>
              <Pressable
                onPress={() => { Haptics.selectionAsync(); item.toggle(); }}
                style={{ width: 44, height: 26, borderRadius: 13, backgroundColor: item.state ? C.label : C.separator, justifyContent: 'center', paddingHorizontal: 2 }}
              >
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: C.bg, alignSelf: item.state ? 'flex-end' : 'flex-start' }} />
              </Pressable>
            </View>
          ))}
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
