import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { PLUGIN_ROOT, PLUGIN_VERSION } from '../scripts/build-packages.mjs';
import { OUTPUT_ROOT } from '../scripts/build-claude-packages.mjs';

const codexRoot = path.join(PLUGIN_ROOT, 'release', PLUGIN_VERSION);
const codex = JSON.parse(readFileSync(path.join(codexRoot, 'manifest.json'), 'utf8'));
const claude = JSON.parse(readFileSync(path.join(OUTPUT_ROOT, 'manifest.json'), 'utf8'));
const packages = [
  ...codex.packages.map((item) => ({ ...item, path: path.join(codexRoot, item.archive) })),
  ...claude.artifacts.map((item) => ({ ...item, path: path.join(OUTPUT_ROOT, item.file) })),
];
const entries = (archive) => execFileSync('unzip', ['-Z1', archive], { encoding: 'utf8' }).trim().split('\n');
const readEntry = (archive, entry) => execFileSync('unzip', ['-p', archive, entry]);
const jsonEntry = (archive, entry) => JSON.parse(readEntry(archive, entry));

test('seven release archives have valid CRCs, matching hashes and no native or Python cache files', () => {
  assert.equal(packages.length, 7);
  assert.equal(codex.version, PLUGIN_VERSION);
  assert.equal(claude.version, PLUGIN_VERSION);
  for (const item of packages) {
    execFileSync('unzip', ['-tqq', item.path]);
    const bytes = readFileSync(item.path);
    assert.equal(bytes.length, item.bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), item.sha256);
    for (const entry of entries(item.path)) {
      assert.doesNotMatch(entry, /(?:^|\/)\.\.(?:\/|$)|^\//, entry);
      assert.doesNotMatch(entry, /\.(?:node|so|dylib|dll|pyd|exe|o|a|lib|pyc|ttf|otf)$/i, entry);
      assert.doesNotMatch(entry, /(?:^|\/)(?:__pycache__|\.git)(?:\/|$)/, entry);
    }
  }
});

test('Codex archives contain only runtime files, the common guide and unchanged source skills', () => {
  const sourceSkills = execFileSync('git', ['ls-files', 'skills'], { cwd: PLUGIN_ROOT, encoding: 'utf8' }).trim().split('\n');
  for (const item of packages.filter((item) => item.platform)) {
    const archiveEntries = entries(item.path);
    const extension = item.platform === 'macos' ? 'sh' : 'ps1';
    const runtimeScripts = archiveEntries.filter((entry) => entry.startsWith('vectora/scripts/') && !entry.endsWith('/')).sort();
    assert.deepEqual(runtimeScripts, [`vectora/scripts/configure-app.${extension}`, `vectora/scripts/start-mcp.${extension}`]);
    assert.ok(archiveEntries.includes('vectora/CLAUDE_INSTALLATION.md'));
    assert.ok(!archiveEntries.some((entry) => /(?:build-.*packages|stage-release|AGENTS\.md|\/tests\/|\/scripts\/claude\/)/.test(entry)));
    assert.equal(jsonEntry(item.path, 'vectora/.codex-plugin/plugin.json').version, PLUGIN_VERSION);
    assert.equal(jsonEntry(item.path, 'vectora/.mcp.json').mcpServers.vectora.command, item.platform === 'macos' ? '/bin/sh' : 'powershell.exe');
    for (const file of sourceSkills) assert.deepEqual(readEntry(item.path, `vectora/${file}`), readFileSync(path.join(PLUGIN_ROOT, file)), file);
  }
});

