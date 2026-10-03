# 승인 지도 바탕 실행

.vectora 양식 또는 지도 바탕 SVG를 실제 편집할 때 읽는다. 공통 스타일·문자·지리 원칙은 [지도 공통](map-illustrations.md), 저장·재열기·JPEG 납품은 [실행 계약](vectora-contract.md)을 따른다.

## 바탕 선택: 필요한 manifest 하나만

- [library index](../assets/maps/library/index.json)에서 요청 범위·고정 도법·상세도에 맞는 항목을 고른 뒤 **선택한 항목의 manifest 하나와 해당 SVG만** 읽는다. index는 지리 바탕 목록이며 기출 예시 카탈로그가 아니다. 전체 manifest를 순회하거나 파일명·자산 수를 고정하지 않는다.
- manifest의 `schema`와 실제 존재하는 파일·출처·권리·좌표 계약을 확인한다. 일반 template은 `svg`·`sha256`·`bytes`, `source`의 원자료 revision·해시·resolution, `projection`, `viewBox`, `widthMm/heightMm`, `gaps`를 확인하고, source variant는 아래 특수 양식 분기를 따른다. `status`·`nativeValidation`의 pending을 import/save/reopen/export 통과로 해석하지 않는다.
- `countries`가 국가 객체 배열인 양식만 해당 범위의 `countries`에서 국가명·ISO·source feature와 `partIds`를 대조한다. `visiblePartCount`는 이 창에 보이는 부분 수이며 원자료 전체 섬의 존재 보증이 아니다. 대상이 없으면 추정 경로를 선택하지 않는다.
- 원본 자산은 보존하고 작업 문서에 `vectora_import_svg`로 가져온다. `inspect`로 실제 객체 ID·이름·계층·mask를 확인하고 실제 그룹 ID를 우선해 대응시킨다. 이름 없는 단일 자식 그룹 등 일부 raw SVG 구조에서는 그룹이 합쳐져 그룹 ID가 자식에 남을 수 있다. 실제 inspect에서 그런 차이가 있을 때만 그룹 ID·경로 기하와 manifest를 대조하며, 누락된 part ID만으로 지리 면 누락을 판정하지 않는다. ID 변경/중복 또는 대응 불확실성이 있으면 추측 선택을 중단한다.
- 새 범위가 필요하면 기존 확보 권한으로 출처·권리·정확도를 검증한 별도 바탕을 마련한다. 아직 없는 helper·planner·map kind나 projection API를 호출 지침으로 만들지 않는다.

SVG의 `data-ne-id` 등 임의 `data-*` 속성은 native 저장에 보존되지 않는다. 원자료 feature ID·출처·좌표 등록 등 메타데이터는 manifest sidecar에 유지하고, native 객체 ID·이름과 별도로 대응시킨다.

- 큰 지도는 먼저 `vectora_inspect`의 `includeObjects:false`로 revision·루트 요약을 확인하고, 필요한 역할·국가의 실제 ID만 `objectIds:Array<string>`로 필터링해 `includeObjects:true`/`includeGeometry:true` 상세를 읽는다. 전체 대형 지도의 모든 경로·노드·geometry를 한꺼번에 조회하지 않는다.

## 강조 방식 구분

### 기존 세계지도: 회색 면을 앞으로

- [world_continents.vectora](../assets/maps/world_continents.vectora)를 별도 작업본으로 연다. 흰 육지·실선 해안·점선 국경 그룹 아래의 회색 ‘경로’는 숨김이 아니라 가려진 강조 면이다.
- 작업본에서 윤곽·위치·본토·섬·인접국을 확인한 회색 면만 `bringFront`한다. 동일 이름·배열 순서·좌표 상자만으로 국가를 단정하지 않는다. 요청 범위의 분리면도 포함한다.
- 필요한 채움 없는 해안/국경 선은 위에 보존한다. 흰 육지 전체를 다시 앞으로 올려 강조를 덮지 않는다. 이 양식의 회색 `#AAAAAA`·바다 `#EEEEEE`는 다른 바탕의 강제값이 아니다.

### 새 SVG 양식: 국가 면의 채움 변경

