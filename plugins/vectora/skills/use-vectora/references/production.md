
## Content-aware production (Vectora 0.7.1)

Use `vectora_production` with `documentId`, latest `expectedRevision`, new `requestId`, and `action`. `create` takes `spec`; `update` takes the component `id` and a partial `patch`. `policy: preserve` is the default; `reset` explicitly drops manual edits. The response contains `production.components`, saved source specs, warnings and `roles: {key:{id,role}}`. Inspect these actual IDs; never invent them. Arrays in patches replace arrays, omitted fields remain unchanged, and explicit `null` removes an optional field. Retain speaker/turn/series/node IDs when editing or reordering.

Production lengths always use explicitly named `*Mm` and `*Pt` fields. They are not converted again by `vectora_apply.units`. Existing `vectora.kice/v1` recipes remain pixel-based. New production text uses installed UND Regular 8pt, tracking -60. All new horizontal and vertical app text also defaults to `charSpacing:-60` (1/1000 em); pass `-60` when the live creation schema exposes `charSpacing`, and measure with the same tracking. Do not change existing text tracking without a request. No font fallback and no reference-artwork search are built in. Creation adds a component to the current isolated document; create a new document first for a new illustration. Artboard size remains explicit: leave margins or enlarge the board when content grows. A component's width is not an instruction to scale its letters.

### Check live tool schemas

Use `vectora_fonts` as the installed-font listing tool. Use `vectora_check_font` only when it appears in the current tool list. Send `colorMode` to `vectora_new_document` only when its live input schema includes the field; use `cmyk` by default and `rgb` only for an RGB request. Send `fontReplacements: {"source font":"installed font"}` to `vectora_open_document` or `vectora_import_svg` only when that tool's schema includes it. On `MISSING_FONTS`, inspect the missing-font list, check installed choices with `vectora_fonts`, and retry only after choosing a replacement. Do not guess unsupported fields or silently substitute the assessment UND font.

The current arrow UI name is `화살표` with tool value `arrow-3`. Check `tools/list` for the current arrow fields and accepted values; do not use old numbered arrow ranges.

### Measure and reflow

`vectora_measure_text({spec:{text,widthMm,fontPt:8,tracking:-60,lineHeight:1.24}})` is read-only. It returns rendered lines, baselines, height, frame/advance/ink bounds (mm), overflow and verified font/glyph information. Measure the actual content; do not use character count to claim final fit. `vectora_apply` command `{type:"resizeTextFrame",id,widthMm}` changes the frame and rewraps while preserving physical typography. The ordinary `transform` command still geometrically scales objects.

Ink bounds use measured glyphs; `decorationBounds` and `underlineBounds` are separate. Measurement bounds, baselines and inline-blank positions are relative to the frame's top-left in mm. An unavailable measurement is reported as unavailable, never substituted with an em box. Text, graph, dialogue and schematic components can opt into `fitToArtboard:true,artboardInsetMm:4`; changing the linked artboard width regenerates layout at the same font/stroke sizes. The default remains an explicit component width. Impossible sizes roll back the edit. Artboard height does not grow automatically.

### 새 그래프·벤 계약

새 그래프의 `chartStyle` 16스타일과 `layout:"venn"`은 [그래프·벤 실행](../../create-kice-illustration/references/graph-venn-production.md)을 따른다. 일부 옵션만 미지원이면 생성기로 기본 자료 구조를 만든 뒤 미지원 부분만 실제 개체 ID로 수정·보충한다. 보충 개체의 자동 재배치는 보장되지 않으므로 후속 변경 뒤 재검수하며 전체 SVG 대체나 불필요한 detach를 하지 않는다. 아래 Graph의 type/layout 설명은 **chartStyle 없는 legacy 계약**이다. 새 spec에 legacy 전용 필드를 혼합하지 않는다. 이 참조의 옛 버전·UND 메뉴 설명은 최신 앱 UI 기능을 제한하는 근거가 아니다.

### 승인 양식 지도 W0/W1

지도는 실제 UND 프리셋 ID를 조회해 새 문서로 시작한다. 연결본에서 지도 도구·capability가 확인된 승인 양식에만 [지도 production 실행](../../create-kice-illustration/references/map-production.md)을 적용한다. 새 API·좌표·보존 계약은 그 문서에서만 읽는다. 신도구가 없는 공식 설치 앱과 다른 지도 프리셋은 기존 일반 style·clip 편집을 유지한다.

### Production specifications

