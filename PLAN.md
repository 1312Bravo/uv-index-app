# UV Scout Plan

## Goal

Build a simple Expo + React Native + TypeScript app for Android and web that
helps people plan outdoor time around the current and forecast UV index.

## Current Understanding

- An Expo + React Native + TypeScript app is installed, with Android and web
  support. Device location, manual place search, and today's remaining UV trend
  with temperature, cloud cover, precipitation, and hourly wind context are
  implemented.
- The app should support Android and web from the beginning.
- Keep the phone layout unchanged. On wider web screens, use more of the
  available width. Keep Location, Plan an Outing, and Info in centered,
  single-column layouts with wider content than on the phone.
- Open-Meteo is the weather and UV data source for the non-commercial MVP.
- The initial use case is UV exposure guidance for outdoor activities.
- UV Scout focuses on UV-aware decisions for outings happening now or planned
  for today or tomorrow within the available local forecast. It is not a
  long-range planner or a general-purpose weather app.
- The first version is for general outdoor users, in English.
- Location should support device location, place search, and map selection on
  Android and web.
- The first version has no accounts or history.
- The central flow asks for a place, start time, and duration or end time. The
  planner does not ask the user to classify shade; guidance recommends general
  shade use without treating it as a numeric UV adjustment.
- Plan an Outing defaults to a selected timeframe from Now for 4 hours.
  Forecast metrics, UV breakdown, and protection guidance use this timeframe.
  The charts include hourly context around it without changing those calculations.
- Before the outing guidance, show a compact UV chart of the hourly bins that
  overlap the selected outing, plus the full forecast bin at the next hourly
  boundary when available. Show all values and the bar for that final bin too.
  Guidance and averages still use only the selected outing period.
- In the outing weather chart, show one hour before the outing and then continue
  through the available forecast. Shade selected outing hours with a very light
  grey background; extend the sun/moon trace to the chart's final bin.
- Scheduled start and end fields use the selected location's local time zone,
  not the device's time zone. When the selected location changes, preserve the
  chosen local calendar date and clock time, then resolve them in the new
  location's time zone before recalculating the forecast.
- End-time mode offers a compact list of future local half-hour times through
  tomorrow. Selecting a time keeps the list open; tap its row to close it.
- Show the selected location's current local date and time beside its name and
  coordinates in the shared header on the first three tabs. Resolve the zone as
  soon as a location is selected, and use it consistently for planner and
  forecast times.
- If the user switches from Now to a scheduled outing, offer only future times
  relative to the current time at the selected location.
- UV Outlook shows a horizontal UV trend from one earlier hourly bin through
  the end of tomorrow. Its initial position keeps Now near the left. The chart
  crosses local day boundaries. Now and Custom time controls above the UV reading
  choose the forecast time; the chart reflects that choice.
- UV Outlook defaults to a `Now` choice without a clock in its label; exact
  local time remains in the shared location summary. Custom time is the
  alternate choice above the UV reading and opens one compact list of future
  half-hour slots through tomorrow, with day labels inside the list. The selected
  time is centered and shows its full local date and time. Each custom
  time on the hour uses the hourly forecast value; half-hour UV is estimated
  between adjacent hourly values and labeled approximate. Earlier bins
  remain context only. Single-hour guidance assumes no outing duration. Show
  the provider's current-conditions timestamp for Now. Refresh the open outlook
  about every 15 minutes.
- Keep the full two local forecast days available to Plan an Outing and UV Outlook
  through tomorrow's end. Explain the forecast boundary when a planned outing
  extends beyond it.
