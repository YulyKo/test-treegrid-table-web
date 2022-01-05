import { Alignment } from './enums/Alignment.enum';

export default interface IColumn {
  id: string;
  field: string | number;
  name: string;
  dataType: string;
  defaultValue?: string | number | boolean | Array<string> | null;
  minWidth: number | null;
  fontSize: number;
  fontColor: string;
  backgroundColor: string;
  alignment: Alignment | string;
  dropdownValues: Array<string> | [];
  textWrap: boolean;
}
