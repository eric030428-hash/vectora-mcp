# 그래프·벤 실행

실제 앱 **Vectora 1.1.7**에서 확인한 실행 계약을 기준으로 한다.

스타일은 [공통](common.md)과 해당 [그래프](graph-illustrations.md)/[모식도](schematic-illustrations.md) 문서에 따른다. 여기서는 필요한 종류의 절만 읽는다. 앱 UI와 MCP는 같은 production 엔진을 사용한다. 새 그림은 별도 문서에서 시작하며 UI의 예시 수치·문구를 사용자 자료로 취급하지 않는다.

## 호출과 수정

- `vectora_production({documentId,expectedRevision,requestId,action:"create",spec})`. 문서 ID와 최신 revision은 실제 응답으로 얻고 새 편집마다 고유 requestId를 만든다. production의 `*Mm`/`*Pt`는 일반 편집의 `units`로 다시 환산하지 않는다.
- `vectora_inspect`에서 `production.components`의 실제 component `id`, 저장 `spec`, `roles`의 실제 개체 ID와 warnings를 읽는다. `includeGeometry:true`로 세계 좌표·외곽도 확인한다. component ID와 series ID를 혼동하지 않는다.
- 수정은 `vectora_production({documentId,expectedRevision,requestId,action:"update",id,patch,policy:"preserve"})`. 객체는 깊게 병합하고 배열은 통째로 교체한다. 생략은 유지, `null`은 선택 속성 삭제다. series 배열을 교체할 때 유지할 계열의 ID·값·스타일도 함께 보낸다. 종류 변경 시 이전 종류의 불필요한 옵션도 `null`로 지운다.
- `preserve`는 수동 위치·외형·문자/경로 편집을 유지할 수 있어 새 spec 값만으로 보이는 결과를 보증하지 않는다. warnings와 실제 렌더를 확인한다. `reset`은 사용자가 수동 편집 초기화를 원한 경우만 사용한다. 초기화는 새 spec으로 내부 요소를 재생성하며 component의 기존 배치·상위 변형을 지우는 명령이 아니다. 벤 UI는 preserve로 수정하며 MCP의 공통 update는 reset도 받는다.
- `vectora_status`에 스타일별 capability가 있다고 가정하지 않는다. 실제 연결본의 도구 스키마·응답을 확인한다. 지원 오류·폰트/측정 실패를 숨기거나 무시된 옵션을 지원한다고 보고하지 않는다. 일부 옵션만 미지원이면 허용되는 spec으로 수치·축·자료점·기본 서식을 최대한 생성하고, 반환된 실제 roles/개체 ID로 그 부분만 수정하거나 별도 편집 가능한 벡터·라벨을 보충한다. 그래프 전체를 raw SVG로 대체하지 않는다. 유형 자체의 기본 자료 관계를 엔진이 표현할 수 없거나 실제 생성 경로를 사용할 수 없을 때만 전체 대체한다. 내용 오류는 자료·허용 옵션을 바로잡는다.
- 후속 수정·보충도 저장 spec의 데이터와 계열 대응을 유지한다. 기존 component는 `update`의 preserve로 수동 수정이 유지되는지 확인하며 필요 없는 `detach`를 하지 않는다. 별도 보충 개체는 component의 자동 재배치 대상이 아니므로 데이터·폭·높이 변경 뒤 위치·라벨·척도·대응을 다시 검수한다.
- 두 생성기는 실제 UND Regular 8pt·자간 -60으로 측정하고 만든다. `fontPt` 등 임의 필드를 더해 축소하지 않는다. 폭·높이·범례·문구 배치를 조정하되 원문·값은 보존한다. 성공 후에도 preview의 글리프·선·파선·라벨·수치 위치, audit의 미확인 항목, 저장·재열기를 검수한다. 대지는 component에 맞춰 자동으로 커지지 않는다.

## 새 그래프

`spec`은 `kind:"graph"`, `chartStyle`, 아래의 `type`, `dataFidelity:"exact"|"approximate"`, `categories`와 `series`로 구성한다. 정확한 원자료를 값·좌표로 입력하고 표시만 반올림하면 `exact`이며, 사용자 제공 근삿값 또는 [실자료 조사에서 확인한 원자료를 반올림한 값](real-data.md) 자체를 입력으로 사용하면 `approximate`로 지정한다. `relative`는 새 chartStyle 계약에서 허용하지 않는다. 수치가 없는 개형을 임의 숫자로 변환하지 않는다.

