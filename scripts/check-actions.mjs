import { readFile, readdir } from 'node:fs/promises';

const workflowDirectory = new URL('../.github/workflows/', import.meta.url);
const minimumMajors = new Map([
  ['actions/checkout', 7],
  ['actions/setup-node', 7],
  ['actions/setup-java', 5],
  ['actions/upload-artifact', 7],
  ['actions/download-artifact', 7],
  ['actions/dependency-review-action', 4],
  ['github/codeql-action', 4],
]);

const failures = [];
const workflowNames = (await readdir(workflowDirectory)).filter(
  (name) => name.endsWith('.yml') || name.endsWith('.yaml'),
);

for (const workflowName of workflowNames) {
  const source = await readFile(new URL(workflowName, workflowDirectory), 'utf8');
  for (const match of source.matchAll(/\buses:\s*([^\s@]+)@v(\d+)\b/g)) {
    const actionPath = match[1];
    const majorText = match[2];
    if (!actionPath || !majorText) continue;
    const [owner, repository] = actionPath.split('/');
    if (!owner || !repository) continue;
    const actionRepository = `${owner}/${repository}`;
    const minimum = minimumMajors.get(actionRepository);
    if (minimum === undefined) continue;
    const major = Number(majorText);
    if (major < minimum) {
      failures.push(
        `${workflowName}: ${actionRepository}@v${major} is below the supported v${minimum}+ policy.`,
      );
    }
  }
}

if (failures.length > 0) {
  console.error('GitHub Actions version policy check failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Checked ${workflowNames.length} workflows: maintained GitHub Actions majors are in use.`);
}
