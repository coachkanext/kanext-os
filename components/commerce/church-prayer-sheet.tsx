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

const ACCENT = '#1D9BF0';
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
  container: { gap: 12 },

  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  tabPill: { flex: 1, borderWidth: StyleSheet.hairlineWidth, borderRadius: 20, paddingVertical: 10, alignItems: 'center' },
  tabPillText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },

  section: { gap: 12 },

  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 },

  textArea: {
    borderWidth: StyleSheet.hairlineWidth, borderRadius: 14,
    padding: 14, fontSize: 14,
    minHeight: 80,
  },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  catPill: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  catPillText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },

  ctaButton: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  ctaText: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },

  successBlock: {
    backgroundColor: '#22C55E12',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  successText: { color: '#22C55E', fontSize: 14, fontWeight: '700', textAlign: 'center', letterSpacing: -0.2 },

  requestCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 8,
  },
  requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  requestName: { fontSize: 13, fontWeight: '800', letterSpacing: -0.2 },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  categoryBadgeText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  requestText: { fontSize: 13, lineHeight: 19 },
  requestFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  requestDate: { fontSize: 10, fontWeight: '500', letterSpacing: 0.2 },
  prayButton: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  prayButtonText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
});
