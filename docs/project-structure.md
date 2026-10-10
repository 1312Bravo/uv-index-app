# Project structure

```text
App.tsx                       Expo entry point
src/
  app/                        App layout, navigation, shared screen state
    UvScoutApp.tsx
    TopTabs.tsx
  domain/                     Product knowledge and shared data types
    forecast/forecastTypes.ts
    daylight/                  Civil dawn, sunrise, sunset, and civil dusk calculations
    location/locationTypes.ts
    outing/                   Time plan and forecast overlap/coverage calculations
    guidance/whoGuidance.json WHO thresholds and general protection actions
    guidance/getWhoGuidance.ts Validates and interprets the WHO reference
    guidance/uvScoutInsight.json Editable UV Scout wording
    guidance/uvScoutRecommendationRules.json Active profile/factor policy
    guidance/getUvScoutInsight.ts Validates and interprets both guidance files
    uv/uvCategories.json      Editable UV categories and explanations
    uv/getUvCategory.ts       Validates and interprets the category table
    weather/cloudCoverBands.json Editable cloud-cover descriptions
    weather/getCloudCoverBand.ts Validates and interprets cloud-cover bands
  services/                   External requests and response parsing
    forecast/                 Open-Meteo forecasts
    location/                 Place search and reverse geocoding
  features/                   UI components, formatting, React hooks
    forecast/                 Hourly chart and forecast loading hook
    location/                 Location search, map selection, and formatting
      LocationMap.native.tsx  Leaflet/OpenStreetMap map in native WebView
      nativeMapDocument.ts    Native map HTML, tiles, and tap bridge
      LocationMap.web.tsx     Leaflet/OpenStreetMap browser map
      LocationPicker.tsx      Search, device location, and shared selection state
    planning/                 Time inputs and platform date/time picker
    outing/                   Outing forecast result
    info/                     UV and cloud-cover explanation screen
notes/                        Durable decisions and requirements
  protection-guidance-research.md Sources and proposed guidance rules
  data-sources.md             Source register: what we use and where
docs/                         Run instructions and implementation guides
prompts/                      Reusable research and review briefs
PLAN.md                       Product scope, progress, open decisions
```

## How the parts connect

`UvScoutApp` passes the chosen coordinates and time plan to the feature components.
The `useHourlyForecast` hook calls the forecast service and manages loading and
error state. The service parses the provider response into `HourlyForecast`.
`OutingForecast` passes that data and the selected time window to
`summarizeOutingForecast`, then renders the returned result.

Imports flow from app to features, from features to services and domain, and
from services to domain types. Domain modules only depend on other domain modules.
This lets calculations run independently of the UI and the weather provider.

## Where to put the next change

For UV categories, edit `src/domain/uv/uvCategories.json`. Each row contains a
stable `key`, a displayed `label`, `minimumUvInclusive`, and a plain-language
`meaning`. The minimum belongs
to that category after rounding the raw UV Index to the nearest whole number,
with .5 rounding up: 2.4 becomes 2 (Low), and 2.5 becomes 3 (Moderate).
The displayed forecast retains its decimal value. Each category continues
until the next row's minimum; the final category has no upper limit.
Keep all five keys unique, the first minimum at zero, and rows in increasing
threshold order. Labels and thresholds are editable; keys are stable app
identifiers. Changing the set of keys also requires updating the TypeScript type.
The interpreter checks the table and rejects invalid UV inputs.

For the Info screen's cloud-cover ranges, edit
`src/domain/weather/cloudCoverBands.json`. The ranges must be unique, consecutive
integer percentages that cover 0–100. Their labels and descriptions are UV
Scout's simplified wording, not an official meteorological scale. Keep the
percentage meaning (sky area covered) separate from UV exposure and route shade.

For the Info screen's wind guide, edit `src/domain/weather/windSpeedBands.json`.
Ranges are consecutive integer km/h values beginning at zero; the last range has
no upper bound. These six rows group land-based Beaufort descriptions into a
shorter guide; they are not official Beaufort categories. The app currently shows
wind speed only; gust values are not fetched or displayed.

Follow this pattern for future editable domain mappings and guidance content:
JSON holds the definitions, TypeScript validates and interprets them, and UI
components render the returned result. Calculations stay in TypeScript. JSON is
bundled into the app; edits need a development reload or a new published build.

WHO reference actions and UV Scout's outing interpretation are separate domain
systems. Edit `src/domain/guidance/whoGuidance.json` for WHO's general note,
intensity/duration context, raw-UV action thresholds, labels, and action
wording. The validated interpreter returns the static table for the Info tab;
it does not select a WHO tier for an outing. Edit
`src/domain/guidance/uvScoutInsight.json` for Scout's human-readable wording and
`src/domain/guidance/uvScoutRecommendationRules.json` for active UV bands,
profile signals, factor roles, coverage behavior, conditional context-message
triggers, and the reapplication trigger. Raw UVI thresholds and reminder
duration (minutes) are explicit. Keep stable keys and message placeholders unchanged unless the
interpreter is updated. `getUvScoutInsight.ts` validates and consumes both
files. The Info feature renders the WHO table; the outing feature uses UV
Scout's profile interpreter. Forecast overlap and coverage calculations stay
in `src/domain/outing/calculateOutingForecast.ts`. Rule rationale and source
provenance belong in the guidance research notes and `notes/data-sources.md`.

| Change | Home |
| --- | --- |
| Tab order, app layout, shared screen state | `src/app/` |
| Input controls, chart styling, display formatting | `src/features/` |
| API URL, provider parsing, request handling | `src/services/` |
| UV thresholds, outing and daylight calculations | `src/domain/` |
| Category, cloud-cover, and wind explanations | `src/domain/` and `src/features/info/` |
| Explanation of an accepted product rule | `notes/` |
| External data/evidence source and its use | `notes/data-sources.md` |
| How to run or extend the app | `docs/` |

For research on UV science or practical protection advice, use the review brief
in `prompts/uv-evidence-guidance-reviewer.md`. It requires citations and a clear
split between published evidence and UV Scout's product choices.

External data and evidence provenance belongs in `notes/data-sources.md`.
Keep a central entry for every provider or scientific reference, including the
code/data paths where it is used, interpretation, attribution/licensing, and
limits; add a focused research note for substantive evidence reviews.

Daylight times are calculated in `src/domain/daylight/` from the selected
location and local forecast dates. The feature chart positions the markers and
sun on the same scrollable time scale as its hourly bins. The calculation is
independent of UI and API services; see `notes/daylight-research.md` for event
definitions, method, and limitations.

WHO actions live in `whoGuidance.json` and are interpreted by
`getWhoGuidance.ts` for the static Info table. UV Scout's outing wording and
active policy live separately in `uvScoutInsight.json` and
`uvScoutRecommendationRules.json`, interpreted by `getUvScoutInsight.ts` for
the outing view. Display-category rounding remains separate
from WHO-aligned raw-UV action thresholds; for example, displayed Moderate 2.5
remains below the WHO protection trigger of raw UVI 3. Sources and rationale
are in `notes/recommendation-tree-draft.md`,
`notes/recommendation-model-research.md`, and
`notes/protection-guidance-research.md`.

This structure pass preserves existing behavior, including the rolling forecast
window and device-local planner inputs. Changes to forecast coverage, time-zone
handling, and recommendation rules are separate product work.
