/**
 * Education Hub — Lincoln University Oakland.
 * Personal Hub Profile Pattern:
 *   Cover → full screen top → K + role pill overlaid (fade-hides on scroll)
 *   Avatar bottom-left → identity left → social row → FEATURED → PROGRAMS → LEADERSHIP → CAMPUS
 * President: edit controls. Student: read-only.
 */

import React, { useCallback } from 'react';
import { View, Text, Pressable, ScrollView, Image, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useAppContext } from '@/context/app-context';

const TOP_BAR_H   = 44;
const AVATAR_SIZE = 80;
const AVATAR_OVR  = AVATAR_SIZE / 2;

// ─── Data ─────────────────────────────────────────────────────────────────────────────────

const SCHOOL = {
  name:      'Lincoln University (CA)',
  handle:    '@lincolnu',
  location:  'Oakland, California · Est. 1919',
  bio:       "Oakland's private university. WSCUC and IACBE accredited. Business. Healthcare. Leadership.",
  followers: 436,
};

const SOCIALS = [
  { fa: 'facebook',  label: 'Facebook'  },
  { fa: 'instagram', label: 'Instagram' },
  { fa: 'youtube',   label: 'YouTube'   },
  { fa: 'x-twitter', label: 'X'        },
];

const FEATURED = [
  { type: 'VIDEO', title: 'Virtual Campus Tour',          subtitle: '2.8K views', icon: 'play.circle.fill' },
  { type: 'EVENT', title: 'Fall 2026 Open House',          subtitle: 'Sep 12',     icon: 'calendar'        },
  { type: 'POST',  title: 'New Diagnostic Imaging Lab',    subtitle: '340 likes',  icon: 'doc.text.fill'   },
];

const PROGRAMS = [
  { name: 'BA Business Administration',   level: 'Undergraduate', students: 89,  icon: 'briefcase.fill'       },
  { name: 'BS Diagnostic Imaging',        level: 'Undergraduate', students: 115, icon: 'cross.fill'           },
  { name: 'MBA',                          level: 'Graduate',      students: 142, icon: 'graduationcap.fill'   },
  { name: "MS Int'l Business & Finance",  level: 'Graduate',      students: 68,  icon: 'chart.line.uptrend.xyaxis' },
  { name: 'Doctor of Business Admin.',    level: 'Doctoral',      students: 22,  icon: 'star.fill'            },
];

const LEADERSHIP = [
  { initials: 'MB', name: 'Dr. Mikhail Brodsky', title: 'President'         },
  { initials: 'DP', name: 'Dr. Pantos',           title: 'Provost'           },
  { initials: 'DG', name: 'Desmond Gumbs',        title: 'Athletic Director' },
];

const CAMPUS = [
  { icon: 'location.fill', label: '401 15th Street, Oakland, CA 94612' },
  { icon: 'clock',         label: 'Mon–Fri  8:00 AM – 6:00 PM'         },
  { icon: 'phone.fill',    label: '(510) 628-8010'                     },
  { icon: 'globe',         label: 'lincolnuca.edu'                      },
];

// ─── Helper ─────────────────────────────────────────────────────────────────────────────────

