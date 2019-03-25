export class TooManyFiltersError //extends Error
{
  private error:Error

  // get rawError()
  // {
  //   return this.error
  // }

  constructor(errorMessage:string)
  {
    this.error = new Error(errorMessage)
  }

  public toString()
  {
    this.error.message
  }
}
