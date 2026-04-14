/**
 * Creator Tools — Hub with 5 tappable tool cards.
 * Tap a card to open that tool full-screen; pill updates to tool name.
 * Back button returns to the hub.
 * Personal Mode Owner-only management screen.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, TextInput, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { GlassView } from '@/components/ui/glass-view';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { KMenuButton } from '@/components/ui/k-menu-button';

const TOP_BAR_H = 44;
const GAIN      = '#5A8A6E';
const HEAT      = '#B85C5C';
const CAUTION   = '#B8943E';

type ToolId = 'media-kit' | 'rate-card' | 'outreach' | 'cross-post' | 'invoices';

const HUB_CARDS: { id: ToolId; icon: string; name: string; summary: string }[] = [
  { id: 'media-kit',  icon: 'doc.richtext.fill',          name: 'Media Kit',      summary: 'Last updated 2d ago'  },
  { id: 'rate-card',  icon: 'list.bullet.rectangle.fill', name: 'Rate Card',      summary: '8 services priced'    },
  { id: 'outreach',   icon: 'megaphone.fill',             name: 'Brand Outreach', summary: '3 pitches active'     },
  { id: 'cross-post', icon: 'square.and.arrow.up.fill',   name: 'Cross-Post',     summary: '4 accounts connected' },
  { id: 'invoices',   icon: 'doc.text.fill',              name: 'Invoices',       summary: '$4,500 outstanding'   },
];

// ── Rate Card data ─────────────────────────────────────────────────────────────

type RateItem = {
  id: string; service: string; price: number;
  description: string; turnaround: string; revisions: number;
};

const INITIAL_RATE_CARD: RateItem[] = [
  { id: 'r1', service: 'Sponsored Post',       price: 500,  description: 'One static post with brand integration, custom caption, and story tag.',           turnaround: '3–5 business days',    revisions: 2 },
  { id: 'r2', service: 'Sponsored Reel',       price: 750,  description: '30–60 second branded reel with editing, music, and on-screen callout.',            turnaround: '5–7 business days',    revisions: 2 },
  { id: 'r3', service: 'KTV Video',            price: 1200, description: 'Full-length branded video (5–10 min) with intro, content, and branded outro.',     turnaround: '7–10 business days',   revisions: 3 },
  { id: 'r4', service: 'Story Feature',        price: 250,  description: '3–5 story frames featuring product or brand with swipe-up link.',                  turnaround: '1–2 business days',    revisions: 1 },
  { id: 'r5', service: 'Brand Ambassadorship', price: 3000, description: 'Monthly retainer — 4 posts, 8 stories, 1 reel, and bio link inclusion.',           turnaround: 'Monthly contract',     revisions: 0 },
  { id: 'r6', service: 'Speaking Engagement',  price: 2500, description: 'In-person or virtual keynote, panel, or workshop appearance.',                     turnaround: 'By agreed date',       revisions: 0 },
  { id: 'r7', service: 'Consulting Session',   price: 150,  description: '1-hour 1-on-1 strategy session for brand partnerships or content creation.',       turnaround: 'Scheduled on booking', revisions: 0 },
  { id: 'r8', service: 'Content Bundle',       price: 2000, description: '2 posts + 1 reel + 10 stories + 1 KTV video at a bundled rate.',                   turnaround: '10–14 business days',  revisions: 3 },
];

// ── Outreach data ──────────────────────────────────────────────────────────────

type OutreachItem = {
  id: string; brand: string; status: string; dateSent: string | null; followUp: string | null;
  pitch: string; response: string | null; nextSteps: string | null;
};

const OUTREACH: OutreachItem[] = [
  { id: 'o1', brand: 'Nike',         status: 'Responded', dateSent: 'Mar 15', followUp: null,
    pitch: "Hi Nike team — I'm Sammy Kalejaiye, a sports content creator in Atlanta with 1,247 followers and a 4.8% engagement rate. My audience is 58% male 18-34, heavily sports-focused — a great fit for Nike campaigns. I'd love to discuss a sponsored post for your Spring 2024 collection.",
    response: "Thanks Sammy! We love your engagement numbers and authentic sports content. We'd like to explore a sponsored post for our Spring Collection launch. Please send over your media kit and rate card so we can move forward.",
    nextSteps: 'Send media kit and rate card to Nike partnerships team.' },
  { id: 'o2', brand: 'Gatorade',     status: 'Sent',      dateSent: 'Mar 28', followUp: 'Apr 11',
    pitch: "Hi Gatorade team — reaching out about a potential partnership for your G Series performance line. My sports-focused audience of 1,247 followers (4.8% engagement) regularly engages with training and performance content — exactly Gatorade's target demographic.",
    response: null,
    nextSteps: 'Follow up on Apr 11 if no response.' },
  { id: 'o3', brand: 'Under Armour', status: 'Deal',      dateSent: 'Feb 20', followUp: null,
    pitch: "Following up on our previous conversation — I'd love to formalize the ambassador partnership we discussed for the Training Line launch.",
    response: 'Deal finalized. 3-month ambassador agreement signed: 4 posts/month, $3,000/month retainer. Contract on file.',
    nextSteps: 'Contract signed. First deliverable due Apr 15.' },
  { id: 'o4', brand: 'Adidas',       status: 'Viewed',    dateSent: 'Apr 1',  followUp: 'Apr 15',
    pitch: "Hi Adidas partnerships — I'm Sammy Kalejaiye, a sports performance creator in Atlanta. My 4.8% engagement rate and 58% male 18-34 audience make my platform ideal for Adidas Training and Originals campaigns.",
    response: null,
    nextSteps: 'Pitch viewed Apr 2 — follow up on Apr 15.' },
  { id: 'o5', brand: 'Lululemon',    status: 'Draft',     dateSent: null,     followUp: null,
    pitch: '',
    response: null,
    nextSteps: null },
];

const SUGGESTED_BRANDS = [
  { id: 'b1', brand: 'WHOOP',           industry: 'Fitness Tech', reason: '41% of your audience is age 25-34 professionals — aligns with performance tracking products' },
  { id: 'b2', brand: 'Athletic Greens', industry: 'Nutrition',    reason: 'High overlap with sports performance niche and coaching content engagement patterns' },
  { id: 'b3', brand: 'Beam Organics',   industry: 'Wellness',     reason: '38% female audience segment matches wellness brand demographics in Atlanta market' },
  { id: 'b4', brand: 'Fanatics',        industry: 'Sports Merch', reason: 'Sports content drives 72% of your top 10 performing posts — merchandise crossover is high' },
];

// ── Cross-Post data ────────────────────────────────────────────────────────────

const CROSSPOST_QUEUE = [
  { id: 'cp1', title: 'How I Built My Brand from Zero',     time: '3d ago',  results: { ig: true,  x: true,  tk: true,  yt: false } },
  { id: 'cp2', title: 'Top 5 Recruiting Mistakes (Thread)', time: '1wk ago', results: { ig: true,  x: true,  tk: false, yt: true  } },
  { id: 'cp3', title: 'Behind the Combine: Full Recap',     time: '2wk ago', results: { ig: true,  x: true,  tk: true,  yt: true  } },
];

const CONNECTED_PLATFORMS = [
  { id: 'ig', name: 'Instagram', icon: 'instagram',  connected: true  },
  { id: 'x',  name: 'X',        icon: 'x.twitter',  connected: true  },
  { id: 'tk', name: 'TikTok',   icon: 'tiktok',     connected: true  },
  { id: 'yt', name: 'YouTube',  icon: 'youtube',    connected: true  },
  { id: 'fb', name: 'Facebook', icon: 'facebook',   connected: false },
  { id: 'li', name: 'LinkedIn', icon: 'linkedin',   connected: false },
  { id: 'th', name: 'Threads',  icon: 'threads',    connected: false },
  { id: 'sc', name: 'Snapchat', icon: 'snapchat',   connected: false },
];

// FontAwesome5 brand names (bundled in @expo/vector-icons, no system dependency)
const FA_BRAND: Record<string, string> = {
  ig: 'instagram',
  // x: no FA5 X logo — falls through to text fallback
  tk: 'tiktok',
  yt: 'youtube',
  fb: 'facebook-f',
  li: 'linkedin',
  sc: 'snapchat-ghost',
  // 'th' (Threads) not in FA5 Free — falls through to text fallback
};
const PLATFORM_LABEL: Record<string, string> = { th: 'T', x: 'X' };

function PlatformIcon({ id, size, color }: { id: string; size: number; color: string }) {
  const fa = FA_BRAND[id];
  if (fa) {
    return <FontAwesome5 name={fa as any} size={size * 0.9} color={color} brand />;
  }
  return (
    <Text style={{ fontSize: size * 0.7, fontWeight: '800', color, lineHeight: size }}>
      {PLATFORM_LABEL[id] ?? id.toUpperCase()}
    </Text>
  );
}

// ── Invoice data ───────────────────────────────────────────────────────────────

const INVOICES = [
  { id: 'inv001', num: 'INV-001', client: 'Nike',          amount: 3000, status: 'Paid',    date: 'Mar 1, 2024'  },
  { id: 'inv002', num: 'INV-002', client: 'Gatorade',      amount: 2000, status: 'Sent',    date: 'Apr 1, 2024'  },
  { id: 'inv003', num: 'INV-003', client: 'Under Armour',  amount: 1500, status: 'Paid',    date: 'Feb 15, 2024' },
  { id: 'inv004', num: 'INV-004', client: 'Self (Course)', amount: 340,  status: 'Paid',    date: 'Feb 1, 2024'  },
  { id: 'inv005', num: 'INV-005', client: 'Adidas',        amount: 2500, status: 'Overdue', date: 'Mar 15, 2024' },
];

type LineItem = { description: string; total: number };
type InvoiceDetail = { lineItems: LineItem[]; deliverables: string; paymentDate: string | null; paymentMethod: string | null };

const INVOICE_DETAILS: Record<string, InvoiceDetail> = {
  inv001: {
    lineItems: [
      { description: 'Sponsored Post — Nike Spring',  total: 1500 },
      { description: 'Sponsored Reel — Nike Spring',  total: 750  },
      { description: 'Story Feature ×4',              total: 750  },
    ],
    deliverables: 'Nike Spring 2024 Campaign',
    paymentDate: 'Mar 8, 2024',
    paymentMethod: 'Bank Transfer · Chase ••4521',
  },
  inv002: {
    lineItems: [
      { description: 'KTV Video — G Series',  total: 1200 },
      { description: 'Sponsored Post',         total: 500  },
      { description: 'Story Feature ×3',       total: 300  },
    ],
    deliverables: 'Gatorade G Series Performance Campaign',
    paymentDate: null,
    paymentMethod: null,
  },
  inv003: {
    lineItems: [
      { description: 'Content Bundle',   total: 2000 },
      { description: 'Early-book discount', total: -500 },
    ],
    deliverables: 'Under Armour Training Line Launch',
    paymentDate: 'Feb 22, 2024',
    paymentMethod: 'Wire Transfer · Wells Fargo ••7803',
  },
  inv004: {
    lineItems: [
      { description: 'Course Revenue — February Cohort', total: 340 },
    ],
    deliverables: 'Creator Masterclass — February Cohort',
    paymentDate: 'Feb 5, 2024',
    paymentMethod: 'Stripe Payout · ••9214',
  },
  inv005: {
    lineItems: [
      { description: 'Sponsored Post ×2',  total: 1000 },
      { description: 'Sponsored Reel',     total: 750  },
      { description: 'KTV Video',          total: 750  },
    ],
    deliverables: 'Adidas Training Line Campaign — March',
    paymentDate: null,
    paymentMethod: null,
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatPrice(price: number, serviceId: string): string {
  if (serviceId === 'r7') return `$${price}/hr`;
  if (serviceId === 'r5') return `$${price.toLocaleString()}/mo`;
  return `$${price.toLocaleString()}`;
}

function outreachStatusStyle(status: string): { bg: string; text: string } {
  switch (status) {
    case 'Responded': return { bg: GAIN + '22',    text: GAIN    };
    case 'Deal':      return { bg: GAIN,            text: '#fff'  };
    case 'Sent':      return { bg: CAUTION + '22', text: CAUTION };
    case 'Viewed':    return { bg: CAUTION + '22', text: CAUTION };
    case 'Declined':  return { bg: HEAT + '22',    text: HEAT    };
    default:          return { bg: 'transparent',  text: '#9C9790' };
  }
}

function invoiceStatusStyle(status: string): { bg: string; text: string } {
  switch (status) {
    case 'Paid':    return { bg: GAIN + '22',    text: GAIN    };
    case 'Sent':    return { bg: CAUTION + '22', text: CAUTION };
    case 'Overdue': return { bg: HEAT + '22',    text: HEAT    };
    default:        return { bg: 'transparent',  text: '#9C9790' };
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CreatorToolsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);

  const topBarH           = insets.top + TOP_BAR_H;
  const contentPaddingTop = topBarH + 8;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(insets.top + TOP_BAR_H + 8);

  const haptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  const [activeTool,         setActiveTool]         = useState<ToolId | null>(null);
  const [editingRateCard,    setEditingRateCard]    = useState(false);
  const [rateItems,          setRateItems]          = useState(INITIAL_RATE_CARD);
  const [crossPostMode,      setCrossPostMode]      = useState<'Off' | 'All Content' | 'Select Per Post'>('Select Per Post');
  const [mediaKitEmbedded,   setMediaKitEmbedded]   = useState(false);
  const [expandedRateId,     setExpandedRateId]     = useState<string | null>(null);
  const [expandedOutreachId, setExpandedOutreachId] = useState<string | null>(null);
  const [draftTexts,         setDraftTexts]         = useState<Record<string, string>>({ o5: '' });
  const [expandedInvoiceId,  setExpandedInvoiceId]  = useState<string | null>(null);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  function cycleCrossPostMode() {
    haptic();
    setCrossPostMode(m => m === 'Off' ? 'All Content' : m === 'All Content' ? 'Select Per Post' : 'Off');
  }

  const pillTitle = activeTool
    ? HUB_CARDS.find(c => c.id === activeTool)?.name ?? 'Creator Tools'
    : 'Creator Tools';

  // ── Hub ────────────────────────────────────────────────────────────────────

  const renderHub = () => (
    <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
      {HUB_CARDS.map((card, idx) => (
        <Pressable
          key={card.id}
          onPress={() => { haptic(); setActiveTool(card.id); }}
          style={({ pressed }) => [{ opacity: pressed ? 0.72 : 1 }, idx > 0 && { marginTop: 10 }]}
        >
          <GlassView tier={1} style={s.hubCard}>
            <View style={[s.hubIconWrap, { backgroundColor: C.bg }]}>
              <IconSymbol name={card.icon as any} size={22} color={C.label} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.hubCardName, { color: C.label }]}>{card.name}</Text>
              <Text style={[s.hubCardSummary, { color: C.secondary }]}>{card.summary}</Text>
            </View>
          </GlassView>
        </Pressable>
      ))}
    </View>
  );

  // ── Media Kit ──────────────────────────────────────────────────────────────

  const renderMediaKit = () => (
    <View style={s.section}>
      <GlassView tier={1} style={[s.card, { borderColor: C.separator, borderWidth: StyleSheet.hairlineWidth }]}>
        {/* Name / handle */}
        <Text style={[s.mkName, { color: C.label }]}>Sammy Kalejaiye</Text>
        <Text style={[s.mkHandle, { color: C.secondary, marginTop: 2 }]}>@sammykalejaiye · Atlanta, GA</Text>

        <View style={[s.divider, { backgroundColor: C.separator, marginTop: 14, marginBottom: 14 }]} />

        {/* Stats */}
        <View style={s.mkStatsRow}>
          {[{ value: '1,247', label: 'followers' }, { value: '4.8%', label: 'eng rate' }, { value: '58%', label: 'male' }].map(stat => (
            <View key={stat.label} style={s.mkStat}>
              <Text style={[s.mkStatValue, { color: C.label }]}>{stat.value}</Text>
              <Text style={[s.mkStatLabel, { color: C.secondary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={[s.divider, { backgroundColor: C.separator, marginTop: 14, marginBottom: 14 }]} />

        {/* Top locations */}
        <Text style={[s.mkFieldLabel, { color: C.secondary }]}>Top locations</Text>
        <Text style={[s.mkFieldValue, { color: C.label, marginTop: 4 }]}>Atlanta · LA · New York · Houston · Chicago</Text>

        <View style={{ marginTop: 16 }}>
          <Text style={[s.mkFieldLabel, { color: C.secondary }]}>Audience age</Text>
          <Text style={[s.mkFieldValue, { color: C.label, marginTop: 4 }]}>18-24: 22%  ·  25-34: 41%  ·  35-44: 24%  ·  45+: 13%</Text>
        </View>

        <View style={[s.divider, { backgroundColor: C.separator, marginTop: 16, marginBottom: 14 }]} />

        {/* Top content */}
        <Text style={[s.mkFieldLabel, { color: C.secondary }]}>Top content</Text>
        {[
          { title: 'How I Built My Brand from Zero', views: '14.2K' },
          { title: 'Top 5 Recruiting Mistakes',      views: '8.1K'  },
          { title: 'Behind the Combine: Full Recap', views: '6.8K'  },
        ].map(item => (
          <View key={item.title} style={[s.mkContentRow, { marginTop: 8 }]}>
            <Text style={[s.mkContentTitle, { color: C.label }]} numberOfLines={1}>{item.title}</Text>
            <Text style={[s.mkContentViews, { color: C.secondary }]}>{item.views} views</Text>
          </View>
        ))}

        <View style={[s.divider, { backgroundColor: C.separator, marginTop: 16, marginBottom: 14 }]} />

        {/* Partnerships & rates */}
        <Text style={[s.mkFieldLabel, { color: C.secondary }]}>Past partnerships</Text>
        <Text style={[s.mkFieldValue, { color: C.label, marginTop: 4 }]}>Nike · Gatorade · Under Armour</Text>

        <View style={{ marginTop: 16 }}>
          <Text style={[s.mkFieldLabel, { color: C.secondary }]}>Rate summary</Text>
          <Text style={[s.mkFieldValue, { color: C.label, marginTop: 4 }]}>Posts from $500 · Videos from $1,200 · Bundles from $2,000</Text>
        </View>
      </GlassView>

      <View style={[s.btnRow, { marginTop: 12 }]}>
        <Pressable style={[s.outlineBtn, { borderColor: C.separator, backgroundColor: C.surface }]} onPress={() => haptic()}>
          <Text style={[s.outlineBtnText, { color: C.label }]}>Download PDF</Text>
        </Pressable>
        <Pressable style={[s.outlineBtn, { borderColor: C.separator, backgroundColor: C.surface }]} onPress={() => haptic()}>
          <Text style={[s.outlineBtnText, { color: C.label }]}>Copy Link</Text>
        </Pressable>
        <Pressable
          style={[s.outlineBtn, { borderColor: C.separator, backgroundColor: mediaKitEmbedded ? C.label : C.surface }]}
          onPress={() => { haptic(); setMediaKitEmbedded(v => !v); }}
        >
          {mediaKitEmbedded && <IconSymbol name="checkmark" size={12} color={C.bg} />}
          <Text style={[s.outlineBtnText, { color: mediaKitEmbedded ? C.bg : C.label }]}>Embed</Text>
        </Pressable>
      </View>

      <Pressable style={[s.dipsonBar, { backgroundColor: C.surface, borderColor: C.separator }]} onPress={() => haptic()}>
        <IconSymbol name="wand.and.stars" size={15} color={C.secondary} />
        <Text style={[s.dipsonText, { color: C.secondary }]} numberOfLines={1}>Customize this media kit for a specific brand…</Text>
      </Pressable>

      <Pressable style={[s.fullBtn, { backgroundColor: C.bg, borderColor: C.separator }]} onPress={() => haptic()}>
        <IconSymbol name="video.fill" size={15} color={C.secondary} />
        <Text style={[{ fontSize: 14, fontWeight: '600', color: C.label }]}>Generate Video Kit</Text>
      </Pressable>
    </View>
  );

  // ── Rate Card ──────────────────────────────────────────────────────────────

  const renderRateCard = () => (
    <View style={s.section}>
      <View style={s.sectionHeaderRow}>
        <Text style={[s.sectionHeader, { color: C.label }]}>Rate Card</Text>
        <Pressable onPress={() => { haptic(); setEditingRateCard(v => !v); if (!editingRateCard) setExpandedRateId(null); }}>
          <Text style={[s.linkBtn, { color: C.secondary }]}>{editingRateCard ? 'Done' : 'Edit'}</Text>
        </Pressable>
      </View>

      <GlassView tier={1} style={s.listCard}>
        {rateItems.map((item, idx) => {
          const isExpanded = !editingRateCard && expandedRateId === item.id;
          return (
            <View key={item.id}>
              <Pressable
                style={[s.listRow, { backgroundColor: C.surface }, idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}
                onPress={() => {
                  if (editingRateCard) return;
                  haptic();
                  setExpandedRateId(prev => prev === item.id ? null : item.id);
                }}
              >
                {editingRateCard && (
                  <Pressable onPress={() => { haptic(); setRateItems(prev => prev.filter(r => r.id !== item.id)); }} hitSlop={8}>
                    <IconSymbol name="trash" size={15} color={HEAT} />
                  </Pressable>
                )}
                <Text style={[s.listItemName, { color: C.label }]}>{item.service}</Text>
                <Text style={[{ fontSize: 15, fontWeight: '700', color: C.label }]}>{formatPrice(item.price, item.id)}</Text>
                {!editingRateCard && (
                  <IconSymbol name={isExpanded ? 'chevron.up' : 'chevron.down'} size={13} color={C.secondary} />
                )}
              </Pressable>

              {isExpanded && (
                <View style={[s.expandedPanel, { backgroundColor: C.bg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}>
                  <View style={s.expandedGrid}>
                    <View style={s.expandedCell}>
                      <Text style={[s.expandedMetaLabel, { color: C.secondary }]}>TURNAROUND</Text>
                      <Text style={[s.expandedMetaValue, { color: C.label }]}>{item.turnaround}</Text>
                    </View>
                    {item.revisions > 0 && (
                      <View style={s.expandedCell}>
                        <Text style={[s.expandedMetaLabel, { color: C.secondary }]}>REVISIONS</Text>
                        <Text style={[s.expandedMetaValue, { color: C.label }]}>{item.revisions} included</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[s.expandedBody, { color: C.secondary }]}>{item.description}</Text>
                  <Pressable style={[s.expandedEditBtn, { borderColor: C.separator, backgroundColor: C.surface }]} onPress={() => haptic()}>
                    <IconSymbol name="pencil" size={12} color={C.label} />
                    <Text style={[{ fontSize: 13, fontWeight: '600', color: C.label }]}>Edit Price</Text>
                  </Pressable>
                </View>
              )}
            </View>
          );
        })}
        {editingRateCard && (
          <Pressable
            style={[{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 13, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}
            onPress={() => haptic()}
          >
            <IconSymbol name="plus" size={14} color={C.secondary} />
            <Text style={[{ fontSize: 14, color: C.secondary }]}>Add Service</Text>
          </Pressable>
        )}
      </GlassView>

      <Pressable style={[s.dipsonBar, { backgroundColor: C.surface, borderColor: C.separator, marginTop: 10 }]} onPress={() => haptic()}>
        <IconSymbol name="sparkles" size={15} color={C.secondary} />
        <Text style={[s.dipsonText, { color: C.secondary }]}>Suggest Rates with Dipson</Text>
      </Pressable>
    </View>
  );

  // ── Brand Outreach ─────────────────────────────────────────────────────────

  const renderOutreach = () => (
    <View style={s.section}>
      <View style={s.sectionHeaderRow}>
        <Text style={[s.sectionHeader, { color: C.label }]}>Outreach Tracker</Text>
        <Pressable onPress={() => haptic()}>
          <Text style={[s.linkBtn, { color: C.secondary }]}>+ New Pitch</Text>
        </Pressable>
      </View>

      <GlassView tier={1} style={s.listCard}>
        {OUTREACH.map((item, idx) => {
          const st = outreachStatusStyle(item.status);
          const isExpanded = expandedOutreachId === item.id;
          const isDraft    = item.status === 'Draft';
          const draftText  = draftTexts[item.id] ?? item.pitch;

          return (
            <View key={item.id}>
              <Pressable
                style={[s.listRow, { backgroundColor: C.surface }, idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}
                onPress={() => { haptic(); setExpandedOutreachId(prev => prev === item.id ? null : item.id); }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[s.listItemName, { color: C.label }]}>{item.brand}</Text>
                  {item.dateSent && (
                    <Text style={[s.metaText, { color: C.secondary }]}>
                      Sent {item.dateSent}{item.followUp ? ` · Follow-up: ${item.followUp}` : ''}
                    </Text>
                  )}
                  {isDraft && !item.dateSent && (
                    <Text style={[s.metaText, { color: C.secondary }]}>Not sent yet</Text>
                  )}
                </View>
                <View style={[s.statusPill, { backgroundColor: st.bg, borderColor: st.text + '44' }]}>
                  {item.status === 'Viewed' && <IconSymbol name="eye" size={11} color={st.text} />}
                  <Text style={[s.statusText, { color: st.text }]}>{item.status}</Text>
                </View>
                <IconSymbol name={isExpanded ? 'chevron.up' : 'chevron.down'} size={13} color={C.secondary} />
              </Pressable>

              {isExpanded && (
                <View style={[s.expandedPanel, { backgroundColor: C.bg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}>
                  {isDraft ? (
                    /* Draft — editable pitch */
                    <>
                      <Text style={[s.expandedMetaLabel, { color: C.secondary, marginBottom: 6 }]}>PITCH DRAFT</Text>
                      <TextInput
                        style={[s.pitchInput, { color: C.label, borderColor: C.separator, backgroundColor: C.surface }]}
                        multiline
                        placeholder="Write your pitch to Lululemon…"
                        placeholderTextColor={C.secondary}
                        value={draftText}
                        onChangeText={text => setDraftTexts(prev => ({ ...prev, [item.id]: text }))}
                      />
                      <View style={[s.btnRow, { marginTop: 10 }]}>
                        <Pressable style={[s.outlineBtn, { borderColor: C.separator, backgroundColor: C.surface }]} onPress={() => haptic()}>
                          <Text style={[s.outlineBtnText, { color: C.label }]}>Save Draft</Text>
                        </Pressable>
                        <Pressable style={[s.outlineBtn, { flex: 2, borderColor: C.label, backgroundColor: C.label }]} onPress={() => haptic()}>
                          <Text style={[s.outlineBtnText, { color: C.bg }]}>Send Pitch</Text>
                        </Pressable>
                      </View>
                    </>
                  ) : (
                    /* Sent / Responded / Deal / Viewed */
                    <>
                      <Text style={[s.expandedMetaLabel, { color: C.secondary, marginBottom: 6 }]}>PITCH SENT</Text>
                      <Text style={[s.expandedBody, { color: C.label, marginBottom: 12 }]}>{item.pitch}</Text>

                      {item.response && (
                        <>
                          <Text style={[s.expandedMetaLabel, { color: GAIN, marginBottom: 6 }]}>RESPONSE RECEIVED</Text>
                          <Text style={[s.expandedBody, { color: C.label, marginBottom: 12 }]}>{item.response}</Text>
                        </>
                      )}

                      {item.nextSteps && (
                        <>
                          <Text style={[s.expandedMetaLabel, { color: C.secondary, marginBottom: 4 }]}>NEXT STEPS</Text>
                          <Text style={[s.expandedBody, { color: C.secondary, marginBottom: 12 }]}>{item.nextSteps}</Text>
                        </>
                      )}

                      <View style={[s.btnRow]}>
                        {item.status !== 'Deal' && (
                          <Pressable style={[s.outlineBtn, { borderColor: C.separator, backgroundColor: C.surface }]} onPress={() => haptic()}>
                            <Text style={[s.outlineBtnText, { color: C.label }]}>Reply</Text>
                          </Pressable>
                        )}
                        {(item.status === 'Responded') && (
                          <Pressable style={[s.outlineBtn, { flex: 2, borderColor: GAIN + '66', backgroundColor: GAIN + '15' }]} onPress={() => haptic()}>
                            <Text style={[s.outlineBtnText, { color: GAIN }]}>Move to Deals</Text>
                          </Pressable>
                        )}
                        {item.status !== 'Deal' && (
                          <Pressable style={[s.outlineBtn, { borderColor: C.separator, backgroundColor: C.surface }]} onPress={() => haptic()}>
                            <Text style={[s.outlineBtnText, { color: C.secondary }]}>Archive</Text>
                          </Pressable>
                        )}
                        {item.status === 'Deal' && (
                          <Pressable style={[s.outlineBtn, { flex: 1, borderColor: C.separator, backgroundColor: C.surface }]} onPress={() => haptic()}>
                            <Text style={[s.outlineBtnText, { color: C.label }]}>View Contract</Text>
                          </Pressable>
                        )}
                      </View>
                    </>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </GlassView>

      <Text style={[s.subHeader, { color: C.secondary, marginTop: 24 }]}>BRAND DISCOVERY</Text>
      <GlassView tier={1} style={s.listCard}>
        {SUGGESTED_BRANDS.map((item, idx) => (
          <View
            key={item.id}
            style={[{ paddingHorizontal: 14, paddingVertical: 14, backgroundColor: C.surface }, idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={[s.listItemName, { color: C.label }]}>{item.brand}</Text>
              <View style={[{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, backgroundColor: C.bg, borderColor: C.separator }]}>
                <Text style={[{ fontSize: 11, fontWeight: '600', color: C.secondary }]}>{item.industry}</Text>
              </View>
            </View>
            <Text style={[s.metaText, { color: C.secondary, marginTop: 4 }]}>{item.reason}</Text>
            <Pressable style={{ marginTop: 8, alignSelf: 'flex-end' }} onPress={() => haptic()}>
              <Text style={[{ fontSize: 13, fontWeight: '700', color: C.label }]}>Draft Pitch</Text>
            </Pressable>
          </View>
        ))}
      </GlassView>
    </View>
  );

  // ── Cross-Post ─────────────────────────────────────────────────────────────

  const renderCrossPost = () => (
    <View style={s.section}>
      <View style={s.sectionHeaderRow}>
        <Text style={[s.sectionHeader, { color: C.label }]}>Cross-Post</Text>
        <Pressable onPress={() => haptic()}>
          <Text style={[s.linkBtn, { color: C.secondary }]}>Manage</Text>
        </Pressable>
      </View>

      <View style={s.platformRow}>
        {CONNECTED_PLATFORMS.map(p => (
          <Pressable
            key={p.id}
            style={[s.platformCircle, { backgroundColor: p.connected ? C.surface : C.bg, borderColor: C.separator }]}
            onPress={() => haptic()}
          >
            <PlatformIcon id={p.id} size={18} color={p.connected ? C.label : C.muted} />
            {p.connected && <View style={[s.connectedDot, { backgroundColor: GAIN }]} />}
          </Pressable>
        ))}
      </View>

      <GlassView tier={1} style={[s.card, { marginBottom: 12 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={[s.listItemName, { color: C.label }]}>Auto Cross-Post</Text>
            <Text style={[s.metaText, { color: C.secondary, marginTop: 2 }]}>Choose which platforms per post</Text>
          </View>
          <Pressable
            style={[{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, backgroundColor: C.bg, borderColor: C.separator }]}
            onPress={cycleCrossPostMode}
          >
            <Text style={[{ fontSize: 12, fontWeight: '600', color: C.label }]}>{crossPostMode}</Text>
            <IconSymbol name="chevron.down" size={11} color={C.secondary} />
          </Pressable>
        </View>
      </GlassView>

      <GlassView tier={1} style={s.listCard}>
        <Text style={[s.subHeader, { color: C.secondary, paddingHorizontal: 14, paddingTop: 12, marginBottom: 0 }]}>RECENT CROSS-POSTS</Text>
        {CROSSPOST_QUEUE.map(item => (
          <View key={item.id} style={[{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={[s.listItemName, { color: C.label }]} numberOfLines={1}>{item.title}</Text>
              <View style={{ flexDirection: 'row', gap: 5, marginTop: 6 }}>
                {Object.entries(item.results).map(([p, ok]) => (
                  <View
                    key={p}
                    style={[s.platformBadge, { backgroundColor: ok ? GAIN + '22' : HEAT + '22', borderColor: ok ? GAIN : HEAT }]}
                  >
                    <PlatformIcon id={p} size={11} color={ok ? GAIN : HEAT} />
                  </View>
                ))}
              </View>
            </View>
            <Text style={[s.metaText, { color: C.secondary }]}>{item.time}</Text>
          </View>
        ))}
      </GlassView>
    </View>
  );

  // ── Invoices ───────────────────────────────────────────────────────────────

  const renderInvoices = () => {
    const outstanding = INVOICES.filter(i => i.status === 'Sent' || i.status === 'Overdue').reduce((a, b) => a + b.amount, 0);
    const paidMonth   = INVOICES.filter(i => i.status === 'Paid' && i.date.includes('Mar')).reduce((a, b) => a + b.amount, 0);
    const paidYear    = INVOICES.filter(i => i.status === 'Paid').reduce((a, b) => a + b.amount, 0);

    return (
      <View style={s.section}>
        <View style={s.sectionHeaderRow}>
          <Text style={[s.sectionHeader, { color: C.label }]}>Invoices</Text>
          <Pressable onPress={() => haptic()}>
            <Text style={[s.linkBtn, { color: C.secondary }]}>+ New Invoice</Text>
          </Pressable>
        </View>

        <GlassView tier={1} style={[s.card, { marginBottom: 12 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {[
              { value: `$${outstanding.toLocaleString()}`, label: 'Outstanding',     color: HEAT    },
              { value: `$${paidMonth.toLocaleString()}`,   label: 'Paid This Month', color: C.label },
              { value: `$${paidYear.toLocaleString()}`,    label: 'Paid This Year',  color: GAIN    },
            ].map((item, i) => (
              <React.Fragment key={item.label}>
                {i > 0 && <View style={[{ width: 1, height: 36, marginHorizontal: 8, backgroundColor: C.separator }]} />}
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={[{ fontSize: 17, fontWeight: '800', color: item.color }]}>{item.value}</Text>
                  <Text style={[{ fontSize: 11, marginTop: 3, color: C.secondary }]}>{item.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </GlassView>

        <GlassView tier={1} style={s.listCard}>
          {INVOICES.map((inv, idx) => {
            const st         = invoiceStatusStyle(inv.status);
            const isExpanded = expandedInvoiceId === inv.id;
            const detail     = INVOICE_DETAILS[inv.id];
            const isOverdue  = inv.status === 'Overdue';

            return (
              <View key={inv.id}>
                <Pressable
                  style={[{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 13, backgroundColor: C.surface }, idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}
                  onPress={() => { haptic(); setExpandedInvoiceId(prev => prev === inv.id ? null : inv.id); }}
                >
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[{ fontSize: 11, color: C.secondary }]}>{inv.num}</Text>
                      <Text style={[{ fontSize: 15, fontWeight: '600', color: C.label }]}>{inv.client}</Text>
                    </View>
                    <Text style={[s.metaText, { color: C.secondary, marginTop: 2 }]}>{inv.date}</Text>
                  </View>
                  <Text style={[{ fontSize: 15, fontWeight: '700', color: C.label, marginRight: 8 }]}>${inv.amount.toLocaleString()}</Text>
                  <View style={[s.statusPill, { backgroundColor: st.bg, borderColor: st.text + '44' }]}>
                    <Text style={[s.statusText, { color: st.text }]}>{inv.status}</Text>
                  </View>
                  <IconSymbol name={isExpanded ? 'chevron.up' : 'chevron.down'} size={13} color={C.secondary} />
                </Pressable>

                {isExpanded && detail && (
                  <View style={[s.expandedPanel, { backgroundColor: C.bg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}>
                    {/* Deliverables */}
                    <Text style={[s.expandedMetaLabel, { color: C.secondary, marginBottom: 4 }]}>DELIVERABLES</Text>
                    <Text style={[s.expandedBody, { color: C.label, marginBottom: 14 }]}>{detail.deliverables}</Text>

                    {/* Line items */}
                    <Text style={[s.expandedMetaLabel, { color: C.secondary, marginBottom: 8 }]}>LINE ITEMS</Text>
                    {detail.lineItems.map((li, liIdx) => (
                      <View key={liIdx} style={[s.lineItemRow, liIdx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}>
                        <Text style={[{ flex: 1, fontSize: 13, color: C.label }]}>{li.description}</Text>
                        <Text style={[{ fontSize: 13, fontWeight: '700', color: li.total < 0 ? HEAT : C.label }]}>
                          {li.total < 0 ? `−$${Math.abs(li.total).toLocaleString()}` : `$${li.total.toLocaleString()}`}
                        </Text>
                      </View>
                    ))}
                    <View style={[s.lineItemRow, s.lineItemTotal, { borderTopWidth: 1, borderTopColor: C.separator }]}>
                      <Text style={[{ flex: 1, fontSize: 14, fontWeight: '700', color: C.label }]}>Total</Text>
                      <Text style={[{ fontSize: 14, fontWeight: '800', color: C.label }]}>${inv.amount.toLocaleString()}</Text>
                    </View>

                    {/* Payment info */}
                    {detail.paymentDate && (
                      <View style={[s.expandedGrid, { marginTop: 14 }]}>
                        <View style={s.expandedCell}>
                          <Text style={[s.expandedMetaLabel, { color: C.secondary }]}>PAID ON</Text>
                          <Text style={[s.expandedMetaValue, { color: C.label }]}>{detail.paymentDate}</Text>
                        </View>
                        {detail.paymentMethod && (
                          <View style={s.expandedCell}>
                            <Text style={[s.expandedMetaLabel, { color: C.secondary }]}>METHOD</Text>
                            <Text style={[s.expandedMetaValue, { color: C.label }]}>{detail.paymentMethod}</Text>
                          </View>
                        )}
                      </View>
                    )}

                    {/* Actions */}
                    {isOverdue && (
                      <Pressable style={[s.fullActionBtn, { backgroundColor: HEAT + '15', borderColor: HEAT + '66', marginTop: 14 }]} onPress={() => haptic()}>
                        <IconSymbol name="bell.fill" size={15} color={HEAT} />
                        <Text style={[{ fontSize: 14, fontWeight: '700', color: HEAT }]}>Send Reminder</Text>
                      </Pressable>
                    )}
                    <View style={[s.btnRow, { marginTop: isOverdue ? 8 : 14 }]}>
                      <Pressable style={[s.outlineBtn, { borderColor: C.separator, backgroundColor: C.surface }]} onPress={() => haptic()}>
                        <IconSymbol name="arrow.down.doc" size={13} color={C.label} />
                        <Text style={[s.outlineBtnText, { color: C.label }]}>Download PDF</Text>
                      </Pressable>
                      <Pressable style={[s.outlineBtn, { borderColor: C.separator, backgroundColor: C.surface }]} onPress={() => haptic()}>
                        <IconSymbol name="paperplane" size={13} color={C.label} />
                        <Text style={[s.outlineBtnText, { color: C.label }]}>Resend</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </GlassView>
      </View>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const renderToolContent = () => {
    switch (activeTool) {
      case 'media-kit':  return renderMediaKit();
      case 'rate-card':  return renderRateCard();
      case 'outreach':   return renderOutreach();
      case 'cross-post': return renderCrossPost();
      case 'invoices':   return renderInvoices();
      default:           return renderHub();
    }
  };

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          {activeTool ? (
            <Pressable onPress={() => { haptic(); setActiveTool(null); }} hitSlop={8} style={s.iconBtn}>
              <IconSymbol name="chevron.left" size={20} color={C.label} />
            </Pressable>
          ) : (
            <Pressable onPress={() => { haptic(); openSidePanel(); }} hitSlop={8} style={s.iconBtn}>
              <KMenuButton />
            </Pressable>
          )}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.centerPill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.centerPillText, { color: C.label }]}>{pillTitle}</Text>
            </View>
          </View>
          <View style={s.iconBtn} />
        </View>
      </Animated.View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {renderToolContent()}
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root:    { flex: 1 },
    topBarOuter: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topBar: {
      flexDirection: 'row', alignItems: 'flex-end',
      paddingHorizontal: 16, paddingBottom: 8,
    },
    iconBtn:        { width: 36, height: TOP_BAR_H, alignItems: 'center', justifyContent: 'center' },
    centerPill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
    centerPillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },

    hubCard:        { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
    hubIconWrap:    { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    hubCardName:    { fontSize: 16, fontWeight: '700' },
    hubCardSummary: { fontSize: 13, marginTop: 2 },

    divider:          { height: StyleSheet.hairlineWidth },
    section:          { marginTop: 16, paddingHorizontal: 16 },
    sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    sectionHeader:    { fontSize: 17, fontWeight: '800' },
    linkBtn:          { fontSize: 14, fontWeight: '600' },
    subHeader:        { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
    card:             { borderRadius: 12, padding: 16 },
    listCard:         { borderRadius: 12, overflow: 'hidden' },
    listRow:          { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 13 },
    listItemName:     { flex: 1, fontSize: 15, fontWeight: '600' },
    metaText:         { fontSize: 12 },
    statusPill:       { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
    statusText:       { fontSize: 11, fontWeight: '700' },
    btnRow:           { flexDirection: 'row', gap: 8 },
    outlineBtn:       { flex: 1, height: 38, borderRadius: 10, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
    outlineBtnText:   { fontSize: 12, fontWeight: '600' },
    dipsonBar:        { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, borderWidth: 1 },
    dipsonText:       { flex: 1, fontSize: 13 },
    fullBtn:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10, height: 40, borderRadius: 10, borderWidth: 1 },
    fullActionBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 44, borderRadius: 10, borderWidth: 1 },

    // Media Kit
    mkName:         { fontSize: 17, fontWeight: '800' },
    mkHandle:       { fontSize: 13 },
    mkStatsRow:     { flexDirection: 'row' },
    mkStat:         { flex: 1, alignItems: 'center' },
    mkStatValue:    { fontSize: 15, fontWeight: '800' },
    mkStatLabel:    { fontSize: 11, marginTop: 2 },
    mkFieldLabel:   { fontSize: 11, fontWeight: '600', letterSpacing: 0.4 },
    mkFieldValue:   { fontSize: 13, lineHeight: 19 },
    mkContentRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    mkContentTitle: { flex: 1, fontSize: 13, fontWeight: '600', marginRight: 8 },
    mkContentViews: { fontSize: 12 },

    // Platform circles
    platformRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
    platformCircle: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
    connectedDot:   { position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: 5 },
    platformBadge:  { width: 24, height: 24, borderRadius: 6, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },

    // Expanded panels
    expandedPanel:    { paddingHorizontal: 14, paddingVertical: 14 },
    expandedGrid:     { flexDirection: 'row', gap: 16, marginBottom: 10 },
    expandedCell:     { flex: 1 },
    expandedMetaLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
    expandedMetaValue: { fontSize: 13, fontWeight: '600', marginTop: 3 },
    expandedBody:     { fontSize: 13, lineHeight: 19 },
    expandedEditBtn:  { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1, marginTop: 10 },

    // Pitch input
    pitchInput: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, padding: 12, fontSize: 13, lineHeight: 20, minHeight: 100, textAlignVertical: 'top' },

    // Invoice line items
    lineItemRow:   { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 7 },
    lineItemTotal: { marginTop: 2 },
  });
}
