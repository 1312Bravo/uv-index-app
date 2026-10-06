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
    guidance/protectionGuidance.json Editable UV bands, guidance and rule text
    guidance/getProtectionGuidance.ts Validates and interprets recommendation rules
    uv/uvCategories.json      Editable UV categories and explanations
    uv/getUvCategory.ts       Validates and interprets the category table
    weather/cloudCoverBands.json Editable cloud-cover descriptions
    weather/getCloudCoverBand.ts Validates and interprets cloud-cover bands
  services/                   External requests and response parsing
    forecast/                 Open-Meteo forecasts
    location/                 Place search and reverse geocoding
  features/                   UI components, formatting, React hooks
    forecast/                 Hourly chart and forecast loading hook
    location/                 Location selection and display formatting
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

Follow this pattern for future editable domain mappings and guidance content:
JSON holds the definitions, TypeScript validates and interprets them, and UI
components render the returned result. Calculations stay in TypeScript. JSON is
bundled into the app; edits need a development reload or a new published build.

For protection recommendations, edit `src/domain/guidance/protectionGuidance.json`:

- `uvBands` classifies raw UV values using inclusive minimums and exclusive
  maximums. The last band uses `null` for no upper bound. Keep its stable keys.
- `levels` maps raw peak UV to the WHO-reference action tier; each tier has an
  inclusive minimum and editable headline, explanation, and action list.
- `messages` contains editable observation/caveat text. Keep the placeholders
  such as `{duration}` and `{bandLabel}` that the TypeScript interpreter fills.
- `reapplicationRule.minimumOutingMinutes` is in minutes; its UV threshold is a
  raw UVI value. The current product rule is 120 minutes and UVI 3.

TypeScript checks that UV bands are consecutive and their boundaries match the
action tiers. Forecast calculations (time-weighted values, time in bands,
continuous periods, and missing coverage) stay in
`src/domain/outing/calculateOutingForecast.ts`. Rule rationale and source
provenance belong in `notes/recommendation-tree-draft.md` and
`notes/data-sources.md`.

| Change | Home |
| --- | --- |
| Tab order, app layout, shared screen state | `src/app/` |
| Input controls, chart styling, display formatting | `src/features/` |
| API URL, provider parsing, request handling | `src/services/` |
| UV thresholds, outing and daylight calculations | `src/domain/` |
| Category and cloud-cover explanations | `src/domain/` and `src/features/info/` |
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

Protection recommendations follow this pattern: editable UV bands, messages,
and rule thresholds live in `src/domain/guidance/protectionGuidance.json`;
TypeScript validates the JSON and interprets it alongside the raw outing peak,
time-in-band profile, and forecast coverage. Display-category rounding remains
separate from WHO-aligned action thresholds; for example, displayed Moderate
2.5 remains below the protection trigger of raw UVI 3. The outing feature renders
the structured result. Sources and rationale are in `notes/recommendation-tree-draft.md`,
`notes/recommendation-model-research.md`, and `notes/protection-guidance-research.md`.

This structure pass preserves existing behavior, including the rolling forecast
window and device-local planner inputs. Changes to forecast coverage, time-zone
handling, and recommendation rules are separate product work.
