export async function shareText(title: string, text: string): Promise<'shared' | 'copied'> {
  if (navigator.share) {
    await navigator.share({ title, text });
    return 'shared';
  }
  await navigator.clipboard.writeText(text);
  return 'copied';
}

export function printResult(): void {
  window.print();
}
