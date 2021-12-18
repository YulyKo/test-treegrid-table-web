export default interface Row {
  // rowID: number;
  taskID: number;
  parentID?: number;
  // https://www.smashingmagazine.com/2021/01/dynamic-static-typing-typescript/
  [key: string]: string | boolean | Date | Array<string> | number;
}
