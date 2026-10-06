# Practical protection guidance: evidence and proposed app rules

See the [source register](data-sources.md) for source-to-code mappings.
For the wider list of recommendation inputs, their effects, and future rule
design, see [recommendation-model research](recommendation-model-research.md).

This note documents the WHO-aligned reference baseline. UV Scout's outing
profile now adds forecast-duration and completeness context while keeping the
WHO peak reference separate; it is not a personal dose or validated health-risk
model.

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
| [WHO, Radiation: The ultraviolet (UV) index](https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-%28uv%29-index), 20 June 2022 | Groups 0–2 as Low, 3–7 as a shared protection band, and 8+ as extra protection. Recommends protection from UVI 3; lists shade, clothing, hat, sunglasses, and sunscreen. | Supports grouping our five named categories into three action levels instead of inventing a different action for every category. |
| [WHO, Ultraviolet radiation](https://www.who.int/news-room/fact-sheets/detail/ultraviolet-radiation), 21 June 2022 | Recommends limiting midday sun, seeking shade, protective clothing, broad-brimmed hat, wraparound sunglasses with 99–100% UVA/UVB protection, and broad-spectrum sunscreen where clothing does not cover skin. Says shade and clothing are preferred to relying on sunscreen, which should not extend sun time. | Supports concise practical actions and explains why multiple measures matter. |
| [WHO, Radiation: Protecting against skin cancer](https://www.who.int/news-room/questions-and-answers/item/radiation-protecting-against-skin-cancer), page date not shown | Advises extra care at UVI 3+. Trees, umbrellas, and canopies are not complete UV protection because scattered and reflected UV remains. Recommends clothing, a brimmed hat, UV-A/UV-B protective sunglasses, and broad-spectrum SPF 30+. | Supports shade-aware wording. SPF advice varies across WHO materials, so avoid selecting a number as universal app advice without deciding a geographic policy. |
| [US EPA, UV Index Scale](https://www.epa.gov/sunsafety/uv-index-scale-0), updated 15 June 2026 | Groups 3–7 as Moderate to High, with shade, sunscreen, clothing, hat, and sunglasses; 8+ as Very High to Extreme with extra protection. Specifies SPF 15+ on this page and says its scale follows WHO international reporting guidelines. | Independently supports the three action bands; its SPF number differs from newer WHO guidance. |
| [Environment and Climate Change Canada, UV index and sun safety](https://www.canada.ca/en/environment-climate-change/services/weather-health/uv-index-sun-safety.html), page details 20 April 2026 | Uses all five familiar category names. Groups 3–7 and 8+ for action. Notes snow, bright surfaces, altitude, and exposure duration can affect exposure; shade can reduce exposure but does not make it zero. Recommends SPF 30+. | Confirms the category labels and that shade is context, not a forecast correction. Its local time windows and detailed advice should not be presented as universal without qualification. |

## What is evidence and what is our choice

**Source-backed:** UV protection is recommended from UVI 3. WHO groups 3–7 for
one shared set of protection measures and 8+ for extra protection. WHO
recommends shade, covering clothing, a brimmed hat, protective sunglasses, and
broad-spectrum sunscreen on skin that clothing does not cover. Shade does not
block all UV; scattered and reflected UV can still reach a person. UV can be
higher around reflective surfaces such as fresh snow, sand, or water.

**Source variation:** WHO and EPA materials specify different SPF minimums
(15+ on some guidance pages; 30+ on another WHO page and Canadian guidance).
For an English-first international app, this draft avoids a numeric SPF
recommendation. It can say to use broad-spectrum sunscreen on uncovered skin
and follow the product label and local public-health advice.

**Product choices:** Use the outing's highest raw UV value to select one of
three action levels; explain the reason in plain language; do not reduce
forecast UV numerically; do not tell users to move their outing to another time.
The planner has no shade selector; default guidance recommends shade generally
rather than claiming a route-specific shade condition.
Present timing comparisons as information, consistent with the user's preference.

## Proposed guidance behavior

| Outing UV level | Evidence-aligned message direction | General shade and context detail |
| --- | --- | --- |
| Raw UV below 3 | Explain that the forecast remains below WHO's general protection threshold. Do not say exposure is completely safe or that protection is never useful. | Keep any bright-surface reminder brief and conditional; don't imply the app knows the user's surroundings. |
| Raw UV from 3 to below 8 | Explain that protection is recommended. Encourage seeking shade when UV is strongest, covering skin with clothing, protecting eyes, and using broad-spectrum sunscreen on uncovered skin. | General shade guidance should note that overhead cover helps but indirect UV can remain. Use a concise “if you're near snow, water, or bright sand” reminder where appropriate. |
| Raw UV 8 or higher | Explain that extra protection is warranted. Emphasize shade, covering clothing, a brimmed hat, eye protection, and sunscreen on uncovered skin. WHO advises avoiding outdoor exposure around midday at these values; phrase this as guidance without telling this user to choose a different start time. | Give the same concise shade/reflection context without suggesting the user selected or has a particular route condition. |

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

Guidance definitions currently live in `src/domain/guidance/protectionGuidance.json`.
They contain stable UV-band and protection-level keys, raw-UV thresholds,
headlines, explanations, actions, profile-message templates, and the reapplication
trigger. The JSON is validated and interpreted by
`src/domain/guidance/getProtectionGuidance.ts`; outing overlap and coverage
calculations are in `src/domain/outing/calculateOutingForecast.ts`; the feature
renders structured results. Keep sources and rationale here, editable wording
and thresholds in JSON, and calculations in TypeScript.

The UI receives a structured protection level, observed UV-duration summary,
forecast-coverage caveat, action list, and (when its configured condition is met)
a conditional reapplication reminder. It requires no shade or other extra
answers. Sweating, swimming, toweling, clothing coverage, and reflective
surroundings remain unknown and are not inferred. TypeScript validates and maps
rule data; the feature handles rendering.

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
- Review wording for midday advice against the preference not to recommend
  changing the selected outing time.
- Recheck public-health guidance before public or commercial release.
