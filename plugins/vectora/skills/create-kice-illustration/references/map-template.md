# 지도 프리셋과 바탕 참고

지도 양식이 필요하면 UND 메뉴의 프리셋 목록에서 골라 새 문서를 시작한다. 공통 스타일·문자·지리 원칙은 [지도 공통](map-illustrations.md), 저장·재열기·JPEG 납품은 [실행 계약](vectora-contract.md)을 따른다.

## 프리셋 선택과 새 문서

- `vectora_list_presets({})`를 category 필터 없이 호출한다. 이 목록은 UND 메뉴의 새 도식 프리셋과 같은 현재 OS 사용자 카탈로그이며 연결본에 따라 map category 지원이 다르므로 범주 필터를 걸지 않는다. 실제 반환 목록의 이름(title/name)·설명·ID만 사용하고 사용자별 ID나 지도 양식 수를 하드코딩하지 않는다.
- 요청 범위·경계·도법·상세도에 맞는 실제 목록 항목을 고른다. 지도 planner가 같은 `presetId`의 등록 바탕을 제공하면 [지도 production 실행](map-production.md)으로 같은 프리셋에서 새 관리 지도를 만든다. 대응이 없거나 일반 벡터 편집이 필요하면 `vectora_create_preset({presetId:실제 ID,name?:작업명})`으로 새 격리 문서를 연다. 두 경로의 바탕을 한 문서에 중복 삽입하지 않는다. 실제 documentId·revision·객체·mask를 확인한다.
- 사용자가 이번 작업용 별도 파일을 명시했다면 그 파일을 우선한다. 그 외에는 `world_continents.vectora`나 library SVG를 직접 열거나 `vectora_import_svg`로 가져와 제작을 시작하지 않는다.
- 카탈로그의 그룹·출처 메타데이터는 실제 반환 필드가 있을 때만 해석한다. `category`·`source`를 지리 역할/국가 binding으로 해석하거나 없는 group 필드를 만들어내지 않는다.
- 소스의 프리셋 구현·자산 목록은 실행 번들의 카탈로그와 다를 수 있다. 지도 planner의 template 목록도 UND 프리셋 목록이 아니다. 실제 프리셋 조회 결과만 시작 가능 여부의 근거로 사용한다.
- 한 저상세 프리셋에 작은 국가·지역 면이 없다고 전체 제작 불가로 단정하지 않는다. 실제 목록과 대응 index에서 범위·상세도에 맞는 대체 지역 프리셋을 찾고, 그 항목의 manifest만 확인한다. 목록 조회가 불가능하거나 후보가 없으면 해당 범위·상세도 한계를 알린다. 원본 SVG를 조용히 대체 경로로 사용하거나 프리셋을 사용했다고 말하지 않는다.

## 실행 경로 선택

실제 프리셋과 출처를 확인한 뒤, planner에서 동일 `presetId`를 찾을 수 있으면 [지도 production 실행](map-production.md)을 읽는다. 국가·역할·도법·위경도 지원은 해당 template의 등록 정보로 판정한다. 선택한 바탕을 world_continents로 바꾸지 않는다. 아래 일반 선택·style·clip은 신도구가 없는 설치 앱과 다른 양식의 기존 편집 경로다. 관리되는 map 컴포넌트에는 일반 경로 이동·클립을 무조건 적용하지 않고 해당 실행 문서의 binding 보존 규칙을 따른다.

## 선택 양식의 출처와 manifest 참고

등록 바탕은 현재 planner의 `source/notes/registration`을 먼저 읽는다. 외부 SVG 교체본의 현재 해시·도법·국가·레이어 정보가 예전 library와 다르면 현재 등록 정보를 따른다. 아래 고정 SVG/manifest 절은 자동 제작 대응이 없는 일반 편집 경로에서만 읽는다.

