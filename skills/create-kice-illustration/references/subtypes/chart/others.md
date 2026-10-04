# 기타 차트 · chart/others

유한 정량의 트리맵·모자이크·면적 비례 격자·영역 차트 등이다. 길이/면적/위치가 어떤 값을 뜻하는지 정하고 전체·부분·분모·결측을 구별한다. 면적 비례 표현을 장식 크기로 바꾸지 않는다.

지원되는 영역은 `stacked-area|percent-area|horizontal-percent-area`, type line, 시점 2개 이상·primary만; xValues는 엄격 증가한다. percent는 결측 없는 비음수·양수 합계, 값 축 0–100. `chartOptions.interpolation:linear|step`과 가로 구성비·세로 시간의 `reverseIndependentAxis`는 해당 스타일만 쓴다. 트리맵/모자이크 등의 기본 면적 관계가 미지원이면 수치로 경계를 계산해 편집 가능한 면·라벨을 구성한다.
