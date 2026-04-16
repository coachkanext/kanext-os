/**
 * Personal Inquiries — Personal Mode tile 5 (replaces Deals).
 * Where all inbound opportunities land: brand deals, collabs, speaking, custom requests.
 * Owner: full pipeline with inline detail view.
 * Follower: "Work with me" public page with service offerings + submit inquiry form.
 */

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, Animated, TextInput,
  Image,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { GlassView } from '@/components/ui/glass-view';
import { RolePill } from '@/components/ui/role-pill';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

import {
  PERSONAL_INQUIRIES, RATE_SERVICES, TRUSTED_BY,
  type PersonalInquiry, type InquiryType, type InquiryStatus,
} from '@/data/mock-personal-inquiries';

// ── Constants ──────────────────────────────────────────────────────────────────

const GAIN       = '#5A8A6E';
const CAUTION    = '#B8943E';
const STATUS_NEW = '#2563EB';
const TOP_BAR_H  = 52;
const PILLS_H    = 48;

type FilterStatus = InquiryStatus | 'All';
const FILTER_PILLS: FilterStatus[] = ['All', 'New', 'In Discussion', 'Accepted', 'Declined'];

// ── Color helpers ──────────────────────────────────────────────────────────────

function hsl(hue: number, s = 40, l = 55, a = 1): string {
  return `hsla(${hue}, ${s}%, ${l}%, ${a})`;
}

/** Hash initials to a consistent, low-saturation avatar color. */
function avatarColorFromInitials(initials: string): string {
  let h = 0;
  for (let i = 0; i < initials.length; i++) {
    h = (Math.imul(31, h) + initials.charCodeAt(i)) | 0;
  }
  const hue = ((h >>> 0) % 360);
  return `hsl(${hue}, 22%, 38%)`;
}

function haptic() { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }

