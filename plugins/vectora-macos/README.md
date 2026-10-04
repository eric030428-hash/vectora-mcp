# Vectora MCP + 평가원 스타일 스킬 1.1.0

Codex와 Claude에서 **GitHub 마켓플레이스로 설치**합니다. Vectora 편집 도구와 `use-vectora`, `create-kice-illustration` 두 스킬이 함께 설치됩니다.

실제 자료로 그래프·지도를 요청하면 공신력 있는 원자료를 확인하고, 출처와 가공 방법을 밝히면서 시험지에 적합한 단위·숫자 표기·시각화 형식을 선택합니다.

기본 MCP 기능에는 Vectora 앱 1.0.0 이상, 등록된 지도 프리셋의 지리 편집·투영 기능에는 앱 1.1.10 이상이 필요합니다. UND v3.0 글꼴 기능은 앱 1.1.11 이상에서 사용할 수 있습니다. 새 JPEG/PNG 회색조 래스터 내보내기는 Vectora 앱 1.2.0 이상이 필요합니다. 사용 전 앱을 업데이트하고 MCP를 다시 연결하세요.

마켓플레이스 출처는 두 클라이언트 모두 **`eric030428-hash/vectora-mcp`**입니다. MCP 저장소는 공개이므로 다운로드용 GitHub 토큰이 필요하지 않습니다. Vectora 앱은 별도로 설치하며, 앱의 비공개 배포 권한과 업데이트는 별도입니다. 플러그인에는 앱이나 UND 글꼴 파일이 들어 있지 않습니다.

| 사용할 환경 | 설치할 항목 |
|---|---|
| Codex macOS | Vectora (macOS) · `vectora-macos@vectora` |
| Codex Windows | Vectora (Windows) · `vectora-windows@vectora` |
| Claude Code / 데스크톱 Cowork | Vectora · `vectora@vectora` |

## Codex 설치

1. 평가원 그림에는 UND폰트v3.0도 설치합니다.
2. Codex의 **플러그인 → 마켓플레이스 추가**에서 출처에 `eric030428-hash/vectora-mcp`, Git ref에 `main`을 입력하고 Sparse 경로는 비워 둡니다.
3. Vectora 마켓플레이스에서 운영체제에 맞는 **한 항목만** 설치합니다.
4. 새 대화에서 “Vectora 연결 상태를 확인해줘”라고 요청합니다. MCP와 두 스킬이 함께 표시되어야 합니다.

기존 ZIP·개인 마켓플레이스로 설치한 Vectora가 있다면 새 항목을 확인한 후 기존 항목을 꺼서 같은 도구가 중복되지 않게 합니다.

명령줄에서도 설치할 수 있습니다.

```sh
codex plugin marketplace add eric030428-hash/vectora-mcp --ref main
# macOS
codex plugin add vectora-macos@vectora
# Windows에서는 위 설치 명령 대신
codex plugin add vectora-windows@vectora
```

Codex 연결에는 별도 Node.js나 Python 설치가 필요하지 않습니다. Windows에서는 함께 설치된 PowerShell 실행기가 앱과 통신합니다.

## Claude 설치

Claude의 **Customize → Plugins → Add → Add marketplace → Add from a repository**에서 `eric030428-hash/vectora-mcp`를 추가하고 **Vectora**를 설치합니다. Cowork에서는 먼저 데스크톱 앱의 Cowork 탭을 엽니다.

Claude Code 명령줄에서는 다음 두 줄을 실행합니다.

```sh
claude plugin marketplace add eric030428-hash/vectora-mcp
claude plugin install vectora@vectora --scope user
```

MCP와 두 스킬이 함께 설치되므로 별도 스킬 ZIP 업로드가 필요하지 않습니다. Claude용 실행기는 Node.js 18 이상을 사용하며, Claude Code에서는 `node`가 PATH에 있어야 합니다. 설치 후 새 로컬 세션에서 Vectora 도구와 `/vectora:use-vectora`, `/vectora:create-kice-illustration`을 확인합니다.

**Vectora의 로컬 MCP는 Claude Code와 데스크톱 Cowork 로컬 세션에서 사용합니다. 일반 Claude 채팅·웹/클라우드 세션에서는 컴퓨터의 Vectora 앱에 연결되지 않습니다.** 계정에서 플러그인만 보인다고 로컬 도구가 연결된 것은 아닙니다. 설치 범위와 경로 문제는 [Claude 설치 안내](CLAUDE_INSTALLATION.md)를 참고하세요.

## 업데이트

마켓플레이스는 GitHub의 `main`에 게시된 파일을 가져옵니다. GitHub Release만 게시하면 기존 설치가 즉시 갱신된다고 보장하지 않습니다.

- Codex: `codex plugin marketplace upgrade vectora`로 목록을 갱신하고 사용하는 항목을 다시 설치한 뒤 새 대화를 시작합니다.
- Claude Code: `claude plugin marketplace update vectora`와 `claude plugin update vectora@vectora`를 실행합니다. 현재 세션은 `/reload-plugins` 또는 새 세션으로 반영합니다.
- Claude Code의 자동 업데이트는 `/plugin`의 Marketplaces에서 Vectora의 **Enable auto-update**로 켤 수 있습니다. 사용자 추가 마켓플레이스는 기본적으로 꺼져 있습니다.

