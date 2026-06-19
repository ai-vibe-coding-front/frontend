export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  onboarding: '/onboarding',
  questions: '/questions',
  recommendations: '/recommendations',
  eventDetail: (id: string) => `/events/${id}`,
} as const;
