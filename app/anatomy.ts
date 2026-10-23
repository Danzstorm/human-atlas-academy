export type SystemId = 'skeletal'|'muscular'|'arterial'|'venous'|'nervous'|'digestive'|'respiratory'|'urinary'|'reproductive'|'lymphatic'|'endocrine'|'integumentary'|'connective'|'sensory'|'cardiac';
export const SYSTEMS: {id:SystemId;name:string;color:string;description:string}[] = [
 {id:'skeletal',name:'Esqueleto',color:'#e2d9ba',description:'Los huesos sostienen el cuerpo, protegen los órganos y ofrecen puntos de inserción a los músculos. También almacenan minerales y su médula produce células sanguíneas.'},
 {id:'muscular',name:'Músculos',color:'#a85b50',description:'Los músculos esqueléticos generan movimiento mediante sus inserciones. Junto con los tendones, movilizan las articulaciones, estabilizan la postura y producen calor.'},
 {id:'cardiac',name:'Corazón',color:'#b96760',description:'El corazón es una bomba muscular con cuatro cavidades. Sus válvulas dirigen la sangre a través de la circulación pulmonar y sistémica.'},
 {id:'sensory',name:'Órganos de los sentidos',color:'#b0c8ce',description:'Estas estructuras intervienen en la visión, la audición y el equilibrio. Sus tejidos especializados detectan estímulos y transmiten información al sistema nervioso.'},
 {id:'arterial',name:'Arterias',color:'#c05245',description:'Las arterias llevan la sangre desde el corazón hacia los tejidos o, en la circulación pulmonar, hacia los pulmones.'},
 {id:'venous',name:'Venas',color:'#527c9f',description:'Las venas devuelven la sangre al corazón. Las redes superficiales y profundas recogen sangre de los tejidos; las venas pulmonares transportan sangre oxigenada desde los pulmones.'},
 {id:'nervous',name:'Sistema nervioso',color:'#d8b565',description:'El encéfalo, la médula espinal y los nervios periféricos transmiten y procesan señales. Participan en la sensibilidad, el movimiento, la coordinación y la regulación de funciones corporales.'},
 {id:'respiratory',name:'Respiratorio',color:'#b98991',description:'Las vías respiratorias conducen el aire a los pulmones, donde se intercambian oxígeno y dióxido de carbono con la sangre. Los músculos respiratorios producen los cambios de presión necesarios para respirar.'},
 {id:'digestive',name:'Digestivo',color:'#b8916b',description:'El tubo digestivo transforma los alimentos, absorbe nutrientes y agua y transporta los residuos. Los órganos accesorios aportan bilis y enzimas digestivas.'},
 {id:'urinary',name:'Urinario',color:'#b47961',description:'Los riñones filtran la sangre y regulan el equilibrio de líquidos, electrolitos y ácido-base. La orina pasa por los uréteres a la vejiga y sale por la uretra.'},
 {id:'lymphatic',name:'Linfático',color:'#879f7c',description:'Los vasos linfáticos devuelven el exceso de líquido intersticial a la circulación. Los ganglios y otros órganos linfoides participan en la vigilancia y respuesta inmunitaria.'},
 {id:'endocrine',name:'Endocrino',color:'#c5a09a',description:'Los órganos endocrinos liberan hormonas a la sangre para coordinar el metabolismo, el crecimiento, la respuesta al estrés y la reproducción.'},
 {id:'reproductive',name:'Reproductor',color:'#bda098',description:'Las estructuras reproductoras masculinas representadas participan en la producción, maduración y transporte de espermatozoides y en la producción de hormonas sexuales.'},
 {id:'integumentary',name:'Superficie corporal',color:'#ba9b7d',description:'La superficie corporal ofrece una referencia anatómica externa. El sistema tegumentario protege el cuerpo y participa en la sensibilidad y la regulación de la temperatura.'},
 {id:'connective',name:'Tejido conjuntivo',color:'#aec3bb',description:'El cartílago, los ligamentos y otros tejidos conjuntivos sostienen, conectan y separan estructuras. Estabilizan las articulaciones y distribuyen las cargas mecánicas.'},
];
export interface Part {id:string;name:string;conceptId:string;system:SystemId;chunk:number;positions:number;normals:number;indices:number;vertexCount:number;indexCount:number;bounds:[number[],number[]]}
export interface Concept {id:string;name:string;elements:string[]}
export interface Atlas {version:string;sex?:'male';source?:string;scope?:string;parts:Part[];concepts:Concept[];chunks:{url:string;bytes:number;gzip?:string;gzipBytes?:number}[];triangles:number}
export type View = 'three-quarter'|'front'|'back'|'side';
export interface SceneState {inspectorOpen?:boolean;explode:number;visible:SystemId[];selected:string[];isolate:boolean;view:View;rotate:boolean;reset:number}
export const DEFAULT_VISIBLE:SystemId[] = ['cardiac','sensory','skeletal','muscular','arterial','venous','nervous','respiratory','digestive','urinary','lymphatic','endocrine','reproductive','connective'];
export function createExplorerState():SceneState{return {explode:0,visible:[...DEFAULT_VISIBLE],selected:[],isolate:false,view:'three-quarter',rotate:false,reset:0};}
export function showSystem(state:SceneState,system:SystemId):SceneState{return {...state,visible:[system],selected:[],isolate:false,explode:0,rotate:false,reset:state.reset+1};}
export function commonParts(concepts:Concept[]):Concept[]{
 return ['brain','left lung','right lung','liver','stomach','left kidney','right kidney','skull','left femur','spinal cord','heart'].map(name=>concepts.find(c=>c.name.toLowerCase()===name)).filter((c):c is Concept=>!!c);
}
export const EXPLANATIONS:Record<string,string> = {
 'heart':'Bomba muscular situada en el tórax. Su lado derecho envía sangre a los pulmones; el izquierdo la impulsa hacia la circulación sistémica.',
 'liver':'Órgano situado bajo el lado derecho del diafragma. Procesa nutrientes absorbidos, produce bilis y sintetiza numerosas proteínas de la sangre.',
 'brain':'Órgano central del sistema nervioso. Sus regiones interconectadas participan en la percepción, el movimiento, la memoria, el lenguaje y la regulación de funciones corporales.',
 'stomach':'Cavidad muscular entre el esófago y el intestino delgado. Almacena y mezcla los alimentos con ácido y enzimas antes de enviarlos al duodeno.',
 'spleen':'Órgano linfoide de la región superior izquierda del abdomen. Filtra la sangre, elimina células sanguíneas envejecidas y participa en la respuesta inmunitaria.',
 'pancreas':'Órgano abdominal con funciones digestivas y endocrinas. Aporta enzimas al intestino delgado y libera hormonas, entre ellas insulina y glucagón.',
 'urinary bladder':'Reservorio muscular situado en la pelvis. Almacena la orina procedente de los riñones que llega por los uréteres.',
 'trachea':'Vía respiratoria que conecta la laringe con los bronquios. Sus cartílagos mantienen la vía abierta durante la respiración.',
 'diaphragm':'Músculo amplio que separa el tórax del abdomen. Al contraerse aumenta el volumen torácico y facilita la entrada de aire a los pulmones.',
};
export function explanation(name:string,system:SystemId){return EXPLANATIONS[name.toLowerCase()] ?? SYSTEMS.find(s=>s.id===system)?.description ?? '';}


