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
- The central flow asks for a place, start time, duration or end time, and expected shade.
- Start time defaults to Now. Duration/end time has no default and must be chosen by the user.
- If the user switches from Now to a scheduled outing, offer only future times
  relative to the current time at the selected location.
- With Now selected, show a horizontal UV trend with five earlier hourly bins,
  the current hour, and eighteen later hourly bins, even before duration is chosen.
  The window may cross into the next local day.
- The result combines a standard UV category, a forecast over the selected time, and practical guidance.
- Introduce what the UV Index measures in a short explanation near the start
  of the app; explain the selected UV category and precautions in each result.
- Compare equally long earlier and later outings using forecast UV, but only
  show comparison start times that are still in the future.
- Show civil dawn, sunrise, sunset, and civil dusk for the selected location.
- Show forecast outdoor temperature next to UV for context; do not use temperature
  as a UV-risk input or infer clothing from it.
- Keep the interface minimal, with a small number of clear inputs and an easy-to-read result.

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
   The user may choose a future time. The user must choose a duration for an
   outing assessment and may choose an expected sun/shade pattern from four
   clear descriptions ranging from open sun to overhead cover for most of the outing.
3. The app shows hourly UV and temperature for that period, its highest UV category,
   and an explanation of what that category means.
4. The app explains why the selected UV level matters, suggests practical
   precautions, and compares future earlier/later starts for the same duration.
5. Daylight markers reveal whether the planned or compared outings include
   civil twilight or darkness.

Keep the first architecture simple and stateless. Add accounts and history only
after the core flow has been tested.

## Decisions To Make Before Building

- Whether the planner should preserve its selections when returning to the overview.
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
- [x] Confirm place, start time, duration, and shade as the central planning flow.
- [x] Confirm a combined UV category, time-window forecast, and practical guidance.
- [x] Confirm educational explanations, neutral earlier/later comparisons, and
  dawn/sunrise/sunset/dusk context.
- [x] Place the general UV explanation near the start of the app and keep the
  per-outing result focused on that forecast.
- [x] Keep earlier/later comparisons in the future.
- [x] Default start time to Now and require the user to select a duration.
- [x] Show a 5-past / Now / 18-future hourly UV trend before duration is chosen.
- [x] Choose Open-Meteo for keyless UV and temperature forecasts in the prototype.
- [ ] Confirm the first recommendation rules and safety wording.
- [x] Scaffold the Expo project with Android and web support.
- [x] Add initial run and preview instructions.
- [x] Add on-demand device location selection with permission and error states.
- [x] Add manual place search for Android and web.
- [x] Connect selected location to the rolling UV and temperature chart.
- [x] Add Now/scheduled start, duration presets including 3 hours, custom duration,
  and explicit end-time mode.
- [x] Move the planner to a second page reached from the location/chart overview.
- [x] Add native Android and browser date/time pickers.
- [ ] Implement shade and the first outing recommendation flow.

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
- Show place suggestions while typing after three characters and a short pause;
  selecting a suggestion confirms the place without a separate Search button.
- Request foreground device location only after the user taps the button; do not
  persist coordinates in the first version.
- Use standard UV categories with colors and plain-language labels.
- Let the user choose start time, duration or end time, and qualitative shade.
- Default the start time to Now; provide only future scheduled times and do not
  preselect a duration or end time.
- Provide duration presets of 30 minutes, 1 hour, 2 hours, 3 hours, and 4 hours,
  plus custom minutes. Allow the user to switch to an explicit end time instead.
- Show a minimal horizontal UV chart with five preceding hours, Now, and eighteen
  following hours in the location's time zone. Allow the window to cross midnight
  and label day changes. Show temperature and UV labels above each hourly bar.
  Keep it available without a duration selection. Add daylight markers later.
- Use four shade choices: open sun throughout; mostly sun with short shaded
  stretches; about half sun and half shade; overhead cover for most of the outing.
- Avoid turning the shade choice into an unsupported numerical UV reduction.
- Show temperature as forecast context. Do not infer clothing from temperature.
- Explain what the UV Index measures in a short introductory description.
- Explain the selected UV category with practical action and a reason in the result.
- Compare future earlier and later time windows of equal duration using forecast
  UV, without instructing the user to change their plans. Omit the earlier
  comparison when no earlier future window is available.
- Show civil dawn, sunrise, sunset, and civil dusk. Mark comparisons that include
  twilight or darkness, and keep daylight comparisons distinct.
- Use a minimal, neutral visual style with clear typography and little decoration.
- Build one Expo codebase for Android and web, checking both throughout development.
- Use English for the first version.
- Do not include accounts or history in the first version.
- Start with a neutral, straightforward visual style.
- Use the installed Codex skills under `C:\Users\Urh\.codex\skills`.

## Open Questions

- What is the useful maximum forecast horizon for the first version?
- Should clothing/skin coverage be an optional detail or appear only in advice?
- What licensing and service capacity will a commercial release need?

## Progress

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
  Now, including a local-day rollover label.
- Added the first time-planning controls: Now or scheduled start, duration presets
  including 3 hours, custom duration, and explicit end-time mode.
