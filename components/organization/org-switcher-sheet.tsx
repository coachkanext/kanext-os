/**
 * Organization Switcher — bottom sheet listing available orgs for the current mode.
 */
import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getOrgsForMode, type SwitcherOrg } from '@/data/mock-org-switcher';
import type { Mode } from '@/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  mode: Mode;
  currentOrgId: string;
  onSelectOrg: (org: SwitcherOrg) => void;
}

export function OrgSwitcherSheet({ visible, onClose, mode, currentOrgId, onSelectOrg }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const orgs = getOrgsForMode(mode);

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Switch Organization" useModal>
      <View style={s.content}>
        {orgs.map((org, i) => {
          const isCurrent = org.id === currentOrgId;
          return (
            <React.Fragment key={org.id}>
              <Pressable
                style={({ pressed }) => [
                  s.row,
                  pressed && { backgroundColor: colors.backgroundSecondary },
                ]}
                onPress={() => {
                  onSelectOrg(org);
                  onClose();
                }}
              >
                <View style={[s.icon, { backgroundColor: colors.backgroundTertiary }]}>
                  <IconSymbol name={org.icon as any} size={18} color={colors.textSecondary} />
                </View>
                <View style={s.info}>
                  <ThemedText style={[s.name, isCurrent && { fontWeight: '700' }]}>{org.name}</ThemedText>
                  <ThemedText style={[s.subtitle, { color: colors.textSecondary }]}>{org.subtitle}</ThemedText>
                </View>
                {isCurrent && <IconSymbol name="checkmark" size={18} color="#22C55E" />}
              </Pressable>
              {i < orgs.length - 1 && <View style={[s.divider, { backgroundColor: colors.divider }]} />}
            </React.Fragment>
          );
        })}
      </View>
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  content: {
    paddingBottom: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md + 40 + Spacing.sm,
  },
});
