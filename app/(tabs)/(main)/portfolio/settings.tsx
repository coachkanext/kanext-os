/**
 * Portfolio Settings — tile-level settings for the Portfolio tile.
 * Personal mode. Controls visibility, sections, content features, and notifications.
 * Monochrome design system. No blue. No accent.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
  Switch,
} from 'react-native';
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

// ── Constants ─────────────────────────────────────────────────────────────────

const TOP_BAR_H = 52;

// ── Types ─────────────────────────────────────────────────────────────────────

type ToggleKey =
  | 'pubPortfolio'
  | 'contactForm'
  | 'rateCard'
  | 'showProjects'
  | 'showPress'
  | 'showTestimonials'
  | 'showArchive'
  | 'showCredentials'
  | 'featureProject'
  | 'testimonialReq'
  | 'autoMediaKit'
  | 'notifyVisit'
  | 'notifySubscriber';

type ToggleRow = {
  icon: string;
  label: string;
  stateKey: ToggleKey;
};

type Section = {
  header: string;
  rows: ToggleRow[];
};

// ── Section definitions ───────────────────────────────────────────────────────

const SECTIONS: Section[] = [
  {
    header: 'VISIBILITY',
    rows: [
      { icon: 'eye.fill',                              label: 'Public Portfolio',           stateKey: 'pubPortfolio'     },
      { icon: 'link',                                  label: 'Show Contact Form',          stateKey: 'contactForm'      },
      { icon: 'dollarsign.circle',                     label: 'Show Rate Card',             stateKey: 'rateCard'         },
    ],
  },
  {
    header: 'SECTIONS',
    rows: [
      { icon: 'briefcase.fill',                        label: 'Projects',                   stateKey: 'showProjects'     },
      { icon: 'newspaper.fill',                        label: 'Press',                      stateKey: 'showPress'        },
      { icon: 'quote.bubble.fill',                     label: 'Testimonials',               stateKey: 'showTestimonials' },
      { icon: 'doc.text.fill',                         label: 'Archive',                    stateKey: 'showArchive'      },
      { icon: 'checkmark.seal.fill',                   label: 'Credentials',                stateKey: 'showCredentials'  },
    ],
  },
  {
    header: 'CONTENT',
    rows: [
      { icon: 'star.fill',                             label: 'Feature a Project',          stateKey: 'featureProject'   },
      { icon: 'person.crop.circle.badge.checkmark',    label: 'Allow Testimonial Requests', stateKey: 'testimonialReq'   },
      { icon: 'doc.richtext.fill',                     label: 'Auto Media Kit',             stateKey: 'autoMediaKit'     },
    ],
  },
  {
    header: 'NOTIFICATIONS',
    rows: [
      { icon: 'bell.badge.fill',                       label: 'New Profile Visit',          stateKey: 'notifyVisit'      },
      { icon: 'person.badge.plus',                     label: 'New Subscriber',             stateKey: 'notifySubscriber' },
    ],
  },
];

// ── Main screen ───────────────────────────────────────────────────────────────

export default function PortfolioSettingsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [role, cycleRole, roleCycles] = useDemoRole('personal:portfolio');
  const isOwner = role === roleCycles[0];

  const [pubPortfolio,    setPubPortfolio]    = useState(true);
  const [contactForm,     setContactForm]     = useState(true);
  const [rateCard,        setRateCard]        = useState(false);
  const [showProjects,    setShowProjects]    = useState(true);
  const [showPress,       setShowPress]       = useState(true);
  const [showTestimonials,setShowTestimonials]= useState(true);
  const [showArchive,     setShowArchive]     = useState(true);
  const [showCredentials, setShowCredentials] = useState(true);
  const [featureProject,  setFeatureProject]  = useState(false);
  const [testimonialReq,  setTestimonialReq]  = useState(true);
  const [autoMediaKit,    setAutoMediaKit]    = useState(false);
  const [notifyVisit,     setNotifyVisit]     = useState(false);
  const [notifySubscriber,setNotifySubscriber]= useState(true);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const toggleValues: Record<ToggleKey, boolean> = {
    pubPortfolio,
    contactForm,
    rateCard,
    showProjects,
    showPress,
    showTestimonials,
    showArchive,
    showCredentials,
    featureProject,
    testimonialReq,
    autoMediaKit,
    notifyVisit,
    notifySubscriber,
  };

  const setters: Record<ToggleKey, React.Dispatch<React.SetStateAction<boolean>>> = {
    pubPortfolio:    setPubPortfolio,
    contactForm:     setContactForm,
    rateCard:        setRateCard,
    showProjects:    setShowProjects,
    showPress:       setShowPress,
    showTestimonials:setShowTestimonials,
    showArchive:     setShowArchive,
    showCredentials: setShowCredentials,
    featureProject:  setFeatureProject,
    testimonialReq:  setTestimonialReq,
    autoMediaKit:    setAutoMediaKit,
    notifyVisit:     setNotifyVisit,
    notifySubscriber:setNotifySubscriber,
  };

  const handleToggle = useCallback((key: ToggleKey) => {
    Haptics.selectionAsync();
    setters[key](v => !v);
  }, []);

  function renderRow(row: ToggleRow, idx: number) {
    return (
      <View key={row.stateKey}>
        {idx > 0 && <View style={[s.rowSep, { backgroundColor: C.separator }]} />}
        <View style={s.row}>
          <IconSymbol name={row.icon as any} size={22} color={C.label} />
          <Text style={[s.rowLabel, { color: C.label }]}>{row.label}</Text>
          <Switch
            value={toggleValues[row.stateKey]}
            onValueChange={() => handleToggle(row.stateKey)}
            trackColor={{ false: C.separator, true: C.label }}
            thumbColor={C.bg}
            ios_backgroundColor={C.separator}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <Animated.View
        style={[
          s.topBarOuter,
          { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity },
        ]}
      >
        <View style={s.topBar}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
            hitSlop={8}
            style={s.kBtn}
          >
            <KMenuButton />
          </Pressable>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Portfolio Settings</Text>
            </View>
          </View>

          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

      {/* ── Scrollable content ────────────────────────────────────────────────── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          s.scrollContent,
          { paddingTop: insets.top + TOP_BAR_H + 8, paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {SECTIONS.map((section, sIdx) => (
          <View key={section.header} style={sIdx > 0 ? s.sectionGap : undefined}>
            <Text style={[s.sectionHeader, { color: C.secondary }]}>
              {section.header}
            </Text>
            <View style={[s.sectionRows, { borderTopColor: C.separator, borderBottomColor: C.separator }]}>
              {section.rows.map((row, rIdx) => renderRow(row, rIdx))}
            </View>
          </View>
        ))}
      </ScrollView>

    </View>
  );
}

// ── makeStyles ────────────────────────────────────────────────────────────────

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },

    topBarOuter: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topBar: {
      height: TOP_BAR_H,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
    },
    kBtn: { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
    titlePill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
    titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
    rolePillWrap: { width: 80, alignItems: 'flex-end', justifyContent: 'center' },

    scrollContent: { paddingHorizontal: 0 },

    sectionGap: { marginTop: 32 },
    sectionHeader: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    sectionRows: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingHorizontal: 16,
      paddingVertical: 13,
      minHeight: 50,
    },
    rowSep: {
      height: StyleSheet.hairlineWidth,
      marginLeft: 52,
    },
    rowLabel: { flex: 1, fontSize: 16 },
  });
}
