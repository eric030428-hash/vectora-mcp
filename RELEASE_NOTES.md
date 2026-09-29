# Vectora MCP + 평가원 스타일 스킬 1.0.3

Codex용 macOS/Windows 플러그인과 Claude용 배포 파일을 함께 제공합니다. Vectora 앱은 별도로 설치해야 하며, 이 릴리스에는 앱이나 사용자 글꼴 파일이 포함되지 않습니다.

## 변경 사항

- Claude Desktop 로컬 MCP 확장(MCPB), Claude Code 플러그인·로컬 마켓플레이스, 개별 스킬 ZIP 2종을 추가했습니다. Desktop에서는 MCP 확장과 스킬을 각각 설치합니다. 웹 스킬 업로드만으로 로컬 Vectora에 연결되지는 않습니다.
- Claude 스킬의 코드 실행 첨부 경로와 Vectora의 로컬 저장 경로를 구별하며, 설치 글꼴 확인·텍스트 측정·편집은 현재 MCP 도구와 입력 스키마를 우선 사용합니다.
- 현재 스키마에 노출된 경우에만 `colorMode`와 `fontReplacements`를 사용합니다. 새 문서 CMYK 기본값, 새 가로·세로 문자 자간 -60, 화살표 `arrow-3` 안내를 반영했습니다.
- 최신 사용자 평가원 화풍·복합형 구성·납품 규칙을 포함합니다. 완성 그림마다 같은 이름의 `.vectora`와 `.jpeg`를 전달하는 기존 규칙을 유지했습니다.
- Claude 독립 스킬에 제작 모듈과 실행 의존성을 포함했습니다. fontTools는 `py3-none-any` 순수 Python 휠이며, 플랫폼 전용 네이티브 바이너리 포함 시 빌드가 실패합니다.
- Codex ZIP에는 해당 운영체제 실행기와 스킬 실행에 필요한 파일만 포함합니다. 개발 빌더와 Claude 전용 실행기는 제외했습니다.

## 설치 파일

| 사용 환경 | 파일 |
|---|---|
| Codex macOS | `Vectora-MCP-Skill-1.0.3-macos.zip` |
| Codex Windows | `Vectora-MCP-Skill-1.0.3-windows.zip` |
| Claude Desktop 로컬 MCP | `Vectora-Claude-Desktop-1.0.3.mcpb` |
| Claude Code 지속 설치 | `Vectora-Claude-Code-Marketplace-1.0.3.zip` |
| Claude Code 한 세션 설치 | `Vectora-Claude-Code-1.0.3.zip` |
| 일반 Vectora 스킬 | `use-vectora-1.0.3.zip` |
| 평가원 제작 스킬 | `create-kice-illustration-1.0.3.zip` |

Codex는 `README.md`, Claude는 `CLAUDE_INSTALLATION.md`를 따르세요. 사용자 지정 앱 경로는 함께 첨부한 `configure-app.sh` 또는 `configure-app.ps1`로 설정할 수 있습니다. `codex-manifest.json`과 `claude-manifest.json`은 클라이언트별 패키지 정보를, `release-manifest.json`은 소스 커밋과 통합 목록을 담습니다. `SHA256SUMS.txt`로 다운로드한 파일의 무결성을 확인하세요.

Codex MCP 연결에는 별도 Node.js/Python이 필요하지 않습니다. Claude Code 플러그인은 Node.js 18 이상을 사용하고 Desktop은 내장 Node를 사용합니다. 로컬 보조 스크립트는 Node.js 또는 Python 3.10 이상이 필요합니다. 인물·삽화 원화 생성 모델은 포함되지 않습니다.

검증은 패키지 무결성·구성·순수 Python 의존성, macOS 한글/공백 경로의 추출 실행기, Claude 플러그인/마켓플레이스 CLI 스키마를 대상으로 합니다. 실제 Claude 계정의 로그인·확장 설치·스킬 활성화와 Windows 실기기 동작은 별도 확인이 필요합니다.