/** Filled status pill style — solid background with white text. */
function statusPillStyle(status: InquiryStatus): { bg: string; text: string } {
  switch (status) {
    case 'New':           return { bg: STATUS_NEW,            text: '#FFFFFF' };
    case 'In Discussion': return { bg: CAUTION,               text: '#FFFFFF' };
    case 'Accepted':      return { bg: GAIN,                  text: '#FFFFFF' };
    case 'Declined':      return { bg: 'rgba(0,0,0,0.10)',    text: '#9C9790' };
  }
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function PersonalInquiriesScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);

  const [role, cycleRole, roleCycles] = useDemoRole('personal:inquiries');
  const isOwner = role === roleCycles[0];
  const router  = useRouter();

  // Follower lands on Collaborate screen instead of the Owner pipeline
  useEffect(() => {
    if (!isOwner) router.replace('/(tabs)/(main)/personal-inquiries/collaborate' as any);
  }, [isOwner]);

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const { status: initStatus } = useLocalSearchParams<{ status?: FilterStatus }>();

  const [activeFilter, setActiveFilter] = useState<FilterStatus>('All');
  const [selectedId,   setSelectedId]   = useState<string | null>(null);
  const [submitOpen,   setSubmitOpen]   = useState(false);

  // Inquiry form state (follower submit)
  const [formName,    setFormName]    = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formType,    setFormType]    = useState<InquiryType>('Brand Deal');
  const [formDesc,    setFormDesc]    = useState('');
  const [formBudget,  setFormBudget]  = useState('');
  const [formEmail,   setFormEmail]   = useState('');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  // Sidebar status param → filter
  useEffect(() => {
    if (initStatus && FILTER_PILLS.includes(initStatus as FilterStatus)) {
      setActiveFilter(initStatus as FilterStatus);
      setSelectedId(null);
    }
  }, [initStatus]);

  const filteredInquiries = useMemo(() => {
    if (activeFilter === 'All') return PERSONAL_INQUIRIES;
    return PERSONAL_INQUIRIES.filter(i => i.status === activeFilter);
  }, [activeFilter]);

  const selectedInquiry = useMemo(
    () => PERSONAL_INQUIRIES.find(i => i.id === selectedId) ?? null,
    [selectedId],
  );

  const contentPaddingTop = insets.top + TOP_BAR_H;

  // ── Derived counts for badge on "New" filter
  const newCount = PERSONAL_INQUIRIES.filter(i => i.status === 'New').length;

  // ── Render helpers ────────────────────────────────────────────────────────

  function renderFilterPills() {
    return (
      <View style={[s.pillsRow, { borderBottomColor: C.separator }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.pillsScroll}
        >
          {FILTER_PILLS.map(f => {
            const active = activeFilter === f;
            const badgeCount = f === 'New' ? newCount : 0;
            return (
              <Pressable
                key={f}
                style={[
                  s.pill,
                  active
                    ? { backgroundColor: C.activePill, borderColor: C.activePill }
                    : { backgroundColor: C.surface, borderColor: C.separator },
                ]}
                onPress={() => { haptic(); setActiveFilter(f); setSelectedId(null); }}
              >
                <Text style={[s.pillText, { color: active ? C.activePillText : C.secondary }]}>{f}</Text>
                {badgeCount > 0 && !active && (
                  <View style={[s.pillBadge, { backgroundColor: C.label }]}>
                    <Text style={[s.pillBadgeText, { color: C.bg }]}>{badgeCount}</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  // ── Owner list view ────────────────────────────────────────────────────────

  function renderOwnerList() {
    return (
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        style={s.scroll}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {renderFilterPills()}
        <View style={s.listPad}>
          {/* Inquiry cards */}
          {filteredInquiries.length === 0 ? (
            <View style={s.emptyWrap}>
              <IconSymbol name="tray" size={36} color={C.secondary} />
              <Text style={[s.emptyTitle, { color: C.label }]}>No {activeFilter !== 'All' ? activeFilter : ''} Inquiries</Text>
              <Text style={[s.emptySubtitle, { color: C.secondary }]}>
                {activeFilter === 'New' ? 'New inquiries from brands and collaborators will appear here.' : 'Nothing here yet.'}
              </Text>
            </View>
          ) : (
            filteredInquiries.map(inq => (
              <InquiryCard
                key={inq.id}
                inq={inq}
                onPress={() => { haptic(); setSelectedId(inq.id); }}
                C={C}
                s={s}
              />
            ))
          )}
        </View>
      </ScrollView>
    );
  }

  // ── Owner detail view ──────────────────────────────────────────────────────

  function renderOwnerDetail(inq: PersonalInquiry) {
    const sp = statusPillStyle(inq.status);

    return (
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        style={s.scroll}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 8, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.listPad}>

          {/* Back button */}
          <Pressable
            style={s.backBtn}
            onPress={() => { haptic(); setSelectedId(null); }}
          >
            <IconSymbol name="chevron.left" size={14} color={C.secondary} />
            <Text style={[s.backText, { color: C.secondary }]}>All Inquiries</Text>
          </Pressable>

          {/* Sender card */}
          <GlassView tier={1} style={s.senderCard}>
            <View style={[s.senderAvatar, { backgroundColor: avatarColorFromInitials(inq.initials), overflow: 'hidden' }]}>
              {inq.avatarUri ? (
                <Image source={{ uri: inq.avatarUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              ) : (
                <Text style={s.senderAvatarText}>{inq.initials}</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.senderName, { color: C.label }]}>{inq.senderName}</Text>
              <Text style={[s.senderCompany, { color: C.secondary }]}>{inq.senderCompany}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <View style={[s.typeBadge, { backgroundColor: C.surface, borderColor: C.separator }]}>
                <Text style={[s.typeBadgeText, { color: C.label }]}>{inq.type}</Text>
              </View>
              <Text style={[s.senderDate, { color: C.secondary }]}>{inq.dateReceived}</Text>
            </View>
          </GlassView>

          {/* Contact info row */}
          <GlassView tier={1} style={s.contactCard}>
            <View style={s.contactRow}>
              <IconSymbol name="envelope.fill" size={14} color={C.secondary} />
              <Text style={[s.contactText, { color: C.label }]}>{inq.senderEmail}</Text>
            </View>
            {inq.senderWebsite && (
              <>
                <View style={[s.contactDivider, { backgroundColor: C.separator }]} />
                <View style={s.contactRow}>
                  <IconSymbol name="globe" size={14} color={C.secondary} />
                  <Text style={[s.contactText, { color: C.label }]}>{inq.senderWebsite}</Text>
                  <IconSymbol name="arrow.up.right" size={12} color={C.secondary} style={{ marginLeft: 'auto' }} />
                </View>
              </>
            )}
          </GlassView>

          {/* Inquiry details */}
          <View style={s.detailSection}>
            <Text style={[s.detailSectionHeader, { color: C.label }]}>Inquiry Details</Text>
            <GlassView tier={1} style={s.detailCard}>
              <Text style={[s.detailDesc, { color: C.label }]}>{inq.description}</Text>

              {(inq.proposedTimeline || inq.proposedBudget) && (
                <View style={[s.detailMeta, { borderTopColor: C.separator }]}>
                  {inq.proposedTimeline && (
                    <View style={s.detailMetaItem}>
                      <IconSymbol name="calendar" size={13} color={C.secondary} />
                      <View>
                        <Text style={[s.detailMetaLabel, { color: C.secondary }]}>Timeline</Text>
                        <Text style={[s.detailMetaValue, { color: C.label }]}>{inq.proposedTimeline}</Text>
                      </View>
                    </View>
                  )}
                  {inq.proposedBudget && (
                    <View style={[s.detailMetaItem, inq.proposedTimeline && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}>
                      <IconSymbol name="dollarsign.circle.fill" size={13} color={C.secondary} />
                      <View>
                        <Text style={[s.detailMetaLabel, { color: C.secondary }]}>Proposed Budget</Text>
                        <Text style={[s.detailMetaValue, { color: C.label }]}>{inq.proposedBudget}</Text>
                      </View>
                    </View>
                  )}
                </View>
              )}
            </GlassView>
          </View>

          {/* Messages */}
          <View style={s.detailSection}>
            <Text style={[s.detailSectionHeader, { color: C.label }]}>Messages</Text>
            <GlassView tier={1} style={s.messagesCard}>
              {inq.messages.map((msg, idx) => {
                const isOwnerMsg = msg.from === 'owner';
                return (
                  <View
                    key={msg.id}
                    style={[
                      s.msgRow,
                      idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                    ]}
                  >
                    <View style={[
                      s.msgBubble,
                      isOwnerMsg
                        ? { backgroundColor: C.label, alignSelf: 'flex-end' }
                        : { backgroundColor: C.surface, alignSelf: 'flex-start', borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator },
                    ]}>
                      <Text style={[s.msgText, { color: isOwnerMsg ? C.bg : C.label }]}>{msg.text}</Text>
                    </View>
                    <Text style={[s.msgTime, { color: C.secondary, alignSelf: isOwnerMsg ? 'flex-end' : 'flex-start' }]}>
                      {msg.time}
                    </Text>
                  </View>
                );
              })}
              {/* Quick reply input */}
              <View style={[s.replyRow, { borderTopColor: C.separator }]}>
                <View style={[s.replyInput, { backgroundColor: C.bg, borderColor: C.separator }]}>
                  <Text style={[s.replyPlaceholder, { color: C.secondary }]}>Reply to {inq.senderName.split(' ')[0]}...</Text>
                </View>
                <Pressable
                  style={[s.replySend, { backgroundColor: C.label }]}
                  onPress={() => haptic()}
                >
                  <IconSymbol name="arrow.up" size={14} color={C.bg} />
                </Pressable>
              </View>
            </GlassView>
          </View>

        </View>
      </ScrollView>
    );
  }

  // ── Follower "Work with me" view ───────────────────────────────────────────

  function renderFollowerView() {
    return (
      <>
        <ScrollView
          onScroll={onScroll}
          scrollEventThrottle={scrollEventThrottle}
          style={s.scroll}
          contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 8, paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={s.listPad}>

            {/* Intro */}
            <View style={s.introBlock}>
              <Text style={[s.introTitle, { color: C.label }]}>Work with me</Text>
              <Text style={[s.introSub, { color: C.secondary }]}>
                I partner with brands, creators, and organizations on content, coaching, and speaking engagements. Tell me what you have in mind.
              </Text>
            </View>

            {/* Rate card services */}
            <View style={s.servicesSection}>
              <Text style={[s.detailSectionHeader, { color: C.label }]}>Services</Text>
              <GlassView tier={1} style={s.glassCard}>
                {RATE_SERVICES.map((svc, idx) => (
                  <View
                    key={svc.id}
                    style={[
                      s.svcRow,
                      idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                    ]}
                  >
                    <View style={[s.svcIconCircle, { backgroundColor: C.bg }]}>
                      <IconSymbol name={svc.icon as any} size={16} color={C.label} />
                    </View>
                    <Text style={[s.svcTitle, { color: C.label }]}>{svc.title}</Text>
                    <Text style={[s.svcPrice, { color: C.secondary }]}>from {svc.starting}</Text>
                  </View>
                ))}
              </GlassView>
            </View>

            {/* Trusted by */}
            <View style={s.servicesSection}>
              <Text style={[s.detailSectionHeader, { color: C.label }]}>Trusted by</Text>
              <View style={s.trustedRow}>
                {TRUSTED_BY.map(brand => (
                  <View key={brand.id} style={[s.trustedBadge, { backgroundColor: C.surface, borderColor: C.separator }]}>
                    <View style={[s.trustedAvatar, { backgroundColor: C.bg, overflow: 'hidden' }]}>
                      {brand.logoUri ? (
                        <Image source={{ uri: brand.logoUri }} style={StyleSheet.absoluteFill} resizeMode="contain" />
                      ) : (
                        <Text style={[s.trustedInitials, { color: hsl(brand.hue, 35, 35, 0.9) }]}>{brand.initials}</Text>
                      )}
                    </View>
                    <Text style={[s.trustedName, { color: C.label }]}>{brand.name}</Text>
                  </View>
                ))}
              </View>
            </View>

          </View>
        </ScrollView>

        {/* Sticky CTA */}
        <View style={[s.ctaBar, { paddingBottom: insets.bottom + 8, borderTopColor: C.separator, backgroundColor: C.bg }]}>
          <Pressable
            style={[s.ctaBtn, { backgroundColor: C.label }]}
            onPress={() => { haptic(); setSubmitOpen(true); }}
          >
            <IconSymbol name="envelope.fill" size={16} color={C.bg} />
            <Text style={[s.ctaBtnText, { color: C.bg }]}>Submit Inquiry</Text>
          </Pressable>
        </View>

        {/* Submit inquiry sheet */}
        <BottomSheet
          visible={submitOpen}
          onClose={() => setSubmitOpen(false)}
          useModal
          title="Submit Inquiry"
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 16 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <FormField label="Your Name" value={formName} onChangeText={setFormName} placeholder="Full name" C={C} />
            <FormField label="Email" value={formEmail} onChangeText={setFormEmail} placeholder="you@company.com" keyboardType="email-address" C={C} />
            <FormField label="Company / Brand" value={formCompany} onChangeText={setFormCompany} placeholder="Optional" C={C} />

            {/* Type picker */}
            <View style={{ gap: 6 }}>
              <Text style={[s.formLabel, { color: C.secondary }]}>Type</Text>
              <View style={s.typePickerRow}>
                {(['Brand Deal', 'Collaboration', 'Speaking', 'Custom Request'] as InquiryType[]).map(t => (
                  <Pressable
                    key={t}
                    style={[
                      s.typePill,
                      formType === t
                        ? { backgroundColor: C.activePill, borderColor: C.activePill }
                        : { backgroundColor: C.surface, borderColor: C.separator },
                    ]}
                    onPress={() => { haptic(); setFormType(t); }}
                  >
                    <Text style={[s.typePillText, { color: formType === t ? C.activePillText : C.secondary }]}>{t}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <FormField label="Budget (optional)" value={formBudget} onChangeText={setFormBudget} placeholder="e.g. $5,000" C={C} />
            <FormField label="What are you looking for?" value={formDesc} onChangeText={setFormDesc} placeholder="Describe your project or request..." multiline C={C} />

            <Pressable
              style={[s.ctaBtn, { backgroundColor: C.label, marginTop: 8 }]}
              onPress={() => { haptic(); setSubmitOpen(false); }}
            >
              <Text style={[s.ctaBtnText, { color: C.bg }]}>Send Inquiry</Text>
            </Pressable>
          </ScrollView>
        </BottomSheet>
      </>
    );
  }

  // ── Top bar ────────────────────────────────────────────────────────────────

  const topBarTitle = !isOwner
    ? 'Work with me'
    : selectedInquiry
      ? selectedInquiry.title
      : 'Inquiries';

  const rightEl = <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />;

  // ── Bottom actions (Owner detail view) ─────────────────────────────────────

  function renderDetailActions(inq: PersonalInquiry) {
    if (inq.status === 'Accepted' || inq.status === 'Declined') return null;
    return (
      <View style={[s.actionsBar, { paddingBottom: insets.bottom + 8, borderTopColor: C.separator, backgroundColor: C.bg }]}>
        <Pressable
          style={[s.actionBtn, { backgroundColor: GAIN + '18', borderColor: GAIN + '40', borderWidth: 1 }]}
          onPress={() => haptic()}
        >
          <IconSymbol name="checkmark" size={14} color={GAIN} />
          <Text style={[s.actionBtnText, { color: GAIN }]}>Accept</Text>
        </Pressable>
        <Pressable
          style={[s.actionBtn, { backgroundColor: C.surface, borderColor: C.separator, borderWidth: 1 }]}
          onPress={() => haptic()}
        >
          <IconSymbol name="xmark" size={14} color={C.secondary} />
          <Text style={[s.actionBtnText, { color: C.secondary }]}>Decline</Text>
        </Pressable>
        <Pressable
          style={[s.actionBtn, { backgroundColor: C.label, flex: 1.5 }]}
          onPress={() => haptic()}
        >
          <IconSymbol name="message.fill" size={14} color={C.bg} />
          <Text style={[s.actionBtnText, { color: C.bg }]}>Message</Text>
        </Pressable>
        <Pressable
          style={[s.actionBtnIcon, { backgroundColor: C.surface, borderColor: C.separator, borderWidth: 1 }]}
          onPress={() => haptic()}
        >
          <IconSymbol name="ellipsis" size={16} color={C.secondary} />
        </Pressable>
      </View>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* Top bar */}
      <Animated.View style={[
        s.topBarOuter,
        { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, opacity },
      ]}>
        <View style={s.topBar}>
          <Pressable
            onPress={() => { haptic(); openSidePanel(); }}
            hitSlop={8} style={s.topBarBtn}
          >
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.topBarPill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.topBarPillText, { color: C.label }]} numberOfLines={1}>{topBarTitle}</Text>
            </View>
          </View>
          <View style={[s.topBarRight]}>
            {rightEl}
          </View>
        </View>
      </Animated.View>

      {/* Content */}
      {isOwner
        ? selectedInquiry
          ? renderOwnerDetail(selectedInquiry)
          : renderOwnerList()
        : renderFollowerView()
      }

      {/* Bottom actions bar (Owner detail) */}
      {isOwner && selectedInquiry && renderDetailActions(selectedInquiry)}

    </View>
  );
}

// ── InquiryCard ───────────────────────────────────────────────────────────────

function InquiryCard({
  inq, onPress, C, s,
}: {
  inq: PersonalInquiry;
  onPress: () => void;
  C: ComponentColors;
  s: ReturnType<typeof makeStyles>;
}) {
  const sp = statusPillStyle(inq.status);

  return (
    <Pressable
      style={({ pressed }) => [
        s.inqCard,
        { backgroundColor: pressed ? C.separator : C.surface, borderColor: C.separator },
      ]}
      onPress={onPress}
    >
      {/* Avatar */}
      <View style={[s.inqAvatar, { backgroundColor: C.label, overflow: 'hidden' }]}>
        {inq.avatarUri ? (
          <Image source={{ uri: inq.avatarUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <Text style={[s.inqAvatarText, { color: C.bg }]}>{inq.initials}</Text>
        )}
      </View>

      {/* Body */}
      <View style={{ flex: 1, minWidth: 0 }}>
        {/* Sender + status pill */}
        <View style={s.inqTopRow}>
          <Text style={[s.inqSender, { color: C.secondary }]} numberOfLines={1}>
            {inq.senderName}, {inq.senderCompany}
          </Text>
          <View style={[s.statusPill, { backgroundColor: sp.bg }]}>
            <Text style={[s.statusPillText, { color: sp.text }]}>{inq.status}</Text>
          </View>
        </View>

        {/* Title — full width, 2 lines */}
        <Text style={[s.inqTitle, { color: C.label }]} numberOfLines={2}>{inq.title}</Text>

        {/* Type badge + date */}
        <View style={s.inqMetaRow}>
          <View style={[s.typeBadge, { backgroundColor: C.surface2 }]}>
            <Text style={[s.typeBadgeText, { color: C.label }]}>{inq.type}</Text>
          </View>
          <Text style={[s.inqDate, { color: C.secondary }]}>{inq.dateReceived}</Text>
        </View>
      </View>

      {/* Chevron */}
      <IconSymbol name="chevron.right" size={13} color={C.secondary} style={{ marginLeft: 4, flexShrink: 0 }} />
    </Pressable>
  );
}

// ── FormField ─────────────────────────────────────────────────────────────────

function FormField({
  label, value, onChangeText, placeholder, multiline, keyboardType, C,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address';
  C: ComponentColors;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
        {label}
      </Text>
      <TextInput
        style={{
          backgroundColor: C.surface,
          borderRadius: 12, borderWidth: 1, borderColor: C.separator,
          padding: 14, fontSize: 15, color: C.label,
          minHeight: multiline ? 100 : undefined,
          textAlignVertical: multiline ? 'top' : 'center',
        }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.secondary}
        multiline={multiline}
        keyboardType={keyboardType}
      />
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root: { flex: 1 },

  // ── Top bar
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  topBar: { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  topBarBtn:   { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  topBarRight: { width: 80, alignItems: 'flex-end', justifyContent: 'center' },
  topBarPill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1, maxWidth: 200 },
  topBarPillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },

  // ── Filter pills row
  pillsRow: {
    height: PILLS_H, borderBottomWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
  },
  pillsScroll: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  pill: { paddingHorizontal: 13, paddingVertical: 6, borderRadius: 14, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 5 },
  pillText: { fontSize: 13, fontWeight: '600', letterSpacing: 0.2 },
  pillBadge: { minWidth: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  pillBadgeText: { fontSize: 10, fontWeight: '700' },

  scroll: { flex: 1 },
  listPad: { paddingHorizontal: 16, paddingTop: 4 },

  // ── Inquiry cards
  inqCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    borderRadius: 14, borderWidth: StyleSheet.hairlineWidth,
    padding: 14, gap: 12, marginBottom: 10,
  },
  inqAvatar: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  inqAvatarText: { fontSize: 14, fontWeight: '700' },
  inqTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  inqTitle: { fontSize: 14, fontWeight: '700', lineHeight: 20, marginBottom: 6 },
  inqSender: { flex: 1, fontSize: 12, fontWeight: '400' },
  inqMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inqDate: { fontSize: 11, fontWeight: '400', marginLeft: 'auto' },

  // ── Status & type pills
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, flexShrink: 0 },
  statusPillText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.1 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  typeBadgeText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.1 },

  // ── Empty state
  emptyWrap: { alignItems: 'center', paddingVertical: 56, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptySubtitle: { fontSize: 14, fontWeight: '400', textAlign: 'center', paddingHorizontal: 32 },

  // ── Detail view
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 14, paddingVertical: 4 },
  backText: { fontSize: 14, fontWeight: '500' },

  senderCard: { borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, marginBottom: 10 },
  senderAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  senderAvatarText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  senderName: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  senderCompany: { fontSize: 13, fontWeight: '400' },
  senderDate: { fontSize: 11, fontWeight: '400' },

  contactCard: { borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  contactDivider: { height: StyleSheet.hairlineWidth },
  contactText: { fontSize: 14, fontWeight: '400', flex: 1 },

  detailSection: { marginBottom: 16 },
  detailSectionHeader: {
    fontSize: 11, fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: 0.9,
    marginBottom: 10,
  },
  detailCard: { borderRadius: 14, padding: 16 },
  detailDesc: { fontSize: 15, lineHeight: 23, fontWeight: '400', marginBottom: 4 },
  detailMeta: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: 14, paddingTop: 14, gap: 0 },
  detailMetaItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 8 },
  detailMetaLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  detailMetaValue: { fontSize: 14, fontWeight: '600' },

  messagesCard: { borderRadius: 14, overflow: 'hidden' },
  msgRow: { paddingHorizontal: 14, paddingVertical: 12 },
  msgBubble: { maxWidth: '80%', borderRadius: 14, padding: 12 },
  msgText: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  msgTime: { fontSize: 11, fontWeight: '400', marginTop: 4 },
  replyRow: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderTopWidth: StyleSheet.hairlineWidth },
  replyInput: { flex: 1, borderRadius: 20, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  replyPlaceholder: { fontSize: 14 },
  replySend: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },

  // ── Bottom bars
  actionsBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 16, paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 12, paddingVertical: 13 },
  actionBtnText: { fontSize: 14, fontWeight: '600' },
  actionBtnIcon: { width: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  ctaBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  ctaBtn: { borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15 },
  ctaBtnText: { fontSize: 16, fontWeight: '700' },

  // ── Follower view
  introBlock: { paddingVertical: 8, marginBottom: 24 },
  introTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, marginBottom: 8 },
  introSub: { fontSize: 15, lineHeight: 23, fontWeight: '400' },

  servicesSection: { marginBottom: 24 },
  glassCard: { borderRadius: 12, overflow: 'hidden' },
  svcRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, gap: 12 },
  svcIconCircle: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  svcTitle: { flex: 1, fontSize: 14, fontWeight: '600' },
  svcPrice: { fontSize: 13, fontWeight: '500' },

  trustedRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  trustedBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  trustedAvatar: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  trustedInitials: { fontSize: 11, fontWeight: '700' },
  trustedName: { fontSize: 13, fontWeight: '600' },

  // ── Inquiry form
  formLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  typePickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typePill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1 },
  typePillText: { fontSize: 13, fontWeight: '600' },
});