- The result combines a rounded display category, a forecast over the selected
  time, and practical guidance. Show WHO's general 0-2, 3-7, and 8+ reference
  table in Info. The outing result is UV Scout's own rule-based interpretation
  of covered raw-UV hours: an untitled actionable takeaway in short bullets
  first. The first bullet summarizes the covered range/average; the second
  follows up to four forecast windows in time order with a protection action
  for each lower-UV, UVI 3-to-below-8, or UVI 8+ window. Five or more windows
  are grouped by UV band so repeated actions appear once. Its displayed starts round
  down and ends round up to the local half hour, with "around" wording; exact
  times still drive calculations. Then a UV breakdown list gives
  start/end, average, highest and lowest
  values with their durations and windows, and intervening values with their
  duration. In mixed outings, it totals below-3 time separately only when
  that time is not already fully described by the lowest-value bullet.
  Protection steps are ordered by action: sunscreen preparation, clothing
  and shade, extra care during 8+ hours when present, and sunscreen
  reapplication. The main action text names when UV protection first becomes
  relevant and how long UVI 3+ or 8+ is forecast; smaller lines retain the
  exact local-time windows. Recommendation times use hours alone for a
  single local day and full weekday names for outings crossing days.
  Reapplication remains conditional on sunscreen
  use and when it was applied. The opening guidance identifies lower-UV windows;
  an entirely below-3 outing keeps its short protection bullet and one practical
  item under Protection steps. General sunscreen
  reapplication guidance appears whenever
  sunscreen is recommended, not only after two hours of elevated forecast UV.
  Cloud and reflective-surface notes are visually secondary. The 2x2
  card still shows the average. A small note explains when the rounded display
  category crosses a raw-UVI protection threshold. This is not a personal dose or medical-risk
  calculation. Do not present the WHO table as an outing-specific algorithm.
  Default planning requires no extra protection-context choices; unknown
  conditions stay conditional.
- Introduce what the UV Index measures in a short explanation near the start
  of the app; explain the selected UV category and precautions in each result.
- Compare equally long earlier and later outings using forecast UV, but only
  show comparison start times that are still in the future.
- Show civil dawn, sunrise, sunset, and civil dusk for the selected location.
- Show forecast outdoor temperature next to UV for context; do not use temperature
  as a UV-risk input or infer clothing from it.
- Show hourly cloud cover as separate weather context; use the provider's regular
  UV forecast as the UV value and never apply an additional cloud-percentage discount.
- Show hourly precipitation chance and expected amount as separate weather
  context below each chart time. Preserve the provider's preceding-hour meaning;
  do not present combined hourly probabilities as an outing-wide chance.
- Show hourly wind speed as separate weather context below precipitation; do not
  use wind to adjust the UV forecast or protection guidance.
- Summarize outings in four compact metrics: UV peak/average, temperature
  average/range, cloud-cover average/range, and expected precipitation with the
  peak hourly chance. Sum rain only across complete preceding-hour intervals;
  do not prorate partial hours or combine probabilities.
- Use the same compact hourly UV bar chart in the outlook and outing result, with
  cloud-cover percentage and temperature above each bar, and precipitation values
  and wind speed below each hour label.
- Keep a final, always-available Info tab with the UV category mapping and a
  plain-language guide to cloud cover and wind speeds.
- Present Info topics as vertically stacked disclosures, with none expanded at
  first and no more than one topic open at a time.
- Keep detailed source explanations in a final, collapsed Sources topic within
  Info. Show a small linked Open-Meteo credit below the forecast chart on UV
  Outlook and Plan an Outing, and a linked place-data credit next to search
  results and selected searched places. Keep OpenStreetMap attribution on the
  map itself. Describe WHO as the source of general protection guidance and UV
  Scout as the author of outing-specific rules and recommendations.
- Keep the interface minimal, with a small number of clear inputs and an easy-to-read result.
- Maintain a source register that identifies the origin, app usage, code/data
  location, and relevant limitations for external data and evidence.

## Critical Review

- The first version should answer one clear question: “What UV should I expect
  during my planned time outside, and how should I prepare?”
- We should avoid accounts, social features, and a large health platform until
  the core recommendation is useful.
- UV guidance must be presented as general information, not medical advice.
- Weather and UV APIs can be unavailable or rate-limited, so loading, stale,
  missing-location, and error states need to be part of the MVP.