- Text: `{kind:"text",variant,widthMm,body,title?,background?,cards?}`. Variants: `newspaper-wave`, `newspaper-band`, `scroll`, `browser`, `noticeboard`. Cards contain stable `id`, `body`, optional `title`/`author`. Background settings reserve padding, chrome/title/footer heights, columns and optional illustration space; the actual body determines the final height. Reserved illustration space does not invent artwork.
  - Body/title/card content accepts a string or `{text,underlines:[{start,end}],inlineBlanks:[{at,widthMm,heightMm?,id?,underline?}]}`. Ranges use grapheme positions and cannot cross explicit newlines.
  - Scroll, newspaper and browser support ordered `blocks:[{type:"text",id,text},{type:"graph",id,graph}]`. Each nested `graph` is a complete graph specification and remains editable. Direct updates to a nested graph also update its owning text specification, so later parent edits retain the data. Blocks determine height. Use `body` or `blocks`, not both. Rich payloads preserve optional `verticalGroups` metadata without making a horizontal text frame vertical.
  - Browser side graphs use `background:{asideWidthMm,asideHeightMm?}` plus `graphSlots:[{id,slot:"side-illustration",graph}]`. A graph wider than the available slot is rejected; font sizes are never shrunk to fit.
  - `background.masthead`, `date`, `tabTitle` are editable chrome labels. Cards retain their IDs when reordered.
- Graph: `{kind:"graph",type,layout?,widthMm,dataFidelity,series,...}`. `dataFidelity` is `exact`, `approximate` or `relative`. Common `series` entries have `id`, `label`, `fill` (white, EEEEEE, CCCCCC, AAAAAA, 666666, black), `pattern` (`none|dots|hatch`), `line` (`solid|dash|dash-dot`), `marker` (`circle|triangle|square|open-square`). Explicit stable IDs retain correspondence. Supported data:
  - `type:bar,layout:horizontal`: `categories`, `domain:[0,max]`, optional `ticks`, series `values`.
  - `bar,panels`: `panels:[{label,values}]` (values in series order), 1–4 panels, common domain. No numeric axis ticks.
  - `bar,mirror`: exactly 2 panels, same domain, `legend:none`.
  - `pie`: panels whose values each sum to 100; never silently normalized. `labelMode:percent|category-percent`. `outside:[seriesIndex]` in a panel can force external labels. Pie hatching is rejected.
  - `line`: `x` labels, optional increasing numeric `xValues`, series `values` (null gaps allowed), `domain`, `ticks`, `xAxis:zero|bottom`, `xLabelsAt:axis|bottom`, optional `valueLabels` and `labelMode:end|legend`.
  - `points` / unjoined observations: series `points:[{x,y,label?}]`, `xDomain`, `yDomain`, explicit ticks, `legend:right|none`. Optional `axisBreaks:{x?:{from,to,gapMm},y?:{from,to,gapMm}}` explicitly maps omitted intervals; points/ticks inside them are rejected.
  - Width 40–108mm, plot height 15–200mm; series strokes .6/.7/.8pt; axes .4pt; rules .3pt. Line style applies to line charts; markers apply to lines/points. Do not carry type-specific options to other chart types. Graph `labelOffsets[seriesId][pointIndex]=[dx,dy]` (legacy numeric series index also accepted) retains the older exception: document pixels. Unsupported data/layout combinations return errors instead of changing the data. Crowded pie labels move outside without changing slice values.
- Dialogue: `{kind:"dialogue",layout,widthMm,speakers,turns}`. Layout `vertical|horizontal|presentation|portrait-only`. Speakers: `{id,label?,assetId?,side?:left|right,headWidthMm?}`. Turns: `{id,speakerId,text}`. Presentation `presentationMode:speech|screen`. Horizontal supports 2–3 active speakers. Missing assets leave portrait space empty with a warning; they never synthesize a different person. Register actual approved vectors before a finished dialogue. Repeated speakers reuse their asset. `portrait-only` adds no speech bubbles.
  - Speakers may request `crop:face|bust|full` within their registered asset range. Presentation requires a bust/full asset. Optional `podium:{assetId,widthMm?}` uses an approved prop. Screen mode accepts `screenText` or `screenGraph` (a graph spec), never both. Clear the old field with `null` when switching. No body or podium is fabricated from a face.
- Schematic: `{kind:"schematic",layout,widthMm,gapMm?,nodes,edges}`. Layout `sequential|shared|crossing|shared-results|relations`. Nodes `{id,text,shape:rect|circle,widthMm?,level?,xMm?,yMm?}`. Edges `{id,from,to,direction:none|forward|both,routing:straight|orthogonal,label?,dashed?,fromAnchor?,toAnchor?,via?:[{xMm,yMm}]}`. Explicit coordinates/via points preserve intended crossings and shared trunks; crossings do not imply junctions. Cyclic sequential constraints need explicit coordinates or a relation layout. Generated connections reference node outlines and keep arrow tips at the border.
  - Edges from the same source can declare the same `sharedStemId` and optional matching `junctionMm:{xMm,yMm}` to create one physical trunk and editable junction. Crossings without this declaration stay separate. Labels avoid connector segments; manual label wording/offset/style survives endpoint movement. Nodes accept `affiliation` and `affiliationSide:left|right` for labels outside a relation diagram.
