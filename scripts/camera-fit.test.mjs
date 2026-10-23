import assert from 'node:assert/strict';
import {test} from 'node:test';

test('Camera fits dedicated stage instead of reserving removed overlay space', async () => {
 const {fitDistance} = await import('../app/camera-fit.ts');
 assert.ok(Math.abs(fitDistance({x:2,y:4,z:1},2,90)-2.9)<1e-8);
 assert.ok(Math.abs(fitDistance({x:2,y:4,z:1},.25,90)-5.3)<1e-8);
 assert.ok(Number.isFinite(fitDistance({x:0,y:0,z:0},1,34)));
});
