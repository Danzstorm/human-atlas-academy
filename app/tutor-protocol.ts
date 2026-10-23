export interface TutorAction {callId:string;name:'select_structure'|'show_system'|'reset_view';args:{id?:string;isolate?:boolean}}
export function canApplyAction(turnEpoch:number,currentEpoch:number,expectedView:string,currentView:string){return turnEpoch===currentEpoch&&expectedView===currentView;}
export function acknowledgeAction(action:TutorAction,execute:(action:TutorAction)=>boolean){
 try{return {callId:action.callId,ok:execute(action)===true};}catch{return {callId:action.callId,ok:false};}
}