- Pattern: `{kind:"pattern",sourceId,pattern:dots|hatch,spacingMm,dotDiameterMm?,strokePt?,angle?,originMm?:{xMm,yMm},phaseMm?:{xMm,yMm},exclusionsMm?:[{xMm,yMm,widthMm,heightMm}]}`. Actual editable circles/lines with shape clipping; one source outline. Maximum 5,000 objects. Edits regenerate density, not a stretched raster pattern.
- Asset: `{kind:"asset",assetId,headWidthMm,xMm?,yMm?,flipX?}`. Register with action `registerAsset`, `asset:{id,name,svg,headBounds:{x,y,width,height},crop:face|bust|full|prop,facing:left|right|front}`. Head bounds use pixels from the normalized SVG viewport origin. The source must contain the requested body range; a face cannot manufacture a torso. Assets are stored in this document. `removeAsset` refuses assets still referenced by components.
  - `targetHeadMm:{xMm,yMm}` names the reviewed head center. `crop:"face"` can narrow a bust/full asset to its reviewed head box with an editable vector clip. A full-to-bust crop needs a separately registered reviewed bust; guessing a torso boundary is not supported.
- Magnifier: `{kind:"magnify",sourceId,detailId?,sourceRegionMm:{xMm,yMm,widthMm,heightMm},targetRegionMm:{xMm,yMm,widthMm,heightMm}}`. Source region must lie inside the source; target is a circular clipped detail. An explicit detail vector may replace the enlarged copy. No scientific magnification label is inferred.
- Motion trail: `{kind:"trail",sourceId,pivotMm:{xMm,yMm},steps:[{xMm,yMm,angle,opacity}]}`. Stages remain editable vectors. Source is retained; all generated stages form one component.
  - Give each step a stable `id` to preserve stage identity when reordering. Optional `trajectory:{pointMm?:{xMm,yMm},strokePt?:0.3,dashed?,color?,arrowEnd?}` adds an editable path through a point transformed by each stage (source center by default). `trajectory:null` removes it on update.
- Upright writing: `{kind:"verticalText",text,fontPt:8,tracking:-60,widthMm}`.
  - Paired parenthesized units stay on one upright row. `verticalGroups:[{start,end}]` explicitly groups grapheme ranges; overlapping ranges or ranges across newlines are rejected.
- Curved lettering: `{kind:"pathText",text,sourceId?,pathD?,pathUnits:mm|px,offsetMm?,align:start|center|end,fontPt:8,tracking:-60}`. Select an existing path with `sourceId` or provide explicit SVG path data. Original wording remains in the component specification for content edits.
  - Source movement, anchor and Bezier-handle edits update the lettering; later wording edits use the current curve and preserve manual glyph style changes. Deleting the source retains the last layout with a warning; detaching clears automatic linkage.

### Reuse, layout and inspection

- `action:layout`, optional `ids`, `spec:{axis:vertical|horizontal,gapMm,align:start|center|end|baseline,equal?:none|width|height}`. Geometry uses actual painted bounds. Equal width can reflow text. Equal height never stretches letters; compound text illustrations should be resized by their own content settings.
- `action:connect`, `spec:{from,to,...}` uses object IDs and the edge settings above. Deleting either endpoint deletes that connection. Use schematic `sharedStemId` or explicit branch nodes/via points for shared stems. Duplicated diagrams remap physical endpoint and junction IDs independently.
- `action:override`, component `id`, `spec:{key,mode:fixed|offset|release,xMm?,yMm?}`. Key comes from the role map; treat it as opaque, including scoped keys for connector children. Nested components own their own roles. Direct moves and artwork edits are preserved during ordinary updates. Locked removed roles produce a diagnostic. `detach` removes automatic-layout metadata while keeping the visible editable group.
- `action:applyProfile` applies UND 8pt/-60 and role-specific rule widths only to selected objects / specified IDs. It does not change source wording, numeric data or relationships.
  - To correct only selected diagnostics, pass `ids` and `spec:{issueCodes:[...]}`. Supported codes: `TEXT_SIZE`, `TEXT_TRACKING`, `TEXT_NOT_REGULAR`, `ROLE_STROKE_WIDTH`, `GRAPH_NOT_OPAQUE`. Other attributes remain unchanged. Geometry/data problems need review rather than an automatic content correction.
