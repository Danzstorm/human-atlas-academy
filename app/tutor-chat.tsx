import {useEffect,useRef,useState} from 'react';
import {Send,Paperclip,X,RotateCcw} from 'lucide-react';
import type {SceneState} from './anatomy';
import {acknowledgeAction,canApplyAction,type TutorAction} from './tutor-protocol';

type Source={url:string;title:string};
type Message={id:number;role:'user'|'assistant';text:string;sources?:Source[];retrieved?:boolean};
type Attachment={name:string;type:string;data:string};
type Reply={sessionId:string;turnId:string;text?:string;sources?:Source[];retrieved?:boolean;actions?:TutorAction[];error?:string};
type Props={context:SceneState;selection:string;ready:boolean;execute:(action:TutorAction)=>boolean;request:{id:number;text:string}|null};

function Answer({text}:{text:string}){
 return <div className="tutor-answer">{text.split(/\n\s*\n/).map((paragraph,index)=><p key={index}>{paragraph.split(/(\*\*[^*]+\*\*)/g).map((piece,i)=>piece.startsWith('**')?<strong key={i}>{piece.slice(2,-2)}</strong>:piece.replace(/^#{1,4}\s/gm,''))}</p>)}</div>;
}
export default function TutorChat({context,selection,ready,execute,request}:Props){
 const [messages,setMessages]=useState<Message[]>([]),[draft,setDraft]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [configured,setConfigured]=useState<boolean|null>(null),[file,setFile]=useState<Attachment|null>(null),[attachedName,setAttachedName]=useState('');
 const [reading,setReading]=useState(false);
 const session=useRef<string|null>(null),epoch=useRef(0),controller=useRef<AbortController|null>(null),last=useRef<{text:string;file:Attachment|null}|null>(null);
 const current=useRef({context,execute,ready});current.current={context,execute,ready};
 const input=useRef<HTMLTextAreaElement>(null),chat=useRef<HTMLDivElement>(null),fileEpoch=useRef(0);
 const signature=()=>JSON.stringify(current.current.context);
 const cancel=(reset=false)=>{
  epoch.current++;controller.current?.abort();controller.current=null;setBusy(false);
  const id=session.current;if(reset)session.current=null;
  if(id)void fetch('/api/tutor',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:id,...(reset?{cancel:true}:{cancelTurn:true})})}).catch(()=>{});
  if(!reset)setError('Respuesta cancelada. Puedes continuar con otra pregunta.');
 };
 useEffect(()=>{const abort=new AbortController();fetch('/api/tutor/status',{signal:abort.signal}).then(r=>r.json() as Promise<{configured?:boolean}>).then(data=>setConfigured(data.configured===true)).catch(()=>{if(!abort.signal.aborted)setConfigured(false);});return()=>{abort.abort();epoch.current++;controller.current?.abort();};},[]);
 useEffect(()=>{if(chat.current)chat.current.scrollTop=chat.current.scrollHeight;},[messages,busy,error]);
 async function post(body:object,signal:AbortSignal){
  const response=await fetch('/api/tutor',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal});
  const data=await response.json() as Reply;if(!response.ok||data.error)throw Error(data.error||'No se pudo obtener una respuesta.');return data;
 }
 async function send(text:string,attachment=file,retry=false){
  if(busy||reading||!ready||!text.trim())return;
  const turn=++epoch.current;const abort=new AbortController();controller.current=abort;
  let expectedView=signature();setBusy(true);setError('');setDraft('');last.current={text,file:attachment};
  if(!retry)setMessages(previous=>[...previous,{id:Date.now(),role:'user',text:text+(attachment?`\nPDF: ${attachment.name}`:'')}]);
  try{
   let reply=await post({sessionId:session.current??undefined,message:text,context:current.current.context,...(attachment?{file:attachment}:{})},abort.signal);
   if(turn!==epoch.current)return;session.current=reply.sessionId;
   if(attachment){setAttachedName(attachment.name);setFile(null);}
   for(let round=0;reply.actions&&round<6;round++){
    if(turn!==epoch.current)return;
    const results=reply.actions.map(action=>{
     if(!current.current.ready||!canApplyAction(turn,epoch.current,expectedView,signature()))return {callId:action.callId,ok:false};
     const result=acknowledgeAction(action,current.current.execute);if(result.ok)expectedView=signature();return result;
    });
    reply=await post({sessionId:reply.sessionId,turnId:reply.turnId,results,context:current.current.context},abort.signal);
   }
   if(turn!==epoch.current)return;if(!reply.text)throw Error('El tutor no devolvió una explicación.');
   setMessages(previous=>[...previous,{id:Date.now(),role:'assistant',text:reply.text!,sources:reply.sources,retrieved:reply.retrieved}]);last.current=null;
  }catch(cause){if(turn===epoch.current&&!abort.signal.aborted)setError(cause instanceof Error?cause.message:'No se pudo conectar con el tutor.');}
  finally{if(turn===epoch.current){setBusy(false);controller.current=null;}}
 }
 useEffect(()=>{if(request){document.getElementById('anatomy-tutor')?.scrollIntoView({block:'start',behavior:'smooth'});void send(request.text);}},[request?.id]);
 async function attach(selected:File|undefined){
  if(!selected)return;const version=++fileEpoch.current;
  if(selected.type!=='application/pdf'||selected.size>5*1024*1024||!/\.pdf$/i.test(selected.name)){setError('Selecciona un PDF de hasta 5 MB.');return;}
  setReading(true);setError('');
  try{
   const bytes=new Uint8Array(await selected.arrayBuffer());if(new TextDecoder().decode(bytes.slice(0,5))!=='%PDF-')throw Error('El archivo no es un PDF válido.');
   let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
   if(version===fileEpoch.current)setFile({name:selected.name,type:'application/pdf',data:btoa(binary)});
  }catch(cause){if(version===fileEpoch.current)setError(cause instanceof Error?cause.message:'No se pudo abrir el PDF.');}finally{if(version===fileEpoch.current)setReading(false);}
 }
 return <section className="tutor-panel" id="anatomy-tutor" aria-label="Tutor de anatomía">
  <div className="tutor-heading"><div><span className="section-kicker">APRENDE CON EL TUTOR</span><h2>Pregunta, observa y comprueba</h2></div><button onClick={()=>{cancel(true);fileEpoch.current++;setReading(false);setMessages([]);setFile(null);setAttachedName('');setError('');last.current=null;}} title="Iniciar una conversación nueva"><RotateCcw size={18}/><span>Nueva conversación</span></button></div>
  <p className="tutor-intro">Relaciona la anatomía con lo que ves. Puedes pedir explicaciones, mostrar estructuras en 3D y comprobar lo que entendiste.</p>
  <p className="tutor-context">Contexto actual: <strong>{selection}</strong></p>
  {configured===false&&<p className="tutor-error" role="alert">El tutor no está disponible. Revisa la configuración local del servidor.</p>}
  <div className="tutor-starters">{['Explícame esta estructura','Muéstrame los riñones','Comprueba lo que entendí'].map(prompt=><button disabled={busy||reading||!ready||configured===false} key={prompt} onClick={()=>void send(prompt)}>{prompt}</button>)}</div>
  <div className="tutor-messages" ref={chat} role="log" aria-label="Conversación con el tutor" aria-live="polite" aria-relevant="additions">
   {!messages.length&&<p className="tutor-empty">Elige una estructura y pregunta por su ubicación, relaciones o función. También puedes empezar con cualquier tema de anatomía.</p>}
   {messages.map(message=><article key={message.id} className={`tutor-message ${message.role}`}><span className="tutor-speaker">{message.role==='user'?'Tú':'Tutor'}</span><Answer text={message.text}/>{message.role==='assistant'&&<><p className="tutor-provenance">{message.retrieved?'Consulta de fuentes realizada en este turno.':'Sin consulta web en este turno: explicación basada en conocimiento del modelo y el material de esta conversación.'}</p>{!!message.sources?.length&&<ul className="tutor-sources">{message.sources.map(source=><li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title} ↗</a></li>)}</ul>}</>}</article>)}
   {busy&&<p className="tutor-busy" role="status">El tutor está preparando la respuesta y consultando las herramientas necesarias…</p>}
  </div>
  {error&&<div className="tutor-error" role="alert"><p>{error}</p>{last.current&&<button disabled={busy} onClick={()=>{const failed=last.current;if(failed)void send(failed.text,failed.file,true);}}>Reintentar pregunta</button>}</div>}
  {attachedName&&<p className="tutor-file-note">Material de esta conversación: {attachedName}. Inicia una conversación nueva para retirar su contexto o adjuntar otro PDF.</p>}
  <form onSubmit={event=>{event.preventDefault();void send(draft);}} className="tutor-form"><label htmlFor="tutor-question">Tu pregunta de anatomía</label><textarea id="tutor-question" ref={input} value={draft} maxLength={8000} onChange={event=>setDraft(event.target.value)} placeholder="¿Cómo se relaciona esta estructura con las que tiene alrededor?" rows={3} disabled={busy} onKeyDown={event=>{if(event.key==='Enter'&&(event.ctrlKey||event.metaKey)){event.preventDefault();void send(draft);}}}/>
   <p className="tutor-upload-notice">El PDF se enviará a OpenAI para responder sobre tu material. Puedes quitarlo antes de enviar. Máximo 5 MB.</p>
   {file&&<div className="tutor-attachment"><span>{file.name}</span><button type="button" onClick={()=>setFile(null)} aria-label="Quitar PDF"><X size={16}/></button></div>}
   <div className="tutor-form-actions"><label className={`tutor-upload ${busy||attachedName?'disabled':''}`}><Paperclip size={17}/>Adjuntar PDF<input type="file" accept="application/pdf,.pdf" disabled={busy||reading||!!attachedName} onChange={event=>{void attach(event.target.files?.[0]);event.target.value='';}}/></label>{busy?<button type="button" onClick={()=>cancel()}>Cancelar respuesta</button>:<button className="action-button" type="submit" disabled={!draft.trim()||reading||!ready||configured===false}><Send size={17}/>{reading?'Leyendo PDF…':'Enviar'}</button>}</div>
  </form><p className="tutor-disclaimer">Tutor educativo: contrasta lo aprendido con tu curso. No ofrece diagnóstico ni sustituye la orientación clínica.</p>
 </section>;
}
