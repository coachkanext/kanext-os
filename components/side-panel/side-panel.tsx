/**
 * Side Panel Shell — Universal side panel for all screens.
 * Wrapped in DrawerPanel primitive for animated slide-in/out.
 *
 * Layout: Screen-specific content rows only.
 * Mode/org switching lives exclusively in the Profile org drawer.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePathname } from 'expo-router';
import { useColors } from '@/hooks/use-colors';
import { DrawerPanel } from '@/components/ui/drawer-panel';

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
import { BusinessSocialPanel } from './business-social-panel';
import { EducationSocialPanel } from './education-social-panel';
import { StorePanel } from './store-panel';
import { GivePanel } from './give-panel';
import { KayTVPanel } from './kaytv-panel';
import { BusinessKtvPanel } from './business-ktv-panel';
import { EducationKtvPanel } from './education-ktv-panel';
import { SportsKtvPanel } from './sports-ktv-panel';
import { WalletPanel } from './wallet-panel';
import { StudiosPanel } from './studios-panel';
import { KPlayPanel } from './kplay-panel';
import { HubPanel } from './hub-panel';
import { CommunityHubPanel } from './community-hub-panel';
import { CommunitySocialPanel } from './community-social-panel';
import { SportsSocialPanel } from './sports-social-panel';
import { CommunityAgendaPanel } from './community-agenda-panel';
import { CommunityKtvPanel } from './community-ktv-panel';
import { EducationHubPanel } from './education-hub-panel';
import { CampusPanel } from './campus-panel';
import { EducationCampusPanel } from './education-campus-panel';
import { CommunityMembersPanel } from './community-members-panel';
import { CommunityOutreachPanel } from './community-outreach-panel';
import { CommunityGivePanel } from './community-give-panel';
import { CommunityKplayPanel } from './community-kplay-panel';
import { SportsKplayPanel } from './sports-kplay-panel';
import { BusinessKplayPanel } from './business-kplay-panel';
import { EducationKplayPanel } from './education-kplay-panel';
import { EduFundPanel } from './edu-fund-panel';
import { SportsHubPanel } from './sports-hub-panel';
import { SportsAgendaPanel } from './sports-agenda-panel';
import { BusinessAgendaPanel } from './business-agenda-panel';
import { EducationAgendaPanel } from './education-agenda-panel';
import { SportsRosterPanel } from './sports-roster-panel';
import { SportsRecruitsPanel } from './sports-recruits-panel';
import { SportsBoosterPanel } from './sports-booster-panel';
import { NetworkPanel } from './network-panel';
import { DealsPanel } from './deals-panel';
import { PortfolioPanel } from './portfolio-panel';
import { PersonalInquiriesPanel } from './personal-inquiries-panel';
import { DefaultPanel } from './default-panel';
import { BusinessHubPanel } from './business-hub-panel';
import { TeamPanel } from './team-panel';
import { WorkforcePanel } from './workforce-panel';
import { InquiriesPanel } from './inquiries-panel';
import { BusinessInquiriesPanel } from './business-inquiries-panel';
import { BusinessStorePanel } from './business-store-panel';
import { useMode } from '@/context/app-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const SIDE_PANEL_WIDTH = Math.min(300, SCREEN_WIDTH * 0.82);


interface SidePanelProps {
  visible: boolean;
  onClose: () => void;
}

export function SidePanel({ visible, onClose }: SidePanelProps) {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const mode = useMode();

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
  const isHubCommunity  = pathname.includes('hub/community') || pathname.includes('hub/com-') || pathname.includes('hub/services') || pathname.includes('hub/groups') || pathname.includes('hub/volunteers') || pathname.includes('hub/care-requests') || pathname.includes('hub/check-in') || pathname.includes('hub/announcement-compose') || pathname.includes('hub/care-request');
  const isHubEducation  = pathname.includes('hub/education') || pathname.includes('hub/edu-');
  const isCampus        = pathname.includes('hub/campus');
  const isCampusTile    = pathname.includes('/campus') && !pathname.includes('hub/campus');
  const isHubSports     = pathname.includes('hub/sports');
  const isBooster       = pathname.includes('/booster');
  const isHubBusiness  = pathname.includes('hub/business') || pathname.includes('hub/biz-') || (pathname.includes('hub/reports') && mode === 'business');
  const isWorkforce    = pathname.includes('/workforce');
  const isTeam         = pathname.includes('/team') && !pathname.includes('admissions') && !pathname.includes('biz-') && !isWorkforce;
  const isInquiries    = pathname.includes('/inquiries');
  const isHub = pathname.includes('hub') && !isHubCommunity && !isHubEducation && !isCampus && !isHubSports && !isHubBusiness;
  const isDeals     = pathname.includes('deals');
  const isPortfolio          = pathname.includes('portfolio');
  const isPersonalInquiries  = pathname.includes('personal-inquiries');
  const isNetwork   = pathname.includes('network');
  const isMembers  = pathname.includes('members');
  const isOutreach = pathname.includes('outreach');
  const isGive     = pathname.includes('/give');
  const isFund     = pathname.includes('/fund');
  const isSettings = pathname.includes('/settings') || pathname.includes('/help');

  // Personal mode panels: full-height bg container, no ScrollView — same as hub-panel
  // NOTE: isSettings intentionally excluded — tile-specific settings pages (agenda/settings, social/settings, etc.)
  // include '/settings' in their path but should resolve via their tile flag (isAgenda, isSocial, etc.)
  const isPersonalPanel = mode === 'personal' && (
    isHub || isWallet || isStudios || isKayTV ||
    isPortfolio || isDeals || isNetwork || isPersonalInquiries
  );

  // Resolve which personal panel to render
  const PersonalPanelContent = isPersonalPanel ? (
    isWallet   ? <WalletPanel />
    : isStudios  ? <KPlayPanel />
    : isKayTV    ? <KayTVPanel />
    : isPortfolio? <PortfolioPanel />
    : isDeals    ? <DealsPanel />
    : isNetwork  ? <NetworkPanel />
    : isPersonalInquiries ? <PersonalInquiriesPanel />
    : <HubPanel />   // hub + settings
  ) : null;

  return (
    <DrawerPanel visible={visible} onClose={onClose} width={SIDE_PANEL_WIDTH} backgroundColor={C.bg}>
      {isPersonalPanel ? (
        /* Personal panels: full-height bg container, no ScrollView — panel owns its layout */
        <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top + 20, paddingBottom: insets.bottom }}>
          {PersonalPanelContent}
        </View>
      ) : (
        <View style={{ flex: 1, backgroundColor: C.bg }}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 24 },
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
                    ? (mode === 'community' ? <CommunitySocialPanel />
                       : mode === 'sports'    ? <SportsSocialPanel />
                       : mode === 'business'  ? <BusinessSocialPanel />
                       : mode === 'education' ? <EducationSocialPanel />
                       : <SocialPanel />)
                    : isBusinessStore
                      ? <BusinessStorePanel />
                    : isStore
                      ? (mode === 'community' ? <GivePanel /> : <StorePanel />)
                      : isKayTV
                        ? (mode === 'community'  ? <CommunityKtvPanel />
                           : mode === 'business'  ? <BusinessKtvPanel />
                           : mode === 'education' ? <EducationKtvPanel />
                           : mode === 'sports'    ? <SportsKtvPanel />
                           : <KayTVPanel />)
                        : isWallet
                          ? <WalletPanel />
                          : isHubCommunity
                            ? <CommunityHubPanel />
                            : isHubEducation
                            ? <EducationHubPanel />
                            : isCampus
                            ? <CampusPanel />
                            : isCampusTile
                            ? <EducationCampusPanel />
                            : isHubSports
                            ? <SportsHubPanel />
                            : isBooster
                            ? <SportsBoosterPanel />
                            : isAdmissions
                            ? <AdmissionsPanel />
                            : isHubBusiness
                            ? <BusinessHubPanel />
                            : isWorkforce
                            ? <WorkforcePanel />
                            : isTeam
                            ? <TeamPanel />
                            : isInquiries
                            ? (mode === 'business' ? <BusinessInquiriesPanel /> : <InquiriesPanel />)
                            : isHub
                            ? (mode === 'business'  ? <BusinessHubPanel />
                               : mode === 'sports'    ? <SportsHubPanel />
                               : mode === 'education' ? <EducationHubPanel />
                               : mode === 'community' ? <CommunityHubPanel />
                               : <HubPanel />)
                            : isStudios
                            ? (mode === 'community'  ? <CommunityKplayPanel />
                               : mode === 'sports'   ? <SportsKplayPanel />
                               : mode === 'business' ? <BusinessKplayPanel />
                               : mode === 'education'? <EducationKplayPanel />
                               : <KPlayPanel />)
                            : isMode
                          ? <ModePanel />
                          : isAgenda
                            ? (mode === 'community' ? <CommunityAgendaPanel />
                              : mode === 'sports'    ? <SportsAgendaPanel />
                              : mode === 'business'  ? <BusinessAgendaPanel />
                              : mode === 'education' ? <EducationAgendaPanel />
                              : <AgendaPanel />)
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
                                    : isPortfolio
                                      ? <PortfolioPanel />
                                    : isPersonalInquiries
                                      ? <PersonalInquiriesPanel />
                                    : isNetwork
                                      ? <NetworkPanel />
                                      : isMembers
                                      ? <CommunityMembersPanel />
                                      : isGive
                                        ? <CommunityGivePanel />
                                        : isFund
                                          ? <EduFundPanel />
                                          : isSettings
                                            ? (mode === 'sports' ? <SportsHubPanel />
                                               : mode === 'education' ? <EducationHubPanel />
                                               : mode === 'community' ? <CommunityHubPanel />
                                               : mode === 'business' ? <BusinessHubPanel />
                                               : <HubPanel />)
                                            : <DefaultPanel pathname={pathname} />
            }
          </ScrollView>
        </View>
      )}
    </DrawerPanel>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
});
