export const sharedText = {
  quickActionsShortcut: 'Ctrl/⌘ K',
  versionLabel: (version: string): string => `Version ${version}`,
  openSourceProjectMeta: (license: string, credit: string): string =>
    `Open-source ${license} project · ${credit} ·`,
} as const;
