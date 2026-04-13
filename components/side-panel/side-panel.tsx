/**
 * Side Panel Shell — Universal side panel for all screens.
 * Wrapped in DrawerPanel primitive for animated slide-in/out.
 *
 * Layout: Screen-specific content rows only.
 * Mode/org switching lives exclusively in the Profile org drawer.
 */

import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePathname } from 'expo-router';
import { useColors } from '@/hooks/use-colors';
import { DrawerPanel } from '@/components/ui/drawer-panel';
import { KMenuButton } from '@/components/ui/k-menu-button';

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
import { CommunitySocialPanel } from './community-social-panel';
import { SportsSocialPanel } from './sports-social-panel';
import { CommunityAgendaPanel } from './community-agenda-panel';
import { CommunityKtvPanel } from './community-ktv-panel';
import { EducationHubPanel } from './education-hub-panel';
import { CampusPanel } from './campus-panel';
import { CommunityMembersPanel } from './community-members-panel';
import { CommunityOutreachPanel } from './community-outreach-panel';
import { CommunityGivePanel } from './community-give-panel';
import { CommunityKplayPanel } from './community-kplay-panel';
import { CommunityKaypayPanel } from './community-kaypay-panel';
import { EduFundPanel } from './edu-fund-panel';
import { SportsHubPanel } from './sports-hub-panel';
import { SportsAgendaPanel } from './sports-agenda-panel';
import { SportsRosterPanel } from './sports-roster-panel';
import { SportsRecruitsPanel } from './sports-recruits-panel';
import { SportsBoosterPanel } from './sports-booster-panel';
import { NetworkPanel } from './network-panel';
import { DealsPanel } from './deals-panel';
import { DefaultPanel } from './default-panel';
import { BusinessHubPanel } from './business-hub-panel';
import { TeamPanel } from './team-panel';
import { InquiriesPanel } from './inquiries-panel';
import { BusinessStorePanel } from './business-store-panel';
import { useMode } from '@/context/app-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const SIDE_PANEL_WIDTH = Math.min(300, SCREEN_WIDTH * 0.82);

const BRAND_NAMES: Record<string, string> = {
  personal:  'Sammy Kalejaiye',
  business:  'KaNeXT',
  education: 'Lincoln University',
  community: 'ICCLA',
  sports:    "LU Men's Basketball",
};

interface SidePanelProps {
  visible: boolean;
  onClose: () => void;
}

