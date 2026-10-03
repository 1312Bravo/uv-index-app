# Forecast source

- Use Open-Meteo for the non-commercial prototype's UV Index and outdoor
  temperature forecast, alongside its existing place search.
- The choice avoids client-side API-key handling; it does not establish that
  Open-Meteo is more accurate than WeatherAPI.
- Show five earlier hourly model values, the current modeled value, and eighteen
  future hourly values in one horizontally scrollable chart. The window can cross
  midnight; show the local date at a day change.
- Each bin shows temperature and UV Index above a UV-height bar, with local hour
  below it. Earlier hours are model values, not observed personal exposure.
- Temperature is context only, not part of UV risk or protection calculations.
- Attribute Open-Meteo in the app and revisit licensing before commercial use.
- Forecast values are estimates, not a measurement of a person's UV exposure.
