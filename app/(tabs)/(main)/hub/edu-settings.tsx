/**
 * Education Hub — Settings. President + Student.
 * President: institution profile, academics, enrollment, communications.
 * Student: account preferences and privacy.
 */
import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated, Switch } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';

const TOP_BAR_H = 52;

type ToggleKey =
  | 'pubProfileVisible' | 'showEnrollment' | 'acceptInquiries' | 'showAccreditation'
  | 'studentCourseCatalog' | 'onlineRegistration' | 'gradeNotifications' | 'facultyGradeSubmission'
  | 'acceptApplications' | 'applicationStatusUpdates' | 'notifyAdmissions' | 'virtualCampusTour'
  | 'institutionalAnnouncements' | 'dipsonForFaculty' | 'emergencyAlerts'
  | 'emailNotifications' | 'courseDeadlineReminders' | 'gradePostedAlerts' | 'financialAidAlerts'
  | 'profileInDirectory' | 'advisorViewGrades' | 'shareProgressWithParents';

type ToggleRow = { icon: string; label: string; stateKey: ToggleKey };
type Section   = { header: string; rows: ToggleRow[] };

const PRESIDENT_SECTIONS: Section[] = [
  {
    header: 'INSTITUTION PROFILE',
    rows: [
      { icon: 'building.columns.fill',     label: 'Public profile visible',               stateKey: 'pubProfileVisible'       },
      { icon: 'person.2.fill',             label: 'Show enrollment numbers publicly',      stateKey: 'showEnrollment'          },
      { icon: 'envelope.fill',             label: 'Accept prospective student inquiries',  stateKey: 'acceptInquiries'         },
      { icon: 'checkmark.seal.fill',       label: 'Display accreditation badges',          stateKey: 'showAccreditation'       },
    ],
  },
  {
    header: 'ACADEMICS',
    rows: [
      { icon: 'book.fill',                 label: 'Allow students to view course catalog', stateKey: 'studentCourseCatalog'    },
      { icon: 'calendar.badge.plus',       label: 'Enable online registration',            stateKey: 'onlineRegistration'      },
      { icon: 'bell.badge.fill',           label: 'Send grade notifications to students',  stateKey: 'gradeNotifications'      },
      { icon: 'pencil.and.list.clipboard', label: 'Allow faculty grade submission',        stateKey: 'facultyGradeSubmission'  },
    ],
  },
  {
    header: 'ENROLLMENT',
    rows: [
      { icon: 'tray.and.arrow.down.fill',  label: 'Accept applications online',            stateKey: 'acceptApplications'      },
      { icon: 'arrow.up.right.circle',     label: 'Send application status updates',       stateKey: 'applicationStatusUpdates'},
      { icon: 'bell.fill',                 label: 'Notify admissions of new inquiries',    stateKey: 'notifyAdmissions'        },
      { icon: 'video.fill',                label: 'Enable virtual campus tour',            stateKey: 'virtualCampusTour'       },
    ],
  },
  {
    header: 'COMMUNICATIONS',
    rows: [
      { icon: 'megaphone.fill',            label: 'Send institutional announcements',      stateKey: 'institutionalAnnouncements'},
      { icon: 'sparkles',                  label: 'Allow Dipson for faculty',              stateKey: 'dipsonForFaculty'          },
      { icon: 'exclamationmark.triangle.fill', label: 'Student emergency alerts',         stateKey: 'emergencyAlerts'           },
    ],
  },
];

const STUDENT_SECTIONS: Section[] = [
  {
    header: 'MY ACCOUNT',
    rows: [
      { icon: 'envelope.fill',             label: 'Email notifications from university',  stateKey: 'emailNotifications'      },
      { icon: 'calendar.badge.exclamationmark', label: 'Course deadline reminders',       stateKey: 'courseDeadlineReminders' },
      { icon: 'checkmark.circle.fill',     label: 'Grade posted alerts',                  stateKey: 'gradePostedAlerts'       },
      { icon: 'dollarsign.circle.fill',    label: 'Financial aid update alerts',          stateKey: 'financialAidAlerts'      },
    ],
  },
  {
    header: 'PRIVACY',
    rows: [
      { icon: 'person.crop.rectangle',    label: 'Show profile in student directory',    stateKey: 'profileInDirectory'      },
      { icon: 'person.fill.questionmark', label: 'Allow advisor to view my grades',      stateKey: 'advisorViewGrades'       },
      { icon: 'person.2.fill',            label: 'Share academic progress with parents', stateKey: 'shareProgressWithParents'},
    ],
  },
];

function ToggleRowItem({ row, C, s, value, onToggle }: { row: ToggleRow; C: ComponentColors; s: ReturnType<typeof makeStyles>; value: boolean; onToggle: () => void }) {
  return (
    <View style={s.row}>
      <IconSymbol name={row.icon as any} size={22} color={C.label} />
      <Text style={[s.rowLabel, { color: C.label }]}>{row.label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: C.separator, true: C.label }}
        thumbColor={C.bg}
        ios_backgroundColor={C.separator}
      />
    </View>
  );
}

