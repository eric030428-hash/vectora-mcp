# 작은 인물·얼굴 원칙

대화용 인물, 관계도 인물, 작성자 초상, 얼굴/흉상 단품에 적용한다. 자유 삽화의 전신·과장된 행동 장면을 이 작은 초상 비례로 제한하지 않는다.

제작 방식은 [원화 제작과 배치](artwork-production.md)을 따른다. 얼굴 원화와 말풍선/문자 조판을 분리하고 최종 결과에서 함께 검수한다.

## 이미지 생성에 반드시 전달할 화풍

대화·발표·관계도·얼굴 단품의 인물 원화에는 아래 블록을 **매 호출마다 그대로 포함**한다. ‘평가원 스타일’, ‘KICE’, ‘교과서풍’ 한마디로 요약하거나 동의어로 재작성하지 않는다. 이 블록은 원화의 화풍 계약이며 예시 이미지나 완성 템플릿이 아니다. 자유 삽화의 풍경·회화 질감에는 적용하지 않는다. 사용자가 명시적으로 다른 화풍을 요청하면 그 지시를 우선한다.

```text
STYLE CONTRACT: Draw a living human character as a clean Korean examination textbook cartoon ink illustration. Use natural human anatomy and restrained, readable facial features. Use crisp black contours, lighter and fewer interior lines, opaque white skin, and broad flat gray areas in the hair and clothing. Group hair and beard into a few clear masses with sparse directional lines. Use only a few small flat shadow shapes; keep the face predominantly white. Keep large shapes readable at the final small printed size. The rendering is flat illustrated line art, not a depiction of a sculpted object.
EXCLUDE: statues, sculptural busts, marble, plaster, stone surfaces, pedestals, carved facial planes, charcoal, graphite or pencil texture, etching, engraving, hatching, cross-hatching, stippled shading, dense individual hair strands, photographic skin, 3D rendering, dramatic lighting, continuous tonal modeling, diffuse gray halos, oversized anime eyes, emoji or geometric placeholder faces. Do not introduce these styles through historical subject references.
ASSET: Isolate the character on a transparent exterior background, with opaque white skin and any white clothing areas. Keep the requested head and body extent complete with minimal transparent outer padding. No lettering, name labels, speech bubbles, frames, or scenery. Include only props explicitly required by the request.
```

