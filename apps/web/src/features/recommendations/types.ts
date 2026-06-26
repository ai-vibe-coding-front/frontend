export type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'snowy';

export type RecommendationRunEventItem = {
  rank: number;
  score: number;
  distanceKm: number | null;
  isFavorited: boolean;
  eventItem: {
    id: string;
    title: string;
    realmName: string | null;
    place: string | null;
    address: string | null;
    lat: number | null;
    lng: number | null;
    startDate: string | null;
    endDate: string | null;
    price: string | null;
    description: string | null;
    imageUrl: string | null;
    bookingUrl: string | null;
  };
};

export type RecommendationRunDetail = {
  runId: string;
  curation: string | null;
  indoorForced: boolean;
  nearbyExpanded: boolean;
  weather: {
    skyLabel: string | null;
    pty: number | null;
    temperature: number | null;
    type: WeatherType;
  } | null;
  dust: {
    pm10Value: number | null;
    pm10Grade: string | null;
    pm25Value: number | null;
    pm25Grade: string | null;
  } | null;
  items: RecommendationRunEventItem[];
};
