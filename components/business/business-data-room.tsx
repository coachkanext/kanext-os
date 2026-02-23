/**
 * BusinessDataRoom — Data Room tab for Valuetainment OS Business Mode.
 *
 * Sub-tabs:
 *   0 — Overview (stats grid, category breakdown, quick action)
 *   1 — Library (category filter pills, document list with RBAC filtering)
 *   2 — Versioning (version history with change type badges)
 *   3 — Packets (curated document bundles with audience badges)
 *   4 — Requests (inbound access requests with status chips)
 *   5 — Audit (access/download/share event log)
 *
 * RBAC (14-level: B0-B13):
 *   Founder (B0/B1) — All 6 sub-tabs, sees all documents
 *   Board (B2/B6/B8/B9/B13) — Overview, Library (board+retail+public), Packets, Audit (4 tabs)
 *   Investor (B7) — Overview, Library (retail+public only), Packets (filtered view)
 *   Public — Locked
 */

import React, { useState, useMemo } from 'react';
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
  DATA_ROOM_SUB_TABS,
  DATA_ROOM_STATS,
  DATA_ROOM_DOCUMENTS,
  DOC_CATEGORIES,
  VERSION_HISTORY,
  DATA_PACKETS,
  DATA_REQUESTS,
  DATA_ROOM_AUDIT_LOG,
} from '@/data/mock-biz-data-room';
import type {
  DataRoomSubTab,
  DataRoomDocument,
  DocCategory,
  VersionEntry,
  DataPacket,
  DataRequest,
  DataRoomAudit,
} from '@/data/mock-biz-data-room';

// =============================================================================
// TYPES
// =============================================================================


const ACCENT = MODE_ACCENT.business;
interface Props {
  colors: typeof Colors.light;
  role?: BusinessRoleLens;
}

const BP = BusinessPalette;

// =============================================================================
// RBAC HELPERS
// =============================================================================

/** Which sub-tabs are visible for each role */
function getVisibleSubTabs(role: BusinessRoleLens): DataRoomSubTab[] {
  if (isFounder(role)) {
    return ['overview', 'library', 'versioning', 'packets', 'requests', 'audit', 'builder'];
  }
  if (isBoardLevel(role)) {
    return ['overview', 'library', 'packets', 'audit'];
  }
  if (isInvestor(role)) {
    return ['overview', 'library', 'packets'];
  }
  return [];
}

/** Which document access levels a role can see in the library */
function getAllowedAccessLevels(role: BusinessRoleLens): string[] {
  if (isFounder(role)) {
    return ['public', 'retail', 'board', 'founder'];
  }
  if (isBoardLevel(role)) {
    return ['public', 'retail', 'board'];
  }
  if (isInvestor(role)) {
    return ['public', 'retail'];
  }
  return ['public'];
}

// =============================================================================
// HELPERS
// =============================================================================

/** File type icon mapping */
function fileTypeIcon(ft: DataRoomDocument['fileType']): string {
  switch (ft) {
    case 'pdf':
      return 'doc.fill';
    case 'xlsx':
      return 'tablecells.fill';
    case 'pptx':
      return 'rectangle.stack.fill';
    case 'docx':
      return 'doc.text.fill';
  }
}

/** File type display label */
function fileTypeLabel(ft: DataRoomDocument['fileType']): string {
  return ft.toUpperCase();
}

/** Access level display label */
function accessLevelLabel(level: DataRoomDocument['accessLevel']): string {
  switch (level) {
    case 'public':
      return 'Public';
    case 'retail':
      return 'Retail';
    case 'board':
      return 'Board';
    case 'founder':
      return 'Founder Only';
  }
}

/** Access level color */
function accessLevelColor(level: DataRoomDocument['accessLevel']): string {
  switch (level) {
    case 'public':
      return BP.ash;
    case 'retail':
      return BP.champagneGold;
    case 'board':
      return BP.amber;
    case 'founder':
      return BP.red;
  }
}

/** Document status to variant */
function docStatusVariant(status: DataRoomDocument['status']): 'success' | 'warning' | 'error' {
  switch (status) {
    case 'current':
      return 'success';
    case 'draft':
      return 'warning';
    case 'outdated':
      return 'error';
  }
}

/** Change type color */
function changeTypeColor(type: VersionEntry['changeType']): string {
  switch (type) {
    case 'major':
      return BP.red;
    case 'minor':
      return BP.amber;
    case 'patch':
      return BP.ash;
  }
}

/** Audience badge color */
function audienceColor(audience: DataPacket['audience']): string {
  switch (audience) {
    case 'retail':
      return BP.champagneGold;
    case 'board':
      return BP.amber;
    case 'partner':
      return ACCENT;
    case 'acquirer':
      return BP.red;
  }
}

/** Audit action icon */
function auditActionIcon(action: DataRoomAudit['action']): string {
  switch (action) {
    case 'view':
      return 'eye.fill';
    case 'download':
      return 'arrow.down.circle.fill';
    case 'share':
      return 'paperplane.fill';
    case 'upload':
      return 'arrow.up.circle.fill';
    case 'version_update':
      return 'arrow.triangle.2.circlepath';
    case 'access_grant':
      return 'lock.open.fill';
  }
}

/** Audit action label */
function auditActionLabel(action: DataRoomAudit['action']): string {
  switch (action) {
    case 'view':
      return 'Viewed';
    case 'download':
      return 'Downloaded';
    case 'share':
      return 'Shared';
    case 'upload':
      return 'Uploaded';
    case 'version_update':
      return 'Version Updated';
    case 'access_grant':
      return 'Access Granted';
  }
}

