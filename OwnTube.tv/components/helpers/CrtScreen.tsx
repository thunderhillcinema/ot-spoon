import Svg, { Defs, Pattern, Rect, RadialGradient, Stop } from "react-native-svg";
import { View } from "react-native";
import { useId } from "react";

// CRT screen overlay (THC on-air). Lays scanlines + a glass glare + a tube
// vignette over a video thumbnail (or the hero) so it reads as a broadcast CRT
// rather than a flat image. Purely visual + pointer-transparent; renders on web
// (TV-preview) and native via react-native-svg. `intensity` scales the effect
// (1 = full card, ~0.4 = subtle hero). Ids are per-instance so multiple overlays
// on one page don't collide.
export const CrtScreen = ({ width, height, intensity = 1 }: { width: number; height: number; intensity?: number }) => {
  const w = Math.max(1, Math.round(width));
  const h = Math.max(1, Math.round(height));
  const uid = useId().replace(/:/g, "");
  const scanId = `scan-${uid}`;
  const glareId = `glare-${uid}`;
  const vigId = `vig-${uid}`;

  const scan = String(0.38 * intensity);
  const glare = String(0.13 * intensity);
  const vig = String(0.6 * intensity);

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
          <Pattern id={scanId} width={String(w)} height="3" patternUnits="userSpaceOnUse">
            <Rect x="0" y="0" width={String(w)} height="1" fill="#000000" opacity={scan} />
          </Pattern>
          {/* Glass glare — soft highlight, upper-left. */}
          <RadialGradient id={glareId} cx="30%" cy="16%" r="72%">
            <Stop offset="0" stopColor="#ffffff" stopOpacity={glare} />
            <Stop offset="0.62" stopColor="#ffffff" stopOpacity="0" />
          </RadialGradient>
          {/* Tube vignette — darkens toward the edges/corners. */}
          <RadialGradient id={vigId} cx="50%" cy="52%" r="78%">
            <Stop offset="0.52" stopColor="#000000" stopOpacity="0" />
            <Stop offset="1" stopColor="#000000" stopOpacity={vig} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={String(w)} height={String(h)} fill={`url(#${scanId})`} />
        <Rect x="0" y="0" width={String(w)} height={String(h)} fill={`url(#${glareId})`} />
        <Rect x="0" y="0" width={String(w)} height={String(h)} fill={`url(#${vigId})`} />
      </Svg>
    </View>
  );
};
