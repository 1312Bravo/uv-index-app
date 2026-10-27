# Web release

UV Scout's web app is deployed to EAS Hosting:

- Production: <https://uvscout.expo.app>
- EAS Hosting deployments: <https://expo.dev/projects/16af89d2-ff27-4f27-9586-517473700c63/hosting/deployments>

The central list of tester links is in [`release-links.md`](release-links.md).

## Link previews and home-screen icons

The static page metadata in `public/index.html` provides the title, description,
and social preview image. The image lives at `public/icons/og-image-v2.png`.
`public/manifest-v2.json` defines the UV Scout name, theme, and icons used when the
site is added to a phone's home screen. The Apple touch icon is in the same
icons directory.

To add the website to an Android home screen, open it in Chrome and choose
**Install app** or **Add to Home screen** from the browser menu. On iPhone, open
it in Safari, tap **Share**, then **Add to Home Screen**. The saved shortcut
uses the site's configured name and icon; it opens the live website.

When changing the logo or its palette, regenerate the image files with:

```powershell
pnpm build:brand-assets
```

Then export and deploy the web app as usual. Messaging and social platforms may
cache link-preview images, so an old preview can remain visible for a while.

## Publish an update

From the repository root, export the web app and deploy that export to
production:

```powershell
pnpm exec expo export --platform web --output-dir .expo/web-export
pnpm dlx eas-cli@25.3.0 deploy --prod --export-dir .expo/web-export
```

The export directory is generated output and is ignored by Git. EAS Hosting
also gives each deployment a unique URL; the production URL remains the stable
link to share.

## Data-service limits

The app requests forecast data directly from each visitor's browser. The free
Open-Meteo API is for non-commercial use and has per-IP and application limits.
Review its current [terms](https://open-meteo.com/en/terms) and
[data licence](https://open-meteo.com/en/licence) before changing how the app is
funded or used commercially. Forecast data is credited in the app and in
Info > Sources. See `notes/data-sources.md` for provider details and limits.
