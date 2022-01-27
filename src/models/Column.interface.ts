import { Alignment } from './enums/Alignment.enum';
import {DataType} from './enums/DataType.enum';

export interface IColumn {
  id: string;
  field: string;
  name: string;
  dataType: DataType;
  defaultValue?: string | number | boolean | null;
  minWidth: number | null;
  fontSize: number;
  fontColor: string;
  backgroundColor: string;
  alignment: Alignment | string;
  dropdownValues: Array<string>;
  textWrap: boolean;
}