- Keep UV protection as the product's main purpose. Temperature, cloud cover,
  precipitation, and wind support outing decisions but must not displace UV
  guidance or imply a complete general-weather service.
- Forecasts are estimates of expected conditions, not measurements of personal
  exposure. Make incomplete outing coverage explicit.

## Proposed Direction

Start with a location-based MVP:

1. User searches for a place or chooses to share device location on Android or web.
2. Plan an Outing defaults to Now for 4 hours and immediately shows the outing
   assessment. The user may choose a future start, change the duration, or set
   an end time. Do not require a shade or other protection-context selection.
3. The app shows hourly UV, temperature, cloud cover, and precipitation context
   for that period, its highest UV category, and an explanation of what that
   category means.
4. WHO's general reference is available in Info. Outing guidance is a separate
  UV Scout interpretation of the whole covered UV profile: band durations,
  peak/time, average, continuity, and coverage. Weather variables, daylight,
  route shade, clothing, and personal conditions are not UV multipliers; only
   known factors can tailor wording, while unknown reflective/sunscreen-after-
   conditions may appear only as brief conditional context.
5. The app compares future earlier/later starts for the same duration and
   explains why the selected UV pattern matters without presenting a personal
   dose or “safe time” calculation.
6. Daylight markers reveal whether the planned or compared outings include
   civil twilight or darkness.

Keep the first architecture simple and stateless. Add accounts and history only
after the core flow has been tested.

## Remaining recommendation-model decisions

- Whether people find the takeaway, Breakdown, and action list clear in real
  outing examples; revise after user testing rather than adding more metrics.
- Whether to add separate episode counts or an explicitly labelled UVI-hours
  ambient proxy; neither is currently shown.
- Whether an optional tailoring section would add enough value to justify
  asking about sunscreen use, swimming or sweating, clothing, and reflective
  surroundings. Current guidance uses only known forecast inputs.
- How far ahead planning should work.
- Revisit Open-Meteo's commercial licence and capacity before a commercial release.
- Exact result wording, including future-only time comparisons and daylight flags.

Implementation details that can be settled while building: civil twilight
calculation, supported platform versions, and the final visual polish.

## Tasks

- [x] Confirm general outdoor users, English, and no accounts or history.
- [x] Name the app `UV Scout`.
- [x] Confirm device location plus manual place selection.
- [x] Confirm place and outing time as the central flow, without requiring a
  shade selection.
- [x] Confirm a combined UV category, time-window forecast, and practical guidance.
- [x] Confirm educational explanations, neutral earlier/later comparisons, and
  dawn/sunrise/sunset/dusk context.
- [x] Place the general UV explanation near the start of the app and keep the
  per-outing result focused on that forecast.
- [x] Keep earlier/later comparisons in the future.
- [x] Default the selected outing to Now for 4 hours, with controls to change
  duration or set an end time.
- [x] First show a rolling 1-past / Now / subsequent hourly UV trend independently
  of the outing timeframe; later extend selection through tomorrow.
- [x] Choose Open-Meteo for keyless UV and temperature forecasts in the prototype.
- [x] Confirm and implement the first recommendation rules and safety wording.
- [x] Scaffold the Expo project with Android and web support.
- [x] Add initial run and preview instructions.
- [x] Add on-demand device location selection with permission and error states.
- [x] Add manual place search for Android and web.
- [x] Add tappable map selection on Android and web, with an unselected
  Europe-centered default, recentering for search/device selection, and
  best-effort place labels for tapped coordinates.
- [x] Connect selected location to the rolling UV and temperature chart.
- [x] Add Now/scheduled start, duration presets including 3 hours, custom duration,
  and explicit end-time mode.
- [x] Move the planner to a third tab reached after Location and UV Outlook.
- [x] Add native Android and browser date/time pickers.
- [x] Add text-only `UV Outlook` and `Plan an Outing` tabs below the app header,
  with the outlook tab selected by default.
- [x] Add the selected-outing hourly UV and temperature forecast plus its highest
  UV Index category.
