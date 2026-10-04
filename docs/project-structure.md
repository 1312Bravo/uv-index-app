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
    uv/uvCategories.ts        UV category mapping
  services/                   External requests and response parsing
    forecast/                 Open-Meteo forecasts
    location/                 Place search and reverse geocoding
  features/                   UI components, formatting, React hooks
    forecast/                 Hourly chart and forecast loading hook
    location/                 Location selection and display formatting
    planning/                 Time and shade inputs, platform date/time picker
    outing/                   Outing forecast result
notes/                        Durable decisions and requirements
docs/                         Run instructions and implementation guides
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

| Change | Home |
| --- | --- |
| Tab order, app layout, shared screen state | `src/app/` |
| Input controls, chart styling, display formatting | `src/features/` |
| API URL, provider parsing, request handling | `src/services/` |
| UV thresholds, shade definitions, outing calculations | `src/domain/` |
| Explanation of an accepted product rule | `notes/` |
| How to run or extend the app | `docs/` |

For future protection guidance, add a focused module under `src/domain/guidance/`.
It can accept an outing summary and shade selection and return a structured
guidance result. A feature component renders that result. Keep sources and
rationale for recommendation rules in notes; verify boundary cases when those
rules are introduced. Create daylight or model folders when implementing them.

This structure pass preserves existing behavior, including the rolling forecast
window and device-local planner inputs. Changes to forecast coverage, time-zone
handling, and recommendation rules are separate product work.
