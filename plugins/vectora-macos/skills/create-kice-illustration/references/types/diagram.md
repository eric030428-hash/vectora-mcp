# 도식 · diagram

개체·관계·절차·시간 순서·수량 없는 공간 구조를 나타낸다. 정량 관측 축은 chart다. **특성 축 위 개별 대상의 비정량 위치·속성 배치는 diagram/schematic**, 연속 개념 관계·경계·영역 자체를 읽는 2축 그림은 숫자가 없어도 graph/others다. 축에 숫자가 없다는 이유만으로 연속 관계를 여기로 보내지 않는다. 아래에서 하나만 읽는다.

| ID | TSV 폴더 ID | 분류표의 한국어 명칭 | 읽을 하위유형 |
|---|---|---|---|
| `tree` | `D4-01_Tree` | 위계도 | [tree](../subtypes/diagram/tree.md) |
| `network` | `D4-02_Network` | 관계도 | [network](../subtypes/diagram/network.md) |
| `flowchart` | `D4-03_Flowchart` | 순서도 | [flowchart](../subtypes/diagram/flowchart.md) |
| `venn` | `D4-04_Venn` | 벤다이어그램 | [venn](../subtypes/diagram/venn.md) |
| `timeline` | `D4-05_Timeline` | 연표 | [timeline](../subtypes/diagram/timeline.md) |
| `schematic` | `D4-06_Schematic` | 모식도 | [schematic](../subtypes/diagram/schematic.md) |
| `others` | `D4-07_Others` | 기타 도식 | [others](../subtypes/diagram/others.md) |

## 도식 공통·조건부 배치

- 대상과 관계를 먼저 확정한다. 노드/영역과 연결표(출발·도착·방향·분기 문구)를 요청에서 작성하고 미지수·빈 질문을 풀지 않는다. 노드형 도식에서 질문·특성은 흰 직사각형, 짧은 대상/결과는 원 또는 직사각형; 같은 역할은 같은 형태·크기다. 모든 질문을 마름모로 바꾸지 않는다.
- 연결이 있으면 특성 대응은 무방향, 절차·판정은 방향, 상호 관계는 의미에 따라 무/단/양방향이다. 교차는 접속이 아니다. 실제 공유 줄기만 하나의 분기점으로 만들고 공통 특성 상자를 복제하지 않는다. 화살촉 끝은 도착 윤곽에 닿으며 도형 안으로 들어가지 않는다.
- 글상자를 조판한 뒤 사방 여백으로 노드 크기를 정한다. 짧은 특성은 얇고 긴 띠, 대상 원은 짧은 글만 담으며 단문 띠 높이의 약 1.2–1.6배 지름부터 검토한다. 여러 줄 문장에는 그 비율을 강제하지 않는다. 반복 띠 사이 틈은 높이 약 1/3, 분기 문구·촉을 담는 순차 통로는 약 3–7mm부터 조정한다.
- 연결은 수평·수직·간결한 사선으로 출발·꺾임·도착을 정렬한다. 같은 수준의 가지·병렬 판정·결과 높이를 맞추며 불필요한 긴 빈 선을 줄인다. 꺾임 통로를 도형 밖에 예약하고 글을 가리는 선은 흰 덮개 대신 경로/라벨 배치로 해결한다. 범례는 단계 간격을 밀어내지 않는 공간에 둔다.
- 묶음 대상 원은 묶음 중심 높이, 공유 결과는 관련 질문 사이 높이로 조정할 수 있다. 과거 도형 수·좌우 위치를 틀로 고정하지 않는다. 이동 후 선·촉·라벨을 다시 맞추고 연결표와 모든 선을 대조한다.

## 노드·연결 생성 spec

`spec:{kind:"schematic",layout,widthMm,gapMm?,nodes,edges}`. 확인된 layout은 `sequential,shared,crossing,shared-results,relations`이며 분류 ID 자체를 layout으로 넣지 않는다. nodes는 `{id,text,shape:"rect"|"circle",widthMm?,level?,xMm?,yMm?}`; edges는 `{id,from,to,direction:"none"|"forward"|"both",routing:"straight"|"orthogonal",label?,dashed?,fromAnchor?,toAnchor?,via?:[{xMm,yMm}]}`다. 안정적 ID로 대응을 유지한다.

공유 줄기는 같은 출발 노드의 edges에 같은 `sharedStemId`와 필요하면 같은 `junctionMm:{xMm,yMm}`를 준다. 선언 없는 교차는 분리된다. 명시 좌표·via로 교차·줄기를 보존한다. 순환을 sequential 제약에 강제로 넣지 않고 명시 좌표 또는 relations를 쓴다. 일반 테두리·연결선은 0.3pt; 비그래프 파선 주기는 내용·크기에 맞춰 결정한다. 벤 계약은 해당 하위유형 안에 있다. 노드 계약으로 표현되지 않는 공간 구조는 지원 요소를 먼저 생성하고 부족한 면·경계·기호만 편집 가능한 개체로 보충한다.
