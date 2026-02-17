/**
 * BusinessDataRoom — Data Room tab for KaNeXT OS Business Mode.
 *
 * Sub-tabs:
 *   0 — Overview (stats grid, category breakdown, quick action)
 *   1 — Library (category filter pills, document list with RBAC filtering)
 *   2 — Versioning (version history with change type badges)
 *   3 — Packets (curated document bundles with audience badges)
 *   4 — Requests (inbound access requests with status chips)
 *   5 — Audit (access/download/share event log)
 *
 * RBAC:
 *   B1  — All 6 sub-tabs, sees all documents
 *   B2b — Overview, Library (board+retail+public), Packets, Audit (4 tabs)
 *   B2a — Overview, Library (retail+public only), Packets (filtered view)
 *   B3  — Locked
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, BusinessPalette } from '@/constants/theme';
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
    return ['overview', 'library', 'versioning', 'packets', 'requests', 'audit'];
  }
  if (role === 'B2b') {
    return ['overview', 'library', 'packets', 'audit'];
  }
  if (role === 'B2a') {
    return ['overview', 'library', 'packets'];
  }
  return [];
}

/** Which document access levels a role can see in the library */
function getAllowedAccessLevels(role: BusinessRoleLens): string[] {
  if (isFounder(role)) {
    return ['public', 'retail', 'board', 'founder'];
  }
  if (role === 'B2b') {
    return ['public', 'retail', 'board'];
  }
  if (role === 'B2a') {
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
      return '#6AA9FF';
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
      return '#6AA9FF';
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

function DocumentRow({ doc }: { doc: DataRoomDocument }) {
  const catDef = DOC_CATEGORIES.find((c) => c.id === doc.category);
  const alColor = accessLevelColor(doc.accessLevel);

  return (
    <BizCard style={s.docCard}>
      {/* Top row: file type icon + title + version badge */}
      <View style={s.docTopRow}>
        <View style={[s.fileTypeIcon, { backgroundColor: (catDef?.color ?? BP.ash) + '15' }]}>
          <IconSymbol
            name={fileTypeIcon(doc.fileType) as any}
            size={16}
            color={catDef?.color ?? BP.ash}
          />
        </View>
        <View style={s.docTitleBlock}>
          <ThemedText style={s.docTitle} numberOfLines={1}>
            {doc.title}
          </ThemedText>
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
      </View>

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

function PacketsSection({ role }: { role: BusinessRoleLens }) {
  // B2a only sees retail/partner audience packets
  const visiblePackets = useMemo(() => {
    if (isFounder(role)) return DATA_PACKETS;
    if (role === 'B2b') return DATA_PACKETS;
    // B2a: retail and partner only
    return DATA_PACKETS.filter(
      (p) => p.audience === 'retail' || p.audience === 'partner',
    );
  }, [role]);

  return (
    <View>
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
    marginBottom: 4,
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
});