export default function EduSettings() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [role, cycleRole, roleCycles] = useDemoRole('education');
  const isPresident = role === roleCycles[0];

  // President toggles
  const [pubProfileVisible,          setPubProfileVisible]          = useState(true);
  const [showEnrollment,             setShowEnrollment]             = useState(true);
  const [acceptInquiries,            setAcceptInquiries]            = useState(true);
  const [showAccreditation,          setShowAccreditation]          = useState(true);
  const [studentCourseCatalog,       setStudentCourseCatalog]       = useState(true);
  const [onlineRegistration,         setOnlineRegistration]         = useState(true);
  const [gradeNotifications,         setGradeNotifications]         = useState(true);
  const [facultyGradeSubmission,     setFacultyGradeSubmission]     = useState(true);
  const [acceptApplications,         setAcceptApplications]         = useState(true);
  const [applicationStatusUpdates,   setApplicationStatusUpdates]   = useState(true);
  const [notifyAdmissions,           setNotifyAdmissions]           = useState(true);
  const [virtualCampusTour,          setVirtualCampusTour]          = useState(false);
  const [institutionalAnnouncements, setInstitutionalAnnouncements] = useState(true);
  const [dipsonForFaculty,           setDipsonForFaculty]           = useState(true);
  const [emergencyAlerts,            setEmergencyAlerts]            = useState(true);

  // Student toggles
  const [emailNotifications,         setEmailNotifications]         = useState(true);
  const [courseDeadlineReminders,    setCourseDeadlineReminders]    = useState(true);
  const [gradePostedAlerts,          setGradePostedAlerts]          = useState(true);
  const [financialAidAlerts,         setFinancialAidAlerts]         = useState(true);
  const [profileInDirectory,         setProfileInDirectory]         = useState(true);
  const [advisorViewGrades,          setAdvisorViewGrades]          = useState(true);
  const [shareProgressWithParents,   setShareProgressWithParents]   = useState(false);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const toggleValues: Record<ToggleKey, boolean> = {
    pubProfileVisible, showEnrollment, acceptInquiries, showAccreditation,
    studentCourseCatalog, onlineRegistration, gradeNotifications, facultyGradeSubmission,
    acceptApplications, applicationStatusUpdates, notifyAdmissions, virtualCampusTour,
    institutionalAnnouncements, dipsonForFaculty, emergencyAlerts,
    emailNotifications, courseDeadlineReminders, gradePostedAlerts, financialAidAlerts,
    profileInDirectory, advisorViewGrades, shareProgressWithParents,
  };

  const handleToggle = useCallback((key: ToggleKey) => {
    Haptics.selectionAsync();
    switch (key) {
      case 'pubProfileVisible':          setPubProfileVisible(v => !v);          break;
      case 'showEnrollment':             setShowEnrollment(v => !v);             break;
      case 'acceptInquiries':            setAcceptInquiries(v => !v);            break;
      case 'showAccreditation':          setShowAccreditation(v => !v);          break;
      case 'studentCourseCatalog':       setStudentCourseCatalog(v => !v);       break;
      case 'onlineRegistration':         setOnlineRegistration(v => !v);         break;
      case 'gradeNotifications':         setGradeNotifications(v => !v);         break;
      case 'facultyGradeSubmission':     setFacultyGradeSubmission(v => !v);     break;
      case 'acceptApplications':         setAcceptApplications(v => !v);         break;
      case 'applicationStatusUpdates':   setApplicationStatusUpdates(v => !v);   break;
      case 'notifyAdmissions':           setNotifyAdmissions(v => !v);           break;
      case 'virtualCampusTour':          setVirtualCampusTour(v => !v);          break;
      case 'institutionalAnnouncements': setInstitutionalAnnouncements(v => !v); break;
      case 'dipsonForFaculty':           setDipsonForFaculty(v => !v);           break;
      case 'emergencyAlerts':            setEmergencyAlerts(v => !v);            break;
      case 'emailNotifications':         setEmailNotifications(v => !v);         break;
      case 'courseDeadlineReminders':    setCourseDeadlineReminders(v => !v);    break;
      case 'gradePostedAlerts':          setGradePostedAlerts(v => !v);          break;
      case 'financialAidAlerts':         setFinancialAidAlerts(v => !v);         break;
      case 'profileInDirectory':         setProfileInDirectory(v => !v);         break;
      case 'advisorViewGrades':          setAdvisorViewGrades(v => !v);          break;
      case 'shareProgressWithParents':   setShareProgressWithParents(v => !v);   break;
    }
  }, []);

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={8} style={s.kBtn}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>University Settings</Text>
            </View>
          </View>
          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isPresident} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 16, paddingBottom: insets.bottom + 80, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {(isPresident ? PRESIDENT_SECTIONS : STUDENT_SECTIONS).map(section => (
          <View key={section.header} style={{ marginBottom: 28 }}>
            <Text style={[s.sectionHeader, { color: C.secondary }]}>{section.header}</Text>
            <View style={[s.sectionCard, { backgroundColor: C.surface }]}>
              {section.rows.map((row, idx) => (
                <View key={row.stateKey}>
                  {idx > 0 && <View style={[s.rowSep, { backgroundColor: C.separator }]} />}
                  <ToggleRowItem row={row} C={C} s={s} value={toggleValues[row.stateKey]} onToggle={() => handleToggle(row.stateKey)} />
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root: { flex: 1 },
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar: { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  kBtn: { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  titlePill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  rolePillWrap: { width: 80, alignItems: 'flex-end', justifyContent: 'center' },
  sectionHeader: { fontSize: 11, fontWeight: '700', letterSpacing: 0.9, marginBottom: 8 },
  sectionCard: { borderRadius: 14, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, gap: 14 },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  rowSep: { height: StyleSheet.hairlineWidth },
});
