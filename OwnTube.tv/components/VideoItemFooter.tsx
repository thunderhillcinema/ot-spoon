import { formatDistanceToNow } from "date-fns";
import { LANGUAGE_OPTIONS } from "../i18n";
import { Typography } from "./Typography";
import { GetVideosVideo } from "../api/models";
import { useTranslation } from "react-i18next";
import { useTheme } from "@react-navigation/native";
import { IS_TV_LAYOUT } from "../utils/tvPreview";

export const VideoItemFooter = ({ video }: { video: GetVideosVideo }) => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();

  // On the couch, no metadata line under the tile.
  if (IS_TV_LAYOUT) return null;

  const dateText = video.publishedAt
    ? formatDistanceToNow(video.publishedAt, {
        addSuffix: true,
        locale: LANGUAGE_OPTIONS.find(({ value }) => value === i18n.language)?.dateLocale,
      })
    : "";

  return (
    <Typography fontSize="sizeXS" fontWeight="Medium" color={colors.themeDesaturated500}>
      {video.isLive
        ? `${video.state?.id !== 1 ? t("offline") : t("streamingNow")} • ${t("viewers", { count: video.viewers })}`
        : // On the couch, drop the view count below the tile — just the date.
          IS_TV_LAYOUT
          ? dateText
          : `${dateText} • ${t("views", { count: video.views })}`}
    </Typography>
  );
};
