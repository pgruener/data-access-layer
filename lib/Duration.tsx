export class Duration
{
  private millis:number

  constructor(millis:number)
  {
    this.millis = millis
  }

  getMilliSeconds = ():number =>
  {
    return this.millis
  }
}
