/**
 * Church Prayer Bottom Sheet
 *
 * 2-section tabbed: Submit Request + Active Requests feed.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import {
  PRAYER_REQUESTS,
  PRAYER_CATEGORY_LABELS,
  PRAYER_CATEGORY_COLORS,
  type PrayerCategory,
} from '@/data/mock-church-home';
import { Spacing, BorderRadius } from '@/constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

type TabId = 'submit' | 'requests';

const ACCENT = '#FBBF24';
const CATEGORIES = Object.keys(PRAYER_CATEGORY_LABELS) as PrayerCategory[];
const PRIVACY_OPTIONS = [
  { id: 'public' as const, label: 'Share with Church' },
  { id: 'leaders_only' as const, label: 'Leaders Only' },
  { id: 'private' as const, label: 'Private' },
];

export function ChurchPrayerSheet({ visible, onClose, colors }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('submit');
  const [requestText, setRequestText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PrayerCategory | null>(null);
  const [privacy, setPrivacy] = useState<'public' | 'leaders_only' | 'private'>('public');
  const [submitted, setSubmitted] = useState(false);
  const [prayedIds, setPrayedIds] = useState<Set<string>>(new Set());

  const handleClose = useCallback(() => {
    setActiveTab('submit');
    setRequestText('');
    setSelectedCategory(null);
    setPrivacy('public');
    setSubmitted(false);
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(() => {
    setSubmitted(true);
    setTimeout(() => {
      setRequestText('');
      setSelectedCategory(null);
      setPrivacy('public');
      setSubmitted(false);
    }, 2000);
  }, []);

  const handlePray = useCallback((id: string) => {
    setPrayedIds((prev) => new Set(prev).add(id));
  }, []);

  const canSubmit = requestText.trim().length > 0 && selectedCategory;

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Prayer" useModal>
      <View style={styles.container}>
        {/* Tab Pills */}
        <View style={styles.tabRow}>
          {(['submit', 'requests'] as TabId[]).map((tab) => (
            <Pressable
              key={tab}
              style={[
                styles.tabPill,
                { borderColor: colors.border },
                activeTab === tab && { backgroundColor: ACCENT, borderColor: ACCENT },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[
                styles.tabPillText,
                { color: colors.text },
                activeTab === tab && { color: '#000' },
              ]}>
                {tab === 'submit' ? 'Submit' : 'Requests'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Submit Tab */}
        {activeTab === 'submit' && (
          <View style={styles.section}>
            {submitted ? (
              <View style={styles.successBlock}>
                <Text style={styles.successText}>Prayer request submitted. We are standing with you.</Text>
              </View>
            ) : (
              <>
                <TextInput
                  style={[styles.textArea, { borderColor: colors.border, color: colors.text }]}
                  placeholder="Share your prayer request..."
                  placeholderTextColor={colors.textTertiary}
                  multiline
                  numberOfLines={4}
                  value={requestText}
                  onChangeText={setRequestText}
                  textAlignVertical="top"
                />

                <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>CATEGORY</Text>
                <View style={styles.pillRow}>
                  {CATEGORIES.map((cat) => (
                    <Pressable
                      key={cat}
                      style={[
                        styles.catPill,
                        { borderColor: colors.border },
                        selectedCategory === cat && {
                          backgroundColor: PRAYER_CATEGORY_COLORS[cat] + '22',
                          borderColor: PRAYER_CATEGORY_COLORS[cat],
                        },
                      ]}
                      onPress={() => setSelectedCategory(cat)}
                    >
                      <Text style={[
                        styles.catPillText,
                        { color: colors.text },
                        selectedCategory === cat && { color: PRAYER_CATEGORY_COLORS[cat] },
                      ]}>
                        {PRAYER_CATEGORY_LABELS[cat]}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>PRIVACY</Text>
                <View style={styles.pillRow}>
                  {PRIVACY_OPTIONS.map((opt) => (
                    <Pressable
                      key={opt.id}
                      style={[
                        styles.catPill,
                        { borderColor: colors.border },
                        privacy === opt.id && { backgroundColor: ACCENT + '22', borderColor: ACCENT },
                      ]}
                      onPress={() => setPrivacy(opt.id)}
                    >
                      <Text style={[
                        styles.catPillText,
                        { color: colors.text },
                        privacy === opt.id && { color: ACCENT },
                      ]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>

                <Pressable
                  style={[styles.ctaButton, { backgroundColor: canSubmit ? ACCENT : colors.border }]}
                  onPress={handleSubmit}
                  disabled={!canSubmit}
                >
                  <Text style={[styles.ctaText, { color: canSubmit ? '#000' : colors.textTertiary }]}>
                    Submit Prayer Request
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <View style={styles.section}>
            {PRAYER_REQUESTS.filter((p) => p.privacy === 'public').map((req) => (
              <View
                key={req.id}
                style={[
                  styles.requestCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  req.isPraise && { borderColor: ACCENT, borderWidth: 1.5 },
                ]}
              >
                <View style={styles.requestHeader}>
                  <Text style={[styles.requestName, { color: colors.text }]}>
                    {req.anonymous ? 'Anonymous' : req.name}
                  </Text>
                  <View style={[styles.categoryBadge, { backgroundColor: PRAYER_CATEGORY_COLORS[req.category] + '22' }]}>
                    <Text style={[styles.categoryBadgeText, { color: PRAYER_CATEGORY_COLORS[req.category] }]}>
                      {PRAYER_CATEGORY_LABELS[req.category]}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.requestText, { color: colors.textSecondary }]}>{req.text}</Text>
                <View style={styles.requestFooter}>
                  <Text style={[styles.requestDate, { color: colors.textTertiary }]}>{req.date}</Text>
                  <Pressable
                    style={[
                      styles.prayButton,
                      prayedIds.has(req.id)
                        ? { backgroundColor: ACCENT + '22' }
                        : { backgroundColor: colors.border + '44' },
                    ]}
                    onPress={() => handlePray(req.id)}
                  >
                    <Text style={[
                      styles.prayButtonText,
                      { color: prayedIds.has(req.id) ? ACCENT : colors.textSecondary },
                    ]}>
                      {prayedIds.has(req.id)
                        ? `Prayed (${req.prayerCount + 1})`
                        : `I Prayed (${req.prayerCount})`}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },

  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  tabPill: { flex: 1, borderWidth: 1, borderRadius: BorderRadius.md, paddingVertical: 8, alignItems: 'center' },
  tabPillText: { fontSize: 13, fontWeight: '700' },

  section: { gap: Spacing.sm },

  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },

  textArea: {
    borderWidth: 1, borderRadius: BorderRadius.md,
    padding: Spacing.sm, fontSize: 14,
    minHeight: 80,
  },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  catPill: { borderWidth: 1, borderRadius: BorderRadius.md, paddingHorizontal: 12, paddingVertical: 6 },
  catPillText: { fontSize: 12, fontWeight: '600' },

  ctaButton: { paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  ctaText: { fontSize: 15, fontWeight: '700' },

  successBlock: {
    backgroundColor: '#22C55E22',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  successText: { color: '#22C55E', fontSize: 14, fontWeight: '700', textAlign: 'center' },

  requestCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.sm,
    gap: 6,
  },
  requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  requestName: { fontSize: 13, fontWeight: '700' },
  categoryBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  categoryBadgeText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  requestText: { fontSize: 13, lineHeight: 18 },
  requestFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  requestDate: { fontSize: 10 },
  prayButton: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: BorderRadius.md },
  prayButtonText: { fontSize: 11, fontWeight: '700' },
});
