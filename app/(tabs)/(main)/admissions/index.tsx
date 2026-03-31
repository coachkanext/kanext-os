/**
 * Education Admissions — Enrollment Pipeline CRM.
 * Three tabs: Pipeline / Applications / Campaigns.
 * Three roles: Admin / Student / Parent (cycle pill).
 * Architecture mirrors Community Outreach (outreach/index.tsx).
 */

import React, {
  useState, useRef, useCallback, useMemo, useEffect,
} from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  TextInput, Animated, Switch,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter, hideFooter, showFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import {
  APPLICANTS, ENROLLMENT_STAGES, ENROLLMENT_SUMMARY, CAMPAIGNS,
  getApplications, getApplicantHue, MOCK_INTERACTION_LOG, formatAidAmount,
  getTotalCampaignStats,
  type ApplicantCard, type EnrollmentStage, type ApplicationType, type Decision,
  type AdmCampaign, type CampaignType, type AdmCampaignStatus,
} from '@/data/mock-admissions';

// ── Constants ─────────────────────────────────────────────────────────────────

const TOP_BAR_H = 52;
const PILLS_H   = 48;
const DETAIL_H  = 560;

// ── Types ─────────────────────────────────────────────────────────────────────

type AdmTab  = 'Pipeline' | 'Applications' | 'Campaigns';
type AdmRole = 'Dean' | 'Prospective'; // kept for local reference; actual role driven by useDemoRole

// ── Helpers ───────────────────────────────────────────────────────────────────

function pillsForTab(tab: AdmTab, role: string): string[] {
  const isDean = role === 'Dean';
  if (tab === 'Pipeline') {
    return isDean
      ? ['All', 'Prospect', 'Inquiry', 'Applied', 'Under Review', 'Admitted', 'Deposited', 'Enrolled']
      : [];
  }
  if (tab === 'Applications') {
    return isDean
      ? ['All', 'Unreviewed', 'In Review', 'Decision Ready', 'Decided']
      : [];
  }
  // Campaigns
  return isDean
    ? ['All', 'Active', 'Upcoming', 'Completed', 'Planning', 'Campus Visits', 'Virtual', 'Digital', 'Social', 'Transfer', 'Scholarship', 'Alumni']
    : ['Upcoming', 'Campus Visits', 'Virtual'];
}

function stageColor(stage: EnrollmentStage): string {
  return ENROLLMENT_STAGES.find(s => s.stage === stage)?.color ?? '#999';
}

function appTypeLabel(t: ApplicationType): string {
  const m: Record<ApplicationType, string> = {
    'early-decision': 'Early Decision',
    'early-action':   'Early Action',
    regular:          'Regular',
    transfer:         'Transfer',
    international:    'International',
  };
  return m[t] ?? t;
}

function appTypeColor(t: ApplicationType): string {
  const m: Record<ApplicationType, string> = {
    'early-decision': '#1A1714',
    'early-action':   '#1A1714',
    regular:          '#6B7280',
    transfer:         '#B8943E',
    international:    '#1A1714',
  };
  return m[t] ?? '#999';
}

function decisionColor(d: Decision): string {
  if (d === 'accepted')  return '#5A8A6E';
  if (d === 'denied')    return '#B85C5C';
  if (d === 'waitlisted') return '#B8943E';
  return '#6B7280';
}

function campaignTypeLabel(type: CampaignType): string {
  const m: Record<CampaignType, string> = {
    'campus-visit':   'Campus Visit',
    virtual:          'Virtual',
    'high-school':    'High School',
    digital:          'Digital',
    'direct-mail':    'Direct Mail',
    'transfer-fair':  'Transfer Fair',
    'alumni-referral':'Alumni Referral',
    scholarship:      'Scholarship',
    'social-media':   'Social Media',
  };
  return m[type] ?? type;
}

function campaignTypeColor(type: CampaignType): string {
  const m: Record<CampaignType, string> = {
    'campus-visit':   '#1A1714',
    virtual:          '#1A1714',
    'high-school':    '#1A1714',
    digital:          '#B8943E',
    'direct-mail':    '#6B7280',
    'transfer-fair':  '#1A1714',
    'alumni-referral':'#5A8A6E',
    scholarship:      '#B8943E',
    'social-media':   '#1A1714',
  };
  return m[type] ?? '#6B7280';
}

function campaignTypeIcon(type: CampaignType): string {
  const m: Record<CampaignType, string> = {
    'campus-visit':   'building.columns.fill',
    virtual:          'video.fill',
    'high-school':    'book.closed.fill',
    digital:          'globe',
    'direct-mail':    'envelope.fill',
    'transfer-fair':  'arrow.triangle.2.circlepath',
    'alumni-referral':'person.2.fill',
    scholarship:      'star.fill',
    'social-media':   'play.rectangle.fill',
  };
  return m[type] ?? 'megaphone.fill';
}

function campaignStatusColor(s: AdmCampaignStatus): string {
  if (s === 'active')   return '#5A8A6E';
  if (s === 'upcoming') return '#1A1714';
  if (s === 'planning') return '#B8943E';
  return 'rgba(45,30,18,0.40)';
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function topCampaign(): AdmCampaign {
  return [...CAMPAIGNS].sort((a, b) => b.applicationsGenerated - a.applicationsGenerated)[0];
}

function formatDate(d: string): string {
  const [, m, day] = d.split('-').map(Number);
  return `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m-1]} ${day}`;
}

function flagLabel(f: string): string {
  const m: Record<string, string> = {
    'first-gen':      'First-Gen',
    legacy:           'Legacy',
    athlete:          'Athlete',
    scholarship:      'Scholarship',
    international:    'Intl',
    transfer:         'Transfer',
    underrepresented: 'URM',
  };
  return m[f] ?? f;
}

function flagColor(f: string): string {
  const m: Record<string, string> = {
    'first-gen':      '#1A1714',
    legacy:           '#1A1714',
    athlete:          '#5A8A6E',
    scholarship:      '#B8943E',
    international:    '#1A1714',
    transfer:         '#6B7280',
    underrepresented: '#1A1714',
  };
  return m[f] ?? '#999';
}

// ── ApplicantRow ───────────────────────────────────────────────────────────────

function ApplicantRow({ applicant, onPress, C, s }: {
  applicant: ApplicantCard;
  onPress: (a: ApplicantCard) => void;
  C: ComponentColors;
  s: ReturnType<typeof makeStyles>;
}) {
  const hue   = getApplicantHue(applicant.id);
  const color = stageColor(applicant.stage);
  return (
    <Pressable
      style={({ pressed }) => [s.applicantRow, pressed && { backgroundColor: C.surfacePressed }]}
      onPress={() => onPress(applicant)}
    >
      <View style={[s.applicantAvatar, { backgroundColor: `hsl(${hue},40%,32%)` }]}>
        <Text style={s.applicantAvatarText}>{applicant.initials}</Text>
      </View>
      <View style={{ flex: 1, gap: 3 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: C.label, flex: 1 }} numberOfLines={1}>
            {applicant.name}
          </Text>
          <View style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, backgroundColor: color + '22', borderWidth: 1, borderColor: color }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color }}>{applicant.stage}</Text>
          </View>
        </View>
        <Text style={{ fontSize: 12, color: C.secondary }} numberOfLines={1}>{applicant.intendedMajor}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 11, color: C.muted }}>GPA {applicant.gpa.toFixed(2)}</Text>
          {applicant.flags.slice(0, 2).map(f => (
            <View key={f} style={{ paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4, backgroundColor: flagColor(f) + '22' }}>
              <Text style={{ fontSize: 9, fontWeight: '700', color: flagColor(f) }}>{flagLabel(f)}</Text>
            </View>
          ))}
        </View>
      </View>
      <Text style={{ fontSize: 11, color: C.muted, marginLeft: 8 }}>{applicant.lastInteraction}</Text>
    </Pressable>
  );
}

// ── ApplicantDetailSheet ───────────────────────────────────────────────────────

