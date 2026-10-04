# Forecast source

- Use Open-Meteo for the non-commercial prototype's UV Index and outdoor
  temperature forecast, alongside its existing place search.
- The choice avoids client-side API-key handling; it does not establish that
  Open-Meteo is more accurate than WeatherAPI.
- Show five earlier hourly model values, the current modeled value, and eighteen
  future hourly values in one horizontally scrollable chart. Use narrow, closely
  spaced bins so more hours fit on screen. Initially show a couple of earlier bins
  before Now, leaving more future bins visible; all five earlier bins remain
  available by scrolling left. The window can cross midnight; show the local date
  at a day change.
- Each bin shows temperature and UV Index above a UV-height bar, with local hour
  below it. Earlier hours are model values, not observed personal exposure.
- Show the current local weekday, date, and time above the chart so the hourly
  outlook has explicit time context.
- Temperature is context only, not part of UV risk or protection calculations.
- Attribute Open-Meteo in the app and revisit licensing before commercial use.
- Forecast values are estimates, not a measurement of a person's UV exposure.
- For a selected outing, include every forecast hour whose one-hour interval
  overlaps the outing. Show those hourly UV and temperature values, the maximum
  UV Index, its standard category, and the forecast temperature range.
- The first outing result is deliberately neutral: shade is stored with the plan
  but is not yet used to reduce or reinterpret the forecast. Practical guidance
  will be a separate layer built on this structured result.
