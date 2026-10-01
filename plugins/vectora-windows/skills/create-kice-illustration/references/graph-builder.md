# 선택 도구: 데이터 그래프

공통/그래프 원칙을 읽은 뒤 사용한다. 이 도구는 새 입력 데이터로 벡터와 살아 있는 UND 문자를 만들며 예시 그림/예시 JSON을 읽을 필요가 없다. 이번 데이터에서 입력을 작성한다.

프로젝트 루트: `node skills/create-kice-illustration/scripts/build_graph.mjs --spec <입력.json> --output <그래프.svg> [--font <UND-Regular.ttf>]`.
모듈: `buildGraph(spec, {fontPath})` → `{svg, report}`. 출력은 mm SVG와 `.layout.json`. 실제 로컬 UND Regular와 fontkit을 사용한다. 기존 파일은 `--force` 없이 덮어쓰지 않는다.

## 입력 계약

| 공통 필드 | 값/의미 |
|---|---|
| type | bar / pie / line |
| dataFidelity | exact(입력 숫자) / approximate(추정 숫자) / relative(수치 없는 상대 표현) |
| series | 계열 배열. 고유 label, fill(6색), pattern(none/dots/hatch), line(solid/dash/dash-dot), marker(circle/triangle/square/open-square) |
| widthMm / plotHeightMm | 폭 40–108 / 표시 높이 15–200. 원에서는 최대 지름 역할 |
| strokePt | 개형 0.6 / 0.7 / 0.8 |
| legend | none / right / center(원 두 개일 때) |
| domain / ticks | [min,max] / 범위 안 오름차순 눈금 |
| grid / unit | 그래프 원칙에 따라 수치 비교에는 grid:true를 명시 / 단위 원문 |
| panelGapMm | 패널 사이 mm |
| source | 그림 밖 보고서의 데이터 출처. 참고 이미지 선택 필드가 아님 |

- **bar horizontal:** `categories` 항목명 배열과 계열별 `values`. 0부터 시작하는 domain. valueLabels 선택.
- **bar panels:** `panels:[{label,values}]`, values 순서는 series와 같음. 같은 척도의 1–4패널. 숫자 눈금은 지원하지 않음.
- **bar mirror:** panels와 같은 구조, 정확히 두 패널·범례 없음. 좌우 공통 척도와 중앙 series.label. 양수 값만 지원.
- **pie:** `panels:[{label,values,outside?}]`, 각 합 100. 동일 지름. `outside:[계열인덱스]`는 특정 외부 라벨 지정. `labelMode:category-percent/percent`. 0/100 지원. relative와 원 사선은 미지원.
- **line:** x 표시 문자열 배열, 계열별 values(결측 null), 선택 xValues 실제 증가 좌표. xAxis zero/bottom, xLabelsAt axis/bottom, yTitle 직립 세로 지표명, xTitle 축 이름. arrows 선택. labelMode end/legend, valueLabels, 계열별 labels로 소수 표기 보존.
- `labelOffsets[계열][시점]=[dx,dy]`는 예외적으로 **문서 px**. 수치 라벨 위치만 이동한다. 끝 이름이 겹치면 높이/범례/배치를 조정한다.

원 비율 합계·축 범위·라벨 충돌·글리프가 잘못되면 오류다. 원 값을 자동 정규화하지 않는다. relative 자료에 숫자 눈금/수치 라벨을 추가하지 않는다. bar panels처럼 도구가 필요한 눈금/보조선을 지원하지 않으면 공통 척도로 편집 가능한 선·숫자를 추가하거나 직접 구성한다. 도구의 지원 한계 때문에 그래프 원칙의 보조선을 생략하지 않는다. 지원하지 않는 누적·음수 막대·축 생략·자료점 전용·여러 행 구성은 같은 원칙으로 직접 벡터를 계산한다.

## 출력 해석과 한계

`report`의 geometry는 수치 좌표, textBounds는 도구 측정 경계, substitutions/vectorGlyphs는 실제 문자 변환 기록이다. `checks`는 제한된 수치·충돌 검사이며 `requiresVisualReview`는 true다. Editor 실제 폰트와 렌더에서 다시 확인한다. 규격을 맞추기 위해 글과 획을 전체 축소하지 않는다.

무늬는 원/선, 표식은 도형으로 생성한다. 점 간격/마커/화살촉의 기본값은 조정 가능한 제작값이며 공식 치수가 아니다. 가져오기 후 텍스트·기하·물리 크기·편집성을 확인한다. 스타일을 바꾸려면 데이터와 도형 대응을 유지한다.
