# UV Scout recommendation tree — review draft v0.2

**Reviewed:** 6 October 2026. This revision has had separate evidence, logic,
and clarity/implementation passes against the installed UV evidence-review
prompt and the project sources.

**Status:** The first v1 slice is implemented in the app: raw-peak WHO reference,
hour-band durations, partial-coverage notice, baseline actions, and the accepted
two-hour sunscreen reminder. The remaining optional-condition and timing ideas
are still proposals. This is general planning guidance, not personalized or
medically validated advice.

**Purpose:** Document the implemented first outing-recommendation slice and
identify how future inputs could extend it without requiring extra questions
in the current planner.

Related evidence and factor inventory:
[recommendation model research](recommendation-model-research.md),
[protection guidance research](protection-guidance-research.md), and
[source register](data-sources.md).

## Decisions treated as fixed for this draft

- Keep the WHO reference separate and keyed to the outing's highest **raw** UV
  value: below 3; 3 to below 8; and 8 or higher. **Product choice:** applying
  this standard guidance to the maximum within a user-selected outing is
  UV Scout's design; WHO defines UVI guidance but does not prescribe this exact
  outing-window algorithm. The existing app's named UV display categories are
  a separate mapping.
- The user accepted this provisional profile set: peak and its time,
  duration-weighted average, estimated time in UV bands, and longest continuous
  elevated interval. Episode counts and UVI-hours are deferred for now.
- Do not let an average, shade, clouds, clothing, or activity lower the peak's
  WHO reference band.
- Do not ask for shade or other protection context in the default planner.
  Until the product decides otherwise, unknown conditions get concise
  conditional wording rather than assumptions.
- Temperature and cloud percentage remain forecast context; neither modifies
  the UV recommendation.
- For an outing of at least 120 minutes whose covered forecast reaches raw UVI
  3+, show a conditional sunscreen reminder. This is a UV Scout product trigger
  based on general reapplication guidance; it does not track application or
  create a personal timer.

## Evidence versus UV Scout choices

