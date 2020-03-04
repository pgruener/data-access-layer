import { ActionUrl } from "./internal";
import { ActionUrlConfig } from "./internal";
import { DataModel } from "./internal";
import { HttpMethod } from "./internal";
import { ObjectMap } from "./internal";

const FALLBACK_HTTP_METHOD:HttpMethod = 'POST';

/**
 * An ActionUrlSet is created using an {@link ActionUrlConfig}.
 * It maps a url to a http verb, if no verb is given in the ActionUrlConfig.
 * 
 * @class ActionUrlSet
 * @see ActionUrlConfig
 */
export class ActionUrlSet
{
  private actionUrls:{[s:string]:ActionUrl} = {}
  private static verbMethodMap:{[s:string]:HttpMethod} = {
    create: 'POST',
    new: 'GET',
    show: 'GET',
    edit: 'GET',
    update: 'PATCH',
    delete: 'DELETE'
  }

  constructor(config:ActionUrlConfig)
  {
    if (config != null)
    {
      Object.keys(config).forEach((actionName) => {

        let currentElement = config[actionName]
  
        if (typeof currentElement == 'string')
        {
          this.actionUrls[actionName] = { url: currentElement, method: ActionUrlSet.guessHttpMethod(actionName) }
        }
        else
        {
          this.actionUrls[actionName] = currentElement as ActionUrl
        }
      })
    }
  }

  /**
   * Guesses the http method based on the actions name. Falls back to 'POST'.
   * 
   * @method guessHttpMethod
   * @param {string} actionName 
   */
  private static guessHttpMethod(actionName:string):HttpMethod
  {
    return ActionUrlSet.verbMethodMap[actionName] || FALLBACK_HTTP_METHOD
  }

  /**
   * Computes the {@link ActionUrl} for a specific action and DataModel.
   * Replaces all variables in the url with variables from the DataModel.
   * Falls back to variables from optional additionalVariables param.
   * 
   * @method computeActionUrl
   * @param {string} action
   * @param {DataModel} dataModel
   * @param {ObjectMap} [additionalVariables]
   * @return {ActionUrl}
   */
  public computeActionUrl = (action:string, dataModel:DataModel, additionalVariables?:ObjectMap):ActionUrl => {
    // debugger
    let actionUrl = this.actionUrls[action]

    if (!actionUrl)
    {
      throw new Error(`actionUrl for action ${action} not defined.`)
    }

    let variableFinder = /\$\{([a-z\.\_]*)\}/gm
    let url = actionUrl.url

    let match
    while (match = variableFinder.exec(url))
    {
      let variableString = match[0]
      let variableName = match[1]

      let value = dataModel.getProperty(variableName)

      if (value == undefined)
      {
        value = additionalVariables[variableName]
      }

      url = url.replace(variableString, value.toString())
    }

    return { method: actionUrl.method, url: url }
  }
}
