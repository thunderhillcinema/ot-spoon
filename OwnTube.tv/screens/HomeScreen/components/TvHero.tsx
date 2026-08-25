import { Animated, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { useEffect, useRef, useState } from "react";
import { Image } from "expo-image";

const AnimatedImage = Animated.createAnimatedComponent(Image);
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { Typography } from "../../../components";
import { CrtScreen, FocusGuide } from "../../../components/helpers";
import { borderRadius, spacing } from "../../../theme";
import { GetVideosVideo } from "../../../api/models";
import { ROUTES } from "../../../types";
import { IS_TV_LAYOUT, IS_TV_PREVIEW_WEB } from "../../../utils/tvPreview";

// On-air scrim — near-black fading up/right off the backdrop, for legibility.
const SCRIM = ["rgba(11,13,14,0.96)", "rgba(11,13,14,0.55)", "rgba(11,13,14,0)"] as const;

// The transparent stop the vignette gradients fade to.
const TRANSPARENT = "transparent";
// Neutral-state vignette: the tube sits a touch darker at its edges until focused.
const VIGNETTE = "rgba(0,0,0,0.72)";
const VIGNETTE_THICKNESS = 150;

// TvHero — the featured spotlight at the top of the couch home. Big backdrop +
// on-air "NOW SHOWING" kicker + title + channel. Clicking (or pressing SELECT on
// a remote) opens the video/destination.
export const TvHero = ({
  video,
  backend,
  compact,
  kicker = "NOW SHOWING",
  imageUrl,
  title,
  subtitle,
  onPress,
  initialFocus,
}: {
  video?: GetVideosVideo;
  backend?: string;
  compact?: boolean;
  kicker?: string;
  // Generic mode (playlists/channels/categories): supply a backdrop + labels
  // instead of a video.
  imageUrl?: string;
  title?: string;
  subtitle?: string;
  onPress?: () => void;
  // Claim the remote's initial focus on mount. Set on the PAGE hero only (the
  // couch home's content-first entry point) — never on the section heroes, or
  // they fight over first focus.
  initialFocus?: boolean;
}) => {
  const { colors } = useTheme();
  const { height } = useWindowDimensions();
  const router = useRouter();

  const [heroWidth, setHeroWidth] = useState(0);
  // "active" = the hero is the current focus target. On a real TV the native focus
  // engine drives this via onFocus/onBlur (a remote never fires hover); in the web
  // preview there's no D-pad, so hover stands in. Mirrors VideoGridCard.
  const [active, setActive] = useState(false);

  // One driver, 0 (neutral) → 1 (focused), fans out to every focus effect below.
  const focus = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(focus, {
      toValue: active ? 1 : 0,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [active, focus]);

  // The picture "tunes in": brightens and zooms slightly WITHIN its frame (the
  // hero clips via overflow:hidden, so nothing spills or shifts layout). The frame
  // staying put is what lets the amber glow bloom OUTWARD around a stable anchor.
  const imageBrightness = focus.interpolate({ inputRange: [0, 1], outputRange: [0.82, 1] });
  const imageScale = focus.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });
  // Vignette eases a touch as the tube tunes in, but stays PRESENT on focus — it
  // reinforces edge contrast so the brightened center and the amber glow pop.
  const vignetteOpacity = focus.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0.45] });

  const uri = imageUrl ?? video?.previewPath;
  const displayTitle = title ?? video?.name;
  const displaySubtitle = subtitle ?? video?.channel?.displayName;

  if (!uri && !displayTitle) return null;

  const heroHeight = compact ? Math.min(Math.round(height * 0.62), 560) : Math.min(Math.round(height * 0.52), 480);
  const source = uri ? { uri } : undefined;

  const handlePress =
    onPress ??
    (video ? () => router.navigate({ pathname: `/${ROUTES.VIDEO}`, params: { id: video.uuid, backend } }) : undefined);

  // Focus drives active on TV; hover drives it in the web preview.
  const handleFocus = () => setActive(true);
  const handleBlur = () => setActive(false);
  const handleHoverIn = () => {
    if (IS_TV_PREVIEW_WEB) setActive(true);
  };
  const handleHoverOut = () => {
    if (IS_TV_PREVIEW_WEB) setActive(false);
  };

  return (
    <Pressable
      hasTVPreferredFocus={IS_TV_LAYOUT && !!initialFocus}
      onPress={handlePress}
      onFocus={IS_TV_LAYOUT ? handleFocus : undefined}
      onBlur={IS_TV_LAYOUT ? handleBlur : undefined}
      onHoverIn={handleHoverIn}
      onHoverOut={handleHoverOut}
    >
      {/* The frame carries the outer inset (margins) AND is the positioned anchor
          for the glow, so the glow surrounds the hero even though the hero is
          inset. overflow stays visible so the bloom spills into the margin. */}
      <View style={styles.frame}>
        {/* Outward amber glow — the SAME staggered phosphor bloom the cards use
            (FocusGuide), sitting BEHIND the hero (zIndex -1) so it spills past the
            edges. Lives outside the hero's overflow:hidden as a sibling. */}
        {IS_TV_LAYOUT && active && heroWidth > 0 && <FocusGuide width={heroWidth} height={heroHeight} />}
        <View style={[styles.hero, { height: heroHeight }]} onLayout={(e) => setHeroWidth(e.nativeEvent.layout.width)}>
          <AnimatedImage
            source={source}
            style={[StyleSheet.absoluteFill, { opacity: imageBrightness, transform: [{ scale: imageScale }] }]}
            contentFit="cover"
            transition={200}
          />
          {heroWidth > 0 && <CrtScreen width={heroWidth} height={heroHeight} intensity={active ? 0.35 : 0.4} />}
          <LinearGradient
            colors={SCRIM}
            start={{ x: 0, y: 1 }}
            end={{ x: 0.9, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          {IS_TV_LAYOUT && (
            <>
              {/* Neutral vignette — darker at rest, recedes on focus. */}
              <Animated.View style={[styles.overlayFill, { opacity: vignetteOpacity }]} pointerEvents="none">
                <LinearGradient
                  colors={[VIGNETTE, TRANSPARENT] as const}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.vignetteTop}
                />
                <LinearGradient
                  colors={[TRANSPARENT, VIGNETTE] as const}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.vignetteBottom}
                />
                <LinearGradient
                  colors={[VIGNETTE, TRANSPARENT] as const}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.vignetteLeft}
                />
                <LinearGradient
                  colors={[TRANSPARENT, VIGNETTE] as const}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.vignetteRight}
                />
              </Animated.View>
              {/* Crisp amber border — the glow's innermost edge, on the tube itself. */}
              <Animated.View
                style={[styles.border, { borderColor: colors.theme500, opacity: focus }]}
                pointerEvents="none"
              />
            </>
          )}
          <View style={styles.content}>
            <View style={styles.kickerRow}>
              <View style={[styles.tally, { backgroundColor: colors.error500, shadowColor: colors.error500 }]} />
              <Typography style={styles.kicker} color={colors.theme500} fontWeight="ExtraBold">
                {kicker}
              </Typography>
            </View>
            <Typography
              style={styles.title}
              color={colors.white94}
              fontSize="sizeXL"
              fontWeight="ExtraBold"
              numberOfLines={2}
            >
              {displayTitle}
            </Typography>
            {!!displaySubtitle && (
              <Typography color={colors.white80} fontWeight="Medium" numberOfLines={1}>
                {displaySubtitle}
              </Typography>
            )}
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  border: {
    borderRadius: borderRadius.radiusMd,
    borderWidth: 2,
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 1,
  },
  content: { bottom: 0, gap: spacing.sm, left: 0, padding: spacing.xl, position: "absolute", right: 0, zIndex: 2 },
  // Inset on every side by ~the glow radius (matching the rows' 44px padding) so
  // the outward FocusGuide bloom has the SAME room to expand as it does around the
  // thumbnails, and isn't clipped by the sticky marquee above, the sidebar to the
  // left, or the screen edge. The frame (not the hero) carries the inset, and it
  // is the positioned anchor the glow surrounds. alignSelf:"stretch" (not
  // width:100%) lets the horizontal margins actually inset it.
  frame: {
    alignSelf: "stretch",
    marginBottom: spacing.xxl,
    marginHorizontal: spacing.xxl,
    marginTop: spacing.xxl,
  },
  hero: {
    borderRadius: borderRadius.radiusMd,
    justifyContent: "flex-end",
    overflow: "hidden",
    width: "100%",
  },
  kicker: { letterSpacing: 3 },
  kickerRow: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
  overlayFill: { bottom: 0, left: 0, position: "absolute", right: 0, top: 0, zIndex: 1 },
  tally: {
    borderRadius: 5,
    height: 10,
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    width: 10,
  },
  title: { lineHeight: 40, maxWidth: 760 },
  vignetteBottom: { bottom: 0, height: VIGNETTE_THICKNESS, left: 0, position: "absolute", right: 0 },
  vignetteLeft: { bottom: 0, left: 0, position: "absolute", top: 0, width: VIGNETTE_THICKNESS },
  vignetteRight: { bottom: 0, position: "absolute", right: 0, top: 0, width: VIGNETTE_THICKNESS },
  vignetteTop: { height: VIGNETTE_THICKNESS, left: 0, position: "absolute", right: 0, top: 0 },
});
