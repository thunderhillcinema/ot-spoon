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
import { FocusGuide, CrtScreen } from "./helpers";
import { VideoItemFooter } from "./VideoItemFooter";
import { IS_TV_LAYOUT, IS_TV_PREVIEW_WEB } from "../utils/tvPreview";

interface VideoGridCardProps {
  video: GetVideosVideo;
  backend?: string;
}

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

  const handleTvNavigateToVideo = () => {
    router.navigate(linkHref);
  };

  return (
    <View style={[styles.container, isTvFocused && tvFocusStyle]}>
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
            {IS_TV_LAYOUT && containerWidth > 0 && (
              <CrtScreen width={containerWidth} height={containerWidth * (9 / 16)} />
            )}
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
    </View>
  );
});

VideoGridCard.displayName = "VideoGridCard";

const styles = StyleSheet.create({
  container: {
    flex: 0,
    gap: spacing.sm,
    height: "auto",
    maxWidth: "100%",
  },
  linkWrapper: { flex: 1 },
  linkWrapperTV: {
    borderRadius: 10,
    height: "100%",
    width: "100%",
  },
  pressableContainer: { gap: spacing.md },
  restInfoContainer: { gap: spacing.xs, paddingHorizontal: spacing.sm },
  textContainer: { gap: spacing.sm, paddingHorizontal: spacing.sm },
});
