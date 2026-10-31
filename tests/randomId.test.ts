import { describe, expect, it, vi } from 'vitest';
import { createRandomUuid } from '../src/utils/randomId';

describe('createRandomUuid', () => {
  it('uses native randomUUID when the runtime provides it', () => {
    const randomUUID = vi.fn().mockReturnValue('123e4567-e89b-42d3-a456-426614174000');
    const getRandomValues = vi.fn();
    const source = { randomUUID, getRandomValues } as unknown as Crypto;

    expect(createRandomUuid(source)).toBe('123e4567-e89b-42d3-a456-426614174000');
    expect(randomUUID).toHaveBeenCalledTimes(1);
    expect(getRandomValues).not.toHaveBeenCalled();
  });

  it('builds an RFC 4122 version-4 UUID with getRandomValues on older webviews', () => {
    const getRandomValues = vi.fn((array: Uint8Array) => {
      array.set([0, 1, 2, 3, 4, 5, 0xff, 7, 0xff, 9, 10, 11, 12, 13, 14, 15]);
      return array;
    });
    const source = { randomUUID: undefined, getRandomValues } as unknown as Crypto;

    expect(createRandomUuid(source)).toBe('00010203-0405-4f07-bf09-0a0b0c0d0e0f');
    expect(getRandomValues).toHaveBeenCalledTimes(1);
  });
});
