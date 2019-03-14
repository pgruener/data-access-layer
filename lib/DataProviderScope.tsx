import {ObjectMap} from "./ObjectMap";

type DataProviderScope = string|{ url?:string, initialEntities:ObjectMap[] }

export = DataProviderScope