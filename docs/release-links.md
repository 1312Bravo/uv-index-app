# UV Scout release links

Use this page as the central place to find the links shared with testers.

## Web app

- Public production app: <https://uvscout.expo.app>
- Latest deployment: <https://uvscout--5btfw9w25f.expo.app>
- EAS Hosting deployments: <https://expo.dev/projects/16af89d2-ff27-4f27-9586-517473700c63/hosting/deployments>

The production URL is the stable link to share with anyone. See
[`web-release.md`](web-release.md) for deployment instructions.

## Android app

- EAS project builds: <https://expo.dev/accounts/bravogroup/projects/uvscout/builds>
- Transparent splash-logo build (ready): <https://expo.dev/accounts/bravogroup/projects/uvscout/builds/0fb40b9d-3574-4886-8513-07e8bdedcf85>
- APK download: <https://expo.dev/artifacts/eas/G-pGNsdQisd_bu2mfYVx2EsB-nJDCsXxmORVMYo0AsY.apk>
- Latest Android UI update: <https://expo.dev/accounts/bravogroup/projects/uvscout/updates/00a52c35-44d6-4116-a31a-34bce75161f1>

Published 29 October 2026 from source commit `7ed11df`. The web deployment and
Android UI update include the clearer below-3 UV Outlook wording, removal of
its category-rounding note, and matching scrollable start/end time selectors.
The Android update uses channel `preview`, runtime `1.0.0`.

Existing APK installations receive these UI changes through Expo Update.
Open the app with an internet connection, allow the update to download, then
fully close and reopen it. The APK above adds the transparent native loading
logo and also receives the latest UI through that update. Install it over the
existing app to change the loading logo; uninstalling first is unnecessary.

The install link is specific to a build; share the newest one with Android users.
See [`mobile-release.md`](mobile-release.md) for install and update details.
