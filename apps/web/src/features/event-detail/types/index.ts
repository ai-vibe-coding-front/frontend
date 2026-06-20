export type EventDetail = {
  id: string;
  title: string;
  realmCode: string | null;
  realmName: string | null;
  startDate: string | null;
  endDate: string | null;
  place: string | null;
  price: string | null;
  description: string;
  imageUrl: string | null;
  bookingUrl: string | null;
  lat: number | null;
  lng: number | null;
};
