import { beforeEach, describe, expect, it, vi } from 'vitest';

const { isTauriMock } = vi.hoisted(() => ({
  isTauriMock: vi.fn(),
}));

vi.mock('@tauri-apps/api/core', () => ({
  isTauri: isTauriMock,
}));

import { isNativeRuntime, isWebRuntime } from '../src/utils/platform';

describe('platform runtime detection', () => {
  beforeEach(() => {
    isTauriMock.mockReset();
  });

  it('reports native runtime when Tauri identifies the environment', () => {
    isTauriMock.mockReturnValue(true);

    expect(isNativeRuntime()).toBe(true);
    expect(isWebRuntime()).toBe(false);
  });

  it('reports web runtime outside Tauri', () => {
    isTauriMock.mockReturnValue(false);

    expect(isNativeRuntime()).toBe(false);
    expect(isWebRuntime()).toBe(true);
  });
});
