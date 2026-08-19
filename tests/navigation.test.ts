import { describe, expect, it } from 'vitest';
import { hashForPage, pageFromHash } from '../src/utils/navigation';

describe('page hash navigation', () => {
  it('parses only canonical application page hashes', () => {
    expect(pageFromHash('#/profiles')).toBe('profiles');
    expect(pageFromHash('#/about/')).toBe('about');
  });

  it('ignores ordinary anchors and non-namespaced fragments', () => {
    expect(pageFromHash('#main-content')).toBeNull();
    expect(pageFromHash('#settings')).toBeNull();
    expect(pageFromHash('#unknown')).toBeNull();
    expect(pageFromHash('')).toBeNull();
  });

  it('rejects malformed or nested application hashes', () => {
    expect(pageFromHash('#/unknown')).toBeNull();
    expect(pageFromHash('#/profiles/extra')).toBeNull();
    expect(pageFromHash('#//profiles')).toBeNull();
  });

  it('creates URL fragments containing only public page identifiers', () => {
    expect(hashForPage('difference')).toBe('#/difference');
    expect(hashForPage('calculate')).toBe('#/calculate');
  });
});
