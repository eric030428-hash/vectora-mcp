# Vectora MCP + 평가원 스킬 1.0.8

지도 분류·바탕 자산 참고, 프리셋 선택, 점 라벨 조판과 실제 출력 검수 지침을 보강했습니다. 이번 버전은 스킬과 배포 메타데이터 변경이며 Vectora 앱 코드와 MCP 실행기는 변경하지 않았습니다.

## 변경 사항

- 지도는 정보 유형별 지침과 출처·manifest가 있는 바탕 자산 라이브러리를 사용합니다. 제작은 연결된 UND 프리셋 목록에서 요청 범위·경계·도법·상세도에 맞는 실제 항목을 먼저 선택하고, 대응하는 자산 manifest만 확인합니다.
- Vectora 앱 1.1.9의 UND 목록에서 지도 native 프리셋 32개를 확인했지만, 이 목록은 32개 자동 제작 등록을 뜻하지 않습니다. W0/W1 관리형 경로는 실제 capability를 확인한 뒤 `world_continents`의 제한된 부분 매핑에만 적용합니다.
- 지도 점의 지리 위치는 고정하고, 8pt 문자 실제 잉크 경계와 점 가장자리의 약 0.7–1.5mm 간격을 조판 시작값으로 삼습니다. 해안·국경·다른 점과 충돌하면 문자 오프셋, 짧은 인출선 또는 최소 흰 halo로 조정합니다.
- 네이티브 검정 선이나 편집 객체의 존재만으로 출력 통과를 판단하지 않습니다. 저장본 JPEG를 실제 크기와 확대 화면에서 확인하고 지리선 흐림이 남으면 실패 또는 출력 한계로 보고합니다. 래스터를 임의 벡터화하거나 원기하·마스크를 제거해 결함을 숨기지 않습니다.

## 설치 및 업데이트

- **Codex:** 플러그인 → 마켓플레이스 추가에서 출처 `eric030428-hash/vectora-mcp`, Git ref `main`, Sparse 경로 비움. macOS는 Vectora (macOS), Windows는 Vectora (Windows)를 설치합니다. 기존 설치는 마켓플레이스를 갱신하고 사용하는 항목을 다시 설치한 뒤 새 대화를 시작합니다.
- **Claude Cowork:** 데스크톱 Cowork → Customize → Plugins → Add → Add marketplace → Add from a repository에서 같은 출처를 추가하고 Vectora를 설치합니다.
- **Claude Code:** 처음 설치할 때 다음 명령을 사용합니다.

```sh
claude plugin marketplace add eric030428-hash/vectora-mcp
claude plugin install vectora@vectora --scope user
```

기존 Claude Code 설치는 다음과 같이 갱신합니다.

```sh
claude plugin marketplace update vectora
claude plugin update vectora@vectora
```

갱신 후 새 로컬 세션을 시작하거나 `/reload-plugins`를 사용합니다. GitHub Release 게시만으로 기존 설치가 즉시 갱신되지는 않습니다. Vectora 앱과 UND 글꼴은 별도로 설치하며, Claude Code에는 Node.js 18 이상이 필요합니다. Claude의 로컬 MCP는 Claude Code와 데스크톱 Cowork 로컬 세션에서 사용합니다.

수동 설치 ZIP, MCPB, 개별 스킬 ZIP, 별도 설정 도구·검증 JSON을 첨부하지 않습니다. 아래 Source code 두 항목은 GitHub가 자동 제공하는 소스 압축파일이며 설치본이 아닙니다.

[설치·업데이트 안내](https://github.com/eric030428-hash/vectora-mcp#readme) · [Claude 상세 안내](https://github.com/eric030428-hash/vectora-mcp/blob/main/CLAUDE_INSTALLATION.md)
