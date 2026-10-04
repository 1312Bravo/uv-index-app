# Architecture direction

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
