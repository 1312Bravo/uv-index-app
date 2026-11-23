# UV Scout release links

Use this page as the central place to find the links shared with testers.

## Web app

- Public production app: <https://uvscout.expo.app>
- Latest deployment: <https://uvscout--8b1iz8zn8e.expo.app>
- EAS Hosting deployments: <https://expo.dev/projects/16af89d2-ff27-4f27-9586-517473700c63/hosting/deployments>

The production URL is the stable link to share with anyone. See
[`web-release.md`](web-release.md) for deployment instructions.

Saved locations are now available in the Location tab and persist in the
current app or browser profile. The web update was published on 21 November
2026 from source commit `857c03f`. The web deployment is `tnra3b6jp7`.

Saved locations now prompt for an editable map-derived name while preserving
the selected coordinates. This web update was published on 23 November 2026
from source commit `a777ee7`. The web deployment is `8b1iz8zn8e`.

The Plan an Outing AQI range summary is small again, while the audience advice
remains larger. A new small meaning line follows the highest category reached.
This was published on 15 November 2026 from source commit `46ec642`. The web
deployment is `j3pinmq5yg`; the Android
`preview` update group is `94d4ac6a-bc02-4f07-a967-1ac7bb2eea76` with runtime
`1.0.0`.

The Plan an Outing air-quality description now matches the UV Outlook text size.
This was published on 15 November 2026 from source commit `3fee0c2`. The web
deployment is `dw76826lx9`; the Android `preview` update group is
`eb2146c5-f8b1-4389-a15d-cbaa93113fdc` with runtime `1.0.0`.

Air quality in UV Outlook, Plan an Outing, and Info, along with native spelling
for selected location names, was published on 14 November 2026 from source
commit `aef4d0a`. The web deployment is `74q95hxt5x`; the Android update group is
`5403f727-3efa-4f67-a0ec-d0e0afb7b92b` on the `preview` channel with runtime
`1.0.0`.

The light-background app and website icons, splash, and social preview were
published to the website on 13 November 2026 from source commit `6664d14`.
The web deployment is `pij75122ey`.

The UV guidance and forecast interval fixes from commit `12125e8` were
published on 10 November 2026. The web deployment is `w9d0x3gtjs`.

The app page, website shell, and PWA theme now use the neutral off-white
background (`#FAFAF8`), published on 9 November 2026 from source commit
`d19d07e`. The previous website background update from 6 November matched the
then-current app and icon background (`#F5F2EC`).

## Android app

- EAS project builds: <https://expo.dev/accounts/bravogroup/projects/uvscout/builds>
- Latest APK build (version code 4): <https://expo.dev/accounts/bravogroup/projects/uvscout/builds/8ade2912-0fe2-421d-b60a-2c0258cc7c02>
- APK download: <https://expo.dev/artifacts/eas/jZv6HjuB206_cUWAjKFB5-HNcC15xx8DmCxtvDeYygc.apk>
- Light-background icon build (version code 3): <https://expo.dev/accounts/bravogroup/projects/uvscout/builds/0d8ab723-1fed-4f1f-a378-e09dbff59f2a>
- Latest Android update: <https://expo.dev/accounts/bravogroup/projects/uvscout/updates/e2509772-d6ce-40d2-906c-5e187fdf420a>

The 23 November 2026 `preview` OTA update adds the saved-location naming
dialog and custom saved names, keeping coordinates unchanged. It was published
from source commit `a777ee7` with runtime `1.0.0`.

The 21 November 2026 preview APK adds saved locations and includes the native
AsyncStorage dependency. It was built from commit `d407506` as version code 4,
with runtime `1.0.0`. Install this APK over version code 3 to update existing
Android installations.

The completed 13 November 2026 Android APK build includes the light-background native
icon and splash from commit `6664d14`. Its update channel remains `preview`
with runtime `1.0.0`. Existing version-code-2 installations need this new APK
to change the icon and startup screen.

The 10 November 2026 Android OTA update uses channel `preview`, runtime
`1.0.0`, and the same source commit `12125e8` as the web deployment.

The neutral off-white background is live on the website and Android preview.
The web deployment is `60ckl6wm5a`; Android update group
`cd087018-14d6-479f-952d-ab99b77aba55` uses channel `preview`, runtime `1.0.0`.

The forecast-point note now loads on the Location page on 8 November 2026 from
source commit `964a7f5`. It uses coordinates from the existing Open-Meteo
time-zone request, avoiding an extra request. The web deployment is
`8gd503fzkg`; Android update group `30d1f153-8a20-4b87-9c06-76a7fe6cdf20` uses
channel `preview`, runtime `1.0.0`.

The location source links were grouped beneath the forecast-point note on 8
November 2026 from source commit `0e309d3`. The web deployment is `sfi0bb9dy4`;
Android update group `d1b90f61-9e12-44d9-999e-dc05fe7026c5` uses channel
`preview`, runtime `1.0.0`.

The forecast-point note and updated Sources section were published on 7 November
2026 from source commit `a5f11de`. When Open-Meteo returns forecast grid
coordinates and Photon finds a nearby mapped place, the app shows the grid
center's approximate distance from the selected location and that place name.
The note is omitted if the optional place lookup is unavailable. The web
deployment is `0gsv4w2m53`; Android update group `e05ae82f-ac8d-4f49-9c6c-7fd3615f740a`
uses channel `preview`, runtime `1.0.0`.

The outing duration selector was updated on 7 November 2026 from source commit
`7451ee3`. It offers half-hour steps through the available two-day forecast
window.

The latest chart styling update was published 1 November 2026 from source
commit `ff14bf3`. Past chart bars and labels are gray. Current and future bars
use the previous softer shade; the selected outing remains highlighted by its
background. The Android update uses channel `preview`, runtime `1.0.0`.

The website branding was then restored from source commit `240037e`: the
loading logo and PWA icons again use the original solid stone background.
The new Android APK embeds the current UI and restored loading logo, keeping
runtime `1.0.0` and incrementing the Android version code to 2.

Existing APK installations receive these UI changes through Expo Update.
Open the app with an internet connection, allow the update to download, then
fully close and reopen it. Installing the new APK is required to change the
native loading logo; uninstalling the existing app first is unnecessary.
Chrome may retain the previous installed website icon until its manifest
refreshes. Removing and re-adding the website shortcut picks up the current
icon when the old one persists.

The install link is specific to a build; share the newest one with Android users.
See [`mobile-release.md`](mobile-release.md) for install and update details.
