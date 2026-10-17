# Info Tab Content: Evidence and Product Choices

See the [source register](data-sources.md) for source-to-code mappings.

## UV Index

**Source-backed:** WHO describes the UV Index as an indicator of the level of
ultraviolet radiation and potential danger from sun exposure. Its global
categories are Low (0–2), Moderate (3–5), High (6–7), Very high (8–10), and
Extreme (11+). WHO says protection is recommended at UVI 3 and above and that
cloud cover can reduce UV without eliminating risk; thin clouds can have little
effect or sometimes enhance UV through scattering.

Sources:

- World Health Organization, “Global solar UV index: a practical guide,” 13
  June 2002, https://www.who.int/publications/i/item/9241590076
- World Health Organization, “Radiation: The ultraviolet (UV) index,” 20 June
  2022, checked 17 October 2026,
  https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-%28uv%29-index

**Product choice:** UV Scout keeps the forecast decimal visible and rounds it to
the nearest integer for category selection, with .5 rounded up. Recommendation
thresholds use the unrounded forecast: general protection starts at raw UVI 3
and extra protection at 8. The Info tab keeps the five concise category
descriptions and the separate WHO three-range protection table, but omits the
rounding mechanics. The outing guidance explains a category/threshold mismatch
only when that difference affects the selected outing.

## Cloud cover

**Source-backed:** Open-Meteo defines hourly `cloud_cover` as total cloud cover
in percent, representing an area fraction. Cloud cover is not a measure of the
fraction of UV blocked. WHO notes that clouds generally reduce UV, but UV may
remain high under cloud cover and thin clouds may have little effect or increase
UV through scattering.

Sources:

- Open-Meteo, Weather Forecast API documentation, `cloud_cover` variable,
  https://open-meteo.com/en/docs
- World Health Organization, “Radiation: Ultraviolet (UV) radiation,” 9 March
  2016, https://www.who.int/news-room/questions-and-answers/item/radiation-ultraviolet-(uv)

**Product choice:** The human-readable labels in
`src/domain/weather/cloudCoverBands.json` are simplified UV Scout descriptions.
They are not an official meteorological scale. The Info tab says cloud cover
does not show UV strength; users should follow the UV Index.

## Precipitation amount

**Source-backed:** Open-Meteo's hourly `precipitation` is a sum over the
preceding hour and can include rain, showers, and snow. The World Meteorological
Organization's *Guide to Meteorological Instruments and Methods of Observation*
(WMO-No. 8, seventh edition, 2008) lists rain-rate ranges of below 2.5 mm/h for
light, 2.5–below 10 mm/h for moderate, 10–below 50 mm/h for heavy, and 50 mm/h
or more for its highest rain-rate band. Those formal intensity values are based
on a three-minute measurement period; they are not direct labels for an hourly
forecast total. The guide itself notes that its term “violent” for the highest
band can be confusing.

Sources:

- Open-Meteo, Weather Forecast API documentation, `precipitation` variable,
  https://open-meteo.com/en/docs
- World Meteorological Organization, *Guide to Meteorological Instruments and
  Methods of Observation*, WMO-No. 8, seventh edition (2008), Part I, Chapter 14,
  Annex, https://www.weather.gov/media/epz/mesonet/CWOP-WMO8.pdf

**Product choice:** `src/domain/weather/precipitationRateGuide.json` presents
these ranges only as an educational rough comparison for one-hour amounts when
precipitation is rain. UV Scout uses “Very intense rain” instead of the WMO
guide's potentially confusing highest-band term. The app does not classify
forecast values automatically: an hourly total cannot show short bursts, the
provider's total may include snow, and an outing sum spans multiple hours. The
chart and outing summary keep displaying numeric amounts. The Info tab explains
the preceding-hour timing with a clock example and labels zero as “0 mm expected,”
not a guarantee of no precipitation. Its outing note clarifies that peak hourly
chance and the rain guide are not whole-outing values.

## Wind speed

**Source-backed:** The U.S. National Weather Service's land-based Beaufort scale
associates wind-force ranges with observable effects such as leaves rustling,
small branches moving, trees swaying, or damage at very high wind speeds.
Open-Meteo's `wind_speed_10m` is the wind-speed forecast at 10 m above ground for
the indicated hour.

Sources:

- U.S. National Weather Service, [Beaufort Wind Scale](https://www.weather.gov/mfl/beaufort),
  land effects and force descriptions; checked 10 October 2026.
- Open-Meteo, [Weather Forecast API documentation](https://open-meteo.com/en/docs?past_days=1),
  hourly `wind_speed_10m` definition; checked 10 October 2026.

**Product choice:** `src/domain/weather/windSpeedBands.json` groups neighboring
Beaufort levels into six wider km/h ranges to keep the Info guide compact. The
descriptions are short paraphrases of typical land effects, not official labels,
precise predictions, or wind-safety thresholds. The chart shows rounded hourly
wind speed only. No wind value affects UV or protection guidance.
