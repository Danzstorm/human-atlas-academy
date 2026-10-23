import assert from 'node:assert/strict';
import {test} from 'node:test';
const protocol=await import('../app/tutor-protocol.ts').catch(()=>({}));
test('A cancelled or manually changed view cannot apply late tutor actions',()=>{
 assert.equal(typeof protocol.canApplyAction,'function','Action guard must exist');
 assert.equal(protocol.canApplyAction(1,2,'original','original'),false);
 assert.equal(protocol.canApplyAction(1,1,'original','changed'),false);
 assert.equal(protocol.canApplyAction(1,1,'original','original'),true);
});
test('An action is acknowledged only after its real executor completes',()=>{
 assert.equal(typeof protocol.acknowledgeAction,'function','Action acknowledgement must exist');
 let selected='';
 const result=protocol.acknowledgeAction({callId:'c',name:'select_structure',args:{id:'brain'}},action=>{selected=action.args.id;return true;});
 assert.equal(selected,'brain');assert.deepEqual(result,{callId:'c',ok:true});
 assert.deepEqual(protocol.acknowledgeAction({callId:'bad'},()=>{throw Error('unavailable');}),{callId:'bad',ok:false});
});
