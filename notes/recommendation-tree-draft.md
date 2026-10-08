# UV Scout recommendation model — implementation slice v0.5

**Reviewed:** 8 October 2026. This revision has had separate evidence, logic,
and clarity/implementation passes against the installed UV evidence-review
prompt and the project sources.

**Status:** WHO's three-band reference is rendered as a static Info table. The
outing guidance composes the covered hourly UV profile, band durations,
peak/time, duration-weighted average, continuity, forecast coverage, and
conditional practical actions. Active policy and factor roles live in
`uvScoutRecommendationRules.json`; user-facing wording lives separately in
`uvScoutInsight.json`. Twenty-one manually traced scenarios document behavior and
edge cases; they are not automated tests or validated health-risk outputs. The
model does not convert these factors into a personal risk score or apply
invented duration-danger cutoffs.

**Purpose:** Document the implemented first outing-recommendation slice and
identify how future inputs could extend it without requiring extra questions
in the current planner.

Related evidence and factor inventory:
[recommendation model research](recommendation-model-research.md),
[protection guidance research](protection-guidance-research.md), and
[source register](data-sources.md).

## Decisions treated as fixed for this draft

- Show WHO's general three-band action reference (0–2, 3–7, 8+) in Info. It is
  not selected from the outing peak and is not presented as an outing algorithm.
  The app's named UV display categories remain a separate mapping.
- The user accepted this provisional profile set: peak and its time,
  duration-weighted average, estimated time in UV bands, and longest continuous
  elevated interval. Episode counts and UVI-hours are deferred for now.
- Do not let an average, shade, clouds, clothing, or activity erase the peak
  or alter the static WHO reference in Info.
- Do not ask for shade or other protection context in the default planner.
  Until the product decides otherwise, unknown conditions get concise
  conditional wording rather than assumptions.
- Temperature and cloud percentage remain forecast context; neither modifies
  the UV recommendation.
- For an outing of at least 120 minutes whose covered forecast reaches raw UVI
  3+, show a conditional sunscreen reminder. This is a UV Scout product trigger
  based on general reapplication guidance; it does not track application or
  create a personal timer.
- Keep the reasoning layers distinct: WHO's sourced reference is in Info;
  **UV guidance for outing** is UV Scout's own full-profile interpretation.
  Clearly say the Scout summary is approximate and is not personal dose or
  individualized health risk.

## Evidence versus UV Scout choices

