# Practical protection guidance: evidence and proposed app rules

**Status:** First general guidance rules are implemented. The cited sources and
rationale below remain the record for review and future edits.

## Decision this research supports

For a planned outing, explain the highest forecast UV category, what it implies,
and practical ways to protect skin and eyes. Use the selected shade description
to tailor the explanation without changing the forecast value. Keep hourly UV
values visible so the user can see how it changes during the outing.

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

**Product choices proposed for discussion:** Use the outing's highest category
to select one of three action levels; explain the reason in plain language; use
the shade choice to tailor emphasis; do not reduce forecast UV numerically; do
not tell users to move their outing to another time. Present timing comparisons
as information, consistent with the user's preference.

## Proposed guidance behavior

| Outing UV level | Evidence-aligned message direction | Shade-aware detail |
| --- | --- | --- |
| Low (rounded category 0–2) | Explain that forecast UV is lower than at moderate and higher levels. Avoid saying exposure is completely safe or that protection is never useful. | Shade adds protection but does not eliminate scattered or reflected UV. Mention bright surroundings only if the app has reliable context for them. |
| Moderate or High (3–7) | Explain that protection is recommended. Encourage seeking shade when UV is strongest, covering skin with clothing, protecting eyes, and using broad-spectrum sunscreen on uncovered skin. | When the outing includes exposed sections, emphasize protection during those sections. Explain that overhead cover helps but indirect UV can remain. |
| Very High or Extreme (8+) | Explain that extra protection is warranted. Emphasize shade, covering clothing, a brimmed hat, eye protection, and sunscreen on uncovered skin. WHO advises avoiding outdoor exposure around midday at these values; phrase this as guidance without telling this user to choose a different start time. | Make clear that overhead cover helps but is not complete protection, especially with scattered UV or reflective surfaces. |

Use hourly values to show how UV changes through the selected outing. Do not
infer personal dose, time-to-sunburn, or a safe exposure duration from forecast
UV, outing duration, shade label, or temperature. Do not imply that temperature
changes UV risk or that sunscreen extends safe outdoor time.

The forecast currently samples one value per hour. Describe this as an
hour-by-hour planning overview, not minute-accurate protection timing. If an
outing includes an hour at or above the eventual protection threshold, make that
period visible. Guidance follows the rounded category by product decision: 2.5
rounds to Moderate and triggers the protection guidance band.

## Editable data shape in the app

Guidance definitions live in `src/domain/guidance/protectionGuidance.json`.
Each level has a stable key, the UV category keys it covers, a headline, an
explanation, and actions. Shade messages map each planner shade key to a short
context note. Keep sources and rationale here; keep concise editable wording in
the JSON.

```json
[
  {
    "key": "protection",
    "categories": ["moderate", "high"],
    "headline": "Sun protection is recommended",
    "explanation": "At these UV levels, unprotected skin and eyes can be harmed. Protection helps reduce exposure.",
    "actions": ["Seek shade when UV is strongest.", "Cover skin and protect eyes."]
  }
]
```

The UI should receive a structured level, short explanation, action list, and
shade note. TypeScript should validate the JSON and map the outing forecast and
shade selection to that result.

## Resolved product decision: fractional protection trigger

WHO states that protection is recommended at UVI 3 and above. UV Scout rounds
decimals to the nearest integer for category selection, with `.5` rounding up.
So 2.5 is labelled Moderate even though the raw value is below 3.

Use the displayed category: guidance begins at rounded Moderate, so 2.5 triggers
protection. The public-health source threshold is UVI 3; treating 2.5 as
actionable is UV Scout's conservative product choice, consistent with its
rounding convention. The original decimal remains displayed.

## Scope limits and next decisions

- Keep first guidance general. WHO notes children, fair-skinned people, and
  other groups can have greater vulnerability, but the app has no profile to
  personalize advice.
- Do not infer snow, water, sand, altitude, clothing coverage, or skin
  sensitivity without reliable user input or data.
- Review wording for midday advice against the preference not to recommend
  changing the selected outing time.
- Recheck public-health guidance before public or commercial release.