- [x] Show the outing forecast and baseline UV guidance without requiring shade
  input; give concise general shade guidance.
- [x] Add duration-weighted average UV and temperature summaries while keeping
  guidance based on peak UV; highlight the whole outing with balanced faint chart
  context around it.
- [x] Add a 2×2 outing summary for peak/average UV, average/range temperature,
  average/range cloud cover, and precipitation amount plus peak hourly chance.
- [x] Implement peak-based protection levels using raw UV, separate from display
  category rounding.
- [x] Add the outing recommendation profile: duration by UV band, continuous
  elevated intervals, forecast-coverage caveat, and actionable protection
  steps conditioned on the covered UV profile.
- [x] Review and broaden UV Scout's recommendation evidence/scenarios; separate
  active editable policy (`uvScoutRecommendationRules.json`) from user-facing
  wording and validate the active policy in the domain interpreter.
- [x] Add hourly cloud cover as separate context and use a shared hourly bar chart
  for the outlook and selected outing.
- [x] Add hourly wind speed below the precipitation values in both forecast charts;
  keep it separate from UV Scout's protection guidance.
- [x] Add an Info guide to grouped land-based wind-speed ranges.
- [x] Retain both requested forecast days for outing planning and later UV
  Outlook selection; explain when an outing exceeds the returned forecast horizon.
- [x] Add an always-available final Info tab explaining UV categories, decimal
  category rounding, and cloud-cover percentages.
- [x] Render the validated WHO general action table in the UV Info topic.
- [x] Add executable domain tests for UV, outing aggregation, and guidance boundaries.
- [x] Group Info explanations under vertically stacked topics, collapsed by
  default.
- [x] Add a shared daylight track with civil dawn, sunrise, sunset, and civil
  dusk markers above the hourly bars in UV Outlook and Plan an Outing.
- [x] Show one time-dependent celestial icon on the forecast timeline: sun by
  day and moon at night, each following its matching arc.
- [x] Keep outing choices when switching tabs or changing location, explain
  when the new forecast cannot cover them, and add Reset for outing choices
  only while preserving the selected location.
- [x] Use the normal outing assessment for the default Now-to-4-hours selection,
  including metrics, UV breakdown, protection guidance, and hourly chart.
- [x] Add a central source register and require it to be updated when app data
  providers, scientific evidence, or calculation references are introduced.
- [x] Add Info > Sources for detailed links and methods, with concise linked
  Open-Meteo credits near the displayed forecast and place-search data.
- [x] Review the active outing rules and copy, give low-UV hours a practical
  action, and document the current model separately from older research drafts.
- [x] Restore the descriptive UV profile bullets in their own section while
  preserving the practical guidance.
- [x] Replace the bottom Summary with an actionable opening takeaway, followed
  by Breakdown and Protection steps.
- [x] Turn the Breakdown's separate metric bullets into a numerical outing
  narrative grouped into a few bullets, with relevant local-time higher-UV windows.
- [x] Make the opening takeaway and UV trend scannable with bullets; lead the
  trend with maximum, minimum, and intervening values and their durations while
  keeping raw UVI 3+ and 8+ timing as supporting protection context.
- [x] Remove the UV trend and Protection timing subtitles from Breakdown;
  keep its forecast bullets and place raw UVI 3+/8+ timing beneath the
  matching protection steps.
- [x] Remove the cumulative UVI 3+ gate for sunscreen reapplication wording;
  keep the standard reminder conditional on using sunscreen, shorten the
  takeaway, and separate conditional context from main protection steps.
- [x] Make the opening a compact whole-outing UV profile and matched action;
  distinguish lower-UV hours in mixed outings and retain protection windows
  in the detailed steps.
- [x] Replace the opening's generic action sentence with protection matched to
  each consecutive forecast window, in local-time order. Keep the first bullet,
  Breakdown, and detailed Protection steps intact.
- [x] Make opening protection times approximate by rounding window starts down
  and ends up to local half hours; leave calculation and detailed times exact.
