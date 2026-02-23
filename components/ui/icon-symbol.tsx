// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

// Re-export the type for use in other components
export type { SymbolViewProps };

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  // Navigation
  'house.fill': 'home',
  'magnifyingglass': 'search',
  'sparkles': 'auto-awesome',
  'bell.fill': 'notifications',
  'building.2.fill': 'business',
  'building.2': 'business',

  // Actions
  'paperplane.fill': 'send',
  'arrow.up': 'arrow-upward',
  'arrow.right': 'arrow-forward',
  'xmark': 'close',
  'xmark.circle.fill': 'cancel',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'checkmark': 'check',
  'checkmark.circle.fill': 'check-circle',

  // User
  'person.fill': 'person',
  'person.circle.fill': 'account-circle',
  'person.badge.plus': 'person-add',
  'person.3.fill': 'groups',

  // Nexus
  'line.horizontal.3': 'menu',
  'doc.on.clipboard': 'assignment',
  'rectangle.stack': 'view-list',
  'mic.fill': 'mic',
  'plus': 'add',

  // Code / Dev
  'chevron.left.forwardslash.chevron.right': 'code',

  // Misc
  'gear': 'settings',
  'questionmark.circle': 'help-outline',
  'info.circle': 'info-outline',
  'info.circle.fill': 'info',
  'bookmark.fill': 'bookmark',
  'play.circle.fill': 'play-circle-filled',
  'chart.bar.fill': 'bar-chart',
  'arrow.up.arrow.down': 'swap-vert',
  'exclamationmark.triangle.fill': 'warning',

  // Stars / Ratings
  'star': 'star-border',
  'star.fill': 'star',
  'star.circle.fill': 'stars',

  // Donations & Support
  'crown.fill': 'emoji-events',
  'graduationcap.fill': 'school',
  'heart.fill': 'favorite',
  'envelope.fill': 'email',
  'phone.fill': 'phone',

  // Sports / Activities
  'whistle.fill': 'sports',
  'sportscourt.fill': 'sports-basketball',
  'airplane': 'flight',
  'ticket': 'confirmation-number',
  'ticket.fill': 'confirmation-number',
  'calendar': 'event',
  'calendar.badge.exclamationmark': 'event-busy',

  // Enterprise / Documents
  'briefcase.fill': 'work',
  'doc.fill': 'description',
  'doc.text.fill': 'article',
  'tablecells.fill': 'table-chart',
  'rectangle.stack.fill': 'layers',
  'link': 'link',
  'square.grid.2x2.fill': 'grid-view',
  'folder.fill': 'folder',
  'lock.fill': 'lock',
  'eye.fill': 'visibility',
  'eye.slash.fill': 'visibility-off',

  // Activity Icons
  'sportscourt': 'sports-basketball',
  'chart.bar': 'bar-chart',
  'calendar.badge.clock': 'schedule',
  'play.rectangle': 'play-arrow',
  'play.rectangle.fill': 'smart-display',
  'person.3': 'groups',
  'doc.badge.plus': 'note-add',
  'doc.badge.arrow.up': 'publish',
  'lightbulb': 'lightbulb',
  'gearshape': 'settings',
  'text.bubble': 'chat-bubble',
  'hands.sparkles': 'volunteer-activism',
  'hands.sparkles.fill': 'volunteer-activism',
  'heart': 'favorite-border',
  'calendar.badge.checkmark': 'event-available',
  'checkmark.seal': 'verified',
  'bell': 'notifications-none',

  // Church / Ministry Icons
  'map': 'map',
  'globe': 'public',
  'book.fill': 'menu-book',
  'music.note': 'music-note',
  'gift.fill': 'card-giftcard',
  'hand.raised.fill': 'pan-tool',
  'play.fill': 'play-arrow',
  'headphones': 'headphones',
  'figure.and.child.holdinghands': 'family-restroom',
  'building.columns.fill': 'account-balance',
  'dollarsign.circle.fill': 'attach-money',
  'arrow.triangle.2.circlepath': 'sync',
  'person.crop.circle.badge.plus': 'person-add-alt',
  'drop.fill': 'water-drop',
  'person.2.fill': 'people',
  'camera.fill': 'camera-alt',
  'bubble.left.fill': 'chat',
  'arrow.up.right': 'open-in-new',

  // Education / Archive Icons
  'archivebox': 'inventory-2',
  'archivebox.fill': 'inventory-2',
  'person.fill.questionmark': 'help-outline',
  'person.badge.shield.checkmark.fill': 'verified-user',
  'person.fill.checkmark': 'how-to-reg',
  'calendar.badge.plus': 'event',
  'stop.fill': 'stop',
  'checkmark.seal.fill': 'verified',
  'sun.max.fill': 'wb-sunny',
  'exclamationmark.triangle': 'warning-amber',

  // Sports / Game Actions
  'basketball.fill': 'sports-basketball',
  'square.and.arrow.up': 'share',
  'plus.circle.fill': 'add-circle',
  'tablecells': 'table-chart',

  // Live Ops
  'timer': 'timer',
  'arrow.uturn.backward': 'undo',
  'chevron.up': 'expand-less',
  'chevron.down': 'expand-more',

  // Video / Media
  'music.note.house': 'home',
  'film.stack': 'video-library',
  'plus.app.fill': 'add-box',
  'books.vertical.fill': 'library-books',
  'film': 'movie',
  'video.fill': 'videocam',
  'bubble.left.and.bubble.right.fill': 'forum',
  'list.bullet': 'format-list-bulleted',
  'figure.mind.and.body': 'self-improvement',

  // Program v2
  'wand.and.stars': 'auto-fix-high',
  'gearshape.fill': 'settings',
  'lock.shield.fill': 'admin-panel-settings',
  'slider.horizontal.3': 'tune',
  'mappin.and.ellipse': 'place',
  'circle.fill': 'circle',
  'shield.checkmark.fill': 'verified-user',
  'list.clipboard': 'assignment',
  'clock.fill': 'schedule',
  'flag.fill': 'flag',

  // Compliance / Tech
  'person.text.rectangle': 'badge',
  'car.fill': 'directions-car',
  'shield.checkered': 'security',
  'doc.text.magnifyingglass': 'find-in-page',

  // Avatar Drawer V3
  'flag.checkered': 'flag',
  'trophy.fill': 'emoji-events',
  'rectangle.portrait.and.arrow.right': 'logout',
  'shield.fill': 'shield',
  'doc.text': 'article',
  'square.grid.2x2': 'grid-view',
} as const;

export type IconSymbolName = keyof typeof MAPPING | SymbolViewProps['name'];

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const mappedName = (MAPPING as Record<string, string>)[name];
  if (!mappedName) {
    console.warn(`IconSymbol: No mapping found for "${name}"`);
    return <MaterialIcons color={color} size={size} name="help-outline" style={style} />;
  }
  return <MaterialIcons color={color} size={size} name={mappedName as ComponentProps<typeof MaterialIcons>['name']} style={style} />;
}