- 기존 지도 자산과 manifest는 보존한다. 선택한 프리셋의 이름·설명과 대응하는 바탕을 확인한 경우에만 [library index](../assets/maps/library/index.json)에서 해당 항목을 찾아 manifest 하나와 연결 SVG를 출처·권리·경계·투영·상세도·ID 설명의 참고로 읽는다. 전체 manifest를 순회하거나 파일명·자산 수를 고정하지 않는다. 대응이 모호하면 임의로 연결하지 않는다.
- manifest의 `schema`와 실제 존재하는 파일·출처·권리·좌표 계약을 확인한다. 일반 template은 `svg`·`sha256`·`bytes`, `source`의 원자료 revision·해시·resolution, `projection`, `viewBox`, `widthMm/heightMm`, `gaps`를 확인하고, source variant는 아래 특수 양식 분기를 따른다. `status`·`nativeValidation`의 pending은 원본 자산 상태이며 새 프리셋 문서의 inspect/save/reopen/export 검증을 뜻하지 않는다.
- `countries`가 국가 객체 배열인 원본 양식만 해당 범위의 `countries`에서 국가명·ISO·source feature와 `partIds`를 대조한다. `visiblePartCount`는 이 창에 보이는 부분 수이며 원자료 전체 섬의 존재 보증이 아니다. 대상이 없으면 추정 경로를 선택하지 않는다.
- Manifest의 ID는 출처 정보이며 새 문서의 편집 ID는 inspect 결과를 사용한다. inspect에서 단일 자식 collapse로 manifest ID가 자식 경로에 남은 것이 확인되면 그 ID·기하와 manifest를 대조한다. 누락된 part ID만으로 지리 면 누락을 판단하지 않으며, ID 변경·중복 또는 대응이 모호하면 추측 선택을 중단한다.
- 새 범위·도법이 프리셋에서 지원되지 않으면 그 한계를 알린다. 승인 양식 W0/W1의 기능 확인과 실행은 [지도 production 실행](map-production.md)에 한정한다. 다른 프리셋이나 helper에 같은 planner·map kind·projection 지원을 가정하지 않는다.

SVG의 `data-ne-id` 등 임의 `data-*` 속성은 native 저장에 보존되지 않는다. 원자료 feature ID·출처·좌표 등록 등 메타데이터는 manifest sidecar에 유지하고, native 객체 ID·이름과 별도로 대응시킨다.

- 큰 지도는 먼저 `vectora_inspect`의 `includeObjects:false`로 revision·루트 요약을 확인하고, 필요한 역할·국가의 실제 ID만 `objectIds:Array<string>`로 필터링해 `includeObjects:true`/`includeGeometry:true` 상세를 읽는다. 전체 대형 지도의 모든 경로·노드·geometry를 한꺼번에 조회하지 않는다.

## 강조 방식 구분

### 세계지도 출처를 참조하는 양식: 회색 면과 선의 대응

- 선택 프리셋이 [world_continents.vectora](../assets/maps/world_continents.vectora)에서 왔음이 확인된 경우에만 원본의 레이어 설명을 참고한다. 원본을 편집 문서로 직접 열지 않는다. 흰 육지·실선 해안·점선 국경 아래 회색 경로는 가려진 강조 면일 수 있다.
- 새 문서에서 inspect한 윤곽·위치·본토·섬·인접국과 실제 ID를 대조한 면만 `bringFront`한다. 동일 이름·배열 순서·좌표 상자만으로 국가나 ID 대응을 단정하지 않는다. 요청 범위의 분리면도 확인한다.
- 필요한 채움 없는 해안/국경 선은 위에 보존한다. 흰 육지 전체를 다시 앞으로 올려 강조를 덮지 않는다. 이 양식의 회색 `#AAAAAA`·바다 `#EEEEEE`는 다른 바탕의 강제값이 아니다.

### 원본 국가 면 정보: 프리셋과 대응이 확인될 때

- 선택 프리셋과 대응하는 원본 manifest의 `countries[].id`를 새 문서의 실제 inspect 결과와 기하로 대응한다. 복수 자식이면 **실제로 존재하는 해당 면 path 전부**를 선택하고, ID 대응이 확인된 경우에만 `style.values.fill`을 변경한다. `partIds`도 실제 inspect에서 같은 개체임이 확인된 경우만 실행 ID로 쓴다. 그룹 fill이 자식의 명시 fill을 덮는다고 가정하지 않는다. 이 방식에 기존 세계지도의 회색 면 `bringFront`를 적용하지 않는다.
- `highlightEdit`와 `svgGroupIds`의 실제 구조를 따른다. 별도 강조 overlay가 필요하면 `highlights`에 대응하는 계층에 두고 coastline/national-boundaries 아래를 유지한다.
- 인접국 오채움·분리면 누락·선 가림을 확인한다. 면과 경계가 합쳐진 다른 SVG에는 이 독립 레이어 구조를 가정하지 않는다.

### 선택 프리셋의 출처 SVG 기반 특수 양식