function SH({ title, action, C }: { title: string; action?: React.ReactNode; C: ComponentColors }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
      <Text style={{ flex: 1, fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 0.8, textTransform: 'uppercase' }}>
        {title}
      </Text>
      {action}
    </View>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────────────────────

export default function EducationHub() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state } = useAppContext();
  const mode = state.activeContext?.mode ?? state.mode ?? 'personal';
  const [role, toggleRole, roleCycles] = useDemoRole('education');
  const isPresident = role === roleCycles[0];
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const COVER_H = 220 + insets.top + TOP_BAR_H;

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (mode !== 'education') {
      router.replace('/(tabs)/(main)/hub' as any);
    }
  }, [mode]));

  const row = (C: ComponentColors) => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: C.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    gap: 12,
  });

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 0, paddingBottom: 120 }}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {/* ── 1. Cover + Avatar ── */}
        <View style={{ position: 'relative', marginBottom: AVATAR_OVR + 12 }}>
          <Pressable disabled={!isPresident}>
            <View style={{ height: COVER_H, backgroundColor: C.surface, overflow: 'hidden' }}>
              <Image
                source={{ uri: 'https://picsum.photos/seed/lincoln-campus/900/500' }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
              {isPresident && (
                <View style={{ position: 'absolute', bottom: 10, right: 12, backgroundColor: 'rgba(0,0,0,0.50)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <IconSymbol name="camera.fill" size={12} color="#fff" />
                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#fff' }}>Edit Cover</Text>
                </View>
              )}
            </View>
          </Pressable>

          {/* School logo — bottom-left, overlapping cover */}
          <View style={{ position: 'absolute', bottom: -AVATAR_OVR, left: 20 }}>
            <Pressable disabled={!isPresident}>
              <View style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, backgroundColor: C.surface, borderWidth: 3, borderColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 36 }}>🏛️</Text>
              </View>
              {isPresident && (
                <View style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.bg }}>
                  <IconSymbol name="camera.fill" size={10} color={C.bg} />
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {/* ── 2. Identity ── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: C.label, marginBottom: 2 }}>{SCHOOL.name}</Text>
          <Text style={{ fontSize: 14, color: C.secondary, marginBottom: 3 }}>{SCHOOL.handle}</Text>
          <Text style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>{SCHOOL.location}</Text>
          <Pressable disabled={!isPresident}>
            <Text style={{ fontSize: 14, color: C.label, lineHeight: 20, opacity: 0.85 }}>{SCHOOL.bio}</Text>
          </Pressable>
        </View>

        {/* ── 3. Followers + action button ── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 18 }}>
          <Text style={{ fontSize: 14, color: C.secondary }}>
            <Text style={{ fontWeight: '700', color: C.label }}>{SCHOOL.followers.toLocaleString()}</Text>{' followers'}
          </Text>
          {isPresident ? (
            <Pressable style={{ paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: C.separator }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Edit Profile</Text>
            </Pressable>
          ) : (
            <Pressable style={{ paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: C.separator }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Following</Text>
            </Pressable>
          )}
        </View>

        {/* ── 4. Social links row ── */}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-start', gap: 12, paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: C.separator, marginBottom: 28 }}>
          {SOCIALS.map(s => (
            <Pressable key={s.label} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' }}>
                <FontAwesome6 name={s.fa} size={18} color={C.label} iconStyle="brands" />
              </View>
            </Pressable>
          ))}
          {isPresident && (
            <Pressable style={{ marginLeft: 8, justifyContent: 'center' }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary }}>Edit Socials</Text>
            </Pressable>
          )}
        </View>

        {/* ── Content sections ── */}
        <View style={{ paddingHorizontal: 16 }}>

          {/* FEATURED */}
          <View style={{ marginBottom: 28 }}>
            <SH
              title="Featured"
              C={C}
              action={isPresident ? (
                <Pressable><Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary }}>Manage</Text></Pressable>
              ) : undefined}
            />
            {FEATURED.map((item, i) => (
              <Pressable key={i} style={({ pressed }) => [row(C), pressed && { opacity: 0.8 }]}>
                <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: C.separator, alignItems: 'center', justifyContent: 'center' }}>
                  <IconSymbol name={item.icon as any} size={16} color={C.label} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ backgroundColor: C.separator, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start', marginBottom: 3 }}>
                    <Text style={{ fontSize: 9, fontWeight: '700', color: C.label, letterSpacing: 0.5 }}>{item.type}</Text>
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{item.title}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{item.subtitle}</Text>
                </View>
                <IconSymbol name="chevron.right" size={14} color={C.muted} />
              </Pressable>
            ))}
          </View>

          {/* PROGRAMS */}
          <View style={{ marginBottom: 28 }}>
            <SH
              title="Programs"
              C={C}
              action={isPresident ? (
                <Pressable><Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary }}>Edit</Text></Pressable>
              ) : undefined}
            />
            {PROGRAMS.map((p, i) => (
              <Pressable key={i} style={({ pressed }) => [row(C), pressed && { opacity: 0.8 }]}>
                <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: C.separator, alignItems: 'center', justifyContent: 'center' }}>
                  <IconSymbol name={p.icon as any} size={16} color={C.label} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{p.name}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{p.level} · {p.students} students</Text>
                </View>
                <IconSymbol name="chevron.right" size={14} color={C.muted} />
              </Pressable>
            ))}
          </View>

          {/* LEADERSHIP */}
          <View style={{ marginBottom: 28 }}>
            <SH
              title="Leadership"
              C={C}
              action={isPresident ? (
                <Pressable><Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary }}>Edit</Text></Pressable>
              ) : undefined}
            />
            {LEADERSHIP.map((person, i) => (
              <Pressable key={i} style={({ pressed }) => [row(C), pressed && { opacity: 0.8 }]}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.separator, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: C.label }}>{person.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{person.name}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{person.title}</Text>
                </View>
                <IconSymbol name="chevron.right" size={14} color={C.muted} />
              </Pressable>
            ))}
          </View>

          {/* CAMPUS */}
          <View style={{ marginBottom: 28 }}>
            <SH
              title="Campus"
              C={C}
              action={isPresident ? (
                <Pressable><Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary }}>Edit</Text></Pressable>
              ) : undefined}
            />
            {CAMPUS.map((item, i) => (
              <Pressable key={i} style={({ pressed }) => [row(C), pressed && { opacity: 0.8 }]}>
                <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: C.separator, alignItems: 'center', justifyContent: 'center' }}>
                  <IconSymbol name={item.icon as any} size={16} color={C.label} />
                </View>
                <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: C.label }}>{item.label}</Text>
                <IconSymbol name="chevron.right" size={14} color={C.muted} />
              </Pressable>
            ))}
          </View>

        </View>
      </ScrollView>

      {/* ── Overlaid top bar — transparent bg, fades out on scroll ── */}
      <Animated.View
        style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, opacity }}
        pointerEvents="box-none"
      >
        <View
          style={{ paddingTop: insets.top, height: insets.top + TOP_BAR_H, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 8 }}
          pointerEvents="box-none"
        >
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
            hitSlop={12}
          >
            <Text style={{ fontSize: 20, fontWeight: '800', letterSpacing: -0.5, color: C.label }}>K</Text>
          </Pressable>
          <View style={{ flex: 1 }} pointerEvents="none" />
          <RolePill
            role={role}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleRole(); }}
            isPrimary={isPresident}
          />
        </View>
      </Animated.View>

    </View>
  );
}
