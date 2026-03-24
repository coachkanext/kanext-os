/**
 * Social Publish Screen — Post / Story / Reel
 * Reached after edit in edit.tsx.
 * tab param: 'post' | 'story' | 'reel'
 *
 * All tabs: caption, tag people, location, audience/visibility
 * Post:  category pills
 * Story: Close Friends toggle
 * Reel:  "Also share to Feed" toggle, category pills
 *
 * Actions: Save Draft · Schedule · Share
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, Pressable, ScrollView, TextInput,
  StyleSheet, Switch, KeyboardAvoidingView, Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

// ── Types ────────────────────────────────────────────────────────────────────

type PublishTab = 'post' | 'story' | 'reel';
type Audience = 'everyone' | 'network' | 'private';

// ── Schedule sheet ───────────────────────────────────────────────────────────

const SCHEDULE_OPTIONS = [
  { id: '30m',   label: 'In 30 minutes' },
  { id: 'today', label: 'Tonight 8 PM' },
  { id: 'tmrw',  label: 'Tomorrow 9 AM' },
  { id: 'mon',   label: 'Monday 9 AM' },
];

function ScheduleSheet({
  visible,
  onClose,
  onSelect,
  C,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (label: string) => void;
  C: ComponentColors;
}) {
  return (
    <BottomSheet visible={visible} onClose={onClose} useModal>
      <View style={shStyles.header}>
        <Text style={[shStyles.title, { color: C.label }]}>Schedule Post</Text>
      </View>
      {SCHEDULE_OPTIONS.map((o) => (
        <Pressable
          key={o.id}
          style={[shStyles.row, { borderBottomColor: C.separator }]}
          onPress={() => {
            Haptics.selectionAsync();
            onSelect(o.label);
            onClose();
          }}
        >
          <IconSymbol name="clock" size={18} color={C.accent} />
          <Text style={[shStyles.rowLabel, { color: C.label }]}>{o.label}</Text>
        </Pressable>
      ))}
    </BottomSheet>
  );
}

const shStyles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingVertical: 14 },
  title:  { fontSize: 17, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: { fontSize: 15, fontWeight: '500', flex: 1 },
});

// ── Category pills ────────────────────────────────────────────────────────────

const CATEGORIES = ['Sports', 'Fitness', 'Education', 'Business', 'Art', 'Music', 'Faith', 'Tech', 'Food', 'Travel'];

function CategoryPills({ C }: { C: ComponentColors }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(cat: string) {
    Haptics.selectionAsync();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={cpStyles.strip}>
      {CATEGORIES.map((cat) => {
        const active = selected.has(cat);
        return (
          <Pressable
            key={cat}
            style={[cpStyles.pill, {
              backgroundColor: active ? C.accent : C.surface,
              borderColor: active ? C.accent : C.inputBorder,
            }]}
            onPress={() => toggle(cat)}
          >
            <Text style={[cpStyles.pillLabel, { color: active ? '#fff' : C.secondary }]}>
              {cat}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const cpStyles = StyleSheet.create({
  strip: { paddingHorizontal: 16, gap: 8, paddingVertical: 4 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillLabel: { fontSize: 13, fontWeight: '500' },
});

// ── Settings row ─────────────────────────────────────────────────────────────

function SettingsRow({
  icon, label, value, onPress, trailing, C,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
  C: ComponentColors;
}) {
  return (
    <Pressable
      style={[srStyles.row, { borderBottomColor: C.separator }]}
      onPress={onPress}
    >
      <View style={[srStyles.iconWrap, { backgroundColor: C.surface }]}>
        <IconSymbol name={icon as any} size={16} color={C.accent} />
      </View>
      <Text style={[srStyles.label, { color: C.label }]}>{label}</Text>
      {value ? (
        <Text style={[srStyles.value, { color: C.secondary }]}>{value}</Text>
      ) : null}
      {trailing ?? (
        onPress ? <IconSymbol name="chevron.right" size={14} color={C.muted} /> : null
      )}
    </Pressable>
  );
}

const srStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 30, height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { flex: 1, fontSize: 15 },
  value: { fontSize: 14 },
});

// ── Audience selector ─────────────────────────────────────────────────────────

function AudienceSelector({
  value, onChange, C,
}: {
  value: Audience;
  onChange: (a: Audience) => void;
  C: ComponentColors;
}) {
  const options: { id: Audience; label: string; icon: string }[] = [
    { id: 'everyone', label: 'Everyone',   icon: 'globe' },
    { id: 'network',  label: 'My Network', icon: 'person.2' },
    { id: 'private',  label: 'Only Me',    icon: 'lock' },
  ];

  return (
    <View style={{ gap: 0 }}>
      {options.map((o) => (
        <Pressable
          key={o.id}
          style={[auStyles.row, { borderBottomColor: C.separator }]}
          onPress={() => {
            Haptics.selectionAsync();
            onChange(o.id);
          }}
        >
          <View style={[auStyles.iconWrap, { backgroundColor: C.surface }]}>
            <IconSymbol name={o.icon as any} size={15} color={C.accent} />
          </View>
          <Text style={[auStyles.label, { color: C.label }]}>{o.label}</Text>
          {value === o.id && (
            <IconSymbol name="checkmark" size={15} color={C.accent} />
          )}
        </Pressable>
      ))}
    </View>
  );
}

const auStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 28, height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { flex: 1, fontSize: 15 },
});

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ title, C }: { title: string; C: ComponentColors }) {
  return (
    <Text style={[secStyles.title, { color: C.secondary }]}>{title.toUpperCase()}</Text>
  );
}

const secStyles = StyleSheet.create({
  title: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
});

// ── Main screen ────────────────────────────────────────────────────────────────

export default function SocialPublishScreen() {
  const { tab = 'post' } = useLocalSearchParams<{ tab: string }>();
  const publishTab = (tab as PublishTab) ?? 'post';
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const C = useColors();

  const [caption, setCaption]           = useState('');
  const [location, setLocation]         = useState('');
  const [audience, setAudience]         = useState<Audience>('everyone');
  const [closeFriends, setCloseFriends] = useState(false);
  const [shareToFeed, setShareToFeed]   = useState(true);
  const [scheduleVisible, setScheduleVisible] = useState(false);
  const [scheduledFor, setScheduledFor] = useState<string | null>(null);
  const [showAudience, setShowAudience] = useState(false);

  const shareLabel = scheduledFor ? `Schedule · ${scheduledFor}` : 'Share';

  const handleShare = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Pop back to social index
    router.push('/(tabs)/(main)/social' as any);
  }, [router]);

  const handleDraft = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/(main)/social' as any);
  }, [router]);

  const tabLabel = publishTab === 'post' ? 'New Post'
    : publishTab === 'story' ? 'New Story'
    : 'New Reel';

  const audienceLabel = audience === 'everyone' ? 'Everyone'
    : audience === 'network' ? 'My Network'
    : 'Only Me';

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: C.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8, borderBottomColor: C.separator }]}>
        <Pressable
          style={styles.headerBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: C.label }]}>{tabLabel}</Text>
        <View style={styles.headerRight}>
          <Pressable
            style={styles.scheduleBtn}
            onPress={() => setScheduleVisible(true)}
          >
            <IconSymbol name="clock" size={18} color={C.accent} />
          </Pressable>
          <Pressable
            style={[styles.shareBtn, { backgroundColor: C.accent }]}
            onPress={handleShare}
          >
            <Text style={styles.shareLabel}>{shareLabel}</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Preview thumbnail + caption */}
        <View style={[styles.captionCard, { backgroundColor: C.surface }]}>
          {/* Tiny preview */}
          <View style={[styles.thumbPreview, { backgroundColor: '#1A1A1A' }]}>
            {publishTab === 'reel' && (
              <IconSymbol name="play.fill" size={18} color="rgba(255,255,255,0.5)" />
            )}
            {publishTab === 'story' && (
              <IconSymbol name="circle.fill" size={10} color="rgba(255,255,255,0.4)" />
            )}
          </View>
          <TextInput
            style={[styles.captionInput, { color: C.label }]}
            placeholder="Write a caption…"
            placeholderTextColor={C.muted}
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={2200}
          />
        </View>

        {/* Tag & Location */}
        <SectionHeader title="Details" C={C} />
        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <SettingsRow
            icon="person.badge.plus"
            label="Tag People"
            onPress={() => Haptics.selectionAsync()}
            C={C}
          />
          <TextInput
            style={[styles.locationInput, { color: C.label, borderTopColor: C.separator }]}
            placeholder="Add location"
            placeholderTextColor={C.muted}
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* Categories (post + reel) */}
        {(publishTab === 'post' || publishTab === 'reel') && (
          <>
            <SectionHeader title="Category" C={C} />
            <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <CategoryPills C={C} />
            </View>
          </>
        )}

        {/* Reel: share to feed toggle */}
        {publishTab === 'reel' && (
          <>
            <SectionHeader title="Distribution" C={C} />
            <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <SettingsRow
                icon="rectangle.stack.person.crop"
                label="Also Share to Feed"
                C={C}
                trailing={
                  <Switch
                    value={shareToFeed}
                    onValueChange={(v) => {
                      Haptics.selectionAsync();
                      setShareToFeed(v);
                    }}
                    trackColor={{ true: C.accent, false: C.surface }}
                    thumbColor="#fff"
                  />
                }
              />
            </View>
          </>
        )}

        {/* Story: close friends toggle */}
        {publishTab === 'story' && (
          <>
            <SectionHeader title="Audience" C={C} />
            <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <SettingsRow
                icon="star.circle"
                label="Close Friends Only"
                C={C}
                trailing={
                  <Switch
                    value={closeFriends}
                    onValueChange={(v) => {
                      Haptics.selectionAsync();
                      setCloseFriends(v);
                    }}
                    trackColor={{ true: C.green, false: C.surface }}
                    thumbColor="#fff"
                  />
                }
              />
            </View>
          </>
        )}

        {/* Visibility (post + reel) */}
        {publishTab !== 'story' && (
          <>
            <SectionHeader title="Visibility" C={C} />
            <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.separator }]}>
              {showAudience ? (
                <AudienceSelector value={audience} onChange={setAudience} C={C} />
              ) : (
                <SettingsRow
                  icon="globe"
                  label="Audience"
                  value={audienceLabel}
                  onPress={() => setShowAudience(true)}
                  C={C}
                />
              )}
            </View>
          </>
        )}

        {/* Advanced */}
        <SectionHeader title="Advanced" C={C} />
        <View style={[styles.section, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <SettingsRow
            icon="captions.bubble"
            label="Auto-Generated Captions"
            onPress={() => Haptics.selectionAsync()}
            C={C}
          />
          <SettingsRow
            icon="eye.slash"
            label="Hide Like Count"
            C={C}
            trailing={<Switch value={false} trackColor={{ true: C.accent, false: C.surface }} thumbColor="#fff" />}
          />
          <SettingsRow
            icon="bubble.right"
            label="Allow Comments"
            C={C}
            trailing={<Switch value={true} trackColor={{ true: C.accent, false: C.surface }} thumbColor="#fff" />}
          />
        </View>

        {/* Save draft */}
        <Pressable
          style={[styles.draftBtn, { borderColor: C.inputBorder }]}
          onPress={handleDraft}
        >
          <IconSymbol name="square.and.arrow.down" size={16} color={C.secondary} />
          <Text style={[styles.draftLabel, { color: C.secondary }]}>Save Draft</Text>
        </Pressable>
      </ScrollView>

      {/* Schedule sheet */}
      <ScheduleSheet
        visible={scheduleVisible}
        onClose={() => setScheduleVisible(false)}
        onSelect={(label) => setScheduledFor(label)}
        C={C}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  headerBtn: {
    width: 36, height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scheduleBtn: {
    width: 36, height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 20,
  },
  shareLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingTop: 12,
    gap: 0,
  },
  captionCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  thumbPreview: {
    width: 60, height: 60,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  captionInput: {
    flex: 1,
    fontSize: 15,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  section: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  locationInput: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  draftBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  draftLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
});
