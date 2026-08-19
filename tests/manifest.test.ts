import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { hashForPage, PAGE_IDS } from '../src/utils/navigation';

interface ManifestShortcut {
  name?: string;
  url?: string;
}

interface WebManifest {
  id?: string;
  start_url?: string;
  scope?: string;
  shortcuts?: ManifestShortcut[];
}

const manifest = JSON.parse(
  await readFile(new URL('../public/manifest.webmanifest', import.meta.url), 'utf8'),
) as WebManifest;
const serviceWorker = await readFile(new URL('../public/sw.js', import.meta.url), 'utf8');
const allowedShortcutUrls = new Set(PAGE_IDS.map((page) => `/${hashForPage(page)}`));

describe('web app manifest', () => {
  it('keeps stable root application identity and scope', () => {
    expect(manifest.id).toBe('/');
    expect(manifest.start_url).toBe('/');
    expect(manifest.scope).toBe('/');
  });

  it('exposes shortcuts only through canonical public application page routes', () => {
    expect(manifest.shortcuts?.length).toBeGreaterThan(0);

    for (const shortcut of manifest.shortcuts ?? []) {
      expect(shortcut.name).toBeTruthy();
      expect(shortcut.url && allowedShortcutUrls.has(shortcut.url)).toBe(true);
      expect(shortcut.url).not.toMatch(/[?&=]/);
    }
  });

  it('keeps the manifest in the versioned service-worker core shell', () => {
    expect(serviceWorker).toMatch(/CACHE_NAME = 'chronoage-v\d+'/);
    expect(serviceWorker).toContain("'/manifest.webmanifest'");
  });
});