- manifest의 `countries[].id`를 실제 inspect의 국가 그룹 ID·기하와 먼저 대응시킨다. 복수 자식이면 **실제로 존재하는 해당 면 path 전부**를 선택하고, 단일 자식 collapse로 국가 그룹 ID가 path에 남았으면 그 path를 선택해 `style.values.fill`을 변경한다. `partIds`는 실제 inspect에서 보존·대응이 확인되면 실행 ID로 사용할 수 있다. 해당 구조에서 collapse가 확인된 경우에만 실제 객체 ID로 대응시킨다. 그룹 fill 변경이 자식의 명시 fill을 덮는다고 가정하지 않는다. 이 방식에 기존 세계지도의 회색 면 `bringFront`를 적용하지 않는다.
- `highlightEdit`와 `svgGroupIds`의 실제 구조를 따른다. 별도 강조 overlay가 필요하면 `highlights`에 대응하는 계층에 두고 coastline/national-boundaries 아래를 유지한다.
- 인접국 오채움·분리면 누락·선 가림을 확인한다. 면과 경계가 합쳐진 다른 SVG에는 이 독립 레이어 구조를 가정하지 않는다.

### 출처 SVG 기반 특수 양식

- 먼저 선택한 manifest의 `schema`를 확인한다. `vectora-map-template/v1`의 국가 객체 대응과 달리, `library/source-variants/`의 `vectora-map-source-variant/v1`은 `countries`가 ISO 문자열 배열 또는 빈 배열이다. 이 목록에 `countries[].id/partIds` 명령을 적용하지 않는다.
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
- 작업본의 바탕과 강조 면을 맨 위 mask와 함께 선택해 `clip`한다. 창 밖 경로를 삭제하거나 래스터 crop·대지 축소만으로 대신하지 않는다.
- 현재 clip mask는 문서 좌표 기준이다. 클립 후 그룹만 이동/축소하지 말고 mask와 기하의 정합을 확인하거나 변환 후 다시 클립한다. 기존 SVG mask도 실제 가져오기 상태를 확인한다.
- 보이는 창과 그룹 선택 상자는 다를 수 있다. 테두리는 창에 맞춘 독립 선, 문자·인출선은 클립 그룹 위의 편집 가능한 요소로 둔다.

- 외부 SVG는 경로 기하·ID 보존 검사만으로 통과시키지 말고 실제 Vectora에서 내보낸 JPEG를 확인한다. 누적 축소/확대 변환으로 선 굵기가 달라지면 변환을 경로 좌표에 정규화하거나 작업본의 최종 선 굵기를 재설정한 뒤 저장·재열기·JPEG 확인을 수행한다.

## 반복 편집 전처리 단축

- 실제 [map-template-edit.py](../scripts/map-template-edit.py)를 표준 Python으로 실행한다. `--list --iso KOR`, `--source-kind`, `--projection`으로 바탕 후보를 좁힌 뒤 선택한 manifest만 확인한다.
- 지리 데이터 기반 양식은 `--template <id> --output <new.svg> --highlight KOR JPN --national none|solid|dashed --admin show|hide`로 국가 채움·기존 경계 표시를 전처리할 수 있다. output은 library 밖의 새 파일이며 원본을 덮어쓰지 않는다.
- source variants는 조회만 지원한다. 결과 SVG를 실제 Vectora로 가져와 검사하며, 이 helper를 도법·좌표 생성 API나 native 저장/재열기/출력 검증으로 설명하지 않는다.

## 추가 표현이 있을 때만

- 점·라벨·범례는 독립 `add` ellipse/polygon/path/text/rect로 만든다. 이는 자동 위경도 변환·지리 join이 아니다.
- 점/해칭은 production create의 `spec:{kind:"pattern",sourceId,pattern:"dots"|"hatch",spacingMm,...}`를 사용한다. 점 `dotDiameterMm`, 해칭 `strokePt`와 계약의 `angle`을 지정한다. 실제 marks와 clip이며 통계 단위점 개수를 자동 보장하지 않는다. 추가 옵션·상한은 연결본 guide의 pattern 절만 읽는다.
- 확대 삽입/복수 view는 [조판](map-layouts.md)을 읽는다. 원형 magnify는 `sourceId,sourceRegionMm,targetRegionMm`의 문서 범위 복제이고 각 region은 `xMm,yMm,widthMm,heightMm`다. 사각 view는 별도 작업본과 clip으로 구성한다. 새 상세도·투영은 생성하지 않는다.
- native graph가 필요하면 [그래프 실행](graph-venn-production.md)의 해당 절만 읽는다. 최신 문서 ID·revision·requestId와 단위는 공통 실행 계약을 따른다.
