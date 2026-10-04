# 지도

공간 기준 위 위치·분포·영역·이동을 표현한다. 비복합 제작의 지침은 `SKILL.md → 이 문서 → 선택한 하위유형 한 문서`로 끝난다. 도구의 실제 스키마·응답, 선택 자산의 manifest와 실제 자료는 확인할 수 있으나 다른 실행/규칙 문서를 추가로 읽지 않는다.

## 핵심 정보로 한 하위유형 선택

| 핵심 판독 정보 | 하위유형 |
|---|---|
| 점·기호·작은 위치 영역 | [location](../subtypes/map/location.md) |
| 명목 범주 영역·선택 국가 | [area](../subtypes/map/area.md) |
| 단계구분·비례기호·단위점·통계 분포 | [statistics](../subtypes/map/statistics.md) |
| 경로·연결·이동·네트워크 | [flow](../subtypes/map/flow.md) |
| 자연 분포·지형·하천·등치선·빙상·판 구조 | [physical](../subtypes/map/physical.md) |
| 도법·경위선·방위·시차 자체 | [projection](../subtypes/map/projection.md) |
| 역사적 지리·개념 공간 | [historical](../subtypes/map/historical.md) |

바탕 범위·국경·격자·원형 창은 정보 유형과 독립이다. 극중심 바탕의 단순 국가 강조는 area이며 projection을 추가로 읽지 않는다. 기본 라벨·범례·locator·확대창·같은 주제 비교 패널도 한 지도다. 독립적으로 판독하는 별도 주제 지도나 자체 축/수치 구조를 갖춘 지도 내 차트를 함께 요구하면 전역 복합 라우팅을 적용한다. 지형 입체도·단면도와 개념 자연물 그림은 실제 공간 분포 지도와 구별해 적합한 전역 유형으로 보낸다.

## 실제 프리셋에서 시작

1. `vectora_list_presets({})`를 category 필터 없이 조회해 UND 메뉴와 같은 현재 사용자 카탈로그의 실제 ID·이름·설명에서 범위·경계·도법·상세도에 맞는 항목을 고른다. 없는 group 필드를 만들거나 category/source를 지리 binding으로 해석하지 않는다. 목록·소스·planner 목록은 서로 다를 수 있다.
2. `vectora_map_plan({})`의 templates/capabilities와 대조한다. **선택한 기본 프리셋 ID = template.presetId**일 때만 그 `assetRef`로 plan을 조회해 defaultSpec·assetHash/sidecarHash·source/notes·registration·국가·roles·projection을 사용한다. 유사 이름/개인 프리셋을 임의 연결하거나 해시 오류를 우회하지 않는다.
3. 등록 production 경로는 `vectora_new_document`의 새 격리 문서에 같은 바탕의 관리 map을 한 번 create한다. 대응/도구가 없으면 `vectora_create_preset({presetId:실제 ID,name?:작업명})`의 일반 벡터 문서를 편집한다. 이미 연 일반 프리셋 위에 관리 지도를 중복 생성하지 않는다. 기존 관리 map은 inspect의 실제 component ID로 update한다.

등록 32종과 legacy `world_continents`의 부분 매핑을 구별한다. 32는 등록 기준선이며 현재 설치 목록/지원의 보증이나 고정 선택 제한이 아니다. legacy는 unregistered·CHN/JPN/KOR 부분 매핑이며 새 프리셋의 국가 ID를 넣지 않는다. 지원 여부는 버전/소스가 아닌 **연결본의 실제 capability**로 판정한다. geographic 등록만 WGS84 배치/재투영을 허용하고 unregistered는 원도법·문서 좌표에 한정한다. partial 국가 coverage는 영토/섬 완전성 보증이 아니다. `parts:["unclassified"]`이면 `islandPolicy:"all"`만 사용한다.

