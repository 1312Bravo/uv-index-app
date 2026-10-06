# UV Scout recommendation model: factors and evidence review

**Status:** Research and design proposal; this note does not approve new app
rules. The first general guidance rules are implemented in
`src/domain/guidance/`. Review and settle the open product choices before
changing those rules.

**Reviewed:** 2026-10-06. Public-health pages and API documentation can change;
recheck the linked versions before a public or commercial release. This revision
expands the sunscreen and exposure-duration review and separates the WHO reference
from the proposed UV Scout recommendation model.

See also [Practical protection guidance](protection-guidance-research.md) for
the existing category groupings and rule rationale, and the
[source register](data-sources.md) for source-to-code mappings.

## Purpose and boundaries

UV Scout should help a person understand the forecast UV during a planned
outing and choose practical protection. It is a general planning aid, not a
personal UV-dose calculator, a burn-time predictor, or medical advice.

The recommendation must distinguish four things:

1. **Forecast:** the provider's estimated UV at a location and time.
2. **Exposure context:** how long the outing is and the user's stated shade or
   clothing context.
3. **Protection actions:** advice that changes what the person can do, such as
   seek shade, cover skin, protect eyes, or use sunscreen on uncovered skin.
4. **Personal vulnerability:** individual circumstances that may require
   stronger or clinician-specific advice, which the current app does not know.

Do not collapse these into one adjusted UV number. The forecast is not a
measurement of the user's route, clothing, body, or personal exposure.

## Evidence reviewed

