# UV Scout outing guidance: active MVP rules

Reviewed 2026-10-15. This is the current, reviewable description of the rules
the app runs. The older [recommendation-model research](recommendation-model-research.md)
and [recommendation-tree draft](recommendation-tree-draft.md) preserve the evidence
and earlier proposals; they are not the source of truth for current behavior.

## What the user sees

In Plan an Outing, **UV guidance** shows any forecast-coverage warning
and a short, untitled bulleted takeaway. For mixed UV, the first bullet gives
the covered range, duration-weighted average, and peak forecast hour. The
second bullet follows consecutive forecast windows in local-time order, with
different protection wording for below-3, 3-to-below-8, and 8+ UV. Adjacent
hours in the same band share one window; gaps in coverage do not merge.
Steady UV uses a simpler first-bullet duration summary. **UV breakdown** is a flat bullet list, starting
with start/end and average, then the highest and lowest displayed hourly UV
values with their total covered durations and local-time
windows, and any values between them with their total duration. When a mixed
outing has several distinct below-3 values, UV breakdown also totals those
lower-UV hours and their windows. The opening guidance already says what to
do in those hours. **Protection steps** lists sunscreen preparation, clothing
and shade, extra care at UVI 8+ when relevant, and sunscreen reapplication.
The sunscreen step distinguishes UV 3+ at the selected start from a later
first forecast UVI 3+ period. Clothing and shade names the total forecast
time at UVI 3+; Strongest hours names the total at UVI 8+. Their exact
local-time windows remain as quieter lines beneath those actions.
Cloud and reflective-surface cautions appear below as smaller context notes.
For all-below-3 outings, the takeaway gives the practical outcome and the
duplicate Protection steps section is omitted. Both section headings are
centered. There is no separate Summary at the bottom. The four
weather/UV metrics and hourly chart follow. WHO's general three-band reference
remains in Info, separate from this UV Scout outing guidance.

## Active decision rules

| Condition in the covered hourly forecast | Result |
| --- | --- |
| All covered values are below raw UVI 3 | Say that most people do not need extra sun protection for the forecast hours. Do not use a separate night rule. |
| Any covered time is at raw UVI 3 or higher | Name the relevant local-time periods and recommend clothing, a broad-brimmed hat, UV-protective sunglasses, available shade, and broad-spectrum SPF 30+ sunscreen on uncovered skin. |
| Any covered time is at raw UVI 8 or higher | Additionally identify those periods and advise limiting direct sun and prioritizing shade. |
| An outing has both below-3 and UVI 3+ covered time | The opening guidance says that most people do not need extra sun protection during the below-3 windows. UV breakdown retains the lowest-value duration and windows, and adds a combined below-3 duration/window line only when lower UV spans more than that one value. This does not cancel protection advice for the UVI 3+ hours. |
| Any covered time is at raw UVI 3 or higher | Recommend SPF 30+ on uncovered skin. If UVI 3+ is present at the selected start, say so; otherwise name the first forecast UVI 3+ start and advise applying before then. If sunscreen is used, give the general two-hour-after-application reapplication advice, with earlier reapplication after swimming, sweating, or towel drying and product-label directions. This is not a personal timer based on forecast hours. |
| Cloud cover is at least 76% during any hour at raw UVI 3 or higher | Add a reminder to keep UV protection in place during those cloudy hours. The 76% boundary comes from UV Scout's editable display band, not a health threshold. |
| Any covered time is at raw UVI 3 or higher | Add one conditional reminder about reflected UV near snow, bright sand, or water. The app does not know whether those surfaces are present. |
| Some requested time has no forecast | Warn how much of the outing is covered. Never substitute zero UV for missing time. Low-UV advice applies only to known hours, and missing intervals split otherwise separate elevated periods. |

