import { spacing } from "../../../theme";
import { Button, Typography } from "../../../components";
import { Link, useLocalSearchParams } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";
import { useTheme } from "@react-navigation/native";
import { useBreakpoints } from "../../../hooks";
import { IS_TV_LAYOUT } from "../../../utils/tvPreview";
import { GetVideosVideo } from "../../../api/models";
import { TvHero } from "./TvHero";

interface SectionHeaderProps {
  title: string;
  link?: { route: string; text: string };
  channelNo?: number;
  featured?: GetVideosVideo;
}

export const SectionHeader = ({ title, link, channelNo, featured }: SectionHeaderProps) => {
  const { colors } = useTheme();
  const { backend } = useLocalSearchParams();
  const { isMobile } = useBreakpoints();

  const isLinkVisible = !!link && !Platform.isTV;

  return (
    <View style={{ backgroundColor: colors.background }}>
      {IS_TV_LAYOUT && featured && (
        <View style={styles.sectionHero}>
          <TvHero video={featured} backend={backend as string | undefined} compact kicker={title} />
        </View>
      )}
      <View
        style={[
          {
            paddingTop: isMobile ? spacing.sm : spacing.xl,
            backgroundColor: colors.background,
            marginLeft: (!isMobile ? spacing.xl : 0) - Number(Boolean(Platform.isTV)) * 24,
            paddingLeft: (isMobile ? 10 : 0) + Number(Boolean(Platform.isTV)) * 24,
            paddingRight: (isMobile ? spacing.sm : 48) - Number(Boolean(Platform.isTV)) * 24,
          },
          styles.container,
        ]}
      >
        <View
          style={[
            {
              // On-air accent bar — amber on the couch (broadcast-lineup feel).
              borderLeftColor: IS_TV_LAYOUT ? colors.theme500 : colors.theme200,
            },
            styles.textContainer,
          ]}
        >
          <View style={styles.titleRow}>
            {IS_TV_LAYOUT && channelNo != null && (
              <View style={[styles.chBadge, { borderColor: colors.theme500 }]}>
                <Typography style={styles.chText} color={colors.theme500} fontWeight="ExtraBold">
                  {`CH ${String(channelNo).padStart(2, "0")}`}
                </Typography>
              </View>
            )}
            {IS_TV_LAYOUT && (
              <View style={[styles.tally, { backgroundColor: colors.error500, shadowColor: colors.error500 }]} />
            )}
            <Typography
              style={[styles.text, IS_TV_LAYOUT && styles.textTV]}
              color={colors.theme950}
              fontSize="sizeXL"
              fontWeight="ExtraBold"
            >
              {title}
            </Typography>
          </View>
        </View>
        {isLinkVisible && (
          <Link asChild href={{ pathname: link.route, params: { backend } }}>
            <Button text={link.text} contrast="high" />
          </Link>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chBadge: { borderRadius: 6, borderWidth: 1.5, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  chText: { letterSpacing: 2 },
  container: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: spacing.sm,
    rowGap: spacing.md,
    width: "100%",
  },
  sectionHero: { paddingHorizontal: 24 },
  tally: {
    borderRadius: 4,
    height: 8,
    shadowOffset: { height: 0, width: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    width: 8,
  },
  text: { lineHeight: 36 },
  textContainer: {
    borderLeftWidth: 4,
    paddingLeft: spacing.lg,
  },
  // On-air broadcast label: uppercase, wide tracking.
  textTV: { letterSpacing: 3, textTransform: "uppercase" },
  titleRow: { alignItems: "center", flexDirection: "row", gap: spacing.md },
});
