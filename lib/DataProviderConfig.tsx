import { ActionUrlSet } from './ActionUrlSet'
import { DataModel } from './DataModel';
import { ActionUrlConfig } from "./ActionUrlConfig";
import { DataProviderScopeSet } from "./DataProviderScopeSet";
import { ObjectMap } from "./ObjectMap";
import { Duration } from "./Duration";
import { DataProviderInitialRequestMoment } from "./DataProviderInitialRequestMoment";
import { FilterCollection } from "./filter/FilterCollection";
import { DataCollection } from "./DataCollection";
import { DEFAULT_SCOPE_NAME, DEFAULT_BACKEND_CONNECTOR_QUEUE_NAME } from './Constants';
import { DataProviderScope } from "./DataProviderScope";
import { FilterMarking } from "./filter/FilterMarking";
import { NotEnoughFiltersError } from "./filter/NotEnoughFiltersError";
import { TooManyFiltersError } from "./filter/TooManyFiltersError";
import { FilterRuleIn } from "./filter/FilterRuleIn";
import { FilterRule } from "./filter/FilterRule";
import { FilterRuleMarker } from "./filter/FilterRuleMarker";
import { QueueWorker } from "./QueueWorker";
import { RequestData, DataModelRequestData } from './RequestData';

export abstract class DataProviderConfig
{
  private _queueWorker:QueueWorker
  private _dataProviderName:string
  protected searchPropertyWhitelist:String[] = undefined

  constructor(dataProviderName:string, queueWorker:QueueWorker)
  {
    this._dataProviderName = dataProviderName
    this._queueWorker = queueWorker
  }

  public abstract getScopes:() => DataProviderScopeSet

  public getNewUrlVariableMatcher()
  {
    return  /\$\{([a-z\.\_]*)\}/gm
  }

  public shouldSurpressIdentityHashCodeWarning()
  {
    return false
  }

  public extractVariableAndModifier(variableWithModifier:string):{variable: string, modifier: string}
  {
    let variableModifierSplitted = variableWithModifier.split('.')

    let computedModifier = (variableModifierSplitted.length > 1) ? variableModifierSplitted[1] : '=='

    if (computedModifier == 'gte')
    {
      computedModifier = '>='
    }
    else if (computedModifier == 'lte')
    {
      computedModifier = '<='
    }

    return {
      variable: variableModifierSplitted[0].toString(),
      modifier: computedModifier
    }
  }



  private markingFinderByModifier(modifier:string):(filterRule:FilterRule<Object>) => boolean
  {
    switch (modifier)
    {
      case '==': /* fall through */
      case '>=': /* fall through */
      case '<=':
      {
        return (filterRule:FilterRule<Object>):boolean => {
          return filterRule.comparator == modifier
        }
      }

      case 'low': /* fall through */
      case 'high':
      {
        return (filterRule:FilterRule<Object>):boolean => {
          return filterRule instanceof FilterRuleIn
        }
      }

      default:
      {
        throw new Error(`Variable modifier with name '${modifier}' not implemented.`)
      }
    }
  }

  private getValueByWithModifier(filterRuleMarker:FilterRuleMarker<FilterRule<Object>>, modifier:string)
  {
    let filterRule = filterRuleMarker.use()

    switch (modifier)
    {
      default:
        return filterRule.value
      case 'low':
        return (filterRule as FilterRuleIn<Object>).valueRange.startValue
      case 'high':
        return (filterRule as FilterRuleIn<Object>).valueRange.endValue
    }

  }

  public findReplacement<T extends DataModel>(variableWithModifier:string, filterMarking:FilterMarking<T>):Object
  {
    let variableModifierSplitted = this.extractVariableAndModifier(variableWithModifier)

    let markingFinder = this.markingFinderByModifier(variableModifierSplitted.modifier)

    let filterMarker = filterMarking.filterMarkersForField(variableModifierSplitted.variable, markingFinder)

    switch (filterMarker.length)
    {
      case 0:
        throw new NotEnoughFiltersError(`There must be a FilterRule supporting modifier '${variableModifierSplitted.modifier}' for the field '${variableModifierSplitted.variable}' in the DataCollection.`)

      case 1:
        return this.getValueByWithModifier(filterMarker[0], variableModifierSplitted.modifier)

      default:
        throw new TooManyFiltersError(`There must be exactly one FilterRule supporting modifier '${variableModifierSplitted.modifier}' for the field '${variableModifierSplitted.variable}' in the DataCollection.`)
    }
  }

  public buildReplacementMap<T extends DataModel>(variables:String[], filterMarking:FilterMarking<T>):ObjectMap
  {
    let map:ObjectMap = {}

    variables.forEach((variable) => {
      map[variable.toString()] = this.findReplacement(variable.toString(), filterMarking)
    })

    return map
  }

  private matchUrlAndCycle(url:string, callback:(match:RegExpExecArray) => void)
  {
    let variableMatcher = this.getNewUrlVariableMatcher()

    let match
    while (match = variableMatcher.exec(url))
    {
      callback(match)
    }
  }

  public extractVariablesFromUrl(url:string):String[]
  {
    let variables:String[] = []

    this.matchUrlAndCycle(url, (match) => {
      variables.push(match[1])
    })

    return variables
  }

  public replaceVariablesInUrl(url:string, map:ObjectMap):string
  {
    this.matchUrlAndCycle(url, (match) => {
      url = url.replace(match[0], map[match[1]].toString())
    })

    return url
  }

  public getScope(scopeName:string):DataProviderScope
  {
    return this.getScopes()[scopeName]
  }

  public hasUrl(scopeName:string):boolean
  {
    return this.getUrl(scopeName) != undefined
  }

