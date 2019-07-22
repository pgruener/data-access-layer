/**
 * StringOperations is a library class that providers static helpers to work with strings
 */
export class StringOperations
{
  /**
   * Returns a copy of the string without alphanumeric characters.
   * 
   * @method removeNonAlphaNumericChars
   * @param {string} str 
   * @return {string}
   * @example
   *   StringOperations.removeNonAlphaNumericChars('#Foo!') // Foo
   */
  public static removeNonAlphaNumericChars(str:string):string
  {
    return str.replace(/\W/g, '')
  }

  /**
   * Returns a copy of the string with capitalized first character.
   * 
   * @method capitalize
   * @param {string} str
   * @return {string} 
   * @example
   *   StringOperations.capitalize('hey') // Hey
   */
  public static capitalize(str:string):string
  {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}