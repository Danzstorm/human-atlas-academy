import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import * as anatomy from '../app/anatomy.ts';

const atlas = JSON.parse(await readFile(new URL('../public/models/atlas.json', import.meta.url)));

test('Spanish accent-insensitive search selects the real heart without changing source metadata', () => {
  const source = atlas.concepts.find(c => c.name === 'heart');
  const snapshot = JSON.stringify(source);
  const matches = anatomy.searchConcepts?.(atlas.concepts, '  CORAZÓN  ');
  assert.equal(matches?.[0]?.id, source.id);
  assert.equal(matches?.[0], source);
  assert.equal(JSON.stringify(source), snapshot);
  assert.ok(source.elements.every(id => atlas.parts.some(p => p.id === id)));
});

test('Spanish aliases keep English and exact atlas identifiers searchable', () => {
  const source = atlas.concepts.find(c => c.name === 'heart');
  assert.equal(anatomy.searchConcepts?.(atlas.concepts, 'heart')?.[0]?.id, source.id);
  assert.equal(anatomy.searchConcepts?.(atlas.concepts, source.id)?.[0]?.id, source.id);
  assert.ok(anatomy.searchConcepts?.(atlas.concepts, 'fémur')?.some(c => c.name.toLowerCase().includes('femur')));
});

test('Display localization translates curated anatomy and preserves unsupported source names', () => {
  assert.equal(anatomy.displayName?.('heart'), 'Corazón');
  assert.equal(anatomy.displayName?.('unmapped source structure'), 'unmapped source structure');
});

test('Empty searches suggest organs while unmatched terms return no results', () => {
  assert.ok(anatomy.searchConcepts?.(atlas.concepts, ' ')?.some(c => c.name === 'heart'));
  assert.deepEqual(anatomy.searchConcepts?.(atlas.concepts, 'does-not-exist-xyz'), []);
});
