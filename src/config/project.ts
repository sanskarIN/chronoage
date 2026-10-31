export const project = {
  name: 'ChronoAge',
  version: '2.0.13',
  credit: 'Made by the Sanskar',
  repositoryUrl: 'https://github.com/sanskarIN/chronoage',
  profileUrl: 'https://github.com/sanskarIN',
  fundingUrl: 'https://buymeacoffee.com/sanskarIN',
  businessEmails: ['sanskarin@outlook.in', 'sanskarin.business@gmail.com'] as const,
  supportEmail: 'supportramsandesh@gmail.com',
  license: 'MIT',
} as const;

export function mailto(address: string): string {
  return `mailto:${address}`;
}