**Source-backed guidance:** WHO says protection is recommended at UVI 3 or
above, describes greater potential for harm and less time before harm at higher
UVI, and recommends clothing, shade, eye protection, and sunscreen on uncovered
skin. WHO's UV Index table says people can enjoy being outdoors at UVI 0–2,
recommends shade during midday at UVI 3–7, and advises avoiding outdoor exposure
during midday at UVI 8+. Its 2024 advice recommends broad-spectrum SPF 30+,
liberal application, and reapplication every two hours, especially after
sweating or swimming; sunscreen should not extend time outdoors. FDA consumer
guidance also advises reapplication at least every two hours and more often
after swimming or sweating; exact U.S. water-resistance directions depend on
the product label. See [WHO's UVI explanation](https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-%28uv%29-index),
[WHO's protection guidance](https://www.who.int/news-room/questions-and-answers/item/radiation-protecting-against-skin-cancer),
and [FDA sunscreen guidance](https://www.fda.gov/drugs/understanding-over-counter-medicines/sunscreen-how-help-protect-your-skin-sun).

**UV Scout product choices in this draft:** combine the covered outing's raw
peak/time, duration-weighted average, estimated time in UV bands, longest
continuous elevated periods, and forecast coverage. Keep these as descriptive
profile signals; never infer personal dose or adjust forecast UV for shade,
cloud percentage, clothing, or activity. Apply practical messages only when
their corresponding forecast conditions are present, without creating new
medical duration thresholds.

**Deferred:** optional context questions; numeric sunscreen amount; future
start-time comparisons; and any labels such as “brief” or
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
| `peakUv` | Maximum raw UVI among overlapping forecast bins. | Shows the strongest forecast point and time; does not select the WHO table row or replace the full profile. |
| `peakTime` | Start time of the first maximum-UVI bin in the selected outing. | Shows when the strongest forecast UV occurs; does not select a WHO outing band. |
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

### 2. Build UV Scout's full outing profile

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
5. Keep `averageUv` as one profile fact, not the sole interpretation. The same
   mean can conceal different peaks, band durations, or patterns.

**Implemented display choice:** the overall headline now depends on whether
covered forecast time reaches raw UVI 3, not on the peak tier. Show nonzero
durations across the three bands, peak/time, average, and continuity when an
elevated band is split. Practical text is conditioned on the bands forecast.
Do not define a numeric “sustained” cutoff without evidence and review.

### 4. Add general baseline protection actions

Use WHO and other reviewed evidence to author UV Scout's own practical messages,
conditioned on the covered profile bands rather than copying the WHO table as
an outing algorithm. Keep actions complementary and concise: clothing/covering skin, a hat and
UV-protective eyewear, seeking shade when UV is strongest, and broad-spectrum
sunscreen on skin not covered by clothing. Follow the cited guidance and product
label; do not say sunscreen or shade eliminates risk or lets someone stay out
longer.

The tree should recommend sunscreen as one layer of protection for uncovered
skin, applied generously and according to its instructions. UV Scout now follows
WHO's 2024 recommendation for broad-spectrum SPF 30+; older WHO/FDA materials
may use different minimums. WHO gives an adult full-body amount example, but the
app should not turn it into a personalized quantity. Follow the product label
for application timing; WHO and FDA give different lead times. Any “how much?”
explainer should be educational and qualified, not a personalized quantity
calculation. See the
[WHO guidance](https://www.who.int/news-room/questions-and-answers/item/radiation-protecting-against-skin-cancer)
and [FDA guidance](https://www.fda.gov/drugs/understanding-over-counter-medicines/sunscreen-how-help-protect-your-skin-sun).

### 5. Add sunscreen duration and condition modifiers

These conditions affect protection advice, not the forecast UVI or WHO band.

| Known condition | Draft behavior | Unknown/not collected in default planner |
| --- | --- | --- |
| Outing is at least 120 minutes and its covered forecast reaches UVI 3+ | Add the editable, conditional reminder that this outing lasts at least two hours and users who use sunscreen can plan to reapply during it, following the product directions. This is not a due-time calculation. | Do not assume sunscreen was applied at outing start or calculate the number of personal reapplications. If the covered forecast stays below UVI 3, do not trigger this from duration alone. |
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
- Prioritize the result in this order: data limitation (if any), full-profile
  overview and relevant band durations, profile-conditioned practical actions, sunscreen
  reminder, known/conditional context, then timing comparison.
- Deduplicate repeated ideas and keep the first view compact; details can be
  disclosed progressively.

## Review scenarios: current expected behavior

The numeric profiles below are synthetic examples for reviewing the current
logic, not forecasts or new medical thresholds. Each number represents one
hourly forecast value used for that hour-long bin. Durations and averages are
approximate. Unless noted, assume full six-hour coverage. The WHO column means
the unchanged static table in Info; it is not a tier selected for that outing.

| Scenario and hourly UVI profile | Derived profile | Guidance assembled by current rules | What it checks |
| --- | --- | --- | --- |
| **Low throughout, 6h:** `[0, 1, 2, 2, 1, 0]` | Below 3: 6h; 3–<8: 0h; 8+: 0h. Peak 2; average 1.0. | “No covered forecast period reaches UV Index 3.” No elevated-band action or reapplication reminder; retain the note that this is not zero exposure. WHO's 0–2 guidance remains available in Info. | No reassurance that UV is zero; no unnecessary higher-band actions. |
| **Sustained moderate, 6h:** `[4, 5, 6, 6, 5, 4]` | Below 3: 0h; 3–<8: 6h; 8+: 0h. Peak 6; average 5.0; one continuous elevated period. | State that 3+ appears for about 6h, report the 3–<8 duration, peak/time, and average; give the 3–<8 practical protection text and the conditional sunscreen reminder. No separate “split period” detail because the period is continuous. | Sustained exposure remains visible; the peak does not stand in for the whole profile. |
| **Brief high peak, 6h:** `[0, 0, 8, 1, 0, 0]` | Below 3: 5h; 3–<8: 0h; 8+: 1h. Peak 8; average 1.5. | Headline reports about 1h at 3+; the high-period action applies to about 1h at 8+, not the whole outing. Show the low hours, peak/time, average, and conditional reapplication reminder (the planned outing is ≥2h and reaches 3+). | A high peak is retained without labeling all six hours high; average does not erase the peak. |
| **Separated elevated periods, 6h:** `[4, 1, 8, 2, 5, 1]` | Below 3: 3h; 3–<8: 2h; 8+: 1h. Peak 8; average 3.5; longest continuous 3+ run: 1h. | Report about 3h at 3+, with separate band durations, peak/time, average, and the longest continuous elevated run. Include both the 3–<8 and 8+ practical text, plus the conditional reminder. | Multiple applicable rules compose; the app need not have a unique paragraph for this exact sequence. |
| **Partial coverage, 6h planned:** four covered bins `[4, 4, 1, 1]`, then 2h missing | Covered: below 3 for 2h and 3–<8 for 2h; peak 4; average 2.5 over covered time. | Headline and band durations say “covered forecast”; show that 4h of the planned 6h are covered and the other 2h are unknown. The current two-hour reminder still triggers because the plan is 6h and the covered peak reaches 3+. | Missing time is not treated as zero; makes visible that the reapplication trigger currently uses planned duration plus the covered peak. |
| **Weather context changes, same UV:** hold `[1, 2, 4, 6, 5, 2]` fixed; compare cool/cloudy (14–18°C, 90–100% clouds) with warm/clear (24–30°C, 0–5% clouds); precipitation may also differ | UV profile remains: below 3 for 3h; 3–<8 for 3h; peak 6; average 3.3. | UV guidance stays the same; the weather values change their separate chart/summary display only. | Confirms that clouds, temperature, and precipitation are not hidden UV multipliers. It is a product-logic check, not a claim that a provider would forecast identical UV under every weather combination. |
| **Reapplication boundary:** 90 min versus 120 min at UVI 4 | Both are entirely in 3–<8; same peak/category, different outing duration. | The reminder is absent at 90 min and appears at exactly 120 min. It says “if you use sunscreen” and follows product directions; it does not schedule a personal application time. | Makes the current 120 min product cutoff explicit for later review; WHO's general advice is about reapplication, not this app's outing-start trigger. |

### How to read the combinations

Each rule is evaluated independently against the same profile, then relevant
messages are combined: UVI 3–<8 time, UVI 8+ time, coverage, and the
duration-based reminder can all contribute to one result. Temperature, clouds,
precipitation, and daylight do not currently branch UV protection guidance.
Sweating, swimming, toweling, shade, clothing coverage, reflective surfaces,
and personal vulnerability are unknown; the app does not infer them. Future
rules should be added only when a real input or carefully bounded conditional
message justifies them.

These are manually reasoned review examples, not executable unit tests. Before
changing thresholds or wording, compare the rendered result against these cases
and add automated domain tests when a test setup is introduced.

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

WHO reference actions are editable in `src/domain/guidance/whoGuidance.json`
and interpreted by `src/domain/guidance/getWhoGuidance.ts`. UV Scout's current
outing-profile wording and rules are in
`src/domain/guidance/uvScoutInsight.json` for wording and
`src/domain/guidance/uvScoutRecommendationRules.json` for active policy, both
interpreted by `src/domain/guidance/getUvScoutInsight.ts`. The WHO table is shown in Info;
only the Scout profile appears in outing guidance. Outing metrics come from
`src/domain/outing/calculateOutingForecast.ts`.

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

## Expanded review scenarios — controlling review set (8 October 2026)

This section extends the earlier scenarios above and is the current review set.
It was manually traced against `src/domain/guidance/uvScoutRecommendationRules.json`
and `getUvScoutInsight.ts`. These are not automated tests or validated health-
risk outcomes. Hourly values are treated as representative of their hour by
UV Scout, so durations are approximate forecast summaries, not continuous
personal measurements.

| # | Scenario / example | Expected model behavior and check |
| --- | --- | --- |
| 1 | Low throughout: `[0,1,2,2,1,0]` for 6 h | 6 h below 3, peak 2, weighted average 1.0; no above-3 practical action or two-hour reminder. Describe forecast conditions, not zero exposure or personal assurance. |
| 2 | Sustained moderate: `[4,5,6,6,5,4]` for 6 h | 6 h at 3–<8, peak/time retained, average 5.0, longest continuous ≥3 is 6 h; band-specific practical guidance and conditional reminder. No invented “dangerous after X hours” cutoff. |
| 3 | Brief 8+ peak, otherwise low: `[0,0,8,1,0,0]` for 6 h | 5 h below 3 and 1 h at 8+, peak 8, average 1.5. Preserve the high interval and its action without describing all six hours as high. |
| 4 | Mixed moderate and 8+: `[4,4,8,4,4,4]` for 6 h | 5 h at 3–<8 and 1 h at 8+, average about 4.7; communicate both sustained moderate and the distinct higher hour. The average does not remove the peak. |
| 5 | Equal mean, different profile: `[4,4,4,4]` vs `[0,0,8,8]` for 4 h | Both average 4, but first has 4 h at 3–<8 and second 2 h below 3 plus 2 h at 8+. Band durations and peak preserve the difference. |
| 6 | Same total elevated time, separated: `[4,1,4,1,4,1]` | Three distinct forecast stretches at 3–<8; longest elevated run is 1 h, not the 3 h total. Do not call it three continuous hours. |
| 7 | Exact band boundaries: `[2.9,3.0,7.9,8.0]`, 1 h per bin | Exactly 1 h below 3, 2 h at 3–<8, and 1 h at 8+. Raw values decide rules; display-category rounding does not change them. |
| 8 | Partial bins: 30 min at UVI 2, 60 min at 4, 30 min at 8 | 30 min below 3, 60 min at 3–<8, 30 min at 8+; weighted average 4.5. Confirms overlap weighting rather than counting touched hours as full hours. |
| 9 | Partial coverage: 3 h requested, only 2 h covered at `[4,4]` | Describe 2 covered hours at 3–<8, average 4 over covered time, and disclose the missing hour. Do not imply it was low or complete. Current 120-minute reminder uses planned duration plus covered peak; keep conditional. |
| 10 | Missing gap splits a run: UVI 5 for 1 h, no forecast for 1 h, then UVI 5 for 1 h | Two covered elevated hours total, but neither continuous interval exceeds 1 h. Missing coverage is not zero UV and breaks continuity. |
| 11 | No usable overlap / no forecast | Do not produce a recommendation from nonexistent data. Ask the user to adjust time/duration; never substitute zeros. |
| 12 | Reminder duration boundary: 119 vs 120 planned minutes, covered peak UVI 4 | Reminder absent at 119 and present at 120, phrased “if you use sunscreen”; this is an editable planning reminder, not a personal timer. |
| 13 | Reminder UV boundary: 120 min, peak UVI 2.9 vs 3.0 | No reminder below raw 3; reminder at raw 3 when duration is also ≥120 min. Do not use rounded display category. |
| 14 | Same UV profile, differing temperature/cloud/rain | UV Scout advice is unchanged. Weather remains separate. Cloud percentage is not “UV blocked %”; cool weather does not imply protective clothing or lower UV. |
| 15 | Snow, sand, water, or elevation might matter but are unknown | When covered UVI reaches 3+, add the conditional reflection note; do not claim the user is there or apply a numeric adjustment. Elevation remains part of forecast context and is not separately adjusted. |
| 16 | Route shade, clothing coverage, and eyewear unknown | Do not assume shade or what the person wears. Keep complementary general actions; no shade multiplier. |
| 17 | Swimming, heavy sweating, exercise, toweling, product/application unknown | When covered UVI reaches 3+, show a conditional sunscreen reminder to follow the product directions and reapply after swimming, sweating, or drying off. Do not assert that the user is swimming/sweating or calculate product-specific timers. |
| 18 | Bright reflective surroundings unknown (snow, bright sand, water) | When covered UVI reaches 3+, explain conditionally that reflection can add UV beyond the location forecast. Do not infer the surface or apply a numeric multiplier. |
| 19 | Nighttime forecast has UVI 0 and daylight markers show darkness | Report forecast and daylight separately; darkness is not an all-outing health assurance, nor should day/night be inferred from UV alone. |
| 20 | Long outing but UVI below 3: 8 h `[0,1,1,2,1,1,0,0]` | Duration remains visible but does not alone trigger the two-hour reminder when covered peak is below 3. No individual risk conclusion. |
| 21 | Repeated moderate/high values over a long outing | Keep peak, time in bands, average, and longest continuity separate. No composite risk score, UVI-hours dose, or unsupported “overall risk” ranking. |

These 21 scenarios are coverage of distinct behavior classes, not an attempt to
enumerate every possible hourly combination. Add automated tests when a test
harness exists; exact checks should include UVI 3/8, 119/120 minutes, partial
overlaps, missing intervals, zero coverage, and weather changes that must not
alter UV advice.

The model composes independent observations: forecast bands, duration,
peak/time, weighted mean, continuous elevated spans, and coverage. Shade,
clothing, reflectivity, personal sensitivity, sunscreen application/product,
sweating, and swimming are relevant but unknown to the default planner; they
are not guessed or quantified. There is no composite risk score or dose model.
