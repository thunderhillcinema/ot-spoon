import { Platform, Pressable, StyleSheet, View } from "react-native";
import { VideoThumbnail } from "./VideoThumbnail";
import { GetVideosVideo } from "../api/models";
import { Link, useRouter } from "expo-router";
import { ROUTES } from "../types";
import { Typography } from "./Typography";
import { spacing } from "../theme";
import { useBreakpoints, useHoverState, useViewHistory } from "../hooks";
import { useTheme } from "@react-navigation/native";
import { ChannelLink } from "./ChannelLink";
import { forwardRef, useMemo, useState } from "react";
import TVFocusGuideHelper from "./helpers/TVFocusGuideHelper";
import { FocusGuide } from "./helpers";
import { VideoItemFooter } from "./VideoItemFooter";
import { IS_TV_LAYOUT, IS_TV_PREVIEW_WEB } from "../utils/tvPreview";
import { LinearGradient } from "expo-linear-gradient";

interface VideoGridCardProps {
  video: GetVideosVideo;
  backend?: string;
}

// CRT cabinet material — deliberately fixed dark (a television is dark regardless
// of theme), so it lives outside the theme tokens.
const CABINET = {
  shell: "#17191B",
  border: "#0A0C0D",
  highlight: "#2B2E30",
  shadow: "#000000",
  screen: "#05070A",
  bezel: "#000000",
};

// Cabinet finishes (top-lit → shadowed bottom) so a rail reads as a shelf of
// mismatched sets — graphite / walnut / onyx. The bottom stops stay clearly
// ABOVE the near-black room (#0B0D0E) so the whole cabinet reads as a solid
// lighter block, not a gradient that fades into the background.
const CABINET_MODELS: readonly (readonly [string, string, string])[] = [
  ["#3B3E42", "#292C30", "#191C1F"],
  ["#463522", "#31251A", "#201811"],
  ["#313337", "#212327", "#15171A"],
];