- 프리셋과 대응하는 manifest의 `schema`를 확인한다. `vectora-map-template/v1`의 국가 객체 대응과 달리, `library/source-variants/`의 `vectora-map-source-variant/v1`은 `countries`가 ISO 문자열 배열 또는 빈 배열이다. 이 목록에 `countries[].id/partIds` 명령을 적용하지 않는다.
- source variant의 물리 치수·좌표는 `coordinateManifest.widthMm/heightMm`와 `originalViewBox/outputViewBox` 등 실제 필드로 확인한다. `source`의 출처/권리 필드와 `derivativeLicense`도 해당 manifest에 있는 계약만 따른다. 일반 template의 최상위 viewBox·source 필드 구조를 강제하지 않는다.
- 국가 객체 매핑이 없는 판 경계·빙하 등의 역할은 source group의 `data-name`과 실제 `inspect`의 이름·그룹 ID·기하로 선택한다. `roles`만으로 객체 ID를 만들어내지 않으며, 수치 경위도 등록이 unavailable이면 원 SVG 좌표를 보존한 조판만 수행한다.
- `countries`가 없다는 이유만으로 사용 불가로 판단하지 않는다. 출처 SVG를 바탕으로 만든 특수 양식은 manifest의 출처·권리·해시·범위·사용 제약과 실제 inspect의 경로·그룹 구조를 확인해 사용한다.
- 국가 ID 대응이 없는 양식은 국가 자동 선택이나 국가별 채움을 보장하지 않는다. 확인 가능한 면·선·문자·클립을 해당 양식의 역할에 맞게 편집하고, 불확실한 국가 대응이나 좌표 등록은 추정하지 않는다.
- 도법은 실제 manifest에서 확인된 값만 사용하며 명시되지 않은 경우 unknown으로 남긴다. 기하를 보존한 조판은 가능하지만 정밀 좌표 배치는 등록 근거가 필요하다.

## 독립 레이어 표시와 스타일

`svgGroupIds`를 실제 inspect의 ID·계층과 대응시켜 sea/country-fills/highlights/lakes/rivers/coastline/national-boundaries/admin-boundaries/graticule/frame 중 **실제로 존재하는 역할만** 선택한다. 해당 구조에서 단일 자식 collapse가 확인되면 역할 그룹 ID가 남은 실제 객체를 사용한다. `roles`의 개수와 빈 그룹을 지리 정보 존재의 보증으로 해석하지 않는다. 기존 세계지도는 inspect로 ‘내부 경계’와 ‘외곽선’을 구별하며 그 이름·경로 수를 새 SVG에 적용하지 않는다.

| 작업 | 현재 일반 MCP 경로 |
|---|---|
| 역할 on/off | 현재 가시성을 확인하고 `layer {id,action:"visible"}` 토글; 선택 요소 off는 `hideSelection` |
| 국경 실선/점선 | 경계 자식 path 선택 후 `style.values.strokeDashArray:[]` / 요청한 양의 길이 배열 |
| 해안·하천·격자 | 해당 역할의 자식 path만 선택해 stroke·굵기·선종류 적용 |
| 바다 tone | sea 자식 면의 `style.values.fill`; 대지 배경이면 `artboard {action:"update",id,values:{background:…}}` |
| 이름·선택 | `select {ids:[…]}` 후 `style.values.name`, 또는 `layer` rename |

일반 style에 `visible` 필드를 넣거나 `showAll`로 unrelated 숨김 요소까지 복원하지 않는다. 필요한 선은 공통의 검정 규칙을 따르고, 국경 변경을 해안·자연선에 전파하지 않는다. 수역색은 불투명 JPEG에서도 확인한다.

## 고정 도법·extent·제어점 XY

- `projection`의 name/implementation/inputCRS/rotation/center/centralMeridian/scale/translate/clipAngle/clipExtent/extentLonLat와 좌표 units를 그대로 확인한다. extent가 null인 반구·극 바탕은 경위도 직사각 범위로 임의 해석하지 않는다. 태평양 범위의 0–360 경도도 그대로 따른다.
- 현재 library의 `controlPoints[].lonlat`는 [경도,위도] degree, `xy`·`expectedXY`는 manifest가 명시한 **원 SVG viewBox 좌표**다. 현재 96px/in 바탕에서는 mm = px × 25.4/96이며 화면 픽셀이나 위경도 값이 아니다. errorPx는 자산 제어점 검사값이며 native import 검증이 아니다.
- 제어점과 같은 등록 위치를 표시할 때 지도와 점에 동일 crop/이동/등방 배율을 적용한다. 다른 위치는 동일 투영·파라미터·절단을 실제로 계산하는 확인된 수단이 필요하다. 몇 개의 controlPoints를 선형 보간해 임의 위경도를 정밀 배치하지 않는다.
- SVG는 **이미 고정 투영된 결과**다. import·crop·group 회전/늘이기는 동적 재투영·중심경도 변경·새 날짜변경선 절단을 수행하지 않는다. 다른 도법/중심은 해당 조건의 별도 검증 바탕을 선택한다.

## 범위와 편집 가능한 클립

