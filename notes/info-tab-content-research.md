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
  2022,
  https://www.who.int/news-room/questions-and-answers/item/radiation-ultraviolet-(uv)-index

**Product choice:** UV Scout keeps the forecast decimal visible and rounds it to
the nearest integer for category selection, with .5 rounded up. The Info tab
states this explicitly because it changes category boundaries for decimals.
Recommendation thresholds use the unrounded forecast: general protection starts
at raw UVI 3 and extra protection at 8. A value such as 2.5 can therefore show
the Moderate category while remaining below the protection threshold.

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
They are not an official meteorological scale. The exact percentage remains
visible, and the interface says not to interpret it as UV reduction or route
shade.

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
chart and outing summary keep displaying numeric amounts.