v1.0.4부터 GitHub Releases는 버전과 변경 안내를 기록합니다. 수동 설치 ZIP, MCPB, 개별 스킬 ZIP, 별도 설정 도구와 관리용 JSON을 릴리스 첨부 파일로 배포하지 않습니다. GitHub가 자동으로 표시하는 Source code 압축파일은 설치할 필요가 없습니다.

## 앱 경로와 연결

macOS의 `/Applications/Vectora.app` 또는 `~/Applications/Vectora.app`, Windows의 사용자 Programs 또는 Program Files 기본 위치에서 앱을 자동으로 찾습니다. 사용자 지정 경로는 `VECTORA_APP_PATH` 또는 다음 파일의 한 줄로 지정할 수 있습니다.

- macOS: `~/Library/Application Support/Vectora/mcp-app-path` — `Vectora.app`의 절대 경로
- Windows: `%APPDATA%\Vectora\mcp-app-path` — `Vectora.exe`의 절대 경로

경로 등록용 `scripts/configure-app.sh`와 `scripts/configure-app.ps1`은 해당 플러그인 안에 포함합니다. 별도 설치 파일로 배포하지 않습니다. 클라이언트가 연결하지 못하면 실제 앱 경로, 런타임, MCP 오류를 확인합니다.

MCP는 일반 편집 창의 미저장 문서를 자동 조작하지 않습니다. 작업 파일을 저장한 뒤 `vectora_open_document`로 열거나 새 문서를 만들어 작업합니다.

## 포함 기능

연결된 앱의 MCP 도구로 문서 생성·가져오기·편집·저장, 도형·경로·문자·곡률·양끝 화살표, 그룹·레이어·대지, 글꼴 확인·조판 측정, 프리셋, 그림 규격 검사와 이미지 내보내기를 수행합니다. 그래프는 앱의 네이티브 그래프 도구와 지원되는 `chartStyle` 16종을 우선 사용하고, 2·3집합 벤 다이어그램은 `layout: "venn"`을 우선 적용하도록 평가원 스킬을 갱신했습니다. 일부 옵션이 지원되지 않아도 생성 도구로 가능한 핵심 구조와 표현을 먼저 만들고, 미지원 요소만 도형·경로 등 편집 가능한 요소로 후속 보완합니다. 핵심 데이터 구조 자체를 생성 도구로 표현할 수 없을 때만 전체를 다른 편집 요소로 대체합니다. 그래프의 수치·축·단위·라벨과 서식을 원자료와 대조해 확인합니다.

지도 제작은 유형별 지침과 출처·manifest가 있는 바탕 자산 라이브러리를 참고하며, 먼저 `vectora_list_presets({})`에서 요청 범위·경계·도법·상세도에 맞는 실제 UND 프리셋을 선택합니다. W0/W1 관리형 경로는 연결본의 capability를 확인한 뒤 `world_continents`의 제한된 부분 매핑에만 적용합니다. 프리셋 목록이나 자산 라이브러리는 모든 지도의 자동 제작·관리 기능을 뜻하지 않으며, 최종 결과는 저장본 JPEG의 실제 크기와 확대 화면에서 검수합니다.

도형 위치·크기는 mm, 문자·선은 pt, 자간은 1/1000em입니다. 평가원 제작에는 설치된 UND폰트v3.0을 사용하고, 같은 이름의 `.vectora` 원본과 기본 4배 `.jpeg`를 전달합니다. 이미지 생성 모델과 글꼴 파일은 포함하지 않습니다.

## 유지보수와 릴리스

루트의 매니페스트·실행기·`skills/`가 원본이고 `plugins/`는 마켓플레이스에서 설치하는 생성본입니다. Claude에는 클라이언트별 도구·파일 경로 안내를 적용하되 평가원 화풍 규칙을 유지합니다. 생성·검사에는 Node.js와 Python 3가 필요합니다. 아래 명령은 저장소에 포함된 의존성을 사용하므로 네트워크 설치를 하지 않습니다.

```sh
node scripts/build-marketplace.mjs
node scripts/build-marketplace.mjs --check
```

의존성을 변경할 때만 `node scripts/build-claude-runtime.mjs`로 고정된 npm 잠금파일과 Python 해시에 맞춰 내부 의존성 묶음을 다시 만듭니다. 이 내부 묶음은 설치파일이나 릴리스 첨부가 아닙니다. 의존성 변경 뒤 마켓플레이스 생성 명령도 실행합니다.

원본과 생성된 파일을 함께 커밋합니다. `--check`는 소스와 설치본의 불일치를 검사하며 네트워크 설치나 파일 수정을 하지 않습니다. 릴리스는 사용자 요청이 있을 때만 버전을 올리고 생성본을 갱신한 뒤, 필요한 검증·커밋·푸시·태그·GitHub Release 게시를 수행합니다. `node scripts/stage-release.mjs`는 깨끗한 소스와 생성본을 확인하고 게시할 설명문과 내부 검증 기록만 준비합니다. 설치 아카이브를 만들거나 업로드하지 않습니다.

[Codex 플러그인 공식 안내](https://developers.openai.com/plugins/build/plugins) · [Claude 마켓플레이스 설치](https://support.claude.com/en/articles/13837440-use-plugins-in-claude) · [Claude Code 설치·업데이트](https://code.claude.com/docs/en/plugins/install)
