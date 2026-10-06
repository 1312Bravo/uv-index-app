# UV Scout recommendation model: factors and evidence review

**Status:** Evidence and factor inventory. The initial outing-profile rules are
implemented in `src/domain/guidance/` and `src/domain/outing/`; proposed future
inputs and modifiers in this note are not enabled app behavior.

**Reviewed:** 2026-10-06. Public-health pages and API documentation can change;
recheck the linked versions before a public or commercial release. This revision
expands the sunscreen and exposure-duration review and separates the WHO reference
from the proposed UV Scout recommendation model.

See also [Practical protection guidance](protection-guidance-research.md) for
the existing category groupings and rule rationale, and the
[source register](data-sources.md) for source-to-code mappings. The reviewable
[v0.2 recommendation tree](recommendation-tree-draft.md) records the implemented
first slice and clearly marks remaining proposals and product questions.

## Purpose and boundaries

UV Scout should help a person understand the forecast UV during a planned
outing and choose practical protection. It is a general planning aid, not a
personal UV-dose calculator, a burn-time predictor, or medical advice.

The recommendation must distinguish four things:

1. **Forecast profile:** the sequence of provider-estimated UV values over the
   full outing, not just its single highest value.
2. **Exposure opportunity:** outing duration and how the forecast's levels are
   distributed over time. This is environmental context, not personal dose.
3. **Protection state/context:** actions already known or chosen (for example,
   sunscreen timing, clothing, shade, water, or heavy sweating). Most are not
   collected by the current app; don't silently infer them.
4. **Protection actions:** practical steps that follow from the peak, time
   profile, and known or explicitly conditional context.
5. **Personal vulnerability:** individual circumstances that may require
   stronger or clinician-specific advice, which the current app does not know.

Do not collapse these into one adjusted UV number. The forecast is not a
measurement of the user's route, clothing, body, or personal exposure.

## Evidence reviewed

