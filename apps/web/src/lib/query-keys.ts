export type NearbyEventsQuery = Readonly<{
  lat: number;
  lng: number;
  radius?: number;
  realmCode?: string;
}>;

export const queryKeys = {
  auth: {
    all: ['auth'] as const,
  },
  users: {
    all: ['users'] as const,
    me: () => ['users', 'me'] as const,
  },
  explorationSessions: {
    all: ['exploration-sessions'] as const,
    details: () => ['exploration-sessions', 'detail'] as const,
    detail: (explorationSessionId: string) =>
      ['exploration-sessions', 'detail', explorationSessionId] as const,
  },
  recommendations: {
    all: ['recommendations'] as const,
    details: () => ['recommendations', 'detail'] as const,
    detail: (runId: string) => ['recommendations', 'detail', runId] as const,
    recent: () => ['recommendations', 'recent'] as const,
  },
  events: {
    all: ['events'] as const,
    details: () => ['events', 'detail'] as const,
    detail: (eventItemId: string) => ['events', 'detail', eventItemId] as const,
  },
  nearbyEvents: {
    all: ['nearby-events'] as const,
    lists: () => ['nearby-events', 'list'] as const,
    list: (query: NearbyEventsQuery) =>
      ['nearby-events', 'list', query] as const,
  },
  favorites: {
    all: ['favorites'] as const,
    list: () => ['favorites', 'list'] as const,
    count: () => ['favorites', 'count'] as const,
  },
  eventLogs: {
    all: ['event-logs'] as const,
  },
} as const;
