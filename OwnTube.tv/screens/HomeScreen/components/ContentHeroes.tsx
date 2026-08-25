import { VideoChannel } from "@peertube/peertube-types";
import { useGetChannelVideosQuery, useGetVideosQuery } from "../../../api";
import { TvHero } from "./TvHero";

// Channels/Categories have no backdrop of their own, so their section heroes used
// to render title-only. These wrappers fill the hero with the rail's FIRST video
// thumbnail (16:9, matching the hero). Each reuses the EXACT query its row runs
// below it (same key/params), so the image is a shared-cache read — no extra
// network round-trip.

export const ChannelHero = ({
  channel,
  kicker,
  onPress,
}: {
  channel: VideoChannel;
  kicker: string;
  onPress: () => void;
}) => {
  const { data } = useGetChannelVideosQuery(channel.name);

  return (
    <TvHero
      compact
      kicker={kicker}
      title={channel.displayName}
      imageUrl={data?.data?.[0]?.previewPath}
      onPress={onPress}
    />
  );
};

export const CategoryHero = ({
  category,
  kicker,
  onPress,
}: {
  category: { name: string; id: number };
  kicker: string;
  onPress: () => void;
}) => {
  // Mirrors CategoryView's query exactly (same params + uniqueQueryKey) so they
  // share the cache.
  const { data } = useGetVideosQuery({
    enabled: true,
    params: { categoryOneOf: [category.id], count: 4, sort: "-publishedAt" },
    uniqueQueryKey: `category-${category.id}`,
  });

  return (
    <TvHero compact kicker={kicker} title={category.name} imageUrl={data?.data?.[0]?.previewPath} onPress={onPress} />
  );
};
