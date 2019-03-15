export class StringOperations
{
  public static removeNonAlphaNumericChars(str:string):string
  {
    return str.replace(/\W/g, '')
  }

  public static capitalize(str:string):string
  {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}