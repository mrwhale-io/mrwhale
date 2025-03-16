/**
 * Polls a request until it succeeds.
 *
 * @template T The type of the result returned by the request.
 * @param context A string representing the context of the request, used for logging purposes.
 * @param requestGetter A function that returns a promise of the request to be polled.
 * @returns A promise that resolves to the result of the successful request.
 *
 * @throws Will log an error message and retry the request if it fails.
 */
export async function pollRequest<T>(
  context: string,
  requestGetter: () => Promise<T>
): Promise<T> {
  let result = null;
  let finished = false;
  let delay = 0;

  while (!finished) {
    try {
      const promise = requestGetter();
      result = await promise;
      finished = true;
    } catch (e) {
      const sleepMs = Math.min(30000, Math.random() * delay * 1000 + 1000);
      console.error(`Failed request [${context}]. Reattempt in ${sleepMs} ms.`);
      await new Promise((resolve) => {
        setTimeout(resolve, sleepMs);
      });
    }

    delay++;
  }

  return result;
}