사용자 지정 별도 작업 파일은 우선한다. 그 외 library SVG나 `world_continents.vectora`를 직접 열기/import하여 프리셋 시작을 우회하지 않는다. 후보에 대상이 없으면 다른 적합한 실제 프리셋을 찾고, 목록 불가/후보 없음은 범위·상세도 한계로 남긴다. 검수용 기출·관찰 카탈로그·옛 측정표를 생성 의존성으로 삼지 않는다. `map-template-edit.py`는 명시된 프리셋 등록 준비 또는 사용자 지정 SVG 편집에만 사용하며 일반 제작의 프리셋 대체/투영 API가 아니다.

## 출처·역할·지리 등록

- 등록본은 현재 source/notes/registration과 해시를 우선한다. 같은 ID의 외부 교체본에 옛 library 좌표·도법을 섞지 않는다. 일반 편집은 선택 프리셋과 대응이 확인된 `assets/maps/library/index.json` 항목의 manifest 하나와 SVG만 조사한다. source revision·권리·변경 표시·해시·resolution·projection·치수·viewBox·gaps를 실제 schema로 확인한다. CC BY-SA 파생 조건도 지킨다. manifest의 pending/nativeValidation은 새 작업의 검증 결과가 아니다.
- 일반 `vectora-map-template/v1` 국가 객체의 ISO/source feature/partIds를 실제 경로와 대조한다. source variant `vectora-map-source-variant/v1`의 countries는 ISO 문자열/빈 배열일 수 있으므로 객체 id/partIds 계약을 강제하지 않는다. 치수는 coordinateManifest, originalViewBox/outputViewBox 등 실제 필드로 읽는다. source group의 data-name·실제 이름/ID·기하로 역할을 식별한다. roles 개수/빈 그룹은 정보 존재 보증이 아니며 국가 자동 선택을 보장하지 않는다.
- 선택본의 현재 source/notes/projection/registration·해시·실제 역할을 근거로 판단한다. 같은 ID라도 교체된 자료의 좌표·시점·도법·권리를 옛 자산에서 가져오지 않는다. 사용자가 보관 원본 파일을 명시적으로 제공한 경우에는 그 파일의 메타데이터와 실제 기하를 따른다. 도법명 확인과 수치 좌표 등록/API 지원은 각각 검증한다.
- source feature ID와 native 편집 ID를 구별한다. 단일 자식 collapse는 inspect로 확인한 실제 ID만 쓴다. 누락 part ID만으로 면 누락을 단정하지 않고 이름·순서·상자만으로 국가를 추정하지 않는다. SVG data-*는 native에 보존되지 않으므로 출처/좌표/feature 대응은 manifest sidecar에 유지한다. 큰 지도는 inspect `includeObjects:false` 요약 후 필요한 `objectIds`만 geometry 상세로 조회한다.
- 해안·섬·본토·이웃 지역과 분리면을 보존한다. 강조 국가/대상 전체가 절단선 한쪽과 창 안에 놓이도록 지원 도법·중앙 경도·crop을 제작 전에 선택한다. 지도·강조·등록 기호에 같은 crop/이동/등방 배율을 적용한다. 투영은 확정 근거가 없으면 unknown이며 원형/수평 위선만으로 이름을 정하지 않는다. 원 SVG는 고정 투영 결과다. 잘라내기·회전·늘이기는 재투영/새 중심경도/날짜변경선 절단이 아니다.
- controlPoints.lonlat는 [경도,위도] degree, xy/expectedXY는 manifest가 지정한 원 SVG viewBox 좌표다. errorPx는 자산 검사이지 native 검증이 아니다. 같은 제어점에는 같은 변환을 적용하고 임의 지점은 같은 투영·파라미터·clipping을 계산하는 확인된 수단으로 변환한다. 제어점 선형 보간/화면 비율로 정밀 위경도를 놓지 않는다. extent=null인 극/반구를 경위도 사각형으로 해석하지 않으며 기록된 0–360 경도도 보존한다.

## production 계획·반영·보존

