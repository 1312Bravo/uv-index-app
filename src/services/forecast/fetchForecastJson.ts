const FORECAST_REQUEST_TIMEOUT_MS = 12_000;

export async function fetchForecastJson<T>(
  url: string,
  signal?: AbortSignal,
  timeoutMs = FORECAST_REQUEST_TIMEOUT_MS,
): Promise<T> {
  if (signal?.aborted) throw new Error('Forecast request cancelled.');

  const controller = new AbortController();
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let cancelRequest: (() => void) | undefined;

  const deadline = new Promise<never>((_, reject) => {
    cancelRequest = () => {
      controller.abort();
      reject(new Error('Forecast request cancelled.'));
    };
    signal?.addEventListener('abort', cancelRequest, { once: true });
    timeoutId = setTimeout(() => {
      controller.abort();
      reject(new Error('Forecast request timed out.'));
    }, timeoutMs);
  });

  const request = (async () => {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error('Forecast is unavailable.');
    return response.json();
  })();

  try {
    return await Promise.race([request, deadline]) as T;
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
    if (cancelRequest) signal?.removeEventListener('abort', cancelRequest);
  }
}
