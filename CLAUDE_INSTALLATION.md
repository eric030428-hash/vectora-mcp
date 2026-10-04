# Vectora Claude 마켓플레이스 설치

v1.0.4부터 Claude용 MCP와 두 스킬은 **GitHub 마켓플레이스의 Vectora 플러그인 하나로 설치**합니다. ZIP을 풀거나 MCPB·스킬 ZIP을 따로 등록하지 않습니다.

## 데스크톱 Claude / Cowork

1. 컴퓨터에 Vectora 앱을 별도로 설치합니다. 기본 MCP 기능에는 1.0.0 이상, 등록된 지도 프리셋의 지리 편집·투영 기능에는 1.1.10 이상이 필요하며 이전 앱의 새 기능 지원은 보장하지 않습니다. 평가원 제작에는 UND폰트v2.1도 필요합니다.
2. 데스크톱 앱의 Cowork 탭에서 **Customize → Plugins → Add → Add marketplace**를 엽니다.
3. **Add from a repository**에 `eric030428-hash/vectora-mcp`를 입력합니다.
4. 추가된 Vectora 마켓플레이스에서 **Vectora**를 설치합니다.
5. 새 로컬 Cowork 세션에서 Vectora 연결 상태를 확인합니다. 실제 Vectora MCP 도구와 두 스킬이 로드되어야 합니다.

공식 문서에 따르면 플러그인에 포함된 로컬 MCP는 Cowork와 Claude Code에서 실행합니다. **일반 Claude 채팅이나 웹/클라우드 세션은 컴퓨터에 설치된 Vectora 앱에 연결되지 않습니다.** 조직 정책으로 로컬 MCP가 꺼져 있는 경우에도 사용할 수 없습니다. 실제 계정의 Cowork 설치·권한·도구 노출은 해당 환경에서 확인합니다.

## Claude Code

Node.js 18 이상이 PATH에 있는 로컬 macOS/Windows에서 실행합니다.

```sh
claude plugin marketplace add eric030428-hash/vectora-mcp
claude plugin install vectora@vectora --scope user
claude plugin list
```

`vectora@vectora`가 enabled인지 확인한 뒤 새 세션을 엽니다. `use-vectora`와 `create-kice-illustration` 두 스킬 및 Vectora MCP가 함께 설치됩니다.

대화 안에서는 `/plugin marketplace add eric030428-hash/vectora-mcp`로 등록하고 `/plugin install vectora@vectora`에서 **Install for you**를 선택할 수 있습니다. 스킬은 `/vectora:use-vectora`, `/vectora:create-kice-illustration`으로 확인합니다. CLI 설치는 로컬 컴퓨터의 Claude Code에 적용되며 claude.ai 계정에 자동 등록되는 것은 아닙니다.

## 기존 설치에서 전환

기존 `vectora@vectora-local` 또는 별도 MCPB 연결을 사용하는 경우 새 마켓플레이스의 연결을 확인한 후 기존 연결을 끕니다. 중복 등록한 스킬도 새 플러그인에 포함된 두 스킬로 통일합니다. 기존 사용자 그림·프리셋·앱 설정을 지울 필요는 없습니다.

## 업데이트

```sh
claude plugin marketplace update vectora
claude plugin update vectora@vectora
```

새 세션 또는 `/reload-plugins`로 적용합니다. 자동 업데이트를 원하면 `/plugin → Marketplaces → vectora → Enable auto-update`를 켭니다. 외부 마켓플레이스의 자동 업데이트는 기본적으로 꺼져 있습니다. 업데이트 출처는 GitHub `main`의 매니페스트와 플러그인 파일이며 Release 첨부파일은 사용하지 않습니다.

## 앱을 찾지 못할 때

Vectora 앱을 기본 설치 위치에 두면 자동으로 찾습니다. 다른 위치라면 플러그인 안의 경로 등록 도구를 사용합니다. `<플러그인 경로>`에는 설치된 Vectora 플러그인 폴더를 넣습니다.

```sh
sh "<플러그인 경로>/scripts/configure-app.sh" "/Applications/Vectora.app"
```

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "<플러그인 경로>\scripts\configure-app.ps1" -AppPath "D:\앱 폴더\Vectora\Vectora.exe"
```

macOS는 `~/Library/Application Support/Vectora/mcp-app-path`, Windows는 `%APPDATA%\Vectora\mcp-app-path`에 실제 앱의 절대 경로 한 줄을 저장합니다. `VECTORA_APP_PATH`가 있으면 우선합니다. 앱 경로가 아니라 플러그인 폴더를 이 파일에 넣지 않습니다.

## 제작 시 확인

Claude가 실행하는 코드의 첨부 경로와 Vectora가 저장하는 로컬 경로는 다를 수 있습니다. 실제 Vectora MCP 도구와 입력 스키마를 먼저 확인하고, 글꼴·텍스트 측정·편집·저장을 MCP로 수행합니다. 일반 앱 창의 미저장 문서는 자동 연결되지 않으므로 저장한 파일을 MCP로 열어 작업합니다.

평가원 시각 규칙은 원본 스킬을 유지합니다. 로컬 보조 스크립트를 직접 사용할 때만 Node.js/Python 실행 환경이 필요하며, 포함된 의존성은 글꼴 파일이나 이미지 생성 모델이 아닙니다. 새 인물·삽화 원화에는 별도의 실제 이미지 생성 도구가 필요합니다. MCP가 연결되지 않은 세션에서 저장·재열기를 완료했다고 보고하지 않습니다.

## 공식 문서

- [Claude의 GitHub 마켓플레이스 추가와 로컬 MCP 지원 범위](https://support.claude.com/en/articles/13837440-use-plugins-in-claude)
- [Claude Code 마켓플레이스 형식](https://code.claude.com/docs/en/plugins/create-marketplace)
- [Claude Code 설치와 업데이트](https://code.claude.com/docs/en/plugins/install)
- [로컬 MCP와 채팅의 차이](https://support.claude.com/en/articles/11725091-when-to-use-desktop-and-web-connectors)
