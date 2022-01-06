import { Alignment } from './enums/Alignment.enum';
import {IDropdownValue} from './DropdownValues.interface';
import {DataType} from './enums/DataType.enum';

export interface IColumn {
  id: string;
  field: string | number;
  name: string;
  dataType: DataType;
  defaultValue?: string | number | boolean | Array<string> | null;
  minWidth: number | null;
  fontSize: number;
  fontColor: string;
  backgroundColor: string;
  alignment: Alignment | string;
  dropdownValues: Array<IDropdownValue>;
  textWrap: boolean;
}
