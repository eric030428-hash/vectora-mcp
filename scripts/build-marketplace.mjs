import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { copyPlugin, createMcpConfig, PLUGIN_ROOT, PLUGIN_VERSION } from './build-packages.mjs';

const MARKETPLACE_PATH = path.join(PLUGIN_ROOT, '.agents', 'plugins', 'marketplace.json');
const PLUGINS_ROOT = path.join(PLUGIN_ROOT, 'plugins');
const PLATFORMS = [
  { id: 'vectora-macos', platform: 'macos', displayName: 'Vectora (macOS)' },
  { id: 'vectora-windows', platform: 'windows', displayName: 'Vectora (Windows)' },
];

function marketplaceText() {
  return `${JSON.stringify({
    name: 'vectora',
    interface: { displayName: 'Vectora' },
    plugins: PLATFORMS.map(({ id }) => ({
      name: id,
      source: { source: 'local', path: `./plugins/${id}` },
      policy: { installation: 'AVAILABLE', authentication: 'ON_INSTALL' },
      category: 'Productivity',
    })),
  }, null, 2)}\n`;
}

function optionalStat(target) {
  try {
    return lstatSync(target);
  } catch (error) {
    if (error.code === 'ENOENT') return undefined;
    throw error;
  }
}

function requireDirectoryIfPresent(target) {
  const stat = optionalStat(target);
  if (stat && (!stat.isDirectory() || stat.isSymbolicLink())) {
    throw new Error(`Refusing to use non-directory or linked output path: ${target}`);
  }
}

function validateOutputLocations() {
  requireDirectoryIfPresent(PLUGINS_ROOT);
  requireDirectoryIfPresent(path.join(PLUGIN_ROOT, '.agents'));
  requireDirectoryIfPresent(path.dirname(MARKETPLACE_PATH));

  for (const { id } of PLATFORMS) {
    const target = path.join(PLUGINS_ROOT, id);
    const stat = optionalStat(target);
    if (!stat) continue;
    if (!stat.isDirectory() || stat.isSymbolicLink()) {
      throw new Error(`Refusing to replace non-directory or linked plugin output: ${target}`);
    }
    const manifestPath = path.join(target, '.codex-plugin', 'plugin.json');
    if (!existsSync(manifestPath)) {
      throw new Error(`Refusing to replace plugin output without its manifest: ${target}`);
    }
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    if (manifest.name !== id) {
      throw new Error(`Refusing to replace ${target}; its manifest name is '${manifest.name}'.`);
    }
  }

  const marketplaceStat = optionalStat(MARKETPLACE_PATH);
  if (marketplaceStat && (!marketplaceStat.isFile() || marketplaceStat.isSymbolicLink())) {
    throw new Error(`Refusing to replace non-file or linked marketplace path: ${MARKETPLACE_PATH}`);
  }
  if (marketplaceStat) {
    const current = JSON.parse(readFileSync(MARKETPLACE_PATH, 'utf8'));
    if (current.name !== 'vectora') {
      throw new Error(`Refusing to replace marketplace '${current.name}' at ${MARKETPLACE_PATH}.`);
    }
    const names = current.plugins?.map((entry) => entry?.name) ?? [];
    if (names.some((name) => !PLATFORMS.some(({ id }) => id === name)) || new Set(names).size !== names.length) {
      throw new Error(`Refusing to replace unexpected plugin entries in ${MARKETPLACE_PATH}.`);
    }
  }
}

function listFiles(directory, prefix = '') {
  const files = [];
  for (const name of readdirSync(directory).sort()) {
    const fullPath = path.join(directory, name);
    const relative = prefix ? `${prefix}/${name}` : name;
    const stat = lstatSync(fullPath);
    if (stat.isSymbolicLink()) throw new Error(`Generated marketplace trees cannot contain symlinks: ${fullPath}`);
    if (stat.isDirectory()) files.push(...listFiles(fullPath, relative));
    else if (stat.isFile()) files.push(relative);
    else throw new Error(`Unsupported generated filesystem entry: ${fullPath}`);
  }
  return files;
}

function treesMatch(actualRoot, expectedRoot) {
  const actualStat = optionalStat(actualRoot);
  if (!actualStat?.isDirectory() || actualStat.isSymbolicLink()) return false;
  let actualFiles;
  let expectedFiles;
  try {
    actualFiles = listFiles(actualRoot);
    expectedFiles = listFiles(expectedRoot);
  } catch {
    return false;
  }
  if (JSON.stringify(actualFiles) !== JSON.stringify(expectedFiles)) return false;
  return actualFiles.every((file) => readFileSync(path.join(actualRoot, file)).equals(readFileSync(path.join(expectedRoot, file))));
}

function stagePlugin(stageRoot, { id, platform, displayName }) {
  const targetRoot = path.join(stageRoot, id);
  copyPlugin(targetRoot, platform);

  const manifestPath = path.join(targetRoot, '.codex-plugin', 'plugin.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  manifest.name = id;
  manifest.version = PLUGIN_VERSION;
  manifest.interface.displayName = displayName;
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  writeFileSync(path.join(targetRoot, '.mcp.json'), `${JSON.stringify(createMcpConfig(platform), null, 2)}\n`);
  return targetRoot;
}

export function buildMarketplace({ check = false } = {}) {
  validateOutputLocations();
  const stageRoot = mkdtempSync(path.join(os.tmpdir(), 'vectora-marketplace-'));
  try {
    const staged = new Map(PLATFORMS.map((plugin) => [plugin.id, stagePlugin(stageRoot, plugin)]));
    const expectedMarketplace = marketplaceText();

    if (check) {
      const drift = [];
      for (const { id } of PLATFORMS) {
        if (!treesMatch(path.join(PLUGINS_ROOT, id), staged.get(id))) drift.push(`plugins/${id}`);
      }
      const marketplaceStat = optionalStat(MARKETPLACE_PATH);
      if (!marketplaceStat?.isFile() || marketplaceStat.isSymbolicLink()
        || !readFileSync(MARKETPLACE_PATH).equals(Buffer.from(expectedMarketplace))) {
        drift.push('.agents/plugins/marketplace.json');
      }
      if (drift.length) throw new Error(`Marketplace output is stale: ${drift.join(', ')}. Run node scripts/build-marketplace.mjs.`);
      return { checked: true, version: PLUGIN_VERSION, plugins: PLATFORMS.map(({ id }) => id) };
    }

    mkdirSync(PLUGINS_ROOT, { recursive: true });
    for (const { id } of PLATFORMS) {
      const target = path.join(PLUGINS_ROOT, id);
      rmSync(target, { recursive: true, force: true });
      cpSync(staged.get(id), target, { recursive: true });
    }
    mkdirSync(path.dirname(MARKETPLACE_PATH), { recursive: true });
    writeFileSync(MARKETPLACE_PATH, expectedMarketplace, 'utf8');
    return { checked: false, version: PLUGIN_VERSION, plugins: PLATFORMS.map(({ id }) => id) };
  } finally {
    rmSync(stageRoot, { recursive: true, force: true });
  }
}

const invokedPath = process.argv[1] && path.resolve(process.argv[1]);
if (invokedPath === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== '--check') || args.length > 1) {
    throw new Error('Usage: node scripts/build-marketplace.mjs [--check]');
  }
  const result = buildMarketplace({ check: args.includes('--check') });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
