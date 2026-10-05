# Data and evidence sources

Updated 2026-10-05. This is the source register for UV Scout. It records the
origin of external forecast/location data and evidence used to shape app
behavior, plus where each source enters the project and how it is interpreted.
Topic-specific research notes contain the fuller evidence review and rationale.

When adding or changing a provider, external dataset, scientific claim, or
calculation method, update this register and the relevant detailed research note
in the same change. Record the exact page/API, fields or claims used, code/data
locations, transformations, attribution or licensing requirements, known limits,
and the source publication/version and date checked when available. Mark UV Scout
product choices separately from source-backed facts. The update date above is
the date this register was edited; it does not mean every linked source was
re-verified that day.

## Runtime data providers

| Source | Data used and how it is used | Where it enters the app | Attribution, licensing, and limits |
| --- | --- | --- | --- |
| [Open-Meteo Forecast API](https://open-meteo.com/en/docs) | `uv_index`, `temperature_2m`, `cloud_cover`, timestamps, and resolved timezone. Current conditions are preferred for the current chart bin when present; hourly model values fill the surrounding bins. Temperature and cloud cover are context only. Cloud percentage never discounts the supplied UV value. Outing UV and temperature averages are app-derived, duration-weighted summaries of hourly values over their overlap with the selected outing; Open-Meteo documents most hourly variables as instantaneous at the indicated hour, so treating them as representative of each hour is a UV Scout approximation, not a provider-supplied period mean. | `src/services/forecast/getHourlyForecast.ts` parses the response into `src/domain/forecast/forecastTypes.ts`; outing aggregation is in `src/domain/outing/calculateOutingForecast.ts`; forecast and outing charts render it in `src/features/forecast/`. | Checked 2026-10-05. Selected for the non-commercial prototype and credited in the UI. Forecasts are model estimates, not personal exposure measurements. Protection guidance uses the outing's peak UV category, not its average. The free API is limited to non-commercial use under its stated terms and CC BY 4.0 attribution; recheck current [terms](https://open-meteo.com/en/terms) before release or any change in use. See [forecast notes](forecast.md). |
| [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api), using GeoNames place data | English place suggestions and coordinates used after the user selects a search result. The app requests up to five suggestions. | `src/services/location/searchPlaces.ts`; selected-place presentation and attribution in `src/features/location/LocationPicker.tsx`. | Checked 2026-10-05. Results are credited to Open-Meteo and GeoNames. The free service is intended for non-commercial use; verify applicable terms/licensing before a commercial release. See [location notes](location.md). |
| [BigDataCloud client-side reverse-geocoding API](https://www.bigdatacloud.com/free-api/free-reverse-geocode-to-city-api) | Best-effort locality/city label derived from the current device coordinates the user chose to share. It labels a place; it does not provide the device coordinates. | `src/services/location/reverseGeocode.ts`, called by the device-location flow in `src/features/location/LocationPicker.tsx`. If lookup fails, the app can keep the generic location label and coordinates. | Provider endpoint and [fair-use policy](https://www.bigdatacloud.com/docs/article/fair-use-policy-for-free-client-side-reverse-geocoding-api) checked 2026-10-05. The policy requires current, permission-based device coordinates and a direct client-side call. BigDataCloud says it receives coordinates alongside request/network signals and uses anonymous pairings to improve IP-geolocation data; account for that in future privacy explanations. The app does not save a location history. Current provider docs name the parameter `latitude`; the implementation currently sends `lat`, so verify endpoint compatibility and align it before relying on this label. See [location notes](location.md). |
| Device operating-system location services via Expo Location | Coordinates from the device only after the user taps the location control and grants foreground permission. | Device-location flow in `src/features/location/LocationPicker.tsx`; `expo-location` requests coordinates, which are passed to the forecast service. | Accuracy and underlying positioning methods depend on the device and OS. Coordinates are not persisted by the first-version app. |

## Scientific and public-health evidence

| Source | Evidence used | Where and how it informs the app | Product choices and caveats |
| --- | --- | --- | --- |
| WHO, [Global Solar UV Index: A Practical Guide](https://www.who.int/publications/i/item/9241590076) and [The UV Index](https://www.who.int/news-room/questions-and-answers/item/radiation-ultraviolet-(uv)-index) | Standard five UV category labels/ranges and plain-language explanation of the index and protection threshold. | Editable category table: `src/domain/uv/uvCategories.json`; lookup/interpreter: `src/domain/uv/getUvCategory.ts`; educational content and source links: `src/features/info/InfoScreen.tsx`. | Decimal values remain visible; rounding to nearest integer with `.5` upward is UV Scout's chosen convention, not a WHO rule. Detailed evidence is in [Info-tab research](info-tab-content-research.md). |
| WHO, [Ultraviolet radiation](https://www.who.int/news-room/fact-sheets/detail/ultraviolet-radiation), [UV Index](https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-%28uv%29-index), and [Protecting against skin cancer](https://www.who.int/news-room/questions-and-answers/item/radiation-protecting-against-skin-cancer) | General protection methods, elevated concern from UVI 3, shade limitations, and reasons to combine shade, clothing, hats, eye protection, and sunscreen. | Rationale for editable guidance in `src/domain/guidance/protectionGuidance.json`, interpreted by `src/domain/guidance/getProtectionGuidance.ts`, and shown by `src/features/outing/OutingForecast.tsx`. | The app groups categories into action bands and does not numerically adjust UV for shade. Guidance is general, not personalized medical advice. Numeric SPF guidance varies between sources, so the current copy avoids prescribing a universal SPF number. See [protection-guidance research](protection-guidance-research.md). |
| US EPA, [UV Index Scale](https://www.epa.gov/sunsafety/uv-index-scale-0), and Environment and Climate Change Canada, [UV index and sun safety](https://www.canada.ca/en/environment-climate-change/services/weather-health/uv-index-sun-safety.html) | Cross-check category groupings and practical guidance; examples also reveal jurisdictional differences such as SPF numbers and local timing advice. | Comparative evidence recorded in `notes/protection-guidance-research.md`; not an API or a separate runtime lookup. | These are comparison sources, not authority for silently adding U.S.- or Canada-specific rules to the international English-first MVP. |
| Open-Meteo, [Weather Forecast API documentation](https://open-meteo.com/en/docs), `cloud_cover` definition; WHO, [UV radiation, clouds and haze](https://www.who.int/news-room/questions-and-answers/item/radiation-ultraviolet-(uv)) | Cloud cover describes the fraction/percentage of sky covered; it is not the percentage of UV blocked. Clouds can reduce UV, but do not guarantee low UV. | Provider value appears with hourly forecast bins; explanatory bands are in `src/domain/weather/cloudCoverBands.json`, interpreted in `src/domain/weather/getCloudCoverBand.ts`, and explained in `src/features/info/InfoScreen.tsx`. | The six cloud labels/ranges are simplified UV Scout wording, not an official cloud classification or UV adjustment. See [Info-tab research](info-tab-content-research.md). |
| NOAA Global Monitoring Laboratory, [solar calculation details](https://gml.noaa.gov/grad/solcalc/calcdetails.html) and [civil twilight glossary](https://gml.noaa.gov/grad/solcalc/glossary.html); [SunCalc](https://github.com/mourner/suncalc) Meeus-style equations and event conventions | Approximate solar event times; civil dawn/dusk use the Sun's centre 6° below the horizon, and sunrise/sunset use the apparent horizon convention. | Pure calculation in `src/domain/daylight/getDaylightEvents.ts`; timestamps are displayed on the shared charts in `src/features/forecast/HourlyUvBarChart.tsx`. No daylight web service is called at runtime. | Times are approximate; refraction, terrain, and polar-day/night cases limit interpretation. NOAA's published precision describes NOAA's implementation, not a verified accuracy claim for UV Scout's calculation. The arc height is illustrative. Full rationale is in [daylight research](daylight-research.md). |

## UV Scout-authored definitions and decisions

These are not external source datasets and should not be presented as official
standards:

- `src/domain/weather/cloudCoverBands.json` maps percentages into readable
  phrases chosen for the app. WHO and Open-Meteo support the explanation and
  units, not these exact phrase boundaries.
- UV decimal rounding, protection category grouping, guidance wording, and the
  choice not to apply a cloud or shade multiplier are documented product rules.
  Their evidence and rationale are in the linked UV and guidance research notes.
- The chart's grayscale day/night arcs and time-dependent sun/moon symbol are
  app-authored illustrations in `src/features/forecast/HourlyUvBarChart.tsx`.
  Only one symbol is shown at a time; the moon means nighttime only, with no
  lunar position, phase, or forecast data used.

## Review checklist for future sources

1. Prefer the original data provider or authoritative primary publication.
2. Name the exact endpoint, dataset, page, fields, publication version/date, or
   calculation definition used; do not cite a broad homepage when a precise
   source exists.
3. Record transformations and assumptions between source and displayed result.
4. Identify the consuming service, domain file, or feature path.
5. Record attribution, licensing, uncertainty, geographic scope, and known
   limitations; separate those from UV Scout's product choices.
6. Update this index and the focused research note alongside the implementation.
