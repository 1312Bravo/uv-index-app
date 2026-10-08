export type Place = {
  id: number;
  name: string;
  admin1?: string;
  country: string;
  latitude: number;
  longitude: number;
};

export type SelectedLocation =
  | { source: 'device'; latitude: number; longitude: number; placeName?: string }
  | { source: 'map'; latitude: number; longitude: number; placeName?: string }
  | { source: 'place'; place: Place };

export type LocationCoordinates = {
  latitude: number;
  longitude: number;
};
