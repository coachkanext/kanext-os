# KaNeXT Design System - Color Specification

## FOR CLAUDE CODE: This applies to EVERY screen, EVERY component, EVERY view in the entire KaNeXT app. No exceptions. No screen gets its own color palette. No component overrides these values. This is the law.

---

## Philosophy

KaNeXT is a luxury institutional operating system. The design language is monochrome. No accent color. No brand color splashed across the UI. The product speaks through typography, spacing, and hierarchy. Color is used only for semantic meaning (money went up, something needs attention). Everything else is black, white, and gray.

Think Bottega Veneta. Think Aesop. Think a $200 coffee table book. The interface should feel like premium print design that happens to be interactive.

---

## The KaNeXT Palette

### Light Mode

| Name | Hex | Usage |
|---|---|---|
| Paper | #FFFFFF | Primary background. The canvas everything sits on. |
| Linen | #F5F0EA | Surface cards, tile backgrounds, elevated containers, input fields. Warm off-white. |
| Mist | #E0DBD4 | Borders, dividers, separator lines, inactive toggle tracks, tile outlines. |
| Drift | #9C9790 | Secondary text (timestamps, labels, captions, placeholders). Inactive footer icons. Disabled states. |
| Carbon | #1A1714 | Primary text. Active icons. Tappable elements. Buttons. Active footer icons. Everything the user should see first. |
| Ember | #8B2500 | ONLY for live/urgent indicators. Pulse badge count. Live game dot. Critical system alerts. Appears sparingly. If Ember is everywhere, you are using it wrong. |

### Dark Mode

| Name | Hex | Usage |
|---|---|---|
| Paper | #1C1410 | Primary background. |
| Linen | #261D17 | Surface cards, tile backgrounds, elevated containers. |
| Mist | #3D352E | Borders, dividers, separator lines. |
| Drift | #8A837C | Secondary text, inactive icons, disabled states. |
| Carbon | #F0E8DC | Primary text, active icons, tappable elements, buttons. |
| Ember | #E08B6A | Live/urgent indicators only. Same restraint as light mode. |

---

## Semantic Colors (Status Only)

These appear ONLY when communicating a specific data state. They are never decorative. They are never used for buttons, backgrounds, or branding. They appear inside data displays only.

| Name | Light Hex | Dark Hex | Usage |
|---|---|---|---|
| Gain | #5A8A6E | #6B9E80 | Positive financial data (revenue up, profit, confirmed, success). |
| Heat | #B85C5C | #D47A7A | Negative financial data (loss, decline, overdue, error). |
| Caution | #B8943E | #D4AE5A | Warning states (pending, approaching deadline, needs review). |

### Rules for semantic colors:
- ONLY used on numbers, status badges, and status indicators
- NEVER used on buttons
- NEVER used on backgrounds (no green success banners, no red error backgrounds)
- NEVER used on text that is not a data value or status label
- The text next to the number stays Carbon or Drift. Only the number/indicator itself gets the semantic color.

---

## Interactive Element Rules

There is no accent color. Interactivity is communicated through weight, contrast, and hierarchy. NOT color.

### How the user knows something is tappable:

1. **Buttons**: Carbon background, Paper text. Rounded rectangle. Full contrast. The button is the darkest element on the screen. You cannot miss it.

2. **Secondary buttons**: Paper background, Carbon border (1px Mist), Carbon text. Lighter than primary but still clearly a button through shape.

3. **Text links**: Carbon text, underlined. No color change. The underline communicates tappability.

4. **Tile icons**: Carbon when active/tappable. Drift when inactive/disabled. Weight difference communicates state.

5. **Footer icons**: Carbon (filled) when active. Drift (outline) when inactive. No color. Monochrome only.

6. **Toggle switches**: Carbon track when on, Mist track when off. Paper circle thumb.

7. **Progress bars**: Carbon fill on Mist track. No blue. No green.

8. **Input fields**: Linen background, Mist border. Carbon text when filled. Drift placeholder text. Carbon border on focus (border goes from Mist to Carbon, that is the focus indicator).

9. **Cards and tiles**: Linen background, Mist border. Tapping takes you somewhere. The card shape itself communicates interactivity.

