# Preview the app during development

This project uses one Expo app for Android and web. The current screen lets you
search for a place or use your device location. After selecting one, it shows
the previous hourly value, Now, and future hours through tomorrow in a
horizontally scrollable UV chart with cloud cover, temperature, precipitation,
and wind context. The UV reading defaults to Now. Choose Custom time to open
one list of future half-hour slots; Today and Tomorrow appear within the list.
The selected choice shows the full local date and time, centered above the list.
On the hour, the reading uses Open-Meteo's hourly UV forecast. Half-hour UV is
estimated between adjacent hourly values and labeled approximate. The chart
still shows the original hourly values. Exact local time remains in the shared
location summary.
The first page keeps this overview focused. Use the **Plan an Outing** tab to
open the planner, which supports Now or a scheduled start, duration presets
including 3 hours, custom minutes, or an explicit end time. Scheduled starts
and end times use matching collapsible lists of future half-hour choices
through tomorrow in the selected location's time zone. Choosing a scheduled
start opens the list immediately. The selected choice stays visible with its
list until the row is tapped again. End-time choices must follow the selected
start. Duration choices behave the same way.

## Android phone with Expo Go

1. Install Expo Go from the Google Play Store.
2. Connect the phone and computer to the same Wi-Fi network.
3. Open PowerShell in this repository and run `pnpm install` if dependencies are
   not installed, then run `pnpm start`.
4. Open Expo Go, select **Scan QR code**, and scan the code in the terminal.
5. Leave the terminal running while previewing. Most source edits refresh on
   the phone automatically.

Tap **Use my location** to grant foreground location access. The app requests
permission only after the tap and does not save the coordinates.

The location map uses Leaflet with OpenStreetMap tiles on phone and web. It
needs internet access to load the map library and visible map tiles; the map
shows OpenStreetMap attribution. The public tile service is best-effort, so a
commercial or high-traffic release will need a suitable tile provider.

You can instead type a city or place. Suggestions appear after three characters
and a short pause; tap one to select it.
Place search and UV/temperature forecasts use Open-Meteo; no API key is needed
for this non-commercial prototype. The app credits GeoNames and Open-Meteo.
Review Open-Meteo's [terms](https://open-meteo.com/en/terms),
[forecast documentation](https://open-meteo.com/en/docs), and
[geocoding documentation](https://open-meteo.com/en/docs/geocoding-api) before
any commercial release.

If the phone cannot connect on the same Wi-Fi network, stop the server with
Ctrl+C and run `pnpm start --tunnel`. Tunnel mode can be slower.

## Web browser

With the development server running, press `W` in its terminal. You can also
start only the browser preview with `pnpm web`.

Browser location access requires `localhost` or a secure HTTPS page. If the
permission prompt is denied, allow location access in browser settings and try
the button again.

The QR code is generated each time the development server starts. It is a
temporary connection to the computer running the project, not a published app.

## Domain checks

The outing wind cell shows average wind with the average hourly gust peak in
parentheses at the same size, with smaller labels beneath. Wind and gust
ranges share a smaller line. Gusts use
the provider's preceding-hour maxima;
the gust average weights available hourly peaks by outing overlap. It is
not the single strongest gust. See `notes/wind-gust-summary.md` for the partial
hour and missing-data rules.

Outing UV calculations interpret each provider hourly value as the mean of
the preceding hour. For example, the 12:00 UV reading overlaps an outing
ending at 11:52. The maximum is the highest overlapping hourly mean, and the
average weights each mean by the covered minutes. Partial-hour weighting is
an approximation, not an instantaneous maximum or a minute-resolution forecast.
The compact outing chart consumes the summary's overlapping UV intervals,
keeps source endpoint labels, and uses the same opacity for every bar.
See `notes/uv-hourly-timing-review.md` for details.

Run `pnpm test` to compile and run the dependency-free domain test suite. It
covers the WHO reference table, UV category rounding, outing aggregation,
forecast gaps, precipitation totals, raw UV action boundaries, low-UV advice,
cloud overlap, separated periods, and the sunscreen reminder boundary.
