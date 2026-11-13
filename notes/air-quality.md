# Air quality

## First UV Outlook slice

The first air-quality feature is a compact current European AQI section in UV
Outlook. It appears after the selected UV reading and guidance and before the
weather metrics. It does not add a tab or rename an existing tab. The same
section remains visible when the UV time selector is set to a future time; the
air-quality value itself remains the current estimate.

Plan an Outing will eventually show AQI for the selected outing window. That
time-window summary is not part of this first slice.

The section shows the European AQI number to one decimal place, its category,
population-specific activity advice, one short category meaning, the provider
estimate time, and linked attribution to Open-Meteo and CAMS ENSEMBLE. A failed
air-quality request leaves the UV forecast available and displays a local retry
action.

Info > Air quality explains the European AQI, names its five pollutant inputs,
lists all six categories and their activity recommendations from the same
editable table, retains each category's short meaning as secondary text, and
clarifies the model-estimate and hourly-index limitations. General and
sensitive-group advice use inline labels and matching text colors in both Info
and UV Outlook.

## Source-backed facts

- Open-Meteo's [Air Quality API](https://open-meteo.com/en/docs/air-quality-api)
  supplies `current=european_aqi` and its current timestamp in the selected
  location's time zone (API documentation checked 2026-11-13).
- The European AQI is based on five pollutant indices: PM2.5, PM10, ozone,
  nitrogen dioxide, and sulphur dioxide. The overall index uses the poorest
  pollutant level, rather than averaging the five indices, as described by the
  [EEA's index methodology](https://airindex.eea.europa.eu/AQI/) (checked
  2026-11-13).
- The published category bands are Good (0-20), Fair (20-40), Moderate (40-60),
  Poor (60-80), Very poor (80-100), and Extremely poor (>100). For boundary
  handling in UV Scout, each lower category includes its lower boundary; 100
  remains Very poor and only values above 100 are Extremely poor. Info displays
  shared-endpoint ranges: 0-20, 20-40, 40-60, 60-80, 80-100, and >100. The
  category at an exact endpoint follows the threshold rules in the editable
  table, so 20 is Fair and 100 remains Very poor.
- EEA's health messages give separate activity recommendations for the general
  population and sensitive populations. EEA describes the latter as adults and
  children with respiratory problems and adults with heart conditions. The
  messages range from usual outdoor activity at Good/Fair to reducing or
  avoiding outdoor physical activity at higher categories.
- The API's air-quality forecast uses [CAMS](https://atmosphere.copernicus.eu/)
  European and global forecast data.
  It is modelled data, not a measurement from a local monitoring station. The
  European model provides hourly data for 4 days at about 11 km resolution and
  is updated every 24 hours; the global model provides 3-hourly data for 5 days
  at about 45 km resolution and is updated every 12 hours.
- Open-Meteo requires clear attribution to Open-Meteo and CAMS ENSEMBLE. The
  API's free service is restricted to non-commercial use and has request limits.

## UV Scout choices

- Use European AQI consistently for the first implementation, matching the
  European index discussed for the product.
- Request only the current AQI for the UV Outlook card. Hourly outlooks and
  selected-outing summaries remain future feature work. Refresh the request
  when the location changes and in one-hour intervals, not on the UV forecast's
  15-minute refresh cycle. This checks for the latest available estimate hourly;
  the CAMS European forecast itself is updated daily.
- Classify the unrounded API value, display one decimal place, and use the
  editable category table in `src/domain/airQuality/europeanAqiCategories.json`.
- In that table, `key` is the stable identifier, `label` is the user-facing
  category, `minimum` is an AQI-point threshold, `minimumInclusive` controls
  exact-boundary assignment, and `meaning` is the short display description.
  Keep entries in the defined Good-to-Extremely-poor order.
- Keep short category meanings in that JSON file for the UV Outlook card and as
  secondary text in Info. Info shows paraphrased EEA activity guidance with
  inline audience labels for most people and sensitive groups. Both advice
  lines use matching text colors. The guidance is general, not individualized
  medical advice.
- Keep the air-quality request separate from the UV/weather request so its
  errors do not block those existing results.

See the [source register](data-sources.md) for API details, code paths, and
attribution.
