export const ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
  locationPermission: '/location-permission',
  location: '/location',
  explore: '/explore',
  questions: '/questions',
  recommendations: '/recommendations',
  recommendationResult: (runId: string) => `/recommendations/${runId}`,
  mypage: '/mypage',
  mypageFavorites: '/mypage/favorites',
  eventDetail: (id: string) => `/events/${id}`,
} as const;
