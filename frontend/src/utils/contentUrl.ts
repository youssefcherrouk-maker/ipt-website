import type { MediaItem } from '@/components/ContentDetail';

export function buildContentUrl(item: MediaItem): string {
  const params = new URLSearchParams({
    title: item.title,
    img: item.img,
    ...(item.genre && { genre: item.genre }),
    ...(item.rating && { rating: item.rating }),
    ...(item.year && { year: item.year }),
    ...(item.seasons && { seasons: item.seasons }),
    ...(item.description && { description: item.description }),
    ...(item.match && { match: item.match }),
    ...(item.tag && { tag: item.tag }),
    ...(item.viewers && { viewers: item.viewers }),
  });
  return `/premium-access?${params.toString()}`;
}
