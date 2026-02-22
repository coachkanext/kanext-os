/**
 * BusinessMediaProof — Media/Proof tab for Business Mode.
 * 8 sub-tabs: Overview, Library, Proof Packs, Playlists,
 * Case Studies, Press, Rights, Share Links.
 *
 * RBAC:
 *   B1 — all 8 sub-tabs
 *   B2b — overview, proof_packs, case_studies, press
 *   B2a — overview, proof_packs, case_studies
 *   B3 — overview, case_studies
 */

import React, { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, BusinessPalette , MODE_ACCENT } from '@/constants/theme';
import { EntityScopeBar } from '@/components/business/entity-scope-bar';
import {
  BizCard,
  BizCardTitle,
  BizSubTabBar,
  BizStatusChip,
  BizEmptyLock,
  statusColor,
  statusVariant,
} from '@/components/business/business-shared';
import { isFounder, isBoardLevel, isInvestor } from '@/utils/business-rbac';
import type { BusinessRoleLens } from '@/utils/business-rbac';
import { DEFAULT_ENTITY } from '@/data/mock-business-v3';
import {
  MEDIA_SUB_TABS,
  MEDIA_OVERVIEW,
  MEDIA_LIBRARY,
  PROOF_PACKS,
  PLAYLISTS,
  CASE_STUDIES,
  PRESS_ITEMS,
  RIGHTS_ITEMS,
  SHARE_LINKS,
} from '@/data/mock-biz-media-proof';
import type {
  MediaSubTab,
  MediaAsset,
  ProofPack,
  Playlist,
  CaseStudy,
  PressItem,
  RightsItem,
  ShareLink,
} from '@/data/mock-biz-media-proof';

// =============================================================================
// CONSTANTS
// =============================================================================


const ACCENT = MODE_ACCENT.business;
const BP = BusinessPalette;

// =============================================================================
// RBAC — sub-tab visibility per role
// =============================================================================

const SUB_TAB_ACCESS: Record<BusinessRoleLens, MediaSubTab[]> = {
  B1: ['overview', 'library', 'proof_packs', 'playlists', 'case_studies', 'press', 'rights', 'share_links'],
  B2b: ['overview', 'proof_packs', 'case_studies', 'press'],
  B2a: ['overview', 'proof_packs', 'case_studies'],
  B3: ['overview', 'case_studies'],
  B4: ['overview', 'case_studies'],
  B5: ['overview', 'case_studies'],
};

function getAllowedTabs(role: BusinessRoleLens) {
  const allowed = SUB_TAB_ACCESS[role] ?? SUB_TAB_ACCESS.B3;
  return MEDIA_SUB_TABS.filter((t) => allowed.includes(t.id));
}

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  role?: BusinessRoleLens;
}

// =============================================================================
// HELPERS
// =============================================================================

function mediaTypeIcon(type: MediaAsset['type']): string {
  switch (type) {
    case 'video':
      return 'play.circle.fill';
    case 'image':
      return 'photo.fill';
    case 'document':
      return 'doc.text.fill';
    case 'deck':
      return 'rectangle.stack.fill';
    case 'audio':
      return 'waveform.circle.fill';
    default:
      return 'doc.fill';
  }
}

function pressTypeLabel(type: PressItem['type']): string {
  switch (type) {
    case 'article':
      return 'Article';
    case 'interview':
      return 'Interview';
    case 'mention':
      return 'Mention';
    case 'podcast':
      return 'Podcast';
    default:
      return type;
  }
}

function sentimentColor(sentiment: PressItem['sentiment']): string {
  switch (sentiment) {
    case 'positive':
      return BP.emerald;
    case 'neutral':
      return BP.ash;
    case 'negative':
      return BP.red;
    default:
      return BP.ash;
  }
}

function rightsStatusVariant(status: RightsItem['status']): 'success' | 'warning' | 'error' {
  switch (status) {
    case 'active':
      return 'success';
    case 'expiring_soon':
      return 'warning';
    case 'expired':
      return 'error';
    default:
      return 'neutral' as any;
  }
}

function rightsStatusLabel(status: RightsItem['status']): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'expiring_soon':
      return 'Expiring Soon';
    case 'expired':
      return 'Expired';
    default:
      return status;
  }
}

function shareLinkStatusVariant(status: ShareLink['status']): 'success' | 'warning' | 'error' {
  switch (status) {
    case 'active':
      return 'success';
    case 'expired':
      return 'error';
    case 'revoked':
      return 'error';
    default:
      return 'neutral' as any;
  }
}

function shareLinkStatusLabel(status: ShareLink['status']): string {
  switch (status) {
    case 'active':
      return 'Active';
    case 'expired':
      return 'Expired';
    case 'revoked':
      return 'Revoked';
    default:
      return status;
  }
}

function proofPackStatusVariant(status: ProofPack['status']): 'success' | 'warning' | 'neutral' {
  switch (status) {
    case 'published':
      return 'success';
    case 'draft':
      return 'warning';
    case 'archived':
      return 'neutral';
    default:
      return 'neutral';
  }
}

function proofPackStatusLabel(status: ProofPack['status']): string {
  switch (status) {
    case 'published':
      return 'Published';
    case 'draft':
      return 'Draft';
    case 'archived':
      return 'Archived';
    default:
      return status;
  }
}

