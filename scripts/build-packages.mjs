import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PLUGIN_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const PLUGIN_VERSION = JSON.parse(
  readFileSync(path.join(PLUGIN_ROOT, '.codex-plugin', 'plugin.json'), 'utf8'),
).version;

export function createMcpConfig(platform) {
  if (platform === 'macos') {
    const command = readFileSync(path.join(PLUGIN_ROOT, 'scripts', 'start-mcp.sh'), 'utf8').trimEnd();
    return {
      mcpServers: {
        vectora: {
          command: '/bin/sh',
          args: ['-c', command],
        },
      },
    };
  }

  if (platform === 'windows') {
    const command = readFileSync(path.join(PLUGIN_ROOT, 'scripts', 'start-mcp.ps1'), 'utf8').trimEnd();
    return {
      mcpServers: {
        vectora: {
          command: 'powershell.exe',
          args: ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', command],
        },
      },
    };
  }

  throw new Error(`Unsupported Vectora MCP platform: ${platform}`);
}

export function copyCodexPlugin(targetRoot, platform, { id, displayName }) {
  mkdirSync(targetRoot, { recursive: true });
  const extension = platform === 'macos' ? 'sh' : 'ps1';
  const entries = [
    '.codex-plugin/plugin.json',
    'README.md',
    'assets/vectora.png',
    'skills',
    'src/production/frames-core.mjs',
    'src/production/graphs-core.mjs',
    'src/production/graphs-points.mjs',
    `scripts/start-mcp.${extension}`,
    `scripts/configure-app.${extension}`,
  ];

  for (const name of entries) {
    const source = path.join(PLUGIN_ROOT, name);
    const destination = path.join(targetRoot, name);
    mkdirSync(path.dirname(destination), { recursive: true });
    cpSync(source, destination, {
      recursive: true,
      filter(sourcePath) {
        const relative = path.relative(PLUGIN_ROOT, sourcePath).split(path.sep).join('/');
        const segments = relative.split('/');
        const base = segments.at(-1) ?? '';
        return !segments.some((segment) => ['.git', 'node_modules', 'release', 'tests', '__pycache__'].includes(segment))
          && base !== '.DS_Store'
          && !base.endsWith('.pyc');
      },
    });
  }

  const manifestPath = path.join(targetRoot, '.codex-plugin', 'plugin.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  manifest.name = id;
  manifest.version = PLUGIN_VERSION;
  manifest.interface.displayName = displayName;
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  writeFileSync(path.join(targetRoot, '.mcp.json'), `${JSON.stringify(createMcpConfig(platform), null, 2)}\n`);
}
