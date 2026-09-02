import { access } from 'node:fs/promises';
import { spawn } from 'node:child_process';

const root = new URL('../', import.meta.url);
const cargoLockPath = new URL('src-tauri/Cargo.lock', root);

try {
  await access(cargoLockPath);
} catch {
  console.log('Native locked verification skipped: Cargo.lock is absent; pre-lockfile mode is active.');
  process.exit(0);
}

const child = spawn(
  process.platform === 'win32' ? 'cargo.exe' : 'cargo',
  ['metadata', '--manifest-path', 'src-tauri/Cargo.toml', '--locked', '--format-version', '1', '--no-deps'],
  { cwd: root, stdio: 'inherit' },
);

child.on('error', (error) => {
  console.error(`Native locked verification could not start Cargo: ${error.message}`);
  process.exitCode = 1;
});

child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`Native locked verification was terminated by signal ${signal}.`);
    process.exitCode = 1;
  } else {
    process.exitCode = code ?? 1;
  }
});