/** Audit action color */
function auditActionColor(action: DataRoomAudit['action']): string {
  switch (action) {
    case 'view':
      return BP.ash;
    case 'download':
      return BP.champagneGold;
    case 'share':
      return ACCENT;
    case 'upload':
      return BP.emerald;
    case 'version_update':
      return BP.amber;
    case 'access_grant':
      return BP.emerald;
  }
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

// ---- Overview ---------------------------------------------------------------

function OverviewSection({ role }: { role: BusinessRoleLens }) {
  const stats = DATA_ROOM_STATS;
  const allowedLevels = getAllowedAccessLevels(role);

  // Count docs per category that the user can see
  const categoryCounts = useMemo(() => {
    const visible = DATA_ROOM_DOCUMENTS.filter((d) => allowedLevels.includes(d.accessLevel));
    const counts: Record<string, number> = {};
    DOC_CATEGORIES.forEach((cat) => {
      counts[cat.id] = visible.filter((d) => d.category === cat.id).length;
    });
    return counts;
  }, [allowedLevels]);

  const visibleDocCount = DATA_ROOM_DOCUMENTS.filter((d) =>
    allowedLevels.includes(d.accessLevel),
  ).length;

  return (
    <View>
      {/* Stats Grid */}
      <BizCard>
        <BizCardTitle text="Data Room Stats" />
        <View style={s.statsGrid}>
          <View style={s.statCell}>
            <ThemedText style={s.statValue}>{visibleDocCount}</ThemedText>
            <ThemedText style={s.statLabel}>Documents</ThemedText>
          </View>
          <View style={s.statDivider} />
          <View style={s.statCell}>
            <ThemedText style={s.statValue}>{stats.categories}</ThemedText>
            <ThemedText style={s.statLabel}>Categories</ThemedText>
          </View>
          <View style={s.statDivider} />
          <View style={s.statCell}>
            <ThemedText style={s.statValue}>
              {isFounder(role) ? stats.pendingRequests : '--'}
            </ThemedText>
            <ThemedText style={s.statLabel}>Pending</ThemedText>
          </View>
        </View>

        {/* Last updated + access log */}
        <View style={s.statsFooter}>
          <ThemedText style={s.statsFooterText}>
            Updated: {stats.lastUpdated}
          </ThemedText>
          {isFounder(role) && (
            <ThemedText style={s.statsFooterText}>
              {stats.accessLog7d} events (7d)
            </ThemedText>
          )}
        </View>
      </BizCard>

      {/* Category Breakdown */}
      <BizCard>
        <BizCardTitle text="Categories" />
        {DOC_CATEGORIES.map((cat) => (
          <View key={cat.id} style={s.categoryRow}>
            <View style={[s.categoryIconWrap, { backgroundColor: cat.color + '15' }]}>
              <IconSymbol name={cat.icon as any} size={14} color={cat.color} />
            </View>
            <ThemedText style={s.categoryLabel}>{cat.label}</ThemedText>
            <ThemedText style={s.categoryCount}>{categoryCounts[cat.id] ?? 0}</ThemedText>
          </View>
        ))}
      </BizCard>

      {/* Quick Action */}
      {isFounder(role) && (
        <Pressable
          style={({ pressed }) => [s.quickActionBtn, { opacity: pressed ? 0.7 : 1 }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="plus.circle.fill" size={18} color={BP.champagneGold} />
          <ThemedText style={s.quickActionText}>Create Packet</ThemedText>
        </Pressable>
      )}
    </View>
  );
}

// ---- Library ----------------------------------------------------------------

function LibrarySection({ role }: { role: BusinessRoleLens }) {
  const [selectedCategory, setSelectedCategory] = useState<DocCategory | 'all'>('all');
  const allowedLevels = getAllowedAccessLevels(role);

  const filteredDocs = useMemo(() => {
    let docs = DATA_ROOM_DOCUMENTS.filter((d) => allowedLevels.includes(d.accessLevel));
    if (selectedCategory !== 'all') {
      docs = docs.filter((d) => d.category === selectedCategory);
    }
    return docs;
  }, [selectedCategory, allowedLevels]);

  return (
    <View>
      {/* Category filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterPillRow}
      >
        <Pressable
          style={[
            s.filterPill,
            {
              backgroundColor: selectedCategory === 'all' ? BP.champagneGold + '20' : BP.glass,
              borderColor: selectedCategory === 'all' ? BP.champagneGold + '40' : BP.graphite,
            },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setSelectedCategory('all');
          }}
        >
          <ThemedText
            style={[
              s.filterPillText,
              { color: selectedCategory === 'all' ? BP.champagneGold : BP.ash },
            ]}
          >
            All
          </ThemedText>
        </Pressable>
        {DOC_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <Pressable
              key={cat.id}
              style={[
                s.filterPill,
                {
                  backgroundColor: isActive ? cat.color + '20' : BP.glass,
                  borderColor: isActive ? cat.color + '40' : BP.graphite,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedCategory(cat.id);
              }}
            >
              <ThemedText
                style={[s.filterPillText, { color: isActive ? cat.color : BP.ash }]}
              >
                {cat.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Document list */}
      {filteredDocs.length === 0 ? (
        <BizCard>
          <ThemedText style={s.emptyText}>No documents in this category.</ThemedText>
        </BizCard>
      ) : (
        filteredDocs.map((doc) => <DocumentRow key={doc.id} doc={doc} />)
      )}
    </View>
  );
}

// ---- Document Row -----------------------------------------------------------

/** Mock metadata per document */
interface DocMetadata {
  entityScope: string;
  owner: string;
  sensitivity: 'Public' | 'Internal' | 'Confidential' | 'Restricted';
  audienceAllowed: string;
  expirationDate?: string;
  verificationStatus: string;
  notes?: string;
  isCanonical: boolean;
}

const DOC_METADATA: Record<string, DocMetadata> = {
  'doc-001': { entityScope: 'Valuetainment Inc.', owner: 'Alex Morgan', sensitivity: 'Confidential', audienceAllowed: 'Retail + Board', expirationDate: 'Jun 30, 2026', verificationStatus: 'Verified', notes: 'Latest investor deck, refreshed quarterly', isCanonical: true },
  'doc-002': { entityScope: 'Valuetainment Inc.', owner: 'Alex Morgan', sensitivity: 'Public', audienceAllowed: 'All', verificationStatus: 'Verified', isCanonical: true },
  'doc-003': { entityScope: 'Valuetainment Inc.', owner: 'Alex Morgan', sensitivity: 'Restricted', audienceAllowed: 'Board Only', verificationStatus: 'Verified', notes: 'Updated monthly with actuals', isCanonical: true },
  'doc-004': { entityScope: 'Valuetainment Inc.', owner: 'Alex Morgan', sensitivity: 'Restricted', audienceAllowed: 'Founder Only', verificationStatus: 'Verified', isCanonical: true },
  'doc-005': { entityScope: 'Valuetainment Inc.', owner: 'Alex Morgan', sensitivity: 'Confidential', audienceAllowed: 'Board + Legal', verificationStatus: 'Verified', isCanonical: false },
  'doc-006': { entityScope: 'Valuetainment Inc.', owner: 'Alex Morgan', sensitivity: 'Internal', audienceAllowed: 'Retail + Board', verificationStatus: 'Verified', isCanonical: false },
  'doc-007': { entityScope: 'Valuetainment Inc.', owner: 'Marcus Chen', sensitivity: 'Internal', audienceAllowed: 'Retail + Partners', verificationStatus: 'Verified', isCanonical: false },
  'doc-008': { entityScope: 'Valuetainment Inc.', owner: 'Alex Morgan', sensitivity: 'Confidential', audienceAllowed: 'Board Only', verificationStatus: 'Verified', isCanonical: true },
  'doc-009': { entityScope: 'Valuetainment Inc.', owner: 'Jordan Hayes', sensitivity: 'Restricted', audienceAllowed: 'Founder Only', verificationStatus: 'Draft', isCanonical: false },
  'doc-010': { entityScope: 'Valuetainment Inc.', owner: 'Alex Morgan', sensitivity: 'Public', audienceAllowed: 'All', verificationStatus: 'Verified', isCanonical: true },
  'doc-011': { entityScope: 'Valuetainment Partnership', owner: 'Jordan Hayes', sensitivity: 'Internal', audienceAllowed: 'Retail + Partners', verificationStatus: 'Verified', isCanonical: false },
  'doc-012': { entityScope: 'Valuetainment Inc.', owner: 'Alex Morgan', sensitivity: 'Confidential', audienceAllowed: 'Board Only', verificationStatus: 'Outdated', isCanonical: false },
};

function sensitivityColor(sensitivity: string): string {
  switch (sensitivity) {
    case 'Public': return BP.emerald;
    case 'Internal': return ACCENT;
    case 'Confidential': return BP.amber;
    case 'Restricted': return BP.red;
    default: return BP.ash;
  }
}

function DocumentRow({ doc }: { doc: DataRoomDocument }) {
  const [metaExpanded, setMetaExpanded] = useState(false);
  const catDef = DOC_CATEGORIES.find((c) => c.id === doc.category);
  const alColor = accessLevelColor(doc.accessLevel);
  const meta = DOC_METADATA[doc.id];

  return (
    <BizCard style={s.docCard}>
      {/* Top row: file type icon + title + version badge */}
      <Pressable
        style={s.docTopRow}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setMetaExpanded((prev) => !prev);
        }}
      >
        <View style={[s.fileTypeIcon, { backgroundColor: (catDef?.color ?? BP.ash) + '15' }]}>
          <IconSymbol
            name={fileTypeIcon(doc.fileType) as any}
            size={16}
            color={catDef?.color ?? BP.ash}
          />
        </View>
        <View style={s.docTitleBlock}>
          <View style={s.docTitleWithCanonical}>
            <ThemedText style={s.docTitle} numberOfLines={1}>
              {doc.title}
            </ThemedText>
            {/* Canonical badge */}
            {meta?.isCanonical && (
              <View style={s.canonicalBadge}>
                <IconSymbol name="lock.fill" size={9} color={BP.champagneGold} />
                <ThemedText style={s.canonicalBadgeText}>Canonical</ThemedText>
              </View>
            )}
          </View>
          <View style={s.docMetaRow}>
            {/* Version badge */}
            <View style={s.versionBadge}>
              <ThemedText style={s.versionBadgeText}>v{doc.version}</ThemedText>
            </View>
            {/* Status chip */}
            <BizStatusChip
              label={doc.status.toUpperCase()}
              variant={docStatusVariant(doc.status)}
            />
          </View>
        </View>
      </Pressable>

      {/* Bottom row: updated, access level, watermark, file type, size */}
      <View style={s.docBottomRow}>
        <ThemedText style={s.docMeta}>{doc.updatedAt}</ThemedText>
        <ThemedText style={s.docMetaSep}>&middot;</ThemedText>

        {/* Access level indicator */}
        <View style={[s.accessBadge, { backgroundColor: alColor + '15' }]}>
          <ThemedText style={[s.accessBadgeText, { color: alColor }]}>
            {accessLevelLabel(doc.accessLevel)}
          </ThemedText>
        </View>

        {/* Watermark badge */}
        {doc.watermarked && (
          <View style={s.watermarkBadge}>
            <IconSymbol name="drop.fill" size={10} color={BP.ash} />
            <ThemedText style={s.watermarkText}>WM</ThemedText>
          </View>
        )}

        {/* File type + size */}
        <ThemedText style={s.docMeta}>
          {fileTypeLabel(doc.fileType)} &middot; {doc.size}
        </ThemedText>
      </View>

      {/* Collapsible metadata section */}
      {metaExpanded && meta && (
        <View style={s.docMetadataSection}>
          <View style={s.docMetadataGrid}>
            <View style={s.docMetadataItem}>
              <ThemedText style={s.docMetadataLabel}>Entity Scope</ThemedText>
              <ThemedText style={s.docMetadataValue}>{meta.entityScope}</ThemedText>
            </View>
            <View style={s.docMetadataItem}>
              <ThemedText style={s.docMetadataLabel}>Owner</ThemedText>
              <ThemedText style={s.docMetadataValue}>{meta.owner}</ThemedText>
            </View>
            <View style={s.docMetadataItem}>
              <ThemedText style={s.docMetadataLabel}>Sensitivity</ThemedText>
              <View style={[s.sensitivityBadge, { backgroundColor: sensitivityColor(meta.sensitivity) + '15' }]}>
                <ThemedText style={[s.sensitivityBadgeText, { color: sensitivityColor(meta.sensitivity) }]}>
                  {meta.sensitivity}
                </ThemedText>
              </View>
            </View>
            <View style={s.docMetadataItem}>
              <ThemedText style={s.docMetadataLabel}>Audience</ThemedText>
              <ThemedText style={s.docMetadataValue}>{meta.audienceAllowed}</ThemedText>
            </View>
            {meta.expirationDate && (
              <View style={s.docMetadataItem}>
                <ThemedText style={s.docMetadataLabel}>Expiration</ThemedText>
                <ThemedText style={s.docMetadataValue}>{meta.expirationDate}</ThemedText>
              </View>
            )}
            <View style={s.docMetadataItem}>
              <ThemedText style={s.docMetadataLabel}>Verification</ThemedText>
              <ThemedText style={s.docMetadataValue}>{meta.verificationStatus}</ThemedText>
            </View>
          </View>
          {meta.notes && (
            <ThemedText style={s.docMetadataNotes}>Note: {meta.notes}</ThemedText>
          )}
          {/* Promote to Canonical button for non-canonical docs */}
          {!meta.isCanonical && (
            <Pressable
              style={({ pressed }) => [s.promoteCanonicalBtn, { opacity: pressed ? 0.7 : 1 }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
            >
              <IconSymbol name="lock.fill" size={12} color={BP.champagneGold} />
              <ThemedText style={s.promoteCanonicalText}>Promote to Canonical</ThemedText>
            </Pressable>
          )}
        </View>
      )}
    </BizCard>
  );
}

// ---- Versioning -------------------------------------------------------------

function VersioningSection() {
  return (
    <View>
      <BizCard>
        <BizCardTitle text="Version History" />
        {VERSION_HISTORY.map((entry, idx) => (
          <React.Fragment key={entry.id}>
            <VersionRow entry={entry} />
            {idx < VERSION_HISTORY.length - 1 && <View style={s.inCardDivider} />}
          </React.Fragment>
        ))}
      </BizCard>
    </View>
  );
}

function VersionRow({ entry }: { entry: VersionEntry }) {
  const typeColor = changeTypeColor(entry.changeType);

  return (
    <View style={s.versionRow}>
      {/* Top line: doc title + version */}
      <View style={s.versionTopLine}>
        <ThemedText style={s.versionDocTitle} numberOfLines={1}>
          {entry.docTitle}
        </ThemedText>
        <View style={s.versionNumBadge}>
          <ThemedText style={s.versionNumText}>v{entry.version}</ThemedText>
        </View>
      </View>

      {/* Change type badge + changed by + date */}
      <View style={s.versionMetaRow}>
        <View style={[s.changeTypeBadge, { backgroundColor: typeColor + '18' }]}>
          <ThemedText style={[s.changeTypeBadgeText, { color: typeColor }]}>
            {entry.changeType.toUpperCase()}
          </ThemedText>
        </View>
        <ThemedText style={s.versionMeta}>{entry.changedBy}</ThemedText>
        <ThemedText style={s.versionMetaSep}>&middot;</ThemedText>
        <ThemedText style={s.versionMeta}>{entry.changedAt}</ThemedText>
      </View>

      {/* Summary */}
      <ThemedText style={s.versionSummary}>{entry.summary}</ThemedText>
    </View>
  );
}

// ---- Packets ----------------------------------------------------------------

/** 7 named spec packet types */
const SPEC_PACKET_TYPES = [
  'Board Pack', 'Investor Update', 'Compliance Export', 'Regulatory Filing',
  'Due Diligence', 'Audit Response', 'Public Report',
];

function PacketsSection({ role }: { role: BusinessRoleLens }) {
  // Retail investor only sees retail/partner audience packets
  const visiblePackets = useMemo(() => {
    if (isFounder(role) || isBoardLevel(role)) return DATA_PACKETS;
    // Retail investor: retail and partner only
    return DATA_PACKETS.filter(
      (p) => p.audience === 'retail' || p.audience === 'partner',
    );
  }, [role]);

  return (
    <View>
      {/* Spec packet types reference */}
      {isFounder(role) && (
        <BizCard>
          <BizCardTitle text="Packet Types" />
          <View style={s.specPacketGrid}>
            {SPEC_PACKET_TYPES.map((name) => (
              <View key={name} style={s.specPacketChip}>
                <IconSymbol name="shippingbox.fill" size={11} color={BP.champagneGold} />
                <ThemedText style={s.specPacketChipText}>{name}</ThemedText>
              </View>
            ))}
          </View>
        </BizCard>
      )}

      {visiblePackets.length === 0 ? (
        <BizCard>
          <ThemedText style={s.emptyText}>No packets available for your access level.</ThemedText>
        </BizCard>
      ) : (
        visiblePackets.map((packet) => <PacketCard key={packet.id} packet={packet} role={role} />)
      )}
    </View>
  );
}

function PacketCard({ packet, role }: { packet: DataPacket; role: BusinessRoleLens }) {
  const audColor = audienceColor(packet.audience);

  return (
    <BizCard>
      {/* Header: title + status chip */}
      <View style={s.packetHeader}>
        <ThemedText style={s.packetTitle} numberOfLines={1}>
          {packet.title}
        </ThemedText>
        <BizStatusChip
          label={packet.status.toUpperCase()}
          variant={statusVariant(packet.status)}
        />
      </View>

      {/* Description */}
      <ThemedText style={s.packetDescription}>{packet.description}</ThemedText>

      {/* Meta row: doc count, audience, created, expiry, watermark */}
      <View style={s.packetMetaRow}>
        <ThemedText style={s.packetMeta}>{packet.docCount} docs</ThemedText>
        <ThemedText style={s.packetMetaSep}>&middot;</ThemedText>

        {/* Audience badge */}
        <View style={[s.audienceBadge, { backgroundColor: audColor + '15' }]}>
          <ThemedText style={[s.audienceBadgeText, { color: audColor }]}>
            {packet.audience.toUpperCase()}
          </ThemedText>
        </View>

        <ThemedText style={s.packetMetaSep}>&middot;</ThemedText>
        <ThemedText style={s.packetMeta}>{packet.createdAt}</ThemedText>

        {packet.expiresAt && (
          <>
            <ThemedText style={s.packetMetaSep}>&middot;</ThemedText>
            <ThemedText style={[s.packetMeta, { color: BP.amber }]}>
              Exp: {packet.expiresAt}
            </ThemedText>
          </>
        )}
      </View>

      {/* Watermark indicator */}
      {packet.watermarked && (
        <View style={s.packetWatermarkRow}>
          <IconSymbol name="drop.fill" size={10} color={BP.ash} />
          <ThemedText style={s.packetWatermarkText}>Watermarked</ThemedText>
        </View>
      )}
    </BizCard>
  );
}

// ---- Requests ---------------------------------------------------------------

/** Mock SLA data per request */
interface RequestSLA {
  dueDate: string;
  daysRemaining: number;
  checklist: { label: string; done: boolean }[];
}

const REQUEST_SLA: Record<string, RequestSLA> = {
  'req-001': { dueDate: 'Feb 12, 2026', daysRemaining: 0, checklist: [{ label: 'NDA verified', done: true }, { label: 'Access provisioned', done: true }, { label: 'Watermark applied', done: true }] },
  'req-002': { dueDate: 'Feb 6, 2026', daysRemaining: 0, checklist: [{ label: 'Documents compiled', done: true }, { label: 'Sent via secure link', done: true }] },
  'req-003': { dueDate: 'Feb 20, 2026', daysRemaining: 3, checklist: [{ label: 'Background check', done: false }, { label: 'NDA signed', done: true }, { label: 'Access level approved', done: false }] },
  'req-004': { dueDate: 'Feb 22, 2026', daysRemaining: 5, checklist: [{ label: 'Fund verification', done: true }, { label: 'NDA signed', done: false }, { label: 'Access scope confirmed', done: false }, { label: 'Watermark configured', done: false }] },
  'req-005': { dueDate: 'Feb 10, 2026', daysRemaining: 0, checklist: [{ label: 'Request reviewed', done: true }, { label: 'Denial communicated', done: true }] },
};

function RequestsSection() {
  return (
    <View>
      <BizCard>
        <BizCardTitle text="Access Requests" />
        {DATA_REQUESTS.map((req, idx) => (
          <React.Fragment key={req.id}>
            <RequestRow request={req} />
            {idx < DATA_REQUESTS.length - 1 && <View style={s.inCardDivider} />}
          </React.Fragment>
        ))}
      </BizCard>
    </View>
  );
}

function RequestRow({ request }: { request: DataRequest }) {
  const [expanded, setExpanded] = useState(false);
  const sla = REQUEST_SLA[request.id];

  return (
    <Pressable
      style={s.requestRow}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setExpanded((prev) => !prev);
      }}
    >
      {/* Top line: requester + status */}
      <View style={s.requestTopLine}>
        <View style={{ flex: 1 }}>
          <ThemedText style={s.requestName}>{request.requesterName}</ThemedText>
          <ThemedText style={s.requestType}>{request.requesterType}</ThemedText>
        </View>
        <BizStatusChip
          label={request.status.toUpperCase()}
          variant={statusVariant(request.status)}
        />
      </View>

      {/* Requested docs */}
      <ThemedText style={s.requestDocs}>{request.requestedDocs}</ThemedText>

      {/* Meta: submitted + responded */}
      <View style={s.requestMetaRow}>
        <ThemedText style={s.requestMeta}>Submitted: {request.submittedAt}</ThemedText>
        {request.respondedAt && (
          <>
            <ThemedText style={s.requestMetaSep}>&middot;</ThemedText>
            <ThemedText style={s.requestMeta}>
              Responded: {request.respondedAt}
            </ThemedText>
          </>
        )}
      </View>

      {/* SLA tracking */}
      {sla && (
        <View style={s.slaRow}>
          <View style={s.slaDateRow}>
            <IconSymbol name="calendar.badge.clock" size={12} color={sla.daysRemaining > 0 && sla.daysRemaining <= 3 ? BP.amber : sla.daysRemaining === 0 ? BP.ash : BP.emerald} />
            <ThemedText style={[s.slaDueText, { color: sla.daysRemaining > 0 && sla.daysRemaining <= 3 ? BP.amber : BP.ash }]}>
              Due: {sla.dueDate}
              {sla.daysRemaining > 0 ? ` (${sla.daysRemaining}d remaining)` : ''}
            </ThemedText>
          </View>
          {/* SLA checklist */}
          <View style={s.slaChecklist}>
            {sla.checklist.map((item, cIdx) => (
              <View key={cIdx} style={s.slaChecklistItem}>
                <IconSymbol
                  name={item.done ? 'checkmark.circle.fill' : 'circle'}
                  size={12}
                  color={item.done ? BP.emerald : BP.ash}
                />
                <ThemedText style={[s.slaChecklistText, { color: item.done ? BP.smoke : BP.ash }]}>
                  {item.label}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Notes — expanded */}
      {expanded && request.notes && (
        <ThemedText style={s.requestNotes}>{request.notes}</ThemedText>
      )}
    </Pressable>
  );
}

// ---- Audit ------------------------------------------------------------------

function AuditSection() {
  return (
    <View>
      <BizCard>
        <BizCardTitle text="Audit Log" />
        {DATA_ROOM_AUDIT_LOG.map((entry, idx) => (
          <React.Fragment key={entry.id}>
            <AuditRow entry={entry} />
            {idx < DATA_ROOM_AUDIT_LOG.length - 1 && <View style={s.inCardDivider} />}
          </React.Fragment>
        ))}
      </BizCard>
    </View>
  );
}

function AuditRow({ entry }: { entry: DataRoomAudit }) {
  const actionColor = auditActionColor(entry.action);

  return (
    <View style={s.auditRow}>
      {/* Action icon */}
      <View style={[s.auditIconWrap, { backgroundColor: actionColor + '15' }]}>
        <IconSymbol name={auditActionIcon(entry.action) as any} size={14} color={actionColor} />
      </View>

      {/* Content */}
      <View style={s.auditContent}>
        {/* Actor + action label */}
        <View style={s.auditTopLine}>
          <ThemedText style={s.auditActor}>{entry.actor}</ThemedText>
          <View style={[s.auditActionBadge, { backgroundColor: actionColor + '15' }]}>
            <ThemedText style={[s.auditActionBadgeText, { color: actionColor }]}>
              {auditActionLabel(entry.action)}
            </ThemedText>
          </View>
        </View>

        {/* Doc title */}
        <ThemedText style={s.auditDocTitle} numberOfLines={1}>
          {entry.docTitle}
        </ThemedText>

        {/* Timestamp + IP hint */}
        <View style={s.auditMetaRow}>
          <ThemedText style={s.auditTimestamp}>{entry.timestamp}</ThemedText>
          {entry.ipHint && (
            <>
              <ThemedText style={s.auditMetaSep}>&middot;</ThemedText>
              <ThemedText style={s.auditIp}>{entry.ipHint}</ThemedText>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

// ---- Packet Builder ---------------------------------------------------------

/** Packet builder options */
const REDACTION_LEVELS = ['None', 'Light', 'Heavy', 'Full'];

function PacketBuilderSection() {
  const [selectedDocs, setSelectedDocs] = useState<Record<string, boolean>>({});
  const [redactionLevel, setRedactionLevel] = useState('None');
  const [watermark, setWatermark] = useState(true);

  const toggleDoc = (docId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDocs((prev) => ({ ...prev, [docId]: !prev[docId] }));
  };

  const selectedCount = Object.values(selectedDocs).filter(Boolean).length;

  return (
    <View>
      {/* Document selection */}
      <BizCard>
        <BizCardTitle text="Select Documents" />
        {DATA_ROOM_DOCUMENTS.slice(0, 8).map((doc) => (
          <Pressable
            key={doc.id}
            style={s.pktBuilderDocRow}
            onPress={() => toggleDoc(doc.id)}
          >
            <IconSymbol
              name={selectedDocs[doc.id] ? 'checkmark.square.fill' : 'square'}
              size={16}
              color={selectedDocs[doc.id] ? BP.champagneGold : BP.ash}
            />
            <ThemedText
              style={[s.pktBuilderDocTitle, { color: selectedDocs[doc.id] ? BP.smoke : BP.ash }]}
              numberOfLines={1}
            >
              {doc.title}
            </ThemedText>
            <ThemedText style={s.pktBuilderDocMeta}>{fileTypeLabel(doc.fileType)}</ThemedText>
          </Pressable>
        ))}
      </BizCard>

      {/* Configuration options */}
      <BizCard>
        <BizCardTitle text="Packet Options" />
        {/* Redaction level */}
        <View style={s.pktBuilderOptionRow}>
          <ThemedText style={s.pktBuilderOptionLabel}>Redaction Level</ThemedText>
          <View style={s.pktBuilderPillRow}>
            {REDACTION_LEVELS.map((level) => (
              <Pressable
                key={level}
                style={[
                  s.pktBuilderPill,
                  { backgroundColor: redactionLevel === level ? BP.champagneGold + '20' : BP.glass },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setRedactionLevel(level);
                }}
              >
                <ThemedText style={[
                  s.pktBuilderPillText,
                  { color: redactionLevel === level ? BP.champagneGold : BP.ash },
                ]}>
                  {level}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Audience */}
        <View style={s.pktBuilderOptionRow}>
          <ThemedText style={s.pktBuilderOptionLabel}>Audience</ThemedText>
          <ThemedText style={s.pktBuilderOptionValue}>Board + Investors</ThemedText>
        </View>

        {/* Expiry */}
        <View style={s.pktBuilderOptionRow}>
          <ThemedText style={s.pktBuilderOptionLabel}>Expiry</ThemedText>
          <ThemedText style={s.pktBuilderOptionValue}>90 days</ThemedText>
        </View>

        {/* Watermark toggle */}
        <Pressable
          style={s.pktBuilderOptionRow}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setWatermark((prev) => !prev);
          }}
        >
          <ThemedText style={s.pktBuilderOptionLabel}>Watermark</ThemedText>
          <IconSymbol
            name={watermark ? 'checkmark.square.fill' : 'square'}
            size={16}
            color={watermark ? BP.champagneGold : BP.ash}
          />
        </Pressable>
      </BizCard>

      {/* Build Packet CTA */}
      <Pressable
        style={({ pressed }) => [s.quickActionBtn, { opacity: pressed ? 0.7 : 1 }]}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
      >
        <IconSymbol name="shippingbox.fill" size={18} color={BP.champagneGold} />
        <ThemedText style={s.quickActionText}>
          Build Packet ({selectedCount} docs)
        </ThemedText>
      </Pressable>
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function BusinessDataRoom({ colors, role = 'B1' }: Props) {
  // ---------------------------------------------------------------------------
  // RBAC: B3/B4/B5 — fully locked
  // ---------------------------------------------------------------------------
  if (role === 'B3' || role === 'B4' || role === 'B5') {
    return (
      <ScrollView
        style={[s.root, { backgroundColor: colors.background }]}
        contentContainerStyle={s.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <EntityScopeBar
          entityId={DEFAULT_ENTITY.id}
          entityName={DEFAULT_ENTITY.name}
          entityType={DEFAULT_ENTITY.type}
          status={DEFAULT_ENTITY.status}
          colors={colors}
        />
        <BizEmptyLock
          title="Data Room"
          message="The Data Room is available to Founder and Investor views."
        />
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    );
  }

  // ---------------------------------------------------------------------------
  // Visible sub-tabs based on role
  // ---------------------------------------------------------------------------
  const visibleSubTabIds = getVisibleSubTabs(role);
  const visibleSubTabs = DATA_ROOM_SUB_TABS.filter((t) =>
    visibleSubTabIds.includes(t.id),
  );

  const [activeSubTab, setActiveSubTab] = useState<DataRoomSubTab>(visibleSubTabs[0]?.id ?? 'overview');

  // Ensure active sub-tab is always valid for the role
  const currentTab = visibleSubTabIds.includes(activeSubTab) ? activeSubTab : visibleSubTabs[0]?.id ?? 'overview';

  // ---------------------------------------------------------------------------
  // Render content based on active sub-tab
  // ---------------------------------------------------------------------------
  function renderContent() {
    switch (currentTab) {
      case 'overview':
        return <OverviewSection role={role} />;
      case 'library':
        return <LibrarySection role={role} />;
      case 'versioning':
        return <VersioningSection />;
      case 'packets':
        return <PacketsSection role={role} />;
      case 'requests':
        return <RequestsSection />;
      case 'audit':
        return <AuditSection />;
      case 'builder':
        return <PacketBuilderSection />;
      default:
        return null;
    }
  }

  return (
    <ScrollView
      style={[s.root, { backgroundColor: colors.background }]}
      contentContainerStyle={s.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* ---- Entity Scope Bar ---- */}
      <EntityScopeBar
        entityId={DEFAULT_ENTITY.id}
        entityName={DEFAULT_ENTITY.name}
        entityType={DEFAULT_ENTITY.type}
        status={DEFAULT_ENTITY.status}
        colors={colors}
      />

      {/* ---- Sub-Tab Bar ---- */}
      <BizSubTabBar
        tabs={visibleSubTabs}
        activeId={currentTab}
        onSelect={(id) => setActiveSubTab(id as DataRoomSubTab)}
      />

      {/* ---- Content ---- */}
      {renderContent()}

      {/* Bottom spacer */}
      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  // -- Layout ----------------------------------------------------------------
  root: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },

  // -- Overview: Stats Grid --------------------------------------------------
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.lg,
  },
  statCell: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: BP.champagneGold,
  },
  statLabel: {
    fontSize: 11,
    color: BP.ash,
    letterSpacing: 0.3,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: BP.graphite,
  },
  statsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BP.graphite,
  },
  statsFooterText: {
    fontSize: 11,
    color: BP.ash,
  },

  // -- Overview: Category Breakdown ------------------------------------------
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 6,
  },
  categoryIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: BP.smoke,
  },
  categoryCount: {
    fontSize: 13,
    fontWeight: '700',
    color: BP.champagneGold,
    minWidth: 20,
    textAlign: 'right',
  },

  // -- Overview: Quick Action ------------------------------------------------
  quickActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: BP.glass,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: BP.champagneGold + '30',
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: BP.champagneGold,
  },

  // -- Library: Filter Pills -------------------------------------------------
  filterPillRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Library: Document Card ------------------------------------------------
  docCard: {
    marginBottom: Spacing.sm,
  },
  docTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  fileTypeIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  docTitleBlock: {
    flex: 1,
  },
  docTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: BP.smoke,
    flex: 1,
  },
  docMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  versionBadge: {
    backgroundColor: BP.champagneGold + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  versionBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: BP.champagneGold,
    letterSpacing: 0.3,
  },
  docBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: Spacing.sm,
  },
  docMeta: {
    fontSize: 11,
    color: BP.ash,
  },
  docMetaSep: {
    fontSize: 11,
    color: BP.platinum,
  },
  accessBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  accessBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  watermarkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: BP.glass,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  watermarkText: {
    fontSize: 9,
    fontWeight: '700',
    color: BP.ash,
    letterSpacing: 0.3,
  },

  // -- Versioning ------------------------------------------------------------
  versionRow: {
    paddingVertical: Spacing.sm,
  },
  versionTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  versionDocTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: BP.smoke,
  },
  versionNumBadge: {
    backgroundColor: BP.champagneGold + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  versionNumText: {
    fontSize: 10,
    fontWeight: '700',
    color: BP.champagneGold,
    letterSpacing: 0.3,
  },
  versionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  changeTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  changeTypeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  versionMeta: {
    fontSize: 12,
    color: BP.ash,
  },
  versionMetaSep: {
    fontSize: 12,
    color: BP.platinum,
  },
  versionSummary: {
    fontSize: 12,
    color: BP.ash,
    lineHeight: 18,
    fontStyle: 'italic',
  },

  // -- Packets ---------------------------------------------------------------
  packetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  packetTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: BP.smoke,
  },
  packetDescription: {
    fontSize: 12,
    color: BP.ash,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  packetMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  packetMeta: {
    fontSize: 11,
    color: BP.ash,
  },
  packetMetaSep: {
    fontSize: 11,
    color: BP.platinum,
  },
  audienceBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  audienceBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  packetWatermarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.sm,
  },
  packetWatermarkText: {
    fontSize: 11,
    color: BP.ash,
  },

  // -- Requests --------------------------------------------------------------
  requestRow: {
    paddingVertical: Spacing.sm,
  },
  requestTopLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  requestName: {
    fontSize: 14,
    fontWeight: '600',
    color: BP.smoke,
  },
  requestType: {
    fontSize: 11,
    color: BP.ash,
    marginTop: 1,
  },
  requestDocs: {
    fontSize: 12,
    color: BP.champagneGold,
    marginBottom: 4,
  },
  requestMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  requestMeta: {
    fontSize: 11,
    color: BP.ash,
  },
  requestMetaSep: {
    fontSize: 11,
    color: BP.platinum,
  },
  requestNotes: {
    fontSize: 12,
    color: BP.ash,
    lineHeight: 18,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
    paddingLeft: Spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: BP.graphite,
  },

  // -- Audit -----------------------------------------------------------------
  auditRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  auditIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  auditContent: {
    flex: 1,
  },
  auditTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 2,
  },
  auditActor: {
    fontSize: 13,
    fontWeight: '600',
    color: BP.smoke,
  },
  auditActionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  auditActionBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  auditDocTitle: {
    fontSize: 12,
    color: BP.champagneGold,
    marginBottom: 2,
  },
  auditMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  auditTimestamp: {
    fontSize: 11,
    color: BP.ash,
  },
  auditMetaSep: {
    fontSize: 11,
    color: BP.platinum,
  },
  auditIp: {
    fontSize: 11,
    color: BP.ash,
    fontFamily: 'monospace',
  },

  // -- Shared ----------------------------------------------------------------
  inCardDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BP.graphite,
    marginVertical: Spacing.xs,
  },
  emptyText: {
    fontSize: 13,
    color: BP.ash,
    textAlign: 'center',
    paddingVertical: Spacing.md,
  },

  // -- Document: Title with Canonical ----------------------------------------
  docTitleWithCanonical: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  canonicalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: BP.champagneGold + '15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  canonicalBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: BP.champagneGold,
    letterSpacing: 0.3,
  },

  // -- Document: Metadata section -------------------------------------------
  docMetadataSection: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BP.graphite,
  },
  docMetadataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  docMetadataItem: {
    minWidth: '45%',
    marginBottom: 4,
  },
  docMetadataLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: BP.ash,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 1,
  },
  docMetadataValue: {
    fontSize: 12,
    fontWeight: '500',
    color: BP.smoke,
  },
  sensitivityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  sensitivityBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  docMetadataNotes: {
    fontSize: 11,
    color: BP.ash,
    fontStyle: 'italic',
    marginTop: Spacing.xs,
    lineHeight: 16,
  },
  promoteCanonicalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: BP.glass,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: BP.champagneGold + '30',
  },
  promoteCanonicalText: {
    fontSize: 12,
    fontWeight: '600',
    color: BP.champagneGold,
  },

  // -- Packets: Spec packet types -------------------------------------------
  specPacketGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  specPacketChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: BP.glass,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  specPacketChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: BP.smoke,
  },

  // -- Requests: SLA tracking -----------------------------------------------
  slaRow: {
    marginTop: Spacing.xs,
  },
  slaDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  slaDueText: {
    fontSize: 11,
    fontWeight: '600',
  },
  slaChecklist: {
    gap: 3,
    paddingLeft: Spacing.xs,
  },
  slaChecklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  slaChecklistText: {
    fontSize: 11,
    fontWeight: '500',
  },

  // -- Packet Builder -------------------------------------------------------
  pktBuilderDocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BP.graphite,
  },
  pktBuilderDocTitle: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  pktBuilderDocMeta: {
    fontSize: 10,
    fontWeight: '600',
    color: BP.ash,
    letterSpacing: 0.3,
  },
  pktBuilderOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BP.graphite,
  },
  pktBuilderOptionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: BP.smoke,
  },
  pktBuilderOptionValue: {
    fontSize: 13,
    fontWeight: '500',
    color: BP.ash,
  },
  pktBuilderPillRow: {
    flexDirection: 'row',
    gap: 4,
  },
  pktBuilderPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  pktBuilderPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
