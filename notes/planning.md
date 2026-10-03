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
