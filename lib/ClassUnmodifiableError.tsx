/**
 * An instance of ClassUnmodifiableError is created and thrown, if someone tries to modify an unmodifiable class.
 * 
 * @class ClassUnmodifiableError
 */
export class ClassUnmodifiableError
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