| chartStyle | type | 조건·용도 |
|---|---|---|
| `column`, `bar` | `bar` | 세로/가로 묶음 막대 |
| `stacked-column`, `stacked-bar` | `bar` | 세로/가로 누적; 결측을 0으로 채우지 않음 |
| `percent-column`, `percent-bar` | `bar` | 항목별 100% 누적 |
| `line`, `smooth-line`, `step-line` | `line` | 직선/곡선/계단; 시점 2개 이상 |
| `stacked-area`, `percent-area` | `line` | 누적/100% 영역; 시점 2개 이상 |
| `horizontal-percent-area` | `line` | 가로 구성비·세로 시간축; 시점 2개 이상 |
| `bar-scatter` | `bar` | 계열별 `renderRole:"bar"|"line"|"scatter"|"area"`, `axis:"primary"|"secondary"` |
| `dumbbell` | `line` | 정확히 두 계열, 같은 primary 축의 두 시점 비교 |
| `bubble` | `line` | `points:[{x,y,size?,label?,fill?,labelOffsetMm?:{x,y}}]`; 크기는 비음수 |
| `radar` | `line` | 범주 3개 이상, 같은 primary 축 |

- `categories`는 빈 문자열이 아닌 1–200개, `series`는 1–8개. 계열마다 안정적인 고유 `id`(영문·숫자·`._:-`, 1–100자), 비어 있지 않은 `label`, 범주 수와 같은 길이의 `values` 배열(유한수 또는 `null`)이 필요하다. points를 쓰는 계열도 values 배열은 필수이며 모르는 값은 null로 둔다. 모든 points 합계는 5,000개 이하. 일반 그래프는 표시할 수치가 있어야 한다.
- `widthMm:18–108`, `plotHeightMm:15–200`, `strokePt:0.6|0.7|0.8`. 최종 문자는 고정 크기이며 좁은 폭은 실제 글·범례 때문에 거부될 수 있다. `domain:[min,max]`는 값 축, `ticks`는 그 축의 눈금이다. 가로 막대에서도 값 축 설정 이름은 domain/ticks이고 생략은 `axisBreaks.y`다. `xDomain`, `xTicks`는 독립축. 막대 값 축은 0을 포함하고 모든 수동 축은 표시할 데이터를 포함해야 한다.
- 기본 9스타일에서 수치 X축은 선 스타일에만 `chartOptions:{xNumeric:true}`와 엄격히 증가하는 `xValues`(범주 수와 같음)를 함께 사용한다. 영역 등 확장 스타일도 xValues는 엄격히 증가해야 한다. bubble/혼합의 개별 points.x는 관측 좌표다. 시간 간격을 임의 등간격 범주로 바꾸지 않는다.
- 백분율 스타일은 **항목별 제공 값의 합계로 100%를 계산**한다. 원본 합계가 반드시 100일 필요는 없지만 모든 값은 결측 없는 비음수이고 항목 합계는 양수여야 한다. 입력 수치를 저장한 채 비율을 렌더하므로 자료가 이미 백분율인지·절대량인지 먼저 구별하고 계산 결과를 대조한다. 백분율 값 축은 0–100이다. legacy pie의 합계 100 계약과 혼용하지 않는다.
- `fill`은 그래프 문서의 6색, `pattern:"none"|"dots"|"hatch"`, `line:"solid"|"dash"|"dash-dot"`, `marker:"none"|"circle"|"triangle"|"square"|"open-square"|"open-circle"|"open-triangle"`. 막대의 `categoryStyles:[{fill?,pattern?}]`는 항목별 재정의다. 표식 없는 기본 선 스타일에는 표식 무늬를 함께 쓰지 않는다.
- 생성기 기본 선종류도 [그래프의 파선 규격](graph-illustrations.md#필수-인쇄-표현)과 실제 속성을 대조한다. 특히 0.8pt 일점쇄선은 현재 엔진이 6/1/1/1pt로 출력할 수 있어 규정의 6/1.5/1.5/1.5pt에 맞게 실제 개체를 후속 편집해야 한다. 자동 생성 성공으로 이 차이를 합격 처리하지 않는다.
- `grid:true`, `chartOptions:{gridStyle:"dash"}`로 그래프 문서의 주요 눈금 보조선을 만든다. 이름이 `dot`인 옵션은 규정의 1.5/1pt 보조선과 다르므로 혼동하지 않는다. `valueLabels`, `xTitle`, `yTitle`, `unit`은 필요한 실제 내용만 지정한다. `chartOptions.labelDecimals`(0–10 정수)는 제공된 소수 자릿수에 맞춘다.
- 범례는 `legend:"above"|"beneath"|"right"|"inside"|"none"`. `chartOptions.legendAnchor`는 inside의 `top-left|top-right|bottom-left|bottom-right`, `legendReverse`는 순서 반전, `legendStyle:"swatch"|"label-fill"`은 견본/문구 배경 방식이다. 규격에 맞는 견본 상자에는 swatch를 우선하며 본체와 대응을 확인한다. 옛 `bottom`/`below` 별칭은 above로 해석되므로 아래에는 beneath를 명시한다.
- 혼합/버블의 secondary 계열은 `chartOptions.secondaryDomain`, `secondaryTicks`, `secondaryTitle`로 별도 축을 설정한다. secondary 옵션은 실제 secondary 계열이 있어야 하며 누적 영역·radar·dumbbell은 primary만 쓴다. bubble은 size가 없으면 기본 표식 크기로 그리므로 요청된 크기 데이터를 창작하지 않는다. `bubbleSizeScale`, `sizeLegend:[{value,label}]`, `sizeLegendTitle`, `sizeLegendPosition:"beneath"|"inside"|"right"`, `sizeLegendLayout:"row"|"nested"`는 bubble 전용이다.
- radar의 `chartOptions.scaffoldOnly:true`는 수치 없는 외곽 틀도 만들 수 있으며 `radarAxisLabels`와 계열 `labels`로 제공된 기호를 배치한다. values는 범주 수만큼 null로 둘 수 있다. 일반 radar만 수치 거리를 비교한다. `radarRings`, `radarStartAngle`, `radarClockwise`, `radarSpokeLine`은 radar 전용; `interpolation:"linear"|"step"`는 영역 전용; `reverseIndependentAxis`는 horizontal-percent-area 전용이다. 전용 옵션을 다른 스타일로 가져가지 않는다.
- `axisBreaks:{x?:{from,to,gapMm},y?:{from,to,gapMm}}`는 실제 생략 구간을 선언한다. 기본 범주 X 생략은 인접 범주 사이만 가능하며 가로 막대의 x 생략은 지원하지 않는다. 생략 안 관측은 숨겨질 수 있다. 생성 응답과 `vectora_inspect`의 component `warnings`에서 생략 구간으로 숨겨진 자료점·결측이 있는 누적 항목 안내를 읽고, 저장 `spec`의 원래 값과 실제 렌더를 대조한다. 결측이 있는 누적 항목은 입력된 값만 표시하므로 완전한 합계로 해석하지 않는다. 기간 표시는 `chartOptions.annotations:[{from,to,label,position:"above"|"below"}]`(최대 20개), 범주면 0부터 시작하는 인덱스·수치 X축이면 수치 좌표다. 기본 가로 막대에는 기간 표시를 사용하지 않는다.

**legacy와 구별:** chartStyle이 없으면 기존 `type:"bar"|"line"|"pie"|"points"` 엔진으로 라우팅한다. `layout`, `panels`, `x`, `yDomain`, `labelOffsets` 등 legacy 필드를 새 spec에 섞지 않는다. 새 16스타일에는 pie/도넛/거울 막대가 없다. 단순 원은 기존 pieChart, 기존 points/특수 그래프는 그 실제 계약으로 제작한다. 원/points 등 다른 생성 경로가 맞으면 해당 경로로 기본 구조를 먼저 만들고 미지원 부분만 보충한다. raw SVG로 가짜 chartStyle 지원을 붙이지 않는다. 새 그래프 UI 편집은 chartStyle이 있는 component를 대상으로 하므로 legacy를 새 UI에서 그대로 수정할 수 있다고 약속하지 않는다.

## 벤 다이어그램

`spec:{kind:"schematic",layout:"venn",sets:2|3,widthMm,setLabels,regions,regionFills?,regionPatterns?,universe?,legend?}`. nodes/edges는 필요 없다. `sets` 기본은 2, widthMm 기본은 70. 폭은 두 집합 40–108mm, 세 집합 50–108mm다. setLabels는 집합 수와 같은 개수의 서로 다른 비어 있지 않은 이름(각 한 줄 24자 이하)이다.

- regions는 값·문구를 **문자열**로 넣는다. 두 집합은 `A,B,AB,outside`, 세 집합은 `A,B,C,AB,AC,BC,ABC,outside`. 모두 **배타적 영역**이다. 세 집합의 A는 A만, AB는 `(A∩B)−C`, ABC는 세 집합 공통 부분이다. 제공된 전체 `A∩B` 수량을 AB 칸에 그대로 넣지 않는다. 합계/교집합 자료의 의미를 먼저 확정하고 필요한 영역값이 없으면 계산 근거 없이 채우지 않는다. 각 값은 4줄·160자 이하이고 빈 값/생략은 빈칸, 문자열 `"0"`은 실제 0이다.
- `regions.outside` 문구는 전체집합 사각형 없이도 원 밖에 표시할 수 있다. outside 면의 채움 또는 none 이외의 무늬에는 `universe:{title?}`가 필요하다. 사각형만은 `{}`, 제목은 한 줄 60자 이하. `universe:null`로 제거할 때 outside 채움·무늬도 함께 지운다.
- `regionFills`는 영역별 **소문자** `#ffffff,#f2f2f2,#e0e0e0,#cccccc,#b3b3b3,#999999,#808080` 또는 null이다. 벤은 모식도 팔레트로 그래프의 6색 검증 계약과 다르다. 값을 지워도 채움이 독립적으로 남을 수 있으므로 patch에 제거할 채움도 명시한다.
- `regionPatterns[key]:{type,spacingMm?,strokePt?}`. type은 `none,vertical,horizontal,rightDiagonal,leftDiagonal,grid,crossDiagonal,verticalRight,verticalLeft`. spacingMm 0.6–8, strokePt 0.1–1; 무늬가 필요하면 공통 선 규격에 맞게 `strokePt:0.3`을 명시한다(엔진 기본은 0.25). 실제 잘린 벡터 선이며 점 무늬는 지원하지 않는다. 영역 경계/문구 여백과 무늬를 최종 크기로 검수한다.
- 오른쪽 범례 `legend:{title?,rows:[{label,description}]}`는 최대 12행. label 한 줄 24자, description 최대 4줄 100자, title 한 줄 30자. 이것은 문자열 표식과 설명의 대응 표이며 regionPatterns를 자동으로 견본에 연결하지 않는다. 제목을 생략하면 엔진이 `〈범례〉`를 넣으므로 입력 없는 제목을 피하려면 `title:""`를 명시한다. widthMm은 본도식 폭이며 범례가 옆에 더해진 **전체**가 108mm 이하여야 한다. 범례 포함 가능한 공간이 부족하면 폭을 줄여 다시 측정한다; 108mm 도식에 범례를 붙일 수 있다고 약속하지 않는다.
- 3→2집합 변경은 setLabels 배열을 두 개로 교체하고 regions/regionFills/regionPatterns의 C, AC, BC, ABC를 각각 null로 지운다. 밖 영역·범례·전체집합을 끌 때도 각 선택 속성에 null을 보낸다. 빈 객체나 생략만으로 깊은 병합의 옛 값을 지우지 않는다.
- 원과 교집합은 고정 관계 배치이며 입력 수량으로 면적을 재계산하지 않는다. 과도한 문구는 실제 UND 측정에서 오류가 날 수 있다. 글자 축소·원문 요약·빈칸 답 추측으로 통과시키지 않는다. 포함·분리 관계 또는 비례 면적 요구는 이 생성기의 지원 범위 밖이다.
