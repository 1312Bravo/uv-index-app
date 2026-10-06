# Forecast source

See the [source register](data-sources.md) for provider fields, code paths,
attribution, and limitations.

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
- Show civil dawn, sunrise, sunset, and civil dusk markers on the same horizontal
  timeline above the bars. Draw an upper daytime arc and a reversed, lower
  nighttime arc in neutral grayscale. Show exactly one moving celestial icon at
  the selected timestamp: the sun during daylight or the crescent moon at night.
  The moon is an illustration of nighttime, not a moon-phase or moon-position
  forecast.
- Show the current local weekday, date, and time above the chart so the hourly
  outlook has explicit time context.
- Temperature is context only, not part of UV risk or protection calculations.
- Attribute Open-Meteo in the app and revisit licensing before commercial use.
- Forecast values are estimates, not a measurement of a person's UV exposure.
- For category lookup, round the raw UV Index to the nearest whole number:
  fractional parts below .5 round down, and .5 or above round up. Keep the
  forecast value itself unchanged. This is the user's chosen classification
  convention, not a separately verified rounding requirement from a source.
- For a selected outing, include every forecast hour whose one-hour interval
  overlaps the outing. Show peak UV Index and category plus a duration-weighted
  average UV; show average temperature and its minimum–maximum range. Weight each
  hourly value by its overlap with the outing, treating it as representative of
  its one-hour bin. These averages are app-derived summaries, not provider-issued
  period aggregates. Keep protection guidance based on the peak UV category.
- In the outing chart, show the full overlapping outing interval in the same
  dark selected style. Add up to three surrounding hourly bins on each side,
  using the same number of context bins before and after where the available
  forecast permits; render these context values faintly.
- Show the forecast and baseline protection guidance as soon as start and end
  are selected; shade is optional. Use the peak UV category for baseline actions.
  If shade is provided, append a shade-specific context note without reducing or
  reinterpreting the forecast UV values.
