/**
 * Business Data Room Bottom Sheet
 *
 * 2-stage: folders → documents.
 * RBAC-filtered via canAccessDoc() from business-rbac.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  VAULT_FOLDERS,
  VAULT_DOCUMENTS,
  type VaultFolder,
  type VaultDocument,
} from '@/data/mock-business-home';
import { canAccessDoc, type BusinessRoleLens, type DocAccessTag } from '@/utils/business-rbac';
import { Spacing, BorderRadius } from '@/constants/theme';

type Stage = 'folders' | 'documents';

const ACCENT = '#3B82F6';

const ACCESS_TO_TAG: Record<VaultFolder['accessLevel'], DocAccessTag> = {
  public: 'public',
  investor: 'retail',
  board: 'board',
  founder_only: 'founder_only',
};

const DOC_ACCESS_TO_TAG: Record<VaultDocument['accessLevel'], DocAccessTag> = {
  public: 'public',
  investor: 'retail',
  board: 'board',
  founder_only: 'founder_only',
};

const TYPE_ICONS: Record<VaultDocument['type'], string> = {
  pdf: 'doc.text.fill',
  doc: 'doc.fill',
  spreadsheet: 'tablecells.fill',
  deck: 'doc.richtext.fill',
};

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
  role: BusinessRoleLens;
}

export function BizDataRoomSheet({ visible, onClose, colors, role }: Props) {
  const [stage, setStage] = useState<Stage>('folders');
  const [selectedFolder, setSelectedFolder] = useState<VaultFolder | null>(null);

  const handleClose = useCallback(() => {
    setStage('folders');
    setSelectedFolder(null);
    onClose();
  }, [onClose]);

  const handleBack = useCallback(() => {
    setStage('folders');
    setSelectedFolder(null);
  }, []);

  const handleSelectFolder = useCallback((folder: VaultFolder) => {
    setSelectedFolder(folder);
    setStage('documents');
  }, []);

  const visibleFolders = useMemo(
    () => VAULT_FOLDERS.filter((f) => canAccessDoc(ACCESS_TO_TAG[f.accessLevel], role)),
    [role],
  );

  const visibleDocs = useMemo(() => {
    if (!selectedFolder) return [];
    return VAULT_DOCUMENTS.filter(
      (d) => d.folderId === selectedFolder.id && canAccessDoc(DOC_ACCESS_TO_TAG[d.accessLevel], role),
    );
  }, [selectedFolder, role]);

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Data Room" useModal>
      {stage === 'folders' && (
        <View style={styles.container}>
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>FOLDERS</Text>
          {visibleFolders.length === 0 && (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No folders available for your access level.
            </Text>
          )}
          {visibleFolders.map((folder) => (
            <Pressable
              key={folder.id}
              style={[styles.folderRow, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleSelectFolder(folder)}
            >
              <IconSymbol name="folder.fill" size={22} color={ACCENT} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.folderName, { color: colors.text }]}>{folder.name}</Text>
                <Text style={[styles.folderMeta, { color: colors.textSecondary }]}>
                  {folder.documentCount} docs · Updated {folder.lastUpdated}
                </Text>
              </View>
              <View style={[styles.accessBadge, { backgroundColor: ACCENT + '22' }]}>
                <Text style={[styles.accessText, { color: ACCENT }]}>
                  {folder.accessLevel.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
              <IconSymbol name="chevron.right" size={14} color={colors.textSecondary} />
            </Pressable>
          ))}
        </View>
      )}

      {stage === 'documents' && selectedFolder && (
        <View style={styles.container}>
          {/* Back bar */}
          <Pressable style={styles.backBar} onPress={handleBack}>
            <IconSymbol name="chevron.left" size={14} color={ACCENT} />
            <Text style={[styles.backText, { color: ACCENT }]}>Folders</Text>
          </Pressable>

          <Text style={[styles.folderTitle, { color: colors.text }]}>{selectedFolder.name}</Text>

          {visibleDocs.length === 0 && (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No documents available in this folder.
            </Text>
          )}
          {visibleDocs.map((doc) => (
            <Pressable
              key={doc.id}
              style={[styles.docRow, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <IconSymbol name={TYPE_ICONS[doc.type] as any} size={20} color={ACCENT} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.docTitle, { color: colors.text }]}>{doc.name}</Text>
                <Text style={[styles.docMeta, { color: colors.textSecondary }]}>
                  {doc.type.toUpperCase()} · {doc.size} · v{doc.version}
                </Text>
              </View>
              <IconSymbol name="arrow.down.circle" size={16} color={colors.textSecondary} />
            </Pressable>
          ))}
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },

  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  emptyText: { fontSize: 13, fontStyle: 'italic' },

  folderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  folderName: { fontSize: 14, fontWeight: '700' },
  folderMeta: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  folderTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4 },

  accessBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  accessText: { fontSize: 9, fontWeight: '700' },

  backBar: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 },
  backText: { fontSize: 13, fontWeight: '600' },

  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  docTitle: { fontSize: 14, fontWeight: '600' },
  docMeta: { fontSize: 11, fontWeight: '500', marginTop: 2 },
});
