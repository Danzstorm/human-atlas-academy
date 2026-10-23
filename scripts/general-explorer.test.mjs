import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import * as anatomy from '../app/anatomy.ts';

const atlas = JSON.parse(await readFile(new URL('../public/models/atlas.json', import.meta.url)));

test('Opening the explorer leaves all internal systems visible without preselecting an organ', () => {
 const state = anatomy.createExplorerState?.();
 assert.ok(state, 'Explorer initial state must be available');
 assert.deepEqual(state.selected, []);
 assert.equal(state.isolate, false);
 assert.ok(state.visible.includes('skeletal') && state.visible.includes('nervous') && state.visible.includes('digestive'));
 assert.equal(state.visible.length, 14);
});

test('Showing a system clears an isolated selection from the previous system', () => {
 const previous = {explode:.8,visible:['cardiac'],selected:['source-part'],isolate:true,view:'front',rotate:true,reset:2};
 const next = anatomy.showSystem?.(previous, 'skeletal');
 assert.ok(next, 'System navigation must provide a consistent viewer state');
 assert.deepEqual(next.visible, ['skeletal']);
 assert.deepEqual(next.selected, []);
 assert.equal(next.isolate, false);
 assert.equal(next.explode, 0);
 assert.equal(next.rotate, false);
 assert.equal(next.reset, 3);
 assert.deepEqual(previous.selected, ['source-part']);
});

test('Common-part navigation resolves different systems to original, selectable atlas concepts', () => {
 const snapshot = JSON.stringify(atlas.concepts);
 const choices = anatomy.commonParts?.(atlas.concepts);
 assert.ok(choices, 'General shortcuts must be available');
 for (const [id,name] of [['FMA50801','brain'],['FMA7310','left lung'],['FMA7197','liver'],['FMA7205','left kidney'],['FMA46565','skull'],['FMA24475','left femur']]) {
  const concept = choices.find(c=>c.id===id);
  assert.equal(concept?.name,name);
  assert.ok(concept.elements.every(id=>atlas.parts.some(p=>p.id===id)));
  assert.equal(concept,atlas.concepts.find(c=>c.id===id));
 }
 assert.equal(JSON.stringify(atlas.concepts),snapshot);
});

test('Reviewed search filters before the result cap so a valid Spanish result cannot disappear', () => {
 const unreviewed = Array.from({length:90},(_,i)=>({id:`fake-${i}`,name:`brain x${i}`,elements:[]}));
 const real = atlas.concepts.find(c=>c.id==='FMA50801');
 // Put the real result past the source sorting cap using an independent reviewed long name.
 const reviewed = {id:'reviewed-long',name:'anterolateral head of lateral papillary muscle of left ventricle',elements:['actual']};
 const crowded = [...Array.from({length:90},(_,i)=>({id:`FMAfake${i}`,name:`a${i}`,elements:[]})),{...reviewed,id:'FMA-reviewed'}];
 assert.deepEqual(anatomy.searchConcepts(crowded,'FMA',{reviewedOnly:true}).map(c=>c.id),['FMA-reviewed']);
 for (const query of ['cerebro','brain','FMA50801']) {
  assert.equal(anatomy.searchConcepts([...unreviewed,real],query,{reviewedOnly:true})[0]?.id,'FMA50801');
 }
});