- `vectora_inspect` with `includeGeometry:true` returns world geometry/paint bounds, text frames and roles; raw `objects` stay in document pixels. `vectora_audit_illustration` keeps the existing font/glyph audit and adds categorized `production.issues` and `unverified`. Error, warning and visual-review findings are distinct. A successful automatic audit does not certify a drawing's artistic quality or infer its intended meaning.
  - Paint bounds include arrows/strokes; they are conservative for clipped groups. Actual text ink measurement is separate. White-area containment, decoration intersections, reviewed head sizes, artboard clipping, connector endpoints and graph edits against saved geometry baselines are checked where metadata permits. Unknown relationships remain `unverified`.
  - A deliberate overlap can be recorded in a component's `auditOverrides:{roleKey:{intentionalOverlapWith:[otherRoleKey],whiteContainerKey?}}`. Exemptions identify exact pairs; they do not disable all collisions. Generated text frames and bubbles supply their own white-area links.

Legacy `vectora.kice/v1` primitives accept validated `charSpacing`, `opacity`, `strokeDashArray`, cap/join and arrow properties at creation. They retain their original px length convention, including stroke/dash/font sizes; arrow scales are ratios and `charSpacing` remains 1/1000em.

### Saving

`vectora_export_package({documentId,directory,baseName,includePdf?,overwrite?})` audits, writes editable SVG and `.vectora`, actual-font PNG, optional outlined PDF, and reopens the actual saved editable files in separate sessions. Read each file's status/hash and comparison results. `success:false` can coexist with successfully saved files. Existing outputs are protected by default. KICE/production SVG roots express the unchanged physical size in mm; edit metadata and viewBox remain present. No font binary is embedded.

## 0.8 부채꼴·원 그래프·변형

`vectora_apply.commands`에서 다음 기능을 사용합니다. Computer Use는 필요하지 않습니다.

- `{"type":"pieChart","spec":{"data":"A30, B30, C40","diameterMm":50,"fontSizePt":8,"palette":"gray","startAngle":90,"clockwise":true,"showPercent":true}}`: 하나의 원 그래프. `id`를 추가하면 기존 원 그래프를 수정합니다. 데이터는 양수이며 합계 대비 비율로 나눕니다. 기본값은 12시 시작(startAngle:90), 시계 방향(clockwise:true), 흰색·연한 회색·진한 회색(palette:gray)입니다. clockwise:false는 반시계 방향, palette:color는 색상입니다. 크기 변형과 그룹 변형 후에도 글자 크기는 유지됩니다. Mm/Pt 접미사는 항상 mm/pt입니다. 수정 시 지름을 생략하면 현재 크기를 유지합니다.
- 원·타원 선택 후 `{"type":"sector","startAngle":0,"endAngle":90}`. 0°는 오른쪽, 양수는 반시계 방향. 0→360은 전체 원. 저장·재열기 후에도 각도를 편집할 수 있습니다. 직접 점 편집은 자유 경로로 전환합니다.
- `{"type":"pivotTransform","kind":"rotate","angle":30,"pivot":{"x":54,"y":54}}`: 기준점 회전. kind:shear는 가로 기울이기. 회전은 반시계 방향 양수이며 pivot은 공통 geometry 단위를 사용합니다. 기존 transform.angle은 시계 방향을 유지합니다.
- `{"type":"individualTransform","scaleX":1.2,"scaleY":1.2,"angle":0}`: 각 개체 중심을 유지하며 변형합니다.
- `{"type":"alignReference","id":"actual-selected-id"}` 후 align: 기준 개체 고정 정렬. id 생략 시 선택 영역 기준으로 돌아갑니다.
- `compoundPath` / `releaseCompoundPath`: 여러 하위 경로를 evenodd 규칙으로 합치거나 해제합니다. 문자·이미지는 먼저 경로로 변환해야 합니다.
- style/add의 `vectoraStrokeProfile`: uniform / tapered / lens / triangle-to-end / triangle-from-start. 선의 중심 경로를 유지한 채 굵기 변화를 적용합니다.

편집 가능한 SVG와 .vectora에는 수치·각도·글꼴·프로파일을 보관합니다. 외부 앱용 SVG 표시와 Vectora에서의 편집 원본 재열기는 별도로 확인합니다.

## 0.9 원 그래프와 프리셋

`pieChart`의 이름과 비율은 두 줄 가운데 정렬, UND 8pt·자간 -60입니다. `vectora_create_preset`의 원 그래프도 같은 데이터 편집과 글자 크기 유지 기능을 사용합니다. 내장 도식은 최신 유형 원칙으로 재구성했으며 자료·말풍선 틀은 빈 상태입니다.