- [x] Clarify the remaining-value wording in the UV breakdown, keep lower-UV timing
  there when it adds information, and reorder Protection steps by action
  without changing the opening guidance or the protection thresholds.
- [x] Make the detailed Protection steps reflect the selected outing: name the
  first forecast UVI 3+ start when it is later, put UVI 3+/8+ durations in the
  action text, and keep exact windows below the matching actions.
- [x] Keep recommendation time labels compact: show hours for one local day;
  add weekday names when the selected outing crosses local days.
- [x] Show Protection steps for every outing with forecast coverage. For UV
  below 3, keep the short protection bullet in UV guidance and add a concrete
  sunscreen step under Protection steps.
- [x] Add a compact current UV estimate and protection actions to UV Outlook,
  using the existing raw UV bands and relevant cloud context.
- [x] Add Now/Custom time controls above UV Outlook's reading. Custom time
  offers future half-hour choices across local days, updates the UV value and
  guidance, and highlights the containing chart bin. Keep past bins as context only.

## Decisions

- Use `UV Scout` as the user-facing app name. Keep the existing project slug and
  package name for now; they are internal identifiers.
- Use "Plan your time outside based on the UV Index." as the current subtitle.
- Use Expo + React Native + TypeScript.
- Support Android and web.
- Use Open-Meteo as the initial UV and temperature source. This is an ease-of-
  implementation choice, not a claim of superior forecast accuracy.
- Request two local forecast days from Open-Meteo for outing planning and UV
  Outlook hour selection. This is a near-term product horizon, not a provider
  maximum; explain when an outing exceeds available coverage.
- Position UV Scout around current and near-term outings (today or tomorrow in
  the available local forecast). Keep UV protection central and other weather
  variables as supporting context; do not expand into long-range planning or a
  general-purpose weather app.
- Serve general outdoor users first; do not require a runner/hiker/cyclist profile.
- Offer device location, manual place search, and map-point selection.
- Offer place search, map selection, and device location on Android and web.
- Add map selection alongside search and device location. Initially center on
  Central Europe at a continent-wide zoom without selecting a default forecast
  location; map taps select exact coordinates, while search/device choices
  recenter and zoom to their selected coordinates. Keep native and web map
  implementations separate behind the same selection contract.
- Use Open-Meteo geocoding and forecasts for keyless non-commercial prototyping,
  with GeoNames/Open-Meteo attribution. Revisit licensing before commercial release.
- Use a keyless BigDataCloud client-side reverse-geocoding lookup for a best-effort
  locality label when the user chooses device location. Keep coordinates visible
  and fall back to `Current location` if the lookup fails.
- Show place suggestions while typing after three characters and a short pause;
  selecting a suggestion confirms the place without a separate Search button.
- On mobile, request foreground location permission once at app launch and
  default to device location when granted and location services are enabled. If
  denied, keep manual search available and let the location control request
  access again. Keep web manual until the user chooses device location. Use a
  recent cached phone position while requesting a fresh one. Do not persist
  coordinates in the first version.
- Use standard UV categories with colors and plain-language labels.
- Let the user choose start time and duration or end time; do not ask for shade
  in the default planner.
- Default the selected outing to Now for 4 hours; provide only future scheduled
  alternatives and allow users to change the duration or set an end time.
- Provide duration presets of 30 minutes, 1 hour, 2 hours, 3 hours, and 4 hours,
  plus custom minutes. Allow the user to switch to an explicit end time instead.
- Present planner choices as compact selector rows with vertically revealed
  options, rather than groups of boxed buttons. Keep the selected duration or
  end-time list open until its row is tapped again.
- Show a minimal horizontal UV chart from one preceding hour through the end
  of tomorrow in the location's time zone. Label day changes and show compact
  weather and UV values by hour. Keep the initial viewport near Now with earlier
  hours available to the left. Custom times are listed continuously across
  local days with Today/Tomorrow section labels. The time selector updates UV
  guidance and chart focus. Keep the chart independent of the outing
  timeframe.
