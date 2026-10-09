import type { SelectedLocation } from '../../domain/location/locationTypes';

export type LocationMapProps = {
  selectedLocation: SelectedLocation | null;
  onSelectCoordinates: (latitude: number, longitude: number) => void;
  onInteractionChange?: (isInteracting: boolean) => void;
};
