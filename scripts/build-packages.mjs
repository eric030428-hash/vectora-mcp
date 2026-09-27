import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PLUGIN_VERSION = '1.0.1';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const PLUGIN_ROOT = root;
const fixtureDirectory = path.join(root, 'tests', 'fixtures');

export function createMcpConfig(platform) {
  if (platform === 'macos') {
    const command = readFileSync(path.join(root, 'scripts/start-mcp.sh'), 'utf8').trimEnd();
    return {
      mcpServers: {
        vectora: {
          command: '/bin/sh',
          args: ['-c', command],
        },
      },
    };
  }

  const command = readFileSync(path.join(root, 'scripts/start-mcp.ps1'), 'utf8').trimEnd();
  return {
    mcpServers: {
      vectora: {
        command: 'powershell.exe',
        args: ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', command],
      },
    },
  };
}

function excluded(relativePath) {
  const segments = relativePath.split(path.sep);
  const base = segments.at(-1) ?? '';
  return segments.some((segment) => ['.git', 'node_modules', 'release', 'tests', '__pycache__'].includes(segment))
    || base === '.DS_Store'
    || base.endsWith('.pyc')
    || relativePath === path.join('scripts', 'build-packages.mjs');
}

function copyPlugin(targetRoot) {
  mkdirSync(targetRoot, { recursive: true });
  for (const name of readdirSync(root)) {
    if (excluded(name)) continue;
    cpSync(path.join(root, name), path.join(targetRoot, name), {
      recursive: true,
      filter(sourcePath) {
        return !excluded(path.relative(root, sourcePath));
      },
    });
  }
  const manifestPath = path.join(targetRoot, '.codex-plugin/plugin.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  manifest.version = PLUGIN_VERSION;
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

function listFiles(directory, prefix = '') {
  const result = [];
  for (const name of readdirSync(directory).sort()) {
    const fullPath = path.join(directory, name);
    const relativePath = prefix ? path.join(prefix, name) : name;
    if (statSync(fullPath).isDirectory()) result.push(...listFiles(fullPath, relativePath));
    else result.push(relativePath.split(path.sep).join('/'));
  }
  return result;
}

function sha256(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

function serializedMcpConfig(platform) {
  return `${JSON.stringify(createMcpConfig(platform), null, 2)}\n`;
}

export function buildPackages(outputRoot = path.join(root, 'release', PLUGIN_VERSION)) {
  mkdirSync(outputRoot, { recursive: true });
  mkdirSync(fixtureDirectory, { recursive: true });
  const packages = [];

  // These fixture files are the canonical configs shared with app integration tests.
  for (const platform of ['macos', 'windows']) {
    writeFileSync(path.join(fixtureDirectory, `${platform}-mcp.json`), serializedMcpConfig(platform), 'utf8');
  }

  for (const platform of ['macos', 'windows']) {
    const platformDirectory = path.join(outputRoot, platform);
    const targetRoot = path.join(platformDirectory, 'vectora');
    const archivePath = path.join(platformDirectory, `Vectora-MCP-Skill-${PLUGIN_VERSION}-${platform}.zip`);
    mkdirSync(platformDirectory, { recursive: true });
    if (existsSync(targetRoot)) rmSync(targetRoot, { recursive: true, force: true });
    if (existsSync(archivePath)) rmSync(archivePath, { force: true });

    copyPlugin(targetRoot);
    const configPath = path.join(fixtureDirectory, `${platform}-mcp.json`);
    const configBytes = readFileSync(configPath);
    writeFileSync(path.join(targetRoot, '.mcp.json'), configBytes);
    execFileSync('zip', ['-qr', '-X', archivePath, 'vectora'], { cwd: platformDirectory });

    const files = listFiles(targetRoot);
    packages.push({
      platform,
      archive: path.relative(outputRoot, archivePath).split(path.sep).join('/'),
      bytes: statSync(archivePath).size,
      sha256: sha256(archivePath),
      mcpConfigSha256: createHash('sha256').update(configBytes).digest('hex'),
      packagedFiles: files.length,
      includedSkills: ['create-kice-illustration', 'use-vectora'],
    });
  }

  const manifest = {
    plugin: 'vectora',
    version: PLUGIN_VERSION,
    minimumVectoraVersion: '1.0.0',
    windowsMcpConfig: 'tests/fixtures/windows-mcp.json',
    windowsMcpConfigSha256: sha256(path.join(fixtureDirectory, 'windows-mcp.json')),
    packages,
  };
  writeFileSync(path.join(outputRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  writeFileSync(
    path.join(outputRoot, 'SHA256SUMS.txt'),
    `${packages.map((item) => `${item.sha256}  ${item.archive}`).join('\n')}\n`,
  );

  const macConfigPath = path.join(root, '.mcp.json');
  writeFileSync(macConfigPath, readFileSync(path.join(fixtureDirectory, 'macos-mcp.json')));
  return manifest;
}

const invokedPath = process.argv[1] && path.resolve(process.argv[1]);
if (invokedPath === fileURLToPath(import.meta.url)) {
  const outputRoot = process.argv[2] ? path.resolve(process.argv[2]) : undefined;
  const manifest = buildPackages(outputRoot);
  process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);
}
