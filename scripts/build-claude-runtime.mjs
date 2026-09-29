import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PLUGIN_ROOT } from './build-packages.mjs';

const sourceRoot = path.join(PLUGIN_ROOT, 'scripts', 'claude-runtime');
const archivePath = path.join(sourceRoot, 'runtime-vendor.zip');
const metadataPath = path.join(sourceRoot, 'runtime-vendor.json');

export async function buildClaudeRuntime() {
  const temporaryRoot = mkdtempSync(path.join(os.tmpdir(), 'vectora-claude-runtime-'));
  try {
    for (const name of ['package.json', 'package-lock.json']) {
      cpSync(path.join(sourceRoot, name), path.join(temporaryRoot, name));
    }
    mkdirSync(path.join(temporaryRoot, 'python'), { recursive: true });
    execFileSync('npm', ['ci', '--ignore-scripts', '--no-audit', '--no-fund'], {
      cwd: temporaryRoot,
      stdio: 'inherit',
    });
    const pythonCommand = process.platform === 'win32' ? 'py' : 'python3';
    const pythonArgs = process.platform === 'win32' ? ['-3'] : [];
    execFileSync(pythonCommand, [
      ...pythonArgs, '-m', 'pip', 'install', '--disable-pip-version-check', '--no-warn-script-location',
      '--no-compile', '--no-deps', '--only-binary=:all:', '--platform', 'any', '--implementation', 'py',
      '--abi', 'none', '--python-version', '3.10', '--require-hashes', '-r', path.join(sourceRoot, 'requirements.txt'),
      '--target', path.join(temporaryRoot, 'python'),
    ], { stdio: 'inherit' });
    execFileSync(pythonCommand, [
      ...pythonArgs, path.join(sourceRoot, 'build-vendor-archive.py'), temporaryRoot,
    ], { stdio: 'inherit' });

    const temporaryArchive = path.join(temporaryRoot, 'runtime-vendor.zip');
    const bytes = readFileSync(temporaryArchive);
    const packageLock = JSON.parse(readFileSync(path.join(sourceRoot, 'package-lock.json'), 'utf8'));
    const metadata = {
      formatVersion: 1,
      nodePackages: Object.keys(packageLock.packages).filter((name) => name.startsWith('node_modules/')).length,
      python: 'fonttools==4.63.0',
      files: 0,
      bytes: bytes.length,
      sha256: createHash('sha256').update(bytes).digest('hex'),
    };
    const verificationRoot = path.join(temporaryRoot, 'verification');
    const extracted = Number(execFileSync(pythonCommand, [
      ...pythonArgs, path.join(sourceRoot, 'extract-vendor.py'), temporaryArchive, verificationRoot,
    ], { encoding: 'utf8' }).trim());
    metadata.files = extracted;
    const wheelMetadata = path.join(verificationRoot, 'python', 'fonttools-4.63.0.dist-info', 'WHEEL');
    if (!existsSync(wheelMetadata) || !/^Tag: py3-none-any$/m.test(readFileSync(wheelMetadata, 'utf8'))) {
      throw new Error('The vendored fontTools package is not a portable py3-none-any wheel.');
    }
    mkdirSync(sourceRoot, { recursive: true });
    writeFileSync(archivePath, bytes);
    writeFileSync(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);
    return metadata;
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.stdout.write(`${JSON.stringify(await buildClaudeRuntime(), null, 2)}\n`);
}
