# Outing wind and gust summary

Added 2026-10-31 in development.

## Source

The [Open-Meteo Forecast API parameter table](https://open-meteo.com/en/docs)
defines `wind_gusts_10m` as the maximum gust during the preceding hour, in
km/h by default. `wind_speed_10m` is an instantaneous reading. Both describe
wind at 10 metres above ground, not the user's exact surroundings. The
documentation is unversioned; these definitions were checked 2026-10-31.
Existing Open-Meteo model, attribution, licence, and non-commercial API limits
in `data-sources.md` apply.

## Calculation choices

- Average wind and its range keep their existing forward-hour approximation
  over the selected outing.
- Each gust value belongs to the hour ending at its source timestamp. A
  12:00 gust peak represents 11:00-12:00.
- Average hourly gust peak is the duration-weighted average of the available
  hourly maxima whose intervals overlap the outing. For example, 30 minutes
  of an hour with peak 12 km/h and 60 minutes with peak 36 km/h give 28 km/h.
- Gust peaks range is the minimum and maximum of those available hourly
  maxima. It is not the range of every gust within an hour, and its minimum
  is not the lowest wind speed.
- An hourly maximum is not prorated or interpolated. Using it for a partial
  hour includes the possibility that the peak occurred outside the selected
  minutes. Neither the average nor range reveals an exact gust time.
- Missing, non-finite, or negative peaks are unavailable, not zero. Zero is
  retained. Average weighting excludes unavailable intervals; the range uses
  available intervals only. An entirely missing series displays dashes.
- Display values round to whole km/h after calculation. There are no gust
  warnings, activity assumptions, or changes to UV protection rules.

These aggregation and presentation choices are UV Scout's interpretation,
not provider-supplied outing statistics or a wind-safety assessment.

## Wiring and editing

`src/services/forecast/getHourlyForecast.ts` requests hourly gusts and parses
them into `ForecastHour.windGust`. The current-conditions response does not
override this hourly maximum. `src/domain/outing/calculateOutingForecast.ts`
returns `averageHourlyGustPeak`, `lowestHourlyGustPeak`, and
`highestHourlyGustPeak`, separately from wind speed.

`src/features/outing/OutingForecastMetrics.tsx` places the average gust peak in
parentheses beside average wind, with the gust value slightly smaller. Smaller
labels below read Average (hourly gust peak). A smaller line pairs
the wind range with the gust range in parentheses. This addition does not add gusts to
the hourly charts.

UV Outlook also requests the provider's separate current-condition gust
estimate. It appears in parentheses beside current wind, labelled Wind
(gusts), with the current timestamp. This is not an outing average or a
substitute for the original hourly maxima. Missing current gusts remain
unavailable. See `data-sources.md` for this additional field and its source.