10. **Lists and rows**: Tappable rows have a Carbon chevron (>) on the right. Non-tappable rows do not.

---

## Typography Color Rules

- **Headlines, titles, names**: Carbon. Always.
- **Body text, descriptions**: Carbon.
- **Secondary labels** (timestamps, "11h ago", "Q1 2026", subtitles): Drift.
- **Placeholders**: Drift.
- **Disabled text**: Drift at 50% opacity.
- **Data values that are positive**: Gain.
- **Data values that are negative**: Heat.
- **Data values that are neutral**: Carbon.

---

## Component-Specific Rules

### Navigation Bar
- Background: Paper
- Title text: Carbon
- Back arrow: Carbon
- Right action icons: Carbon

### Footer (Tab Bar)
- Background: Paper
- Active icon: Carbon, filled variant
- Inactive icon: Drift, outline variant
- No labels on footer icons
- No color on any footer icon ever
- Divider line above footer: Mist

### Brand Pill (top of Route screen)
- Background: Linen
- Border: Mist
- Text: Carbon
- Chevron: Drift

### Tiles (3x3 grid)
- Shape: Squircle (1:1 aspect ratio, borderCurve continuous, borderRadius 20)
- Background: Linen
- Border: Mist (0.5px)
- Icon: Carbon
- Label below tile: Carbon
- No colored icons. All icons are Carbon.

### KayTV Player (top of Route screen)
- Full bleed video, no rounded corners at top
- Scoreboard overlay: standard broadcast graphics (these come from the broadcast, not our design system)
- "Open KayTV" button: Paper text on semi-transparent Carbon background
- Mute icon: Paper on semi-transparent Carbon circle

### Hub Overview Card (Business mode dashboard)
- Card background: Carbon (this is the ONE place a dark card appears in light mode)
- Card text: Paper
- Financial pills inside card: Paper text on semi-transparent Paper/10% background
- This creates the premium "black card" effect for the main business dashboard

### Pulse (Unified Inbox)
- Section headers ("NEEDS ATTENTION", "MESSAGES", "UPCOMING"): Drift, uppercase, small
- Avatar circles: Use the brand's assigned color (each brand gets one color at creation for its avatar, this is the ONLY place non-palette colors appear)
- Unread indicator dot: Carbon
- Action buttons ("Call Back", "Reply"): Carbon background, Paper text
- Message preview text: Drift
- Sender name: Carbon
- Timestamp: Drift

### Nexus (AI Chat)
- Background: Paper
- User messages: Carbon background, Paper text (right aligned)
- Nexus messages: Linen background, Carbon text (left aligned)
- Input field: Linen background, Mist border, Carbon text
- Send button: Carbon
- The Nexus N sparkle icon: Carbon

### KayPay
- Balance display: Carbon text, large
- Transaction amounts positive: Gain
- Transaction amounts negative: Heat
- Send/Request buttons: Carbon background, Paper text
- Card visualization: Carbon background with Linen details (the "black card")

### Charts and Graphs
- Bar fills: Carbon
- Active/current period bar: Carbon at 100% opacity
- Past period bars: Carbon at 30% opacity (creates the gray-to-black progression seen in current Hub)
- Line charts: Carbon stroke
- Axis labels: Drift
- Grid lines: Mist

### Badges and Counts
- Notification badge: Ember background, Paper text. This is the ONLY place Ember appears on most screens.
- Unread count: Ember
- Live indicator dot: Ember

---

## What This Means for Every Screen

### Route Screen (Home)
- Paper background
- KayTV video player at top (full bleed)
- Brand pill: Linen/Mist/Carbon
- 9 tiles: Linen squircles with Carbon icons
- Footer: Carbon active, Drift inactive

### Hub (any mode)
- Paper background
- Overview tab dropdown: Carbon text
- Role pill: Carbon background, Paper text
- Dashboard card (business): Carbon background with Paper text
- Stats: Carbon values, Drift labels
- Charts: Carbon bars on Mist tracks
- Project progress: Carbon fill on Mist track

### Agenda
- Paper background
- Date headers: Carbon
- Event cards: Linen background, Carbon title, Drift time
- Today indicator: Carbon dot or Carbon left border

