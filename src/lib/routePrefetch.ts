export const PREFETCH_PATHS = [
  '/mietfahrer',
  '/ersatzfahrer-lkw',
  '/lkw-fahrer-kurzfristig',
  '/lkw-fahrer-buchen',
  '/preise-und-ablauf',
] as const;

export type PrefetchPath = typeof PREFETCH_PATHS[number];
export type ConnectionInfo = { saveData?: boolean; effectiveType?: string };

export function canPrefetch(state: {
  pathname: string; visible: boolean; online: boolean; connection?: ConnectionInfo;
}) {
  return !state.pathname.startsWith('/admin') && state.visible && state.online
    && !state.connection?.saveData
    && !['slow-2g', '2g', '3g'].includes(state.connection?.effectiveType ?? '');
}

export function prefetchPath(href: string, origin: string): PrefetchPath | undefined {
  try {
    const url = new URL(href, origin);
    if (url.origin !== origin) return;
    return PREFETCH_PATHS.find(path => path === url.pathname);
  } catch {
    return;
  }
}

/** One shared queue: route changes cannot cause overlapping speculative imports. */
export function createPrefetchQueue(
  load: (path: PrefetchPath) => Promise<unknown>,
) {
  const completed = new Set<PrefetchPath>();
  const pending = new Map<PrefetchPath, () => boolean>();
  let running: PrefetchPath | undefined;

  async function drain() {
    if (running) return;
    for (const [path, eligible] of pending) {
      pending.delete(path);
      if (!eligible() || completed.has(path)) continue;
      running = path;
      try {
        await load(path);
        completed.add(path);
      } catch {
        // Speculative failure must never affect navigation; an intent may retry.
      } finally {
        running = undefined;
      }
    }
  }

  return {
    request(path: PrefetchPath, eligible: () => boolean) {
      if (!eligible() || completed.has(path) || running === path) return;
      pending.set(path, eligible);
      void drain();
    },
    cancelPending() { pending.clear(); },
  };
}