import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { canPrefetch, ConnectionInfo, createPrefetchQueue, prefetchPath } from '../lib/routePrefetch';

const loaders = {
  '/mietfahrer': () => import('../pages/Mietfahrer'),
  '/ersatzfahrer-lkw': () => import('../pages/ErsatzfahrerLkw'),
  '/lkw-fahrer-kurzfristig': () => import('../pages/LkwFahrerKurzfristig'),
  '/lkw-fahrer-buchen': () => import('../pages/LKWFahrerBuchen'),
  '/preise-und-ablauf': () => import('../pages/PreiseUndAblauf'),
};
const queue = createPrefetchQueue(path => loaders[path]());

/** Intent-only prefetch: no automatic five-page fan-out during initial loading. */
export function usePrefetchRoutes() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    let active = true;
    let idle: number | undefined;
    let timer: number | undefined;
    const wanted = new Set<keyof typeof loaders>();
    const connection = (navigator as Navigator & { connection?: ConnectionInfo }).connection;
    const eligible = () => active && canPrefetch({
      pathname: window.location.pathname,
      visible: document.visibilityState === 'visible', online: navigator.onLine, connection,
    });
    const cancel = () => {
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (timer !== undefined) window.clearTimeout(timer);
      idle = undefined; timer = undefined;
      wanted.clear(); queue.cancelPending();
    };
    const flush = () => {
      idle = undefined; timer = undefined;
      if (!eligible()) { cancel(); return; }
      for (const path of wanted) queue.request(path, eligible);
      wanted.clear();
    };
    const schedule = () => {
      if (!wanted.size || !eligible() || document.readyState !== 'complete') return;
      if (idle !== undefined || timer !== undefined) return;
      if (typeof window.requestIdleCallback === 'function') {
        idle = window.requestIdleCallback(flush);
      } else {
        timer = window.setTimeout(flush, 200);
      }
    };
    const intent = (event: Event) => {
      if (!(event.target instanceof Element) || !eligible()) return;
      const link = event.target.closest('a[href]');
      const href = link?.getAttribute('href');
      if (!href) return;
      const path = prefetchPath(href, window.location.origin);
      if (!path || path === window.location.pathname) { cancel(); return; }
      wanted.add(path); schedule();
    };
    const environmentChange = () => { if (!eligible()) cancel(); };
    document.addEventListener('pointerover', intent, { passive: true });
    document.addEventListener('focusin', intent);
    // Never intercept navigation. Any click gives real demand priority.
    document.addEventListener('click', cancel, { passive: true });
    document.addEventListener('visibilitychange', environmentChange);
    window.addEventListener('offline', cancel);
    window.addEventListener('load', schedule);
    return () => {
      active = false; cancel();
      document.removeEventListener('pointerover', intent);
      document.removeEventListener('focusin', intent);
      document.removeEventListener('click', cancel);
      document.removeEventListener('visibilitychange', environmentChange);
      window.removeEventListener('offline', cancel);
      window.removeEventListener('load', schedule);
    };
  }, [pathname, hash]);
}
