export type EventDetail = {
  eventItemId: string;
  title: string;
  realmName: string | null;
  startDate: string | null;
  endDate: string | null;
  place: string | null;
  address: string | null;
  price: string | null;
  description: string;
  imageUrl: string | null;
  bookingUrl: string | null;
  lat: number | null;
  lng: number | null;
  isIndoor: boolean | null;
  isFavorited: boolean;
};
