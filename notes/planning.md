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
- Shade is a required four-option selection in the same compact selector style:
  open sun, mostly sun, half sun and shade, or overhead cover.
- The planner now produces a complete `TimePlan` only after start, end/duration,
  and shade are selected. The first result uses only the time window for its
  forecast; shade is retained for the later guidance layer.
- Practical protection guidance should be a separate, testable mapping from the
  structured outing result: peak UV category plus shade and daylight context.
  It should explain what the category means and suggest actions such as covering
  exposed skin, protecting eyes, or seeking shade, without pretending shade is a
  precise numerical correction to the forecast.
- Summarize an outing with peak and duration-weighted average UV, using only the
  peak category for guidance; show average temperature and the forecast range.
- The outing chart highlights every overlapping selected hour equally and adds
  up to three equally many faint context hours before and after when available.