실제 스키마를 확인하고 defaultSpec의 필요한 값만 수정한다. map spec의 식별 계약은 `kind:"map"`, `mapSchemaVersion:"vectora.map/v1"`, `mode:"template"`, assetRef/assetHash/sidecarRef/sidecarHash이며 `profileId:"kice-map"`이다.

- widthMm 기본 108, 현재 지원 1–108mm. 완성 폭은 별도 설명이 없으면 지시 문자/기호까지 포함한다. 범위 밖 요구를 조용히 108로 바꾸지 않는다. `cropDocumentMm:{x,y,width,height}`는 원문서 mm의 유한한 양의 대지 내부 범위, `frameMm`은 결과 지도 창이다. `s=창 폭/crop 폭`, `창 높이=crop 높이×s`로 동일 X/Y 배율을 적용한다. 폭/crop 변경 때 frame도 갱신하거나 create/plan에서 생략해 재계산한다. update 생략은 유지이므로 새 frame을 명시한다.
- 전용 대지에 완성 폭을 맞추면 `xMm:0,yMm:0` 등 실제 배치를 명시해 기본 오프셋 잘림을 막는다. 여백은 대지 치수에 포함하고 원점 포함 world bounds 네 변을 확인한다. 요청 종횡비는 **지도 창**에 적용하며 빈 대지 여백/비등방 왜곡으로 충족시키지 않는다. 도법/범위 때문에 불가능하면 미충족을 알린다.
- `verifiedIds`는 조회 국가 ID, islandPolicy는 all/mainOnly/excludeIslands, borderStyle은 none/solid/dashed다. highlightFill/oceanFill은 실제 지정 색이다. `layers:{역할:true|false}`는 실제 roles에만 사용하고 생략은 원가시성 유지다. internal-border 가시성과 borderStyle을 구별한다.
- overlays label/point의 document anchor `{kind:"document",xMm,yMm}`와 별도 anchors는 **원문서 mm**, crop 안 위치다. label의 offsetMm은 x/y, point는 radiusMm/fill 등 실제 스키마만 쓴다. ID를 유지하고 배열 patch는 전체 교체임을 고려한다. geographic anchor `{kind:"geographic",longitude,latitude}`는 WGS84 경도 −180~180°, 위도 −90~90°이며 바탕과 같은 투영/반구 clip을 적용한다. 뒤쪽/창 밖 점을 보이게 하려고 좌표를 바꾸지 않는다.
- `projection`은 원설정을 복사해 수정한 **완전한 객체**로 create/update하며 내부 일부만 patch하지 않는다. name/parallels 지원은 live capability로 확인한다. rotate=[경도회전,위도회전,롤]·center는 degree, 중심 경도 λ는 rotate[0]=−λ다. scale/translate/clipExtent는 원문서 96px/in 좌표, clipAngle은 degree/null이다. clipAngle=null은 구면 각도 제한 없음, 최상위 projection=null은 원도법 복원이다. 변경 시 지도·등록 주제층·geographic anchor를 동일 재투영하고 중심/clip/crop/frame을 함께 확인한다. document anchor는 따라가지 않으므로 재검수한다. 도법 변경은 없는 나라·LOD·자료를 생성하지 않는다.
- 원자료 이미지 px/aspect는 측정값이며 DPI 없는 px를 제작 mm로 추정하지 않는다.
- plan transform.xPx/yPx와 내부 recipe 값은 문서 px다. mm=px×25.4/96이며 화면 px가 아니다. *Mm 필드에 px를 넣거나 production을 apply.units로 다시 환산하지 않는다.

최신 inspect의 documentId/revision/실제 계층/production.components를 확인하고 `vectora_map_plan({documentId,spec})`의 정규화 spec·sourceHashes·selectedPaths·report를 검토한다. partial 사유를 남기고 blocked는 적용하지 않는다. plan은 삽입·revision 변경·자료 등록·폰트/렌더 검증이 아니며 selectedPaths의 소스 UUID는 편집 ID가 아니다.

