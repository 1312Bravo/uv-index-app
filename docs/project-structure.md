# Project structure

```text
App.tsx                       Expo entry point
src/
  app/                        App layout, navigation, shared screen state
    UvScoutApp.tsx
    TopTabs.tsx
  domain/                     Product knowledge and shared data types
    forecast/forecastTypes.ts
    location/locationTypes.ts
    outing/                   Time plan, shade choices, forecast calculations
    guidance/protectionGuidance.json Editable guidance levels and shade wording
    guidance/getProtectionGuidance.ts Validates and interprets guidance data
    uv/uvCategories.json      Editable UV category definitions
    uv/getUvCategory.ts       Validates and interprets the category table
  services/                   External requests and response parsing
    forecast/                 Open-Meteo forecasts
    location/                 Place search and reverse geocoding
  features/                   UI components, formatting, React hooks
    forecast/                 Hourly chart and forecast loading hook
    location/                 Location selection and display formatting
    planning/                 Time and shade inputs, platform date/time picker
    outing/                   Outing forecast result
notes/                        Durable decisions and requirements
  protection-guidance-research.md Sources and proposed guidance rules
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
stable `key`, a displayed `label`, and `minimumUvInclusive`. The minimum belongs
to that category after rounding the raw UV Index to the nearest whole number,
with .5 rounding up: 2.4 becomes 2 (Low), and 2.5 becomes 3 (Moderate).
The displayed forecast retains its decimal value. Each category continues
until the next row's minimum; the final category has no upper limit.
Keep all five keys unique, the first minimum at zero, and rows in increasing
threshold order. Labels and thresholds are editable; keys are stable app
identifiers. Changing the set of keys also requires updating the TypeScript type.
The interpreter checks the table and rejects invalid UV inputs.

Follow this pattern for future editable domain mappings and guidance content:
JSON holds the definitions, TypeScript validates and interprets them, and UI
components render the returned result. Calculations stay in TypeScript. JSON is
bundled into the app; edits need a development reload or a new published build.

| Change | Home |
| --- | --- |
| Tab order, app layout, shared screen state | `src/app/` |
| Input controls, chart styling, display formatting | `src/features/` |
| API URL, provider parsing, request handling | `src/services/` |
| UV thresholds, shade definitions, outing calculations | `src/domain/` |
| Explanation of an accepted product rule | `notes/` |
| How to run or extend the app | `docs/` |

For research on UV science or practical protection advice, use the review brief
in `prompts/uv-evidence-guidance-reviewer.md`. It requires citations and a clear
split between published evidence and UV Scout's product choices.

Protection guidance follows this pattern: editable messages and category groups
live in `src/domain/guidance/protectionGuidance.json`; TypeScript validates and
maps the rounded category and selected shade into a structured result; the outing
feature renders it. Sources and rationale are recorded in
`notes/protection-guidance-research.md`. Create daylight or model folders when
implementing those capabilities.

This structure pass preserves existing behavior, including the rolling forecast
window and device-local planner inputs. Changes to forecast coverage, time-zone
handling, and recommendation rules are separate product work.
