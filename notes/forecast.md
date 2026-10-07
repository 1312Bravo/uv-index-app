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
- Each bin shows cloud cover and temperature above a UV-height bar, with the UV
  value above the bar. The local hour and day label follow the bar; precipitation
  chance and expected amount appear in two compact rows below. Earlier hours are
  model values, not observed personal exposure.
- Show civil dawn, sunrise, sunset, and civil dusk markers on the same horizontal
  timeline above the bars. Draw an upper daytime arc and a reversed, lower
  nighttime arc in neutral grayscale. Show exactly one moving celestial icon at
  the selected timestamp: the sun during daylight or the crescent moon at night.
  The moon is an illustration of nighttime, not a moon-phase or moon-position
  forecast.
- Show the current local weekday, date, and time above the chart so the hourly
  outlook has explicit time context.
- Temperature is context only, not part of UV risk or protection calculations.
- Show hourly precipitation probability and expected amount in millimeters below
  the hourly labels in both outlook and outing charts. These remain weather context
  and do not change UV values or protection guidance.
- Open-Meteo's `precipitation_probability` is the chance of more than 0.1 mm in
  the preceding hour; `precipitation` is the preceding-hour total in millimeters
  and may include rain, showers, or snow. Display each value under the hour ending
  at that timestamp, explain the timing briefly, and do not combine hourly
  probabilities into a chance for the entire outing. The Info tab explains both
  fields and clarifies that the outing's peak hourly chance is not an outing-wide
  probability. It also gives a cautious guide to hourly rain amounts without
  applying rain-intensity labels automatically to forecast bins or outing totals.
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
  period aggregates. Keep protection guidance based on the raw peak; category
  rounding is for display. Also report approximate time in raw-UV bands and
  identify incomplete forecast coverage rather than treating missing time as UV 0.
- Show the outing summary in a compact 2×2 grid: peak and average UV, average and
  range of temperature, duration-weighted average and range of cloud cover, and
  expected precipitation with peak hourly chance. Cloud cover remains separate
  context and never adjusts UV.
- For the outing precipitation total, sum preceding-hour amounts only when the
  full one-hour interval is contained within the selected outing; do not prorate
  partial hours. Show how many complete forecast hours contributed. If no complete
  interval exists, or any complete interval lacks an amount, show the total as
  unavailable rather than treating missing data as zero. Show the maximum
  probability among overlapping preceding-hour intervals separately; do not
  combine hourly probabilities into an outing-wide chance.
- In the outing chart, show the full overlapping outing interval in the same
  dark selected style. Add up to three surrounding hourly bins on each side,
  using the same number of context bins before and after where the available
  forecast permits; render these context values faintly.
- Show the forecast and baseline protection guidance as soon as start and end
  are selected; no shade input is required. Add a conditional sunscreen
  reapplication reminder for outings of at least 120 minutes when the covered
  forecast reaches raw UVI 3+. This is a UV Scout rule, not an individualized
  reminder or application tracker. See the [recommendation tree](recommendation-tree-draft.md).
