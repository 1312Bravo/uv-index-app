# Data and evidence sources

Updated 2026-10-29. This is the source register for UV Scout. It records the
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
| [Open-Meteo Forecast API](https://open-meteo.com/en/docs) | Modelled current and hourly UV, temperature, cloud cover, precipitation, and wind; the selected location's time zone. The app requests two forecast days. | `src/services/forecast/getHourlyForecast.ts`; current values and hourly charts in `src/features/forecast/`; outing aggregates and guidance in `src/domain/outing/` and `src/domain/guidance/`. Linked credits appear directly below the forecast chart in `src/features/forecast/HourlyUvChart.tsx` and `src/features/outing/OutingForecast.tsx` via `src/ui/SourceAttribution.tsx`; Info > Sources gives details and a CC BY 4.0 link. | API definitions, [terms](https://open-meteo.com/en/terms), and [licence page](https://open-meteo.com/en/licence) checked 2026-10-26. The licence page requires a link near displayed data, CC BY 4.0 credit, and an indication of modifications. The free API is limited to non-commercial use (under 10,000 calls/day, 5,000/hour, and 600/minute; limits apply by IP address and application). UV Scout makes requests directly from each visitor's browser, so a popular public site may encounter shared rate limits. Current conditions are model estimates, not local observations. UV Scout calculates outing summaries, interprets hourly values over outing intervals, and interpolates custom half-hour UV; those are app choices. Forecast accuracy and availability are not guaranteed. Recheck terms and capacity before commercial release. |
| [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api), using GeoNames place data | English place suggestions and coordinates used after the user selects a search result. The app requests up to five suggestions. | `src/services/location/searchPlaces.ts`; results and nearby linked credit in `src/features/location/LocationPicker.tsx`; selected-place presentation and linked credit in `src/features/location/LocationSummary.tsx`; further details in Info > Sources. | API docs checked 2026-10-05; [licence page](https://open-meteo.com/en/licence) and attribution placement checked 2026-10-22. Results are credited to Open-Meteo and GeoNames near where displayed. The free service is intended for non-commercial use; verify applicable terms/licensing before a commercial release. See [location notes](location.md). |
| [BigDataCloud client-side reverse-geocoding API](https://www.bigdatacloud.com/free-api/free-reverse-geocode-to-city-api) | Best-effort locality/city label derived from device coordinates or a map-selected point. It labels a place; it does not provide the coordinates. | `src/services/location/reverseGeocode.ts`, called by device and map flows in `src/features/location/LocationPicker.tsx`. If lookup fails, the app keeps a generic label and coordinates. Provider credit and link are in Sources. | Provider endpoint and [fair-use policy](https://www.bigdatacloud.com/docs/article/fair-use-policy-for-free-client-side-reverse-geocoding-api) checked 2026-10-05; integration checked 2026-10-22. The implementation sends `latitude` and `longitude`. BigDataCloud says it receives coordinates alongside request/network signals and uses anonymous pairings to improve IP-geolocation data; account for that in future privacy explanations. The app does not save a location history. See [location notes](location.md). |
| Device and browser geolocation | On mobile, foreground device permission is requested at startup. If granted, a cached position up to five minutes old and within 2 km accuracy can be shown while a fresh position is requested. On web, the user initiates browser geolocation; a previously granted permission may be detected on startup. | Mobile uses `expo-location` in `src/features/location/LocationPicker.tsx`. Web uses `navigator.geolocation.getCurrentPosition` through `src/services/location/browserGeolocation.ts`, with standard accuracy and a 20-second acquisition timeout; coordinates pass to the forecast service. | Browser behavior follows the [W3C Geolocation API](https://www.w3.org/TR/geolocation/) (checked 2026-10-26). It requires a secure context and user permission; permission is specific to the website origin, so a grant for localhost does not grant access to `uvscout.expo.app`. The browser determines the returned accuracy. Browsers may not support querying permission state; the user-triggered location request still works without that query. Accuracy and underlying methods depend on the browser, device, and OS. UV Scout requests foreground location only and does not persist coordinates or location history. |

### Current precipitation display (checked 2026-10-22)

The UV Outlook's current-weather row requests Open-Meteo `current=precipitation`
and reads `current.interval` and `current.time` alongside the amount. The UI
labels the amount as an accumulation over the preceding interval and shows its
duration and local start/end times (for example, `Previous 15 min: 3:30 PM to
3:45 PM`). Open-Meteo
documents current conditions as based on 15-minute model data; in locations
without native 15-minute data, such values may be interpolated from hourly
data. Therefore the label describes the provider's model interval, not a
rain-gauge measurement or a guaranteed locally observed 15-minute total.

Temperature and cloud cover in the same row are current-condition snapshots
timestamped by `current.time`; they are not averages over the preceding
precipitation interval. Each shows `Latest estimate: [time]` with that timestamp. The
current precipitation amount is not paired with the
hourly precipitation-probability field, whose meaning is the probability of
more than 0.1 mm during the preceding hour. Parsing is in
`src/services/forecast/getHourlyForecast.ts`; interval metadata is carried by
`src/domain/forecast/forecastTypes.ts` and rendered in
`src/features/forecast/CurrentWeatherMetrics.tsx`.

### Selected-location local time (checked 2026-10-17)

- The [Open-Meteo Forecast API](https://open-meteo.com/en/docs) documents
  `timezone=auto`, which resolves a time-zone identifier from requested
  coordinates. On location selection,
  `src/services/location/getLocationTimeZone.ts` requests that identifier with
  `current=temperature_2m`; the returned temperature is discarded.
  `src/features/location/useLocationTimeZone.ts` keeps the result tied to those
  coordinates. Existing full forecast responses can also supply the same
  time-zone field.
- `src/features/location/LocationSummary.tsx` formats the device's current
  instant with `Intl.DateTimeFormat` in that time zone and refreshes the visible
  clock. The selected-location zone also drives scheduled planner controls,
  chart labels, and outing time descriptions. This formatting is a UV Scout
  presentation choice, not a provider-supplied clock reading.
- If no location has been selected yet, the Location tab shows the current
  date and time in the device's own time zone. This is not used as a fallback
  after a location is selected.
- The displayed local time depends on the device clock being correct. A failed
  zone request leaves the clock unavailable until a forecast supplies the zone;
  the app does not substitute the device's own time zone for a selected
  location. The non-commercial Open-Meteo attribution and licensing limits
  stated above also apply here.

### UV Outlook hourly guidance (source checked 2026-10-17)

- [Open-Meteo Forecast API](https://open-meteo.com/en/docs) says its `current`
  conditions are based on 15-minute weather-model data, not a personal UV
  measurement. `src/services/forecast/getHourlyForecast.ts` prefers current UV,
  temperature, and cloud cover for the Now chart bin, falling back to hourly
  model values when needed. `src/features/forecast/HourlyUvChart.tsx` uses that
  bin for the default Now advice and shows the provider's `current.time` in
  the location's time zone when available. Exact local time remains in the
  shared location summary. An on-the-hour custom selection uses the hourly UV
  value; a half-hour selection estimates UV between adjacent hourly values.
  Its cloud reminder uses the containing hour's cloud-cover forecast.
  Forecast requests repeat every 15 minutes while UV Outlook or Plan an Outing
  is open. Each attempt times out after 12 seconds and is retried once before
  the app shows a retry control.
  Open-Meteo remains credited in the UI; its non-commercial licensing and
  grid-cell limitations are described in the provider row above. The refresh
  interval is a UV Scout product choice, not the model's guaranteed update rate.
- WHO's [UV Index Q&A](https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-%28uv%29-index)
  (20 June 2022) describes protection from UVI 3 and stronger precautions at
  UVI 8+. WHO's [skin-cancer protection Q&A](https://www.who.int/news-room/questions-and-answers/item/radiation-protecting-against-skin-cancer)
  (16 July 2024) supports clothing, hat, UV-protective eyewear, shade, and
  broad-spectrum SPF 30+ on uncovered skin. These sources inform the editable
  `src/domain/guidance/hourlyUvGuidance.json` actions, interpreted by
  `getHourlyUvGuidance.ts`. UV Scout uses the same raw 3 and 8 thresholds as
  outing guidance. The five display categories, decimal rounding, the 76%
  cloud reminder trigger, and concise single-hour wording are UV Scout
  choices. Cloud cover never numerically adjusts the forecast UV. This advice
  assumes no activity, duration, personal sensitivity, or measured exposure.
- UV Scout's Now/Custom controls above the UV reading use the existing two-day
  Open-Meteo response. The chart highlights the choice; earlier model hours
  are shown only as context.

#### Low-UV wording review, 2026-10-29

Rechecked WHO's [UV Index Q&A](https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-%28uv%29-index)
(20 June 2022) and [UV radiation fact sheet](https://www.who.int/news-room/fact-sheets/detail/ultraviolet-radiation)
(21 June 2022). The former gives reassuring general advice for UVI 0-2; the
latter recommends sun protection from UVI 3. UV Scout retains its existing
raw-UVI protection bands. In `src/domain/guidance/getHourlyUvGuidance.ts`,
intensity descriptions now also use raw UV thresholds from
`src/domain/uv/uvCategories.json`, rather than the rounded category label.
Values such as 2.5 and 2.9 therefore receive the low-intensity description
alongside the existing no-extra-protection advice for most people. The display
category still rounds as before; the rounding note was removed from UV Outlook.
These wording and presentation decisions are UV Scout choices, not a new WHO
rule or a statement that low UV is harmless. See the
[detailed wording review](protection-guidance-research.md#uv-outlook-low-uv-wording-review-2026-10-29).
  Custom half-hour slots appear in one continuous list with local-day labels at
  date boundaries. This is a presentation choice, not a new provider field or a
  personal exposure calculation.

## Interactive map providers

| Source | Data used and how it is used | Where it enters the app | Attribution, licensing, and limits |
| --- | --- | --- | --- |
| [OpenStreetMap standard raster map tiles](https://operations.osmfoundation.org/policies/tiles/) and [Leaflet](https://leafletjs.com/) | Interactive location picker on web, Android, and iOS. Visible tiles provide geographic context; a user tap sends the selected latitude/longitude to the app. | Web uses bundled Leaflet in `src/features/location/LocationMap.web.tsx`. Native uses `react-native-webview` with Leaflet 1.9.4 assets from unpkg and the same OSM tile endpoint in `src/features/location/LocationMap.native.tsx` and `src/features/location/nativeMapDocument.ts`. Both use `https://tile.openstreetmap.org/{z}/{x}/{y}.png` and show contributor attribution. | OSM tile policy checked 2026-10-09. OSM data is open, but the public standard tile service is capacity-limited and best-effort, not a guaranteed production tile service. The map requests visible tiles on demand; do not bulk-prefetch or add offline downloads. Select a suitable hosted tile provider before commercial/high-volume release. Tile requests disclose the viewed map area to OSM. The native WebView also fetches the pinned Leaflet 1.9.4 JS/CSS from unpkg; if those assets or tiles cannot load, the basemap is unavailable. Selected coordinates are separately sent to the forecast service and, for an optional locality label, BigDataCloud. |

## Scientific and public-health evidence

| Source | Evidence used | Where and how it informs the app | Product choices and caveats |
| --- | --- | --- | --- |
| World Meteorological Organization, *Guide to Meteorological Instruments and Methods of Observation*, WMO-No. 8, seventh edition (2008), Part I, Chapter 14, Annex | Rain-rate ranges: below 2.5 mm/h light, 2.5–below 10 mm/h moderate, 10–below 50 mm/h heavy, and 50 mm/h or more in the highest band. The guide says the intensity values are based on a three-minute measurement period and notes that its highest-band term “violent” can be confusing. | Editable explanatory ranges in `src/domain/weather/precipitationRateGuide.json`, validated by `src/domain/weather/getPrecipitationRateGuide.ts`, and shown only in the Info tab in `src/features/info/InfoScreen.tsx`. | Checked 2026-10-07. These are educational comparisons, not labels applied to the forecast. Open-Meteo provides preceding-hour totals that can include rain, showers, and snow; those totals cannot reveal short bursts, and the outing sum spans multiple hours. UV Scout uses “Very intense rain” as its own wording for the highest range. Detailed rationale is in [Info-tab research](info-tab-content-research.md). The manual is hosted at https://www.weather.gov/media/epz/mesonet/CWOP-WMO8.pdf. |
| U.S. National Weather Service, [Beaufort Wind Scale](https://www.weather.gov/mfl/beaufort) | Beaufort wind force levels and observable land effects, including leaves and twigs moving, branches and trees swaying, and damage at very high wind speeds. Open-Meteo defines hourly `wind_speed_10m` at 10 m for the indicated time. | Land-effect descriptions inform `src/domain/weather/windSpeedBands.json`, validated by `src/domain/weather/getWindSpeedBands.ts`, and displayed in the Info tab. | NWS scale and Open-Meteo API definitions checked 2026-10-10. UV Scout groups Beaufort levels into six wider km/h bands for readability; these are not official Beaufort groups or wind-safety thresholds. Effects vary with local exposure and surroundings. Detailed source/product distinction is in [Info-tab research](info-tab-content-research.md). |
| WHO, [Global Solar UV Index: A Practical Guide](https://www.who.int/publications/i/item/9241590076) (13 June 2002) and [The UV Index](https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-%28uv%29-index) (20 June 2022) | Standard five UV category labels/ranges and plain-language explanation of UVI as a measure of UV level that signals protection needs. The guide is the international communication framework; it is not a personal dose calculator or an outing-profile formula. | Editable category table: `src/domain/uv/uvCategories.json`; category interpreter: `src/domain/uv/getUvCategory.ts`; WHO's separate general action table: `src/domain/guidance/whoGuidance.json`, validated and returned for Info by `src/domain/guidance/getWhoGuidance.ts`; UV Scout outing interpretation: wording in `src/domain/guidance/uvScoutInsight.json`, active thresholds/factor policy in `src/domain/guidance/uvScoutRecommendationRules.json`, interpreted by `src/domain/guidance/getUvScoutInsight.ts`; outing profile and coverage metrics: `src/domain/outing/calculateOutingForecast.ts`; rendered by `src/features/info/InfoScreen.tsx` and `src/features/outing/OutingForecast.tsx`. | Decimal values remain visible; nearest-integer rounding with `.5` upward for displayed categories is UV Scout's convention, not a WHO rule. WHO's general action table uses 0–2, 3–7, and 8+; it is not selected from an outing's peak. UV Scout's separate outing profile combines estimated band time, peak/time, average, continuity, and coverage. Time-band and continuity summaries are approximate, not personal dose or validated health-risk scores. The 2002 guide is CC BY-NC-SA 3.0 IGO; respect its terms for reuse of its materials. Detailed evidence is in [Info-tab research](info-tab-content-research.md), [protection-guidance research](protection-guidance-research.md), [model research](recommendation-model-research.md), and the [implemented recommendation slice](recommendation-tree-draft.md). |
| WHO, [Ultraviolet radiation](https://www.who.int/news-room/fact-sheets/detail/ultraviolet-radiation), [UV Index](https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-%28uv%29-index), [Protecting against skin cancer](https://www.who.int/news-room/questions-and-answers/item/radiation-protecting-against-skin-cancer), and [The known health effects of UV radiation](https://www.who.int/news-room/questions-and-answers/item/radiation-the-known-health-effects-of-ultraviolet-radiation) | General protection methods, environmental UV drivers, elevated concern from UVI 3, shade limitations, risk groups, and evidence that duration/frequency and cumulative exposure matter over a lifetime. WHO's 20 June 2022 UV Index Q&A gives the 0–2, 3–7, and 8+ action bands and says higher UVI means greater potential for harm and less time before harm can occur. WHO's 16 July 2024 skin-cancer Q&A recommends broad-spectrum SPF 30+, liberal and even application, and reapplication every two hours, particularly after sweating, swimming, or drying off; it also says sunscreen should not be used to extend time in the sun. WHO recommends protective clothing, a broad-brimmed hat, UV-protective sunglasses, and shade when UV is strongest, noting shade is incomplete protection. The 9 March 2016 UV radiation Q&A says clouds generally reduce UV but may not prevent elevated UV, and reflected UV varies by surface. | WHO's UV thresholds/actions inform `whoGuidance.json` and its Info reference. Evidence informs UV Scout wording/rules in `uvScoutInsight.json`, `uvScoutRecommendationRules.json`, and `getUvScoutInsight.ts`. Outing actions include local-time windows for raw UVI 3+ and 8+. A smaller cloud-context note appears only when at least 76% cloud cover (the existing “very cloudy” product band) overlaps with raw UVI 3+; cloud cover never modifies forecast UV. When covered UVI reaches 3, the app gives clothing/eye/shade and SPF 30+ guidance. General two-hour sunscreen reapplication wording appears whenever sunscreen is recommended, conditional on use and without treating forecast hours as a personal timer; after-water/sweat advice remains. Reflective-surface context is conditional, not a forecast claim. | WHO UV Index and skin-cancer Q&A pages rechecked 2026-10-13; the cited UV radiation page is dated 9 March 2016 and skin-cancer Q&A 16 July 2024. SPF 30+ follows WHO's detailed page. The 76% trigger reuses UV Scout's existing cloudy-sky display band and is not a health threshold. Guidance is general, not personalized medical advice. |
| U.S. EPA, [UV Index Scale](https://www.epa.gov/sunsafety/uv-index-scale-0), and [Learn About the UV Index](https://www.epa.gov/sunsafety/learn-about-uv-index); Environment and Climate Change Canada, [UV index and sun safety](https://www.canada.ca/en/environment-climate-change/services/weather-health/uv-index-sun-safety.html) | Cross-check category groupings and practical guidance; EPA's description of the U.S. National Weather Service model illustrates ozone, cloud, elevation, solar-geometry, and erythema-weighting inputs. | Comparative evidence recorded in `notes/protection-guidance-research.md` and `notes/recommendation-model-research.md`; not an API or a separate runtime lookup. | EPA's model description is specific to the U.S. forecast system and is not assumed to document Open-Meteo's exact model internals. Jurisdiction-specific SPF numbers and clock-time advice are not silently turned into universal app rules. |
| U.S. FDA, [The Sun and Your Medicine](https://www.fda.gov/drugs/understanding-over-counter-medicines/sun-and-your-medicine) | SPF is not a promise of burn-free duration; time, season, location, altitude, weather, sunscreen application/reapplication, physical activity, swimming/heavy sweating, and some medicines can affect exposure or photosensitivity. | Cited for the candidate factor inventory and limits in `notes/recommendation-model-research.md`. No medicine lookup, personal profile, combined risk formula, or FDA-derived runtime rule is implemented. | Checked 2026-10-06; page publication/update date is not displayed. U.S. consumer guidance and examples are not an exhaustive medicine database or individualized medical advice. |
| U.S. FDA, [Sunscreen: How to Help Protect Your Skin from the Sun](https://www.fda.gov/drugs/understanding-over-counter-medicines/sunscreen-how-help-protect-your-skin-sun) | Consumer guidance on broad-spectrum SPF, generous application (about 1 oz for an average adult/child full-body application), applying 15 minutes before exposure, reapplying at least every two hours and more often when swimming/sweating, and U.S. water-resistance label periods of 40/80 minutes. Also states SPF is not a time multiplier. | Comparative evidence and caveats in `notes/recommendation-model-research.md`; no product-specific sunscreen timer, dose calculation, or FDA rule is implemented. | Checked 2026-10-06. U.S. FDA consumer/regulatory guidance; amount is a full-body example and label claims are U.S.-specific. Follow the user's product directions; do not globalize U.S. 40/80-minute labels. |
| American Academy of Dermatology, [How to Apply Sunscreen](https://www.aad.org/public/everyday-care/sun-protection/shade-clothing-sunscreen/how-to-apply-sunscreen) | Dermatologist guidance on broad-spectrum, water-resistant SPF 30+, applying before going outdoors, about 1 oz for most adults covering exposed body skin (more may be needed), and reapplying every two hours and after swimming/sweating. | Independent professional-society cross-check in `notes/recommendation-model-research.md`; not a runtime data source or a UV Scout medical endorsement. | Last updated 2025-08-15; checked 2026-10-06. U.S.-based professional guidance; distinguish it from WHO/global advice and local product labeling. |
| Open-Meteo, [Weather Forecast API documentation](https://open-meteo.com/en/docs), `cloud_cover` definition; WHO, [UV radiation, clouds and haze](https://www.who.int/news-room/questions-and-answers/item/radiation-ultraviolet-(uv)) | Cloud cover describes the fraction/percentage of sky covered; it is not the percentage of UV blocked. Clouds can reduce UV, but do not guarantee low UV. | Provider value appears with hourly forecast bins; explanatory bands are in `src/domain/weather/cloudCoverBands.json`, interpreted in `src/domain/weather/getCloudCoverBand.ts`, and explained in `src/features/info/InfoScreen.tsx`. | The six cloud labels/ranges are simplified UV Scout wording, not an official cloud classification or UV adjustment. See [Info-tab research](info-tab-content-research.md). |
| NOAA Global Monitoring Laboratory, [solar calculation details](https://gml.noaa.gov/grad/solcalc/calcdetails.html) and [civil twilight glossary](https://gml.noaa.gov/grad/solcalc/glossary.html); [SunCalc](https://github.com/mourner/suncalc) Meeus-style equations and event conventions | Approximate solar event times; civil dawn/dusk use the Sun's centre 6° below the horizon, and sunrise/sunset use the apparent horizon convention. | Pure calculation in `src/domain/daylight/getDaylightEvents.ts`; timestamps are displayed on the shared charts in `src/features/forecast/HourlyUvBarChart.tsx`. No daylight web service is called at runtime. | Times are approximate; refraction, terrain, and polar-day/night cases limit interpretation. NOAA's published precision describes NOAA's implementation, not a verified accuracy claim for UV Scout's calculation. The arc height is illustrative. Full rationale is in [daylight research](daylight-research.md). |

### Info-tab wording review, 2026-10-17

Rechecked WHO's [UV Index Q&A](https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-%28uv%29-index)
(20 June 2022), [skin-cancer protection Q&A](https://www.who.int/news-room/questions-and-answers/item/radiation-protecting-against-skin-cancer)
(16 July 2024), and [UV radiation Q&A](https://www.who.int/news-room/questions-and-answers/item/radiation-ultraviolet-(uv))
(9 March 2016), plus the [Open-Meteo forecast field definitions](https://open-meteo.com/en/docs).
The Info tab keeps explanations needed to read the values, and omits internal
rounding mechanics, repeated cloud cautions, and technical wind-height details.
WHO's three action bands remain in `src/domain/guidance/whoGuidance.json`; the
calculator thresholds and outing recommendation rules did not change. UV
category rounding, simplified cloud/wind labels, and hourly rain comparisons
remain product interpretations.
The WMO rain-rate and NWS wind-scale references were not rechecked in this
wording pass. See [Info-tab research](info-tab-content-research.md).

### Active UV-guidance review, 2026-10-15

Rechecked the WHO [UV Index Q&A](https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-%28uv%29-index)
(dated 20 June 2022), WHO [skin-cancer protection Q&A](https://www.who.int/news-room/questions-and-answers/item/radiation-protecting-against-skin-cancer)
(dated 16 July 2024), [Open-Meteo forecast documentation](https://open-meteo.com/en/docs),
WHO [known health effects of UV radiation](https://www.who.int/news-room/questions-and-answers/item/radiation-the-known-health-effects-of-ultraviolet-radiation),
and [FDA sunscreen consumer guidance](https://www.fda.gov/drugs/understanding-over-counter-medicines/sunscreen-how-help-protect-your-skin-sun).
No new runtime provider or personal-risk formula was added. WHO's UVI 3
protection threshold, stronger protection at UVI 8+, and clothing, shade,
eyewear, and sunscreen advice inform the editable text and rules in
`src/domain/guidance/uvScoutInsight.json` and
`src/domain/guidance/uvScoutRecommendationRules.json`; the interpreter is
`src/domain/guidance/getUvScoutInsight.ts`. FDA is a U.S. comparative source
for sunscreen-label and reapplication wording, not a separate rule engine.
Open-Meteo provides hourly forecast values, transformed into covered outing
durations by `src/domain/outing/calculateOutingForecast.ts`; it does not
provide outing advice. The UI in `src/features/outing/OutingForecast.tsx` now
shows a short forecast-based UV takeaway in bullets, then a flat UV breakdown.
The opening's first bullet combines covered UV range, duration-weighted
average, and peak hour. Its second bullet gives local-time protection actions
for each consecutive raw-UV band window: below 3, 3 to below 8, and 8 or
higher. Only in that opening bullet, each displayed start is rounded down and
each end rounded up to a half-hour boundary in the selected location's time
zone and marked "around"; this does not alter provider values, actual outing
overlaps, durations, or the more precise detailed time lines. Recommendation
times use hours alone for one local day, or full weekday names across days;
that display choice uses the provider-resolved timezone. For a steady
forecast the first bullet uses a shorter
level-and-duration line; all-below-3 outings keep their low-UV outcome.
These are UV Scout presentation choices, not WHO's own combined
recommendation algorithm. WHO's known-health-effects Q&A links duration and
frequency of exposure with longer-term harm, but supplies no personal safe-time
cutoff for this app.
UV breakdown describes the first and last covered hourly values, the
duration-weighted average, the highest and lowest displayed hourly values and
their total covered durations/local-time windows, and any intervening values
and their total duration. It totals below-3 windows when lower UV spans more
than the minimum value alone. Protection steps name the first forecast UVI 3+
start and the total time at UVI 3+ or 8+ in the main action text; exact windows
stay beneath the matching actions. These combinations are UV Scout presentation
choices. Smaller cloud and reflective-surface notes follow when relevant. Low-UV
outings keep the practical outcome in the takeaway without a duplicate steps
section.
Trend grouping uses one-decimal displayed values, while protection decisions
continue to use raw UVI; this is a UV Scout presentation choice, not a WHO
calculation. Rechecked the WHO UV Index Q&A for the UVI 3+ protection
threshold on 2026-10-14.
These descriptive values come from the same forecast and do
not alter the protection rules.
The two-hour reapplication interval comes from WHO sunscreen guidance, not
an outing-duration threshold; UV Scout chooses to show it with all UVI 3+
outings where sunscreen is recommended. Cloud-overlap wording and takeaway
composition are UV Scout choices, not a personal dose estimate. Full active
behavior, scenarios, attribution, and
limitations are in [active UV guidance](active-uv-guidance.md); earlier row
descriptions of the full profile refer to calculations, not all currently
displayed guidance bullets. Recheck provider terms before commercial release.

Open-Meteo defines hourly UV as the mean of the preceding hour (rechecked
2026-10-31). The earlier forward-hour interpretation was incorrect and is
superseded by [the interval correction](uv-hourly-timing-review.md).
`src/domain/outing/outingUvIntervals.ts` normalizes the UV periods used by
`calculateOutingForecast.ts` and `getUvScoutInsight.ts`. Weighting part of an
hour by its full hourly mean remains a UV Scout approximation, not a
provider-issued minute-by-minute forecast.

## UV Scout-authored definitions and decisions

These are not external source datasets and should not be presented as official
standards:

- `src/domain/weather/cloudCoverBands.json` maps percentages into readable
  phrases chosen for the app. WHO and Open-Meteo support the explanation and
  units, not these exact phrase boundaries.
- `src/domain/weather/windSpeedBands.json` groups land-based Beaufort levels into
  readable ranges. The underlying effects are source-backed; the six combined
  bands and concise wording are UV Scout choices.
- UV decimal rounding for category display, raw-UVI protection thresholds,
  guidance wording, and the choice not to apply a cloud or shade multiplier are
  documented product rules. Their evidence and rationale are in the linked UV
  and guidance research notes.
- The chart's grayscale day/night arcs and time-dependent sun/moon symbol are
  app-authored illustrations in `src/features/forecast/HourlyUvBarChart.tsx`.
  Only one symbol is shown at a time; the moon means nighttime only, with no
  lunar position, phase, or forecast data used.

## Outing guidance presentation check (17 October 2026)

[WHO's UV Index Q&A](https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-%28uv%29-index)
(20 June 2022) and [WHO's skin-cancer protection Q&A](https://www.who.int/news-room/questions-and-answers/item/radiation-protecting-against-skin-cancer)
(16 July 2024) were rechecked on 17 October 2026. They continue to support
UVI 3 protection guidance, stronger precautions at UVI 8+, and general
two-hour sunscreen reapplication advice. Neither source specifies how an app
should summarize alternating hourly forecast bands or explain its own rounded
display category. The five-window wording switch, grouped time labels,
conditional category note, and shorter sunscreen sentence are UV Scout
presentation choices in `src/domain/guidance/uvScoutRecommendationRules.json`,
`src/domain/guidance/uvScoutInsight.json`, and
`src/domain/guidance/getUvScoutInsight.ts`. The note is rendered by
`src/features/outing/OutingForecast.tsx`. Raw UVI 3 and 8 triggers, forecast
values, and protection actions did not change. See
[the output review](outing-guidance-output-review.md) and
[active rules](active-uv-guidance.md) for rationale and limitations.

### UV Outlook time selector update, 2026-10-18

The Now control is labeled simply “Now”; exact local time remains in the
shared location summary, and the estimate still displays Open-Meteo's
current-conditions timestamp when supplied. Custom time is one compact,
scrollable list of available future half-hour choices, labeled Today and
Tomorrow at local date boundaries. On-the-hour choices use the Open-Meteo
hourly value; half-hour UV is interpolated between adjacent hourly values.
The chart keeps the provider's hourly values and highlights the containing
hour. The last half-hour choice is omitted when the next hourly value is
unavailable. These are UV Scout presentation and calculation choices.
The behavior is implemented in `src/features/forecast/OutlookTimeSelector.tsx`
and `src/features/forecast/HourlyUvChart.tsx`, with the calculation in
`src/domain/forecast/getUvForecastAtTime.ts`.

Open-Meteo's [Forecast API documentation](https://open-meteo.com/en/docs)
states that most hourly values represent the indicated hour. Its current
conditions use 15-minute model data. Checked 2026-10-18. UV Scout linearly
interpolates half-hour UV: the estimate is halfway between the two surrounding
hourly `uv_index` values. It uses that unrounded estimate for the displayed
category and single-hour protection guidance, while the chart shows the source
hourly values. Interpolation does not add weather-model detail, account for
changes between the hourly samples, or provide a personal UV measurement.

### Outing UV preview, 2026-10-19

Plan an Outing uses the Open-Meteo hourly `uv_index` values in a compact UV-only
preview before the guidance. `src/domain/outing/calculateOutingForecast.ts`
now selects UV intervals using their preceding-hour meaning. The compact
`src/features/outing/OutingUvTimeline.tsx` uses original hourly means and
source endpoint labels separately from `summary.hours`. Each displayed bin
covers a full forecast hour, so an outing from 9:23 to 10:13 displays the
9:00-11:00 hours. Showing whole overlapping hours and placing this chart before
the guidance are UV Scout presentation choices. The chart does not add forecast
detail or change the outing guidance's overlap-weighted calculations. The
forecast provider, attribution, and limitations remain as recorded above.

### Outing wind summary, 2026-10-31

The outing summary reuses the Open-Meteo hourly `wind_speed_10m` readings
already fetched and parsed into `ForecastHour.windSpeed` in km/h. No new API
fields or provider were added. `src/domain/outing/calculateOutingForecast.ts`
weights available readings by their overlap with the selected outing, and
returns their minimum and maximum. Missing readings contribute neither zero
wind nor time to the average; an entirely missing series returns null values.
`src/features/outing/OutingForecastMetrics.tsx` rounds these results to whole
km/h for the 2x2 weather summary. These interval and rounding choices are UV
Scout's interpretation of model readings, not provider-supplied outing
statistics. The range describes available hourly speeds, not gusts or
within-hour variability. Existing Open-Meteo attribution and limits apply.

### Hourly UV interval definition, checked 2026-10-31

The Open-Meteo Forecast API parameter table defines hourly `uv_index` as the
average of the preceding hour, rather than an instantaneous timestamp value.
This supersedes earlier timestamp assumptions in the outing and custom-time
interpolation notes above. Outing calculations and guidance now use the
preceding-hour intervals and preserve raw hourly means separately from Now.
Custom-time smoothing in UV Outlook remains a separate review item.
See [hourly UV timing review](uv-hourly-timing-review.md)
for affected code, the reported example, and source facts versus product
choices. The existing source credit, licence, and model limitations apply.

### Outing gust summary, checked 2026-10-31

The [Open-Meteo Forecast API](https://open-meteo.com/en/docs) defines hourly
`wind_gusts_10m` as the preceding-hour maximum at 10 m, in km/h by default.
The unversioned parameter table was checked 2026-10-31. The forecast service
now requests that field and preserves it separately from current wind speed.
`src/domain/outing/calculateOutingForecast.ts` calculates an overlap-weighted
average of available hourly maxima and their minimum/maximum;
`src/features/outing/OutingForecastMetrics.tsx` displays them in the wind cell.
These outing statistics are UV Scout choices, not instantaneous gust forecasts
or wind-safety guidance. Partial hours may include peaks outside the selected
minutes. See [wind and gust summary](wind-gust-summary.md) for definitions,
missing-data handling, transformations, and code paths. Existing Open-Meteo
attribution, licence, model limitations, and usage limits apply.

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
