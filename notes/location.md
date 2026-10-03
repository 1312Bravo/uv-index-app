# Location behavior

- The first version supports device location and manual place selection on Android and web.
- Device location is requested only after the user taps the button, using foreground permission.
- The first version does not save location history or coordinates.
- Manual place search uses Open-Meteo geocoding for this non-commercial prototype.
- Place suggestions appear while typing after three characters and a short pause;
  the user chooses a result from the list.
- Place results come from GeoNames via Open-Meteo and receive in-app attribution.
- The free geocoding endpoint is not suitable for commercial release without a licence change.
- Selected coordinates feed the Open-Meteo UV and temperature forecast. The app
  does not persist them.
