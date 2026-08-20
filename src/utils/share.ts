export type ShareTextResult = 'shared' | 'copied' | 'cancelled';

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

async function copyText(text: string): Promise<void> {
  if (!navigator.clipboard?.writeText) {
    throw new Error('Clipboard sharing is unavailable.');
  }
  await navigator.clipboard.writeText(text);
}

export async function shareText(title: string, text: string): Promise<ShareTextResult> {
  if (navigator.share) {
    try {
      await navigator.share({ title, text });
      return 'shared';
    } catch (error) {
      if (isAbortError(error)) return 'cancelled';
    }
  }

  await copyText(text);
  return 'copied';
}

export function printResult(): void {
  window.print();
}
