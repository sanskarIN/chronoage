import { describe, expect, it } from 'vitest';
import { hashForPage, pageFromHash } from '../src/utils/navigation';

describe('page hash navigation', () => {
  it('parses canonical and compact page hashes', () => {
    expect(pageFromHash('#/profiles')).toBe('profiles');
    expect(pageFromHash('#settings')).toBe('settings');
    expect(pageFromHash('#/about/')).toBe('about');
  });

  it('ignores unrelated fragments so accessibility anchors do not navigate pages', () => {
    expect(pageFromHash('#main-content')).toBeNull();
    expect(pageFromHash('#unknown')).toBeNull();
    expect(pageFromHash('')).toBeNull();
  });

  it('creates URL fragments containing only public page identifiers', () => {
    expect(hashForPage('difference')).toBe('#/difference');
    expect(hashForPage('calculate')).toBe('#/calculate');
  });
});
