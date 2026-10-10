# App identity

- User-facing name: UV Scout.
- Purpose: Help people make UV-aware decisions about outdoor time now or
  tomorrow, using the available local forecast.
- Current screen subtitle: "Plan your time outside based on the UV Index."
- The internal project slug and package name remain `uv-index-app` for now.

## Product scope

- UV protection and practical UV guidance are the reason the app exists.
- The app is for current and near-term outings in the supported forecast window
  (today and tomorrow), not long-range planning.
- Temperature, cloud cover, precipitation, and wind are supporting outing
  context. They do not turn UV Scout into a general-purpose weather app or
  replace the UV forecast and guidance.
- Forecasts describe expected conditions; they do not measure an individual's
  actual UV exposure or provide a personal dose or medical-risk estimate.
- If the forecast does not cover the entire selected outing, say so clearly
  rather than treating missing hours as zero or silently changing the plan.
