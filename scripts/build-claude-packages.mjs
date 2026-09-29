import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { copyFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourcePlugin = JSON.parse(readFileSync(path.join(root, '.codex-plugin', 'plugin.json'), 'utf8'));
export const CLAUDE_PACKAGE_VERSION = sourcePlugin.version;
export const OUTPUT_ROOT = path.join(root, 'release', 'claude', CLAUDE_PACKAGE_VERSION);
const MCPB_CLI = '@anthropic-ai/mcpb@2.1.2';
const NODE_SKILL_DEPENDENCIES = {
  'fontkit': '2.0.4',
  'imagetracerjs': '1.2.6',
  'jpeg-js': '0.4.4',
  'pngjs': '7.0.0',
};

function replaceExactlyOnce(value, before, after, label) {
  const first = value.indexOf(before);
  if (first < 0 || value.indexOf(before, first + before.length) >= 0) {
    throw new Error(`Expected one editable Claude-specific passage in ${label}.`);
  }
  return value.slice(0, first) + after + value.slice(first + before.length);
}

function updateFile(filePath, transform) {
  const before = readFileSync(filePath, 'utf8');
  const after = transform(before);
  if (after === before) throw new Error(`Claude adaptation did not change ${path.relative(root, filePath)}.`);
  writeFileSync(filePath, after);
}

function copySkillSource(name, targetRoot) {
  const source = path.join(root, 'skills', name);
  const target = path.join(targetRoot, name);
  cpSync(source, target, {
    recursive: true,
    filter(sourcePath) {
      const relative = path.relative(source, sourcePath).split(path.sep).join('/');
      return relative !== 'agents/openai.yaml' && !relative.startsWith('agents/openai.yaml/')
        && !relative.split('/').includes('__pycache__') && !relative.endsWith('.pyc');
    },
  });
  return target;
}

function adaptUseVectora(skillRoot) {
  const skillPath = path.join(skillRoot, 'SKILL.md');
  updateFile(skillPath, (value) => {
    value = replaceExactlyOnce(
      value,
      'description: "Vectora MCP로 벡터 그림을 만들고 SVG·AI/PDF·이미지를 열어 편집·추적·저장한다. 도형·경로·문자·부분 서식·양끝 화살표·그룹·레이어·대지를 다루거나 기존 그림을 변환할 때 사용한다. Computer Use 없이 작동한다. 평가원 스타일 요청에는 함께 제공된 create-kice-illustration 규칙도 적용한다."',
      'description: "Claude의 Vectora MCP로 벡터 그림을 편집하고 저장한다. SVG·AI/PDF·이미지 가져오기, 문자·도형·그래프·레이어 편집과 평가원 스타일 제작에 사용한다."',
      'use-vectora/SKILL.md frontmatter',
    );
    const introStart = '# Vectora로 벡터 편집\n\n';
    const introEnd = '\n## 연결과 단위';
    const start = value.indexOf(introStart);
    const end = value.indexOf(introEnd, start);
    if (start < 0 || end < 0) throw new Error('Could not locate the Vectora skill introduction.');
    const intro = `${introStart}Claude에서 현재 세션에 노출된 MCP 도구 목록을 확인하고 Vectora 도구를 사용한다. Claude Code 플러그인에서는 도구 이름에 플러그인 접두사가 붙을 수 있으므로 실제 목록의 이름을 그대로 호출한다. 화면 클릭이나 앱에 스크립트를 주입해 대체하지 않는다. MCP는 설치된 Vectora 1.0.0+의 실제 편집 엔진을 별도 세션에서 실행한다. 일반 앱 창의 미저장 문서는 MCP에 자동 연결되지 않는다. 파일을 저장한 뒤 \`vectora_open_document\` 도구를 찾아 열고 작업한다.\n\nClaude Desktop 스킬의 코드 실행 첨부 경로는 별도 작업공간일 수 있으므로 로컬 Vectora 앱이나 글꼴 파일을 읽을 수 있다고 가정하지 않는다. 현재 도구 목록에서 \`vectora_fonts\`, 노출된 경우 \`vectora_check_font\`·\`vectora_measure_text\`, 그리고 실제 스키마에 맞는 \`vectora_apply\`·\`vectora_import_svg\`를 우선 사용한다. SVG 문자열이나 data URL은 가져오기 스키마가 허용하는 형식일 때 전달한다. 코드 실행 첨부 경로를 Vectora 저장 경로로 재사용하지 말고 사용자가 지정한 실제 로컬 경로를 쓴다. Claude Code 로컬 플러그인에서는 번들된 보조 스크립트를 사용할 수 있다.\n\n현재 세션에 Vectora MCP가 보이지 않으면 연결된 것으로 간주하지 않는다. Claude 웹 채팅/클라우드 세션에는 이 로컬 실행기가 연결되지 않으므로 최종 Vectora 저장·재열기를 주장하지 말고, 사용자가 로컬 MCP를 쓸 수 있는 Claude Desktop 또는 Claude Code에서 이어가도록 안내한다.${introEnd}`;
    value = value.slice(0, start) + intro + value.slice(end + introEnd.length);
    value = value.replaceAll('이 Mac의 절대 경로', '현재 컴퓨터의 절대 경로');
    value = value.replace('설치 방법은 플러그인 루트 `README.md`와 앱 프로젝트의 `docs/MCP_INSTALLATION.md`를 참고한다.', '설치 방법은 배포 패키지의 `CLAUDE_INSTALLATION.md`를 참고한다.');
    value = replaceExactlyOnce(
      value,
      '- Windows에서 MCP 실행기는 Windows PowerShell 기본 `powershell.exe`와 설치된 `Vectora.exe`를 사용한다. Node.js/Python 런타임은 필요하지 않다. 앱 경로 우선순위는 `VECTORA_APP_PATH`, `%APPDATA%\\Vectora\\mcp-app-path`, `%LOCALAPPDATA%\\Programs\\Vectora\\Vectora.exe`, `%ProgramFiles%\\Vectora\\Vectora.exe`, `%ProgramFiles(x86)%\\Vectora\\Vectora.exe`다. 사용자 지정 경로는 `scripts/configure-app.ps1 -AppPath <Vectora.exe 절대 경로>`로 저장한다. macOS는 `scripts/configure-app.sh <Vectora.app 절대 경로>` 또는 Applications 기본 위치를 사용한다.',
      '- Claude Desktop과 Claude Code의 Vectora MCP는 이 컴퓨터에 설치된 앱을 실행한다. 기본 설치 위치에서 앱을 찾지 못하면 배포 안내 `CLAUDE_INSTALLATION.md`의 앱 경로 등록 단계를 따른다. 스킬 ZIP만 올린 Claude 웹 세션에는 로컬 MCP 실행기가 없으므로 이 지침으로 앱에 연결할 수 없다.',
      'use-vectora local app setup guidance',
    );
    return value;
  });

  const examplesPath = path.join(skillRoot, 'references', 'examples.md');
  updateFile(examplesPath, (value) => replaceExactlyOnce(
    value,
    '앱 안에서 경로를 자동 탐색하는 것은 Codex 플러그인의 Windows 실행기 기능이다. 다른 MCP 클라이언트는 앱 실행 파일을 직접 등록하고 `--mcp-stdio`를 인자로 전달해야 한다.',
    'Claude용 실행기는 Windows에서 PowerShell 경로를 안전하게 전달하고 Vectora.exe와 로컬 MCP 연결을 중계한다. 사용자는 실행 파일을 직접 MCP 설정에 넣지 않는다.',
    'use-vectora/references/examples.md',
  ));

}

function adaptCreateKice(skillRoot) {
  const skillPath = path.join(skillRoot, 'SKILL.md');
  updateFile(skillPath, (value) => {
    value = replaceExactlyOnce(
      value,
      'description: "사용자의 설명으로 Vectora용 편집 가능한 평가원 스타일 일러스트를 제작·수정한다. 인물·삽화 원화와 벡터 조판을 함께 사용한다. 텍스트 배경, 그래프, 모식도, 대화·발표, 얼굴·흉상, 삽화 요청에 사용한다. 공통 원칙과 필요한 유형의 원칙만 읽고 새로 구성한다. 문항 출제·정답 풀이는 범위 밖이며 지도 제작 방식은 보류한다."',
      'description: "Vectora에서 평가원 스타일 일러스트를 만들고 수정한다. 텍스트·그래프·모식도·대화·인물·삽화 제작에 쓰며 공통 원칙과 해당 유형 지침을 적용한다."',
      'create-kice-illustration/SKILL.md frontmatter',
    );
    const anchor = '문자·말풍선·그래프·모식도·레이아웃은 편집 가능한 벡터로 분리한다. 전체가 벡터여야 한다는 요청이나 그림 내부 경로 편집이 필요한 경우에만 원화를 벡터화한다.\n';
    const addition = `${anchor}\nClaude에서 작업하기 전에 현재 노출된 MCP 도구 목록에서 Vectora 연결을 확인하고 실제 도구 이름과 입력 스키마를 따른다. Vectora MCP가 보이지 않는 Claude 웹/클라우드 세션에서는 이 지침으로 설계 설명이나 비최종 초안만 준비할 수 있다. Claude Desktop 스킬의 코드 실행 첨부 경로는 로컬 앱·글꼴 경로와 별개일 수 있으므로 로컬 파일 접근을 가정하지 않는다. 노출된 \`vectora_fonts\`와 \`vectora_check_font\`·\`vectora_measure_text\`, 실제 스키마에 맞는 \`vectora_apply\`·\`vectora_import_svg\`를 우선 사용하고, SVG 문자열/data URL 입력은 가져오기 스키마가 허용할 때만 전달한다. 첨부 경로를 로컬 저장 경로로 쓰지 말고 사용자가 지정한 실제 경로에 저장한다. Claude Code 로컬 플러그인에서는 번들된 보조 스크립트를 실행할 수 있다. MCP가 연결되지 않은 경우에는 로컬 Vectora 편집, 저장, 재열기를 수행했다고 주장하지 말고 Claude Desktop 또는 로컬 Claude Code에서 연결한 뒤 완료한다. 평가원 시각·조판 규칙은 아래 원칙 그대로 적용한다.\n`;
    const imageCapability = '\n이 패키지는 Vectora 편집 엔진과 제작 지침을 제공하며 이미지 생성 모델을 포함하지 않는다. 인물·삽화의 새 원화가 필요하면 현재 Claude 세션에서 실제 사용할 수 있는 이미지 생성 도구를 먼저 확인한다. 해당 도구가 없으면 생성용 지시와 벡터 조판을 준비하고 사용자에게 필요한 원화를 요청한다. 다른 화풍의 임시 인물이나 과거 예시를 넣어 완성했다고 보고하지 않는다.\n';
    return replaceExactlyOnce(value, anchor, addition + imageCapability, 'create-kice-illustration/SKILL.md');
  });

  const contractPath = path.join(skillRoot, 'references', 'vectora-contract.md');
  updateFile(contractPath, (value) => {
    value = replaceExactlyOnce(
      value,
      '실제 제작할 때만 읽는다. 스타일 원칙은 공통/유형 문서에 있으므로 여기서 다시 정의하지 않는다. 저장소에는 stdio MCP가 구현되어 있지만 현재 세션에 연결되었는지는 도구 조회로 확인한다. 새 기능 설계안이나 도판 라이브러리는 생성 지침이 아니다.',
      '실제 제작할 때만 읽는다. 스타일 원칙은 공통/유형 문서에 있으므로 여기서 다시 정의하지 않는다. 현재 세션의 MCP 도구 목록에서 Vectora stdio MCP가 연결되었는지 확인한다. Claude 웹/클라우드 세션에 로컬 Vectora가 자동 연결된다고 가정하지 않는다. 새 기능 설계안이나 도판 라이브러리는 생성 지침이 아니다.',
      'create-kice-illustration/references/vectora-contract.md',
    );
    value = replaceExactlyOnce(
      value,
      '- 도구가 연결되지 않았으면 벡터 SVG를 직접 만들고 사용할 수 있는 실제 Editor 경로로 검사한다. 파일 생성만 했으면 앱 저장/재열기 검증을 완료했다고 말하지 않는다. 스킬 작업 중 앱 기능 개발이나 외부 모델 연결로 범위를 넓히지 않는다.',
      '- 도구가 연결되지 않았으면 Claude 웹/클라우드에서는 비최종 설계안만 준비하고 저장·재열기를 완료했다고 말하지 않는다. 로컬 세션에서 실제 Editor를 사용할 수 있을 때만 직접 SVG 경로로 검수한다. 스킬 작업 중 앱 기능 개발이나 외부 모델 연결로 범위를 넓히지 않는다.',
      'create-kice-illustration/references/vectora-contract.md execution boundary',
    );
    value = value.replace(
      '- `vectora_new_document` 또는 별도 문서의 `vectora_open_document` → `vectora_apply`/`vectora_import_svg` → `vectora_inspect` → `vectora_preview` → `vectora_save`/`vectora_export`를 사용한다. 현재 MCP 문서는 일반 UI 탭과 독립 세션이다.',
      '- Claude에서 현재 MCP 도구 목록으로 정확한 도구 이름을 확인한 뒤 `vectora_new_document` 또는 `vectora_open_document` → `vectora_apply`/`vectora_import_svg` → `vectora_inspect` → `vectora_preview` → `vectora_save`/`vectora_export`의 해당 호출을 한다. 현재 MCP 문서는 일반 UI 탭과 독립 세션이다.\n- 글꼴 목록은 실제 글꼴 목록 도구인 `vectora_fonts`로 확인하고, `vectora_check_font`가 노출되어 있으면 출력할 전체 문장도 검사한다.\n- 새 문서의 실제 도구 스키마에 `colorMode`가 있을 때만 사용한다. 해당 필드가 있고 사용자가 RGB를 요구하지 않았다면 기본 `cmyk`, RGB 요청이면 `rgb`를 보낸다.\n- 열기/가져오기 도구 스키마에 `fontReplacements`가 있을 때만 `{"원본 글꼴명":"설치 글꼴명"}` 매핑을 전달한다. `MISSING_FONTS` 오류의 목록을 읽고 `vectora_fonts`로 설치 글꼴을 확인한 뒤 명시적으로 선택한 매핑으로 재시도한다. 평가원 제작의 UND폰트v2.1은 사용자 승인 없이 다른 글꼴로 바꾸지 않는다.\n- 새 가로·세로 문자 기본 자간은 `-60`(1/1000 em)이다. 생성 스키마에 `charSpacing`이 있으면 `-60`을 전달하고, 측정 도구가 있으면 같은 자간으로 측정한다.');
    return value;
  });
}

function stageSkill(name, stagingRoot, { standalone }) {
  const skillRoot = copySkillSource(name, stagingRoot);
  if (name === 'use-vectora') adaptUseVectora(skillRoot);
  else if (name === 'create-kice-illustration') adaptCreateKice(skillRoot);
  else throw new Error(`Unexpected skill: ${name}`);
  if (standalone) {
    for (const relative of listFiles(skillRoot).filter((file) => file.endsWith('.md'))) {
      const filePath = path.join(skillRoot, relative);
      const before = readFileSync(filePath, 'utf8');
      const after = before
        .replaceAll('node skills/create-kice-illustration/scripts/', 'node scripts/')
        .replaceAll('python3 skills/create-kice-illustration/scripts/', 'python3 scripts/');
      if (after !== before) writeFileSync(filePath, after);
    }
  }
  return skillRoot;
}

function addProductionSources(skillRoot) {
  const productionRoot = path.join(skillRoot, 'scripts', 'production');
  mkdirSync(productionRoot, { recursive: true });
  for (const filename of ['frames-core.mjs', 'graphs-core.mjs', 'graphs-points.mjs']) {
    cpSync(path.join(root, 'src', 'production', filename), path.join(productionRoot, filename));
  }
  const graphBuilder = path.join(skillRoot, 'scripts', 'build_graph.mjs');
  updateFile(graphBuilder, (value) => {
    value = replaceExactlyOnce(value, "'../../../src/production/graphs-core.mjs'", "'./production/graphs-core.mjs'", 'build_graph.mjs source import');
    const oldFontSearch = `export function findFont(explicit){
  if(explicit)return explicit;
  const dir=path.join(os.homedir(),'Library/Fonts');
  const file=fs.existsSync(dir)&&fs.readdirSync(dir).find(n=>n.includes('UND')&&n.includes('Regular')&&n.endsWith('.ttf'));
  check(file,'Installed UND Regular font not found. Supply --font; no fallback is used.');
  return path.join(dir,file);
}`;
    const newFontSearch = `export function findFont(explicit){
  if(explicit)return explicit;
  const directories=[
    path.join(os.homedir(),'Library','Fonts'),
    path.join(os.homedir(),'AppData','Local','Microsoft','Windows','Fonts'),
    path.join(process.env.WINDIR||'C:\\\\Windows','Fonts'),
  ];
  for(const dir of directories){
    const file=fs.existsSync(dir)&&fs.readdirSync(dir).find(n=>n.includes('UND')&&n.includes('Regular')&&n.endsWith('.ttf'));
    if(file)return path.join(dir,file);
  }
  throw new Error('Installed UND Regular font not found. Supply --font; no fallback is used.');
}`;
    value = replaceExactlyOnce(value, oldFontSearch, newFontSearch, 'build_graph.mjs font lookup');
    return value;
  });
  const frameBuilder = path.join(skillRoot, 'scripts', 'build_text_frame.mjs');
  updateFile(frameBuilder, (value) => replaceExactlyOnce(
    value,
    "'../../../src/production/frames-core.mjs'",
    "'./production/frames-core.mjs'",
    'build_text_frame.mjs source import',
  ));
  cpSync(path.join(root, 'scripts', 'claude', 'trace_artwork.mjs'), path.join(skillRoot, 'scripts', 'trace_artwork.mjs'));
  const auditPath = path.join(skillRoot, 'scripts', 'audit_svg.py');
  updateFile(auditPath, (value) => {
    value = replaceExactlyOnce(
      value,
      'from pathlib import Path\n',
      "from pathlib import Path\nsys.path.insert(0, str(Path(__file__).resolve().parent.parent / 'vendor' / 'python'))\n",
      'audit_svg.py bundled Python dependency path',
    );
    value = replaceExactlyOnce(
      value,
      "import argparse,base64,binascii,json,sys,unicodedata\n",
      "import argparse,base64,binascii,json,os,sys,unicodedata\n",
      'audit_svg.py portable font search import',
    );
    return replaceExactlyOnce(
      value,
      " font=a.font or next((x for x in (Path.home()/'Library/Fonts').glob('*Regular.ttf') if 'UND' in x.name),None)\n",
      " font_dirs=[Path.home()/'Library'/'Fonts',Path.home()/'AppData'/'Local'/'Microsoft'/'Windows'/'Fonts',Path(os.environ.get('WINDIR','C:/Windows'))/'Fonts',Path('/usr/share/fonts'),Path('/usr/local/share/fonts')]\n font=a.font or next((x for base in font_dirs if base.exists() for x in base.rglob('*Regular.ttf') if 'UND' in x.name),None)\n",
      'audit_svg.py cross-platform installed font lookup',
    );
  });
}

function installSkillDependencies(skillRoot) {
  writeFileSync(path.join(skillRoot, 'package.json'), `${JSON.stringify({
    name: 'vectora-kice-skill-runtime',
    private: true,
    type: 'module',
    dependencies: NODE_SKILL_DEPENDENCIES,
  }, null, 2)}\n`);
  execFileSync('npm', ['install', '--omit=dev', '--no-audit', '--no-fund'], { cwd: skillRoot, stdio: 'inherit' });
  const pythonVendor = path.join(skillRoot, 'vendor', 'python');
  mkdirSync(pythonVendor, { recursive: true });
  execFileSync('python3', [
    '-m', 'pip', 'install', '--disable-pip-version-check', '--no-warn-script-location', '--no-compile',
    '--only-binary=:all:', '--no-deps', '--platform', 'any', '--implementation', 'py',
    '--abi', 'none', '--python-version', '3.10', '--target', pythonVendor,
    'fonttools==4.63.0',
  ], { stdio: 'inherit' });
  assertPortableFontTools(pythonVendor);
  assertNoNativeBinaries(skillRoot, 'standalone Claude KICE skill');
  execFileSync('python3', ['-B', '-c', "import sys; sys.path.insert(0, sys.argv[1]); from fontTools.ttLib import TTFont; assert callable(TTFont.getBestCmap)", pythonVendor], { stdio: 'inherit' });
}

function copyLauncherScripts(targetRoot) {
  const scriptsRoot = path.join(targetRoot, 'scripts');
  mkdirSync(scriptsRoot, { recursive: true });
  for (const filename of ['start-mcp.sh', 'start-mcp.ps1']) {
    let value = readFileSync(path.join(root, 'scripts', filename), 'utf8');
    value = value.replaceAll('Codex still sees stdio.', 'The MCP client still uses standard input and output.');
    writeFileSync(path.join(scriptsRoot, filename), value);
  }
  const claudeScriptsRoot = path.join(scriptsRoot, 'claude');
  mkdirSync(claudeScriptsRoot, { recursive: true });
  cpSync(path.join(root, 'scripts', 'claude', 'claude-mcp-launcher.mjs'), path.join(claudeScriptsRoot, 'claude-mcp-launcher.mjs'));
}

function listFiles(directory, prefix = '') {
  const result = [];
  for (const name of readdirSync(directory).sort()) {
    const fullPath = path.join(directory, name);
    const relativePath = prefix ? `${prefix}/${name}` : name;
    if (statSync(fullPath).isDirectory()) result.push(...listFiles(fullPath, relativePath));
    else result.push(relativePath.split(path.sep).join('/'));
  }
  return result;
}

const nativeBinarySuffix = /\.(?:node|so|dylib|dll|pyd|exe|o|a|lib)$/i;

function assertNoNativeBinaries(directory, label) {
  const nativeFiles = listFiles(directory).filter((file) => nativeBinarySuffix.test(file));
  if (nativeFiles.length) throw new Error(`${label} contains non-portable native binaries: ${nativeFiles.join(', ')}`);
}

function assertArchiveHasNoNativeBinaries(archivePath) {
  const entries = execFileSync('unzip', ['-Z1', archivePath], { encoding: 'utf8' }).split(/\r?\n/).filter(Boolean);
  const nativeFiles = entries.filter((entry) => nativeBinarySuffix.test(entry));
  if (nativeFiles.length) throw new Error(`${path.basename(archivePath)} contains non-portable native binaries: ${nativeFiles.join(', ')}`);
}

function assertPortableFontTools(pythonVendor) {
  const wheelMetadata = listFiles(pythonVendor).filter((file) => /^fonttools-[^/]+\.dist-info\/WHEEL$/i.test(file));
  if (wheelMetadata.length !== 1) throw new Error(`Expected one vendored fontTools WHEEL record; found ${wheelMetadata.length}.`);
  const wheelRecord = readFileSync(path.join(pythonVendor, wheelMetadata[0]), 'utf8');
  if (!/^Tag: py3-none-any$/m.test(wheelRecord)) throw new Error('fontTools must be installed from a py3-none-any wheel.');
  assertNoNativeBinaries(pythonVendor, 'vendored fontTools');
}

function sha256(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

function makeMcpb(bundleRoot, archivePath) {
  const manifest = {
    manifest_version: '0.3',
    name: 'vectora',
    version: CLAUDE_PACKAGE_VERSION,
    display_name: 'Vectora',
    description: 'Connect Claude Desktop and Claude Code to the local Vectora vector editor over MCP.',
    long_description: 'Uses the installed Vectora desktop application as a local stdio MCP server. The Vectora application must be installed separately.',
    author: { name: 'Vectora' },
    icon: 'assets/vectora.png',
    server: {
      type: 'node',
      entry_point: 'scripts/claude/claude-mcp-launcher.mjs',
      mcp_config: {
        command: 'node',
        args: ['${__dirname}/scripts/claude/claude-mcp-launcher.mjs'],
        env: {},
      },
    },
    tools_generated: true,
    keywords: ['vector', 'svg', 'illustration', 'MCP', 'Vectora'],
    compatibility: {
      platforms: ['darwin', 'win32'],
      runtimes: { node: '>=18' },
    },
  };
  writeFileSync(path.join(bundleRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  execFileSync('npx', ['--yes', MCPB_CLI, 'validate', path.join(bundleRoot, 'manifest.json')], { cwd: root, stdio: 'inherit' });
  execFileSync('npx', ['--yes', MCPB_CLI, 'pack', bundleRoot, archivePath], { cwd: root, stdio: 'inherit' });
  return manifest;
}

export function buildClaudePackages(outputRoot = OUTPUT_ROOT) {
  const tempRoot = mkdtempSync(path.join(os.tmpdir(), 'vectora-claude-packages-'));
  const stagedArchivesRoot = path.join(tempRoot, 'archives');
  const desktopRoot = path.join(tempRoot, 'desktop-extension');
  const codeRoot = path.join(tempRoot, 'claude-code-plugin');
  const marketplaceRoot = path.join(tempRoot, 'claude-code-marketplace');
  const skillsRoot = path.join(tempRoot, 'standalone-skills');
  const output = path.resolve(outputRoot);
  mkdirSync(output, { recursive: true });
  mkdirSync(stagedArchivesRoot, { recursive: true });
  try {
    const useSkill = stageSkill('use-vectora', skillsRoot, { standalone: true });
    const kiceSkill = stageSkill('create-kice-illustration', skillsRoot, { standalone: true });
    addProductionSources(kiceSkill);
    installSkillDependencies(kiceSkill);

    mkdirSync(desktopRoot, { recursive: true });
    copyLauncherScripts(desktopRoot);
    cpSync(path.join(root, 'assets', 'vectora.png'), path.join(mkdirSync(path.join(desktopRoot, 'assets'), { recursive: true }) && path.join(desktopRoot, 'assets'), 'vectora.png'));
    writeFileSync(path.join(desktopRoot, '.mcpbignore'), '.DS_Store\n.git\nnode_modules\n');

    mkdirSync(codeRoot, { recursive: true });
    mkdirSync(path.join(codeRoot, '.claude-plugin'), { recursive: true });
    writeFileSync(path.join(codeRoot, '.claude-plugin', 'plugin.json'), `${JSON.stringify({
      name: 'vectora',
      version: CLAUDE_PACKAGE_VERSION,
      description: 'Local Vectora MCP tools and Korean assessment-style illustration skills for Claude Code.',
      author: { name: 'Vectora' },
    }, null, 2)}\n`);
    writeFileSync(path.join(codeRoot, '.mcp.json'), `${JSON.stringify({
      mcpServers: {
        vectora: {
          type: 'stdio',
          command: 'node',
          args: ['${CLAUDE_PLUGIN_ROOT}/scripts/claude/claude-mcp-launcher.mjs'],
        },
      },
    }, null, 2)}\n`);
    copyLauncherScripts(codeRoot);
    mkdirSync(path.join(codeRoot, 'skills'), { recursive: true });
    cpSync(useSkill, path.join(codeRoot, 'skills', 'use-vectora'), { recursive: true });
    cpSync(kiceSkill, path.join(codeRoot, 'skills', 'create-kice-illustration'), { recursive: true });
    writeFileSync(path.join(codeRoot, 'README.md'), '# Vectora for Claude Code\n\nThis plugin provides the local Vectora MCP server and two Korean skills. Vectora must be installed on this computer. The local MCP server is unavailable to Claude web/cloud sessions. See the accompanying `CLAUDE_INSTALLATION.md` for setup and platform notes.\n');
    cpSync(path.join(root, 'CLAUDE_INSTALLATION.md'), path.join(codeRoot, 'CLAUDE_INSTALLATION.md'));

    mkdirSync(path.join(marketplaceRoot, '.claude-plugin'), { recursive: true });
    mkdirSync(path.join(marketplaceRoot, 'plugins'), { recursive: true });
    cpSync(codeRoot, path.join(marketplaceRoot, 'plugins', 'vectora'), { recursive: true });
    writeFileSync(path.join(marketplaceRoot, '.claude-plugin', 'marketplace.json'), `${JSON.stringify({
      name: 'vectora-local',
      description: 'Local Claude Code marketplace for the Vectora MCP plugin.',
      owner: { name: 'Vectora' },
      plugins: [{
        name: 'vectora',
        source: './plugins/vectora',
        description: 'Local Vectora MCP tools and Korean assessment-style illustration skills for Claude Code.',
        version: CLAUDE_PACKAGE_VERSION,
      }],
    }, null, 2)}\n`);

    const outputDesktop = path.join(output, 'desktop');
    const outputCode = path.join(output, 'claude-code');
    const outputSkills = path.join(output, 'skills');
    mkdirSync(outputDesktop, { recursive: true });
    mkdirSync(outputCode, { recursive: true });
    mkdirSync(outputSkills, { recursive: true });
    const mcpbPath = path.join(outputDesktop, `Vectora-Claude-Desktop-${CLAUDE_PACKAGE_VERSION}.mcpb`);
    const codeZip = path.join(outputCode, `Vectora-Claude-Code-${CLAUDE_PACKAGE_VERSION}.zip`);
    const marketplaceZip = path.join(outputCode, `Vectora-Claude-Code-Marketplace-${CLAUDE_PACKAGE_VERSION}.zip`);
    const stagedMcpbPath = path.join(stagedArchivesRoot, path.basename(mcpbPath));
    const stagedCodeZip = path.join(stagedArchivesRoot, path.basename(codeZip));
    const stagedMarketplaceZip = path.join(stagedArchivesRoot, path.basename(marketplaceZip));
    const standaloneZips = [
      { name: 'use-vectora', source: useSkill, file: path.join(outputSkills, `use-vectora-${CLAUDE_PACKAGE_VERSION}.zip`), stagedFile: path.join(stagedArchivesRoot, `use-vectora-${CLAUDE_PACKAGE_VERSION}.zip`) },
      { name: 'create-kice-illustration', source: kiceSkill, file: path.join(outputSkills, `create-kice-illustration-${CLAUDE_PACKAGE_VERSION}.zip`), stagedFile: path.join(stagedArchivesRoot, `create-kice-illustration-${CLAUDE_PACKAGE_VERSION}.zip`) },
    ];
    const bundleManifest = makeMcpb(desktopRoot, stagedMcpbPath);

    execFileSync('zip', ['-qr', '-X', stagedCodeZip, '.'], { cwd: codeRoot, stdio: 'inherit' });
    execFileSync('zip', ['-qr', '-X', stagedMarketplaceZip, 'claude-code-marketplace'], { cwd: tempRoot, stdio: 'inherit' });
    for (const item of standaloneZips) {
      execFileSync('zip', ['-qr', '-X', item.stagedFile, item.name], { cwd: skillsRoot, stdio: 'inherit' });
    }
    for (const archive of [stagedMcpbPath, stagedCodeZip, stagedMarketplaceZip, ...standaloneZips.map((item) => item.stagedFile)]) {
      assertArchiveHasNoNativeBinaries(archive);
    }

    for (const [staged, target] of [
      [stagedMcpbPath, mcpbPath],
      [stagedCodeZip, codeZip],
      [stagedMarketplaceZip, marketplaceZip],
      ...standaloneZips.map((item) => [item.stagedFile, item.file]),
    ]) copyFileSync(staged, target);

    const utilityRoot = path.join(output, 'utilities');
    mkdirSync(utilityRoot, { recursive: true });
    cpSync(path.join(root, 'scripts', 'configure-app.sh'), path.join(utilityRoot, 'configure-app.sh'));
    cpSync(path.join(root, 'scripts', 'configure-app.ps1'), path.join(utilityRoot, 'configure-app.ps1'));
    cpSync(path.join(root, 'CLAUDE_INSTALLATION.md'), path.join(output, 'CLAUDE_INSTALLATION.md'));
    for (const [source, destination] of [
      [desktopRoot, path.join(outputDesktop, 'extension')],
      [codeRoot, path.join(outputCode, 'vectora')],
      [marketplaceRoot, path.join(outputCode, 'marketplace')],
    ]) {
      rmSync(destination, { recursive: true, force: true });
      cpSync(source, destination, { recursive: true });
    }

    const artifacts = [
      { type: 'mcpb', file: path.relative(output, mcpbPath).split(path.sep).join('/'), bytes: statSync(mcpbPath).size, sha256: sha256(mcpbPath), entryPoint: bundleManifest.server.entry_point },
      { type: 'claude-code-plugin', file: path.relative(output, codeZip).split(path.sep).join('/'), bytes: statSync(codeZip).size, sha256: sha256(codeZip), packagedFiles: listFiles(codeRoot).length },
      { type: 'claude-code-marketplace', file: path.relative(output, marketplaceZip).split(path.sep).join('/'), bytes: statSync(marketplaceZip).size, sha256: sha256(marketplaceZip), packagedFiles: listFiles(marketplaceRoot).length },
      ...standaloneZips.map((item) => ({ type: 'skill-zip', skill: item.name, file: path.relative(output, item.file).split(path.sep).join('/'), bytes: statSync(item.file).size, sha256: sha256(item.file), packagedFiles: listFiles(item.source).length })),
    ];
    const result = {
      plugin: 'vectora',
      sourcePluginVersion: sourcePlugin.version,
      version: CLAUDE_PACKAGE_VERSION,
      artifacts,
      runtimeNotes: {
        desktopExtension: 'Local stdio MCP; Claude Desktop provides its Node runtime.',
        claudeCodePlugin: 'Local stdio MCP plus bundled skill helpers; install persistently from the included local marketplace, or load the unpacked plugin folder for one session.',
        webSkills: 'Skill instructions only; cannot connect to the local Vectora process.',
        conditionalAppFeatures: 'Use colorMode and fontReplacements only when the live tools/list input schema exposes them.',
      },
    };
    writeFileSync(path.join(output, 'manifest.json'), `${JSON.stringify(result, null, 2)}\n`);
    writeFileSync(path.join(output, 'SHA256SUMS.txt'), `${artifacts.map((item) => `${item.sha256}  ${item.file}`).join('\n')}\n`);
    return result;
  } finally {
    rmSync(tempRoot, { recursive: true, force: true });
  }
}

const invokedPath = process.argv[1] && path.resolve(process.argv[1]);
if (invokedPath === fileURLToPath(import.meta.url)) {
  const outputRoot = process.argv[2] ? path.resolve(process.argv[2]) : OUTPUT_ROOT;
  const result = buildClaudePackages(outputRoot);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