/** Curated display names only; source concept names and identifiers remain unchanged. */
const SPANISH_NAMES:Record<string,string> = {
 'left anterior cusp of pulmonary valve':'Valva anterior izquierda de la válvula pulmonar',
 'anterolateral head of lateral papillary muscle of left ventricle':'Cabeza anterolateral del músculo papilar lateral del ventrículo izquierdo',
 'anterior papillary muscle of right ventricle':'Músculo papilar anterior del ventrículo derecho',
 'anterior leaflet of mitral valve':'Valva anterior de la válvula mitral',
 'anterior leaflet of tricuspid valve':'Valva anterior de la válvula tricúspide',
 'cavity of left ventricle':'Cavidad del ventrículo izquierdo',
 'cavity of right ventricle':'Cavidad del ventrículo derecho',
 'cavity of right atrium':'Cavidad de la aurícula derecha',
 'cavity of left atrium':'Cavidad de la aurícula izquierda',
 'left posterior cusp of aortic valve':'Valva posterior izquierda de la válvula aórtica',
 'posterior cusp of pulmonary valve':'Valva posterior de la válvula pulmonar',
 'lateral papillary muscle of left ventricle':'Músculo papilar lateral del ventrículo izquierdo',
 'posterior papillary muscle of right ventricle':'Músculo papilar posterior del ventrículo derecho',
 'right posterior cusp of aortic valve':'Valva posterior derecha de la válvula aórtica',
 'posterior leaflet of mitral valve':'Valva posterior de la válvula mitral',
 'posterior leaflet of tricuspid valve':'Valva posterior de la válvula tricúspide',
 'right anterior cusp of pulmonary valve':'Valva anterior derecha de la válvula pulmonar',
 'anterior cusp of aortic valve':'Valva anterior de la válvula aórtica',
 'septal leaflet of tricuspid valve':'Valva septal de la válvula tricúspide',
 'septal papillary muscle of right ventricle':'Músculo papilar septal del ventrículo derecho',
 'wall of left atrium':'Pared de la aurícula izquierda',
 'wall of right atrium':'Pared de la aurícula derecha',
 'trunk of anterior interventricular branch of left coronary artery':'Tronco de la rama interventricular anterior de la arteria coronaria izquierda',
 'first right anterior branch of anterior interventricular branch of left coronary artery':'Primera rama anterior derecha de la rama interventricular anterior de la coronaria izquierda',
 'diagonal branch of anterior descending branch of left coronary artery':'Rama diagonal de la rama descendente anterior de la coronaria izquierda',
 'third right anterior branch of anterior interventricular branch of left coronary artery':'Tercera rama anterior derecha de la rama interventricular anterior de la coronaria izquierda',
 'conus branch of anterior interventricular branch of left coronary artery':'Rama del cono de la rama interventricular anterior de la coronaria izquierda',
 'second right anterior branch of anterior interventricular branch of left coronary artery':'Segunda rama anterior derecha de la rama interventricular anterior de la coronaria izquierda',
 'circumflex branch of left coronary artery':'Rama circunfleja de la arteria coronaria izquierda',
 'coronary sinus':'Seno coronario', 'great cardiac vein':'Vena cardíaca magna',
 'marginal branch of right coronary artery':'Rama marginal de la arteria coronaria derecha',
 'right conus artery':'Arteria del cono derecha',
 'first anterior ventricular branch of right coronary artery':'Primera rama ventricular anterior de la coronaria derecha',
 'posterior interventricular branch of right coronary artery':'Rama interventricular posterior de la coronaria derecha',
 'first posterior ventricular branch of right coronary artery':'Primera rama ventricular posterior de la coronaria derecha',
 'trunk of right coronary artery':'Tronco de la arteria coronaria derecha',
 'small cardiac vein':'Vena cardíaca menor', 'right marginal vein':'Vena marginal derecha',
 'trunk of left coronary artery':'Tronco de la arteria coronaria izquierda',
 'right atrium':'Aurícula derecha', 'left atrium':'Aurícula izquierda',
 'right ventricle':'Ventrículo derecho', 'left ventricle':'Ventrículo izquierdo',
 'tricuspid valve':'Válvula tricúspide', 'mitral valve':'Válvula mitral',
 'aortic valve':'Válvula aórtica', 'pulmonary valve':'Válvula pulmonar',
 'pulmonary trunk':'Tronco pulmonar', 'superior vena cava':'Vena cava superior',
 'inferior vena cava':'Vena cava inferior', 'pulmonary vein':'Vena pulmonar',
 'left coronary artery':'Arteria coronaria izquierda', 'right coronary artery':'Arteria coronaria derecha',
 'cavity of atrium':'Cavidades auriculares', 'cavity of ventricle':'Cavidades ventriculares',
 heart:'Corazón', brain:'Encéfalo', liver:'Hígado', stomach:'Estómago', spleen:'Bazo',
 pancreas:'Páncreas', 'urinary bladder':'Vejiga urinaria', trachea:'Tráquea', diaphragm:'Diafragma',
 aorta:'Aorta', esophagus:'Esófago', duodenum:'Duodeno', rectum:'Recto', tongue:'Lengua',
 larynx:'Laringe', pharynx:'Faringe', sternum:'Esternón', sacrum:'Sacro', skull:'Cráneo',
 'spinal cord':'Médula espinal', 'small intestine':'Intestino delgado', 'large intestine':'Intestino grueso',
 'left kidney':'Riñón izquierdo', 'right kidney':'Riñón derecho', 'left lung':'Pulmón izquierdo', 'right lung':'Pulmón derecho',
 'left femur':'Fémur izquierdo', 'right femur':'Fémur derecho', 'left humerus':'Húmero izquierdo', 'right humerus':'Húmero derecho',
 'left tibia':'Tibia izquierda', 'right tibia':'Tibia derecha', 'left scapula':'Escápula izquierda', 'right scapula':'Escápula derecha',
 'left clavicle':'Clavícula izquierda', 'right clavicle':'Clavícula derecha',
};
export function displayName(name:string):string{return SPANISH_NAMES[name.toLowerCase()]??name;}
export function hasReviewedName(name:string):boolean{return Object.hasOwn(SPANISH_NAMES,name.toLowerCase());}
/** User-facing fallback never passes untranslated source text off as Spanish. */
export function spanishLabel(name:string):string{return hasReviewedName(name)?displayName(name):'Estructura sin traducción revisada';}
const searchAliases:Record<string,string> = {brain:'cerebro',kidney:'riñón renal',lung:'pulmón pulmonar',femur:'fémur',humerus:'húmero',skull:'cráneo',nerve:'nervio',artery:'arteria',vein:'vena',muscle:'músculo',bone:'hueso',rib:'costilla',vertebra:'vértebra',cartilage:'cartílago',ligament:'ligamento'};
function normalizeSearch(value:string){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();}
export function searchConcepts(concepts:Concept[],query:string,options:{reviewedOnly?:boolean}={}):Concept[]{
 const term=normalizeSearch(query);
 const searchable=options.reviewedOnly?concepts.filter(c=>hasReviewedName(c.name)):concepts;
 if(!term)return commonParts(searchable);
 return searchable.filter(c=>{
  const aliases=Object.entries(searchAliases).filter(([word])=>c.name.toLowerCase().includes(word)).map(([,alias])=>alias).join(' ');
  return normalizeSearch(c.name).includes(term)||normalizeSearch(c.id).includes(term)||normalizeSearch(displayName(c.name)).includes(term)||normalizeSearch(aliases).includes(term);
 }).sort((a,b)=>Number(normalizeSearch(displayName(b.name))===term)-Number(normalizeSearch(displayName(a.name))===term)||a.name.length-b.name.length).slice(0,80);
}
