import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('../skills/create-kice-illustration/',import.meta.url);
const read=p=>readFileSync(new URL(p,root),'utf8');
test('common contract detects actual scoped resources and preserves legacy fallbacks',()=>{
 const s=read('SKILL.md');
 for(const token of ['vectora://capabilities','vectora://production/<kind>','productionKinds','planningKinds','responseView:"compact"','sinceDocumentId','reset-required','view:"component"','asset.rasterPath','준비 복사본','preparation.bindingsFrozen','기존 1.3.0','네 번째 제작 지침이 아니다'])assert.ok(s.includes(token),token);
 assert.match(s,/profile:"kice"[\s\S]*visualReview.status:"pending"[\s\S]*기존 수동 경로/);
 assert.match(s,/legacy export_package는 쓰지 않는다/);
 assert.match(s,/heightMm와 lines를 함께 보내지 않는다/);
});
test('table and dialogue contracts retain source values and approved embedded artwork',()=>{
 const table=read('references/types/table.md'),dialogue=read('references/types/dialogue.md');
 for(const token of ['rowId','columnId','rowSpan','colSpan','notApplicable','unknown','모든 격자 칸','대각선 헤더','requiresVisualReview'])assert.ok(table.includes(token),token);
 for(const token of ['awaiting-approved-artwork','reviewed:true','headBounds','visibleBounds','dataUrl','rasterPath','base64·width/height·visibleBounds를 직접 보내지 않는다','8MiB','재추적하지 않고'])assert.ok(dialogue.includes(token),token);
});
test('caller separates technical delivery from final visual inspection',()=>{
 const s=read('references/caller/exam-agent-guide.md');
 assert.match(s,/visualReview.pending[\s\S]*실제 JPEG 직접 열람 전에는 완료로 응답하지 않는다/);
 assert.match(s,/기존 1.3.0 연결본/);
});
