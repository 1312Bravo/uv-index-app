# Daylight events

See the [source register](data-sources.md) for source-to-code mappings.

## Definitions

- Civil dawn and civil dusk occur when the geometric centre of the Sun is 6°
  below the horizon. This is the standard civil-twilight boundary.
- Sunrise and sunset use an apparent altitude of about −0.833° to account for
  the solar disk and typical atmospheric refraction.
- Event times are calculated for the selected location's calendar date and
  returned as Unix seconds, then formatted in the forecast's IANA time zone.
- At polar latitudes, one or more events may not occur. Those values are `null`
  and are omitted from the chart rather than fabricated.

## Method and limitations

The pure TypeScript calculation uses a compact solar-position approximation
following the Meeus-style equations used by SunCalc. NOAA also describes its
solar calculator as based on Jean Meeus's *Astronomical Algorithms* and reports
approximately one-minute theoretical accuracy for its own method between ±72°
latitude, with lower accuracy beyond that range. That published accuracy is not
a benchmark of this implementation. Actual observed times also vary with
atmospheric conditions and local terrain; these chart markers are approximate
astronomical context, not a visibility or UV-exposure guarantee.

NOAA defines civil twilight as the interval when the Sun is 6° below the
horizon. The app uses that boundary for civil dawn and civil dusk. The chart uses
an app-authored, simplified upper arc from sunrise to sunset and a reversed
lower arc from sunset to the following sunrise; neither curve represents
precise solar or lunar altitude. Show only one moving icon at the selected
timestamp: the sun while that time is between sunrise and sunset, or the crescent
moon from sunset until the following sunrise. The vertical time marker continues
to show the selected time. The crescent is only a nighttime symbol: UV Scout
does not calculate lunar position or phase and does not use a lunar data source.

Sources:

- NOAA Global Monitoring Laboratory, [Solar Calculation Details](https://gml.noaa.gov/grad/solcalc/calcdetails.html)
- NOAA Global Monitoring Laboratory, [Glossary: civil twilight](https://gml.noaa.gov/grad/solcalc/glossary.html)
- SunCalc, [calculation method and event definitions](https://github.com/mourner/suncalc)
- Open-Meteo, [Forecast API documentation](https://open-meteo.com/en/docs)
  lists daily sunrise and sunset fields, but the app does not request or consume
  them; all four chart events are calculated locally by UV Scout.
