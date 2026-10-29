# UV Scout release links

Use this page as the central place to find the links shared with testers.

## Web app

- Public production app: <https://uvscout.expo.app>
- Latest deployment: <https://uvscout--pwvllvkv3l.expo.app>
- EAS Hosting deployments: <https://expo.dev/projects/16af89d2-ff27-4f27-9586-517473700c63/hosting/deployments>

The production URL is the stable link to share with anyone. See
[`web-release.md`](web-release.md) for deployment instructions.

## Android app

- EAS project builds: <https://expo.dev/accounts/bravogroup/projects/uvscout/builds>
- Restored solid-background logo build (queued, version code 2): <https://expo.dev/accounts/bravogroup/projects/uvscout/builds/a1b42ce1-9d64-483b-9936-6c0bba94ca33>
- APK download: available on the build page when this build finishes
- Latest Android UI update: <https://expo.dev/accounts/bravogroup/projects/uvscout/updates/00a52c35-44d6-4116-a31a-34bce75161f1>

The guidance and selector changes were published 29 October 2026 from source
commit `7ed11df`. The web app and Android UI update include clearer below-3
UV Outlook wording, removal of
its category-rounding note, and matching scrollable start/end time selectors.
The Android update uses channel `preview`, runtime `1.0.0`.

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
