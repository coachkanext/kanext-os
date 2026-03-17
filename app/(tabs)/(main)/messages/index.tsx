/**
 * Messages — DMs · Channels · Emails
 * Same pattern as Phone: pills → favorites row → unread cards → recents list.
 * One canvas ScrollView per tab. No swipe pages.
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';
import { useOrganization } from '@/context/app-context';

// ─── Types ────────────────────────────────────────────────────────────────────

type MsgView = 'Inbox' | 'Channels' | 'Emails';

type MsgFav     = { key: string; initials: string; uri?: string; name: string; sub: string };
type DMThread   = { id: string; initials: string; uri?: string; name: string; orgTag: string; preview: string; time: string; unread: boolean };
type Channel    = { id: string; initials: string; name: string; orgTag: string; preview: string; time: string; unreadCount: number };
type EmailThread= { id: string; initials: string; uri?: string; sender: string; subject: string; preview: string; time: string; unread: boolean };

// ─── Org-scoped data ──────────────────────────────────────────────────────────

type OrgMsgData = {
  dmFavs:   MsgFav[];
  chFavs:   MsgFav[];
  emFavs:   MsgFav[];
  dms:      DMThread[];
  channels: Channel[];
  emails:   EmailThread[];
};

const ORG_MSG_DATA: Record<string, OrgMsgData> = {
  'KaNeXT': {
    dmFavs: [
      { key: 'jd', initials: 'JD', uri: 'https://i.pravatar.cc/100?img=3',  name: 'J. Dean',   sub: 'CPO'      },
      { key: 'ar', initials: 'AR', uri: 'https://i.pravatar.cc/100?img=7',  name: 'A. Ramos',  sub: 'CTO'      },
      { key: 'vp', initials: 'VP', uri: 'https://i.pravatar.cc/100?img=11', name: 'V. Patel',  sub: 'Investor' },
      { key: 'rc', initials: 'RC', uri: 'https://i.pravatar.cc/100?img=26', name: 'R. Chen',   sub: 'Design'   },
      { key: 'tm', initials: 'TM', uri: 'https://i.pravatar.cc/100?img=33', name: 'T. Moore',  sub: 'Advisor'  },
    ],
    chFavs: [
      { key: 'c1', initials: '#', name: 'product',   sub: 'KaNeXT' },
      { key: 'c2', initials: '#', name: 'general',   sub: 'KaNeXT' },
      { key: 'c3', initials: '#', name: 'investors', sub: 'KaNeXT' },
      { key: 'c4', initials: '#', name: 'design',    sub: 'KaNeXT' },
    ],
    emFavs: [
      { key: 'e1', initials: 'SF', uri: 'https://i.pravatar.cc/100?img=60', name: 'Stripe',      sub: 'Finance'   },
      { key: 'e2', initials: 'GW', uri: 'https://i.pravatar.cc/100?img=61', name: 'Google',      sub: 'Workspace' },
      { key: 'e3', initials: 'DR', uri: 'https://i.pravatar.cc/100?img=62', name: 'D. Richards', sub: 'Partner'   },
      { key: 'e4', initials: 'AP', uri: 'https://i.pravatar.cc/100?img=63', name: 'Apple',       sub: 'Dev'       },
    ],
    dms: [
      { id: 'd1', initials: 'JD', uri: 'https://i.pravatar.cc/100?img=3',  name: 'J. Dean',   orgTag: 'KaNeXT',    preview: 'Can you review the pitch deck before 2pm?',     time: '10:42 AM', unread: true  },
      { id: 'd2', initials: 'VP', uri: 'https://i.pravatar.cc/100?img=11', name: 'V. Patel',  orgTag: 'Investors', preview: 'Term sheet is ready. Let\'s connect Friday.',  time: '9:30 AM',  unread: true  },
      { id: 'd3', initials: 'AR', uri: 'https://i.pravatar.cc/100?img=7',  name: 'A. Ramos',  orgTag: 'KaNeXT',    preview: 'API rate limits fixed — deploying now.',        time: '8:50 AM',  unread: false },
      { id: 'd4', initials: 'RC', uri: 'https://i.pravatar.cc/100?img=26', name: 'R. Chen',   orgTag: 'KaNeXT',    preview: 'New design system pushed to Figma.',            time: 'Yesterday',unread: false },
      { id: 'd5', initials: 'TM', uri: 'https://i.pravatar.cc/100?img=33', name: 'T. Moore',  orgTag: 'Advisory',  preview: 'Quick thought on go-to-market. Call this week?',time: 'Mon',      unread: false },
    ],
    channels: [
      { id: 'c1', initials: '#', name: 'product',   orgTag: 'KaNeXT', preview: 'AR: Nexus v2 spec is in Notion.',        time: '10:30 AM', unreadCount: 4 },
      { id: 'c2', initials: '#', name: 'general',   orgTag: 'KaNeXT', preview: 'RC: Standup at 11. Don\'t forget.',      time: '9:00 AM',  unreadCount: 1 },
      { id: 'c3', initials: '#', name: 'investors', orgTag: 'KaNeXT', preview: 'VP: Term sheet coming EOD Friday.',      time: 'Yesterday',unreadCount: 0 },
      { id: 'c4', initials: '#', name: 'design',    orgTag: 'KaNeXT', preview: 'RC: New component library is live.',     time: 'Yesterday',unreadCount: 0 },
      { id: 'c5', initials: '#', name: 'sales',     orgTag: 'KaNeXT', preview: 'JD: Pipeline updated. 3 new leads.',    time: 'Mon',      unreadCount: 0 },
    ],
    emails: [
      { id: 'e1', initials: 'SF', uri: 'https://i.pravatar.cc/100?img=60', sender: 'Stripe Finance',   subject: 'Your payout is on the way',      preview: 'A transfer of $4,280.00 has been initiated…',          time: '11:00 AM', unread: true  },
      { id: 'e2', initials: 'GW', uri: 'https://i.pravatar.cc/100?img=61', sender: 'Google Workspace', subject: 'Storage limit warning',          preview: 'Your organization is using 87% of available storage…', time: '8:45 AM',  unread: true  },
      { id: 'e3', initials: 'AP', uri: 'https://i.pravatar.cc/100?img=63', sender: 'Apple Developer',  subject: 'App Store review approved',      preview: 'KaNeXT OS v2.1.0 is now available on the App Store…', time: 'Yesterday',unread: false },
      { id: 'e4', initials: 'DR', uri: 'https://i.pravatar.cc/100?img=62', sender: 'D. Richards',      subject: 'Partnership inquiry',            preview: 'Hi Sammy, wanted to discuss a potential collaboration…',time: 'Yesterday',unread: false },
      { id: 'e5', initials: 'NB', uri: 'https://i.pravatar.cc/100?img=64', sender: 'Notion Bot',       subject: 'Weekly digest — 3 updates',     preview: 'Your team made 3 updates to shared pages this week…', time: 'Mon',      unread: false },
    ],
  },

  'Lincoln U': {
    dmFavs: [
      { key: 'ct', initials: 'CT', uri: 'https://i.pravatar.cc/100?img=15', name: 'Coach T.',    sub: 'Head Coach' },
      { key: 'tw', initials: 'TW', uri: 'https://i.pravatar.cc/100?img=20', name: 'T. Williams', sub: 'QB'         },
      { key: 'sl', initials: 'SL', uri: 'https://i.pravatar.cc/100?img=47', name: 'S. Lee',      sub: 'Academic'   },
      { key: 'jb', initials: 'JB', uri: 'https://i.pravatar.cc/100?img=22', name: 'J. Brooks',   sub: 'Recruit'    },
      { key: 'ad', initials: 'AD', uri: 'https://i.pravatar.cc/100?img=31', name: 'A. Davis',    sub: 'Booster'    },
    ],
    chFavs: [
      { key: 'c1', initials: '#', name: 'coaching',   sub: 'Lincoln U' },
      { key: 'c2', initials: '#', name: 'roster',     sub: 'Lincoln U' },
      { key: 'c3', initials: '#', name: 'recruiting', sub: 'Lincoln U' },
      { key: 'c4', initials: '#', name: 'game-day',   sub: 'Lincoln U' },
    ],
    emFavs: [
      { key: 'e1', initials: 'NC', uri: 'https://i.pravatar.cc/100?img=65', name: 'NCAA',       sub: 'Compliance' },
      { key: 'e2', initials: 'SN', uri: 'https://i.pravatar.cc/100?img=66', name: 'Scouts',     sub: 'Network'    },
      { key: 'e3', initials: 'BS', uri: 'https://i.pravatar.cc/100?img=67', name: 'Boosters',   sub: 'Fund'       },
      { key: 'e4', initials: 'HU', uri: 'https://i.pravatar.cc/100?img=68', name: 'Hotels',     sub: 'Travel'     },
    ],
    dms: [
      { id: 'd1', initials: 'CT', uri: 'https://i.pravatar.cc/100?img=15', name: 'Coach Thomas',orgTag: 'Lincoln U', preview: 'Film session moved to Thursday at 4pm.',       time: '10:15 AM', unread: true  },
      { id: 'd2', initials: 'TW', uri: 'https://i.pravatar.cc/100?img=20', name: 'T. Williams', orgTag: 'Lincoln U', preview: 'My 40 time dropped to 4.38 — ready for eval.', time: '9:00 AM',  unread: true  },
      { id: 'd3', initials: 'JB', uri: 'https://i.pravatar.cc/100?img=22', name: 'J. Brooks',   orgTag: 'Recruits',  preview: 'Still deciding between two offers. Thoughts?', time: 'Yesterday',unread: false },
      { id: 'd4', initials: 'SL', uri: 'https://i.pravatar.cc/100?img=47', name: 'S. Lee',      orgTag: 'Lincoln U', preview: 'Grades posted. All players cleared.',          time: 'Yesterday',unread: false },
      { id: 'd5', initials: 'AD', uri: 'https://i.pravatar.cc/100?img=31', name: 'A. Davis',    orgTag: 'Booster',   preview: 'Donation confirmed — $5k for equipment.',      time: 'Mon',      unread: false },
    ],
    channels: [
      { id: 'c1', initials: '#', name: 'coaching-staff',orgTag: 'Lincoln U', preview: 'Coach T: Film review at 4pm today.',  time: '10:00 AM', unreadCount: 3 },
      { id: 'c2', initials: '#', name: 'roster',        orgTag: 'Lincoln U', preview: 'TW cleared for Saturday\'s game.',    time: '8:45 AM',  unreadCount: 1 },
      { id: 'c3', initials: '#', name: 'recruiting',    orgTag: 'Lincoln U', preview: 'Top recruit visiting campus Friday.', time: 'Yesterday',unreadCount: 0 },
      { id: 'c4', initials: '#', name: 'booster-club',  orgTag: 'Lincoln U', preview: 'AD: $5k donation confirmed.',         time: 'Yesterday',unreadCount: 0 },
      { id: 'c5', initials: '#', name: 'game-day',      orgTag: 'Lincoln U', preview: 'Kickoff moved to 1pm. Update fans.',  time: 'Mon',      unreadCount: 0 },
    ],
    emails: [
      { id: 'e1', initials: 'NC', uri: 'https://i.pravatar.cc/100?img=65', sender: 'NCAA Compliance', subject: 'Eligibility report due Oct 15',  preview: 'Please submit all eligibility documentation by October 15th…', time: '10:00 AM',unread: true  },
      { id: 'e2', initials: 'SN', uri: 'https://i.pravatar.cc/100?img=66', sender: 'Scout Network',   subject: 'New recruit profile: J. Brooks', preview: 'A new prospect matching your criteria has been flagged…',        time: '8:30 AM', unread: true  },
      { id: 'e3', initials: 'BS', uri: 'https://i.pravatar.cc/100?img=67', sender: 'BoosterSync',     subject: 'Donation confirmed: $5,000',     preview: 'A. Davis has completed a $5,000 equipment fund contribution…',  time: 'Yesterday',unread: false },
      { id: 'e4', initials: 'HU', uri: 'https://i.pravatar.cc/100?img=68', sender: 'Hotel Uno',       subject: 'Away game hotel confirmed',      preview: 'Reservation for 32 rooms confirmed for Friday Nov 8th…',        time: 'Yesterday',unread: false },
      { id: 'e5', initials: 'SD', uri: 'https://i.pravatar.cc/100?img=69', sender: 'SportsNews Daily',subject: 'Lincoln U ranked #12 in SWAC',  preview: 'This week\'s SWAC power rankings are in. Lincoln U rises to…',  time: 'Mon',      unread: false },
    ],
  },

  'ICCLA': {
    dmFavs: [
      { key: 'pk', initials: 'PK', uri: 'https://i.pravatar.cc/100?img=40', name: 'Pastor K.',   sub: 'Lead Pastor' },
      { key: 'mr', initials: 'MR', uri: 'https://i.pravatar.cc/100?img=44', name: 'M. Rivera',   sub: 'Deacon'      },
      { key: 'kp', initials: 'KP', uri: 'https://i.pravatar.cc/100?img=48', name: 'K. Patterson',sub: 'Volunteer'   },
      { key: 'dm', initials: 'DM', uri: 'https://i.pravatar.cc/100?img=52', name: 'Deacon M.',   sub: 'Outreach'    },
      { key: 'lg', initials: 'LG', uri: 'https://i.pravatar.cc/100?img=56', name: 'L. Grant',    sub: 'Outreach'    },
    ],
    chFavs: [
      { key: 'c1', initials: '#', name: 'announcements', sub: 'ICCLA' },
      { key: 'c2', initials: '#', name: 'volunteers',    sub: 'ICCLA' },
      { key: 'c3', initials: '#', name: 'outreach',      sub: 'ICCLA' },
      { key: 'c4', initials: '#', name: 'youth',         sub: 'ICCLA' },
    ],
    emFavs: [
      { key: 'e1', initials: 'CD', uri: 'https://i.pravatar.cc/100?img=57', name: 'City of LA',  sub: 'Permits'   },
      { key: 'e2', initials: 'FB', uri: 'https://i.pravatar.cc/100?img=58', name: 'Food Bank',   sub: 'Partner'   },
      { key: 'e3', initials: 'GF', uri: 'https://i.pravatar.cc/100?img=59', name: 'GivingFuel',  sub: 'Donations' },
      { key: 'e4', initials: 'PB', uri: 'https://i.pravatar.cc/100?img=70', name: 'Planning Bd', sub: 'City'      },
    ],
    dms: [
      { id: 'd1', initials: 'PK', uri: 'https://i.pravatar.cc/100?img=40', name: 'Pastor K.',   orgTag: 'ICCLA',   preview: 'Sunday guest speaker confirmed — share it.',    time: '9:45 AM',  unread: true  },
      { id: 'd2', initials: 'MR', uri: 'https://i.pravatar.cc/100?img=44', name: 'M. Rivera',   orgTag: 'ICCLA',   preview: 'Volunteer list for Saturday — can you pull it?',time: '8:30 AM',  unread: true  },
      { id: 'd3', initials: 'KP', uri: 'https://i.pravatar.cc/100?img=48', name: 'K. Patterson',orgTag: 'ICCLA',   preview: '12 confirmed volunteers. Still need 3 more.',  time: 'Yesterday',unread: false },
      { id: 'd4', initials: 'DM', uri: 'https://i.pravatar.cc/100?img=52', name: 'Deacon M.',   orgTag: 'ICCLA',   preview: 'Food pantry restocked. Open Thursday.',        time: 'Yesterday',unread: false },
      { id: 'd5', initials: 'LG', uri: 'https://i.pravatar.cc/100?img=56', name: 'L. Grant',    orgTag: 'Outreach',preview: 'Neighborhood flyers dropped off on MLK Blvd.', time: 'Mon',      unread: false },
    ],
    channels: [
      { id: 'c1', initials: '#', name: 'announcements',orgTag: 'ICCLA', preview: 'Pastor K: Sunday — Guest speaker Dr. Evans.',time: '9:00 AM',  unreadCount: 5 },
      { id: 'c2', initials: '#', name: 'volunteers',   orgTag: 'ICCLA', preview: 'Deacon M: 12 confirmed for Saturday.',       time: '8:30 AM',  unreadCount: 2 },
      { id: 'c3', initials: '#', name: 'prayer',       orgTag: 'ICCLA', preview: 'Please lift up Brother James this week.',    time: 'Yesterday',unreadCount: 0 },
      { id: 'c4', initials: '#', name: 'outreach',     orgTag: 'ICCLA', preview: 'LG: Flyers distributed on MLK Blvd.',       time: 'Yesterday',unreadCount: 0 },
      { id: 'c5', initials: '#', name: 'youth',        orgTag: 'ICCLA', preview: 'Youth night this Friday at 7pm.',           time: 'Mon',      unreadCount: 0 },
    ],
    emails: [
      { id: 'e1', initials: 'CD', uri: 'https://i.pravatar.cc/100?img=57', sender: 'City of LA',      subject: 'Event permit approved',          preview: 'Your permit for the community block party on July 4th is…',     time: '10:30 AM',unread: true  },
      { id: 'e2', initials: 'FB', uri: 'https://i.pravatar.cc/100?img=58', sender: 'Food Bank LA',    subject: 'Donation pickup Thursday',       preview: 'We have scheduled your food pantry donation pickup for Thursday…',time: '9:00 AM', unread: true  },
      { id: 'e3', initials: 'PB', uri: 'https://i.pravatar.cc/100?img=70', sender: 'Planning Board',  subject: 'Zoning meeting Jan 10',          preview: 'The next community planning board meeting is January 10th…',     time: 'Yesterday',unread: false },
      { id: 'e4', initials: 'GF', uri: 'https://i.pravatar.cc/100?img=59', sender: 'GivingFuel',      subject: 'Monthly giving report',          preview: '48 recurring donors contributed $12,400 this month…',           time: 'Yesterday',unread: false },
      { id: 'e5', initials: 'ND', uri: 'https://i.pravatar.cc/100?img=69', sender: 'Nonprofit Digest',subject: 'Best practices: volunteer mgmt',preview: 'This month\'s top article covers volunteer retention strategies…',time: 'Mon',      unread: false },
    ],
  },
};

function getMsgData(orgName: string | undefined): OrgMsgData {
  if (!orgName) return ORG_MSG_DATA['KaNeXT'];
  return ORG_MSG_DATA[orgName] ?? ORG_MSG_DATA['KaNeXT'];
}

type EmailFilter = 'All' | 'Unread' | 'Drafts' | 'Sent' | 'Archived';

// ─── Compose sheet ────────────────────────────────────────────────────────────

const COMPOSE_ACTIONS = [
  { key: 'dm',      icon: 'person',        label: 'New DM',      sub: 'Message a person'          },
  { key: 'channel', icon: 'person.2',      label: 'New Channel', sub: 'Create a group conversation'},
  { key: 'email',   icon: 'envelope',      label: 'New Email',   sub: 'Send to external address'  },
] as const;

function NewMessageSheet({ visible, onClose, C }: { visible: boolean; onClose: () => void; C: ComponentColors }) {
  return (
    <BottomSheet visible={visible} onClose={onClose} snapPoints={['50%', '100%']}>
      <Text style={[composeS.title, { color: C.label }]}>New Message</Text>
      {COMPOSE_ACTIONS.map((action, i) => (
        <View key={action.key}>
          {i > 0 && <View style={[composeS.sep, { backgroundColor: C.separator }]} />}
          <Pressable
            style={({ pressed }) => [composeS.row, pressed && { opacity: 0.6 }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onClose(); }}
          >
            <View style={[composeS.iconBox, { backgroundColor: C.surfacePressed }]}>
              <IconSymbol name={action.icon as any} size={26} color={C.secondary} />
            </View>
            <View style={composeS.rowText}>
              <Text style={[composeS.rowLabel, { color: C.label }]}>{action.label}</Text>
              <Text style={[composeS.rowSub,   { color: C.secondary }]}>{action.sub}</Text>
            </View>
            <IconSymbol name="chevron.right" size={14} color={C.muted} />
          </Pressable>
        </View>
      ))}
    </BottomSheet>
  );
}

const composeS = StyleSheet.create({
  title:   { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 20 },
  sep:     { height: StyleSheet.hairlineWidth, marginLeft: 76 },
  row:     { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 14 },
  iconBox: { width: 54, height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1 },
  rowLabel:{ fontSize: 16, fontWeight: '500', marginBottom: 2 },
  rowSub:  { fontSize: 13.5 },
});

// ─── Email sub-filter pills ───────────────────────────────────────────────────

const EMAIL_FILTERS: EmailFilter[] = ['All', 'Unread', 'Drafts', 'Sent', 'Archived'];

function EmailFilterPills({ active, onChange, C }: { active: EmailFilter; onChange: (f: EmailFilter) => void; C: ComponentColors }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 7, paddingBottom: 4 }}
      style={{ marginTop: 10, marginBottom: 6 }}
    >
      {EMAIL_FILTERS.map((f) => {
        const isActive = f === active;
        return (
          <Pressable
            key={f}
            style={[pillS.pill, { backgroundColor: isActive ? C.label : C.surfacePressed, borderColor: isActive ? C.label : C.separator }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onChange(f); }}
          >
            <Text style={[pillS.label, { color: isActive ? C.bg : C.secondary }]}>{f}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const pillS = StyleSheet.create({
  pill:  { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  label: { fontSize: 13, fontWeight: '500' },
});

// ─── Segmented Control ────────────────────────────────────────────────────────

function ViewSwitcher({ active, onChange, C }: { active: MsgView; onChange: (v: MsgView) => void; C: ComponentColors }) {
  return (
    <View style={[switcherS.track, { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
      {(['Inbox', 'Channels', 'Emails'] as MsgView[]).map((v) => {
        const isActive = v === active;
        return (
          <Pressable
            key={v}
            style={[switcherS.segment, isActive && [switcherS.segmentActive, { backgroundColor: C.bg }]]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onChange(v); }}
          >
            <Text style={[switcherS.label, { color: isActive ? C.label : C.secondary }, isActive && switcherS.labelActive]}>
              {v}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const switcherS = StyleSheet.create({
  track:  { flexDirection: 'row', borderRadius: 12, padding: 3, marginHorizontal: 20 },
  segment: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
  segmentActive: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 4, elevation: 2 },
  label:  { fontSize: 13.5, fontWeight: '500' },
  labelActive: { fontWeight: '600' },
});

// ─── Section label (identical to Phone) ──────────────────────────────────────

function SLabel({ title, C, first }: { title: string; C: ComponentColors; first?: boolean }) {
  return (
    <Text style={[slabelS.text, { color: C.muted, marginTop: first ? 6 : 14 }]}>
      {title.toUpperCase()}
    </Text>
  );
}
const slabelS = StyleSheet.create({
  text: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, marginBottom: 10 },
});

// ─── Favorites row ────────────────────────────────────────────────────────────

function FavoritesRow({ favs, C }: { favs: MsgFav[]; C: ComponentColors }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 14, paddingBottom: 4 }}
      style={{ marginBottom: 2 }}
    >
      {favs.map((fav) => (
        <Pressable
          key={fav.key}
          style={favS.item}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <View style={[favS.avatar, { borderColor: C.separator }]}>
            {fav.uri
              ? <Image source={{ uri: fav.uri }} style={favS.avatarImg} />
              : <Text style={[favS.initials, { color: C.secondary }]}>{fav.initials}</Text>
            }
          </View>
          <Text style={[favS.name, { color: C.secondary }]} numberOfLines={1}>{fav.name}</Text>
          <Text style={[favS.sub,  { color: C.muted     }]} numberOfLines={1}>{fav.sub}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const favS = StyleSheet.create({
  item:    { alignItems: 'center', gap: 5, width: 62 },
  avatar:  { width: 52, height: 52, borderRadius: 26, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImg: { width: 52, height: 52 },
  initials:{ fontSize: 17, fontWeight: '600' },
  name:    { fontSize: 10.5, fontWeight: '500', textAlign: 'center', maxWidth: 62 },
  sub:     { fontSize: 9, textAlign: 'center' },
});

// ─── Unread cards row (like Missed/Priority on Phone) ────────────────────────

function UnreadDMCards({ items, C }: { items: DMThread[]; C: ComponentColors }) {
  if (items.length === 0) return null;
  return (
    <>
      <SLabel title="Unread" C={C} first />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 4 }}>
        {items.map((dm) => (
          <Pressable
            key={dm.id}
            style={[unreadS.card, { backgroundColor: C.surfacePressed, borderColor: C.separator }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Text style={[unreadS.tag,  { color: C.muted  }]}>{dm.orgTag}</Text>
            <Text style={[unreadS.name, { color: C.label  }]}>{dm.name}</Text>
            <Text style={[unreadS.prev, { color: C.secondary }]} numberOfLines={2}>{dm.preview}</Text>
            <Pressable style={[unreadS.replyBtn, { borderColor: C.separator }]} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <Text style={[unreadS.replyText, { color: C.label }]}>Reply</Text>
            </Pressable>
          </Pressable>
        ))}
      </ScrollView>
    </>
  );
}

function UnreadChannelCards({ items, C }: { items: Channel[]; C: ComponentColors }) {
  if (items.length === 0) return null;
  return (
    <>
      <SLabel title="Unread" C={C} first />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 4 }}>
        {items.map((ch) => (
          <Pressable
            key={ch.id}
            style={[unreadS.card, { backgroundColor: C.surfacePressed, borderColor: C.separator }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Text style={[unreadS.tag,  { color: C.muted  }]}>{ch.orgTag}</Text>
            <Text style={[unreadS.name, { color: C.label  }]}>#{ch.name}</Text>
            <Text style={[unreadS.prev, { color: C.secondary }]} numberOfLines={2}>{ch.preview}</Text>
            <View style={[unreadS.replyBtn, { borderColor: C.separator }]}>
              <Text style={[unreadS.replyText, { color: C.label }]}>{ch.unreadCount} new</Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </>
  );
}

function UnreadEmailCards({ items, C }: { items: EmailThread[]; C: ComponentColors }) {
  if (items.length === 0) return null;
  return (
    <>
      <SLabel title="Unread" C={C} first />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 4 }}>
        {items.map((em) => (
          <Pressable
            key={em.id}
            style={[unreadS.card, { backgroundColor: C.surfacePressed, borderColor: C.separator }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Text style={[unreadS.tag,  { color: C.muted  }]}>{em.sender}</Text>
            <Text style={[unreadS.name, { color: C.label  }]} numberOfLines={1}>{em.subject}</Text>
            <Text style={[unreadS.prev, { color: C.secondary }]} numberOfLines={2}>{em.preview}</Text>
            <Pressable style={[unreadS.replyBtn, { borderColor: C.separator }]} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <Text style={[unreadS.replyText, { color: C.label }]}>Open</Text>
            </Pressable>
          </Pressable>
        ))}
      </ScrollView>
    </>
  );
}

const unreadS = StyleSheet.create({
  card:     { minWidth: 170, maxWidth: 200, borderWidth: 1, borderRadius: 14, padding: 13, gap: 4 },
  tag:      { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  name:     { fontSize: 13.5, fontWeight: '500', lineHeight: 18 },
  prev:     { fontSize: 11.5, marginBottom: 4 },
  replyBtn: { paddingHorizontal: 11, paddingVertical: 5, borderWidth: 1, borderRadius: 8, alignSelf: 'flex-start' },
  replyText:{ fontSize: 11, fontWeight: '600' },
});

// ─── Conversation rows ────────────────────────────────────────────────────────

function DMRow({ item, C }: { item: DMThread; C: ComponentColors }) {
  return (
    <Pressable style={rowS.row} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
      <View style={[rowS.avatar, { backgroundColor: C.surfacePressed, borderColor: C.separator }]}>
        {item.uri
          ? <Image source={{ uri: item.uri }} style={rowS.avatarImg} />
          : <Text style={[rowS.initials, { color: C.secondary }]}>{item.initials}</Text>
        }
      </View>
      <View style={rowS.content}>
        <View style={rowS.topRow}>
          <View style={rowS.nameRow}>
            <Text style={[rowS.name, item.unread && rowS.nameBold, { color: item.unread ? C.label : C.label }]} numberOfLines={1}>{item.name}</Text>
            <View style={[rowS.tag, { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
              <Text style={[rowS.tagText, { color: C.secondary }]}>{item.orgTag}</Text>
            </View>
          </View>
          <Text style={[rowS.time, { color: C.muted }]}>{item.time}</Text>
        </View>
        <Text style={[rowS.preview, { color: item.unread ? C.label : C.secondary }, item.unread && rowS.previewBold]} numberOfLines={1}>{item.preview}</Text>
      </View>
    </Pressable>
  );
}

function ChannelRow({ item, C }: { item: Channel; C: ComponentColors }) {
  const hasUnread = item.unreadCount > 0;
  return (
    <Pressable style={rowS.row} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
      <View style={[rowS.squircle, { backgroundColor: C.surfacePressed, borderColor: C.separator }]}>
        <Text style={[rowS.hash, { color: C.secondary }]}>#</Text>
      </View>
      <View style={rowS.content}>
        <View style={rowS.topRow}>
          <View style={rowS.nameRow}>
            <Text style={[rowS.name, hasUnread && rowS.nameBold, { color: C.label }]} numberOfLines={1}>{item.name}</Text>
            <View style={[rowS.tag, { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
              <Text style={[rowS.tagText, { color: C.secondary }]}>{item.orgTag}</Text>
            </View>
          </View>
          <View style={rowS.rightCol}>
            {hasUnread && (
              <View style={rowS.badge}>
                <Text style={rowS.badgeText}>{item.unreadCount}</Text>
              </View>
            )}
            <Text style={[rowS.time, { color: C.muted }]}>{item.time}</Text>
          </View>
        </View>
        <Text style={[rowS.preview, { color: hasUnread ? C.label : C.secondary }, hasUnread && rowS.previewBold]} numberOfLines={1}>{item.preview}</Text>
      </View>
    </Pressable>
  );
}

function EmailRow({ item, C }: { item: EmailThread; C: ComponentColors }) {
  return (
    <Pressable style={rowS.row} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
      <View style={[rowS.avatar, { backgroundColor: C.surfacePressed, borderColor: C.separator }]}>
        {item.uri
          ? <Image source={{ uri: item.uri }} style={rowS.avatarImg} />
          : <Text style={[rowS.initials, { color: C.secondary }]}>{item.initials}</Text>
        }
      </View>
      <View style={rowS.content}>
        <View style={rowS.topRow}>
          <Text style={[rowS.name, item.unread && rowS.nameBold, { color: C.label, flex: 1, marginRight: 8 }]} numberOfLines={1}>{item.sender}</Text>
          <Text style={[rowS.time, { color: C.muted }]}>{item.time}</Text>
        </View>
        <Text style={[rowS.name, item.unread && rowS.nameBold, { color: C.label, fontSize: 13 }]} numberOfLines={1}>{item.subject}</Text>
        <Text style={[rowS.preview, { color: C.secondary }]} numberOfLines={1}>{item.preview}</Text>
      </View>
    </Pressable>
  );
}

const rowS = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  avatar:   { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' },
  avatarImg:{ width: 44, height: 44 },
  squircle: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  initials: { fontSize: 15, fontWeight: '600' },
  hash:     { fontSize: 20, fontWeight: '700' },
  content:  { flex: 1, minWidth: 0 },
  topRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 },
  nameRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, marginRight: 8 },
  name:     { fontSize: 14, fontWeight: '400' },
  nameBold: { fontWeight: '600' },
  tag:      { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 5 },
  tagText:  { fontSize: 10.5, fontWeight: '500' },
  rightCol: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  badge:    { backgroundColor: '#007AFF', borderRadius: 10, minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  badgeText:{ fontSize: 11, fontWeight: '700', color: '#fff' },
  time:     { fontSize: 11.5 },
  preview:  { fontSize: 13, lineHeight: 18 },
  previewBold: { fontWeight: '500' },
  separator:{ height: StyleSheet.hairlineWidth, marginLeft: 56 },
});

// ─── Tab views ────────────────────────────────────────────────────────────────

function DMsView({ dms, favs, C }: { dms: DMThread[]; favs: MsgFav[]; C: ComponentColors }) {
  const unread = dms.filter((d) => d.unread);
  const recent = dms;
  return (
    <>
      <FavoritesRow favs={favs} C={C} />
      <UnreadDMCards items={unread} C={C} />
      <SLabel title="Recent" C={C} first={unread.length === 0} />
      {recent.map((dm, i) => (
        <View key={dm.id}>
          {i > 0 && <View style={[rowS.separator, { backgroundColor: C.separator }]} />}
          <DMRow item={dm} C={C} />
        </View>
      ))}
    </>
  );
}

function ChannelsView({ channels, favs, C }: { channels: Channel[]; favs: MsgFav[]; C: ComponentColors }) {
  const unread = channels.filter((c) => c.unreadCount > 0);
  const recent = channels;
  return (
    <>
      <FavoritesRow favs={favs} C={C} />
      <UnreadChannelCards items={unread} C={C} />
      <SLabel title="Recent" C={C} first={unread.length === 0} />
      {recent.map((ch, i) => (
        <View key={ch.id}>
          {i > 0 && <View style={[rowS.separator, { backgroundColor: C.separator }]} />}
          <ChannelRow item={ch} C={C} />
        </View>
      ))}
    </>
  );
}

function EmailsView({ emails, favs, filter, onFilterChange, C }: {
  emails: EmailThread[]; favs: MsgFav[];
  filter: EmailFilter; onFilterChange: (f: EmailFilter) => void;
  C: ComponentColors;
}) {
  const unread = emails.filter((e) => e.unread);
  const filtered = filter === 'All'    ? emails
                 : filter === 'Unread' ? unread
                 : [];
  return (
    <>
      <FavoritesRow favs={favs} C={C} />
      <EmailFilterPills active={filter} onChange={onFilterChange} C={C} />
      {filter === 'All' && <UnreadEmailCards items={unread} C={C} />}
      <SLabel title="Recent" C={C} first={filter !== 'All' || unread.length === 0} />
      {filtered.length > 0 ? filtered.map((em, i) => (
        <View key={em.id}>
          {i > 0 && <View style={[rowS.separator, { backgroundColor: C.separator }]} />}
          <EmailRow item={em} C={C} />
        </View>
      )) : (
        <Text style={{ color: C.muted, fontSize: 13, fontStyle: 'italic', paddingTop: 12 }}>No messages</Text>
      )}
    </>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function MessagesScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const org    = useOrganization();
  const data   = getMsgData(org?.name);

  const { dms, channels, emails, dmFavs, chFavs, emFavs } = data;

  const [activeView, setActiveView]     = useState<MsgView>('Inbox');
  const [composeOpen, setComposeOpen]   = useState(false);
  const [emailFilter, setEmailFilter]   = useState<EmailFilter>('All');

  const lastScrollY = useRef(0);
  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>
      {/* ── Segmented control ── */}
      <View style={{ paddingTop: insets.top + 12, paddingBottom: 14 }}>
        <ViewSwitcher active={activeView} onChange={setActiveView} C={C} />
      </View>

      {/* ── Canvas ── */}
      <ScrollView
        style={styles.canvas}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {activeView === 'Inbox'    && <DMsView      dms={dms}           favs={dmFavs} C={C} />}
        {activeView === 'Channels' && <ChannelsView channels={channels} favs={chFavs} C={C} />}
        {activeView === 'Emails'   && <EmailsView   emails={emails} favs={emFavs} filter={emailFilter} onFilterChange={setEmailFilter} C={C} />}
      </ScrollView>

      {/* ── Compose FAB ── */}
      <Pressable
        style={[styles.fab, { bottom: insets.bottom + 60 }]}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setComposeOpen(true); }}
      >
        <IconSymbol name="square.and.pencil" size={20} color="#FFFFFF" />
      </Pressable>

      <NewMessageSheet visible={composeOpen} onClose={() => setComposeOpen(false)} C={C} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root:   { flex: 1 },
  canvas: { flex: 1 },
  fab: {
    position: 'absolute', right: 20,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#000000',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8, elevation: 8,
  },
});
