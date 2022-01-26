import {Component, forwardRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from '@angular/forms';
import {DataType} from 'src/models/enums/DataType.enum';
import {Observable} from 'rxjs';
import {DropDownListComponent} from '@syncfusion/ej2-angular-dropdowns/src/drop-down-list/dropdownlist.component';
import { BOOLEAN_DATA_SOURCE } from 'src/models/BooleanDataSource.const';

type OnChange = (value: string) => void;
type OnTouched = () => void;

@Component({
  selector: 'app-data-input',
  templateUrl: './data-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DataInputComponent),
      multi: true
    }
  ]
})
export class DataInputComponent implements OnInit, ControlValueAccessor {
  @Input()
  type: DataType;

  @Input() dropdownDataSource?: string[];
  @Input() formType: 'row' | 'column';

  dataType = DataType;
  valueControl = new FormControl('');
  onChange: OnChange;
  onTouched: OnTouched;
  public readonly booleanDataSource = BOOLEAN_DATA_SOURCE;

  ngOnInit(): void {
    this.valueControl.valueChanges.subscribe(value => {
      this.onChange?.(value);
    });
  }

  writeValue(obj: any): void {
    this.valueControl.setValue(obj);
  }

  registerOnChange(fn: OnChange): void {
    this.onChange = fn;
  }

  // for validation
  registerOnTouched(fn: OnTouched): void {
    this.onTouched = fn;
  }
}
