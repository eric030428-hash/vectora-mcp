import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { CLAUDE_PACKAGE_VERSION, OUTPUT_ROOT } from '../scripts/build-claude-packages.mjs';
import { createLaunchSpec } from '../scripts/claude/claude-mcp-launcher.mjs';

const nodeExecutable = process.execPath;

function makeMacApp(parent) {
  const app = path.join(parent, 'Vectora — 테스트 위치.app');
  const contents = path.join(app, 'Contents');
  const executable = path.join(contents, 'MacOS', 'Vectora');
  mkdirSync(path.dirname(executable), { recursive: true });
  writeFileSync(path.join(contents, 'Info.plist'), '<?xml version="1.0"?><plist version="1.0"><dict><key>CFBundleShortVersionString</key><string>1.1.2</string></dict></plist>');
  writeFileSync(executable, '#!/bin/sh\nprintf "vectora-stdout:%s" "$1"\nprintf "vectora-stderr" >&2\n');
  chmodSync(executable, 0o755);
  return app;
}

test('Claude macOS launcher passes Unicode and spaced paths as a single shell argument', () => {
  const root = path.join(path.parse(process.cwd()).root, 'Vectora plugin 한글 경로 with spaces');
  const spec = createLaunchSpec('darwin', root);
  assert.equal(spec.command, '/bin/sh');
  assert.deepEqual(spec.args, [path.join(root, 'scripts', 'start-mcp.sh')]);
});

test('Claude Windows launcher passes PowerShell script path as one literal argument', () => {
  const root = path.join(path.parse(process.cwd()).root, 'Vectora plugin 한글 경로 with spaces');
  const spec = createLaunchSpec('win32', root, '');
  assert.equal(spec.command, 'powershell.exe');
  assert.deepEqual(spec.args.slice(0, 5), ['-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass']);
  assert.equal(spec.args[5], '-File');
  assert.equal(spec.args[6], path.join(root, 'scripts', 'start-mcp.ps1'));
  assert.match(spec.args[6], /한글 경로 with spaces/);
});

test('Claude launcher rejects platforms without a packaged app runner', () => {
  assert.throws(() => createLaunchSpec('linux', '/tmp/vectora'), /unsupported platform: linux/);
});

const packagedArchives = [
  path.join(OUTPUT_ROOT, 'desktop', `Vectora-Claude-Desktop-${CLAUDE_PACKAGE_VERSION}.mcpb`),
  path.join(OUTPUT_ROOT, 'claude-code', `Vectora-Claude-Code-${CLAUDE_PACKAGE_VERSION}.zip`),
];
const canExercisePackagedMacLaunchers = process.platform === 'darwin' && packagedArchives.every(existsSync);

test('extracted MCPB and Claude Code archives invoke the real colocated launcher and start-mcp script', {
  skip: canExercisePackagedMacLaunchers ? false : 'Build Claude packages on macOS before this archive-level smoke test.',
}, (t) => {
  const testRoot = mkdtempSync(path.join(os.tmpdir(), 'Vectora Claude 추출 경로 with spaces-'));
  t.after(() => rmSync(testRoot, { recursive: true, force: true }));
  const appPath = makeMacApp(testRoot);

  for (const archive of packagedArchives) {
    const extractedRoot = path.join(testRoot, path.basename(archive, path.extname(archive)));
    mkdirSync(extractedRoot, { recursive: true });
    execFileSync('unzip', ['-q', '-o', archive, '-d', extractedRoot]);

    const launcherPath = path.join(extractedRoot, 'scripts', 'claude', 'claude-mcp-launcher.mjs');
    const startScriptPath = path.join(extractedRoot, 'scripts', 'start-mcp.sh');
    assert.ok(existsSync(launcherPath), `missing extracted launcher in ${archive}`);
    assert.ok(existsSync(startScriptPath), `missing extracted start-mcp script in ${archive}`);

    const result = spawnSync(nodeExecutable, [launcherPath], {
      encoding: 'utf8',
      timeout: 5000,
      env: {
        ...process.env,
        VECTORA_APP_PATH: appPath,
        ELECTRON_RUN_AS_NODE: '1',
      },
    });
    const context = `${path.basename(archive)}: ${JSON.stringify({ status: result.status, error: result.error?.message, stdout: result.stdout, stderr: result.stderr })}`;
    assert.equal(result.status, 0, context);
    assert.equal(result.stdout, 'vectora-stdout:--mcp-stdio', context);
    assert.equal(result.stderr, 'vectora-stderr', context);
  }
});
