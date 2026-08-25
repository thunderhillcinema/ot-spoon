import { Platform } from "react-native";

// The "Couch UI" — a streamlined on-air / broadcast 10-foot restyle of the TV
// layout. It is an OPT-IN customization: a branded app enables it at build time
// with EXPO_PUBLIC_TV_ON_AIR_THEME=1 (like any other .customizations flag). A
// vanilla TV build is therefore unchanged — the couch look never turns on unless
// an instance asked for it. See docs/customizations.md and thc/COUCH_UI.md.
//
// The 10-foot VISUAL treatments (card scale, glow, sizing, hero, CRT styling)
// are RN styles that also render on web via react-native-web — so the couch
// design can be iterated in the fast/free web preview instead of a slow native
// build. Set EXPO_PUBLIC_TV_PREVIEW=1 when running `npm run web` to see them; the
// preview implies the on-air theme (previewing the couch look is opting into it).
//
// IS_TV_LAYOUT gates VISUAL treatments only (safe on both web and TV). The native
// focus ENGINE (D-pad events, TVFocusGuideView) still keys on Platform.isTV — do
// NOT route that through this flag.

// Pure derivations, extracted so the opt-in semantics can be unit-tested without
// juggling process.env / Platform at module load. See tvPreview.test.ts.
export const computeOnAirTheme = ({ onAir, preview }: { onAir: boolean; preview: boolean }): boolean =>
  onAir || preview;

export const computeIsTvLayout = ({
  isTV,
  preview,
  onAir,
}: {
  isTV: boolean;
  preview: boolean;
  onAir: boolean;
}): boolean => (isTV || preview) && computeOnAirTheme({ onAir, preview });

const IS_TV_PREVIEW = process.env.EXPO_PUBLIC_TV_PREVIEW === "1";
const IS_ON_AIR_THEME_OPT_IN =
  process.env.EXPO_PUBLIC_TV_ON_AIR_THEME === "1" || process.env.EXPO_PUBLIC_TV_ON_AIR_THEME === "true";

export const IS_TV_LAYOUT = computeIsTvLayout({
  isTV: Platform.isTV,
  preview: IS_TV_PREVIEW,
  onAir: IS_ON_AIR_THEME_OPT_IN,
});

// True only in the web preview: used to drive focus state from hover, since the
// browser has no D-pad to move TV focus.
export const IS_TV_PREVIEW_WEB = Platform.OS === "web" && IS_TV_PREVIEW;
