import { Platform } from "react-native";

// TV-preview dev toggle (THC). The 10-foot VISUAL treatments (card scale, glow,
// sizing, hero, CRT styling) are RN styles that also render on web via
// react-native-web — so the couch design can be iterated in the fast/free web
// preview instead of a slow native build. Set EXPO_PUBLIC_TV_PREVIEW=1 when
// running `npm run web` to see them.
//
// IS_TV_LAYOUT gates VISUAL treatments only (safe on both web and TV). The native
// focus ENGINE (D-pad events, TVFocusGuideView) still keys on Platform.isTV — do
// NOT route that through this flag.
export const IS_TV_LAYOUT = Platform.isTV || process.env.EXPO_PUBLIC_TV_PREVIEW === "1";

// True only in the web preview: used to drive focus state from hover, since the
// browser has no D-pad to move TV focus.
export const IS_TV_PREVIEW_WEB = Platform.OS === "web" && process.env.EXPO_PUBLIC_TV_PREVIEW === "1";
