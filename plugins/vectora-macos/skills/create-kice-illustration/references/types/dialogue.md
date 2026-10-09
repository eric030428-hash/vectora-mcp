# Dialogue — 인물·발화 텍스트그림

화자와 발언의 대응이 핵심이다. TV·뉴스도 말풍선이 있으면 Dialogue다. 학습 보드·슬라이드·학습지와 교사 말풍선은 Activity 한 단위다. 화면 안의 독립된 완결 자료만 복합형 요소로 분리한다.

화자 목록과 발언 목록을 따로 작성하고 화자 ID·제공된 이름·원문·강조·위치를 연결한다. 사회자 등 역할명도 받은 표기이면 빠짐없이 배치하며 미제공 이름은 만들지 않는다. 발언 횟수를 인물 수로 세지 않는다. 발언 전체·밑줄·기호·문장 속 빈칸을 유지하고 긴 발언을 요약하지 않는다. 화면 속 이름을 새 화자로 만들지 않는다.

하위 문서는 `vertical`(순서 중심 여러 행), `horizontal`(보통 2–3명과 위쪽 발언 열), `presentation`(큰 발언/자료 면 옆 발표자) 중 하나만 읽는다. 인물 화풍·정체성·절단 범위와 모든 발화 말풍선의 비대칭 꼬리·실제 윤곽 간격·수치 기록은 SKILL.md의 조건부 공통 규칙을 적용한다. 인물·이름·발언은 하나의 대응 묶음으로 읽혀야 한다. 여러 컷으로 나뉜 순차 대화도 각 컷의 발언 영역을 먼저 정하고 그 안에 읽기 보조 크기의 인물을 배치한다. 컷을 채우려고 인물을 키우거나 짧은 발언의 빈 말풍선을 늘리지 않는다. 승인된 실제 인물 윤곽으로 꼬리·이름 간격을 다시 계산하고, 행/열 사이 틈을 내부 틈에 중복해서 더하지 않는다. 인물별 원화 분리/자르기에는 이웃 인물·소품 조각이 남지 않아야 하며 재사용한 인물까지 전원 공통 흑백 화풍과 승인 조건을 충족해야 한다.

## 하위 유형 선택

| 배치 | 읽을 하위 문서 |
|---|---|
| 순서 중심의 여러 발언 행 | [vertical](../subtypes/dialogue/vertical.md) |
| 보통 2–3명의 위쪽 발언 열 | [horizontal](../subtypes/dialogue/horizontal.md) |
| 큰 발언/자료 면 옆 발표자 | [presentation](../subtypes/dialogue/presentation.md) |

## 검사

화자 목록과 최종 그림을 대조해 발언·순서·강조·이름 대응을 확인한다. 행/열 배치에서 같은 화자의 반복 외형, 인물별 분리 경계, 모든 이름과 각 발언의 대응을 확인한다. 최종 인쇄 크기에서 유색 잔류·과도한 빈 간격·발언에 비해 지나치게 큰 인물이 없는지 본다. 꼬리 형상·윤곽 간격 검사는 루트의 발화 조건을 적용한다.

## 승인 원화와 읽기 전용 계획

현재 계약이 제공하면 vectora_production_plan({documentId,spec:{kind:"dialogue",...실제 지원 필드}})의 awaiting-approved-artwork 계획으로 발언 측정과 화자별 headWidthMm/crop/facing/allowedAreaMm·이름·꼬리 목표를 확인한다. 계획은 실제 화자 원화의 승인/생성을 대신하지 않는다.

승인 원화 등록은 현재 MCP가 제공하는 `vectora_production({documentId,expectedRevision,requestId,action:"registerAsset",asset:{id,name,rasterPath:"/absolute/path/person.png",reviewed:true,headBounds:{x,y,width,height},crop:"face"|"bust"|"full"|"prop",facing:"left"|"right"|"front"}})`를 우선 사용한다. rasterPath는 Vectora가 실행되는 머신의 실제 PNG/JPEG 파일이며 raster 또는 비어 있지 않은 svg와 함께 보내지 않는다. MCP가 안전한 파일 읽기로 크기/헤더를 확인하고 앱이 실제 dimension/alpha visibleBounds를 계산하므로 AI는 base64·width/height·visibleBounds를 직접 보내지 않는다. reviewed:true와 실제 픽셀 headBounds/crop/facing은 직접 눈으로 검수해야 하며 자동 alpha 측정은 원화 승인이 아니다. 원본 픽셀은 문서에 포함되어 이후 저장·수정이 임시 원화 경로에 의존하지 않는다. 같은 requestId의 원화 파일이 바뀌면 충돌이므로 실제 재요청의 새 requestId를 사용한다.

이 경로가 없으면 승인된 PNG/JPEG를 재추적하지 않고 asset의 raster:{dataUrl,mimeType,width,height,visibleBounds:{x,y,width,height}}로 포함한다. svg는 생략하거나 빈 문자열로 두며 reviewed:true, 실제 headBounds:{x,y,width,height},crop:"face"|"bust"|"full"|"prop",facing:"left"|"right"|"front",id,name을 보존한다. source bounds는 픽셀이며 눈으로 확인한 가시 영역·머리 윤곽만 기록한다. 내장 data:image/png|jpeg;base64 payload는 decoded 8MiB·40,000,000 pixels·각 정수 dimension 1–50000 한도다. PNG/JPEG 헤더와 실제 메타데이터가 일치하고 headBounds는 source와 visibleBounds 안에 있어야 한다. 배치 effectivePPI가300 미만이면 경고 값을 읽고 인쇄 크기에서 직접 확인한다. registerAsset 명령의 asset은 최상위 필드에 두며 라이브 스키마에서 지원을 확인한다. 무지원이면 승인 원화를 일반 포함 이미지로 배치하고 이동·비례 크기·교체 가능성을 유지한다. 화풍·정체성·포즈·꼬리 대상은 최종 이미지로 판단한다.
