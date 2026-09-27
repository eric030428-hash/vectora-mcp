# Vectora MCP + 평가원 스타일 스킬 1.0.0

Vectora 데스크톱 앱의 실제 편집 엔진을 Codex MCP로 연결하고, 최신 `create-kice-illustration` 평가원 스타일 제작 스킬과 `use-vectora` 도구 사용 안내를 함께 제공합니다. macOS와 Windows 패키지는 각 운영체제의 실행기 설정을 담은 별도 ZIP입니다.

플러그인 실행에는 **Vectora 1.0.0 이상**이 필요합니다. 앱은 별도로 설치해야 하며 플러그인에는 앱이나 UND 글꼴 파일이 포함되지 않습니다. 편집 엔진은 설치된 Vectora 앱 실행 파일을 `--mcp-stdio`로 직접 실행하므로 MCP 사용에 Node.js, Python, Computer Use, 화면 녹화 권한은 필요하지 않습니다. 스킬에 포함된 일부 보조 제작 스크립트는 그 스크립트를 직접 실행할 때만 해당 런타임이 필요합니다.

## 포함 기능

26개 도구는 다음과 같습니다.

| 기능 | 도구 |
|---|---|
| 상태와 문서 | `vectora_status`, `vectora_new_document`, `vectora_open_document`, `vectora_list_documents`, `vectora_close_document` |
| 개체 편집 | `vectora_inspect`, `vectora_apply`, `vectora_history`, `vectora_import_svg` |
| 글꼴 | `vectora_fonts`, `vectora_check_font` |
| 기본·사용자 프리셋 | `vectora_list_presets`, `vectora_create_preset`, `vectora_save_preset`, `vectora_update_preset`, `vectora_delete_preset`, `vectora_restore_preset` |
| 평가원 제작 | `vectora_apply_illustration`, `vectora_audit_illustration`, `vectora_measure_text`, `vectora_production`, `vectora_export_package` |
| 미리보기와 파일 | `vectora_preview`, `vectora_save`, `vectora_export`, `vectora_trace_image` |

