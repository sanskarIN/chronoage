import { readFile } from 'node:fs/promises';

const packageJson = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
const projectSource = await readFile(new URL('../src/config/project.ts', import.meta.url), 'utf8');

function readProjectString(key) {
  const match = projectSource.match(new RegExp(`\\b${key}:\\s*'([^']+)'`));
  if (!match?.[1]) throw new Error(`Unable to read project.${key} from src/config/project.ts.`);
  return match[1];
}

const checks = [
  ['name', packageJson.name, readProjectString('name').toLowerCase()],
  ['version', packageJson.version, readProjectString('version')],
  ['license', packageJson.license, readProjectString('license')],
];

const failures = checks
  .filter(([, packageValue, projectValue]) => packageValue !== projectValue)
  .map(
    ([label, packageValue, projectValue]) =>
      `${label}: package.json=${JSON.stringify(packageValue)} project.ts=${JSON.stringify(projectValue)}`,
  );

const author = String(packageJson.author ?? '');
const businessEmail = projectSource.match(/businessEmails:\s*\['([^']+)'/)?.[1];
if (!businessEmail || !author.includes(businessEmail)) {
  failures.push('author: package.json must include the primary business email from project metadata');
}

if (failures.length > 0) {
  console.error('Project metadata consistency check failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log('Project metadata is consistent with package.json.');
}