function ApplicantDetailSheet({ applicant, isAdmin, onClose, onMoveStage, counselorNotes, onNotesChange, C, insets }: {
  applicant: ApplicantCard;
  isAdmin: boolean;
  onClose: () => void;
  onMoveStage: (stage: EnrollmentStage) => void;
  counselorNotes: string;
  onNotesChange: (v: string) => void;
  C: ComponentColors;
  insets: ReturnType<typeof useSafeAreaInsets>;
}) {
  const hue      = getApplicantHue(applicant.id);
  const color    = stageColor(applicant.stage);
  const log      = MOCK_INTERACTION_LOG[applicant.id] ?? [];
  const canDecide = applicant.stage === 'Applied' || applicant.stage === 'Under Review';

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 24, paddingHorizontal: 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Drag handle */}
      <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 4 }}>
        <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(45,30,18,0.20)' }} />
      </View>

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginTop: 12, marginBottom: 16 }}>
        <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: `hsl(${hue},40%,32%)`, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#fff' }}>{applicant.initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: C.label }}>{applicant.name}</Text>
          <Text style={{ fontSize: 13, color: C.secondary }}>{applicant.location}</Text>
          <View style={{ marginTop: 4, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: color + '22', borderWidth: 1, borderColor: color }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color }}>{applicant.stage}</Text>
          </View>
        </View>
        <Pressable onPress={onClose} hitSlop={12}>
          <IconSymbol name="xmark.circle.fill" size={24} color={C.muted} />
        </Pressable>
      </View>

      {/* Quick actions */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
        {(['Call', 'Email', 'Message', 'Assign'] as const).map(label => (
          <Pressable
            key={label}
            style={({ pressed }) => ({
              flex: 1, alignItems: 'center', paddingVertical: 10,
              backgroundColor: pressed ? C.surfacePressed : C.surface,
              borderRadius: 10, gap: 3, borderWidth: 1, borderColor: C.separator,
            })}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol
              name={label === 'Call' ? 'phone' : label === 'Email' ? 'envelope' : label === 'Message' ? 'message' : 'person.badge.plus'}
              size={16}
              color={C.accent}
            />
            <Text style={{ fontSize: 10, fontWeight: '600', color: C.secondary }}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Stats row */}
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
        {[
          { label: 'GPA',     value: applicant.gpa.toFixed(2) },
          { label: 'Test',    value: applicant.testScore ? applicant.testScore.toString() : 'N/A' },
          { label: 'Type',    value: appTypeLabel(applicant.applicationType) },
        ].map(stat => (
          <View key={stat.label} style={{ flex: 1, backgroundColor: C.surface, borderRadius: 10, padding: 10, alignItems: 'center' }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{stat.value}</Text>
            <Text style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Flags */}
      {applicant.flags.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {applicant.flags.map(f => (
            <View key={f} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: flagColor(f) + '22', borderWidth: 1, borderColor: flagColor(f) + '66' }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: flagColor(f) }}>{flagLabel(f)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Financial aid */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.surface, borderRadius: 12, padding: 14, marginBottom: 14 }}>
        <IconSymbol name="dollarsign.circle.fill" size={18} color={C.secondary} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary }}>FINANCIAL AID</Text>
          <Text style={{ fontSize: 14, color: C.label, fontWeight: '600', textTransform: 'capitalize' }}>
            {applicant.financialAidStatus === 'none' ? 'Not Applied' : applicant.financialAidStatus}
          </Text>
        </View>
      </View>

      {/* Move Stage (admin only) */}
      {isAdmin && (
        <View style={{ marginBottom: 14 }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Move to Stage</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {(ENROLLMENT_STAGES.map(s => s.stage) as EnrollmentStage[]).map(stage => {
              const active = applicant.stage === stage;
              const sColor = stageColor(stage);
              return (
                <Pressable
                  key={stage}
                  style={({ pressed }) => ({
                    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
                    backgroundColor: active ? sColor : (pressed ? C.surfacePressed : C.surface),
                    borderWidth: 1, borderColor: active ? sColor : C.separator,
                  })}
                  onPress={() => { Haptics.selectionAsync(); onMoveStage(stage); }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '600', color: active ? '#fff' : C.label }}>{stage}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Interaction log */}
      <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>
        Interaction Log
      </Text>
      {log.length === 0 ? (
        <Text style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>No interactions recorded.</Text>
      ) : (
        log.map((entry, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.accent, marginTop: 3 }} />
              {i < log.length - 1 && (
                <View style={{ width: 1, flex: 1, backgroundColor: C.separator, marginTop: 4 }} />
              )}
            </View>
            <View style={{ flex: 1, paddingBottom: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary }}>{entry.type.toUpperCase()}</Text>
                <Text style={{ fontSize: 11, color: C.muted }}>{formatDate(entry.date)}</Text>
              </View>
              <Text style={{ fontSize: 14, color: C.label, lineHeight: 20 }}>{entry.summary}</Text>
            </View>
          </View>
        ))
      )}

      {/* Counselor notes (admin only) */}
      {isAdmin && (
        <View style={{ marginTop: 8, marginBottom: 14 }}>
          <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Counselor Notes</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.separator, paddingHorizontal: 14, paddingVertical: 10 }}>
            <TextInput
              style={{ fontSize: 14, color: C.label, minHeight: 80, textAlignVertical: 'top' }}
              placeholder="Add private notes…"
              placeholderTextColor={C.muted}
              value={counselorNotes}
              onChangeText={onNotesChange}
              multiline
            />
          </View>
        </View>
      )}

      {/* Decision buttons (admin, Applied or Under Review) */}
      {isAdmin && canDecide && (
        <View>
          <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Decision</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {([
              { label: 'Accept',    stage: 'Admitted'     as EnrollmentStage, color: '#5A8A6E' },
              { label: 'Waitlist',  stage: 'Under Review' as EnrollmentStage, color: '#B8943E' },
              { label: 'Defer',     stage: 'Under Review' as EnrollmentStage, color: '#6B7280' },
              { label: 'Deny',      stage: 'Prospect'     as EnrollmentStage, color: '#B85C5C' },
            ] as const).map(btn => (
              <Pressable
                key={btn.label}
                style={({ pressed }) => ({
                  flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10,
                  backgroundColor: pressed ? btn.color + 'cc' : btn.color + '22',
                  borderWidth: 1.5, borderColor: btn.color,
                })}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onMoveStage(btn.stage); }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: btn.color }}>{btn.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// ── ProspectCardOverlay ────────────────────────────────────────────────────────

function ProspectCardOverlay({ onClose, C, insets }: {
  onClose: () => void;
  C: ComponentColors;
  insets: ReturnType<typeof useSafeAreaInsets>;
}) {
  const [name,    setName]    = useState('');
  const [phone,   setPhone]   = useState('');
  const [email,   setEmail]   = useState('');
  const [school,  setSchool]  = useState('');
  const [gradYear, setGradYear] = useState('');
  const [major,   setMajor]   = useState('');
  const [heard,   setHeard]   = useState('');

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top bar */}
      <View style={{
        paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 12,
        backgroundColor: C.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
        flexDirection: 'row', alignItems: 'center', gap: 12,
      }}>
        <Pressable onPress={onClose} hitSlop={12}>
          <IconSymbol name="xmark" size={20} color={C.label} />
        </Pressable>
        <Text style={{ flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: C.label }}>Prospect Card</Text>
        <Pressable
          style={{ backgroundColor: C.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}
          onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); onClose(); }}
        >
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Save</Text>
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {[
          { label: 'Full Name *',      value: name,     onChange: setName,     placeholder: 'First and last name',   keyboard: 'default' as const },
          { label: 'Phone',            value: phone,    onChange: setPhone,    placeholder: '(555) 000-0000',        keyboard: 'phone-pad' as const },
          { label: 'Email',            value: email,    onChange: setEmail,    placeholder: 'student@email.com',     keyboard: 'email-address' as const },
          { label: 'High School',      value: school,   onChange: setSchool,   placeholder: 'School name',           keyboard: 'default' as const },
          { label: 'Graduation Year',  value: gradYear, onChange: setGradYear, placeholder: '2026',                  keyboard: 'number-pad' as const },
          { label: 'Intended Major',   value: major,    onChange: setMajor,    placeholder: 'e.g. Computer Science', keyboard: 'default' as const },
          { label: 'How did they hear about Lincoln University?', value: heard, onChange: setHeard, placeholder: 'Campus visit, social media, referral…', keyboard: 'default' as const },
        ].map(f => (
          <View key={f.label} style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginBottom: 6 }}>{f.label}</Text>
            <View style={{ backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: C.separator, paddingHorizontal: 14, paddingVertical: 12 }}>
              <TextInput
                style={{ fontSize: 15, color: C.label }}
                placeholder={f.placeholder}
                placeholderTextColor={C.muted}
                value={f.value}
                onChangeText={f.onChange}
                keyboardType={f.keyboard}
                autoCapitalize={f.keyboard === 'email-address' ? 'none' : 'words'}
              />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function AdmissionsScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();

  const topBarH   = insets.top + TOP_BAR_H;
  const pillsAnim  = useRef(new Animated.Value(0)).current;
  const detailAnim = useRef(new Animated.Value(0)).current;
  const scrollRef  = useRef<ScrollView>(null);

  const [role, cycleRole] = useDemoRole('education:admissions');
  const [activeTab,         setActiveTab]         = useState<AdmTab>('Pipeline');
  const [dropdownOpen,      setDropdownOpen]      = useState(false);
  const [pillsVisible,      setPillsVisible]      = useState(false);
  const [selectedPill,      setSelectedPill]      = useState('All');
  const [selectedApplicant, setSelected]          = useState<ApplicantCard | null>(null);
  const [detailOpen,        setDetailOpen]        = useState(false);
  const [showProspectCard,  setShowProspectCard]  = useState(false);
  const [expandedCampaignId, setExpandedCampaignId] = useState<string | null>(null);
  const [rsvpIds,           setRsvpIds]           = useState<Set<string>>(new Set());
  const [counselorNotes,    setCounselorNotes]    = useState('');
  const [applicantStages,   setApplicantStages]   = useState<Record<string, EnrollmentStage>>(
    () => Object.fromEntries(APPLICANTS.map(a => [a.id, a.stage]))
  );

  // Student application state
  const [formSubmitted,   setFormSubmitted]   = useState(false);
  const [formExpanded,    setFormExpanded]    = useState<string | null>('personal');
  const [formData,        setFormData]        = useState({
    name: '', dob: '', phone: '', email: '',
    highSchool: '', gpa: '', testScore: '', major: '', startTerm: '',
    essay: '', fafsa: false as boolean, scholarshipInterest: false as boolean,
  });
  const [uploadedDocs, setUploadedDocs] = useState<Set<string>>(new Set());
  const [rec1Email,    setRec1Email]    = useState('');
  const [rec2Email,    setRec2Email]    = useState('');

  // Derived
  const pills = useMemo(() => pillsForTab(activeTab, role), [activeTab, role]);

  const funnelCounts = useMemo<Record<EnrollmentStage, number>>(() => {
    const counts = Object.fromEntries(
      ENROLLMENT_STAGES.map(s => [s.stage, 0])
    ) as Record<EnrollmentStage, number>;
    APPLICANTS.forEach(a => { counts[applicantStages[a.id] ?? a.stage]++; });
    return counts;
  }, [applicantStages]);

  const filteredApplicants = useMemo(() => {
    const overrides = applicantStages;
    const withStage = APPLICANTS.map(a => ({ ...a, stage: overrides[a.id] ?? a.stage }));
    if (selectedPill === 'All') return withStage;
    return withStage.filter(a => a.stage === selectedPill);
  }, [selectedPill, applicantStages]);

  // Footer scroll
  const lastScrollY = useRef(0);
  const onScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y - lastScrollY.current > 10) hideFooter();
    else if (lastScrollY.current - y > 10) showFooter();
    lastScrollY.current = y;
  }, []);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  // Restore footer when screen unmounts (containedTransparentModal doesn't always
  // re-focus the underlying screen, so we reset here as a safety net).
  useEffect(() => () => { resetFooter(); }, []);

  // Pills toggle
  const togglePills = useCallback(() => {
    if (pills.length === 0) return;
    Haptics.selectionAsync();
    const toValue = pillsVisible ? 0 : 1;
    setPillsVisible(!pillsVisible);
    Animated.timing(pillsAnim, { toValue, duration: 200, useNativeDriver: false }).start();
  }, [pillsVisible, pills, pillsAnim]);

  // Tab change
  const changeTab = useCallback((tab: AdmTab) => {
    Haptics.selectionAsync();
    const newPills = pillsForTab(tab, role);
    setActiveTab(tab);
    setDropdownOpen(false);
    setSelectedPill(newPills[0] ?? 'All');
    setPillsVisible(false);
    pillsAnim.setValue(0);
    setExpandedCampaignId(null);
  }, [role, pillsAnim]);

  // Role is now driven by useDemoRole('education:admissions')

  // Applicant detail
  const openApplicant = useCallback((a: ApplicantCard) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(a);
    setDetailOpen(true);
    Animated.timing(detailAnim, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  }, [detailAnim]);

  const closeDetail = useCallback(() => {
    Animated.timing(detailAnim, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => {
      setDetailOpen(false);
      setSelected(null);
    });
  }, [detailAnim]);

  const moveStage = useCallback((applicantId: string, stage: EnrollmentStage) => {
    Haptics.selectionAsync();
    setApplicantStages(prev => ({ ...prev, [applicantId]: stage }));
    setSelected(prev => prev ? { ...prev, stage } : null);
  }, []);

  const contentPaddingTop = TOP_BAR_H + (pillsVisible ? PILLS_H : 0) + insets.top + 8;

  // ── Render functions ───────────────────────────────────────────────────────

  function renderPipelineAdmin() {
    return (
      <>
        {/* Funnel row — horizontal scroll for 7 stages */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 12 }}
          contentContainerStyle={{ gap: 8 }}
        >
          {ENROLLMENT_STAGES.map(ps => (
            <Pressable
              key={ps.stage}
              style={[s.funnelCell, { borderColor: ps.color + '44', backgroundColor: ps.color + '11' }]}
              onPress={() => {
                Haptics.selectionAsync();
                if (!pillsVisible) {
                  setPillsVisible(true);
                  Animated.timing(pillsAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
                }
                setSelectedPill(ps.stage);
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: '800', color: ps.color }}>{funnelCounts[ps.stage]}</Text>
              <Text style={{ fontSize: 9, fontWeight: '600', color: ps.color, textAlign: 'center' }} numberOfLines={2}>{ps.stage}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Summary stat row */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {[
            `${ENROLLMENT_SUMMARY.totalApplicants} Applicants`,
            `63% Acceptance`,
            `${ENROLLMENT_SUMMARY.yieldRate}% Yield ↑`,
          ].map(chip => (
            <View key={chip} style={{ flex: 1, backgroundColor: C.surface, borderRadius: 10, padding: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: C.label, textAlign: 'center' }} numberOfLines={1}>{chip}</Text>
            </View>
          ))}
        </View>

        {filteredApplicants.length === 0 && (
          <Text style={{ fontSize: 14, color: C.muted, textAlign: 'center', marginTop: 16 }}>No applicants at this stage.</Text>
        )}
        {filteredApplicants.map(a => (
          <ApplicantRow key={a.id} applicant={a} onPress={openApplicant} C={C} s={s} />
        ))}
        <View style={{ height: 80 }} />
      </>
    );
  }

  function renderPipelineLocked(lockedRole: 'Student' | 'Parent') {
    return (
      <>
        <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 20, marginTop: 8, alignItems: 'center', gap: 10 }}>
          <IconSymbol name="lock.fill" size={28} color={C.muted} />
          <Text style={{ fontSize: 15, fontWeight: '600', color: C.label }}>Pipeline is for admissions staff.</Text>
          <Text style={{ fontSize: 13, color: C.secondary, textAlign: 'center', lineHeight: 18 }}>
            {lockedRole === 'Student'
              ? 'Track your own application status under the Applications tab.'
              : "Monitor your student's application status under the Applications tab."}
          </Text>
          <Pressable
            style={{ backgroundColor: C.accent, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10, marginTop: 4 }}
            onPress={() => changeTab('Applications')}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>View My Application →</Text>
          </Pressable>
        </View>
        <View style={{ height: 40 }} />
      </>
    );
  }

  // ── Prospective (non-Dean) dashboard ──────────────────────────────────────

  function renderProspectiveDashboard() {
    const DOCS = [
      { label: 'Official Transcript',      done: true  },
      { label: 'SAT / ACT Scores',         done: true  },
      { label: 'Personal Essay',           done: false },
      { label: 'Recommendation Letter 1',  done: true  },
      { label: 'Recommendation Letter 2',  done: false },
      { label: 'FAFSA',                    done: true  },
    ];
    const NEXT_STEPS = [
      { icon: 'clock.fill',              color: '#1A1714', text: 'Decision expected by May 1, 2026' },
      { icon: 'envelope.fill',           color: '#1A1714', text: 'Check your email for updates' },
      { icon: 'dollarsign.circle.fill',  color: '#5A8A6E', text: 'Your financial aid estimate is ready' },
    ];
    const AID = [
      { label: 'Merit Scholarship',  amount: '$12,000' },
      { label: 'Federal Grant',      amount: '$6,800'  },
      { label: 'Work-Study',         amount: '$2,500'  },
      { label: 'Subsidized Loan',    amount: '$5,500'  },
    ];
    return (
      <>
        {/* Status card */}
        <View style={{ backgroundColor: '#1A171418', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#1A171444' }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#1A1714', textTransform: 'uppercase', letterSpacing: 0.6 }}>Application Status</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 }}>
            <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: '#1A1714' }} />
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#1A1714' }}>Under Review</Text>
          </View>
          <Text style={{ fontSize: 13, color: C.secondary, marginTop: 6 }}>Submitted Feb 12, 2026  ·  Application ID: LU-2026-00847</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: 10, padding: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: C.label }}>4.0</Text>
              <Text style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>GPA</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: 10, padding: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: C.label }}>1390</Text>
              <Text style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>SAT</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: 10, padding: 10, alignItems: 'center' }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: C.label }}>Comp Sci</Text>
              <Text style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>Major</Text>
            </View>
          </View>
        </View>

        {/* Document checklist */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Required Documents</Text>
        <View style={{ backgroundColor: C.surface, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
          {DOCS.map((doc, idx) => (
            <View key={doc.label} style={{
              flexDirection: 'row', alignItems: 'center', gap: 12,
              paddingHorizontal: 14, paddingVertical: 12,
              borderBottomWidth: idx < DOCS.length - 1 ? StyleSheet.hairlineWidth : 0,
              borderBottomColor: C.separator,
            }}>
              <IconSymbol
                name={doc.done ? 'checkmark.circle.fill' : 'circle'}
                size={20}
                color={doc.done ? '#5A8A6E' : C.muted}
              />
              <Text style={{ flex: 1, fontSize: 14, color: C.label }}>{doc.label}</Text>
              <Text style={{ fontSize: 12, color: doc.done ? '#5A8A6E' : '#B85C5C', fontWeight: '600' }}>
                {doc.done ? 'Received' : 'Pending'}
              </Text>
            </View>
          ))}
        </View>

        {/* Financial aid estimate */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Estimated Aid Package</Text>
        <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 16, gap: 10 }}>
          {AID.map((item, idx) => (
            <View key={item.label} style={{
              flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
              paddingBottom: idx < AID.length - 1 ? 10 : 0,
              borderBottomWidth: idx < AID.length - 1 ? StyleSheet.hairlineWidth : 0,
              borderBottomColor: C.separator,
            }}>
              <Text style={{ fontSize: 14, color: C.label }}>{item.label}</Text>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#1A1714' }}>{item.amount}</Text>
            </View>
          ))}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 4 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>Total Estimated Aid</Text>
            <Text style={{ fontSize: 16, fontWeight: '800', color: '#5A8A6E' }}>$26,800</Text>
          </View>
        </View>

        {/* Next steps */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>Next Steps</Text>
        <View style={{ backgroundColor: C.surface, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
          {NEXT_STEPS.map((step, idx) => (
            <View key={idx} style={{
              flexDirection: 'row', alignItems: 'center', gap: 12,
              paddingHorizontal: 14, paddingVertical: 13,
              borderBottomWidth: idx < NEXT_STEPS.length - 1 ? StyleSheet.hairlineWidth : 0,
              borderBottomColor: C.separator,
            }}>
              <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: step.color + '18', alignItems: 'center', justifyContent: 'center' }}>
                <IconSymbol name={step.icon as any} size={15} color={step.color} />
              </View>
              <Text style={{ flex: 1, fontSize: 13, color: C.label, lineHeight: 18 }}>{step.text}</Text>
            </View>
          ))}
        </View>

        {/* School info */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>About Lincoln University</Text>
        <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 16, gap: 12 }}>
          {[
            { label: 'Enrollment',       value: '4,200 students'  },
            { label: 'Acceptance Rate',  value: '63%'             },
            { label: 'Avg Financial Aid', value: '$24,000 / yr'   },
            { label: 'Student/Faculty',  value: '14:1'            },
          ].map(item => (
            <View key={item.label} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 14, color: C.secondary }}>{item.label}</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Contact Admissions CTA */}
        <Pressable
          style={({ pressed }) => ({
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            backgroundColor: pressed ? '#1A1714cc' : '#1A1714',
            borderRadius: 12, paddingVertical: 14, marginBottom: 12,
          })}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="phone.fill" size={16} color="#fff" />
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Contact Admissions Office</Text>
        </Pressable>

        <View style={{ height: 40 }} />
      </>
    );
  }

  function renderApplicationsAdmin() {
    const filterMap: Record<string, any> = {
      'All': 'all', 'Unreviewed': 'unreviewed',
      'In Review': 'inReview', 'Decision Ready': 'decisionReady', 'Decided': 'decided',
    };
    const apps = getApplications(filterMap[selectedPill] ?? 'all');

    return (
      <>
        {apps.map(app => {
          const completenessColor = app.completeness >= 90 ? '#5A8A6E' : app.completeness >= 70 ? '#B8943E' : '#B85C5C';
          const tColor = appTypeColor(app.applicationType);
          const applicant = APPLICANTS.find(a => a.name === app.studentName);

          return (
            <Pressable
              key={app.id}
              style={({ pressed }) => [{
                backgroundColor: pressed ? C.surfacePressed : C.surface,
                borderRadius: 14, padding: 14, marginBottom: 10, gap: 8,
              }]}
              onPress={() => {
                if (applicant) openApplicant({ ...applicant, stage: applicantStages[applicant.id] ?? applicant.stage });
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: `hsl(${getApplicantHue(app.id)},40%,32%)`, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff' }}>{app.studentInitials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, flex: 1 }} numberOfLines={1}>{app.studentName}</Text>
                    <View style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, backgroundColor: tColor + '22' }}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: tColor }}>{appTypeLabel(app.applicationType)}</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{app.program}</Text>
                </View>
              </View>

              {/* Completeness bar */}
              <View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                  <Text style={{ fontSize: 12, color: C.secondary }}>
                    Completeness{app.missingItems.length > 0 ? ` · ${app.missingItems.length} missing` : ''}
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: completenessColor }}>{app.completeness}%</Text>
                </View>
                <View style={{ height: 5, borderRadius: 3, backgroundColor: C.separator }}>
                  <View style={{ height: 5, borderRadius: 3, backgroundColor: completenessColor, width: `${app.completeness}%` as any }} />
                </View>
              </View>

              {/* Review / decision row */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {app.reviewerName
                  ? <Text style={{ fontSize: 11, color: C.muted, flex: 1 }}>Reviewed by {app.reviewerName}</Text>
                  : <Text style={{ fontSize: 11, color: '#1A1714', flex: 1 }}>Unassigned</Text>
                }
                {app.decision && (
                  <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: decisionColor(app.decision) + '22' }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: decisionColor(app.decision) }}>
                      {app.decision.charAt(0).toUpperCase() + app.decision.slice(1)}
                    </Text>
                  </View>
                )}
                {app.financialAidAmount != null && (
                  <Text style={{ fontSize: 11, color: '#5A8A6E', fontWeight: '700' }}>{formatAidAmount(app.financialAidAmount)}</Text>
                )}
              </View>
            </Pressable>
          );
        })}
        <View style={{ height: 80 }} />
      </>
    );
  }

  function renderApplicationsStudent() {
    const CHECKLIST = ['Personal Info', 'Transcript', 'Test Scores', 'Essay', 'Recommendation 1', 'Recommendation 2', 'FAFSA'];
    const APP_STEPS = ['Applied', 'Documents', 'Review', 'Decision', 'Enrolled'];
    const currentStep = formSubmitted ? 2 : 0;

    const progressTracker = (
      <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 16 }}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Application Status</Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          {APP_STEPS.map((step, idx) => {
            const active    = idx === currentStep;
            const completed = idx < currentStep;
            const dotColor  = active ? C.accent : completed ? '#5A8A6E' : C.separator;
            return (
              <React.Fragment key={step}>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: dotColor, marginBottom: 4 }} />
                  <Text style={{ fontSize: 9, color: active ? C.accent : completed ? '#5A8A6E' : C.muted, textAlign: 'center' }} numberOfLines={2}>{step}</Text>
                </View>
                {idx < APP_STEPS.length - 1 && (
                  <View style={{ flex: 1, height: 1, backgroundColor: idx < currentStep ? '#5A8A6E' : C.separator, marginTop: 5.5 }} />
                )}
              </React.Fragment>
            );
          })}
        </View>
      </View>
    );

    if (formSubmitted) {
      return (
        <>
          {progressTracker}
          <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Submitted Items</Text>
            {CHECKLIST.map((item, idx) => {
              const submitted = idx < 4;
              return (
                <View key={item} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: idx < CHECKLIST.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator }}>
                  <IconSymbol name={submitted ? 'checkmark.circle.fill' : 'xmark.circle.fill'} size={18} color={submitted ? '#5A8A6E' : '#B85C5C'} />
                  <Text style={{ fontSize: 14, color: C.label }}>{item}</Text>
                </View>
              );
            })}
          </View>
          <View style={{ height: 80 }} />
        </>
      );
    }

    // Form
    const sections = [
      { id: 'personal', label: 'Personal Information',  icon: 'person.fill'            },
      { id: 'academic', label: 'Academic Background',   icon: 'graduationcap.fill'     },
      { id: 'program',  label: 'Program Selection',     icon: 'building.columns.fill'  },
      { id: 'essay',    label: 'Personal Essay',        icon: 'doc.text.fill'          },
      { id: 'recs',     label: 'Recommendations',       icon: 'person.2.fill'          },
      { id: 'aid',      label: 'Financial Aid',         icon: 'dollarsign.circle.fill' },
      { id: 'docs',     label: 'Documents',             icon: 'paperclip'              },
    ];

    return (
      <>
        <Text style={{ fontSize: 16, fontWeight: '700', color: C.label, marginBottom: 16 }}>Application Form</Text>

        {sections.map(section => {
          const expanded = formExpanded === section.id;
          return (
            <View key={section.id} style={{ backgroundColor: C.surface, borderRadius: 14, marginBottom: 8, overflow: 'hidden' }}>
              <Pressable
                style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, backgroundColor: pressed ? C.surfacePressed : 'transparent' }]}
                onPress={() => { setFormExpanded(expanded ? null : section.id); Haptics.selectionAsync(); }}
              >
                <IconSymbol name={section.icon as any} size={16} color={C.secondary} />
                <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: C.label }}>{section.label}</Text>
                <IconSymbol name={expanded ? 'chevron.up' : 'chevron.down'} size={14} color={C.muted} />
              </Pressable>

              {expanded && (
                <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator, padding: 14, gap: 12 }}>
                  {section.id === 'personal' && (
                    <>
                      {[
                        { key: 'name',  label: 'Full Name *',   placeholder: 'First and last name' },
                        { key: 'dob',   label: 'Date of Birth', placeholder: 'MM/DD/YYYY'          },
                        { key: 'phone', label: 'Phone',         placeholder: '(555) 000-0000'       },
                        { key: 'email', label: 'Email *',       placeholder: 'your@email.com'       },
                      ].map(f => (
                        <View key={f.key}>
                          <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary, marginBottom: 4 }}>{f.label}</Text>
                          <View style={{ backgroundColor: C.bg, borderRadius: 10, borderWidth: 1, borderColor: C.inputBorder, paddingHorizontal: 12, paddingVertical: 10 }}>
                            <TextInput
                              style={{ fontSize: 14, color: C.label }}
                              placeholder={f.placeholder}
                              placeholderTextColor={C.muted}
                              value={(formData as any)[f.key]}
                              onChangeText={v => setFormData(prev => ({ ...prev, [f.key]: v }))}
                            />
                          </View>
                        </View>
                      ))}
                    </>
                  )}
                  {section.id === 'academic' && (
                    <>
                      {[
                        { key: 'highSchool', label: 'High School',          placeholder: 'School name' },
                        { key: 'gpa',        label: 'GPA',                  placeholder: '0.00'        },
                        { key: 'testScore',  label: 'SAT / ACT Score',      placeholder: 'e.g. 1350'   },
                      ].map(f => (
                        <View key={f.key}>
                          <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary, marginBottom: 4 }}>{f.label}</Text>
                          <View style={{ backgroundColor: C.bg, borderRadius: 10, borderWidth: 1, borderColor: C.inputBorder, paddingHorizontal: 12, paddingVertical: 10 }}>
                            <TextInput
                              style={{ fontSize: 14, color: C.label }}
                              placeholder={f.placeholder}
                              placeholderTextColor={C.muted}
                              value={(formData as any)[f.key]}
                              onChangeText={v => setFormData(prev => ({ ...prev, [f.key]: v }))}
                            />
                          </View>
                        </View>
                      ))}
                    </>
                  )}
                  {section.id === 'program' && (
                    <>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary, marginBottom: 4 }}>Intended Major</Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                        {['Computer Science', 'Business', 'Nursing', 'Engineering', 'Education', 'Psychology', 'Biology', 'Other'].map(m => {
                          const sel = formData.major === m;
                          return (
                            <Pressable
                              key={m}
                              style={({ pressed }) => ({
                                paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5,
                                backgroundColor: sel ? C.label : pressed ? C.surfacePressed : C.bg,
                                borderColor: sel ? C.label : C.separator,
                              })}
                              onPress={() => { Haptics.selectionAsync(); setFormData(prev => ({ ...prev, major: m })); }}
                            >
                              <Text style={{ fontSize: 12, fontWeight: '600', color: sel ? C.bg : C.label }}>{m}</Text>
                            </Pressable>
                          );
                        })}
                      </View>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary, marginBottom: 4, marginTop: 8 }}>Start Term</Text>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        {['Fall 2026', 'Spring 2027'].map(t => {
                          const sel = formData.startTerm === t;
                          return (
                            <Pressable
                              key={t}
                              style={({ pressed }) => ({
                                flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10, borderWidth: 1.5,
                                backgroundColor: sel ? C.label : pressed ? C.surfacePressed : C.bg,
                                borderColor: sel ? C.label : C.separator,
                              })}
                              onPress={() => { Haptics.selectionAsync(); setFormData(prev => ({ ...prev, startTerm: t })); }}
                            >
                              <Text style={{ fontSize: 13, fontWeight: '600', color: sel ? C.bg : C.label }}>{t}</Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </>
                  )}
                  {section.id === 'essay' && (
                    <>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary, marginBottom: 4 }}>Personal Essay (250–650 words)</Text>
                      <View style={{ backgroundColor: C.bg, borderRadius: 10, borderWidth: 1, borderColor: C.inputBorder, paddingHorizontal: 12, paddingVertical: 10 }}>
                        <TextInput
                          style={{ fontSize: 14, color: C.label, minHeight: 120, textAlignVertical: 'top' }}
                          placeholder="Describe a challenge you've overcome or a meaningful experience…"
                          placeholderTextColor={C.muted}
                          value={formData.essay}
                          onChangeText={v => setFormData(prev => ({ ...prev, essay: v }))}
                          multiline
                        />
                      </View>
                      <Text style={{ fontSize: 11, color: C.muted }}>
                        {formData.essay.trim().split(/\s+/).filter(Boolean).length} words
                      </Text>
                    </>
                  )}
                  {section.id === 'recs' && (
                    <>
                      {[
                        { label: 'Recommender 1 Email', value: rec1Email, onChange: setRec1Email },
                        { label: 'Recommender 2 Email', value: rec2Email, onChange: setRec2Email },
                      ].map(r => (
                        <View key={r.label}>
                          <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary, marginBottom: 4 }}>{r.label}</Text>
                          <View style={{ backgroundColor: C.bg, borderRadius: 10, borderWidth: 1, borderColor: C.inputBorder, paddingHorizontal: 12, paddingVertical: 10 }}>
                            <TextInput
                              style={{ fontSize: 14, color: C.label }}
                              placeholder="teacher@school.edu"
                              placeholderTextColor={C.muted}
                              value={r.value}
                              onChangeText={r.onChange}
                              keyboardType="email-address"
                              autoCapitalize="none"
                            />
                          </View>
                        </View>
                      ))}
                    </>
                  )}
                  {section.id === 'aid' && (
                    <>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View>
                          <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>FAFSA Completed</Text>
                          <Text style={{ fontSize: 12, color: C.secondary }}>Required for most financial aid</Text>
                        </View>
                        <Switch
                          value={formData.fafsa}
                          onValueChange={v => setFormData(prev => ({ ...prev, fafsa: v }))}
                          trackColor={{ false: C.separator, true: C.accent }}
                          thumbColor={formData.fafsa ? '#fff' : '#fff'}
                        />
                      </View>
                      <Pressable
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 }}
                        onPress={() => setFormData(prev => ({ ...prev, scholarshipInterest: !prev.scholarshipInterest }))}
                      >
                        <View style={{ width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: formData.scholarshipInterest ? C.accent : C.separator, backgroundColor: formData.scholarshipInterest ? C.accent : 'transparent', alignItems: 'center', justifyContent: 'center' }}>
                          {formData.scholarshipInterest && <IconSymbol name="checkmark" size={12} color="#fff" />}
                        </View>
                        <Text style={{ fontSize: 14, color: C.label }}>I'm interested in scholarship opportunities</Text>
                      </Pressable>
                    </>
                  )}
                  {section.id === 'docs' && (
                    <>
                      {['Official Transcript', 'SAT/ACT Score Report', 'Photo ID'].map(doc => {
                        const uploaded = uploadedDocs.has(doc);
                        return (
                          <Pressable
                            key={doc}
                            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}
                            onPress={() => {
                              if (!uploaded) {
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                setUploadedDocs(prev => new Set([...prev, doc]));
                              }
                            }}
                          >
                            <IconSymbol name={uploaded ? 'checkmark.circle.fill' : 'arrow.up.circle'} size={20} color={uploaded ? '#5A8A6E' : C.accent} />
                            <Text style={{ flex: 1, fontSize: 14, color: C.label }}>{doc}</Text>
                            <Text style={{ fontSize: 12, fontWeight: '600', color: uploaded ? '#5A8A6E' : C.accent }}>
                              {uploaded ? 'Uploaded ✓' : 'Tap to Upload'}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </>
                  )}
                </View>
              )}
            </View>
          );
        })}

        {/* Form action buttons */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
          <Pressable
            style={({ pressed }) => ({
              flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center',
              borderWidth: 1.5, borderColor: C.label,
              backgroundColor: pressed ? C.surfacePressed : 'transparent',
            })}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>Save Draft</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => ({
              flex: 2, paddingVertical: 14, borderRadius: 12, alignItems: 'center',
              backgroundColor: pressed ? C.accent + 'cc' : C.accent,
            })}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              setFormSubmitted(true);
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Submit Application</Text>
          </Pressable>
        </View>
        <View style={{ height: 80 }} />
      </>
    );
  }

  function renderApplicationsParent() {
    const CHECKLIST = ['Personal Info', 'Transcript', 'Test Scores', 'Essay', 'Recommendation 1', 'Recommendation 2', 'FAFSA'];
    const APP_STEPS = ['Applied', 'Documents', 'Review', 'Decision', 'Enrolled'];
    const currentStep = 2;

    return (
      <>
        {/* Progress tracker */}
        <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Application Status</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            {APP_STEPS.map((step, idx) => {
              const active    = idx === currentStep;
              const completed = idx < currentStep;
              const dotColor  = active ? C.accent : completed ? '#5A8A6E' : C.separator;
              return (
                <React.Fragment key={step}>
                  <View style={{ alignItems: 'center', flex: 1 }}>
                    <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: dotColor, marginBottom: 4 }} />
                    <Text style={{ fontSize: 9, color: active ? C.accent : completed ? '#5A8A6E' : C.muted, textAlign: 'center' }} numberOfLines={2}>{step}</Text>
                  </View>
                  {idx < APP_STEPS.length - 1 && (
                    <View style={{ flex: 1, height: 1, backgroundColor: idx < currentStep ? '#5A8A6E' : C.separator, marginTop: 5.5 }} />
                  )}
                </React.Fragment>
              );
            })}
          </View>
        </View>

        {/* Checklist */}
        <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>Submitted Items</Text>
          {CHECKLIST.map((item, idx) => {
            const submitted = idx < 4;
            return (
              <View key={item} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: idx < CHECKLIST.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator }}>
                <IconSymbol name={submitted ? 'checkmark.circle.fill' : 'xmark.circle.fill'} size={18} color={submitted ? '#5A8A6E' : '#B85C5C'} />
                <Text style={{ fontSize: 14, color: C.label }}>{item}</Text>
              </View>
            );
          })}
        </View>

        {/* Contact Admissions button */}
        <Pressable
          style={({ pressed }) => ({
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            backgroundColor: pressed ? C.accent + 'cc' : C.accent,
            borderRadius: 12, paddingVertical: 14,
          })}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="phone.fill" size={16} color="#fff" />
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Contact Admissions Office</Text>
        </Pressable>
        <View style={{ height: 40 }} />
      </>
    );
  }

  function renderCampaignsAdmin() {
    let visible: AdmCampaign[];
    if (selectedPill === 'All')            visible = CAMPAIGNS;
    else if (selectedPill === 'Active')    visible = CAMPAIGNS.filter(c => c.status === 'active');
    else if (selectedPill === 'Upcoming')  visible = CAMPAIGNS.filter(c => c.status === 'upcoming');
    else if (selectedPill === 'Completed') visible = CAMPAIGNS.filter(c => c.status === 'completed');
    else if (selectedPill === 'Planning')  visible = CAMPAIGNS.filter(c => c.status === 'planning');
    else if (selectedPill === 'Campus Visits') visible = CAMPAIGNS.filter(c => c.type === 'campus-visit');
    else if (selectedPill === 'Virtual')   visible = CAMPAIGNS.filter(c => c.type === 'virtual');
    else if (selectedPill === 'Digital')   visible = CAMPAIGNS.filter(c => c.type === 'digital');
    else if (selectedPill === 'Social')    visible = CAMPAIGNS.filter(c => c.type === 'social-media');
    else if (selectedPill === 'Transfer')  visible = CAMPAIGNS.filter(c => c.type === 'transfer-fair');
    else if (selectedPill === 'Scholarship') visible = CAMPAIGNS.filter(c => c.type === 'scholarship');
    else if (selectedPill === 'Alumni')    visible = CAMPAIGNS.filter(c => c.type === 'alumni-referral');
    else visible = CAMPAIGNS;

    const stats = getTotalCampaignStats();
    const activeCount = CAMPAIGNS.filter(c => c.status === 'active').length;
    const top = topCampaign();

    const statCards = [
      { label: 'Active', value: String(activeCount), icon: 'megaphone.fill', color: '#5A8A6E' },
      { label: 'Prospects Reached', value: stats.totalReach.toLocaleString(), icon: 'person.3.fill', color: '#1A1714' },
      { label: 'Applications', value: String(stats.totalApplications), icon: 'doc.fill', color: '#B8943E' },
      { label: 'Conversion', value: `${stats.conversionRate}%`, icon: 'chart.line.uptrend.xyaxis', color: C.accent },
      { label: 'Campus RSVPs', value: String(stats.totalRsvps), icon: 'person.fill.checkmark', color: '#1A1714' },
    ];

    return (
      <>
        {/* Stats summary — horizontal scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 16 }}
          contentContainerStyle={{ gap: 10, paddingRight: 16 }}
        >
          {statCards.map(card => (
            <View key={card.label} style={{ backgroundColor: C.surface, borderRadius: 12, padding: 12, minWidth: 110, gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: card.color + '20', alignItems: 'center', justifyContent: 'center' }}>
                  <IconSymbol name={card.icon as any} size={14} color={card.color} />
                </View>
              </View>
              <Text style={{ fontSize: 22, fontWeight: '800', color: card.color }}>{card.value}</Text>
              <Text style={{ fontSize: 11, color: C.secondary }}>{card.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Campaign cards */}
        {visible.map(campaign => {
          const isExpanded = expandedCampaignId === campaign.id;
          const sColor = campaignStatusColor(campaign.status);
          const tColor = campaignTypeColor(campaign.type);
          const tIcon  = campaignTypeIcon(campaign.type);
          const days   = daysUntil(campaign.endDate);
          const convRate = campaign.reach > 0
            ? Math.round((campaign.applicationsGenerated / campaign.reach) * 1000) / 10
            : 0;

          return (
            <View key={campaign.id} style={[s.campaignCard, { backgroundColor: C.surface }]}>
              <Pressable
                style={({ pressed }) => [s.campaignHeader, pressed && { backgroundColor: C.surfacePressed }]}
                onPress={() => { Haptics.selectionAsync(); setExpandedCampaignId(isExpanded ? null : campaign.id); }}
              >
                {/* Type icon dot */}
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: tColor + '18', alignItems: 'center', justifyContent: 'center' }}>
                  <IconSymbol name={tIcon as any} size={16} color={tColor} />
                </View>

                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, flex: 1 }} numberOfLines={1}>{campaign.name}</Text>
                    <View style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, backgroundColor: sColor + '22' }}>
                      <Text style={{ fontSize: 9, fontWeight: '700', color: sColor }}>{campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}</Text>
                    </View>
                  </View>
                  {/* Inline mini-stats */}
                  <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                    <Text style={{ fontSize: 11, color: C.muted }}>
                      {formatDate(campaign.startDate)}{campaign.startDate !== campaign.endDate ? ` – ${formatDate(campaign.endDate)}` : ''}
                    </Text>
                    {campaign.reach > 0 && (
                      <>
                        <Text style={{ fontSize: 10, color: C.muted }}>·</Text>
                        <Text style={{ fontSize: 11, color: C.secondary }}>
                          <Text style={{ fontWeight: '600', color: C.label }}>{campaign.reach}</Text> reached
                        </Text>
                        <Text style={{ fontSize: 10, color: C.muted }}>·</Text>
                        <Text style={{ fontSize: 11, color: C.secondary }}>
                          <Text style={{ fontWeight: '600', color: C.label }}>{campaign.applicationsGenerated}</Text> apps
                        </Text>
                      </>
                    )}
                    {campaign.status === 'active' && days > 0 && (
                      <>
                        <Text style={{ fontSize: 10, color: C.muted }}>·</Text>
                        <Text style={{ fontSize: 11, color: C.accent, fontWeight: '600' }}>{days}d left</Text>
                      </>
                    )}
                  </View>
                </View>
                <IconSymbol name={isExpanded ? 'chevron.up' : 'chevron.down'} size={14} color={C.muted} />
              </Pressable>

              {isExpanded && (
                <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator, padding: 16, gap: 12 }}>
                  <Text style={{ fontSize: 13, color: C.secondary, lineHeight: 18 }}>{campaign.description}</Text>

                  {/* Full funnel */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    {[
                      { label: 'Reached',   value: campaign.reach,                  color: '#1A1714' },
                      { label: 'Inquiries', value: campaign.inquiriesGenerated,      color: '#1A1714' },
                      { label: 'Applied',   value: campaign.applicationsGenerated,   color: '#B8943E' },
                    ].map((step, idx) => (
                      <React.Fragment key={step.label}>
                        <View style={{ flex: 1, alignItems: 'center' }}>
                          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: step.color, marginBottom: 2 }} />
                          <Text style={{ fontSize: 15, fontWeight: '800', color: step.color }}>{step.value}</Text>
                          <Text style={{ fontSize: 9, color: C.muted }}>{step.label}</Text>
                        </View>
                        {idx < 2 && <Text style={{ color: C.muted, paddingBottom: 14 }}>›</Text>}
                      </React.Fragment>
                    ))}
                    {campaign.reach > 0 && (
                      <>
                        <Text style={{ color: C.muted, paddingBottom: 14 }}>›</Text>
                        <View style={{ flex: 1, alignItems: 'center' }}>
                          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.accent, marginBottom: 2 }} />
                          <Text style={{ fontSize: 15, fontWeight: '800', color: C.accent }}>{convRate}%</Text>
                          <Text style={{ fontSize: 9, color: C.muted }}>Conv. Rate</Text>
                        </View>
                      </>
                    )}
                  </View>

                  <Text style={{ fontSize: 12, color: C.muted }}>Target: {campaign.targetAudience}</Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <IconSymbol name="person.2.fill" size={13} color={C.secondary} />
                    <Text style={{ fontSize: 13, color: C.secondary }}>
                      Staff: <Text style={{ fontWeight: '600', color: C.label }}>{campaign.assignedStaff.join(', ')}</Text>
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <IconSymbol name="dollarsign.circle.fill" size={13} color={C.secondary} />
                    <Text style={{ fontSize: 13, color: C.secondary }}>
                      Budget: <Text style={{ fontWeight: '600', color: C.label }}>${campaign.budget.toLocaleString()}</Text>
                    </Text>
                    {campaign.reach > 0 && campaign.applicationsGenerated > 0 && (
                      <Text style={{ fontSize: 12, color: C.muted }}>
                        (${Math.round(campaign.budget / campaign.applicationsGenerated)}/app)
                      </Text>
                    )}
                  </View>

                  {campaign.rsvpCount != null && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <IconSymbol name="person.fill.checkmark" size={13} color={C.secondary} />
                      <Text style={{ fontSize: 13, color: C.secondary }}>
                        RSVPs: <Text style={{ fontWeight: '600', color: C.label }}>{campaign.rsvpCount}</Text>
                      </Text>
                    </View>
                  )}

                  {/* Quick actions */}
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                    {[
                      { label: 'Edit', icon: 'pencil' },
                      { label: 'Share', icon: 'square.and.arrow.up' },
                      { label: 'Duplicate', icon: 'plus.square.on.square' },
                    ].map(action => (
                      <Pressable
                        key={action.label}
                        style={({ pressed }) => ({
                          flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
                          backgroundColor: pressed ? C.surfacePressed : C.bg,
                          borderRadius: 8, paddingVertical: 8,
                          borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator,
                        })}
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                      >
                        <IconSymbol name={action.icon as any} size={13} color={C.secondary} />
                        <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary }}>{action.label}</Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}
            </View>
          );
        })}

        {/* Recruitment Impact */}
        <Text style={{ fontSize: 16, fontWeight: '700', color: C.label, marginTop: 8, marginBottom: 12 }}>Recruitment Impact</Text>

        {/* Application funnel visual */}
        <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 12, gap: 10 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.label, marginBottom: 4 }}>Application Funnel (All Campaigns)</Text>
          {[
            { label: 'Prospects Reached', value: stats.totalReach, max: stats.totalReach, color: '#1A1714' },
            { label: 'Inquiries',         value: stats.totalInquiries,    max: stats.totalReach, color: '#1A1714' },
            { label: 'Applications',      value: stats.totalApplications, max: stats.totalReach, color: '#B8943E' },
          ].map(row => (
            <View key={row.label} style={{ gap: 4 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: C.secondary }}>{row.label}</Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: row.color }}>{row.value.toLocaleString()}</Text>
              </View>
              <View style={{ height: 5, backgroundColor: C.bg, borderRadius: 3, overflow: 'hidden' }}>
                <View style={{ height: 5, width: `${row.max > 0 ? Math.min(100, (row.value / row.max) * 100) : 0}%` as any, backgroundColor: row.color, borderRadius: 3 }} />
              </View>
            </View>
          ))}
        </View>

        {/* Top performing campaign */}
        <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <IconSymbol name="trophy.fill" size={14} color="#B8943E" />
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Top Campaign</Text>
          </View>
          <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{top.name}</Text>
          <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>
            {top.applicationsGenerated} applications · {top.reach} reached · ${top.budget.toLocaleString()} budget
          </Text>
        </View>

        {/* Suggested campaigns */}
        <Text style={{ fontSize: 16, fontWeight: '700', color: C.label, marginBottom: 12 }}>Suggested Campaigns</Text>
        {[
          { label: 'HBCU Consortium Fair', reason: 'Spring fair season — high ROI for transfer prospects', icon: 'arrow.triangle.2.circlepath', color: '#1A1714' },
          { label: 'Yield Email Sequence', reason: '47 admitted students haven\'t deposited yet', icon: 'envelope.fill', color: '#6B7280' },
          { label: 'Financial Aid Webinar', reason: 'Reduce summer melt for low-income admits', icon: 'dollarsign.circle.fill', color: '#5A8A6E' },
        ].map(sug => (
          <Pressable
            key={sug.label}
            style={({ pressed }) => ({
              backgroundColor: pressed ? C.surfacePressed : C.surface,
              borderRadius: 12, padding: 14, marginBottom: 8,
              flexDirection: 'row', alignItems: 'center', gap: 12,
            })}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: sug.color + '18', alignItems: 'center', justifyContent: 'center' }}>
              <IconSymbol name={sug.icon as any} size={16} color={sug.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{sug.label}</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{sug.reason}</Text>
            </View>
            <IconSymbol name="plus.circle" size={20} color={C.accent} />
          </Pressable>
        ))}

        <View style={{ height: 100 }} />
      </>
    );
  }

  function renderCampaignsMember() {
    let visible: AdmCampaign[];
    if (selectedPill === 'Upcoming')      visible = CAMPAIGNS.filter(c => c.status === 'upcoming');
    else if (selectedPill === 'Campus Visits') visible = CAMPAIGNS.filter(c => c.type === 'campus-visit');
    else visible = CAMPAIGNS.filter(c => c.type === 'virtual');

    if (visible.length === 0) {
      return (
        <>
          <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 20, alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: C.label }}>No events found</Text>
            <Text style={{ fontSize: 13, color: C.secondary, textAlign: 'center' }}>Check back soon for upcoming events.</Text>
          </View>
          <View style={{ height: 40 }} />
        </>
      );
    }

    return (
      <>
        {visible.map(campaign => {
          const isRsvp = rsvpIds.has(campaign.id);
          return (
            <View key={campaign.id} style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 10, gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{campaign.name}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>
                    {formatDate(campaign.startDate)}{campaign.type === 'virtual' ? ' · Virtual' : campaign.type === 'campus-visit' ? ' · On Campus' : ''}
                  </Text>
                </View>
                <View style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, backgroundColor: campaignStatusColor(campaign.status) + '22' }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: campaignStatusColor(campaign.status) }}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 13, color: C.secondary, lineHeight: 18 }}>{campaign.description}</Text>
              <Pressable
                style={({ pressed }) => ({
                  backgroundColor: isRsvp ? '#5A8A6E' : (pressed ? C.accent + 'cc' : C.accent),
                  borderRadius: 10, paddingVertical: 10, alignItems: 'center',
                })}
                onPress={() => {
                  if (!isRsvp) {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    setRsvpIds(prev => new Set([...prev, campaign.id]));
                  }
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>
                  {isRsvp ? 'Registered ✓' : 'RSVP / Register'}
                </Text>
              </Pressable>
            </View>
          );
        })}
        <View style={{ height: 40 }} />
      </>
    );
  }

  function renderContent() {
    const isDean = role === 'Dean';
    if (activeTab === 'Pipeline') {
      if (isDean) return renderPipelineAdmin();
      return renderProspectiveDashboard();
    }
    if (activeTab === 'Applications') {
      if (isDean) return renderApplicationsAdmin();
      return renderApplicationsStudent();
    }
    // Campaigns
    if (isDean) return renderCampaignsAdmin();
    return renderCampaignsMember();
  }

  // ── Layout ─────────────────────────────────────────────────────────────────

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      {/* Scrollable content — key forces fresh scroll state on every tab change */}
      <ScrollView
        key={activeTab}
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled"
      >
        {renderContent()}
      </ScrollView>

      {/* FAB — Pipeline: Add Prospect */}
      {role === 'Dean' && activeTab === 'Pipeline' && (
        <Pressable
          style={[s.fab, { bottom: insets.bottom + 80 }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setShowProspectCard(true); }}
        >
          <IconSymbol name="person.badge.plus" size={20} color="#fff" />
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Add Prospect</Text>
        </Pressable>
      )}

      {/* FAB — Campaigns: Create Campaign */}
      {role === 'Dean' && activeTab === 'Campaigns' && (
        <Pressable
          style={[s.fab, { bottom: insets.bottom + 80 }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        >
          <IconSymbol name="megaphone.fill" size={18} color="#fff" />
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Create Campaign</Text>
        </Pressable>
      )}

      {/* Absolute top bar */}
      <View style={[s.topBarWrap, { paddingTop: insets.top, backgroundColor: C.bg }]}>
        <View style={s.topBar}>
          {/* Left: hamburger (Dean only) */}
          <View style={s.topBarSide}>
            {role === 'Dean' && (
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
                hitSlop={12}
              >
                <IconSymbol name="line.3.horizontal" size={22} color={C.label} />
              </Pressable>
            )}
          </View>

          {/* Center: dropdown pill */}
          <View style={s.dropdownPillWrap}>
            <Pressable
              style={[s.dropdownPill, { backgroundColor: C.surfacePressed }]}
              onPress={() => { Haptics.selectionAsync(); setDropdownOpen(v => !v); }}
            >
              <Text style={[s.dropdownPillText, { color: C.label }]}>{activeTab}</Text>
              <IconSymbol name="chevron.down" size={12} color={C.secondary} />
            </Pressable>
          </View>

          {/* Right: role pill + filter icon */}
          <View style={[s.topBarSide, { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }]}>
            <RolePill
              role={role}
              onPress={cycleRole}
              accentColor="#1A1714"
              isPrimary={role === 'Dean'}
            />
            {pills.length > 0 && (
              <Pressable onPress={togglePills} hitSlop={12}>
                <IconSymbol
                  name={pillsVisible || selectedPill !== pills[0] ? 'line.3.horizontal.decrease.circle.fill' : 'line.3.horizontal.decrease.circle'}
                  size={22}
                  color={pillsVisible || selectedPill !== pills[0] ? C.accent : C.label}
                />
              </Pressable>
            )}
          </View>
        </View>

        {/* Pills row */}
        <Animated.View style={{ height: pillsAnim.interpolate({ inputRange: [0, 1], outputRange: [0, PILLS_H] }), opacity: pillsAnim, overflow: 'hidden' }}>
          <ScrollView
            horizontal showsHorizontalScrollIndicator={false}
            style={[s.pillsRow, { borderTopColor: C.separator }]}
            contentContainerStyle={s.pillsContent}
          >
            {pills.map(pill => {
              const active = pill === selectedPill;
              return (
                <Pressable
                  key={pill}
                  style={[s.pill, active ? { backgroundColor: C.label } : { borderColor: C.separator }]}
                  onPress={() => { Haptics.selectionAsync(); setSelectedPill(pill); }}
                >
                  <Text style={[s.pillText, { color: active ? C.bg : C.secondary }, active && { fontWeight: '600' }]}>{pill}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>

      {/* Dropdown overlay */}
      {dropdownOpen && (
        <>
          <Pressable
            style={{ ...StyleSheet.absoluteFillObject, zIndex: 98 } as any}
            onPress={() => setDropdownOpen(false)}
          />
          <View style={[s.dropdown, { backgroundColor: C.surface, borderColor: C.separator, top: insets.top + TOP_BAR_H }]}>
            {(['Pipeline', 'Applications', 'Campaigns'] as AdmTab[]).map(tab => (
              <Pressable
                key={tab}
                style={({ pressed }) => [
                  s.dropdownOpt, { borderBottomColor: C.separator },
                  (pressed || tab === activeTab) && { backgroundColor: C.surfacePressed },
                ]}
                onPress={() => changeTab(tab)}
              >
                <Text style={[s.dropdownOptText, { color: tab === activeTab ? C.accent : C.label }]}>{tab}</Text>
                {tab === activeTab && <IconSymbol name="checkmark" size={14} color={C.accent} />}
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* Applicant detail sheet */}
      {detailOpen && (
        <>
          <Animated.View
            style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 49, opacity: detailAnim } as any}
          >
            <Pressable style={{ flex: 1 }} onPress={closeDetail} />
          </Animated.View>
          <Animated.View
            style={[s.detailSheet, {
              backgroundColor: C.bg, zIndex: 50,
              transform: [{ translateY: detailAnim.interpolate({ inputRange: [0, 1], outputRange: [DETAIL_H, 0] }) }],
            }]}
          >
            {selectedApplicant && (
              <ApplicantDetailSheet
                applicant={{ ...selectedApplicant, stage: applicantStages[selectedApplicant.id] ?? selectedApplicant.stage }}
                isAdmin={role === 'Dean'}
                onClose={closeDetail}
                onMoveStage={(stage) => moveStage(selectedApplicant.id, stage)}
                counselorNotes={counselorNotes}
                onNotesChange={setCounselorNotes}
                C={C}
                insets={insets}
              />
            )}
          </Animated.View>
        </>
      )}

      {/* Prospect card overlay */}
      {showProspectCard && (
        <View style={{ ...StyleSheet.absoluteFillObject, zIndex: 60 } as any}>
          <ProspectCardOverlay onClose={() => setShowProspectCard(false)} C={C} insets={insets} />
        </View>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen:           { flex: 1 },
  topBarWrap:       { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  topBar:           { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  topBarSide:       { width: 86, justifyContent: 'center' },
  dropdownPillWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dropdownPill:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  dropdownPillText: { fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },
  rbacToggle:       { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  rbacToggleText:   { fontSize: 11, fontWeight: '700' },
  pillsRow:         { height: PILLS_H, borderTopWidth: StyleSheet.hairlineWidth },
  pillsContent:     { paddingHorizontal: 12, alignItems: 'center', gap: 8 },
  pill:             { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  pillText:         { fontSize: 13 },

  dropdown: {
    position: 'absolute', left: '50%' as any, marginLeft: -110, minWidth: 220,
    borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, zIndex: 99, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10, shadowRadius: 12, elevation: 8,
  },
  dropdownOpt:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: StyleSheet.hairlineWidth },
  dropdownOptText: { flex: 1, fontSize: 15, fontWeight: '600' },

  applicantRow:       { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 4, borderRadius: 10 },
  applicantAvatar:    { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  applicantAvatarText: { fontSize: 13, fontWeight: '800', color: '#fff' },

  funnelCell: { width: 72, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 4, borderRadius: 12, borderWidth: 1, gap: 4 },

  campaignCard:   { borderRadius: 14, marginBottom: 10, overflow: 'hidden' },
  campaignHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },

  detailSheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: DETAIL_H,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12, shadowRadius: 16, elevation: 12,
  },

  fab: {
    position: 'absolute', right: 20,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 18, paddingVertical: 12, borderRadius: 28,
    backgroundColor: C.accent,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18, shadowRadius: 8, elevation: 6,
  },
});