블록 앞에는 대상·시대·외형·복장·표정·시선·인물 수·절단 범위·배치할 가로세로 비율만 구체화한다. ‘고대 사상가’는 살아 있는 사람의 복장과 외형으로 표현한다. 사용자가 특정 인물을 지명했으면 [참조 검색](artwork-production.md#이름이-지정된-대상의-참조-검색)으로 확인한 얼굴·복식 특징을 반영한다. `Socrates style`처럼 이름을 화풍으로 쓰지 않으며, 조각상 자료는 정체성의 근거로만 사용하고 조각의 재질·받침대·깎인 명암을 재현하지 않는다. 일반 사상가 요청에 특정 철학자의 이름을 자동 추가하지 않는다. `detailed charcoal-and-ink`, `classical sculpture`, `realistic shaded bust` 같은 상충하는 수식어를 긍정 지시로 덧붙이지 않는다.

인물이 여러 명이어도 이 화풍 블록은 동일하게 쓰고 대상 설명만 바꾼다. ‘앞 인물과 같은 스타일’이라는 문장만으로 대체하지 않는다. 실제 도구에 보낸 최종 프롬프트와 생성 원화 경로를 결과 폴더의 제작 기록에 남겨, 사용자 요청과 모델이 추가한 표현을 구별할 수 있게 한다.

## 표현

- 검정/회색의 정돈된 윤곽, 흰 피부 면, 회색 머리카락·의복과 소수의 명암 면으로 그린다. 사진 질감·지나친 음영·과장된 애니메이션 눈·이모지·원 안의 점 두 개 얼굴을 기본 인물로 사용하지 않는다.
- 두개부와 턱·볼 윤곽을 자연스럽게 잇고 눈썹·눈꺼풀·눈동자·코선·입선·보이는 귀를 작은 크기에서도 구별한다. 정면·3/4·옆모습에 맞게 얼굴 특징의 위치가 달라져야 한다. 얼굴 옆에 코만 붙이고 정면 두 눈을 그대로 두는 식의 가짜 옆모습을 피한다.
- 옆을 보는 얼굴은 이마→코끝→입술→턱의 윤곽이 이어져야 한다. 코만 삼각형처럼 내밀지 않는다. 3/4 얼굴의 먼 눈은 가까운 눈보다 좁게 보이고, 완전한 옆얼굴은 한쪽 눈만 보인다. 윗눈꺼풀·홍채를 구별하고 아래 눈꺼풀은 짧고 가볍게 처리한다.
- 머리카락은 큰 실루엣, 가르마, 몇 개의 흐름 묶음으로 만든다. 동일한 가는 선을 수십 개 긋거나 머리 위에 모자처럼 단순 반원을 얹지 않는다. 밝은 면과 회색 면은 머리 흐름을 따른다. 바깥 머리 윤곽에 평행한 테두리를 한 겹 더 둘러 헬멧처럼 만들지 않는다.
- 흉상은 머리→목→어깨→가슴이 연결된다. 옷깃·어깨 경사·큰 옷주름을 포함하고 몸통은 얼굴 아래의 단순 삼각형으로 끝내지 않는다. 좌우를 완벽히 대칭 복제해 인형처럼 보이게 하지 않는다.
- 표정은 말하는 입, 중립, 작은 미소 등 상황에 맞게 절제한다. 헤어·안경·옷으로 인물을 구별하고 학설/입장에 성별·나이·외모를 임의로 연결하지 않는다. 같은 사람이 반복되면 같은 얼굴·머리·복장을 유지한다.

## 범위와 상대 크기

- 먼저 **인물이 쓰이는 장면**으로 절단 범위를 정한다. 화상 수업·인터뷰·대화의 참가자를 ‘작은 얼굴’이라고 부른 것만으로 머리 단품으로 해석하지 않는다. 이때는 목·어깨~가슴이 연결된 작은 흉상이 기본이다. ‘얼굴만/머리만/몸은 빼고’처럼 범위를 명시적으로 제한했거나 독립 얼굴 단품을 요청했을 때 아래 얼굴만 규칙을 적용한다.
- **얼굴만:** 머리카락 윗부분부터 턱·보이는 귀까지. 몸통·말풍선·이름·배경 틀을 자동 추가하지 않는다. 크기 미지정의 작은 단품은 머리 폭 **약 10–15mm**부터 검토한다.
- **세로대화용 인물:** 목·어깨~가슴을 포함한다. 해당 용도의 ‘인물만’도 흉상이다. 명시적인 ‘머리만/몸 제외’가 우선한다. 손짓·소품이 필요하면 범위를 넓힌다.
- **발표용 인물:** 목·어깨~가슴을 최소한 포함한다. [발표 배치 순서](dialogue-illustrations.md#발표)에 따라 말풍선 크기와 남은 폭부터 확정하고, 그 영역에 맞는 자세·신체 범위로 새로 생성한다. 작은 흉상을 단순 확대해 높이를 맞추지 않는다.
- 가로대화용 흉상은 가슴 윗부분에서 자연스럽게 잘라 허리까지 길게 늘이지 않는다. 미지정 시 정수리~턱 높이를 1로 두고 전체 흉상 높이 약 **1.5–1.9**, 어깨 폭은 머리 폭의 약 **1.6–2.0**을 출발점으로 삼는다. 머리가 작고 옷만 긴 인물이 되지 않게 한다. 손짓·소품·전신 요청에는 이 절단 범위를 강제하지 않는다.
- 한 그림의 인물끼리는 머리 폭/높이를 먼저 맞춘다. 흉상 어깨 폭은 머리 폭보다 넓게, 머리와 몸통이 자연스럽게 이어지게 잡는다. 트로피·모자·연단 포함 전체 높이로 얼굴 크기를 맞추지 않는다.
- 작은 세로 대화에서는 인물이 본문보다 훨씬 작은 가장자리 요소다. 가로 대화/발표에서는 커질 수 있지만 글 영역을 잠식하지 않는다. 독립 초상과 전체 대화의 물리 폭을 혼동하지 않는다.
- 시선과 얼굴 방향은 상대나 발언 공간을 향하게 한다. 인물을 반전하더라도 이름/대사는 반전하지 않는다. 초상 틀은 요청상 필요할 때만 넣는다.

## 완성 검사

**원화 승인 전에는 최종 조판에 채택하지 않는다.** 원화 확대 화면과 예정된 출력 크기에서 다음을 모두 확인한다.

- 흰 얼굴과 회색 머리·의복의 큰 면이 먼저 읽히며, 머리·수염이 가는 선의 덩어리로만 표현되지 않는다.
- 피부·수염·옷에 목탄 입자, 빗금 음영, 연속적인 입체 명암, 석재·석고 질감이 없다. 역사적 복장을 입은 살아 있는 인물로 읽힌다.
- 눈·코·입과 표정이 작은 크기에서도 구별되고, 과도한 디테일이 얼굴을 얼룩이나 회색 덩어리로 만들지 않는다.
- 아래의 인물 범위·비례와 해당 대화 유형에서 예약한 폭·높이를 만족한다.

하나라도 어기면 원화 불합격이다. 검출한 문제와 목표 외형을 명시하고 동일한 화풍 블록을 유지해 다시 생성한다. 축소·흐리게 만들기·벡터 추적·회색 양자화로 화풍 위반을 숨기지 않는다. 인물별 최초 생성 뒤 최대 3회까지 수정 생성하고, 계속 실패하면 결과를 통과로 납품하지 말고 미충족 항목과 미완료 상태를 알린다. 프롬프트를 지켰다는 사실만으로 그림이 통과했다고 판정하지 않는다.

인물은 완성된 원화 이미지 또는 벡터 그림이어야 한다. 빈 타원·임시 실루엣·‘인물’ 글자로 대신하지 않는다. 최종 크기에서 얼굴 특징이 뭉치지 않는지, 목·어깨가 연결되는지, 반복 인물이 같은 사람인지 확인한다. 원화 인물은 한 이미지 개체로 이동·크기 조절·교체할 수 있으면 된다. 얼굴·머리·몸통까지 경로로 분해할 의무는 없다. 독립적으로 수정해야 하는 소품만 별도 개체로 둔다. 얼굴만 확대해 코의 돌출, 두 눈의 원근, 머리의 이중 테두리를 확인하고, 전체 크기에서는 머리와 상반신의 비율을 다시 본다. 정돈된 만화 선화가 되어야 하며 단순 아이콘의 부품을 조합한 모습으로 끝내지 않는다.
