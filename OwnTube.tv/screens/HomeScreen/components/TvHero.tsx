import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useTheme } from "@react-navigation/native";
import { Typography } from "../../../components";
import { spacing } from "../../../theme";
import { GetVideosVideo } from "../../../api/models";
import { ROUTES } from "../../../types";

// On-air scrim — near-black fading up/right off the backdrop, for legibility.
const SCRIM = ["rgba(11,13,14,0.96)", "rgba(11,13,14,0.55)", "rgba(11,13,14,0)"] as const;

// TvHero — the featured spotlight at the top of the couch home. Big backdrop +
// on-air "NOW SHOWING" kicker + title + channel. Clicking opens the video.
export const TvHero = ({ video, backend }: { video?: GetVideosVideo; backend?: string }) => {
  const { colors } = useTheme();
  const { height } = useWindowDimensions();
  const router = useRouter();

  if (!video) return null;

  const heroHeight = Math.min(Math.round(height * 0.52), 480);
  const source = video.previewPath ? { uri: video.previewPath } : undefined;

  return (
    <Pressable onPress={() => router.navigate({ pathname: `/${ROUTES.VIDEO}`, params: { id: video.uuid, backend } })}>
      <View style={[styles.hero, { height: heroHeight }]}>
        <Image source={source} style={StyleSheet.absoluteFill} contentFit="cover" transition={200} />
        <LinearGradient colors={SCRIM} start={{ x: 0, y: 1 }} end={{ x: 0.9, y: 0 }} style={StyleSheet.absoluteFill} />
        <View style={styles.content}>
          <Typography style={styles.kicker} color={colors.theme500} fontWeight="ExtraBold">
            NOW SHOWING
          </Typography>
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
  content: { bottom: 0, gap: spacing.xs, left: 0, padding: spacing.xl, position: "absolute", right: 0 },
  hero: { justifyContent: "flex-end", marginBottom: spacing.lg, overflow: "hidden", width: "100%" },
  kicker: { letterSpacing: 3 },
  title: { lineHeight: 40, maxWidth: 760 },
});
