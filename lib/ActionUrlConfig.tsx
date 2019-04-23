import { ActionUrl } from './ActionUrl'

/**
 * ActionUrlConfig allows every string to be the key of an action.
 * To enable nice autocompletion for editors, we added the commonly used actions
 * as optional keys.
 * 
 * @interface ActionUrlConfig
 */
export interface ActionUrlConfig
{
	create?:string|ActionUrl
	new?:string|ActionUrl
	show?:string|ActionUrl
	edit?:string|ActionUrl
	update?:string|ActionUrl
	delete?:string|ActionUrl
	
	[s:string]: string|ActionUrl
}