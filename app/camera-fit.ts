/** Fit to the actual canvas region, which has no floating control panels. */
export function fitDistance(size:{x:number;y:number;z:number},aspect:number,fov:number):number {
 return Math.max(.07,Math.max(size.y,size.x/Math.max(.1,aspect))/(2*Math.tan(fov*Math.PI/360))*1.2+size.z/2);
}
