# Vectora Claude 패키지 설치 안내

이 안내는 Vectora MCP 및 평가원 제작 스킬의 로컬 배포본 v1.0.2에 적용됩니다. Vectora 데스크톱 앱은 Claude 패키지에 포함되지 않으므로 먼저 별도로 설치하세요. Claude Desktop 확장과 Claude Code 플러그인은 이 컴퓨터에서 Vectora 앱을 실행합니다. Claude 웹 채팅에 스킬만 등록하면 로컬 MCP에 연결되지 않습니다.

## 패키지 구성

- **Claude Desktop 로컬 MCP:** `desktop/Vectora-Claude-Desktop-1.0.2.mcpb`
- **Claude Code 지속 설치용 로컬 마켓플레이스:** `claude-code/Vectora-Claude-Code-Marketplace-1.0.2.zip`
- **Claude Code 한 세션용 플러그인 폴더:** `claude-code/vectora/`
- **개별 스킬 업로드:** `skills/use-vectora-1.0.2.zip`, `skills/create-kice-illustration-1.0.2.zip`

Claude 웹/클라우드 세션에서는 이 컴퓨터의 Vectora MCP를 사용할 수 없습니다. 웹에 스킬을 올려도 제작 지침과 도우미 파일만 제공됩니다. 로컬 Vectora 편집·저장·재열기는 Claude Desktop 또는 이 컴퓨터에서 실행하는 Claude Code에서 하세요.

## Claude Desktop: MCP 확장과 스킬

1. Vectora 앱을 설치합니다.
2. Claude Desktop에서 **Settings → Extensions → Advanced settings → Extension Developer → Install Extension…**을 열고 `desktop/Vectora-Claude-Desktop-1.0.2.mcpb`를 선택합니다.
3. Extensions 화면에서 Vectora 연결을 확인하고, 필요하면 Claude Desktop을 재시작합니다. 대화의 **Connectors**에 Vectora 도구가 나타나는지도 확인하세요.
4. 평가원 제작 지침과 일반 벡터 편집 지침도 쓰려면 Claude의 **Customize → Skills → + Create skill → Upload a skill**에서 스킬 ZIP을 각각 업로드하고 켭니다. `create-kice-illustration`은 평가원 그림 제작용이고 `use-vectora`는 일반 Vectora 편집용입니다. 스킬을 사용하려면 계정에서 **Code execution and file creation**을 켜야 합니다.

Desktop 스킬의 코드 실행 첨부 경로와 Vectora의 로컬 저장 경로는 서로 다를 수 있습니다. 코드 실행이 로컬 앱·글꼴 파일을 직접 읽을 수 있다고 가정하지 말고, 실제 도구 목록에서 `vectora_fonts`, 노출된 경우 `vectora_check_font`·`vectora_measure_text`, 그리고 현재 입력 스키마에 맞는 `vectora_apply`·`vectora_import_svg`를 우선 사용하세요. SVG 문자열이나 data URL 전달은 가져오기 스키마가 허용할 때만 하며, 저장할 때는 첨부 경로가 아닌 사용자가 지정한 실제 로컬 경로를 사용합니다. Claude Code 로컬 플러그인에서는 패키지에 포함된 보조 스크립트를 사용할 수 있습니다.

MCP 확장과 스킬은 서로 별도로 설치합니다. 스킬 업로드만으로 MCP가 연결되지는 않습니다. Desktop 확장에는 macOS와 Windows 실행기가 함께 들어 있고, Claude Desktop이 Node 런타임을 제공하므로 별도 Node 설치는 필요하지 않습니다. 경로의 공백과 한글은 실행기에서 인자 단위로 전달합니다. Windows에서는 서명되지 않은 배포 PowerShell 실행기를 시작할 때 `-ExecutionPolicy Bypass`를 해당 PowerShell 프로세스에만 적용합니다. 레지스트리의 사용자/컴퓨터 설정은 바꾸지 않으며, 조직 Group Policy가 설정한 정책은 이 옵션보다 우선할 수 있습니다.

### 앱 경로를 찾지 못할 때

일반 설치 위치에서 앱을 찾지 못하면 배포 폴더의 `utilities`에서 경로 등록 도구를 실행합니다.

- macOS: `sh "/배포폴더/utilities/configure-app.sh" "/Applications/Vectora.app"`
- Windows PowerShell: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\배포폴더\utilities\configure-app.ps1" -AppPath "C:\앱경로\Vectora.exe"`

예시 경로를 실제 설치 위치로 바꾸세요. 설정 후 Claude Desktop에서 Vectora 연결을 다시 확인합니다.

## Claude Code: 지속 설치 (권장)

Claude Code가 설치된 이 컴퓨터에서 실행합니다. 로컬 마켓플레이스 ZIP을 공백이나 한글이 없는 경로에 풀어 둘 필요는 없지만, 설치 후에도 마켓플레이스 폴더를 이동하거나 삭제하지 마세요. 압축을 풀면 `claude-code-marketplace` 폴더 안에 `.claude-plugin/marketplace.json`과 `plugins/vectora/`가 있어야 합니다. 마켓플레이스 루트는 `.claude-plugin`을 직접 포함하는 그 폴더입니다.

터미널에서 압축을 푼 마켓플레이스 루트의 실제 경로를 넣어 실행합니다.

```sh
claude plugin marketplace add "/배포폴더/claude-code-marketplace"
claude plugin install vectora@vectora-local --scope user
claude plugin list
```

`--scope user`는 이 컴퓨터의 모든 프로젝트에서 사용할 사용자 범위 설치입니다. 설치 상태가 enabled인지 `claude plugin list`로 확인하세요. Node.js 18 이상이 PATH에 있어야 합니다.