`vectora_production` create는 documentId/expectedRevision/requestId/spec, 기존 update는 실제 component id/patch/`policy:"preserve"`를 사용한다. 같은 재시도는 같은 requestId, 별도 편집은 새 ID다. stale/만료 응답은 inspect로 반영 여부부터 확인해 중복 create를 막는다. 적용 후 실제 featureObjectIds/역할 계층·binding·coverage·수동 편집과 report를 확인한다. 실패 시 revision/개체/선택의 복원을 확인하고 외부 새 revision을 되돌리지 않는다.

preserve는 수동 스타일·고정 위치·부분 detach를 존중하며 미리보기/reset 전환과 실제 결과가 같다고 가정하지 않는다. 관리 원경로 이동·내부 view 변형·비균일 상위 배율/skew는 binding을 무효화할 수 있다. invalid에 preserve를 강행하거나 사용자 초기화 의도 없이 reset하지 않는다. 독립 편집 요청 대상만 실제 component/자식 ID로 detach한다. 부분 detach는 재생성에서 제외, 전체는 binding 제거다. 원자료 누락/미래 스키마의 unresolved 정적 그림을 자동 fetch/재생성하지 않는다.

## 경계·일반 편집·클립

- 바탕/수역/면/강조/해안/국경/행정 경계/자연·통계 주제선/격자/기호/문자/범례/clip을 독립 역할로 보존한다. 실제 존재하는 svgGroupIds와 inspect 계층을 대조한다. 국경 없음은 해안 제거가 아니며 국경 정책·분쟁·시점을 임의 보정하거나 강조 테두리로 의미를 바꾸지 않는다. 수역색은 요청에 맞추며 단독 윤곽의 빈 배경을 바다로 단정하지 않는다. stroke 없는 실루엣에 해안을 자동 추가하지 않는다.
- 일반 문서에서 역할 자식 path 선택 후 style을 적용한다. 국경 dash는 `strokeDashArray:[]` 또는 요청한 양의 길이 배열, sea는 면 fill 또는 실제 대지 background다. 현재 visibility 확인 후 layer visible 토글/선택 hide를 사용하며 style.visible이나 unrelated showAll을 쓰지 않는다. 그룹 fill이 자식 명시 fill을 덮는다고 가정하지 않는다.
- world_continents 출처임이 확인된 경우에만 숨은 회색 강조 면을 실제 위치/ID/분리면 대조 후 bringFront하고 해안/국경을 위에 보존한다. 흰 육지 전체를 앞에 올려 강조를 가리지 않는다. 일반 국가 면 양식은 대응이 확인된 모든 자식 fill을 바꾸며 위 bringFront 방식을 전용하지 않는다. 별도 highlights는 경계 아래 둔다. 해당 바탕의 AAA/EEE 색을 모든 지도에 강제하지 않는다.
- 일반 문서 crop는 변환한 바탕/강조와 맨 위 mask를 clip하고 창 밖 원기하를 보존한다. mask는 문서 좌표이므로 clip 후 그룹만 이동/축소하지 않고 정합을 확인하거나 변환 후 재clip한다. native map의 상대 clip/고정 frame과 혼용하지 않는다. 선택 상자와 보이는 창은 다를 수 있어 테두리는 창에 맞춘 독립 선, 문자/인출선은 clip 위에 둔다.
- 지도만 확대/축소할 때 독립 문자·범례를 함께 늘이지 않는다. 상위 transform으로 전역의 고정 실효 8pt가 달라지는 위험을 확인한다. 필요한 선의 최종 실효 굵기/선종류·면 농도와 기호 크기를 확인하고 수량 선폭은 의미를 유지한다. 작은 영역의 기본 인출선은 0.3pt이며 도시 점/화살촉을 자동으로 달지 않는다. 북쪽표·축척·경위선·제목은 근거 없이 장식하지 않고 축척은 해당 도법/위치/최종 배율 근거가 필요하다.

## 라벨·범례와 정보 강약

