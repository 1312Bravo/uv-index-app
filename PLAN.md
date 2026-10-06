# UV Scout Plan

## Goal

Build a simple Expo + React Native + TypeScript app for Android and web that
helps people plan outdoor time around the current and forecast UV index.

## Current Understanding

- An Expo + React Native + TypeScript app is installed, with Android and web
  support. Device location, manual place search, and today's remaining UV trend
  with temperature are implemented.
- The app should support Android and web from the beginning.
- Open-Meteo is the weather and UV data source for the non-commercial MVP.
- The initial use case is UV exposure guidance for outdoor activities.
- The first version is for general outdoor users, in English.
- Location should support device location and user-selected places on Android and web.
- The first version has no accounts or history.
- The central flow asks for a place, start time, and duration or end time. The
  planner does not ask the user to classify shade; guidance recommends general
  shade use without treating it as a numeric UV adjustment.
- Start time defaults to Now. Duration/end time has no default and must be chosen by the user.
- If the user switches from Now to a scheduled outing, offer only future times
  relative to the current time at the selected location.
- With Now selected, show a horizontal UV trend with five earlier hourly bins,
  the current hour, and eighteen later hourly bins, even before duration is chosen.
  The window may cross into the next local day.
- The result combines a standard UV category, a forecast over the selected time,
  and practical guidance. The WHO reference remains based on the outing's raw
  peak; an initial UV Scout profile reports time in UV bands and incomplete
  forecast coverage. Default planning requires no extra protection-context
  choices; unknown conditions stay conditional.
- Introduce what the UV Index measures in a short explanation near the start
  of the app; explain the selected UV category and precautions in each result.
- Compare equally long earlier and later outings using forecast UV, but only
  show comparison start times that are still in the future.
- Show civil dawn, sunrise, sunset, and civil dusk for the selected location.
- Show forecast outdoor temperature next to UV for context; do not use temperature
  as a UV-risk input or infer clothing from it.
- Show hourly cloud cover as separate weather context; use the provider's regular
  UV forecast as the UV value and never apply an additional cloud-percentage discount.
- Use the same compact hourly UV bar chart in the outlook and outing result, with
  cloud-cover percentage and temperature above each bar.
- Keep a final, always-available Info tab with the UV category mapping and a
  plain-language cloud-cover percentage guide.
- Present Info topics as vertically stacked disclosures, with none expanded at
  first and no more than one topic open at a time.
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

## Proposed Direction

Start with a location-based MVP:

1. User searches for a place or chooses to share device location on Android or web.
2. Start time defaults to Now and immediately shows the rolling hourly UV trend.
   The user may choose a future time and must choose a duration for an outing
   assessment. Do not require a shade or other protection-context selection.
3. The app shows hourly UV and temperature for that period, its highest UV
   category, and an explanation of what that category means.
4. The WHO reference uses the raw peak. A separate UV Scout guidance layer is
   designed from the outing's UV profile and duration, with known behavior/context
   modifiers handled explicitly and unknown conditions phrased conditionally.
5. The app compares future earlier/later starts for the same duration and
   explains why the selected UV pattern matters without presenting a personal
   dose or “safe time” calculation.
6. Daylight markers reveal whether the planned or compared outings include
   civil twilight or darkness.

Keep the first architecture simple and stateless. Add accounts and history only
after the core flow has been tested.

## Deferred recommendation-model decisions

- Which full-profile metrics matter: peak/time, duration-weighted average,
  time/proportion in UV bands, longest continuous elevated interval, separate
  elevated periods, and whether an explicitly labelled UVI-hours ambient proxy
  is useful or too easy to misread.
- How sustained exposure changes the UV Scout explanation without replacing or
  downgrading the separate WHO peak category.
- Whether a future optional tailoring section collects sunscreen application
  time, swimming/heavy sweating, clothing coverage, or reflective surroundings.
- Whether to add optional questions for application time, swimming/heavy sweating,
  clothing coverage, or reflective surroundings.
- How to prioritize/deduplicate multiple relevant messages while keeping the
  result readable and not implying personal dose or safe exposure time.
- How far ahead planning should work.
- Whether clothing/skin coverage is an optional detail in version one.
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
- [x] Default start time to Now and require the user to select a duration.
- [x] Show a 5-past / Now / 18-future hourly UV trend before duration is chosen.
- [x] Choose Open-Meteo for keyless UV and temperature forecasts in the prototype.
- [x] Confirm and implement the first recommendation rules and safety wording.
- [x] Scaffold the Expo project with Android and web support.
- [x] Add initial run and preview instructions.
- [x] Add on-demand device location selection with permission and error states.
- [x] Add manual place search for Android and web.
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
- [x] Implement peak-based protection levels using raw UV, separate from display
  category rounding.
- [x] Add the initial outing recommendation profile: duration by UV band,
  continuous elevated intervals, forecast-coverage caveat, and conditional
  sunscreen reminder at 120+ minutes when covered peak UV is 3+.
- [x] Add hourly cloud cover as separate context and use a shared hourly bar chart
  for the outlook and selected outing.
- [x] Add an always-available final Info tab explaining UV categories, decimal
  category rounding, and cloud-cover percentages.
- [x] Group Info explanations under vertically stacked topics, collapsed by
  default.