대화형 Claude Code 안에서는 아래처럼 마켓플레이스를 추가한 뒤 플러그인 세부 화면을 열 수 있습니다.

```text
/plugin marketplace add "/배포폴더/claude-code-marketplace"
/plugin install vectora@vectora-local
```

두 번째 명령은 바로 설치하지 않고 `/plugin` 세부 화면을 엽니다. 화면에서 **Install for you**를 선택하면 사용자 범위로 지속 설치됩니다. 여기서 `<folder>`는 ZIP 파일이나 `plugins/vectora`가 아니라 `.claude-plugin/marketplace.json`을 포함하는 압축 해제된 마켓플레이스 루트입니다.

## Claude Code: 한 번만 실행

지속 설치 대신 한 세션에서만 시험하려면 압축 해제된 플러그인 폴더를 지정해 Claude Code를 시작합니다.

```sh
claude --plugin-dir "/배포폴더/claude-code/vectora"
```

`--plugin-dir`에는 ZIP이 아닌, `.claude-plugin/plugin.json`이 바로 들어 있는 압축 해제된 플러그인 폴더를 지정합니다. 이 방식은 해당 실행에만 적용되므로 매번 실행할 때 옵션을 넣어야 합니다. 플러그인 폴더를 `~/.claude/skills/`에 복사하는 것은 이 플러그인의 지속 설치 방법이 아닙니다. 그 위치는 독립 `SKILL.md` 스킬용이며 `.mcp.json`이나 플러그인 매니페스트를 설치·활성화하지 않습니다.

Claude Code에서 Vectora MCP 도구가 보이는지 확인한 뒤 `/vectora:use-vectora` 또는 `/vectora:create-kice-illustration`을 사용할 수 있습니다. 플러그인은 이 컴퓨터의 Vectora 앱 경로를 실행하므로 앱이 설치되어 있어야 합니다.

## Claude 스킬 ZIP만 등록할 때

Claude의 **Customize → Skills → + Create skill → Upload a skill**에서 사용할 스킬 ZIP을 각각 올리고 켭니다. ZIP은 스킬 폴더를 최상위에 포함하도록 만들어졌습니다. 스킬은 제작 지침과 포함된 도우미 파일을 제공하지만, Claude 웹/클라우드에 로컬 Vectora MCP를 연결하지 않습니다.

평가원 디자인 규칙은 기존 `create-kice-illustration` 규칙을 유지했습니다. 독립 스킬 ZIP에도 필요한 제작 모듈과 Node/Python 의존성을 포함했습니다.

이 패키지는 이미지 생성 모델을 포함하지 않습니다. 그래프·문자·도형 편집은 Vectora MCP로 수행하며, 인물·삽화의 새 원화 생성에는 해당 Claude 세션에서 사용할 수 있는 별도 이미지 생성 도구가 필요합니다. 그런 도구가 없으면 스킬은 생성용 지시와 벡터 조판을 준비하고 필요한 원화를 요청하도록 안내합니다.

## 현재 MCP 스키마를 따르는 기능

스킬은 매 작업에서 현재 MCP 도구 목록과 입력 스키마를 확인하도록 구성했습니다.

- 설치된 글꼴 목록은 `vectora_fonts` 도구로 조회합니다.
- `vectora_new_document`의 실제 입력 스키마에 `colorMode`가 있을 때만 전달합니다. 필드가 있으면 기본은 `cmyk`이며 사용자가 RGB를 요청했을 때 `rgb`를 지정합니다.
- `vectora_open_document` 또는 `vectora_import_svg`에 `fontReplacements`가 있을 때만 글꼴 매핑을 전달합니다. `MISSING_FONTS` 응답의 목록을 확인하고 `vectora_fonts`로 설치 글꼴을 살핀 뒤 사용자가 고른 매핑으로 재시도합니다.
- 새 가로·세로 앱 문자의 기본 자간은 `-60`입니다. 생성 입력 스키마에 `charSpacing`이 있을 때 적용하며 측정 도구가 있으면 측정에도 같은 값을 사용합니다.
- 화살표 도구의 UI 이름은 `화살표`, 현재 도구 값은 `arrow-3`입니다. 실제 열거값은 사용할 때 스키마에서 다시 확인합니다.

필드가 현재 도구 스키마에 없으면 그 기능이 제공된다고 가정하지 않습니다. Vectora 앱을 업데이트한 뒤 MCP 도구 목록을 다시 확인하세요.

## 공식 문서

- [Claude Desktop 로컬 MCP 서버와 확장 설치](https://support.claude.com/en/articles/10949351-getting-started-with-local-mcp-servers-on-claude-desktop)
- [Claude Desktop과 웹 커넥터의 차이](https://support.claude.com/en/articles/11725091-when-to-use-desktop-and-web-connectors)
- [MCP Bundle manifest 및 실행 설정](https://github.com/modelcontextprotocol/mcpb/blob/main/MANIFEST.md)
- [Claude Code 플러그인 개요 및 `--plugin-dir`](https://code.claude.com/docs/en/plugins)
- [Claude Code 로컬 마켓플레이스 만들기와 설치](https://code.claude.com/docs/en/plugins/create-marketplace)
- [Claude Code 플러그인 설치 범위와 명령](https://code.claude.com/docs/en/plugins/install)
- [Claude Code MCP 연결](https://code.claude.com/docs/en/mcp)
- [Claude Code 스킬](https://code.claude.com/docs/en/skills)
- [Claude에서 사용자 스킬 업로드 및 사용](https://support.claude.com/en/articles/12512180-use-skills-in-claude)
- [사용자 스킬 작성과 ZIP 구조](https://support.claude.com/en/articles/12512198-how-to-create-custom-skills)
- [PowerShell 실행 정책의 범위와 우선순위](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_execution_policies?view=powershell-5.1)
