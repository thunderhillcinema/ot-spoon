import Svg, { Defs, Pattern, Rect, RadialGradient, Stop } from "react-native-svg";
import { View } from "react-native";

// CRT screen overlay (THC on-air). Lays scanlines + a glass glare + a tube
// vignette over a video thumbnail so the couch tiles read as broadcast CRTs
// rather than flat posters. Purely visual + pointer-transparent; renders on web
// (TV-preview) and native via react-native-svg. Sized to the thumbnail (16:9).
export const CrtScreen = ({ width, height }: { width: number; height: number }) => {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: w,
        height: h,
        borderRadius: 8,
        overflow: "hidden",
        zIndex: 4,
      }}
    >
      <Svg width={w} height={h}>
        <Defs>
          {/* Horizontal scanlines — one dark 1px line every 3px. */}
          <Pattern id="thc-scan" width={String(w)} height="3" patternUnits="userSpaceOnUse">
            <Rect x="0" y="0" width={String(w)} height="1" fill="#000000" opacity="0.38" />
          </Pattern>
          {/* Glass glare — soft highlight, upper-left. */}
          <RadialGradient id="thc-glare" cx="30%" cy="16%" r="72%">
            <Stop offset="0" stopColor="#ffffff" stopOpacity="0.13" />
            <Stop offset="0.62" stopColor="#ffffff" stopOpacity="0" />
          </RadialGradient>
          {/* Tube vignette — darkens toward the edges/corners. */}
          <RadialGradient id="thc-vig" cx="50%" cy="52%" r="78%">
            <Stop offset="0.52" stopColor="#000000" stopOpacity="0" />
            <Stop offset="1" stopColor="#000000" stopOpacity="0.6" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={String(w)} height={String(h)} fill="url(#thc-scan)" />
        <Rect x="0" y="0" width={String(w)} height={String(h)} fill="url(#thc-glare)" />
        <Rect x="0" y="0" width={String(w)} height={String(h)} fill="url(#thc-vig)" />
      </Svg>
    </View>
  );
};
