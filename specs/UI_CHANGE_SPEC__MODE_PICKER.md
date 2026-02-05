# UI Change Spec — Mode Picker (First-Open Gate)

## Goal
Replace the current first-open Mode Picker screen with an ultra-minimal, institutional gate screen.

This is a VISUAL/UX change only. Do not change data models. Do not add new features.

## Current Behavior (must remain)
- On first open (no selected mode): show Mode Picker.
- After a mode is selected: app should skip Mode Picker on restart and go directly to the selected mode’s Home.
- Switching modes later happens inside the OS (not on this gate screen).

## New Mode Picker Requirements (FINAL)

### Layout
Screen contains ONLY:
1) KaNeXT logo at top (centered)
2) Four mode options with icon + label:
   - Sports (basketball icon)
   - Enterprise (briefcase icon)
   - Church (Orthodox cross icon)
   - Education (diploma icon)

No CTA button.
Tapping a mode immediately commits the mode and navigates forward.

### Explicitly remove from this screen
- No tagline / subtitle text
- No “What brought you here?”
- No “You can switch modes from profile”
- No footer / bottom tab bar
- No avatar/profile button
- No purple or mode accent colors
- No emojis as primary icons

### Styling
- Colors: black/white only.
- Optional gold accent allowed ONLY for subtle tap feedback.
- Typography: minimal, calm, institutional.
- Icons should be minimal/outline style (not emoji rendering).

### Interaction
- Tap = immediate select + navigate (no intermediate highlighted-only state).

## Implementation Notes
- Use the existing mode selection persistence mechanism currently in the app.
- Ensure bottom tab bar is not shown on this gate screen.
- If the current mode picker lives inside the Home tab screen, refactor so that this gate renders without the tab bar until a mode is chosen.

## Acceptance Criteria
- Fresh install / cleared state → app opens to the new minimal gate screen (no tab bar).
- Tap Sports/Enterprise/Church/Education → navigates into the app; tab bar appears after entry.
- Force quit + reopen after selecting a mode → opens directly into selected mode Home (skips gate).
- No purple visible on the gate screen.
- No extra text beyond the four labels.
