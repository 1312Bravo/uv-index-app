# Hourly UV timing review

Reviewed 2026-10-31 while investigating the outing maximum differing from the
compact chart. The user chose correction to the provider intervals instead of
adding interpolation. Implemented in the Expo Go development branch.

## Provider definition

The [Open-Meteo Forecast API parameter table](https://open-meteo.com/en/docs)
lists `uv_index` and `uv_index_clear_sky` as "Preceding hour mean". Its
description explicitly says UV index is an average of the preceding hour.
The page has no publication version shown; checked 2026-10-31.

Therefore, a value timestamped 12:00 describes 11:00-12:00, rather than an
instantaneous UV value at noon or the average for 12:00-13:00. This timing
differs from instantaneous temperature, cloud cover, and wind speed.

## Previous interpretation

`src/domain/outing/calculateOutingForecast.ts` previously applied the same
forward-hour overlap helper to UV and instantaneous weather values.
`src/domain/forecast/getUvForecastAtTime.ts` treats hourly UV as timestamp
samples for interpolation. Those are existing app interpretations; the
provider definition above does not establish them as instantaneous forecasts.
Earlier notes describing hourly UV timestamps that way are superseded by
this review.

The proposed linear interpolation would smooth adjacent hourly averages. It
would not recover an instantaneous peak, make hourly data more precise, or
justify claiming an exact UV forecast at a particular minute.

## Reported example

Outing: 07:52-11:52. Displayed hourly values: 07:00 = 0.4, 08:00 = 0.3,
09:00 = 1.1, 10:00 = 1.9, 11:00 = 2.6, 12:00 = 2.9.

- Existing forward-hour interpretation: maximum 2.6; weighted average
  `(0.4*8 + 0.3*60 + 1.1*60 + 1.9*60 + 2.6*52) / 240 = 1.4017`.
- Preceding-hour interpretation: maximum hourly mean overlapping the outing
  is 2.9; weighted average
  `(0.3*8 + 1.1*60 + 1.9*60 + 2.6*60 + 2.9*52) / 240 = 2.0383`.

Weighting a partial interval by its hourly mean assumes that mean represents
the partial interval too. That is a UV Scout approximation; an hourly mean
cannot reveal variation within the hour or an instantaneous maximum.

## Implemented interval correction

`src/domain/outing/outingUvIntervals.ts` converts source endpoints into interval
starts, retains `sourceTime`, and uses `hourlyUv` so a Now estimate cannot
replace an hourly mean. Outing maxima, weighted averages, coverage, breakdown,
and protection timing consume these normalized intervals. Cloud reminders join
cloud cover from the same interval's beginning rather than the following hour.
Weather averages select their own intervals; precipitation retains its own
preceding-hour sum convention. Missing UV intervals remain gaps; coverage ends
at the last available UV endpoint, without inventing a following hour.

The compact chart uses the summary's UV intervals, including only those with
positive overlap with the outing. It keeps the provider's endpoint labels,
displays original hourly means, and uses equal opacity for every bar. The maximum
label says highest hourly UV Index to distinguish it from an instantaneous
peak. WHO thresholds and protection actions are unchanged.

The full outing chart displays UV at Open-Meteo's source timestamp, like the
compact outing chart. A UV bar is marked as overlapping the outing when its
preceding-hour interval overlaps the selected time. The column background
continues to show the selected forward-hour window for instantaneous weather
readings. This lets the final UV sample be included without implying that a
temperature or cloud reading timestamped after the outing is part of it.

UV Outlook custom-time smoothing remains a separate issue for review. Its
comment now records the correct source meaning, but its behavior was not
changed in this outing fix.