export function SidePanel({ visible, onClose }: SidePanelProps) {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const mode = useMode();
  const brandName = BRAND_NAMES[mode] ?? '';

  const isMessages = pathname.includes('messages');
  const isPhone = pathname.includes('phone');
  const isNexus = pathname.includes('nexus');
  const isMode = pathname.startsWith('/mode') || pathname.includes('/mode/');
  const isAgenda = pathname.includes('agenda');
  const isSeason = pathname.includes('season');
  const isRoster = pathname.includes('roster');
  const isRecruits = pathname.includes('recruits');
  const isSocial = pathname.includes('social');
  const isBusinessStore = pathname.includes('business-store');
  const isStore = pathname.includes('store') && !isBusinessStore;
  const isKayTV = pathname.includes('kaytv');
  const isWallet = pathname.includes('wallet') || pathname.includes('kaypay');
  const isStudios = pathname.includes('studios');
  const isAdmissions    = pathname.includes('/admissions');
  const isHubCommunity  = pathname.includes('hub/community') || pathname.includes('hub/services') || pathname.includes('hub/groups') || pathname.includes('hub/volunteers') || pathname.includes('hub/care-requests') || pathname.includes('hub/check-in') || pathname.includes('hub/announcement-compose') || pathname.includes('hub/care-request');
  const isHubEducation  = pathname.includes('hub/education') || pathname.includes('hub/edu-announcement');
  const isCampus        = pathname.includes('hub/campus');
  const isHubSports     = pathname.includes('hub/sports');
  const isBooster       = pathname.includes('/booster');
  const isHubBusiness  = pathname.includes('hub/business');
  const isTeam         = pathname.includes('/team') && !pathname.includes('admissions');
  const isInquiries    = pathname.includes('/inquiries');
  const isHub = pathname.includes('hub') && !isHubCommunity && !isHubEducation && !isCampus && !isHubSports && !isHubBusiness;
  const isDeals    = pathname.includes('deals');
  const isNetwork  = pathname.includes('network');
  const isMembers  = pathname.includes('members');
  const isOutreach = pathname.includes('outreach');
  const isGive     = pathname.includes('/give');
  const isFund     = pathname.includes('/fund');
  const isPersonalHub = isHub && mode === 'personal';

  return (
    <DrawerPanel visible={visible} onClose={onClose} width={SIDE_PANEL_WIDTH} backgroundColor={isPersonalHub ? C.surface : C.bg}>
      {isPersonalHub ? (
        /* Personal hub: full-height flex container — HubPanel owns its layout */
        <View style={{ flex: 1, backgroundColor: C.surface, paddingTop: insets.top + 20, paddingBottom: insets.bottom }}>
          <HubPanel />
        </View>
      ) : (
        <View style={{ flex: 1, backgroundColor: C.bg }}>
          {/* K toggle + brand name */}
          <Pressable
            style={[styles.kBtn, { top: insets.top + 14 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onClose();
            }}
            hitSlop={8}
          >
            <KMenuButton />
          </Pressable>
          {brandName ? (
            <View style={[styles.brandWrap, { top: insets.top + 14 }]}>
              <Text style={[styles.brandName, { color: C.label }]} numberOfLines={1}>{brandName}</Text>
            </View>
          ) : null}

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingTop: insets.top + 88, paddingBottom: insets.bottom + 24 },
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
                    ? (mode === 'community' ? <CommunitySocialPanel /> : mode === 'sports' ? <SportsSocialPanel /> : <SocialPanel />)
                    : isBusinessStore
                      ? <BusinessStorePanel />
                    : isStore
                      ? (mode === 'community' ? <GivePanel /> : <StorePanel />)
                      : isKayTV
                        ? (mode === 'community' ? <CommunityKtvPanel /> : <KayTVPanel />)
                        : isWallet
                          ? (mode === 'community' ? <CommunityKaypayPanel /> : <WalletPanel />)
                          : isHubCommunity
                            ? <CommunityHubPanel />
                            : isHubEducation
                            ? <EducationHubPanel />
                            : isCampus
                            ? <CampusPanel />
                            : isHubSports
                            ? <SportsHubPanel />
                            : isBooster
                            ? <SportsBoosterPanel />
                            : isAdmissions
                            ? <AdmissionsPanel />
                            : isHubBusiness
                            ? <BusinessHubPanel />
                            : isTeam
                            ? <TeamPanel />
                            : isInquiries
                            ? <InquiriesPanel />
                            : isHub
                            ? <HubPanel />
                            : isStudios
                            ? (mode === 'community' ? <CommunityKplayPanel /> : <StudiosPanel />)
                            : isMode
                          ? <ModePanel />
                          : isAgenda
                            ? (mode === 'community' ? <CommunityAgendaPanel /> : mode === 'sports' ? <SportsAgendaPanel /> : <AgendaPanel />)
                            : isSeason
                              ? <SeasonPanel />
                              : isRoster
                                ? (mode === 'sports' ? <SportsRosterPanel /> : <RosterPanel />)
                                : isRecruits
                                  ? (mode === 'sports' ? <SportsRecruitsPanel /> : mode === 'business' ? <LeadsPanel /> : mode === 'education' ? <AdmissionsPanel /> : mode === 'community' ? <OutreachPanel /> : <ProspectsPanel />)
                                  : isOutreach
                                    ? <CommunityOutreachPanel />
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
      )}
    </DrawerPanel>
  );
}

const styles = StyleSheet.create({
  kBtn: {
    position: 'absolute',
    left: 0,
    width: 52,
    height: 44,
    justifyContent: 'center',
    paddingLeft: 16,
    zIndex: 10,
  },
  brandWrap: {
    position: 'absolute',
    left: 52,
    right: 16,
    height: 44,
    justifyContent: 'center',
    zIndex: 10,
  },
  brandName: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
});