| Source | Evidence used | Scope and caveat |
| --- | --- | --- |
| [WHO, Global Solar UV Index: A Practical Guide](https://www.who.int/publications/i/item/9241590076), 13 June 2002 | Internationally harmonized UVI communication framework; UVI is a public information measure of surface UV and a signal for protective action. | Foundational UVI reference. It defines public UVI reporting and guidance, not a UV Scout personal-dose formula. WHO lists CC BY-NC-SA 3.0 IGO; any reuse of its materials must respect those terms. |
| [WHO, Ultraviolet radiation](https://www.who.int/news-room/fact-sheets/detail/ultraviolet-radiation), 21 June 2022 | UV varies with sun elevation, latitude, altitude, ozone, cloud cover, and reflection. UV can remain high under clouds. Protection is recommended from UVI 3. Children/adolescents, fair-skinned people, people with many naevi, photosensitizing medicines, or a family history of skin cancer are among groups at particular risk. | Global public-health overview. It identifies risk factors but does not provide a complete personal prediction algorithm. |
| [WHO, Radiation: The ultraviolet (UV) index](https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-%28uv%29-index), 20 June 2022 | UVI indicates the level of UV and potential for harm; higher UVI means greater potential for harm and less time before harm can occur. It is intended to support protection choices. | Supports communicating the forecast, not estimating an individual's safe exposure time. |
| [WHO, Radiation: Protecting against skin cancer](https://www.who.int/news-room/questions-and-answers/item/radiation-protecting-against-skin-cancer), 16 July 2024 | Shade structures are incomplete protection because scattered and reflected UV can reach a person. Clothing, hats, eye protection, and sunscreen on uncovered skin are complementary measures. Sunscreen is not for extending time outside; reapply about every two hours and especially after sweating, swimming, or exercise. | WHO's detailed advice includes SPF 30+, a generous full-body amount example, and 20–30-minute application lead time. Numeric SPF and application lead-time advice differs across authorities and jurisdictions; don't present it as universal without a product policy. |
| [WHO, Radiation: The known health effects of ultraviolet radiation](https://www.who.int/news-room/questions-and-answers/item/radiation-the-known-health-effects-of-ultraviolet-radiation), 16 July 2024 | Lifetime risk is associated with duration and frequency of sun exposure; cumulative UV dose is associated with some long-term outcomes, while intermittent intense exposure and sunburn also matter. DNA damage can occur before visible sunburn. | Supports treating duration and the hourly UV profile as relevant context, but does not validate UV Scout estimating personal dose or a safe exposure duration. |
| [U.S. EPA, UV Index Scale](https://www.epa.gov/sunsafety/uv-index-scale-0), updated 15 June 2026 | Groups 3–7 as one protection band and 8+ as extra protection; gives time-of-day guidance and practical actions. | U.S. public advice, useful for comparison but not automatically the international app's policy. EPA's SPF 15+ wording differs from WHO's SPF 30 wording. |
| [U.S. EPA, Learn About the UV Index](https://www.epa.gov/sunsafety/learn-about-uv-index), updated 4 February 2025 | Describes the U.S. National Weather Service UV forecast model as using forecast ozone, clouds, elevation, solar geometry, and an erythema action spectrum. | This explains one national UV forecast system; it does **not** establish the exact internals of Open-Meteo's global model combination. |
| [FDA, The Sun and Your Medicine](https://www.fda.gov/drugs/understanding-over-counter-medicines/sun-and-your-medicine), page date not displayed; checked 6 October 2026 | SPF is not burn-protection time. Lists time of day, season, geographic location, altitude, weather, sunscreen application/reapplication, physical activity, swimming/heavy sweating, skin complexion, and some medicines as exposure or photosensitivity factors. | Supports the candidate factor inventory, but does not provide a validated combined formula. U.S. source; medication list is not exhaustive and does not support UV Scout diagnosing or managing medicine interactions. |
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
| Hourly forecast UV profile | UVI describes UV intensity at the surface; higher UVI means greater potential for harm and less time before harm can occur. The level varies during the day. | The complete time series can distinguish one short peak from hours at a sustained level. Keep the peak visible for the WHO reference; do not let an average erase a high interval. | **Core baseline data.** Use regular hourly `uv_index`, retain raw decimals, timestamps, and the location timezone. The provider gives a forecast, not the person's personal exposure. |
| Duration and shape of the outing | More time creates more opportunity for exposure. WHO discusses both duration/frequency and intermittent intense exposure; that does not supply a validated UV Scout dose-to-outcome formula. | Candidate descriptors: peak and its time; duration-weighted mean; estimated time and proportion in raw UVI bands; longest continuous time above a band; and how often the profile enters that band. Together these can distinguish a brief peak from sustained exposure. | **Core advice/context modifiers.** The app already computes peak and average; build and review the full profile before designing wording. Do not invent duration thresholds for “more dangerous” messages without evidence/product review. Never label these metrics personal dose or safe exposure time. |
| Start time / timing alternatives | UVI changes with solar elevation and time of day; solar noon is not always 12:00 on the clock. | Compare the selected plan with equal-duration alternatives only when those starts are still in the future. Show the forecast difference without telling the user to change plans. Keep daylight/darkness context visible. | **Advice/context modifier.** Base timing on actual forecast values, not a fixed clock-time rule. Do not let sunrise, sunset, civil dawn, or dusk stand in for UVI. |
| Selected location | Latitude, local weather, time zone, elevation, and ozone/cloud conditions affect environmental UV. Provider forecasts are model/grid estimates; the forecast cell may not exactly match requested coordinates. | Determines which forecast and local times are shown. A route may pass through conditions unlike the selected point. | **Baseline data selector.** Use selected coordinates and the provider time zone. Describe the result as a location forecast, not route-level certainty. Do not claim metre-level precision. |
| Shade along the outing | Shade reduces direct exposure, but scattered and reflected UV can remain. Protection varies with the cover and surroundings; a qualitative user label is not a measured UV attenuation. | Give concise general advice to seek shade when UV is strongest, while explaining that cover does not block all scattered or reflected UV. | **Product direction implemented:** no shade selector in the default planner; use general shade guidance instead. Never apply a numeric shade multiplier or promise shade makes an outing safe. |
| Clothing / skin coverage | Tightly woven or UPF-labelled clothing protects covered skin. Coverage and protection differ by fabric and garment; sunscreen is for skin that remains uncovered. | Could avoid redundant advice or make a reminder about uncovered skin more relevant. A broad coverage answer cannot verify fabric/UPF or which body parts remain exposed. | **Future optional advice modifier.** If added, ask a simple, optional coverage question. Do not infer clothing from temperature or change the forecast number. This remains an open product choice. |
| Sunscreen choice and coverage | WHO and AAD recommend broad-spectrum UVA/UVB coverage; SPF is not a time multiplier or a promise of safe duration. Advice on numeric minimum SPF differs: WHO's detailed page and AAD say 30+, while FDA guidance says 15+. | Encourage broad-spectrum product on uncovered skin, alongside clothing and shade. Avoid telling the user that a particular SPF lets them stay out longer. | **Baseline action, wording policy unresolved.** For an international app, say broad-spectrum and follow local public-health/product-label advice until UV Scout explicitly chooses an international or localized SPF policy. |
| Sunscreen amount and application | Protection assumes sufficient, even application. WHO gives 3–4 heaped tablespoons/about 35 ml for an adult full body; FDA/AAD use about 1 fluid ounce for an average full-body application. Required amount changes with body size and uncovered area. WHO says 20–30 minutes before exposure; FDA/AAD say 15 minutes. | A concise tip can say apply generously and evenly to all skin not covered by clothing, including often-missed areas. A more detailed help panel could explain the adult full-body example and that clothing reduces the amount needed. | **Action plus optional education.** Do not turn a whole-body amount into a one-size-fits-all personal dose. Because official lead-time advice differs, direct users to their product label/local advice rather than selecting a universal minute value without a policy decision. |
| Reapplication, elapsed time, swimming, sweating, and toweling | WHO advises reapplying every two hours, particularly after sweating, swimming, playing, or exercising. FDA says at least every two hours and more often with swimming/sweating; U.S. water-resistance periods depend on the product label. | Outing length can indicate whether one or more reapplication reminders may fall during the plan. Sweat, water, and toweling can make label-specific earlier reapplication relevant. The app does not know when sunscreen was applied, whether it is used, or which product/label applies. | **High-value advice modifier, partly unknown.** Default wording can be conditional. A future optional input could report swimming/heavy sweating; a future application-time control would be a separate tracking decision. Any reminder must say to follow the product label and must not imply protection is guaranteed between reminders. |
| Eye, head, and skin protection | UV can harm eyes as well as skin. WHO recommends UV-protective wraparound sunglasses, protective clothing, a brimmed hat, shade, and broad-spectrum sunscreen on skin clothing does not cover. | Cover complementary protection options rather than over-focusing on sunscreen. | **Baseline actions.** Say UV-protective eyewear; do not infer protection from lens darkness or price. Keep body-part coverage specific but concise. |
| Cloud cover | Clouds often reduce UV, but UV can still be high under cloud. Cloud percentage is a sky-cover estimate, not the fraction of UV blocked. | Helps explain the sky condition but should not override a supplied UV forecast or make a cloudy outing sound safe. | **Context only.** Show cloud percentage separately. Do not multiply or subtract it from regular `uv_index`; do not interpret “100% cloud cover” as “100% UV blocked.” |
| Snow, water, sand, bright surfaces | WHO notes reflection can increase UV exposure; snow, water, sand, and bright surfaces are relevant contexts. Exposure can locally exceed what a simple open-sky forecast suggests. | Could add a caution for skiing, beaches, boating, or other reflective settings. The current app has no route/surface data and cannot estimate an exact increase. | **Future optional context.** Consider a small “bright/reflection-prone surroundings” selection only if it adds meaningful advice. Do not invent a fixed multiplier or assert all water/sand/snow behaves identically. |
| Altitude, latitude, season, ozone, solar angle | These affect environmental UV; WHO lists them as drivers. The selected provider forecast may incorporate some of these through its model, but its exact contribution depends on model and location. | They explain why the same clock time or season may have different UVI in different places. | **Forecast-model context, not app multipliers.** Prefer the provider's location/time forecast. Do not add a generic altitude or seasonal adjustment on top. |
| Skin sensitivity, previous skin cancer, family history, photosensitizing medicines, age | WHO identifies some groups as more vulnerable; FDA explains that certain medicines may cause photosensitivity. These factors are personal, incomplete, and sometimes sensitive health information. | They can justify more careful advice for some people, but the app has no validated profile or medication checker. Skin color alone must not be used to reassure someone that protection is unnecessary. | **Not personalized in MVP.** Keep general advice suitable to a broad audience; optionally include a short note that some people need extra care and should follow clinician/local guidance. Do not collect diagnoses, medication names, or skin type without a separate privacy and evidence review. |
| Activity type | UV does not change because a user labels an outing “run,” “hike,” or “cycle.” Activity can change duration, sweat, water exposure, route, shade, and clothing. | Activity labels only help if they lead to a concrete, reliable difference in advice. | **Not a baseline input.** Keep the general-outdoor-user approach. If needed later, ask directly about a condition such as swimming or heavy sweating instead of inferring from a broad activity category. |
| Air temperature / heat | Temperature is not UV intensity. Heat illness is a separate hazard affected by factors beyond temperature, including humidity, exertion, hydration, and individual health. | Temperature can inform comfort or a future heat-safety feature, but must not change UV categories or UV-protection advice. | **Context only for UV Scout today.** Keep any future heat guidance as a separate, sourced risk model with its own inputs and limits. |
| Forecast freshness and uncertainty | Forecasts are model estimates with finite spatial/temporal resolution. UV Scout requests a rolling hourly window and can fail to load. | Missing/partial data should limit profile claims. Freshness should only be shown if the app has a meaningful timestamp. | **Reliability gate.** The current `HourlyForecast` has no model-issuance or fetch timestamp, so no stale-age rule is implementable from that object yet. Never fill missing UV with a guessed value or label a last fetch time as model-update time. |
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
and outing duration, what practical things should I consider?” By default it
uses no extra protection-context choices. It can add estimated time at elevated
UV, sunscreen reminders, general shade/clothing advice, and concise conditional
notes for bright surfaces or water/sweat. A future optional “Tailor this advice”
section may ask for context, but its exact fields are not decided. The model must
not lower or obscure the WHO reference action, calculate personal burn time, or
claim to know the user's actual UV dose.

Prefer composable outputs rather than a separate paragraph for every possible
combination:

1. **Evidence/data gate:** forecast values cover the selected interval; otherwise
   show a limitation rather than a complete profile. Assess freshness only if a
   meaningful issuance/fetch timestamp is available; do not imply calibration.
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
   conditional swim/sweat reminder, or a note about bright reflective
   surroundings. Do not imply those conditions were detected when they were not.
6. **Limits and alternatives:** state uncertainty in the hourly forecast and
   compare future start options neutrally with daylight context; never promise a
   risk-free duration or say sunscreen extends safe time.

### Duration and factor interactions to investigate for the second tree

| Combination | Evidence-informed effect | Candidate UV Scout behavior | Guardrail |
| --- | --- | --- | --- |
| Peak UVI × time at that level | Higher UVI means harm can occur in less time; longer and repeated exposure also matters. | Keep the WHO level from peak UVI, then add estimated minutes/hours in the 3–7 and 8+ bands so short and sustained exposure are distinguishable. | Forecast bins are hourly estimates, not a route measurement or exact personal dose. Do not convert them into “safe minutes.” |
| Total outing duration × reapplication interval | Sunscreen protection requires reapplication; WHO/FDA guidance is generally at least/about every two hours, with earlier reapplication after water/sweat or per product label. | If the selected outing crosses the two-hour point, show a conditional reminder to plan reapplication; avoid claiming that a timer knows application time. | Needs user-facing wording and acceptance of an approximate outing-start trigger; labels and application timing vary. |
| Sunscreen × amount × exposed skin | Under-application or missed areas can reduce achieved protection; clothes cover some skin. | Recommend generous, even application to uncovered skin, plus optional quantity education; avoid redundant sunscreen advice if skin is covered. | Do not compute a personalized volume without body size/coverage; WHO/FDA/AAD amount examples are full-body examples, not a universal amount. |
| Sunscreen × swimming/sweat/towel drying | Water, sweat, and friction can remove sunscreen; product water-resistance duration and instructions differ. | In default guidance, use a short conditional reminder (“if swimming or sweating…”). Later, an optional personalization section could ask about these conditions and emphasize the reminder. | Do not infer it just from “hike/run/cycle” or hard-code U.S. 40/80-minute labels globally. |
| Shade × reflective surroundings | Shade reduces direct sun but scattered and reflected UV may remain; snow, water, sand, and bright surfaces can increase exposure. | Default advice can explain shade's benefit and limitation and conditionally mention bright surroundings without asking users to choose a shade level. | A future optional personalization section may collect route context; no numeric shade or reflection multiplier without validated route/surface data. |
| Clothing coverage × sunscreen | Clothing is an important barrier; fabric, weave, wetness, stretch, and UPF affect performance. Sunscreen applies to uncovered skin. | Give general advice to cover skin and use sunscreen on uncovered areas. Defer a clothing-coverage question to optional personalization. | Avoid outfit scoring and do not infer coverage from temperature or activity type. |
| Forecast UV × cloud percentage | Clouds can reduce UV, but UV can remain high; cloud-cover percent is not percent UV blocked. | Use the supplied UV forecast as the UV input; keep cloud cover as separate context. | Never manually discount forecast UVI by cloud percentage. |
| UV protection × temperature/heat | Heat illness is a separate hazard from UV injury. | Keep UV protection and any future heat advice as independently sourced decision paths. | Do not use temperature to change UV tier or infer clothing, hydration needs, or sunscreen use. |

## Candidate input and metric inventory for the second model

The user's requested model is intentionally more sophisticated than a peak-only
rule: it should respond differently to the *values and pattern over the outing*
and to protection conditions when those conditions are known. “All possible”
cannot mean every human, route, and product variable—many are not forecast,
observable, or appropriate for an unprompted app to collect. This inventory is
the review space, not an approved set of shipped questions or thresholds.

### A. Forecast inputs available now

| Input | Candidate derived values | How it could affect guidance | Current limitation |
| --- | --- | --- | --- |
| Hourly regular UV Index across the selected interval | Raw peak and its time; duration-weighted mean; minutes and proportion in UVI 0–2, 3–<8, and 8+; longest continuous period at/above 3 and 8; count of separate periods at/above those thresholds; estimated UVI-hours as an optional intensity-over-time descriptor. | Peak anchors the WHO reference. Time-in-band, persistence, and possibly an integrated profile descriptor distinguish a short high interval from many hours of sustained UV. | WHO's action categories do not define a personal exposure dose. Hourly model values, grid-cell representation, and interpolation create uncertainty. UVI-hours would be a UV Scout-derived ambient proxy, not a personal dose or validated health-outcome score; decide whether it is useful before exposing it. |
| Exact outing start/end and overlap with forecast samples | Actual planned duration; partial-hour overlap; uncovered/missing portions; start/end local time. | Determines which forecast samples contribute, whether duration summaries are complete, and whether a sunscreen reminder might occur during the plan. | Must handle partial first/last hours and timezone/day boundaries transparently. Do not silently treat missing hours as zero. |
| Forecast update/freshness and coverage | Sample count, coverage fraction, data age where available, horizon status. | Gate the confidence/availability of summaries and recommendations; incomplete data may require a limitation message or suppress a metric. | Open-Meteo model resolution and hourly interpolation differ by location/model. The app does not currently have a calibrated uncertainty interval. |
| Location and local date/time | Time zone, solar noon/daylight markers already calculated for the selected place. | Interprets the hourly profile and permits comparison with still-future alternatives; marks daylight/twilight/darkness. | A selected point forecast is not a route forecast. Do not use fixed clock times across locations. |
| Temperature and cloud cover | Existing hourly context values and averages. | Report context only; they may explain conditions, not alter UV Scout's UV category or manually modify regular `uv_index`. | Open-Meteo exposes regular and clear-sky UV separately. Cloud percentage is not a fraction of UV blocked; do not subtract it from regular UV. Temperature is not UV or a personal clothing signal. |

### B. Conditions that could tailor actions, but are not currently known

| Condition | Possible future input/state | Guidance it could tailor | Guardrail / current default |
| --- | --- | --- | --- |
| Sunscreen applied? When? | Optional yes/no plus application time, if users explicitly want a reminder/timer. | Estimate when a general reapplication interval could fall during the planned outing. | Not currently collected. Do not imply sunscreen was applied at outing start or that UV Scout is tracking coverage. Until decided, use general label-following wording rather than a personal countdown. |
| Swimming, bathing, or prolonged water exposure | Optional direct condition; product-specific resistance may be unknown. | Emphasize water-resistant product and following its label; reapply after swimming/toweling as directed. | Never assume swimming from “cycling,” “hiking,” or another activity label; never use a universal 40/80-minute timer. |
| Heavy sweating or strenuous exercise | Optional direct condition, possibly simple yes/no rather than estimated sweat volume. | Emphasize that reapplication may be needed sooner and according to the product label. | Sweat amount is individual and not reliably inferred from activity or temperature. WHO/FDA guidance supports the conditional reminder, not a precise sweat-based time calculation. |
| Clothing coverage and garment protection | Optional broad coverage choice, with precise UPF/fabric detail only if justified. | Reduce redundant sunscreen emphasis for covered areas; keep sunscreen guidance for uncovered skin. | Do not infer clothing from temperature, activity, or season. Avoid claiming a garment's protection without its fabric/UPF information. No such question is approved for the default planner. |
| Shade / route cover | A later optional qualitative route context, if the user reverses the current decision to remove the shade selector. | Reinforce seeking shade during stronger UV and explain residual scattered/reflected exposure. | Do not multiply the forecast by a shade factor; do not promise safety or assume a route is shaded. Current decision is no shade input in the default planner. |
| Bright reflective surroundings: snow, water, sand, pale surfaces | Optional context selection, or concise conditional wording without collecting it. | Add a caution that reflection can increase exposure and that shade may not block it all. | No universal surface multiplier. WHO's examples are context-specific and should not be generalized into exact app arithmetic. |
| Hat and UV-protective eyewear | Optional actions already planned, if the UX later needs to suppress redundant reminders. | Tailor the action checklist. | Do not infer eye protection from dark lenses or assume an item is UV-protective without reliable product information. Better to include a concise baseline reminder than collect many low-value toggles. |
| Skin sensitivity, age, photosensitizing medicines, medical history | Sensitive personal profile, if ever considered. | Could change the person's vulnerability/context and prompt professional or local guidance. | Not for the MVP. Evidence sources identify risk factors but do not provide a complete app-ready risk calculator. Avoid diagnosing, medication checking, or reassurance based on skin tone. Requires a separate privacy, safety, and clinical/public-health review. |

### C. Cross-factor interactions the rule review must cover

| Interaction | What the model should distinguish | Candidate response behavior | Must not do |
| --- | --- | --- | --- |
| Peak × duration at peak | Brief peak versus peak sustained for several forecast intervals. | Keep peak-based WHO band, then state how long elevated UV is forecast during this outing. | Do not let a low outing average erase the peak. |
| Mean × time-in-band × continuity | Similar averages can hide very different curves; a short peak followed by low UV differs from an outing continuously near UVI 7. | Use multiple profile descriptors or a reviewed summary rule; examples should be tested before wording is authored. | Do not treat a mean alone as “overall risk” or claim that every hour in a category has equal personal effect. |
| Total duration × time at UVI 3+ / 8+ | Same outing duration can contain very different UV levels; same peak can last different amounts of time. | Keep duration, peak, and level-specific time distinct. Higher sustained exposure may make the guidance more prominent or add an exposure-pattern explanation. | Do not invent a new WHO category or an unvalidated medical danger score. |
| Duration × sunscreen elapsed time | A long outing can cross one or multiple general reapplication intervals. | If app policy supports it, provide a non-tracking reminder for intervals likely to occur during the outing, with product-label wording. | Do not start a personal sunscreen timer without a user-provided application time; don't imply protection remains adequate until a suggested time. |
| Sweat / swimming / toweling × sunscreen product | These conditions can call for earlier/product-specific reapplication. | When known, prioritize “follow your product label; reapply after…” over a generic elapsed-time-only reminder. | No activity-based inference, and no universal water-resistance duration. |
| Shade × reflective surroundings | Shade helps but scattered/reflected UV can remain, especially around reflective surfaces. | General shade advice plus conditional reflection reminder, or tailor it if a future user input exists. | No shade multiplier and no “shade makes it safe” message. |
| Clothing coverage × sunscreen | Sunscreen advice applies to skin not covered by clothing; clothing quality/coverage varies. | Give complementary actions; tailor only if coverage is explicitly known. | Do not compute sunscreen quantity from a vague clothing selection. |
| Cloud cover × provider UV | Cloudiness and UV are related but cloud percentage is not a UV-reduction factor. | Use provider's regular UV; present cloud amount separately as context. | Never multiply the UV profile by cloud percentage or imply overcast means no protection is needed. |
| Daylight/timing × forecast alternative | Lower UV at a later time may coincide with twilight or darkness; “earlier” may already be past. | Compare only still-future equal-duration choices and show daylight/twilight context. | Never recommend going back in time, or equate darkness with a safe daylight outing. |
| Forecast completeness × any derived metric | Incomplete or stale samples can distort averages, time-in-band, and duration summaries. | Expose missing coverage, reduce claims, or suppress unsupported results. | Never substitute missing forecast with zero or a fabricated UV value. |

### D. Illustrative profiles to use as test cases (not final message rules)

1. **One high hour, then low:** peak UVI 8 for about one hour followed by
   several hours near 0. Preserve the WHO extra-protection reference from the
   peak, but describe the short high-UV interval and do not call the whole
   outing “eight hours of extreme UV.”
2. **Long sustained elevated UV:** about eight hours near UVI 7. The WHO peak
   reference remains in its 3–7 band, while the outing layer must make the
   sustained duration obvious and consider repeated sunscreen reminders if
   the app's reminder policy and unknown application time are handled honestly.
3. **Same peak, different mean and persistence:** compare two curves with the
   same maximum but different time-in-band and longest continuous interval.
   This tests whether the second model truly uses the profile, not just max.
4. **Same average, different peaks:** a brief high peak plus low hours versus
   nearly constant moderate UV. This tests that the average cannot mask a peak.
5. **Long outing with heavy sweat or swimming:** only activate condition-specific
   wording when a user explicitly provides the condition; otherwise keep it
   conditional and generic.
6. **Partial forecast, twilight, or a day boundary:** test coverage, correct
   local time interpretation, and no false zero-risk inference from darkness.

### E. Suggested composition order

This order is a design proposal for review, not an approved algorithm:

1. Validate location, forecast freshness/coverage, time zone, and full outing
   interval; mark missing coverage before computing summaries.
2. Compute the outing UV profile from raw values and actual interval overlap.
3. Determine the separate WHO reference from the raw peak; never replace it
   with mean, duration, shade, clouds, clothing, or activity.
4. Interpret profile persistence/intensity using reviewed metrics. Preserve
   peak, average, threshold-time, and continuity as distinct facts until we
   choose which are meaningful enough to show or mention.
5. Apply known protection-condition rules (such as explicitly supplied
   application time, swimming, or heavy sweating) without inventing unknowns.
6. Add general conditional advice for important conditions not collected, while
   keeping it brief and clearly conditional.
7. Add location-specific daylight/timing context and future-only comparisons.
8. Deduplicate and prioritize the output: baseline action, most important
   outing-specific observation, then at most the most useful reminders and
   limitations. Store rules as composable pieces, not one prose block per
   combination.

The eventual decision tree should be a **rule composition system**: a fixed
reference layer, derived profile features, conditional modifiers, and a
prioritized explanation builder. It should not be a Cartesian-product table of
all possible inputs. First approve which derived metrics and optional inputs
belong in the product; only then define thresholds, boundaries, text, JSON, and
TypeScript interpretation.

### F. First-pass rule flow (working draft; not app behavior)

This draft turns the reviewed factor inventory into an explainable flow. It is
intentionally adjustable; it does not invent a new medical risk score or
change the WHO reference.

```text
Selected location + outing interval + hourly forecast
                         |
             Is forecast coverage adequate?
                 /                 \
               no                   yes
               |                     |
   Explain missing/partial      Build UV profile
   data; suppress unreliable    (peak/time, weighted mean,
   summaries; never fill       time in bands, longest stretch)
   gaps with zero                   |
                         WHO reference from raw peak
                          /        |        \
                       < 3      3 to < 8      8+
                        |          |           |
                    WHO low    WHO protect   WHO extra-protect
                          \        |        /
                      Add outing-profile interpretation
                    (brief peak vs sustained elevated UV;
                     report estimated times, don't hide peak)
                                  |
               Add known protection-condition modifiers
     (application time/product label, water, heavy sweat, toweling)
                                  |
             Unknown conditions stay conditional/general
                                  |
           Add daylight/timing context where it applies
                                  |
             Prioritize, deduplicate, explain limitations
```

The diagram separates the WHO band from UV Scout's profile interpretation. The
WHO band is based on the maximum raw UVI in the selected outing, following the
existing product direction. UV Scout then adds facts from the full profile:
duration-weighted mean; estimated minutes/proportion in 0–2, 3–<8, and 8+; and
the longest continuous estimated time at/above 3 and 8. These are descriptive
forecast summaries, not validated personal-dose calculations. Retain the peak
and its time even when the average is low.

For this first draft, profile values influence **what the explanation says and
how prominently sustained exposure is surfaced**, but do not numerically raise,
lower, or replace the WHO action band. We will test at least these cases:

- A brief UVI 8+ interval followed by several hours near zero: preserve the
  extra-protection peak reference, while making clear the higher interval is
  brief rather than describing every outing hour as high UV.
- Many continuous hours in UVI 3–<8: preserve the WHO 3–7 protection reference
  and make the sustained elevated period explicit; do not reduce it to a
  single peak or average.
- Same peak but different time above 3/8, and same average but different peak:
  the output should distinguish both profile shapes.

Sunscreen behavior is a separate branch, not a forecast metric:

- For general advice, say sunscreen is one layer for uncovered skin and follow
  the product instructions; do not imply sunscreen extends safe time outside.
- For a longer outing, a reminder can be conditional: if sunscreen is used,
  plan reapplication at least every two hours according to its label.
- If heavy sweating, swimming, or toweling is explicitly known, emphasize
  reapplying sooner/afterward according to the product label. If unknown, say
  “especially after…” conditionally; never infer it from an activity, weather,
  or temperature value.
- Do not calculate a personalized reapplication countdown until the user has
  supplied application time and the product-specific instructions are handled.

General shade, clothing, and eye-protection advice remains available without
extra questions. If reflective surroundings are not known, use brief conditional
wording rather than a numeric correction. Temperature and cloud percentage do
not modify this UV decision flow. Daylight only contextualizes timing choices;
it does not stand in for UV. If samples are missing or stale, disclose that and
withhold profile claims that the data cannot support.

Before implementation, we still need to choose exact message thresholds for
calling a profile “sustained,” whether raw profile summaries are displayed or
kept internal, which conditional messages fit the UI, and how forecast coverage
affects confidence. UVI-hours and separate-episode counts remain outside this
first pass unless the scenario review shows they add actionable clarity.

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
   for skin, eyes, and general shade/clothing guidance.
4. **Context additions:** add only the relevant sentence or action for known
   conditions. By default, use concise conditional wording rather than asking
   protection-context questions; defer optional personalization to a later
   feature. Context does not alter the provider UV value.
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

The user accepted a provisional forecast-profile metric set for the first draft.
The remaining questions are to test its behavior against varied profiles and
decide optional inputs, thresholds, and wording—not to write every combination
as a separate paragraph. Recommendations should respond to combinations of
values and conditions, including brief peaks versus sustained UV and heavy
sweating.

1. **Profile summary (working first pass accepted 6 October 2026).** Calculate
   peak/time-of-peak, duration-weighted average, estimated time/proportion in
   UVI bands, and longest continuous elevated interval. The user is comfortable
   with this as a starting point and expects later adjustments. Keep elevated-
   episode counts and UVI-hours out of the first pass unless review shows they
   add clarity. Hourly forecasts yield estimates, not minute-accurate personal
   exposure or personal dose. Keep chosen measures distinct, not collapsed.
2. **Optional personalization.** The default planner will not ask extra
   protection questions, and its shade selector has been removed. Later,
   decide whether an optional “Tailor this advice” section should ask about
   clothing coverage, swimming/heavy sweating, or bright reflective surroundings.
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

## Recommended next step before implementing the second model

First agree the useful profile metrics and expected behavior against the example
profiles above, then express interactions as separate, prioritized rules. The
WHO peak-based reference remains its own track. UV Scout's second track can then
combine the full forecast profile, outing duration, and only explicitly known
conditions; unknown swim/sweat/shade/clothing context remains conditional. Do
not add personal medical profiles or temperature-based UV adjustments in this
phase. Do not change app behavior until the rule set, examples, and limits have
been reviewed and accepted.

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