- Give concise general advice about seeking shade and explain its limits; do not
  infer route shade or use a shade multiplier. Do not include a shade selector.
- Defer optional “Tailor this advice” questions (for example, shade, clothing
  coverage, swimming/sweating, or reflective surroundings) until later.
- Show temperature as forecast context. Do not infer clothing from temperature.
- Show cloud-cover percentage alongside hourly temperature and UV as weather
  context only. Keep it distinct from route shade and do not use it to adjust UV.
- Use a 2×2 outing summary for UV, temperature, cloud cover, and precipitation.
  Weight cloud-cover average by its overlap with the outing and display its
  observed hourly range. Sum only complete preceding-hour precipitation intervals
  wholly inside the outing, label the full-hour basis, and show peak hourly chance
  separately rather than implying a combined outing-wide probability.
- Explain what the UV Index measures in a short introductory description.
- Explain the selected UV category with practical action and a reason in the result.
- Compare future earlier and later time windows of equal duration using forecast
  UV, without instructing the user to change their plans. Omit the earlier
  comparison when no earlier future window is available.
- Show civil dawn, sunrise, sunset, and civil dusk. Mark comparisons that include
  twilight or darkness, and keep daylight comparisons distinct.
- Use a minimal, neutral visual style with clear typography and little decoration.
- Calculate daylight events for the forecast location and local date; align the
  event markers, paired day/night arcs, and time-dependent sun/moon icon with
  hourly chart bins. Calculate the following local date too, so the final night
  arc reaches the end of the visible timeline.
- Build one Expo codebase for Android and web, checking both throughout development.
- Use text-only top tabs rather than boxed navigation buttons; underline the active tab.
- Use four top tabs in order: Location, UV Outlook, Plan an Outing, and Info.
  Keep UV Outlook and Plan an Outing visible but inactive until a location is
  selected, then show the selected place and coordinates in those tabs. Info is
  always available and does not require a selected location.
- Preserve planner selections when switching tabs or changing location.
  Recalculate for the selected location; if the forecast cannot support a
  selection, explain the issue without silently resetting the planner. Provide
  a clear, explicit reset action. Reset clears only outing choices to their
  defaults (start time `Now`, duration 4 hours) and keeps the selected
  location. Persistence across app restarts is a separate
  decision and is not implied by this behavior.
- Use the forecast provider's resolved location time zone for all scheduled
  planner inputs on Android and web. On location changes, retain scheduled
  wall-clock date/time and recalculate its instant in the new zone; keep
  duration-based outings at their selected elapsed duration.
- Use English for the first version.
- Do not include accounts or history in the first version.
- Start with a neutral, straightforward visual style.
- Use the installed Codex skills under `C:\Users\Urh\.codex\skills`.
- Record external sources and how they inform app data or behavior in
  `notes/data-sources.md`; keep detailed research in topic-specific notes and
  distinguish evidence from UV Scout's own product choices.
- Keep product rules and calculations in `src/domain/`, separate from UI
  features. Begin with UV mappings and outing calculations; add guidance,
  daylight, and model areas as those capabilities are implemented.

## Open Questions

- Which details, if any, belong in a future optional “Tailor this advice” section?
- What licensing and service capacity will a commercial release need?

## Progress

- Plan an Outing now refreshes its forecast every 15 minutes while open, in
  step with the moving Now timeframe. Forecast attempts time out after 12
  seconds and retry once before showing the existing Try again control.
- UV Outlook now selects current and future hourly bins through tomorrow.
  The current panel becomes a dated forecast panel for later hours; a compact
  custom-time list spans Today and Tomorrow in half-hour increments. The
  underlying single-hour guidance is shared by current and future readings.
- Refined the Info tab as a quick reference for UV, clouds, precipitation, and
  wind. Removed internal rounding details and repeated explanatory notes while
  keeping the explanations needed to read forecast values. The outing guidance
  still explains a rounded-category threshold difference when it affects that
  outing. No forecast or recommendation calculations changed.