- 위치 기호의 중심과 지리선은 실제 자료에 고정한다. 문자 잉크가 점·해안·국경·등고선과 겹치면 라벨만 빈 공간으로 옮기고 필요시 짧은 인출선으로 연결한다. 불가피할 때만 핵심 지형 정보를 가리지 않는 최소 바탕색 halo/짧은 선 끊기를 허용하며 원기하·데이터 좌표는 보존한다. 큰 흰 덮개로 가리지 않는다. 인출선 끝은 해당 지점/영역 안에 두고 불필요한 우회·교차를 줄인다. 문자·기호·인출선은 별도 개체로 유지한다.
- 범례는 섬을 포함한 지리 윤곽과 겹치지 않는 공간에 예약한다. 설명 상자도 대상 가까이 배치하되 지리 정보를 가리지 않는다. 보조 국경·격자는 주제 면/기호·지시선보다 약하게 두며 핵심 판독에 필요한 지리선은 보존한다.

## 조건부 확대·패널·보완 자료

- locator/inset은 원범위와 확대창의 관계를 정확히 표시하며 연결선을 이동 경로와 구별한다. 각 창의 바탕·mask·좌표 등록·배율을 따로 기록하고 같은 주제 비교에는 공통 척도/등급/범례를 우선한다. 독립 척도면 표시한다. 다른 관찰 방향/도법은 해당 조건의 별도 검증 바탕이 필요하다.
- production magnify의 sourceId/sourceRegionMm/targetRegionMm은 문서 범위 `{xMm,yMm,widthMm,heightMm}`를 원형으로 복제한다. LOD/새 도법을 만들지 않는다. 사각 view는 별도 작업본·경로·clip으로 조립한다. 패널·원자료 이미지·라벨·범례를 독립 편집 가능하게 두며 잘린 프레임 조각을 새 패널로 추정하지 않는다.
- 작은 섬/좁은 해협의 특징이 몇 직선으로 뭉개지면 상세 등록 프리셋을 먼저 찾는다. 없을 때 출처·권리·시점·feature·CRS·투영/변환/control 정합을 검증한 외부 고해상도 공공 **원기하**를 보완 층으로 사용할 수 있다. 기존 원기하/clip을 보존한다. 확보/정합이 입증되지 않으면 상세도 미충족이며 저상세 확대를 통과시키지 않는다. 본래 직선/중세 개념도에 복잡한 선을 강제하는 규칙은 아니다.
- 실제 래스터/위성영상은 원자료 그대로 포함하고 문자·범례는 벡터로 둔다. import/crop/늘이기는 재투영·warping이 아니다. 없는 자연자료를 imagegen/임의 등치선으로 대체하지 않는다.
- native 선이 있어도 실제 출력에서 지리선이 흐리면 통과가 아니다. 필요시 같은 원지리 벡터에 동일 변환·정확한 창내 clip을 적용한 독립 native 선 overlay로 보완할 수 있으나 자동 기능으로 가정하지 않는다. 래스터 따라그리기·눈대중 단순화·원기하 삭제/clip 해제로 숨기지 않는다. 중첩 변환은 선 스타일을 먼저 정해 같은 배율을 적용하고 재열기 정합이 깨지면 원프리셋부터 복구한다.

전역 검증 단계에서 지도별로 대상·값·단위·범례·anchor/인출선 끝·섬/해협·projection/extent/동일 배율·경계 의미·수역색·패널 척도·네 변 잘림을 최종 크기와 확대 화면으로 대조한다. ready/issues 없음은 자동 라벨–점/테두리 회피나 시각 통과 보증이 아니다. binding·수동 편집·자료 이미지·clip의 재열기 보존과 실제 JPEG의 지리선 선명도를 확인한다. 재열기에서 binding/도형 연결이 invalid이면 외관이 남아 있어도 보존 성공이 아니다. 앱 기능이 부족하면 미지원 범위를 보고하고, 실제 지원되는 프리셋 일반 편집·검증된 자료 보완 경로로 가능한 부분을 진행한다. 앱 개발로 해결 범위를 넓히지 않는다. 조판 성공·출력 결함·미수행 검증을 구별한다.
