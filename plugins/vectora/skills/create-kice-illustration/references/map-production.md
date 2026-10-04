# 프리셋 기반 지도 production 실행

지도 자동 제작을 실제 사용할 때만 읽는다. 먼저 [양식 실행](map-template.md)에서 실제 UND 프리셋을 선택한다.

## 프리셋과 등록 정보 확인

- `vectora_map_plan({})`의 `templates`·`capabilities`와 실제 UND 목록을 대조한다. 선택한 **기본 프리셋 ID와 template의 `presetId`가 같은 경우** 해당 `assetRef`를 사용한다. 이름이 비슷한 다른 지도나 개인 저장 프리셋을 임의 연결하지 않는다.
- 지원 연결본에서 `vectora_map_plan({assetRef:선택한 참조})`로 그 프리셋의 `defaultSpec`을 얻는다. 조회한 `assetHash/sidecarHash`·국가 목록·`roles`·`projection`·`notes`를 그대로 사용한다. 해시나 매핑 오류를 우회하지 않는다.
- 등록된 프리셋 자동 제작은 UND와 **같은 바탕 파일**에서 생성한다. 먼저 `vectora_new_document`로 새 격리 문서를 만들고 아래 production create를 한 번 사용한다. 이미 `create_preset`으로 일반 벡터를 열었다면 그 위에 관리 지도를 중복 생성하지 않는다. 일반 편집을 계속하거나 같은 프리셋 참조로 별도 새 제작 문서를 만든다.
- 실제 연결본이 `presetId` 대응을 제공하지 않으면 `vectora_create_preset`으로 연 일반 문서를 편집한다. 소스 코드나 버전 번호만 보고 설치 앱·다른 OS의 지원을 주장하지 않는다.
- `registration:"geographic"`는 등록된 원지리 자료의 위경도 배치·재투영을 허용한다. `unregistered`는 문서 좌표와 원래 도법만 사용한다. 기존 `world_continents`는 후자이며 CHN·JPN·KOR 부분 매핑만 있다. 새 프리셋의 국가 ID를 기존 양식에 넣지 않는다.
- 국가 목록은 바탕 원자료에 포함된 영역이다. `partial`은 모든 영토·섬의 완전성을 보증하지 않는다. `parts:["unclassified"]`이면 `islandPolicy:"all"`만 쓰며 본토·섬을 이름이나 크기로 추측하지 않는다.
- 교체된 외부 양식은 현재 조회의 `source/notes`를 우선한다. 예전 library SVG와 같은 ID라도 내용·좌표·도법이 달라질 수 있으므로 예전 manifest의 좌표를 혼용하지 않는다.

## Spec와 좌표

조회한 `defaultSpec`을 바탕으로 필요한 필드만 변경한다. 필수값은 `kind:"map"`, `mapSchemaVersion:"vectora.map/v1"`, `mode:"template"`, `assetRef`, `assetHash`, `sidecarRef`, `sidecarHash`다.

