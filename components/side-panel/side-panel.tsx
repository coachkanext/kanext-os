/**
 * Side Panel Shell — Universal side panel for all screens.
 * Position: absolute left, jet black background.
 *
 * Layout: Screen-specific content rows only.
 * Mode/org switching lives exclusively in the Profile org drawer.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePathname } from 'expo-router';
import { useColors } from '@/hooks/use-colors';

import { MessagesPanel } from './messages-panel';
import { PhonePanel } from './phone-panel';
import { NexusPanel } from './nexus-panel';
import { ModePanel } from './mode-panel';
import { AgendaPanel } from './agenda-panel';
import { SeasonPanel } from './season-panel';
import { RosterPanel } from './roster-panel';
import { ProspectsPanel } from './prospects-panel';
import { LeadsPanel } from './leads-panel';
import { AdmissionsPanel } from './admissions-panel';
import { OutreachPanel } from './outreach-panel';
import { SocialPanel } from './social-panel';
import { StorePanel } from './store-panel';
import { GivePanel } from './give-panel';
import { KayTVPanel } from './kaytv-panel';
import { WalletPanel } from './wallet-panel';
import { StudiosPanel } from './studios-panel';
import { HubPanel } from './hub-panel';
import { CommunityHubPanel } from './community-hub-panel';
import { EducationHubPanel } from './education-hub-panel';
import { CampusPanel } from './campus-panel';
import { CommunityMembersPanel } from './community-members-panel';
import { CommunityOutreachPanel } from './community-outreach-panel';
import { CommunityGivePanel } from './community-give-panel';
import { EduFundPanel } from './edu-fund-panel';
import { NetworkPanel } from './network-panel';
import { DealsPanel } from './deals-panel';
import { EarnPanel } from './earn-panel';
import { DefaultPanel } from './default-panel';
import { useMode } from '@/context/app-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const SIDE_PANEL_WIDTH = Math.min(300, SCREEN_WIDTH * 0.82);

interface SidePanelProps {
  visible: boolean;
}

export function SidePanel({ visible }: SidePanelProps) {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const mode = useMode();

  const isMessages = pathname.includes('messages');
  const isPhone = pathname.includes('phone');
  const isNexus = pathname.includes('nexus');
  const isMode = pathname.includes('mode');
  const isAgenda = pathname.includes('agenda');
  const isSeason = pathname.includes('season');
  const isRoster = pathname.includes('roster');
  const isRecruits = pathname.includes('recruits');
  const isSocial = pathname.includes('social');
  const isStore = pathname.includes('store');
  const isKayTV = pathname.includes('kaytv');
  const isWallet = pathname.includes('wallet');
  const isStudios = pathname.includes('studios');
  const isAdmissions    = pathname.includes('/admissions');
  const isHubCommunity  = pathname.includes('hub/community') || pathname.includes('hub/announcement-compose') || pathname.includes('hub/care-request');
  const isHubEducation  = pathname.includes('hub/education') || pathname.includes('hub/edu-announcement');
  const isCampus        = pathname.includes('hub/campus');
  const isHub = pathname.includes('hub') && !isHubCommunity && !isHubEducation && !isCampus;
  const isEarn     = pathname.includes('earn');
  const isDeals    = pathname.includes('deals');
  const isNetwork  = pathname.includes('network');
  const isMembers  = pathname.includes('members');
  const isOutreach = pathname.includes('outreach');
  const isGive     = pathname.includes('/give');
  const isFund     = pathname.includes('/fund');

  return (
    <View
      style={[styles.container, { width: SIDE_PANEL_WIDTH, backgroundColor: C.surface }]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Screen-specific content — no mode circles or org switcher */}
        {isMessages
          ? <MessagesPanel />
          : isPhone
            ? <PhonePanel />
            : isNexus
              ? <NexusPanel />
              : isSocial
                ? <SocialPanel />
                : isStore
                  ? (mode === 'church' ? <GivePanel /> : <StorePanel />)
                  : isKayTV
                    ? <KayTVPanel />
                    : isWallet
                      ? <WalletPanel />
                      : isHubCommunity
                        ? <CommunityHubPanel />
                        : isHubEducation
                        ? <EducationHubPanel />
                        : isCampus
                        ? <CampusPanel />
                        : isAdmissions
                        ? <AdmissionsPanel />
                        : isHub
                        ? <HubPanel />
                        : isStudios
                        ? <StudiosPanel />
                        : isMode
                      ? <ModePanel />
                      : isAgenda
                        ? <AgendaPanel />
                        : isSeason
                          ? <SeasonPanel />
                          : isRoster
                            ? <RosterPanel />
                            : isRecruits
                              ? (mode === 'business' ? <LeadsPanel /> : mode === 'education' ? <AdmissionsPanel /> : mode === 'church' ? <OutreachPanel /> : <ProspectsPanel />)
                              : isOutreach
                                ? <CommunityOutreachPanel />
                                : isEarn
                                  ? <EarnPanel />
                                : isDeals
                                  ? <DealsPanel />
                                : isNetwork
                                  ? <NetworkPanel />
                                  : isMembers
                                  ? <CommunityMembersPanel />
                                  : isGive
                                    ? <CommunityGivePanel />
                                    : isFund
                                      ? <EduFundPanel />
                                      : <DefaultPanel pathname={pathname} />
        }
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 0,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
});
