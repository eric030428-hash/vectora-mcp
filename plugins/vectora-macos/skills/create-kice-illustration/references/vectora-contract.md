# Vectora 실행 계약

실제 제작할 때만 읽는다. 스타일 원칙은 공통/유형 문서에 있으므로 여기서 다시 정의하지 않는다. 저장소에는 stdio MCP가 구현되어 있지만 현재 세션에 연결되었는지는 도구 조회로 확인한다. 새 기능 설계안이나 도판 라이브러리는 생성 지침이 아니다.

## 실행 경로

- 연결된 `vectora_status`로 지원 기능/문서 세션을 확인하고 `vectora_fonts`, `vectora_check_font`로 실제 사용할 문자 전체를 검사한다.
- `vectora_new_document` 또는 별도 문서의 `vectora_open_document` → `vectora_production`/`vectora_apply`/`vectora_import_svg` → `vectora_inspect` → `vectora_preview` → `vectora_save`/`vectora_export`를 사용한다. 현재 MCP 문서는 일반 UI 탭과 독립 세션이다.
- 새 그래프·벤은 [그래프·벤 실행](graph-venn-production.md)의 해당 절만 읽고 UI와 같은 production 엔진을 우선 사용한다. `vectora_status`가 앱 버전·production 정보만 반환할 수 있으므로 존재하지 않는 `chartStyle` capability 키를 가정하지 않는다. 실제 연결본의 스키마와 호출 오류로 지원을 확인한다. 일부 옵션만 미지원이면 production으로 기본 자료 구조를 만든 뒤 그 부분만 수정·보충한다. 전체 대체는 유형 자체의 기본 자료 관계를 표현할 수 없거나 실제 생성 경로가 없는 경우에 한한다. 서버 `vectora://guide`에 예전 그래프 계약이나 UND 메뉴 설명이 남아 있으면 새 `chartStyle`과 혼용하지 않는다.
- 지도는 [바탕 실행](map-template.md)에 따라 적합한 UND 프리셋에서 새 문서를 시작한 뒤 일반 선택·style·clip과 실제 production `pattern`/`magnify`/`graph`를 조합한다.
- 기본 전달용 이미지는 **JPEG**다. 출력 배율·픽셀 크기를 지정하지 않으면 `vectora_export`에 `format:"jpeg", scale:4, transparent:false`를 명시한다. 사용자 지정 크기·배율은 우선하며 편집 원본의 물리 치수·글자 크기는 유지한다. 검수용 `vectora_preview`는 화면에 맞는 제한된 크기를 사용한다. `vectora_export_package`는 SVG·PNG 등 추가 파일을 생성하므로 기본 두 파일 납품에 사용하지 않는다. 사용자가 그 묶음을 명시적으로 요청했을 때만 사용한다.
- 변경 요청의 `documentId`, `expectedRevision`, `requestId`는 실제 응답에서 얻어 사용한다. 같은 재시도는 같은 requestId, 다른 편집은 새 ID. 대상 개체 ID를 확인한다. 일반 일괄 명령은 1,000개 이하이며 실패 시 복원된다.
- 도구가 연결되지 않았으면 벡터 SVG를 직접 만들고 사용할 수 있는 실제 Editor 경로로 검사한다. 파일 생성만 했으면 앱 저장/재열기 검증을 완료했다고 말하지 않는다. 스킬 작업 중 앱 기능 개발이나 외부 모델 연결로 범위를 넓히지 않는다.

## 단위와 렌더

| 입력 경로 | 길이 | 글/획/파선 | tracking |
|---|---|---|---|
| 일반 MCP `units: mm-pt`(기본) | mm | pt | 1/1000em |
| production `*Mm`/`*Pt` | 명시된 mm | 명시된 pt; UND 8pt 고정 | -60 고정 |
| Editor 내부, `units: px`, 기존 recipe v1 | px | px | 1/1000em |
| 직접 SVG의 96px/in viewBox | mm×96/25.4 | pt×96/72 | letter-spacing=-0.06×font-size |

8pt는 10.666666667px, -6%는 `charSpacing: -60` 또는 위 SVG에서 `letter-spacing="-0.64"`다. 0.3pt는 0.4px. SVG root width/height는 실제 mm, viewBox는 그에 맞는 문서 px로 지정한다. 루트/그룹 배율이 실제 글·선 크기를 바꾸는지 확인한다. pt 입력에 다시 px 환산을 하지 않는다.

