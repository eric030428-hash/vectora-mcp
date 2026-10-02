# Vectora MCP + 평가원 스킬 1.0.6

평가원 스타일 그래프·벤 다이어그램·지도 제작 지침을 갱신했습니다. Codex와 Claude 모두 **GitHub 마켓플레이스 `eric030428-hash/vectora-mcp`**에서 MCP와 두 스킬을 함께 설치합니다.

## 변경 사항

- 그래프는 Vectora 네이티브 그래프 도구를 먼저 사용하고, 앱이 제공하는 `chartStyle` 16종 가운데 요청 자료에 맞는 유형을 선택하도록 평가원 스킬을 갱신했습니다. 2·3집합 벤 다이어그램은 `layout: "venn"`을 우선 사용합니다. 일부 옵션이 지원되지 않아도 생성 도구로 가능한 핵심 구조와 표현을 먼저 만들고, 미지원 요소만 도형·경로 등 편집 가능한 벡터 요소로 후속 보완합니다. 핵심 데이터 구조 자체를 생성 도구로 표현할 수 없을 때만 전체를 다른 편집 요소로 대체합니다.
- 그래프 수치·축 눈금·단위·비율·라벨을 입력 자료와 대조하고, 반올림과 글자·선 서식을 함께 검수하도록 했습니다. 네이티브 도구가 만든 결과와 보완 요소 모두 요청된 정보 및 표기 형식에 맞는지 확인합니다.
- 지도는 승인된 `create-kice-illustration` 스킬의 `assets/maps/world_continents.vectora` 기본 양식을 열어 국가 회색 객체를 앞으로 가져오고(`bringFront`), 대상 지역을 클립해 확대·축소한 뒤 UND 8 pt 라벨을 추가해 편집합니다. 이 지도 지침에는 이전에 배포되지 않았던 로컬 변경도 포함합니다.
- 같은 이름의 `.vectora` 원본과 `.jpeg` 결과 전달 원칙을 유지합니다. 이 릴리스 범위는 평가원 스킬과 배포 메타데이터이며, 앱 편집 엔진과 MCP 실행기는 변경하지 않습니다. 실제 기능 동작과 앱 버전별 지원 여부는 연결된 앱에서 확인해야 합니다. 새 그래프·벤 도구의 기준 앱 버전은 1.1.7이며, 일반 기능의 최소 앱 버전 1.0.0은 유지합니다. 그보다 낮은 앱에서는 새 도구 지원 여부를 확인하세요.

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
