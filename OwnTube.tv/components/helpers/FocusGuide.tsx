import Svg, { Rect } from "react-native-svg";
import { useTheme } from "@react-navigation/native";
import { SvgProps } from "react-native-svg/src/elements/Svg";
import { StyleSheet, View } from "react-native";
import { useMemo } from "react";

// THC on-air focus GLOW (not a border): concentric amber strokes that fade
// outward approximate a soft phosphor glow around the focused CRT screen —
// portable (no SVG blur filter), renders on web + native.
const GLOW_LAYERS = [
  { spread: 0, strokeWidth: 3, opacity: 0.85 },
  { spread: 4, strokeWidth: 6, opacity: 0.45 },
  { spread: 9, strokeWidth: 10, opacity: 0.25 },
  { spread: 15, strokeWidth: 14, opacity: 0.13 },
  { spread: 22, strokeWidth: 18, opacity: 0.06 },
];
const PAD = 38; // room for the outermost, thickest layer (+ the base outset below)
// The innermost ring is inflated by OUTSET so the glow sits just OUTSIDE the
// thumbnail on every side. Without it the ring's rounded corner (rx 12) cuts
// inside the thumbnail's squarer corner (~8), and the tile pokes past the glow.
// At OUTSET 4 the inner ring is concentric with the thumbnail corner, one step
// larger — so it fully surrounds it.
const OUTSET = 4;

export const FocusGuide = ({ width, height }: SvgProps) => {
  const { colors } = useTheme();

  const dims = useMemo(() => {
    return { w: Number(width), h: Number(height) };
  }, [width, height]);

  return (
    <View style={styles.container} pointerEvents="none">
      <Svg width={dims.w + PAD * 2} height={dims.h + PAD * 2}>
        {GLOW_LAYERS.map((layer, i) => (
          <Rect
            key={i}
            x={PAD - OUTSET - layer.spread}
            y={PAD - OUTSET - layer.spread}
            width={dims.w + (OUTSET + layer.spread) * 2}
            height={dims.h + (OUTSET + layer.spread) * 2}
            rx={12 + layer.spread}
            ry={12 + layer.spread}
            fill="none"
            stroke={colors.theme500}
            strokeWidth={layer.strokeWidth}
            opacity={layer.opacity}
          />
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    left: -PAD,
    position: "absolute",
    top: -PAD,
    zIndex: -1,
  },
});
