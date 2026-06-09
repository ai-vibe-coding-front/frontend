export const ROUTES = {
  home: '/',
  onboarding: '/onboarding',
  questions: '/questions',
  recommendations: '/recommendations',
  eventDetail: (id: string) => `/events/${id}`,
} as const;
