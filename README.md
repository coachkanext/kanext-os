# KaNeXT OS

**KaNeXT OS is the application layer of KaNeXT's governed institutional operating system.**  
It is built around a deep intelligence architecture that helps institutions think better, operate better, grow faster, and capture more value from the activity they already produce.

KaNeXT is not a single sports app, a single school tool, or a generic AI wrapper. It is a multi-mode operating environment with a governed intelligence layer underneath it. The core hierarchy is:

- **The intelligence architecture is the core asset and moat**
- **Dipson is the interface to that intelligence**
- **The OS/app is the delivery environment**
- **The rails (KPay, KTV, VoIP, and related infrastructure) monetize and distribute the system**
- **The mandate, FMU, and network-school strategy validate and scale it**

This framing is the clearest description of the broader KaNeXT system and how the app fits inside it. Sports is the first proving ground, especially basketball, but the architecture is designed to extend across institutions, communications, media, finance, and operations.  
Source framing: the uploaded KaNeXT product/system docs describe KaNeXT as a governed institutional operating system whose intelligence architecture is the core moat, Dipson is the interface, the OS is the delivery environment, and the rails plus school-network strategy monetize, validate, and scale the system :contentReference[oaicite:0]{index=0}.

---

## What KaNeXT OS Is

KaNeXT OS is a **multi-mode institutional operating system** that allows a user to move across multiple brands, roles, and institutional contexts inside one governed environment.

The five core modes are:

- **Athletics**
- **Education**
- **Business**
- **Community**
- **Personal**

The product is not meant to be understood as "an app with many tiles." It is meant to be understood as:

- a front-facing digital home for institutions,
- an operating environment for daily workflows,
- a financial and media infrastructure layer,
- and a governed interface into a deep intelligence system :contentReference[oaicite:1]{index=1}.

The product knowledge base defines the visible product surface around:
- brands as the primary switching unit,
- role-based access control,
- a 3x3 home grid,
- Dipson as the intelligence and execution interface,
- and universal rails such as KTV, KPlay, and KPay :contentReference[oaicite:2]{index=2}.

---

## Demo and Live

KaNeXT OS is intentionally built around **two operating contexts**: **Demo** and **Live**.

### Demo
Demo is the **high-fidelity product environment**. It exists to show the full architecture working across modes, brands, and roles.

In Demo:
- screens are populated,
- RBAC contrasts are visible,
- interactions are live,
- users can switch brands and modes,
- videos and media surfaces are populated,
- and feature depth is shown in a way that makes the full system legible.

The product knowledge base explicitly defines Demo as the curated environment used to show every capability of the OS at scale, with role contrast and loaded data across the system :contentReference[oaicite:3]{index=3}.

### Live
Live is the **real deployed product context**.

In Live:
- brands use real data,
- the interface reflects the actual state of rollout,
- and some surfaces are intentionally more sparse than Demo because they represent reality, not a fully staged walkthrough.

The product knowledge base explicitly frames Live as the real app state and the honest counterpart to Demo, with the contrast between the two meant to prove both vision and reality :contentReference[oaicite:4]{index=4}.

### Why this matters
KaNeXT should not be described as either:
- "just mockups," or
- "everything is fully deployed equally."

The more accurate statement is:

**KaNeXT OS has a fully defined system architecture, a high-fidelity interactive Demo environment that shows complete mode and RBAC behavior, and Live deployments that operate real brand contexts while deeper infrastructure continues to roll out.**

---

## Current Product State

### Working now
Based on the current product definition and UI shared in this workspace, the system already includes:

- brand-based navigation
- Demo / Live switching
- mode switching across the five core modes
- high-fidelity demo brands and role-based product views
- a unified home experience with the 3x3 tile system
- populated media/video surfaces
- Dipson in both Demo and Live
- live Business and Athletics contexts already being used as real product surfaces

### In progress / continuing rollout
Some infrastructure and live surfaces are still being deepened over time, including areas such as:

- live communication surfaces
- live wallet / payment depth
- broader live tile depth across all modes
- deeper rollout across institutional and rail layers

This repo should be understood as a **real product codebase for a governed institutional OS under active development**, not a blank starter app and not a finished end-state deployment.

---

## Why Basketball Matters

Basketball is one of the clearest proof domains for the KaNeXT intelligence architecture.

KaNeXT's basketball layer is not framed as simple descriptive analytics. It is framed as a governed reasoning system built around:
- normalization across levels and contexts,
- role-aware and system-aware evaluation,
- system fit,
- impact modifiers,
- counterfactual reasoning,
- team degradation from misuse or miscast roles,
- and player search across a normalized market :contentReference[oaicite:5]{index=5}.

The broader system overview also explicitly states that basketball is the **deepest flagship intelligence domain**, covering recruiting, roster construction, NIL and scholarship logic, archetypes, system fit, team intelligence, simulation, scouting, and downstream projections :contentReference[oaicite:6]{index=6}.

That matters because KaNeXT's moat is not only interface quality.  
It is the **intelligence architecture underneath the interface**.

---

## Core Architecture

The cleanest way to understand KaNeXT OS is through five layers:

### 1. Intelligence
The governed reasoning architecture is the core moat. It drives evaluation, fit, projections, simulation, and decision support across sports and institutional domains :contentReference[oaicite:7]{index=7}.

### 2. Dipson
Dipson is the user-facing interface to the intelligence system. It makes the deeper architecture queryable and eventually executable inside the governed environment :contentReference[oaicite:8]{index=8}.

### 3. Operating System
The app is the delivery environment where users experience brands, workflows, media, payments, communication, and role-based access.

### 4. Rails
KPay, KTV, VoIP, and related infrastructure are the monetization and distribution engines of the system. They are not the deepest moat, but they increase utility, retention, distribution, and data capture :contentReference[oaicite:9]{index=9}.

### 5. Proving / Scale Engines
FMU, the mandate strategy, and the broader school network are the live proving and expansion mechanisms for the system :contentReference[oaicite:10]{index=10}.

---

## Product Surface

The visible product surface is built around:

- a top-of-screen media experience
- a brand pill and brand drawer
- mode-aware and brand-aware navigation
- a universal 3x3 tile grid
- a persistent footer
- RBAC-governed screen depth
- Dipson as the central intelligence interface

The product knowledge base describes the app as one environment spanning multiple brands and modes, with tiles and role logic changing by institutional context while the system remains architecturally unified :contentReference[oaicite:11]{index=11}.

---

## Tech Stack

Current stack from `package.json`:

- **Expo**
- **React Native**
- **React 19**
- **Expo Router**
- **Supabase**
- **TanStack React Query**
- **React Navigation**
- **@gorhom/bottom-sheet**
- **Expo Video**
- **Expo Speech / Speech Recognition**
- **OpenAI SDK**

### Core dependencies
- `expo`
- `react`
- `react-native`
- `expo-router`
- `@supabase/supabase-js`
- `@tanstack/react-query`
- `@gorhom/bottom-sheet`
- `expo-video`
- `expo-speech`
- `expo-speech-recognition`
- `openai`

This is a cross-platform app targeting:
- **iOS**
- **Android**
- **Web**

---

## How to Run

Install dependencies:

```bash
npm install
```
