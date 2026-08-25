import { Animated, Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { useEffect, useRef, useState } from "react";
import { Image } from "expo-image";

const AnimatedImage = Animated.createAnimatedComponent(Image);
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { Typography } from "../../../components";
import { CrtScreen } from "../../../components/helpers";
import { spacing } from "../../../theme";
import { GetVideosVideo } from "../../../api/models";
import { ROUTES } from "../../../types";
import { IS_TV_LAYOUT, IS_TV_PREVIEW_WEB } from "../../../utils/tvPreview";

// On-air scrim — near-black fading up/right off the backdrop, for legibility.
const SCRIM = ["rgba(11,13,14,0.96)", "rgba(11,13,14,0.55)", "rgba(11,13,14,0)"] as const;

// Idle colour of the always-present focus frame (lit amber when active).
const IDLE_FRAME = "transparent";

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

  // Smooth brightness fade when active (0.82 → 1) — the picture "tunes in".
  const brightness = useRef(new Animated.Value(0.82)).current;
  useEffect(() => {
    Animated.timing(brightness, {
      toValue: active ? 1 : 0.82,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [active, brightness]);

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

  // On-air focus cue: an amber channel-frame around the tuned-in hero (clearer on
  // a remote than the brightness lift alone). TV/preview only. The border is
  // always present (transparent when idle) so lighting it up never shifts layout.
  const focusFrame =
    IS_TV_LAYOUT && active
      ? {
          borderColor: colors.theme500,
          shadowColor: colors.theme500,
          shadowOffset: { height: 0, width: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 24,
        }
      : null;

  return (
    <Pressable
      hasTVPreferredFocus={IS_TV_LAYOUT && !!initialFocus}
      onPress={handlePress}
      onFocus={IS_TV_LAYOUT ? handleFocus : undefined}
      onBlur={IS_TV_LAYOUT ? handleBlur : undefined}
      onHoverIn={handleHoverIn}
      onHoverOut={handleHoverOut}
    >
      <View
        style={[styles.hero, { height: heroHeight }, focusFrame]}
        onLayout={(e) => setHeroWidth(e.nativeEvent.layout.width)}
      >
        <AnimatedImage
          source={source}
          style={[StyleSheet.absoluteFill, { opacity: brightness }]}
          contentFit="cover"
          transition={200}
        />
        {heroWidth > 0 && <CrtScreen width={heroWidth} height={heroHeight} intensity={active ? 0.35 : 0.4} />}
        <LinearGradient colors={SCRIM} start={{ x: 0, y: 1 }} end={{ x: 0.9, y: 0 }} style={StyleSheet.absoluteFill} />
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
    </Pressable>
  );
};

const styles = StyleSheet.create({
  content: { bottom: 0, gap: spacing.sm, left: 0, padding: spacing.xl, position: "absolute", right: 0, zIndex: 2 },
  hero: {
    borderColor: IDLE_FRAME,
    borderWidth: 3,
    justifyContent: "flex-end",
    marginBottom: spacing.lg,
    overflow: "hidden",
    width: "100%",
  },
  kicker: { letterSpacing: 3 },
  kickerRow: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
  tally: {
    borderRadius: 5,
    height: 10,
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    width: 10,
  },
  title: { lineHeight: 40, maxWidth: 760 },
});
