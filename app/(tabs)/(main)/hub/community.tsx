/**
 * Community Hub — ICCLA Church Overview.
 * Mirrors the Personal Hub Profile Pattern exactly:
 *   Cover extends to top of screen → K + role pill overlaid (fade-hides on scroll down)
 *   Avatar bottom-left overlapping cover → identity left-aligned → social row
 *   → FEATURED → LEADERSHIP → UPCOMING EVENTS → LINKS
 * Pastor: edit controls. Member: read-only (Follow + RSVP).
 */

import React, { useCallback, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Image, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

import { IconSymbol } from '@/components/ui/icon-symbol';

const ICCLA_COVER         = require('@/assets/images/iccla-cover.png');
const ICCLA_COVER_PASTORS = require('@/assets/images/iccla-cover.jpg');
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

// ─── Data ─────────────────────────────────────────────────────────────────────

const CHURCH = {
  name:      'ICCLA',
  handle:    '@iccla',
  bio:       'Interdenominational, Pentecostal. Multicultural, grace-centered. Welcome home.',
  followers: 1247,
};

const SOCIALS = [
  { fa: 'facebook',  label: 'Facebook'  },
  { fa: 'youtube',   label: 'YouTube'   },
  { fa: 'instagram', label: 'Instagram' },
  { fa: 'x-twitter', label: 'X'        },
];

const FEATURED = [
  { type: 'VIDEO',  title: 'Easter Sunday Service Replay', subtitle: '3.2K views',  icon: 'play.circle.fill' },
  { type: 'COURSE', title: 'Rooted: Discover Your Place',  subtitle: '12 enrolled', icon: 'book.fill'        },
  { type: 'EVENT',  title: 'Summer Block Party',           subtitle: 'Jun 14',      icon: 'calendar'         },
];

const LEADERSHIP = [
  { initials: 'DK', name: 'Dr. Oladipo Kalejaiye',  title: 'Senior Pastor'         },
  { initials: 'NK', name: 'Dr. Nonyelum Kalejaiye', title: 'Co-Pastor'             },
  { initials: 'DE', name: 'David Eze',               title: 'Young Adults Director' },
];

const UPCOMING_EVENTS = [
  { month: 'APR', day: '20', name: 'Easter Sunday Service', time: '10:00 AM', location: 'Main Sanctuary'  },
  { month: 'APR', day: '23', name: 'Wednesday Bible Study', time: '7:00 PM',  location: 'Fellowship Hall' },
  { month: 'APR', day: '25', name: 'Youth Night',           time: '6:00 PM',  location: 'Youth Center'    },
];

const SERVICES = [
  { day: 'Sunday Morning',  time: '11:00 AM'           },
  { day: 'Sunday Evening',  time: '6:00 PM'            },
  { day: 'Wednesday',       time: 'Bible Study 7:00 PM'},
];

const LINKS = [
  { icon: 'location.fill',                     label: 'Service Times & Location'  },
  { icon: 'hands.sparkles.fill',               label: 'Submit a Prayer Request'   },
  { icon: 'heart.fill',                        label: 'Give'                      },
  { icon: 'antenna.radiowaves.left.and.right', label: 'Hotline to Heaven Radio'   },
  { icon: 'globe',                             label: 'Visit Our Website'         },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

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

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CommunityHub() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state } = useAppContext();
  const mode = state.mode ?? 'personal';
  const [role, toggleRole, roleCycles] = useDemoRole('community:hub');
  const isPastor = role === roleCycles[0];
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  useEffect(() => {
    if (mode !== 'community') {
      router.replace('/(tabs)/(main)/hub' as any);
    }
  }, [mode]);

  // Cover is tall enough to sit behind status bar / dynamic island
  const COVER_H = 220 + insets.top + TOP_BAR_H;

  const go = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

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
          <Pressable disabled={!isPastor}>
            <View style={{ height: COVER_H, backgroundColor: '#FFFFFF', overflow: 'hidden' }}>
              <Image
                source={ICCLA_COVER_PASTORS}
                style={{ width: '100%', height: '100%', transform: [{ translateY: 50 }] }}
                resizeMode="contain"
              />
              {isPastor && (
                <View style={{ position: 'absolute', bottom: 10, right: 12, backgroundColor: 'rgba(0,0,0,0.50)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <IconSymbol name="camera.fill" size={12} color="#fff" />
                  <Text style={{ fontSize: 11, fontWeight: '600', color: '#fff' }}>Edit Cover</Text>
                </View>
              )}
            </View>
          </Pressable>

          {/* Church logo — bottom-left, overlapping cover */}
          <View style={{ position: 'absolute', bottom: -AVATAR_OVR, left: 20 }}>
            <Pressable disabled={!isPastor}>
              <View style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2, backgroundColor: '#1a0a2e', borderWidth: 3, borderColor: C.bg, overflow: 'hidden' }}>
                <Image source={ICCLA_COVER} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
              </View>
              {isPastor && (
                <View style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: C.label, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: C.bg }}>
                  <IconSymbol name="camera.fill" size={10} color={C.bg} />
                </View>
              )}
            </Pressable>
          </View>
        </View>

        {/* ── 2. Identity ── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: C.label, marginBottom: 2 }}>{CHURCH.name}</Text>
          <Text style={{ fontSize: 14, color: C.secondary, marginBottom: 8 }}>{CHURCH.handle}</Text>
          <Pressable disabled={!isPastor}>
            <Text style={{ fontSize: 14, color: C.label, lineHeight: 20, opacity: 0.85 }}>{CHURCH.bio}</Text>
          </Pressable>
        </View>

        {/* ── 3. Followers + action button ── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 18 }}>
          <Text style={{ fontSize: 14, color: C.secondary }}>
            <Text style={{ fontWeight: '700', color: C.label }}>{CHURCH.followers.toLocaleString()}</Text>{' followers'}
          </Text>
          {isPastor ? (
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
          {isPastor && (
            <Pressable style={{ marginLeft: 8, justifyContent: 'center' }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary }}>Edit Socials</Text>
            </Pressable>
          )}
        </View>

        {/* ── Content sections ── */}
        <View style={{ paddingHorizontal: 16 }}>

          {/* SERVICES */}
          <View style={{ marginBottom: 28 }}>
            <SH title="Services" C={C} />
            {SERVICES.map((svc, i) => (
              <View
                key={i}
                style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 8 }}
              >
                <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: C.label }}>{svc.day}</Text>
                <Text style={{ fontSize: 13, color: C.secondary }}>{svc.time}</Text>
              </View>
            ))}
          </View>

          {/* FEATURED */}
          <View style={{ marginBottom: 28 }}>
            <SH
              title="Featured"
              C={C}
              action={isPastor ? (
                <Pressable><Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary }}>Manage</Text></Pressable>
              ) : undefined}
            />
            {FEATURED.map((item, i) => (
              <Pressable
                key={i}
                style={({ pressed }) => [styles.row(C), pressed && { opacity: 0.8 }]}
              >
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

          {/* LEADERSHIP */}
          <View style={{ marginBottom: 28 }}>
            <SH
              title="Leadership"
              C={C}
              action={isPastor ? (
                <Pressable><Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary }}>Edit</Text></Pressable>
              ) : undefined}
            />
            {LEADERSHIP.map((person, i) => (
              <Pressable
                key={i}
                style={({ pressed }) => [styles.row(C), pressed && { opacity: 0.8 }]}
              >
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

          {/* UPCOMING EVENTS */}
          <View style={{ marginBottom: 28 }}>
            <SH title="Upcoming Events" C={C} />
            {UPCOMING_EVENTS.map((ev, i) => (
              <Pressable
                key={i}
                style={({ pressed }) => [styles.row(C), pressed && { opacity: 0.8 }]}
              >
                <View style={{ width: 40, alignItems: 'center', backgroundColor: C.separator, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 4 }}>
                  <Text style={{ fontSize: 9, fontWeight: '700', color: C.secondary, letterSpacing: 0.5 }}>{ev.month}</Text>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: C.label, lineHeight: 22 }}>{ev.day}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{ev.name}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{ev.time} · {ev.location}</Text>
                </View>
                {!isPastor && (
                  <View style={{ backgroundColor: C.separator, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginRight: 6 }}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: C.label }}>RSVP</Text>
                  </View>
                )}
                <IconSymbol name="chevron.right" size={14} color={C.muted} />
              </Pressable>
            ))}
            <Pressable style={{ paddingVertical: 10, alignItems: 'center' }} onPress={() => go('/(tabs)/(main)/agenda')}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary }}>See All Events</Text>
            </Pressable>
          </View>

          {/* LINKS */}
          <View style={{ marginBottom: 28 }}>
            <SH
              title="Links"
              C={C}
              action={isPastor ? (
                <Pressable><Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary }}>Edit</Text></Pressable>
              ) : undefined}
            />
            {LINKS.map((link, i) => (
              <Pressable
                key={i}
                style={({ pressed }) => [styles.row(C), pressed && { opacity: 0.8 }]}
              >
                <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: C.separator, alignItems: 'center', justifyContent: 'center' }}>
                  <IconSymbol name={link.icon as any} size={16} color={C.label} />
                </View>
                <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: C.label }}>{link.label}</Text>
                <IconSymbol name="chevron.right" size={14} color={C.muted} />
              </Pressable>
            ))}
            {isPastor && (
              <Pressable style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8, gap: 8, borderWidth: 1.5, borderColor: C.separator }}>
                <IconSymbol name="plus" size={14} color={C.secondary} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.secondary }}>Add Link</Text>
              </Pressable>
            )}
          </View>

        </View>
      </ScrollView>

      {/* ── Overlaid top bar — transparent bg, fades out on scroll, snaps back at top ── */}
      <Animated.View
        style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, opacity }}
        pointerEvents="box-none"
      >
        <View
          style={{ paddingTop: insets.top, height: insets.top + TOP_BAR_H, flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 16, paddingBottom: 8 }}
          pointerEvents="box-none"
        >
          <View style={{ width: 80, justifyContent: 'center' }} pointerEvents="auto">
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
              hitSlop={12}
            >
              <Text style={{ fontSize: 20, fontWeight: '800', letterSpacing: -0.5, color: C.label }}>K</Text>
            </Pressable>
          </View>
          <View style={{ flex: 1 }} pointerEvents="none" />
          <View style={{ width: 80, alignItems: 'flex-end' }} pointerEvents="auto">
            <RolePill
              role={role}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleRole(); }}
              isPrimary={isPastor}
            />
          </View>
        </View>
      </Animated.View>

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = {
  row: (C: ComponentColors) => ({
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: C.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    gap: 12,
  }),
};
