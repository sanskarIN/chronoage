export const sharedText = {
  primaryNavigation: 'Primary',
  quickActionsShortcut: 'Ctrl/⌘ K',
  invalidTimeZone: 'Enter a valid IANA timezone identifier such as Europe/London.',
  versionLabel: (version: string): string => `Version ${version}`,
  openSourceProjectMeta: (license: string, credit: string): string =>
    `Open-source ${license} project · ${credit} ·`,
} as const;
