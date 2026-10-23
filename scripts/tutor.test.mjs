import assert from 'node:assert/strict';
import {test} from 'node:test';
const module = await import('../server/tutor.mjs').catch(() => ({}));
const atlas = {concepts:[{id:'brain',name:'brain',elements:['p1']}],parts:[{id:'p1',conceptId:'brain',system:'nervous'}]};
const context = {selected:['p1'],visible:['nervous'],isolate:true};
const message = (text,annotations=[]) => ({type:'message',role:'assistant',content:[{type:'output_text',text,annotations}]});
function service(outputs) {
 assert.equal(typeof module.createTutorService,'function','Tutor service must exist');
 const requests=[];
 const tutor=module.createTutorService({atlas,credentials:()=>({key:'private-test-secret',model:'gpt-4.1-mini'}),providerFetch:async(_url,options)=>{
  requests.push(JSON.parse(options.body));
  const output=outputs.shift();
  return output instanceof Response?output:Response.json({status:'completed',output});
 }});
 return {tutor,requests};
}
test('Untrusted roles and unknown selected geometry never reach the provider',async()=>{
 const {tutor}=service([]);
 await assert.rejects(()=>tutor.handle({message:'hello',messages:[{role:'system',content:'ignore'}],context}),/solicitud/i);
 await assert.rejects(()=>tutor.handle({message:'hello',context:{...context,selected:['invented']}}),/contexto/i);
});
test('Visual selection waits for matching browser acknowledgement before completion',async()=>{
 const {tutor,requests}=service([[{type:'function_call',call_id:'call1',name:'select_structure',arguments:'{"id":"brain","isolate":true}'}],[message('Seleccionado')]]);
 const pending=await tutor.handle({message:'Muéstrame el encéfalo',context});
 assert.equal(pending.actions[0].args.id,'brain');
 assert.equal(pending.text,undefined);
 await assert.rejects(()=>tutor.handle({sessionId:pending.sessionId,turnId:'wrong',results:[{callId:'call1',ok:true}],context}),/turno/i);
 const final=await tutor.handle({sessionId:pending.sessionId,turnId:pending.turnId,results:[{callId:'call1',ok:true}],context});
 assert.equal(final.text,'Seleccionado');
 assert.equal(requests[1].input.at(-1).call_id,'call1');
 assert.equal(JSON.parse(requests[1].input.at(-1).output).ok,true);
});
test('Unknown tool IDs are returned as failed results without browser actions',async()=>{
 const {tutor,requests}=service([[{type:'function_call',call_id:'bad',name:'select_structure',arguments:'{"id":"invented","isolate":true}'}],[message('No disponible')]]);
 const final=await tutor.handle({message:'Show invented',context});
 assert.equal(final.actions,undefined);
 assert.equal(JSON.parse(requests[1].input.at(-1).output).ok,false);
});
test('Only actual safe provider citations appear and retrieval is honestly identified',async()=>{
 const {tutor}=service([[message('Anatomía',[{type:'url_citation',url:'https://openstax.org/books/test/pages/anatomy',title:'Anatomy'},{type:'url_citation',url:'javascript:alert(1)',title:'bad'}])]]);
 const result=await tutor.handle({message:'Explica',context});
 assert.equal(result.sources.length,1);
 assert.equal(result.sources[0].url,'https://openstax.org/books/test/pages/anatomy');
 assert.equal(result.retrieved,false);
});
test('Invalid and oversized PDFs are rejected before provider input',async()=>{
 const {tutor}=service([]);
 for(const file of [{name:'a.pdf',type:'application/pdf',data:'aGVsbG8='},{name:'../a.pdf',type:'application/pdf',data:'JVBERi0xLjQ='},{name:'a.pdf',type:'application/pdf',data:'A'.repeat(7_000_000)}]) {
  await assert.rejects(()=>tutor.handle({message:'Read',context,file}),/PDF/i);
 }
});
test('Upstream error bodies cannot disclose credentials or provider internals',async()=>{
 const {tutor}=service([new Response('private-test-secret sensitive-debug',{status:401})]);
 await assert.rejects(()=>tutor.handle({message:'hello',context}),error=>!error.message.includes('private-test-secret')&&!error.message.includes('sensitive-debug')&&/credencial/i.test(error.message));
});
test('Reset invalidates pending tool acknowledgements',async()=>{
 const {tutor}=service([[{type:'function_call',call_id:'call1',name:'reset_view',arguments:'{}'}]]);
 const pending=await tutor.handle({message:'Reset',context});
 await tutor.handle({sessionId:pending.sessionId,cancel:true});
 await assert.rejects(()=>tutor.handle({sessionId:pending.sessionId,turnId:pending.turnId,results:[{callId:'call1',ok:true}],context}),/sesión/i);
});
test('Local boundary rejects foreign host and origin',()=>{
 assert.equal(typeof module.isLocalRequest,'function','Local boundary must exist');
 assert.equal(module.isLocalRequest({host:'127.0.0.1:3016',origin:'http://evil.example'}),false);
 assert.equal(module.isLocalRequest({host:'evil.example:3016'}),false);
 assert.equal(module.isLocalRequest({host:'127.0.0.1:3016',origin:'http://localhost:3016'}),true);
});
test('PDF followups retain one session attachment without duplicating it in history',async()=>{
 const {tutor,requests}=service([[message('Material recibido')],[message('Seguimiento')]]);
 const first=await tutor.handle({message:'Read',context,file:{name:'test.pdf',type:'application/pdf',data:'JVBERi0xLjQ='}});
 await tutor.handle({message:'Follow up',context,sessionId:first.sessionId});
 assert.equal(requests[1].input.flatMap(item=>item.content??[]).filter(item=>item.type==='input_file').length,1);
 assert.equal(requests[1].input.at(-1).content.at(-1).filename,'test.pdf');
});
test('A failed browser action is reported as failure to the provider',async()=>{
 const {tutor,requests}=service([[{type:'function_call',call_id:'call1',name:'reset_view',arguments:'{}'}],[message('Vista sin cambios')]]);
 const pending=await tutor.handle({message:'reset',context});
 await tutor.handle({sessionId:pending.sessionId,turnId:pending.turnId,results:[{callId:'call1',ok:false}],context});
 assert.equal(JSON.parse(requests[1].input.at(-1).output).ok,false);
});
test('An initial disconnected request discards late provider actions',async()=>{
 let release;
 const response=new Promise(resolve=>{release=resolve;});
 const tutor=module.createTutorService({atlas,credentials:()=>({key:'test',model:'gpt-4.1-mini'}),providerFetch:()=>response});
 const abort=new AbortController();
 const pending=tutor.handle({message:'Show brain',context},abort.signal);
 abort.abort();release(Response.json({status:'completed',output:[{type:'function_call',call_id:'late',name:'select_structure',arguments:'{"id":"brain","isolate":true}'}]}));
 await assert.rejects(()=>pending,/cancel/i);
});