- Added an interactive location map for Android and web. The unselected map
  opens over Europe; taps select coordinates, and search/device selections
  recenter it. Both native and web now use Leaflet with attributed OpenStreetMap
  tiles; the native map runs in a WebView so Android Expo Go does not depend on
  its failing Google Maps key. Recorded provider policy, attribution, and
  limitations in `notes/data-sources.md`.

- Added a reusable UV evidence and guidance review prompt with sourcing,
  uncertainty, and product-choice requirements.
- Expanded the guidance research into a factor-by-factor recommendation model
  note. It records which inputs set UV protection, which only tailor actions,
  and which remain out of scope; app rules still need product review.
- Expanded that review with a distinct WHO reference track and a proposed
  UV Scout outing-specific model, including duration-by-UV exposure, sunscreen
  amount/application/reapplication, shade, clothing, and conditional context.
  Added comparative WHO, FDA, and AAD sources; a first-pass rule flow is now
  drafted in research notes, not implemented in the app.
- Expanded the second-model research scope after review: recommendations should
  distinguish a brief high peak from sustained elevated UV and account for
  relevant conditions only when known. The factor review documents direct
  inputs, derived profile metrics, future optional inputs, interactions, and
  examples.
- Accepted a provisional first-pass set of forecast-profile measures: peak/time,
  duration-weighted average, time in UV bands, longest continuous elevated
  interval, and forecast coverage. Converted this first slice into validated
  JSON plus a TypeScript interpreter. The original 120-minute sunscreen
  reminder gate was later replaced with actionable advice whenever covered UV
  reaches 3+; see the current policy in `notes/active-uv-guidance.md`.
- Removed the shade selector from the planner. Use general shade advice without
  adjusting forecast UV or claiming route-specific shade; defer optional
  “Tailor this advice” inputs.
- Moved the WHO reference out of the outing result and into the UV section of
  Info as a static three-band table. The outing now presents an actionable
  takeaway, a descriptive Breakdown, and detailed Protection steps; the four
  metrics and hourly chart follow. This is not a personal-risk estimate, and
  the peak alone does not determine the guidance.
- Keep WHO guidance and UV Scout insight as separate domain systems: separate
  editable JSON, validation, and interpreters. WHO's interpreter returns the
  static Info table; UV Scout's interpreter summarizes the outing.
- Added a compact set of manually traced outing profiles covering low UV,
  sustained moderate UV, a brief high peak, split elevated periods, partial
  coverage, weather-context independence, and advice-trigger boundaries. These
  are review scenarios, not validated health-risk outcomes.
- [x] Make outing advice more actionable without requiring an activity choice:
  add clothing, hat, eyewear, shade, broad-spectrum SPF 30+ application, and
  product-label-led reapplication directions; point out the hourly UVI 8+ period
  and keep reflective-surface advice conditional.
- [x] Make advice more specific to forecast conditions: state actual local-time
  windows for UVI 3–<8 and 8+, and add a cloud-coverage clarification only when
  very cloudy hours overlap with UVI 3+. Cloud cover never modifies forecast UVI.
- Researched public-health protection guidance and documented source-backed
  groupings, shade limitations, and draft app rules in
  `notes/protection-guidance-research.md`.
- Earlier implementation used the outing peak to select protection tiers and
  composed WHO and Scout outputs together. Superseded on 8 October 2026: WHO is
  a static Info reference, while UV Scout's outing result uses the whole profile.
- Kept editable WHO and Scout definitions in separate JSON files with dedicated
  TypeScript interpreters; the current features consume them independently.
- Reviewed WHO's published UVI action table and expanded the WHO guidance to
  cover low UV, midday shade, the stronger 8+ midday advice, broad-spectrum SPF
  30+, and general reapplication wording. Retained WHO's three action bands.

- Moved UV category definitions into editable JSON with a separate validated
  TypeScript lookup; adopted this pattern for future domain rule tables.

- Separated app composition, domain types/rules, external services, and UI
  features. Removed domain imports from feature folders and documented the
  dependency direction in `docs/project-structure.md`.