- [x] Add a shared daylight track with civil dawn, sunrise, sunset, and civil
  dusk markers above the hourly bars in UV Outlook and Plan an Outing.
- [x] Show one time-dependent celestial icon on the forecast timeline: sun by
  day and moon at night, each following its matching arc.
- [x] Keep outing choices when switching tabs or changing location, explain
  when the new forecast cannot cover them, and add Reset for outing choices
  only while preserving the selected location.
- [x] Add a central source register and require it to be updated when app data
  providers, scientific evidence, or calculation references are introduced.

## Decisions

- Use `UV Scout` as the user-facing app name. Keep the existing project slug and
  package name for now; they are internal identifiers.
- Use "Plan your time outside based on the UV Index." as the current subtitle.
- Use Expo + React Native + TypeScript.
- Support Android and web.
- Use Open-Meteo as the initial UV and temperature source. This is an ease-of-
  implementation choice, not a claim of superior forecast accuracy.
- Serve general outdoor users first; do not require a runner/hiker/cyclist profile.
- Offer device location and manual place selection.
- Offer both location methods on Android and web.
- Use Open-Meteo geocoding and forecasts for keyless non-commercial prototyping,
  with GeoNames/Open-Meteo attribution. Revisit licensing before commercial release.
- Use a keyless BigDataCloud client-side reverse-geocoding lookup for a best-effort
  locality label when the user chooses device location. Keep coordinates visible
  and fall back to `Current location` if the lookup fails.
- Show place suggestions while typing after three characters and a short pause;
  selecting a suggestion confirms the place without a separate Search button.
- Request foreground device location only after the user taps the button; do not
  persist coordinates in the first version.
- Use standard UV categories with colors and plain-language labels.
- Let the user choose start time and duration or end time; do not ask for shade
  in the default planner.
- Default the start time to Now; provide only future scheduled times and do not
  preselect a duration or end time.
- Provide duration presets of 30 minutes, 1 hour, 2 hours, 3 hours, and 4 hours,
  plus custom minutes. Allow the user to switch to an explicit end time instead.
- Present planner choices as compact selector rows with vertically revealed
  options, rather than groups of boxed buttons. Keep only one option list open.
- Show a minimal horizontal UV chart with five preceding hours, Now, and eighteen
  following hours in the location's time zone. Allow the window to cross midnight
  and label day changes. Show compact temperature and UV labels above each hourly
  bar, plus the current local weekday, date, and time. Keep the initial viewport
  slightly into the earlier-hours window so Now is left of center with more
  upcoming hours visible; all five earlier hours remain available by scrolling
  left. Keep it available without a duration selection. Add daylight markers later.
- Give concise general advice about seeking shade and explain its limits; do not
  infer route shade or use a shade multiplier. Do not include a shade selector.
- Defer optional “Tailor this advice” questions (for example, shade, clothing
  coverage, swimming/sweating, or reflective surroundings) until later.
- Show temperature as forecast context. Do not infer clothing from temperature.
- Show cloud-cover percentage alongside hourly temperature and UV as weather
  context only. Keep it distinct from route shade and do not use it to adjust UV.
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
  hourly chart bins.
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
  defaults (start time `Now`, no duration/end time) and keeps the selected
  location. Persistence across app restarts is a separate
  decision and is not implied by this behavior.
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

- What is the useful maximum forecast horizon for the first version?
- Which details, if any, belong in a future optional “Tailor this advice” section?
- What licensing and service capacity will a commercial release need?

## Progress

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
  JSON plus a TypeScript interpreter. Added the conditional sunscreen reminder
  for outings lasting at least 120 minutes when covered forecast UV reaches 3+.
  The broader proposal remains in `notes/recommendation-tree-draft.md` for
  deferred factors.
- Removed the shade selector from the planner. Use general shade advice without
  adjusting forecast UV or claiming route-specific shade; defer optional
  “Tailor this advice” inputs.
- Researched public-health protection guidance and documented source-backed
  groupings, shade limitations, and draft app rules in
  `notes/protection-guidance-research.md`.
- Added editable protection guidance under `src/domain/guidance/`; the chosen
  rule uses the raw outing peak: protection begins at UV 3 and extra protection
  at 8, following WHO. Display categories still round separately, so 2.5 can
  display as Moderate while remaining below the protection threshold.

- Moved UV category definitions into editable JSON with a separate validated
  TypeScript lookup; adopted this pattern for future domain rule tables.

- Separated app composition, domain types/rules, external services, and UI
  features. Removed domain imports from feature folders and documented the
  dependency direction in `docs/project-structure.md`.

- Kept the outing planner mounted across tab changes so its local selections
  survive navigation; changing location recalculates the outing forecast.
  Added Reset to restore Now/no duration/no shade without clearing location.

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
- Added a final Info tab backed by the validated UV category definitions and a
  validated, editable cloud-cover description table. Documented scientific
  sources separately from app-chosen cloud-label bands.
- Added a reusable daylight calculation and aligned dawn/sunrise/sunset/dusk
  markers above both hourly charts. Added paired grayscale day and night arcs
  with one selected-time icon: sun by day, moon at night. Documented that the
  moon is illustrative only, plus astronomical sources and polar-latitude
  limitations.
