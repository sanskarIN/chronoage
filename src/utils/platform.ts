import { isTauri } from '@tauri-apps/api/core';

export function isNativeRuntime(): boolean {
  return isTauri();
}

export function isWebRuntime(): boolean {
  return !isNativeRuntime();
}
