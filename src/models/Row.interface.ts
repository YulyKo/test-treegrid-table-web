export default interface IRow {
  index: number;
  id: string;
  // https://www.smashingmagazine.com/2021/01/dynamic-static-typing-typescript/
  [key: string]: string | boolean | Date | Array<string | IRow> | number;
}
