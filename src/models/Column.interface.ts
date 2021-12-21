import { Alignment } from "./enums/Alignment.enum";
import { Colors } from "./enums/Colors.enum";

export default interface Column {
  id: number;
  name: string;
  dataType: string | number | boolean | Array<any>;
  dafautValue?: string | number | boolean | Array<any>;
  minWith: number;
  fontColor: Colors;
  backgoundColor: Colors;
  alginment: Alignment;
}
