export type CellValue =  string | boolean | Date | Array<string | IRow> | number;

export default interface IRow {
  index: number;
  id: string;
  [key: string]: CellValue;
}