| Source | Evidence used | Scope and caveat |
| --- | --- | --- |
| [WHO, Ultraviolet radiation](https://www.who.int/news-room/fact-sheets/detail/ultraviolet-radiation), 21 June 2022 | UV varies with sun elevation, latitude, altitude, ozone, cloud cover, and reflection. UV can remain high under clouds. Protection is recommended from UVI 3. Children/adolescents, fair-skinned people, people with many naevi, photosensitizing medicines, or a family history of skin cancer are among groups at particular risk. | Global public-health overview. It identifies risk factors but does not provide a complete personal prediction algorithm. |
| [WHO, Radiation: The ultraviolet (UV) index](https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-%28uv%29-index), 20 June 2022 | UVI indicates the level of UV and potential for harm; higher UVI means greater potential for harm and less time before harm can occur. It is intended to support protection choices. | Supports communicating the forecast, not estimating an individual's safe exposure time. |
| [WHO, Radiation: Protecting against skin cancer](https://www.who.int/news-room/questions-and-answers/item/radiation-protecting-against-skin-cancer), 16 July 2024 | Shade structures are incomplete protection because scattered and reflected UV can reach a person. Clothing, hats, eye protection, and sunscreen on uncovered skin are complementary measures. Sunscreen is not for extending time outside; reapply about every two hours and especially after sweating, swimming, or exercise. | WHO's detailed advice includes SPF 30+, a generous full-body amount example, and 20–30-minute application lead time. Numeric SPF and application lead-time advice differs across authorities and jurisdictions; don't present it as universal without a product policy. |
| [WHO, Radiation: The known health effects of ultraviolet radiation](https://www.who.int/news-room/questions-and-answers/item/radiation-the-known-health-effects-of-ultraviolet-radiation), 16 July 2024 | Lifetime risk is associated with duration and frequency of sun exposure; cumulative UV dose is associated with some long-term outcomes, while intermittent intense exposure and sunburn also matter. DNA damage can occur before visible sunburn. | Supports treating duration and the hourly UV profile as relevant context, but does not validate UV Scout estimating personal dose or a safe exposure duration. |
| [U.S. EPA, UV Index Scale](https://www.epa.gov/sunsafety/uv-index-scale-0), updated 15 June 2026 | Groups 3–7 as one protection band and 8+ as extra protection; gives time-of-day guidance and practical actions. | U.S. public advice, useful for comparison but not automatically the international app's policy. EPA's SPF 15+ wording differs from WHO's SPF 30 wording. |
| [U.S. EPA, Learn About the UV Index](https://www.epa.gov/sunsafety/learn-about-uv-index), updated 4 February 2025 | Describes the U.S. National Weather Service UV forecast model as using forecast ozone, clouds, elevation, solar geometry, and an erythema action spectrum. | This explains one national UV forecast system; it does **not** establish the exact internals of Open-Meteo's global model combination. |
| [FDA, The Sun and Your Medicine](https://www.fda.gov/drugs/understanding-over-counter-medicines/sun-and-your-medicine), page date not displayed; checked 6 October 2026 | SPF is not burn-protection time. Some medicines can increase photosensitivity; sunscreen application, reapplication, swimming, and heavy sweating affect protection. | U.S. source. Medication lists are not exhaustive and do not support UV Scout diagnosing or managing medicine interactions. |
| [U.S. FDA, Sunscreen: How to Help Protect Your Skin from the Sun](https://www.fda.gov/drugs/understanding-over-counter-medicines/sunscreen-how-help-protect-your-skin-sun), checked 6 October 2026 | Apply enough to cover exposed skin; FDA gives about one ounce for an average adult/child's full body, apply 15 minutes before exposure, reapply at least every two hours and more often when sweating/swimming. U.S. water-resistant labels identify 40- or 80-minute tested water-resistance periods. | Evidence for practical amount, lead time, and reapplication content. These are U.S. label/regulatory conventions; tell users to follow their own product label and do not globalize the 40/80-minute labels. |
| [American Academy of Dermatology, How to Apply Sunscreen](https://www.aad.org/public/everyday-care/sun-protection/shade-clothing-sunscreen/how-to-apply-sunscreen), last updated 15 August 2025 | Advises broad-spectrum, water-resistant SPF 30+, generous application to uncovered skin, about one ounce for most adults covering the full exposed body (body size and coverage vary), and reapplication every two hours and after swimming or sweating. | Independent professional-society corroboration for practical sunscreen guidance; U.S.-based advice, not a global regulator or UV Scout medical endorsement. |
| [Open-Meteo Forecast API documentation](https://open-meteo.com/en/docs), checked 6 October 2026 | The API exposes UV Index and separate clear-sky UV variables, hourly cloud cover, timestamps, and location/time-zone data. Forecasts combine weather-model output; the selected grid-cell centre can differ from the requested coordinate, and model resolutions/variables vary. | Provider documentation does not give UV Scout a route-specific exposure estimate or a complete guarantee of every model's UV calculation. Use the regular `uv_index` value the app requests; do not manually reduce it using the separately displayed cloud percentage. |

## Factor inventory: what changes, and what it should change

The recommendation model should explicitly classify every candidate input as
one of these:

- **Baseline driver:** determines the general protection level.
- **Advice modifier:** changes which action is relevant, but not the UV value.
- **Context only:** explains conditions but does not change the protection rule.
- **Not collected / not modelled:** important in real life, but not reliable or
  appropriate for the current app to personalize.

| Factor | Evidence and effect on real-world exposure | Effect on UV Scout advice | Recommended treatment |
| --- | --- | --- | --- |
| Hourly forecast UV | UVI describes forecast UV intensity at the surface; higher UVI means greater potential for harm. | Sets the baseline action tier and explains why it applies. The outing peak makes a short high-UV period visible rather than hiding it in an average. | **Baseline driver.** Use the provider's regular hourly `uv_index`; retain the decimal for display and explain the category convention. Do not imply it measures personal dose. |
| Outing duration and hourly profile | More time outdoors creates more opportunity for UV exposure. WHO associates cumulative dose with long-term outcomes and also notes risks from intermittent intense exposure and sunburn. Personal dose depends on actual conditions and behavior, not just the forecast. | Distinguish a brief interval at elevated UV from most of a long outing at elevated UV. Show estimated time in UV bands alongside the peak; never imply that a short outing is risk-free or turn duration into a personalized safe-time limit. | **Important advice/context modifier.** The current app does not use duration in its guidance. Candidate metric: estimated minutes in the outing at raw UVI ≥3 and ≥8, with hourly forecast limitations disclosed. Research and review any cumulative exposure score before use. |
| Start time / timing alternatives | UVI changes with solar elevation and time of day; solar noon is not always 12:00 on the clock. | Compare the selected plan with equal-duration alternatives only when those starts are still in the future. Show the forecast difference without telling the user to change plans. Keep daylight/darkness context visible. | **Advice/context modifier.** Base timing on actual forecast values, not a fixed clock-time rule. Do not let sunrise, sunset, civil dawn, or dusk stand in for UVI. |
| Selected location | Latitude, local weather, time zone, elevation, and ozone/cloud conditions affect environmental UV. Provider forecasts are model/grid estimates; the forecast cell may not exactly match requested coordinates. | Determines which forecast and local times are shown. A route may pass through conditions unlike the selected point. | **Baseline data selector.** Use selected coordinates and the provider time zone. Describe the result as a location forecast, not route-level certainty. Do not claim metre-level precision. |
| Shade along the outing | Shade reduces direct exposure, but scattered and reflected UV can remain. Protection varies with the cover and surroundings; a qualitative user label is not a measured UV attenuation. | For open/exposed plans, emphasize seeking shade. For overhead cover, acknowledge its benefit while noting it is not complete protection. | **Advice modifier.** Keep the current four qualitative choices. Never apply a numeric shade multiplier to forecast UV or promise that a shade option makes an outing safe. |
| Clothing / skin coverage | Tightly woven or UPF-labelled clothing protects covered skin. Coverage and protection differ by fabric and garment; sunscreen is for skin that remains uncovered. | Could avoid redundant advice or make a reminder about uncovered skin more relevant. A broad coverage answer cannot verify fabric/UPF or which body parts remain exposed. | **Future optional advice modifier.** If added, ask a simple, optional coverage question. Do not infer clothing from temperature or change the forecast number. This remains an open product choice. |
| Sunscreen choice and coverage | WHO and AAD recommend broad-spectrum UVA/UVB coverage; SPF is not a time multiplier or a promise of safe duration. Advice on numeric minimum SPF differs: WHO's detailed page and AAD say 30+, while FDA guidance says 15+. | Encourage broad-spectrum product on uncovered skin, alongside clothing and shade. Avoid telling the user that a particular SPF lets them stay out longer. | **Baseline action, wording policy unresolved.** For an international app, say broad-spectrum and follow local public-health/product-label advice until UV Scout explicitly chooses an international or localized SPF policy. |
| Sunscreen amount and application | Protection assumes sufficient, even application. WHO gives 3–4 heaped tablespoons/about 35 ml for an adult full body; FDA/AAD use about 1 fluid ounce for an average full-body application. Required amount changes with body size and uncovered area. WHO says 20–30 minutes before exposure; FDA/AAD say 15 minutes. | A concise tip can say apply generously and evenly to all skin not covered by clothing, including often-missed areas. A more detailed help panel could explain the adult full-body example and that clothing reduces the amount needed. | **Action plus optional education.** Do not turn a whole-body amount into a one-size-fits-all personal dose. Because official lead-time advice differs, direct users to their product label/local advice rather than selecting a universal minute value without a policy decision. |
| Reapplication, elapsed time, swimming, sweating, and toweling | WHO advises reapplying about every two hours and especially after sweating, swimming, playing/exercise; FDA says at least every two hours and more often when swimming/sweating; product water-resistance labels are product-specific. | Longer planned outings make a reminder useful. Swimming/sweat/toweling makes a generic two-hour-only reminder insufficient. The app currently does not know whether/when sunscreen was applied or what product is used. | **High-value conditional reminder.** For an outing reaching the two-hour mark, remind users to reapply according to the product label; mention sooner after swimming, sweating, or toweling. Never present a timer as tracking the user's application, and do not assume a universal 40/80-minute water-resistance period. |
| Eye, head, and skin protection | UV can harm eyes as well as skin. WHO recommends UV-protective wraparound sunglasses, protective clothing, a brimmed hat, shade, and broad-spectrum sunscreen on skin clothing does not cover. | Cover complementary protection options rather than over-focusing on sunscreen. | **Baseline actions.** Say UV-protective eyewear; do not infer protection from lens darkness or price. Keep body-part coverage specific but concise. |
| Cloud cover | Clouds often reduce UV, but UV can still be high under cloud. Cloud percentage is a sky-cover estimate, not the fraction of UV blocked. | Helps explain the sky condition but should not override a supplied UV forecast or make a cloudy outing sound safe. | **Context only.** Show cloud percentage separately. Do not multiply or subtract it from regular `uv_index`; do not interpret “100% cloud cover” as “100% UV blocked.” |
| Snow, water, sand, bright surfaces | WHO notes reflection can increase UV exposure; snow, water, sand, and bright surfaces are relevant contexts. Exposure can locally exceed what a simple open-sky forecast suggests. | Could add a caution for skiing, beaches, boating, or other reflective settings. The current app has no route/surface data and cannot estimate an exact increase. | **Future optional context.** Consider a small “bright/reflection-prone surroundings” selection only if it adds meaningful advice. Do not invent a fixed multiplier or assert all water/sand/snow behaves identically. |
| Altitude, latitude, season, ozone, solar angle | These affect environmental UV; WHO lists them as drivers. The selected provider forecast may incorporate some of these through its model, but its exact contribution depends on model and location. | They explain why the same clock time or season may have different UVI in different places. | **Forecast-model context, not app multipliers.** Prefer the provider's location/time forecast. Do not add a generic altitude or seasonal adjustment on top. |
| Skin sensitivity, previous skin cancer, family history, photosensitizing medicines, age | WHO identifies some groups as more vulnerable; FDA explains that certain medicines may cause photosensitivity. These factors are personal, incomplete, and sometimes sensitive health information. | They can justify more careful advice for some people, but the app has no validated profile or medication checker. Skin color alone must not be used to reassure someone that protection is unnecessary. | **Not personalized in MVP.** Keep general advice suitable to a broad audience; optionally include a short note that some people need extra care and should follow clinician/local guidance. Do not collect diagnoses, medication names, or skin type without a separate privacy and evidence review. |
| Activity type | UV does not change because a user labels an outing “run,” “hike,” or “cycle.” Activity can change duration, sweat, water exposure, route, shade, and clothing. | Activity labels only help if they lead to a concrete, reliable difference in advice. | **Not a baseline input.** Keep the general-outdoor-user approach. If needed later, ask directly about a condition such as swimming or heavy sweating instead of inferring from a broad activity category. |
| Air temperature / heat | Temperature is not UV intensity. Heat illness is a separate hazard affected by factors beyond temperature, including humidity, exertion, hydration, and individual health. | Temperature can inform comfort or a future heat-safety feature, but must not change UV categories or UV-protection advice. | **Context only for UV Scout today.** Keep any future heat guidance as a separate, sourced risk model with its own inputs and limits. |
| Forecast freshness and uncertainty | Forecasts are model estimates that update; weather models have finite spatial and temporal resolution. UV Scout currently samples hourly values and can fail to load. | Stale, missing, or partial data should weaken or prevent a confident outing-specific recommendation. | **Reliability gate.** Display a clear unavailable/stale state and last-updated time when supported. Never fill missing UV with a guessed value or continue to present an old result as current. |
| Daylight and darkness | Sunrise/sunset and civil twilight describe solar geometry/daylight, not the UVI itself. | Helps a person understand whether an alternative outing time is in daylight or darkness. | **Context only.** Keep the forecast UV curve as the UV authority; use daylight markers as additional planning context. |

## Two guidance tracks: WHO reference and UV Scout recommendations

Keep the WHO standard and UV Scout's own outing advice visibly and logically
separate. They should complement one another, not compete or be blended into a
new category scale.

### Track A: WHO reference

Show the standard WHO UV Index action guidance as a clearly attributed reference:

- UVI 0–2: the WHO reference table's low-level action band.
- UVI 3–7: protection actions are recommended.
- UVI 8+: extra protection actions are recommended.

This is a public-health reference keyed to UV intensity. Keep its language and
threshold rationale source-linked; do not label a UV Scout-specific duration or
shade rule as WHO policy.

### Track B: UV Scout outing-specific advice

Build a separate evidence-synthesized layer that answers: “Given this forecast
and the conditions I told the app about, what practical things should I consider
for this outing?” It can add estimated time at elevated UV, sunscreen reminders,
shade and clothing context, and bright-surface or water/sweat notes. It must not
lower or obscure the WHO reference action, calculate personal burn time, or claim
to know the user's actual UV dose.

Prefer composable outputs rather than a separate paragraph for every possible
combination:

1. **Evidence/data gate:** forecast coverage and freshness are adequate; otherwise
   show a limitation rather than confident advice.
2. **WHO reference:** use the raw peak UVI bands (0–2, 3–7, 8+) and preserve the
   hourly curve. Display-category rounding remains a separate presentation rule.
3. **Outing exposure summary:** report the estimated outing duration and the
   approximate time forecast in each relevant UVI band. Keep peak intensity and
   duration distinct; an average must not hide a brief high peak.
4. **Protection-method actions:** explain relevant skin, eye, clothing, shade,
   and sunscreen actions. Mention sunscreen amount/application and reapplication
   as general label-following advice, not an individualized guarantee.
5. **Conditional context:** append only advice supported by known inputs—for
   example, a longer plan crossing the two-hour reapplication interval, a
   user-selected swim/sweat condition, exposed sections, or bright reflective
   surroundings.
6. **Limits and alternatives:** state uncertainty in the hourly forecast and
   compare future start options neutrally with daylight context; never promise a
   risk-free duration or say sunscreen extends safe time.

### Duration and factor interactions to investigate for the second tree

| Combination | Evidence-informed effect | Candidate UV Scout behavior | Guardrail |
| --- | --- | --- | --- |
| Peak UVI × time at that level | Higher UVI means harm can occur in less time; longer and repeated exposure also matters. | Keep the WHO level from peak UVI, then add estimated minutes/hours in the 3–7 and 8+ bands so short and sustained exposure are distinguishable. | Forecast bins are hourly estimates, not a route measurement or exact personal dose. Do not convert them into “safe minutes.” |
| Total outing duration × reapplication interval | Sunscreen protection requires reapplication; WHO/FDA guidance is generally at least/about every two hours, with earlier reapplication after water/sweat or per product label. | If the selected outing crosses the two-hour point, show a conditional reminder to plan reapplication; avoid claiming that a timer knows application time. | Needs user-facing wording and acceptance of an approximate outing-start trigger; labels and application timing vary. |
| Sunscreen × amount × exposed skin | Under-application or missed areas can reduce achieved protection; clothes cover some skin. | Recommend generous, even application to uncovered skin, plus optional quantity education; avoid redundant sunscreen advice if skin is covered. | Do not compute a personalized volume without body size/coverage; WHO/FDA/AAD amount examples are full-body examples, not a universal amount. |
| Sunscreen × swimming/sweat/towel drying | Water, sweat, and friction can remove sunscreen; product water-resistance duration and instructions differ. | With an explicit swim/heavy-sweat input, elevate the label-following reapplication reminder. | Ask the condition directly; do not infer it just from “hike/run/cycle” or hard-code U.S. 40/80-minute labels globally. |
| Shade × reflective surroundings | Shade reduces direct sun but scattered and reflected UV may remain; snow, water, sand, and bright surfaces can increase exposure. | If bright surroundings are selected, emphasize combining shade, covering clothing, eye protection, and sunscreen on uncovered skin. | No numeric shade or reflection multiplier without validated route/surface data. |
| Clothing coverage × sunscreen | Clothing is an important barrier; fabric, weave, wetness, stretch, and UPF affect performance. Sunscreen applies to uncovered skin. | A broad optional “mostly covered / some skin exposed” input could tailor reminders and make the advice less repetitive. | Avoid outfit scoring and do not infer coverage from temperature or activity type. |
| Forecast UV × cloud percentage | Clouds can reduce UV, but UV can remain high; cloud-cover percent is not percent UV blocked. | Use the supplied UV forecast as the UV input; keep cloud cover as separate context. | Never manually discount forecast UVI by cloud percentage. |
| UV protection × temperature/heat | Heat illness is a separate hazard from UV injury. | Keep UV protection and any future heat advice as independently sourced decision paths. | Do not use temperature to change UV tier or infer clothing, hydration needs, or sunscreen use. |

## Sunscreen guidance: research findings and product limits

The most consistently supported practical points across WHO and U.S. FDA/AAD
sources are: use broad-spectrum protection on skin not covered by clothing; apply
generously and evenly; treat sunscreen as one layer alongside shade and clothing;
reapply about every two hours and sooner after swimming, sweating, or toweling,
following the product label; do not use sunscreen to extend time in the sun.

Details that should remain explicit rather than silently standardized:

- **SPF:** WHO's detailed skin-cancer page and AAD recommend SPF 30+, while FDA
  consumer advice recommends SPF 15+. These are jurisdiction/source differences;
  UV Scout should decide whether to remain non-numeric or provide localized
  advice before presenting a universal minimum.
- **Amount:** WHO's adult full-body example is about 35 ml (3–4 heaped
  tablespoons); U.S. FDA/AAD use about one fluid ounce for an average full-body
  application. The real amount depends on body size and uncovered area. A
  practical hint should prioritize generous/even coverage and optionally
  present a clearly qualified adult full-body example.
- **Before exposure:** WHO says 20–30 minutes; FDA/AAD say 15 minutes. Product
  formats and labels vary, so “follow the product instructions before exposure”
  is a safer global default until UV Scout selects a policy.
- **Reapplication:** Around two hours is broadly supported, but earlier
  reapplication may be needed after water, sweat, or toweling, and water
  resistance is product-specific. An outing reminder should be conditional,
  not a claim that the app knows when the person applied sunscreen.

These are source-backed usage directions, not a UV Scout sunscreen prescription
or a guarantee of achieved protection.

## Implementation principle: compose actions, not every combination

Do **not** write a separate paragraph for every possible combination of UV
category × duration × shade × clothing × surface × person. That grows rapidly,
duplicates wording, and makes contradictions hard to review.

Use the two guidance tracks and composable layers above, rather than trying to
enumerate every possible combination. In the later implementation:

1. **Data validity:** confirm the location, requested time range, and forecast
   are available and current enough to use.
2. **WHO reference:** show the separate standard action band from peak raw UVI.
   Preserve the hourly shape so the user can see when UV is strongest.
3. **Base action set:** provide a short, ordered set of complementary actions
   for skin, eyes, and shade/clothing.
4. **Context additions:** add only the relevant sentence or action for known
   shade, clothing coverage, water/sweat, or reflective surroundings. These
   inputs tailor the advice; they do not alter the provider UV value.
5. **Timing information:** compare future equal-duration windows neutrally and
   state daylight context. Do not issue an unrequested instruction to reschedule.
6. **Safety limits:** avoid individual burn-time estimates, “safe exposure”
   claims, medical diagnosis, and claims that sunscreen or shade removes risk.

Store stable rule IDs, category bands, short wording, and action IDs in readable
JSON. Keep validation and rule composition in TypeScript; keep the evidence and
rationale in `notes/`. The result should be structured (baseline level,
explanation, action IDs, context messages, and limitations) so the UI can show
the most useful details without embedding science rules in components.

An eventual data definition could keep official reference bands separate from
UV Scout context rules. This example is illustrative, not an approved schema:

```json
{
  "whoReference": [
    {
      "key": "low",
      "minimumUvInclusive": 0,
      "maximumUvExclusive": 3,
      "actionIds": []
    },
    {
      "key": "protection",
      "minimumUvInclusive": 3,
      "maximumUvExclusive": 8,
      "actionIds": ["seek-shade", "cover-skin", "protect-eyes", "sunscreen-uncovered-skin"]
    },
    {
      "key": "extra-protection",
      "minimumUvInclusive": 8,
      "actionIds": ["limit-strong-sun", "seek-shade", "cover-skin", "protect-eyes", "sunscreen-uncovered-skin"]
    }
  ],
  "outingRules": [
    {
      "key": "sunscreen-reapplication-reminder",
      "when": { "outingDurationMinutesAtLeast": 120 },
      "message": "For a longer outing, plan to reapply sunscreen as directed; reapply sooner after swimming or sweating."
    }
  ]
}
```

This is a design sketch, **not** an approved schema or a replacement for the
current validated JSON. Duration-rule boundaries, wording, source governance,
and which inputs to ask the user are still to be settled before implementation.

## Product decisions for the second recommendation tree

1. **Duration summary.** Should the second model show approximate time at raw
   UVI 3+ and 8+? Hourly forecasts can estimate bands, not minute-accurate
   exposure or personal dose. Keep peak and duration visible as distinct facts.
2. **Optional plan inputs.** Which are worth asking directly: broad clothing
   coverage, swimming/heavy sweating, and bright reflective surroundings?
   Prefer a few useful optional inputs over an activity selector that only
   indirectly guesses these conditions.
3. **Sunscreen SPF policy.** WHO's 2024 skin-cancer Q&A and AAD say SPF 30+;
   U.S. FDA consumer guidance says SPF 15+. Keep numeric SPF guidance
   non-localized and explicitly sourced, or adopt an international/localization
   policy before selecting a universal minimum.
4. **Sunscreen amount and lead time.** Decide whether the app should show an
   optional “how much” explainer: WHO gives about 35 ml (3–4 heaped tablespoons)
   for an adult full body; FDA/AAD use about one ounce for a typical full-body
   application. WHO says 20–30 minutes before, while FDA/AAD say 15 minutes;
   product-label wording is the safer default for application timing.
5. **Reapplication reminder.** A conditional reminder when an outing reaches
   two hours is supported by WHO/FDA/AAD general advice, but UV Scout does not
   know when sunscreen was applied or which product is used. Choose whether to
   remind based on outing start, add a user-controlled application time, or
   simply provide general conditional wording.
6. **Personal vulnerability.** Do not add skin-type or medication profiling by
   default. If personalized guidance is ever desired, define privacy, audience,
   evidence, and clinician/public-health review before collecting any such data.

## Recommended next refinement

Treat the implemented WHO-aligned category guidance as the reference track, not
the complete second recommendation tree. Build UV Scout's own evidence-informed
outing layer from the forecast profile plus a small set of explicit conditions.
Prioritize estimated time in UV bands, practical sunscreen instructions
(amount/application/reapplication), shade and clothing, and optional
swim/sweat/reflective-surface context. Keep source claims, WHO policy, and UV
Scout's choices separately labelled. Do not add personal medical profiles or
temperature-based UV adjustments in this phase.

## Source-to-code relationship

This research note informs future review of:

- Baseline category mappings: `src/domain/uv/uvCategories.json` and
  `src/domain/uv/getUvCategory.ts`.
- Current protection rules and shade messages:
  `src/domain/guidance/protectionGuidance.json` and
  `src/domain/guidance/getProtectionGuidance.ts`.
- Hourly forecast parsing and time/locality semantics:
  `src/services/forecast/getHourlyForecast.ts`.
- Outing aggregation and result presentation:
  `src/domain/outing/calculateOutingForecast.ts` and
  `src/features/outing/OutingForecast.tsx`.

No app behavior was changed as part of this research. The current
`protectionGuidance.json` remains the WHO-aligned reference baseline; it is not
the future multi-factor UV Scout model. A later implementation must separately
update editable JSON, TypeScript interpretation/validation, tests, user-facing
wording, this note, and `notes/data-sources.md` as applicable.