### Social
- Paper background
- Post cards: Linen
- Author name: Carbon
- Post text: Carbon
- Timestamp: Drift
- Like/comment icons: Drift (Carbon when active/filled)

### Roster / Team / People tiles
- Paper background
- Player/person cards: Linen
- Name: Carbon
- Role/position: Drift
- KR badge (sports): Carbon background, Paper text
- Stats: Carbon values, Drift labels

### Recruits / Pipeline / Inquiries
- Paper background
- Pipeline stages: Carbon headers
- Cards: Linen with Carbon titles
- Status indicators: Gain/Heat/Caution for lead status

### Booster / Store / Earn / Give
- Paper background
- Product cards: Linen
- Prices: Carbon
- Buy/Give buttons: Carbon background, Paper text
- Progress bars (goals, pledges): Carbon on Mist

### KayTV
- Video player: full bleed, native video controls
- Channel list: Paper background, Carbon titles, Drift metadata
- Live badge: Ember

### KayPay
- Paper background
- Balance: Carbon, large
- Transaction list: Carbon amounts (Gain for received, Heat for sent)
- Action buttons: Carbon

### KayStudios
- Paper background
- Game cards: Linen
- Game titles: Carbon
- Play buttons: Carbon background, Paper text

### Settings
- Paper background
- Section headers: Drift
- Setting rows: Carbon label, Drift value, Carbon chevron
- Toggle switches: Carbon on, Mist off
- Destructive actions (delete, sign out): Heat text. The ONLY place Heat appears outside financial data.

---

## Brand Avatar Colors

Every brand created in KaNeXT gets assigned ONE color for its avatar circle. This is used ONLY in Pulse, Messages, and anywhere brand avatars appear in lists. These colors are NOT part of the UI palette. They exist solely to differentiate brands visually in multi-brand contexts.

The brand color options are muted, premium tones:
- Navy (#1B2A4A)
- Burgundy (#6B2D3E)
- Forest (#2D4A3B)
- Slate (#4A4A5A)
- Clay (#7A5C4F)
- Indigo (#3B3B6B)

The user selects one during brand creation. It appears ONLY inside the circular avatar. Nowhere else.

---

## Absolute Prohibitions

1. NO blue anywhere in the UI (no buttons, no links, no progress bars, no icons)
2. NO gradients on any UI element (the Hub dashboard card is solid Carbon, not gradient)
3. NO colored icon sets (all icons are Carbon or Drift, never colored)
4. NO colored backgrounds on sections or headers
5. NO colored borders except Mist
6. NO shadows heavier than 2px blur at 5% opacity
7. NO neon, glow, or high-saturation colors anywhere
8. Ember appears ONLY on badge counts and live indicators. If you are putting Ember on a button, a background, a border, or text, STOP.
9. Semantic colors (Gain/Heat/Caution) appear ONLY on data values and status indicators. If you are putting them on a button, a card background, or a section header, STOP.
10. The ONLY dark-background element in light mode is the Hub Overview dashboard card and KayPay card visualization. Everything else is Paper/Linen.

---

## Implementation Notes for SwiftUI

```swift
// KaNeXT Design System Colors
extension Color {
    // Core Palette - Light
    static let kPaper = Color(hex: "#FFFFFF")
    static let kLinen = Color(hex: "#F5F0EA")
    static let kMist = Color(hex: "#E0DBD4")
    static let kDrift = Color(hex: "#9C9790")
    static let kCarbon = Color(hex: "#1A1714")
    static let kEmber = Color(hex: "#8B2500")
    
    // Core Palette - Dark
    static let kPaperDark = Color(hex: "#1C1410")
    static let kLinenDark = Color(hex: "#261D17")
    static let kMistDark = Color(hex: "#3D352E")
    static let kDriftDark = Color(hex: "#8A837C")
    static let kCarbonDark = Color(hex: "#F0E8DC")
    static let kEmberDark = Color(hex: "#E08B6A")
    
    // Semantic
    static let kGain = Color(hex: "#5A8A6E")
    static let kHeat = Color(hex: "#B85C5C")
    static let kCaution = Color(hex: "#B8943E")
}
```

Use `@Environment(\.colorScheme)` to switch between light and dark palette values. Every color reference in the app should use these constants. No hardcoded hex values anywhere in view code.
