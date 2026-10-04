import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { buildClaudePlugin } from '../scripts/build-claude-packages.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skill = path.join(repo, 'skills/create-kice-illustration');
const counts = { table:5, chart:8, graph:4, diagram:7, photo:1, illustration:3, map:7, dialogue:3, document:4, activity:2 };
// Exact approved leaf set: no custom names can replace a taxonomy leaf while keeping counts.
const approvedLeaves = {
  table:['flat','cross','nested','checklist','others'],
  chart:['bar','stacked-bar','pie','line','scatter','dot','radar','others'],
  graph:['curve','frontier','distribution','others'],
  diagram:['tree','network','flowchart','venn','timeline','schematic','others'],
  map:['location','area','statistics','flow','physical','projection','historical'],
  dialogue:['vertical','horizontal','presentation'],
  photo:['default'], illustration:['portrait','object','scene'], document:['newspaper','screen','paper','scroll'], activity:['board','worksheet'],
};
const types = Object.keys(counts).sort();
const read = rel => readFileSync(path.join(skill, rel), 'utf8');
const mdFiles = directory => readdirSync(directory).filter(x => x.endsWith('.md')).sort();
const oldRefs = /(?:common|people|real-data|vectora-contract|artwork-production|artwork-vectorization|freeform-illustrations|text-illustrations|text-builder|graph-builder|graph-illustrations|graph-venn-production|schematic-illustrations|dialogue-illustrations|map-(?:illustrations|template|production|layouts|location|area|statistics|flow|physical|projection|historical))\.md/;
function instructionLinks(rel) {
  const body = read(rel).replace(/```[\s\S]*?```/g, '');
  const links = [];
  for (const match of body.replace(/`[^`]*`/g, '').matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].replace(/^<|>$/g, '').split('#')[0];
    if (!target || /^[a-z]+:\/\//i.test(target)) continue;
    const resolved = path.resolve(skill, path.dirname(rel), target);
    assert.ok(resolved.startsWith(`${skill}${path.sep}`), `${rel}: outside-skill reference ${target}`);
    assert.ok(existsSync(resolved), `${rel}: missing link ${target}`);
    if (resolved.endsWith('.md')) links.push(path.relative(skill, resolved).split(path.sep).join('/'));
  }
  // A bare legacy filename must not silently reintroduce a fourth instruction read.
  assert.doesNotMatch(body, oldRefs, rel);
  return links;
}

test('canonical taxonomy has exactly ten parents and 44 existing approved leaves', t => {
  assert.deepEqual(mdFiles(path.join(skill, 'references')), [], 'superseded flat references must not be shipped');
  const parents = mdFiles(path.join(skill, 'references/types'));
  assert.deepEqual(parents, types.map(x => `${x}.md`));
  assert.deepEqual(readdirSync(path.join(skill, 'references/subtypes')).sort(), types);
  const leaves = [];
  for (const type of types) {
    const dir = path.join(skill, 'references/subtypes', type);
    const children = mdFiles(dir);
    assert.equal(children.length, counts[type], type);
    assert.deepEqual(children, approvedLeaves[type].map(x=>`${x}.md`).sort(), `${type}: unapproved taxonomy leaf`);
    assert.deepEqual(readdirSync(dir).sort(), children, `${type}: extra taxonomy file/directory`);
    if (counts[type] === 1) assert.deepEqual(children, ['default.md'], type);
    if (type === 'dialogue') assert.deepEqual(children, ['horizontal.md', 'presentation.md', 'vertical.md']);
    leaves.push(...children.map(x => `references/subtypes/${type}/${x}`));
  }
  assert.equal(leaves.length, 44);
  assert.equal(new Set(leaves).size, 44);
  const photo = read('references/subtypes/photo/default.md');
  assert.ok(photo.trim().length > 0, 'photo/default must not be empty');
  assert.match(photo, /부모 유형 문서 전체를 적용/);
  const photoParent = read('references/types/photo.md');
  assert.match(photoParent, /실제 원본을 이미지 개체로 유지/);
  assert.match(photoParent, /대체물로 생성하지 않는다/);
  assert.doesNotMatch(photo, /TODO|TBD|placeholder/i);
  const files = ['SKILL.md', ...parents.map(x=>`references/types/${x}`), ...leaves];
  const hash = createHash('sha256');
  for (const rel of files) hash.update(rel).update('\0').update(read(rel)).update('\0');
  t.diagnostic(`instruction source sha256=${hash.digest('hex')}; Node ${process.version}; ${process.platform}/${process.arch}`);
});

test('instruction links form only root -> selected type -> selected subtype', () => {
  const rootLinks = instructionLinks('SKILL.md');
  assert.deepEqual([...new Set(rootLinks)].sort(), types.map(x=>`references/types/${x}.md`));
  for (const type of types) {
    const parent = `references/types/${type}.md`;
    const expected = mdFiles(path.join(skill, 'references/subtypes', type)).map(x=>`references/subtypes/${type}/${x}`);
    assert.deepEqual([...new Set(instructionLinks(parent))].sort(), expected, parent);
    for (const leaf of expected) assert.deepEqual(instructionLinks(leaf), [], `${leaf}: fourth instruction edge`);
  }
});

test('global boundary, physical rules and both conditional style templates stay in first file', () => {
  const root = read('SKILL.md');
  assert.equal(root.split('<!-- VECTORA_CLIENT_BOUNDARY -->').length, 2);
  assert.equal(root.split('\n').filter(x=>x.trim()).length <= 230, true);
  for (const fragment of ['108mm', 'UNDv21-Regular', 'charSpacing:-60', 'frameBounds.heightMm', '1.5–2.5mm', '1.5–3mm', '2–3.5mm', '1–2mm', '0.8–1.5mm', 'STYLE CONTRACT: Draw a living human character', 'STYLE CONTRACT: Draw a clean grayscale', 'exact', 'approximate', 'scale:4', 'transparent:false']) assert.ok(root.includes(fragment), fragment);
  assert.match(root, /Photo[^\n]*原|Photo[^\n]*원본|원본 photo/i);
});

test('graph helper help is self-contained and no longer points at a removed reference', () => {
  const help = execFileSync(process.execPath, [path.join(skill, 'scripts/build_graph.mjs'), '--help'], {encoding:'utf8'});
  assert.doesNotMatch(help, oldRefs);
  for (const fragment of ['--spec', '--output', 'dataFidelity', 'series', 'domain', 'xValues', 'null gaps', '.layout.json', 'UNDv21-Regular']) assert.ok(help.includes(fragment), fragment);
});

test('Claude adapter inserts local MCP and missing-imagegen restrictions only in root', () => {
  const temporary = mkdtempSync(path.join(os.tmpdir(), 'vectora-kice-taxonomy-'));
  try {
    buildClaudePlugin(path.join(temporary, 'plugin'));
    const staged = path.join(temporary, 'plugin/skills/create-kice-illustration');
    const root = readFileSync(path.join(staged, 'SKILL.md'), 'utf8');
    assert.match(root, /Claude 로컬 실행 경계/);
    assert.match(root, /이미지 생성 모델을 포함하지 않는다/);
    assert.match(root, /일반 웹\/클라우드/);
    assert.match(root, /비최종 설계안/);
    assert.doesNotMatch(root, oldRefs);
    for (const type of types) {
      const rel = `references/types/${type}.md`;
      assert.equal(readFileSync(path.join(staged,rel),'utf8'), read(rel).replaceAll('node skills/create-kice-illustration/scripts/', 'node scripts/').replaceAll('python3 skills/create-kice-illustration/scripts/', 'python3 scripts/'));
    }
  } finally { rmSync(temporary, {recursive:true, force:true}); }
});
