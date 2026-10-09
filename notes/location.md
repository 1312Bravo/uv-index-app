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
- Device location is requested only after the user taps the button, using foreground permission.
- The first version does not save location history or coordinates.
- Manual place search uses Open-Meteo geocoding for this non-commercial prototype.
- Place suggestions appear while typing after three characters and a short pause;
  the user chooses a result from the list.
- Place results come from GeoNames via Open-Meteo and receive in-app attribution.
- The free geocoding endpoint is not suitable for commercial release without a licence change.
- When device or map location is selected, use the keyless BigDataCloud client-side
  reverse-geocoding endpoint for a best-effort locality label. Keep the exact
  coordinates visible and fall back to `Current location` if the lookup fails.
- BigDataCloud's client endpoint is governed by its current-device, consent, and
  direct-client-call fair-use policy. Its documentation says it receives the
  location alongside request/network signals and uses anonymous pairings to
  improve IP-geolocation data; include this in future privacy disclosures.
- Selected coordinates feed the Open-Meteo UV and temperature forecast. The app
  does not persist them.
