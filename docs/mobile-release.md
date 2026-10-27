# Android release by install link

UV Scout's first phone distribution will be a signed Android APK shared through
an EAS Build install link. It will not be listed on Google Play. Anyone with the
link can download the APK; Android will ask them to allow installation from the
app they used to open it.

The central list of tester links is in [`release-links.md`](release-links.md).

## Where the links live

- The APK install link is created for each build and is available in the Expo
  dashboard under the project's Builds page. It can be shared with testers.
- EAS Update keeps compatible JavaScript and asset updates on Expo's update
  service, associated with this project and the `preview` channel. Users keep
  the installed app and receive updates when they reopen it.
- A new APK is still required for native changes, such as adding or changing a
  native dependency, app permissions, or the Expo SDK. Users install that build
  over the existing app; keep the same Android application ID and signing key.

## Current setup state

The repository is linked to the Expo project `@bravogroup/uvscout`. Its EAS
project ID and update URL are configured in `app.json`, with an app-version
runtime policy and the internal APK profile in `eas.json`. The current channel
is `preview`.

The Android application ID is `com.bravogroup.uvscout`. Keep this identifier
and the EAS-managed Android signing key for future builds so Android can install
new APKs as updates to the existing app.

After selecting the Android application ID:

1. Build the initial installable APK with the `preview` profile.
2. Share its EAS Build install URL. This URL points to that build and is used by
   new testers to install the app.
3. Publish compatible JavaScript and asset changes to the `preview` channel.
   Existing installs download the update from Expo; no new APK link is needed.
4. For native changes, create and share a new APK build. Android can install it
   as an update when its package ID and signing key match the original build.

EAS Update support and behavior are documented by Expo:
https://docs.expo.dev/eas-update/introduction/
https://docs.expo.dev/build/internal-distribution/
