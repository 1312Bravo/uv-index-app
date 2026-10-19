# Project structure

```text
App.tsx                       Expo entry point
src/
  app/                        App layout, navigation, shared screen state
    UvScoutApp.tsx
    TopTabs.tsx
  domain/                     Product knowledge and shared data types
    forecast/forecastTypes.ts
    forecast/getUvForecastAtTime.ts Estimates UV between hourly values
    time/                      Local wall-time and time-zone conversion
    daylight/                  Civil dawn, sunrise, sunset, and civil dusk calculations
    location/locationTypes.ts
    outing/                   Time plan and forecast overlap/coverage calculations
    guidance/whoGuidance.json WHO thresholds and general protection actions
    guidance/getWhoGuidance.ts Validates and interprets the WHO reference
    guidance/uvScoutInsight.json Editable UV Scout wording
    guidance/uvScoutRecommendationRules.json Active profile/factor policy
    guidance/getUvScoutInsight.ts Validates and interprets both guidance files
    guidance/hourlyUvGuidance.json Editable single-hour guidance text
    guidance/getHourlyUvGuidance.ts Interprets single-hour UV guidance
    uv/uvCategories.json      Editable UV categories and explanations
    uv/getUvCategory.ts       Validates and interprets the category table
    weather/cloudCoverBands.json Editable cloud-cover descriptions
    weather/getCloudCoverBand.ts Validates and interprets cloud-cover bands
  services/                   External requests and response parsing
    forecast/                 Open-Meteo forecasts
    location/                 Place search and reverse geocoding
  features/                   UI components, formatting, React hooks
    forecast/                 Forecast loading and shared hourly chart
      HourlyUvBarChart.tsx    Scroll window and chart composition
      HourlyUvChart.tsx       UV Outlook time selection and guidance
      OutlookTimeSelector.tsx Future time list above the UV reading
      getOutlookTimeSlots.ts  Available half-hour choices
      HourlyUvGuidance.tsx    Current or selected-hour advice panel
      DaylightTrack.tsx       Dawn/dusk markers and sun/moon trace
      HourBin.tsx             UV bar and hourly weather values
      hourlyChartLayout.ts   Shared bin width and selection type
    location/                 Location search, map selection, and formatting
      LocationMap.native.tsx  Leaflet/OpenStreetMap map in native WebView
      nativeMapDocument.ts    Native map HTML, tiles, and tap bridge
      LocationMap.web.tsx     Leaflet/OpenStreetMap browser map
      LocationPicker.tsx      Search, device location, and shared selection state
    planning/                 Time inputs and platform date/time picker
    outing/                   Outing forecast result
      OutingUvTimeline.tsx    Compact hourly UV preview before guidance
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
factor roles, coverage behavior, and conditional context-message triggers.
Raw UVI thresholds are explicit in the rule table. The two-hour sunscreen
reapplication wording is general guidance shown whenever sunscreen is
recommended; it is not a forecast-duration trigger or personal timer. The text
file separates action titles/messages, profile narrative templates, time-window
detail messages, takeaway-message arrays (one item per opening bullet), and
band-specific `takeawayWindowMessages` for up to four consecutive windows,
`compactWindowMessages` for five or more, and small rounded-category notes.
The window-count switch is in `uvScoutRecommendationRules.json` under
`takeawayPresentation`; it changes wording only, not health thresholds.
UV breakdown groups one-decimal displayed hourly values into highest, lowest, and
intervening values and totals only their actual overlap with the outing. In a
mixed outing, it adds a combined below-3 duration/window line only if the
lowest-value bullet does not already cover all below-3 time. Protection steps
show sunscreen preparation and reapplication as separate actions, with clothing,
shade, and any extra UVI 8+ action between them. The matching steps carry raw
UVI 3+ and 8+ durations in their main text and exact window times below.
Sunscreen wording differs when UVI 3+ begins at the selected start or later;
reapplication timing depends on when sunscreen was applied, which the app
does not ask for. The first opening bullet describes the
covered UV range or steady value; the second walks through up to four
consecutive lower, UV 3-to-below-8, and UV 8+ windows in local-time order.
With five or more windows, it lists all their approximate times grouped by
band and says each action once.
Only those opening action windows round their displayed starts down and ends
up to local half hours, using "around" wording. The exact overlap and
duration calculations and the detailed action times stay unchanged.
Recommendation text shows times alone for one local day, and full weekday
names without calendar dates when the outing crosses local days.
Cloud and reflective-surface context is returned separately for subdued display.
Low-UV outings keep a short protection bullet in the opening and show a
concrete sunscreen item under Protection steps. These choices do not change the action thresholds.
Each time-window description
lists up to two local-time periods and then counts any remaining periods. Keep stable
keys and message placeholders unchanged unless the
interpreter is updated. `getUvScoutInsight.ts` validates and consumes both
files. The Info feature renders the WHO table; the outing feature uses UV
Scout's profile interpreter. Forecast overlap and coverage calculations stay
in `src/domain/outing/calculateOutingForecast.ts`. Rule rationale and source
provenance belong in the guidance research notes and `notes/data-sources.md`.

UV Outlook's single-hour advice is separate from the outing profile. Edit
`src/domain/guidance/hourlyUvGuidance.json` for its short protection text;
`src/domain/guidance/getHourlyUvGuidance.ts` interprets it using the raw bands
in `uvScoutRecommendationRules.json` and the existing display categories.
Those bands are raw UVI below 3, 3 to below 8, and 8 or higher. A cloud
reminder appears at 76% cover or more only when raw UVI is at least 3;
cloud cover does not change the protection band. The displayed category
still rounds the UV value to a whole number.
`src/features/forecast/HourlyUvGuidance.tsx` renders the result above the
hourly chart. The Now bin uses the provider's current model estimate when
available. Custom times on the hour use hourly forecast values; half-hour UV
is estimated by `src/domain/forecast/getUvForecastAtTime.ts` between adjacent
hourly values. The open outlook refreshes its forecast every 15 minutes.

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
remains below the WHO protection trigger of raw UVI 3. Current behavior,
scenarios, and the source/product boundary are in
`notes/active-uv-guidance.md`; older rationale is in
`notes/recommendation-tree-draft.md`, `notes/recommendation-model-research.md`,
and `notes/protection-guidance-research.md`.

The forecast's resolved time zone is passed from app-level shared state to the
planner. Local wall-time conversion and daylight-saving behavior live in
`src/domain/time/`; nonexistent spring-forward times move forward to the first
valid local time, and repeated fall-back times resolve to the earlier instance.
Platform input and rendering stay in `src/features/planning/`. The rolling chart
window is separate from scheduled outing input and aggregation.
