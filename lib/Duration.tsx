/**
 * Duration class is used to keep store a duration in millis.
 * It later may provide static convenient methods like Duration.fromDay(1) 
 * to create more readable code.
 *  
 * @class Duration
 */
export class Duration
{
  private millis:number

  constructor(millis:number)
  {
    this.millis = millis
  }

  /**
   * Attribute accessor for milliSeconds
   */
  get milliSeconds()
  {
    return this.millis
  }
}
