/**
 * Rate Card — Personal Deals, Owner only.
 * Creator's professional pricing document for brands.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  Share,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useColors } from '@/hooks/use-colors';
import { resetFooter } from '@/utils/global-footer-hide';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: string;
  deliverables: string;
  timeline: string;
  usageRights: string;
  revisions: string;
}

interface Category {
  key: string;
  label: string;
  services: ServiceItem[];
}

// ── Data ──────────────────────────────────────────────────────────────────────

const INITIAL_CATEGORIES: Category[] = [
  {
    key: 'content',
    label: 'CONTENT',
    services: [
      { id: 'sponsored-post',  name: 'Sponsored Post',  description: '1 Instagram static post, usage rights 30 days, 1 revision included',                        price: '$3,500',     deliverables: '1 static Instagram post',                                  timeline: '5 business days',            usageRights: '30 days',                          revisions: '1 revision included'       },
      { id: 'sponsored-reel',  name: 'Sponsored Reel',  description: '1 60–90s Instagram Reel, usage rights 30 days, 2 revisions',                                price: '$6,000',     deliverables: '1 Instagram Reel (60–90 seconds)',                          timeline: '7 business days',            usageRights: '30 days',                          revisions: '2 revisions included'      },
      { id: 'ktv-video',       name: 'KTV Video',       description: '1 long-form KTV video (8–15 min), dedicated, usage rights 60 days',                         price: '$8,500',     deliverables: '1 dedicated long-form KTV video (8–15 minutes)',            timeline: '10 business days',           usageRights: '60 days',                          revisions: '2 revisions included'      },
      { id: 'story-feature',   name: 'Story Feature',   description: '3-story sequence, poll/swipe-up included, 24hr live + archive',                             price: '$1,800',     deliverables: '3-story Instagram sequence with poll/swipe-up',             timeline: '3 business days',            usageRights: '24hr live + permanent archive',    revisions: '1 revision included'       },
    ],
  },
  {
    key: 'partnerships',
    label: 'PARTNERSHIPS',
    services: [
      { id: 'ambassadorship',  name: 'Brand Ambassadorship', description: '3-month exclusive, 2 posts/mo, attendance at 1 brand event, usage rights ongoing',   price: '$28,000/mo', deliverables: '2 posts/month, 1 brand event appearance, ongoing content', timeline: '3-month minimum commitment', usageRights: 'Ongoing for duration of partnership', revisions: 'Unlimited within scope'    },
      { id: 'content-bundle',  name: 'Content Bundle',       description: '4 posts (mix of Reel + static), Stories, 1 KTV video, 60-day usage',                 price: '$18,000',    deliverables: '4 posts (Reel + static mix), Story sequence, 1 KTV video', timeline: '14 business days',           usageRights: '60 days',                          revisions: '2 revisions per deliverable' },
    ],
  },
  {
    key: 'appearances',
    label: 'APPEARANCES',
    services: [
      { id: 'speaking',        name: 'Speaking Engagement',  description: 'Keynote or panel, travel + accommodation not included, prep call included',            price: '$12,000',    deliverables: 'Keynote or panel participation, 1 pre-event prep call',    timeline: 'Min. 4 weeks in advance',    usageRights: 'Recording rights separate',        revisions: 'N/A'                       },
      { id: 'consulting',      name: 'Consulting Session',   description: '90-min strategy session via video, written summary delivered within 48hrs',            price: '$3,500',     deliverables: '90-minute video call + written summary report',             timeline: 'Summary within 48 hours',    usageRights: 'Internal use only',                revisions: 'N/A'                       },
    ],
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function DetailRow({ label, value, C }: { label: string; value: string; C: ReturnType<typeof useColors> }) {
  return (
    <View style={{ flexDirection: 'row', marginTop: 6 }}>
      <Text style={{ fontSize: 13, color: C.secondary, fontWeight: '600', width: 100 }}>{label}</Text>
      <Text style={{ fontSize: 13, color: C.label, flex: 1 }}>{value}</Text>
    </View>
  );
}

function ServiceCard({ service, isEditing, C, onPriceChange, onDescriptionChange, onDelete }: {
  service: ServiceItem;
  isEditing: boolean;
  C: ReturnType<typeof useColors>;
  onPriceChange: (id: string, val: string) => void;
  onDescriptionChange: (id: string, val: string) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [longPressed, setLongPressed] = useState(false);

  return (
    <Pressable
      onLongPress={() => { if (isEditing) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setLongPressed(true); } }}
    >
      <View style={{ backgroundColor: C.surface, borderRadius: 14, marginHorizontal: 16, marginBottom: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, overflow: 'hidden' }}>

        {/* Long-press delete overlay */}
        {longPressed && isEditing && (
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onDelete(service.id); }}
            style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', zIndex: 10, borderRadius: 14 }}
          >
            <View style={{ backgroundColor: '#B85C5C', borderRadius: 24, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
              <IconSymbol name="xmark" size={20} color="#FFFFFF" />
            </View>
            <Text style={{ color: '#FFFFFF', marginTop: 6, fontSize: 13, fontWeight: '600' }}>Delete</Text>
            <Pressable onPress={() => setLongPressed(false)} style={{ marginTop: 12, paddingHorizontal: 16, paddingVertical: 6 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 13, opacity: 0.75 }}>Cancel</Text>
            </Pressable>
          </Pressable>
        )}

        {/* Top row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 14, paddingBottom: expanded ? 6 : 14 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, flex: 1 }}>{service.name}</Text>
          {isEditing ? (
            <TextInput value={service.price} onChangeText={v => onPriceChange(service.id, v)} style={{ fontSize: 17, fontWeight: '800', color: C.label, textAlign: 'right', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator, minWidth: 80, marginRight: 8 }} />
          ) : (
            <Text style={{ fontSize: 17, fontWeight: '800', color: C.label, marginRight: 8 }}>{service.price}</Text>
          )}
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setExpanded(v => !v); }} hitSlop={8}>
            <IconSymbol name={expanded ? 'chevron.down' : 'chevron.right'} size={16} color={C.secondary} />
          </Pressable>
        </View>

        {/* Description */}
        <View style={{ paddingHorizontal: 14, paddingBottom: expanded ? 0 : 14 }}>
          {isEditing ? (
            <TextInput value={service.description} onChangeText={v => onDescriptionChange(service.id, v)} multiline style={{ fontSize: 13, color: C.secondary, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, borderRadius: 8, padding: 8, minHeight: 48 }} />
          ) : (
            <Text style={{ fontSize: 13, color: C.secondary }} numberOfLines={expanded ? undefined : 1}>{service.description}</Text>
          )}
        </View>

        {/* Expanded details */}
        {expanded && (
          <View style={{ paddingHorizontal: 14, paddingTop: 10, paddingBottom: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator, marginTop: 10 }}>
            <DetailRow label="Deliverables:" value={service.deliverables} C={C} />
            <DetailRow label="Timeline:"     value={service.timeline}     C={C} />
            <DetailRow label="Usage Rights:" value={service.usageRights}  C={C} />
            <DetailRow label="Revisions:"    value={service.revisions}    C={C} />
          </View>
        )}
      </View>
    </Pressable>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function RateCardScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topBarH = insets.top + 52;

  const [isEditing, setIsEditing] = useState(false);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetContent, setSheetContent] = useState<'custom' | 'suggest' | 'generate' | null>(null);
  const [customQuoteText, setCustomQuoteText] = useState('');
  const [generateBrandName, setGenerateBrandName] = useState('');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const handlePriceChange = useCallback((id: string, val: string) => {
    setCategories(prev => prev.map(cat => ({ ...cat, services: cat.services.map(s => s.id === id ? { ...s, price: val } : s) })));
  }, []);

  const handleDescriptionChange = useCallback((id: string, val: string) => {
    setCategories(prev => prev.map(cat => ({ ...cat, services: cat.services.map(s => s.id === id ? { ...s, description: val } : s) })));
  }, []);

  const handleDeleteService = useCallback((id: string) => {
    setCategories(prev => prev.map(cat => ({ ...cat, services: cat.services.filter(s => s.id !== id) })));
  }, []);

  const handleAddService = useCallback((categoryKey: string) => {
    const newService: ServiceItem = { id: `new-${Date.now()}`, name: 'New Service', description: 'Description of deliverables and terms.', price: '$0', deliverables: 'TBD', timeline: 'TBD', usageRights: 'TBD', revisions: 'TBD' };
    setCategories(prev => prev.map(cat => cat.key === categoryKey ? { ...cat, services: [...cat.services, newService] } : cat));
  }, []);

  const openSheet = (content: 'custom' | 'suggest' | 'generate') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSheetContent(content);
    setSheetVisible(true);
  };

  const closeSheet = () => { setSheetVisible(false); setSheetContent(null); };

  async function handleShareLink() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try { await Share.share({ message: 'My Rate Card: https://kanext.app/@marcusj/ratecard' }); } catch {}
  }

  const renderSheetBody = () => {
    if (sheetContent === 'custom') return (
      <View style={{ paddingBottom: 32 }}>
        <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 16 }}>Opening Dipson to draft a custom quote...</Text>
        <TextInput value={customQuoteText} onChangeText={setCustomQuoteText} placeholder="Describe what you're looking for..." placeholderTextColor={C.secondary} multiline style={{ backgroundColor: C.surface, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, padding: 12, fontSize: 14, color: C.label, minHeight: 100, marginBottom: 16, textAlignVertical: 'top' }} />
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); closeSheet(); }} style={{ backgroundColor: C.label, borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.bg }}>Send to Dipson</Text>
        </Pressable>
      </View>
    );

    if (sheetContent === 'suggest') return (
      <View style={{ paddingBottom: 32 }}>
        <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 20 }}>Dipson is analyzing your follower count, engagement rate, niche, and industry benchmarks...</Text>
        {[100, 80, 90, 70].map((w, i) => (
          <View key={i} style={{ height: 14, width: `${w}%`, backgroundColor: C.separator, borderRadius: 7, marginBottom: 10, opacity: 0.6 }} />
        ))}
        <View style={{ marginTop: 12, backgroundColor: C.surface, borderRadius: 10, padding: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}>
          <Text style={{ fontSize: 13, color: C.secondary, textAlign: 'center' }}>Coming Soon — Rate intelligence is in development.</Text>
        </View>
      </View>
    );

    if (sheetContent === 'generate') return (
      <View style={{ paddingBottom: 32 }}>
        <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 16 }}>Dipson will tailor a version of your rate card for a specific brand.</Text>
        <TextInput value={generateBrandName} onChangeText={setGenerateBrandName} placeholder="Brand name..." placeholderTextColor={C.secondary} style={{ backgroundColor: C.surface, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, padding: 12, fontSize: 14, color: C.label, marginBottom: 16 }} />
        <Pressable onPress={() => { if (generateBrandName.trim()) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setGenerateBrandName(''); closeSheet(); } }} style={{ backgroundColor: C.label, borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.bg }}>Generate</Text>
        </Pressable>
      </View>
    );

    return null;
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* Top Bar */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, height: topBarH, paddingTop: insets.top, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator, backgroundColor: C.bg }}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.back(); }} hitSlop={8} style={{ width: 44, alignItems: 'flex-start' }}>
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <View style={{ backgroundColor: C.label, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 5 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.bg }}>Rate Card</Text>
          </View>
        </View>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIsEditing(v => !v); }} hitSlop={8} style={{ width: 44, alignItems: 'flex-end' }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{isEditing ? 'Done' : 'Edit'}</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingTop: topBarH + 8, paddingBottom: insets.bottom + 80 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Creator Profile Card */}
        <View style={{ backgroundColor: C.surface, borderRadius: 16, padding: 20, marginHorizontal: 16, marginBottom: 4, marginTop: 8, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: C.label }}>Marcus Johnson</Text>
          <Text style={{ fontSize: 13, color: C.secondary, marginTop: 2 }}>@marcusj · 47.2K followers</Text>
          <Text style={{ fontSize: 14, color: C.label, marginTop: 8, lineHeight: 20 }}>Sports, culture, and entrepreneurship content for 18–34 professionals.</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }} contentContainerStyle={{ gap: 8 }}>
            {['4.8% engagement', '94K avg reach', '3.2M total impressions'].map(stat => (
              <View key={stat} style={{ backgroundColor: C.bg, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}>
                <Text style={{ fontSize: 12, color: C.secondary, fontWeight: '500' }}>{stat}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Service Categories */}
        {categories.map(category => (
          <View key={category.key}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 0.6, marginTop: 16, marginBottom: 8, marginHorizontal: 16 }}>{category.label}</Text>
            {category.services.map(service => (
              <ServiceCard key={service.id} service={service} isEditing={isEditing} C={C} onPriceChange={handlePriceChange} onDescriptionChange={handleDescriptionChange} onDelete={handleDeleteService} />
            ))}
            {isEditing && (
              <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); handleAddService(category.key); }} style={{ marginHorizontal: 16, marginBottom: 8, paddingVertical: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
                <IconSymbol name="plus" size={14} color={C.secondary} />
                <Text style={{ fontSize: 14, color: C.secondary, fontWeight: '500' }}>Add Service</Text>
              </Pressable>
            )}
          </View>
        ))}

        {/* Custom Packages */}
        <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginHorizontal: 16, marginTop: 16, marginBottom: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}>
          <Text style={{ fontSize: 14, color: C.label, marginBottom: 12 }}>Custom packages available on request</Text>
          <Pressable onPress={() => openSheet('custom')} style={({ pressed }) => ({ backgroundColor: C.label, borderRadius: 12, paddingVertical: 12, alignItems: 'center', opacity: pressed ? 0.8 : 1 })}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: C.bg }}>Request Custom Quote</Text>
          </Pressable>
        </View>

        {/* Dipson Actions */}
        <View style={{ backgroundColor: C.surface, borderRadius: 14, marginHorizontal: 16, marginBottom: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, padding: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
            <IconSymbol name="sparkles" size={14} color={C.secondary} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.secondary }}>Dipson Actions</Text>
          </View>
          {[
            { label: 'Suggest Rates with Dipson',      action: () => openSheet('suggest')  },
            { label: 'Generate Rate Card for Brand',   action: () => openSheet('generate') },
          ].map((item, i) => (
            <Pressable key={item.label} onPress={item.action} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', padding: 14, borderTopWidth: i > 0 ? StyleSheet.hairlineWidth : 0, borderTopColor: C.separator, gap: 10, opacity: pressed ? 0.7 : 1 })}>
              <IconSymbol name="sparkles" size={18} color={C.label} />
              <Text style={{ fontSize: 15, fontWeight: '600', color: C.label, flex: 1 }}>{item.label}</Text>
              <IconSymbol name="chevron.right" size={14} color={C.secondary} />
            </Pressable>
          ))}
        </View>

        {/* Share Actions */}
        <View style={{ backgroundColor: C.surface, borderRadius: 14, marginHorizontal: 16, marginBottom: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator, overflow: 'hidden' }}>
          {[
            { icon: 'square.and.arrow.down', label: 'Download PDF',  action: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) },
            { icon: 'link',                  label: 'Copy Link',      action: handleShareLink },
            { icon: 'rectangle.stack',       label: 'Embed in Hub',   action: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light) },
          ].map((item, i) => (
            <Pressable key={item.label} onPress={item.action} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', padding: 14, borderTopWidth: i > 0 ? StyleSheet.hairlineWidth : 0, borderTopColor: C.separator, gap: 12, opacity: pressed ? 0.7 : 1 })}>
              <IconSymbol name={item.icon as any} size={18} color={C.label} />
              <Text style={{ fontSize: 15, color: C.label, flex: 1 }}>{item.label}</Text>
              <IconSymbol name="chevron.right" size={14} color={C.secondary} />
            </Pressable>
          ))}
        </View>

      </ScrollView>

      <BottomSheet visible={sheetVisible} onClose={closeSheet} useModal title={sheetContent === 'custom' ? 'Custom Quote' : sheetContent === 'suggest' ? 'Suggest Rates' : 'Generate for Brand'}>
        {renderSheetBody()}
      </BottomSheet>

    </View>
  );
}