- Kept the outing planner mounted across tab changes so its local selections
  survive navigation; changing location recalculates the outing forecast.
  Added Reset to restore Now/4-hour duration/no shade without clearing location.
- Scheduled start and end inputs now use the selected place's resolved local
  time zone on web and Android. Changing locations preserves the selected local
  date and time, re-resolves the instants for the new time zone, and keeps
  duration-based outings at their selected elapsed duration.
- Reconciled the older guidance scenario notes with the active sunscreen
  reapplication rule. Reviewed generated advice for contrasting synthetic
  outings and recorded presentation findings in
  `notes/outing-guidance-output-review.md`. The recommendation rules did not
  change in this review.
- Followed up on that output review: grouped five or more changing UV windows
  by band to avoid repeating actions, shortened the conditional sunscreen
  reapplication sentence, and explained rounded-category/raw-threshold
  mismatches in the outing guidance. The UVI 3 and 8 action triggers did not change.
- Split the shared hourly chart into a small scroll/layout component, a daylight
  track, and an hourly value bin. Updated the project map and removed duplicate
  or stale descriptions in the README, architecture note, and open decisions.

- Repository instruction file created.
- Planning started before project scaffolding.
- Installed the stable Expo TypeScript starter and web dependencies using pnpm.
- Added a minimal first screen and development preview instructions.
- Updated the Expo display name and starter-screen title to `UV Scout`.
- Added the first interactive location section and verified web and Android bundles.
- Centered the title, removed the green styling and extra copy, and added manual
  place search alongside device location.
- Changed manual place search to a compact suggestion list while typing.
- Added real Open-Meteo UV and temperature values with loading and error states.
- Changed the forecast to a horizontally scrollable 24-bin chart centered near
  Now, including a local-day rollover label. Tightened the bins and set the initial
  viewport so Now sits left of center while more future bins remain visible. Added
  a live current local weekday, date, and time label above the chart.
- Added the first time-planning controls: Now or scheduled start, duration presets
  including 3 hours, custom duration, and explicit end-time mode.
- Replaced planner button groups with compact accordion-style selector rows for
  start, end mode, and duration.
- The earlier prototype had a four-option shade selector; it has now been
  removed so recommendations do not depend on unmeasured, user-selected route
  shade.
- Added a selected-outing result with peak and duration-weighted average UV,
  average temperature and range, with guidance still based on peak UV. The
  outing chart highlights all selected hours and uses equal, faint context
  buffers on each side when forecast data allows.
- Made Location the first tab and moved UV Outlook and Plan an Outing into the
  second and third tabs, with selected location context shown in both.
- Added Open-Meteo hourly cloud-cover percentages as separate forecast context,
  and reused the UV bar chart for the selected outing. Cloud cover does not
  numerically alter the returned UV Index or route-shade guidance.
- Added Open-Meteo hourly precipitation probability and expected precipitation
  amount to both forecast charts as separate, non-UV context. Values retain their
  preceding-hour meaning and are not combined into an outing-wide chance.
- Added Info-tab notes explaining precipitation chance, expected amount,
  preceding-hour timing, and outing-summary aggregation. Added an educational
  hourly rain-rate comparison with explicit limits; it does not classify
  forecast hourly or outing-total precipitation amounts.
- Expanded the outing summary into a 2×2 grid with duration-weighted cloud cover,
  its hourly range, complete-hour precipitation total, and separate peak hourly
  precipitation chance. Partial precipitation hours are not prorated.
- Added a final Info tab backed by the validated UV category definitions and a
  validated, editable cloud-cover description table. Documented scientific
  sources separately from app-chosen cloud-label bands.
- Added a reusable daylight calculation and aligned dawn/sunrise/sunset/dusk
  markers above both hourly charts. Added paired grayscale day and night arcs
  with one selected-time icon: sun by day, moon at night. Documented that the
  moon is illustrative only, plus astronomical sources and polar-latitude
  limitations.
