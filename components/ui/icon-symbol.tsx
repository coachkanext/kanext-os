// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

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

  // Actions
  'paperplane.fill': 'send',
  'arrow.up': 'arrow-upward',
  'xmark': 'close',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',

  // User
  'person.fill': 'person',
  'person.circle.fill': 'account-circle',
  'person.badge.plus': 'person-add',

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
} as IconMapping;

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
  const mappedName = MAPPING[name];
  if (!mappedName) {
    console.warn(`IconSymbol: No mapping found for "${name}"`);
    return <MaterialIcons color={color} size={size} name="help-outline" style={style} />;
  }
  return <MaterialIcons color={color} size={size} name={mappedName} style={style} />;
}
