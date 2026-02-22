/**
 * Game Team Context Sheet
 * Bottom sheet shown on logo tap in game cards.
 * Shows pregame or postgame context for the tapped team.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { KaNeXT_PREGAME, KaNeXT_GAME_IMPACT, type KaNeXTGame } from '@/data/fmu';

interface GameTeamContextSheetProps {
  visible: boolean;
  onClose: () => void;
  game: KaNeXTGame | null;
  team: 'fmu' | 'opponent';
  colors: typeof Colors.light;
  router: any;
}

export function GameTeamContextSheet({ visible, onClose, game, team, colors, router }: GameTeamContextSheetProps) {
  if (!game) return <BottomSheet visible={false} onClose={onClose} useModal><View /></BottomSheet>;

  const isFmu = team === 'fmu';
  const teamName = isFmu ? 'KaNeXT Sports' : game.opponent;
  const teamKR = isFmu ? 74 : (game.opponentKR ?? 0);
  const teamRecord = isFmu ? '' : (game.opponentRecord ?? '');
  const isCompleted = game.status === 'final';
  const pregame = game.id ? KaNeXT_PREGAME[game.id] : null;
  const impact = isCompleted && game.id ? KaNeXT_GAME_IMPACT[game.id] : null;

  const navigate = (params: any) => {
    onClose();
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(params);
    }, 200);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={[styles.teamName, { color: colors.text }]}>{teamName}</ThemedText>
          <View style={styles.metaRow}>
            {teamKR > 0 && (
              <View style={[styles.krBadge, { backgroundColor: colors.text + '12' }]}>
                <Text style={[styles.krText, { color: colors.text }]}>KR {teamKR}</Text>
              </View>
            )}
            {teamRecord !== '' && (
              <ThemedText style={[styles.record, { color: colors.textSecondary }]}>{teamRecord}</ThemedText>
            )}
          </View>
          {isCompleted && game.score && (
            <ThemedText style={[styles.score, { color: game.score.startsWith('W') ? '#22C55E' : '#EF4444' }]}>
              {game.score.replace('-', '–')}
            </ThemedText>
          )}
        </View>

        {/* Context Bullets */}
        <View style={styles.bulletSection}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textTertiary }]}>
            {isCompleted ? 'POSTGAME CONTEXT' : 'PREGAME CONTEXT'}
          </ThemedText>

          {isCompleted ? (
            <>
              {game.score && (
                <BulletItem colors={colors} text={`KaNeXT ${game.score.startsWith('W') ? 'won' : 'lost'} ${game.score.replace(/^[WL] /, '').replace('-', '–')}`} />
              )}
              {impact && (() => {
                const top = [...impact.starters, ...impact.bench].sort((a, b) => b.pgis - a.pgis).slice(0, 2);
                return <BulletItem colors={colors} text={`PGIS leaders: ${top.map(p => `${p.name.split(' ').pop()} ${p.pgis > 0 ? '+' : ''}${p.pgis}`).join(', ')}`} />;
              })()}
              <BulletItem colors={colors} text={`${game.gameType ?? 'NON-CONF'} · ${game.venue ?? game.location}`} />
            </>
          ) : (
            <>
              {pregame && (
                <>
                  {pregame.clusterRatings.slice(0, 3).length > 0 && (
                    <BulletItem colors={colors} text={`Strengths: ${pregame.clusterRatings.sort((a, b) => b.rating - a.rating).slice(0, 2).map(c => `${c.cluster} ${c.rating}`).join(', ')}`} />
                  )}
                  {pregame.oppThreats.length > 0 && (
                    <BulletItem colors={colors} text={`Key threats: ${pregame.oppThreats.slice(0, 2).map(t => `${t.name} (${t.archetype})`).join(', ')}`} />
                  )}
                </>
              )}
              <BulletItem colors={colors} text={`${game.date}${game.gameTime ? ` · ${game.gameTime}` : ''} · ${game.venue ?? game.location}`} />
            </>
          )}
        </View>

        {/* Quick Routes */}
        <View style={styles.routeSection}>
          {isCompleted ? (
            <>
              <RouteButton
                colors={colors}
                label="Open KaNeXTCast"
                icon="play.rectangle.fill"
                onPress={() => navigate({ pathname: '/coach/game-detail', params: { gameId: game.id, tab: 'report', espnTab: 'gamecast' } })}
              />
              <RouteButton
                colors={colors}
                label="Full Team Profile"
                icon="person.2.fill"
                onPress={() => navigate({ pathname: '/coach/game-detail', params: { gameId: game.id, tab: 'report' } })}
              />
            </>
          ) : (
            <>
              <RouteButton
                colors={colors}
                label="Open Pregame Hub"
                icon="sportscourt.fill"
                onPress={() => navigate({ pathname: '/coach/game-detail', params: { gameId: game.id } })}
              />
              <RouteButton
                colors={colors}
                label="Full Team Profile"
                icon="person.2.fill"
                onPress={() => navigate({ pathname: '/coach/game-detail', params: { gameId: game.id, tab: 'prep' } })}
              />
            </>
          )}
        </View>
      </View>
    </BottomSheet>
  );
}

function BulletItem({ colors, text }: { colors: typeof Colors.light; text: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={[styles.bulletDot, { backgroundColor: colors.textTertiary }]} />
      <ThemedText style={[styles.bulletText, { color: colors.textSecondary }]}>{text}</ThemedText>
    </View>
  );
}

function RouteButton({ colors, label, icon, onPress }: { colors: typeof Colors.light; label: string; icon: string; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.routeBtn, { backgroundColor: colors.backgroundSecondary }, pressed && { opacity: 0.7 }]}
      onPress={onPress}
    >
      <IconSymbol name={icon as any} size={16} color={colors.text} />
      <ThemedText style={[styles.routeBtnText, { color: colors.text }]}>{label}</ThemedText>
      <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  header: { alignItems: 'center', marginBottom: Spacing.lg },
  teamName: { fontSize: 18, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  krBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  krText: { fontSize: 13, fontWeight: '700' },
  record: { fontSize: 13 },
  score: { fontSize: 20, fontWeight: '800', marginTop: 8 },
  bulletSection: { marginBottom: Spacing.lg },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: 8 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6, gap: 8 },
  bulletDot: { width: 5, height: 5, borderRadius: 2.5, marginTop: 6 },
  bulletText: { fontSize: 13, flex: 1, lineHeight: 18 },
  routeSection: { gap: 8 },
  routeBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.lg, gap: 10 },
  routeBtnText: { fontSize: 15, fontWeight: '600', flex: 1 },
});
