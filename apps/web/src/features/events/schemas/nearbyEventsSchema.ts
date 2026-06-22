import { z } from 'zod';

export const nearbyEventsSchema = z.object({
  lat: z.coerce.number({ message: '위치 정보가 올바르지 않습니다.' }).min(-90).max(90),
  lng: z.coerce.number({ message: '위치 정보가 올바르지 않습니다.' }).min(-180).max(180),
  radiusKm: z.coerce.number().positive().default(30),
  limit: z.coerce.number().int().positive().default(20),
  category: z.string().optional(),
});

export type NearbyEventsInput = z.infer<typeof nearbyEventsSchema>;