- `widthMm` 기본 108, 지원 범위 1–108mm. 사용자 지정 완성 폭을 우선하며 라벨·점까지 포함해 검수한다. 지원 범위 밖 폭을 조용히 108로 바꾸지 않는다. `frameMm:{x,y,width,height}`는 결과의 지도 창, `cropDocumentMm:{x,y,width,height}`는 승인 **원문서**의 mm 범위다. crop는 유한하고 양의 크기로 원본 대지 안에 있어야 한다. 동일 X/Y 배율로 창 안에 맞추며 crop의 종횡비를 보존한다.
- 조회한 `defaultSpec`의 `widthMm`를 줄이면서 기존 `frameMm`를 유지하면 창이 완성 폭을 넘어 실패할 수 있다. 폭/crop 변경 시 `frameMm`도 함께 갱신하거나 create/plan spec에서 생략해 기본 창을 다시 계산한다. 전체 창이면 `{x:0,y:0,width:widthMm,height:widthMm*crop.height/crop.width}`이며 라벨 여백이 필요하면 그 안에 창을 잡는다. update에서 필드를 생략하면 기존 값이 유지되므로 새 `frameMm`를 patch에 명시한다.
- map 전용 대지를 완성 폭과 같게 만들면 일반 production 기본 배치 오프셋을 피하도록 spec에 `xMm:0,yMm:0`을 명시한다. 기본 배치 오프셋으로 지도 위치가 밀리면 오른쪽·아래가 잘릴 수 있다. 여백을 쓰면 대지 크기에 포함한다. 적용 후 world bounds로 대지 원점을 포함한 `x + width`, `y + height`와 네 변이 대지 안에 들어오는지 확인한다. `widthMm` 일치만으로 잘림 없음을 판단하지 않는다.
- `verifiedIds`는 조회한 국가 ID, `islandPolicy`는 `all|mainOnly|excludeIslands`, `borderStyle`은 `none|solid|dashed`다. 내부 경계와 해안은 분리되며 국경 없음이 해안 제거를 뜻하지 않는다. `highlightFill`·`oceanFill`은 `#rrggbb`, `profileId`는 `kice-map`이다.
- `overlays`는 독립 라벨 `{id,kind:"label",text,anchor:{kind:"document",xMm,yMm},offsetMm?:{x,y}}` 또는 점 `{id,kind:"point",anchor:{kind:"document",xMm,yMm},radiusMm?,fill?}`이다. anchor는 원문서 mm로 crop 안에 둔다. 필요시 `anchors:[{id,xMm,yMm}]`를 쓴다. ID는 유지하고 배열 patch는 전체 교체임을 기억한다.
- 라벨은 실제 UND v2.1 8pt·자간 -60이며 상위 균일 배율에도 실효 8pt를 유지한다. 해결되지 않은 충돌은 partial, 폭 넘침 등은 오류로 보고되므로 글을 축소해 숨기지 않는다.
- 라벨끼리 충돌은 컴파일 단계에서 검출되지만 자동 배치로 해결하지 않는다. 라벨–점·지도 창/테두리의 충돌은 자동 검출·회피를 보장하지 않는다. compiled ready·issues 없음이어도 실제 객체의 기하와 JPEG를 함께 대조한다. plan의 ready나 UI 경고 없음만으로 배치가 통과한 것으로 판단하지 말고 실제 8pt 출력에서 겹침·잘림과 라벨–대상의 대응을 확인한다. 국가 위 문자가 면을 가리거나 대응이 모호하면 독립 라벨 위치와 필요한 인출선을 조정한다. 자동 인출선 생성을 가정하지 않는다.
- 일반 Editor/recipe 내부와 plan의 `transform.xPx/yPx`는 **문서 px**이며 화면 px가 아니다. mm↔문서 px는 96px/in 기준이다. `*Mm`에 이 값을 그대로 넣거나 `vectora_apply.units`로 production 단위를 다시 환산하지 않는다. plan의 scale은 균일 비율이다.
- 등록된 지도에서는 anchor를 `{kind:"geographic",longitude,latitude}`로 지정할 수 있다. 단위는 WGS84 경도 −180~180°, 위도 −90~90°다. 지도와 동일 투영·반구 clipping을 적용하며 뒤쪽 반구나 창 밖 점을 표시하려고 좌표를 임의 수정하지 않는다.
- `projection`은 조회한 원본 설정을 복사해 필요한 값을 바꾼 **완전한 설정 객체**로 전달하며 update도 객체 전체 교체다. `clipAngle:null`은 구면 각도 제한 없음이고, 최상위 `projection:null`은 원본 도법 복원이다. 지원 `name`은 현재 capability에서 확인한다. `rotate:[경도회전,위도회전,롤]`·`center`는 degree, `scale`·`translate`·`clipExtent`는 **원문서 96px/in 좌표**이며 `clipAngle`은 degree/null이다. 중심 경도 λ는 `rotate[0]=-λ`다. 원뿔 도법의 `parallels`도 지원되는 경우에만 쓴다. 새 도법에서 지도 크기·중심·clip·crop를 함께 검수한다.
- 재투영은 보존된 원지리 도형을 다시 그린다. 단순 늘이기/회전과 구별하며, 프리셋에 없는 나라·세밀한 해안·새 자료를 추가하지 않는다. 위경도 anchor는 따라 이동하지만 문서 좌표 anchor는 그대로 남으므로 위치를 재검수한다. 지리자료 import·자동 통계 join·상세도 자동 교체는 지원을 확인하기 전 사용하지 않는다.
- `layers:{역할:true|false}`로 실제 `roles`에 존재하는 층만 켜거나 끈다. 생략하면 원본 가시성을 유지한다. 국경 선종류는 `borderStyle`, 가시성은 `layers["internal-border"]`로 구분하며 해안·호수·빙상까지 함께 숨기지 않는다. 별도 역할이 없는 층을 가정하지 않는다.