- 원 좌표에서 crop를 정하고 `배율 = 최종 지도 창 폭 / crop 폭`, `창 높이 = crop 높이 × 같은 배율`로 배치한다. 지도·강조·등록 기호를 함께 변환하고 문자·범례는 독립 조판한다.
- 작업본의 바탕과 강조 면을 맨 위 mask와 함께 선택해 `clip`하고 창 밖 원기하를 보존한다. 출력 흐림을 감추려고 mask를 해제하거나 원기하를 삭제하지 않는다. clip을 풀어 창 밖 기하가 드러나는 것은 납품 해결이 아니며, 래스터 crop·대지 축소만으로 대신하지 않는다.
- 출력선이 흐리면 원기하·mask를 유지하고, 같은 좌표 등록의 원자료 벡터 경로에 동일 변환·정확한 창내 clip을 적용해 필요한 선만 독립 native vector overlay로 보완할 수 있다(자동 API 기능으로 가정하지 않는다). 래스터 따라그리기·눈대중 단순화·새 지형 창작은 금지한다. 경계 역할·실/파선·위치·면 정합과 저장·재열기·JPEG를 확인하며, 이를 입증할 수 없거나 흐림이 남으면 미통과다.
- 현재 clip mask는 문서 좌표 기준이다. 클립 후 그룹만 이동/축소하지 말고 mask와 기하의 정합을 확인하거나 변환 후 다시 클립한다. 기존 SVG mask도 실제 가져오기 상태를 확인한다.
- 보이는 창과 그룹 선택 상자는 다를 수 있다. 테두리는 창에 맞춘 독립 선, 문자·인출선은 클립 그룹 위의 편집 가능한 요소로 둔다.

- 외부 SVG는 경로 기하·ID 보존 검사만으로 통과시키지 말고 실제 Vectora에서 내보낸 JPEG를 확인한다. 중첩 축소·확대는 가능하면 선 스타일을 먼저 정한 뒤 동일 배율로 변환한다. 변환 후 스타일을 수정했다면 저장 전후 지리·면·선 정합을 재확인하고, 재열기에서 틀어지면 원 프리셋에 스타일을 먼저 적용해 복구한 뒤 지리 좌표 보존을 확인한다.

## helper의 조건부 사용

- [map-template-edit.py](../scripts/map-template-edit.py)는 사용자가 프리셋 등록 준비를 명시한 경우에 후보 조회와 새 SVG 준비에 사용하거나, 사용자가 편집 대상으로 지정한 별도 SVG 작업에만 사용한다. helper가 만든 SVG를 일반 지도 제작에서 프리셋 대신 가져와 시작하지 않는다.
- 이 helper를 도법·좌표 생성 API나 프리셋 문서의 native 저장/재열기/출력 검증으로 설명하지 않는다.

## 추가 표현이 있을 때만

- 점·라벨·범례는 독립 `add` ellipse/polygon/path/text/rect로 만든다. 이는 자동 위경도 변환·지리 join이 아니다.
- 점/해칭은 production create의 `spec:{kind:"pattern",sourceId,pattern:"dots"|"hatch",spacingMm,...}`를 사용한다. 점 `dotDiameterMm`, 해칭 `strokePt`와 계약의 `angle`을 지정한다. 실제 marks와 clip이며 통계 단위점 개수를 자동 보장하지 않는다. 추가 옵션·상한은 연결본 guide의 pattern 절만 읽는다.
- 확대 삽입/복수 view는 [조판](map-layouts.md)을 읽는다. 원형 magnify는 `sourceId,sourceRegionMm,targetRegionMm`의 문서 범위 복제이며 각 region은 `xMm,yMm,widthMm,heightMm`다. 더 높은 상세도가 필요하면 적합한 상세 지역 프리셋으로 별도 문서를 만들고, 삽입 위치와 주 지도의 원창이 같은 지리 범위에 대응하는지 검수한다. 사각 view는 별도 작업본과 clip으로 구성하며 새 상세도·투영을 임의 생성하지 않는다. 적합한 상세 프리셋이 없으면 외부 고해상도 공공 지리자료의 면·해안을 보완 레이어로 쓸 수 있다. 출처·권리·자료 시점·feature 정체성·CRS와 기존 바탕에 대한 투영·변환·control 정합을 확인하고, 원기하·clip을 보존해 실제 Vectora JPEG를 검수한다. 이를 입증할 수 없으면 상세도 한계로 보고하며 임의 선 생성·프리셋을 건너뛴 SVG 시작·새 도법의 앱 기능 주장은 하지 않는다.
- native graph가 필요하면 [그래프 실행](graph-venn-production.md)의 해당 절만 읽는다. 최신 문서 ID·revision·requestId와 단위는 공통 실행 계약을 따른다.
