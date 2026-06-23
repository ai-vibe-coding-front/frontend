export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  locationPermission: '/location-permission',
  location: '/location',
  questions: '/questions',
  recommendations: '/recommendations',
  eventDetail: (id: string) => `/events/${id}`,
} as const;
