import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import * as anatomy from '../app/anatomy.ts';

const atlas = JSON.parse(await readFile(new URL('../public/models/atlas.json', import.meta.url)));

test('Every heart mesh has a reviewed Spanish label without mutating source identities', () => {
  const heart = atlas.concepts.find(c => c.id === 'FMA7088');
  const before = JSON.stringify(atlas);
  for (const id of heart.elements) {
    const part = atlas.parts.find(p => p.id === id);
    assert.notEqual(anatomy.displayName(part.name), part.name, `${id}: ${part.name} needs translation`);
  }
  assert.equal(JSON.stringify(atlas), before);
});

test('Lesson and practice references resolve to selectable atlas geometry', async () => {
  const learning = await import('../app/learning.ts');
  const refs = [...learning.HEART_LESSONS.flatMap(step => step.conceptIds), ...learning.HEART_QUESTIONS.flatMap(q => q.conceptIds)];
  assert.ok(refs.length >= 10);
  for (const id of refs) {
    const concept = atlas.concepts.find(c => c.id === id);
    assert.ok(concept?.elements.length, `Missing ${id}`);
    assert.ok(concept.elements.every(element => atlas.parts.some(p => p.id === element)));
  }
});

test('Lesson chamber, valve, and outflow identifiers retain the intended anatomy', () => {
  const expected = {
    FMA7088: 'heart',
    FMA11359: 'cavity of right atrium',
    FMA9465: 'cavity of left atrium',
    FMA9291: 'cavity of right ventricle',
    FMA9466: 'cavity of left ventricle',
    FMA7234: 'tricuspid valve',
    FMA7235: 'mitral valve',
    FMA7236: 'aortic valve',
    FMA8612: 'pulmonary trunk',
    FMA3734: 'aorta',
  };
  for (const [id, name] of Object.entries(expected)) {
    assert.equal(atlas.concepts.find(c => c.id === id)?.name, name, `Anatomical mapping changed for ${id}`);
  }
});

test('Practice records actual correct and incorrect attempts, prevents duplicate scoring and resets', async () => {
  const {HEART_QUESTIONS, answerPractice, practiceResults} = await import('../app/learning.ts');
  const first = HEART_QUESTIONS[0];
  const second = HEART_QUESTIONS[1];
  let answers = answerPractice({}, first.id, first.correctIndex);
  answers = answerPractice(answers, second.id, (second.correctIndex + 1) % second.options.length);
  assert.deepEqual(practiceResults(answers), {answered: 2, correct: 1, total: HEART_QUESTIONS.length});
  assert.deepEqual(answerPractice(answers, first.id, (first.correctIndex + 1) % first.options.length), answers);
  assert.deepEqual(answerPractice(answers, first.id, 99), answers);
  assert.deepEqual(answerPractice(answers, 'unknown', 0), answers);
  assert.deepEqual(practiceResults({}), {answered: 0, correct: 0, total: HEART_QUESTIONS.length});
  assert.ok(first.explanation.length > 10 && second.explanation.length > 10);
});

test('Search finds translated valve and chamber concepts through Spanish, accentless and source names', () => {
  assert.equal(anatomy.searchConcepts(atlas.concepts, 'válvula tricúspide')[0]?.id, 'FMA7234');
  assert.equal(anatomy.searchConcepts(atlas.concepts, 'valvula tricuspide')[0]?.id, 'FMA7234');
  assert.equal(anatomy.searchConcepts(atlas.concepts, 'tricuspid valve')[0]?.id, 'FMA7234');
  assert.equal(anatomy.searchConcepts(atlas.concepts, 'FMA7234')[0]?.id, 'FMA7234');
});