test('Claude versions, pure Python wheel and assessment design rules survive each package layout', () => {
  const desktop = packages.find((item) => item.type === 'mcpb');
  assert.equal(jsonEntry(desktop.path, 'manifest.json').version, PLUGIN_VERSION);
  const layouts = [
    { item: packages.find((item) => item.type === 'claude-code-plugin'), plugin: '', skill: 'skills/create-kice-illustration/' },
    { item: packages.find((item) => item.type === 'claude-code-marketplace'), plugin: 'claude-code-marketplace/plugins/vectora/', skill: 'claude-code-marketplace/plugins/vectora/skills/create-kice-illustration/' },
    { item: packages.find((item) => item.skill === 'create-kice-illustration'), skill: 'create-kice-illustration/' },
  ];
  for (const { item, plugin, skill } of layouts) {
    if (plugin !== undefined) {
      assert.equal(jsonEntry(item.path, `${plugin}.claude-plugin/plugin.json`).version, PLUGIN_VERSION);
      assert.ok(entries(item.path).includes(`${plugin}CLAUDE_INSTALLATION.md`));
    }
    assert.match(readEntry(item.path, `${skill}vendor/python/fonttools-4.63.0.dist-info/WHEEL`).toString(), /^Tag: py3-none-any$/m);
    for (const name of ['common', 'dialogue-illustrations', 'freeform-illustrations', 'graph-illustrations', 'people', 'schematic-illustrations', 'text-illustrations']) {
      const source = readFileSync(path.join(PLUGIN_ROOT, 'skills/create-kice-illustration/references', `${name}.md`), 'utf8')
        .replaceAll('node skills/create-kice-illustration/scripts/', 'node scripts/')
        .replaceAll('python3 skills/create-kice-illustration/scripts/', 'python3 scripts/');
      assert.equal(readEntry(item.path, `${skill}references/${name}.md`).toString(), source, name);
    }
  }
});

test('extracted standalone helpers resolve their own modules and parse a font with only vendored Python', (t) => {
  const parent = path.join(PLUGIN_ROOT, 'release', 'validation');
  mkdirSync(parent, { recursive: true });
  const temporary = mkdtempSync(path.join(parent, '독립 스킬 경로 with spaces-'));
  t.after(() => rmSync(temporary, { recursive: true, force: true }));
  const archive = packages.find((item) => item.skill === 'create-kice-illustration').path;
  execFileSync('unzip', ['-q', archive, '-d', temporary]);
  const skill = path.join(temporary, 'create-kice-illustration');
  for (const name of ['build_text_frame.mjs', 'build_graph.mjs']) {
    const help = execFileSync(process.execPath, [path.join(skill, 'scripts', name), '--help'], { cwd: temporary, encoding: 'utf8' });
    assert.match(help, /--spec/);
  }
  execFileSync('python3', ['-I', '-S', '-B', path.join(skill, 'scripts/audit_svg.py'), '--help'], { cwd: temporary });
  const python = `import io, sys
sys.path.insert(0, sys.argv[1])
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont
glyphs = [".notdef", "A"]
builder = FontBuilder(1000, isTTF=True)
builder.setupGlyphOrder(glyphs)
builder.setupCharacterMap({65: "A"})
builder.setupGlyf({name: TTGlyphPen(None).glyph() for name in glyphs})
builder.setupHorizontalMetrics({name: (600, 0) for name in glyphs})
builder.setupHorizontalHeader(ascent=800, descent=-200)
builder.setupNameTable({"familyName": "PortableSmoke", "styleName": "Regular"})
builder.setupOS2(sTypoAscender=800, sTypoDescender=-200, usWinAscent=800, usWinDescent=200)
builder.setupPost()
builder.setupMaxp()
buffer = io.BytesIO()
builder.save(buffer)
buffer.seek(0)
assert TTFont(buffer).getBestCmap() == {65: "A"}
`;
  execFileSync('python3', ['-I', '-S', '-B', '-c', python, path.join(skill, 'vendor/python')], { cwd: temporary });
  const dependencies = "const { createRequire } = require('node:module'); const local = createRequire(process.argv[1]); for (const name of ['fontkit', 'imagetracerjs', 'jpeg-js', 'pngjs']) local(name);";
  execFileSync(process.execPath, ['-e', dependencies, path.join(skill, 'package.json')], { cwd: temporary });
});