export const VideoGridCard = forwardRef<View, VideoGridCardProps>(({ video, backend }, ref) => {
  const { isDesktop } = useBreakpoints();
  const { colors } = useTheme();
  const { isHovered, toggleHovered } = useHoverState();
  const { getViewHistoryEntryByUuid } = useViewHistory({ enabled: false });
  const { timestamp } = getViewHistoryEntryByUuid(video.uuid) || {};
  const [containerWidth, setContainerWidth] = useState(0);
  const [focused, setFocused] = useState(false);
  const router = useRouter();
  const linkHref = useMemo(() => {
    return { pathname: `/${ROUTES.VIDEO}`, params: { id: video.uuid, backend, timestamp } };
  }, [video, backend, timestamp]);

  const thumbnailLinkStyles = useMemo(() => {
    return [styles.linkWrapper, ...(IS_TV_LAYOUT ? [styles.linkWrapperTV] : [{}])];
  }, []);

  // THC on-air focus (10-foot): the focused tile lifts, scales, and casts an amber
  // glow — the streaming-standard cue, replacing the flat border. Renders on TV and
  // in the web TV-preview (IS_TV_LAYOUT).
  const isTvFocused = IS_TV_LAYOUT && focused;

  // In the web preview there's no D-pad, so drive focus from hover.
  const handleHoverIn = () => {
    toggleHovered();
    if (IS_TV_PREVIEW_WEB) setFocused(true);
  };
  const handleHoverOut = () => {
    toggleHovered();
    if (IS_TV_PREVIEW_WEB) setFocused(false);
  };
  const tvFocusStyle = useMemo(
    () => ({
      transform: [{ scale: 1.08 }],
      shadowColor: colors.theme500,
      shadowOpacity: 0.55,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      zIndex: 10,
    }),
    [colors],
  );

  // Deterministic cabinet finish per video, so the shelf looks mismatched but stable.
  const cabinetColors = useMemo(() => {
    const key = video.uuid || video.name || "";
    let sum = 0;
    for (let i = 0; i < key.length; i++) sum += key.charCodeAt(i);
    return CABINET_MODELS[sum % CABINET_MODELS.length];
  }, [video.uuid, video.name]);

  const handleTvNavigateToVideo = () => {
    router.navigate(linkHref);
  };

  // The cabinet IS the gradient element wrapping the whole card (screen + the
  // title/detail below it), so the molded shell reliably fills the full height.
  // An absolute-fill gradient collapsed because the thumbnail wrapper is height:100%.
  const CabinetContainer = IS_TV_LAYOUT ? LinearGradient : View;
  const cabinetContainerProps = IS_TV_LAYOUT
    ? { colors: cabinetColors, start: { x: 0.3, y: 0 }, end: { x: 0.7, y: 1 } }
    : {};

  return (
    <CabinetContainer
      {...cabinetContainerProps}
      style={[styles.container, IS_TV_LAYOUT && styles.cabinetTV, isTvFocused && tvFocusStyle]}
    >
      <Pressable
        onFocus={IS_TV_LAYOUT ? () => setFocused(true) : null}
        onBlur={IS_TV_LAYOUT ? () => setFocused(false) : null}
        style={styles.pressableContainer}
        onPress={Platform.isTV || Platform.OS === "web" ? handleTvNavigateToVideo : null}
        onHoverIn={handleHoverIn}
        onHoverOut={handleHoverOut}
        ref={ref}
      >
        <Link
          onLayout={(e) => {
            setContainerWidth(e.nativeEvent.layout.width);
          }}
          href={linkHref}
          asChild
          style={thumbnailLinkStyles}
        >
          <Pressable tabIndex={-1} onHoverIn={toggleHovered} onHoverOut={toggleHovered}>
            {focused && <FocusGuide height={containerWidth * (9 / 16)} width={containerWidth} />}
            <VideoThumbnail
              imageDimensions={{ width: containerWidth, height: containerWidth * (9 / 16) }}
              video={video}
              timestamp={timestamp}
              backend={backend}
            />
          </Pressable>
        </Link>
        <TVFocusGuideHelper focusable={false} style={styles.textContainer}>
          {/* @ts-expect-error tabIndex is passed to anchor tag but is not officially supported by Expo Router */}
          <Link tabIndex={-1} href={linkHref}>
            <Typography
              fontWeight="Medium"
              color={colors.theme900}
              fontSize={isDesktop ? "sizeMd" : "sizeSm"}
              numberOfLines={4}
              style={{ textDecorationLine: isHovered ? "underline" : undefined }}
            >
              {video.name}
            </Typography>
          </Link>
        </TVFocusGuideHelper>
      </Pressable>
      <TVFocusGuideHelper focusable={false} style={styles.restInfoContainer}>
        <ChannelLink
          href={{
            pathname: `/${ROUTES.CHANNEL}`,
            params: { channel: video.channel?.name, backend: video.channel?.host },
          }}
          text={video.channel?.displayName}
          sourceLink={video.channel?.url}
        />
        <VideoItemFooter video={video} />
      </TVFocusGuideHelper>
    </CabinetContainer>
  );
});

VideoGridCard.displayName = "VideoGridCard";

const styles = StyleSheet.create({
  // TV cabinet: the whole item is a television — dark shell, rounded corners, a
  // top highlight edge, a bezel (padding) around the screen, and a lower front
  // panel (paddingBottom) that holds the title + detail. On-air dark, deliberate.
  cabinetTV: {
    backgroundColor: CABINET.shell,
    borderColor: CABINET.border,
    borderRadius: 16,
    borderTopColor: CABINET.highlight,
    borderWidth: 1,
    gap: spacing.sm,
    overflow: "visible",
    padding: spacing.md,
    paddingBottom: spacing.md,
    shadowColor: CABINET.shadow,
    shadowOffset: { height: 14, width: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 22,
  },
  container: {
    flex: 0,
    gap: spacing.sm,
    height: "auto",
    maxWidth: "100%",
  },
  linkWrapper: { flex: 1 },
  // Recessed tube: dark screen bed inset by a black bezel ring.
  linkWrapperTV: {
    backgroundColor: CABINET.screen,
    borderColor: CABINET.bezel,
    borderRadius: 10,
    borderWidth: 2,
    height: "100%",
    width: "100%",
  },
  pressableContainer: { gap: spacing.md },
  restInfoContainer: { gap: spacing.xs, paddingHorizontal: spacing.sm },
  textContainer: { gap: spacing.sm, paddingHorizontal: spacing.sm },
});
