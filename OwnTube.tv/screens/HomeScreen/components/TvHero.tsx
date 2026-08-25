import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { useState } from "react";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { Typography } from "../../../components";
import { CrtScreen } from "../../../components/helpers";
import { spacing } from "../../../theme";
import { GetVideosVideo } from "../../../api/models";
import { ROUTES } from "../../../types";

// On-air scrim — near-black fading up/right off the backdrop, for legibility.
const SCRIM = ["rgba(11,13,14,0.96)", "rgba(11,13,14,0.55)", "rgba(11,13,14,0)"] as const;

// TvHero — the featured spotlight at the top of the couch home. Big backdrop +
// on-air "NOW SHOWING" kicker + title + channel. Clicking opens the video.
export const TvHero = ({
  video,
  backend,
  compact,
  kicker = "NOW SHOWING",
}: {
  video?: GetVideosVideo;
  backend?: string;
  compact?: boolean;
  kicker?: string;
}) => {
  const { colors } = useTheme();
  const { height } = useWindowDimensions();
  const router = useRouter();

  const [heroWidth, setHeroWidth] = useState(0);

  if (!video) return null;

  const heroHeight = compact ? Math.min(Math.round(height * 0.62), 560) : Math.min(Math.round(height * 0.52), 480);
  const source = video.previewPath ? { uri: video.previewPath } : undefined;

  return (
    <Pressable onPress={() => router.navigate({ pathname: `/${ROUTES.VIDEO}`, params: { id: video.uuid, backend } })}>
      <View style={[styles.hero, { height: heroHeight }]} onLayout={(e) => setHeroWidth(e.nativeEvent.layout.width)}>
        <Image source={source} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
        {heroWidth > 0 && <CrtScreen width={heroWidth} height={heroHeight} intensity={0.4} />}
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
            color={colors.theme900}
            fontSize="sizeXL"
            fontWeight="ExtraBold"
            numberOfLines={2}
          >
            {video.name}
          </Typography>
          <Typography color={colors.theme800} fontWeight="Medium" numberOfLines={1}>
            {video.channel?.displayName}
          </Typography>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  content: { bottom: 0, gap: spacing.sm, left: 0, padding: spacing.xl, position: "absolute", right: 0, zIndex: 2 },
  hero: { justifyContent: "flex-end", marginBottom: spacing.lg, overflow: "hidden", width: "100%" },
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
