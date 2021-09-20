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
