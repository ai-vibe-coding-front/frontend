import { prisma } from '@/lib/prisma';

type BoundingBox = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};

export async function findNearbyEventCandidates(bbox: BoundingBox, category?: string) {
  return prisma.eventItem.findMany({
    where: {
      deletedAt: null,
      lat: { gte: bbox.minLat, lte: bbox.maxLat },
      lng: { gte: bbox.minLng, lte: bbox.maxLng },
      ...(category ? { realmName: category } : {}),
    },
  });
}

export async function findEventDetailById(id: string) {
  return prisma.eventItem.findFirst({
    where: {
      deletedAt: null,
      OR: [{ id }, { externalId: id }],
    },
  });
}

export async function findFavoritedEventIds(
  userId: string,
  eventItemIds: string[],
): Promise<Set<string>> {
  if (eventItemIds.length === 0) return new Set();

  const favorites = await prisma.favorite.findMany({
    where: { userId, eventItemId: { in: eventItemIds } },
    select: { eventItemId: true },
  });

  return new Set(favorites.map((favorite) => favorite.eventItemId));
}

export async function findFavoriteByUserAndEvent(userId: string, eventItemId: string) {
  return prisma.favorite.findFirst({
    where: { userId, eventItemId },
  });
}

export async function countFavorites(eventItemId: string): Promise<number> {
  return prisma.favorite.count({ where: { eventItemId } });
}

export async function createFavorite(userId: string, eventItemId: string) {
  return prisma.favorite.create({
    data: { userId, eventItemId },
  });
}

export async function deleteFavorite(userId: string, eventItemId: string) {
  return prisma.favorite.deleteMany({
    where: { userId, eventItemId },
  });
}