## Plan → 변경 → 확인

1. 대상 새 문서의 최신 inspect로 documentId·revision·선택 ID·실제 객체 계층을 기록한다. 프리셋 문서에 관리 map이 이미 있는지 `production.components`에서 확인한다. 새 create는 기존 바탕을 변환하거나 교체하는 명령이 아니므로 중복 지도를 만든 뒤 원본을 무단 삭제하지 않는다. 컴포넌트가 없고 기존 바탕 편집만으로 요청을 충족하면 일반 경로를 유지한다.
2. `vectora_map_plan({documentId,spec})`으로 정규화 `spec`, `sourceHashes`, `selectedPaths`, `report`를 확인한다. plan은 객체 삽입·revision 변경·자료 등록을 하지 않는다. `selectedPaths`의 원본 UUID를 현재 문서 편집 ID로 쓰지 않는다. partial의 사유를 남기고 blocked는 반영하지 않는다. plan은 폰트 조판·렌더·저장 검증이 아니다.
3. 새 관리 컴포넌트 삽입이 필요한 경우 `vectora_production({documentId,expectedRevision,requestId,action:"create",spec})`를 사용한다. 기존 관리 map 수정은 실제 컴포넌트 `id`로 `action:"update",patch,policy:"preserve"`를 쓴다. spec/patch는 위 계약만 사용하며 동일 재시도는 동일 requestId, 다른 편집은 새 requestId다. stale revision이나 응답 만료 때 inspect로 결과부터 확인하고 맹목적으로 create를 반복하지 않는다.
4. 변경 후 inspect에서 revision·실제 생성 ID·map binding·coverage·수동 편집 보존을 확인한다. `featureMapping`은 소스 매핑이며 현재 편집 ID는 inspector의 실제 역할/`featureObjectIds`와 객체 계층으로 확인한다. 실패 시 revision·객체·선택 ID가 복원됐는지도 확인한다. 새 외부 revision을 되돌리지 않는다. 필요한 경우 undo/redo 한 번의 의미 상태 복원을 확인한다.

## 보존·detach·저장

재편집 미리보기는 수동 색상·라벨 고정 위치·부분 detach를 반영한 실제 preserve 결과와 다를 수 있으며, preserve/reset 전환도 미리보기와 일치한다고 가정하지 않는다. 적용 후 최신 inspect와 실제 JPEG를 기준으로 검수한다. UI 검수 결과에 컴파일의 라벨 충돌 경고가 빠질 수 있으므로 적용 후 map report와 출력도 확인한다.

일반 update는 수동 위치·스타일과 고정 배치를 preserve한다. 관리 원본 경로의 직접 이동·변형, 내부 view 변형, 비균일 상위 배율/skew는 binding을 무효화할 수 있다. invalid 상태에서 preserve를 강행하지 않는다. 사용자 초기화 의도 없이 reset하지 않으며, 비균일 변형은 reset으로 해결된다고 약속하지 않는다. 일반 style/clip 경로의 문서 좌표 mask와 native map의 **상대 clip·고정 프레임**을 혼용하지 않는다.

독립 편집을 요청한 대상만 production `detach`로 해제한다. 전체 해제는 실제 component `id`, 부분 해제는 해당 자식/레이어의 실제 `id`를 전달하며, 부분 detach는 보존된 개체를 재생성에서 제외하고 전체 detach는 binding을 제거한다. 불필요하게 detach하지 않는다.

[저장·재열기·JPEG 검증](vectora-contract.md#저장과-검증)을 따른다. 승인 원자료는 별도 workspace blob에 중복 제거해 저장되며 spec에 전체 원문을 넣지 않는다. 저장본을 다시 열어 binding·수동 편집·8pt·폭·clip과 실제 출력이 유지되는지 확인한다. 원자료 누락 또는 미래 스키마는 정적 그림을 보존한 unresolved 상태일 수 있으므로 자동 fetch·재생성을 강행하지 않는다. report의 readiness/commit과 render/save/reopen/export는 별개다. 실제 수행 결과 없이 `notRun`을 passed로 설명하지 않는다.