**현재 편집 경로의 주의점:**

- 이전 실행본의 일부 선 생성/펜 경로에는 1px 하한이 있었다. 현재 연결본의 실제 생성 값을 확인한다. 규격보다 굵어졌으면 직접 SVG 또는 생성 후 `style.strokeWidth` 적용으로 정확한 값을 유지한다.
- `transform.width`는 글자를 가로로 늘릴 수 있다. 글상자 폭 변경은 실제 조판으로 다시 만들며 문자 전체 Scale을 사용하지 않는다.
- `vectora_import_svg`는 원래 좌표/크기를 보존한다. UI/추적의 일부 가져오기 경로는 대지에 맞춰 축소할 수 있으므로 확인한다.
- 일반 `add`에서 파선을 못 받는 경로는 대상 선택 후 `style.strokeDashArray`를 사용한다. 기존 `vectora.kice/v1`은 자간·파선·투명도 등의 속성이 제한적이다. 풍부한 SVG 또는 일반 명령을 우선하고 v1에 임의 필드를 넣지 않는다.
- 기본 템플릿·`typography:kice`·글꼴 감사는 모든 제작 규격을 자동 보장하지 않는다. 글/획/자간/색을 명시한다. `audit_svg.py`는 폰트·글리프·외부 참조를 검사하고 포함 원화 수를 보고한다. 원화가 인물/삽화인지, 글·도형이 독립 편집되는지는 시각·개체 검사로 확인한다.
- 화살촉은 경로 끝을 넘어갈 수 있다. 도형 경계와 맞출 때는 실제 촉 끝을 확인한다. 말풍선 몸통과 꼬리는 외곽이 하나로 이어지게 직접 경로로 만들 수 있다. 대화 생성기의 기본 꼬리가 대칭 곡선이면 그대로 완료하지 말고 [대화의 꼬리 원칙](dialogue-illustrations.md#말풍선의-필수-구조)에 맞춰 몸통과 이어진 경로를 수정하거나 다시 작성한다. 꼬리 길이만 조정해서는 비대칭 형태가 되지 않는다.
- 직접 SVG의 여러 줄 본문은 **줄마다 독립 `<text x="…" y="…">`**로 배치하고 같은 문단 그룹으로 묶는 경로를 우선한다. 여러 `tspan`의 x/y만으로 줄바꿈하면 일부 Vectora 가져오기에서 한 줄로 합쳐진다. 그런 표현을 사용했다면 실제 Editor에서 줄 수·줄 위치를 검증해야 한다. 외부 SVG 미리보기나 문자 내용의 재열기 일치만으로 조판 보존을 판정하지 않는다.
- 인물·삽화는 포함된 PNG/JPEG `<image>`로 가져올 수 있다. 이미지 자동 맞춤/상위 배율을 확인하고 비례 크기와 위치를 맞춘다. 벡터 전용 인물 자산 등록 기능이 래스터를 거부하면 등록을 위해 억지로 추적하지 말고 일반 이미지 개체로 배치한다.
- SVG `<pattern>`, `<textPath>`, filter/mask는 보존이 보장되지 않는다. 무늬는 실제 원/선과 클리핑, 세로 지표명은 직립 문자별 개행으로 구현한다. 문자·그래프·모식도의 효과를 평탄화해 편집성을 숨기지 않는다. 인물·삽화 원화 사용은 허용한다.

## 실제 폰트와 기호

`UNDv21-Regular`가 정확한 PostScript face다. Mac 내부 family 이름과 표시 family가 달라 단순한 이름 지정만으로 대체 폰트가 렌더될 수 있다. 기존 `src/core/fonts.ts`의 로딩 경로 또는 fontkit/로컬 face로 실제 자폭을 측정한다. 웹 폰트 다운로드나 폰트 바이너리 임베드는 하지 않는다.

- `familyAvailable/styleAvailable/weightAvailable/supportsText=true`, missingGlyphs 없음과 실제 보이는 글리프를 함께 확인한다.
- 현재 face에서 미지원인 음수 `−`는 같은 의미의 `-`, 구분점 `·`는 같은 용도의 `ㆍ`로 바꿀 수 있으며 변환을 그림 밖에 기록한다. 다른 글자를 임의 치환하지 않는다.
- UND의 대괄호가 다른 기호로 보이는 경우, 괄호만 벡터 선으로 그리고 안쪽 문자는 살아 있게 조판한다. 전용 자료 식별 기호 입력은 공통 원칙을 따른다.

프로젝트 로컬 검사: `python3 skills/create-kice-illustration/scripts/audit_svg.py <완성.svg> --font <UND-Regular.ttf>`. 순수 벡터 납품 요청에만 `--require-pure-vector`를 추가한다. 기본 검사는 포함된 PNG/JPEG 원화를 허용한다. 필요한 Python 패키지가 없으면 설치 대신 이용 가능한 런타임부터 확인한다. 검사가 통과해도 8pt/간격/화풍 검수를 생략하지 않는다.

## 줄 수만 주어진 예약 높이 측정

사용 가능한 `vectora_measure_text`는 실제 설치 폰트로 메모리상의 텍스트 상자를 조판해 측정하며 문서에는 삽입하지 않는다. N줄의 짧은 한글 측정 문구와 `widthMm`, `fontPt: 8`, `tracking: -60`, 선택한 `lineHeight`를 전달한다. 미지정 행간의 현재 제작 서비스 기본값은 `lineHeight: 1.24`이며 측정과 후속 조판에 같은 값을 쓴다. 이는 공식 평가원 행간 규정이 아니다.

`measurementAvailable=true`, `font.verified=true`, 누락 글리프 없음, 실제 `lines.length === N`을 확인하고 **`frameBounds.heightMm`**를 예약 높이로 사용한다. `inkBounds`나 기준선 간격만 사용하지 않는다. 도구가 없으면 실제 UND를 로드한 Editor에서 같은 설정의 임시 텍스트 상자를 만들고 배율 1의 높이를 mm로 측정한다. 임시 개체는 결과에 저장하기 전에 제거한다. 고정 `N×글자 크기` 공식이나 다른 폰트 측정으로 대신하지 않는다.

## 저장과 검증

[공통 결과 파일 규칙](common.md#결과-파일과-저장-위치)으로 저장 폴더와 파일명 본체를 먼저 확정한다.

1. 실제 Editor에서 글꼴·개체·선·배치와 복합형 각 요소를 검수한다. 최종 문서를 `vectora_save({documentId,path:"/저장폴더/이름.vectora",format:"vectora"})`로 저장하고 실제 성공 응답과 파일 존재를 확인한다. SVG의 확장자만 `.vectora`로 바꾸지 않는다.
2. 저장한 `.vectora`를 `vectora_open_document`로 다시 열어 문자·도형·이미지·그룹·물리 크기와 원화 포함 여부를 확인한다. 원화의 임시 파일이 없어도 이미지가 유지되어야 한다.
3. 재열어 확인한 문서 ID로 `vectora_export({documentId,path:"/저장폴더/이름.jpeg",format:"jpeg",scale:4,transparent:false})`를 실행한다. 흰 바탕으로 내보내되 의도된 장면 배경은 보존한다. 사용자 배율/크기가 있으면 4배 대신 그 값을 적용한다. 여러 대지가 있는 기존 파일이면 요청한 완성 그림의 `artboardId`를 명시한다.
4. 실제 JPEG 파일을 열어 글·선·여백·해상도·잘림과 저장본 일치를 확인한다. 후속 수정이 생기면 `.vectora` 저장과 재열기, JPEG 내보내기를 다시 수행해 둘이 같은 최종 상태가 되게 한다.
5. 같은 폴더·같은 이름의 두 파일과 실제 저장 경로를 확인하고 JPEG를 대화창에 이미지로 표시한다. `.vectora`는 파일 링크로 제공한다. 폴더는 호출 전에 존재해야 하며 기존 파일 교체는 허용된 대상에만 `overwrite:true`로 지정한다.

MCP가 없으면 실제 Vectora 앱의 저장·재열기·JPEG 내보내기로 같은 순서를 수행한다. 외부 SVG 미리보기만으로 저장/재열기/내보내기 완료를 주장하지 않는다. 작업용 SVG를 사용한 경우에도 mm와 viewBox, 실제 물리 크기를 보존해 가져온다.

`vectora_export(format:pdf, outlineText:true)`는 원본 문자를 보존한 윤곽선 출력 경로다. 편집 원본을 먼저 보관한다. 저장 경로/성공 응답/재열기 상태를 구분해 기록하고 기존 파일은 요청 범위에서만 변경한다.
