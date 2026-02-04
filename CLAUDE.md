# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KaNeXT OS is a cross-platform mobile application built with Expo and React Native. It targets iOS, Android, and web platforms using file-based routing with Expo Router.

## Commands

```bash
npm install          # Install dependencies
npm start            # Start Expo development server (or: npx expo start)
npm run ios          # Start on iOS simulator
npm run android      # Start on Android emulator
npm run web          # Start web version
npm run lint         # Run ESLint
npm run reset-project # Move starter code to app-example and create blank app directory
```

## Architecture

### File-Based Routing (Expo Router)

Routes are defined by file structure in `/app`:
- `_layout.tsx` files define navigation structure (Stack, Tabs)
- `(tabs)/` directory groups tab-based navigation screens
- Route names match filenames (e.g., `explore.tsx` → `/explore`)

### Theming System

The app uses a custom theming system with automatic light/dark mode support:
- **Colors/Fonts**: Defined in `/constants/theme.ts` with `Colors.light` and `Colors.dark` objects
- **useColorScheme()**: Hook from `/hooks/use-color-scheme.ts` detects system color scheme
- **useThemeColor()**: Hook from `/hooks/use-theme-color.ts` resolves colors based on current theme
- **ThemedText/ThemedView**: Themed wrapper components in `/components/`

### Platform-Specific Code

Platform variants use file suffixes:
- `.ios.tsx` for iOS-specific implementations
- `.web.ts` for web-specific implementations
- Default file used for Android and as fallback

Example: `icon-symbol.tsx` (default) vs `icon-symbol.ios.tsx` (iOS native SF Symbols)

### Path Aliases

TypeScript path alias configured: `@/*` maps to project root
```typescript
import { Colors } from '@/constants/theme';
```

## Key Directories

- `/app` - Screens and navigation (file-based routing)
- `/components` - Reusable React components
- `/components/ui` - UI primitives (icons, collapsibles)
- `/hooks` - Custom React hooks
- `/constants` - Theme colors and fonts
- `/assets/images` - App icons, splash screens, static images
- `/spec` - Product specification documents (Word format)

## Enabled Experiments

In `app.json`:
- `typedRoutes: true` - Type-safe route navigation
- `reactCompiler: true` - React Compiler optimizations
- `newArchEnabled: true` - React Native New Architecture
