# 지도 기본양식 선택과 manifest

`index.json`은 지도 바탕 메타데이터 목록의 진입점이며 실제 제작은 적합한 UND 프리셋에서 시작한다. 선택 프리셋과 대응하는 출처를 확인할 때 요청 범위·국가·투영·주제 역할로 관련 항목만 찾는다. 기출·검수 예시는 사용하지 않는다. `templates`는 지리데이터에서 투영한 25개 기본 바탕이며, `sourceVariantLibraries[].index`를 읽으면 다운로드 원본에서 가공한 7개 원본별 변형을 찾는다. 원본별 변형은 수백 개의 국가 파일을 추가 생성하는 라이브러리가 아니다.

| sourceKind | 좌표와 선택 | 지리 편집 한계 |
|---|---|---|
| `reprojected-geographic-data` | 고정 Natural Earth 커밋에서 새로 투영한 SVG. `projection`에 CRS·중심·회전·scale·translate·extent가 있고 `controlPoints`에 실제 x/y가 있다. | 원본 SVG 다운로드라고 부르지 않는다. 110m/50m/10m는 일반화 자료이며 좁은 피오르·갯벌·장벽섬·삼각주 지류의 정확한 상세도가 아니다. |
| `processed-downloaded-svg` | 다운로드 원본 지리 기하를 보존하고 누적 affine 변환·전체 축척을 경로 좌표에 반영한 SVG. `projection`은 출처에서 확인한 이름/미확정 상태, `coordinateManifest.originalViewBox`는 원본 화면 좌표이고 `outputViewBox`는 108mm/96px-inch 정규화 좌표다. 변환 속성은 없고 획은 0.4px다. | 수치 위경도 등록은 미제공이다. 임의 비율로 위경도 overlay를 얹거나 재투영 지원을 주장하지 않는다. 원본이 결합한 해안/국경선을 독립 역할로 추정하지 않는다. |

두 종류 모두 self-contained 표준 SVG다. 앱 `kind:map`, 지도 core API 또는 production 투영 기능이 구현됐다는 뜻이 아니다. 별도 native helper/실제 Vectora에서 저장→재열기→JPEG 내보내기를 확인해야 한다. `svg-ready-validated-native-pending`은 SVG 단계만 통과한 상태이고, 다운로드 변형의 `svg-prepared-native-unverified`는 구조 검사를 통과했지만 native 보존은 미검증인 상태다.

## 국가와 multipart

- 기본 manifest의 `countries`는 **객체 배열**: `id`, `iso3`, `iso2`, `sourceFeatures`, `sourcePartCount`, `visiblePartCount`, `partIds`, `projectedPartBounds`. `iso3:null`인 미등록/분쟁 코드에는 Natural Earth 자체 ID를 사용하며 ISO로 가장하지 않는다. `ISO_A3_EH`가 같은 원본 feature는 하나의 국가 그룹으로 묶고 원본 feature ID를 남긴다.
- 원본 변형 manifest의 `countries`는 **문자열 배열**: 원본의 `gABC` 그룹에서 읽은 국가 코드다. 원본 코드의 ISO 적합성을 별도로 확정한 목록은 아니다. 주제·대륙 면만 있는 원본에는 빈 배열이 정상이다. 문자열 `ABC`의 SVG 그룹은 `<variant-id>--country-ABC`다.
- 두 형태를 읽을 때 객체면 `country.iso3`와 `country.id`, 문자열이면 원본 `country` 코드와 위 그룹 규칙을 사용한다. 변형본에 기본 manifest의 `partIds`·해안/국경 역할을 가정하지 않는다.
- 모든 개체 ID는 `<template-id>--...`로 구분한다. 국가 그룹 아래의 모든 multipart 자식 `<path>`의 fill을 `#AAAAAA`로 바꿔 본토·분리 섬을 함께 강조한다. 자식에 명시적 fill이 있으면 그룹 fill만 바꿔서는 적용되지 않는다. 해안·국경 선층은 위에 보존한다. 다운로드 원본은 child path의 명시적 fill·결합선 구조를 먼저 확인한다.

## 역할·라이선스·검수

기본 SVG는 `svgGroupIds`로 국가면·강조면·바다·호수·하천·해안·국경·행정경계·경위선을 찾는다. source 변형은 `roles`와 `data-role`로 원본 의미층을 찾는다. 유럽 빙하의 진녹색 원본 윤곽은 검정 선으로 복원됐고, 연녹색 윤곽은 선택 가능한 별도 파선층이다. 북미 빙하의 주/도 폴리곤 이음·중복선은 원본 한계이며 `auxiliary-source-base`로 표시한다.

`source`는 저자·출처 URL·고정 원본 SHA256·원본 페이지 revision·라이선스다. `changes`와 `derivativeLicense`는 가공 변경 및 동일조건 의무다. `ATTRIBUTION.md`를 함께 유지한다. CC BY-SA 원본의 변형은 해당 CC BY-SA 라이선스를 그대로 유지하고 저자·출처·라이선스 링크와 변경을 표시한다. Natural Earth 기본 바탕과 CC BY-SA 원본 변형을 하나의 무조건 public-domain 묶음으로 설명하지 않는다.

`map-template-edit.py --list`는 두 종류를 검색한다. `--source-kind`·`--iso`·`--projection`으로 좁힐 수 있다. 기본 SVG의 반복적인 국가 fill/기존 국경 표시 편집만 작업 SVG로 만들며 원본 변형의 지리 계산이나 앱 API를 구현하지 않는다.
