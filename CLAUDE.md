# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev      # Start development server on http://localhost:3000
npm run build    # Create production build
npm start        # Run production server (requires build first)
npm run lint     # Run ESLint with Next.js TypeScript rules
```

## Technology Stack

- **Next.js 16.1.6** with App Router and React 19
- **TypeScript** with strict mode, path alias `@/*` → `./src/*`
- **Tailwind CSS 4.0** via @tailwindcss/postcss
- **Framer Motion 12** for scroll-based animations
- **GSAP 3.14** for timeline animations
- **Lenis 1.3** for smooth scrolling
- **Three.js 0.182** + @react-three/fiber 9.5 (installed but not currently used)
- **Zustand 5** for state management

## Architecture

### Component Hierarchy
```
RootLayout (layout.tsx - server component)
  └── SmoothScrolling (Lenis provider)
      └── Home (page.tsx - client component)
          ├── KeyboardScroll (frame animation)
          └── AgendaGallery (scroll-snap gallery)
```

### Key Patterns

**Smooth Scrolling (SmoothScrolling.tsx)**
- Wraps app with Lenis instance running continuous RAF loop
- Custom easing: `Math.min(1, 1.001 - Math.pow(2, -10 * t))`
- 0.8s duration, wheel multiplier 1, touch multiplier 2

**Frame Animation (KeyboardScroll.tsx)**
- Preloads 192 PNG frames from `/public/hero-animation/` (5-digit padding: 00001.png - 00192.png)
- Maps Framer Motion `scrollYProgress` to frame index via `useTransform`
- Canvas rendering with device pixel ratio scaling and RAF debouncing
- Shows loading progress while frames preload

**Gallery (AgendaGallery.tsx)**
- CSS scroll-snap for full-screen agenda sections
- Next.js Image component with priority loading for first 2 images

### Key Configuration Points

| Setting | Location | Current Value |
|---------|----------|---------------|
| Frame count | `KeyboardScroll.tsx` | `FRAME_COUNT = 192` |
| Frame path | `KeyboardScroll.tsx` | `/hero-animation/{i}.png` |
| Scroll duration | `SmoothScrolling.tsx` | `0.8` seconds |
| Agenda images | `AgendaGallery.tsx` | Array of 6 items |

## Project Structure

```
src/
├── app/
│   ├── layout.tsx      # Root layout with Lenis wrapper, Geist fonts
│   ├── page.tsx        # Main page orchestrating components
│   └── globals.css     # Tailwind config + scroll/canvas styles
├── components/
│   ├── KeyboardScroll.tsx   # Frame-by-frame scroll animation
│   ├── AgendaGallery.tsx    # Snap-scroll image gallery
│   └── SmoothScrolling.tsx  # Lenis smooth scroll provider
└── store/
    └── useStore.ts     # Zustand counter state (template)
public/
├── hero-animation/     # 192 PNG frames (~4.1MB each)
└── agenda/             # 6 agenda images + avatar assets
```

## Performance Notes

- Hero animation frames are large (~800MB total) - consider lazy loading for production
- Canvas uses GPU acceleration hints (`will-change: contents`, `translateZ(0)`)
- All page components are client-side (`'use client'`) due to scroll interactivity
