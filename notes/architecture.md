# Architecture direction

- `src/app/` owns the app layout, navigation, and shared screen state. Root
  `App.tsx` is the Expo entry point and delegates to `UvScoutApp`.
- `src/services/` owns HTTP requests and provider response parsing. Services
  return types defined in the domain and never import UI components.
- Domain modules must not import React, React Native, services, or features.
  Shared forecast, location, and outing types belong here so the dependency
  direction stays clear.
- Features may use services through hooks and feed their results into domain
  functions. Display formatting stays with features.
- See `docs/project-structure.md` for the file map and wiring examples.

- Keep product rules and calculations separate from React Native presentation
  code in `src/domain/`.
- Use `src/domain/uv/` for UV categories and other UV-specific mappings.
- Use `src/domain/outing/` for time-window calculations and outing summaries.
- Use `src/domain/guidance/` later for practical protection rules and wording.
- Use `src/domain/daylight/` later for dawn, sunrise, sunset, and dusk logic.
- Keep actual UI state, loading states, and layout in `src/features/`.
- Do not call this layer `data-science` yet: the first rules are explicit,
  testable product logic. If statistical or machine-learning models are added,
  they can live in a clearly named `src/domain/models/` area later.