function audienceLabel(audience: ProofPack['audience']): string {
  switch (audience) {
    case 'investor':
      return 'Investor';
    case 'partner':
      return 'Partner';
    case 'public':
      return 'Public';
    case 'board':
      return 'Board';
    default:
      return audience;
  }
}

function visibilityLabel(vis: Playlist['visibility']): string {
  switch (vis) {
    case 'public':
      return 'Public';
    case 'private':
      return 'Private';
    case 'unlisted':
      return 'Unlisted';
    default:
      return vis;
  }
}

function visibilityVariant(vis: Playlist['visibility']): 'success' | 'warning' | 'neutral' {
  switch (vis) {
    case 'public':
      return 'success';
    case 'unlisted':
      return 'warning';
    case 'private':
      return 'neutral';
    default:
      return 'neutral';
  }
}

// =============================================================================
// SUB-TAB: OVERVIEW
// =============================================================================

/** Proof Score — composite coverage breakdown */
const PROOF_SCORE_CATEGORIES = [
  { label: 'Product', score: 85 },
  { label: 'Traction', score: 78 },
  { label: 'Outcomes', score: 65 },
  { label: 'Partnerships', score: 90 },
  { label: 'Compliance', score: 60 },
  { label: 'Financial', score: 55 },
  { label: 'Team', score: 82 },
];

const PROOF_SCORE_OVERALL = Math.round(
  PROOF_SCORE_CATEGORIES.reduce((sum, c) => sum + c.score, 0) / PROOF_SCORE_CATEGORIES.length,
);

function proofScoreColor(score: number): string {
  if (score >= 80) return BP.emerald;
  if (score >= 60) return BP.champagneGold;
  return BP.red;
}

function OverviewContent({ role }: { role: BusinessRoleLens }) {
  const stats = MEDIA_OVERVIEW;

  const statItems = [
    { label: 'Total Assets', value: `${stats.totalAssets}`, icon: 'folder.fill' },
    { label: 'Proof Packs', value: `${stats.proofPacks}`, icon: 'shippingbox.fill' },
    { label: 'Case Studies', value: `${stats.caseStudies}`, icon: 'doc.richtext.fill' },
    { label: 'Press Hits', value: `${stats.pressHits}`, icon: 'newspaper.fill' },
    { label: 'Share Links', value: `${stats.shareLinksActive}`, icon: 'link' },
  ];

  // Filter stats by role — B3/B2a don't see share links count
  const visibleStats = isFounder(role) || isBoardLevel(role)
    ? statItems
    : statItems.filter((s) => s.label !== 'Share Links');

  // Recent activity feed
  const recentActivity = [
    { id: 'ra-1', text: 'Investor Demo link viewed 12 times this week', time: '2h ago' },
    { id: 'ra-2', text: 'Valuetainment Highlight Reel playlist updated with 3 new clips', time: '4h ago' },
    { id: 'ra-3', text: 'Case Study "Carroll Athletics" published', time: '1d ago' },
    { id: 'ra-4', text: 'Board Pack Media link shared with PBD/Tom', time: '2d ago' },
    { id: 'ra-5', text: 'Valuetainment Race footage uploaded by Adriana Ruiz', time: '3d ago' },
  ];

  // B3 sees fewer activity items
  const visibleActivity = isFounder(role) || isInvestor(role)
    ? recentActivity
    : recentActivity.slice(0, 3);

  return (
    <View>
      {/* Proof Score */}
      <BizCard>
        <BizCardTitle text="PROOF SCORE" />
        <View style={s.proofScoreHero}>
          <ThemedText style={[s.proofScoreNumber, { color: proofScoreColor(PROOF_SCORE_OVERALL) }]}>
            {PROOF_SCORE_OVERALL}%
          </ThemedText>
          <ThemedText style={s.proofScoreLabel}>Composite Coverage</ThemedText>
        </View>
        <View style={s.proofScoreGrid}>
          {PROOF_SCORE_CATEGORIES.map((cat) => (
            <View key={cat.label} style={s.proofScoreCatRow}>
              <ThemedText style={s.proofScoreCatLabel}>{cat.label}</ThemedText>
              <View style={s.proofScoreBarBg}>
                <View
                  style={[
                    s.proofScoreBarFill,
                    { width: `${cat.score}%`, backgroundColor: proofScoreColor(cat.score) },
                  ]}
                />
              </View>
              <ThemedText style={[s.proofScoreCatValue, { color: proofScoreColor(cat.score) }]}>
                {cat.score}%
              </ThemedText>
            </View>
          ))}
        </View>
      </BizCard>

      {/* Stats grid */}
      <BizCard>
        <BizCardTitle text="MEDIA SNAPSHOT" />
        <View style={s.statsGrid}>
          {visibleStats.map((stat) => (
            <View key={stat.label} style={s.statCell}>
              <View style={s.statIconRow}>
                <IconSymbol name={stat.icon as any} size={14} color={BP.ash} />
              </View>
              <ThemedText style={s.statValue}>{stat.value}</ThemedText>
              <ThemedText style={s.statLabel}>{stat.label}</ThemedText>
            </View>
          ))}
        </View>
      </BizCard>

      {/* Recent activity */}
      <BizCard>
        <BizCardTitle text="RECENT ACTIVITY" />
        {visibleActivity.map((item, idx) => (
          <View
            key={item.id}
            style={[
              s.activityRow,
              idx < visibleActivity.length - 1 && s.activityRowBorder,
            ]}
          >
            <View style={s.activityDot} />
            <View style={s.activityContent}>
              <ThemedText style={s.activityText} numberOfLines={2}>
                {item.text}
              </ThemedText>
              <ThemedText style={s.activityTime}>{item.time}</ThemedText>
            </View>
          </View>
        ))}
      </BizCard>
    </View>
  );
}

