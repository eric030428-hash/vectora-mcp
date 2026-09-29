import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PLUGIN_ROOT, PLUGIN_VERSION } from './build-packages.mjs';

const sha256 = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const writeJson = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

export function stageRelease() {
  const git = (...args) => execFileSync('git', args, { cwd: PLUGIN_ROOT, encoding: 'utf8' }).trim();
  assert.equal(git('status', '--porcelain'), '', 'Commit the reviewed source changes before staging a release.');
  assert.deepEqual(readFileSync(path.join(PLUGIN_ROOT, 'docs/CLAUDE_INSTALLATION.md')), readFileSync(path.join(PLUGIN_ROOT, 'CLAUDE_INSTALLATION.md')), 'Keep the app-linked source guide and release guide identical.');
  const codexRoot = path.join(PLUGIN_ROOT, 'release', PLUGIN_VERSION);
  const claudeRoot = path.join(PLUGIN_ROOT, 'release', 'claude', PLUGIN_VERSION);
  const codex = readJson(path.join(codexRoot, 'manifest.json'));
  const claude = readJson(path.join(claudeRoot, 'manifest.json'));
  assert.equal(codex.version, PLUGIN_VERSION);
  assert.equal(claude.sourcePluginVersion, PLUGIN_VERSION);
  const packages = [
    ...codex.packages.map((item) => ({ ...item, type: 'codex-plugin', source: path.join(codexRoot, item.archive), file: path.basename(item.archive) })),
    ...claude.artifacts.map((item) => ({ ...item, source: path.join(claudeRoot, item.file), file: path.basename(item.file) })),
  ];
  assert.equal(packages.length, 7, 'Expected two Codex and five Claude packages.');
  assert.equal(new Set(packages.map((item) => item.file)).size, 7, 'Release asset names must be unique.');
  const parent = path.join(PLUGIN_ROOT, 'release', 'staging');
  mkdirSync(parent, { recursive: true });
  const temporary = mkdtempSync(path.join(parent, '.vectora-'));
  const destination = path.join(parent, PLUGIN_VERSION);
  try {
    const artifacts = packages.map((item) => {
      assert.equal(sha256(item.source), item.sha256, `Hash mismatch: ${item.file}`);
      assert.equal(statSync(item.source).size, item.bytes, `Size mismatch: ${item.file}`);
      copyFileSync(item.source, path.join(temporary, item.file));
      return { type: item.type, ...(item.platform ? { platform: item.platform } : {}), ...(item.skill ? { skill: item.skill } : {}), file: item.file, bytes: item.bytes, sha256: item.sha256 };
    });
    writeJson(path.join(temporary, 'codex-manifest.json'), {
      ...codex,
      packages: codex.packages.map((item) => ({ ...item, archive: path.basename(item.archive) })),
    });
    writeJson(path.join(temporary, 'claude-manifest.json'), {
      ...claude,
      artifacts: claude.artifacts.map((item) => ({ ...item, file: path.basename(item.file) })),
    });
    const supportFiles = [
      ['README.md', 'README.md'],
      ['CLAUDE_INSTALLATION.md', 'CLAUDE_INSTALLATION.md'],
      ['RELEASE_NOTES.md', 'RELEASE_NOTES.md'],
      ['scripts/configure-app.sh', 'configure-app.sh'],
      ['scripts/configure-app.ps1', 'configure-app.ps1'],
    ];
    for (const [source, name] of supportFiles) copyFileSync(path.join(PLUGIN_ROOT, source), path.join(temporary, name));
    const supportNames = ['codex-manifest.json', 'claude-manifest.json', ...supportFiles.map(([, name]) => name)];
    const supportAssets = supportNames.map((file) => ({ file, bytes: statSync(path.join(temporary, file)).size, sha256: sha256(path.join(temporary, file)) }));
    const manifest = {
      plugin: 'vectora',
      version: PLUGIN_VERSION,
      sourceCommit: git('rev-parse', 'HEAD'),
      minimumVectoraVersion: codex.minimumVectoraVersion,
      artifacts,
      supportAssets,
    };
    writeJson(path.join(temporary, 'release-manifest.json'), manifest);
    const checksummed = [...artifacts, ...supportAssets, { file: 'release-manifest.json', sha256: sha256(path.join(temporary, 'release-manifest.json')) }];
    writeFileSync(path.join(temporary, 'SHA256SUMS.txt'), `${checksummed.sort((a, b) => a.file.localeCompare(b.file, 'en')).map((item) => `${item.sha256}  ${item.file}`).join('\n')}\n`);
    // Only this version's generated staging directory is replaced; old releases stay intact.
    rmSync(destination, { recursive: true, force: true });
    renameSync(temporary, destination);
    return { directory: destination, sourceCommit: manifest.sourceCommit, packages: artifacts.length, assets: checksummed.length + 1 };
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.stdout.write(`${JSON.stringify(stageRelease(), null, 2)}\n`);
}
