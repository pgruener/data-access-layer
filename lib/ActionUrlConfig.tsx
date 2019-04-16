import { ActionUrl } from './ActionUrl'

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