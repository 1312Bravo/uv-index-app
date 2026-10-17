# Outing guidance output review

Reviewed 17 October 2026. This is a review of the guidance currently generated
by UV Scout. No recommendation rule or app wording changed in this pass.

## Decision being reviewed

Does the outing result give different, useful advice for a brief high-UV peak,
sustained moderate UV, alternating periods, low UV, and incomplete forecasts?
The result should state when protection applies without treating an average or
one peak as the whole outing.

## Evidence and product choices

- [WHO, The ultraviolet (UV) index](https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-%28uv%29-index),
  20 June 2022, checked 17 October 2026: higher UVI means greater potential for
  harm and less time before harm can occur; protection is recommended at UVI 3+.
- [WHO, Protecting against skin cancer](https://www.who.int/news-room/questions-and-answers/item/radiation-protecting-against-skin-cancer),
  16 July 2024, checked 17 October 2026: clothing, shade, eyewear, broad-spectrum
  SPF 30+ on uncovered skin, and sunscreen reapplication every two hours,
  especially after sweating or swimming. WHO does not tie that interval to
  cumulative forecast hours at UVI 3+.
- UV Scout chooses how to combine hourly bins into outing windows, round
  opening times, show the general reapplication note, and add a cloud note.
  Those choices are documented in [active UV guidance](active-uv-guidance.md)
  and the [source register](data-sources.md). They do not estimate personal
  dose or a safe exposure duration.

## How the outputs were checked

Synthetic one-hour UV bins were placed from 9:00 AM on 1 July 2026 in UTC.
The existing outing summary and guidance interpreter generated the actual
takeaway, breakdown, actions, context notes, and coverage message. The outing
screen shows a coverage message first when present, followed by the takeaway,
breakdown, actions, and context notes. This was a text and domain-output
review, not a device layout check or a live forecast check. The existing
domain suite passed 24 of 24 tests.

| Synthetic outing | Output observed | Review |
| --- | --- | --- |
| Six low hours: [0, 1, 2, 2, 1, 0] | Average 1.0, highest 2.0, practical low-UV takeaway, no Protection steps. | Clear and concise; it does not claim zero UV. |
| One high hour: [0, 0, 8, 1, 0, 0] | Average 1.5. The takeaway assigns stronger actions to 11:00 AM-12:00 PM, lower-UV wording to the other five hours, and a general reapplication note under Protection steps. | Distinguishes a brief peak from the six-hour outing. The average does not hide UVI 8. |
| Six moderate hours: [4, 5, 6, 6, 5, 4] | Average 5.0. Protection is shown from 9:00 AM-3:00 PM; Clothing and shade says UV 3+ lasts the full six hours. | The sustained pattern and its timing are clear. |
| Same average, different profile: [4, 4, 4, 4] versus [0, 0, 8, 8] | Both average 4.0. The first has four hours of moderate-UV action. The second has two low hours followed by two UVI 8 hours and Strongest hours advice. | The time pattern changes the recommendation as intended. |
| Alternating periods: [4, 1, 4, 1, 4, 1] | The second takeaway bullet lists all six one-hour windows and repeats the same protection sentence three times. Protection steps separately identify three elevated stretches totaling three hours. | Accurate but hard to scan. This is the clearest presentation issue. |
| Thresholds: [2.9, 3.0, 7.9, 8.0] | Raw 2.9 gets lower-UV wording, 3.0 starts regular protection, and 8.0 starts Strongest hours. The average is shown as 5.5. | The rules use raw values correctly. A displayed category rounded from 2.9 may still need a brief explanation next to the result. |
| Thirty minutes at UVI 4 | The timed action covers 9:00-9:30 AM. Protection steps also show the general two-hour reapplication sentence and Bright surfaces context. | Correctly conditional, but the amount of secondary text may feel heavy for a short outing. |
| Three-hour plan with only two hours forecast at UVI 4 | Coverage message says two of three hours are available. UV breakdown and actions describe the two known hours. | Missing time stays unknown and the result does not call it low UV. |
| Same UV [1, 2, 4, 6, 5, 2], clear versus very cloudy | Peak 6.0, average 3.3, and core protection actions are identical. The very cloudy case adds a Cloudy hours context note for the overlapping UVI 3+ period. | Weather context does not change UV values or protection thresholds. |

## Representative generated wording

These are the exact two opening bullets for the brief peak:

> UV ranges from 0.0 to 8.0 (average 1.5), with the highest forecast hour at 11:00 AM.
>
> From around 9:00 AM to around 11:00 AM, most people need no extra sun protection. From around 11:00 AM to around 12:00 PM, cover exposed skin, protect your eyes, use SPF 30+ sunscreen on uncovered skin, prioritize shade, and limit direct sun. From around 12:00 PM to around 3:00 PM, most people need no extra sun protection.

For six sustained moderate hours, the opening reads:

> UV ranges from 4.0 to 6.0 (average 5.0), with the highest forecast hour at 11:00 AM.
>
> From around 9:00 AM to around 3:00 PM, cover exposed skin, protect your eyes, seek shade, and use SPF 30+ sunscreen on uncovered skin.

For alternating UV, the second bullet repeats the same advice three times:

> From around 9:00 AM to around 10:00 AM, cover exposed skin, protect your eyes, seek shade, and use SPF 30+ sunscreen on uncovered skin. From around 10:00 AM to around 11:00 AM, most people need no extra sun protection. From around 11:00 AM to around 12:00 PM, cover exposed skin, protect your eyes, seek shade, and use SPF 30+ sunscreen on uncovered skin. From around 12:00 PM to around 1:00 PM, most people need no extra sun protection. From around 1:00 PM to around 2:00 PM, cover exposed skin, protect your eyes, seek shade, and use SPF 30+ sunscreen on uncovered skin. From around 2:00 PM to around 3:00 PM, most people need no extra sun protection.

## Findings and next review choices

1. The main comparison succeeds: one high hour and six moderate hours produce
   different timing and protection summaries. Equal averages also preserve
   different peaks and durations.
2. Compress the opening wording when the same UV band appears in several
   separate windows. Keep the complete timing in the detailed guidance.
3. Review how much secondary advice is visible for a short outing. The app
   does not know sunscreen application time, route surfaces, or activity.
4. Consider a small explanation when the rounded display category sounds
   stronger than the raw-UVI action threshold, such as a displayed Moderate
   category at raw UVI 2.9.
5. Keep the coverage warning ahead of conclusions about the known hours.

The older [recommendation-tree draft](recommendation-tree-draft.md) and
[model research](recommendation-model-research.md) now identify their earlier
cumulative-UVI reapplication gate as superseded. The active rules and tests
show the general reapplication note whenever sunscreen is recommended.

## Follow-up implementation (17 October 2026)

- The opening keeps chronological, band-specific wording for up to four
  windows. At five or more, it lists every approximate period grouped by band
  and states each band's protection action once. The detailed steps still show
  exact times for the first two periods plus a count for any further periods.
- The general reapplication step is shorter. It remains conditional on using
  sunscreen and still mentions the product label, two-hour interval, and
  swimming, sweating, or towel drying. A short outing does not silently lose
  that general advice.
- A small note explains when category rounding produces Moderate below raw
  UVI 3 or Very high below raw UVI 8. Actions still use the raw forecast.
- These are UV Scout presentation rules, not new WHO thresholds or a personal
  exposure model. The updated domain suite passes 25 tests, including the
  alternating-window and category-boundary cases.
