# UV Scout outing guidance: active MVP rules

Reviewed 2026-10-14. This is the current, reviewable description of the rules
the app runs. The older [recommendation-model research](recommendation-model-research.md)
and [recommendation-tree draft](recommendation-tree-draft.md) preserve the evidence
and earlier proposals; they are not the source of truth for current behavior.

## What the user sees

In Plan an Outing, **UV guidance for outing** shows any forecast-coverage warning
and a short, untitled bulleted takeaway that combines the expected UV pattern
with the main protection step. **Breakdown** is a flat bullet list, starting
with start/end and average, then the highest and lowest displayed hourly UV
values with their total covered durations and local-time
windows, and any values between them with their total duration. **Protection
steps** holds the detailed titled actions, with raw UVI 3+ and 8+ duration and
local-time windows as quieter lines beneath the matching actions when relevant.
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
| Any covered time is at raw UVI 3 or higher | Recommend SPF 30+ on uncovered skin before those elevated hours. If sunscreen is used outdoors, give the general at-least-every-two-hours reapplication advice, with earlier reapplication after swimming, sweating, or towel drying and product-label directions. This is not a personal timer based on forecast hours. |
| Cloud cover is at least 76% during any hour at raw UVI 3 or higher | Add a reminder to keep UV protection in place during those cloudy hours. The 76% boundary comes from UV Scout's editable display band, not a health threshold. |
| Any covered time is at raw UVI 3 or higher | Add one conditional reminder about reflected UV near snow, bright sand, or water. The app does not know whether those surfaces are present. |
| Some requested time has no forecast | Warn how much of the outing is covered. Never substitute zero UV for missing time. Low-UV advice applies only to known hours, and missing intervals split otherwise separate elevated periods. |

The takeaway identifies the peak and its local forecast hour, approximate time
at UV 3+ or 8+ as relevant, and the general need for protection without
repeating every action. For only below-3 forecast values, it gives a low-UV
practical outcome. It can note separate elevated
periods without treating a brief peak as the level for the whole outing.
The Breakdown reports the first and last covered hourly UV
values, the duration-weighted average, maximum and minimum displayed hourly
values with their total covered durations and local-time windows, and any
intervening hourly values with their total duration. If all covered values
display the same UV, it uses one steady-value bullet. The Clothing and shade action
carries the raw UVI 3+ duration and windows; Strongest hours carries the raw
UVI 8+ duration and windows when present. Below-3 guidance remains in the
opening takeaway without a duplicate action or timing line.
Separated higher-UV stretches are named as separate rather than continuous.
These are forecast descriptions, not new protection-rule triggers, a personal
UV dose, burn time, or a validated risk score. Hourly values stand in for their overlapping hour bins;
first and last hours are weighted by actual outing overlap. Trend minimum,
maximum, and between-value grouping uses values rounded to one decimal for
display only; protection thresholds still use raw UVI. Consecutive matching
hourly bins form one time window. Time windows list at
most two periods and then a count, so many short episodes do not flood the UI.

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
Temperature, wind,
precipitation, and cloud percentage do not change forecast UVI or protection
thresholds. The app does not know the user's shade, clothing, sunscreen use,
skin sensitivity, medication, swimming, or sweating. It does not estimate
individual exposure or medical risk. Follow local advice and sunscreen labels;
this prototype's general guidance is not tailored medical advice.

## Scenario review

- All hours below raw UVI 3: a practical takeaway without duplicate steps.
- A 15-minute UVI 8 period followed by hours at UVI 0: timed protection,
  extra shade, and sunscreen, but no claim that the whole outing is high UV.
- Any covered UVI 3+ period: standard protection and general two-hour
  reapplication guidance for people using sunscreen, regardless of how many
  elevated forecast hours there are.
- A late UVI 3+ period: sunscreen advice points to that part of the outing,
  rather than telling the person to apply only before the whole outing starts.
- Separate high-UV periods: their durations accumulate, but the takeaway says
  they are separate and the text does not claim continuous exposure.
- Very cloudy at UVI 5: keep the protection advice and add a smaller context
  note; cloud cover never discounts the forecast UVI. Very cloudy only below
  UVI 3 adds no cloud note.
- Incomplete forecast: scope the action and takeaway to covered hours and warn
  about the missing interval.

The corresponding executable checks are in `tests/domain.test.cjs`. Review
these scenarios again if thresholds, source guidance, copy, or provider data
semantics change.
