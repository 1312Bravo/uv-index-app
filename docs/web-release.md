# Web release

UV Scout's web app is deployed to EAS Hosting:

- Production: <https://uvscout.expo.app>
- EAS Hosting deployments: <https://expo.dev/projects/16af89d2-ff27-4f27-9586-517473700c63/hosting/deployments>

The central list of tester links is in [`release-links.md`](release-links.md).

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