**Source-backed guidance:** WHO says protection is recommended at UVI 3 or
above, describes greater potential for harm and less time before harm at higher
UVI, and recommends clothing, shade, eye protection, and sunscreen on uncovered
skin. WHO also says sunscreen should not extend time outdoors and advises
reapplication every two hours, particularly after sweating, swimming, or
exercise. FDA consumer guidance says reapply at least every two hours and more
often after swimming or sweating; the exact U.S. water-resistance directions
depend on the product label. See [WHO's UVI explanation](https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-%28uv%29-index),
[WHO's protection guidance](https://www.who.int/news-room/questions-and-answers/item/radiation-protecting-against-skin-cancer),
and [FDA sunscreen guidance](https://www.fda.gov/drugs/understanding-over-counter-medicines/sunscreen-how-help-protect-your-skin-sun).

**UV Scout product choices in this draft:** use the covered outing's raw peak
for the reference band; compute duration-weighted summaries using the app's
one-hour-bin convention; keep profile metrics descriptive; never infer personal
dose or adjust forecast UV for shade, cloud percentage, clothing, or activity.

**Deferred:** optional context questions; SPF policy and numeric sunscreen
amount; future start-time comparisons; and any labels such as “brief” or
“sustained.” The initial implementation reports forecast durations without
classifying them with extra health-risk thresholds.

## Inputs and derived profile

### Direct inputs already available

| Input | Source / handling |
| --- | --- |
| Selected location and timezone | Selected place/device coordinates and forecast timezone. The forecast represents a grid/model location, not the user's route. |
| Outing start and end | User's selected time interval. Compute actual overlap with forecast hour bins, including partial first/last bins. |
| Hourly UV forecast | Open-Meteo regular [`uv_index`](https://open-meteo.com/en/docs), retained as raw decimal values. Its API documentation says most hourly values are instantaneous at the indicated hour. Treating each point as its one-hour bin is UV Scout's approximation, consistent with current outing math—not an Open-Meteo period average. Do not recalculate it from cloud percentage. |
| Forecast temperature and cloud percentage | Display/context only, outside the UV decision branches. |
| Daylight events | Calculated from location/date for timing context only; daylight is not a UV proxy. |

### Derived metrics proposed for v0.2

Calculate each from the hourly forecast values and the selected outing's overlap
with each hour:

| Metric | Definition for this draft | Use |
| --- | --- | --- |
| `peakUv` | Maximum raw UVI among overlapping forecast bins. | Selects the separate WHO reference band. |
| `peakTime` | Start time of the first maximum-UVI bin in the selected outing. | Shows when the strongest forecast UV occurs. |
| `averageUv` | Duration-weighted mean over forecast-covered portions of the outing; consistent with the existing `summarizeOutingForecast` method. | Descriptive only; never overrides the peak or time-in-band. |
| `minutesByUvBand` | Sum of overlapping seconds in 0–<3, 3–<8, and 8+ bands, converted to minutes. Treat each hourly point as representative of its one-hour bin, matching existing chart/summary semantics. | Distinguishes intensity levels and how long they occur. Mark approximate. |
| `longestContinuousMinutesAtOrAbove3` | Longest consecutive span of covered bins whose raw UVI is at least 3. A missing forecast interval breaks continuity. | Distinguishes sustained elevated UV from separated/brief periods. |
| `longestContinuousMinutesAtOrAbove8` | Longest consecutive span of covered bins whose raw UVI is at least 8. A missing interval breaks continuity. | Adds context when very high or extreme UV is sustained. |
| `coverage` | Forecast-covered duration divided by requested outing duration, plus missing intervals. Calculated by `summarizeOutingForecast`. | Gates complete-outing claims and gives an explicit limitation when partial. |

These are forecast summaries, not a personal dose, burn-time estimate, or
validated health-outcome score. WHO discusses duration/frequency and cumulative
exposure in health outcomes, but does not provide UV Scout a formula to convert
this hourly forecast to an individual's risk ([WHO health-effects guidance](https://www.who.int/news-room/questions-and-answers/item/radiation-the-known-health-effects-of-ultraviolet-radiation)).
The current app's hourly values stand for one-hour bins and its average is
weighted by bin overlap; derived minutes are therefore estimates, especially
around changing hourly conditions.

## Decision flow

### 1. Validate data before interpreting it

1. If there is no usable location or no overlapping UV forecast, do not produce
   an outing recommendation.
2. Compare available forecast bins with the requested outing duration. The
   loaded forecast is a rolling window; the outing summary calculates its
   covered fraction and any missing intervals. The API model-issuance timestamp
   is not retained by the service.
3. If coverage is partial, identify the missing period. Do not fill gaps with
   zero, include them in a denominator silently, or describe a partial peak as
   the peak for the whole outing.
4. Only generate profile statements whose required samples are covered. A
   missing-data explanation takes priority over a confident duration summary.
   Do not claim calibrated forecast uncertainty or stale-model age; the current
   service does not expose those fields in `HourlyForecast`.

If there are no overlapping forecast hours, `summarizeOutingForecast` returns
`null`. When coverage is partial, its weighted mean is explicitly over covered
seconds only; the UI adds a caveat and the peak describes available data, not
the unknown full outing. The service does not retain a forecast issuance time
or explicit fetch timestamp in `HourlyForecast`, so the app does not claim a
freshness age.

### 2. Select the WHO reference from the raw outing peak

| Peak raw UVI | WHO guidance applied by UV Scout | Base interpretation |
| --- | --- | --- |
| `< 3` | Below WHO's usual protection threshold | The WHO UVI action threshold of 3 was not reached in the covered forecast. Do not promise zero risk or infer personal vulnerability. |
| `3 to < 8` | WHO protection band | Explain that protection is recommended during elevated-UV periods. |
| `>= 8` | WHO extra-protection band | Explain that extra protection is important during the very-high/greater period. |

The peak chooses this reference even if it occurs briefly. This is UV Scout's
conservative product rule based on WHO's intensity guidance—not a WHO-validated
algorithm for outing-level exposure. It preserves the high-UV signal instead of
allowing a low average to conceal a peak. WHO says higher UVI means greater
potential for harm and less time before harm can occur ([WHO UVI guidance](https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-%28uv%29-index)).

### 3. Add the outing-profile explanation

Always retain the peak and present duration facts separately. For the first
draft, use descriptive time values rather than invented labels such as
“dangerous,” “safe,” “brief exposure,” or “sustained risk.”

1. If `minutesByUvBand[3–<8]` and `minutesByUvBand[8+]` are both zero, say no
   covered hour-bin in this forecast reached UVI 3; include a coverage caveat if
   the outing is not fully covered.
2. If some time is in 3–<8, report its estimated duration. If some time is in
   8+, report that duration separately rather than folding it into an average.
3. If a threshold band covers the full outing, say the forecast remains in that
   band throughout the covered period. If it covers only part, state the
   estimated time in that band and the total plan duration.
4. Use the longest continuous interval to distinguish an uninterrupted stretch
   from the same total elevated time split across the outing. Exact user-facing
   wording and whether both threshold intervals should be shown remain open.
5. Keep `averageUv` as a supporting statistic, not the primary interpretation.
   The same mean can conceal different peaks or patterns.

**Implemented first display choice:** show nonzero durations for the three UV
bands and add a continuity sentence only when elevated UV is split into
separate periods. Do not define a numeric “sustained” cutoff without reviewing
example profiles. Revisit result density after using the app with real outings.

### 4. Add general baseline protection actions

Use the selected WHO reference band to choose the baseline action set. Keep
actions complementary and concise: clothing/covering skin, a hat and
UV-protective eyewear, seeking shade when UV is strongest, and broad-spectrum
sunscreen on skin not covered by clothing. Follow the cited guidance and product
label; do not say sunscreen or shade eliminates risk or lets someone stay out
longer.

The tree should recommend sunscreen as one layer of protection for uncovered
skin, applied generously/evenly and according to its instructions. WHO advises
broad-spectrum SPF 30+ and gives an adult full-body amount example; FDA guidance
uses a different SPF policy and amount example. Those differences mean UV Scout
must not silently turn either source's numeric SPF or full-body amount into a
universal personal rule. Follow the product label for application timing; WHO
and FDA give different lead times. Any “how much?” explainer should be
educational and qualified, not a personalized quantity calculation. See the
[WHO guidance](https://www.who.int/news-room/questions-and-answers/item/radiation-protecting-against-skin-cancer)
and [FDA guidance](https://www.fda.gov/drugs/understanding-over-counter-medicines/sunscreen-how-help-protect-your-skin-sun).

### 5. Add sunscreen duration and condition modifiers

These conditions affect protection advice, not the forecast UVI or WHO band.

| Known condition | Draft behavior | Unknown/not collected in default planner |
| --- | --- | --- |
| Outing is at least 120 minutes and its covered forecast reaches UVI 3+ | Add the editable, conditional reminder that users who use sunscreen should follow its label and plan to reapply about every two hours, sooner as directed after swimming or sweating. This is not a due-time calculation. | Do not assume sunscreen was applied at outing start or calculate the number of personal reapplications. If the covered forecast stays below UVI 3, do not trigger this from duration alone. |
| Heavy sweating | If explicitly known in a future optional flow, emphasize reapplication sooner/afterward as directed by the product label. | Keep “especially after heavy sweating” conditional; do not infer sweat from running, hiking, cycling, temperature, humidity, or duration. |
| Swimming/bathing | If explicitly known in a future optional flow, emphasize a product labelled for water resistance and following its water-specific reapplication directions. | Keep “especially after swimming” conditional; do not use a generic 40/80-minute timer across countries/products. |
| Toweling/drying off | If explicitly known in a future optional flow, include label-directed reapplication after toweling. | No assumption or detection. |
| Time sunscreen was applied and product directions | If supplied in a future version, compare the user's stated application time with label directions and the planned outing; clearly indicate this is a reminder, not verified protection. | No countdown, application tracking, amount calculation, or guarantee in v0.2. |

WHO advises reapplication every two hours, particularly after sweating,
swimming, playing, or exercising; FDA consumer guidance advises more often when
sweating or swimming and directs users to the product label. Exact product
directions vary, so the tree should not invent a more precise sweat-dependent
interval ([WHO](https://www.who.int/news-room/questions-and-answers/item/radiation-protecting-against-skin-cancer),
[FDA](https://www.fda.gov/drugs/understanding-over-counter-medicines/sunscreen-how-help-protect-your-skin-sun)).

### 6. Add route/clothing context only when known

- Keep concise general shade and clothing guidance in baseline actions; the
  default planner will not ask the user to choose a shade level.
- If reflective surroundings (snow, water, sand, bright surfaces) are known,
  add a caution about reflected/scattered UV and shade's limitations. If unknown,
  use conditional wording only if it fits the limited result space.
- If clothing coverage is known in a future optional tailoring flow, focus
  sunscreen wording on uncovered skin. Do not infer coverage from temperature,
  season, or activity.
- Never apply a numeric shade, clothing, or reflective-surface multiplier to
  the provider's UV forecast without validated route/surface evidence.

### 7. Add timing context and order the result

- Show when the peak and elevated intervals occur in local time.
- Compare only future alternative starts and keep duration equal; surface
  daylight/twilight/darkness separately from UV values.
- Do not tell the user to move an outing to a particular time; describe the
  forecast difference so the user can decide.
- Prioritize the result in this order: data limitation (if any), WHO peak band,
  profile-specific duration observation, baseline actions, relevant sunscreen
  reminder, known/conditional context, then timing comparison.
- Deduplicate repeated ideas and keep the first view compact; details can be
  disclosed progressively.

## Example cases and expected model behavior

The numeric profiles below are synthetic test inputs, not forecasts or medical
threshold recommendations. “UVI 0 for four hours” means the forecast samples
represent those one-hour bins in the app's existing aggregation convention.

| Profile | WHO reference | Profile-specific interpretation | Sunscreen/context branch |
| --- | --- | --- | --- |
| 1 hour at UVI 8, then 4 hours at UVI 0 | Extra protection, because peak is 8. | Report approximately 1 hour at 8+ and 4 hours below 3; do not describe all five hours as very high. | General label advice; no personalized reminder unless the outing duration rule is triggered and phrased conditionally. |
| 8 hours continuously at UVI 7 | Protection recommended, because peak is 7. | Report elevated UV in the 3–<8 band throughout the covered 8 hours; keep peak, mean, and continuity visible as separate facts. | A long-plan reminder is relevant, but without application time it remains a general conditional reminder, not a schedule. |
| Peak UVI 8 for 1 hour, then 4 hours at UVI 2 | Extra protection, because peak is 8. | Distinguish about 1 hour at 8+ from about 4 hours in 0–<3; the average must not hide the peak. | Do not equate the later lower-UVI period with no risk or use it to cancel peak guidance. |
| 4 hours at UVI 6; heavy sweating explicitly selected | Protection recommended, because peak is 6. | Report the 3–<8 forecast duration and continuous profile. | Add the known sweat modifier: follow sunscreen label and reapply sooner/afterward as directed. |
| Same as above, but sweating is unknown | Protection recommended, because peak is 6. | Same UV profile result; unknown sweat cannot alter the forecast interpretation. | Use conditional “if you sweat heavily…” wording or omit if message limits require it. |
| Outing spans 6 hours but only 3 hours have forecast coverage | Report the peak only for the covered portion and clearly say the full-outing peak is unknown. | Do not state full-outing time-in-band or average as complete. | General advice may remain, but no forecast-specific duration reminder should be presented as if based on complete coverage. |

## Deferred product decisions

1. Are the listed profile metrics the right calculations, and should all be
   shown or should continuity remain internal?
2. Should exact time-in-band facts be displayed for every outing, or only when
   elevated UV occurs? What compact phrasing feels understandable?
3. Should a future optional input ask about heavy sweating/swimming, or should
   these remain conditional tips without extra questions?
4. Should reflective surroundings get a future optional input, or remain
   conditional general advice?
5. How much result text is acceptable before the minimal UI feels overloaded?

The editable rule data is in
`src/domain/guidance/protectionGuidance.json`; TypeScript validates and
interprets it in `src/domain/guidance/getProtectionGuidance.ts`, with outing
metrics from `src/domain/outing/calculateOutingForecast.ts`.

## Review passes completed

1. **Evidence alignment:** checked WHO's UVI action bands and protection
   language, sunscreen guidance from WHO/FDA, and Open-Meteo's hourly-value
   semantics. Separated sourced guidance from UV Scout's own outing-level
   choices; recorded the links in the source notes/register.
2. **Logic and edge cases:** walked through a short peak followed by low UV,
   long sustained elevated UV, identical peaks with different profiles,
   unknown versus known sweat/water conditions, partial forecast coverage, and
   daylight/timing constraints. Removed implications of personal dose,
   guessed sweating, missing-data-as-zero, and full-outing claims from partial
   samples.
3. **Implementation fit and clarity:** compared proposed inputs and metrics
   with the current forecast service and outing summary. Implemented coverage
   calculations and a partial-forecast caveat; deferred model-age claims because
   the service does not expose a meaningful issuance timestamp. Left optional
   conditions and future timing comparisons out of this first slice.

These passes improve traceability and internal consistency; they do not make
the proposal medically validated or replace a domain expert's review.
