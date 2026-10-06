# Time planning behavior

- The default start is `Now`.
- The user can switch to a scheduled start time.
- The user chooses either a duration or an explicit end time; both are not shown
  as competing inputs at the same time.
- Duration presets are 30 minutes, 1 hour, 2 hours, 3 hours, and 4 hours, with
  custom minutes available.
- A scheduled start and an end time must be in the future, and the end must be
  after the start. Crossing midnight is allowed.
- Scheduled start/end use a native Android date/time flow and a browser
  `datetime-local` control on web.
- The first controls use the device's local time. Location-specific timezone
  handling should be completed before the recommendation flow is finalized.
- Show Start, End, and Duration as compact rows with the selected value visible;
  tapping a row reveals its choices vertically, with only one list open at a time.
- The planner produces a `TimePlan` once start and end/duration are selected;
-  show the forecast and guidance immediately without asking about route shade.
- Practical protection guidance is a separate, testable mapping from the outing
  forecast: use raw peak UV for the WHO-reference level, then report approximate
  UV-band duration and forecast completeness. Add the conditional sunscreen
  reminder only at 120+ minutes when the covered forecast reaches raw UVI 3+.
  Unknown conditions (such as sweating or swimming) must not be inferred.
  See the [recommendation tree](recommendation-tree-draft.md) and
  [factor/evidence review](recommendation-model-research.md).
- Summarize an outing with peak and duration-weighted average UV, using only the
  peak category for guidance; show average temperature and the forecast range.
- The outing chart highlights every overlapping selected hour equally and adds
  up to three equally many faint context hours before and after when available.