// =============================================================================
// SUB-TAB: LIBRARY
// =============================================================================

/** Verification status per asset */
type VerificationLevel = 'self_reported' | 'evidence_backed' | 'third_party_validated';

const ASSET_VERIFICATION: Record<string, VerificationLevel> = {
  'ma-1': 'third_party_validated',
  'ma-2': 'evidence_backed',
  'ma-3': 'evidence_backed',
  'ma-4': 'self_reported',
  'ma-5': 'self_reported',
  'ma-6': 'evidence_backed',
  'ma-7': 'third_party_validated',
  'ma-8': 'self_reported',
};

function verificationLabel(v: VerificationLevel): string {
  switch (v) {
    case 'self_reported': return 'Self-reported';
    case 'evidence_backed': return 'Evidence-backed';
    case 'third_party_validated': return 'Third-party validated';
  }
}

function verificationColor(v: VerificationLevel): string {
  switch (v) {
    case 'self_reported': return BP.ash;
    case 'evidence_backed': return ACCENT;
    case 'third_party_validated': return BP.emerald;
  }
}

function LibraryContent() {
  return (
    <View>
      <BizCard>
        <BizCardTitle text="MEDIA LIBRARY" />
        {MEDIA_LIBRARY.map((asset, idx) => {
          const verification = ASSET_VERIFICATION[asset.id] ?? 'self_reported';

          return (
            <Pressable
              key={asset.id}
              style={({ pressed }) => [
                s.libraryRow,
                idx < MEDIA_LIBRARY.length - 1 && s.libraryRowBorder,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              {/* Type icon */}
              <View style={s.libraryIcon}>
                <IconSymbol
                  name={mediaTypeIcon(asset.type) as any}
                  size={22}
                  color={BP.champagneGold}
                />
              </View>

              {/* Info */}
              <View style={s.libraryInfo}>
                <ThemedText style={s.libraryTitle} numberOfLines={1}>
                  {asset.title}
                </ThemedText>
                <View style={s.libraryMeta}>
                  <View style={s.categoryPill}>
                    <ThemedText style={s.categoryPillText}>{asset.category}</ThemedText>
                  </View>
                  <ThemedText style={s.librarySize}>{asset.size}</ThemedText>
                  <ThemedText style={s.libraryDate}>{asset.uploadedAt}</ThemedText>
                </View>

                {/* Verification badge */}
                <View style={[s.verificationBadge, { backgroundColor: verificationColor(verification) + '15' }]}>
                  <IconSymbol
                    name={verification === 'third_party_validated' ? 'checkmark.seal.fill' : verification === 'evidence_backed' ? 'checkmark.circle.fill' : 'info.circle.fill'}
                    size={10}
                    color={verificationColor(verification)}
                  />
                  <ThemedText style={[s.verificationBadgeText, { color: verificationColor(verification) }]}>
                    {verificationLabel(verification)}
                  </ThemedText>
                </View>

                {/* Tags */}
                <View style={s.tagRow}>
                  {asset.tags.slice(0, 3).map((tag) => (
                    <View key={tag} style={s.tagChip}>
                      <ThemedText style={s.tagText}>{tag}</ThemedText>
                    </View>
                  ))}
                  {asset.tags.length > 3 && (
                    <ThemedText style={s.tagMore}>+{asset.tags.length - 3}</ThemedText>
                  )}
                </View>
              </View>

              {/* Chevron */}
              <IconSymbol name="chevron.right" size={12} color={BP.ash} />
            </Pressable>
          );
        })}
      </BizCard>
    </View>
  );
}

// =============================================================================
// SUB-TAB: PROOF PACKS
// =============================================================================

/** Mock expandable sections per proof pack */
const PROOF_PACK_SECTIONS: Record<string, { narrative: string; sections: string[] }> = {
  'pp-1': {
    narrative: 'This pack demonstrates product-market fit and early traction through live deployments, user engagement metrics, and investor-grade financial projections.',
    sections: ['Product Demo Recording', 'Valuetainment Traction Metrics Deck', 'Financial Summary Slide', 'Founder Walkthrough Video'],
  },
  'pp-2': {
    narrative: 'Board-ready evidence package covering quarterly performance, compliance posture, and partnership health across all proof wedges.',
    sections: ['KPI Dashboard Export', 'Valuetainment Partnership Summary', '2819 Church Pilot Results', 'Compliance Score Card'],
  },
  'pp-3': {
    narrative: 'Onboarding materials for integration partners including API documentation and proof-of-concept recordings.',
    sections: ['API Documentation', 'Brand Guidelines PDF', 'Demo Recording', 'Case Study One-Pager'],
  },
  'pp-4': {
    narrative: 'Public-facing compilation showcasing the Valuetainment story, founder vision, and product capabilities for general audiences.',
    sections: ['Founder Interview Clips', 'Product Overview Video', 'Press Highlights Reel', 'Brand Sizzle Reel'],
  },
};

function ProofPacksContent({ role }: { role: BusinessRoleLens }) {
  const [expandedPack, setExpandedPack] = useState<string | null>(null);

  // B2a sees only investor/public packs; B2b sees all except draft
  const visiblePacks = isFounder(role)
    ? PROOF_PACKS
    : isBoardLevel(role)
      ? PROOF_PACKS.filter((p) => p.status !== 'draft' || p.audience === 'board')
      : PROOF_PACKS.filter((p) => p.audience === 'investor' || p.audience === 'public');

  return (
    <View>
      {visiblePacks.map((pack) => {
        const isExpanded = expandedPack === pack.id;
        const detail = PROOF_PACK_SECTIONS[pack.id];

        return (
          <Pressable
            key={pack.id}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setExpandedPack(isExpanded ? null : pack.id);
            }}
          >
            <BizCard>
              <View style={s.packHeader}>
                <View style={s.packTitleRow}>
                  <IconSymbol name="shippingbox.fill" size={16} color={BP.champagneGold} />
                  <ThemedText style={s.packTitle} numberOfLines={1}>
                    {pack.title}
                  </ThemedText>
                </View>
                <BizStatusChip
                  label={proofPackStatusLabel(pack.status)}
                  variant={proofPackStatusVariant(pack.status)}
                />
              </View>

              <ThemedText style={s.packDescription} numberOfLines={isExpanded ? undefined : 2}>
                {pack.description}
              </ThemedText>

              <View style={s.packFooter}>
                <View style={s.packMetaRow}>
                  <IconSymbol name="doc.fill" size={12} color={BP.ash} />
                  <ThemedText style={s.packMetaText}>
                    {pack.assetCount} assets
                  </ThemedText>
                </View>
                <View style={s.packMetaRow}>
                  <IconSymbol name="calendar" size={12} color={BP.ash} />
                  <ThemedText style={s.packMetaText}>{pack.createdAt}</ThemedText>
                </View>
                <View style={s.audienceBadge}>
                  <ThemedText style={s.audienceBadgeText}>
                    {audienceLabel(pack.audience)}
                  </ThemedText>
                </View>
                <IconSymbol
                  name={isExpanded ? 'chevron.up' : 'chevron.down'}
                  size={11}
                  color={BP.ash}
                />
              </View>

              {/* Expandable sections */}
              {isExpanded && detail && (
                <View style={s.packExpandedSection}>
                  {/* Narrative */}
                  <ThemedText style={s.packNarrative}>{detail.narrative}</ThemedText>

                  {/* Sections list */}
                  <View style={s.packSectionsList}>
                    <ThemedText style={s.packSectionsTitle}>SECTIONS</ThemedText>
                    {detail.sections.map((section, sIdx) => (
                      <View key={sIdx} style={s.packSectionItem}>
                        <IconSymbol name="doc.text.fill" size={12} color={BP.champagneGold} />
                        <ThemedText style={s.packSectionItemText}>{section}</ThemedText>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </BizCard>
          </Pressable>
        );
      })}
    </View>
  );
}

// =============================================================================
// SUB-TAB: PLAYLISTS
// =============================================================================

/** Mock playlist items for sequential display */
const PLAYLIST_ITEMS: Record<string, string[]> = {
  'pl-1': ['Carroll vs Heritage — Top Plays', 'Carroll vs Howard — Broadcast Clip', 'Conference Semifinal Highlights', 'Post-Game Interviews Compilation'],
  'pl-2': ['MVP Demo — Aug 2025', 'V1 Launch Recording', 'V1.5 Feature Walkthrough', 'OS v2 Full Demo'],
  'pl-3': ['Round 1 Recap + Telemetry', 'Round 2 Highlights', 'Round 3 Driver Interview', 'Round 5 Race Analysis'],
  'pl-4': ['Jan 5 Sunday Service', 'Jan 12 Campus Event', 'Jan 19 Sunday Service', 'Special Program — MLK Day'],
};

function PlaylistsContent() {
  return (
    <View>
      {PLAYLISTS.map((pl) => {
        const items = PLAYLIST_ITEMS[pl.id] ?? [];

        return (
          <BizCard key={pl.id}>
            <View style={s.playlistHeader}>
              <View style={s.playlistTitleRow}>
                <IconSymbol name="play.rectangle.fill" size={16} color={BP.champagneGold} />
                <ThemedText style={s.playlistTitle} numberOfLines={1}>
                  {pl.title}
                </ThemedText>
              </View>
              <BizStatusChip
                label={visibilityLabel(pl.visibility)}
                variant={visibilityVariant(pl.visibility)}
              />
            </View>

            <ThemedText style={s.playlistDescription} numberOfLines={2}>
              {pl.description}
            </ThemedText>

            {/* Sequential item list */}
            <View style={s.playlistItemsList}>
              {items.map((item, itemIdx) => (
                <View key={itemIdx} style={s.playlistItemRow}>
                  <View style={s.playlistItemNumber}>
                    <ThemedText style={s.playlistItemNumberText}>{itemIdx + 1}</ThemedText>
                  </View>
                  <IconSymbol name="play.fill" size={10} color={BP.champagneGold} />
                  <ThemedText style={s.playlistItemLabel} numberOfLines={1}>{item}</ThemedText>
                </View>
              ))}
              {pl.itemCount > items.length && (
                <ThemedText style={s.playlistItemMore}>
                  +{pl.itemCount - items.length} more items
                </ThemedText>
              )}
            </View>

            <View style={s.playlistFooter}>
              <View style={s.playlistMetaRow}>
                <IconSymbol name="film.fill" size={12} color={BP.ash} />
                <ThemedText style={s.playlistMetaText}>
                  {pl.itemCount} items
                </ThemedText>
              </View>
              <View style={s.playlistMetaRow}>
                <IconSymbol name="clock.fill" size={12} color={BP.ash} />
                <ThemedText style={s.playlistMetaText}>{pl.duration}</ThemedText>
              </View>
              <View style={s.categoryPill}>
                <ThemedText style={s.categoryPillText}>{pl.category}</ThemedText>
              </View>
            </View>
          </BizCard>
        );
      })}
    </View>
  );
}

// =============================================================================
// SUB-TAB: CASE STUDIES
// =============================================================================

function CaseStudiesContent({ role }: { role: BusinessRoleLens }) {
  // B3 sees only published; B1/B2 see all
  const visibleStudies = isFounder(role) || isInvestor(role)
    ? CASE_STUDIES
    : CASE_STUDIES.filter((cs) => cs.status === 'published');

  return (
    <View>
      {visibleStudies.map((cs) => (
        <BizCard key={cs.id}>
          <View style={s.csHeader}>
            <View style={{ flex: 1 }}>
              <ThemedText style={s.csTitle} numberOfLines={2}>
                {cs.title}
              </ThemedText>
              <ThemedText style={s.csClient}>{cs.client}</ThemedText>
            </View>
            <BizStatusChip
              label={cs.status === 'published' ? 'Published' : 'Draft'}
              variant={cs.status === 'published' ? 'success' : 'warning'}
            />
          </View>

          <View style={s.csCategoryRow}>
            <View style={s.categoryPill}>
              <ThemedText style={s.categoryPillText}>{cs.category}</ThemedText>
            </View>
            {cs.publishedAt && (
              <ThemedText style={s.csPublishedDate}>{cs.publishedAt}</ThemedText>
            )}
          </View>

          <ThemedText style={s.csSummary} numberOfLines={3}>
            {cs.summary}
          </ThemedText>

          {/* Key metrics */}
          <View style={s.csMetricsRow}>
            {cs.metrics.map((m) => (
              <View key={m.label} style={s.csMetricCell}>
                <ThemedText style={s.csMetricValue}>{m.value}</ThemedText>
                <ThemedText style={s.csMetricLabel}>{m.label}</ThemedText>
              </View>
            ))}
          </View>
        </BizCard>
      ))}
    </View>
  );
}

// =============================================================================
// SUB-TAB: PRESS
// =============================================================================

/** Mock outbound press releases */
const OUTBOUND_PRESS: { id: string; title: string; date: string; status: 'Draft' | 'Published' }[] = [
  { id: 'opr-1', title: 'Valuetainment Announces Partnership Expansion for 2026-27', date: 'Feb 15, 2026', status: 'Draft' },
  { id: 'opr-2', title: 'Valuetainment OS v2 Launches with Multi-Mode Architecture', date: 'Feb 1, 2026', status: 'Published' },
  { id: 'opr-3', title: 'Valuetainment Raises Pre-Seed Round Led by Valuetainment', date: 'Jan 15, 2026', status: 'Published' },
];

function PressContent() {
  return (
    <View>
      {/* Inbound coverage */}
      <BizCard>
        <BizCardTitle text="PRESS COVERAGE" />
        {PRESS_ITEMS.map((item, idx) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              s.pressRow,
              idx < PRESS_ITEMS.length - 1 && s.pressRowBorder,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            {/* Sentiment dot */}
            <View
              style={[s.sentimentDot, { backgroundColor: sentimentColor(item.sentiment) }]}
            />

            {/* Content */}
            <View style={s.pressInfo}>
              <ThemedText style={s.pressTitle} numberOfLines={2}>
                {item.title}
              </ThemedText>
              <View style={s.pressMetaRow}>
                <ThemedText style={s.pressOutlet}>{item.outlet}</ThemedText>
                <ThemedText style={s.pressSep}>{'\u00B7'}</ThemedText>
                <ThemedText style={s.pressDate}>{item.date}</ThemedText>
              </View>
            </View>

            {/* Type badge */}
            <View style={s.pressTypeBadge}>
              <ThemedText style={s.pressTypeText}>
                {pressTypeLabel(item.type)}
              </ThemedText>
            </View>
          </Pressable>
        ))}
      </BizCard>

      {/* Outbound press releases */}
      <BizCard>
        <BizCardTitle text="OUTBOUND PRESS RELEASES" />
        {OUTBOUND_PRESS.map((pr, idx) => (
          <View
            key={pr.id}
            style={[
              s.outboundPressRow,
              idx < OUTBOUND_PRESS.length - 1 && s.outboundPressRowBorder,
            ]}
          >
            <View style={s.outboundPressInfo}>
              <ThemedText style={s.outboundPressTitle} numberOfLines={2}>
                {pr.title}
              </ThemedText>
              <ThemedText style={s.outboundPressDate}>{pr.date}</ThemedText>
            </View>
            <BizStatusChip
              label={pr.status.toUpperCase()}
              variant={pr.status === 'Published' ? 'success' : 'warning'}
            />
          </View>
        ))}
      </BizCard>
    </View>
  );
}

// =============================================================================
// SUB-TAB: RIGHTS
// =============================================================================

/** Source attribution per rights item */
const RIGHTS_SOURCE: Record<string, string> = {
  'ri-1': 'Carroll Athletics Department — Athletic Director office',
  'ri-2': '2819 Church Senior Pastor — Media Ministry agreement',
  'ri-3': 'PBD Podcast Series — Partnership contract, Exhibit B',
  'ri-4': 'Valuetainment internal — Brand Guidelines v2.0',
};

function RightsContent() {
  return (
    <View>
      <BizCard>
        <BizCardTitle text="RIGHTS & LICENSES" />
        {RIGHTS_ITEMS.map((item, idx) => {
          const source = RIGHTS_SOURCE[item.id];

          return (
            <View
              key={item.id}
              style={[
                s.rightsRow,
                idx < RIGHTS_ITEMS.length - 1 && s.rightsRowBorder,
              ]}
            >
              <View style={s.rightsHeader}>
                <ThemedText style={s.rightsAssetTitle} numberOfLines={1}>
                  {item.assetTitle}
                </ThemedText>
                <BizStatusChip
                  label={rightsStatusLabel(item.status)}
                  variant={rightsStatusVariant(item.status)}
                />
              </View>

              <View style={s.rightsDetails}>
                <View style={s.rightsDetailItem}>
                  <ThemedText style={s.rightsDetailLabel}>License</ThemedText>
                  <ThemedText style={s.rightsDetailValue}>{item.licenseType}</ThemedText>
                </View>
                <View style={s.rightsDetailItem}>
                  <ThemedText style={s.rightsDetailLabel}>Holder</ThemedText>
                  <ThemedText style={s.rightsDetailValue}>{item.holder}</ThemedText>
                </View>
                <View style={s.rightsDetailItem}>
                  <ThemedText style={s.rightsDetailLabel}>Expires</ThemedText>
                  <ThemedText style={s.rightsDetailValue}>{item.expiryDate}</ThemedText>
                </View>
                <View style={s.rightsDetailItem}>
                  <ThemedText style={s.rightsDetailLabel}>Territory</ThemedText>
                  <ThemedText style={s.rightsDetailValue}>{item.territory}</ThemedText>
                </View>
              </View>

              {/* Source attribution */}
              {source && (
                <View style={s.rightsSourceRow}>
                  <ThemedText style={s.rightsDetailLabel}>Source</ThemedText>
                  <ThemedText style={s.rightsSourceValue}>{source}</ThemedText>
                </View>
              )}
            </View>
          );
        })}
      </BizCard>
    </View>
  );
}

// =============================================================================
// SUB-TAB: SHARE LINKS
// =============================================================================

function ShareLinksContent() {
  return (
    <View>
      <BizCard>
        <BizCardTitle text="SHARE LINKS" />
        {SHARE_LINKS.map((link, idx) => (
          <Pressable
            key={link.id}
            style={({ pressed }) => [
              s.shareLinkRow,
              idx < SHARE_LINKS.length - 1 && s.shareLinkRowBorder,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={s.shareLinkTop}>
              <View style={s.shareLinkTitleRow}>
                <IconSymbol name="link" size={14} color={BP.champagneGold} />
                <ThemedText style={s.shareLinkTitle} numberOfLines={1}>
                  {link.title}
                </ThemedText>
              </View>
              <BizStatusChip
                label={shareLinkStatusLabel(link.status)}
                variant={shareLinkStatusVariant(link.status)}
              />
            </View>

            <View style={s.shareLinkMeta}>
              <View style={s.shareLinkMetaItem}>
                <IconSymbol name="person.2.fill" size={11} color={BP.ash} />
                <ThemedText style={s.shareLinkMetaText}>
                  {link.targetAudience}
                </ThemedText>
              </View>
              <View style={s.shareLinkMetaItem}>
                <IconSymbol name="calendar" size={11} color={BP.ash} />
                <ThemedText style={s.shareLinkMetaText}>
                  Expires {link.expiresAt}
                </ThemedText>
              </View>
              <View style={s.shareLinkMetaItem}>
                <IconSymbol name="eye.fill" size={11} color={BP.ash} />
                <ThemedText style={s.shareLinkMetaText}>
                  {link.views} views
                </ThemedText>
              </View>
              {link.watermarked && (
                <View style={s.watermarkBadge}>
                  <ThemedText style={s.watermarkBadgeText}>Watermarked</ThemedText>
                </View>
              )}
            </View>
          </Pressable>
        ))}
      </BizCard>

      {/* Create Share Link CTA */}
      <Pressable
        style={({ pressed }) => [
          s.createShareLinkCTA,
          { opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
      >
        <IconSymbol name="link" size={18} color={BP.champagneGold} />
        <ThemedText style={s.createShareLinkCTAText}>
          Create Share Link
        </ThemedText>
      </Pressable>
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function BusinessMediaProof({ colors, role = 'B1' }: Props) {
  const allowedTabs = getAllowedTabs(role);
  const [activeTab, setActiveTab] = useState<MediaSubTab>(allowedTabs[0]?.id ?? 'overview');

  // Ensure active tab is still valid if role changes
  const safeActiveTab = allowedTabs.find((t) => t.id === activeTab)
    ? activeTab
    : allowedTabs[0]?.id ?? 'overview';

  function renderContent() {
    switch (safeActiveTab) {
      case 'overview':
        return <OverviewContent role={role} />;
      case 'library':
        return isFounder(role) ? (
          <LibraryContent />
        ) : (
          <BizEmptyLock
            title="Library Restricted"
            message="Full media library access requires Founder permissions."
          />
        );
      case 'proof_packs':
        return <ProofPacksContent role={role} />;
      case 'playlists':
        return isFounder(role) ? (
          <PlaylistsContent />
        ) : (
          <BizEmptyLock
            title="Playlists Restricted"
            message="Playlist management requires Founder permissions."
          />
        );
      case 'case_studies':
        return <CaseStudiesContent role={role} />;
      case 'press':
        return isFounder(role) || isBoardLevel(role) ? (
          <PressContent />
        ) : (
          <BizEmptyLock
            title="Press Access Restricted"
            message="Press coverage details require Board-level access."
          />
        );
      case 'rights':
        return isFounder(role) ? (
          <RightsContent />
        ) : (
          <BizEmptyLock
            title="Rights Restricted"
            message="Rights and license management requires Founder permissions."
          />
        );
      case 'share_links':
        return isFounder(role) ? (
          <ShareLinksContent />
        ) : (
          <BizEmptyLock
            title="Share Links Restricted"
            message="Share link management requires Founder permissions."
          />
        );
      default:
        return null;
    }
  }

  return (
    <ScrollView
      style={[s.container, { backgroundColor: colors.background }]}
      contentContainerStyle={s.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Entity scope bar */}
      <EntityScopeBar
        entityId={DEFAULT_ENTITY.id}
        entityName={DEFAULT_ENTITY.name}
        entityType={DEFAULT_ENTITY.type}
        status={DEFAULT_ENTITY.status}
        colors={colors}
      />

      {/* Sub-tab bar */}
      <BizSubTabBar
        tabs={allowedTabs}
        activeId={safeActiveTab}
        onSelect={(id) => setActiveTab(id as MediaSubTab)}
      />

      {/* Content */}
      {renderContent()}

      {/* Bottom spacer */}
      <View style={s.bottomSpacer} />
    </ScrollView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  bottomSpacer: {
    height: 120,
  },

  // ---- Overview: Stats Grid ----
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statCell: {
    minWidth: '28%',
    flex: 1,
    backgroundColor: BP.glass,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: 4,
  },
  statIconRow: {
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: BP.champagneGold,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: BP.ash,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    textAlign: 'center',
  },

  // ---- Overview: Activity Feed ----
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  activityRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BP.graphite,
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BP.champagneGold,
    marginTop: 6,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 13,
    fontWeight: '500',
    color: BP.smoke,
    lineHeight: 18,
  },
  activityTime: {
    fontSize: 11,
    color: BP.ash,
    marginTop: 2,
  },

  // ---- Library ----
  libraryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  libraryRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BP.graphite,
  },
  libraryIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: BP.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  libraryInfo: {
    flex: 1,
  },
  libraryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: BP.smoke,
    marginBottom: 3,
  },
  libraryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  librarySize: {
    fontSize: 11,
    color: BP.ash,
  },
  libraryDate: {
    fontSize: 11,
    color: BP.ash,
  },

  // ---- Shared: Category pill ----
  categoryPill: {
    backgroundColor: BP.champagneGold + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: BP.champagneGold,
    letterSpacing: 0.3,
  },

  // ---- Shared: Tag chips ----
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  tagChip: {
    backgroundColor: BP.glass,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
    color: BP.ash,
  },
  tagMore: {
    fontSize: 10,
    fontWeight: '600',
    color: BP.ash,
  },

  // ---- Proof Packs ----
  packHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  packTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
    marginRight: Spacing.sm,
  },
  packTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: BP.smoke,
    flex: 1,
  },
  packDescription: {
    fontSize: 13,
    color: BP.ash,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  packFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  packMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  packMetaText: {
    fontSize: 11,
    color: BP.ash,
  },
  audienceBadge: {
    backgroundColor: BP.platinum + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  audienceBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: BP.platinum,
  },

  // ---- Playlists ----
  playlistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  playlistTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
    marginRight: Spacing.sm,
  },
  playlistTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: BP.smoke,
    flex: 1,
  },
  playlistDescription: {
    fontSize: 13,
    color: BP.ash,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  playlistFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  playlistMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  playlistMetaText: {
    fontSize: 11,
    color: BP.ash,
  },

  // ---- Case Studies ----
  csHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  csTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: BP.smoke,
    lineHeight: 20,
    marginBottom: 2,
  },
  csClient: {
    fontSize: 12,
    fontWeight: '500',
    color: BP.ash,
  },
  csCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  csPublishedDate: {
    fontSize: 11,
    color: BP.ash,
  },
  csSummary: {
    fontSize: 13,
    color: BP.ash,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  csMetricsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  csMetricCell: {
    flex: 1,
    backgroundColor: BP.glass,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  csMetricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: BP.champagneGold,
    textAlign: 'center',
    marginBottom: 2,
  },
  csMetricLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: BP.ash,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    textAlign: 'center',
  },

  // ---- Press ----
  pressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  pressRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BP.graphite,
  },
  sentimentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pressInfo: {
    flex: 1,
  },
  pressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: BP.smoke,
    lineHeight: 18,
    marginBottom: 2,
  },
  pressMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pressOutlet: {
    fontSize: 12,
    fontWeight: '500',
    color: BP.champagneGold,
  },
  pressSep: {
    fontSize: 12,
    color: BP.ash,
  },
  pressDate: {
    fontSize: 12,
    color: BP.ash,
  },
  pressTypeBadge: {
    backgroundColor: BP.glass,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  pressTypeText: {
    fontSize: 10,
    fontWeight: '600',
    color: BP.ash,
  },

  // ---- Rights ----
  rightsRow: {
    paddingVertical: Spacing.sm,
  },
  rightsRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BP.graphite,
  },
  rightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  rightsAssetTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: BP.smoke,
    flex: 1,
  },
  rightsDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  rightsDetailItem: {
    minWidth: '45%',
    marginBottom: 4,
  },
  rightsDetailLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: BP.ash,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 1,
  },
  rightsDetailValue: {
    fontSize: 13,
    fontWeight: '500',
    color: BP.smoke,
  },

  // ---- Share Links ----
  shareLinkRow: {
    paddingVertical: Spacing.sm,
  },
  shareLinkRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BP.graphite,
  },
  shareLinkTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  shareLinkTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  shareLinkTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: BP.smoke,
    flex: 1,
  },
  shareLinkMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  shareLinkMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shareLinkMetaText: {
    fontSize: 11,
    color: BP.ash,
  },
  watermarkBadge: {
    backgroundColor: BP.emerald + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  watermarkBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: BP.emerald,
    letterSpacing: 0.3,
  },

  // ---- Proof Score ----
  proofScoreHero: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  proofScoreNumber: {
    fontSize: 48,
    fontWeight: '800',
    lineHeight: 56,
  },
  proofScoreLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: BP.ash,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginTop: 4,
  },
  proofScoreGrid: {
    gap: Spacing.xs,
  },
  proofScoreCatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 3,
  },
  proofScoreCatLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: BP.ash,
    width: 80,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  proofScoreBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: BP.glass,
    overflow: 'hidden',
  },
  proofScoreBarFill: {
    height: 6,
    borderRadius: 3,
  },
  proofScoreCatValue: {
    fontSize: 11,
    fontWeight: '700',
    width: 36,
    textAlign: 'right',
  },

  // ---- Library: Verification badge ----
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  verificationBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ---- Proof Packs: Expandable ----
  packExpandedSection: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BP.graphite,
  },
  packNarrative: {
    fontSize: 12,
    color: BP.platinum,
    lineHeight: 18,
    fontStyle: 'italic',
    marginBottom: Spacing.sm,
  },
  packSectionsList: {
    gap: 4,
  },
  packSectionsTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: BP.ash,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  packSectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 3,
    paddingLeft: Spacing.xs,
  },
  packSectionItemText: {
    fontSize: 12,
    fontWeight: '500',
    color: BP.smoke,
  },

  // ---- Playlists: Sequential items ----
  playlistItemsList: {
    marginBottom: Spacing.sm,
    gap: 2,
  },
  playlistItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 3,
  },
  playlistItemNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: BP.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playlistItemNumberText: {
    fontSize: 10,
    fontWeight: '700',
    color: BP.champagneGold,
  },
  playlistItemLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: BP.smoke,
    flex: 1,
  },
  playlistItemMore: {
    fontSize: 11,
    fontWeight: '600',
    color: BP.ash,
    paddingLeft: 32,
    marginTop: 2,
  },

  // ---- Press: Outbound ----
  outboundPressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  outboundPressRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BP.graphite,
  },
  outboundPressInfo: {
    flex: 1,
  },
  outboundPressTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: BP.smoke,
    lineHeight: 18,
    marginBottom: 2,
  },
  outboundPressDate: {
    fontSize: 12,
    color: BP.ash,
  },

  // ---- Rights: Source attribution ----
  rightsSourceRow: {
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BP.graphite,
  },
  rightsSourceValue: {
    fontSize: 12,
    fontWeight: '500',
    color: BP.platinum,
    fontStyle: 'italic',
    marginTop: 1,
  },

  // ---- Share Links: Create CTA ----
  createShareLinkCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    backgroundColor: BP.carbon,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: BP.graphite,
    borderStyle: 'dashed',
    marginBottom: Spacing.md,
  },
  createShareLinkCTAText: {
    fontSize: 14,
    fontWeight: '600',
    color: BP.champagneGold,
  },
});
