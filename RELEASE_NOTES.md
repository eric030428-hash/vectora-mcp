# Vectora MCP + 평가원 스킬 1.0.5

평가원 스타일 일러스트의 그래프·인물·배치 원칙을 보완했습니다. Codex와 Claude 모두 **GitHub 마켓플레이스 `eric030428-hash/vectora-mcp`**에서 MCP와 두 스킬을 함께 설치합니다.

## 변경 사항

- 수치 Y축을 사용하는 꺾은선·산점도·세로 막대 그래프에 주요 눈금의 가로 점선을 기본으로 적용합니다. 점선은 검정 0.3pt, 선 1.5pt / 간격 1pt이며 자료 뒤에 배치합니다. 적용 범위와 간격, 단순 비교·정성 개형·원그래프 등의 예외도 명시했습니다. 발표 화면 안의 그래프에도 같은 기준을 적용합니다.
- 실제 인물명이나 구체적인 유물·사물명을 지정하면 인터넷에서 참조 이미지를 검색하고 직접 확인합니다. 식별되는 외형을 반영하되 평가원 화풍을 유지하며, 인물의 조각상 자료에서 석재 질감·받침대를 따라 그리지 않습니다. 일반 대상은 과거 평가원 예시 없이 새로 구성합니다.
- 스타일가이드 분석과 35개 선정 이미지의 제작·검수에서 확인한 원칙을 유형별 문서에 통합했습니다. 모식도의 분기 배치, 그래프의 눈금·수치·원 조각 라벨·긴 범주명, 작은 얼굴과 흉상의 구분, 대화·발표의 간격, 자연 지형 삽화의 형태 표현을 보완했습니다.
- 필요한 유형의 문서만 읽는 구조, 복합형의 모든 해당 원칙 적용, 같은 이름의 `.vectora`와 `.jpeg` 전달, 검정 벡터 선과 원화 배치 방식을 유지합니다. 이번 버전은 스킬과 배포 메타데이터 변경이며 MCP 실행기·앱 편집 엔진은 변경하지 않았습니다.

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
