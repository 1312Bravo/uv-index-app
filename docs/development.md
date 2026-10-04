# Preview the app during development

This project uses one Expo app for Android and web. The current screen lets you
search for a place or use your device location. After selecting one, it shows
five earlier hourly values, Now, and eighteen future hours in a horizontally
scrollable UV and temperature chart. The chart can cross midnight.
The first page keeps this overview focused. Use the **Plan an Outing** tab to
open the planner, which supports Now or a scheduled start, duration presets
including 3 hours, custom minutes, or an explicit end time. Android uses
date/time dialogs; web uses a browser date/time control.

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
