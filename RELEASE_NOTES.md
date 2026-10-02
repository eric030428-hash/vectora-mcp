# Vectora MCP + 평가원 스킬 1.0.7

실제 자료를 이용한 그래프·지도 제작 지침을 추가했습니다. Codex와 Claude 모두 **GitHub 마켓플레이스 `eric030428-hash/vectora-mcp`**에서 MCP와 두 스킬을 함께 설치합니다.

## 변경 사항

- 실제 통계 그래프나 위치·특정 시점의 분포 지도를 요청하면 국가 통계기관·자료 생산 기관·국제기구의 원표를 우선 조사합니다. 원문 자료를 직접 확인하고 지역·기간·단위·통계 정의를 맞추며, 결측이나 시계열 단절을 임의로 채우지 않습니다.
- 시험지에서 읽기 쉽게 단위를 환산하고 일관되게 반올림하거나 값 라벨을 생략할 수 있습니다. 자료점과 요청 기간은 유지하고, 원자료·입력값·표시값을 구분해 순위·추세·의미 있는 차이가 왜곡되지 않도록 합니다. 최종 설명에는 직접 출처와 가공 방법을 밝힙니다.
- 사용자가 형식을 지정하지 않으면 시간 변화·범주 비교·구성비·변수 관계에 맞는 그래프를 선택합니다. 지도는 승인된 양식의 지역 경로와 자료를 대응시키고, 단계별 채움이나 면적 비례 기호를 사용하며 범례·결측을 명확히 표시합니다.
- 실제 자료 요청에만 추가 지침을 읽도록 공통 문서 하나로 정리했습니다. 네이티브 그래프·벤 생성 도구 우선 사용과 미지원 부분만 후속 보완하는 원칙, 같은 이름의 `.vectora`와 `.jpeg` 한 쌍 전달 원칙을 유지합니다.
- 이번 변경은 스킬과 배포 메타데이터에 한정합니다. Vectora 앱 편집 엔진과 MCP 실행기는 변경하지 않았습니다. 새 그래프·벤 도구의 기준 앱 버전은 1.1.7이며, 일반 기능의 최소 앱 버전 1.0.0은 유지합니다.

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
