import { describe, it, expect } from 'vitest';
import { canPrefetch, createPrefetchQueue, prefetchPath, PREFETCH_PATHS } from '../routePrefetch';

describe('approved five-route prefetch policy', () => {
  it('keeps exactly the five approved targets', () => {
    expect(PREFETCH_PATHS).toEqual(['/mietfahrer', '/ersatzfahrer-lkw', '/lkw-fahrer-kurzfristig', '/lkw-fahrer-buchen', '/preise-und-ablauf']);
  });
  it('accepts only same-origin approved links', () => {
    expect(prefetchPath('/mietfahrer?x=1', 'https://example.com')).toBe('/mietfahrer');
    expect(prefetchPath('https://other.com/mietfahrer', 'https://example.com')).toBeUndefined();
    expect(prefetchPath('/fahrer-buchen#buchungsformular', 'https://example.com')).toBeUndefined();
  });
  it('blocks admin, hidden, offline, data-saving and slow connections', () => {
    const base = { pathname: '/', visible: true, online: true };
    expect(canPrefetch(base)).toBe(true);
    for (const change of [{ pathname: '/admin' }, { visible: false }, { online: false }, { connection: { saveData: true } }, ...['slow-2g','2g','3g'].map(effectiveType => ({ connection: { effectiveType } }))]) {
      expect(canPrefetch({ ...base, ...change })).toBe(false);
    }
  });
  it('does not load anything automatically', () => {
    let calls = 0;
    createPrefetchQueue(async () => { calls++; });
    expect(calls).toBe(0);
  });
  it('serializes and deduplicates intents, including replay', async () => {
    const started: string[] = [];
    let finish: (() => void) | undefined;
    const queue = createPrefetchQueue(path => {
      started.push(path);
      return new Promise<void>(resolve => { finish = resolve; });
    });
    queue.request('/mietfahrer', () => true);
    queue.request('/mietfahrer', () => true);
    queue.request('/ersatzfahrer-lkw', () => true);
    expect(started).toEqual(['/mietfahrer']);
    finish?.(); await Promise.resolve(); await Promise.resolve();
    expect(started).toEqual(['/mietfahrer', '/ersatzfahrer-lkw']);
    finish?.(); await Promise.resolve(); await Promise.resolve();
    queue.request('/mietfahrer', () => true);
    expect(started).toHaveLength(2);
  });
  it('cancels queued work while allowing a started import to finish', async () => {
    const calls: string[] = [];
    let finish: (() => void) | undefined;
    const queue = createPrefetchQueue(path => { calls.push(path); return new Promise<void>(resolve => { finish = resolve; }); });
    queue.request('/mietfahrer', () => true);
    queue.request('/ersatzfahrer-lkw', () => true);
    queue.cancelPending(); finish?.(); await Promise.resolve(); await Promise.resolve();
    expect(calls).toEqual(['/mietfahrer']);
  });
  it('rechecks eligibility between imports', async () => {
    const calls: string[] = []; let allowed = true; let finish: (() => void) | undefined;
    const queue = createPrefetchQueue(path => { calls.push(path); return new Promise<void>(resolve => { finish = resolve; }); });
    queue.request('/mietfahrer', () => allowed);
    queue.request('/ersatzfahrer-lkw', () => allowed);
    allowed = false; finish?.(); await Promise.resolve(); await Promise.resolve();
    expect(calls).toEqual(['/mietfahrer']);
  });
  it('swallows optional failure and permits retry', async () => {
    let calls = 0;
    const queue = createPrefetchQueue(async () => { calls++; if (calls === 1) throw new Error('offline'); });
    queue.request('/mietfahrer', () => true); await Promise.resolve(); await Promise.resolve();
    queue.request('/mietfahrer', () => true); await Promise.resolve(); await Promise.resolve();
    expect(calls).toBe(2);
  });
});