정확한 입출력 스키마는 Codex의 MCP 도구 설명과 [앱 MCP 사용 안내](https://github.com/eric030428-hash/vectora-studio/blob/main/docs/MCP.md)를 따른다.

도형 위치와 크기는 mm, 문자 크기와 선 굵기는 pt, 자간은 1/1000em입니다. 기본 도형은 채우기 없음·0.4pt, 문자는 UND폰트v2.1 8pt입니다. SVG와 `.vectora`를 편집 가능한 원본으로 저장하고 PNG/JPEG/WebP/PDF로 내보낼 수 있습니다. AI 저장은 지원하지 않으며 AI 가져오기는 PDF 호환 데이터가 있는 파일에 한합니다.

평가원 작업에는 현재 작업 공간의 [최신 평가원 제작 스킬](skills/create-kice-illustration/SKILL.md)을 사용합니다. 모든 글꼴은 설치된 UND폰트v2.1을 확인하고 사용하며, 글꼴 파일은 플러그인에 복사하거나 결과물에 포함하지 않습니다.

## 사용자 프리셋 예시

현재 열린 MCP 문서로 새 개인 그래프 프리셋을 만들려면:

```json
{
  "documentId": "vectora_new_document 또는 vectora_open_document 응답의 documentId",
  "title": "사회 집단 구성비",
  "category": "graph",
  "description": "흑백 원 그래프"
}
```

이 객체를 `vectora_save_preset`에 전달한다. 새 프리셋이면 `id`는 생략하고, 기존 사용자 프리셋의 그림을 바꿀 때만 `id`를 추가한다. `vectora_update_preset`은 이름·분류·설명을 변경하고 `vectora_delete_preset`은 사용자 프리셋을 지운다. 기본 프리셋을 숨기거나 `vectora_restore_preset`으로 되돌릴 수도 있다. 복원 호출에서 `id`를 생략하면 숨긴 기본 프리셋을 모두 되살리며 개인 프리셋은 유지한다. 각 변경 뒤 `vectora_list_presets`로 다시 확인한다.

## Codex 설치

1. Vectora 1.0.0 이상을 설치합니다.
2. 사용하는 운영체제용 ZIP을 풉니다. 플러그인 폴더 이름은 `vectora`로 유지합니다.
3. `vectora` 폴더를 개인 마켓플레이스가 가리키는 `plugins/vectora` 경로에 복사합니다. 기존 개인 마켓플레이스에 Vectora 항목이 없다면 OpenAI의 [Codex 플러그인 설치 안내](https://developers.openai.com/plugins/build/plugins)에 따라 로컬 마켓플레이스에 추가한 뒤 Codex의 플러그인 화면에서 Vectora를 설치합니다.
4. 아래 운영체제별 경로 설정을 확인한 뒤 새 Codex 대화를 시작합니다.

Codex는 플러그인 매니페스트의 스킬과 MCP 설정을 함께 읽습니다. MCP 연결은 앱을 숨겨진 별도 문서 세션으로 실행하며 일반 Vectora 창의 미저장 탭을 자동으로 조작하지 않습니다. 작업할 파일을 MCP로 열거나 새 문서를 만든 뒤 저장합니다.

### macOS

`Vectora.app`을 `/Applications` 또는 `~/Applications`에 설치하면 자동으로 찾습니다. 다른 위치에 설치했다면 다음을 실행해 앱 경로를 저장합니다.

```sh
/bin/sh "$HOME/plugins/vectora/scripts/configure-app.sh" "/Applications/Vectora.app"
```

경로는 `~/Library/Application Support/Vectora/mcp-app-path`에 기록됩니다. `VECTORA_APP_PATH` 환경변수를 설정하면 해당 경로가 우선됩니다.

### Windows

`Vectora.exe`를 기본 설치 위치에 두면 `%LOCALAPPDATA%\Programs\Vectora\Vectora.exe`, `%ProgramFiles%\Vectora\Vectora.exe`, `%ProgramFiles(x86)%\Vectora\Vectora.exe` 순서로 자동 탐색합니다. 사용자 지정 위치는 PowerShell에서 설정합니다.

```powershell
& "$env:USERPROFILE\plugins\vectora\scripts\configure-app.ps1" -AppPath "$env:LOCALAPPDATA\Programs\Vectora\Vectora.exe"
```

실행기는 `%APPDATA%\Vectora\mcp-app-path`에서 설정을 읽으며, `VECTORA_APP_PATH` 환경변수로 덮어쓸 수 있습니다. 설치·Codex 연결·Windows 점검 항목은 [MCP 설치 및 Windows 테스트 안내](https://github.com/eric030428-hash/vectora-studio/blob/main/docs/MCP_INSTALLATION.md)를 참고하세요.

PowerShell 실행 정책으로 설정 도구가 막히면 다음과 같이 현재 실행에만 정책을 지정해 호출할 수 있습니다.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$env:USERPROFILE\plugins\vectora\scripts\configure-app.ps1" -AppPath "$env:LOCALAPPDATA\Programs\Vectora\Vectora.exe"
```

`configure-app.ps1`은 사용자 경로 파일만 기록하며 앱을 실행하거나 Codex 설정을 수정하지 않습니다.

## 다른 MCP 클라이언트

앱 경로를 직접 등록할 수 있는 stdio MCP 클라이언트는 설치한 앱 실행 파일에 `--mcp-stdio`를 전달합니다. 예를 들어 Windows 설정은 다음과 같습니다.

```json
{
  "mcpServers": {
    "vectora": {
      "command": "C:\\Program Files\\Vectora\\Vectora.exe",
      "args": ["--mcp-stdio"]
    }
  }
}
```

이 경우 Codex 플러그인에 포함된 OS별 앱 경로 탐색기는 사용하지 않습니다. 앱 경로는 실제 설치 위치로 바꿉니다.

## 배포 파일 만들기

개발자용 패키징은 Node.js의 기본 모듈과 macOS `zip` 유틸리티만 사용합니다. 앱 사용자는 실행기나 MCP 작업을 위해 Node.js/Python을 설치할 필요가 없습니다.

```sh
node scripts/build-packages.mjs
node --test tests/launchers.test.mjs
```

결과는 `release/1.0.0/macos/`와 `release/1.0.0/windows/`에 각각 ZIP, 펼친 플러그인, SHA-256을 포함한 `release/1.0.0/manifest.json`으로 생성됩니다. Windows용 ZIP은 Windows PowerShell 실행기 설정을 포함합니다.
