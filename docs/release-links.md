# UV Scout release links

Use this page as the central place to find the links shared with testers.

## Web app

- Public production app: <https://uvscout.expo.app>
- Latest deployment: <https://uvscout--60ckl6wm5a.expo.app>
- EAS Hosting deployments: <https://expo.dev/projects/16af89d2-ff27-4f27-9586-517473700c63/hosting/deployments>

The production URL is the stable link to share with anyone. See
[`web-release.md`](web-release.md) for deployment instructions.

The app page, website shell, and PWA theme now use the neutral off-white
background (`#FAFAF8`), published on 9 November 2026 from source commit
`d19d07e`. The previous website background update from 6 November matched the
then-current app and icon background (`#F5F2EC`).

## Android app

- EAS project builds: <https://expo.dev/accounts/bravogroup/projects/uvscout/builds>
- Restored solid-background logo build (queued, version code 2): <https://expo.dev/accounts/bravogroup/projects/uvscout/builds/a1b42ce1-9d64-483b-9936-6c0bba94ca33>
- APK download: available on the build page when this build finishes
- Latest Android update: <https://expo.dev/accounts/bravogroup/projects/uvscout/updates/cd087018-14d6-479f-952d-ab99b77aba55>

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
