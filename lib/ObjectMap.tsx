/**
 * ObjectMap is just syntactic sugar to easily use maps in typescript without weird curly braces everywhere. 
 * @type ObjectMap
 */
type Map<T> = {[s:string]: T}
export type ObjectMap = Map<Object>
