# UV Scout outing guidance: active MVP rules

Reviewed 2026-10-13. This is the current, reviewable description of the rules
the app runs. The older [recommendation-model research](recommendation-model-research.md)
and [recommendation-tree draft](recommendation-tree-draft.md) preserve the evidence
and earlier proposals; they are not the source of truth for current behavior.

## What the user sees

In Plan an Outing, **UV guidance for outing** shows any forecast-coverage warning,
then **What to do** with short titled actions, then **Summary** with the UV pattern.
The four weather/UV metrics and hourly chart follow. WHO's general three-band
reference remains in Info, separate from this UV Scout outing guidance.

## Active decision rules

| Condition in the covered hourly forecast | Result |
| --- | --- |
| All covered values are below raw UVI 3 | Say that most people do not need extra sun protection for the forecast hours. Do not use a separate night rule. |
| Any covered time is at raw UVI 3 or higher | Name the relevant local-time periods and recommend clothing, a broad-brimmed hat, UV-protective sunglasses, available shade, and broad-spectrum SPF 30+ sunscreen on uncovered skin. |
| Any covered time is at raw UVI 8 or higher | Additionally identify those periods and advise limiting direct sun and prioritizing shade. |
| At least two cumulative *covered* hours are at raw UVI 3 or higher | Add the every-two-hours sunscreen reapplication reminder. This controls which reminder is displayed; it is not a safe-exposure cutoff or a personal application timer. Shorter exposure still gets conditional reapplication advice after swimming, sweating, or towel drying. |
| Cloud cover is at least 76% during any hour at raw UVI 3 or higher | Add a reminder to keep UV protection in place during those cloudy hours. The 76% boundary comes from UV Scout's editable display band, not a health threshold. |
| Any covered time is at raw UVI 3 or higher | Add one conditional reminder about reflected UV near snow, bright sand, or water. The app does not know whether those surfaces are present. |
| Some requested time has no forecast | Warn how much of the outing is covered. Never substitute zero UV for missing time. Low-UV advice applies only to known hours, and missing intervals split otherwise separate elevated periods. |

The Summary reports time at UVI 3+, time at UVI 8+ when present, the peak and
its local time, and whether elevated time is split into separate periods. With
only below-3 forecast values, it reports how long the forecast stays below 3.
These are descriptive forecast durations, not personal UV dose, burn time, or a
validated risk score. Hourly values stand in for their overlapping hour bins;
first and last hours are weighted by actual outing overlap. Time windows list at
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

UV Scout chooses how to compose time windows, when to show the extra reminder,
the 76% cloud-message trigger, and the short summary. Temperature, wind,
precipitation, and cloud percentage do not change forecast UVI or protection
thresholds. The app does not know the user's shade, clothing, sunscreen use,
skin sensitivity, medication, swimming, or sweating. It does not estimate
individual exposure or medical risk. Follow local advice and sunscreen labels;
this prototype's general guidance is not tailored medical advice.

## Scenario review

- All hours at UVI 0-2: one practical low-UV action and a below-3 summary.
- A 15-minute UVI 8 period followed by hours at UVI 0: timed protection,
  extra shade, and sunscreen, but no claim that the whole outing is high UV.
- Several hours at UVI 7: standard protection and the two-hour reminder.
- Separate high-UV periods: their durations accumulate, but the summary says
  they are separate and the text does not claim continuous exposure.
- Very cloudy at UVI 5: keep the protection advice; cloud cover never
  discounts the forecast UVI. Very cloudy only at UVI 0-2 adds no cloud warning.
- Incomplete forecast: scope the action and summary to covered hours and warn
  about the missing interval.

The corresponding executable checks are in `tests/domain.test.cjs`. Review
these scenarios again if thresholds, source guidance, copy, or provider data
semantics change.
