export type BrowserGeolocationErrorCode =
  | 'insecure-context'
  | 'permission-denied'
  | 'position-unavailable'
  | 'timeout'
  | 'unsupported';

export class BrowserGeolocationError extends Error {
  constructor(readonly code: BrowserGeolocationErrorCode) {
    super(code);
    this.name = 'BrowserGeolocationError';
  }
}

export async function getBrowserLocationPermission(): Promise<PermissionState | 'unknown'> {
  if (typeof navigator === 'undefined' || !navigator.permissions?.query) return 'unknown';

  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
    return permission.state;
  } catch {
    // Some browsers don't support querying geolocation permission state.
    return 'unknown';
  }
}

export function getBrowserCurrentPosition(): Promise<GeolocationPosition> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return Promise.reject(new BrowserGeolocationError('unsupported'));
  }

  if (!window.isSecureContext) {
    return Promise.reject(new BrowserGeolocationError('insecure-context'));
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, (error) => {
      const code: BrowserGeolocationErrorCode = error.code === error.PERMISSION_DENIED
        ? 'permission-denied'
        : error.code === error.TIMEOUT
          ? 'timeout'
          : 'position-unavailable';
      reject(new BrowserGeolocationError(code));
    }, {
      enableHighAccuracy: false,
      maximumAge: 5 * 60_000,
      timeout: 20_000,
    });
  });
}
