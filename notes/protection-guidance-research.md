# Practical protection guidance: evidence and proposed app rules

See the [source register](data-sources.md) for source-to-code mappings.
For the wider list of recommendation inputs, their effects, and future rule
design, see [recommendation-model research](recommendation-model-research.md).

This note documents the WHO-aligned reference baseline. The WHO table is shown
in Info as general guidance; UV Scout's outing section separately interprets
the full forecast profile using duration, peak/time, continuity, and coverage.
Neither is a personal dose or validated health-risk model.

**Status:** First general guidance rules are implemented. The cited sources and
rationale below remain the record for review and future edits.

## Decision this research supports

For a planned outing, explain the highest forecast UV category, what it implies,
and practical ways to protect skin and eyes. The planner does not ask users to
classify route shade; it gives concise general shade advice by default. Hourly
UV remains visible throughout the outing.

## Evidence reviewed

| Source | Relevant evidence | How it informs UV Scout |
| --- | --- | --- |
| [WHO, Radiation: The ultraviolet (UV) index](https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-%28uv%29-index), 20 June 2022 | Gives three action bands: 0–2, 3–7, and 8+. Says people can enjoy being outdoors at 0–2; recommends shade during midday, shirt, sunscreen, and hat at 3–7; advises avoiding outdoor exposure during midday and using protection at 8+. It says extra measures are normally unnecessary below UVI 2. | Supports the app's three WHO action bands and the clearer low-UV and 8+ wording. |
| [WHO, Radiation: Protecting against skin cancer](https://www.who.int/news-room/questions-and-answers/item/radiation-protecting-against-skin-cancer), 16 July 2024 | Advises special care at UVI 3+. Recommends limiting midday exposure, shade, protective clothing, a wide-brimmed hat, wraparound UVA/UVB-protective sunglasses, and broad-spectrum SPF 30+ sunscreen applied liberally to uncovered skin. It recommends reapplication every two hours, particularly after sweating, swimming, playing, or exercise, and says sunscreen should not be used to extend sun time. Shade structures do not provide complete UV protection. | Informs the app's sunscreen wording and stronger 8+ guidance. UV Scout follows this newer WHO Q&A for SPF 30+; the specific product label and local advice still apply. |
| [US EPA, UV Index Scale](https://www.epa.gov/sunsafety/uv-index-scale-0), updated 15 June 2026 | Groups 3–7 as Moderate to High, with shade, sunscreen, clothing, hat, and sunglasses; 8+ as Very High to Extreme with extra protection. Specifies SPF 15+ on this page and says its scale follows WHO international reporting guidelines. | Independently supports the three action bands; its SPF number differs from newer WHO guidance. |
| [Environment and Climate Change Canada, UV index and sun safety](https://www.canada.ca/en/environment-climate-change/services/weather-health/uv-index-sun-safety.html), page details 20 April 2026 | Uses all five familiar category names. Groups 3–7 and 8+ for action. Notes snow, bright surfaces, altitude, and exposure duration can affect exposure; shade can reduce exposure but does not make it zero. Recommends SPF 30+. | Confirms the category labels and that shade is context, not a forecast correction. Its local time windows and detailed advice should not be presented as universal without qualification. |

## What is evidence and what is our choice

**Source-backed:** UV protection is recommended from UVI 3. WHO groups 3–7 for
one shared set of protection measures and 8+ for extra protection. WHO
recommends shade, covering clothing, a brimmed hat, protective sunglasses, and
broad-spectrum sunscreen on skin that clothing does not cover. Shade does not
block all UV; scattered and reflected UV can still reach a person. UV can be
higher around reflective surfaces such as fresh snow, sand, or water.

**Source variation:** Older WHO materials and some national sources give
different SPF minimums. UV Scout uses WHO's 16 July 2024 Q&A, which recommends
broad-spectrum SPF 30 or higher. The app should still tell users to follow the
product label and relevant local public-health advice.

**Product choices:** Keep WHO's three action bands as a static attributed
reference in Info; do not turn the peak into a WHO outing algorithm. UV Scout's
own outing summary uses the full profile and does not reduce forecast UV
numerically or automatically change the user's plan. Its practical advice uses
WHO and other reviewed sources as evidence, while clearly identifying the
profile synthesis as UV Scout's product choice. Alternative-time comparisons
remain informational. The planner has no shade selector and does not claim
route-specific shade conditions.

## WHO reference table content for Info

| WHO table band | Evidence-aligned message direction | General shade and context detail |
| --- | --- | --- |
| Raw UV below 3 | Say WHO's table places 0–2 in the “enjoy being outdoors” band; qualify that extra measures are generally unnecessary under normal circumstances below 2. Never imply zero exposure or universal safety. | Keep the reflection caveat brief; don't imply the app knows the user's surroundings. |
| Raw UV from 3 to below 8 | State that protection is recommended. Advise shade during midday, covering clothing, a wide-brimmed hat, UV-protective sunglasses, and broad-spectrum SPF 30+ sunscreen on uncovered skin. Include liberal application and the general two-hour/after-sweating-or-swimming reapplication advice. | General shade guidance should note that overhead cover helps but indirect UV can remain. Mention bright reflective surroundings conditionally. |
| Raw UV 8 or higher | State that WHO advises avoiding outdoor exposure during midday hours where possible. If outdoors, seek shade and use the full protection set: clothing, hat, sunglasses, and sunscreen. | Keep this as attributed WHO guidance; UV Scout's time comparisons remain informational and do not silently change the user's selected outing. |

Use hourly values to show how UV changes through the selected outing. Do not
infer personal dose, time-to-sunburn, or a safe exposure duration from forecast
UV, outing duration, shade label, or temperature. Do not imply that temperature
changes UV risk or that sunscreen extends safe outdoor time.

The forecast currently samples one value per hour. Describe this as an
hour-by-hour planning overview, not minute-accurate protection timing. If an
outing includes an hour at or above the protection threshold, make that period
visible. Apply action thresholds to raw forecast values: protection starts at
3, and extra protection starts at 8.

## Editable data shape in the app

WHO's general note, raw-UV action thresholds, labels, and actions live in
`src/domain/guidance/whoGuidance.json` and are validated and returned as a
static Info table by `src/domain/guidance/getWhoGuidance.ts`. UV Scout's profile bands, headlines,
explanations, profile-message templates, and reapplication trigger live in
`src/domain/guidance/uvScoutInsight.json` and are interpreted by
`src/domain/guidance/getUvScoutInsight.ts`. The two interpreters do not depend
on each other's rules. The Info feature renders the WHO table; the outing
feature renders only the Scout profile. Outing overlap and coverage calculations remain in
`src/domain/outing/calculateOutingForecast.ts`.

The UI receives independent structured WHO actions and UV Scout profile
insights, including observed UV-duration summaries, a forecast-coverage caveat,
and (when its configured condition is met) a conditional reapplication reminder.
It requires no shade or other extra answers. Sweating, swimming, toweling,
clothing coverage, and reflective surroundings remain unknown and are not
inferred. Each TypeScript interpreter validates only its own editable rule data;
the feature handles rendering.

## Resolved product decision: fractional protection trigger

WHO states that protection is recommended at UVI 3 and above. UV Scout rounds
decimals to the nearest integer for category selection, with `.5` rounding up.
So 2.5 is labelled Moderate even though the raw value is below 3.

Use the raw forecast value for action thresholds: general protection guidance
begins at 3, and extra-protection guidance begins at 8. Category labels continue
to round to the nearest whole number with `.5` upward for display, so 2.5 may
still be labelled Moderate while the recommendation correctly remains below the
WHO threshold. The UI explains this distinction. This follows WHO's published
threshold rather than the earlier UV Scout choice to trigger from the rounded
category; keep the original decimal visible.

## Scope limits and next decisions

- Keep first guidance general. WHO notes children, fair-skinned people, and
  other groups can have greater vulnerability, but the app has no profile to
  personalize advice.
- Do not infer snow, water, sand, altitude, clothing coverage, or skin
  sensitivity without reliable user input or data.
- Preserve the distinction between WHO's source guidance to avoid midday
  exposure at UVI 8+ where possible and UV Scout's informational time
  comparisons; do not silently reschedule the selected outing.
- Recheck public-health guidance before public or commercial release.
