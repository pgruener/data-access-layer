import { ActionUrl } from "./ActionUrl";
import { ActionUrlConfig } from "./ActionUrlConfig";
import { DataModel } from "./DataModel";
import { HttpMethod } from "./HttpMethod";
import { ObjectMap } from "./ObjectMap";

export class ActionUrlSet
{
  private actionUrls:{[s:string]:ActionUrl} = {}
  private verbMethodMap:{[s:string]:HttpMethod} = {
    create: 'POST',
    new: 'GET',
    show: 'GET',
    edit: 'GET',
    update: 'PATCH',
    destroy: 'DELETE'
  }

  constructor(config:ActionUrlConfig)
  {
    if (config != null)
    {
      Object.keys(config).forEach((key) => {

        let currentElement = config[key]
  
        if (typeof currentElement == 'string')
        {
          this.actionUrls[key] = { url: currentElement, method: this.guessHttpMethod(key) }
        }
        else
        {
          this.actionUrls[key] = currentElement as ActionUrl
        }
      })
    }
  }

  private guessHttpMethod(key:string):HttpMethod
  {
    return this.verbMethodMap[key] || 'GET'
  }

  public getActionUrl = (action:string|HttpMethod, dataModel:DataModel, additionalVariables?:ObjectMap):ActionUrl => {

    let actionUrl = this.actionUrls[action]

    if (!actionUrl)
    {
      throw new Error(`actionUrl for action ${action} not defined.`)
    }

    let url = actionUrl.url

    let variableFinder = /\$\{([a-z]*)\}/gm

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
