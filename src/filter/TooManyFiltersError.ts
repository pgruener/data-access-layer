/**
 * An instance of TooManyFiltersError is created and thrown, if a {@link DataProviderConfig} tries to compute
 * an url, but too many information could be derived through filters and decision is ambiguous.
 * 
 * @class TooManyFiltersError
 * @see DataProviderConfig
 */
export class TooManyFiltersError
{
  private error:Error

  constructor(errorMessage:string)
  {
    this.error = new Error(errorMessage)
  }

  public toString()
  {
    this.error.message
  }
}
