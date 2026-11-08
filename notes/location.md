# Location behavior

See the [source register](data-sources.md) for provider usage, privacy, and
licensing details.

- The first version supports device location, manual place search, and map
  selection on Android and web.
- The map initially shows Central Europe at a continent-wide zoom with no
  location selected. Tapping selects a point without changing the current map
  view, so the user can continue panning; choosing a searched place or device
  location moves the map to that selection and zooms in.
- Map selection stores the tapped coordinates in app state and requests an
  optional best-effort locality label. If lookup fails, the coordinates remain
  usable and visible. Coordinates are not persisted.
- Android and iOS use Leaflet in `react-native-webview`; web uses the bundled
  React Leaflet implementation. Both display OpenStreetMap standard raster
  tiles, keep attribution visible, and return tapped coordinates to the app.
  Native Leaflet assets are loaded from a pinned unpkg CDN URL. OSM's public
  tile service is best-effort and capacity-limited; choose a hosted provider
  with suitable terms before commercial or high-volume use. The map requires
  internet access for its library assets and visible tiles.
- On mobile, request foreground location permission once at startup and use the
  current device location by default when permission is granted and location
  services are enabled. If permission is denied, manual search remains available
  and the location control can request access again. Web remains manual until the
  user chooses device location.
- When available, show a cached phone position up to five minutes old and within
  2 km accuracy while requesting a fresh position. Replace it with the fresh
  coordinates when they arrive.
- Once coordinates are available, use them immediately for forecasts and stop
  showing the location-loading indicator. Resolve the approximate place label
  in the background so reverse geocoding does not delay the selected location.
- When device location is selected, label its control `Current location selected`.
  When any location is selected, label the search field `Search a different location`.
- The first version does not save location history or coordinates.
- Manual place search uses Open-Meteo geocoding for this non-commercial prototype.
- Place suggestions appear while typing after three characters and a short pause;
  the user chooses a result from the list.
- Place results come from GeoNames via Open-Meteo and receive in-app attribution.
- The free geocoding endpoint is not suitable for commercial release without a licence change.
- When device location is selected, use the keyless BigDataCloud client-side
  reverse-geocoding endpoint for a best-effort locality label. Its fair-use terms
  only allow coordinates from the calling device's current location obtained
  with permission. Keep the exact coordinates visible and fall back to
  `Current location` if lookup fails.
- For a map-selected point, use Komoot Photon with OpenStreetMap data for a
  best-effort locality label. Photon may return a nearby mapped place rather
  than a name exactly at the selected point. If lookup fails, retain the
  coordinates and omit the optional name. See the source register for Photon
  public-instance usage limits and attribution.
- Selected coordinates feed the Open-Meteo UV and temperature forecast. The app
  does not persist them.
- Open-Meteo returns the center coordinates of the forecast grid cell used for
  its forecast, which may be a few kilometres from the selected point. The app
  calculates the great-circle distance between those coordinates and the
  selected coordinates, then uses Photon to find a nearby locality name. The
  shared location summary shows `Forecast point about [distance] from selected
  location ([locality])` only when both coordinates and the locality lookup are
  available. This distance is only the offset to the grid-cell center, not a
  forecast coverage radius. Photon is an optional client-side lookup cached by
  coordinate for the app session; on failure, the note is omitted. OpenStreetMap
  attribution is linked below the note. See the source register for provider
  details, limitations, and checked dates.
- The existing Open-Meteo time-zone request also returns the forecast grid
  coordinates. The shared location summary can therefore show the optional
  forecast-point note on Location without waiting for UV Outlook or Plan an
  Outing to load. If the time-zone request or nearby-place lookup fails, the
  location selector remains usable and the note is omitted.
- The shared location summary on Location, UV Outlook, and Plan an Outing shows
  the place, coordinates, and a live local date and time. Open-Meteo resolves
  the time zone from selected coordinates as soon as a location is chosen; the
  app formats the device's current instant in that zone. Until it resolves,
  show a loading label rather than the device's local time. If the lookup fails,
  say local time is unavailable; a later forecast response may still supply the
  zone. Changing locations never shows the previous place's time zone.
- Before any location is selected, the Location tab still shows the current
  date and time in the device's own time zone. This fallback is only for the
  no-location state; once a location is selected, show that location's time or
  an explicit loading/unavailable state instead.
