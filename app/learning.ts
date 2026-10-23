export const HEART_SOURCE = 'https://openstax.org/books/anatomy-and-physiology-2e/pages/19-1-heart-anatomy';
export const CYCLE_SOURCE = 'https://openstax.org/books/anatomy-and-physiology-2e/pages/19-3-cardiac-cycle';

export interface Lesson {
 id:string; title:string; objective:string; conceptIds:string[];
 explanation:string; observation:string; prompt:string; hint:string; source:string;
}

// Short original educational summaries; no documents or figures have been ingested.
export const HEART_LESSONS:Lesson[] = [
 {id:'orientation',title:'Ubicación y orientación',objective:'Ubicar el corazón y distinguir las referencias del modelo.',conceptIds:['FMA7088'],
 explanation:'El corazón se encuentra en el mediastino, entre los pulmones y sobre el diafragma.',
 observation:'Gira el corazón y compara la vista anterior con la posterior. Luego activa «Ver alrededor» para reconocer su ubicación.',
 prompt:'¿Estás mirando una cara anterior o posterior? Explica qué cambió al girar.',hint:'Usa los botones de vista; el lado derecho anatómico corresponde al de la persona representada.',source:HEART_SOURCE},
 {id:'chambers',title:'Cuatro cavidades',objective:'Distinguir aurículas y ventrículos por su posición.',conceptIds:['FMA11359','FMA9465','FMA9291','FMA9466'],
 explanation:'Las aurículas reciben sangre; los ventrículos la expulsan. El lado derecho conduce a la circulación pulmonar y el izquierdo a la sistémica.',
 observation:'Compara las cuatro cavidades con los botones. Son volúmenes del espacio interior, no las paredes musculares.',
 prompt:'Sin mirar los nombres, ¿podrías ubicar una aurícula y un ventrículo?',hint:'Alterna los botones y describe la ubicación de cada volumen antes de leer su etiqueta.',source:HEART_SOURCE},
 {id:'valves',title:'Válvulas y dirección',objective:'Relacionar cada válvula con el paso que regula.',conceptIds:['FMA7234','FMA7235','FMA7236'],
 explanation:'La tricúspide comunica aurícula y ventrículo derechos; la mitral, los izquierdos. La válvula aórtica regula la salida hacia la aorta.',
 observation:'Aísla cada válvula. El atlas reúne varias piezas bajo un concepto: una pieza seleccionada puede ser una valva, no la válvula completa.',
 prompt:'¿Qué válvula cruzaría la sangre al pasar de la aurícula izquierda al ventrículo izquierdo?',hint:'Busca la válvula mitral y compárala con la tricúspide.',source:HEART_SOURCE},
 {id:'flow',title:'Recorrido y ciclo',objective:'Reconstruir el recorrido y explicar por qué cambia el estado de las válvulas.',conceptIds:['FMA11359','FMA9291','FMA8612','FMA9465','FMA9466','FMA3734'],
 explanation:'Recorrido: aurícula derecha → ventrículo derecho → pulmones → aurícula izquierda → ventrículo izquierdo → aorta. En sístole ventricular aumenta la presión y se cierran las válvulas auriculoventriculares; en diástole los ventrículos se relajan.',
 observation:'Avanza por las estructuras del recorrido. Los pulmones son un paso conceptual: el modelo no anima la sangre ni el movimiento valvular.',
 prompt:'¿Qué cambio de presión impediría que la sangre regresara a una aurícula?',hint:'Piensa en la presión ventricular al comenzar la sístole; no en un cierre voluntario de la válvula.',source:CYCLE_SOURCE},
];

export interface PracticeQuestion {id:string; prompt:string; options:string[]; correctIndex:number; explanation:string; conceptIds:string[]; source:string}
export const HEART_QUESTIONS:PracticeQuestion[] = [
 {id:'mitral',prompt:'¿Qué válvula conecta las cavidades izquierdas?',options:['Tricúspide','Mitral','Aórtica'],correctIndex:1,explanation:'La mitral está entre la aurícula y el ventrículo izquierdos.',conceptIds:['FMA7235'],source:HEART_SOURCE},
 {id:'pulmonary',prompt:'¿Qué cavidad impulsa sangre hacia los pulmones?',options:['Ventrículo izquierdo','Aurícula izquierda','Ventrículo derecho'],correctIndex:2,explanation:'El ventrículo derecho impulsa sangre hacia la circulación pulmonar.',conceptIds:['FMA9291','FMA8612'],source:HEART_SOURCE},
 {id:'representation',prompt:'La pieza «Cavidad del ventrículo izquierdo» representa…',options:['El espacio interior','Toda la pared muscular','La válvula mitral'],correctIndex:0,explanation:'Esta malla representa el volumen interior. No es la pared ni una válvula.',conceptIds:['FMA9466'],source:HEART_SOURCE},
 {id:'pressure',prompt:'Al iniciar la sístole ventricular, ¿por qué se cierra una válvula auriculoventricular?',options:['La presión ventricular supera la auricular','La válvula se contrae como un músculo','La presión ventricular disminuye'],correctIndex:0,explanation:'La diferencia de presión provoca el cierre y limita el flujo retrógrado.',conceptIds:['FMA7234','FMA7235'],source:CYCLE_SOURCE},
];
export type PracticeAnswers = Record<string,number>;
export function answerPractice(answers:PracticeAnswers,id:string,index:number):PracticeAnswers {
 const question=HEART_QUESTIONS.find(q=>q.id===id);
 if(!question||Object.hasOwn(answers,id)||!Number.isInteger(index)||index<0||index>=question.options.length)return answers;
 return {...answers,[id]:index};
}
export function practiceResults(answers:PracticeAnswers){
 const answered=HEART_QUESTIONS.filter(q=>Object.hasOwn(answers,q.id));
 return {answered:answered.length,correct:answered.filter(q=>answers[q.id]===q.correctIndex).length,total:HEART_QUESTIONS.length};
}
