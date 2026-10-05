# Location behavior

See the [source register](data-sources.md) for provider usage, privacy, and
licensing details.

- The first version supports device location and manual place selection on Android and web.
- Device location is requested only after the user taps the button, using foreground permission.
- The first version does not save location history or coordinates.
- Manual place search uses Open-Meteo geocoding for this non-commercial prototype.
- Place suggestions appear while typing after three characters and a short pause;
  the user chooses a result from the list.
- Place results come from GeoNames via Open-Meteo and receive in-app attribution.
- The free geocoding endpoint is not suitable for commercial release without a licence change.
- When device location is selected, use the keyless BigDataCloud client-side
  reverse-geocoding endpoint for a best-effort locality label. Keep the exact
  coordinates visible and fall back to `Current location` if the lookup fails.
- BigDataCloud's client endpoint is governed by its current-device, consent, and
  direct-client-call fair-use policy. Its documentation says it receives the
  location alongside request/network signals and uses anonymous pairings to
  improve IP-geolocation data; include this in future privacy disclosures.
- Recheck the request parameter names: the current integration sends `lat`,
  while the provider's current endpoint documentation specifies `latitude`.
- Selected coordinates feed the Open-Meteo UV and temperature forecast. The app
  does not persist them.
