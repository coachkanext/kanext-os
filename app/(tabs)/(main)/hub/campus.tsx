/**
 * Campus Screen — "school's website in your hand."
 * Education mode: buildings, clubs, housing, dining, resources.
 * Three views: Map / Life / Resources via centered dropdown pill.
 * RBAC: Dean (admin) / Student / Parent.
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, Pressable, ScrollView,
  StyleSheet, Animated, TextInput, Linking,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { hideFooter, showFooter, resetFooter } from '@/utils/global-footer-hide';
import { openSidePanel } from '@/utils/global-side-panel';
import {
  CAMPUS_BUILDINGS, CAMPUS_ALERTS, CLUBS, HOUSING_BUILDINGS, MY_HOUSING,
  DINING_HALLS, RESOURCES, CAMPUS_EVENTS, CAMPUS_NEWS, STUDENT_GOV,
  MAINTENANCE_CATEGORIES, BUILDING_COLORS,
  type Building, type Club, type DiningHall, type ResourceCategory, type OrgType,
} from '@/data/mock-campus-hub';

type CampusTab  = 'Map' | 'Life' | 'Resources';
type CampusRole = 'admin' | 'student' | 'parent';

const MAP_PILLS       = ['All', 'Academic', 'Residential', 'Athletic', 'Dining', 'Administrative'];
const LIFE_PILLS      = ['All', 'Clubs', 'Housing', 'Dining', 'Events', 'News'];
const RESOURCES_PILLS = ['All', 'Academic', 'Health', 'Career', 'Technology', 'Services', 'Financial'];

const TOP_BAR_H  = 52;
const PILL_ROW_H = 48;

function pillsForTab(tab: CampusTab): string[] {
  if (tab === 'Map')       return MAP_PILLS;
  if (tab === 'Life')      return LIFE_PILLS;
  return RESOURCES_PILLS;
}

function nextRole(r: CampusRole): CampusRole {
  return r === 'admin' ? 'student' : r === 'student' ? 'parent' : 'admin';
}
function roleLabel(r: CampusRole): string {
  return r === 'admin' ? 'Dean' : r === 'student' ? 'Student' : 'Parent';
}

// ── Section Header ────────────────────────────────────────────────────────────

function SecH({ title, C }: { title: string; C: ComponentColors }) {
  return <Text style={[secHs.t, { color: C.label }]}>{title}</Text>;
}
const secHs = StyleSheet.create({ t: { fontSize: 17, fontWeight: '700', marginBottom: 12, marginTop: 4 } });

// ── Type Badge ────────────────────────────────────────────────────────────────

function TypeBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[tbS.wrap, { backgroundColor: `${color}22` }]}>
      <Text style={[tbS.txt, { color }]}>{label}</Text>
    </View>
  );
}
const tbS = StyleSheet.create({
  wrap: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, alignSelf: 'flex-start' },
  txt:  { fontSize: 10, fontWeight: '700' },
});

// ── Campus Screen ─────────────────────────────────────────────────────────────

export default function CampusScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();

  // ── Role & Tab ──
  const [role, setRole]             = useState<CampusRole>('student');
  const [activeTab, setActiveTab]   = useState<CampusTab>('Map');
  const [dropdownOpen, setDropdown] = useState(false);

  // ── Filter pills ──
  const [filterPillsVisible, setPillsVisible] = useState(false);
  const [selectedPill, setSelectedPill]       = useState('All');
  const pillsRevealAnim = useRef(new Animated.Value(0)).current;

  // ── Map state ──
  const [mapSearch, setMapSearch]           = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [buildingSheetOpen, setBuildingSheet]   = useState(false);
  const [floorDirOpen, setFloorDirOpen]         = useState(false);

  // ── Life state ──
  const [clubSearch, setClubSearch]           = useState('');
  const [clubTypeFilter, setClubTypeFilter]   = useState<OrgType | 'All'>('All');
  const [joinedClubs, setJoinedClubs]         = useState<Set<string>>(new Set(['club-bsu', 'club-intramural']));
  const [selectedClub, setSelectedClub]       = useState<Club | null>(null);
  const [clubDetailOpen, setClubDetailOpen]   = useState(false);
  const [selectedDining, setSelectedDining]   = useState<DiningHall | null>(null);
  const [diningSheetOpen, setDiningSheet]     = useState(false);
  const [selectedMeal, setSelectedMeal]       = useState<'breakfast' | 'lunch' | 'dinner'>('lunch');
  const [dietaryFilter, setDietaryFilter]     = useState<string[]>([]);
  const [maintenanceSheetOpen, setMaintSheet] = useState(false);
  const [maintForm, setMaintForm]             = useState({ building: 'Morrison Hall', room: '214', category: '', description: '', urgency: 'Normal' });

  // ── Scroll footer ──
  const lastScrollY = useRef(0);
  const topBarH     = insets.top + TOP_BAR_H;
  const contentPaddingTop = topBarH + (filterPillsVisible ? PILL_ROW_H : 0) + 8;

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  // ── Pills animation ──
  const togglePills = useCallback(() => {
    setPillsVisible(prev => {
      const next = !prev;
      Animated.timing(pillsRevealAnim, { toValue: next ? 1 : 0, duration: 200, useNativeDriver: false }).start();
      return next;
    });
  }, [pillsRevealAnim]);

  const handleTabSelect = useCallback((tab: CampusTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
    setDropdown(false);
    setSelectedPill('All');
    setPillsVisible(false);
    pillsRevealAnim.setValue(0);
    setClubDetailOpen(false);
  }, [pillsRevealAnim]);

  const handleRoleChange = useCallback(() => {
    Haptics.selectionAsync();
    setRole(r => nextRole(r));
    setSelectedPill('All');
    setPillsVisible(false);
    pillsRevealAnim.setValue(0);
  }, [pillsRevealAnim]);

  const pills = pillsForTab(activeTab);

  // ── MAP VIEW ──────────────────────────────────────────────────────────────

  const renderMap = () => {
    const q = mapSearch.toLowerCase().trim();
    const pillFilter = selectedPill === 'All' ? null : selectedPill.toLowerCase();

    const filteredBuildings = CAMPUS_BUILDINGS.filter(b => {
      if (pillFilter && b.type !== pillFilter && !(pillFilter === 'residential' && b.type === 'residential')) {
        if (pillFilter !== b.type) return false;
      }
      return true;
    });

    const searchMatches = (b: Building) => {
      if (!q) return true;
      return b.name.toLowerCase().includes(q) || b.departments.some(d => d.toLowerCase().includes(q));
    };

    return (
      <View style={{ flex: 1, paddingTop: topBarH + (filterPillsVisible ? PILL_ROW_H : 0) }}>
        {/* Search bar */}
        <View style={[mapS.searchWrap, { backgroundColor: C.surface, borderColor: C.inputBorder }]}>
          <IconSymbol name="magnifyingglass" size={15} color={C.muted} />
          <TextInput
            style={[mapS.searchInput, { color: C.label }]}
            value={mapSearch}
            onChangeText={setMapSearch}
            placeholder="Search buildings, departments…"
            placeholderTextColor={C.muted}
          />
          {mapSearch.length > 0 && (
            <Pressable onPress={() => setMapSearch('')}>
              <IconSymbol name="xmark.circle.fill" size={15} color={C.muted} />
            </Pressable>
          )}
        </View>

        {/* Map canvas */}
        <ScrollView
          minimumZoomScale={1}
          maximumZoomScale={3}
          bouncesZoom
          centerContent
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          <View style={mapS.canvas}>
            {/* Roads */}
            <View style={[mapS.road, mapS.roadH, { top: 200, left: 80, width: 620 }]} />
            <View style={[mapS.road, mapS.roadH, { top: 340, left: 80, width: 620 }]} />
            <View style={[mapS.road, mapS.roadV, { left: 220, top: 60, height: 340 }]} />
            <View style={[mapS.road, mapS.roadV, { left: 460, top: 60, height: 340 }]} />

            {/* Buildings */}
            {filteredBuildings.map(b => {
              const hasAlert = CAMPUS_ALERTS.some(a => a.buildingId === b.id);
              const isMatch = searchMatches(b);
              const dimmed = q && !isMatch;
              return (
                <Pressable
                  key={b.id}
                  style={[
                    mapS.pin,
                    { left: b.x - 36, top: b.y - 26, backgroundColor: b.colorHex },
                    dimmed && { opacity: 0.25 },
                    !dimmed && q && isMatch && { borderWidth: 2, borderColor: C.accent },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedBuilding(b);
                    setFloorDirOpen(false);
                    setBuildingSheet(true);
                  }}
                >
                  <Text style={mapS.pinLetter}>{b.name.charAt(0)}</Text>
                  {hasAlert && <View style={[mapS.alertDot, { backgroundColor: CAMPUS_ALERTS.find(a => a.buildingId === b.id)?.color ?? '#C4872A' }]} />}
                </Pressable>
              );
            })}

            {/* Building labels */}
            {filteredBuildings.map(b => {
              const isMatch = searchMatches(b);
              const dimmed = q && !isMatch;
              return (
                <Text
                  key={`lbl-${b.id}`}
                  style={[mapS.pinLabel, { left: b.x - 44, top: b.y + 30, color: C.label, opacity: dimmed ? 0.25 : 1 }]}
                  numberOfLines={2}
                >
                  {b.name}
                </Text>
              );
            })}
          </View>
        </ScrollView>

        {/* Legend */}
        <View style={[mapS.legend, { backgroundColor: C.surface }]}>
          {(Object.entries(BUILDING_COLORS) as [string, string][]).map(([type, color]) => (
            <View key={type} style={mapS.legendItem}>
              <View style={[mapS.legendDot, { backgroundColor: color }]} />
              <Text style={[mapS.legendTxt, { color: C.secondary }]}>{type.charAt(0).toUpperCase() + type.slice(1)}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  // ── LIFE VIEW ─────────────────────────────────────────────────────────────

  const renderLifeDetail = () => {
    if (!selectedClub) return null;
    const c = selectedClub;
    const isJoined = joinedClubs.has(c.id);
    const typeColors: Record<OrgType, string> = {
      academic: '#1D9BF0', social: C.accent, athletic: '#990000', cultural: '#D97757', service: '#5A8A6E',
    };
    const tc = typeColors[c.type];
    return (
      <View style={{ flex: 1, paddingTop: topBarH + (filterPillsVisible ? PILL_ROW_H : 0) }}>
      <ScrollView onScroll={handleScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}>
        {/* Back */}
        <Pressable style={lifeS.backRow} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setClubDetailOpen(false); setSelectedClub(null); }}>
          <IconSymbol name="chevron.left" size={16} color={C.accent} />
          <Text style={[lifeS.backTxt, { color: C.accent }]}>Back to Clubs</Text>
        </Pressable>
        {/* Cover */}
        <View style={[lifeS.cover, { backgroundColor: `hsl(${c.hue},55%,30%)` }]} />
        {/* Name */}
        <View style={lifeS.clubHead}>
          <Text style={[lifeS.clubName, { color: C.label }]}>{c.name}</Text>
          <TypeBadge label={c.type} color={tc} />
        </View>
        <Text style={[lifeS.clubDesc, { color: C.secondary }]}>{c.description}</Text>
        {/* Leadership */}
        <SecH title="Leadership" C={C} />
        {[{ label: 'President', name: c.president }, { label: 'Advisor', name: c.advisor }].map(p => (
          <View key={p.label} style={[lifeS.leaderRow, { backgroundColor: C.surface }]}>
            <View style={[lifeS.leaderAvatar, { backgroundColor: `hsl(${c.hue},40%,35%)` }]}>
              <Text style={lifeS.leaderInitials}>{p.name.split(' ').map(n => n[0]).join('').slice(0, 2)}</Text>
            </View>
            <View style={lifeS.leaderInfo}>
              <Text style={[lifeS.leaderName, { color: C.label }]}>{p.name}</Text>
              <Text style={[lifeS.leaderRole, { color: C.secondary }]}>{p.label}</Text>
            </View>
          </View>
        ))}
        <View style={[lifeS.metaRow, { backgroundColor: C.surface }]}>
          <IconSymbol name="person.3.fill" size={14} color={C.secondary} />
          <Text style={[lifeS.metaTxt, { color: C.secondary }]}>{c.memberCount} members</Text>
          <View style={lifeS.metaDivider} />
          <IconSymbol name="clock" size={14} color={C.secondary} />
          <Text style={[lifeS.metaTxt, { color: C.secondary }]}>{c.meetingSchedule}</Text>
        </View>
        {/* Join */}
        <Pressable
          style={[lifeS.joinBtn, isJoined ? { backgroundColor: C.surfacePressed } : { backgroundColor: C.accent }]}
          onPress={() => {
            if (isJoined) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setJoinedClubs(prev => { const n = new Set(prev); n.delete(c.id); return n; });
            } else {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setJoinedClubs(prev => new Set([...prev, c.id]));
            }
          }}
        >
          <Text style={[lifeS.joinBtnTxt, { color: isJoined ? C.secondary : '#fff' }]}>{isJoined ? 'Joined ✓' : 'Join Club'}</Text>
        </Pressable>
        {role === 'admin' && (
          <View style={lifeS.adminRow}>
            <Pressable style={[lifeS.adminBtn, { borderColor: C.separator }]} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <Text style={[lifeS.adminBtnTxt, { color: C.accent }]}>Edit</Text>
            </Pressable>
            <Pressable style={[lifeS.adminBtn, { borderColor: '#B85C5C44' }]} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <Text style={[lifeS.adminBtnTxt, { color: '#B85C5C' }]}>Deactivate</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
      </View>
    );
  };

  const renderLife = () => {
    if (clubDetailOpen && selectedClub) return renderLifeDetail();

    const showAll   = selectedPill === 'All';
    const showClubs = showAll || selectedPill === 'Clubs';
    const showHouse = showAll || selectedPill === 'Housing';
    const showDine  = showAll || selectedPill === 'Dining';
    const showEvts  = showAll || selectedPill === 'Events';
    const showNews  = showAll || selectedPill === 'News';

    const typeColors: Record<OrgType, string> = {
      academic: '#1D9BF0', social: C.accent, athletic: '#990000', cultural: '#D97757', service: '#5A8A6E',
    };

    const filteredClubs = CLUBS.filter(c => {
      const matchesType = clubTypeFilter === 'All' || c.type === clubTypeFilter;
      const matchesSearch = !clubSearch || c.name.toLowerCase().includes(clubSearch.toLowerCase());
      return matchesType && matchesSearch;
    });

    return (
      <View style={{ flex: 1, paddingTop: topBarH + (filterPillsVisible ? PILL_ROW_H : 0) }}>
      <ScrollView onScroll={handleScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}>

        {/* News */}
        {showNews && (
          <>
            <SecH title="Campus News" C={C} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {CAMPUS_NEWS.map(n => (
                <Pressable key={n.id} style={[lifeS.newsCard, { backgroundColor: `hsl(${n.hue},40%,30%)` }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                  <Text style={lifeS.newsHeadline}>{n.headline}</Text>
                  <Text style={lifeS.newsDate}>{n.date}</Text>
                </Pressable>
              ))}
            </ScrollView>
            {role === 'admin' && (
              <Pressable style={[lifeS.createBtn, { borderColor: C.separator }]} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                <IconSymbol name="plus" size={14} color={C.accent} />
                <Text style={[lifeS.createBtnTxt, { color: C.accent }]}>Post Announcement</Text>
              </Pressable>
            )}
          </>
        )}

        {/* Events */}
        {showEvts && (
          <>
            <SecH title="Upcoming Events" C={C} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              {CAMPUS_EVENTS.map(ev => (
                <Pressable key={ev.id} style={[lifeS.eventCard, { backgroundColor: C.surface }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                  <Text style={[lifeS.eventTitle, { color: C.label }]} numberOfLines={2}>{ev.title}</Text>
                  <Text style={[lifeS.eventDate, { color: C.accent }]}>{ev.date}</Text>
                  <Text style={[lifeS.eventOrg, { color: C.secondary }]}>{ev.organizer}</Text>
                  <View style={lifeS.eventLocRow}>
                    <IconSymbol name="mappin" size={11} color={C.muted} />
                    <Text style={[lifeS.eventLoc, { color: C.muted }]} numberOfLines={1}>{ev.location}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
            {role === 'admin' && (
              <Pressable style={[lifeS.createBtn, { borderColor: C.separator }]} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                <IconSymbol name="plus" size={14} color={C.accent} />
                <Text style={[lifeS.createBtnTxt, { color: C.accent }]}>Add Event</Text>
              </Pressable>
            )}
          </>
        )}

        {/* Clubs */}
        {showClubs && (
          <>
            <SecH title="Clubs & Organizations" C={C} />
            {/* Club search */}
            <View style={[lifeS.clubSearch, { backgroundColor: C.surface, borderColor: C.inputBorder }]}>
              <IconSymbol name="magnifyingglass" size={14} color={C.muted} />
              <TextInput
                style={[lifeS.clubSearchInput, { color: C.label }]}
                value={clubSearch}
                onChangeText={setClubSearch}
                placeholder="Search clubs…"
                placeholderTextColor={C.muted}
              />
            </View>
            {/* Type filter pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {(['All', 'academic', 'social', 'athletic', 'cultural', 'service'] as const).map(t => {
                const active = clubTypeFilter === t;
                return (
                  <Pressable key={t} style={[lifeS.typePill, active ? { backgroundColor: C.label } : { borderColor: C.separator }]}
                    onPress={() => { Haptics.selectionAsync(); setClubTypeFilter(t as OrgType | 'All'); }}>
                    <Text style={[lifeS.typePillTxt, { color: active ? C.bg : C.secondary }]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            {filteredClubs.map(c => {
              const tc = typeColors[c.type];
              const isJoined = joinedClubs.has(c.id);
              return (
                <Pressable key={c.id} style={[lifeS.clubCard, { backgroundColor: C.surface }]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedClub(c); setClubDetailOpen(true); }}>
                  <View style={lifeS.clubCardTop}>
                    <View style={lifeS.clubCardInfo}>
                      <Text style={[lifeS.clubCardName, { color: C.label }]}>{c.name}</Text>
                      <View style={lifeS.clubCardMeta}>
                        <TypeBadge label={c.type} color={tc} />
                        <Text style={[lifeS.clubCardCount, { color: C.muted }]}>{c.memberCount} members</Text>
                      </View>
                      <Text style={[lifeS.clubCardSched, { color: C.secondary }]} numberOfLines={1}>{c.meetingSchedule}</Text>
                    </View>
                    <Pressable
                      style={[lifeS.joinSmall, isJoined ? { backgroundColor: C.surfacePressed } : { backgroundColor: C.accent }]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        setJoinedClubs(prev => {
                          const n = new Set(prev);
                          if (isJoined) n.delete(c.id); else n.add(c.id);
                          return n;
                        });
                      }}
                    >
                      <Text style={[lifeS.joinSmallTxt, { color: isJoined ? C.secondary : '#fff' }]}>{isJoined ? 'Joined' : 'Join'}</Text>
                    </Pressable>
                  </View>
                </Pressable>
              );
            })}
            {role === 'admin' && (
              <Pressable style={[lifeS.createBtn, { borderColor: C.separator }]} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                <IconSymbol name="plus" size={14} color={C.accent} />
                <Text style={[lifeS.createBtnTxt, { color: C.accent }]}>Manage Orgs</Text>
              </Pressable>
            )}
          </>
        )}

        {/* Housing */}
        {showHouse && (
          <>
            <SecH title="Housing" C={C} />
            {role === 'student' && (
              <View style={[lifeS.myRoomCard, { backgroundColor: C.surface, borderColor: C.separator }]}>
                <Text style={[lifeS.myRoomTitle, { color: C.label }]}>My Room</Text>
                <View style={lifeS.myRoomGrid}>
                  {[
                    { label: 'Building', value: MY_HOUSING.building },
                    { label: 'Room', value: MY_HOUSING.room },
                    { label: 'Roommate', value: MY_HOUSING.roommate },
                    { label: 'RA', value: MY_HOUSING.ra },
                  ].map(r => (
                    <View key={r.label} style={lifeS.myRoomItem}>
                      <Text style={[lifeS.myRoomLabel, { color: C.muted }]}>{r.label}</Text>
                      <Text style={[lifeS.myRoomValue, { color: C.label }]}>{r.value}</Text>
                    </View>
                  ))}
                </View>
                <Pressable style={[lifeS.maintBtn, { borderColor: C.separator }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMaintSheet(true); }}>
                  <IconSymbol name="wrench.and.screwdriver" size={14} color={C.accent} />
                  <Text style={[lifeS.maintBtnTxt, { color: C.accent }]}>Submit Maintenance Request</Text>
                </Pressable>
              </View>
            )}
            {HOUSING_BUILDINGS.map(h => {
              const pct = h.occupancy / h.capacity;
              const typeLabel = h.type === 'freshman' ? 'Freshman' : h.type === 'upperclassman' ? 'Upperclassman' : 'Apartment';
              return (
                <View key={h.id} style={[lifeS.dormCard, { backgroundColor: C.surface }]}>
                  <View style={lifeS.dormTop}>
                    <View>
                      <Text style={[lifeS.dormName, { color: C.label }]}>{h.name}</Text>
                      <TypeBadge label={typeLabel} color={C.accent} />
                    </View>
                    <Text style={[lifeS.dormCap, { color: C.secondary }]}>{h.occupancy}/{h.capacity}</Text>
                  </View>
                  {role === 'admin' && (
                    <View style={[lifeS.occTrack, { backgroundColor: C.surfacePressed }]}>
                      <View style={[lifeS.occFill, { width: `${pct * 100}%` as any, backgroundColor: pct > 0.95 ? '#B85C5C' : '#5A8A6E' }]} />
                    </View>
                  )}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {h.amenities.map(a => (
                      <View key={a} style={[lifeS.amenityPill, { backgroundColor: C.surfacePressed }]}>
                        <Text style={[lifeS.amenityTxt, { color: C.secondary }]}>{a}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              );
            })}
          </>
        )}

        {/* Dining */}
        {showDine && (
          <>
            <SecH title="Dining" C={C} />
            {DINING_HALLS.map(h => (
              <Pressable key={h.id} style={[lifeS.diningCard, { backgroundColor: C.surface }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedDining(h); setDiningSheet(true); }}>
                <View style={lifeS.diningTop}>
                  <View>
                    <Text style={[lifeS.diningName, { color: C.label }]}>{h.name}</Text>
                    <Text style={[lifeS.diningLoc, { color: C.secondary }]}>{h.location}</Text>
                    <Text style={[lifeS.diningHours, { color: C.muted }]}>{h.hours.weekday}</Text>
                  </View>
                  <View style={lifeS.diningRight}>
                    <View style={[lifeS.openDot, { backgroundColor: h.isOpen ? '#5A8A6E' : '#B85C5C' }]} />
                    <Text style={[lifeS.openTxt, { color: h.isOpen ? '#5A8A6E' : '#B85C5C' }]}>{h.isOpen ? 'Open' : 'Closed'}</Text>
                  </View>
                </View>
                <Text style={[lifeS.menuPreviewLbl, { color: C.muted }]}>Today's lunch:</Text>
                <Text style={[lifeS.menuPreview, { color: C.secondary }]}>
                  {h.menuByMeal.lunch.slice(0, 2).map(m => m.name).join(' · ')}
                </Text>
                {role === 'admin' && (
                  <Pressable style={[lifeS.updateMenuBtn, { borderColor: C.separator }]} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                    <Text style={[lifeS.updateMenuTxt, { color: C.accent }]}>Update Menu</Text>
                  </Pressable>
                )}
              </Pressable>
            ))}
          </>
        )}

        {/* Student Government (always in All) */}
        {showAll && (
          <>
            <SecH title="Student Government" C={C} />
            <View style={lifeS.sgGrid}>
              {STUDENT_GOV.map(o => (
                <View key={o.id} style={[lifeS.sgCard, { backgroundColor: C.surface }]}>
                  <View style={[lifeS.sgAvatar, { backgroundColor: `hsl(220,50%,30%)` }]}>
                    <Text style={lifeS.sgInitials}>{o.initials}</Text>
                  </View>
                  <Text style={[lifeS.sgName, { color: C.label }]} numberOfLines={1}>{o.name}</Text>
                  <Text style={[lifeS.sgRole, { color: C.secondary }]} numberOfLines={2}>{o.role}</Text>
                </View>
              ))}
            </View>
            <View style={[lifeS.sgMeeting, { backgroundColor: C.surface }]}>
              <IconSymbol name="calendar" size={14} color={C.secondary} />
              <Text style={[lifeS.sgMeetingTxt, { color: C.secondary }]}>Meetings: Tuesdays 6 PM · Student Center Rm 201</Text>
            </View>
          </>
        )}
      </ScrollView>
      </View>
    );
  };

  // ── RESOURCES VIEW ────────────────────────────────────────────────────────

  const renderResources = () => {
    const categories: ResourceCategory[] = ['Academic', 'Health', 'Career', 'Technology', 'Services', 'Financial'];
    const filtered = selectedPill === 'All' ? categories : categories.filter(c => c === selectedPill);

    const orderedCategories = role === 'parent'
      ? ['Financial', 'Services', 'Health', 'Academic', 'Career', 'Technology'] as ResourceCategory[]
      : filtered;

    return (
      <View style={{ flex: 1, paddingTop: topBarH + (filterPillsVisible ? PILL_ROW_H : 0) }}>
      <ScrollView onScroll={handleScroll} scrollEventThrottle={16} showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}>
        {orderedCategories.map(cat => {
          if (selectedPill !== 'All' && cat !== selectedPill) return null;
          const items = RESOURCES.filter(r => r.category === cat);
          if (!items.length) return null;
          return (
            <View key={cat}>
              <SecH title={cat} C={C} />
              {items.map(r => (
                <View key={r.id} style={[resS.card, { backgroundColor: C.surface }]}>
                  <View style={resS.cardTop}>
                    <View style={resS.cardInfo}>
                      <Text style={[resS.name, { color: C.label }]}>{r.name}</Text>
                      <View style={resS.hoursRow}>
                        <View style={[resS.openDot, { backgroundColor: r.isOpen ? '#5A8A6E' : '#B85C5C' }]} />
                        <Text style={[resS.hours, { color: r.isOpen ? '#5A8A6E' : '#B85C5C' }]}>{r.isOpen ? 'Open' : 'Closed'}</Text>
                        <Text style={[resS.hoursDetail, { color: C.muted }]}> · {r.hours}</Text>
                      </View>
                      <View style={resS.locRow}>
                        <IconSymbol name="mappin" size={12} color={C.muted} />
                        <Text style={[resS.loc, { color: C.secondary }]}>{r.location}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={resS.actions}>
                    {r.quickActions.includes('call') && (
                      <Pressable style={[resS.actionPill, { borderColor: C.separator }]}
                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Linking.openURL(`tel:${r.phone}`); }}>
                        <IconSymbol name="phone" size={12} color={C.secondary} />
                        <Text style={[resS.actionTxt, { color: C.secondary }]}>Call</Text>
                      </Pressable>
                    )}
                    {r.quickActions.includes('directions') && (
                      <Pressable style={[resS.actionPill, { borderColor: C.separator }]}
                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Linking.openURL(`https://maps.apple.com/?q=${encodeURIComponent(r.name)}`); }}>
                        <IconSymbol name="map" size={12} color={C.secondary} />
                        <Text style={[resS.actionTxt, { color: C.secondary }]}>Directions</Text>
                      </Pressable>
                    )}
                    {r.quickActions.includes('website') && (
                      <Pressable style={[resS.actionPill, { borderColor: C.separator }]}
                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Linking.openURL(`https://${r.website}`); }}>
                        <IconSymbol name="globe" size={12} color={C.secondary} />
                        <Text style={[resS.actionTxt, { color: C.secondary }]}>Website</Text>
                      </Pressable>
                    )}
                    {(cat === 'Financial') && (
                      <Pressable style={[resS.actionPill, { borderColor: C.accent, backgroundColor: `${C.accent}12` }]}
                        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                        <IconSymbol name="creditcard" size={12} color={C.accent} />
                        <Text style={[resS.actionTxt, { color: C.accent }]}>KayPay</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>
      </View>
    );
  };

  // ── BUILDING SHEET ────────────────────────────────────────────────────────

  const renderBuildingSheet = () => {
    const b = selectedBuilding;
    if (!b) return null;
    const alert = CAMPUS_ALERTS.find(a => a.buildingId === b.id);
    const typeColor = BUILDING_COLORS[b.type];
    return (
      <>
        {/* Photo strip */}
        <View style={[bsS.photo, { backgroundColor: `hsl(${b.photoHue},45%,28%)` }]}>
          <Text style={bsS.photoText}>{b.name}</Text>
          {alert && (
            <View style={[bsS.alertBanner, { backgroundColor: `${alert.color}22` }]}>
              <IconSymbol name="exclamationmark.triangle.fill" size={13} color={alert.color} />
              <Text style={[bsS.alertTxt, { color: alert.color }]} numberOfLines={1}>{alert.title}</Text>
            </View>
          )}
        </View>
        <View style={{ paddingHorizontal: 16 }}>
          <View style={bsS.nameRow}>
            <Text style={[bsS.buildingName, { color: '#1A1714' }]}>{b.name}</Text>
            <TypeBadge label={b.type} color={typeColor} />
          </View>
          {/* Hours */}
          <View style={[bsS.hoursCard, { backgroundColor: '#F5EFE4' }]}>
            <IconSymbol name="clock" size={14} color="#2D1E1280" />
            <Text style={bsS.hoursTxt}>{b.hours}</Text>
          </View>
          {/* Departments */}
          <Text style={bsS.sectionHead}>Departments</Text>
          {b.departments.map(d => (
            <View key={d} style={bsS.deptRow}>
              <View style={[bsS.deptDot, { backgroundColor: typeColor }]} />
              <Text style={bsS.deptName}>{d}</Text>
            </View>
          ))}
          {/* Floor directory */}
          <Pressable style={bsS.floorToggle} onPress={() => setFloorDirOpen(v => !v)}>
            <Text style={bsS.sectionHead}>Floor Directory</Text>
            <IconSymbol name={floorDirOpen ? 'chevron.up' : 'chevron.down'} size={13} color="#2D1E1280" />
          </Pressable>
          {floorDirOpen && (
            <View style={bsS.floorList}>
              {Array.from({ length: b.floors }, (_, i) => (
                <View key={i} style={bsS.floorRow}>
                  <Text style={bsS.floorNum}>Floor {i + 1}</Text>
                  <Text style={bsS.floorDetail}>{b.departments[i % b.departments.length]}</Text>
                </View>
              ))}
            </View>
          )}
          {/* Accessibility */}
          <Text style={bsS.sectionHead}>Accessibility</Text>
          <View style={bsS.accessRow}>
            {b.accessibility.map(a => (
              <View key={a} style={bsS.accessPill}>
                <IconSymbol name={a === 'Elevator' ? 'arrow.up.arrow.down' : a === 'Wheelchair Ramp' ? 'figure.roll' : 'figure.stand'} size={13} color="#2A8A8A" />
                <Text style={bsS.accessTxt}>{a}</Text>
              </View>
            ))}
          </View>
          {/* Directions */}
          <Pressable style={bsS.directionsBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Linking.openURL(`https://maps.apple.com/?q=${encodeURIComponent(b.name + ' Lincoln University')}`); }}>
            <IconSymbol name="map.fill" size={16} color="#fff" />
            <Text style={bsS.directionsBtnTxt}>Get Directions</Text>
          </Pressable>
          {role === 'admin' && (
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
              {['Edit Building', 'Post Alert'].map(lbl => (
                <Pressable key={lbl} style={bsS.adminAction} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                  <Text style={bsS.adminActionTxt}>{lbl}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </>
    );
  };

  // ── DINING SHEET ──────────────────────────────────────────────────────────

  const renderDiningSheet = () => {
    const h = selectedDining;
    if (!h) return null;
    const meals = h.menuByMeal[selectedMeal];
    const filtered = dietaryFilter.length > 0
      ? meals.filter(m => dietaryFilter.every(f => m.dietaryTags.includes(f)))
      : meals;
    const dietaryTagColors: Record<string, string> = { Vegetarian: '#5A8A6E', Vegan: '#3A7A5A', 'Gluten-Free': '#C4872A', Halal: '#1D9BF0' };
    return (
      <View style={{ paddingHorizontal: 16 }}>
        <View style={dsS.header}>
          <Text style={[dsS.name, { color: '#1A1714' }]}>{h.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={[dsS.openDot, { backgroundColor: h.isOpen ? '#5A8A6E' : '#B85C5C' }]} />
            <Text style={[dsS.openTxt, { color: h.isOpen ? '#5A8A6E' : '#B85C5C' }]}>{h.isOpen ? 'Open Now' : 'Closed'}</Text>
          </View>
        </View>
        <View style={[dsS.hoursCard, { backgroundColor: '#F5EFE4' }]}>
          <Text style={dsS.hoursRow}>Weekday: {h.hours.weekday}</Text>
          <Text style={dsS.hoursRow}>Weekend: {h.hours.weekend}</Text>
        </View>
        {/* Meal selector */}
        <View style={dsS.mealRow}>
          {(['breakfast', 'lunch', 'dinner'] as const).map(m => (
            <Pressable key={m} style={[dsS.mealPill, selectedMeal === m ? { backgroundColor: '#1A1714' } : { borderColor: 'rgba(139,99,67,0.10)', borderWidth: 1 }]}
              onPress={() => { Haptics.selectionAsync(); setSelectedMeal(m); }}>
              <Text style={[dsS.mealPillTxt, { color: selectedMeal === m ? '#F5EFE4' : 'rgba(45,30,18,0.50)' }]}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
        {/* Dietary filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          {['Vegetarian', 'Vegan', 'Gluten-Free', 'Halal'].map(tag => {
            const active = dietaryFilter.includes(tag);
            const tc = dietaryTagColors[tag];
            return (
              <Pressable key={tag} style={[dsS.dietPill, active ? { backgroundColor: tc } : { borderColor: tc, borderWidth: 1 }]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setDietaryFilter(prev => active ? prev.filter(f => f !== tag) : [...prev, tag]);
                }}>
                <Text style={[dsS.dietPillTxt, { color: active ? '#fff' : tc }]}>{tag}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        {/* Menu items */}
        {filtered.length === 0
          ? <Text style={[dsS.emptyTxt, { color: 'rgba(45,30,18,0.30)' }]}>No items match your dietary filters</Text>
          : filtered.map((item, idx) => (
            <View key={idx} style={[dsS.menuItem, { borderBottomColor: 'rgba(139,99,67,0.10)', borderBottomWidth: idx < filtered.length - 1 ? StyleSheet.hairlineWidth : 0 }]}>
              <Text style={[dsS.menuName, { color: '#1A1714' }]}>{item.name}</Text>
              <View style={dsS.tagsRow}>
                {item.dietaryTags.map(t => (
                  <View key={t} style={[dsS.tagPill, { backgroundColor: `${dietaryTagColors[t] ?? '#888'}18` }]}>
                    <Text style={[dsS.tagTxt, { color: dietaryTagColors[t] ?? '#888' }]}>{t}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))
        }
        <View style={[dsS.mealPlanRow, { backgroundColor: '#F5EFE4' }]}>
          <IconSymbol name="creditcard" size={14} color="rgba(45,30,18,0.50)" />
          <Text style={[dsS.mealPlanTxt, { color: 'rgba(45,30,18,0.50)' }]}>Meal plan: 12 swipes remaining this week</Text>
        </View>
      </View>
    );
  };

  // ── MAINTENANCE SHEET ─────────────────────────────────────────────────────

  const renderMaintenanceSheet = () => (
    <View style={{ paddingHorizontal: 16 }}>
      <Text style={[msS.title, { color: '#1A1714' }]}>Submit Maintenance Request</Text>
      <Text style={[msS.fieldLabel, { color: 'rgba(45,30,18,0.50)' }]}>Building</Text>
      <View style={[msS.selectRow, { backgroundColor: '#F5EFE4', borderColor: 'rgba(139,99,67,0.18)' }]}>
        <Text style={[msS.selectValue, { color: '#1A1714' }]}>{maintForm.building}</Text>
        <IconSymbol name="chevron.down" size={13} color="rgba(45,30,18,0.30)" />
      </View>
      <Text style={[msS.fieldLabel, { color: 'rgba(45,30,18,0.50)' }]}>Room Number</Text>
      <TextInput
        style={[msS.input, { color: '#1A1714', borderColor: 'rgba(139,99,67,0.18)', backgroundColor: '#F5EFE4' }]}
        value={maintForm.room}
        onChangeText={v => setMaintForm(f => ({ ...f, room: v }))}
        placeholder="e.g. 214"
        placeholderTextColor="rgba(45,30,18,0.30)"
      />
      <Text style={[msS.fieldLabel, { color: 'rgba(45,30,18,0.50)' }]}>Category</Text>
      <View style={msS.categoryGrid}>
        {MAINTENANCE_CATEGORIES.map(cat => (
          <Pressable key={cat} style={[msS.catPill,
            maintForm.category === cat ? { backgroundColor: '#1A1714' } : { borderColor: 'rgba(139,99,67,0.18)', borderWidth: 1 }]}
            onPress={() => { Haptics.selectionAsync(); setMaintForm(f => ({ ...f, category: cat })); }}>
            <Text style={[msS.catPillTxt, { color: maintForm.category === cat ? '#F5EFE4' : 'rgba(45,30,18,0.50)' }]}>{cat}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={[msS.fieldLabel, { color: 'rgba(45,30,18,0.50)' }]}>Description</Text>
      <TextInput
        style={[msS.textarea, { color: '#1A1714', borderColor: 'rgba(139,99,67,0.18)', backgroundColor: '#F5EFE4' }]}
        value={maintForm.description}
        onChangeText={v => setMaintForm(f => ({ ...f, description: v }))}
        placeholder="Describe the issue…"
        placeholderTextColor="rgba(45,30,18,0.30)"
        multiline
        textAlignVertical="top"
      />
      <Text style={[msS.fieldLabel, { color: 'rgba(45,30,18,0.50)' }]}>Urgency</Text>
      <View style={msS.urgencyRow}>
        {['Normal', 'Urgent'].map(u => (
          <Pressable key={u} style={[msS.urgencyPill,
            maintForm.urgency === u
              ? { backgroundColor: u === 'Urgent' ? '#B85C5C' : '#1A1714' }
              : { borderColor: 'rgba(139,99,67,0.18)', borderWidth: 1 }]}
            onPress={() => { Haptics.selectionAsync(); setMaintForm(f => ({ ...f, urgency: u })); }}>
            <Text style={[msS.urgencyTxt, { color: maintForm.urgency === u ? '#fff' : 'rgba(45,30,18,0.50)' }]}>{u}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable style={[msS.submitBtn, { backgroundColor: '#D97757' }]}
        onPress={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setMaintForm(f => ({ ...f, category: '', description: '', urgency: 'Normal' }));
          setMaintSheet(false);
        }}>
        <Text style={msS.submitTxt}>Submit Request</Text>
      </Pressable>
    </View>
  );

  // ── Main render ───────────────────────────────────────────────────────────

  const renderContent = () => {
    if (activeTab === 'Map')       return renderMap();
    if (activeTab === 'Life')      return renderLife();
    return renderResources();
  };

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      {renderContent()}

      {/* ── Fixed Top Bar ── */}
      <View style={[s.topBarWrap, { paddingTop: insets.top, backgroundColor: C.bg }]}>
        <View style={s.topBar}>
          <View style={s.topBarSide}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={12}>
              <IconSymbol name="line.3.horizontal" size={22} color={C.label} />
            </Pressable>
          </View>

          <View style={s.dropdownPillWrap}>
            <Pressable style={[s.dropdownPill, { backgroundColor: C.surfacePressed }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setDropdown(v => !v); }}>
              <Text style={[s.dropdownPillTxt, { color: C.label }]}>{activeTab}</Text>
              <IconSymbol name="chevron.down" size={12} color={C.secondary} />
            </Pressable>
          </View>

          <View style={[s.topBarSide, { alignItems: 'flex-end', flexDirection: 'row', gap: 8 }]}>
            <Pressable
              style={[s.roleToggle, { backgroundColor: role === 'admin' ? C.accent : role === 'student' ? C.label : C.surfacePressed }]}
              onPress={handleRoleChange}>
              <Text style={[s.roleToggleTxt, { color: role === 'parent' ? C.secondary : '#fff' }]}>{roleLabel(role)}</Text>
            </Pressable>
            <Pressable onPress={togglePills} hitSlop={12}>
              <IconSymbol
                name={filterPillsVisible || selectedPill !== 'All' ? 'line.3.horizontal.decrease.circle.fill' : 'line.3.horizontal.decrease.circle'}
                size={22}
                color={filterPillsVisible || selectedPill !== 'All' ? C.accent : C.label}
              />
            </Pressable>
          </View>
        </View>

        {/* Filter pills */}
        <Animated.View style={{ height: pillsRevealAnim.interpolate({ inputRange: [0, 1], outputRange: [0, PILL_ROW_H] }), opacity: pillsRevealAnim, overflow: 'hidden' }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pillsContent}
            style={[s.pillsRow, { borderTopColor: C.separator }]}>
            {pills.map(pill => {
              const active = pill === selectedPill;
              return (
                <Pressable key={pill} style={[s.pill, active ? { backgroundColor: C.label } : { borderColor: C.separator }]}
                  onPress={() => { Haptics.selectionAsync(); setSelectedPill(pill); if (activeTab === 'Life') setClubDetailOpen(false); }}>
                  <Text style={[s.pillTxt, { color: active ? C.bg : C.secondary }, active && { fontWeight: '600' }]}>{pill}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>

      {/* Dropdown */}
      {dropdownOpen && (
        <>
          <Pressable style={[StyleSheet.absoluteFillObject, { zIndex: 98 }]} onPress={() => setDropdown(false)} />
          <View style={[s.dropdown, { top: insets.top + 56, backgroundColor: C.bg, borderColor: C.separator, zIndex: 99 }]}>
            {(['Map', 'Life', 'Resources'] as CampusTab[]).map(tab => (
              <Pressable key={tab} style={s.dropdownOption} onPress={() => handleTabSelect(tab)}>
                <Text style={[s.dropdownOptionTxt, { color: tab === activeTab ? C.label : C.secondary }, tab === activeTab && { fontWeight: '600' }]}>
                  {tab}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* Building Sheet */}
      <BottomSheet visible={buildingSheetOpen} onClose={() => setBuildingSheet(false)} useModal snapPoints={['50%', '100%']}>
        {renderBuildingSheet()}
      </BottomSheet>

      {/* Dining Sheet */}
      <BottomSheet visible={diningSheetOpen} onClose={() => setDiningSheet(false)} useModal snapPoints={['50%', '100%']}>
        {renderDiningSheet()}
      </BottomSheet>

      {/* Maintenance Sheet */}
      <BottomSheet visible={maintenanceSheetOpen} onClose={() => setMaintSheet(false)} useModal snapPoints={['50%', '100%']}>
        {renderMaintenanceSheet()}
      </BottomSheet>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen:            { flex: 1 },
  topBarWrap:        { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  topBar:            { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  topBarSide:        { width: 86, justifyContent: 'center' },
  dropdownPillWrap:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dropdownPill:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 6 },
  dropdownPillTxt:   { fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },
  dropdown: {
    position: 'absolute', left: '50%', marginLeft: -110, minWidth: 220,
    borderRadius: 14, borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10, shadowRadius: 12, elevation: 8, overflow: 'hidden',
  },
  dropdownOption:    { paddingVertical: 14, paddingHorizontal: 20 },
  dropdownOptionTxt: { fontSize: 15 },
  pillsRow:          { height: PILL_ROW_H, borderTopWidth: StyleSheet.hairlineWidth },
  pillsContent:      { paddingHorizontal: 12, alignItems: 'center', gap: 8 },
  pill:              { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  pillTxt:           { fontSize: 13 },
  roleToggle:        { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  roleToggleTxt:     { fontSize: 11, fontWeight: '700' },
});

const mapS = StyleSheet.create({
  searchWrap:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 8, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 14 },
  canvas:      { width: 800, height: 600, backgroundColor: '#E8EDF0', position: 'relative' },
  road:        { position: 'absolute', backgroundColor: '#CDD5DB' },
  roadH:       { height: 12, borderRadius: 6 },
  roadV:       { width: 12, borderRadius: 6 },
  pin:         { position: 'absolute', width: 72, height: 52, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  pinLetter:   { fontSize: 20, fontWeight: '800', color: '#fff' },
  pinLabel:    { position: 'absolute', fontSize: 9, fontWeight: '600', textAlign: 'center', width: 88 },
  alertDot:    { position: 'absolute', top: -5, right: -5, width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#fff' },
  legend:      { position: 'absolute', bottom: 12, right: 12, borderRadius: 10, padding: 10, gap: 5 },
  legendItem:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:   { width: 8, height: 8, borderRadius: 4 },
  legendTxt:   { fontSize: 10 },
});

const lifeS = StyleSheet.create({
  backRow:       { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  backTxt:       { fontSize: 14, fontWeight: '600' },
  cover:         { height: 110, borderRadius: 14, marginBottom: 16 },
  clubHead:      { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' },
  clubName:      { fontSize: 22, fontWeight: '800', flexShrink: 1 },
  clubDesc:      { fontSize: 14, lineHeight: 21, marginBottom: 20 },
  leaderRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, marginBottom: 8 },
  leaderAvatar:  { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  leaderInitials:{ fontSize: 13, fontWeight: '800', color: '#fff' },
  leaderInfo:    { flex: 1 },
  leaderName:    { fontSize: 14, fontWeight: '700' },
  leaderRole:    { fontSize: 12, marginTop: 2 },
  metaRow:       { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 12, marginBottom: 20 },
  metaTxt:       { fontSize: 13 },
  metaDivider:   { width: StyleSheet.hairlineWidth, height: 14, backgroundColor: 'rgba(139,99,67,0.18)' },
  joinBtn:       { paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginBottom: 12 },
  joinBtnTxt:    { fontSize: 15, fontWeight: '700' },
  adminRow:      { flexDirection: 'row', gap: 10, marginBottom: 20 },
  adminBtn:      { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
  adminBtnTxt:   { fontSize: 13, fontWeight: '700' },
  newsCard:      { width: 220, borderRadius: 14, padding: 16, marginRight: 10, justifyContent: 'flex-end', minHeight: 100 },
  newsHeadline:  { fontSize: 14, fontWeight: '700', color: '#fff', lineHeight: 20, marginBottom: 6 },
  newsDate:      { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  eventCard:     { width: 180, borderRadius: 14, padding: 14, marginRight: 10, gap: 4 },
  eventTitle:    { fontSize: 14, fontWeight: '700' },
  eventDate:     { fontSize: 12, fontWeight: '600' },
  eventOrg:      { fontSize: 11 },
  eventLocRow:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  eventLoc:      { fontSize: 11, flex: 1 },
  clubSearch:    { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12, borderWidth: 1, marginBottom: 10 },
  clubSearchInput:{ flex: 1, fontSize: 14 },
  typePill:      { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1.5, marginRight: 8 },
  typePillTxt:   { fontSize: 12 },
  clubCard:      { borderRadius: 14, padding: 14, marginBottom: 10 },
  clubCardTop:   { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  clubCardInfo:  { flex: 1, gap: 5 },
  clubCardName:  { fontSize: 14, fontWeight: '700' },
  clubCardMeta:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  clubCardCount: { fontSize: 11 },
  clubCardSched: { fontSize: 11 },
  joinSmall:     { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  joinSmallTxt:  { fontSize: 12, fontWeight: '700' },
  myRoomCard:    { borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1 },
  myRoomTitle:   { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  myRoomGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  myRoomItem:    { width: '45%', gap: 2 },
  myRoomLabel:   { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  myRoomValue:   { fontSize: 14, fontWeight: '600' },
  maintBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 11, borderRadius: 10, borderWidth: 1.5, borderStyle: 'dashed' },
  maintBtnTxt:   { fontSize: 13, fontWeight: '600' },
  dormCard:      { borderRadius: 14, padding: 14, marginBottom: 10, gap: 10 },
  dormTop:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  dormName:      { fontSize: 15, fontWeight: '700', marginBottom: 5 },
  dormCap:       { fontSize: 13 },
  occTrack:      { height: 5, borderRadius: 3, overflow: 'hidden' },
  occFill:       { height: 5, borderRadius: 3 },
  amenityPill:   { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, marginRight: 6 },
  amenityTxt:    { fontSize: 11 },
  diningCard:    { borderRadius: 14, padding: 14, marginBottom: 10, gap: 8 },
  diningTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  diningName:    { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  diningLoc:     { fontSize: 12 },
  diningHours:   { fontSize: 11 },
  diningRight:   { alignItems: 'flex-end', gap: 4 },
  openDot:       { width: 8, height: 8, borderRadius: 4 },
  openTxt:       { fontSize: 12, fontWeight: '600' },
  menuPreviewLbl:{ fontSize: 11 },
  menuPreview:   { fontSize: 13 },
  updateMenuBtn: { paddingVertical: 8, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  updateMenuTxt: { fontSize: 12, fontWeight: '600' },
  sgGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  sgCard:        { width: '47%', borderRadius: 12, padding: 12, alignItems: 'center', gap: 6 },
  sgAvatar:      { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  sgInitials:    { fontSize: 14, fontWeight: '800', color: '#fff' },
  sgName:        { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  sgRole:        { fontSize: 11, textAlign: 'center' },
  sgMeeting:     { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, padding: 12, marginBottom: 20 },
  sgMeetingTxt:  { fontSize: 13, flex: 1 },
  createBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', marginBottom: 20 },
  createBtnTxt:  { fontSize: 13, fontWeight: '600' },
});

const resS = StyleSheet.create({
  card:       { borderRadius: 14, padding: 14, marginBottom: 10 },
  cardTop:    { flexDirection: 'row', marginBottom: 10 },
  cardInfo:   { flex: 1, gap: 4 },
  name:       { fontSize: 15, fontWeight: '700' },
  hoursRow:   { flexDirection: 'row', alignItems: 'center', gap: 5 },
  openDot:    { width: 8, height: 8, borderRadius: 4 },
  hours:      { fontSize: 12, fontWeight: '600' },
  hoursDetail:{ fontSize: 12 },
  locRow:     { flexDirection: 'row', alignItems: 'center', gap: 5 },
  loc:        { fontSize: 12 },
  actions:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  actionTxt:  { fontSize: 12, fontWeight: '600' },
});

const bsS = StyleSheet.create({
  photo:        { height: 110, borderRadius: 0, justifyContent: 'flex-end', padding: 14, marginBottom: 14 },
  photoText:    { fontSize: 18, fontWeight: '800', color: '#fff' },
  alertBanner:  { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginTop: 8, alignSelf: 'flex-start' },
  alertTxt:     { fontSize: 12, fontWeight: '600', flexShrink: 1 },
  nameRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' },
  buildingName: { fontSize: 22, fontWeight: '800', flexShrink: 1 },
  hoursCard:    { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, padding: 10, marginBottom: 14 },
  hoursTxt:     { fontSize: 13, color: 'rgba(45,30,18,0.70)' },
  sectionHead:  { fontSize: 13, fontWeight: '700', color: '#1A1714', marginBottom: 8, marginTop: 14 },
  deptRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  deptDot:      { width: 7, height: 7, borderRadius: 4 },
  deptName:     { fontSize: 14, color: '#1A1714' },
  floorToggle:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  floorList:    { marginBottom: 8, gap: 4 },
  floorRow:     { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  floorNum:     { fontSize: 13, fontWeight: '600', color: '#1A1714' },
  floorDetail:  { fontSize: 12, color: 'rgba(45,30,18,0.50)' },
  accessRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  accessPill:   { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: 'rgba(42,138,138,0.10)' },
  accessTxt:    { fontSize: 12, color: '#2A8A8A' },
  directionsBtn:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 14, backgroundColor: '#1A1714', marginBottom: 10 },
  directionsBtnTxt: { fontSize: 15, fontWeight: '700', color: '#fff' },
  adminAction:  { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', backgroundColor: 'rgba(139,99,67,0.08)' },
  adminActionTxt:{ fontSize: 13, fontWeight: '700', color: '#D97757' },
});

const dsS = StyleSheet.create({
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  name:        { fontSize: 20, fontWeight: '800' },
  openDot:     { width: 8, height: 8, borderRadius: 4 },
  openTxt:     { fontSize: 12, fontWeight: '600' },
  hoursCard:   { borderRadius: 10, padding: 12, marginBottom: 14, gap: 4 },
  hoursRow:    { fontSize: 13, color: 'rgba(45,30,18,0.70)' },
  mealRow:     { flexDirection: 'row', gap: 8, marginBottom: 12 },
  mealPill:    { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
  mealPillTxt: { fontSize: 13, fontWeight: '600' },
  dietPill:    { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8 },
  dietPillTxt: { fontSize: 12, fontWeight: '600' },
  menuItem:    { paddingVertical: 12, gap: 5 },
  menuName:    { fontSize: 14, fontWeight: '500' },
  tagsRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  tagPill:     { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  tagTxt:      { fontSize: 10, fontWeight: '600' },
  emptyTxt:    { fontSize: 14, textAlign: 'center', paddingVertical: 20 },
  mealPlanRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, padding: 12, marginTop: 14 },
  mealPlanTxt: { fontSize: 13, flex: 1 },
});

const msS = StyleSheet.create({
  title:        { fontSize: 18, fontWeight: '800', marginBottom: 16, color: '#1A1714' },
  fieldLabel:   { fontSize: 12, fontWeight: '600', marginBottom: 6, marginTop: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  selectRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 10, borderWidth: 1, padding: 12 },
  selectValue:  { fontSize: 14 },
  input:        { borderRadius: 10, borderWidth: 1, padding: 12, fontSize: 14 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  catPill:      { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10 },
  catPillTxt:   { fontSize: 13, fontWeight: '600' },
  textarea:     { borderRadius: 10, borderWidth: 1, padding: 12, fontSize: 14, minHeight: 90, textAlignVertical: 'top' },
  urgencyRow:   { flexDirection: 'row', gap: 10, marginBottom: 20 },
  urgencyPill:  { flex: 1, paddingVertical: 11, borderRadius: 12, alignItems: 'center' },
  urgencyTxt:   { fontSize: 14, fontWeight: '700' },
  submitBtn:    { paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  submitTxt:    { fontSize: 15, fontWeight: '800', color: '#fff' },
});