  public getUrl(scopeName:string):string
  {
    let scopeOrUrl = this.getScope(scopeName)

    if (typeof scopeOrUrl == 'string')
    {
      return scopeOrUrl as string
    }
    else
    {
      return (scopeOrUrl as {url:string})['url']
    }
  }

  public getSearchParamName()
  {
    return 'search'
  }

  public getInitialEntities(scopeName:string):ObjectMap[]
  {
    let scopeOrUrl = this.getScope(scopeName)

    if (typeof scopeOrUrl != 'string')
    {
      let url = (scopeOrUrl as {url:string})['url']

      return (scopeOrUrl as {initialEntities:[ObjectMap]})['initialEntities']
    }

    return null
  }


  public getActionUrlConfig = ():ActionUrlConfig =>
  {
    return null
  }

  get dataProviderName():string {
    return this._dataProviderName;
  }

  get queueWorker():QueueWorker {
    return this._queueWorker;
  }

  public getUpdatedAtFieldName = ():string =>
  {
    return 'updated_at'
  }

  public getIdentityRelevantAttributeNames = ():string[] =>
  {
    return [ 'id' ]
  }

  public getNewInstanceDataModelScopeNames = ():string[] =>
  {
    return [ DEFAULT_SCOPE_NAME ]
  }

  getInitialRequestMoment = ():DataProviderInitialRequestMoment => {
    return 'on_first_collection'
  }

  /**
   * Lifetime of cache, before fetch data again from its sources.
   * @method getDataCacheLifetime
   * @return {Duration}
   */
  public getDataCacheLifetime = ():Duration => {
    return new Duration(6000 * 10 * 10)
  }

  /**
   * The data will automatically refetch from its sources after the refetch interval.
   * @todo
   * @method getRefetchInterval
   * @return {Duration}
   */
  public getRefetchInterval = ():Duration =>
  {
    return new Duration(1000)
  }

  public getActionUrlSet = ():ActionUrlSet =>
  {
    return new ActionUrlSet(this.getActionUrlConfig())
  }

  public computePayloadForRequest = (requestData:DataModelRequestData):ObjectMap => {
    return requestData.dataModel.mapDataOut(requestData.changedPropertiesSnapshot)
  }

  public extractFilterCollectionForSelection = (dataCollection:DataCollection<DataModel>):FilterCollection<DataModel> =>
  {
    return null
  }

  public shouldSkipSearchProperty(propertyName:string):boolean
  {
    if (this.searchPropertyWhitelist === undefined)
    {
      return false
    }

    return this.searchPropertyWhitelist.indexOf(propertyName) === -1
  }

  public getSearchPropertyWhitelist():String[]
  {
    return this.searchPropertyWhitelist
  }

  /**
   * Appends the filters to the given url
   * @method appendFiltersToUrl
   */
  public appendFiltersToUrl = <T extends DataModel>(url:string, filterMarking:FilterMarking<T>):string =>
  {
    let searchParamContent = ''

    let isSearchParamContentPresent = false
    filterMarking.getUnusedFilters().forEach((filterRule) => {

      if (!this.shouldSkipSearchProperty(filterRule.fieldName))
      {
        if (isSearchParamContentPresent)
        {
          searchParamContent += '&'  
        }
  
        searchParamContent += filterRule.asUrlString()
        isSearchParamContentPresent = true
      }
    })

    if (searchParamContent.length == 0)
    {
      return url
    }
    else
    {
      let qmOrAmp = (url.indexOf('?') === -1) ? '?' : '&'
      return `${url}${qmOrAmp}${this.getSearchParamName()}=${encodeURIComponent(searchParamContent)}`
    }
  }

  public computeSelectionUrl = <T extends DataModel>(scopeName:string, selectionTriggerCollection?:DataCollection<T>):string => {
    
    let url = this.getUrl(scopeName)
    let variables = this.extractVariablesFromUrl(url)
    let areVariablesAvailable = variables.length > 0


    if (!selectionTriggerCollection)
    {
      if (areVariablesAvailable)
      {
        return null
        //throw new Error('Variables cannot be filled, without connected collection.')
      }
      else
      {
        return url
      }
    }
    else
    {
      let filterMarking = new FilterMarking(selectionTriggerCollection.topCollection)


      if (areVariablesAvailable)
      {
        let map
        try
        {
          map = this.buildReplacementMap(variables, filterMarking)
        }
        catch (e)
        {
          if (e instanceof NotEnoughFiltersError)
          {
            return null
          }

          throw e
        }

        url = this.replaceVariablesInUrl(url, map)
      }
        
      return this.appendFiltersToUrl(url, filterMarking)
    }
  }

  /**
   * Retuns the duration, a {DataModel} should wait until it propagates changes to its listeners.
   * The time resets after every change. 
   * 
   * Listeners, which are created with the optional *critical* flag do not respect this value. 
   * @name getChangePropagateWaitDuration
   * @returns {Duration} 
   */
  public getChangePropagateWaitDuration():Duration
  {
    return new Duration(100)
  }

  public getBackendConnectorQueueName():string
  {
    return DEFAULT_BACKEND_CONNECTOR_QUEUE_NAME
  }

  public prepareForServer(dataModel:DataModel):ObjectMap
  {
    return dataModel.mapDataOut(dataModel.changedProperties)
  }

  public unwrapFromServer(requestData:RequestData<DataModel>, objectMap:ObjectMap|ObjectMap[]):ObjectMap|ObjectMap[]
  {
    return objectMap
  }

  //getLoadedTimeRanges|propertyName... evtl. in Wrapper?!
}
