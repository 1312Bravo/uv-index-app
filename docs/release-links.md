# UV Scout release links

Use this page as the central place to find the links shared with testers.

## Web app

- Public production app: <https://uvscout.expo.app>
- Latest deployment: <https://uvscout--ukanzs9nz7.expo.app>
- EAS Hosting deployments: <https://expo.dev/projects/16af89d2-ff27-4f27-9586-517473700c63/hosting/deployments>

The production URL is the stable link to share with anyone. See
[`web-release.md`](web-release.md) for deployment instructions.

The website background was updated 6 November 2026 from source commit
`d416720` to match the app and icon background (`#F5F2EC`).

## Android app

- EAS project builds: <https://expo.dev/accounts/bravogroup/projects/uvscout/builds>
- Restored solid-background logo build (queued, version code 2): <https://expo.dev/accounts/bravogroup/projects/uvscout/builds/a1b42ce1-9d64-483b-9936-6c0bba94ca33>
- APK download: available on the build page when this build finishes
- Latest Android UI update: <https://expo.dev/accounts/bravogroup/projects/uvscout/updates/3dabc3f6-8b22-482b-9ba6-925e3a2bd6d2>

The custom outing duration selector was updated on 7 November 2026 from source
commit `7f3b113`. Hours and minutes are now stacked and use simple underlines on
both phone and web. The Android update group is
<https://expo.dev/accounts/bravogroup/projects/uvscout/updates/9d693483-1cf7-4b0a-a0a6-894cfdd5824b>.
The latest web deployment is listed above.

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
