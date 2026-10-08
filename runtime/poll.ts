// Runs a task now and then every interval, never two runs at once. Returns a
// function that stops polling and waits for a run in progress to finish.
export function poll(
  task: () => Promise<unknown>,
  intervalMs: number,
  failure: string,
): () => Promise<void> {
  let active: Promise<unknown> | undefined;
  const tick = () => {
    if (active) return;
    active = task()
      .catch(() => console.error(failure))
      .finally(() => {
        active = undefined;
      });
  };
  const timer = setInterval(tick, intervalMs);
  timer.unref();
  tick();
  return async () => {
    clearInterval(timer);
    await active;
  };
}
