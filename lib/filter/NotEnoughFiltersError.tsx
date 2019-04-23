/**
 * An instance of NotEnoughFiltersError is created and thrown, if a {@link DataProviderConfig} tries to compute
 * an url, but not all neccessary information could be derived through filters.
 * 
 * @class NotEnoughFiltersError
 * @see DataProviderConfig
 */
export class NotEnoughFiltersError
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
