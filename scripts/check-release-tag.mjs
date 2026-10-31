import { readFile } from 'node:fs/promises';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const suppliedTag = process.argv[2] || process.env.GITHUB_REF_NAME;

if (!suppliedTag) {
  console.error('Release tag verification requires a tag argument or GITHUB_REF_NAME.');
  process.exitCode = 1;
} else {
  const expectedTag = `v${packageJson.version}`;
  if (suppliedTag !== expectedTag) {
    console.error(`Release tag ${suppliedTag} does not match package version ${packageJson.version}.`);
    console.error(`Expected tag: ${expectedTag}`);
    process.exitCode = 1;
  } else {
    console.log(`Release tag ${suppliedTag} matches package version ${packageJson.version}.`);
  }
}
