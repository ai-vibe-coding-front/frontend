export type NearbyEventsQuery = Readonly<{
  lat: number;
  lng: number;
  radiusKm?: number;
  limit?: number;
  category?: string;
}>;

export const queryKeys = {
  auth: {
    all: () => ['auth'] as const,
  },
  users: {
    all: () => ['users'] as const,
    me: () => ['users', 'me'] as const,
  },
  explorationSessions: {
    all: () => ['exploration-sessions'] as const,
  },
  recommendations: {
    all: () => ['recommendations'] as const,
    details: () => ['recommendations', 'detail'] as const,
    detail: (runId: string) => ['recommendations', 'detail', runId] as const,
    recent: (limit?: number) =>
      ['recommendations', 'recent', { limit }] as const,
  },
  events: {
    all: () => ['events'] as const,
    details: () => ['events', 'detail'] as const,
    detail: (eventId: string) => ['events', 'detail', eventId] as const,
    nearby: {
      lists: () => ['events', 'nearby', 'list'] as const,
      list: (query: NearbyEventsQuery) =>
        ['events', 'nearby', 'list', query] as const,
    },
  },
  favorites: {
    all: () => ['favorites'] as const,
    list: () => ['favorites', 'list'] as const,
    count: () => ['favorites', 'count'] as const,
  },
  eventLogs: {
    all: () => ['event-logs'] as const,
  },
} as const;