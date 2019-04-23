import { DataModel } from "./DataModel";
import { ObjectMap } from "./ObjectMap";

/**
 * @interface ExternalDataCollectionFactory
 */
export interface ExternalDataCollectionFactory
{
  /**
   * @method find
   * @param {string} dataProviderName 
   * @param {ObjectMap|string} searchMap 
   * @returns {T} dataModel found
   * @example
   *   externalDataCollectionFactory.find('user', { 'id': 10 }) // user with id 10 OR null (if not known)
   */
  find<T extends DataModel>(dataProviderName:string, searchMap:ObjectMap|string):T
}