The takeaway first describes the range and weighted average (or steady level)
of the covered forecast. Its second bullet is a chronological protection plan:
each band window has an approximate local-time range and matching action. Its
displayed start is rounded down and its end rounded up to the nearest local
half hour, with "around" wording. The exact selected times and forecast-bin
overlaps still drive every calculation, and Breakdown and Protection steps
keep their existing times. The second bullet does not repeat
the first bullet's UV metrics. For only below-3 forecast values, the existing
two-bullet low-UV outcome remains. A brief peak is not described as the level
for the whole outing. All opening windows are shown, so a long outing with
many UV changes may have a longer second bullet; the detailed Protection
steps remain below. Recommendation times show hours only for one local day.
For an outing spanning local days, they add full weekday names without a
month or date number. The opening still rounds its display times to local
half hours; the detailed times stay exact.
The UV breakdown reports the first and last covered hourly UV
values, the duration-weighted average, maximum and minimum displayed hourly
values with their total covered durations and local-time windows, and any
intervening hourly values with their total duration. When below-3 time in a
mixed outing is not already covered by the lowest-value bullet, the UV breakdown
adds its combined duration and windows. If all covered values display the
same UV, it uses one steady-value bullet. The Clothing and shade action
states the raw UVI 3+ duration; Strongest hours states the raw UVI 8+
duration when present. Exact windows appear beneath those actions. Sunscreen
application points to the first forecast UVI 3+ start or says the selected
start is already at UVI 3+. Reapplication is a conditional last step because
the app does not know when sunscreen was applied. Outings entirely below
3 keep their advice only in the opening, without duplicate steps.
Separated higher-UV stretches are named as separate rather than continuous.
These are forecast descriptions, not new protection-rule triggers, a personal
UV dose, burn time, or a validated risk score. Hourly values stand in for their overlapping hour bins;
first and last hours are weighted by actual outing overlap. Trend minimum,
maximum, and between-value grouping uses values rounded to one decimal for
display only; protection thresholds still use raw UVI. Consecutive matching
hourly bins form one time window. The opening names each consecutive band
window in order. The detailed action lines list at most two periods and then
a count, so many short episodes do not flood those lines.

Displayed UV categories round decimal values to a whole number with .5 upward,
but **action thresholds use raw values**. A displayed 2.9 can therefore carry
the rounded category Moderate while remaining below the raw protection trigger
of 3. The outing card labels its category as rounded to make this distinction
visible. The five display categories and WHO's static three-band action table
are different presentations, not two competing recommendation models.

## Evidence and product boundary

[WHO's UV Index guidance](https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-%28uv%29-index)
supports the UVI 3 protection threshold and stronger precautions at UVI 8+.
[WHO's skin-cancer protection guidance](https://www.who.int/news-room/questions-and-answers/item/radiation-protecting-against-skin-cancer)
supports shade, clothing, hat, eyewear, broad-spectrum SPF 30+ on uncovered
skin, generous application, and reapplication about every two hours, especially
after sweating, swimming, or drying off. [FDA consumer guidance](https://www.fda.gov/drugs/understanding-over-counter-medicines/sunscreen-how-help-protect-your-skin-sun)
is a cross-check for label-dependent water/sweat directions; it is not a
separate runtime rule. [Open-Meteo](https://open-meteo.com/en/docs) supplies the
forecast fields, not the recommendation text.

UV Scout chooses how to compose time windows, when to show sunscreen guidance,
the 76% cloud-message trigger, and the short takeaway. The two-hour interval
comes from WHO's sunscreen advice, not cumulative UVI 3+ forecast time.
WHO describes duration and frequency as relevant to harm, but does not define
an outing-level dose or safe-minute threshold. UV Scout's time-in-band and
local-window descriptions organize the forecast for planning; they do not
estimate personal dose or change the WHO-derived protection triggers.
Temperature, wind,
precipitation, and cloud percentage do not change forecast UVI or protection
thresholds. The app does not know the user's shade, clothing, sunscreen use,
skin sensitivity, medication, swimming, or sweating. It does not estimate
individual exposure or medical risk. Follow local advice and sunscreen labels;
this prototype's general guidance is not tailored medical advice.

## Scenario review

- All hours below raw UVI 3: a practical takeaway without duplicate steps.
- A 15-minute UVI 8 period followed by hours at UVI 0: timed protection,
  extra shade, sunscreen, and a distinct lower-UV window, but no claim that
  the whole outing is high UV.
- Any covered UVI 3+ period: standard protection and general two-hour
  reapplication guidance for people using sunscreen, regardless of how many
  elevated forecast hours there are.
- A late UVI 3+ period: sunscreen advice points to that part of the outing,
  rather than telling the person to apply only before the whole outing starts.
- Separate high-UV periods: their durations accumulate, but the takeaway says
  they are separate and the timed actions do not claim continuous exposure.
- Very cloudy at UVI 5: keep the protection advice and add a smaller context
  note; cloud cover never discounts the forecast UVI. Very cloudy only below
  UVI 3 adds no cloud note.
- Incomplete forecast: scope the action and takeaway to covered hours and warn
  about the missing interval.

The corresponding executable checks are in `tests/domain.test.cjs`. Review
these scenarios again if thresholds, source guidance, copy, or provider data
semantics change.
