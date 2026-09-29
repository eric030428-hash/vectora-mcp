# Vectora MCP + 평가원 스킬 1.0.4

Codex와 Claude 모두 GitHub 마켓플레이스로 설치합니다. **출처: `eric030428-hash/vectora-mcp`**. Vectora MCP와 두 스킬이 함께 설치됩니다. Vectora 앱과 UND 글꼴은 별도로 설치합니다.

## 설치

- **Codex:** 플러그인 → 마켓플레이스 추가에서 위 출처, Git ref `main`, Sparse 경로 비움. macOS는 Vectora (macOS), Windows는 Vectora (Windows)를 선택합니다.
- **Claude Cowork:** 데스크톱 Cowork → Customize → Plugins → Add → Add marketplace → Add from a repository에서 위 출처를 추가하고 Vectora를 설치합니다.
- **Claude Code:** 아래 명령으로 같은 마켓플레이스의 플러그인을 설치합니다.

```sh
claude plugin marketplace add eric030428-hash/vectora-mcp
claude plugin install vectora@vectora --scope user
```

Claude의 로컬 MCP는 데스크톱 Cowork 로컬 세션과 Claude Code에서 사용합니다. 일반 채팅·웹/클라우드에서는 컴퓨터의 Vectora 앱에 연결되지 않습니다. Claude Code에는 Node.js 18 이상이 필요합니다.

## 변경 사항

- Codex 운영체제별 플러그인과 Claude 통합 플러그인을 하나의 공개 GitHub 저장소에서 설치합니다.
- 수동 설치 ZIP, MCPB, 개별 스킬 ZIP 및 보조 문서·설정·검증 파일의 릴리스 첨부 배포를 종료했습니다. 이후 릴리스도 마켓플레이스용 소스와 변경 안내만 게시합니다.
- 양쪽 마켓플레이스와 플러그인의 버전·내용을 같은 원본에서 생성하고 일치 여부를 검사합니다.
- 앱 편집 엔진과 평가원 화풍 규칙은 유지합니다. 앱을 다시 빌드하거나 설치할 필요는 없습니다.

설치파일 다운로드 없이 마켓플레이스에서 설치하세요. 아래 Source code 두 항목은 GitHub가 자동 생성하는 소스 압축파일입니다.

[설치·업데이트 안내](https://github.com/eric030428-hash/vectora-mcp#readme) · [Claude 상세 안내](https://github.com/eric030428-hash/vectora-mcp/blob/main/CLAUDE_INSTALLATION.md)
